import { defineField, defineType } from 'sanity'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'userInteraction',
  title: 'User Interaction',
  type: 'document',
  icon: ChartBarIcon,
  fields: [
    // Core Information
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'interactionType',
      title: 'Interaction Type',
      type: 'string',
      options: {
        list: [
          { title: 'Profile View', value: 'profile-view' },
          { title: 'Startup View', value: 'startup-view' },
          { title: 'Investor View', value: 'investor-view' },
          { title: 'Pitch View', value: 'pitch-view' },
          { title: 'Event View', value: 'event-view' },
          { title: 'Resource View', value: 'resource-view' },
          { title: 'Search Query', value: 'search' },
          { title: 'Filter Applied', value: 'filter' },
          { title: 'Connection Request', value: 'connection-request' },
          { title: 'Investment Interest', value: 'investment-interest' },
          { title: 'Pitch Rating', value: 'pitch-rating' },
          { title: 'Event RSVP', value: 'event-rsvp' },
          { title: 'Resource Download', value: 'resource-download' },
          { title: 'Message Sent', value: 'message-sent' },
          { title: 'Profile Update', value: 'profile-update' },
          { title: 'Login', value: 'login' },
          { title: 'Logout', value: 'logout' },
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
          { title: 'User Profile', value: 'user' },
          { title: 'Startup', value: 'startup' },
          { title: 'Investor Profile', value: 'investor' },
          { title: 'Pitch', value: 'pitch' },
          { title: 'Event', value: 'event' },
          { title: 'Resource', value: 'resource' },
          { title: 'Search Results', value: 'search-results' },
          { title: 'System', value: 'system' },
        ],
      },
    }),
    defineField({
      name: 'targetId',
      title: 'Target ID',
      type: 'string',
      description: 'ID of the target object (startup, investor, etc.)',
    }),
    defineField({
      name: 'targetReference',
      title: 'Target Reference',
      type: 'reference',
      to: [
        { type: 'userProfile' },
        { type: 'startup' },
        { type: 'investorProfile' },
        { type: 'pitch' },
        { type: 'event' },
        { type: 'resource' },
      ],
      description: 'Direct reference to the target object if available',
    }),

    // Interaction Details
    defineField({
      name: 'metadata',
      title: 'Interaction Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'searchQuery',
          title: 'Search Query',
          type: 'string',
          description: 'Search terms used (for search interactions)',
        }),
        defineField({
          name: 'filters',
          title: 'Applied Filters',
          type: 'object',
          description: 'Filters applied during search/browse',
        }),
        defineField({
          name: 'rating',
          title: 'Rating Given',
          type: 'number',
          description: 'Rating value (for rating interactions)',
        }),
        defineField({
          name: 'duration',
          title: 'Duration (seconds)',
          type: 'number',
          description: 'Time spent on page/interaction',
        }),
        defineField({
          name: 'source',
          title: 'Traffic Source',
          type: 'string',
          options: {
            list: [
              { title: 'Direct', value: 'direct' },
              { title: 'Search', value: 'search' },
              { title: 'Social Media', value: 'social' },
              { title: 'Email', value: 'email' },
              { title: 'Referral', value: 'referral' },
              { title: 'Internal Link', value: 'internal' },
            ],
          },
        }),
        defineField({
          name: 'device',
          title: 'Device Type',
          type: 'string',
          options: {
            list: [
              { title: 'Desktop', value: 'desktop' },
              { title: 'Mobile', value: 'mobile' },
              { title: 'Tablet', value: 'tablet' },
            ],
          },
        }),
        defineField({
          name: 'browser',
          title: 'Browser',
          type: 'string',
        }),
        defineField({
          name: 'location',
          title: 'Geographic Location',
          type: 'object',
          fields: [
            defineField({
              name: 'country',
              title: 'Country',
              type: 'string',
            }),
            defineField({
              name: 'city',
              title: 'City',
              type: 'string',
            }),
            defineField({
              name: 'timezone',
              title: 'Timezone',
              type: 'string',
            }),
          ],
        }),
      ],
    }),

    // Outcome and Success Metrics
    defineField({
      name: 'outcome',
      title: 'Interaction Outcome',
      type: 'string',
      options: {
        list: [
          { title: 'Completed', value: 'completed' },
          { title: 'Abandoned', value: 'abandoned' },
          { title: 'Converted', value: 'converted' },
          { title: 'Bounced', value: 'bounced' },
          { title: 'Error', value: 'error' },
        ],
      },
    }),
    defineField({
      name: 'conversionValue',
      title: 'Conversion Value',
      type: 'number',
      description: 'Numeric value representing the conversion (e.g., connection made = 1)',
    }),
    defineField({
      name: 'followUpAction',
      title: 'Follow-up Action Taken',
      type: 'string',
      description: 'What action did the user take after this interaction?',
    }),

    // Session Information
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      description: 'Unique session identifier',
    }),
    defineField({
      name: 'pageUrl',
      title: 'Page URL',
      type: 'string',
      description: 'URL where the interaction occurred',
    }),
    defineField({
      name: 'referrerUrl',
      title: 'Referrer URL',
      type: 'string',
      description: 'Previous page URL',
    }),

    // AI/ML Features
    defineField({
      name: 'aiScore',
      title: 'AI Relevance Score',
      type: 'number',
      description: 'AI-calculated relevance score for this interaction',
    }),
    defineField({
      name: 'recommendationId',
      title: 'Recommendation ID',
      type: 'string',
      description: 'ID of the recommendation that led to this interaction',
    }),
    defineField({
      name: 'experimentId',
      title: 'A/B Test Experiment ID',
      type: 'string',
      description: 'ID of the A/B test experiment this interaction is part of',
    }),

    // Timestamps
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
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
  ],

  preview: {
    select: {
      userTitle: 'user.userId',
      interactionType: 'interactionType',
      targetType: 'targetType',
      timestamp: 'timestamp',
      outcome: 'outcome',
    },
    prepare(selection) {
      const { userTitle, interactionType, targetType, timestamp, outcome } = selection;
      const date = new Date(timestamp).toLocaleDateString();
      const outcomeIcon = outcome === 'completed' ? '✅' : outcome === 'converted' ? '🎯' : '⏳';
      
      return {
        title: `${userTitle} • ${interactionType}`,
        subtitle: `${targetType} • ${date} ${outcomeIcon}`,
      };
    },
  },

  orderings: [
    {
      title: 'Most Recent',
      name: 'timestampDesc',
      by: [{ field: 'timestamp', direction: 'desc' }],
    },
    {
      title: 'By User',
      name: 'userAsc',
      by: [
        { field: 'user.userId', direction: 'asc' },
        { field: 'timestamp', direction: 'desc' }
      ],
    },
    {
      title: 'By Interaction Type',
      name: 'interactionTypeAsc',
      by: [
        { field: 'interactionType', direction: 'asc' },
        { field: 'timestamp', direction: 'desc' }
      ],
    },
    {
      title: 'High Value Interactions',
      name: 'conversionValueDesc',
      by: [
        { field: 'conversionValue', direction: 'desc' },
        { field: 'timestamp', direction: 'desc' }
      ],
    },
  ],
});
