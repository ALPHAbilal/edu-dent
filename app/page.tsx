'use client';

import { useState } from 'react';
import { PromptInput } from './components/PromptInput/PromptInput';
import { Preview } from './components/Preview/Preview';
import { Editor } from './components/Editor/Editor';
import { pendulumTemplate } from './lib/templates/physics/pendulum';

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string, subject: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // For now, let's use the pendulum template as a demo
      // In production, this would call our AI orchestrator
      if (prompt.toLowerCase().includes('pendulum')) {
        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGeneratedCode(pendulumTemplate);
      } else {
        // For other prompts, we'll need the AI API
        setError('AI generation requires API key configuration. For demo, try "show me how a pendulum works"');
      }
    } catch (err) {
      setError('Failed to generate visualization. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Create Interactive Educational Visualizations with AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simply describe what you want to teach, and our AI will generate beautiful, 
              interactive D3.js visualizations that make complex concepts easy to understand.
            </p>
          </div>

          {/* Input Section */}
          <PromptInput 
            onSubmit={handleGenerate} 
            isGenerating={isGenerating} 
          />

          {/* Preview Section */}
          <Preview 
            code={generatedCode} 
            isLoading={isGenerating} 
            error={error} 
          />

          {/* Code Editor */}
          <Editor 
            code={generatedCode} 
            readOnly={true} 
          />

          {/* Info Section */}
          {!generatedCode && !isGenerating && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-blue-600 mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Generation</h3>
                  <p className="text-sm text-gray-600">
                    Get working visualizations in seconds, not hours
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-green-600 mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Scientifically Accurate</h3>
                  <p className="text-sm text-gray-600">
                    All visualizations are validated for educational accuracy
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-purple-600 mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fully Interactive</h3>
                  <p className="text-sm text-gray-600">
                    Students learn by doing with interactive parameters
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 EduViz AI. Making education interactive, one visualization at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}