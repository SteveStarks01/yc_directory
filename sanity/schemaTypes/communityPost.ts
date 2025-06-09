import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default defineType({
  name: 'communityPost',
  title: 'Community Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    // Core Post Information
    defineField({
      name: 'community',
      title: 'Community',
      type: 'reference',
      to: [{ type: 'startupCommunity' }],
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
      name: 'content',
      title: 'Post Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
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
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // Post Type and Media
    defineField({
      name: 'postType',
      title: 'Post Type',
      type: 'string',
      options: {
        list: [
          { title: 'Text Post', value: 'text' },
          { title: 'Image Post', value: 'image' },
          { title: 'Update', value: 'update' },
          { title: 'Milestone', value: 'milestone' },
          { title: 'Question', value: 'question' },
          { title: 'Announcement', value: 'announcement' },
        ],
      },
      initialValue: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      description: 'Additional images for the post',
    }),

    // Engagement
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'hearts',
      title: 'Hearts',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'commentCount',
      title: 'Comment Count',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'shareCount',
      title: 'Share Count',
      type: 'number',
      initialValue: 0,
    }),

    // Post Settings
    defineField({
      name: 'allowComments',
      title: 'Allow Comments',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isPinned',
      title: 'Is Pinned',
      type: 'boolean',
      initialValue: false,
      description: 'Pin this post to the top of the community',
    }),
    defineField({
      name: 'isAnnouncement',
      title: 'Is Announcement',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as important announcement',
    }),

    // Tags and Categories
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),

    // Timestamps
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
      title: 'content',
      author: 'author.role',
      community: 'community.name',
      media: 'images.0',
    },
    prepare(selection) {
      const { title, author, community } = selection;
      const contentText = title?.[0]?.children?.[0]?.text || 'Post content';
      return {
        title: contentText.length > 50 ? `${contentText.substring(0, 50)}...` : contentText,
        subtitle: `by ${author} in ${community}`,
      };
    },
  },

  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Likes',
      name: 'likesDesc',
      by: [{ field: 'likes', direction: 'desc' }],
    },
    {
      title: 'Comments',
      name: 'commentsDesc',
      by: [{ field: 'commentCount', direction: 'desc' }],
    },
  ],
});
