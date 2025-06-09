// Startup management utilities and types

export interface StartupFormData {
  name: string;
  tagline?: string;
  description?: string;
  industry: StartupIndustry;
  stage: StartupStage;
  foundedYear?: number;
  teamSize?: number;
  location?: StartupLocation;
  businessModel?: StartupBusinessModel;
  revenueModel?: string;
  targetMarket?: string;
  website?: string;
  productDemo?: string;
  techStack?: string[];
  socialLinks?: StartupSocialLinks;
  visibility?: StartupVisibility;
  totalFunding?: number;
  valuation?: number;
  metrics?: StartupMetrics;
  teamMembers?: string[];
  investors?: StartupInvestor[];
}

export interface StartupLocation {
  city?: string;
  state?: string;
  country?: string;
  isRemote?: boolean;
}

export interface StartupSocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  crunchbase?: string;
  angellist?: string;
}

export interface StartupMetrics {
  monthlyRevenue?: number;
  monthlyActiveUsers?: number;
  growthRate?: number;
  burnRate?: number;
  runway?: number;
}

export interface StartupInvestor {
  name: string;
  type: InvestorType;
  round?: string;
  amount?: number;
  date?: string;
}

export interface FundingRound {
  _id: string;
  roundType: FundingRoundType;
  amount: number;
  currency: string;
  announcedDate: string;
  closedDate?: string;
  preMoneyValuation?: number;
  postMoneyValuation?: number;
  leadInvestors: Investor[];
  participatingInvestors: Investor[];
  useOfFunds?: string;
  status: FundingRoundStatus;
  verified: boolean;
}

export interface Investor {
  name: string;
  type: InvestorType;
  amount?: number;
  website?: string;
}

export type StartupIndustry = 
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

export type StartupStage = 
  | "idea"
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c-plus"
  | "ipo"
  | "acquired";

export type StartupBusinessModel = 
  | "b2b-saas"
  | "b2c-subscription"
  | "marketplace"
  | "ecommerce"
  | "advertising"
  | "transaction-fees"
  | "freemium"
  | "enterprise-license"
  | "hardware-sales"
  | "other";

export type StartupStatus = "active" | "stealth" | "acquired" | "shutdown" | "on-hold";

export type StartupVisibility = "public" | "community" | "investors" | "private";

export type FundingRoundType = 
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c"
  | "series-d-plus"
  | "bridge"
  | "convertible"
  | "safe"
  | "grant"
  | "debt"
  | "ipo"
  | "other";

export type FundingRoundStatus = "rumored" | "announced" | "closed" | "failed";

export type InvestorType = 
  | "vc"
  | "angel"
  | "corporate-vc"
  | "pe"
  | "family-office"
  | "government"
  | "accelerator"
  | "other";

export interface StartupSummary {
  _id: string;
  name: string;
  slug: { current: string };
  tagline?: string;
  description?: string;
  logo?: any;
  industry: StartupIndustry;
  stage: StartupStage;
  foundedYear?: number;
  teamSize?: number;
  location?: StartupLocation;
  totalFunding?: number;
  valuation?: number;
  website?: string;
  status: StartupStatus;
  visibility: StartupVisibility;
  featured: boolean;
  verified: boolean;
  views: number;
  createdAt: string;
  updatedAt?: string;
  founders: Array<{
    _id: string;
    userId: string;
    role: string;
    profileImage?: any;
  }>;
  latestFunding?: {
    roundType: FundingRoundType;
    amount: number;
    currency: string;
    announcedDate: string;
  };
}

export interface StartupDetails extends StartupSummary {
  coverImage?: any;
  businessModel?: StartupBusinessModel;
  revenueModel?: string;
  targetMarket?: string;
  productDemo?: string;
  techStack?: string[];
  socialLinks?: StartupSocialLinks;
  metrics?: StartupMetrics;
  pitch?: string;
  teamMembers?: Array<{
    _id: string;
    userId: string;
    role: string;
    company?: string;
    position?: string;
    profileImage?: any;
  }>;
  investors?: StartupInvestor[];
  fundingRounds?: FundingRound[];
  relatedEvents?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    eventType: string;
    startDateTime: string;
    location?: any;
  }>;
  relatedResources?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    resourceType: string;
    description: string;
    thumbnailImage?: any;
  }>;
}

