// Analytics and AI-related GROQ queries for the YC Directory

// Get user interaction analytics
export const USER_INTERACTIONS_QUERY = `
  *[_type == "userInteraction" && user._ref == $userId] | order(timestamp desc) [0...50] {
    _id,
    interactionType,
    targetType,
    targetId,
    metadata,
    outcome,
    conversionValue,
    timestamp,
    duration: metadata.duration,
    source: metadata.source,
    device: metadata.device
  }
`;

// Get user interaction summary
export const USER_INTERACTION_SUMMARY_QUERY = `
  {
    "totalInteractions": count(*[_type == "userInteraction" && user._ref == $userId]),
    "recentInteractions": count(*[_type == "userInteraction" && user._ref == $userId && timestamp > dateTime(now()) - 60*60*24*7]),
    "topInteractionTypes": *[_type == "userInteraction" && user._ref == $userId] | {
      "type": interactionType,
      "count": count(*[_type == "userInteraction" && user._ref == ^.user._ref && interactionType == ^.interactionType])
    } | order(count desc) [0...5],
    "conversionRate": {
      "total": count(*[_type == "userInteraction" && user._ref == $userId]),
      "conversions": count(*[_type == "userInteraction" && user._ref == $userId && outcome == "converted"]),
      "rate": count(*[_type == "userInteraction" && user._ref == $userId && outcome == "converted"]) / count(*[_type == "userInteraction" && user._ref == $userId])
    },
    "averageSessionDuration": math::avg(*[_type == "userInteraction" && user._ref == $userId && defined(metadata.duration)].metadata.duration),
    "deviceBreakdown": *[_type == "userInteraction" && user._ref == $userId && defined(metadata.device)] | {
      "device": metadata.device,
      "count": count(*[_type == "userInteraction" && user._ref == ^.user._ref && metadata.device == ^.metadata.device])
    } | order(count desc)
  }
`;

// Get platform-wide analytics
export const PLATFORM_ANALYTICS_QUERY = `
  {
    "overview": {
      "totalUsers": count(*[_type == "userProfile"]),
      "activeUsers": count(*[_type == "userProfile" && lastActiveAt > dateTime(now()) - 60*60*24*30]),
      "totalStartups": count(*[_type == "startup"]),
      "totalInvestors": count(*[_type == "investorProfile"]),
      "totalInteractions": count(*[_type == "userInteraction"]),
      "totalConnections": count(*[_type == "connectionRequest" && status == "accepted"])
    },
    "growth": {
      "newUsersThisWeek": count(*[_type == "userProfile" && createdAt > dateTime(now()) - 60*60*24*7]),
      "newStartupsThisWeek": count(*[_type == "startup" && createdAt > dateTime(now()) - 60*60*24*7]),
      "newInvestorsThisWeek": count(*[_type == "investorProfile" && createdAt > dateTime(now()) - 60*60*24*7]),
      "interactionsThisWeek": count(*[_type == "userInteraction" && timestamp > dateTime(now()) - 60*60*24*7])
    },
    "engagement": {
      "averageSessionDuration": math::avg(*[_type == "userInteraction" && defined(metadata.duration)].metadata.duration),
      "topInteractionTypes": *[_type == "userInteraction"] | {
        "type": interactionType,
        "count": count(*[_type == "userInteraction" && interactionType == ^.interactionType])
      } | order(count desc) [0...10],
      "conversionRate": count(*[_type == "userInteraction" && outcome == "converted"]) / count(*[_type == "userInteraction"]),
      "bounceRate": count(*[_type == "userInteraction" && outcome == "bounced"]) / count(*[_type == "userInteraction"])
    }
  }
`;

// Get matching scores for a startup
export const STARTUP_MATCHING_SCORES_QUERY = `
  *[_type == "matchingScore" && startup._ref == $startupId && status == "active"] | order(overallScore desc) [0...20] {
    _id,
    overallScore,
    confidence,
    scoreBreakdown,
    successProbability,
    expectedOutcome,
    recommendedAction,
    status,
    createdAt,
    investor->{
      _id,
      investorType,
      firmName,
      title,
      profileImage,
      verified,
      user->{
        _id,
        userId,
        role
      }
    }
  }
`;

