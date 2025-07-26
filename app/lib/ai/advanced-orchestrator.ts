import { SemanticCompressionEngine, ConversationTurn } from './semantic-compression';
import { EducationalModelRouter, OptimizationGoal, TaskType } from './model-router';
import { EducationalKnowledgeBase } from './knowledge-base';
// Dynamic RAG system selection
async function getRAGSystem() {
  if (process.env.PINECONE_API_KEY) {
    try {
      const module = await import('./rag-pinecone');
      console.log('Using Pinecone for RAG');
      return module.EducationalRAGSystem;
    } catch (e) {
      console.log('Pinecone module not available, falling back to mock');
    }
  }
  
  if (process.env.SUPABASE_URL) {
    try {
      const module = await import('./rag-supabase');
      console.log('Using Supabase for RAG');
      return module.EducationalRAGSystem;
    } catch (e) {
      console.log('Supabase module not available, falling back to mock');
    }
  }
  
  console.log('Using mock RAG system (no cloud storage)');
  const module = await import('./rag-system-mock');
  return module.EducationalRAGSystem;
}
import { StreamingValidator, StreamValidationChunk } from './streaming-validator';
import { CostMonitor } from './cost-monitor';
import { EDUCATIONAL_SYSTEM_PROMPT, enhancePromptWithTemplate } from './prompts';
import { Transform } from 'stream';

export interface GenerationOptions {
  subject?: 'physics' | 'mathematics' | 'chemistry';
  optimizationGoal?: OptimizationGoal;
  streaming?: boolean;
  includeExplanation?: boolean;
  maxRetries?: number;
}

export interface GenerationResult {
  code: string;
  validation: {
    isValid: boolean;
    errors: any[];
    warnings: any[];
    scientificAccuracy?: number;
    pedagogicalQuality?: number;
  };
  cost: {
    total: number;
    breakdown: {
      model: string;
      tokens: number;
      cached: boolean;
    }[];
  };
  metadata: {
    conceptsUsed: string[];
    retrievalSources: string[];
    generationTime: number;
    compressionRatio?: number;
  };
}

/**
 * Advanced AI Orchestrator for EduViz AI
 * Implements Lovable/Cursor-style architecture with educational focus
 */
export class AdvancedEducationalOrchestrator {
  private compressionEngine: SemanticCompressionEngine;
  private modelRouter: EducationalModelRouter;
  private knowledgeBase: EducationalKnowledgeBase;
  private ragSystem: any;
  private validator: StreamingValidator;
  private costMonitor: CostMonitor;
  
  private conversationHistory: ConversationTurn[] = [];
  private activeProjectId: string | null = null;
  
  constructor() {
    this.compressionEngine = new SemanticCompressionEngine();
    this.modelRouter = new EducationalModelRouter();
    this.knowledgeBase = new EducationalKnowledgeBase();
    this.ragSystem = null; // Will be initialized dynamically
    this.validator = new StreamingValidator();
    this.costMonitor = new CostMonitor();
    
    // Set default budget limits
    this.costMonitor.setBudgetLimits({
      hourly: 5,
      daily: 50,
      monthly: 400
    });
  }

  /**
   * Initialize all components
   */
  async initialize(openaiKey?: string, anthropicKey?: string): Promise<void> {
    // Initialize model router with API keys
    await this.modelRouter.initialize(openaiKey, anthropicKey);
    
    // Dynamically initialize RAG system
    try {
      const RAGSystemClass = await getRAGSystem();
      this.ragSystem = new RAGSystemClass();
      await this.ragSystem.initialize();
    } catch (error) {
      console.error('Failed to initialize RAG system:', error);
      // Use mock RAG as ultimate fallback
      const { EducationalRAGSystem } = await import('./rag-system-mock');
      this.ragSystem = new EducationalRAGSystem();
      await this.ragSystem.initialize();
    }
    
    // Create or load project context
    if (!this.activeProjectId) {
      this.activeProjectId = this.knowledgeBase.createProjectContext('default');
    }
    
    console.log('Advanced orchestrator initialized successfully');
  }

