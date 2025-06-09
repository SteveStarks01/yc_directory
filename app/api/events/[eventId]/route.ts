import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

interface RouteParams {
  params: {
    eventId: string;
  };
}

// GET /api/events/[eventId] - Get event by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { eventId } = params;

    const event = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "event" && _id == $eventId][0] {
          _id,
          title,
          slug,
          description,
          content,
          eventType,
          format,
          startDateTime,
          endDateTime,
          timezone,
          location,
          capacity,
          registrationDeadline,
          image,
          price,
          requirements,
          tags,
          status,
          featured,
          createdAt,
          updatedAt,
          organizer->{
            _id,
            userId,
            role,
            bio,
            company,
            position,
            socialLinks
          },
          speakers[]->{
            _id,
            userId,
            role,
            bio,
            company,
            position,
            socialLinks
          },
          "attendeeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "going"]),
          "maybeCount": count(*[_type == "eventRsvp" && references(^._id) && status == "maybe"]),
          "waitlistCount": count(*[_type == "eventRsvp" && references(^._id) && status == "waitlisted"])
        }`,
        { eventId }
      );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event is published or if user has permission to view drafts
    const session = await auth();
    const canViewDrafts = session?.user?.role && 
      (hasPermission(session.user.role, Permission.EDIT_EVENT) || 
       event.organizer?.userId === session.id);

    if (event.status !== "published" && !canViewDrafts) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[eventId] - Update event
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { eventId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing event
    const existingEvent = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "event" && _id == $eventId][0] {
          _id,
          organizer->{
            _id,
            userId
          },
          status
        }`,
        { eventId }
      );

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check permissions - organizer or admin can edit
    const isOrganizer = existingEvent.organizer?.userId === session.id;
    const canEditAnyEvent = session.user.role && 
      hasPermission(session.user.role, Permission.EDIT_EVENT);

    if (!isOrganizer && !canEditAnyEvent) {
      return NextResponse.json(
        { error: "Insufficient permissions to edit this event" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define allowed fields for regular users vs admins
    let allowedFields = [
      'title', 'description', 'content', 'eventType', 'format',
      'startDateTime', 'endDateTime', 'timezone', 'location',
      'capacity', 'registrationDeadline', 'speakers', 'tags',
      'image', 'price', 'requirements'
    ];

    // Admins can edit additional fields
    if (canEditAnyEvent) {
      allowedFields.push('featured', 'status');
    }

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update slug if title changed
    if (body.title && body.title !== existingEvent.title) {
      updateData.slug = {
        _type: "slug",
        current: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      };
    }

    // Validate dates if provided
    if (body.startDateTime || body.endDateTime) {
      const startDate = new Date(body.startDateTime || existingEvent.startDateTime);
      const endDate = new Date(body.endDateTime || existingEvent.endDateTime);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update event
    const updatedEvent = await writeClient
      .patch(eventId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    const { eventId } = params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get existing event
    const existingEvent = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "event" && _id == $eventId][0] {
          _id,
          title,
          organizer->{
            _id,
            userId
          },
          "hasAttendees": count(*[_type == "eventRsvp" && references(^._id)]) > 0
        }`,
        { eventId }
      );

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check permissions - organizer or admin can delete
    const isOrganizer = existingEvent.organizer?.userId === session.id;
    const canDeleteAnyEvent = session.user.role && 
      hasPermission(session.user.role, Permission.DELETE_EVENT);

    if (!isOrganizer && !canDeleteAnyEvent) {
      return NextResponse.json(
        { error: "Insufficient permissions to delete this event" },
        { status: 403 }
      );
    }

    // Prevent deletion if event has attendees (unless admin)
    if (existingEvent.hasAttendees && !canDeleteAnyEvent) {
      return NextResponse.json(
        { error: "Cannot delete event with registered attendees. Cancel the event instead." },
        { status: 400 }
      );
    }

    // Delete all RSVPs first
    const rsvps = await client.fetch(
      `*[_type == "eventRsvp" && references($eventId)]._id`,
      { eventId }
    );

    for (const rsvpId of rsvps) {
      await writeClient.delete(rsvpId);
    }

    // Delete the event
    await writeClient.delete(eventId);

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
