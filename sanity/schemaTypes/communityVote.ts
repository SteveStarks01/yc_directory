import { defineField, defineType } from 'sanity'
import { HandThumbUpIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'communityVote',
  title: 'Community Vote',
  type: 'document',
  icon: HandThumbUpIcon,
  fields: [
    // Core Vote Information
    defineField({
      name: 'voter',
      title: 'Voter',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'voteType',
      title: 'Vote Type',
      type: 'string',
      options: {
        list: [
          { title: 'Startup Rating', value: 'startup-rating' },
          { title: 'Community Choice Award', value: 'community-award' },
          { title: 'Most Innovative', value: 'most-innovative' },
          { title: 'Best Traction', value: 'best-traction' },
          { title: 'Rising Star', value: 'rising-star' },
          { title: 'Best Pitch', value: 'best-pitch' },
          { title: 'Founder of the Month', value: 'founder-month' },
          { title: 'Investor Choice', value: 'investor-choice' },
          { title: 'Community Impact', value: 'community-impact' },
          { title: 'Technical Excellence', value: 'technical-excellence' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Monthly Awards', value: 'monthly' },
          { title: 'Quarterly Awards', value: 'quarterly' },
          { title: 'Annual Awards', value: 'annual' },
          { title: 'Demo Day Awards', value: 'demo-day' },
          { title: 'Community Choice', value: 'community' },
          { title: 'Peer Review', value: 'peer-review' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // Vote Target
    defineField({
      name: 'targetType',
      title: 'Target Type',
      type: 'string',
      options: {
        list: [
          { title: 'Startup', value: 'startup' },
          { title: 'Founder', value: 'founder' },
          { title: 'Pitch', value: 'pitch' },
          { title: 'Event', value: 'event' },
          { title: 'Resource', value: 'resource' },
          { title: 'Investor', value: 'investor' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'targetStartup',
      title: 'Target Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      hidden: ({ parent }) => parent?.targetType !== 'startup',
    }),
    defineField({
      name: 'targetFounder',
      title: 'Target Founder',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      hidden: ({ parent }) => parent?.targetType !== 'founder',
    }),
    defineField({
      name: 'targetPitch',
      title: 'Target Pitch',
      type: 'reference',
      to: [{ type: 'pitch' }],
      hidden: ({ parent }) => parent?.targetType !== 'pitch',
    }),
    defineField({
      name: 'targetEvent',
      title: 'Target Event',
      type: 'reference',
      to: [{ type: 'event' }],
      hidden: ({ parent }) => parent?.targetType !== 'event',
    }),
    defineField({
      name: 'targetResource',
      title: 'Target Resource',
      type: 'reference',
      to: [{ type: 'resource' }],
      hidden: ({ parent }) => parent?.targetType !== 'resource',
    }),
    defineField({
      name: 'targetInvestor',
      title: 'Target Investor',
      type: 'reference',
      to: [{ type: 'investorProfile' }],
      hidden: ({ parent }) => parent?.targetType !== 'investor',
    }),

    // Vote Details
    defineField({
      name: 'voteValue',
      title: 'Vote Value',
      type: 'number',
      description: 'Numeric vote value (1-5 stars, 1-10 rating, etc.)',
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
    defineField({
      name: 'maxVoteValue',
      title: 'Maximum Vote Value',
      type: 'number',
      description: 'Maximum possible vote value for this vote type',
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
    defineField({
      name: 'comment',
      title: 'Vote Comment',
      type: 'text',
      description: 'Optional comment explaining the vote',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'criteria',
      title: 'Voting Criteria',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'criterion',
              title: 'Criterion',
              type: 'string',
              options: {
                list: [
                  { title: 'Innovation', value: 'innovation' },
                  { title: 'Market Potential', value: 'market-potential' },
                  { title: 'Team Quality', value: 'team-quality' },
                  { title: 'Execution', value: 'execution' },
                  { title: 'Traction', value: 'traction' },
                  { title: 'Product Quality', value: 'product-quality' },
                  { title: 'Business Model', value: 'business-model' },
                  { title: 'Scalability', value: 'scalability' },
                  { title: 'Community Impact', value: 'community-impact' },
                  { title: 'Technical Excellence', value: 'technical-excellence' },
                ],
              },
            }),
            defineField({
              name: 'score',
              title: 'Score',
              type: 'number',
              validation: (Rule) => Rule.min(1).max(5),
            }),
            defineField({
              name: 'weight',
              title: 'Weight',
              type: 'number',
              description: 'Importance weight for this criterion (0-1)',
              validation: (Rule) => Rule.min(0).max(1),
              initialValue: 1,
            }),
          ],
        },
      ],
    }),

    // Vote Context
    defineField({
      name: 'votingPeriod',
      title: 'Voting Period',
      type: 'object',
      fields: [
        defineField({
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
        }),
        defineField({
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
        }),
        defineField({
          name: 'isActive',
          title: 'Is Active',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'relatedEvent',
      title: 'Related Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'If vote is part of an event (e.g., demo day)',
    }),
    defineField({
      name: 'isPublic',
      title: 'Is Public Vote',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this vote is public or anonymous',
    }),

    // Vote Validation
    defineField({
      name: 'voterEligibility',
      title: 'Voter Eligibility',
      type: 'object',
      fields: [
        defineField({
          name: 'requiredRole',
          title: 'Required Role',
          type: 'string',
          options: {
            list: [
              { title: 'Any User', value: 'user' },
              { title: 'Verified User', value: 'verified' },
              { title: 'Founder', value: 'founder' },
              { title: 'Investor', value: 'investor' },
              { title: 'Mentor', value: 'mentor' },
              { title: 'Alumni', value: 'alumni' },
            ],
          },
          initialValue: 'user',
        }),
        defineField({
          name: 'minimumReputation',
          title: 'Minimum Reputation',
          type: 'number',
          description: 'Minimum reputation score required to vote',
        }),
        defineField({
          name: 'requiresVerification',
          title: 'Requires Verification',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: 'isVerified',
      title: 'Is Verified Vote',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this vote has been verified by moderators',
    }),
    defineField({
      name: 'verifiedBy',
      title: 'Verified By',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      description: 'Moderator who verified this vote',
    }),

    // Vote Analytics
    defineField({
      name: 'weight',
      title: 'Vote Weight',
      type: 'number',
      description: 'Weight of this vote based on voter reputation/role',
      initialValue: 1,
    }),
    defineField({
      name: 'influence',
      title: 'Voter Influence Score',
      type: 'number',
      description: 'Influence score of the voter at time of voting',
    }),
    defineField({
      name: 'confidence',
      title: 'Vote Confidence',
      type: 'number',
      description: 'AI-calculated confidence in vote authenticity (0-1)',
    }),

    // Status and Moderation
    defineField({
      name: 'status',
      title: 'Vote Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Pending Review', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Flagged', value: 'flagged' },
          { title: 'Withdrawn', value: 'withdrawn' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'moderationNotes',
      title: 'Moderation Notes',
      type: 'text',
      description: 'Notes from moderators about this vote',
    }),

    // Timestamps
    defineField({
      name: 'votedAt',
      title: 'Voted At',
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
      voterName: 'voter.userId',
      voteType: 'voteType',
      voteValue: 'voteValue',
      maxVoteValue: 'maxVoteValue',
      targetType: 'targetType',
      votedAt: 'votedAt',
      status: 'status',
    },
    prepare(selection) {
      const { voterName, voteType, voteValue, maxVoteValue, targetType, votedAt, status } = selection;
      const date = new Date(votedAt).toLocaleDateString();
      const rating = `${voteValue}/${maxVoteValue}`;
      const statusIcon = status === 'approved' ? '✅' : status === 'flagged' ? '🚩' : '⏳';
      
      return {
        title: `${voterName}: ${voteType} ${statusIcon}`,
        subtitle: `${rating} stars • ${targetType} • ${date}`,
      };
    },
  },

  orderings: [
    {
      title: 'Most Recent',
      name: 'votedAtDesc',
      by: [{ field: 'votedAt', direction: 'desc' }],
    },
    {
      title: 'Highest Rated',
      name: 'voteValueDesc',
      by: [{ field: 'voteValue', direction: 'desc' }],
    },
    {
      title: 'By Vote Type',
      name: 'voteTypeAsc',
      by: [
        { field: 'voteType', direction: 'asc' },
        { field: 'votedAt', direction: 'desc' }
      ],
    },
    {
      title: 'By Status',
      name: 'statusAsc',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'votedAt', direction: 'desc' }
      ],
    },
  ],
});
