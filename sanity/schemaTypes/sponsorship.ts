import { defineField, defineType } from 'sanity'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'sponsorship',
  title: 'Sponsorship',
  type: 'document',
  icon: CurrencyDollarIcon,
  fields: [
    // Core Sponsorship Information
    defineField({
      name: 'sponsor',
      title: 'Sponsor',
      type: 'reference',
      to: [{ type: 'sponsor' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sponsorshipType',
      title: 'Sponsorship Type',
      type: 'string',
      options: {
        list: [
          { title: 'Platform Sponsorship', value: 'platform' },
          { title: 'Event Sponsorship', value: 'event' },
          { title: 'Startup Sponsorship', value: 'startup' },
          { title: 'Content Sponsorship', value: 'content' },
          { title: 'Newsletter Sponsorship', value: 'newsletter' },
          { title: 'Demo Day Sponsorship', value: 'demo-day' },
          { title: 'Award Sponsorship', value: 'award' },
          { title: 'Custom Sponsorship', value: 'custom' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Sponsorship Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.max(1000),
    }),

    // Sponsorship Target
    defineField({
      name: 'targetType',
      title: 'Target Type',
      type: 'string',
      options: {
        list: [
          { title: 'Platform Wide', value: 'platform' },
          { title: 'Specific Event', value: 'event' },
          { title: 'Specific Startup', value: 'startup' },
          { title: 'Content/Article', value: 'content' },
          { title: 'Newsletter Edition', value: 'newsletter' },
          { title: 'User Profile', value: 'profile' },
          { title: 'Forum/Discussion', value: 'forum' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetEvent',
      title: 'Target Event',
      type: 'reference',
      to: [{ type: 'event' }],
      hidden: ({ parent }) => parent?.targetType !== 'event',
    }),
    defineField({
      name: 'targetStartup',
      title: 'Target Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      hidden: ({ parent }) => parent?.targetType !== 'startup',
    }),
    defineField({
      name: 'targetContent',
      title: 'Target Content',
      type: 'reference',
      to: [{ type: 'resource' }],
      hidden: ({ parent }) => parent?.targetType !== 'content',
    }),
    defineField({
      name: 'targetProfile',
      title: 'Target Profile',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      hidden: ({ parent }) => parent?.targetType !== 'profile',
    }),
    defineField({
      name: 'targetForum',
      title: 'Target Forum',
      type: 'reference',
      to: [{ type: 'discussionForum' }],
      hidden: ({ parent }) => parent?.targetType !== 'forum',
    }),

    // Sponsorship Details
    defineField({
      name: 'placement',
      title: 'Placement Details',
      type: 'object',
      fields: [
        defineField({
          name: 'position',
          title: 'Position',
          type: 'string',
          options: {
            list: [
              { title: 'Header Banner', value: 'header-banner' },
              { title: 'Sidebar Banner', value: 'sidebar-banner' },
              { title: 'Footer Banner', value: 'footer-banner' },
              { title: 'In-Content Banner', value: 'in-content-banner' },
              { title: 'Logo Placement', value: 'logo-placement' },
              { title: 'Sponsored Content', value: 'sponsored-content' },
              { title: 'Newsletter Mention', value: 'newsletter-mention' },
              { title: 'Event Branding', value: 'event-branding' },
              { title: 'Profile Badge', value: 'profile-badge' },
            ],
          },
        }),
        defineField({
          name: 'size',
          title: 'Banner Size',
          type: 'string',
          options: {
            list: [
              { title: 'Small (300x100)', value: 'small' },
              { title: 'Medium (728x90)', value: 'medium' },
              { title: 'Large (970x250)', value: 'large' },
              { title: 'Square (300x300)', value: 'square' },
              { title: 'Custom', value: 'custom' },
            ],
          },
        }),
        defineField({
          name: 'customDimensions',
          title: 'Custom Dimensions',
          type: 'string',
          description: 'e.g., "400x200"',
          hidden: ({ parent }) => parent?.size !== 'custom',
        }),
        defineField({
          name: 'priority',
          title: 'Display Priority',
          type: 'number',
          description: 'Higher numbers display first',
          initialValue: 1,
        }),
      ],
    }),

    // Creative Assets
    defineField({
      name: 'creativeAssets',
      title: 'Creative Assets',
      type: 'object',
      fields: [
        defineField({
          name: 'bannerImage',
          title: 'Banner Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'logo',
          title: 'Logo',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'clickUrl',
          title: 'Click URL',
          type: 'url',
          description: 'Where users go when they click the sponsorship',
        }),
        defineField({
          name: 'altText',
          title: 'Alt Text',
          type: 'string',
          description: 'Alt text for accessibility',
        }),
        defineField({
          name: 'callToAction',
          title: 'Call to Action',
          type: 'string',
          description: 'Text for CTA button (e.g., "Learn More", "Get Started")',
        }),
        defineField({
          name: 'sponsoredContentText',
          title: 'Sponsored Content Text',
          type: 'text',
          description: 'Text content for sponsored posts/articles',
        }),
      ],
    }),

    // Targeting and Audience
    defineField({
      name: 'targeting',
      title: 'Audience Targeting',
      type: 'object',
      fields: [
        defineField({
          name: 'userRoles',
          title: 'Target User Roles',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'All Users', value: 'all' },
              { title: 'Founders', value: 'founders' },
              { title: 'Investors', value: 'investors' },
              { title: 'Mentors', value: 'mentors' },
              { title: 'Alumni', value: 'alumni' },
            ],
          },
        }),
        defineField({
          name: 'industries',
          title: 'Target Industries',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'AI/ML', value: 'ai-ml' },
              { title: 'Fintech', value: 'fintech' },
              { title: 'Healthcare', value: 'healthcare' },
              { title: 'Enterprise', value: 'enterprise' },
              { title: 'Consumer', value: 'consumer' },
              { title: 'E-commerce', value: 'ecommerce' },
              { title: 'Developer Tools', value: 'developer-tools' },
            ],
          },
        }),
        defineField({
          name: 'stages',
          title: 'Target Startup Stages',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'Pre-seed', value: 'pre-seed' },
              { title: 'Seed', value: 'seed' },
              { title: 'Series A', value: 'series-a' },
              { title: 'Series B', value: 'series-b' },
              { title: 'Series C+', value: 'series-c-plus' },
              { title: 'Growth', value: 'growth' },
            ],
          },
        }),
        defineField({
          name: 'geographies',
          title: 'Target Geographies',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: [
              { title: 'Global', value: 'global' },
              { title: 'North America', value: 'north-america' },
              { title: 'United States', value: 'us' },
              { title: 'Canada', value: 'canada' },
              { title: 'Europe', value: 'europe' },
              { title: 'Asia Pacific', value: 'asia-pacific' },
            ],
          },
        }),
      ],
    }),

    // Campaign Details
    defineField({
      name: 'campaign',
      title: 'Campaign Details',
      type: 'object',
      fields: [
        defineField({
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'budget',
          title: 'Campaign Budget ($)',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'impressionGoal',
          title: 'Impression Goal',
          type: 'number',
          description: 'Target number of impressions',
        }),
        defineField({
          name: 'clickGoal',
          title: 'Click Goal',
          type: 'number',
          description: 'Target number of clicks',
        }),
        defineField({
          name: 'conversionGoal',
          title: 'Conversion Goal',
          type: 'number',
          description: 'Target number of conversions',
        }),
      ],
    }),

    // Performance Tracking
    defineField({
      name: 'performance',
      title: 'Performance Metrics',
      type: 'object',
      fields: [
        defineField({
          name: 'impressions',
          title: 'Total Impressions',
          type: 'number',
          initialValue: 0,
        }),
        defineField({
          name: 'clicks',
          title: 'Total Clicks',
          type: 'number',
          initialValue: 0,
        }),
        defineField({
          name: 'conversions',
          title: 'Total Conversions',
          type: 'number',
          initialValue: 0,
        }),
        defineField({
          name: 'ctr',
          title: 'Click-through Rate (%)',
          type: 'number',
          description: 'Calculated CTR percentage',
        }),
        defineField({
          name: 'conversionRate',
          title: 'Conversion Rate (%)',
          type: 'number',
          description: 'Calculated conversion rate percentage',
        }),
        defineField({
          name: 'cost',
          title: 'Total Cost ($)',
          type: 'number',
          initialValue: 0,
        }),
        defineField({
          name: 'cpm',
          title: 'Cost Per Mille (CPM)',
          type: 'number',
          description: 'Cost per 1000 impressions',
        }),
        defineField({
          name: 'cpc',
          title: 'Cost Per Click (CPC)',
          type: 'number',
          description: 'Average cost per click',
        }),
        defineField({
          name: 'lastUpdated',
          title: 'Metrics Last Updated',
          type: 'datetime',
        }),
      ],
    }),

    // Status and Approval
    defineField({
      name: 'status',
      title: 'Sponsorship Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Pending Approval', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Active', value: 'active' },
          { title: 'Paused', value: 'paused' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'approvedBy',
      title: 'Approved By',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      description: 'Team member who approved this sponsorship',
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
    }),

    // Notes and Communication
    defineField({
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      description: 'Internal notes about this sponsorship',
    }),
    defineField({
      name: 'sponsorNotes',
      title: 'Sponsor Notes',
      type: 'text',
      description: 'Notes from the sponsor about requirements/preferences',
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
      sponsorName: 'sponsor.companyName',
      sponsorshipType: 'sponsorshipType',
      status: 'status',
      budget: 'campaign.budget',
      startDate: 'campaign.startDate',
      endDate: 'campaign.endDate',
    },
    prepare(selection) {
      const { title, sponsorName, sponsorshipType, status, budget, startDate, endDate } = selection;
      const statusIcon = status === 'active' ? '🟢' : status === 'completed' ? '✅' : status === 'paused' ? '⏸️' : '⏳';
      const budgetDisplay = budget ? `$${budget.toLocaleString()}` : '';
      const dateRange = startDate && endDate ? 
        `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : '';
      
      return {
        title: `${title} ${statusIcon}`,
        subtitle: `${sponsorName} • ${sponsorshipType} • ${budgetDisplay} • ${dateRange}`,
      };
    },
  },

  orderings: [
    {
      title: 'Active First',
      name: 'statusAsc',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'campaign.startDate', direction: 'desc' }
      ],
    },
    {
      title: 'By Budget (Highest First)',
      name: 'budgetDesc',
      by: [{ field: 'campaign.budget', direction: 'desc' }],
    },
    {
      title: 'By Start Date',
      name: 'startDateDesc',
      by: [{ field: 'campaign.startDate', direction: 'desc' }],
    },
    {
      title: 'By Performance (CTR)',
      name: 'performanceDesc',
      by: [{ field: 'performance.ctr', direction: 'desc' }],
    },
  ],
});
