import { defineField, defineType } from 'sanity'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'pitchComment',
  title: 'Pitch Comment',
  type: 'document',
  icon: ChatBubbleLeftIcon,
  fields: [
    // Core Comment Information
    defineField({
      name: 'pitch',
      title: 'Pitch',
      type: 'reference',
      to: [{ type: 'pitch' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Comment Author',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Comment Content',
      type: 'text',
      validation: (Rule) => Rule.required().min(1).max(1000),
      description: 'Your comment or question about this pitch',
    }),

    // Comment Type and Context
    defineField({
      name: 'commentType',
      title: 'Comment Type',
      type: 'string',
      options: {
        list: [
          { title: 'General Comment', value: 'general' },
          { title: 'Question', value: 'question' },
          { title: 'Feedback', value: 'feedback' },
          { title: 'Suggestion', value: 'suggestion' },
          { title: 'Compliment', value: 'compliment' },
          { title: 'Concern', value: 'concern' },
          { title: 'Investment Interest', value: 'investment' },
          { title: 'Partnership Interest', value: 'partnership' },
        ],
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'isQuestion',
      title: 'Is this a Question?',
      type: 'boolean',
      description: 'Mark this as a question that needs an answer',
      initialValue: false,
    }),
    defineField({
      name: 'isPrivate',
      title: 'Private Comment',
      type: 'boolean',
      description: 'Only visible to the startup team and comment author',
      initialValue: false,
    }),

    // Threading Support
    defineField({
      name: 'parentComment',
      title: 'Parent Comment',
      type: 'reference',
      to: [{ type: 'pitchComment' }],
      description: 'If this is a reply, reference the parent comment',
    }),
    defineField({
      name: 'threadLevel',
      title: 'Thread Level',
      type: 'number',
      description: 'Depth of the comment thread (0 = top level)',
      initialValue: 0,
    }),

    // Engagement and Reactions
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'replies',
      title: 'Reply Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),

    // Author Information Context
    defineField({
      name: 'authorRole',
      title: 'Author Role Context',
      type: 'string',
      options: {
        list: [
          { title: 'Investor', value: 'investor' },
          { title: 'Mentor', value: 'mentor' },
          { title: 'Fellow Entrepreneur', value: 'entrepreneur' },
          { title: 'Industry Expert', value: 'expert' },
          { title: 'Potential Customer', value: 'customer' },
          { title: 'Community Member', value: 'community' },
          { title: 'Judge', value: 'judge' },
          { title: 'Other', value: 'other' },
        ],
      },
      description: 'In what capacity are you commenting?',
    }),
    defineField({
      name: 'expertise',
      title: 'Relevant Expertise',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Your relevant expertise for this comment',
    }),

    // Response from Startup
    defineField({
      name: 'hasResponse',
      title: 'Has Startup Response',
      type: 'boolean',
      description: 'Has the startup team responded to this comment?',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'responseDate',
      title: 'Response Date',
      type: 'datetime',
      description: 'When did the startup team respond?',
      readOnly: true,
    }),

    // Moderation and Status
    defineField({
      name: 'status',
      title: 'Comment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Under Review', value: 'review' },
          { title: 'Flagged', value: 'flagged' },
          { title: 'Hidden', value: 'hidden' },
          { title: 'Deleted', value: 'deleted' },
        ],
      },
      initialValue: 'published',
    }),
    defineField({
      name: 'flaggedReason',
      title: 'Flagged Reason',
      type: 'string',
      options: {
        list: [
          { title: 'Inappropriate Content', value: 'inappropriate' },
          { title: 'Spam', value: 'spam' },
          { title: 'Off Topic', value: 'off-topic' },
          { title: 'Harassment', value: 'harassment' },
          { title: 'Misinformation', value: 'misinformation' },
          { title: 'Other', value: 'other' },
        ],
      },
      hidden: ({ document }) => document?.status !== 'flagged',
    }),
    defineField({
      name: 'moderatorNotes',
      title: 'Moderator Notes',
      type: 'text',
      description: 'Internal notes for moderators',
      hidden: ({ currentUser }) => !currentUser?.roles?.some((role: any) => role.name === 'administrator'),
    }),

    // Helpful Voting
    defineField({
      name: 'helpful',
      title: 'Helpful Votes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'notHelpful',
      title: 'Not Helpful Votes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),

    // Contact Information (for investment/partnership interest)
    defineField({
      name: 'contactRequested',
      title: 'Contact Requested',
      type: 'boolean',
      description: 'Would you like the startup to contact you?',
      initialValue: false,
    }),
    defineField({
      name: 'contactMethod',
      title: 'Preferred Contact Method',
      type: 'string',
      options: {
        list: [
          { title: 'Email', value: 'email' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Phone', value: 'phone' },
          { title: 'Calendar Link', value: 'calendar' },
        ],
      },
      hidden: ({ document }) => !document?.contactRequested,
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
    defineField({
      name: 'editedAt',
      title: 'Last Edited At',
      type: 'datetime',
      description: 'When was this comment last edited?',
    }),
  ],

  preview: {
    select: {
      title: 'content',
      subtitle: 'author.userId',
      commentType: 'commentType',
      isQuestion: 'isQuestion',
      likes: 'likes',
    },
    prepare(selection) {
      const { title, subtitle, commentType, isQuestion, likes } = selection;
      const truncatedTitle = title?.length > 60 ? title.substring(0, 60) + '...' : title;
      const typeIcon = isQuestion ? '❓' : commentType === 'investment' ? '💰' : '💬';
      const likeText = likes > 0 ? ` • ${likes} likes` : '';
      
      return {
        title: `${typeIcon} ${truncatedTitle}`,
        subtitle: `by ${subtitle}${likeText}`,
      };
    },
  },

  orderings: [
    {
      title: 'Recently Created',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Most Liked',
      name: 'likesDesc',
      by: [{ field: 'likes', direction: 'desc' }],
    },
    {
      title: 'Most Helpful',
      name: 'helpfulDesc',
      by: [{ field: 'helpful', direction: 'desc' }],
    },
    {
      title: 'Questions First',
      name: 'questionsFirst',
      by: [
        { field: 'isQuestion', direction: 'desc' },
        { field: 'createdAt', direction: 'desc' }
      ],
    },
  ],
});
