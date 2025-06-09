import { defineField, defineType } from 'sanity'
import { CpuChipIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'matchingScore',
  title: 'AI Matching Score',
  type: 'document',
  icon: CpuChipIcon,
  fields: [
    // Core Matching Information
    defineField({
      name: 'startup',
      title: 'Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'investor',
      title: 'Investor',
      type: 'reference',
      to: [{ type: 'investorProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'matchType',
      title: 'Match Type',
      type: 'string',
      options: {
        list: [
          { title: 'Investment Opportunity', value: 'investment' },
          { title: 'Mentorship', value: 'mentorship' },
          { title: 'Advisory', value: 'advisory' },
          { title: 'Partnership', value: 'partnership' },
          { title: 'Customer', value: 'customer' },
        ],
      },
      initialValue: 'investment',
      validation: (Rule) => Rule.required(),
    }),

    // AI Scoring
    defineField({
      name: 'overallScore',
      title: 'Overall Match Score',
      type: 'number',
      description: 'Overall compatibility score (0-100)',
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: 'confidence',
      title: 'Confidence Level',
      type: 'number',
      description: 'AI confidence in this score (0-1)',
      validation: (Rule) => Rule.min(0).max(1),
    }),

    // Detailed Score Breakdown
    defineField({
      name: 'scoreBreakdown',
      title: 'Score Breakdown',
      type: 'object',
      fields: [
        defineField({
          name: 'stageMatch',
          title: 'Investment Stage Match',
          type: 'number',
          description: 'How well the startup stage matches investor preferences (0-100)',
        }),
        defineField({
          name: 'industryMatch',
          title: 'Industry Match',
          type: 'number',
          description: 'Industry alignment score (0-100)',
        }),
        defineField({
          name: 'geographyMatch',
          title: 'Geography Match',
          type: 'number',
          description: 'Geographic preference alignment (0-100)',
        }),
        defineField({
          name: 'checkSizeMatch',
          title: 'Check Size Match',
          type: 'number',
          description: 'Investment amount compatibility (0-100)',
        }),
        defineField({
          name: 'teamMatch',
          title: 'Team Compatibility',
          type: 'number',
          description: 'Team experience and background match (0-100)',
        }),
        defineField({
          name: 'tractionMatch',
          title: 'Traction Alignment',
          type: 'number',
          description: 'Startup traction vs investor expectations (0-100)',
        }),
        defineField({
          name: 'valueAddMatch',
          title: 'Value Add Alignment',
          type: 'number',
          description: 'How well investor value-add matches startup needs (0-100)',
        }),
        defineField({
          name: 'networkMatch',
          title: 'Network Synergy',
          type: 'number',
          description: 'Potential network synergies and connections (0-100)',
        }),
        defineField({
          name: 'timingMatch',
          title: 'Timing Alignment',
          type: 'number',
          description: 'Market timing and investment readiness (0-100)',
        }),
        defineField({
          name: 'riskMatch',
          title: 'Risk Profile Match',
          type: 'number',
          description: 'Risk tolerance alignment (0-100)',
        }),
      ],
    }),

    // ML Model Information
    defineField({
      name: 'modelVersion',
      title: 'ML Model Version',
      type: 'string',
      description: 'Version of the ML model used for scoring',
    }),
    defineField({
      name: 'algorithmType',
      title: 'Algorithm Type',
      type: 'string',
      options: {
        list: [
          { title: 'Rule-Based', value: 'rule-based' },
          { title: 'Linear Regression', value: 'linear-regression' },
          { title: 'Random Forest', value: 'random-forest' },
          { title: 'Neural Network', value: 'neural-network' },
          { title: 'Gradient Boosting', value: 'gradient-boosting' },
          { title: 'Ensemble', value: 'ensemble' },
        ],
      },
      initialValue: 'rule-based',
    }),
    defineField({
      name: 'features',
      title: 'Features Used',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of features used in the ML model',
    }),

    // Success Prediction
    defineField({
      name: 'successProbability',
      title: 'Success Probability',
      type: 'number',
      description: 'Predicted probability of successful connection/investment (0-1)',
    }),
    defineField({
      name: 'expectedOutcome',
      title: 'Expected Outcome',
      type: 'string',
      options: {
        list: [
          { title: 'High Probability Investment', value: 'high-prob-investment' },
          { title: 'Medium Probability Investment', value: 'medium-prob-investment' },
          { title: 'Low Probability Investment', value: 'low-prob-investment' },
          { title: 'Advisory/Mentorship', value: 'advisory' },
          { title: 'Network Introduction', value: 'network-intro' },
          { title: 'Future Opportunity', value: 'future-opportunity' },
          { title: 'No Match', value: 'no-match' },
        ],
      },
    }),
    defineField({
      name: 'recommendedAction',
      title: 'Recommended Action',
      type: 'string',
      options: {
        list: [
          { title: 'Immediate Introduction', value: 'immediate-intro' },
          { title: 'Warm Introduction', value: 'warm-intro' },
          { title: 'Cold Outreach', value: 'cold-outreach' },
          { title: 'Wait for Better Timing', value: 'wait-timing' },
          { title: 'Build Relationship First', value: 'build-relationship' },
          { title: 'No Action Recommended', value: 'no-action' },
        ],
      },
    }),

    // Historical Performance
    defineField({
      name: 'historicalAccuracy',
      title: 'Historical Accuracy',
      type: 'number',
      description: 'How accurate this model has been for similar matches (0-1)',
    }),
    defineField({
      name: 'similarMatches',
      title: 'Similar Historical Matches',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'matchId',
              title: 'Match ID',
              type: 'string',
            }),
            defineField({
              name: 'outcome',
              title: 'Actual Outcome',
              type: 'string',
              options: {
                list: [
                  { title: 'Successful Investment', value: 'successful-investment' },
                  { title: 'Connection Made', value: 'connection-made' },
                  { title: 'No Response', value: 'no-response' },
                  { title: 'Declined', value: 'declined' },
                  { title: 'Future Opportunity', value: 'future-opportunity' },
                ],
              },
            }),
            defineField({
              name: 'similarity',
              title: 'Similarity Score',
              type: 'number',
              description: 'How similar this match was (0-1)',
            }),
          ],
        },
      ],
    }),

    // Feedback and Learning
    defineField({
      name: 'userFeedback',
      title: 'User Feedback',
      type: 'object',
      fields: [
        defineField({
          name: 'investorFeedback',
          title: 'Investor Feedback',
          type: 'string',
          options: {
            list: [
              { title: 'Excellent Match', value: 'excellent' },
              { title: 'Good Match', value: 'good' },
              { title: 'Average Match', value: 'average' },
              { title: 'Poor Match', value: 'poor' },
              { title: 'No Feedback', value: 'no-feedback' },
            ],
          },
        }),
        defineField({
          name: 'startupFeedback',
          title: 'Startup Feedback',
          type: 'string',
          options: {
            list: [
              { title: 'Excellent Match', value: 'excellent' },
              { title: 'Good Match', value: 'good' },
              { title: 'Average Match', value: 'average' },
              { title: 'Poor Match', value: 'poor' },
              { title: 'No Feedback', value: 'no-feedback' },
            ],
          },
        }),
        defineField({
          name: 'feedbackNotes',
          title: 'Feedback Notes',
          type: 'text',
          description: 'Additional feedback from users',
        }),
      ],
    }),
    defineField({
      name: 'actualOutcome',
      title: 'Actual Outcome',
      type: 'string',
      options: {
        list: [
          { title: 'Investment Made', value: 'investment-made' },
          { title: 'Connection Established', value: 'connection-established' },
          { title: 'Meeting Scheduled', value: 'meeting-scheduled' },
          { title: 'Interest Expressed', value: 'interest-expressed' },
          { title: 'No Response', value: 'no-response' },
          { title: 'Declined', value: 'declined' },
          { title: 'Pending', value: 'pending' },
        ],
      },
    }),

    // Status and Lifecycle
    defineField({
      name: 'status',
      title: 'Match Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Presented', value: 'presented' },
          { title: 'Acted Upon', value: 'acted-upon' },
          { title: 'Completed', value: 'completed' },
          { title: 'Expired', value: 'expired' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'When this match score becomes stale and needs recalculation',
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description: 'When this score was last recalculated',
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
      startupName: 'startup.name',
      investorName: 'investor.firmName',
      investorUser: 'investor.user.userId',
      overallScore: 'overallScore',
      confidence: 'confidence',
      status: 'status',
    },
    prepare(selection) {
      const { startupName, investorName, investorUser, overallScore, confidence, status } = selection;
      const investor = investorName || investorUser;
      const scoreDisplay = overallScore ? `${Math.round(overallScore)}%` : 'N/A';
      const confidenceDisplay = confidence ? `(${Math.round(confidence * 100)}% conf)` : '';
      
      return {
        title: `${startupName} ↔ ${investor}`,
        subtitle: `Score: ${scoreDisplay} ${confidenceDisplay} • ${status}`,
      };
    },
  },

  orderings: [
    {
      title: 'Highest Score',
      name: 'scoreDesc',
      by: [{ field: 'overallScore', direction: 'desc' }],
    },
    {
      title: 'Most Recent',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'High Confidence',
      name: 'confidenceDesc',
      by: [{ field: 'confidence', direction: 'desc' }],
    },
    {
      title: 'By Startup',
      name: 'startupAsc',
      by: [
        { field: 'startup.name', direction: 'asc' },
        { field: 'overallScore', direction: 'desc' }
      ],
    },
  ],
});
