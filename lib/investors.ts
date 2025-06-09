// Investor management utilities and types

export interface InvestorProfileFormData {
  investorType: InvestorType;
  firmName?: string;
  title?: string;
  bio?: string;
  investmentStages: InvestmentStage[];
  preferredIndustries: InvestorIndustry[];
  geographicFocus?: GeographicFocus[];
  minInvestmentAmount?: number;
  maxInvestmentAmount?: number;
  typicalCheckSize?: number;
  investmentsPerYear?: number;
  leadInvestments?: boolean;
  followOnInvestments?: boolean;
  investmentPhilosophy?: string;
  valueAdd?: ValueAdd[];
  portfolioSize?: number;
  notableInvestments?: NotableInvestment[];
  contactPreferences?: ContactPreferences;
  socialLinks?: InvestorSocialLinks;
  accredited?: boolean;
  activelyInvesting?: boolean;
  visibility?: InvestorVisibility;
}

export interface InvestmentInterestFormData {
  startup: string;
  pitch?: string;
  interestLevel: InterestLevel;
  investmentStage: InvestmentStageInterest;
  potentialInvestmentAmount?: number;
  leadInterest?: boolean;
  reasonsForInterest?: ReasonForInterest[];
  notes?: string;
  concerns?: string;
  source?: InterestSource;
  referredBy?: string;
  visibility?: InterestVisibility;
  allowStartupContact?: boolean;
}

export interface ConnectionRequestFormData {
  recipient: string;
  connectionType: ConnectionType;
  relatedStartup?: string;
  relatedPitch?: string;
  relatedEvent?: string;
  subject: string;
  message: string;
  proposedMeetingType?: MeetingType;
  urgency?: Urgency;
  investmentDetails?: InvestmentDetails;
}

export type InvestorType = 
  | "angel"
  | "vc"
  | "corporate-vc"
  | "pe"
  | "family-office"
  | "accelerator"
  | "government"
  | "crowdfunding"
  | "other";

export type InvestmentStage = 
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c-plus"
  | "growth"
  | "late-stage";

export type InvestorIndustry = 
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

export type GeographicFocus = 
  | "north-america"
  | "us"
  | "canada"
  | "europe"
  | "uk"
  | "asia-pacific"
  | "china"
  | "india"
  | "southeast-asia"
  | "latin-america"
  | "middle-east"
  | "africa"
  | "global";

export type ValueAdd = 
  | "strategic-guidance"
  | "business-development"
  | "customer-introductions"
  | "talent-acquisition"
  | "technical-expertise"
  | "marketing-pr"
  | "fundraising-support"
  | "international-expansion"
  | "regulatory-guidance"
  | "board-participation"
  | "mentorship"
  | "network-access";

export type InterestLevel = "very-high" | "high" | "medium" | "low" | "watching";

export type InvestmentStageInterest = "current" | "next" | "future" | "any";

export type ReasonForInterest = 
  | "strong-team"
  | "large-market"
  | "innovative-product"
  | "proven-traction"
  | "competitive-advantage"
  | "scalable-model"
  | "industry-expertise"
  | "strategic-fit"
  | "network-synergies"
  | "tech-innovation"
  | "market-timing"
  | "financial-performance";

export type InterestSource = 
  | "platform"
  | "pitch-event"
  | "demo-day"
  | "referral"
  | "cold-outreach"
  | "warm-intro"
  | "conference"
  | "social-media"
  | "other";

export type InterestVisibility = "private" | "startup-visible" | "public";

export type InvestorVisibility = "public" | "community" | "verified-startups" | "private";

export type ConnectionType = 
  | "investment"
  | "partnership"
  | "mentorship"
  | "advisory"
  | "customer"
  | "networking"
  | "collaboration"
  | "other";

export type MeetingType = 
  | "video-call"
  | "phone-call"
  | "in-person"
  | "coffee-chat"
  | "email"
  | "no-preference";

export type Urgency = "high" | "medium" | "low";

export interface NotableInvestment {
  companyName: string;
  description?: string;
  outcome: "active" | "ipo" | "acquired" | "unicorn" | "failed";
  year?: number;
}

export interface ContactPreferences {
  acceptsColdOutreach: boolean;
  preferredContactMethod: "email" | "linkedin" | "warm-intro" | "platform";
  responseTime: "24h" | "2-3d" | "1w" | "2w+";
}

export interface InvestorSocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
  firmWebsite?: string;
  crunchbase?: string;
  angellist?: string;
}

export interface InvestmentDetails {
  interestedInLeading: boolean;
  potentialAmount?: number;
  timeframe: "immediate" | "1-month" | "3-months" | "6-months" | "future";
  dueDiligenceRequirements: string[];
}

export interface InvestorSummary {
  _id: string;
  investorType: InvestorType;
  firmName?: string;
  title?: string;
  bio?: string;
  profileImage?: any;
  firmLogo?: any;
  investmentStages: InvestmentStage[];
  preferredIndustries: InvestorIndustry[];
  geographicFocus?: GeographicFocus[];
  typicalCheckSize?: number;
  leadInvestments: boolean;
  valueAdd?: ValueAdd[];
  verified: boolean;
  profileViews: number;
  connectionsAccepted: number;
  user: {
    _id: string;
    userId: string;
    role: string;
    location?: any;
  };
  contactPreferences?: ContactPreferences;
  recentInvestments?: NotableInvestment[];
}

