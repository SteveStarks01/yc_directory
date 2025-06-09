import { defineField, defineType } from 'sanity'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  icon: BuildingOffice2Icon,
  fields: [
    // Core Sponsor Information
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'companyName',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Company Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Company Description',
      type: 'text',
      validation: (Rule) => Rule.required().max(500),
    }),

    // Contact Information
    defineField({
      name: 'primaryContact',
      title: 'Primary Contact',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Contact Name',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (Rule) => Rule.required().email(),
        }),
        defineField({
          name: 'phone',
          title: 'Phone',
          type: 'string',
        }),
        defineField({
          name: 'title',
          title: 'Job Title',
          type: 'string',
        }),
        defineField({
          name: 'linkedIn',
          title: 'LinkedIn Profile',
          type: 'url',
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'billingContact',
      title: 'Billing Contact',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Contact Name',
          type: 'string',
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (Rule) => Rule.email(),
        }),
        defineField({
          name: 'phone',
          title: 'Phone',
          type: 'string',
        }),
        defineField({
          name: 'address',
          title: 'Billing Address',
          type: 'text',
        }),
      ],
    }),

    // Company Details
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      options: {
        list: [
          { title: 'Technology', value: 'technology' },
          { title: 'Financial Services', value: 'financial-services' },
          { title: 'Healthcare', value: 'healthcare' },
          { title: 'Consulting', value: 'consulting' },
          { title: 'Legal Services', value: 'legal' },
          { title: 'Marketing & Advertising', value: 'marketing' },
          { title: 'Real Estate', value: 'real-estate' },
          { title: 'Education', value: 'education' },
          { title: 'Manufacturing', value: 'manufacturing' },
          { title: 'Retail', value: 'retail' },
          { title: 'Media & Entertainment', value: 'media' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'companySize',
      title: 'Company Size',
      type: 'string',
      options: {
        list: [
          { title: '1-10 employees', value: '1-10' },
          { title: '11-50 employees', value: '11-50' },
          { title: '51-200 employees', value: '51-200' },
          { title: '201-500 employees', value: '201-500' },
          { title: '501-1000 employees', value: '501-1000' },
          { title: '1000+ employees', value: '1000+' },
        ],
      },
    }),
    defineField({
      name: 'location',
      title: 'Headquarters Location',
      type: 'string',
    }),
    defineField({
      name: 'foundedYear',
      title: 'Founded Year',
      type: 'number',
      validation: (Rule) => Rule.min(1800).max(new Date().getFullYear()),
    }),

    // Sponsorship Information
    defineField({
      name: 'sponsorshipTier',
      title: 'Current Sponsorship Tier',
      type: 'string',
      options: {
        list: [
          { title: 'Platinum', value: 'platinum' },
          { title: 'Gold', value: 'gold' },
          { title: 'Silver', value: 'silver' },
          { title: 'Bronze', value: 'bronze' },
          { title: 'Community', value: 'community' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sponsorshipTypes',
      title: 'Sponsorship Types',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Platform Sponsor', value: 'platform' },
          { title: 'Event Sponsor', value: 'event' },
          { title: 'Startup Sponsor', value: 'startup' },
          { title: 'Content Sponsor', value: 'content' },
          { title: 'Newsletter Sponsor', value: 'newsletter' },
          { title: 'Demo Day Sponsor', value: 'demo-day' },
          { title: 'Award Sponsor', value: 'award' },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'sponsorshipGoals',
      title: 'Sponsorship Goals',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Brand Awareness', value: 'brand-awareness' },
          { title: 'Lead Generation', value: 'lead-generation' },
          { title: 'Talent Acquisition', value: 'talent-acquisition' },
          { title: 'Customer Acquisition', value: 'customer-acquisition' },
          { title: 'Thought Leadership', value: 'thought-leadership' },
          { title: 'Community Building', value: 'community-building' },
          { title: 'Product Promotion', value: 'product-promotion' },
          { title: 'Partnership Opportunities', value: 'partnerships' },
        ],
      },
    }),

    // Contract and Billing
    defineField({
      name: 'contractDetails',
      title: 'Contract Details',
      type: 'object',
      fields: [
        defineField({
          name: 'startDate',
          title: 'Contract Start Date',
          type: 'date',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'endDate',
          title: 'Contract End Date',
          type: 'date',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'monthlyAmount',
          title: 'Monthly Amount ($)',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'totalAmount',
          title: 'Total Contract Amount ($)',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'paymentTerms',
          title: 'Payment Terms',
          type: 'string',
          options: {
            list: [
              { title: 'Monthly', value: 'monthly' },
              { title: 'Quarterly', value: 'quarterly' },
              { title: 'Semi-Annual', value: 'semi-annual' },
              { title: 'Annual', value: 'annual' },
              { title: 'One-time', value: 'one-time' },
            ],
          },
          initialValue: 'monthly',
        }),
        defineField({
          name: 'autoRenewal',
          title: 'Auto Renewal',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),

    // Benefits and Deliverables
    defineField({
      name: 'benefits',
      title: 'Sponsorship Benefits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'benefit',
              title: 'Benefit',
              type: 'string',
              options: {
                list: [
                  { title: 'Logo on Homepage', value: 'homepage-logo' },
                  { title: 'Logo in Header', value: 'header-logo' },
                  { title: 'Logo in Footer', value: 'footer-logo' },
                  { title: 'Sponsored Content', value: 'sponsored-content' },
                  { title: 'Newsletter Mention', value: 'newsletter-mention' },
                  { title: 'Event Branding', value: 'event-branding' },
                  { title: 'Demo Day Sponsorship', value: 'demo-day-sponsorship' },
                  { title: 'Startup Profile Sponsorship', value: 'startup-sponsorship' },
                  { title: 'Analytics Dashboard Access', value: 'analytics-access' },
                  { title: 'Priority Support', value: 'priority-support' },
                  { title: 'Custom Integration', value: 'custom-integration' },
                ],
              },
            }),
            defineField({
              name: 'description',
              title: 'Benefit Description',
              type: 'text',
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity/Frequency',
              type: 'string',
              description: 'e.g., "2 per month", "unlimited", "1 per quarter"',
            }),
            defineField({
              name: 'isActive',
              title: 'Is Active',
              type: 'boolean',
              initialValue: true,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'customBenefits',
      title: 'Custom Benefits',
      type: 'text',
      description: 'Any custom benefits not covered in the standard list',
    }),

    // Performance Tracking
    defineField({
      name: 'kpis',
      title: 'Key Performance Indicators',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'metric',
              title: 'Metric',
              type: 'string',
              options: {
                list: [
                  { title: 'Brand Impressions', value: 'impressions' },
                  { title: 'Click-through Rate', value: 'ctr' },
                  { title: 'Lead Generation', value: 'leads' },
                  { title: 'Event Attendance', value: 'event-attendance' },
                  { title: 'Content Engagement', value: 'content-engagement' },
                  { title: 'Profile Views', value: 'profile-views' },
                  { title: 'Newsletter Opens', value: 'newsletter-opens' },
                  { title: 'Demo Requests', value: 'demo-requests' },
                ],
              },
            }),
            defineField({
              name: 'target',
              title: 'Target Value',
              type: 'number',
            }),
            defineField({
              name: 'current',
              title: 'Current Value',
              type: 'number',
              initialValue: 0,
            }),
            defineField({
              name: 'unit',
              title: 'Unit',
              type: 'string',
              description: 'e.g., "views", "clicks", "leads", "%"',
            }),
          ],
        },
      ],
    }),

    // Status and Relationship Management
    defineField({
      name: 'status',
      title: 'Sponsor Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Pending', value: 'pending' },
          { title: 'Paused', value: 'paused' },
          { title: 'Expired', value: 'expired' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Renewal Pending', value: 'renewal-pending' },
        ],
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'accountManager',
      title: 'Account Manager',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      description: 'Internal team member managing this sponsor relationship',
    }),
    defineField({
      name: 'satisfactionScore',
      title: 'Satisfaction Score',
      type: 'number',
      description: 'Sponsor satisfaction score (1-10)',
      validation: (Rule) => Rule.min(1).max(10),
    }),
    defineField({
      name: 'renewalProbability',
      title: 'Renewal Probability',
      type: 'number',
      description: 'AI-calculated probability of renewal (0-100%)',
      validation: (Rule) => Rule.min(0).max(100),
    }),

    // Notes and Communication
    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      description: 'Internal notes about the sponsor relationship',
    }),
    defineField({
      name: 'communicationLog',
      title: 'Communication Log',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'date',
              title: 'Date',
              type: 'datetime',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'type',
              title: 'Communication Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Email', value: 'email' },
                  { title: 'Phone Call', value: 'phone' },
                  { title: 'Video Meeting', value: 'video' },
                  { title: 'In-Person Meeting', value: 'in-person' },
                  { title: 'Contract Update', value: 'contract' },
                  { title: 'Performance Review', value: 'review' },
                ],
              },
            }),
            defineField({
              name: 'summary',
              title: 'Summary',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'followUpRequired',
              title: 'Follow-up Required',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'followUpDate',
              title: 'Follow-up Date',
              type: 'date',
            }),
          ],
        },
      ],
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
      companyName: 'companyName',
      logo: 'logo',
      sponsorshipTier: 'sponsorshipTier',
      status: 'status',
      monthlyAmount: 'contractDetails.monthlyAmount',
      endDate: 'contractDetails.endDate',
    },
    prepare(selection) {
      const { companyName, logo, sponsorshipTier, status, monthlyAmount, endDate } = selection;
      const statusIcon = status === 'active' ? '🟢' : status === 'expired' ? '🔴' : '🟡';
      const tierIcon = sponsorshipTier === 'platinum' ? '💎' : sponsorshipTier === 'gold' ? '🥇' : sponsorshipTier === 'silver' ? '🥈' : '🥉';
      const amount = monthlyAmount ? `$${monthlyAmount.toLocaleString()}/mo` : '';
      const expiry = endDate ? new Date(endDate).toLocaleDateString() : '';
      
      return {
        title: `${companyName} ${tierIcon} ${statusIcon}`,
        subtitle: `${sponsorshipTier} • ${amount} • Expires: ${expiry}`,
        media: logo,
      };
    },
  },

  orderings: [
    {
      title: 'By Tier (Highest First)',
      name: 'tierDesc',
      by: [
        { field: 'sponsorshipTier', direction: 'asc' },
        { field: 'contractDetails.monthlyAmount', direction: 'desc' }
      ],
    },
    {
      title: 'By Contract Value',
      name: 'valueDesc',
      by: [{ field: 'contractDetails.totalAmount', direction: 'desc' }],
    },
    {
      title: 'By Expiry Date',
      name: 'expiryAsc',
      by: [{ field: 'contractDetails.endDate', direction: 'asc' }],
    },
    {
      title: 'Active First',
      name: 'statusAsc',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'contractDetails.endDate', direction: 'asc' }
      ],
    },
  ],
});
