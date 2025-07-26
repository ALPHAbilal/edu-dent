'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/app/lib/utils';

// Declare d3 on window
declare global {
  interface Window {
    d3: any;
  }
}

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

        // First, load D3.js from the official CDN
        const loadD3 = () => {
          return new Promise((resolve, reject) => {
            // Check if D3 is already loaded
            if (window.d3) {
              resolve(window.d3);
              return;
            }

            const d3Script = document.createElement('script');
            d3Script.src = 'https://d3js.org/d3.v7.min.js';
            d3Script.onload = () => {
              console.log('D3.js loaded successfully');
              resolve(window.d3);
            };
            d3Script.onerror = () => reject(new Error('Failed to load D3.js'));
            document.head.appendChild(d3Script);
          });
        };

        // Load D3 first, then execute the visualization
        await loadD3();

        // Create a script element to execute the generated code
        const script = document.createElement('script');
        
        // Wrap the code to catch errors
        script.textContent = `
          (function() {
            try {
              console.log('Executing visualization code...');
              ${code}
              console.log('Visualization executed successfully');
            } catch (error) {
              console.error('Visualization error:', error);
              document.getElementById('visualization').innerHTML = 
                '<div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px; margin: 20px 0;">' +
                '<strong>Visualization Error:</strong><br/>' + error.message + 
                '<br/><br/><small>Check the browser console for more details.</small></div>';
            }
          })();
        `;

        // Add the script to the container
        if (containerRef.current) {
          containerRef.current.appendChild(script);
        }
      } catch (err) {
        console.error('Failed to execute visualization:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">
              <strong>Failed to load visualization:</strong><br/>${err.message}
            </div>
          `;
        }
      } finally {
        setIsExecuting(false);
      }
    };

    executeVisualization();
  }, [code, isLoading, error]);

  if (error) {
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-6">
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
      <div className="w-full p-6">
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