'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/app/lib/utils';

interface PreviewProps {
  code: string;
  isLoading?: boolean;
  error?: string | null;
}

export function Preview({ code, isLoading, error }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (!code || isLoading || error) return;

    const executeVisualization = async () => {
      setIsExecuting(true);
      
      try {
        // Clear previous visualization
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div id="visualization"></div>';
        }

        // Create a script element to execute the D3 code
        const script = document.createElement('script');
        script.type = 'module';
        
        // Wrap the code in an IIFE to avoid polluting global scope
        script.textContent = `
          import * as d3 from 'https://cdn.skypack.dev/d3@7';
          window.d3 = d3;
          
          try {
            ${code}
          } catch (error) {
            console.error('Visualization error:', error);
            document.getElementById('visualization').innerHTML = 
              '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
          }
        `;

        // Add the script to the container
        if (containerRef.current) {
          containerRef.current.appendChild(script);
        }
      } catch (err) {
        console.error('Failed to execute visualization:', err);
      } finally {
        setIsExecuting(false);
      }
    };

    executeVisualization();
  }, [code, isLoading, error]);

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-pulse space-y-3 w-full">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-4 font-medium">Generating your visualization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No visualization yet</h3>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Enter a prompt above to generate an interactive educational visualization
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden",
        isExecuting && "opacity-50"
      )}>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Preview</h3>
        </div>
        <div 
          ref={containerRef} 
          className="p-6 min-h-[400px] text-gray-900 dark:text-gray-100"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: 'var(--foreground)'
          }}
        />
      </div>
    </div>
  );
}