import { defineField, defineType } from 'sanity'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

export const startup = defineType({
  name: 'startup',
  title: 'Startup Company',
  type: 'document',
  icon: BuildingOfficeIcon,
  fields: [
    // Basic Company Information
    defineField({
      name: 'name',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'One-line description of what the company does',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'description',
      title: 'Company Description',
      type: 'text',
      description: 'Detailed description of the company and its mission',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'logo',
      title: 'Company Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Hero image for the company profile',
      options: {
        hotspot: true,
      },
    }),

    // Company Details
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      options: {
        list: [
          { title: 'AI/Machine Learning', value: 'ai-ml' },
          { title: 'B2B Software', value: 'b2b-software' },
          { title: 'Consumer', value: 'consumer' },
          { title: 'Developer Tools', value: 'developer-tools' },
          { title: 'E-commerce', value: 'ecommerce' },
          { title: 'Education', value: 'education' },
          { title: 'Enterprise Software', value: 'enterprise' },
          { title: 'Fintech', value: 'fintech' },
          { title: 'Gaming', value: 'gaming' },
          { title: 'Healthcare', value: 'healthcare' },
          { title: 'Hardware', value: 'hardware' },
          { title: 'Infrastructure', value: 'infrastructure' },
          { title: 'Marketplace', value: 'marketplace' },
          { title: 'Media', value: 'media' },
          { title: 'Mobile', value: 'mobile' },
          { title: 'Real Estate', value: 'real-estate' },
          { title: 'Robotics', value: 'robotics' },
          { title: 'SaaS', value: 'saas' },
          { title: 'Social', value: 'social' },
          { title: 'Transportation', value: 'transportation' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stage',
      title: 'Company Stage',
      type: 'string',
      options: {
        list: [
          { title: 'Idea Stage', value: 'idea' },
          { title: 'Pre-Seed', value: 'pre-seed' },
          { title: 'Seed', value: 'seed' },
          { title: 'Series A', value: 'series-a' },
          { title: 'Series B', value: 'series-b' },
          { title: 'Series C+', value: 'series-c-plus' },
          { title: 'IPO', value: 'ipo' },
          { title: 'Acquired', value: 'acquired' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'foundedYear',
      title: 'Founded Year',
      type: 'number',
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear()),
    }),
    defineField({
      name: 'teamSize',
      title: 'Team Size',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(10000),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
        }),
        defineField({
          name: 'state',
          title: 'State/Province',
          type: 'string',
        }),
        defineField({
          name: 'country',
          title: 'Country',
          type: 'string',
        }),
        defineField({
          name: 'isRemote',
          title: 'Remote Company',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),

    // Founders and Team
    defineField({
      name: 'founders',
      title: 'Founders',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'userProfile' }],
        },
      ],
      validation: (Rule) => Rule.min(1).max(10),
    }),
    defineField({
      name: 'teamMembers',
      title: 'Team Members',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'userProfile' }],
        },
      ],
    }),

    // Business Model and Metrics
    defineField({
      name: 'businessModel',
      title: 'Business Model',
      type: 'string',
      options: {
        list: [
          { title: 'B2B SaaS', value: 'b2b-saas' },
          { title: 'B2C Subscription', value: 'b2c-subscription' },
          { title: 'Marketplace', value: 'marketplace' },
          { title: 'E-commerce', value: 'ecommerce' },
          { title: 'Advertising', value: 'advertising' },
          { title: 'Transaction Fees', value: 'transaction-fees' },
          { title: 'Freemium', value: 'freemium' },
          { title: 'Enterprise License', value: 'enterprise-license' },
          { title: 'Hardware Sales', value: 'hardware-sales' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'revenueModel',
      title: 'Revenue Model',
      type: 'text',
      description: 'How the company makes money',
    }),
    defineField({
      name: 'targetMarket',
      title: 'Target Market',
      type: 'text',
      description: 'Who are the primary customers',
    }),

    // Funding Information
    defineField({
      name: 'totalFunding',
      title: 'Total Funding Raised',
      type: 'number',
      description: 'Total funding in USD',
    }),
    defineField({
      name: 'lastFundingDate',
      title: 'Last Funding Date',
      type: 'date',
    }),
    defineField({
      name: 'valuation',
      title: 'Current Valuation',
      type: 'number',
      description: 'Current valuation in USD',
    }),
    defineField({
      name: 'investors',
      title: 'Investors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Investor Name',
              type: 'string',
            }),
            defineField({
              name: 'type',
              title: 'Investor Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Angel Investor', value: 'angel' },
                  { title: 'Venture Capital', value: 'vc' },
                  { title: 'Corporate VC', value: 'corporate-vc' },
                  { title: 'Private Equity', value: 'pe' },
                  { title: 'Government Grant', value: 'government' },
                  { title: 'Crowdfunding', value: 'crowdfunding' },
                  { title: 'Other', value: 'other' },
                ],
              },
            }),
            defineField({
              name: 'round',
              title: 'Funding Round',
              type: 'string',
            }),
            defineField({
              name: 'amount',
              title: 'Investment Amount',
              type: 'number',
            }),
            defineField({
              name: 'date',
              title: 'Investment Date',
              type: 'date',
            }),
          ],
        },
      ],
    }),

    // Product and Technology
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'productDemo',
      title: 'Product Demo URL',
      type: 'url',
      description: 'Link to product demo or video',
    }),
    defineField({
      name: 'techStack',
      title: 'Technology Stack',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),

    // Social Links
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        defineField({
          name: 'twitter',
          title: 'Twitter',
          type: 'url',
        }),
        defineField({
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
        }),
        defineField({
          name: 'github',
          title: 'GitHub',
          type: 'url',
        }),
        defineField({
          name: 'crunchbase',
          title: 'Crunchbase',
          type: 'url',
        }),
        defineField({
          name: 'angellist',
          title: 'AngelList',
          type: 'url',
        }),
      ],
    }),

    // Status and Visibility
    defineField({
      name: 'status',
      title: 'Company Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Stealth', value: 'stealth' },
          { title: 'Acquired', value: 'acquired' },
          { title: 'Shut Down', value: 'shutdown' },
          { title: 'On Hold', value: 'on-hold' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'visibility',
      title: 'Profile Visibility',
      type: 'string',
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Community Only', value: 'community' },
          { title: 'Investors Only', value: 'investors' },
          { title: 'Private', value: 'private' },
        ],
      },
      initialValue: 'public',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Startup',
      type: 'boolean',
      description: 'Show this startup in featured sections',
      initialValue: false,
    }),
    defineField({
      name: 'verified',
      title: 'Verified Company',
      type: 'boolean',
      description: 'Company has been verified by administrators',
      initialValue: false,
    }),

    // Metrics and Analytics
    defineField({
      name: 'metrics',
      title: 'Company Metrics',
      type: 'object',
      fields: [
        defineField({
          name: 'monthlyRevenue',
          title: 'Monthly Recurring Revenue',
          type: 'number',
        }),
        defineField({
          name: 'monthlyActiveUsers',
          title: 'Monthly Active Users',
          type: 'number',
        }),
        defineField({
          name: 'growthRate',
          title: 'Monthly Growth Rate (%)',
          type: 'number',
        }),
        defineField({
          name: 'burnRate',
          title: 'Monthly Burn Rate',
          type: 'number',
        }),
        defineField({
          name: 'runway',
          title: 'Runway (months)',
          type: 'number',
        }),
      ],
    }),

    // Legacy fields for backward compatibility
    defineField({
      name: 'title',
      title: 'Legacy Title',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'author',
      title: 'Legacy Author',
      type: 'reference',
      to: [{ type: 'author' }],
      hidden: true,
    }),
    defineField({
      name: 'views',
      title: 'Profile Views',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'category',
      title: 'Legacy Category',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'image',
      title: 'Legacy Image',
      type: 'url',
      hidden: true,
    }),
    defineField({
      name: 'pitch',
      title: 'Pitch Content',
      type: 'markdown',
      description: 'Detailed pitch or business plan',
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
      title: 'name',
      subtitle: 'tagline',
      media: 'logo',
      stage: 'stage',
      industry: 'industry',
    },
    prepare(selection) {
      const { title, subtitle, media, stage, industry } = selection;
      return {
        title,
        subtitle: `${stage} • ${industry} • ${subtitle}`,
        media,
      };
    },
  },

  orderings: [
    {
      title: 'Company Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
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
      title: 'Funding Stage',
      name: 'stageAsc',
      by: [{ field: 'stage', direction: 'asc' }],
    },
  ],
});
