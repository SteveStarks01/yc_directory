// Investor-related GROQ queries for the YC Directory

// Get all investor profiles with basic information
export const INVESTORS_QUERY = `
  *[_type == "investorProfile" && activelyInvesting == true && visibility in ["public", "community"]] | order(verified desc, createdAt desc) {
    _id,
    investorType,
    firmName,
    title,
    bio,
    profileImage,
    firmLogo,
    investmentStages,
    preferredIndustries,
    geographicFocus,
    minInvestmentAmount,
    maxInvestmentAmount,
    typicalCheckSize,
    leadInvestments,
    followOnInvestments,
    valueAdd,
    portfolioSize,
    verified,
    accredited,
    activelyInvesting,
    visibility,
    profileViews,
    connectionsRequested,
    connectionsAccepted,
    createdAt,
    updatedAt,
    user->{
      _id,
      userId,
      role,
      company,
      position,
      location,
      socialLinks
    },
    contactPreferences,
    socialLinks,
    "notableInvestments": notableInvestments[outcome in ["ipo", "acquired", "unicorn"]] | order(year desc) [0...3]
  }
`;

// Get investor profile by user ID
export const INVESTOR_BY_USER_QUERY = `
  *[_type == "investorProfile" && user._ref == $userId][0] {
    _id,
    investorType,
    firmName,
    title,
    bio,
    profileImage,
    firmLogo,
    investmentStages,
    preferredIndustries,
    geographicFocus,
    minInvestmentAmount,
    maxInvestmentAmount,
    typicalCheckSize,
    investmentsPerYear,
    leadInvestments,
    followOnInvestments,
    investmentPhilosophy,
    valueAdd,
    portfolioSize,
    notableInvestments,
    contactPreferences,
    socialLinks,
    verified,
    accredited,
    activelyInvesting,
    visibility,
    profileViews,
    connectionsRequested,
    connectionsAccepted,
    createdAt,
    updatedAt,
    user->{
      _id,
      userId,
      role,
      bio,
      company,
      position,
      location,
      profileImage,
      socialLinks
    }
  }
`;

// Search investors with filters
export const SEARCH_INVESTORS_QUERY = `
  *[_type == "investorProfile" && activelyInvesting == true && visibility in ["public", "community"]
    && ($search == "" || firmName match $search + "*" || bio match $search + "*" || user->userId match $search + "*")
    && ($investorType == "" || investorType == $investorType)
    && ($stage == "" || $stage in investmentStages[])
    && ($industry == "" || $industry in preferredIndustries[])
    && ($geography == "" || $geography in geographicFocus[])
    && ($minAmount == 0 || typicalCheckSize >= $minAmount)
    && ($maxAmount == 0 || typicalCheckSize <= $maxAmount)
    && ($leadOnly == false || leadInvestments == true)
    && ($verified == false || verified == true)
  ] | order(
    verified desc,
    _score desc,
    profileViews desc,
    createdAt desc
  ) [$offset...$limit] {
    _id,
    investorType,
    firmName,
    title,
    bio,
    profileImage,
    firmLogo,
    investmentStages,
    preferredIndustries,
    geographicFocus,
    typicalCheckSize,
    leadInvestments,
    valueAdd,
    verified,
    profileViews,
    connectionsAccepted,
    user->{
      _id,
      userId,
      role,
      location
    },
    contactPreferences,
    "recentInvestments": notableInvestments[year >= 2020] | order(year desc) [0...2]
  }
`;

// Get investors by investment stage
export const INVESTORS_BY_STAGE_QUERY = `
  *[_type == "investorProfile" && $stage in investmentStages[] && activelyInvesting == true && visibility in ["public", "community"]] | order(verified desc, typicalCheckSize desc) {
    _id,
    investorType,
    firmName,
    title,
    profileImage,
    firmLogo,
    typicalCheckSize,
    leadInvestments,
    verified,
    user->{
      _id,
      userId,
      location
    }
  }
`;