// Get matching scores for an investor
export const INVESTOR_MATCHING_SCORES_QUERY = `
  *[_type == "matchingScore" && investor._ref == $investorId && status == "active"] | order(overallScore desc) [0...20] {
    _id,
    overallScore,
    confidence,
    scoreBreakdown,
    successProbability,
    expectedOutcome,
    recommendedAction,
    status,
    createdAt,
    startup->{
      _id,
      name,
      slug,
      tagline,
      logo,
      industry,
      stage,
      totalFunding,
      founders[]->{
        _id,
        userId,
        role
      }
    }
  }
`;

// Get recommendations for a user
export const USER_RECOMMENDATIONS_QUERY = `
  *[_type == "recommendation" && user._ref == $userId && status in ["active", "viewed"] && (!defined(expiresAt) || expiresAt > now())] | order(priority asc, relevanceScore desc) [0...10] {
    _id,
    recommendationType,
    priority,
    title,
    description,
    actionText,
    actionUrl,
    relevanceScore,
    confidence,
    reasoning,
    basedOn,
    timeContext,
    status,
    createdAt,
    targetStartup->{
      _id,
      name,
      slug,
      tagline,
      logo,
      industry,
      stage
    },
    targetInvestor->{
      _id,
      firmName,
      title,
      profileImage,
      investorType,
      user->{
        _id,
        userId
      }
    },
    targetEvent->{
      _id,
      title,
      slug,
      eventType,
      startDate,
      location
    },
    targetResource->{
      _id,
      title,
      slug,
      resourceType,
      category->{ name }
    },
    targetUser->{
      _id,
      userId,
      role,
      company,
      profileImage
    }
  }
`;

// Get recommendation performance analytics
export const RECOMMENDATION_ANALYTICS_QUERY = `
  {
    "overview": {
      "totalRecommendations": count(*[_type == "recommendation"]),
      "activeRecommendations": count(*[_type == "recommendation" && status == "active"]),
      "totalImpressions": sum(*[_type == "recommendation"].impressions),
      "totalClicks": sum(*[_type == "recommendation"].clicks),
      "totalConversions": sum(*[_type == "recommendation"].conversions)
    },
    "performance": {
      "overallCTR": sum(*[_type == "recommendation"].clicks) / sum(*[_type == "recommendation"].impressions),
      "overallConversionRate": sum(*[_type == "recommendation"].conversions) / sum(*[_type == "recommendation"].clicks),
      "byType": *[_type == "recommendation"] | {
        "type": recommendationType,
        "count": count(*[_type == "recommendation" && recommendationType == ^.recommendationType]),
        "avgRelevanceScore": math::avg(*[_type == "recommendation" && recommendationType == ^.recommendationType].relevanceScore),
        "ctr": sum(*[_type == "recommendation" && recommendationType == ^.recommendationType].clicks) / sum(*[_type == "recommendation" && recommendationType == ^.recommendationType].impressions),
        "conversionRate": sum(*[_type == "recommendation" && recommendationType == ^.recommendationType].conversions) / sum(*[_type == "recommendation" && recommendationType == ^.recommendationType].clicks)
      } | order(count desc) [0...10],
      "topPerforming": *[_type == "recommendation" && clicks > 0] | order(conversionRate desc) [0...10] {
        _id,
        title,
        recommendationType,
        relevanceScore,
        impressions,
        clicks,
        conversions,
        clickThroughRate,
        conversionRate
      }
    },
    "userFeedback": {
      "feedbackDistribution": *[_type == "recommendation" && userFeedback != "no-feedback"] | {
        "feedback": userFeedback,
        "count": count(*[_type == "recommendation" && userFeedback == ^.userFeedback])
      } | order(count desc),
      "averageHelpfulness": math::avg(*[_type == "recommendation" && userFeedback in ["very-helpful", "helpful", "somewhat-helpful", "not-helpful"]].{
        "score": select(
          userFeedback == "very-helpful" => 4,
          userFeedback == "helpful" => 3,
          userFeedback == "somewhat-helpful" => 2,
          userFeedback == "not-helpful" => 1,
          0
        )
      }.score)
    }
  }
`;

