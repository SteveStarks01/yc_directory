// AI-powered matching algorithm for startup-investor compatibility

export interface StartupData {
  _id: string;
  name: string;
  industry: string;
  stage: string;
  totalFunding?: number;
  valuation?: number;
  location?: string;
  teamSize?: number;
  foundedYear?: number;
  revenue?: number;
  growthRate?: number;
  businessModel?: string;
  targetMarket?: string;
  traction?: {
    users?: number;
    revenue?: number;
    partnerships?: number;
    growth?: number;
  };
  founders?: Array<{
    experience?: number;
    previousExits?: number;
    education?: string;
    expertise?: string[];
  }>;
  technology?: string[];
  competitors?: string[];
  riskFactors?: string[];
  strengths?: string[];
}

export interface InvestorData {
  _id: string;
  investorType: string;
  investmentStages: string[];
  preferredIndustries: string[];
  geographicFocus?: string[];
  minInvestmentAmount?: number;
  maxInvestmentAmount?: number;
  typicalCheckSize?: number;
  leadInvestments: boolean;
  followOnInvestments: boolean;
  valueAdd?: string[];
  portfolioSize?: number;
  investmentsPerYear?: number;
  riskTolerance?: 'low' | 'medium' | 'high';
  investmentPhilosophy?: string;
  pastInvestments?: Array<{
    industry: string;
    stage: string;
    outcome: string;
    amount?: number;
  }>;
  preferences?: {
    teamExperience?: 'low' | 'medium' | 'high';
    tractionRequired?: 'low' | 'medium' | 'high';
    revenueRequired?: boolean;
    techFocus?: boolean;
  };
}

export interface MatchingScore {
  overallScore: number;
  confidence: number;
  scoreBreakdown: {
    stageMatch: number;
    industryMatch: number;
    geographyMatch: number;
    checkSizeMatch: number;
    teamMatch: number;
    tractionMatch: number;
    valueAddMatch: number;
    networkMatch: number;
    timingMatch: number;
    riskMatch: number;
  };
  successProbability: number;
  expectedOutcome: string;
  recommendedAction: string;
  reasoning: string[];
}

export class AIMatchingEngine {
  private weights = {
    stageMatch: 0.20,
    industryMatch: 0.18,
    geographyMatch: 0.08,
    checkSizeMatch: 0.15,
    teamMatch: 0.12,
    tractionMatch: 0.10,
    valueAddMatch: 0.08,
    networkMatch: 0.05,
    timingMatch: 0.02,
    riskMatch: 0.02,
  };

  calculateMatch(startup: StartupData, investor: InvestorData): MatchingScore {
    const scoreBreakdown = {
      stageMatch: this.calculateStageMatch(startup, investor),
      industryMatch: this.calculateIndustryMatch(startup, investor),
      geographyMatch: this.calculateGeographyMatch(startup, investor),
      checkSizeMatch: this.calculateCheckSizeMatch(startup, investor),
      teamMatch: this.calculateTeamMatch(startup, investor),
      tractionMatch: this.calculateTractionMatch(startup, investor),
      valueAddMatch: this.calculateValueAddMatch(startup, investor),
      networkMatch: this.calculateNetworkMatch(startup, investor),
      timingMatch: this.calculateTimingMatch(startup, investor),
      riskMatch: this.calculateRiskMatch(startup, investor),
    };

    const overallScore = this.calculateOverallScore(scoreBreakdown);
    const confidence = this.calculateConfidence(scoreBreakdown, startup, investor);
    const successProbability = this.calculateSuccessProbability(overallScore, confidence);
    const expectedOutcome = this.determineExpectedOutcome(overallScore, successProbability);
    const recommendedAction = this.determineRecommendedAction(overallScore, confidence);
    const reasoning = this.generateReasoning(scoreBreakdown, startup, investor);

    return {
      overallScore,
      confidence,
      scoreBreakdown,
      successProbability,
      expectedOutcome,
      recommendedAction,
      reasoning,
    };
  }

  private calculateStageMatch(startup: StartupData, investor: InvestorData): number {
    if (!investor.investmentStages.includes(startup.stage)) {
      return 0;
    }

    // Bonus for exact stage preference
    const stagePreferenceBonus = investor.investmentStages.length === 1 ? 20 : 0;
    
    // Consider investor's typical stage focus
    const stageOrder = ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c-plus', 'growth', 'late-stage'];
    const startupStageIndex = stageOrder.indexOf(startup.stage);
    const investorStageIndices = investor.investmentStages.map(stage => stageOrder.indexOf(stage));
    
    // Calculate how well the startup stage fits within investor's range
    const minInvestorStage = Math.min(...investorStageIndices);
    const maxInvestorStage = Math.max(...investorStageIndices);
    
    let stageAlignment = 100;
    if (startupStageIndex < minInvestorStage || startupStageIndex > maxInvestorStage) {
      stageAlignment = Math.max(0, 100 - Math.abs(startupStageIndex - minInvestorStage) * 20);
    }

    return Math.min(100, stageAlignment + stagePreferenceBonus);
  }

