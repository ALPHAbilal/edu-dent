import { SimpleModelRouter, TaskType } from './model-router-simple';
import { EducationalValidator } from './educational-validator';
import { ProgressiveComplexityManager, ComplexityLevel } from './progressive-complexity';
import { 
  EDUCATIONAL_SYSTEM_PROMPT,
  generateEducationalPrompt,
  generateImprovementPrompt,
  detectEducationalConcept
} from './prompts-enhanced';

export interface GenerationOptions {
  subject?: string;
  complexity?: ComplexityLevel;
  streaming?: boolean;
  maxRetries?: number;
}

export interface GenerationResult {
  code: string;
  validation: {
    isValid: boolean;
    score: number;
    feedback: string[];
  };
  metrics: {
    generationTime: number;
    cost: number;
    tokensUsed: number;
  };
}

/**
 * Simplified Educational AI Orchestrator
 * Single model with educational intelligence
 */
export class SimpleEducationalOrchestrator {
  private modelRouter: SimpleModelRouter;
  private validator: EducationalValidator;
  private complexityManager: ProgressiveComplexityManager;
  
  constructor() {
    this.modelRouter = new SimpleModelRouter();
    this.validator = new EducationalValidator();
    this.complexityManager = new ProgressiveComplexityManager();
  }

  /**
   * Initialize with API key
   */
  async initialize(openaiKey: string): Promise<void> {
    await this.modelRouter.initialize(openaiKey);
  }

  /**
   * Generate educational visualization
   */
  async generateVisualization(
    userPrompt: string,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // 1. Detect educational concept
      const { subject, concept, suggestedLevel } = detectEducationalConcept(userPrompt);
      const complexity = options.complexity || suggestedLevel;
      
      // 2. Enhance prompt with educational context
      let enhancedPrompt = generateEducationalPrompt(userPrompt, complexity);
      
      // 3. Add progressive complexity if template exists
      const template = this.complexityManager.getTemplate(concept);
      if (template) {
        enhancedPrompt = this.complexityManager.enhancePromptForLevel(
          enhancedPrompt,
          concept,
          complexity
        );
      }
      
      // 4. Determine task type for routing
      const taskType = this.determineTaskType(complexity);
      
      // 5. Generate with model
      const { content, metrics } = await this.modelRouter.generate(
        EDUCATIONAL_SYSTEM_PROMPT,
        enhancedPrompt,
        taskType,
        0.3, // Lower temperature for consistency
        3000 // More tokens for complex visualizations
      );
      
      // Clean the generated code first
      let cleanedCode = content;
      
      // Remove any markdown code blocks
      cleanedCode = cleanedCode.replace(/```javascript\s*/gi, '');
      cleanedCode = cleanedCode.replace(/```\s*/g, '');
      cleanedCode = cleanedCode.trim();
      
      // Log for debugging
      console.log('Cleaned code length:', cleanedCode.length);
      console.log('First 200 chars:', cleanedCode.substring(0, 200));
      
      // 6. Validate the generated code
      const validationResult = await this.validator.validate(cleanedCode, {
        subject,
        complexity,
        targetAge: this.inferTargetAge(complexity)
      });
      
      // 7. Retry with improvements if needed
      let finalCode = cleanedCode;
      if (!validationResult.isValid || validationResult.score.overall < 70) {
        finalCode = await this.improveVisualization(
          cleanedCode,
          validationResult,
          enhancedPrompt
        );
      }
      
      // Calculate final metrics
      const generationTime = Date.now() - startTime;
      
      return {
        code: finalCode,
        validation: {
          isValid: validationResult.isValid,
          score: validationResult.score.overall,
          feedback: [
            ...validationResult.errors.map(e => e.message),
            ...validationResult.warnings.map(w => w.message),
            ...validationResult.suggestions
          ]
        },
        metrics: {
          generationTime,
          cost: metrics.cost,
          tokensUsed: metrics.inputTokens + metrics.outputTokens
        }
      };
    } catch (error) {
      console.error('Generation failed:', error);
      throw new Error(`Failed to generate visualization: ${error}`);
    }
  }

  /**
   * Improve visualization based on validation feedback
   */
  private async improveVisualization(
    code: string,
    validationResult: any,
    originalPrompt: string
  ): Promise<string> {
    // Determine what needs most improvement
    const scores = validationResult.score;
    let improvementFocus: 'accuracy' | 'pedagogy' | 'interactivity' = 'pedagogy';
    
    if (scores.scientificAccuracy < scores.pedagogicalQuality) {
      improvementFocus = 'accuracy';
    } else if (scores.interactivity < scores.pedagogicalQuality) {
      improvementFocus = 'interactivity';
    }
    
    // Generate improvement prompt
    const improvementPrompt = generateImprovementPrompt(
      code,
      validationResult.suggestions,
      improvementFocus
    );
    
    // Regenerate with improvements
    const { content } = await this.modelRouter.generate(
      EDUCATIONAL_SYSTEM_PROMPT,
      `${originalPrompt}\n\nCurrent code:\n${code}\n\n${improvementPrompt}`,
      'complex_visualization',
      0.2, // Even lower temperature for refinement
      3000
    );
    
    return content;
  }

  /**
   * Stream visualization generation (for future implementation)
   */
  async *streamVisualization(
    userPrompt: string,
    options: GenerationOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    // For now, generate complete and yield
    const result = await this.generateVisualization(userPrompt, options);
    yield result.code;
  }

  /**
   * Get cost estimate before generation
   */
  estimateCost(userPrompt: string): number {
    const promptLength = EDUCATIONAL_SYSTEM_PROMPT.length + userPrompt.length + 1000; // Buffer
    return this.modelRouter.estimateCost(promptLength, 2500);
  }

  /**
   * Get current usage metrics
   */
  getMetrics() {
    return this.modelRouter.getMetrics();
  }

  /**
   * Determine task type based on complexity
   */
  private determineTaskType(complexity: ComplexityLevel): TaskType {
    switch (complexity) {
      case 'basic':
        return 'simple_visualization';
      case 'intermediate':
        return 'complex_visualization';
      case 'advanced':
        return 'interactive_features';
      default:
        return 'complex_visualization';
    }
  }

  /**
   * Infer target age from complexity
   */
  private inferTargetAge(complexity: ComplexityLevel): number {
    switch (complexity) {
      case 'basic':
        return 14; // Middle school
      case 'intermediate':
        return 17; // High school
      case 'advanced':
        return 20; // College
      default:
        return 17;
    }
  }

  /**
   * Analyze user's learning progress (for future personalization)
   */
  analyzeProgress(interactions: any[]): {
    readyForNextLevel: boolean;
    suggestedTopics: string[];
    strengths: string[];
    areasForImprovement: string[];
  } {
    // Placeholder for future implementation
    return {
      readyForNextLevel: false,
      suggestedTopics: [],
      strengths: [],
      areasForImprovement: []
    };
  }
}

// Export factory function
export function createSimpleOrchestrator(): SimpleEducationalOrchestrator {
  return new SimpleEducationalOrchestrator();
}