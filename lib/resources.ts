// Resource management utilities and types

export interface ResourceFormData {
  title: string;
  description: string;
  content?: any[];
  resourceType: ResourceType;
  category: string;
  additionalCategories?: string[];
  tags?: string[];
  file?: any;
  externalUrl?: string;
  thumbnailImage?: any;
  contributors?: string[];
  difficulty?: ResourceDifficulty;
  estimatedTime?: string;
  price?: ResourcePrice;
  requirements?: string[];
  accessLevel?: ResourceAccessLevel;
}

export interface ResourcePrice {
  isFree: boolean;
  amount?: number;
  currency?: string;
  priceNote?: string;
}

export interface ResourceCategory {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  icon: string;
  color: string;
  featured: boolean;
  sortOrder: number;
  parentCategory?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  resourceCount?: number;
}

export type ResourceType = 
  | "pdf"
  | "spreadsheet"
  | "presentation"
  | "video"
  | "audio"
  | "image"
  | "template"
  | "tool"
  | "link"
  | "course"
  | "book"
  | "article"
  | "research"
  | "other";

export type ResourceDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type ResourceStatus = "draft" | "published" | "archived" | "review";

export type ResourceAccessLevel = "public" | "community" | "premium" | "restricted";

export interface ResourceSummary {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  resourceType: ResourceType;
  thumbnailImage?: any;
  category: ResourceCategory;
  additionalCategories?: ResourceCategory[];
  tags?: string[];
  difficulty: ResourceDifficulty;
  estimatedTime?: string;
  price: ResourcePrice;
  featured: boolean;
  accessLevel: ResourceAccessLevel;
  downloadCount: number;
  viewCount: number;
  rating: {
    average: number;
    count: number;
  };
  author: {
    _id: string;
    userId: string;
    role: string;
    company?: string;
    position?: string;
  };
  createdAt: string;
  publishedAt?: string;
}

export interface ResourceDetails extends ResourceSummary {
  content?: any[];
  file?: any;
  externalUrl?: string;
  contributors?: Array<{
    _id: string;
    userId: string;
    role: string;
    company?: string;
    position?: string;
  }>;
  requirements?: string[];
  status: ResourceStatus;
  updatedAt?: string;
}

export interface ResourceDownload {
  _id: string;
  downloadedAt: string;
  downloadMethod: string;
  resource: {
    _id: string;
    title: string;
    slug: { current: string };
    resourceType: ResourceType;
    thumbnailImage?: any;
    category: ResourceCategory;
  };
}

export interface ResourceRating {
  _id: string;
  rating: number;
  review?: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  createdAt: string;
  user: {
    _id: string;
    userId: string;
    role: string;
    company?: string;
    position?: string;
  };
}

// Utility functions
export function getResourceTypeLabel(resourceType: ResourceType): string {
  const labels: Record<ResourceType, string> = {
    pdf: "PDF Document",
    spreadsheet: "Spreadsheet",
    presentation: "Presentation",
    video: "Video",
    audio: "Audio/Podcast",
    image: "Image/Infographic",
    template: "Template",
    tool: "Tool/Software",
    link: "Website/Link",
    course: "Course/Tutorial",
    book: "Book/eBook",
    article: "Article/Blog Post",
    research: "Research/Report",
    other: "Other",
  };

  return labels[resourceType] || resourceType;
}

export function getResourceTypeIcon(resourceType: ResourceType): string {
  const icons: Record<ResourceType, string> = {
    pdf: "📄",
    spreadsheet: "📊",
    presentation: "📽️",
    video: "🎥",
    audio: "🎧",
    image: "🖼️",
    template: "📋",
    tool: "🔧",
    link: "🔗",
    course: "🎓",
    book: "📚",
    article: "📰",
    research: "🔬",
    other: "📁",
  };

  return icons[resourceType] || "📁";
}

export function getDifficultyLabel(difficulty: ResourceDifficulty): string {
  const labels: Record<ResourceDifficulty, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
  };

  return labels[difficulty] || difficulty;
}

