import OpenAI from 'openai';
import { EDUCATIONAL_SYSTEM_PROMPT, enhancePromptWithTemplate } from './prompts';

// Note: In production, we'll use Claude API, but for now using OpenAI as placeholder
export class EducationalAIOrchestrator {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for development
    });
  }

  async generateVisualization(userPrompt: string, subject: string = 'physics'): Promise<string> {
    try {
      // Enhance the prompt with educational template
      const enhancedPrompt = enhancePromptWithTemplate(userPrompt, subject);
      
      // Generate visualization code
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: EDUCATIONAL_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent educational content
        max_tokens: 2000
      });

      const code = response.choices[0].message.content || '';
      
      // Validate the generated code
      const validatedCode = await this.validateCode(code);
      
      return validatedCode;
    } catch (error) {
      console.error('Failed to generate visualization:', error);
      throw new Error('Failed to generate visualization. Please try again.');
    }
  }

  private async validateCode(code: string): Promise<string> {
    // Basic validation to ensure code is safe and follows our patterns
    
    // Remove any markdown code blocks if present
    const cleanCode = code.replace(/```javascript\n?/g, '').replace(/```\n?/g, '');
    
    // Check for required D3 patterns
    if (!cleanCode.includes('d3.select') && !cleanCode.includes('d3.')) {
      throw new Error('Generated code does not appear to use D3.js');
    }
    
    // Check for visualization container
    if (!cleanCode.includes('#visualization')) {
      throw new Error('Generated code does not target the #visualization container');
    }
    
    // Basic security checks
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'setTimeout(',
      'setInterval(',
      'fetch(',
      'XMLHttpRequest',
      'import(',
      'require('
    ];
    
    for (const pattern of dangerousPatterns) {
      if (cleanCode.includes(pattern)) {
        throw new Error(`Generated code contains potentially unsafe pattern: ${pattern}`);
      }
    }
    
    return cleanCode;
  }

  async generateWithRetry(userPrompt: string, subject: string, maxRetries: number = 3): Promise<string> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.generateVisualization(userPrompt, subject);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Generation attempt ${i + 1} failed:`, error);
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw lastError || new Error('Failed to generate visualization after multiple attempts');
  }
}

// Export a factory function to create the orchestrator
export function createOrchestrator(apiKey: string): EducationalAIOrchestrator {
  return new EducationalAIOrchestrator(apiKey);
}