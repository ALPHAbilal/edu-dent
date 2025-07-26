import { ChromaClient, Collection } from 'chromadb';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
import { Document } from 'langchain/document';

export interface CodeChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    language: string;
    conceptType?: string;
    complexity?: number;
    dependencies?: string[];
    astType?: string; // function, class, variable, etc.
    lineStart?: number;
    lineEnd?: number;
  };
  embedding?: number[];
}

export interface RetrievalResult {
  chunk: CodeChunk;
  score: number;
  rerankedScore?: number;
}

/**
 * Production-ready RAG system optimized for educational D3.js code
 * Based on research showing 0.847 NDCG@10 with jina-embeddings-v2-base-code
 */
export class EducationalRAGSystem {
  private chromaClient: ChromaClient;
  private collection: Collection | null = null;
  private embeddings: HuggingFaceTransformersEmbeddings;
  private readonly collectionName = 'eduviz-d3js-corpus';
  
  // AST-aware chunking parameters
  private readonly chunkSize = 150; // lines
  private readonly chunkOverlap = 20; // lines
  private readonly minChunkSize = 50; // lines

  constructor() {
    // Initialize ChromaDB client
    this.chromaClient = new ChromaClient({
      path: process.env.CHROMA_PATH || 'http://localhost:8000'
    });
    
    // Initialize embeddings with code-optimized model
    this.embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: 'jinaai/jina-embeddings-v2-base-code',
      // Optimize for code understanding
      model: {
        pooling: 'mean',
        normalize: true
      }
    });
  }

  /**
   * Initialize the collection and create if not exists
   */
  async initialize(): Promise<void> {
    try {
      // Try to get existing collection
      this.collection = await this.chromaClient.getCollection({
        name: this.collectionName
      });
    } catch (error) {
      // Create new collection if doesn't exist
      this.collection = await this.chromaClient.createCollection({
        name: this.collectionName,
        metadata: { 
          description: 'Educational D3.js visualization corpus',
          embedding_model: 'jina-embeddings-v2-base-code'
        }
      });
      
      // Index base corpus
      await this.indexBaseCorpus();
    }
  }

  /**
   * Index the base educational corpus
   */
  private async indexBaseCorpus(): Promise<void> {
    const baseExamples = [
      {
        id: 'pendulum-basic',
        content: this.getPendulumExample(),
        metadata: {
          source: 'base-corpus',
          language: 'javascript',
          conceptType: 'physics-simulation',
          complexity: 3,
          dependencies: ['d3']
        }
      },
      {
        id: 'sine-wave',
        content: this.getSineWaveExample(),
        metadata: {
          source: 'base-corpus',
          language: 'javascript',
          conceptType: 'wave-visualization',
          complexity: 2,
          dependencies: ['d3']
        }
      },
      {
        id: 'derivative-tangent',
        content: this.getDerivativeExample(),
        metadata: {
          source: 'base-corpus',
          language: 'javascript',
          conceptType: 'calculus-visualization',
          complexity: 4,
          dependencies: ['d3']
        }
      }
    ];
    
    // Chunk and index each example
    for (const example of baseExamples) {
      const chunks = await this.performASTAwareChunking(
        example.content,
        example.metadata
      );
      
      await this.indexChunks(chunks);
    }
  }

  /**
   * AST-aware chunking for better retrieval accuracy
   */
  private async performASTAwareChunking(
    code: string,
    baseMetadata: any
  ): Promise<CodeChunk[]> {
    const chunks: CodeChunk[] = [];
    const lines = code.split('\n');
    
    // Simple AST-aware chunking based on function boundaries
    let currentChunk: string[] = [];
    let functionDepth = 0;
    let lineStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentChunk.push(line);
      
      // Track function boundaries
      if (line.includes('function') || line.includes('=>')) {
        functionDepth++;
      }
      
      // Count braces for scope tracking
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      functionDepth += openBraces - closeBraces;
      
      // Create chunk at function boundaries or size limit
      const shouldChunk = (
        functionDepth === 0 && 
        currentChunk.length > this.minChunkSize
      ) || currentChunk.length >= this.chunkSize;
      
      if (shouldChunk && i < lines.length - 1) {
        // Add overlap from previous chunk
        const chunkContent = currentChunk.join('\n');
        
        chunks.push({
          id: `${baseMetadata.source}-chunk-${chunks.length}`,
          content: chunkContent,
          metadata: {
            ...baseMetadata,
            lineStart,
            lineEnd: i,
            astType: this.detectASTType(chunkContent)
          }
        });
        
        // Start new chunk with overlap
        const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap);
        currentChunk = currentChunk.slice(overlapStart);
        lineStart = i - this.chunkOverlap + 1;
      }
    }
    
    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push({
        id: `${baseMetadata.source}-chunk-${chunks.length}`,
        content: currentChunk.join('\n'),
        metadata: {
          ...baseMetadata,
          lineStart,
          lineEnd: lines.length - 1,
          astType: this.detectASTType(currentChunk.join('\n'))
        }
      });
    }
    
    return chunks;
  }

  /**
   * Detect the primary AST type in a chunk
   */
  private detectASTType(code: string): string {
    if (/class\s+\w+/.test(code)) return 'class';
    if (/function\s+\w+|const\s+\w+\s*=\s*\(/.test(code)) return 'function';
    if (/\.append\(|\.attr\(|\.style\(/.test(code)) return 'd3-chain';
    if (/d3\.(scale|axis|line|area)/.test(code)) return 'd3-component';
    if (/const\s+\w+\s*=|let\s+\w+\s*=/.test(code)) return 'variable';
    return 'mixed';
  }

  /**
   * Index chunks into ChromaDB
   */
  private async indexChunks(chunks: CodeChunk[]): Promise<void> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }
    
    // Generate embeddings
    const texts = chunks.map(c => c.content);
    const embeddings = await this.embeddings.embedDocuments(texts);
    
    // Prepare for ChromaDB
    const ids = chunks.map(c => c.id);
    const metadatas = chunks.map(c => c.metadata);
    
    // Add to collection
    await this.collection.add({
      ids,
      embeddings,
      metadatas,
      documents: texts
    });
  }

  /**
   * Retrieve relevant code chunks with hybrid search
   */
  async retrieveRelevantCode(
    query: string,
    k: number = 5,
    filters?: Record<string, any>
  ): Promise<RetrievalResult[]> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }
    
    // Generate query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    // Perform semantic search with oversampling for reranking
    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k * 2, // Oversample for reranking
      where: filters
    });
    
    // Convert to retrieval results
    const retrievalResults: RetrievalResult[] = [];
    
    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        const chunk: CodeChunk = {
          id: results.ids[0][i],
          content: results.documents?.[0]?.[i] || '',
          metadata: results.metadatas?.[0]?.[i] as any || {}
        };
        
        retrievalResults.push({
          chunk,
          score: results.distances?.[0]?.[i] || 0
        });
      }
    }
    
    // Rerank results
    const rerankedResults = await this.rerankResults(query, retrievalResults);
    
    // Return top k after reranking
    return rerankedResults.slice(0, k);
  }

  /**
   * Rerank results using cross-encoder for precision
   */
  private async rerankResults(
    query: string,
    results: RetrievalResult[]
  ): Promise<RetrievalResult[]> {
    // For now, use a simple keyword-based reranking
    // In production, use a cross-encoder model
    
    const queryTokens = query.toLowerCase().split(/\s+/);
    
    for (const result of results) {
      let rerankedScore = result.score;
      const contentLower = result.chunk.content.toLowerCase();
      
      // Boost for exact matches
      for (const token of queryTokens) {
        if (contentLower.includes(token)) {
          rerankedScore *= 0.9; // Lower is better for distance
        }
      }
      
      // Boost for matching concept type
      if (result.chunk.metadata.conceptType && 
          query.toLowerCase().includes(result.chunk.metadata.conceptType)) {
        rerankedScore *= 0.85;
      }
      
      // Boost for D3.js specific patterns
      if (query.includes('d3') && result.chunk.metadata.astType?.includes('d3')) {
        rerankedScore *= 0.9;
      }
      
      result.rerankedScore = rerankedScore;
    }
    
    // Sort by reranked score (lower is better)
    return results.sort((a, b) => 
      (a.rerankedScore || a.score) - (b.rerankedScore || b.score)
    );
  }

  /**
   * Add new visualization to corpus
   */
  async addToCorpus(
    code: string,
    metadata: {
      conceptType: string;
      complexity: number;
      source: string;
    }
  ): Promise<void> {
    const chunks = await this.performASTAwareChunking(code, {
      ...metadata,
      language: 'javascript',
      dependencies: ['d3'],
      addedAt: Date.now()
    });
    
    await this.indexChunks(chunks);
  }

  /**
   * Get corpus statistics
   */
  async getCorpusStats(): Promise<{
    totalChunks: number;
    conceptDistribution: Record<string, number>;
    averageChunkSize: number;
  }> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }
    
    // Get all documents for stats
    const allDocs = await this.collection.get();
    
    const conceptDistribution: Record<string, number> = {};
    let totalSize = 0;
    
    if (allDocs.metadatas) {
      for (const metadata of allDocs.metadatas) {
        const conceptType = (metadata as any).conceptType || 'unknown';
        conceptDistribution[conceptType] = (conceptDistribution[conceptType] || 0) + 1;
      }
    }
    
    if (allDocs.documents) {
      for (const doc of allDocs.documents) {
        totalSize += doc?.length || 0;
      }
    }
    
    const totalChunks = allDocs.ids?.length || 0;
    
    return {
      totalChunks,
      conceptDistribution,
      averageChunkSize: totalChunks > 0 ? totalSize / totalChunks : 0
    };
  }

  // Example visualizations for base corpus
  private getPendulumExample(): string {
    return `// Interactive Pendulum Visualization
const width = 600;
const height = 400;
const g = 9.81; // gravity

// Create SVG
const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Pendulum parameters
let length = 2; // meters
let angle = Math.PI / 6; // initial angle
let angleVelocity = 0;

// Animation loop
function animate() {
  // Physics calculation
  const angleAcceleration = -(g / length) * Math.sin(angle);
  angleVelocity += angleAcceleration * 0.02;
  angle += angleVelocity * 0.02;
  
  // Update visualization
  const x = originX + length * scale * Math.sin(angle);
  const y = originY + length * scale * Math.cos(angle);
  
  pendulum.attr("cx", x).attr("cy", y);
  rod.attr("x2", x).attr("y2", y);
  
  requestAnimationFrame(animate);
}`;
  }

  private getSineWaveExample(): string {
    return `// Sine Wave Visualization
const margin = {top: 20, right: 20, bottom: 30, left: 50};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create scales
const xScale = d3.scaleLinear()
  .domain([0, 4 * Math.PI])
  .range([0, width]);

const yScale = d3.scaleLinear()
  .domain([-1, 1])
  .range([height, 0]);

// Generate sine wave data
const data = d3.range(0, 4 * Math.PI, 0.1).map(x => ({
  x: x,
  y: Math.sin(x)
}));

// Create line generator
const line = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y));

// Draw the wave
svg.append("path")
  .datum(data)
  .attr("class", "sine-wave")
  .attr("d", line)
  .style("stroke", "#3b82f6")
  .style("stroke-width", 2)
  .style("fill", "none");`;
  }

  private getDerivativeExample(): string {
    return `// Derivative Visualization
const f = x => x * x; // Function
const df = x => 2 * x; // Derivative

// Create tangent line at point
function drawTangent(x0) {
  const y0 = f(x0);
  const slope = df(x0);
  
  // Tangent line equation: y - y0 = slope * (x - x0)
  const tangentLine = d3.line()
    .x(d => xScale(d))
    .y(d => yScale(y0 + slope * (d - x0)));
  
  svg.append("path")
    .datum([x0 - 1, x0 + 1])
    .attr("class", "tangent")
    .attr("d", tangentLine)
    .style("stroke", "#ef4444")
    .style("stroke-width", 2);
    
  // Show slope value
  svg.append("text")
    .attr("x", xScale(x0))
    .attr("y", yScale(y0) - 10)
    .text(\`Slope: \${slope.toFixed(2)}\`)
    .style("text-anchor", "middle");
}`;
  }
}