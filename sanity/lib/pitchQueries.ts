// Pitch-related GROQ queries for the YC Directory

// Get all pitches with basic information
export const PITCHES_QUERY = `
  *[_type == "pitch" && status in ["approved", "presented"] && visibility in ["public", "community"]] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    problem,
    solution,
    askAmount,
    pitchType,
    stage,
    industry,
    tags,
    status,
    visibility,
    featured,
    thumbnailImage,
    pitchVideoUrl,
    demoUrl,
    presentationDate,
    viewCount,
    likeCount,
    commentCount,
    averageRating,
    ratingCount,
    createdAt,
    updatedAt,
    startup->{
      _id,
      name,
      slug,
      logo,
      industry,
      stage,
      location
    },
    presenter->{
      _id,
      userId,
      role,
      profileImage
    },
    event->{
      _id,
      title,
      slug,
      startDateTime,
      eventType
    }
  }
`;

// Get pitch by slug with full details
export const PITCH_BY_SLUG_QUERY = `
  *[_type == "pitch" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    problem,
    solution,
    marketSize,
    businessModel,
    traction,
    competition,
    askAmount,
    useOfFunds,
    pitchVideo,
    pitchVideoUrl,
    pitchDeck,
    demoVideo,
    demoUrl,
    thumbnailImage,
    pitchType,
    stage,
    industry,
    tags,
    status,
    visibility,
    featured,
    pitchOrder,
    presentationDate,
    viewCount,
    likeCount,
    commentCount,
    averageRating,
    ratingCount,
    createdAt,
    updatedAt,
    submittedAt,
    approvedAt,
    startup->{
      _id,
      name,
      slug,
      tagline,
      logo,
      coverImage,
      industry,
      stage,
      foundedYear,
      teamSize,
      location,
      website,
      totalFunding,
      valuation
    },
    presenter->{
      _id,
      userId,
      role,
      bio,
      company,
      position,
      profileImage,
      socialLinks
    },
    additionalPresenters[]->{
      _id,
      userId,
      role,
      company,
      position,
      profileImage
    },
    event->{
      _id,
      title,
      slug,
      description,
      startDateTime,
      endDateTime,
      eventType,
      format,
      location
    },
    "ratings": *[_type == "pitchRating" && references(^._id) && status == "published"] | order(createdAt desc) [0...10] {
      _id,
      overallRating,
      presentationQuality,
      businessModel,
      marketOpportunity,
      traction,
      team,
      product,
      feedback,
      strengths,
      improvements,
      investmentInterest,
      raterType,
      anonymous,
      helpful,
      notHelpful,
      createdAt,
      rater->{
        _id,
        userId,
        role,
        company,
        position,
        profileImage
      }
    },
    "comments": *[_type == "pitchComment" && references(^._id) && status == "published" && !defined(parentComment)] | order(createdAt desc) [0...20] {
      _id,
      content,
      commentType,
      isQuestion,
      isPrivate,
      likes,
      replies,
      authorRole,
      contactRequested,
      helpful,
      notHelpful,
      createdAt,
      author->{
        _id,
        userId,
        role,
        company,
        position,
        profileImage
      },
      "childComments": *[_type == "pitchComment" && references(^._id) && status == "published"] | order(createdAt asc) [0...5] {
        _id,
        content,
        likes,
        createdAt,
        author->{
          _id,
          userId,
          role,
          profileImage
        }
      }
    }
  }
`;

// Search pitches with filters
export const SEARCH_PITCHES_QUERY = `
  *[_type == "pitch" && status in ["approved", "presented"] && visibility in ["public", "community"]
    && ($search == "" || title match $search + "*" || description match $search + "*" || problem match $search + "*" || solution match $search + "*")
    && ($pitchType == "" || pitchType == $pitchType)
    && ($industry == "" || industry == $industry)
    && ($stage == "" || stage == $stage)
    && ($askMin == 0 || askAmount >= $askMin)
    && ($askMax == 0 || askAmount <= $askMax)
    && ($hasVideo == false || defined(pitchVideo) || defined(pitchVideoUrl))
    && ($hasDeck == false || defined(pitchDeck))
    && ($featured == false || featured == true)
    && ($eventId == "" || event._ref == $eventId)
  ] | order(
    featured desc,
    _score desc,
    presentationDate desc,
    createdAt desc
  ) [$offset...$limit] {
    _id,
    title,
    slug,
    description,
    problem,
    solution,
    askAmount,
    pitchType,
    stage,
    industry,
    tags,
    featured,
    thumbnailImage,
    pitchVideoUrl,
    demoUrl,
    presentationDate,
    viewCount,
    likeCount,
    averageRating,
    ratingCount,
    createdAt,
    startup->{
      _id,
      name,
      slug,
      logo,
      industry,
      stage
    },
    presenter->{
      _id,
      userId,
      profileImage
    },
    event->{
      _id,
      title,
      slug,
      startDateTime
    }
  }
`;

