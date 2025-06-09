import { defineField, defineType } from 'sanity'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'discussionForum',
  title: 'Discussion Forum',
  type: 'document',
  icon: ChatBubbleBottomCenterTextIcon,
  fields: [
    // Core Forum Information
    defineField({
      name: 'title',
      title: 'Forum Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Forum Description',
      type: 'text',
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'category',
      title: 'Forum Category',
      type: 'string',
      options: {
        list: [
          { title: 'General Discussion', value: 'general' },
          { title: 'Industry Specific', value: 'industry' },
          { title: 'Stage Specific', value: 'stage' },
          { title: 'Technical Discussion', value: 'technical' },
          { title: 'Funding & Investment', value: 'funding' },
          { title: 'Product Development', value: 'product' },
          { title: 'Marketing & Growth', value: 'marketing' },
          { title: 'Team Building', value: 'team' },
          { title: 'Legal & Compliance', value: 'legal' },
          { title: 'Success Stories', value: 'success' },
          { title: 'Challenges & Support', value: 'support' },
          { title: 'Networking', value: 'networking' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // Forum Targeting
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'All Users', value: 'all' },
          { title: 'Founders', value: 'founders' },
          { title: 'Investors', value: 'investors' },
          { title: 'Mentors', value: 'mentors' },
          { title: 'Alumni', value: 'alumni' },
          { title: 'Pre-seed Startups', value: 'pre-seed' },
          { title: 'Seed Startups', value: 'seed' },
          { title: 'Series A+ Startups', value: 'series-a-plus' },
          { title: 'AI/ML Startups', value: 'ai-ml' },
          { title: 'Fintech Startups', value: 'fintech' },
          { title: 'Healthcare Startups', value: 'healthcare' },
          { title: 'Enterprise Startups', value: 'enterprise' },
        ],
      },
    }),
    defineField({
      name: 'industryFocus',
      title: 'Industry Focus',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'AI/ML', value: 'ai-ml' },
          { title: 'Fintech', value: 'fintech' },
          { title: 'Healthcare', value: 'healthcare' },
          { title: 'Enterprise Software', value: 'enterprise' },
          { title: 'Consumer', value: 'consumer' },
          { title: 'E-commerce', value: 'ecommerce' },
          { title: 'Developer Tools', value: 'developer-tools' },
          { title: 'Infrastructure', value: 'infrastructure' },
          { title: 'Climate Tech', value: 'climate' },
          { title: 'Biotech', value: 'biotech' },
        ],
      },
    }),

    // Forum Content
    defineField({
      name: 'author',
      title: 'Forum Creator',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'moderators',
      title: 'Moderators',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'userProfile' }],
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),

    // Forum Settings
    defineField({
      name: 'isPublic',
      title: 'Is Public',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this forum is publicly visible',
    }),
    defineField({
      name: 'allowAnonymous',
      title: 'Allow Anonymous Posts',
      type: 'boolean',
      initialValue: false,
      description: 'Whether anonymous posting is allowed',
    }),
    defineField({
      name: 'requiresApproval',
      title: 'Requires Post Approval',
      type: 'boolean',
      initialValue: false,
      description: 'Whether posts need moderator approval',
    }),
    defineField({
      name: 'allowVoting',
      title: 'Allow Voting on Posts',
      type: 'boolean',
      initialValue: true,
      description: 'Whether users can upvote/downvote posts',
    }),
    defineField({
      name: 'maxPostsPerDay',
      title: 'Max Posts Per Day',
      type: 'number',
      description: 'Maximum posts per user per day (0 = unlimited)',
      initialValue: 0,
    }),

    // Access Control
    defineField({
      name: 'accessLevel',
      title: 'Access Level',
      type: 'string',
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Verified Users Only', value: 'verified' },
          { title: 'Founders Only', value: 'founders' },
          { title: 'Investors Only', value: 'investors' },
          { title: 'Premium Members', value: 'premium' },
          { title: 'Invite Only', value: 'invite' },
        ],
      },
      initialValue: 'public',
    }),
    defineField({
      name: 'minimumReputation',
      title: 'Minimum Reputation',
      type: 'number',
      description: 'Minimum reputation score required to participate',
      initialValue: 0,
    }),

    // Forum Statistics
    defineField({
      name: 'postCount',
      title: 'Post Count',
      type: 'number',
      initialValue: 0,
      description: 'Total number of posts in this forum',
    }),
    defineField({
      name: 'memberCount',
      title: 'Member Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of users who have joined this forum',
    }),
    defineField({
      name: 'lastActivity',
      title: 'Last Activity',
      type: 'datetime',
      description: 'When the last post was made',
    }),
    defineField({
      name: 'popularityScore',
      title: 'Popularity Score',
      type: 'number',
      description: 'AI-calculated popularity score based on engagement',
    }),

    // Featured Content
    defineField({
      name: 'pinnedPosts',
      title: 'Pinned Posts',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'forumPost' }],
        },
      ],
      description: 'Posts that are pinned to the top of the forum',
    }),
    defineField({
      name: 'featuredDiscussions',
      title: 'Featured Discussions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'forumPost' }],
        },
      ],
      description: 'Discussions highlighted by moderators',
    }),

    // Forum Rules and Guidelines
    defineField({
      name: 'rules',
      title: 'Forum Rules',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'rule',
              title: 'Rule',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
            }),
            defineField({
              name: 'severity',
              title: 'Violation Severity',
              type: 'string',
              options: {
                list: [
                  { title: 'Warning', value: 'warning' },
                  { title: 'Temporary Ban', value: 'temp-ban' },
                  { title: 'Permanent Ban', value: 'perm-ban' },
                ],
              },
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'guidelines',
      title: 'Posting Guidelines',
      type: 'text',
      description: 'Guidelines for posting in this forum',
    }),

    // Status and Lifecycle
    defineField({
      name: 'status',
      title: 'Forum Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Archived', value: 'archived' },
          { title: 'Locked', value: 'locked' },
          { title: 'Under Review', value: 'review' },
          { title: 'Suspended', value: 'suspended' },
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'featured',
      title: 'Is Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this forum is featured on the main page',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Order for displaying forums (lower numbers first)',
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
      name: 'archivedAt',
      title: 'Archived At',
      type: 'datetime',
      description: 'When the forum was archived',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      category: 'category',
      postCount: 'postCount',
      memberCount: 'memberCount',
      status: 'status',
      featured: 'featured',
    },
    prepare(selection) {
      const { title, category, postCount, memberCount, status, featured } = selection;
      const statusIcon = status === 'active' ? '🟢' : status === 'archived' ? '📁' : '🔒';
      const featuredIcon = featured ? '⭐' : '';
      
      return {
        title: `${title} ${statusIcon} ${featuredIcon}`,
        subtitle: `${category} • ${postCount || 0} posts • ${memberCount || 0} members`,
      };
    },
  },

  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'sortOrder', direction: 'asc' },
        { field: 'lastActivity', direction: 'desc' }
      ],
    },
    {
      title: 'Most Active',
      name: 'lastActivityDesc',
      by: [{ field: 'lastActivity', direction: 'desc' }],
    },
    {
      title: 'Most Popular',
      name: 'popularityDesc',
      by: [{ field: 'popularityScore', direction: 'desc' }],
    },
    {
      title: 'Most Posts',
      name: 'postCountDesc',
      by: [{ field: 'postCount', direction: 'desc' }],
    },
    {
      title: 'By Category',
      name: 'categoryAsc',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'lastActivity', direction: 'desc' }
      ],
    },
  ],
});