  /**
   * Generate educational visualization with full pipeline
   */
  async generateVisualization(
    userPrompt: string,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const subject = options.subject || 'physics';
    const optimizationGoal = options.optimizationGoal || 'balanced';
    
    try {
      // Step 1: Add to conversation history
      const userTurn: ConversationTurn = {
        role: 'user',
        content: userPrompt,
        timestamp: Date.now(),
        metadata: { subject }
      };
      this.conversationHistory.push(userTurn);
      this.knowledgeBase.addConversation(userTurn);
      
      // Step 2: Compress conversation context
      const compressionResult = await this.compressionEngine.compressContext(
        this.conversationHistory,
        8000 // Target token limit
      );
      
      // Step 3: Retrieve relevant examples from RAG (if available)
      let ragResults: any[] = [];
      if (this.ragSystem) {
        try {
          ragResults = await this.ragSystem.retrieveRelevantCode(
            userPrompt,
            3, // Top 3 examples
            { conceptType: subject }
          );
        } catch (error) {
          console.warn('RAG retrieval failed, continuing without examples:', error);
          ragResults = [];
        }
      }
      
      // Step 4: Find similar concepts in knowledge base
      const similarConcepts = this.knowledgeBase.findSimilarConcepts(userPrompt, 2);
      
      // Step 5: Build enhanced context
      const enhancedContext = this.buildEnhancedContext(
        compressionResult.compressed,
        ragResults.map(r => r.chunk.content),
        similarConcepts
      );
      
      // Step 6: Determine task complexity
      const taskType = this.analyzeTaskType(userPrompt);
      
      // Step 7: Route to appropriate model
      const routingDecision = await this.modelRouter.routeRequest(
        taskType,
        userPrompt,
        enhancedContext,
        optimizationGoal
      );
      
      // Step 8: Generate with streaming validation
      let generatedCode: string;
      let validationResult: any;
      
      if (options.streaming) {
        const result = await this.generateWithStreaming(
          routingDecision,
          userPrompt,
          enhancedContext,
          subject
        );
        generatedCode = result.code;
        validationResult = result.validation;
      } else {
        // Non-streaming generation
        generatedCode = await this.modelRouter.executeWithModel(
          routingDecision,
          EDUCATIONAL_SYSTEM_PROMPT,
          enhancePromptWithTemplate(userPrompt, subject) + '\n\nContext:\n' + enhancedContext
        );
        
        // Validate after generation
        this.validator.reset();
        validationResult = this.validateCode(generatedCode);
      }
      
      // Step 9: Track costs
      const usage = {
        promptTokens: Math.ceil((userPrompt + enhancedContext).length / 4),
        completionTokens: Math.ceil(generatedCode.length / 4),
        totalTokens: 0,
        cachedTokens: ragResults.length > 0 ? Math.ceil(enhancedContext.length / 8) : 0
      };
      usage.totalTokens = usage.promptTokens + usage.completionTokens;
      
      const costEntry = this.costMonitor.trackUsage(
        routingDecision.model.model,
        routingDecision.model.provider,
        usage,
        'visualization_generation',
        {
          projectId: this.activeProjectId || undefined,
          cached: ragResults.length > 0
        }
      );
      
      // Step 10: Add to knowledge base if valid
      if (validationResult.isValid && validationResult.scientificAccuracy > 0.8 && this.ragSystem) {
        try {
          await this.ragSystem.addToCorpus(generatedCode, {
            conceptType: subject,
            complexity: similarConcepts[0]?.difficulty || 5,
            source: 'user-generated'
          });
        } catch (error) {
          console.warn('Failed to add to RAG corpus:', error);
        }
        
        // Track in knowledge base
        const conceptId = similarConcepts[0]?.id || 'custom';
        this.knowledgeBase.addGeneratedVisualization(
          conceptId,
          generatedCode,
          userPrompt,
          validationResult.pedagogicalQuality || 0.8
        );
      }
      
      // Step 11: Add assistant response to history
      const assistantTurn: ConversationTurn = {
        role: 'assistant',
        content: generatedCode,
        timestamp: Date.now(),
        metadata: {
          subject,
          visualizationType: taskType,
          importance: validationResult.scientificAccuracy || 0.8
        }
      };
      this.conversationHistory.push(assistantTurn);
      
      // Return comprehensive result
      return {
        code: generatedCode,
        validation: validationResult,
        cost: {
          total: costEntry.cost,
          breakdown: [{
            model: routingDecision.model.model,
            tokens: usage.totalTokens,
            cached: ragResults.length > 0
          }]
        },
        metadata: {
          conceptsUsed: similarConcepts.map(c => c.name),
          retrievalSources: ragResults.map(r => r.chunk.metadata.source),
          generationTime: Date.now() - startTime,
          compressionRatio: compressionResult.compressionRatio
        }
      };
      
    } catch (error) {
      console.error('Generation failed:', error);
      
      // Retry logic
      if (options.maxRetries && options.maxRetries > 0) {
        console.log(`Retrying... (${options.maxRetries} attempts left)`);
        return this.generateVisualization(userPrompt, {
          ...options,
          maxRetries: options.maxRetries - 1
        });
      }
      
      throw error;
    }
  }

