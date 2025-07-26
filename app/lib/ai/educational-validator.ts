/**
 * Educational Validator for EduViz-AI
 * Ensures generated visualizations meet educational standards
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: ValidationScore;
  suggestions: string[];
}

export interface ValidationError {
  type: 'security' | 'syntax' | 'educational' | 'scientific';
  message: string;
  line?: number;
}

export interface ValidationWarning {
  type: 'complexity' | 'accessibility' | 'performance';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationScore {
  overall: number;          // 0-100
  scientificAccuracy: number;
  pedagogicalQuality: number;
  interactivity: number;
  codeQuality: number;
}

export class EducationalValidator {
  // Security patterns to block
  private readonly DANGEROUS_PATTERNS = [
    'eval(',
    'Function(',
    'setTimeout(',
    'setInterval(',
    'document.write',
    'innerHTML',
    '__proto__',
    'constructor.constructor'
  ];

  // Required educational elements
  private readonly REQUIRED_ELEMENTS = {
    visualization: ['d3.select', '#visualization'],
    interactivity: ['on("', 'addEventListener', 'drag', 'zoom', 'click'],
    clarity: ['// ', '/* ', 'text(', 'label'],
    scientific: ['Math.', 'formula', 'equation', 'calculate']
  };

  // Educational best practices
  private readonly BEST_PRACTICES = {
    hasComments: /\/\/|\/\*/,
    hasLabels: /\.text\(|\.append\("text"\)/,
    hasUnits: /\+ ?"?(m|s|kg|N|J|°|rad)/,
    hasInteractiveControls: /slider|button|input/i,
    hasAnimation: /transition\(|duration\(/,
    hasResponsiveDesign: /window\.innerWidth|resize/
  };

  /**
   * Validate generated visualization code
   */
  async validate(code: string, context?: {
    subject?: string;
    complexity?: 'basic' | 'intermediate' | 'advanced';
    targetAge?: number;
  }): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Clean code for analysis
    const cleanCode = this.cleanCode(code);

    // 1. Security validation
    this.validateSecurity(cleanCode, errors);

    // 2. Syntax validation
    this.validateSyntax(cleanCode, errors);

    // 3. Educational requirements
    this.validateEducationalRequirements(cleanCode, errors, warnings);

    // 4. Scientific accuracy checks
    const scientificScore = this.validateScientificAccuracy(cleanCode, context);

    // 5. Pedagogical quality
    const pedagogicalScore = this.assessPedagogicalQuality(cleanCode, warnings, suggestions);

    // 6. Interactivity assessment
    const interactivityScore = this.assessInteractivity(cleanCode, suggestions);

    // 7. Code quality
    const codeQualityScore = this.assessCodeQuality(cleanCode, warnings);

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      scientificAccuracy: scientificScore,
      pedagogicalQuality: pedagogicalScore,
      interactivity: interactivityScore,
      codeQuality: codeQualityScore
    });

    // Generate suggestions based on context
    if (context?.complexity === 'basic' && overallScore < 70) {
      suggestions.push('Consider simplifying the visualization for basic level');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: {
        overall: overallScore,
        scientificAccuracy: scientificScore,
        pedagogicalQuality: pedagogicalScore,
        interactivity: interactivityScore,
        codeQuality: codeQualityScore
      },
      suggestions
    };
  }

  /**
   * Clean code for analysis
   */
  private cleanCode(code: string): string {
    // Remove markdown code blocks if present
    return code.replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();
  }

  /**
   * Validate security
   */
  private validateSecurity(code: string, errors: ValidationError[]): void {
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (code.includes(pattern)) {
        errors.push({
          type: 'security',
          message: `Potentially dangerous pattern detected: ${pattern}`
        });
      }
    }

    // Check for external resource loading
    if (code.match(/fetch\(|XMLHttpRequest|import\s*\(/)) {
      errors.push({
        type: 'security',
        message: 'External resource loading is not allowed'
      });
    }
  }

  /**
   * Validate syntax basics
   */
  private validateSyntax(code: string, errors: ValidationError[]): void {
    // Check for D3.js usage
    if (!code.includes('d3.') && !code.includes('d3[')) {
      errors.push({
        type: 'syntax',
        message: 'Code does not appear to use D3.js library'
      });
    }

    // Check for visualization container
    if (!code.includes('#visualization')) {
      errors.push({
        type: 'syntax',
        message: 'Code must target the #visualization container'
      });
    }

    // Basic bracket matching
    const openBrackets = (code.match(/\{/g) || []).length;
    const closeBrackets = (code.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        type: 'syntax',
        message: 'Mismatched brackets detected'
      });
    }
  }

  /**
   * Validate educational requirements
   */
  private validateEducationalRequirements(
    code: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Check for interactivity
    const hasInteractivity = this.REQUIRED_ELEMENTS.interactivity.some(pattern => 
      code.includes(pattern)
    );
    
    if (!hasInteractivity) {
      warnings.push({
        type: 'complexity',
        message: 'Visualization lacks interactive elements',
        severity: 'medium'
      });
    }

    // Check for clarity elements
    const hasClarity = this.REQUIRED_ELEMENTS.clarity.some(pattern =>
      code.includes(pattern)
    );

    if (!hasClarity) {
      warnings.push({
        type: 'accessibility',
        message: 'Code lacks comments or labels for clarity',
        severity: 'medium'
      });
    }

    // Check for scientific elements (if applicable)
    const hasScientific = this.REQUIRED_ELEMENTS.scientific.some(pattern =>
      code.includes(pattern)
    );

    if (!hasScientific && code.length > 500) {
      warnings.push({
        type: 'complexity',
        message: 'Complex visualization without clear mathematical foundations',
        severity: 'low'
      });
    }
  }

  /**
   * Validate scientific accuracy
   */
  private validateScientificAccuracy(code: string, context?: any): number {
    let score = 100;

    // Check for common physics formulas
    if (context?.subject === 'physics') {
      // Pendulum period formula
      if (code.includes('pendulum') && !code.includes('Math.sqrt')) {
        score -= 20; // Pendulum calculations usually need square root
      }

      // Check for units
      if (!this.BEST_PRACTICES.hasUnits.test(code)) {
        score -= 15;
      }
    }

    // Check for mathematical operations
    if (code.includes('Math.')) {
      score = Math.min(score + 10, 100);
    }

    return score;
  }

  /**
   * Assess pedagogical quality
   */
  private assessPedagogicalQuality(
    code: string,
    warnings: ValidationWarning[],
    suggestions: string[]
  ): number {
    let score = 60; // Base score

    // Check for comments
    if (this.BEST_PRACTICES.hasComments.test(code)) {
      score += 10;
    } else {
      suggestions.push('Add comments to explain the visualization logic');
    }

    // Check for labels
    if (this.BEST_PRACTICES.hasLabels.test(code)) {
      score += 10;
    } else {
      suggestions.push('Add labels to axes and important elements');
    }

    // Check for progressive complexity
    const hasParameters = /let\s+\w+\s*=\s*\d+|const\s+\w+\s*=\s*\d+/.test(code);
    if (hasParameters) {
      score += 10;
    }

    // Check for visual feedback
    if (this.BEST_PRACTICES.hasAnimation.test(code)) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Assess interactivity level
   */
  private assessInteractivity(code: string, suggestions: string[]): number {
    let score = 40; // Base score

    // Check for various interactive elements
    const interactivePatterns = {
      sliders: /slider|input.*range/i,
      buttons: /button|btn/i,
      drag: /drag/i,
      zoom: /zoom/i,
      hover: /mouseover|mouseenter|hover/i,
      click: /click|mousedown/i
    };

    let interactiveCount = 0;
    for (const [feature, pattern] of Object.entries(interactivePatterns)) {
      if (pattern.test(code)) {
        score += 10;
        interactiveCount++;
      }
    }

    if (interactiveCount < 2) {
      suggestions.push('Consider adding more interactive elements (sliders, zoom, drag)');
    }

    return Math.min(score, 100);
  }

  /**
   * Assess code quality
   */
  private assessCodeQuality(code: string, warnings: ValidationWarning[]): number {
    let score = 70; // Base score

    // Check code structure
    const lines = code.split('\n');
    const avgLineLength = code.length / lines.length;

    // Penalize very long lines
    if (avgLineLength > 100) {
      score -= 10;
      warnings.push({
        type: 'complexity',
        message: 'Code has very long lines, consider breaking them up',
        severity: 'low'
      });
    }

    // Reward proper indentation (rough check)
    const hasIndentation = lines.some(line => line.startsWith('  ') || line.startsWith('\t'));
    if (hasIndentation) {
      score += 10;
    }

    // Check for responsive design
    if (this.BEST_PRACTICES.hasResponsiveDesign.test(code)) {
      score += 10;
    }

    // Check for error handling
    if (code.includes('try') || code.includes('catch')) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(scores: Omit<ValidationScore, 'overall'>): number {
    // Weighted average based on importance for education
    const weights = {
      scientificAccuracy: 0.3,
      pedagogicalQuality: 0.3,
      interactivity: 0.25,
      codeQuality: 0.15
    };

    const weightedSum = 
      scores.scientificAccuracy * weights.scientificAccuracy +
      scores.pedagogicalQuality * weights.pedagogicalQuality +
      scores.interactivity * weights.interactivity +
      scores.codeQuality * weights.codeQuality;

    return Math.round(weightedSum);
  }

  /**
   * Get improvement suggestions based on validation
   */
  getImprovementPrompt(validationResult: ValidationResult): string {
    const improvements: string[] = [];

    if (validationResult.score.scientificAccuracy < 80) {
      improvements.push('Ensure all calculations are scientifically accurate with proper formulas');
    }

    if (validationResult.score.pedagogicalQuality < 80) {
      improvements.push('Add more educational elements like labels, comments, and explanations');
    }

    if (validationResult.score.interactivity < 70) {
      improvements.push('Include interactive controls such as sliders or buttons for parameter adjustment');
    }

    if (validationResult.errors.length > 0) {
      improvements.push('Fix the following errors: ' + 
        validationResult.errors.map(e => e.message).join(', '));
    }

    return improvements.length > 0 
      ? `Please improve the visualization by: ${improvements.join('; ')}`
      : '';
  }
}