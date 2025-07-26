import OpenAI from 'openai';

// Make Anthropic optional - will add support later
let Anthropic: any;
try {
  Anthropic = require('@anthropic-ai/sdk').default;
} catch (e) {
  console.log('Anthropic SDK not available, using OpenAI only');
}

export type ModelType = 'fast' | 'educational' | 'validation' | 'custom';
export type OptimizationGoal = 'cost_optimized' | 'balanced' | 'quality_focused';
export type TaskType = 
  | 'simple_parameter_adjustment'
  | 'visualization_generation'
  | 'complex_educational_concept'
  | 'scientific_validation'
  | 'interactive_features';

interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  costPerToken: number;
  latency: number; // milliseconds
  capabilities: Set<TaskType>;
}

interface RoutingDecision {
  model: ModelConfig;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
}

interface UsageMetrics {
  totalRequests: number;
  totalCost: number;
  modelUsage: Map<string, number>;
  averageLatency: number;
}

export class EducationalModelRouter {
  private models: Map<ModelType, ModelConfig>;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private usageMetrics: UsageMetrics;
  
  // Routing thresholds based on research
  private readonly routingThresholds = {
    cost_optimized: 0.11593,    // 50% strong model usage
    balanced: 0.08,             // 30% strong model usage
    quality_focused: 0.05       // 20% strong model usage
  };
  
  // Task complexity scores for educational content
  private readonly taskComplexityScores: Record<TaskType, number> = {
    simple_parameter_adjustment: 0.2,
    visualization_generation: 0.5,
    complex_educational_concept: 0.8,
    scientific_validation: 0.9,
    interactive_features: 0.6
  };

  constructor() {
    this.models = this.initializeModels();
    this.usageMetrics = {
      totalRequests: 0,
      totalCost: 0,
      modelUsage: new Map(),
      averageLatency: 0
    };
  }

  /**
   * Initialize available models with their configurations
   */
  private initializeModels(): Map<ModelType, ModelConfig> {
    const models = new Map<ModelType, ModelConfig>();
    
    // Fast model for simple adjustments
    models.set('fast', {
      name: 'gpt-3.5-turbo',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      costPerToken: 0.0005,
      latency: 300,
      capabilities: new Set([
        'simple_parameter_adjustment',
        'visualization_generation'
      ])
    });
    
    // Educational model - optimized for D3.js generation
    models.set('educational', {
      name: 'gpt-3.5-turbo-16k',
      provider: 'openai',
      model: 'gpt-3.5-turbo-16k',
      costPerToken: 0.001,
      latency: 400,
      capabilities: new Set([
        'visualization_generation',
        'complex_educational_concept',
        'interactive_features'
      ])
    });
    
    // Validation model for accuracy
    models.set('validation', {
      name: 'gpt-4',
      provider: 'openai',
      model: 'gpt-4',
      costPerToken: 0.03,
      latency: 800,
      capabilities: new Set([
        'scientific_validation',
        'complex_educational_concept'
      ])
    });
    
    return models;
  }

