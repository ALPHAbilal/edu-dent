import { ConversationTurn } from './semantic-compression';

export interface EducationalConcept {
  id: string;
  name: string;
  subject: 'physics' | 'mathematics' | 'chemistry' | 'general';
  description: string;
  prerequisites: string[];
  relatedConcepts: string[];
  difficulty: number; // 1-10
  visualizationType: string[];
  formulas?: string[];
  parameters?: ParameterDefinition[];
  examples?: CodeExample[];
  lastAccessed: number;
  accessCount: number;
}

export interface ParameterDefinition {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array';
  unit?: string;
  min?: number;
  max?: number;
  default: any;
  description: string;
  affects: string[]; // Which visual elements this parameter affects
}

export interface CodeExample {
  title: string;
  code: string;
  description: string;
  concepts: string[]; // Related concept IDs
  complexity: number;
  tested: boolean;
}

export interface ProjectContext {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  concepts: Map<string, EducationalConcept>;
  conversations: ConversationTurn[];
  generatedVisualizations: GeneratedVisualization[];
  userPreferences: UserPreferences;
}

export interface GeneratedVisualization {
  id: string;
  conceptId: string;
  code: string;
  prompt: string;
  timestamp: number;
  quality: number; // 0-1, based on validation
  userRating?: number;
  modifications: string[]; // Track user modifications
}

export interface UserPreferences {
  preferredComplexity: number;
  preferredSubjects: string[];
  colorScheme: 'light' | 'dark' | 'colorblind-friendly';
  animationSpeed: number;
  language: string;
}

/**
 * Educational Knowledge Base - Persistent memory for concepts and context
 * Inspired by Lovable's Knowledge Base system
 */
export class EducationalKnowledgeBase {
  private concepts: Map<string, EducationalConcept>;
  private projectContexts: Map<string, ProjectContext>;
  private conceptGraph: Map<string, Set<string>>; // Concept relationships
  private activeProjectId: string | null = null;

  constructor() {
    this.concepts = new Map();
    this.projectContexts = new Map();
    this.conceptGraph = new Map();
    this.initializeBaseConcepts();
  }

  /**
   * Initialize with fundamental educational concepts
   */
  private initializeBaseConcepts(): void {
    // Physics concepts
    this.addConcept({
      id: 'pendulum-simple',
      name: 'Simple Pendulum',
      subject: 'physics',
      description: 'A mass suspended from a pivot that can swing freely under gravity',
      prerequisites: [],
      relatedConcepts: ['harmonic-motion', 'energy-conservation'],
      difficulty: 3,
      visualizationType: ['animation', 'graph'],
      formulas: ['T = 2π√(L/g)', 'θ(t) = θ₀cos(ωt)'],
      parameters: [
        {
          name: 'length',
          type: 'number',
          unit: 'meters',
          min: 0.5,
          max: 3,
          default: 2,
          description: 'Length of the pendulum string',
          affects: ['period', 'frequency']
        },
        {
          name: 'gravity',
          type: 'number',
          unit: 'm/s²',
          min: 1,
          max: 20,
          default: 9.81,
          description: 'Gravitational acceleration',
          affects: ['period', 'frequency']
        }
      ],
      lastAccessed: Date.now(),
      accessCount: 0
    });

    // Mathematics concepts
    this.addConcept({
      id: 'derivative-visual',
      name: 'Derivative Visualization',
      subject: 'mathematics',
      description: 'Visual representation of the derivative as the slope of a tangent line',
      prerequisites: ['function-basics', 'limits'],
      relatedConcepts: ['integral-visual', 'rate-of-change'],
      difficulty: 5,
      visualizationType: ['interactive-graph', 'animation'],
      formulas: ["f'(x) = lim(h→0) [f(x+h) - f(x)]/h"],
      lastAccessed: Date.now(),
      accessCount: 0
    });

    // Build concept graph
    this.buildConceptGraph();
  }

  /**
   * Add a new educational concept
   */
  addConcept(concept: EducationalConcept): void {
    this.concepts.set(concept.id, concept);
    
    // Update concept graph
    if (!this.conceptGraph.has(concept.id)) {
      this.conceptGraph.set(concept.id, new Set());
    }
    
    // Add bidirectional relationships
    for (const relatedId of concept.relatedConcepts) {
      this.conceptGraph.get(concept.id)!.add(relatedId);
      
      if (!this.conceptGraph.has(relatedId)) {
        this.conceptGraph.set(relatedId, new Set());
      }
      this.conceptGraph.get(relatedId)!.add(concept.id);
    }
  }

  /**
   * Build the concept relationship graph
   */
  private buildConceptGraph(): void {
    for (const [id, concept] of this.concepts) {
      if (!this.conceptGraph.has(id)) {
        this.conceptGraph.set(id, new Set());
      }
      
      for (const relatedId of concept.relatedConcepts) {
        this.conceptGraph.get(id)!.add(relatedId);
      }
    }
  }

  /**
   * Get a concept by ID and update access metrics
   */
  getConcept(conceptId: string): EducationalConcept | null {
    const concept = this.concepts.get(conceptId);
    if (concept) {
      concept.lastAccessed = Date.now();
      concept.accessCount++;
      return { ...concept };
    }
    return null;
  }

