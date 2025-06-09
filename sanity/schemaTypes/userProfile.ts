import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";

export const userProfile = defineType({
  name: "userProfile",
  title: "User Profile",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Unique identifier from authentication provider",
    }),
    defineField({
      name: "role",
      title: "User Role",
      type: "string",
      options: {
        list: [
          { title: "User", value: "user" },
          { title: "Founder", value: "founder" },
          { title: "Investor", value: "investor" },
          { title: "Mentor", value: "mentor" },
          { title: "Moderator", value: "moderator" },
          { title: "Admin", value: "admin" },
        ],
      },
      initialValue: "user",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "text",
      rows: 4,
      description: "Tell us about yourself",
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
      description: "Your professional skills and expertise",
    }),
    defineField({
      name: "interests",
      title: "Interests",
      type: "array",
      of: [{ type: "string" }],
      description: "Your areas of interest in the startup ecosystem",
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      description: "Current company or organization",
    }),
    defineField({
      name: "position",
      title: "Position",
      type: "string",
      description: "Your current role or title",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Your city, state, or country",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        defineField({
          name: "linkedin",
          title: "LinkedIn",
          type: "url",
          validation: (Rule) =>
            Rule.uri({
              scheme: ["http", "https"],
            }),
        }),
        defineField({
          name: "twitter",
          title: "Twitter",
          type: "url",
          validation: (Rule) =>
            Rule.uri({
              scheme: ["http", "https"],
            }),
        }),
        defineField({
          name: "github",
          title: "GitHub",
          type: "url",
          validation: (Rule) =>
            Rule.uri({
              scheme: ["http", "https"],
            }),
        }),
        defineField({
          name: "website",
          title: "Website",
          type: "url",
          validation: (Rule) =>
            Rule.uri({
              scheme: ["http", "https"],
            }),
        }),
      ],
    }),
    defineField({
      name: "preferences",
      title: "Preferences",
      type: "object",
      fields: [
        defineField({
          name: "emailNotifications",
          title: "Email Notifications",
          type: "boolean",
          initialValue: true,
          description: "Receive email notifications for community activities",
        }),
        defineField({
          name: "profileVisibility",
          title: "Profile Visibility",
          type: "string",
          options: {
            list: [
              { title: "Public", value: "public" },
              { title: "Community Only", value: "community" },
              { title: "Private", value: "private" },
            ],
          },
          initialValue: "community",
          description: "Who can see your profile information",
        }),
        defineField({
          name: "showEmail",
          title: "Show Email",
          type: "boolean",
          initialValue: false,
          description: "Display your email address on your profile",
        }),
      ],
    }),
    defineField({
      name: "joinedAt",
      title: "Joined At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "lastActive",
      title: "Last Active",
      type: "datetime",
      description: "Last time the user was active on the platform",
    }),
    defineField({
      name: "isVerified",
      title: "Verified User",
      type: "boolean",
      initialValue: false,
      description: "Whether the user has been verified by administrators",
    }),
    defineField({
      name: "isActive",
      title: "Active Account",
      type: "boolean",
      initialValue: true,
      description: "Whether the user account is active",
    }),
  ],
  preview: {
    select: {
      title: "userId",
      subtitle: "role",
      media: "avatar",
    },
    prepare(selection) {
      const { title, subtitle } = selection;
      return {
        title: title || "Unknown User",
        subtitle: subtitle ? `Role: ${subtitle}` : "No role assigned",
      };
    },
  },
});
