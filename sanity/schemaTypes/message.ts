import { defineField, defineType } from 'sanity'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'message',
  title: 'Message',
  type: 'document',
  icon: ChatBubbleLeftRightIcon,
  fields: [
    // Core Message Information
    defineField({
      name: 'conversation',
      title: 'Conversation',
      type: 'reference',
      to: [{ type: 'conversation' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sender',
      title: 'Sender',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'messageType',
      title: 'Message Type',
      type: 'string',
      options: {
        list: [
          { title: 'Text', value: 'text' },
          { title: 'File', value: 'file' },
          { title: 'Image', value: 'image' },
          { title: 'Link', value: 'link' },
          { title: 'System', value: 'system' },
          { title: 'Event Invitation', value: 'event-invitation' },
          { title: 'Connection Request', value: 'connection-request' },
          { title: 'Investment Interest', value: 'investment-interest' },
        ],
      },
      initialValue: 'text',
      validation: (Rule) => Rule.required(),
    }),

    // Message Content
    defineField({
      name: 'content',
      title: 'Message Content',
      type: 'text',
      validation: (Rule) => Rule.required().max(5000),
    }),
    defineField({
      name: 'attachments',
      title: 'Attachments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'file',
              title: 'File',
              type: 'file',
            }),
            defineField({
              name: 'fileName',
              title: 'File Name',
              type: 'string',
            }),
            defineField({
              name: 'fileSize',
              title: 'File Size (bytes)',
              type: 'number',
            }),
            defineField({
              name: 'fileType',
              title: 'File Type',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
            defineField({
              name: 'title',
              title: 'Link Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
            defineField({
              name: 'image',
              title: 'Preview Image',
              type: 'image',
            }),
          ],
        },
      ],
    }),

    // Message References
    defineField({
      name: 'replyTo',
      title: 'Reply To Message',
      type: 'reference',
      to: [{ type: 'message' }],
      description: 'If this message is a reply to another message',
    }),
    defineField({
      name: 'relatedStartup',
      title: 'Related Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      description: 'If message is about a specific startup',
    }),
    defineField({
      name: 'relatedEvent',
      title: 'Related Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'If message is about a specific event',
    }),
    defineField({
      name: 'relatedInvestor',
      title: 'Related Investor',
      type: 'reference',
      to: [{ type: 'investorProfile' }],
      description: 'If message is about a specific investor',
    }),

    // Message Status
    defineField({
      name: 'status',
      title: 'Message Status',
      type: 'string',
      options: {
        list: [
          { title: 'Sent', value: 'sent' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Read', value: 'read' },
          { title: 'Failed', value: 'failed' },
          { title: 'Deleted', value: 'deleted' },
        ],
      },
      initialValue: 'sent',
    }),
    defineField({
      name: 'readBy',
      title: 'Read By',
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
            }),
            defineField({
              name: 'readAt',
              title: 'Read At',
              type: 'datetime',
            }),
          ],
        },
      ],
    }),

    // Message Metadata
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
    }),
    defineField({
      name: 'isDeleted',
      title: 'Is Deleted',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'deletedAt',
      title: 'Deleted At',
      type: 'datetime',
    }),

    // AI and Analytics
    defineField({
      name: 'sentiment',
      title: 'AI Sentiment Analysis',
      type: 'string',
      options: {
        list: [
          { title: 'Positive', value: 'positive' },
          { title: 'Neutral', value: 'neutral' },
          { title: 'Negative', value: 'negative' },
        ],
      },
    }),
    defineField({
      name: 'topics',
      title: 'AI-Detected Topics',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Topics automatically detected by AI',
    }),
    defineField({
      name: 'urgencyScore',
      title: 'AI Urgency Score',
      type: 'number',
      description: 'AI-calculated urgency score (0-100)',
    }),

    // Timestamps
    defineField({
      name: 'sentAt',
      title: 'Sent At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
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
      senderName: 'sender.userId',
      content: 'content',
      messageType: 'messageType',
      sentAt: 'sentAt',
      status: 'status',
    },
    prepare(selection) {
      const { senderName, content, messageType, sentAt, status } = selection;
      const date = new Date(sentAt).toLocaleDateString();
      const time = new Date(sentAt).toLocaleTimeString();
      const preview = content?.substring(0, 50) + (content?.length > 50 ? '...' : '');
      const statusIcon = status === 'read' ? '✓✓' : status === 'delivered' ? '✓' : '⏳';
      
      return {
        title: `${senderName}: ${preview}`,
        subtitle: `${messageType} • ${date} ${time} ${statusIcon}`,
      };
    },
  },

  orderings: [
    {
      title: 'Most Recent',
      name: 'sentAtDesc',
      by: [{ field: 'sentAt', direction: 'desc' }],
    },
    {
      title: 'By Conversation',
      name: 'conversationAsc',
      by: [
        { field: 'conversation._ref', direction: 'asc' },
        { field: 'sentAt', direction: 'asc' }
      ],
    },
    {
      title: 'Unread First',
      name: 'unreadFirst',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'sentAt', direction: 'desc' }
      ],
    },
  ],
});
