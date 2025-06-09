import { defineField, defineType } from "sanity";
import { UserCheckIcon } from "lucide-react";

export const eventRsvp = defineType({
  name: "eventRsvp",
  title: "Event RSVP",
  type: "document",
  icon: UserCheckIcon,
  fields: [
    defineField({
      name: "event",
      title: "Event",
      type: "reference",
      to: [{ type: "event" }],
      validation: (Rule) => Rule.required(),
      description: "The event this RSVP is for",
    }),
    defineField({
      name: "attendee",
      title: "Attendee",
      type: "reference",
      to: [{ type: "userProfile" }],
      validation: (Rule) => Rule.required(),
      description: "Who is attending this event",
    }),
    defineField({
      name: "status",
      title: "RSVP Status",
      type: "string",
      options: {
        list: [
          { title: "Going", value: "going" },
          { title: "Maybe", value: "maybe" },
          { title: "Not Going", value: "not-going" },
          { title: "Waitlisted", value: "waitlisted" },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: "going",
    }),
    defineField({
      name: "registeredAt",
      title: "Registered At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
      description: "When the user registered for this event",
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      description: "Last time this RSVP was modified",
    }),
    defineField({
      name: "attendedEvent",
      title: "Actually Attended",
      type: "boolean",
      description: "Whether the person actually showed up to the event",
    }),
    defineField({
      name: "checkInTime",
      title: "Check-in Time",
      type: "datetime",
      description: "When the attendee checked in to the event",
    }),
    defineField({
      name: "notes",
      title: "Attendee Notes",
      type: "text",
      description: "Special requests or notes from the attendee",
    }),
    defineField({
      name: "dietaryRestrictions",
      title: "Dietary Restrictions",
      type: "array",
      of: [{ type: "string" }],
      description: "Any dietary restrictions or allergies",
    }),
    defineField({
      name: "emergencyContact",
      title: "Emergency Contact",
      type: "object",
      fields: [
        defineField({
          name: "name",
          title: "Contact Name",
          type: "string",
        }),
        defineField({
          name: "phone",
          title: "Phone Number",
          type: "string",
        }),
        defineField({
          name: "relationship",
          title: "Relationship",
          type: "string",
        }),
      ],
      description: "Emergency contact information",
    }),
    defineField({
      name: "feedback",
      title: "Event Feedback",
      type: "object",
      fields: [
        defineField({
          name: "rating",
          title: "Event Rating",
          type: "number",
          validation: (Rule) => Rule.min(1).max(5),
          description: "Rate the event from 1-5 stars",
        }),
        defineField({
          name: "comments",
          title: "Comments",
          type: "text",
          description: "Feedback about the event",
        }),
        defineField({
          name: "wouldRecommend",
          title: "Would Recommend",
          type: "boolean",
          description: "Would you recommend this event to others?",
        }),
        defineField({
          name: "submittedAt",
          title: "Feedback Submitted At",
          type: "datetime",
          readOnly: true,
        }),
      ],
      description: "Post-event feedback (filled after event completion)",
    }),
    defineField({
      name: "remindersSent",
      title: "Reminders Sent",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "type",
              title: "Reminder Type",
              type: "string",
              options: {
                list: [
                  { title: "24 Hours Before", value: "24h" },
                  { title: "1 Hour Before", value: "1h" },
                  { title: "Event Starting", value: "starting" },
                ],
              },
            }),
            defineField({
              name: "sentAt",
              title: "Sent At",
              type: "datetime",
            }),
            defineField({
              name: "method",
              title: "Method",
              type: "string",
              options: {
                list: [
                  { title: "Email", value: "email" },
                  { title: "SMS", value: "sms" },
                  { title: "Push Notification", value: "push" },
                ],
              },
            }),
          ],
        },
      ],
      description: "Track which reminders have been sent",
    }),
  ],
  preview: {
    select: {
      eventTitle: "event.title",
      attendeeName: "attendee.userId",
      status: "status",
      registeredAt: "registeredAt",
    },
    prepare(selection) {
      const { eventTitle, attendeeName, status, registeredAt } = selection;
      const date = registeredAt 
        ? new Date(registeredAt).toLocaleDateString() 
        : "No date";
      
      return {
        title: `${attendeeName || "Unknown"} → ${eventTitle || "Unknown Event"}`,
        subtitle: `${status || "unknown"} • Registered: ${date}`,
      };
    },
  },
  orderings: [
    {
      title: "Registration Date, New",
      name: "registeredDesc",
      by: [{ field: "registeredAt", direction: "desc" }],
    },
    {
      title: "Registration Date, Old",
      name: "registeredAsc",
      by: [{ field: "registeredAt", direction: "asc" }],
    },
    {
      title: "Event Date",
      name: "eventDate",
      by: [{ field: "event.startDateTime", direction: "asc" }],
    },
  ],
});
