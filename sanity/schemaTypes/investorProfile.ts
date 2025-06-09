import { defineField, defineType } from 'sanity'
import { BanknotesIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'investorProfile',
  title: 'Investor Profile',
  type: 'document',
  icon: BanknotesIcon,
  fields: [
    // Basic Information
    defineField({
      name: 'user',
      title: 'User Profile',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'investorType',
      title: 'Investor Type',
      type: 'string',
      options: {
        list: [
          { title: 'Angel Investor', value: 'angel' },
          { title: 'Venture Capital', value: 'vc' },
          { title: 'Corporate VC', value: 'corporate-vc' },
          { title: 'Private Equity', value: 'pe' },
          { title: 'Family Office', value: 'family-office' },
          { title: 'Accelerator', value: 'accelerator' },
          { title: 'Government Fund', value: 'government' },
          { title: 'Crowdfunding Platform', value: 'crowdfunding' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'firmName',
      title: 'Firm/Organization Name',
      type: 'string',
      description: 'Name of the investment firm or organization',
    }),
    defineField({
      name: 'title',
      title: 'Title/Position',
      type: 'string',
      description: 'Your title at the firm (e.g., Partner, Principal, Managing Director)',
    }),
    defineField({
      name: 'bio',
      title: 'Investor Bio',
      type: 'text',
      description: 'Brief description of your investment background and experience',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'firmLogo',
      title: 'Firm Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    // Investment Preferences
    defineField({
      name: 'investmentStages',
      title: 'Investment Stages',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Pre-Seed', value: 'pre-seed' },
          { title: 'Seed', value: 'seed' },
          { title: 'Series A', value: 'series-a' },
          { title: 'Series B', value: 'series-b' },
          { title: 'Series C+', value: 'series-c-plus' },
          { title: 'Growth', value: 'growth' },
          { title: 'Late Stage', value: 'late-stage' },
        ],
      },
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'preferredIndustries',
      title: 'Preferred Industries',
      type: 'array',
      of: [{ type: 'string' }],
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
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'geographicFocus',
      title: 'Geographic Focus',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'North America', value: 'north-america' },
          { title: 'United States', value: 'us' },
          { title: 'Canada', value: 'canada' },
          { title: 'Europe', value: 'europe' },
          { title: 'United Kingdom', value: 'uk' },
          { title: 'Asia Pacific', value: 'asia-pacific' },
          { title: 'China', value: 'china' },
          { title: 'India', value: 'india' },
          { title: 'Southeast Asia', value: 'southeast-asia' },
          { title: 'Latin America', value: 'latin-america' },
          { title: 'Middle East', value: 'middle-east' },
          { title: 'Africa', value: 'africa' },
          { title: 'Global', value: 'global' },
        ],
      },
    }),

    // Investment Criteria
    defineField({
      name: 'minInvestmentAmount',
      title: 'Minimum Investment Amount (USD)',
      type: 'number',
      description: 'Minimum amount you typically invest',
    }),
    defineField({
      name: 'maxInvestmentAmount',
      title: 'Maximum Investment Amount (USD)',
      type: 'number',
      description: 'Maximum amount you typically invest',
    }),
    defineField({
      name: 'typicalCheckSize',
      title: 'Typical Check Size (USD)',
      type: 'number',
      description: 'Your typical investment amount',
    }),
    defineField({
      name: 'investmentsPerYear',
      title: 'Investments Per Year',
      type: 'number',
      description: 'How many investments do you typically make per year?',
    }),
    defineField({
      name: 'leadInvestments',
      title: 'Lead Investments',
      type: 'boolean',
      description: 'Do you lead investment rounds?',
      initialValue: false,
    }),
    defineField({
      name: 'followOnInvestments',
      title: 'Follow-on Investments',
      type: 'boolean',
      description: 'Do you make follow-on investments?',
      initialValue: true,
    }),

    // Investment Philosophy
    defineField({
      name: 'investmentPhilosophy',
      title: 'Investment Philosophy',
      type: 'text',
      description: 'Your approach to investing and what you look for in startups',
      validation: (Rule) => Rule.max(1000),
    }),
    defineField({
      name: 'valueAdd',
      title: 'Value Add',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Strategic Guidance', value: 'strategic-guidance' },
          { title: 'Business Development', value: 'business-development' },
          { title: 'Customer Introductions', value: 'customer-introductions' },
          { title: 'Talent Acquisition', value: 'talent-acquisition' },
          { title: 'Technical Expertise', value: 'technical-expertise' },
          { title: 'Marketing & PR', value: 'marketing-pr' },
          { title: 'Fundraising Support', value: 'fundraising-support' },
          { title: 'International Expansion', value: 'international-expansion' },
          { title: 'Regulatory Guidance', value: 'regulatory-guidance' },
          { title: 'Board Participation', value: 'board-participation' },
          { title: 'Mentorship', value: 'mentorship' },
          { title: 'Network Access', value: 'network-access' },
        ],
      },
      description: 'How do you add value beyond capital?',
    }),

    // Portfolio Information
    defineField({
      name: 'portfolioSize',
      title: 'Portfolio Size',
      type: 'number',
      description: 'Number of companies in your portfolio',
    }),
    defineField({
      name: 'notableInvestments',
      title: 'Notable Investments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'companyName',
              title: 'Company Name',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
            }),
            defineField({
              name: 'outcome',
              title: 'Outcome',
              type: 'string',
              options: {
                list: [
                  { title: 'Active', value: 'active' },
                  { title: 'IPO', value: 'ipo' },
                  { title: 'Acquired', value: 'acquired' },
                  { title: 'Unicorn', value: 'unicorn' },
                  { title: 'Failed', value: 'failed' },
                ],
              },
            }),
            defineField({
              name: 'year',
              title: 'Investment Year',
              type: 'number',
            }),
          ],
        },
      ],
    }),

    // Contact and Social
    defineField({
      name: 'contactPreferences',
      title: 'Contact Preferences',
      type: 'object',
      fields: [
        defineField({
          name: 'acceptsColdOutreach',
          title: 'Accepts Cold Outreach',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'preferredContactMethod',
          title: 'Preferred Contact Method',
          type: 'string',
          options: {
            list: [
              { title: 'Email', value: 'email' },
              { title: 'LinkedIn', value: 'linkedin' },
              { title: 'Warm Introduction', value: 'warm-intro' },
              { title: 'Platform Message', value: 'platform' },
            ],
          },
        }),
        defineField({
          name: 'responseTime',
          title: 'Typical Response Time',
          type: 'string',
          options: {
            list: [
              { title: '24 hours', value: '24h' },
              { title: '2-3 days', value: '2-3d' },
              { title: '1 week', value: '1w' },
              { title: '2+ weeks', value: '2w+' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        defineField({
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
        }),
        defineField({
          name: 'twitter',
          title: 'Twitter',
          type: 'url',
        }),
        defineField({
          name: 'website',
          title: 'Personal Website',
          type: 'url',
        }),
        defineField({
          name: 'firmWebsite',
          title: 'Firm Website',
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

    // Verification and Status
    defineField({
      name: 'verified',
      title: 'Verified Investor',
      type: 'boolean',
      description: 'Has this investor been verified by administrators?',
      initialValue: false,
    }),
    defineField({
      name: 'accredited',
      title: 'Accredited Investor',
      type: 'boolean',
      description: 'Is this an accredited investor?',
      initialValue: false,
    }),
    defineField({
      name: 'activelyInvesting',
      title: 'Actively Investing',
      type: 'boolean',
      description: 'Is this investor currently making new investments?',
      initialValue: true,
    }),
    defineField({
      name: 'visibility',
      title: 'Profile Visibility',
      type: 'string',
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Community Only', value: 'community' },
          { title: 'Verified Startups Only', value: 'verified-startups' },
          { title: 'Private', value: 'private' },
        ],
      },
      initialValue: 'community',
    }),

    // Analytics
    defineField({
      name: 'profileViews',
      title: 'Profile Views',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'connectionsRequested',
      title: 'Connections Requested',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'connectionsAccepted',
      title: 'Connections Accepted',
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
      title: 'user.userId',
      subtitle: 'firmName',
      media: 'profileImage',
      investorType: 'investorType',
      verified: 'verified',
    },
    prepare(selection) {
      const { title, subtitle, media, investorType, verified } = selection;
      const verifiedBadge = verified ? '✓' : '';
      return {
        title: `${title} ${verifiedBadge}`,
        subtitle: `${subtitle} • ${investorType}`,
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
      title: 'Most Viewed',
      name: 'profileViewsDesc',
      by: [{ field: 'profileViews', direction: 'desc' }],
    },
    {
      title: 'Verified First',
      name: 'verifiedFirst',
      by: [
        { field: 'verified', direction: 'desc' },
        { field: 'createdAt', direction: 'desc' }
      ],
    },
  ],
});