// Get investors by industry
export const INVESTORS_BY_INDUSTRY_QUERY = `
  *[_type == "investorProfile" && $industry in preferredIndustries[] && activelyInvesting == true && visibility in ["public", "community"]] | order(verified desc, typicalCheckSize desc) {
    _id,
    investorType,
    firmName,
    title,
    profileImage,
    firmLogo,
    typicalCheckSize,
    leadInvestments,
    verified,
    user->{
      _id,
      userId,
      location
    }
  }
`;

// Get featured/verified investors
export const FEATURED_INVESTORS_QUERY = `
  *[_type == "investorProfile" && verified == true && activelyInvesting == true && visibility in ["public", "community"]] | order(profileViews desc, connectionsAccepted desc) [0...8] {
    _id,
    investorType,
    firmName,
    title,
    bio,
    profileImage,
    firmLogo,
    investmentStages,
    preferredIndustries,
    typicalCheckSize,
    leadInvestments,
    valueAdd,
    profileViews,
    user->{
      _id,
      userId,
      role,
      location
    },
    "notableInvestments": notableInvestments[outcome in ["ipo", "acquired", "unicorn"]] | order(year desc) [0...2]
  }
`;

// Get investor statistics
export const INVESTOR_STATS_QUERY = `
  {
    "totalInvestors": count(*[_type == "investorProfile" && activelyInvesting == true]),
    "verifiedInvestors": count(*[_type == "investorProfile" && verified == true && activelyInvesting == true]),
    "byType": *[_type == "investorProfile" && activelyInvesting == true] | {
      "investorType": investorType,
      "count": count(*[_type == "investorProfile" && investorType == ^.investorType && activelyInvesting == true])
    } | order(count desc),
    "byStage": array::unique(*[_type == "investorProfile" && activelyInvesting == true].investmentStages[]) | {
      "stage": @,
      "count": count(*[_type == "investorProfile" && @ in investmentStages[] && activelyInvesting == true])
    } | order(count desc),
    "byIndustry": array::unique(*[_type == "investorProfile" && activelyInvesting == true].preferredIndustries[]) | {
      "industry": @,
      "count": count(*[_type == "investorProfile" && @ in preferredIndustries[] && activelyInvesting == true])
    } | order(count desc),
    "averageCheckSize": math::avg(*[_type == "investorProfile" && activelyInvesting == true && defined(typicalCheckSize)].typicalCheckSize),
    "leadInvestors": count(*[_type == "investorProfile" && leadInvestments == true && activelyInvesting == true])
  }
`;

// Get investment interests for a startup
export const STARTUP_INVESTMENT_INTERESTS_QUERY = `
  *[_type == "investmentInterest" && references($startupId) && visibility in ["startup-visible", "public"]] | order(interestLevel desc, createdAt desc) {
    _id,
    interestLevel,
    investmentStage,
    potentialInvestmentAmount,
    leadInterest,
    reasonsForInterest,
    status,
    dueDiligenceStatus,
    lastContactDate,
    meetingScheduled,
    source,
    createdAt,
    investor->{
      _id,
      investorType,
      firmName,
      title,
      profileImage,
      firmLogo,
      verified,
      user->{
        _id,
        userId,
        role
      }
    }
  }
`;

// Get investment interests for an investor
export const INVESTOR_INVESTMENT_INTERESTS_QUERY = `
  *[_type == "investmentInterest" && references($investorId)] | order(updatedAt desc) {
    _id,
    interestLevel,
    investmentStage,
    potentialInvestmentAmount,
    leadInterest,
    reasonsForInterest,
    notes,
    concerns,
    status,
    dueDiligenceStatus,
    lastContactDate,
    nextFollowUpDate,
    meetingScheduled,
    meetingDate,
    termSheetSent,
    actualInvestmentAmount,
    source,
    visibility,
    createdAt,
    updatedAt,
    startup->{
      _id,
      name,
      slug,
      tagline,
      logo,
      industry,
      stage,
      totalFunding,
      valuation,
      founders[]->{
        _id,
        userId,
        role
      }
    },
    pitch->{
      _id,
      title,
      slug,
      averageRating
    }
  }
`;

