// Startup-related GROQ queries for the YC Directory

// Get all startups with basic information
export const STARTUPS_QUERY = `
  *[_type == "startup" && status == "active" && visibility in ["public", "community"]] | order(createdAt desc) {
    _id,
    name,
    slug,
    tagline,
    description,
    logo,
    industry,
    stage,
    foundedYear,
    teamSize,
    location,
    totalFunding,
    valuation,
    website,
    status,
    visibility,
    featured,
    verified,
    views,
    createdAt,
    updatedAt,
    founders[]->{
      _id,
      userId,
      role,
      company,
      position
    },
    "fundingRounds": *[_type == "fundingRound" && references(^._id)] | order(announcedDate desc) [0...3] {
      _id,
      roundType,
      amount,
      currency,
      announcedDate,
      leadInvestors
    }
  }
`;

// Get startup by slug with full details
export const STARTUP_BY_SLUG_QUERY = `
  *[_type == "startup" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    tagline,
    description,
    logo,
    coverImage,
    industry,
    stage,
    foundedYear,
    teamSize,
    location,
    businessModel,
    revenueModel,
    targetMarket,
    totalFunding,
    lastFundingDate,
    valuation,
    website,
    productDemo,
    techStack,
    socialLinks,
    status,
    visibility,
    featured,
    verified,
    metrics,
    pitch,
    views,
    createdAt,
    updatedAt,
    founders[]->{
      _id,
      userId,
      role,
      bio,
      company,
      position,
      skills,
      socialLinks,
      profileImage
    },
    teamMembers[]->{
      _id,
      userId,
      role,
      company,
      position,
      profileImage
    },
    investors,
    "fundingRounds": *[_type == "fundingRound" && references(^._id)] | order(announcedDate desc) {
      _id,
      roundType,
      amount,
      currency,
      announcedDate,
      closedDate,
      preMoneyValuation,
      postMoneyValuation,
      leadInvestors,
      participatingInvestors,
      useOfFunds,
      status,
      verified
    },
    "relatedEvents": *[_type == "event" && references(^._id) || references(^.founders[]._id)] | order(startDateTime desc) [0...5] {
      _id,
      title,
      slug,
      eventType,
      startDateTime,
      location
    },
    "relatedResources": *[_type == "resource" && references(^._id) || references(^.founders[]._id)] | order(createdAt desc) [0...5] {
      _id,
      title,
      slug,
      resourceType,
      description,
      thumbnailImage
    }
  }
`;

// Search startups with filters
export const SEARCH_STARTUPS_QUERY = `
  *[_type == "startup" && status == "active" && visibility in ["public", "community"]
    && ($search == "" || name match $search + "*" || tagline match $search + "*" || description match $search + "*")
    && ($industry == "" || industry == $industry)
    && ($stage == "" || stage == $stage)
    && ($location == "" || location.city match $location + "*" || location.country match $location + "*")
    && ($businessModel == "" || businessModel == $businessModel)
    && ($fundingMin == 0 || totalFunding >= $fundingMin)
    && ($fundingMax == 0 || totalFunding <= $fundingMax)
    && ($teamSizeMin == 0 || teamSize >= $teamSizeMin)
    && ($teamSizeMax == 0 || teamSize <= $teamSizeMax)
    && ($featured == false || featured == true)
  ] | order(
    featured desc,
    _score desc,
    createdAt desc
  ) [$offset...$limit] {
    _id,
    name,
    slug,
    tagline,
    description,
    logo,
    industry,
    stage,
    foundedYear,
    teamSize,
    location,
    totalFunding,
    valuation,
    website,
    featured,
    verified,
    views,
    createdAt,
    founders[]->{
      _id,
      userId,
      role,
      profileImage
    },
    "latestFunding": *[_type == "fundingRound" && references(^._id)] | order(announcedDate desc) [0] {
      roundType,
      amount,
      currency,
      announcedDate
    }
  }
`;

// Get featured startups
export const FEATURED_STARTUPS_QUERY = `
  *[_type == "startup" && featured == true && status == "active" && visibility in ["public", "community"]] | order(updatedAt desc) [0...6] {
    _id,
    name,
    slug,
    tagline,
    description,
    logo,
    industry,
    stage,
    totalFunding,
    valuation,
    website,
    verified,
    founders[]->{
      _id,
      userId,
      role,
      profileImage
    }
  }
`;

