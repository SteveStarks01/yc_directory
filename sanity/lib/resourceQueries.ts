import { defineQuery } from "next-sanity";

// Get all published resources with basic info
export const RESOURCES_QUERY = defineQuery(`
  *[_type == "resource" && status == "published"] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    additionalCategories[]->{
      _id,
      name,
      slug,
      icon,
      color
    },
    tags,
    difficulty,
    estimatedTime,
    price,
    featured,
    accessLevel,
    downloadCount,
    viewCount,
    rating,
    author->{
      _id,
      userId,
      role,
      company,
      position
    },
    createdAt,
    publishedAt
  }
`);

// Get featured resources for homepage
export const FEATURED_RESOURCES_QUERY = defineQuery(`
  *[_type == "resource" && status == "published" && featured == true] | order(createdAt desc) [0...6] {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    tags,
    difficulty,
    price,
    downloadCount,
    rating,
    author->{
      _id,
      userId,
      role
    }
  }
`);

// Get single resource by slug with full details
export const RESOURCE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "resource" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    content,
    resourceType,
    thumbnailImage,
    file,
    externalUrl,
    category->{
      _id,
      name,
      slug,
      icon,
      color,
      description
    },
    additionalCategories[]->{
      _id,
      name,
      slug,
      icon,
      color
    },
    tags,
    difficulty,
    estimatedTime,
    price,
    requirements,
    featured,
    status,
    accessLevel,
    downloadCount,
    viewCount,
    rating,
    author->{
      _id,
      userId,
      role,
      bio,
      company,
      position,
      socialLinks
    },
    contributors[]->{
      _id,
      userId,
      role,
      company,
      position
    },
    createdAt,
    updatedAt,
    publishedAt
  }
`);

// Get resources by category
export const RESOURCES_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "resource" && status == "published" && (
    category._ref == $categoryId || 
    $categoryId in additionalCategories[]._ref
  )] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    tags,
    difficulty,
    price,
    downloadCount,
    rating,
    author->{
      _id,
      userId,
      role
    },
    createdAt
  }
`);

// Search resources
export const SEARCH_RESOURCES_QUERY = defineQuery(`
  *[_type == "resource" && status == "published" && (
    title match $searchTerm + "*" ||
    description match $searchTerm + "*" ||
    $searchTerm in tags[] ||
    category->name match $searchTerm + "*"
  )] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    tags,
    difficulty,
    price,
    downloadCount,
    rating,
    author->{
      _id,
      userId,
      role
    }
  }
`);

// Get resources by author
export const RESOURCES_BY_AUTHOR_QUERY = defineQuery(`
  *[_type == "resource" && author._ref == $authorId] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    status,
    downloadCount,
    rating,
    createdAt,
    publishedAt
  }
`);

// Get all resource categories
export const RESOURCE_CATEGORIES_QUERY = defineQuery(`
  *[_type == "resourceCategory" && isActive == true] | order(sortOrder asc, name asc) {
    _id,
    name,
    slug,
    description,
    icon,
    color,
    featured,
    sortOrder,
    parentCategory->{
      _id,
      name,
      slug
    },
    "resourceCount": count(*[_type == "resource" && status == "published" && (
      category._ref == ^._id || 
      ^._id in additionalCategories[]._ref
    )])
  }
`);

// Get featured categories
export const FEATURED_CATEGORIES_QUERY = defineQuery(`
  *[_type == "resourceCategory" && isActive == true && featured == true] | order(sortOrder asc) {
    _id,
    name,
    slug,
    description,
    icon,
    color,
    "resourceCount": count(*[_type == "resource" && status == "published" && (
      category._ref == ^._id || 
      ^._id in additionalCategories[]._ref
    )])
  }
`);

// Get user's downloaded resources
export const USER_DOWNLOADS_QUERY = defineQuery(`
  *[_type == "resourceDownload" && user._ref == $userId && successful == true] | order(downloadedAt desc) {
    _id,
    downloadedAt,
    downloadMethod,
    resource->{
      _id,
      title,
      slug,
      resourceType,
      thumbnailImage,
      category->{
        _id,
        name,
        icon,
        color
      }
    }
  }
`);

// Get resource ratings
export const RESOURCE_RATINGS_QUERY = defineQuery(`
  *[_type == "resourceRating" && resource._ref == $resourceId && status == "published"] | order(createdAt desc) {
    _id,
    rating,
    review,
    helpful,
    notHelpful,
    verified,
    createdAt,
    user->{
      _id,
      userId,
      role,
      company,
      position
    }
  }
`);

// Get user's rating for a resource
export const USER_RESOURCE_RATING_QUERY = defineQuery(`
  *[_type == "resourceRating" && resource._ref == $resourceId && user._ref == $userId][0] {
    _id,
    rating,
    review,
    createdAt,
    updatedAt
  }
`);

// Get resource download analytics
export const RESOURCE_DOWNLOAD_ANALYTICS_QUERY = defineQuery(`
  *[_type == "resourceDownload" && resource._ref == $resourceId && successful == true] {
    _id,
    downloadedAt,
    downloadMethod,
    metadata,
    user->{
      _id,
      userId,
      role
    }
  } | order(downloadedAt desc)
`);

// Get popular resources (most downloaded)
export const POPULAR_RESOURCES_QUERY = defineQuery(`
  *[_type == "resource" && status == "published"] | order(downloadCount desc) [0...10] {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    downloadCount,
    rating,
    author->{
      _id,
      userId,
      role
    }
  }
`);

// Get recently added resources
export const RECENT_RESOURCES_QUERY = defineQuery(`
  *[_type == "resource" && status == "published"] | order(publishedAt desc) [0...10] {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    publishedAt,
    author->{
      _id,
      userId,
      role
    }
  }
`);

// Get resources by type
export const RESOURCES_BY_TYPE_QUERY = defineQuery(`
  *[_type == "resource" && status == "published" && resourceType == $resourceType] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    downloadCount,
    rating,
    author->{
      _id,
      userId,
      role
    }
  }
`);

// Get resources by difficulty
export const RESOURCES_BY_DIFFICULTY_QUERY = defineQuery(`
  *[_type == "resource" && status == "published" && difficulty == $difficulty] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    resourceType,
    thumbnailImage,
    category->{
      _id,
      name,
      slug,
      icon,
      color
    },
    difficulty,
    downloadCount,
    rating,
    author->{
      _id,
      userId,
      role
    }
  }
`);