// Get connection requests for a user
export const USER_CONNECTION_REQUESTS_QUERY = `
  *[_type == "connectionRequest" && (references($userId) || recipient._ref == $userId)] | order(createdAt desc) {
    _id,
    connectionType,
    subject,
    message,
    status,
    urgency,
    meetingScheduled,
    meetingDate,
    source,
    createdAt,
    responseDate,
    expiresAt,
    requester->{
      _id,
      userId,
      role,
      company,
      position,
      profileImage
    },
    recipient->{
      _id,
      userId,
      role,
      company,
      position,
      profileImage
    },
    relatedStartup->{
      _id,
      name,
      slug,
      logo
    },
    relatedPitch->{
      _id,
      title,
      slug
    },
    investmentDetails
  }
`;

// Get matching investors for a startup
export const MATCHING_INVESTORS_QUERY = `
  *[_type == "investorProfile" && activelyInvesting == true && visibility in ["public", "community"]
    && ($stage in investmentStages[])
    && ($industry in preferredIndustries[])
    && ($askAmount >= minInvestmentAmount || !defined(minInvestmentAmount))
    && ($askAmount <= maxInvestmentAmount || !defined(maxInvestmentAmount))
  ] | order(verified desc, typicalCheckSize desc) [0...20] {
    _id,
    investorType,
    firmName,
    title,
    bio,
    profileImage,
    firmLogo,
    investmentStages,
    preferredIndustries,
    typicalCheckSize,
    leadInvestments,
    valueAdd,
    verified,
    profileViews,
    user->{
      _id,
      userId,
      role,
      location
    },
    contactPreferences,
    "matchScore": (
      (($stage in investmentStages[]) ? 30 : 0) +
      (($industry in preferredIndustries[]) ? 25 : 0) +
      ((verified == true) ? 20 : 0) +
      ((leadInvestments == true && $needsLead == true) ? 15 : 0) +
      ((contactPreferences.acceptsColdOutreach == true) ? 10 : 0)
    )
  }
`;

// Get investor portfolio companies (if public)
export const INVESTOR_PORTFOLIO_QUERY = `
  *[_type == "startup" && references($investorId) && visibility in ["public", "community"]] | order(totalFunding desc, createdAt desc) {
    _id,
    name,
    slug,
    tagline,
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
      profileImage
    }
  }
`;

// Get recent investor activity
export const RECENT_INVESTOR_ACTIVITY_QUERY = `
  {
    "recentInterests": *[_type == "investmentInterest" && createdAt > dateTime(now()) - 60*60*24*30] | order(createdAt desc) [0...10] {
      _id,
      interestLevel,
      potentialInvestmentAmount,
      createdAt,
      investor->{
        firmName,
        user->{
          userId
        }
      },
      startup->{
        name,
        slug,
        industry,
        stage
      }
    },
    "recentConnections": *[_type == "connectionRequest" && connectionType == "investment" && createdAt > dateTime(now()) - 60*60*24*30] | order(createdAt desc) [0...10] {
      _id,
      subject,
      status,
      createdAt,
      requester->{
        userId,
        role
      },
      recipient->{
        userId,
        role
      },
      relatedStartup->{
        name,
        slug
      }
    }
  }
`;

// Get investor count for pagination
export const INVESTOR_COUNT_QUERY = `
  count(*[_type == "investorProfile" && activelyInvesting == true && visibility in ["public", "community"]
    && ($search == "" || firmName match $search + "*" || bio match $search + "*" || user->userId match $search + "*")
    && ($investorType == "" || investorType == $investorType)
    && ($stage == "" || $stage in investmentStages[])
    && ($industry == "" || $industry in preferredIndustries[])
    && ($geography == "" || $geography in geographicFocus[])
    && ($minAmount == 0 || typicalCheckSize >= $minAmount)
    && ($maxAmount == 0 || typicalCheckSize <= $maxAmount)
    && ($leadOnly == false || leadInvestments == true)
    && ($verified == false || verified == true)
  ])
`;
