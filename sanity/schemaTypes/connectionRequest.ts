import { defineField, defineType } from 'sanity'
import { UserPlusIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'connectionRequest',
  title: 'Connection Request',
  type: 'document',
  icon: UserPlusIcon,
  fields: [
    // Core Information
    defineField({
      name: 'requester',
      title: 'Requester',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'recipient',
      title: 'Recipient',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'connectionType',
      title: 'Connection Type',
      type: 'string',
      options: {
        list: [
          { title: 'Investment Interest', value: 'investment' },
          { title: 'Partnership', value: 'partnership' },
          { title: 'Mentorship', value: 'mentorship' },
          { title: 'Advisory', value: 'advisory' },
          { title: 'Customer/Client', value: 'customer' },
          { title: 'Networking', value: 'networking' },
          { title: 'Collaboration', value: 'collaboration' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // Context
    defineField({
      name: 'relatedStartup',
      title: 'Related Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      description: 'If this connection is about a specific startup',
    }),
    defineField({
      name: 'relatedPitch',
      title: 'Related Pitch',
      type: 'reference',
      to: [{ type: 'pitch' }],
      description: 'If this connection was initiated from a pitch',
    }),
    defineField({
      name: 'relatedEvent',
      title: 'Related Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'If this connection was made at an event',
    }),

    // Request Details
    defineField({
      name: 'subject',
      title: 'Subject',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(100),
      description: 'Brief subject line for the connection request',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required().min(20).max(1000),
      description: 'Personalized message explaining why you want to connect',
    }),
    defineField({
      name: 'proposedMeetingType',
      title: 'Proposed Meeting Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video Call', value: 'video-call' },
          { title: 'Phone Call', value: 'phone-call' },
          { title: 'In-Person Meeting', value: 'in-person' },
          { title: 'Coffee Chat', value: 'coffee-chat' },
          { title: 'Email Exchange', value: 'email' },
          { title: 'No Preference', value: 'no-preference' },
        ],
      },
    }),
    defineField({
      name: 'urgency',
      title: 'Urgency',
      type: 'string',
      options: {
        list: [
          { title: 'High - Time Sensitive', value: 'high' },
          { title: 'Medium - Within 2 Weeks', value: 'medium' },
          { title: 'Low - No Rush', value: 'low' },
        ],
      },
      initialValue: 'medium',
    }),

    // Investment Specific (if applicable)
    defineField({
      name: 'investmentDetails',
      title: 'Investment Details',
      type: 'object',
      fields: [
        defineField({
          name: 'interestedInLeading',
          title: 'Interested in Leading',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'potentialAmount',
          title: 'Potential Investment Amount (USD)',
          type: 'number',
        }),
        defineField({
          name: 'timeframe',
          title: 'Investment Timeframe',
          type: 'string',
          options: {
            list: [
              { title: 'Immediate', value: 'immediate' },
              { title: 'Within 1 Month', value: '1-month' },
              { title: 'Within 3 Months', value: '3-months' },
              { title: 'Within 6 Months', value: '6-months' },
              { title: 'Future Rounds', value: 'future' },
            ],
          },
        }),
        defineField({
          name: 'dueDiligenceRequirements',
          title: 'Due Diligence Requirements',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'Financial Statements', value: 'financials' },
              { title: 'Customer References', value: 'customer-refs' },
              { title: 'Technical Review', value: 'technical' },
              { title: 'Legal Review', value: 'legal' },
              { title: 'Market Analysis', value: 'market' },
              { title: 'Team Background Checks', value: 'background' },
              { title: 'IP Review', value: 'ip' },
              { title: 'Competitive Analysis', value: 'competitive' },
            ],
          },
        }),
      ],
      hidden: ({ document }) => document?.connectionType !== 'investment',
    }),

    // Status and Response
    defineField({
      name: 'status',
      title: 'Request Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Declined', value: 'declined' },
          { title: 'Expired', value: 'expired' },
          { title: 'Withdrawn', value: 'withdrawn' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'responseMessage',
      title: 'Response Message',
      type: 'text',
      description: 'Response from the recipient',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'responseDate',
      title: 'Response Date',
      type: 'datetime',
    }),

    // Meeting Coordination
    defineField({
      name: 'meetingScheduled',
      title: 'Meeting Scheduled',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'meetingDate',
      title: 'Meeting Date',
      type: 'datetime',
    }),
    defineField({
      name: 'meetingLink',
      title: 'Meeting Link',
      type: 'url',
      description: 'Video call link or meeting details',
    }),
    defineField({
      name: 'meetingNotes',
      title: 'Meeting Notes',
      type: 'text',
      description: 'Notes from the meeting',
      validation: (Rule) => Rule.max(2000),
    }),
    defineField({
      name: 'meetingOutcome',
      title: 'Meeting Outcome',
      type: 'string',
      options: {
        list: [
          { title: 'Very Positive', value: 'very-positive' },
          { title: 'Positive', value: 'positive' },
          { title: 'Neutral', value: 'neutral' },
          { title: 'Negative', value: 'negative' },
          { title: 'No Show', value: 'no-show' },
          { title: 'Rescheduled', value: 'rescheduled' },
        ],
      },
    }),

    // Follow-up
    defineField({
      name: 'followUpRequired',
      title: 'Follow-up Required',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'followUpDate',
      title: 'Follow-up Date',
      type: 'datetime',
    }),
    defineField({
      name: 'followUpNotes',
      title: 'Follow-up Notes',
      type: 'text',
      validation: (Rule) => Rule.max(1000),
    }),

    // Analytics and Tracking
    defineField({
      name: 'source',
      title: 'Request Source',
      type: 'string',
      options: {
        list: [
          { title: 'Startup Profile', value: 'startup-profile' },
          { title: 'Pitch Page', value: 'pitch-page' },
          { title: 'Event Page', value: 'event-page' },
          { title: 'Search Results', value: 'search' },
          { title: 'Recommendation', value: 'recommendation' },
          { title: 'Direct Message', value: 'direct-message' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'referredBy',
      title: 'Referred By',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      description: 'Who facilitated this connection?',
    }),

    // Privacy and Notifications
    defineField({
      name: 'allowPublicVisibility',
      title: 'Allow Public Visibility',
      type: 'boolean',
      description: 'Can this connection be shown publicly (for networking purposes)?',
      initialValue: false,
    }),
    defineField({
      name: 'notificationsEnabled',
      title: 'Notifications Enabled',
      type: 'boolean',
      description: 'Send notifications for updates on this connection',
      initialValue: true,
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
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'When does this request expire?',
      initialValue: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30); // 30 days from now
        return date.toISOString();
      },
    }),
  ],

  preview: {
    select: {
      requesterName: 'requester.userId',
      recipientName: 'recipient.userId',
      connectionType: 'connectionType',
      status: 'status',
      subject: 'subject',
    },
    prepare(selection) {
      const { requesterName, recipientName, connectionType, status, subject } = selection;
      const statusIcon = status === 'accepted' ? '✅' : status === 'declined' ? '❌' : '⏳';
      return {
        title: `${requesterName} → ${recipientName}`,
        subtitle: `${statusIcon} ${connectionType} • ${subject}`,
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
      title: 'Recently Updated',
      name: 'updatedAtDesc',
      by: [{ field: 'updatedAt', direction: 'desc' }],
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
    {
      title: 'Expiring Soon',
      name: 'expiresAtAsc',
      by: [{ field: 'expiresAt', direction: 'asc' }],
    },
  ],
});