  /**
   * Generate with streaming and real-time validation
   */
  private async generateWithStreaming(
    routingDecision: any,
    userPrompt: string,
    context: string,
    subject: string
  ): Promise<{ code: string; validation: any }> {
    return new Promise((resolve, reject) => {
      let fullCode = '';
      let finalValidation: any = null;
      
      // Create validation stream
      const validationStream = this.validator.createValidationStream();
      
      // Handle validation results
      validationStream.on('data', (chunk: StreamValidationChunk) => {
        if (chunk.type === 'code' && chunk.content) {
          fullCode += chunk.content;
        } else if (chunk.type === 'validation' && chunk.validation) {
          finalValidation = chunk.validation;
        }
      });
      
      validationStream.on('end', () => {
        resolve({ code: fullCode, validation: finalValidation });
      });
      
      validationStream.on('error', reject);
      
      // Start streaming generation (simulated for now)
      // In production, this would use actual streaming from the model
      this.simulateStreamingGeneration(
        routingDecision,
        userPrompt,
        context,
        subject,
        validationStream
      );
    });
  }

  /**
   * Simulate streaming generation for development
   */
  private async simulateStreamingGeneration(
    routingDecision: any,
    userPrompt: string,
    context: string,
    subject: string,
    stream: Transform
  ): Promise<void> {
    // Generate full code first
    const fullCode = await this.modelRouter.executeWithModel(
      routingDecision,
      EDUCATIONAL_SYSTEM_PROMPT,
      enhancePromptWithTemplate(userPrompt, subject) + '\n\nContext:\n' + context
    );
    
    // Stream it in chunks
    const chunks = fullCode.match(/.{1,100}/g) || [];
    
    for (const chunk of chunks) {
      stream.write({
        type: 'code',
        content: chunk
      });
      
      // Simulate streaming delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Signal completion
    stream.write({ type: 'complete' });
    stream.end();
  }

  /**
   * Build enhanced context from multiple sources
   */
  private buildEnhancedContext(
    compressedHistory: ConversationTurn[],
    ragExamples: string[],
    concepts: any[]
  ): string {
    let context = '';
    
    // Add compressed conversation history
    context += '## Conversation Context\n';
    for (const turn of compressedHistory.slice(-5)) { // Last 5 turns
      context += `${turn.role}: ${turn.content}\n`;
    }
    
    // Add RAG examples
    if (ragExamples.length > 0) {
      context += '\n## Similar Examples\n';
      ragExamples.forEach((example, i) => {
        context += `### Example ${i + 1}\n\`\`\`javascript\n${example}\n\`\`\`\n`;
      });
    }
    
    // Add concept information
    if (concepts.length > 0) {
      context += '\n## Related Educational Concepts\n';
      concepts.forEach(concept => {
        context += `- ${concept.name}: ${concept.description}\n`;
        if (concept.formulas) {
          context += `  Formulas: ${concept.formulas.join(', ')}\n`;
        }
      });
    }
    
    return context;
  }

  /**
   * Analyze task type from prompt
   */
  private analyzeTaskType(prompt: string): TaskType {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('adjust') || lowerPrompt.includes('change parameter')) {
      return 'simple_parameter_adjustment';
    } else if (lowerPrompt.includes('interactive') || lowerPrompt.includes('animation')) {
      return 'interactive_features';
    } else if (lowerPrompt.includes('prove') || lowerPrompt.includes('derive')) {
      return 'scientific_validation';
    } else if (lowerPrompt.includes('complex') || lowerPrompt.includes('advanced')) {
      return 'complex_educational_concept';
    } else {
      return 'visualization_generation';
    }
  }

  /**
   * Validate generated code
   */
  private validateCode(code: string): any {
    this.validator.reset();
    
    // Create a simple stream to process the code
    const stream = this.validator.createValidationStream();
    let result: any = null;
    
    stream.on('data', (chunk: StreamValidationChunk) => {
      if (chunk.validation) {
        result = chunk.validation;
      }
    });
    
    // Process code through validator
    stream.write({ type: 'code', content: code });
    stream.write({ type: 'complete' });
    stream.end();
    
    return result || {
      isValid: false,
      errors: [{ message: 'Validation failed' }],
      warnings: [],
      suggestions: []
    };
  }

  /**
   * Get usage statistics and recommendations
   */
  getUsageReport(): {
    costSummary: any;
    modelUsage: any;
    recommendations: string[];
    knowledgeBaseStats: any;
  } {
    return {
      costSummary: this.costMonitor.getCostSummary(),
      modelUsage: this.modelRouter.getUsageReport(),
      recommendations: [
        ...this.costMonitor.getOptimizationRecommendations(),
        ...this.modelRouter.getCostOptimizationRecommendations()
      ],
      knowledgeBaseStats: this.knowledgeBase.getUsageStatistics()
    };
  }

  /**
   * Export project for persistence
   */
  exportProject(): string {
    return this.knowledgeBase.exportProject(this.activeProjectId || 'default');
  }

  /**
   * Import project from saved data
   */
  importProject(projectData: string): void {
    const projectId = this.knowledgeBase.importProject(projectData);
    if (projectId) {
      this.activeProjectId = projectId;
    }
  }
}