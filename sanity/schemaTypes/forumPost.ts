import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'forumPost',
  title: 'Forum Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // Core Post Information
    defineField({
      name: 'title',
      title: 'Post Title',
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
      name: 'content',
      title: 'Post Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
        },
        {
          type: 'code',
          options: {
            language: 'javascript',
            languageAlternatives: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'Java', value: 'java' },
              { title: 'C++', value: 'cpp' },
              { title: 'SQL', value: 'sql' },
              { title: 'JSON', value: 'json' },
            ],
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // Forum and Author
    defineField({
      name: 'forum',
      title: 'Forum',
      type: 'reference',
      to: [{ type: 'discussionForum' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Is Anonymous',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this post is anonymous',
    }),

    // Post Classification
    defineField({
      name: 'postType',
      title: 'Post Type',
      type: 'string',
      options: {
        list: [
          { title: 'Discussion', value: 'discussion' },
          { title: 'Question', value: 'question' },
          { title: 'Announcement', value: 'announcement' },
          { title: 'Resource Share', value: 'resource' },
          { title: 'Success Story', value: 'success' },
          { title: 'Help Request', value: 'help' },
          { title: 'Feedback Request', value: 'feedback' },
          { title: 'Job Posting', value: 'job' },
          { title: 'Event Announcement', value: 'event' },
          { title: 'Poll', value: 'poll' },
        ],
      },
      initialValue: 'discussion',
      validation: (Rule) => Rule.required(),
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
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'General', value: 'general' },
          { title: 'Technical', value: 'technical' },
          { title: 'Business', value: 'business' },
          { title: 'Funding', value: 'funding' },
          { title: 'Product', value: 'product' },
          { title: 'Marketing', value: 'marketing' },
          { title: 'Team', value: 'team' },
          { title: 'Legal', value: 'legal' },
          { title: 'Industry Specific', value: 'industry' },
        ],
      },
    }),

    // Related Content
    defineField({
      name: 'relatedStartup',
      title: 'Related Startup',
      type: 'reference',
      to: [{ type: 'startup' }],
      description: 'If post is about a specific startup',
    }),
    defineField({
      name: 'relatedEvent',
      title: 'Related Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'If post is about a specific event',
    }),
    defineField({
      name: 'relatedResource',
      title: 'Related Resource',
      type: 'reference',
      to: [{ type: 'resource' }],
      description: 'If post is sharing a specific resource',
    }),

    // Post Features
    defineField({
      name: 'isPinned',
      title: 'Is Pinned',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this post is pinned to the top',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Is Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Whether this post is featured',
    }),
    defineField({
      name: 'allowComments',
      title: 'Allow Comments',
      type: 'boolean',
      initialValue: true,
      description: 'Whether comments are allowed on this post',
    }),
    defineField({
      name: 'allowVoting',
      title: 'Allow Voting',
      type: 'boolean',
      initialValue: true,
      description: 'Whether voting is allowed on this post',
    }),

    // Voting and Engagement
    defineField({
      name: 'upvotes',
      title: 'Upvotes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'downvotes',
      title: 'Downvotes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'score',
      title: 'Score',
      type: 'number',
      description: 'Calculated score (upvotes - downvotes)',
      initialValue: 0,
    }),
    defineField({
      name: 'commentCount',
      title: 'Comment Count',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      initialValue: 0,
    }),

    // Poll Data (if post type is poll)
    defineField({
      name: 'pollData',
      title: 'Poll Data',
      type: 'object',
      hidden: ({ parent }) => parent?.postType !== 'poll',
      fields: [
        defineField({
          name: 'question',
          title: 'Poll Question',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'options',
          title: 'Poll Options',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'option',
                  title: 'Option',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'votes',
                  title: 'Votes',
                  type: 'number',
                  initialValue: 0,
                }),
              ],
            },
          ],
          validation: (Rule) => Rule.min(2).max(10),
        }),
        defineField({
          name: 'allowMultipleChoices',
          title: 'Allow Multiple Choices',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'endDate',
          title: 'Poll End Date',
          type: 'datetime',
        }),
        defineField({
          name: 'totalVotes',
          title: 'Total Votes',
          type: 'number',
          initialValue: 0,
        }),
      ],
    }),

    // Status and Moderation
    defineField({
      name: 'status',
      title: 'Post Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published', value: 'published' },
          { title: 'Draft', value: 'draft' },
          { title: 'Pending Review', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Archived', value: 'archived' },
          { title: 'Locked', value: 'locked' },
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
      description: 'Notes from moderators',
    }),
    defineField({
      name: 'reportCount',
      title: 'Report Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of times this post has been reported',
    }),

    // AI and Analytics
    defineField({
      name: 'sentiment',
      title: 'AI Sentiment Analysis',
      type: 'string',
      options: {
        list: [
          { title: 'Positive', value: 'positive' },
          { title: 'Neutral', value: 'neutral' },
          { title: 'Negative', value: 'negative' },
        ],
      },
    }),
    defineField({
      name: 'topics',
      title: 'AI-Detected Topics',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Topics automatically detected by AI',
    }),
    defineField({
      name: 'qualityScore',
      title: 'AI Quality Score',
      type: 'number',
      description: 'AI-calculated quality score (0-100)',
    }),
    defineField({
      name: 'engagementScore',
      title: 'Engagement Score',
      type: 'number',
      description: 'Calculated engagement score based on votes, comments, views',
    }),

    // SEO and Discovery
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short excerpt for previews and SEO',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Custom SEO title (optional)',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      description: 'Custom SEO description (optional)',
      validation: (Rule) => Rule.max(160),
    }),

    // Timestamps
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'lastActivity',
      title: 'Last Activity',
      type: 'datetime',
      description: 'When the last comment or vote was made',
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
      authorName: 'author.userId',
      forumTitle: 'forum.title',
      postType: 'postType',
      status: 'status',
      score: 'score',
      commentCount: 'commentCount',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, authorName, forumTitle, postType, status, score, commentCount, publishedAt } = selection;
      const date = new Date(publishedAt).toLocaleDateString();
      const statusIcon = status === 'published' ? '🟢' : status === 'pending' ? '🟡' : '🔴';
      const typeIcon = postType === 'question' ? '❓' : postType === 'announcement' ? '📢' : postType === 'poll' ? '📊' : '💬';
      
      return {
        title: `${title} ${typeIcon} ${statusIcon}`,
        subtitle: `${authorName} in ${forumTitle} • Score: ${score} • Comments: ${commentCount} • ${date}`,
      };
    },
  },

  orderings: [
    {
      title: 'Hot (Score + Recent)',
      name: 'hot',
      by: [
        { field: 'score', direction: 'desc' },
        { field: 'lastActivity', direction: 'desc' }
      ],
    },
    {
      title: 'Most Recent',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Highest Score',
      name: 'scoreDesc',
      by: [{ field: 'score', direction: 'desc' }],
    },
    {
      title: 'Most Comments',
      name: 'commentCountDesc',
      by: [{ field: 'commentCount', direction: 'desc' }],
    },
    {
      title: 'Most Views',
      name: 'viewCountDesc',
      by: [{ field: 'viewCount', direction: 'desc' }],
    },
    {
      title: 'By Forum',
      name: 'forumAsc',
      by: [
        { field: 'forum.title', direction: 'asc' },
        { field: 'publishedAt', direction: 'desc' }
      ],
    },
  ],
});