// Get featured pitches
export const FEATURED_PITCHES_QUERY = `
  *[_type == "pitch" && featured == true && status in ["approved", "presented"] && visibility in ["public", "community"]] | order(presentationDate desc, updatedAt desc) [0...6] {
    _id,
    title,
    slug,
    description,
    askAmount,
    pitchType,
    thumbnailImage,
    pitchVideoUrl,
    averageRating,
    ratingCount,
    viewCount,
    presentationDate,
    startup->{
      _id,
      name,
      slug,
      logo,
      industry,
      stage
    },
    presenter->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get pitches by industry
export const PITCHES_BY_INDUSTRY_QUERY = `
  *[_type == "pitch" && industry == $industry && status in ["approved", "presented"] && visibility in ["public", "community"]] | order(averageRating desc, viewCount desc) {
    _id,
    title,
    slug,
    description,
    askAmount,
    thumbnailImage,
    averageRating,
    ratingCount,
    startup->{
      _id,
      name,
      logo,
      stage
    },
    presenter->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get pitches by event
export const PITCHES_BY_EVENT_QUERY = `
  *[_type == "pitch" && references($eventId) && status in ["approved", "presented"]] | order(pitchOrder asc, presentationDate asc) {
    _id,
    title,
    slug,
    description,
    askAmount,
    pitchOrder,
    thumbnailImage,
    pitchVideoUrl,
    averageRating,
    ratingCount,
    viewCount,
    presentationDate,
    startup->{
      _id,
      name,
      slug,
      logo,
      industry,
      stage
    },
    presenter->{
      _id,
      userId,
      role,
      profileImage
    }
  }
`;

// Get trending pitches (most viewed/rated recently)
export const TRENDING_PITCHES_QUERY = `
  *[_type == "pitch" && status in ["approved", "presented"] && visibility in ["public", "community"] && createdAt > dateTime(now()) - 60*60*24*30] | order(viewCount desc, averageRating desc) [0...10] {
    _id,
    title,
    slug,
    description,
    askAmount,
    thumbnailImage,
    viewCount,
    averageRating,
    ratingCount,
    startup->{
      _id,
      name,
      logo,
      industry,
      stage
    },
    presenter->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get recent pitches
export const RECENT_PITCHES_QUERY = `
  *[_type == "pitch" && status in ["approved", "presented"] && visibility in ["public", "community"]] | order(presentationDate desc, createdAt desc) [0...10] {
    _id,
    title,
    slug,
    description,
    askAmount,
    pitchType,
    thumbnailImage,
    presentationDate,
    averageRating,
    ratingCount,
    startup->{
      _id,
      name,
      logo,
      industry,
      stage
    },
    presenter->{
      _id,
      userId,
      profileImage
    },
    event->{
      _id,
      title,
      slug
    }
  }
`;

// Get pitch statistics
export const PITCH_STATS_QUERY = `
  {
    "totalPitches": count(*[_type == "pitch" && status in ["approved", "presented"]]),
    "totalViews": sum(*[_type == "pitch" && status in ["approved", "presented"]].viewCount),
    "averageRating": math::avg(*[_type == "pitch" && status in ["approved", "presented"] && defined(averageRating)].averageRating),
    "byIndustry": *[_type == "pitch" && status in ["approved", "presented"]] | {
      "industry": industry,
      "count": count(*[_type == "pitch" && industry == ^.industry])
    } | order(count desc),
    "byStage": *[_type == "pitch" && status in ["approved", "presented"]] | {
      "stage": stage,
      "count": count(*[_type == "pitch" && stage == ^.stage])
    } | order(count desc),
    "byPitchType": *[_type == "pitch" && status in ["approved", "presented"]] | {
      "pitchType": pitchType,
      "count": count(*[_type == "pitch" && pitchType == ^.pitchType])
    } | order(count desc),
    "recentlyAdded": count(*[_type == "pitch" && status in ["approved", "presented"] && createdAt > dateTime(now()) - 60*60*24*30]),
    "totalFundingAsked": sum(*[_type == "pitch" && status in ["approved", "presented"] && defined(askAmount)].askAmount),
    "averageFundingAsk": math::avg(*[_type == "pitch" && status in ["approved", "presented"] && defined(askAmount)].askAmount)
  }
`;

// Get pitches by presenter
export const PITCHES_BY_PRESENTER_QUERY = `
  *[_type == "pitch" && (references($userId) || additionalPresenters[]._ref == $userId)] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    askAmount,
    pitchType,
    status,
    visibility,
    thumbnailImage,
    averageRating,
    ratingCount,
    viewCount,
    presentationDate,
    createdAt,
    startup->{
      _id,
      name,
      slug,
      logo
    },
    event->{
      _id,
      title,
      slug
    }
  }
