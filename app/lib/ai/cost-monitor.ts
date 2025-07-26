import { EventEmitter } from 'events';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
}

export interface CostEntry {
  id: string;
  timestamp: number;
  model: string;
  provider: 'openai' | 'anthropic' | 'local';
  usage: TokenUsage;
  cost: number;
  cached: boolean;
  requestType: string;
  userId?: string;
  projectId?: string;
}

export interface CostSummary {
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  cachedTokens: number;
  savingsFromCache: number;
  averageCostPerRequest: number;
  costByModel: Record<string, number>;
  costByProvider: Record<string, number>;
  costByHour: Record<string, number>;
  projectedMonthlyCost: number;
}

export interface BudgetAlert {
  type: 'warning' | 'critical' | 'exceeded';
  message: string;
  currentSpend: number;
  budgetLimit: number;
  percentUsed: number;
}

/**
 * Cost monitoring and tracking system
 * Implements Cursor-style cost optimization with caching awareness
 */
export class CostMonitor extends EventEmitter {
  private costEntries: CostEntry[] = [];
  private budgetLimits: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  } = {};
  
  // Model pricing (per 1K tokens)
  private readonly pricing = {
    // OpenAI
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    
    // Anthropic
    'claude-3-opus': { prompt: 0.015, completion: 0.075 },
    'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
    'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
    
    // Open models (approximate hosting costs)
    'mixtral-8x7b': { prompt: 0.00027, completion: 0.00027 },
    'llama-3-70b': { prompt: 0.0008, completion: 0.0008 },
    
    // Custom/local models
    'custom': { prompt: 0.0001, completion: 0.0001 }
  };
  
  // Cache discount (90% reduction as per research)
  private readonly CACHE_DISCOUNT = 0.9;

  constructor() {
    super();
    this.loadPersistedData();
  }

  /**
   * Track a new API usage
   */
  trackUsage(
    model: string,
    provider: 'openai' | 'anthropic' | 'local',
    usage: TokenUsage,
    requestType: string,
    metadata?: {
      userId?: string;
      projectId?: string;
      cached?: boolean;
    }
  ): CostEntry {
    const pricing = this.pricing[model as keyof typeof this.pricing] || this.pricing.custom;
    
    // Calculate base cost
    let promptCost = (usage.promptTokens / 1000) * pricing.prompt;
    let completionCost = (usage.completionTokens / 1000) * pricing.completion;
    
    // Apply cache discount if applicable
    if (metadata?.cached && usage.cachedTokens) {
      const cachedPromptCost = (usage.cachedTokens / 1000) * pricing.prompt * (1 - this.CACHE_DISCOUNT);
      const uncachedPromptCost = ((usage.promptTokens - usage.cachedTokens) / 1000) * pricing.prompt;
      promptCost = cachedPromptCost + uncachedPromptCost;
    }
    
    const totalCost = promptCost + completionCost;
    
    const entry: CostEntry = {
      id: `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      model,
      provider,
      usage,
      cost: totalCost,
      cached: metadata?.cached || false,
      requestType,
      userId: metadata?.userId,
      projectId: metadata?.projectId
    };
    
    this.costEntries.push(entry);
    
    // Check budget alerts
    this.checkBudgetAlerts();
    
    // Persist data
    this.persistData();
    
    // Emit usage event
    this.emit('usage', entry);
    
    return entry;
  }

  /**
   * Get cost summary for a time period
   */
  getCostSummary(startTime?: number, endTime?: number): CostSummary {
    const now = Date.now();
    const start = startTime || now - 24 * 60 * 60 * 1000; // Default: last 24 hours
    const end = endTime || now;
    
    const relevantEntries = this.costEntries.filter(
      entry => entry.timestamp >= start && entry.timestamp <= end
    );
    
    const summary: CostSummary = {
      totalCost: 0,
      totalRequests: relevantEntries.length,
      totalTokens: 0,
      cachedTokens: 0,
      savingsFromCache: 0,
      averageCostPerRequest: 0,
      costByModel: {},
      costByProvider: {},
      costByHour: {},
      projectedMonthlyCost: 0
    };
    
    // Calculate totals
    for (const entry of relevantEntries) {
      summary.totalCost += entry.cost;
      summary.totalTokens += entry.usage.totalTokens;
      summary.cachedTokens += entry.usage.cachedTokens || 0;
      
      // Cost by model
      summary.costByModel[entry.model] = 
        (summary.costByModel[entry.model] || 0) + entry.cost;
      
      // Cost by provider
      summary.costByProvider[entry.provider] = 
        (summary.costByProvider[entry.provider] || 0) + entry.cost;
      
      // Cost by hour
      const hour = new Date(entry.timestamp).toISOString().substr(0, 13);
      summary.costByHour[hour] = (summary.costByHour[hour] || 0) + entry.cost;
      
      // Calculate savings from cache
      if (entry.cached && entry.usage.cachedTokens) {
        const pricing = this.pricing[entry.model as keyof typeof this.pricing] || this.pricing.custom;
        const fullCost = (entry.usage.cachedTokens / 1000) * pricing.prompt;
        const actualCost = fullCost * (1 - this.CACHE_DISCOUNT);
        summary.savingsFromCache += (fullCost - actualCost);
      }
    }
    
    // Calculate averages
    summary.averageCostPerRequest = 
      summary.totalRequests > 0 ? summary.totalCost / summary.totalRequests : 0;
    
    // Project monthly cost based on daily average
    const timeSpan = end - start;
    const dailyRate = summary.totalCost / (timeSpan / (24 * 60 * 60 * 1000));
    summary.projectedMonthlyCost = dailyRate * 30;
    
    return summary;
  }

  /**
   * Set budget limits
   */
  setBudgetLimits(limits: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  }): void {
    this.budgetLimits = limits;
    this.checkBudgetAlerts();
  }

  /**
   * Check and emit budget alerts
   */
  private checkBudgetAlerts(): void {
    const now = Date.now();
    
    // Check hourly budget
    if (this.budgetLimits.hourly) {
      const hourlySpend = this.getCostSummary(
        now - 60 * 60 * 1000,
        now
      ).totalCost;
      
      this.emitBudgetAlert(hourlySpend, this.budgetLimits.hourly, 'hourly');
    }
    
    // Check daily budget
    if (this.budgetLimits.daily) {
      const dailySpend = this.getCostSummary(
        now - 24 * 60 * 60 * 1000,
        now
      ).totalCost;
      
      this.emitBudgetAlert(dailySpend, this.budgetLimits.daily, 'daily');
    }
    
    // Check monthly budget
    if (this.budgetLimits.monthly) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthlySpend = this.getCostSummary(
        monthStart.getTime(),
        now
      ).totalCost;
      
      this.emitBudgetAlert(monthlySpend, this.budgetLimits.monthly, 'monthly');
    }
  }

  /**
   * Emit budget alert if needed
   */
  private emitBudgetAlert(
    currentSpend: number, 
    limit: number, 
    period: string
  ): void {
    const percentUsed = (currentSpend / limit) * 100;
    
    let alert: BudgetAlert | null = null;
    
    if (percentUsed >= 100) {
      alert = {
        type: 'exceeded',
        message: `${period} budget exceeded!`,
        currentSpend,
        budgetLimit: limit,
        percentUsed
      };
    } else if (percentUsed >= 90) {
      alert = {
        type: 'critical',
        message: `${period} budget nearly exhausted`,
        currentSpend,
        budgetLimit: limit,
        percentUsed
      };
    } else if (percentUsed >= 75) {
      alert = {
        type: 'warning',
        message: `${period} budget usage high`,
        currentSpend,
        budgetLimit: limit,
        percentUsed
      };
    }
    
    if (alert) {
      this.emit('budgetAlert', alert);
    }
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getCostSummary();
    
    // Check cache usage
    const cacheRate = summary.cachedTokens / summary.totalTokens;
    if (cacheRate < 0.3) {
      recommendations.push(
        `Low cache usage (${(cacheRate * 100).toFixed(1)}%). ` +
        'Consider implementing prompt caching for repeated queries.'
      );
    }
    
    // Check model distribution
    const expensiveModels = ['gpt-4', 'gpt-4-turbo', 'claude-3-opus'];
    let expensiveUsage = 0;
    
    for (const model of expensiveModels) {
      expensiveUsage += summary.costByModel[model] || 0;
    }
    
    const expensivePercentage = (expensiveUsage / summary.totalCost) * 100;
    if (expensivePercentage > 50) {
      recommendations.push(
        `High usage of expensive models (${expensivePercentage.toFixed(1)}%). ` +
        'Consider using model routing to reduce costs.'
      );
    }
    
    // Check request patterns
    if (summary.averageCostPerRequest > 0.05) {
      recommendations.push(
        'High average cost per request. Consider breaking down complex requests ' +
        'or using smaller models for simple tasks.'
      );
    }
    
    // Savings potential
    const potentialSavings = summary.totalCost * 0.3; // Assume 30% savings possible
    recommendations.push(
      `Potential monthly savings: $${(potentialSavings * 30).toFixed(2)} ` +
      'through optimized routing and caching.'
    );
    
    return recommendations;
  }

  /**
   * Export cost data for analysis
   */
  exportCostData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        entries: this.costEntries,
        summary: this.getCostSummary(),
        recommendations: this.getOptimizationRecommendations()
      }, null, 2);
    } else {
      // CSV format
      const headers = ['Timestamp', 'Model', 'Provider', 'Tokens', 'Cost', 'Cached', 'Type'];
      const rows = this.costEntries.map(entry => [
        new Date(entry.timestamp).toISOString(),
        entry.model,
        entry.provider,
        entry.usage.totalTokens,
        entry.cost.toFixed(4),
        entry.cached ? 'Yes' : 'No',
        entry.requestType
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  /**
   * Clear old entries to manage memory
   */
  pruneOldEntries(daysToKeep: number = 30): void {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    this.costEntries = this.costEntries.filter(entry => entry.timestamp > cutoffTime);
    this.persistData();
  }

  /**
   * Persist data to local storage
   */
  private persistData(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('eduviz-cost-data', JSON.stringify({
        entries: this.costEntries,
        budgetLimits: this.budgetLimits
      }));
    }
  }

  /**
   * Load persisted data
   */
  private loadPersistedData(): void {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem('eduviz-cost-data');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          this.costEntries = parsed.entries || [];
          this.budgetLimits = parsed.budgetLimits || {};
        } catch (error) {
          console.error('Failed to load cost data:', error);
        }
      }
    }
  }
}