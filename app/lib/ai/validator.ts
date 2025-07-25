export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class VisualizationValidator {
  static validate(code: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check for D3.js usage
    if (!code.includes('d3.')) {
      result.errors.push('Code must use D3.js for visualization');
      result.isValid = false;
    }

    // Check for container selection
    if (!code.includes('#visualization')) {
      result.errors.push('Code must select the #visualization container');
      result.isValid = false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: 'eval(', message: 'eval() is not allowed for security reasons' },
      { pattern: 'Function(', message: 'Function constructor is not allowed' },
      { pattern: 'document.write', message: 'document.write is not allowed' },
      { pattern: 'innerHTML', message: 'innerHTML should be avoided, use D3 methods instead' }
    ];

    for (const { pattern, message } of dangerousPatterns) {
      if (code.includes(pattern)) {
        result.errors.push(message);
        result.isValid = false;
      }
    }

    // Check for best practices
    if (!code.includes('const') && !code.includes('let')) {
      result.warnings.push('Consider using const/let instead of var for better scoping');
    }

    if (!code.includes('transition')) {
      result.suggestions.push('Consider adding transitions for smoother user experience');
    }

    if (!code.includes('attr("aria-')) {
      result.suggestions.push('Consider adding ARIA attributes for accessibility');
    }

    // Check for educational elements
    if (!code.includes('text') && !code.includes('label')) {
      result.warnings.push('Educational visualizations should include clear labels');
    }

    if (!code.includes('on(')) {
      result.suggestions.push('Consider adding interactivity for better learning experience');
    }

    return result;
  }

  static async validateEducationalAccuracy(code: string, subject: string): Promise<ValidationResult> {
    const result = this.validate(code);

    // Subject-specific validation
    switch (subject) {
      case 'physics':
        if (code.includes('pendulum')) {
          if (!code.includes('Math.sin') && !code.includes('Math.cos')) {
            result.warnings.push('Pendulum simulation should use trigonometric functions');
          }
          if (!code.includes('gravity') && !code.includes('9.8')) {
            result.warnings.push('Physics simulations should include gravity constant');
          }
        }
        break;

      case 'math':
        if (code.includes('derivative')) {
          if (!code.includes('slope')) {
            result.suggestions.push('Derivative visualizations should show slope');
          }
        }
        break;

      case 'chemistry':
        if (code.includes('molecule')) {
          if (!code.includes('bond') && !code.includes('atom')) {
            result.warnings.push('Molecular visualizations should show bonds and atoms');
          }
        }
        break;
    }

    return result;
  }

  static sanitizeCode(code: string): string {
    // Remove any potential XSS vectors
    let sanitized = code;

    // Remove script tags if somehow present
    sanitized = sanitized.replace(/<script[^>]*>|<\/script>/gi, '');

    // Remove event handlers in strings
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Ensure code doesn't try to access parent window
    sanitized = sanitized.replace(/window\.parent/g, 'window');
    sanitized = sanitized.replace(/window\.top/g, 'window');

    return sanitized;
  }
}