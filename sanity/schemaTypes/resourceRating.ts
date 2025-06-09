import { defineField, defineType } from "sanity";
import { StarIcon } from "lucide-react";

export const resourceRating = defineType({
  name: "resourceRating",
  title: "Resource Rating",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "resource",
      title: "Resource",
      type: "reference",
      to: [{ type: "resource" }],
      validation: (Rule) => Rule.required(),
      description: "The resource being rated",
    }),
    defineField({
      name: "user",
      title: "User",
      type: "reference",
      to: [{ type: "userProfile" }],
      validation: (Rule) => Rule.required(),
      description: "Who rated the resource",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
      description: "Rating from 1 to 5 stars",
    }),
    defineField({
      name: "review",
      title: "Review",
      type: "text",
      rows: 4,
      description: "Optional written review",
    }),
    defineField({
      name: "helpful",
      title: "Helpful Votes",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Number of users who found this review helpful",
    }),
    defineField({
      name: "notHelpful",
      title: "Not Helpful Votes",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Number of users who found this review not helpful",
    }),
    defineField({
      name: "verified",
      title: "Verified Review",
      type: "boolean",
      initialValue: false,
      description: "Whether this is a verified review (user actually downloaded/used the resource)",
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
      description: "Last time this rating was modified",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Published", value: "published" },
          { title: "Pending Review", value: "pending" },
          { title: "Hidden", value: "hidden" },
          { title: "Flagged", value: "flagged" },
        ],
      },
      initialValue: "published",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "moderationNotes",
      title: "Moderation Notes",
      type: "text",
      description: "Internal notes for moderators",
    }),
  ],
  preview: {
    select: {
      resourceTitle: "resource.title",
      userName: "user.userId",
      rating: "rating",
      review: "review",
      verified: "verified",
    },
    prepare(selection) {
      const { resourceTitle, userName, rating, review, verified } = selection;
      const stars = "⭐".repeat(rating || 0);
      const reviewPreview = review ? ` - "${review.substring(0, 50)}..."` : "";
      
      return {
        title: `${stars} ${resourceTitle || "Unknown Resource"}`,
        subtitle: `${userName || "Unknown User"}${verified ? " ✓" : ""}${reviewPreview}`,
      };
    },
  },
  orderings: [
    {
      title: "Rating Date, New",
      name: "createdDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
    {
      title: "Highest Rating",
      name: "ratingDesc",
      by: [{ field: "rating", direction: "desc" }],
    },
    {
      title: "Most Helpful",
      name: "helpfulDesc",
      by: [{ field: "helpful", direction: "desc" }],
    },
  ],
});
