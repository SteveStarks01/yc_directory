import { defineField, defineType } from 'sanity'
import { LightBulbIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'recommendation',
  title: 'AI Recommendation',
  type: 'document',
  icon: LightBulbIcon,
  fields: [
    // Core Information
    defineField({
      name: 'user',
      title: 'Target User',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'recommendationType',
      title: 'Recommendation Type',
      type: 'string',
      options: {
        list: [
          { title: 'Startup Match', value: 'startup-match' },
          { title: 'Investor Match', value: 'investor-match' },
          { title: 'Event Suggestion', value: 'event-suggestion' },
          { title: 'Resource Suggestion', value: 'resource-suggestion' },
          { title: 'Connection Suggestion', value: 'connection-suggestion' },
          { title: 'Content Suggestion', value: 'content-suggestion' },
          { title: 'Action Suggestion', value: 'action-suggestion' },
          { title: 'Profile Improvement', value: 'profile-improvement' },
          { title: 'Market Opportunity', value: 'market-opportunity' },
          { title: 'Learning Suggestion', value: 'learning-suggestion' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority Level',
      type: 'string',
      options: {
        list: [
          { title: 'Critical', value: 'critical' },
          { title: 'High', value: 'high' },
          { title: 'Medium', value: 'medium' },
          { title: 'Low', value: 'low' },
          { title: 'Info', value: 'info' },
        ],
      },
      initialValue: 'medium',
    }),

    // Recommendation Content
    defineField({
      name: 'title',
      title: 'Recommendation Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'actionText',
      title: 'Call-to-Action Text',
      type: 'string',
      description: 'Text for the action button (e.g., "View Profile", "Connect Now")',
    }),
    defineField({
      name: 'actionUrl',
      title: 'Action URL',
      type: 'string',
      description: 'URL to navigate to when user clicks the recommendation',
    }),

    // Target References
    defineField({
      name: 'targetStartup',
      title: 'Recommended Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      description: 'If recommending a startup',
    }),
    defineField({
      name: 'targetInvestor',
      title: 'Recommended Investor',
      type: 'reference',
      to: [{ type: 'investorProfile' }],
      description: 'If recommending an investor',
    }),
    defineField({
      name: 'targetEvent',
      title: 'Recommended Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'If recommending an event',
    }),
    defineField({
      name: 'targetResource',
      title: 'Recommended Resource',
      type: 'reference',
      to: [{ type: 'resource' }],
      description: 'If recommending a resource',
    }),
    defineField({
      name: 'targetUser',
      title: 'Recommended User',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      description: 'If recommending a connection with another user',
    }),

    // AI Scoring and Reasoning
    defineField({
      name: 'relevanceScore',
      title: 'Relevance Score',
      type: 'number',
      description: 'AI-calculated relevance score (0-100)',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'confidence',
      title: 'Confidence Level',
      type: 'number',
      description: 'AI confidence in this recommendation (0-1)',
      validation: (Rule) => Rule.min(0).max(1),
    }),
    defineField({
      name: 'reasoning',
      title: 'AI Reasoning',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Reasons why this recommendation was made',
    }),
    defineField({
      name: 'basedOn',
      title: 'Based On',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'User Profile', value: 'user-profile' },
          { title: 'Past Interactions', value: 'past-interactions' },
          { title: 'Similar Users', value: 'similar-users' },
          { title: 'Industry Trends', value: 'industry-trends' },
          { title: 'Geographic Location', value: 'geographic-location' },
          { title: 'Investment History', value: 'investment-history' },
          { title: 'Network Connections', value: 'network-connections' },
          { title: 'Content Preferences', value: 'content-preferences' },
          { title: 'Timing Patterns', value: 'timing-patterns' },
          { title: 'Success Patterns', value: 'success-patterns' },
        ],
      },
      description: 'What data was used to generate this recommendation',
    }),

    // Personalization
    defineField({
      name: 'personalizationFactors',
      title: 'Personalization Factors',
      type: 'object',
      fields: [
        defineField({
          name: 'userRole',
          title: 'User Role Weight',
          type: 'number',
          description: 'How much user role influenced this recommendation',
        }),
        defineField({
          name: 'userInterests',
          title: 'User Interests Weight',
          type: 'number',
          description: 'How much user interests influenced this recommendation',
        }),
        defineField({
          name: 'userBehavior',
          title: 'User Behavior Weight',
          type: 'number',
          description: 'How much past behavior influenced this recommendation',
        }),
        defineField({
          name: 'contextualFactors',
          title: 'Contextual Factors Weight',
          type: 'number',
          description: 'How much current context influenced this recommendation',
        }),
        defineField({
          name: 'socialFactors',
          title: 'Social Factors Weight',
          type: 'number',
          description: 'How much social/network factors influenced this recommendation',
        }),
      ],
    }),

    // Timing and Context
    defineField({
      name: 'timeContext',
      title: 'Time Context',
      type: 'string',
      options: {
        list: [
          { title: 'Immediate', value: 'immediate' },
          { title: 'This Week', value: 'this-week' },
          { title: 'This Month', value: 'this-month' },
          { title: 'This Quarter', value: 'this-quarter' },
          { title: 'Long Term', value: 'long-term' },
          { title: 'Seasonal', value: 'seasonal' },
          { title: 'Event-Based', value: 'event-based' },
        ],
      },
    }),
    defineField({
      name: 'contextTags',
      title: 'Context Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags describing the context of this recommendation',
    }),

    // User Interaction
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Viewed', value: 'viewed' },
          { title: 'Clicked', value: 'clicked' },
          { title: 'Acted Upon', value: 'acted-upon' },
          { title: 'Dismissed', value: 'dismissed' },
          { title: 'Expired', value: 'expired' },
          { title: 'Hidden', value: 'hidden' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'userFeedback',
      title: 'User Feedback',
      type: 'string',
      options: {
        list: [
          { title: 'Very Helpful', value: 'very-helpful' },
          { title: 'Helpful', value: 'helpful' },
          { title: 'Somewhat Helpful', value: 'somewhat-helpful' },
          { title: 'Not Helpful', value: 'not-helpful' },
          { title: 'Irrelevant', value: 'irrelevant' },
          { title: 'No Feedback', value: 'no-feedback' },
        ],
      },
      initialValue: 'no-feedback',
    }),
    defineField({
      name: 'feedbackNotes',
      title: 'Feedback Notes',
      type: 'text',
      description: 'Additional feedback from the user',
    }),

    // Performance Tracking
    defineField({
      name: 'impressions',
      title: 'Impressions',
      type: 'number',
      description: 'Number of times this recommendation was shown',
      initialValue: 0,
    }),
    defineField({
      name: 'clicks',
      title: 'Clicks',
      type: 'number',
      description: 'Number of times this recommendation was clicked',
      initialValue: 0,
    }),
    defineField({
      name: 'conversions',
      title: 'Conversions',
      type: 'number',
      description: 'Number of times this recommendation led to desired action',
      initialValue: 0,
    }),
    defineField({
      name: 'clickThroughRate',
      title: 'Click Through Rate',
      type: 'number',
      description: 'CTR calculated from clicks/impressions',
    }),
    defineField({
      name: 'conversionRate',
      title: 'Conversion Rate',
      type: 'number',
      description: 'Conversion rate calculated from conversions/clicks',
    }),

    // ML Model Information
    defineField({
      name: 'modelVersion',
      title: 'Model Version',
      type: 'string',
      description: 'Version of the recommendation model used',
    }),
    defineField({
      name: 'algorithmType',
      title: 'Algorithm Type',
      type: 'string',
      options: {
        list: [
          { title: 'Collaborative Filtering', value: 'collaborative-filtering' },
          { title: 'Content-Based', value: 'content-based' },
          { title: 'Hybrid', value: 'hybrid' },
          { title: 'Deep Learning', value: 'deep-learning' },
          { title: 'Rule-Based', value: 'rule-based' },
          { title: 'Matrix Factorization', value: 'matrix-factorization' },
        ],
      },
    }),
    defineField({
      name: 'experimentId',
      title: 'A/B Test Experiment ID',
      type: 'string',
      description: 'ID of the A/B test this recommendation is part of',
    }),

    // Lifecycle
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'When this recommendation expires and should be removed',
    }),
    defineField({
      name: 'viewedAt',
      title: 'Viewed At',
      type: 'datetime',
      description: 'When the user first viewed this recommendation',
    }),
    defineField({
      name: 'clickedAt',
      title: 'Clicked At',
      type: 'datetime',
      description: 'When the user clicked on this recommendation',
    }),
    defineField({
      name: 'actedUponAt',
      title: 'Acted Upon At',
      type: 'datetime',
      description: 'When the user took the recommended action',
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
      title: 'title',
      userName: 'user.userId',
      type: 'recommendationType',
      priority: 'priority',
      status: 'status',
      relevanceScore: 'relevanceScore',
    },
    prepare(selection) {
      const { title, userName, type, priority, status, relevanceScore } = selection;
      const priorityIcon = priority === 'critical' ? '🔴' : priority === 'high' ? '🟠' : priority === 'medium' ? '🟡' : '🟢';
      const score = relevanceScore ? `${Math.round(relevanceScore)}%` : '';
      
      return {
        title: `${title} ${priorityIcon}`,
        subtitle: `${userName} • ${type} • ${status} ${score}`,
      };
    },
  },

  orderings: [
    {
      title: 'Highest Relevance',
      name: 'relevanceDesc',
      by: [{ field: 'relevanceScore', direction: 'desc' }],
    },
    {
      title: 'Most Recent',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'By Priority',
      name: 'priorityDesc',
      by: [
        { field: 'priority', direction: 'asc' },
        { field: 'relevanceScore', direction: 'desc' }
      ],
    },
    {
      title: 'Best Performance',
      name: 'performanceDesc',
      by: [{ field: 'conversionRate', direction: 'desc' }],
    },
  ],
});
