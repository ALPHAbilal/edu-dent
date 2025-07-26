import { NextRequest, NextResponse } from 'next/server';
import { AdvancedEducationalOrchestrator } from '@/app/lib/ai/orchestrator';

// Initialize orchestrator (in production, this would be done once)
let orchestrator: AdvancedEducationalOrchestrator | null = null;

async function getOrchestrator() {
  if (!orchestrator) {
    orchestrator = new AdvancedEducationalOrchestrator();
    
    // Initialize with API keys from environment
    await orchestrator.initialize(
      process.env.OPENAI_API_KEY,
      process.env.ANTHROPIC_API_KEY
    );
  }
  
  return orchestrator;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, subject = 'physics', optimization = 'balanced' } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Check if API keys are configured
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { 
          error: 'API keys not configured',
          message: 'Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in environment variables'
        },
        { status: 500 }
      );
    }
    
    // Get or create orchestrator
    const orchestratorInstance = await getOrchestrator();
    
    // Generate visualization
    const result = await orchestratorInstance.generateVisualization(prompt, {
      subject: subject as 'physics' | 'mathematics' | 'chemistry',
      optimizationGoal: optimization as any,
      streaming: false, // For now, use non-streaming in API
      maxRetries: 2
    });
    
    // Return the result
    return NextResponse.json({
      success: true,
      code: result.code,
      validation: result.validation,
      cost: result.cost,
      metadata: result.metadata
    });
    
  } catch (error: any) {
    console.error('Generation error:', error);
    
    // Check for budget exceeded
    if (error.message?.includes('budget')) {
      return NextResponse.json(
        { 
          error: 'Budget limit exceeded',
          message: 'Monthly cost limit has been reached. Please contact support.'
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate visualization',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// Usage report endpoint
export async function GET(request: NextRequest) {
  try {
    const orchestratorInstance = await getOrchestrator();
    const report = orchestratorInstance.getUsageReport();
    
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get usage report' },
      { status: 500 }
    );
  }
}