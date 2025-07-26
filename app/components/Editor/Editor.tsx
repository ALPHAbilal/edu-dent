'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';

interface EditorProps {
  code: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

export function Editor({ code, onCodeChange, readOnly = true }: EditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readOnly && onCodeChange) {
      onCodeChange(e.target.value);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!code) return null;

  return (
    <div className="w-full h-full p-6">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <h3 className="text-sm font-medium text-gray-300">Generated Code</h3>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Copy
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
        <div className={cn(
          "relative overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-none" : "max-h-64"
        )}>
          <textarea
            value={code}
            onChange={handleCodeChange}
            readOnly={readOnly}
            className="w-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
            style={{ 
              minHeight: isExpanded ? '400px' : '256px',
              height: 'auto'
            }}
            spellCheck={false}
          />
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
}