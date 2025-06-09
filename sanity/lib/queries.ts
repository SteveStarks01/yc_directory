import { defineQuery } from "next-sanity";

// Basic startup query for homepage (without pagination parameters)
// Updated to be consistent with API endpoints - only show active startups
export const STARTUPS_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) [0...20] {
  _id,
  title,
  slug,
  _createdAt,
  author -> {
    _id, name, image
  },
  views,
  description,
  category,
  image,
}`);

// Optimized startup queries with pagination parameters
export const STARTUPS_PAGINATED_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) [$start...$end] {
  _id,
  title,
  slug,
  _createdAt,
  author -> {
    _id, name, image
  },
  views,
  description,
  category,
  image,
}`);

// Count query for pagination
export const STARTUPS_COUNT_QUERY = defineQuery(`
  count(*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)])
`);

// Optimized query for startup cards (minimal data) - with pagination
export const STARTUPS_CARD_QUERY = defineQuery(`
  *[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) [$start...$end] {
    _id,
    title,
    slug,
    _createdAt,
    "authorName": author->name,
    "authorImage": author->image,
    "authorId": author->_id,
    views,
    category,
    image,
  }
`);

export const STARTUP_BY_ID_QUERY =
  defineQuery(`*[_type == "startup" && _id == $id][0]{
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, username, image, bio
  }, 
  views,
  description,
  category,
  image,
  pitch,
}`);

export const STARTUP_VIEWS_QUERY = defineQuery(`
    *[_type == "startup" && _id == $id][0]{
        _id, views
    }
`);

export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`
*[_type == "author" && id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
}
`);

export const AUTHOR_BY_ID_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio
}
`);

export const STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "startup" && author._ref == $id] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
}`);

export const PLAYLIST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "playlist" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  select[]->{
    _id,
    _createdAt,
    title,
    slug,
    author->{
      _id,
      name,
      slug,
      image,
      bio
    },
    views,
    description,
    category,
    image,
    pitch
  }
}`);

// Fallback query for editor picks when playlist doesn't exist
export const EDITOR_PICKS_FALLBACK_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current)] | order(_createdAt desc) [0...6] {
  _id,
  _createdAt,
  title,
  slug,
  author->{
    _id,
    name,
    slug,
    image,
    bio
  },
  views,
  description,
  category,
  image,
  pitch
}`);

// Optimized community queries
export const COMMUNITY_POSTS_QUERY = defineQuery(`
  *[_type == "communityPost" && community._ref == $communityId] | order(publishedAt desc) [$start...$end] {
    _id,
    content,
    postType,
    likes,
    hearts,
    commentCount,
    isPinned,
    isAnnouncement,
    tags,
    publishedAt,
    author->{
      _id,
      userId,
      role
    }
  }
`);

export const COMMUNITY_POSTS_COUNT_QUERY = defineQuery(`
  count(*[_type == "communityPost" && community._ref == $communityId])
`);

export const COMMUNITY_COMMENTS_QUERY = defineQuery(`
  *[_type == "communityComment" && post._ref == $postId] | order(createdAt asc) [$start...$end] {
    _id,
    content,
    threadLevel,
    likes,
    hearts,
    createdAt,
    author->{
      _id,
      userId,
      role
    },
    parentComment->{
      _id
    }
  }
`);

export const COMMUNITY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "startupCommunity" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    description,
    isActive,
    isPublic,
    memberCount,
    postCount,
    createdAt,
    startup->{
      _id,
      title,
      image,
      author->{
        _id,
        userId
      }
    }
  }
`);