// Utility functions
export function getIndustryLabel(industry: StartupIndustry): string {
  const labels: Record<StartupIndustry, string> = {
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

export function getStageLabel(stage: StartupStage): string {
  const labels: Record<StartupStage, string> = {
    "idea": "Idea Stage",
    "pre-seed": "Pre-Seed",
    "seed": "Seed",
    "series-a": "Series A",
    "series-b": "Series B",
    "series-c-plus": "Series C+",
    "ipo": "IPO",
    "acquired": "Acquired",
  };

  return labels[stage] || stage;
}

export function getStageColor(stage: StartupStage): string {
  const colors: Record<StartupStage, string> = {
    "idea": "gray",
    "pre-seed": "blue",
    "seed": "green",
    "series-a": "yellow",
    "series-b": "orange",
    "series-c-plus": "red",
    "ipo": "purple",
    "acquired": "indigo",
  };

  return colors[stage] || "gray";
}

export function getBusinessModelLabel(model: StartupBusinessModel): string {
  const labels: Record<StartupBusinessModel, string> = {
    "b2b-saas": "B2B SaaS",
    "b2c-subscription": "B2C Subscription",
    "marketplace": "Marketplace",
    "ecommerce": "E-commerce",
    "advertising": "Advertising",
    "transaction-fees": "Transaction Fees",
    "freemium": "Freemium",
    "enterprise-license": "Enterprise License",
    "hardware-sales": "Hardware Sales",
    "other": "Other",
  };

  return labels[model] || model;
}

export function formatFunding(amount: number, currency: string = "USD"): string {
  if (amount === 0) return "Undisclosed";
  
  if (amount >= 1000000000) {
    return `${currency} ${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${currency} ${(amount / 1000).toFixed(0)}K`;
  } else {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatValuation(valuation: number): string {
  if (valuation === 0) return "Undisclosed";
  
  if (valuation >= 1000000000) {
    return `$${(valuation / 1000000000).toFixed(1)}B`;
  } else if (valuation >= 1000000) {
    return `$${(valuation / 1000000).toFixed(1)}M`;
  } else {
    return `$${valuation.toLocaleString()}`;
  }
}

export function getStartupAge(foundedYear: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - foundedYear;
  
  if (age === 0) return "Founded this year";
  if (age === 1) return "1 year old";
  return `${age} years old`;
}

export function getLocationString(location: StartupLocation): string {
  if (location.isRemote) return "Remote";
  
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);
  
  return parts.join(", ") || "Location not specified";
}

export function validateStartupData(data: Partial<StartupFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push("Company name is required");
  }

  if (!data.industry) {
    errors.push("Industry is required");
  }

  if (!data.stage) {
    errors.push("Company stage is required");
  }

  if (data.foundedYear && (data.foundedYear < 1900 || data.foundedYear > new Date().getFullYear())) {
    errors.push("Please enter a valid founded year");
  }

  if (data.teamSize && data.teamSize < 1) {
    errors.push("Team size must be at least 1");
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.push("Please enter a valid website URL");
  }

  if (data.productDemo && !isValidUrl(data.productDemo)) {
    errors.push("Please enter a valid product demo URL");
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

export function getStartupUrl(startup: StartupSummary): string {
  return `/startups/${startup.slug.current}`;
}

export function canViewStartup(
  startup: StartupSummary,
  userRole?: string,
  isAuthenticated?: boolean,
  isFounder?: boolean
): {
  canView: boolean;
  reason?: string;
} {
  if (startup.visibility === "public") {
    return { canView: true };
  }

  if (isFounder) {
    return { canView: true };
  }

  if (startup.visibility === "private") {
    return {
      canView: false,
      reason: "This startup profile is private",
    };
  }

  if (!isAuthenticated) {
    return {
      canView: false,
      reason: "Authentication required to view this startup",
    };
  }

  if (startup.visibility === "community") {
    return { canView: true };
  }

  if (startup.visibility === "investors") {
    // Check if user has investor permissions (implement based on your business logic)
    return {
      canView: false,
      reason: "Investor access required",
    };
  }

  return { canView: true };
}