`;

// Get similar pitches (same industry or stage)
export const SIMILAR_PITCHES_QUERY = `
  *[_type == "pitch" && _id != $pitchId && status in ["approved", "presented"] && visibility in ["public", "community"]
    && (industry == $industry || stage == $stage)] | order(averageRating desc, viewCount desc) [0...6] {
    _id,
    title,
    slug,
    description,
    askAmount,
    thumbnailImage,
    averageRating,
    ratingCount,
    startup->{
      _id,
      name,
      logo,
      industry,
      stage
    },
    presenter->{
      _id,
      userId,
      profileImage
    }
  }
`;

// Get pitch ratings for a specific pitch
export const PITCH_RATINGS_QUERY = `
  *[_type == "pitchRating" && references($pitchId) && status == "published"] | order(createdAt desc) {
    _id,
    overallRating,
    presentationQuality,
    businessModel,
    marketOpportunity,
    traction,
    team,
    product,
    feedback,
    strengths,
    improvements,
    investmentInterest,
    potentialInvestmentAmount,
    raterType,
    expertise,
    anonymous,
    helpful,
    notHelpful,
    createdAt,
    rater->{
      _id,
      userId,
      role,
      company,
      position,
      profileImage
    }
  }
`;

// Get pitch comments for a specific pitch
export const PITCH_COMMENTS_QUERY = `
  *[_type == "pitchComment" && references($pitchId) && status == "published" && !defined(parentComment)] | order(createdAt desc) {
    _id,
    content,
    commentType,
    isQuestion,
    isPrivate,
    likes,
    replies,
    authorRole,
    expertise,
    contactRequested,
    helpful,
    notHelpful,
    createdAt,
    author->{
      _id,
      userId,
      role,
      company,
      position,
      profileImage
    },
    "childComments": *[_type == "pitchComment" && parentComment._ref == ^._id && status == "published"] | order(createdAt asc) {
      _id,
      content,
      likes,
      createdAt,
      author->{
        _id,
        userId,
        role,
        profileImage
      }
    }
  }
`;

// Get pitch count for pagination
export const PITCH_COUNT_QUERY = `
  count(*[_type == "pitch" && status in ["approved", "presented"] && visibility in ["public", "community"]
    && ($search == "" || title match $search + "*" || description match $search + "*" || problem match $search + "*" || solution match $search + "*")
    && ($pitchType == "" || pitchType == $pitchType)
    && ($industry == "" || industry == $industry)
    && ($stage == "" || stage == $stage)
    && ($askMin == 0 || askAmount >= $askMin)
    && ($askMax == 0 || askAmount <= $askMax)
    && ($hasVideo == false || defined(pitchVideo) || defined(pitchVideoUrl))
    && ($hasDeck == false || defined(pitchDeck))
    && ($featured == false || featured == true)
    && ($eventId == "" || event._ref == $eventId)
  ])
`;
