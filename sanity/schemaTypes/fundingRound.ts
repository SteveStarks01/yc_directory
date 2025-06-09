import { defineField, defineType } from 'sanity'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'fundingRound',
  title: 'Funding Round',
  type: 'document',
  icon: CurrencyDollarIcon,
  fields: [
    // Basic Information
    defineField({
      name: 'startup',
      title: 'Startup Company',
      type: 'reference',
      to: [{ type: 'startup' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'roundType',
      title: 'Round Type',
      type: 'string',
      options: {
        list: [
          { title: 'Pre-Seed', value: 'pre-seed' },
          { title: 'Seed', value: 'seed' },
          { title: 'Series A', value: 'series-a' },
          { title: 'Series B', value: 'series-b' },
          { title: 'Series C', value: 'series-c' },
          { title: 'Series D+', value: 'series-d-plus' },
          { title: 'Bridge Round', value: 'bridge' },
          { title: 'Convertible Note', value: 'convertible' },
          { title: 'SAFE', value: 'safe' },
          { title: 'Grant', value: 'grant' },
          { title: 'Debt Financing', value: 'debt' },
          { title: 'IPO', value: 'ipo' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'amount',
      title: 'Funding Amount (USD)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'USD',
      options: {
        list: [
          { title: 'USD', value: 'USD' },
          { title: 'EUR', value: 'EUR' },
          { title: 'GBP', value: 'GBP' },
          { title: 'CAD', value: 'CAD' },
          { title: 'AUD', value: 'AUD' },
          { title: 'JPY', value: 'JPY' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'announcedDate',
      title: 'Announced Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'closedDate',
      title: 'Closed Date',
      type: 'date',
    }),

    // Valuation Information
    defineField({
      name: 'preMoneyValuation',
      title: 'Pre-Money Valuation (USD)',
      type: 'number',
    }),
    defineField({
      name: 'postMoneyValuation',
      title: 'Post-Money Valuation (USD)',
      type: 'number',
    }),

    // Investors
    defineField({
      name: 'leadInvestors',
      title: 'Lead Investors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Investor Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'type',
              title: 'Investor Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Venture Capital', value: 'vc' },
                  { title: 'Angel Investor', value: 'angel' },
                  { title: 'Corporate VC', value: 'corporate-vc' },
                  { title: 'Private Equity', value: 'pe' },
                  { title: 'Family Office', value: 'family-office' },
                  { title: 'Government', value: 'government' },
                  { title: 'Accelerator', value: 'accelerator' },
                  { title: 'Other', value: 'other' },
                ],
              },
            }),
            defineField({
              name: 'amount',
              title: 'Investment Amount',
              type: 'number',
            }),
            defineField({
              name: 'website',
              title: 'Investor Website',
              type: 'url',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'participatingInvestors',
      title: 'Participating Investors',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Investor Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'type',
              title: 'Investor Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Venture Capital', value: 'vc' },
                  { title: 'Angel Investor', value: 'angel' },
                  { title: 'Corporate VC', value: 'corporate-vc' },
                  { title: 'Private Equity', value: 'pe' },
                  { title: 'Family Office', value: 'family-office' },
                  { title: 'Government', value: 'government' },
                  { title: 'Accelerator', value: 'accelerator' },
                  { title: 'Other', value: 'other' },
                ],
              },
            }),
            defineField({
              name: 'amount',
              title: 'Investment Amount',
              type: 'number',
            }),
          ],
        },
      ],
    }),

    // Round Details
    defineField({
      name: 'useOfFunds',
      title: 'Use of Funds',
      type: 'text',
      description: 'How the company plans to use the funding',
    }),
    defineField({
      name: 'keyTerms',
      title: 'Key Terms',
      type: 'object',
      fields: [
        defineField({
          name: 'liquidationPreference',
          title: 'Liquidation Preference',
          type: 'string',
        }),
        defineField({
          name: 'dividendRate',
          title: 'Dividend Rate (%)',
          type: 'number',
        }),
        defineField({
          name: 'antiDilution',
          title: 'Anti-Dilution Protection',
          type: 'string',
          options: {
            list: [
              { title: 'None', value: 'none' },
              { title: 'Weighted Average Broad', value: 'weighted-broad' },
              { title: 'Weighted Average Narrow', value: 'weighted-narrow' },
              { title: 'Full Ratchet', value: 'full-ratchet' },
            ],
          },
        }),
        defineField({
          name: 'boardSeats',
          title: 'Board Seats',
          type: 'number',
        }),
        defineField({
          name: 'votingRights',
          title: 'Voting Rights',
          type: 'string',
        }),
      ],
    }),

    // Documentation
    defineField({
      name: 'pressRelease',
      title: 'Press Release URL',
      type: 'url',
    }),
    defineField({
      name: 'secFilings',
      title: 'SEC Filings',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'type',
              title: 'Filing Type',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'Filing URL',
              type: 'url',
            }),
            defineField({
              name: 'date',
              title: 'Filing Date',
              type: 'date',
            }),
          ],
        },
      ],
    }),

    // Status and Verification
    defineField({
      name: 'status',
      title: 'Round Status',
      type: 'string',
      options: {
        list: [
          { title: 'Rumored', value: 'rumored' },
          { title: 'Announced', value: 'announced' },
          { title: 'Closed', value: 'closed' },
          { title: 'Failed', value: 'failed' },
        ],
      },
      initialValue: 'announced',
    }),
    defineField({
      name: 'verified',
      title: 'Verified Information',
      type: 'boolean',
      description: 'Information has been verified from official sources',
      initialValue: false,
    }),
    defineField({
      name: 'source',
      title: 'Information Source',
      type: 'string',
      description: 'Source of the funding information',
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
      title: 'startup.name',
      roundType: 'roundType',
      amount: 'amount',
      currency: 'currency',
      date: 'announcedDate',
    },
    prepare(selection) {
      const { title, roundType, amount, currency, date } = selection;
      const formattedAmount = amount ? `${currency || 'USD'} ${amount.toLocaleString()}` : 'Amount TBD';
      const formattedDate = date ? new Date(date).getFullYear() : '';
      
      return {
        title: `${title} - ${roundType}`,
        subtitle: `${formattedAmount} • ${formattedDate}`,
      };
    },
  },

  orderings: [
    {
      title: 'Recently Announced',
      name: 'announcedDateDesc',
      by: [{ field: 'announcedDate', direction: 'desc' }],
    },
    {
      title: 'Funding Amount (High to Low)',
      name: 'amountDesc',
      by: [{ field: 'amount', direction: 'desc' }],
    },
    {
      title: 'Company Name A-Z',
      name: 'startupNameAsc',
      by: [{ field: 'startup.name', direction: 'asc' }],
    },
  ],
});
