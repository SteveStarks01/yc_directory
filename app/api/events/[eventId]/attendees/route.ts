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

// GET /api/events/[eventId]/attendees - Get event attendees (organizer/admin only)
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

    // Get event details and check permissions
    const event = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "event" && _id == $eventId][0] {
          _id,
          title,
          organizer->{
            _id,
            userId
          }
        }`,
        { eventId }
      );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check permissions - organizer or admin can view attendees
    const isOrganizer = event.organizer?.userId === session.id;
    const canManageEvents = session.user.role && 
      hasPermission(session.user.role, Permission.MANAGE_EVENT_ATTENDEES);

    if (!isOrganizer && !canManageEvents) {
      return NextResponse.json(
        { error: "Insufficient permissions to view attendees" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // going, maybe, waitlisted, not-going
    const includePrivate = searchParams.get("includePrivate") === "true";

    // Build query based on status filter
    let statusFilter = "";
    if (status && ["going", "maybe", "waitlisted", "not-going"].includes(status)) {
      statusFilter = ` && status == "${status}"`;
    }

    // Get attendees
    const attendees = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "eventRsvp" && event._ref == $eventId${statusFilter}] | order(registeredAt desc) {
          _id,
          status,
          registeredAt,
          updatedAt,
          attendedEvent,
          checkInTime,
          notes,
          dietaryRestrictions,
          emergencyContact,
          attendee->{
            _id,
            userId,
            role,
            bio,
            company,
            position,
            location,
            socialLinks,
            preferences
          }
        }`,
        { eventId }
      );

    // Filter out private information based on user preferences
    const filteredAttendees = attendees.map((rsvp: any) => {
      const attendee = { ...rsvp.attendee };
      
      // Respect privacy settings unless includePrivate is true (for organizers)
      if (!includePrivate && attendee.preferences?.profileVisibility === "private") {
        return {
          ...rsvp,
          attendee: {
            _id: attendee._id,
            userId: "Private User",
            role: attendee.role,
            company: null,
            position: null,
            location: null,
            socialLinks: null,
            bio: null,
          },
          notes: null,
          dietaryRestrictions: null,
          emergencyContact: null,
        };
      }

      // Hide sensitive information for non-organizers
      if (!isOrganizer && !canManageEvents) {
        return {
          ...rsvp,
          notes: null,
          dietaryRestrictions: null,
          emergencyContact: null,
        };
      }

      return rsvp;
    });

    // Get summary statistics
    const summary = await client
      .withConfig({ useCdn: false })
      .fetch(
        `{
          "total": count(*[_type == "eventRsvp" && event._ref == $eventId]),
          "going": count(*[_type == "eventRsvp" && event._ref == $eventId && status == "going"]),
          "maybe": count(*[_type == "eventRsvp" && event._ref == $eventId && status == "maybe"]),
          "waitlisted": count(*[_type == "eventRsvp" && event._ref == $eventId && status == "waitlisted"]),
          "notGoing": count(*[_type == "eventRsvp" && event._ref == $eventId && status == "not-going"]),
          "checkedIn": count(*[_type == "eventRsvp" && event._ref == $eventId && attendedEvent == true])
        }`,
        { eventId }
      );

    return NextResponse.json({
      attendees: filteredAttendees,
      summary,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/attendees - Bulk operations on attendees
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

    // Get event details and check permissions
    const event = await client
      .withConfig({ useCdn: false })
      .fetch(
        `*[_type == "event" && _id == $eventId][0] {
          _id,
          title,
          organizer->{
            _id,
            userId
          }
        }`,
        { eventId }
      );

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check permissions - organizer or admin can manage attendees
    const isOrganizer = event.organizer?.userId === session.id;
    const canManageEvents = session.user.role && 
      hasPermission(session.user.role, Permission.MANAGE_EVENT_ATTENDEES);

    if (!isOrganizer && !canManageEvents) {
      return NextResponse.json(
        { error: "Insufficient permissions to manage attendees" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, attendeeIds, data } = body;

    if (!action || !attendeeIds || !Array.isArray(attendeeIds)) {
      return NextResponse.json(
        { error: "Missing required fields: action, attendeeIds" },
        { status: 400 }
      );
    }

    const results = [];

    switch (action) {
      case "checkIn":
        // Check in attendees
        for (const rsvpId of attendeeIds) {
          try {
            const updated = await writeClient
              .patch(rsvpId)
              .set({
                attendedEvent: true,
                checkInTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .commit();
            results.push({ rsvpId, success: true, data: updated });
          } catch (error) {
            results.push({ rsvpId, success: false, error: error.message });
          }
        }
        break;

      case "checkOut":
        // Check out attendees
        for (const rsvpId of attendeeIds) {
          try {
            const updated = await writeClient
              .patch(rsvpId)
              .set({
                attendedEvent: false,
                checkInTime: null,
                updatedAt: new Date().toISOString(),
              })
              .commit();
            results.push({ rsvpId, success: true, data: updated });
          } catch (error) {
            results.push({ rsvpId, success: false, error: error.message });
          }
        }
        break;

      case "updateStatus":
        // Update RSVP status
        if (!data?.status || !["going", "maybe", "waitlisted", "not-going"].includes(data.status)) {
          return NextResponse.json(
            { error: "Invalid status for updateStatus action" },
            { status: 400 }
          );
        }

        for (const rsvpId of attendeeIds) {
          try {
            const updated = await writeClient
              .patch(rsvpId)
              .set({
                status: data.status,
                updatedAt: new Date().toISOString(),
              })
              .commit();
            results.push({ rsvpId, success: true, data: updated });
          } catch (error) {
            results.push({ rsvpId, success: false, error: error.message });
          }
        }
        break;

      case "sendReminder":
        // Send reminder (placeholder - would integrate with email service)
        for (const rsvpId of attendeeIds) {
          try {
            // Here you would integrate with your email service
            // For now, just log the reminder
            console.log(`Sending reminder for RSVP ${rsvpId}`);
            
            // Update reminder tracking
            const rsvp = await client.fetch(`*[_type == "eventRsvp" && _id == $rsvpId][0]`, { rsvpId });
            if (rsvp) {
              const reminderData = {
                type: data?.reminderType || "custom",
                sentAt: new Date().toISOString(),
                method: "email",
              };

              await writeClient
                .patch(rsvpId)
                .setIfMissing({ remindersSent: [] })
                .append("remindersSent", [reminderData])
                .commit();
            }

            results.push({ rsvpId, success: true, message: "Reminder sent" });
          } catch (error) {
            results.push({ rsvpId, success: false, error: error.message });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action} completed`,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    console.error("Error performing bulk attendee operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
