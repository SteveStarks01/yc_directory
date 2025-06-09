import { defineField, defineType } from 'sanity'
import { StarIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'pitchRating',
  title: 'Pitch Rating',
  type: 'document',
  icon: StarIcon,
  fields: [
    // Core Rating Information
    defineField({
      name: 'pitch',
      title: 'Pitch',
      type: 'reference',
      to: [{ type: 'pitch' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rater',
      title: 'Rater',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),

    // Rating Scores (1-5 scale)
    defineField({
      name: 'overallRating',
      title: 'Overall Rating',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
      description: 'Overall rating from 1-5 stars',
    }),
    defineField({
      name: 'presentationQuality',
      title: 'Presentation Quality',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Quality of the presentation and delivery',
    }),
    defineField({
      name: 'businessModel',
      title: 'Business Model',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Strength and clarity of the business model',
    }),
    defineField({
      name: 'marketOpportunity',
      title: 'Market Opportunity',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Size and attractiveness of the market opportunity',
    }),
    defineField({
      name: 'traction',
      title: 'Traction',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Evidence of customer traction and growth',
    }),
    defineField({
      name: 'team',
      title: 'Team',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Strength and experience of the founding team',
    }),
    defineField({
      name: 'product',
      title: 'Product',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Quality and differentiation of the product',
    }),

    // Written Feedback
    defineField({
      name: 'feedback',
      title: 'Written Feedback',
      type: 'text',
      description: 'Detailed feedback and comments',
      validation: (Rule) => Rule.max(2000),
    }),
    defineField({
      name: 'strengths',
      title: 'Key Strengths',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What are the main strengths of this pitch?',
    }),
    defineField({
      name: 'improvements',
      title: 'Areas for Improvement',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What could be improved in this pitch?',
    }),
    defineField({
      name: 'questions',
      title: 'Questions for the Team',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Questions you would like to ask the founding team',
    }),

    // Investment Interest (for investors)
    defineField({
      name: 'investmentInterest',
      title: 'Investment Interest Level',
      type: 'string',
      options: {
        list: [
          { title: 'Very Interested', value: 'very-interested' },
          { title: 'Interested', value: 'interested' },
          { title: 'Somewhat Interested', value: 'somewhat-interested' },
          { title: 'Not Interested', value: 'not-interested' },
          { title: 'Need More Information', value: 'need-more-info' },
        ],
      },
      description: 'Level of investment interest (for investors)',
    }),
    defineField({
      name: 'potentialInvestmentAmount',
      title: 'Potential Investment Amount',
      type: 'number',
      description: 'Potential investment amount in USD (for investors)',
    }),
    defineField({
      name: 'followUpRequested',
      title: 'Follow-up Requested',
      type: 'boolean',
      description: 'Would you like to schedule a follow-up meeting?',
      initialValue: false,
    }),

    // Rater Information
    defineField({
      name: 'raterType',
      title: 'Rater Type',
      type: 'string',
      options: {
        list: [
          { title: 'Investor', value: 'investor' },
          { title: 'Mentor', value: 'mentor' },
          { title: 'Fellow Entrepreneur', value: 'entrepreneur' },
          { title: 'Industry Expert', value: 'expert' },
          { title: 'Community Member', value: 'community' },
          { title: 'Judge', value: 'judge' },
          { title: 'Other', value: 'other' },
        ],
      },
      description: 'What type of rater are you?',
    }),
    defineField({
      name: 'expertise',
      title: 'Area of Expertise',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Your areas of expertise relevant to this rating',
    }),

    // Rating Context
    defineField({
      name: 'ratingContext',
      title: 'Rating Context',
      type: 'string',
      options: {
        list: [
          { title: 'Live Event', value: 'live-event' },
          { title: 'Video Review', value: 'video-review' },
          { title: 'Deck Review', value: 'deck-review' },
          { title: 'Demo Review', value: 'demo-review' },
          { title: 'Competition Judging', value: 'competition' },
          { title: 'Other', value: 'other' },
        ],
      },
      description: 'In what context did you rate this pitch?',
    }),
    defineField({
      name: 'anonymous',
      title: 'Anonymous Rating',
      type: 'boolean',
      description: 'Keep this rating anonymous to the startup team',
      initialValue: false,
    }),

    // Status and Moderation
    defineField({
      name: 'status',
      title: 'Rating Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Under Review', value: 'review' },
          { title: 'Flagged', value: 'flagged' },
          { title: 'Hidden', value: 'hidden' },
        ],
      },
      initialValue: 'published',
    }),
    defineField({
      name: 'verified',
      title: 'Verified Rating',
      type: 'boolean',
      description: 'Rating has been verified by moderators',
      initialValue: false,
    }),

    // Engagement
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
      title: 'pitch.title',
      subtitle: 'rater.userId',
      overallRating: 'overallRating',
      raterType: 'raterType',
    },
    prepare(selection) {
      const { title, subtitle, overallRating, raterType } = selection;
      const stars = '★'.repeat(overallRating || 0) + '☆'.repeat(5 - (overallRating || 0));
      return {
        title: `${title} - ${stars}`,
        subtitle: `by ${subtitle} (${raterType})`,
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
      title: 'Highest Rated',
      name: 'overallRatingDesc',
      by: [{ field: 'overallRating', direction: 'desc' }],
    },
    {
      title: 'Most Helpful',
      name: 'helpfulDesc',
      by: [{ field: 'helpful', direction: 'desc' }],
    },
  ],
});
