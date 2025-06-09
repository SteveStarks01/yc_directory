import { defineField, defineType } from 'sanity';
import { Users } from 'lucide-react';

export default defineType({
  name: 'communityMember',
  title: 'Community Member',
  type: 'document',
  icon: Users,
  fields: [
    // Core Membership Information
    defineField({
      name: 'community',
      title: 'Community',
      type: 'reference',
      to: [{ type: 'startupCommunity' }],
      validation: (Rule) => Rule.required(),
      description: 'The community this membership belongs to',
    }),
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      validation: (Rule) => Rule.required(),
      description: 'The user who is a member of this community',
    }),
    
    // Member Role and Permissions
    defineField({
      name: 'role',
      title: 'Member Role',
      type: 'string',
      options: {
        list: [
          { title: 'Owner', value: 'owner' },
          { title: 'Admin', value: 'admin' },
          { title: 'Moderator', value: 'moderator' },
          { title: 'Member', value: 'member' },
        ],
      },
      initialValue: 'member',
      validation: (Rule) => Rule.required(),
      description: 'The role of the user in this community',
    }),
    defineField({
      name: 'permissions',
      title: 'Permissions',
      type: 'object',
      fields: [
        defineField({
          name: 'canPost',
          title: 'Can Create Posts',
          type: 'boolean',
          initialValue: true,
          description: 'Can create new posts in the community',
        }),
        defineField({
          name: 'canComment',
          title: 'Can Comment',
          type: 'boolean',
          initialValue: true,
          description: 'Can comment on posts',
        }),
        defineField({
          name: 'canModerate',
          title: 'Can Moderate',
          type: 'boolean',
          initialValue: false,
          description: 'Can moderate posts and comments',
        }),
        defineField({
          name: 'canInvite',
          title: 'Can Invite Members',
          type: 'boolean',
          initialValue: false,
          description: 'Can invite new members to the community',
        }),
        defineField({
          name: 'canManageMembers',
          title: 'Can Manage Members',
          type: 'boolean',
          initialValue: false,
          description: 'Can add/remove members and change roles',
        }),
      ],
      description: 'Specific permissions for this member',
    }),

    // Membership Status
    defineField({
      name: 'status',
      title: 'Membership Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Pending', value: 'pending' },
          { title: 'Suspended', value: 'suspended' },
          { title: 'Banned', value: 'banned' },
          { title: 'Left', value: 'left' },
        ],
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
      description: 'Current status of the membership',
    }),
    defineField({
      name: 'invitedBy',
      title: 'Invited By',
      type: 'reference',
      to: [{ type: 'userProfile' }],
      description: 'User who invited this member (if applicable)',
    }),
    defineField({
      name: 'inviteMessage',
      title: 'Invite Message',
      type: 'text',
      description: 'Message sent with the invitation',
    }),

    // Activity Tracking
    defineField({
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
      description: 'When the user joined the community',
    }),
    defineField({
      name: 'lastActive',
      title: 'Last Active',
      type: 'datetime',
      description: 'Last time the member was active in the community',
    }),
    defineField({
      name: 'postCount',
      title: 'Post Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of posts created by this member',
    }),
    defineField({
      name: 'commentCount',
      title: 'Comment Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of comments made by this member',
    }),

    // Moderation Fields
    defineField({
      name: 'moderationNotes',
      title: 'Moderation Notes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'note',
              title: 'Note',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'moderator',
              title: 'Moderator',
              type: 'reference',
              to: [{ type: 'userProfile' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'createdAt',
              title: 'Created At',
              type: 'datetime',
              validation: (Rule) => Rule.required(),
              initialValue: () => new Date().toISOString(),
            }),
            defineField({
              name: 'type',
              title: 'Note Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Warning', value: 'warning' },
                  { title: 'Suspension', value: 'suspension' },
                  { title: 'Ban', value: 'ban' },
                  { title: 'General', value: 'general' },
                ],
              },
              initialValue: 'general',
            }),
          ],
        },
      ],
      description: 'Moderation notes and actions for this member',
    }),

    // Timestamps
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'When this membership was last updated',
    }),
  ],

  preview: {
    select: {
      title: 'user.name',
      subtitle: 'community.name',
      media: 'user.image',
      role: 'role',
      status: 'status',
    },
    prepare(selection) {
      const { title, subtitle, role, status } = selection;
      return {
        title: title || 'Unknown User',
        subtitle: `${role} in ${subtitle || 'Unknown Community'} (${status})`,
      };
    },
  },

  orderings: [
    {
      title: 'Joined Date, New',
      name: 'joinedAtDesc',
      by: [{ field: 'joinedAt', direction: 'desc' }],
    },
    {
      title: 'Last Active',
      name: 'lastActiveDesc',
      by: [{ field: 'lastActive', direction: 'desc' }],
    },
    {
      title: 'Role',
      name: 'roleAsc',
      by: [{ field: 'role', direction: 'asc' }],
    },
  ],
});
