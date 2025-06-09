import { defineField, defineType } from 'sanity'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'conversation',
  title: 'Conversation',
  type: 'document',
  icon: ChatBubbleLeftEllipsisIcon,
  fields: [
    // Core Conversation Information
    defineField({
      name: 'conversationType',
      title: 'Conversation Type',
      type: 'string',
      options: {
        list: [
          { title: 'Direct Message', value: 'direct' },
          { title: 'Group Chat', value: 'group' },
          { title: 'Support Ticket', value: 'support' },
          { title: 'Investment Discussion', value: 'investment' },
          { title: 'Mentorship', value: 'mentorship' },
          { title: 'Partnership', value: 'partnership' },
          { title: 'Event Planning', value: 'event-planning' },
        ],
      },
      initialValue: 'direct',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Conversation Title',
      type: 'string',
      description: 'Optional title for group conversations or specific topics',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional description of the conversation purpose',
    }),

    // Participants
    defineField({
      name: 'participants',
      title: 'Participants',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'user',
              title: 'User',
              type: 'reference',
              to: [{ type: 'userProfile' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role in Conversation',
              type: 'string',
              options: {
                list: [
                  { title: 'Owner', value: 'owner' },
                  { title: 'Admin', value: 'admin' },
                  { title: 'Member', value: 'member' },
                  { title: 'Guest', value: 'guest' },
                ],
              },
              initialValue: 'member',
            }),
            defineField({
              name: 'joinedAt',
              title: 'Joined At',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            }),
            defineField({
              name: 'leftAt',
              title: 'Left At',
              type: 'datetime',
              description: 'When the user left the conversation (if applicable)',
            }),
            defineField({
              name: 'lastReadAt',
              title: 'Last Read At',
              type: 'datetime',
              description: 'When the user last read messages in this conversation',
            }),
            defineField({
              name: 'notificationsEnabled',
              title: 'Notifications Enabled',
              type: 'boolean',
              initialValue: true,
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(2),
    }),

    // Conversation Settings
    defineField({
      name: 'isPrivate',
      title: 'Is Private',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this conversation is private or can be discovered',
    }),
    defineField({
      name: 'allowInvites',
      title: 'Allow Invites',
      type: 'boolean',
      initialValue: false,
      description: 'Whether participants can invite others',
    }),
    defineField({
      name: 'maxParticipants',
      title: 'Max Participants',
      type: 'number',
      description: 'Maximum number of participants (for group chats)',
      validation: (Rule) => Rule.min(2).max(100),
    }),

    // Related Content
    defineField({
      name: 'relatedStartup',
      title: 'Related Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      description: 'If conversation is about a specific startup',
    }),
    defineField({
      name: 'relatedEvent',
      title: 'Related Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'If conversation is about a specific event',
    }),
    defineField({
      name: 'relatedInvestor',
      title: 'Related Investor',
      type: 'reference',
      to: [{ type: 'investorProfile' }],
      description: 'If conversation is about a specific investor',
    }),
    defineField({
      name: 'relatedConnectionRequest',
      title: 'Related Connection Request',
      type: 'reference',
      to: [{ type: 'connectionRequest' }],
      description: 'If conversation started from a connection request',
    }),

    // Conversation Status
    defineField({
      name: 'status',
      title: 'Conversation Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Archived', value: 'archived' },
          { title: 'Muted', value: 'muted' },
          { title: 'Blocked', value: 'blocked' },
          { title: 'Closed', value: 'closed' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Normal', value: 'normal' },
          { title: 'High', value: 'high' },
          { title: 'Urgent', value: 'urgent' },
        ],
      },
      initialValue: 'normal',
    }),

    // Message Statistics
    defineField({
      name: 'messageCount',
      title: 'Message Count',
      type: 'number',
      initialValue: 0,
      description: 'Total number of messages in this conversation',
    }),
    defineField({
      name: 'lastMessage',
      title: 'Last Message',
      type: 'reference',
      to: [{ type: 'message' }],
      description: 'Reference to the most recent message',
    }),
    defineField({
      name: 'lastActivity',
      title: 'Last Activity',
      type: 'datetime',
      description: 'When the last message was sent',
    }),

    // AI and Analytics
    defineField({
      name: 'topics',
      title: 'AI-Detected Topics',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Topics automatically detected from conversation content',
    }),
    defineField({
      name: 'sentiment',
      title: 'Overall Sentiment',
      type: 'string',
      options: {
        list: [
          { title: 'Positive', value: 'positive' },
          { title: 'Neutral', value: 'neutral' },
          { title: 'Negative', value: 'negative' },
          { title: 'Mixed', value: 'mixed' },
        ],
      },
    }),
    defineField({
      name: 'engagementScore',
      title: 'Engagement Score',
      type: 'number',
      description: 'AI-calculated engagement score based on message frequency and responses',
    }),

    // Privacy and Moderation
    defineField({
      name: 'isModerated',
      title: 'Is Moderated',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this conversation is being moderated',
    }),
    defineField({
      name: 'moderators',
      title: 'Moderators',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'userProfile' }],
        },
      ],
    }),
    defineField({
      name: 'reportCount',
      title: 'Report Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of times this conversation has been reported',
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
      name: 'archivedAt',
      title: 'Archived At',
      type: 'datetime',
      description: 'When the conversation was archived',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      conversationType: 'conversationType',
      participantCount: 'participants',
      lastActivity: 'lastActivity',
      status: 'status',
      messageCount: 'messageCount',
    },
    prepare(selection) {
      const { title, conversationType, participantCount, lastActivity, status, messageCount } = selection;
      const participants = Array.isArray(participantCount) ? participantCount.length : 0;
      const date = lastActivity ? new Date(lastActivity).toLocaleDateString() : 'No activity';
      const statusIcon = status === 'active' ? '🟢' : status === 'archived' ? '📁' : '⏸️';
      
      const displayTitle = title || `${conversationType} conversation`;
      
      return {
        title: `${displayTitle} ${statusIcon}`,
        subtitle: `${participants} participants • ${messageCount || 0} messages • ${date}`,
      };
    },
  },

  orderings: [
    {
      title: 'Most Recent Activity',
      name: 'lastActivityDesc',
      by: [{ field: 'lastActivity', direction: 'desc' }],
    },
    {
      title: 'Most Messages',
      name: 'messageCountDesc',
      by: [{ field: 'messageCount', direction: 'desc' }],
    },
    {
      title: 'By Type',
      name: 'typeAsc',
      by: [
        { field: 'conversationType', direction: 'asc' },
        { field: 'lastActivity', direction: 'desc' }
      ],
    },
    {
      title: 'Active First',
      name: 'statusAsc',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'lastActivity', direction: 'desc' }
      ],
    },
  ],
});
