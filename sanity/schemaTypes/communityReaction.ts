import { defineField, defineType } from 'sanity'
import { HeartIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'communityReaction',
  title: 'Community Reaction',
  type: 'document',
  icon: HeartIcon,
  fields: [
    // Core Reaction Information
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reactionType',
      title: 'Reaction Type',
      type: 'string',
      options: {
        list: [
          { title: '👍 Like', value: 'like' },
          { title: '❤️ Heart', value: 'heart' },
          { title: '🔥 Fire', value: 'fire' },
          { title: '💡 Idea', value: 'idea' },
          { title: '🎉 Celebrate', value: 'celebrate' },
          { title: '👏 Clap', value: 'clap' },
          { title: '🚀 Rocket', value: 'rocket' },
          { title: '💯 Hundred', value: 'hundred' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // Target Information
    defineField({
      name: 'targetType',
      title: 'Target Type',
      type: 'string',
      options: {
        list: [
          { title: 'Post', value: 'post' },
          { title: 'Comment', value: 'comment' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetPost',
      title: 'Target Post',
      type: 'reference',
      to: [{ type: 'communityPost' }],
      hidden: ({ parent }) => parent?.targetType !== 'post',
      validation: (Rule) => 
        Rule.custom((value, context) => {
          const targetType = context.parent?.targetType;
          if (targetType === 'post' && !value) {
            return 'Post is required when target type is post';
          }
          return true;
        }),
    }),
    defineField({
      name: 'targetComment',
      title: 'Target Comment',
      type: 'reference',
      to: [{ type: 'communityComment' }],
      hidden: ({ parent }) => parent?.targetType !== 'comment',
      validation: (Rule) => 
        Rule.custom((value, context) => {
          const targetType = context.parent?.targetType;
          if (targetType === 'comment' && !value) {
            return 'Comment is required when target type is comment';
          }
          return true;
        }),
    }),

    // Community Context
    defineField({
      name: 'community',
      title: 'Community',
      type: 'reference',
      to: [{ type: 'startupCommunity' }],
      validation: (Rule) => Rule.required(),
      description: 'The community where this reaction was made',
    }),

    // Timestamps
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],

  preview: {
    select: {
      reactionType: 'reactionType',
      user: 'user.role',
      targetType: 'targetType',
      community: 'community.name',
    },
    prepare(selection) {
      const { reactionType, user, targetType, community } = selection;
      const reactionEmoji = {
        like: '👍',
        heart: '❤️',
        fire: '🔥',
        idea: '💡',
        celebrate: '🎉',
        clap: '👏',
        rocket: '🚀',
        hundred: '💯',
      }[reactionType] || '👍';

      return {
        title: `${reactionEmoji} ${reactionType} reaction`,
        subtitle: `by ${user} on ${targetType} in ${community}`,
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
      title: 'Reaction Type',
      name: 'reactionType',
      by: [{ field: 'reactionType', direction: 'asc' }],
    },
  ],
});