export interface InvestorDetails extends InvestorSummary {
  minInvestmentAmount?: number;
  maxInvestmentAmount?: number;
  investmentsPerYear?: number;
  followOnInvestments: boolean;
  investmentPhilosophy?: string;
  portfolioSize?: number;
  notableInvestments?: NotableInvestment[];
  socialLinks?: InvestorSocialLinks;
  accredited: boolean;
  activelyInvesting: boolean;
  visibility: InvestorVisibility;
  connectionsRequested: number;
  createdAt: string;
  updatedAt?: string;
}

// Utility functions
export function getInvestorTypeLabel(type: InvestorType): string {
  const labels: Record<InvestorType, string> = {
    "angel": "Angel Investor",
    "vc": "Venture Capital",
    "corporate-vc": "Corporate VC",
    "pe": "Private Equity",
    "family-office": "Family Office",
    "accelerator": "Accelerator",
    "government": "Government Fund",
    "crowdfunding": "Crowdfunding Platform",
    "other": "Other",
  };

  return labels[type] || type;
}

export function getInvestmentStageLabel(stage: InvestmentStage): string {
  const labels: Record<InvestmentStage, string> = {
    "pre-seed": "Pre-Seed",
    "seed": "Seed",
    "series-a": "Series A",
    "series-b": "Series B",
    "series-c-plus": "Series C+",
    "growth": "Growth",
    "late-stage": "Late Stage",
  };

  return labels[stage] || stage;
}

export function getInterestLevelLabel(level: InterestLevel): string {
  const labels: Record<InterestLevel, string> = {
    "very-high": "Very High",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
    "watching": "Watching",
  };

  return labels[level] || level;
}

export function getInterestLevelColor(level: InterestLevel): string {
  const colors: Record<InterestLevel, string> = {
    "very-high": "red",
    "high": "orange",
    "medium": "yellow",
    "low": "blue",
    "watching": "gray",
  };

  return colors[level] || "gray";
}

export function formatInvestmentAmount(amount: number): string {
  if (amount === 0) return "Undisclosed";
  
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
}

export function getInvestorMatchScore(
  investor: InvestorSummary,
  startup: {
    stage: string;
    industry: string;
    askAmount?: number;
    needsLead?: boolean;
  }
): number {
  let score = 0;

  // Stage match (30 points)
  if (investor.investmentStages.includes(startup.stage as InvestmentStage)) {
    score += 30;
  }

  // Industry match (25 points)
  if (investor.preferredIndustries.includes(startup.industry as InvestorIndustry)) {
    score += 25;
  }

  // Verified investor (20 points)
  if (investor.verified) {
    score += 20;
  }

  // Lead investor match (15 points)
  if (startup.needsLead && investor.leadInvestments) {
    score += 15;
  }

  // Accepts cold outreach (10 points)
  if (investor.contactPreferences?.acceptsColdOutreach) {
    score += 10;
  }

  return score;
}

export function validateInvestorProfileData(data: Partial<InvestorProfileFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.investorType) {
    errors.push("Investor type is required");
  }

  if (!data.investmentStages || data.investmentStages.length === 0) {
    errors.push("At least one investment stage is required");
  }

  if (!data.preferredIndustries || data.preferredIndustries.length === 0) {
    errors.push("At least one preferred industry is required");
  }

  if (data.minInvestmentAmount && data.maxInvestmentAmount && 
      data.minInvestmentAmount > data.maxInvestmentAmount) {
    errors.push("Minimum investment amount cannot be greater than maximum");
  }

  if (data.typicalCheckSize && data.minInvestmentAmount && 
      data.typicalCheckSize < data.minInvestmentAmount) {
    errors.push("Typical check size cannot be less than minimum investment amount");
  }

  if (data.typicalCheckSize && data.maxInvestmentAmount && 
      data.typicalCheckSize > data.maxInvestmentAmount) {
    errors.push("Typical check size cannot be greater than maximum investment amount");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateInvestmentInterestData(data: Partial<InvestmentInterestFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.startup) {
    errors.push("Startup selection is required");
  }

  if (!data.interestLevel) {
    errors.push("Interest level is required");
  }

  if (!data.investmentStage) {
    errors.push("Investment stage is required");
  }

  if (data.potentialInvestmentAmount && data.potentialInvestmentAmount < 0) {
    errors.push("Investment amount must be positive");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateConnectionRequestData(data: Partial<ConnectionRequestFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.recipient) {
    errors.push("Recipient is required");
  }

  if (!data.connectionType) {
    errors.push("Connection type is required");
  }

  if (!data.subject?.trim()) {
    errors.push("Subject is required");
  }

  if (!data.message?.trim()) {
    errors.push("Message is required");
  }

  if (data.message && data.message.length < 20) {
    errors.push("Message must be at least 20 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getInvestorUrl(investor: InvestorSummary): string {
  return `/investors/${investor.user.userId}`;
}

export function canViewInvestorProfile(
  investor: InvestorSummary,
  userRole?: string,
  isAuthenticated?: boolean
): {
  canView: boolean;
  reason?: string;
} {
  if (investor.visibility === "public") {
    return { canView: true };
  }

  if (!isAuthenticated) {
    return {
      canView: false,
      reason: "Authentication required to view this investor profile",
    };
  }

  if (investor.visibility === "community") {
    return { canView: true };
  }

  if (investor.visibility === "verified-startups") {
    // Check if user has verified startup (implement based on your business logic)
    return {
      canView: false,
      reason: "Verified startup required to view this profile",
    };
  }

  if (investor.visibility === "private") {
    return {
      canView: false,
      reason: "This investor profile is private",
    };
  }

  return { canView: true };
}
