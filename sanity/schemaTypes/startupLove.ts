import { defineField, defineType } from 'sanity'
import { HeartIcon } from '@heroicons/react/24/outline'

export const startupLove = defineType({
  name: 'startupLove',
  title: 'Startup Love',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
      description: 'User who loved the startup',
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
      description: 'Startup being loved',
    }),
    defineField({
      name: 'lovedAt',
      title: 'Loved At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether the love is currently active',
    }),
  ],
  preview: {
    select: {
      userRef: 'user',
      startupRef: 'startup',
      lovedAt: 'lovedAt',
    },
    prepare(selection) {
      const { lovedAt } = selection;
      return {
        title: 'Startup Love',
        subtitle: `Loved on ${new Date(lovedAt).toLocaleDateString()}`,
      };
    },
  },
  orderings: [
    {
      title: 'Recently Loved',
      name: 'lovedAtDesc',
      by: [{ field: 'lovedAt', direction: 'desc' }],
    },
  ],
});
