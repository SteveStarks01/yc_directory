import { defineField, defineType } from 'sanity'
import { Users } from 'lucide-react'

export default defineType({
  name: 'startupCommunity',
  title: 'Startup Community',
  type: 'document',
  icon: Users,
  fields: [
    // Core Community Information
    defineField({
      name: 'startup',
      title: 'Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      validation: (Rule) => Rule.required(),
      description: 'The startup this community belongs to',
    }),
    defineField({
      name: 'name',
      title: 'Community Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
      description: 'Name of the community (auto-generated from startup name)',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Community Description',
      type: 'text',
      validation: (Rule) => Rule.max(500),
      description: 'Brief description of what this community is about',
    }),

    // Community Settings
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether the community is active and accepting new posts',
    }),
    defineField({
      name: 'isPublic',
      title: 'Is Public',
      type: 'boolean',
      initialValue: true,
      description: 'Whether the community is publicly visible',
    }),
    defineField({
      name: 'allowGuestPosts',
      title: 'Allow Guest Posts',
      type: 'boolean',
      initialValue: false,
      description: 'Whether non-founders can post in this community',
    }),

    // Community Stats
    defineField({
      name: 'memberCount',
      title: 'Member Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of community members',
    }),
    defineField({
      name: 'postCount',
      title: 'Post Count',
      type: 'number',
      initialValue: 0,
      description: 'Total number of posts in this community',
    }),
    defineField({
      name: 'lastActivity',
      title: 'Last Activity',
      type: 'datetime',
      description: 'When the last post or comment was made',
    }),

    // Timestamps
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'startup.title',
      media: 'startup.image',
    },
    prepare(selection) {
      const { title, subtitle } = selection;
      return {
        title: title,
        subtitle: subtitle ? `Community for ${subtitle}` : 'Startup Community',
      };
    },
  },

  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Last Activity',
      name: 'lastActivityDesc',
      by: [{ field: 'lastActivity', direction: 'desc' }],
    },
    {
      title: 'Member Count',
      name: 'memberCountDesc',
      by: [{ field: 'memberCount', direction: 'desc' }],
    },
  ],
});