  private calculateIndustryMatch(startup: StartupData, investor: InvestorData): number {
    if (investor.preferredIndustries.includes(startup.industry)) {
      return 100;
    }

    // Check for related industries
    const industryRelations: Record<string, string[]> = {
      'ai-ml': ['developer-tools', 'enterprise', 'healthcare'],
      'fintech': ['enterprise', 'b2b-software'],
      'healthcare': ['ai-ml', 'enterprise'],
      'enterprise': ['b2b-software', 'saas'],
      'consumer': ['social', 'ecommerce', 'mobile'],
      'ecommerce': ['consumer', 'marketplace'],
      'developer-tools': ['ai-ml', 'enterprise', 'infrastructure'],
    };

    const relatedIndustries = industryRelations[startup.industry] || [];
    const hasRelatedIndustry = relatedIndustries.some(industry => 
      investor.preferredIndustries.includes(industry)
    );

    return hasRelatedIndustry ? 60 : 20;
  }

  private calculateGeographyMatch(startup: StartupData, investor: InvestorData): number {
    if (!investor.geographicFocus || investor.geographicFocus.length === 0) {
      return 80; // No geographic restrictions
    }

    if (investor.geographicFocus.includes('global')) {
      return 100;
    }

    // Simple geography matching - in a real implementation, this would be more sophisticated
    const startupLocation = startup.location?.toLowerCase() || '';
    
    for (const geo of investor.geographicFocus) {
      if (startupLocation.includes(geo.replace('-', ' '))) {
        return 100;
      }
    }

    // Partial matches
    if (investor.geographicFocus.includes('north-america') && 
        (startupLocation.includes('us') || startupLocation.includes('canada'))) {
      return 90;
    }

    return 30; // Geographic mismatch
  }

  private calculateCheckSizeMatch(startup: StartupData, investor: InvestorData): number {
    if (!investor.typicalCheckSize && !investor.minInvestmentAmount && !investor.maxInvestmentAmount) {
      return 80; // No size restrictions
    }

    // Estimate startup's funding needs based on stage
    const stageToFundingNeeds: Record<string, number> = {
      'pre-seed': 250000,
      'seed': 1000000,
      'series-a': 5000000,
      'series-b': 15000000,
      'series-c-plus': 50000000,
      'growth': 100000000,
      'late-stage': 200000000,
    };

    const estimatedNeed = stageToFundingNeeds[startup.stage] || 1000000;
    const checkSize = investor.typicalCheckSize || 
                     ((investor.minInvestmentAmount || 0) + (investor.maxInvestmentAmount || estimatedNeed)) / 2;

    // Calculate how well the check size matches the need
    const ratio = checkSize / estimatedNeed;
    
    if (ratio >= 0.1 && ratio <= 0.5) return 100; // Good fit
    if (ratio >= 0.05 && ratio <= 1.0) return 80;  // Acceptable fit
    if (ratio >= 0.02 && ratio <= 2.0) return 60;  // Possible fit
    
    return 30; // Poor fit
  }

  private calculateTeamMatch(startup: StartupData, investor: InvestorData): number {
    if (!startup.founders || startup.founders.length === 0) {
      return 50; // No team data
    }

    let teamScore = 0;
    const founders = startup.founders;

    // Experience scoring
    const avgExperience = founders.reduce((sum, founder) => 
      sum + (founder.experience || 0), 0) / founders.length;
    
    if (avgExperience >= 10) teamScore += 30;
    else if (avgExperience >= 5) teamScore += 20;
    else teamScore += 10;

    // Previous exits
    const hasExits = founders.some(founder => (founder.previousExits || 0) > 0);
    if (hasExits) teamScore += 25;

    // Education and expertise
    const hasStrongEducation = founders.some(founder => 
      founder.education?.includes('Stanford') || 
      founder.education?.includes('MIT') || 
      founder.education?.includes('Harvard')
    );
    if (hasStrongEducation) teamScore += 15;

    // Technical expertise for tech startups
    if (startup.industry === 'ai-ml' || startup.industry === 'developer-tools') {
      const hasTechExpertise = founders.some(founder => 
        founder.expertise?.some(exp => 
          exp.includes('engineering') || exp.includes('AI') || exp.includes('ML')
        )
      );
      if (hasTechExpertise) teamScore += 20;
    }

    // Team size appropriateness
    const teamSize = startup.teamSize || founders.length;
    if (teamSize >= 2 && teamSize <= 5) teamScore += 10;

    return Math.min(100, teamScore);
  }

