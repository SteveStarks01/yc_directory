import { defineField, defineType } from 'sanity'
import { UserPlusIcon } from '@heroicons/react/24/outline'

export const startupFollow = defineType({
  name: 'startupFollow',
  title: 'Startup Follow',
  type: 'document',
  icon: UserPlusIcon,
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
      description: 'User who is following the startup',
    }),
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Clerk User ID for quick lookups',
    }),
    defineField({
      name: 'startup',
      title: 'Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      validation: (Rule) => Rule.required(),
      description: 'Startup being followed',
    }),
    defineField({
      name: 'followedAt',
      title: 'Followed At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether the follow is currently active',
    }),
  ],
  preview: {
    select: {
      userRef: 'user',
      startupRef: 'startup',
      followedAt: 'followedAt',
    },
    prepare(selection) {
      const { followedAt } = selection;
      return {
        title: 'Startup Follow',
        subtitle: `Followed on ${new Date(followedAt).toLocaleDateString()}`,
      };
    },
  },
  orderings: [
    {
      title: 'Recently Followed',
      name: 'followedAtDesc',
      by: [{ field: 'followedAt', direction: 'desc' }],
    },
  ],
});