  /**
   * Find concepts by similarity to a query
   */
  findSimilarConcepts(query: string, limit: number = 5): EducationalConcept[] {
    const queryLower = query.toLowerCase();
    const scores = new Map<string, number>();
    
    for (const [id, concept] of this.concepts) {
      let score = 0;
      
      // Name matching
      if (concept.name.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Description matching
      if (concept.description.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      
      // Formula matching
      if (concept.formulas?.some(f => f.toLowerCase().includes(queryLower))) {
        score += 8;
      }
      
      // Recent access bonus
      const daysSinceAccess = (Date.now() - concept.lastAccessed) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 7) {
        score += 3;
      }
      
      // Popularity bonus
      score += Math.min(concept.accessCount * 0.1, 5);
      
      scores.set(id, score);
    }
    
    // Sort by score and return top matches
    return Array.from(scores.entries())
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => this.concepts.get(id)!);
  }

  /**
   * Get learning path between two concepts
   */
  getLearningPath(fromConceptId: string, toConceptId: string): string[] {
    // Simple BFS to find path in concept graph
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [
      { id: fromConceptId, path: [fromConceptId] }
    ];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (id === toConceptId) {
        return path;
      }
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const neighbors = this.conceptGraph.get(id) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ id: neighbor, path: [...path, neighbor] });
        }
      }
    }
    
    return []; // No path found
  }

  /**
   * Create a new project context
   */
  createProjectContext(name: string): string {
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const context: ProjectContext = {
      id: projectId,
      name,
      createdAt: Date.now(),
      lastModified: Date.now(),
      concepts: new Map(),
      conversations: [],
      generatedVisualizations: [],
      userPreferences: {
        preferredComplexity: 5,
        preferredSubjects: [],
        colorScheme: 'light',
        animationSpeed: 1,
        language: 'en'
      }
    };
    
    this.projectContexts.set(projectId, context);
    this.activeProjectId = projectId;
    
    return projectId;
  }

  /**
   * Get active project context
   */
  getActiveProject(): ProjectContext | null {
    if (!this.activeProjectId) return null;
    return this.projectContexts.get(this.activeProjectId) || null;
  }

  /**
   * Add conversation to active project
   */
  addConversation(turn: ConversationTurn): void {
    const project = this.getActiveProject();
    if (project) {
      project.conversations.push(turn);
      project.lastModified = Date.now();
      
      // Extract concepts from conversation
      this.extractAndLinkConcepts(turn.content, project);
    }
  }

  /**
   * Extract concepts from text and link to project
   */
  private extractAndLinkConcepts(text: string, project: ProjectContext): void {
    const textLower = text.toLowerCase();
    
    for (const [conceptId, concept] of this.concepts) {
      if (textLower.includes(concept.name.toLowerCase()) ||
          concept.formulas?.some(f => textLower.includes(f.toLowerCase()))) {
        
        if (!project.concepts.has(conceptId)) {
          project.concepts.set(conceptId, concept);
        }
      }
    }
  }

  /**
   * Add generated visualization to project
   */
  addGeneratedVisualization(
    conceptId: string,
    code: string,
    prompt: string,
    quality: number
  ): void {
    const project = this.getActiveProject();
    if (project) {
      const viz: GeneratedVisualization = {
        id: `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conceptId,
        code,
        prompt,
        timestamp: Date.now(),
        quality,
        modifications: []
      };
      
      project.generatedVisualizations.push(viz);
      project.lastModified = Date.now();
    }
  }

  /**
   * Get recommended concepts based on project history
   */
  getRecommendedConcepts(limit: number = 5): EducationalConcept[] {
    const project = this.getActiveProject();
    if (!project || project.concepts.size === 0) {
      // Return popular concepts if no project history
      return Array.from(this.concepts.values())
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, limit);
    }
    
    // Find related concepts not yet explored
    const exploredIds = new Set(project.concepts.keys());
    const recommendations = new Map<string, number>();
    
    for (const exploredId of exploredIds) {
      const relatedIds = this.conceptGraph.get(exploredId) || new Set();
      
      for (const relatedId of relatedIds) {
        if (!exploredIds.has(relatedId)) {
          const current = recommendations.get(relatedId) || 0;
          recommendations.set(relatedId, current + 1);
        }
      }
    }
    
    // Sort by recommendation score
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => this.concepts.get(id)!)
      .filter(Boolean);
  }

  /**
   * Export project context for persistence
   */
  exportProject(projectId: string): string {
    const project = this.projectContexts.get(projectId);
    if (!project) return '';
    
    // Convert Maps to arrays for serialization
    const exportData = {
      ...project,
      concepts: Array.from(project.concepts.entries()),
      conceptGraph: Array.from(this.conceptGraph.entries())
        .map(([id, relations]) => [id, Array.from(relations)])
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import project context from persistence
   */
  importProject(projectData: string): string | null {
    try {
      const data = JSON.parse(projectData);
      
      // Convert arrays back to Maps
      const project: ProjectContext = {
        ...data,
        concepts: new Map(data.concepts),
        conversations: data.conversations || []
      };
      
      this.projectContexts.set(project.id, project);
      
      // Restore concept graph if included
      if (data.conceptGraph) {
        for (const [id, relations] of data.conceptGraph) {
          this.conceptGraph.set(id, new Set(relations));
        }
      }
      
      return project.id;
    } catch (error) {
      console.error('Failed to import project:', error);
      return null;
    }
  }

  /**
   * Get usage statistics for optimization
   */
  getUsageStatistics(): {
    totalConcepts: number;
    mostAccessedConcepts: EducationalConcept[];
    averageComplexity: number;
    subjectDistribution: Record<string, number>;
  } {
    const concepts = Array.from(this.concepts.values());
    
    const subjectDistribution = concepts.reduce((acc, concept) => {
      acc[concept.subject] = (acc[concept.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalConcepts: concepts.length,
      mostAccessedConcepts: concepts
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 5),
      averageComplexity: concepts.reduce((sum, c) => sum + c.difficulty, 0) / concepts.length,
      subjectDistribution
    };
  }
}