export function getDifficultyColor(difficulty: ResourceDifficulty): string {
  const colors: Record<ResourceDifficulty, string> = {
    beginner: "green",
    intermediate: "blue",
    advanced: "orange",
    expert: "red",
  };

  return colors[difficulty] || "gray";
}

export function getAccessLevelLabel(accessLevel: ResourceAccessLevel): string {
  const labels: Record<ResourceAccessLevel, string> = {
    public: "Public",
    community: "Community Members",
    premium: "Premium Members",
    restricted: "Restricted Access",
  };

  return labels[accessLevel] || accessLevel;
}

export function getAccessLevelIcon(accessLevel: ResourceAccessLevel): string {
  const icons: Record<ResourceAccessLevel, string> = {
    public: "🌍",
    community: "👥",
    premium: "⭐",
    restricted: "🔒",
  };

  return icons[accessLevel] || "🔒";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDownloadCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1) + "K";
  return (count / 1000000).toFixed(1) + "M";
}

export function formatRating(rating: { average: number; count: number }): string {
  if (rating.count === 0) return "No ratings";
  return `${rating.average.toFixed(1)} (${rating.count} rating${rating.count !== 1 ? "s" : ""})`;
}

export function canAccessResource(
  resource: ResourceSummary,
  userRole?: string,
  isAuthenticated?: boolean
): {
  canAccess: boolean;
  reason?: string;
} {
  if (resource.accessLevel === "public") {
    return { canAccess: true };
  }

  if (!isAuthenticated) {
    return {
      canAccess: false,
      reason: "Authentication required",
    };
  }

  if (resource.accessLevel === "community") {
    return { canAccess: true };
  }

  if (resource.accessLevel === "premium") {
    // Check if user has premium access (implement based on your business logic)
    return {
      canAccess: false,
      reason: "Premium membership required",
    };
  }

  if (resource.accessLevel === "restricted") {
    // Only admins can access restricted resources
    return {
      canAccess: false,
      reason: "Restricted access",
    };
  }

  return { canAccess: true };
}

export function validateResourceData(data: Partial<ResourceFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Resource title is required");
  }

  if (!data.description?.trim()) {
    errors.push("Resource description is required");
  }

  if (!data.resourceType) {
    errors.push("Resource type is required");
  }

  if (!data.category) {
    errors.push("Primary category is required");
  }

  if (!data.file && !data.externalUrl) {
    errors.push("Either file upload or external URL is required");
  }

  if (data.file && data.externalUrl) {
    errors.push("Please provide either a file upload OR external URL, not both");
  }

  if (data.externalUrl && !isValidUrl(data.externalUrl)) {
    errors.push("Please provide a valid URL");
  }

  if (data.price && !data.price.isFree && (!data.price.amount || data.price.amount <= 0)) {
    errors.push("Price amount is required for paid resources");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function getResourceUrl(resource: ResourceSummary): string {
  return `/resources/${resource.slug.current}`;
}

export function getCategoryUrl(category: ResourceCategory): string {
  return `/resources/category/${category.slug.current}`;
}

export function getDownloadUrl(resourceId: string): string {
  return `/api/resources/${resourceId}/download`;
}

export function shouldShowDownloadButton(resource: ResourceSummary): boolean {
  return !!(resource.file || resource.externalUrl);
}

export function getEstimatedReadTime(content: any[]): string {
  if (!content || content.length === 0) return "Unknown";

  // Simple estimation: ~200 words per minute reading speed
  const wordCount = content
    .filter(block => block._type === "block")
    .reduce((count, block) => {
      const text = block.children
        ?.map((child: any) => child.text)
        .join(" ") || "";
      return count + text.split(/\s+/).length;
    }, 0);

  const minutes = Math.ceil(wordCount / 200);
  
  if (minutes < 1) return "< 1 min read";
  if (minutes === 1) return "1 min read";
  return `${minutes} min read`;
}