  private calculateTractionMatch(startup: StartupData, investor: InvestorData): number {
    if (!startup.traction) {
      return 40; // No traction data
    }

    let tractionScore = 0;
    const traction = startup.traction;

    // User growth
    if (traction.users) {
      if (traction.users >= 100000) tractionScore += 30;
      else if (traction.users >= 10000) tractionScore += 20;
      else if (traction.users >= 1000) tractionScore += 10;
    }

    // Revenue
    if (traction.revenue) {
      if (traction.revenue >= 1000000) tractionScore += 30;
      else if (traction.revenue >= 100000) tractionScore += 20;
      else if (traction.revenue >= 10000) tractionScore += 10;
    }

    // Growth rate
    if (traction.growth) {
      if (traction.growth >= 20) tractionScore += 25; // 20% monthly growth
      else if (traction.growth >= 10) tractionScore += 15;
      else if (traction.growth >= 5) tractionScore += 10;
    }

    // Partnerships
    if (traction.partnerships && traction.partnerships > 0) {
      tractionScore += 15;
    }

    return Math.min(100, tractionScore);
  }

  private calculateValueAddMatch(startup: StartupData, investor: InvestorData): number {
    if (!investor.valueAdd || investor.valueAdd.length === 0) {
      return 60; // No specific value add
    }

    // Map startup needs to investor value add
    const startupNeeds = this.identifyStartupNeeds(startup);
    const matchingValueAdd = investor.valueAdd.filter(value => 
      startupNeeds.includes(value)
    );

    const matchPercentage = matchingValueAdd.length / Math.max(startupNeeds.length, 1);
    return Math.min(100, matchPercentage * 100 + 20);
  }

  private calculateNetworkMatch(startup: StartupData, investor: InvestorData): number {
    // This would be more sophisticated with actual network data
    // For now, use industry and stage as proxies
    
    let networkScore = 50; // Base score

    // Industry network
    if (investor.preferredIndustries.includes(startup.industry)) {
      networkScore += 30;
    }

    // Stage network
    if (investor.investmentStages.includes(startup.stage)) {
      networkScore += 20;
    }

    return Math.min(100, networkScore);
  }

  private calculateTimingMatch(startup: StartupData, investor: InvestorData): number {
    // Market timing factors
    let timingScore = 70; // Base score

    // Hot industries get bonus
    const hotIndustries = ['ai-ml', 'fintech', 'healthcare'];
    if (hotIndustries.includes(startup.industry)) {
      timingScore += 20;
    }

    // Early stage in hot market
    if (startup.stage === 'seed' && hotIndustries.includes(startup.industry)) {
      timingScore += 10;
    }

    return Math.min(100, timingScore);
  }

  private calculateRiskMatch(startup: StartupData, investor: InvestorData): number {
    // Risk assessment based on stage, traction, and team
    let riskScore = 50;

    // Stage risk
    const stageRisk: Record<string, number> = {
      'pre-seed': 20,
      'seed': 40,
      'series-a': 60,
      'series-b': 75,
      'series-c-plus': 85,
      'growth': 90,
      'late-stage': 95,
    };

    riskScore = stageRisk[startup.stage] || 50;

    // Adjust for traction
    if (startup.traction?.revenue && startup.traction.revenue > 100000) {
      riskScore += 15;
    }

    // Adjust for team experience
    if (startup.founders?.some(f => (f.previousExits || 0) > 0)) {
      riskScore += 10;
    }

    return Math.min(100, riskScore);
  }

  private calculateOverallScore(scoreBreakdown: MatchingScore['scoreBreakdown']): number {
    let weightedScore = 0;
    
    Object.entries(scoreBreakdown).forEach(([key, score]) => {
      const weight = this.weights[key as keyof typeof this.weights] || 0;
      weightedScore += score * weight;
    });

    return Math.round(weightedScore);
  }

  private calculateConfidence(
    scoreBreakdown: MatchingScore['scoreBreakdown'], 
    startup: StartupData, 
    investor: InvestorData
  ): number {
    // Confidence based on data completeness and score consistency
    let confidence = 0.5;

    // Data completeness
    const startupDataCompleteness = this.calculateDataCompleteness(startup);
    const investorDataCompleteness = this.calculateDataCompleteness(investor);
    confidence += (startupDataCompleteness + investorDataCompleteness) * 0.2;

    // Score consistency (lower variance = higher confidence)
    const scores = Object.values(scoreBreakdown);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const consistencyBonus = Math.max(0, (100 - variance) / 100) * 0.3;
    confidence += consistencyBonus;

    return Math.min(1, confidence);
  }

