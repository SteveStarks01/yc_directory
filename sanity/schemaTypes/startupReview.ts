import { defineField, defineType } from 'sanity'
import { StarIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'startupReview',
  title: 'Startup Review',
  type: 'document',
  icon: StarIcon,
  fields: [
    // Core Review Information
    defineField({
      name: 'reviewer',
      title: 'Reviewer',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startup',
      title: 'Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewType',
      title: 'Review Type',
      type: 'string',
      options: {
        list: [
          { title: 'General Review', value: 'general' },
          { title: 'Product Review', value: 'product' },
          { title: 'Team Review', value: 'team' },
          { title: 'Investment Review', value: 'investment' },
          { title: 'Partnership Review', value: 'partnership' },
          { title: 'Customer Review', value: 'customer' },
          { title: 'Mentor Review', value: 'mentor' },
          { title: 'Peer Review', value: 'peer' },
        ],
      },
      initialValue: 'general',
      validation: (Rule) => Rule.required(),
    }),

    // Review Content
    defineField({
      name: 'title',
      title: 'Review Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'content',
      title: 'Review Content',
      type: 'text',
      validation: (Rule) => Rule.required().max(2000),
    }),
    defineField({
      name: 'summary',
      title: 'Review Summary',
      type: 'text',
      description: 'Brief summary of the review',
      validation: (Rule) => Rule.max(300),
    }),

    // Ratings
    defineField({
      name: 'overallRating',
      title: 'Overall Rating',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
      description: 'Overall rating from 1-5 stars',
    }),
    defineField({
      name: 'detailedRatings',
      title: 'Detailed Ratings',
      type: 'object',
      fields: [
        defineField({
          name: 'productQuality',
          title: 'Product Quality',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: 'teamQuality',
          title: 'Team Quality',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: 'marketPotential',
          title: 'Market Potential',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: 'execution',
          title: 'Execution',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: 'innovation',
          title: 'Innovation',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: 'traction',
          title: 'Traction',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: 'communication',
          title: 'Communication',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: 'valueForMoney',
          title: 'Value for Money',
          type: 'number',
          validation: (Rule) => Rule.min(1).max(5),
        }),
      ],
    }),

    // Review Context
    defineField({
      name: 'relationship',
      title: 'Relationship to Startup',
      type: 'string',
      options: {
        list: [
          { title: 'Customer', value: 'customer' },
          { title: 'Investor', value: 'investor' },
          { title: 'Partner', value: 'partner' },
          { title: 'Employee', value: 'employee' },
          { title: 'Advisor', value: 'advisor' },
          { title: 'Mentor', value: 'mentor' },
          { title: 'Competitor', value: 'competitor' },
          { title: 'Industry Peer', value: 'peer' },
          { title: 'Community Member', value: 'community' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'experienceDuration',
      title: 'Experience Duration',
      type: 'string',
      options: {
        list: [
          { title: 'Less than 1 month', value: 'less-1-month' },
          { title: '1-3 months', value: '1-3-months' },
          { title: '3-6 months', value: '3-6-months' },
          { title: '6-12 months', value: '6-12-months' },
          { title: '1-2 years', value: '1-2-years' },
          { title: 'More than 2 years', value: 'more-2-years' },
        ],
      },
      description: 'How long have you been working with/following this startup?',
    }),
    defineField({
      name: 'interactionType',
      title: 'Type of Interaction',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Used Product/Service', value: 'product-usage' },
          { title: 'Business Partnership', value: 'partnership' },
          { title: 'Investment Evaluation', value: 'investment' },
          { title: 'Mentoring/Advising', value: 'mentoring' },
          { title: 'Networking Events', value: 'networking' },
          { title: 'Demo/Presentation', value: 'demo' },
          { title: 'Customer Support', value: 'support' },
          { title: 'Collaboration', value: 'collaboration' },
        ],
      },
    }),

    // Pros and Cons
    defineField({
      name: 'pros',
      title: 'Pros',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What are the positive aspects?',
    }),
    defineField({
      name: 'cons',
      title: 'Cons',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What could be improved?',
    }),
    defineField({
      name: 'recommendations',
      title: 'Recommendations',
      type: 'text',
      description: 'What would you recommend to this startup?',
    }),

    // Verification and Credibility
    defineField({
      name: 'isVerified',
      title: 'Is Verified Review',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this review has been verified by moderators',
    }),
    defineField({
      name: 'verificationMethod',
      title: 'Verification Method',
      type: 'string',
      options: {
        list: [
          { title: 'Email Verification', value: 'email' },
          { title: 'LinkedIn Verification', value: 'linkedin' },
          { title: 'Manual Verification', value: 'manual' },
          { title: 'Transaction Proof', value: 'transaction' },
          { title: 'Reference Check', value: 'reference' },
        ],
      },
      hidden: ({ parent }) => !parent?.isVerified,
    }),
    defineField({
      name: 'credibilityScore',
      title: 'Credibility Score',
      type: 'number',
      description: 'AI-calculated credibility score (0-100)',
      validation: (Rule) => Rule.min(0).max(100),
    }),

    // Review Helpfulness
    defineField({
      name: 'helpfulVotes',
      title: 'Helpful Votes',
      type: 'number',
      initialValue: 0,
      description: 'Number of users who found this review helpful',
    }),
    defineField({
      name: 'notHelpfulVotes',
      title: 'Not Helpful Votes',
      type: 'number',
      initialValue: 0,
      description: 'Number of users who found this review not helpful',
    }),
    defineField({
      name: 'helpfulnessScore',
      title: 'Helpfulness Score',
      type: 'number',
      description: 'Calculated helpfulness score',
    }),

    // Review Visibility and Privacy
    defineField({
      name: 'isPublic',
      title: 'Is Public',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this review is publicly visible',
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Is Anonymous',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this review is anonymous',
    }),
    defineField({
      name: 'allowStartupResponse',
      title: 'Allow Startup Response',
      type: 'boolean',
      initialValue: true,
      description: 'Whether the startup can respond to this review',
    }),

    // Startup Response
    defineField({
      name: 'startupResponse',
      title: 'Startup Response',
      type: 'object',
      fields: [
        defineField({
          name: 'responder',
          title: 'Responder',
          type: 'reference',
          to: [{ type: 'userProfile' }],
          description: 'Startup team member who responded',
        }),
        defineField({
          name: 'response',
          title: 'Response',
          type: 'text',
          validation: (Rule) => Rule.max(1000),
        }),
        defineField({
          name: 'respondedAt',
          title: 'Responded At',
          type: 'datetime',
        }),
      ],
    }),

    // Status and Moderation
    defineField({
      name: 'status',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Pending Review', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Flagged', value: 'flagged' },
          { title: 'Hidden', value: 'hidden' },
          { title: 'Deleted', value: 'deleted' },
        ],
      },
      initialValue: 'published',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'moderationNotes',
      title: 'Moderation Notes',
      type: 'text',
      description: 'Notes from moderators about this review',
    }),
    defineField({
      name: 'reportCount',
      title: 'Report Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of times this review has been reported',
    }),

    // AI Analysis
    defineField({
      name: 'sentiment',
      title: 'AI Sentiment Analysis',
      type: 'string',
      options: {
        list: [
          { title: 'Very Positive', value: 'very-positive' },
          { title: 'Positive', value: 'positive' },
          { title: 'Neutral', value: 'neutral' },
          { title: 'Negative', value: 'negative' },
          { title: 'Very Negative', value: 'very-negative' },
        ],
      },
    }),
    defineField({
      name: 'topics',
      title: 'AI-Detected Topics',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Topics automatically detected from review content',
    }),
    defineField({
      name: 'qualityScore',
      title: 'AI Quality Score',
      type: 'number',
      description: 'AI-calculated review quality score (0-100)',
    }),

    // Timestamps
    defineField({
      name: 'reviewDate',
      title: 'Review Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
      description: 'When the experience being reviewed took place',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
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
      title: 'title',
      reviewerName: 'reviewer.userId',
      startupName: 'startup.name',
      overallRating: 'overallRating',
      reviewType: 'reviewType',
      status: 'status',
      isVerified: 'isVerified',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, reviewerName, startupName, overallRating, reviewType, status, isVerified, publishedAt } = selection;
      const date = new Date(publishedAt).toLocaleDateString();
      const stars = '⭐'.repeat(overallRating || 0);
      const statusIcon = status === 'published' ? '🟢' : status === 'pending' ? '🟡' : '🔴';
      const verifiedIcon = isVerified ? '✅' : '';
      
      return {
        title: `${title} ${stars} ${statusIcon} ${verifiedIcon}`,
        subtitle: `${reviewerName} → ${startupName} • ${reviewType} • ${date}`,
      };
    },
  },

  orderings: [
    {
      title: 'Most Recent',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Highest Rated',
      name: 'ratingDesc',
      by: [{ field: 'overallRating', direction: 'desc' }],
    },
    {
      title: 'Most Helpful',
      name: 'helpfulnessDesc',
      by: [{ field: 'helpfulnessScore', direction: 'desc' }],
    },
    {
      title: 'Verified First',
      name: 'verifiedFirst',
      by: [
        { field: 'isVerified', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' }
      ],
    },
    {
      title: 'By Startup',
      name: 'startupAsc',
      by: [
        { field: 'startup.name', direction: 'asc' },
        { field: 'publishedAt', direction: 'desc' }
      ],
    },
  ],
});
