import { defineField, defineType } from "sanity";
import { CalendarIcon } from "lucide-react";

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Event Title",
      type: "string",
      validation: (Rule) => Rule.required().max(100),
      description: "The name of your event",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: "URL-friendly version of the title",
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
      description: "Brief description for event listings",
    }),
    defineField({
      name: "content",
      title: "Event Details",
      type: "array",
      of: [{ type: "block" }],
      description: "Detailed information about the event",
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      options: {
        list: [
          { title: "Networking", value: "networking" },
          { title: "Demo Day", value: "demo-day" },
          { title: "Workshop", value: "workshop" },
          { title: "Panel Discussion", value: "panel" },
          { title: "Pitch Competition", value: "pitch" },
          { title: "Meetup", value: "meetup" },
          { title: "Conference", value: "conference" },
          { title: "Social", value: "social" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "format",
      title: "Event Format",
      type: "string",
      options: {
        list: [
          { title: "In-Person", value: "in-person" },
          { title: "Virtual", value: "virtual" },
          { title: "Hybrid", value: "hybrid" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startDateTime",
      title: "Start Date & Time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      description: "When the event starts",
    }),
    defineField({
      name: "endDateTime",
      title: "End Date & Time",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      description: "When the event ends",
    }),
    defineField({
      name: "timezone",
      title: "Timezone",
      type: "string",
      initialValue: "UTC",
      description: "Event timezone (e.g., UTC, PST, EST)",
    }),
    defineField({
      name: "location",
      title: "Location Details",
      type: "object",
      fields: [
        defineField({
          name: "venue",
          title: "Venue Name",
          type: "string",
          description: "Name of the venue or platform",
        }),
        defineField({
          name: "address",
          title: "Address",
          type: "text",
          rows: 2,
          description: "Physical address for in-person events",
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
        }),
        defineField({
          name: "country",
          title: "Country",
          type: "string",
        }),
        defineField({
          name: "virtualLink",
          title: "Virtual Meeting Link",
          type: "url",
          description: "Zoom, Teams, or other meeting link",
          validation: (Rule) =>
            Rule.uri({
              scheme: ["http", "https"],
            }),
        }),
        defineField({
          name: "accessInstructions",
          title: "Access Instructions",
          type: "text",
          description: "How to join or access the event",
        }),
      ],
    }),
    defineField({
      name: "capacity",
      title: "Event Capacity",
      type: "number",
      validation: (Rule) => Rule.min(1).max(10000),
      description: "Maximum number of attendees (leave empty for unlimited)",
    }),
    defineField({
      name: "registrationDeadline",
      title: "Registration Deadline",
      type: "datetime",
      description: "Last date to register for the event",
    }),
    defineField({
      name: "organizer",
      title: "Event Organizer",
      type: "reference",
      to: [{ type: "userProfile" }],
      validation: (Rule) => Rule.required(),
      description: "Who is organizing this event",
    }),
    defineField({
      name: "speakers",
      title: "Speakers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "userProfile" }] }],
      description: "Featured speakers or presenters",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "Topics and keywords for this event",
    }),
    defineField({
      name: "image",
      title: "Event Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Cover image for the event",
    }),
    defineField({
      name: "price",
      title: "Ticket Price",
      type: "object",
      fields: [
        defineField({
          name: "isFree",
          title: "Free Event",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "amount",
          title: "Price Amount",
          type: "number",
          validation: (Rule) => Rule.min(0),
        }),
        defineField({
          name: "currency",
          title: "Currency",
          type: "string",
          initialValue: "USD",
          options: {
            list: ["USD", "EUR", "GBP", "CAD", "AUD"],
          },
        }),
      ],
    }),
    defineField({
      name: "requirements",
      title: "Requirements",
      type: "array",
      of: [{ type: "string" }],
      description: "What attendees need to bring or prepare",
    }),
    defineField({
      name: "featured",
      title: "Featured Event",
      type: "boolean",
      initialValue: false,
      description: "Highlight this event on the homepage",
    }),
    defineField({
      name: "status",
      title: "Event Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Completed", value: "completed" },
        ],
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      description: "Last time this event was modified",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "eventType",
      media: "image",
      startDate: "startDateTime",
      status: "status",
    },
    prepare(selection) {
      const { title, subtitle, startDate, status } = selection;
      const date = startDate ? new Date(startDate).toLocaleDateString() : "No date";
      return {
        title: title || "Untitled Event",
        subtitle: `${subtitle || "Event"} • ${date} • ${status || "draft"}`,
        media: selection.media,
      };
    },
  },
  orderings: [
    {
      title: "Start Date, New",
      name: "startDateDesc",
      by: [{ field: "startDateTime", direction: "desc" }],
    },
    {
      title: "Start Date, Old",
      name: "startDateAsc",
      by: [{ field: "startDateTime", direction: "asc" }],
    },
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
