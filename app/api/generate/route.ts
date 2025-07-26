import { NextRequest, NextResponse } from 'next/server';
import { SimpleEducationalOrchestrator } from '@/app/lib/ai/orchestrator-simple';
import { ComplexityLevel } from '@/app/lib/ai/progressive-complexity';

// Initialize orchestrator (in production, this would be done once)
let orchestrator: SimpleEducationalOrchestrator | null = null;

async function getOrchestrator() {
  if (!orchestrator) {
    orchestrator = new SimpleEducationalOrchestrator();
    
    // Initialize with OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    
    await orchestrator.initialize(apiKey);
  }
  
  return orchestrator;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      subject = 'physics', 
      complexity = 'intermediate' 
    } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'API key not configured',
          message: 'Please set OPENAI_API_KEY in environment variables'
        },
        { status: 500 }
      );
    }
    
    // Get or create orchestrator
    const orchestratorInstance = await getOrchestrator();
    
    // Generate visualization
    console.log('Generating visualization for:', prompt);
    const result = await orchestratorInstance.generateVisualization(prompt, {
      subject,
      complexity: complexity as ComplexityLevel,
      maxRetries: 2
    });
    
    // Log metrics
    console.log('Generation metrics:', result.metrics);
    
    // Return the result
    return NextResponse.json({
      success: true,
      code: result.code,
      validation: {
        isValid: result.validation.isValid,
        score: result.validation.score,
        feedback: result.validation.feedback
      },
      metrics: {
        generationTime: result.metrics.generationTime,
        cost: result.metrics.cost,
        tokensUsed: result.metrics.tokensUsed
      }
    });
    
  } catch (error: any) {
    console.error('Generation error:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'API configuration error',
          message: 'OpenAI API key is not properly configured'
        },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Please wait a moment before trying again'
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

// Cost estimation endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required for cost estimation' },
        { status: 400 }
      );
    }
    
    const orchestratorInstance = await getOrchestrator();
    const estimatedCost = orchestratorInstance.estimateCost(prompt);
    const metrics = orchestratorInstance.getMetrics();
    
    return NextResponse.json({
      success: true,
      estimation: {
        estimatedCost,
        currency: 'USD'
      },
      usage: {
        totalRequests: metrics.totalRequests,
        totalCost: metrics.totalCost,
        averageLatency: metrics.averageLatency,
        totalTokens: metrics.totalTokens
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to estimate cost' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    // Quick health check
    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse(null, { status: 503 }); // Service Unavailable
    }
    
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}