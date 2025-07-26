'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';

interface PromptInputProps {
  onSubmit: (prompt: string, subject: string) => void;
  isGenerating: boolean;
}

const EXAMPLE_PROMPTS = {
  physics: [
    "Show me how a pendulum works",
    "Demonstrate wave interference",
    "Visualize projectile motion"
  ],
  math: [
    "Show me derivatives visually",
    "Explain integration with areas",
    "Demonstrate vector addition"
  ],
  chemistry: [
    "Show molecular structures",
    "Visualize chemical reactions",
    "Interactive periodic table"
  ]
};

export function PromptInput({ onSubmit, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [subject, setSubject] = useState('physics');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt.trim(), subject);
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSubject('physics')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              subject === 'physics' 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Physics
          </button>
          <button
            type="button"
            onClick={() => setSubject('math')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              subject === 'math' 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Mathematics
          </button>
          <button
            type="button"
            onClick={() => setSubject('chemistry')}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              subject === 'chemistry' 
                ? "bg-purple-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Chemistry
          </button>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to visualize..."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600 min-h-[120px]"
            rows={4}
            disabled={isGenerating}
          />
        </div>
        
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className={cn(
            "w-full px-6 py-3 rounded-lg font-medium transition-colors",
            !prompt.trim() || isGenerating
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          )}
        >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate'
            )}
        </button>

        <div className="space-y-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS[subject as keyof typeof EXAMPLE_PROMPTS].map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full transition-colors border border-gray-200 dark:border-gray-600"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}