// Get matching score analytics
export const MATCHING_ANALYTICS_QUERY = `
  {
    "overview": {
      "totalMatches": count(*[_type == "matchingScore"]),
      "activeMatches": count(*[_type == "matchingScore" && status == "active"]),
      "averageScore": math::avg(*[_type == "matchingScore"].overallScore),
      "averageConfidence": math::avg(*[_type == "matchingScore"].confidence),
      "highQualityMatches": count(*[_type == "matchingScore" && overallScore >= 80])
    },
    "scoreDistribution": {
      "excellent": count(*[_type == "matchingScore" && overallScore >= 90]),
      "good": count(*[_type == "matchingScore" && overallScore >= 70 && overallScore < 90]),
      "average": count(*[_type == "matchingScore" && overallScore >= 50 && overallScore < 70]),
      "poor": count(*[_type == "matchingScore" && overallScore < 50])
    },
    "outcomeTracking": {
      "totalWithOutcomes": count(*[_type == "matchingScore" && defined(actualOutcome)]),
      "successfulInvestments": count(*[_type == "matchingScore" && actualOutcome == "investment-made"]),
      "connectionsEstablished": count(*[_type == "matchingScore" && actualOutcome == "connection-established"]),
      "noResponse": count(*[_type == "matchingScore" && actualOutcome == "no-response"]),
      "declined": count(*[_type == "matchingScore" && actualOutcome == "declined"])
    },
    "accuracy": {
      "predictedHighActualHigh": count(*[_type == "matchingScore" && overallScore >= 80 && actualOutcome in ["investment-made", "connection-established"]]),
      "predictedHighActualLow": count(*[_type == "matchingScore" && overallScore >= 80 && actualOutcome in ["no-response", "declined"]]),
      "predictedLowActualHigh": count(*[_type == "matchingScore" && overallScore < 50 && actualOutcome in ["investment-made", "connection-established"]]),
      "predictedLowActualLow": count(*[_type == "matchingScore" && overallScore < 50 && actualOutcome in ["no-response", "declined"]])
    }
  }
`;

// Get trending content and insights
export const TRENDING_INSIGHTS_QUERY = `
  {
    "trendingStartups": *[_type == "startup"] | order(profileViews desc) [0...10] {
      _id,
      name,
      slug,
      tagline,
      logo,
      industry,
      stage,
      profileViews,
      totalFunding
    },
    "trendingInvestors": *[_type == "investorProfile"] | order(profileViews desc) [0...10] {
      _id,
      firmName,
      title,
      profileImage,
      investorType,
      profileViews,
      user->{
        _id,
        userId
      }
    },
    "hotIndustries": *[_type == "startup"] | {
      "industry": industry,
      "count": count(*[_type == "startup" && industry == ^.industry]),
      "recentGrowth": count(*[_type == "startup" && industry == ^.industry && createdAt > dateTime(now()) - 60*60*24*30]),
      "totalFunding": sum(*[_type == "startup" && industry == ^.industry && defined(totalFunding)].totalFunding),
      "avgViews": math::avg(*[_type == "startup" && industry == ^.industry].profileViews)
    } | order(recentGrowth desc) [0...10],
    "activeRegions": *[_type == "startup" && defined(location)] | {
      "location": location,
      "count": count(*[_type == "startup" && location == ^.location]),
      "recentActivity": count(*[_type == "userInteraction" && targetType == "startup" && timestamp > dateTime(now()) - 60*60*24*7])
    } | order(count desc) [0...10]
  }
`;