  /**
   * Initialize API clients
   */
  async initialize(openaiKey?: string, anthropicKey?: string): Promise<void> {
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
    if (anthropicKey && Anthropic) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    } else if (anthropicKey && !Anthropic) {
      console.log('Anthropic key provided but SDK not available. Using OpenAI only.');
    }
  }

  /**
   * Route request to appropriate model based on task and optimization goal
   */
  async routeRequest(
    taskType: TaskType,
    userPrompt: string,
    context: string,
    optimizationGoal: OptimizationGoal = 'balanced'
  ): Promise<RoutingDecision> {
    const complexity = this.taskComplexityScores[taskType];
    const threshold = this.routingThresholds[optimizationGoal];
    
    // Analyze prompt for additional routing hints
    const promptAnalysis = this.analyzePrompt(userPrompt);
    
    // Determine best model
    let selectedModel: ModelConfig;
    let reason: string;
    
    if (complexity > threshold || promptAnalysis.requiresHighAccuracy) {
      // Use strong model for complex tasks
      selectedModel = this.models.get('validation')!;
      reason = 'Complex educational concept requiring high accuracy';
    } else if (promptAnalysis.isVisualizationTask && complexity > 0.3) {
      // Use educational model for visualization tasks
      selectedModel = this.models.get('educational')!;
      reason = 'D3.js visualization generation task';
    } else {
      // Use fast model for simple tasks
      selectedModel = this.models.get('fast')!;
      reason = 'Simple parameter adjustment or basic task';
    }
    
    // Check if model can handle the task
    if (!selectedModel.capabilities.has(taskType)) {
      // Fallback to a capable model
      selectedModel = this.findCapableModel(taskType) || selectedModel;
      reason = `Fallback: original model not capable of ${taskType}`;
    }
    
    // Calculate estimated cost
    const estimatedTokens = this.estimateTokens(userPrompt + context);
    const estimatedCost = estimatedTokens * selectedModel.costPerToken;
    
    // Update metrics
    this.updateMetrics(selectedModel.name, estimatedCost);
    
    return {
      model: selectedModel,
      reason,
      estimatedCost,
      estimatedLatency: selectedModel.latency,
      confidence: this.calculateConfidence(selectedModel, taskType, complexity)
    };
  }

  /**
   * Analyze prompt for routing hints
   */
  private analyzePrompt(prompt: string): { 
    requiresHighAccuracy: boolean; 
    isVisualizationTask: boolean;
    hasComplexMath: boolean;
  } {
    const lowerPrompt = prompt.toLowerCase();
    
    return {
      requiresHighAccuracy: /scientifically accurate|precise|exact|formula/i.test(prompt),
      isVisualizationTask: /visuali[sz]e|show|display|animate|interactive/i.test(prompt),
      hasComplexMath: /integral|derivative|differential|quantum|relativity/i.test(prompt)
    };
  }

  /**
   * Find a model capable of handling the task
   */
  private findCapableModel(taskType: TaskType): ModelConfig | null {
    for (const [_, model] of this.models) {
      if (model.capabilities.has(taskType)) {
        return model;
      }
    }
    return null;
  }

  /**
   * Estimate token count for cost calculation
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate confidence in routing decision
   */
  private calculateConfidence(
    model: ModelConfig, 
    taskType: TaskType, 
    complexity: number
  ): number {
    let confidence = 0.5;
    
    // Model capability match
    if (model.capabilities.has(taskType)) {
      confidence += 0.3;
    }
    
    // Complexity alignment
    if (complexity < 0.3 && model.name.includes('fast')) {
      confidence += 0.2;
    } else if (complexity > 0.7 && model.name.includes('validation')) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Update usage metrics
   */
  private updateMetrics(modelName: string, cost: number): void {
    this.usageMetrics.totalRequests++;
    this.usageMetrics.totalCost += cost;
    
    const currentUsage = this.usageMetrics.modelUsage.get(modelName) || 0;
    this.usageMetrics.modelUsage.set(modelName, currentUsage + 1);
  }

  /**
   * Execute request with selected model
   */
  async executeWithModel(
    decision: RoutingDecision,
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.3
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      let result: string;
      
      switch (decision.model.provider) {
        case 'openai':
          result = await this.executeOpenAI(
            decision.model.model,
            systemPrompt,
            userPrompt,
            temperature
          );
          break;
          
        case 'anthropic':
          if (this.anthropic) {
            result = await this.executeAnthropic(
              decision.model.model,
              systemPrompt,
              userPrompt,
              temperature
            );
          } else {
            // Fallback to OpenAI if Anthropic not available
            console.log('Anthropic not available, using OpenAI fallback');
            result = await this.executeOpenAI(
              'gpt-4', // Use GPT-4 as fallback for Anthropic models
              systemPrompt,
              userPrompt,
              temperature
            );
          }
          break;
          
        case 'local':
          // For now, fallback to OpenAI
          // In production, this would call your local model
          result = await this.executeOpenAI(
            'gpt-3.5-turbo',
            systemPrompt,
            userPrompt,
            temperature
          );
          break;
          
        default:
          throw new Error(`Unknown provider: ${decision.model.provider}`);
      }
      
      // Update latency metrics
      const latency = Date.now() - startTime;
      this.updateLatencyMetrics(latency);
      
      return result;
    } catch (error) {
      console.error('Model execution error:', error);
      throw new Error(`Failed to execute with ${decision.model.name}: ${error}`);
    }
  }

  /**
   * Execute with OpenAI models
   */
  private async executeOpenAI(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }
    
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: 2000
    });
    
    return response.choices[0].message.content || '';
  }

  /**
   * Execute with Anthropic models
   */
  private async executeAnthropic(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number
  ): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }
    
    const response = await this.anthropic.messages.create({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature,
      max_tokens: 2000
    });
    
    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
  }

  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(latency: number): void {
    const totalLatency = this.usageMetrics.averageLatency * (this.usageMetrics.totalRequests - 1);
    this.usageMetrics.averageLatency = (totalLatency + latency) / this.usageMetrics.totalRequests;
  }

  /**
   * Get usage report
   */
  getUsageReport(): UsageMetrics {
    return { ...this.usageMetrics };
  }

  /**
   * Get cost optimization recommendations
   */
  getCostOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = this.getUsageReport();
    
    // Analyze model usage distribution
    const validationUsage = report.modelUsage.get('claude-3-sonnet') || 0;
    const totalUsage = report.totalRequests;
    
    if (totalUsage > 0) {
      const validationPercentage = (validationUsage / totalUsage) * 100;
      
      if (validationPercentage > 40) {
        recommendations.push(
          'Consider using more cost-optimized routing. Validation model usage is high at ' +
          `${validationPercentage.toFixed(1)}%`
        );
      }
    }
    
    if (report.averageLatency > 1000) {
      recommendations.push(
        'Average latency is high. Consider caching common requests or using faster models.'
      );
    }
    
    return recommendations;
  }
}