/**
 * Progressive Complexity System for EduViz-AI
 * Manages complexity levels and feature progression for educational visualizations
 */

export type ComplexityLevel = 'basic' | 'intermediate' | 'advanced';

export interface ComplexityFeatures {
  level: ComplexityLevel;
  features: string[];
  parameters: ParameterConfig[];
  concepts: string[];
  prerequisites: string[];
}

export interface ParameterConfig {
  name: string;
  type: 'slider' | 'input' | 'checkbox' | 'select';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  description: string;
}

export interface ProgressionTemplate {
  concept: string;
  subject: string;
  levels: {
    basic: ComplexityFeatures;
    intermediate: ComplexityFeatures;
    advanced: ComplexityFeatures;
  };
}

export class ProgressiveComplexityManager {
  private templates: Map<string, ProgressionTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * Initialize built-in progression templates
   */
  private initializeTemplates(): void {
    // Pendulum template
    this.templates.set('pendulum', {
      concept: 'pendulum',
      subject: 'physics',
      levels: {
        basic: {
          level: 'basic',
          features: [
            'Simple pendulum animation',
            'Length adjustment',
            'Basic period display'
          ],
          parameters: [
            {
              name: 'length',
              type: 'slider',
              default: 1,
              min: 0.5,
              max: 2,
              step: 0.1,
              unit: 'm',
              description: 'Length of the pendulum'
            }
          ],
          concepts: ['period', 'oscillation', 'gravity'],
          prerequisites: []
        },
        intermediate: {
          level: 'intermediate',
          features: [
            'Pendulum with damping',
            'Energy visualization',
            'Phase space plot',
            'Multiple parameters'
          ],
          parameters: [
            {
              name: 'length',
              type: 'slider',
              default: 1,
              min: 0.5,
              max: 2,
              step: 0.1,
              unit: 'm',
              description: 'Length of the pendulum'
            },
            {
              name: 'damping',
              type: 'slider',
              default: 0.1,
              min: 0,
              max: 0.5,
              step: 0.01,
              unit: '',
              description: 'Damping coefficient'
            },
            {
              name: 'initialAngle',
              type: 'slider',
              default: 30,
              min: 5,
              max: 90,
              step: 5,
              unit: '°',
              description: 'Initial angle'
            }
          ],
          concepts: ['damping', 'energy conservation', 'phase space'],
          prerequisites: ['basic pendulum', 'energy concepts']
        },
        advanced: {
          level: 'advanced',
          features: [
            'Double pendulum',
            'Chaos visualization',
            'Poincaré sections',
            'Lyapunov exponents',
            'Multiple visualization modes'
          ],
          parameters: [
            {
              name: 'length1',
              type: 'slider',
              default: 1,
              min: 0.5,
              max: 2,
              step: 0.1,
              unit: 'm',
              description: 'Length of first pendulum'
            },
            {
              name: 'length2',
              type: 'slider',
              default: 1,
              min: 0.5,
              max: 2,
              step: 0.1,
              unit: 'm',
              description: 'Length of second pendulum'
            },
            {
              name: 'mass1',
              type: 'slider',
              default: 1,
              min: 0.5,
              max: 2,
              step: 0.1,
              unit: 'kg',
              description: 'Mass of first bob'
            },
            {
              name: 'mass2',
              type: 'slider',
              default: 1,
              min: 0.5,
              max: 2,
              step: 0.1,
              unit: 'kg',
              description: 'Mass of second bob'
            }
          ],
          concepts: ['chaos theory', 'nonlinear dynamics', 'sensitivity to initial conditions'],
          prerequisites: ['intermediate pendulum', 'differential equations']
        }
      }
    });

    // Wave template
    this.templates.set('wave', {
      concept: 'wave',
      subject: 'physics',
      levels: {
        basic: {
          level: 'basic',
          features: [
            'Simple sine wave',
            'Frequency control',
            'Amplitude control'
          ],
          parameters: [
            {
              name: 'frequency',
              type: 'slider',
              default: 1,
              min: 0.1,
              max: 5,
              step: 0.1,
              unit: 'Hz',
              description: 'Wave frequency'
            },
            {
              name: 'amplitude',
              type: 'slider',
              default: 1,
              min: 0.1,
              max: 2,
              step: 0.1,
              unit: '',
              description: 'Wave amplitude'
            }
          ],
          concepts: ['frequency', 'amplitude', 'wavelength'],
          prerequisites: []
        },
        intermediate: {
          level: 'intermediate',
          features: [
            'Wave interference',
            'Standing waves',
            'Phase difference',
            'Multiple wave sources'
          ],
          parameters: [
            {
              name: 'frequency1',
              type: 'slider',
              default: 1,
              min: 0.1,
              max: 5,
              step: 0.1,
              unit: 'Hz',
              description: 'First wave frequency'
            },
            {
              name: 'frequency2',
              type: 'slider',
              default: 1.5,
              min: 0.1,
              max: 5,
              step: 0.1,
              unit: 'Hz',
              description: 'Second wave frequency'
            },
            {
              name: 'phase',
              type: 'slider',
              default: 0,
              min: 0,
              max: 360,
              step: 15,
              unit: '°',
              description: 'Phase difference'
            }
          ],
          concepts: ['interference', 'superposition', 'beats'],
          prerequisites: ['basic waves', 'trigonometry']
        },
        advanced: {
          level: 'advanced',
          features: [
            'Fourier analysis',
            'Wave packets',
            'Dispersion',
            'Non-linear waves'
          ],
          parameters: [
            {
              name: 'components',
              type: 'slider',
              default: 3,
              min: 1,
              max: 10,
              step: 1,
              unit: '',
              description: 'Number of Fourier components'
            },
            {
              name: 'dispersion',
              type: 'slider',
              default: 0,
              min: 0,
              max: 1,
              step: 0.1,
              unit: '',
              description: 'Dispersion coefficient'
            }
          ],
          concepts: ['Fourier transform', 'wave packets', 'group velocity'],
          prerequisites: ['intermediate waves', 'calculus']
        }
      }
    });
  }