// Get user behavior patterns
export const USER_BEHAVIOR_PATTERNS_QUERY = `
  *[_type == "userInteraction" && user._ref == $userId] | {
    "hour": dateTime(timestamp).hour,
    "dayOfWeek": dateTime(timestamp).dayOfWeek,
    "interactionType": interactionType,
    "outcome": outcome
  } | {
    "timePatterns": {
      "peakHours": *[hour] | {
        "hour": @,
        "count": count(*[hour == @])
      } | order(count desc) [0...5],
      "peakDays": *[dayOfWeek] | {
        "day": @,
        "count": count(*[dayOfWeek == @])
      } | order(count desc)
    },
    "interactionPatterns": *[interactionType] | {
      "type": @,
      "count": count(*[interactionType == @]),
      "successRate": count(*[interactionType == @ && outcome in ["completed", "converted"]]) / count(*[interactionType == @])
    } | order(count desc)
  }
`;

// Get market intelligence insights
export const MARKET_INTELLIGENCE_QUERY = `
  {
    "fundingTrends": {
      "totalFunding": sum(*[_type == "startup" && defined(totalFunding)].totalFunding),
      "averageFunding": math::avg(*[_type == "startup" && defined(totalFunding)].totalFunding),
      "fundingByStage": *[_type == "startup" && defined(stage) && defined(totalFunding)] | {
        "stage": stage,
        "count": count(*[_type == "startup" && stage == ^.stage]),
        "totalFunding": sum(*[_type == "startup" && stage == ^.stage && defined(totalFunding)].totalFunding),
        "avgFunding": math::avg(*[_type == "startup" && stage == ^.stage && defined(totalFunding)].totalFunding)
      } | order(totalFunding desc),
      "fundingByIndustry": *[_type == "startup" && defined(industry) && defined(totalFunding)] | {
        "industry": industry,
        "count": count(*[_type == "startup" && industry == ^.industry]),
        "totalFunding": sum(*[_type == "startup" && industry == ^.industry && defined(totalFunding)].totalFunding),
        "avgFunding": math::avg(*[_type == "startup" && industry == ^.industry && defined(totalFunding)].totalFunding)
      } | order(totalFunding desc) [0...10]
    },
    "investorActivity": {
      "totalInvestors": count(*[_type == "investorProfile"]),
      "activeInvestors": count(*[_type == "investorProfile" && activelyInvesting == true]),
      "totalInterests": count(*[_type == "investmentInterest"]),
      "recentInterests": count(*[_type == "investmentInterest" && createdAt > dateTime(now()) - 60*60*24*30]),
      "averageCheckSize": math::avg(*[_type == "investorProfile" && defined(typicalCheckSize)].typicalCheckSize),
      "investorsByType": *[_type == "investorProfile"] | {
        "type": investorType,
        "count": count(*[_type == "investorProfile" && investorType == ^.investorType]),
        "avgCheckSize": math::avg(*[_type == "investorProfile" && investorType == ^.investorType && defined(typicalCheckSize)].typicalCheckSize)
      } | order(count desc)
    },
    "networkEffects": {
      "totalConnections": count(*[_type == "connectionRequest" && status == "accepted"]),
      "connectionSuccessRate": count(*[_type == "connectionRequest" && status == "accepted"]) / count(*[_type == "connectionRequest"]),
      "averageResponseTime": math::avg(*[_type == "connectionRequest" && defined(responseDate) && defined(createdAt)].{
        "responseTime": dateTime(responseDate) - dateTime(createdAt)
      }.responseTime),
      "topConnectors": *[_type == "userProfile"] | {
        "userId": userId,
        "connectionsRequested": count(*[_type == "connectionRequest" && requester->userId == ^.userId]),
        "connectionsAccepted": count(*[_type == "connectionRequest" && requester->userId == ^.userId && status == "accepted"])
      } | order(connectionsAccepted desc) [0...10]
    }
  }
`;
