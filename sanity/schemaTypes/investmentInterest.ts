import { defineField, defineType } from 'sanity'
import { HeartIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'investmentInterest',
  title: 'Investment Interest',
  type: 'document',
  icon: HeartIcon,
  fields: [
    // Core Information
    defineField({
      name: 'investor',
      title: 'Investor',
      type: 'reference',
      to: [{ type: 'investorProfile' }],
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
      name: 'pitch',
      title: 'Related Pitch',
      type: 'reference',
      to: [{ type: 'pitch' }],
      description: 'If interest was generated from a specific pitch',
    }),

    // Interest Details
    defineField({
      name: 'interestLevel',
      title: 'Interest Level',
      type: 'string',
      options: {
        list: [
          { title: 'Very High', value: 'very-high' },
          { title: 'High', value: 'high' },
          { title: 'Medium', value: 'medium' },
          { title: 'Low', value: 'low' },
          { title: 'Watching', value: 'watching' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'investmentStage',
      title: 'Investment Stage Interest',
      type: 'string',
      options: {
        list: [
          { title: 'Current Round', value: 'current' },
          { title: 'Next Round', value: 'next' },
          { title: 'Future Rounds', value: 'future' },
          { title: 'Any Round', value: 'any' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'potentialInvestmentAmount',
      title: 'Potential Investment Amount (USD)',
      type: 'number',
      description: 'How much are you considering investing?',
    }),
    defineField({
      name: 'leadInterest',
      title: 'Lead Investment Interest',
      type: 'boolean',
      description: 'Are you interested in leading the round?',
      initialValue: false,
    }),

    // Investment Rationale
    defineField({
      name: 'reasonsForInterest',
      title: 'Reasons for Interest',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Strong Team', value: 'strong-team' },
          { title: 'Large Market Opportunity', value: 'large-market' },
          { title: 'Innovative Product', value: 'innovative-product' },
          { title: 'Proven Traction', value: 'proven-traction' },
          { title: 'Competitive Advantage', value: 'competitive-advantage' },
          { title: 'Scalable Business Model', value: 'scalable-model' },
          { title: 'Industry Expertise', value: 'industry-expertise' },
          { title: 'Strategic Fit', value: 'strategic-fit' },
          { title: 'Network Synergies', value: 'network-synergies' },
          { title: 'Technology Innovation', value: 'tech-innovation' },
          { title: 'Market Timing', value: 'market-timing' },
          { title: 'Financial Performance', value: 'financial-performance' },
        ],
      },
    }),
    defineField({
      name: 'notes',
      title: 'Investment Notes',
      type: 'text',
      description: 'Private notes about this investment opportunity',
      validation: (Rule) => Rule.max(2000),
    }),
    defineField({
      name: 'concerns',
      title: 'Concerns or Questions',
      type: 'text',
      description: 'Any concerns or questions about the investment',
      validation: (Rule) => Rule.max(1000),
    }),

    // Due Diligence
    defineField({
      name: 'dueDiligenceStatus',
      title: 'Due Diligence Status',
      type: 'string',
      options: {
        list: [
          { title: 'Not Started', value: 'not-started' },
          { title: 'Initial Review', value: 'initial-review' },
          { title: 'In Progress', value: 'in-progress' },
          { title: 'Deep Dive', value: 'deep-dive' },
          { title: 'Completed', value: 'completed' },
          { title: 'On Hold', value: 'on-hold' },
        ],
      },
      initialValue: 'not-started',
    }),
    defineField({
      name: 'dueDiligenceItems',
      title: 'Due Diligence Checklist',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'item',
              title: 'Item',
              type: 'string',
            }),
            defineField({
              name: 'status',
              title: 'Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Pending', value: 'pending' },
                  { title: 'In Progress', value: 'in-progress' },
                  { title: 'Completed', value: 'completed' },
                  { title: 'Not Applicable', value: 'na' },
                ],
              },
              initialValue: 'pending',
            }),
            defineField({
              name: 'notes',
              title: 'Notes',
              type: 'text',
            }),
            defineField({
              name: 'completedAt',
              title: 'Completed At',
              type: 'datetime',
            }),
          ],
        },
      ],
    }),

    // Communication
    defineField({
      name: 'lastContactDate',
      title: 'Last Contact Date',
      type: 'datetime',
      description: 'When did you last communicate with this startup?',
    }),
    defineField({
      name: 'nextFollowUpDate',
      title: 'Next Follow-up Date',
      type: 'datetime',
      description: 'When should you follow up next?',
    }),
    defineField({
      name: 'meetingRequested',
      title: 'Meeting Requested',
      type: 'boolean',
      description: 'Have you requested a meeting with this startup?',
      initialValue: false,
    }),
    defineField({
      name: 'meetingScheduled',
      title: 'Meeting Scheduled',
      type: 'boolean',
      description: 'Do you have a meeting scheduled?',
      initialValue: false,
    }),
    defineField({
      name: 'meetingDate',
      title: 'Meeting Date',
      type: 'datetime',
      description: 'When is your meeting scheduled?',
    }),

    // Decision Tracking
    defineField({
      name: 'status',
      title: 'Investment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Interested', value: 'interested' },
          { title: 'Evaluating', value: 'evaluating' },
          { title: 'Term Sheet Sent', value: 'term-sheet-sent' },
          { title: 'Negotiating', value: 'negotiating' },
          { title: 'Committed', value: 'committed' },
          { title: 'Invested', value: 'invested' },
          { title: 'Passed', value: 'passed' },
          { title: 'On Hold', value: 'on-hold' },
        ],
      },
      initialValue: 'interested',
    }),
    defineField({
      name: 'decisionReason',
      title: 'Decision Reason',
      type: 'text',
      description: 'Reason for investment decision (especially if passed)',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'termSheetSent',
      title: 'Term Sheet Sent',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'termSheetDate',
      title: 'Term Sheet Date',
      type: 'datetime',
    }),
    defineField({
      name: 'investmentDate',
      title: 'Investment Date',
      type: 'datetime',
      description: 'When was the investment completed?',
    }),
    defineField({
      name: 'actualInvestmentAmount',
      title: 'Actual Investment Amount (USD)',
      type: 'number',
      description: 'Final investment amount',
    }),

    // Source and Attribution
    defineField({
      name: 'source',
      title: 'Interest Source',
      type: 'string',
      options: {
        list: [
          { title: 'Platform Discovery', value: 'platform' },
          { title: 'Pitch Event', value: 'pitch-event' },
          { title: 'Demo Day', value: 'demo-day' },
          { title: 'Referral', value: 'referral' },
          { title: 'Cold Outreach', value: 'cold-outreach' },
          { title: 'Warm Introduction', value: 'warm-intro' },
          { title: 'Conference/Event', value: 'conference' },
          { title: 'Social Media', value: 'social-media' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'referredBy',
      title: 'Referred By',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      description: 'Who referred this opportunity?',
    }),

    // Privacy and Visibility
    defineField({
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      options: {
        list: [
          { title: 'Private', value: 'private' },
          { title: 'Startup Can See', value: 'startup-visible' },
          { title: 'Public Interest', value: 'public' },
        ],
      },
      initialValue: 'private',
      description: 'Who can see this investment interest?',
    }),
    defineField({
      name: 'allowStartupContact',
      title: 'Allow Startup Contact',
      type: 'boolean',
      description: 'Can the startup contact you about this interest?',
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
  ],

  preview: {
    select: {
      investorName: 'investor.user.userId',
      startupName: 'startup.name',
      interestLevel: 'interestLevel',
      status: 'status',
      potentialAmount: 'potentialInvestmentAmount',
    },
    prepare(selection) {
      const { investorName, startupName, interestLevel, status, potentialAmount } = selection;
      const amount = potentialAmount ? ` • $${potentialAmount.toLocaleString()}` : '';
      return {
        title: `${investorName} → ${startupName}`,
        subtitle: `${interestLevel} interest • ${status}${amount}`,
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
      title: 'Interest Level',
      name: 'interestLevelDesc',
      by: [{ field: 'interestLevel', direction: 'desc' }],
    },
    {
      title: 'Investment Amount',
      name: 'amountDesc',
      by: [{ field: 'potentialInvestmentAmount', direction: 'desc' }],
    },
  ],
});