  /**
   * Get progression template for a concept
   */
  getTemplate(concept: string): ProgressionTemplate | undefined {
    return this.templates.get(concept.toLowerCase());
  }

  /**
   * Get features for a specific level
   */
  getFeatures(concept: string, level: ComplexityLevel): ComplexityFeatures | undefined {
    const template = this.templates.get(concept.toLowerCase());
    return template?.levels[level];
  }

  /**
   * Generate prompt enhancement based on complexity level
   */
  enhancePromptForLevel(
    basePrompt: string,
    concept: string,
    level: ComplexityLevel
  ): string {
    const features = this.getFeatures(concept, level);
    if (!features) return basePrompt;

    const enhancement = `
Generate a ${level} level visualization with the following requirements:

Features to include:
${features.features.map(f => `- ${f}`).join('\n')}

Parameters to implement:
${features.parameters.map(p => 
  `- ${p.name}: ${p.type} control (${p.min}-${p.max} ${p.unit || ''})`
).join('\n')}

Educational concepts to highlight:
${features.concepts.map(c => `- ${c}`).join('\n')}

Ensure the visualization is appropriate for students who understand: ${features.prerequisites.join(', ') || 'basic concepts'}.
`;

    return `${basePrompt}\n\n${enhancement}`;
  }

  /**
   * Get progression path for a concept
   */
  getProgressionPath(concept: string): {
    current: ComplexityLevel;
    next?: ComplexityLevel;
    features_to_add?: string[];
  }[] {
    const template = this.templates.get(concept.toLowerCase());
    if (!template) return [];

    return [
      {
        current: 'basic',
        next: 'intermediate',
        features_to_add: template.levels.intermediate.features.filter(f =>
          !template.levels.basic.features.includes(f)
        )
      },
      {
        current: 'intermediate',
        next: 'advanced',
        features_to_add: template.levels.advanced.features.filter(f =>
          !template.levels.intermediate.features.includes(f)
        )
      },
      {
        current: 'advanced'
      }
    ];
  }

  /**
   * Suggest next complexity level based on user performance
   */
  suggestNextLevel(
    currentLevel: ComplexityLevel,
    userMetrics: {
      timeSpent: number;  // seconds
      interactionCount: number;
      parametersExplored: number;
      errorsEncountered: number;
    }
  ): ComplexityLevel {
    // Simple heuristic for progression
    const score = 
      (userMetrics.interactionCount > 10 ? 25 : 0) +
      (userMetrics.parametersExplored > 3 ? 25 : 0) +
      (userMetrics.timeSpent > 300 ? 25 : 0) +  // 5 minutes
      (userMetrics.errorsEncountered < 2 ? 25 : 0);

    if (score >= 75) {
      // User is ready for next level
      if (currentLevel === 'basic') return 'intermediate';
      if (currentLevel === 'intermediate') return 'advanced';
    }

    return currentLevel;
  }

  /**
   * Generate code modifications for complexity adjustment
   */
  generateComplexityAdjustment(
    currentCode: string,
    fromLevel: ComplexityLevel,
    toLevel: ComplexityLevel,
    concept: string
  ): string {
    const template = this.templates.get(concept.toLowerCase());
    if (!template) return currentCode;

    const fromFeatures = template.levels[fromLevel];
    const toFeatures = template.levels[toLevel];

    // Generate prompt for code modification
    const modificationPrompt = `
Modify the existing ${concept} visualization from ${fromLevel} to ${toLevel} level.

Remove these features:
${fromFeatures.features.filter(f => !toFeatures.features.includes(f)).join('\n')}

Add these features:
${toFeatures.features.filter(f => !fromFeatures.features.includes(f)).join('\n')}

Update parameters:
${toFeatures.parameters.map(p => `- Add ${p.name} control`).join('\n')}

The modified code should maintain the existing structure while incorporating the new complexity level.
`;

    return modificationPrompt;
  }

  /**
   * Analyze code to determine its complexity level
   */
  analyzeComplexity(code: string, concept: string): ComplexityLevel {
    const template = this.templates.get(concept.toLowerCase());
    if (!template) return 'basic';

    // Check for advanced features
    const advancedKeywords = ['chaos', 'fourier', 'lyapunov', 'poincare', 'non-linear'];
    if (advancedKeywords.some(keyword => code.toLowerCase().includes(keyword))) {
      return 'advanced';
    }

    // Check for intermediate features
    const intermediateKeywords = ['damping', 'energy', 'phase', 'interference', 'beats'];
    if (intermediateKeywords.some(keyword => code.toLowerCase().includes(keyword))) {
      return 'intermediate';
    }

    // Count parameters
    const parameterCount = (code.match(/slider|input.*range/gi) || []).length;
    if (parameterCount > 3) return 'advanced';
    if (parameterCount > 1) return 'intermediate';

    return 'basic';
  }
}