import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { EVENTS_QUERY, UPCOMING_EVENTS_QUERY, SEARCH_EVENTS_QUERY } from "@/sanity/lib/eventQueries";

// GET /api/events - Get events with filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const format = searchParams.get("format");
    const upcoming = searchParams.get("upcoming");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = EVENTS_QUERY;
    let params: any = {};

    // Handle search
    if (search) {
      query = SEARCH_EVENTS_QUERY;
      params.searchTerm = search;
    }
    // Handle upcoming filter
    else if (upcoming === "true") {
      query = UPCOMING_EVENTS_QUERY;
    }
    // Handle featured filter
    else if (featured === "true") {
      query = `*[_type == "event" && status == "published" && featured == true] | order(startDateTime asc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        eventType,
        format,
        startDateTime,
        endDateTime,
        location,
        image,
        organizer->{
          _id,
          userId,
          role
        },
        "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
      }`;
    }
    // Handle type filter
    else if (type) {
      query = `*[_type == "event" && status == "published" && eventType == $eventType] | order(startDateTime asc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        eventType,
        format,
        startDateTime,
        endDateTime,
        location,
        image,
        organizer->{
          _id,
          userId,
          role
        },
        "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
      }`;
      params.eventType = type;
    }
    // Handle format filter
    else if (format) {
      query = `*[_type == "event" && status == "published" && format == $format] | order(startDateTime asc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        eventType,
        format,
        startDateTime,
        endDateTime,
        location,
        image,
        organizer->{
          _id,
          userId,
          role
        },
        "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
      }`;
      params.format = format;
    }
    // Default query with pagination
    else {
      query = `*[_type == "event" && status == "published"] | order(startDateTime asc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        eventType,
        format,
        startDateTime,
        endDateTime,
        timezone,
        location,
        capacity,
        image,
        price,
        featured,
        organizer->{
          _id,
          userId,
          role
        },
        "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"]),
        "waitlistCount": count(*[_type == "eventRsvp" && references(^._id) && status == "waitlisted"])
      }`;
    }

    const events = await client.fetch(query, params);

    // Get total count for pagination
    let totalQuery = `count(*[_type == "event" && status == "published"])`;
    if (search) {
      totalQuery = `count(*[_type == "event" && status == "published" && (
        title match $searchTerm + "*" ||
        description match $searchTerm + "*" ||
        eventType match $searchTerm + "*" ||
        $searchTerm in tags[]
      )])`;
    } else if (type) {
      totalQuery = `count(*[_type == "event" && status == "published" && eventType == $eventType])`;
    } else if (format) {
      totalQuery = `count(*[_type == "event" && status == "published" && format == $format])`;
    } else if (featured === "true") {
      totalQuery = `count(*[_type == "event" && status == "published" && featured == true])`;
    } else if (upcoming === "true") {
      totalQuery = `count(*[_type == "event" && status == "published" && startDateTime > now()])`;
    }

    const total = await client.fetch(totalQuery, params);

    return NextResponse.json({
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to create events
    if (!hasPermission(session.user.role || Role.USER, Permission.CREATE_EVENT)) {
      return NextResponse.json(
        { error: "Insufficient permissions to create events" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Get user profile to use as organizer
    const userProfile = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "userProfile" && userId == $userId][0]`,
        { userId: session.id }
      );

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    const requiredFields = [
      'title', 'description', 'eventType', 'format', 
      'startDateTime', 'endDateTime'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate dates
    const startDate = new Date(body.startDateTime);
    const endDate = new Date(body.endDateTime);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    if (startDate < new Date()) {
      return NextResponse.json(
        { error: "Event cannot be scheduled in the past" },
        { status: 400 }
      );
    }

    // Create event data
    const eventData = {
      _type: "event",
      title: body.title,
      slug: {
        _type: "slug",
        current: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      },
      description: body.description,
      content: body.content || [],
      eventType: body.eventType,
      format: body.format,
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
      timezone: body.timezone || "UTC",
      location: body.location || {},
      capacity: body.capacity || null,
      registrationDeadline: body.registrationDeadline || null,
      organizer: {
        _type: "reference",
        _ref: userProfile._id,
      },
      speakers: body.speakers || [],
      tags: body.tags || [],
      image: body.image || null,
      price: body.price || { isFree: true },
      requirements: body.requirements || [],
      featured: false, // Only admins can set featured
      status: "draft", // New events start as draft
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newEvent = await writeClient.create(eventData);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
