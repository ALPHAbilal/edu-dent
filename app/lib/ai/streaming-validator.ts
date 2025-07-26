import { Transform } from 'stream';
import * as acorn from 'acorn';
import { simple as walkSimple } from 'acorn-walk';

export interface ValidationError {
  type: 'syntax' | 'semantic' | 'educational' | 'performance';
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: string[];
  scientificAccuracy?: number; // 0-1 score
  pedagogicalQuality?: number; // 0-1 score
}

export interface StreamValidationChunk {
  type: 'code' | 'validation' | 'complete';
  content?: string;
  validation?: ValidationResult;
  position?: number;
}

/**
 * Multi-stage streaming validation pipeline inspired by v0's approach
 * Validates D3.js educational visualizations in real-time during generation
 */
export class StreamingValidator {
  private codeBuffer: string = '';
  private validationResults: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };
  
  // Educational validation patterns
  private readonly educationalPatterns = {
    hasVisualizationContainer: /#visualization|\.select\(['"]#visualization/,
    usesD3: /d3\.|import.*d3/,
    hasInteractivity: /\.on\(['"](?:click|mouseover|mousemove|drag)/,
    hasAnimation: /transition\(|requestAnimationFrame|animate/,
    hasLabels: /\.text\(|\.append\(['"]text/,
    hasScales: /scale(?:Linear|Log|Time|Ordinal)/,
    hasAccessibility: /aria-|role=/
  };
  
  // Performance patterns to check
  private readonly performancePatterns = {
    inefficientSelections: /d3\.select.*d3\.select/g,
    missingKeyFunctions: /\.data\([^)]+\)(?!\.join)/,
    heavyAnimations: /setInterval|setTimeout.*\d{1,2}(?!\d)/
  };
  
  // Scientific accuracy patterns
  private readonly scientificPatterns = {
    physics: {
      gravity: /g\s*=\s*(9\.8[01]?|10)/,
      pendulumFormula: /2\s*\*\s*Math\.PI\s*\*\s*Math\.sqrt/,
      energyConservation: /kinetic.*potential|potential.*kinetic/
    },
    math: {
      derivatives: /\(f\(x\s*\+\s*h\)\s*-\s*f\(x\)\)\s*\/\s*h/,
      integrals: /sum.*width|riemann/i
    }
  };

  /**
   * Create a transform stream for real-time validation
   */
  createValidationStream(): Transform {
    return new Transform({
      objectMode: true,
      transform: (chunk: StreamValidationChunk, encoding, callback) => {
        try {
          if (chunk.type === 'code' && chunk.content) {
            // Accumulate code
            this.codeBuffer += chunk.content;
            
            // Perform incremental validation
            const validation = this.validateIncremental(chunk.content);
            
            // Pass through the code chunk with validation
            callback(null, {
              ...chunk,
              validation
            });
          } else if (chunk.type === 'complete') {
            // Final validation pass
            const finalValidation = this.validateComplete();
            callback(null, {
              type: 'validation',
              validation: finalValidation
            });
          } else {
            // Pass through other chunks
            callback(null, chunk);
          }
        } catch (error) {
          callback(error as Error);
        }
      }
    });
  }

  /**
   * Incremental validation during streaming
   */
  private validateIncremental(codeFragment: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
    
    // Check for syntax errors in complete statements
    if (this.looksLikeCompleteStatement(codeFragment)) {
      const syntaxCheck = this.checkSyntax(this.codeBuffer);
      if (!syntaxCheck.isValid) {
        result.errors.push(...syntaxCheck.errors);
        result.isValid = false;
      }
    }
    
    // Check for D3.js patterns
    if (!this.educationalPatterns.usesD3.test(this.codeBuffer) && 
        this.codeBuffer.length > 100) {
      result.warnings.push({
        type: 'semantic',
        severity: 'warning',
        message: 'No D3.js usage detected yet'
      });
    }
    
    // Performance checks
    const perfIssues = this.checkPerformancePatterns(codeFragment);
    result.warnings.push(...perfIssues);
    
    return result;
  }

  /**
   * Complete validation after full code generation
   */
  private validateComplete(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      scientificAccuracy: 1.0,
      pedagogicalQuality: 1.0
    };
    
    // Full syntax validation
    const syntaxCheck = this.checkSyntax(this.codeBuffer);
    if (!syntaxCheck.isValid) {
      result.errors.push(...syntaxCheck.errors);
      result.isValid = false;
      return result; // Exit early on syntax errors
    }
    
    // AST-based semantic validation
    const semanticCheck = this.performASTValidation(this.codeBuffer);
    result.errors.push(...semanticCheck.errors);
    result.warnings.push(...semanticCheck.warnings);
    
    // Educational quality checks
    const educationalCheck = this.checkEducationalQuality();
    result.warnings.push(...educationalCheck.warnings);
    result.suggestions.push(...educationalCheck.suggestions);
    result.pedagogicalQuality = educationalCheck.quality;
    
    // Scientific accuracy validation
    const scientificCheck = this.checkScientificAccuracy();
    result.warnings.push(...scientificCheck.warnings);
    result.scientificAccuracy = scientificCheck.accuracy;
    
    // Performance validation
    const performanceCheck = this.checkPerformanceComplete();
    result.warnings.push(...performanceCheck);
    
    // Accessibility validation
    const accessibilityCheck = this.checkAccessibility();
    result.suggestions.push(...accessibilityCheck);
    
    result.isValid = result.errors.length === 0;
    
    return result;
  }

  /**
   * Check if code fragment looks like a complete statement
   */
  private looksLikeCompleteStatement(fragment: string): boolean {
    const trimmed = fragment.trim();
    return trimmed.endsWith(';') || 
           trimmed.endsWith('}') || 
           trimmed.endsWith(')');
  }

  /**
   * Syntax validation using acorn parser
   */
  private checkSyntax(code: string): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    
    try {
      acorn.parse(code, {
        ecmaVersion: 2020,
        sourceType: 'module',
        allowImportExportEverywhere: true
      });
      return { isValid: true, errors: [] };
    } catch (error: any) {
      errors.push({
        type: 'syntax',
        severity: 'error',
        message: error.message,
        line: error.loc?.line,
        column: error.loc?.column
      });
      return { isValid: false, errors };
    }
  }

  /**
   * AST-based validation for D3.js patterns
   */
  private performASTValidation(code: string): { 
    errors: ValidationError[]; 
    warnings: ValidationError[] 
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    try {
      const ast = acorn.parse(code, {
        ecmaVersion: 2020,
        sourceType: 'module',
        locations: true
      });
      
      // Check for common D3.js mistakes
      walkSimple(ast, {
        CallExpression(node: any) {
          // Check for selection chaining issues
          if (node.callee.property?.name === 'select' &&
              node.arguments[0]?.value?.startsWith('#')) {
            
            // Ensure the selector is valid
            const selector = node.arguments[0].value;
            if (!selector.match(/^#[a-zA-Z][\w-]*$/)) {
              warnings.push({
                type: 'semantic',
                severity: 'warning',
                message: `Invalid ID selector: ${selector}`,
                line: node.loc?.start.line,
                suggestion: 'Use valid CSS ID selector syntax'
              });
            }
          }
          
          // Check for missing data joins
          if (node.callee.property?.name === 'data' &&
              !code.includes('.join(') && !code.includes('.enter(')) {
            warnings.push({
              type: 'semantic',
              severity: 'warning',
              message: 'Data binding without enter/update/exit pattern',
              line: node.loc?.start.line,
              suggestion: 'Consider using .join() for proper data binding'
            });
          }
        }
      });
    } catch (error) {
      // Parser error already handled in syntax check
    }
    
    return { errors, warnings };
  }

  /**
   * Check educational quality
   */
  private checkEducationalQuality(): {
    warnings: ValidationError[];
    suggestions: string[];
    quality: number;
  } {
    const warnings: ValidationError[] = [];
    const suggestions: string[] = [];
    let qualityScore = 1.0;
    
    // Check for visualization container
    if (!this.educationalPatterns.hasVisualizationContainer.test(this.codeBuffer)) {
      warnings.push({
        type: 'educational',
        severity: 'error',
        message: 'No #visualization container found',
        suggestion: 'Ensure code targets the #visualization element'
      });
      qualityScore -= 0.3;
    }
    
    // Check for interactivity
    if (!this.educationalPatterns.hasInteractivity.test(this.codeBuffer)) {
      suggestions.push('Consider adding interactive elements for better engagement');
      qualityScore -= 0.1;
    }
    
    // Check for labels/text
    if (!this.educationalPatterns.hasLabels.test(this.codeBuffer)) {
      warnings.push({
        type: 'educational',
        severity: 'warning',
        message: 'No text labels found',
        suggestion: 'Add labels to explain the visualization'
      });
      qualityScore -= 0.2;
    }
    
    // Check for proper scaling
    if (!this.educationalPatterns.hasScales.test(this.codeBuffer)) {
      suggestions.push('Consider using D3 scales for proper data mapping');
    }
    
    return { warnings, suggestions, quality: Math.max(0, qualityScore) };
  }

  /**
   * Check scientific accuracy
   */
  private checkScientificAccuracy(): {
    warnings: ValidationError[];
    accuracy: number;
  } {
    const warnings: ValidationError[] = [];
    let accuracy = 1.0;
    
    // Physics checks
    if (this.codeBuffer.includes('gravity') || this.codeBuffer.includes('9.8')) {
      if (!this.scientificPatterns.physics.gravity.test(this.codeBuffer)) {
        warnings.push({
          type: 'educational',
          severity: 'warning',
          message: 'Gravity constant may be inaccurate',
          suggestion: 'Use g = 9.81 m/s² for Earth\'s gravity'
        });
        accuracy -= 0.2;
      }
    }
    
    // Pendulum formula check
    if (this.codeBuffer.includes('pendulum') && 
        !this.scientificPatterns.physics.pendulumFormula.test(this.codeBuffer)) {
      warnings.push({
        type: 'educational',
        severity: 'info',
        message: 'Pendulum period formula not found',
        suggestion: 'Period T = 2π√(L/g) for small angles'
      });
    }
    
    return { warnings, accuracy: Math.max(0, accuracy) };
  }

  /**
   * Performance pattern checking
   */
  private checkPerformancePatterns(codeFragment: string): ValidationError[] {
    const warnings: ValidationError[] = [];
    
    // Check for inefficient selections
    if (this.performancePatterns.inefficientSelections.test(codeFragment)) {
      warnings.push({
        type: 'performance',
        severity: 'warning',
        message: 'Multiple D3 selections detected',
        suggestion: 'Chain selections or cache them in variables'
      });
    }
    
    // Check for tight animation loops
    if (this.performancePatterns.heavyAnimations.test(codeFragment)) {
      warnings.push({
        type: 'performance',
        severity: 'warning',
        message: 'Potentially heavy animation loop',
        suggestion: 'Use requestAnimationFrame for smooth animations'
      });
    }
    
    return warnings;
  }

  /**
   * Complete performance validation
   */
  private checkPerformanceComplete(): ValidationError[] {
    const warnings: ValidationError[] = [];
    
    // Count total DOM operations
    const appendCount = (this.codeBuffer.match(/\.append\(/g) || []).length;
    if (appendCount > 100) {
      warnings.push({
        type: 'performance',
        severity: 'warning',
        message: `High number of append operations (${appendCount})`,
        suggestion: 'Consider using enter/update/exit pattern for efficiency'
      });
    }
    
    return warnings;
  }

  /**
   * Accessibility validation
   */
  private checkAccessibility(): string[] {
    const suggestions: string[] = [];
    
    if (!this.educationalPatterns.hasAccessibility.test(this.codeBuffer)) {
      suggestions.push('Consider adding ARIA labels for screen reader accessibility');
    }
    
    // Check for color contrast (basic check)
    if (this.codeBuffer.includes('fill') || this.codeBuffer.includes('stroke')) {
      suggestions.push('Ensure sufficient color contrast for visibility');
    }
    
    return suggestions;
  }

  /**
   * Reset validator for new validation session
   */
  reset(): void {
    this.codeBuffer = '';
    this.validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
  }

  /**
   * Get current validation state
   */
  getCurrentValidation(): ValidationResult {
    return { ...this.validationResults };
  }
}