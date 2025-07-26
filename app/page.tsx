'use client';

import { useState } from 'react';
import { PromptInput } from './components/PromptInput/PromptInput';
import { Preview } from './components/Preview/Preview';
import { Editor } from './components/Editor/Editor';
import { pendulumTemplate } from './lib/templates/physics/pendulum';
import { testVisualization } from './lib/templates/test-visualization';
import { cn } from './lib/utils';

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [mobileView, setMobileView] = useState<'input' | 'output'>('input');

  const handleGenerate = async (prompt: string, subject: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Check if we should use demo mode
      const isDemoMode = !process.env.NEXT_PUBLIC_API_CONFIGURED;
      
      // Test mode for debugging
      if (prompt.toLowerCase() === 'test d3') {
        console.log('Using test visualization');
        setGeneratedCode(testVisualization);
        return;
      }
      
      if (isDemoMode && prompt.toLowerCase().includes('pendulum')) {
        // Demo mode - use template
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGeneratedCode(pendulumTemplate);
        return;
      }
      
      // Call the advanced AI orchestrator API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          subject,
          optimization: 'balanced'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Generation failed');
      }
      
      if (data.success && data.code) {
        console.log('=== Generated Code ===');
        console.log(data.code);
        console.log('=== End Generated Code ===');
        
        setGeneratedCode(data.code);
        
        // Show validation feedback if any
        if (data.validation?.feedback?.length > 0) {
          console.log('Validation feedback:', data.validation.feedback);
        }
        
        // Switch to output view on mobile after generation
        if (window.innerWidth < 1024) {
          setMobileView('output');
        }
        
        // Log cost and metrics information
        if (data.metrics?.cost) {
          console.log(`Generation cost: $${data.metrics.cost.toFixed(4)}`);
        }
        if (data.metrics?.generationTime) {
          console.log(`Generation time: ${(data.metrics.generationTime / 1000).toFixed(1)}s`);
        }
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      
      // Provide helpful error messages
      if (err.message?.includes('API key')) {
        setError(
          'AI generation requires API configuration. Please set OPENAI_API_KEY in your .env.local file. ' +
          'For demo, try "show me how a pendulum works"'
        );
      } else if (err.message?.includes('Budget limit exceeded')) {
        setError('Monthly cost limit reached. Please contact support or try again next month.');
      } else {
        setError(`Failed to generate visualization: ${err.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EduViz AI</h1>
              <p className="text-sm text-gray-600">Transform learning with AI-powered visualizations</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Beta</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setMobileView('input')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors",
              mobileView === 'input'
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Input
          </button>
          <button
            onClick={() => setMobileView('output')}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors",
              mobileView === 'output'
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Output
          </button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input/Controls */}
        <div className={cn(
          "w-full lg:w-2/5 xl:w-1/3 bg-white border-r border-gray-200 overflow-y-auto scroll-thin",
          "lg:panel-height panel-height-mobile",
          "lg:block",
          mobileView === 'input' ? 'block' : 'hidden'
        )}>
          <div className="p-6 space-y-6">
            {/* Condensed Hero Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Create Interactive Visualizations
              </h2>
              <p className="text-sm text-gray-600">
                Describe what you want to teach, and our AI will generate beautiful, 
                interactive D3.js visualizations.
              </p>
            </div>

            {/* Input Section */}
            <PromptInput 
              onSubmit={handleGenerate} 
              isGenerating={isGenerating} 
            />

            {/* Info Cards - Show when no visualization */}
            {!generatedCode && !isGenerating && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm">Instant Generation</h3>
                      <p className="text-xs text-blue-700 mt-1">
                        Get working visualizations in seconds
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-900 text-sm">Scientifically Accurate</h3>
                      <p className="text-xs text-green-700 mt-1">
                        Validated for educational accuracy
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-purple-900 text-sm">Fully Interactive</h3>
                      <p className="text-xs text-purple-700 mt-1">
                        Students learn by doing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className={cn(
          "flex-1 bg-gray-50 overflow-hidden flex flex-col",
          "lg:flex",
          mobileView === 'output' ? 'flex' : 'hidden'
        )}>
          {generatedCode || isGenerating || error ? (
            <>
              {/* Tab Navigation */}
              <div className="bg-white border-b border-gray-200 px-6 pt-4">
                <nav className="flex space-x-6">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                      "pb-3 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === 'preview'
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={cn(
                      "pb-3 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === 'code'
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                    disabled={!generatedCode}
                  >
                    Code
                  </button>
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'preview' ? (
                  <Preview 
                    code={generatedCode} 
                    isLoading={isGenerating} 
                    error={error} 
                  />
                ) : (
                  <Editor 
                    code={generatedCode} 
                    readOnly={true} 
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center max-w-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to create</h3>
                <p className="text-sm text-gray-600">
                  Enter a prompt in the left panel to generate your first visualization
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}