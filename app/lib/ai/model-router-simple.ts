import OpenAI from 'openai';

export type TaskType = 
  | 'simple_visualization'
  | 'complex_visualization'
  | 'scientific_validation'
  | 'interactive_features';

export interface ModelMetrics {
  totalRequests: number;
  totalCost: number;
  averageLatency: number;
  totalTokens: number;
}

/**
 * Simplified Model Router for EduViz-AI
 * Uses GPT-4-turbo for all educational visualization tasks
 */
export class SimpleModelRouter {
  private openai: OpenAI | null = null;
  private metrics: ModelMetrics;
  
  // GPT-4-turbo pricing (as of 2025)
  private readonly MODEL = 'gpt-4-turbo-preview';
  private readonly INPUT_COST_PER_1K = 0.01;  // $0.01 per 1K input tokens
  private readonly OUTPUT_COST_PER_1K = 0.03; // $0.03 per 1K output tokens
  
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalCost: 0,
      averageLatency: 0,
      totalTokens: 0
    };
  }

  /**
   * Initialize with OpenAI API key
   */
  async initialize(openaiKey: string): Promise<void> {
    if (!openaiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({ 
      apiKey: openaiKey,
      dangerouslyAllowBrowser: true // Only for development
    });
  }

  /**
   * Execute generation request
   */
  async generate(
    systemPrompt: string,
    userPrompt: string,
    taskType: TaskType,
    temperature: number = 0.3,
    maxTokens: number = 2500
  ): Promise<{
    content: string;
    metrics: {
      latency: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    };
  }> {
    if (!this.openai) {
      throw new Error('Model router not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    
    try {
      // Add task context to system prompt
      const enhancedSystemPrompt = this.enhanceSystemPrompt(systemPrompt, taskType);
      
      // Make API call
      const response = await this.openai.chat.completions.create({
        model: this.MODEL,
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "text" }
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 };
      
      // Debug logging
      console.log('OpenAI Response:', {
        model: response.model,
        content_length: content.length,
        first_100_chars: content.substring(0, 100)
      });
      
      if (!content || content.trim() === '') {
        throw new Error('OpenAI returned empty content');
      }
      
      // Calculate metrics
      const latency = Date.now() - startTime;
      const inputTokens = usage.prompt_tokens;
      const outputTokens = usage.completion_tokens;
      const cost = this.calculateCost(inputTokens, outputTokens);
      
      // Update global metrics
      this.updateMetrics(latency, inputTokens + outputTokens, cost);
      
      return {
        content,
        metrics: {
          latency,
          inputTokens,
          outputTokens,
          cost
        }
      };
    } catch (error) {
      console.error('Generation error:', error);
      throw new Error(`Failed to generate visualization: ${error}`);
    }
  }

  /**
   * Enhance system prompt based on task type
   */
  private enhanceSystemPrompt(basePrompt: string, taskType: TaskType): string {
    const taskEnhancements: Record<TaskType, string> = {
      simple_visualization: `
Focus on clarity and simplicity. Generate clean, well-commented D3.js code.
Ensure the visualization is easy to understand for beginners.`,
      
      complex_visualization: `
Generate sophisticated D3.js visualizations with multiple interactive elements.
Include detailed comments explaining the mathematical concepts.`,
      
      scientific_validation: `
Ensure all calculations are scientifically accurate.
Include formulas and units in the visualization.
Add validation checks for parameter ranges.`,
      
      interactive_features: `
Create highly interactive visualizations with multiple controls.
Include sliders, buttons, and real-time updates.
Ensure smooth animations and responsive design.`
    };

    return `${basePrompt}\n\nTask Context: ${taskEnhancements[taskType]}`;
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.INPUT_COST_PER_1K;
    const outputCost = (outputTokens / 1000) * this.OUTPUT_COST_PER_1K;
    return inputCost + outputCost;
  }

  /**
   * Update metrics
   */
  private updateMetrics(latency: number, tokens: number, cost: number): void {
    this.metrics.totalRequests++;
    this.metrics.totalTokens += tokens;
    this.metrics.totalCost += cost;
    
    // Update average latency
    const totalLatency = this.metrics.averageLatency * (this.metrics.totalRequests - 1);
    this.metrics.averageLatency = (totalLatency + latency) / this.metrics.totalRequests;
  }

  /**
   * Get current metrics
   */
  getMetrics(): ModelMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      totalCost: 0,
      averageLatency: 0,
      totalTokens: 0
    };
  }

  /**
   * Estimate cost for a prompt
   */
  estimateCost(promptLength: number, expectedOutputLength: number = 2000): number {
    // Rough estimation: 1 token ≈ 4 characters
    const inputTokens = Math.ceil(promptLength / 4);
    const outputTokens = Math.ceil(expectedOutputLength / 4);
    return this.calculateCost(inputTokens, outputTokens);
  }
}