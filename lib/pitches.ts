// Pitch management utilities and types

export interface PitchFormData {
  title: string;
  startup: string;
  description?: string;
  problem?: string;
  solution?: string;
  marketSize?: string;
  businessModel?: string;
  traction?: string;
  competition?: string;
  askAmount?: number;
  useOfFunds?: string;
  pitchType: PitchType;
  stage?: PitchStage;
  industry?: PitchIndustry;
  tags?: string[];
  pitchVideoUrl?: string;
  demoUrl?: string;
  visibility?: PitchVisibility;
  additionalPresenters?: string[];
  event?: string;
  pitchOrder?: number;
  presentationDate?: string;
}

export interface PitchRatingData {
  pitch: string;
  overallRating: number;
  presentationQuality?: number;
  businessModel?: number;
  marketOpportunity?: number;
  traction?: number;
  team?: number;
  product?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  questions?: string[];
  investmentInterest?: InvestmentInterest;
  potentialInvestmentAmount?: number;
  followUpRequested?: boolean;
  raterType?: RaterType;
  expertise?: string[];
  ratingContext?: RatingContext;
  anonymous?: boolean;
}

export interface PitchCommentData {
  pitch: string;
  content: string;
  commentType?: CommentType;
  isQuestion?: boolean;
  isPrivate?: boolean;
  parentComment?: string;
  authorRole?: AuthorRole;
  expertise?: string[];
  contactRequested?: boolean;
  contactMethod?: ContactMethod;
}

export type PitchType = 
  | "demo-day"
  | "investor"
  | "competition"
  | "practice"
  | "product-demo"
  | "elevator"
  | "other";

export type PitchStage = 
  | "idea"
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b-plus";

export type PitchIndustry = 
  | "ai-ml"
  | "b2b-software"
  | "consumer"
  | "developer-tools"
  | "ecommerce"
  | "education"
  | "enterprise"
  | "fintech"
  | "gaming"
  | "healthcare"
  | "hardware"
  | "infrastructure"
  | "marketplace"
  | "media"
  | "mobile"
  | "real-estate"
  | "robotics"
  | "saas"
  | "social"
  | "transportation"
  | "other";

export type PitchStatus = "draft" | "submitted" | "review" | "approved" | "presented" | "archived";

export type PitchVisibility = "public" | "community" | "investors" | "event-attendees" | "private";

export type InvestmentInterest = 
  | "very-interested"
  | "interested"
  | "somewhat-interested"
  | "not-interested"
  | "need-more-info";

export type RaterType = 
  | "investor"
  | "mentor"
  | "entrepreneur"
  | "expert"
  | "community"
  | "judge"
  | "other";

export type RatingContext = 
  | "live-event"
  | "video-review"
  | "deck-review"
  | "demo-review"
  | "competition"
  | "other";

export type CommentType = 
  | "general"
  | "question"
  | "feedback"
  | "suggestion"
  | "compliment"
  | "concern"
  | "investment"
  | "partnership";

export type AuthorRole = 
  | "investor"
  | "mentor"
  | "entrepreneur"
  | "expert"
  | "customer"
  | "community"
  | "judge"
  | "other";

export type ContactMethod = "email" | "linkedin" | "phone" | "calendar";

export interface PitchSummary {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  problem?: string;
  solution?: string;
  askAmount?: number;
  pitchType: PitchType;
  stage?: PitchStage;
  industry?: PitchIndustry;
  tags?: string[];
  status: PitchStatus;
  visibility: PitchVisibility;
  featured: boolean;
  thumbnailImage?: any;
  pitchVideoUrl?: string;
  demoUrl?: string;
  presentationDate?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  averageRating?: number;
  ratingCount: number;
  createdAt: string;
  updatedAt?: string;
  startup: {
    _id: string;
    name: string;
    slug: { current: string };
    logo?: any;
    industry: string;
    stage: string;
  };
  presenter: {
    _id: string;
    userId: string;
    profileImage?: any;
  };
  event?: {
    _id: string;
    title: string;
    slug: { current: string };
    startDateTime: string;
  };
}

export interface PitchDetails extends PitchSummary {
  marketSize?: string;
  businessModel?: string;
  traction?: string;
  competition?: string;
  useOfFunds?: string;
  pitchVideo?: any;
  pitchDeck?: any;
  demoVideo?: any;
  pitchOrder?: number;
  submittedAt?: string;
  approvedAt?: string;
  additionalPresenters?: Array<{
    _id: string;
    userId: string;
    role: string;
    profileImage?: any;
  }>;
  ratings?: PitchRating[];
  comments?: PitchComment[];
}

export interface PitchRating {
  _id: string;
  overallRating: number;
  presentationQuality?: number;
  businessModel?: number;
  marketOpportunity?: number;
  traction?: number;
  team?: number;
  product?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  investmentInterest?: InvestmentInterest;
  raterType?: RaterType;
  anonymous: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  rater: {
    _id: string;
    userId: string;
    role: string;
    company?: string;
    position?: string;
    profileImage?: any;
  };
}

