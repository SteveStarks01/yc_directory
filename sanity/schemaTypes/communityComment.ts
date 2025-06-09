import { defineField, defineType } from 'sanity'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'communityComment',
  title: 'Community Comment',
  type: 'document',
  icon: ChatBubbleLeftIcon,
  fields: [
    // Core Comment Information
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'communityPost' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Comment Content',
      type: 'text',
      validation: (Rule) => Rule.required().max(1000),
    }),

    // Threading Support
    defineField({
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{ type: 'communityComment' }],
      description: 'If this is a reply to another comment',
    }),
    defineField({
      name: 'threadLevel',
      title: 'Thread Level',
      type: 'number',
      initialValue: 0,
      description: 'Nesting level (0 = top level, 1 = first reply, etc.)',
    }),

    // Engagement
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'hearts',
      title: 'Hearts',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'replyCount',
      title: 'Reply Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of direct replies to this comment',
    }),

    // Comment Status
    defineField({
      name: 'isEdited',
      title: 'Is Edited',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'editedAt',
      title: 'Edited At',
      type: 'datetime',
      description: 'When the comment was last edited',
    }),

    // Moderation
    defineField({
      name: 'isHidden',
      title: 'Is Hidden',
      type: 'boolean',
      initialValue: false,
      description: 'Hide comment from public view',
    }),
    defineField({
      name: 'moderationReason',
      title: 'Moderation Reason',
      type: 'string',
      description: 'Reason for hiding the comment',
      hidden: ({ parent }) => !parent?.isHidden,
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
      title: 'content',
      author: 'author.role',
      post: 'post.content',
      threadLevel: 'threadLevel',
    },
    prepare(selection) {
      const { title, author, threadLevel } = selection;
      const indent = '  '.repeat(threadLevel || 0);
      const contentPreview = title.length > 60 ? `${title.substring(0, 60)}...` : title;
      return {
        title: `${indent}${contentPreview}`,
        subtitle: `by ${author} ${threadLevel > 0 ? `(reply level ${threadLevel})` : ''}`,
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
      title: 'Created Date, Old',
      name: 'createdAtAsc',
      by: [{ field: 'createdAt', direction: 'asc' }],
    },
    {
      title: 'Likes',
      name: 'likesDesc',
      by: [{ field: 'likes', direction: 'desc' }],
    },
  ],
});