// Get startups by industry
export const STARTUPS_BY_INDUSTRY_QUERY = `
  *[_type == "startup" && industry == $industry && status == "active" && visibility in ["public", "community"]] | order(totalFunding desc, createdAt desc) {
    _id,
    name,
    slug,
    tagline,
    logo,
    stage,
    totalFunding,
    location,
    verified,
    founders[]->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get startups by funding stage
export const STARTUPS_BY_STAGE_QUERY = `
  *[_type == "startup" && stage == $stage && status == "active" && visibility in ["public", "community"]] | order(totalFunding desc, createdAt desc) {
    _id,
    name,
    slug,
    tagline,
    logo,
    industry,
    totalFunding,
    location,
    verified,
    founders[]->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get trending startups (most viewed recently)
export const TRENDING_STARTUPS_QUERY = `
  *[_type == "startup" && status == "active" && visibility in ["public", "community"]] | order(views desc, updatedAt desc) [0...10] {
    _id,
    name,
    slug,
    tagline,
    logo,
    industry,
    stage,
    views,
    verified,
    founders[]->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get recently funded startups
export const RECENTLY_FUNDED_STARTUPS_QUERY = `
  *[_type == "startup" && status == "active" && visibility in ["public", "community"] && defined(lastFundingDate)] | order(lastFundingDate desc) [0...10] {
    _id,
    name,
    slug,
    tagline,
    logo,
    industry,
    stage,
    totalFunding,
    lastFundingDate,
    verified,
    founders[]->{
      _id,
      userId,
      profileImage
    },
    "latestFunding": *[_type == "fundingRound" && references(^._id)] | order(announcedDate desc) [0] {
      roundType,
      amount,
      currency,
      announcedDate,
      leadInvestors[0].name
    }
  }
`;

// Get startup statistics
export const STARTUP_STATS_QUERY = `
  {
    "totalStartups": count(*[_type == "startup" && status == "active"]),
    "totalFunding": sum(*[_type == "startup" && status == "active"].totalFunding),
    "byIndustry": *[_type == "startup" && status == "active"] | {
      "industry": industry,
      "count": count(*[_type == "startup" && industry == ^.industry])
    } | order(count desc),
    "byStage": *[_type == "startup" && status == "active"] | {
      "stage": stage,
      "count": count(*[_type == "startup" && stage == ^.stage])
    } | order(count desc),
    "recentlyAdded": count(*[_type == "startup" && status == "active" && createdAt > dateTime(now()) - 60*60*24*30]),
    "averageTeamSize": math::avg(*[_type == "startup" && status == "active" && defined(teamSize)].teamSize),
    "topLocations": *[_type == "startup" && status == "active" && defined(location.city)] | {
      "location": location.city + ", " + location.country,
      "count": count(*[_type == "startup" && location.city == ^.location.city])
    } | order(count desc) [0...10]
  }
`;

// Get startups founded by a specific user
export const STARTUPS_BY_FOUNDER_QUERY = `
  *[_type == "startup" && references($userId) && status == "active"] | order(createdAt desc) {
    _id,
    name,
    slug,
    tagline,
    logo,
    industry,
    stage,
    totalFunding,
    status,
    visibility,
    verified,
    createdAt,
    founders[]->{
      _id,
      userId,
      role
    }
  }
`;

// Get similar startups (same industry or stage)
export const SIMILAR_STARTUPS_QUERY = `
  *[_type == "startup" && _id != $startupId && status == "active" && visibility in ["public", "community"]
    && (industry == $industry || stage == $stage)] | order(totalFunding desc, createdAt desc) [0...6] {
    _id,
    name,
    slug,
    tagline,
    logo,
    industry,
    stage,
    totalFunding,
    verified,
    founders[]->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get startup funding history
export const STARTUP_FUNDING_HISTORY_QUERY = `
  *[_type == "fundingRound" && references($startupId)] | order(announcedDate desc) {
    _id,
    roundType,
    amount,
    currency,
    announcedDate,
    closedDate,
    preMoneyValuation,
    postMoneyValuation,
    leadInvestors,
    participatingInvestors,
    useOfFunds,
    status,
    verified,
    source
  }
`;

// Get startup count for pagination
export const STARTUP_COUNT_QUERY = `
  count(*[_type == "startup" && status == "active" && visibility in ["public", "community"]
    && ($search == "" || name match $search + "*" || tagline match $search + "*" || description match $search + "*")
    && ($industry == "" || industry == $industry)
    && ($stage == "" || stage == $stage)
    && ($location == "" || location.city match $location + "*" || location.country match $location + "*")
    && ($businessModel == "" || businessModel == $businessModel)
    && ($fundingMin == 0 || totalFunding >= $fundingMin)
    && ($fundingMax == 0 || totalFunding <= $fundingMax)
    && ($teamSizeMin == 0 || teamSize >= $teamSizeMin)
    && ($teamSizeMax == 0 || teamSize <= $teamSizeMax)
    && ($featured == false || featured == true)
  ])
`;
