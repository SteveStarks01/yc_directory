import { defineField, defineType } from 'sanity'
import { PresentationChartLineIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'pitch',
  title: 'Startup Pitch',
  type: 'document',
  icon: PresentationChartLineIcon,
  fields: [
    // Basic Information
    defineField({
      name: 'title',
      title: 'Pitch Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startup',
      title: 'Startup Company',
      type: 'reference',
      to: [{ type: 'startup' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'presenter',
      title: 'Primary Presenter',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'additionalPresenters',
      title: 'Additional Presenters',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'userProfile' }],
        },
      ],
    }),

    // Pitch Content
    defineField({
      name: 'description',
      title: 'Pitch Description',
      type: 'text',
      description: 'Brief description of what this pitch covers',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'problem',
      title: 'Problem Statement',
      type: 'text',
      description: 'What problem does your startup solve?',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'solution',
      title: 'Solution',
      type: 'text',
      description: 'How does your startup solve this problem?',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'marketSize',
      title: 'Market Size & Opportunity',
      type: 'text',
      description: 'Size of the market and opportunity',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'businessModel',
      title: 'Business Model',
      type: 'text',
      description: 'How do you make money?',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'traction',
      title: 'Traction & Metrics',
      type: 'text',
      description: 'Key metrics and traction to date',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'competition',
      title: 'Competition & Differentiation',
      type: 'text',
      description: 'Who are your competitors and how are you different?',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'askAmount',
      title: 'Funding Ask Amount',
      type: 'number',
      description: 'How much funding are you seeking? (USD)',
    }),
    defineField({
      name: 'useOfFunds',
      title: 'Use of Funds',
      type: 'text',
      description: 'How will you use the funding?',
      validation: (Rule) => Rule.max(1000),
    }),

    // Media Assets
    defineField({
      name: 'pitchVideo',
      title: 'Pitch Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description: 'Upload your pitch video (recommended: 3-5 minutes)',
    }),
    defineField({
      name: 'pitchVideoUrl',
      title: 'Pitch Video URL',
      type: 'url',
      description: 'Alternative: Link to video on YouTube, Vimeo, etc.',
    }),
    defineField({
      name: 'pitchDeck',
      title: 'Pitch Deck',
      type: 'file',
      options: {
        accept: '.pdf,.ppt,.pptx',
      },
      description: 'Upload your pitch deck (PDF or PowerPoint)',
    }),
    defineField({
      name: 'demoVideo',
      title: 'Product Demo Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description: 'Optional: Product demonstration video',
    }),
    defineField({
      name: 'demoUrl',
      title: 'Live Demo URL',
      type: 'url',
      description: 'Link to live product demo or prototype',
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Pitch Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Thumbnail image for the pitch',
    }),

    // Event Association
    defineField({
      name: 'event',
      title: 'Associated Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'Demo day or event where this pitch was/will be presented',
    }),
    defineField({
      name: 'pitchOrder',
      title: 'Pitch Order',
      type: 'number',
      description: 'Order of presentation in the event (if applicable)',
    }),
    defineField({
      name: 'presentationDate',
      title: 'Presentation Date',
      type: 'datetime',
      description: 'When was/will this pitch be presented?',
    }),

    // Categories and Tags
    defineField({
      name: 'pitchType',
      title: 'Pitch Type',
      type: 'string',
      options: {
        list: [
          { title: 'Demo Day Pitch', value: 'demo-day' },
          { title: 'Investor Pitch', value: 'investor' },
          { title: 'Competition Entry', value: 'competition' },
          { title: 'Practice Pitch', value: 'practice' },
          { title: 'Product Demo', value: 'product-demo' },
          { title: 'Elevator Pitch', value: 'elevator' },
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
          { title: 'Series B+', value: 'series-b-plus' },
        ],
      },
    }),
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
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Keywords and tags for discovery',
    }),

    // Status and Visibility
    defineField({
      name: 'status',
      title: 'Pitch Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Submitted', value: 'submitted' },
          { title: 'Under Review', value: 'review' },
          { title: 'Approved', value: 'approved' },
          { title: 'Presented', value: 'presented' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Community Only', value: 'community' },
          { title: 'Investors Only', value: 'investors' },
          { title: 'Event Attendees Only', value: 'event-attendees' },
          { title: 'Private', value: 'private' },
        ],
      },
      initialValue: 'community',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Pitch',
      type: 'boolean',
      description: 'Show this pitch in featured sections',
      initialValue: false,
    }),

    // Analytics and Engagement
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'likeCount',
      title: 'Like Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'commentCount',
      title: 'Comment Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'averageRating',
      title: 'Average Rating',
      type: 'number',
      readOnly: true,
      description: 'Average rating from 1-5 stars',
    }),
    defineField({
      name: 'ratingCount',
      title: 'Rating Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
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
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'startup.name',
      media: 'thumbnailImage',
      status: 'status',
      pitchType: 'pitchType',
    },
    prepare(selection) {
      const { title, subtitle, media, status, pitchType } = selection;
      return {
        title,
        subtitle: `${subtitle} • ${pitchType} • ${status}`,
        media,
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
      title: 'Presentation Date',
      name: 'presentationDateDesc',
      by: [{ field: 'presentationDate', direction: 'desc' }],
    },
    {
      title: 'Most Viewed',
      name: 'viewCountDesc',
      by: [{ field: 'viewCount', direction: 'desc' }],
    },
    {
      title: 'Highest Rated',
      name: 'ratingDesc',
      by: [{ field: 'averageRating', direction: 'desc' }],
    },
  ],
});
