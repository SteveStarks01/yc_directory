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

// GET /api/events/[eventId]/rsvp - Get user's RSVP status for event
export async function GET(
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

    // Get user profile
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

    // Get RSVP
    const rsvp = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "eventRsvp" && event._ref == $eventId && attendee._ref == $userId][0] {
          _id,
          status,
          registeredAt,
          updatedAt,
          notes,
          dietaryRestrictions,
          emergencyContact
        }`,
        { eventId, userId: userProfile._id }
      );

    if (!rsvp) {
      return NextResponse.json(
        { rsvp: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ rsvp });
  } catch (error) {
    console.error("Error fetching RSVP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/rsvp - Create or update RSVP
export async function POST(
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

    const body = await request.json();
    const { status, notes, dietaryRestrictions, emergencyContact } = body;

    // Validate RSVP status
    const validStatuses = ["going", "maybe", "not-going"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid RSVP status" },
        { status: 400 }
      );
    }

    // Get event details
    const event = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "event" && _id == $eventId][0] {
          _id,
          title,
          status,
          capacity,
          registrationDeadline,
          startDateTime,
          "currentAttendees": count(*[_type == "eventRsvp" && references(^._id) && status == "going"])
        }`,
        { eventId }
      );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event is published
    if (event.status !== "published") {
      return NextResponse.json(
        { error: "Cannot RSVP to unpublished event" },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    // Check if event has already started
    if (new Date(event.startDateTime) < new Date()) {
      return NextResponse.json(
        { error: "Cannot RSVP to event that has already started" },
        { status: 400 }
      );
    }

    // Get user profile
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

    // Check existing RSVP
    const existingRsvp = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "eventRsvp" && event._ref == $eventId && attendee._ref == $userId][0]`,
        { eventId, userId: userProfile._id }
      );

    // Check capacity for "going" status
    let finalStatus = status;
    if (status === "going" && event.capacity) {
      const currentGoingCount = event.currentAttendees;
      // Don't count existing "going" RSVP in capacity check
      const adjustedCount = existingRsvp?.status === "going" 
        ? currentGoingCount - 1 
        : currentGoingCount;
      
      if (adjustedCount >= event.capacity) {
        finalStatus = "waitlisted";
      }
    }

    const now = new Date().toISOString();

    if (existingRsvp) {
      // Update existing RSVP
      const updatedRsvp = await writeClient
        .patch(existingRsvp._id)
        .set({
          status: finalStatus,
          updatedAt: now,
          notes: notes || existingRsvp.notes,
          dietaryRestrictions: dietaryRestrictions || existingRsvp.dietaryRestrictions,
          emergencyContact: emergencyContact || existingRsvp.emergencyContact,
        })
        .commit();

      return NextResponse.json({
        rsvp: updatedRsvp,
        message: finalStatus === "waitlisted" 
          ? "Event is full. You've been added to the waitlist."
          : "RSVP updated successfully"
      });
    } else {
      // Create new RSVP
      const rsvpData = {
        _type: "eventRsvp",
        event: {
          _type: "reference",
          _ref: eventId,
        },
        attendee: {
          _type: "reference",
          _ref: userProfile._id,
        },
        status: finalStatus,
        registeredAt: now,
        updatedAt: now,
        notes: notes || "",
        dietaryRestrictions: dietaryRestrictions || [],
        emergencyContact: emergencyContact || null,
      };

      const newRsvp = await writeClient.create(rsvpData);

      return NextResponse.json({
        rsvp: newRsvp,
        message: finalStatus === "waitlisted" 
          ? "Event is full. You've been added to the waitlist."
          : "RSVP created successfully"
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating/updating RSVP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId]/rsvp - Cancel RSVP
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

    // Get user profile
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

    // Find existing RSVP
    const existingRsvp = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "eventRsvp" && event._ref == $eventId && attendee._ref == $userId][0]`,
        { eventId, userId: userProfile._id }
      );

    if (!existingRsvp) {
      return NextResponse.json(
        { error: "RSVP not found" },
        { status: 404 }
      );
    }

    // Delete RSVP
    await writeClient.delete(existingRsvp._id);

    // If this was a "going" RSVP and there are waitlisted people, promote one
    if (existingRsvp.status === "going") {
      const waitlistedRsvp = await client
        .withConfig({ useCdn: false })
        .fetch(
          `*[_type == "eventRsvp" && event._ref == $eventId && status == "waitlisted"] | order(registeredAt asc) [0]`,
          { eventId }
        );

      if (waitlistedRsvp) {
        await writeClient
          .patch(waitlistedRsvp._id)
          .set({
            status: "going",
            updatedAt: new Date().toISOString(),
          })
          .commit();
      }
    }

    return NextResponse.json(
      { message: "RSVP cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling RSVP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