export interface PitchComment {
  _id: string;
  content: string;
  commentType: CommentType;
  isQuestion: boolean;
  isPrivate: boolean;
  likes: number;
  replies: number;
  authorRole?: AuthorRole;
  contactRequested: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  author: {
    _id: string;
    userId: string;
    role: string;
    company?: string;
    position?: string;
    profileImage?: any;
  };
  childComments?: Array<{
    _id: string;
    content: string;
    likes: number;
    createdAt: string;
    author: {
      _id: string;
      userId: string;
      role: string;
      profileImage?: any;
    };
  }>;
}

// Utility functions
export function getPitchTypeLabel(pitchType: PitchType): string {
  const labels: Record<PitchType, string> = {
    "demo-day": "Demo Day Pitch",
    "investor": "Investor Pitch",
    "competition": "Competition Entry",
    "practice": "Practice Pitch",
    "product-demo": "Product Demo",
    "elevator": "Elevator Pitch",
    "other": "Other",
  };

  return labels[pitchType] || pitchType;
}

export function getPitchStageLabel(stage: PitchStage): string {
  const labels: Record<PitchStage, string> = {
    "idea": "Idea Stage",
    "pre-seed": "Pre-Seed",
    "seed": "Seed",
    "series-a": "Series A",
    "series-b-plus": "Series B+",
  };

  return labels[stage] || stage;
}

export function getPitchIndustryLabel(industry: PitchIndustry): string {
  const labels: Record<PitchIndustry, string> = {
    "ai-ml": "AI/Machine Learning",
    "b2b-software": "B2B Software",
    "consumer": "Consumer",
    "developer-tools": "Developer Tools",
    "ecommerce": "E-commerce",
    "education": "Education",
    "enterprise": "Enterprise Software",
    "fintech": "Fintech",
    "gaming": "Gaming",
    "healthcare": "Healthcare",
    "hardware": "Hardware",
    "infrastructure": "Infrastructure",
    "marketplace": "Marketplace",
    "media": "Media",
    "mobile": "Mobile",
    "real-estate": "Real Estate",
    "robotics": "Robotics",
    "saas": "SaaS",
    "social": "Social",
    "transportation": "Transportation",
    "other": "Other",
  };

  return labels[industry] || industry;
}

export function formatAskAmount(amount: number): string {
  if (amount === 0) return "Undisclosed";
  
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
}

export function formatRating(rating: number): string {
  return `${rating.toFixed(1)}/5.0`;
}

export function getStarRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
}

export function validatePitchData(data: Partial<PitchFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Pitch title is required");
  }

  if (!data.startup) {
    errors.push("Startup selection is required");
  }

  if (!data.pitchType) {
    errors.push("Pitch type is required");
  }

  if (data.askAmount && data.askAmount < 0) {
    errors.push("Ask amount must be positive");
  }

  if (data.pitchVideoUrl && !isValidUrl(data.pitchVideoUrl)) {
    errors.push("Please provide a valid video URL");
  }

  if (data.demoUrl && !isValidUrl(data.demoUrl)) {
    errors.push("Please provide a valid demo URL");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRatingData(data: Partial<PitchRatingData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.pitch) {
    errors.push("Pitch ID is required");
  }

  if (!data.overallRating || data.overallRating < 1 || data.overallRating > 5) {
    errors.push("Overall rating must be between 1 and 5");
  }

  // Validate other rating fields if provided
  const ratingFields = ['presentationQuality', 'businessModel', 'marketOpportunity', 'traction', 'team', 'product'];
  for (const field of ratingFields) {
    const value = data[field as keyof PitchRatingData] as number;
    if (value !== undefined && (value < 1 || value > 5)) {
      errors.push(`${field} rating must be between 1 and 5`);
    }
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

export function getPitchUrl(pitch: PitchSummary): string {
  return `/pitches/${pitch.slug.current}`;
}

export function canViewPitch(
  pitch: PitchSummary,
  userRole?: string,
  isAuthenticated?: boolean,
  isPresenter?: boolean
): {
  canView: boolean;
  reason?: string;
} {
  if (pitch.status === 'draft' && !isPresenter) {
    return {
      canView: false,
      reason: "This pitch is still in draft mode",
    };
  }

  if (pitch.visibility === "public") {
    return { canView: true };
  }

  if (isPresenter) {
    return { canView: true };
  }

  if (pitch.visibility === "private") {
    return {
      canView: false,
      reason: "This pitch is private",
    };
  }

  if (!isAuthenticated) {
    return {
      canView: false,
      reason: "Authentication required to view this pitch",
    };
  }

  if (pitch.visibility === "community") {
    return { canView: true };
  }

  if (pitch.visibility === "investors") {
    // Check if user has investor permissions (implement based on your business logic)
    return {
      canView: false,
      reason: "Investor access required",
    };
  }

  if (pitch.visibility === "event-attendees") {
    // Check if user attended the event (implement based on your business logic)
    return {
      canView: false,
      reason: "Event attendance required",
    };
  }

  return { canView: true };
}