  private calculateSuccessProbability(overallScore: number, confidence: number): number {
    // Convert score to probability with confidence adjustment
    const baseProbability = overallScore / 100;
    return baseProbability * confidence;
  }

  private determineExpectedOutcome(overallScore: number, successProbability: number): string {
    if (overallScore >= 85 && successProbability >= 0.8) return 'high-prob-investment';
    if (overallScore >= 70 && successProbability >= 0.6) return 'medium-prob-investment';
    if (overallScore >= 50) return 'low-prob-investment';
    if (overallScore >= 30) return 'advisory';
    return 'no-match';
  }

  private determineRecommendedAction(overallScore: number, confidence: number): string {
    if (overallScore >= 80 && confidence >= 0.8) return 'immediate-intro';
    if (overallScore >= 70 && confidence >= 0.6) return 'warm-intro';
    if (overallScore >= 50) return 'cold-outreach';
    if (overallScore >= 30) return 'build-relationship';
    return 'no-action';
  }

  private generateReasoning(
    scoreBreakdown: MatchingScore['scoreBreakdown'], 
    startup: StartupData, 
    investor: InvestorData
  ): string[] {
    const reasoning: string[] = [];

    // Top scoring factors
    const sortedScores = Object.entries(scoreBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    sortedScores.forEach(([factor, score]) => {
      if (score >= 80) {
        reasoning.push(this.getPositiveReasoning(factor, startup, investor));
      }
    });

    // Low scoring factors
    const lowScores = Object.entries(scoreBreakdown)
      .filter(([,score]) => score < 50)
      .slice(0, 2);

    lowScores.forEach(([factor, score]) => {
      reasoning.push(this.getNegativeReasoning(factor, startup, investor));
    });

    return reasoning;
  }

  private getPositiveReasoning(factor: string, startup: StartupData, investor: InvestorData): string {
    const reasoningMap: Record<string, string> = {
      stageMatch: `Perfect stage alignment - investor focuses on ${startup.stage} companies`,
      industryMatch: `Strong industry fit - investor specializes in ${startup.industry}`,
      checkSizeMatch: `Investment size matches startup's funding needs`,
      teamMatch: `Experienced founding team with relevant background`,
      tractionMatch: `Strong traction metrics demonstrate market validation`,
      geographyMatch: `Geographic alignment with investor's focus areas`,
      valueAddMatch: `Investor's expertise aligns with startup's needs`,
      networkMatch: `Strong network synergies in ${startup.industry}`,
      timingMatch: `Excellent market timing for ${startup.industry}`,
      riskMatch: `Risk profile matches investor's tolerance`,
    };

    return reasoningMap[factor] || `Strong ${factor} alignment`;
  }

  private getNegativeReasoning(factor: string, startup: StartupData, investor: InvestorData): string {
    const reasoningMap: Record<string, string> = {
      stageMatch: `Stage mismatch - investor typically invests in different stages`,
      industryMatch: `Industry mismatch - outside investor's focus areas`,
      checkSizeMatch: `Investment size doesn't align with typical check size`,
      teamMatch: `Team experience may not meet investor's standards`,
      tractionMatch: `Limited traction data or metrics`,
      geographyMatch: `Geographic mismatch with investor's focus`,
      valueAddMatch: `Limited alignment with investor's value-add capabilities`,
      networkMatch: `Limited network synergies`,
      timingMatch: `Market timing concerns`,
      riskMatch: `Risk profile mismatch`,
    };

    return reasoningMap[factor] || `Potential concern with ${factor}`;
  }

  private identifyStartupNeeds(startup: StartupData): string[] {
    const needs: string[] = [];

    // Stage-based needs
    if (startup.stage === 'pre-seed' || startup.stage === 'seed') {
      needs.push('mentorship', 'strategic-guidance', 'network-access');
    }
    
    if (startup.stage === 'series-a' || startup.stage === 'series-b') {
      needs.push('business-development', 'customer-introductions', 'talent-acquisition');
    }

    // Industry-based needs
    if (startup.industry === 'ai-ml' || startup.industry === 'developer-tools') {
      needs.push('technical-expertise');
    }

    if (startup.industry === 'consumer' || startup.industry === 'ecommerce') {
      needs.push('marketing-pr', 'customer-introductions');
    }

    return needs;
  }

  private calculateDataCompleteness(data: any): number {
    const requiredFields = Object.keys(data).filter(key => data[key] !== undefined && data[key] !== null);
    const totalFields = Object.keys(data).length;
    return requiredFields.length / totalFields;
  }
}
