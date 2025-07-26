import { CodeChunk, RetrievalResult } from './rag-system';
import { loadPinecone } from '../optional-deps';

/**
 * Cloud-based RAG system using Pinecone (no local storage needed)
 */
export class EducationalRAGSystem {
  private pinecone: any = null;
  private index: any = null;
  private embeddings: any;
  private PineconeClass: any = null;
  
  constructor() {
    // Simple embeddings using OpenAI
    this.embeddings = {
      embedDocuments: async (texts: string[]) => {
        // Use OpenAI embeddings API
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: texts
          })
        });
        const data = await response.json();
        return data.data.map((d: any) => d.embedding);
      },
      embedQuery: async (text: string) => {
        const embeddings = await this.embeddings.embedDocuments([text]);
        return embeddings[0];
      }
    };
  }

  async initialize(): Promise<void> {
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
      console.log('Pinecone not configured, using mock RAG');
      return;
    }

    try {
      // Try to load Pinecone SDK dynamically
      this.PineconeClass = await loadPinecone();
      
      if (!this.PineconeClass) {
        console.log('Pinecone SDK not available, using mock RAG');
        return;
      }

      // Initialize Pinecone - 2025 version (no environment needed)
      this.pinecone = new this.PineconeClass({
        apiKey: process.env.PINECONE_API_KEY!
      });
      
      // Get index reference
      this.index = this.pinecone.index(process.env.PINECONE_INDEX!);
      
      // Check if index exists
      try {
        const indexList = await this.pinecone.listIndexes();
        const indexExists = indexList.indexes?.some(
          (idx: any) => idx.name === process.env.PINECONE_INDEX
        );
        
        if (!indexExists) {
          console.log('Index does not exist. Please create it in Pinecone dashboard.');
          console.log('Required settings: dimension=1536, metric=cosine');
          return;
        }
      } catch (listError) {
        console.warn('Could not verify index existence:', listError);
      }
      
      console.log('Pinecone RAG system initialized successfully');
      
      // Index base examples
      await this.indexBaseExamples();
    } catch (error) {
      console.error('Pinecone initialization failed:', error);
      console.log('Falling back to mock RAG');
      this.pinecone = null;
      this.index = null;
    }
  }

  private async indexBaseExamples(): Promise<void> {
    const examples = [
      {
        id: 'pendulum-basic',
        text: 'Interactive pendulum visualization with D3.js showing physics simulation',
        code: 'const pendulum = d3.select("#visualization").append("circle").attr("r", 20);',
        metadata: {
          source: 'base-corpus',
          conceptType: 'physics-simulation',
          complexity: 3
        }
      },
      {
        id: 'sine-wave',
        text: 'Sine wave visualization with D3.js for wave physics',
        code: 'd3.range(0, 4 * Math.PI, 0.1).map(x => ({ x: x, y: Math.sin(x) }));',
        metadata: {
          source: 'base-corpus',
          conceptType: 'wave-visualization',
          complexity: 2
        }
      }
    ];

    try {
      // Generate embeddings
      const texts = examples.map(e => `${e.text} ${e.code}`);
      const embeddings = await this.embeddings.embedDocuments(texts);
      
      // Prepare for Pinecone
      const vectors = examples.map((example, i) => ({
        id: example.id,
        values: embeddings[i],
        metadata: {
          ...example.metadata,
          text: example.text,
          code: example.code
        }
      }));
      
      // Upsert to Pinecone
      await this.index.upsert(vectors);
      
      console.log('Base examples indexed to Pinecone');
    } catch (error) {
      console.error('Failed to index examples:', error);
    }
  }

  async retrieveRelevantCode(
    query: string,
    k: number = 5,
    filters?: Record<string, any>
  ): Promise<RetrievalResult[]> {
    if (!this.index) {
      // Return mock data if Pinecone not initialized
      return [{
        chunk: {
          id: 'mock-1',
          content: 'const svg = d3.select("#visualization").append("svg");',
          metadata: { source: 'mock', language: 'javascript' }
        },
        score: 0.8
      }];
    }

    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      // Query Pinecone
      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK: k,
        includeMetadata: true,
        filter: filters
      });
      
      // Convert to RetrievalResult format
      return queryResponse.matches.map((match: any) => ({
        chunk: {
          id: match.id,
          content: match.metadata.code || '',
          metadata: {
            source: match.metadata.source,
            language: 'javascript',
            conceptType: match.metadata.conceptType,
            complexity: match.metadata.complexity
          }
        },
        score: match.score
      }));
    } catch (error) {
      console.error('Retrieval failed:', error);
      return [];
    }
  }

  async addToCorpus(
    code: string,
    metadata: {
      conceptType: string;
      complexity: number;
      source: string;
    }
  ): Promise<void> {
    if (!this.index) return;
    
    try {
      const id = `user-${Date.now()}`;
      const text = `${metadata.conceptType} visualization with complexity ${metadata.complexity}`;
      
      // Generate embedding
      const embedding = await this.embeddings.embedQuery(`${text} ${code}`);
      
      // Upsert to Pinecone
      await this.index.upsert([{
        id,
        values: embedding,
        metadata: {
          ...metadata,
          text,
          code,
          timestamp: Date.now()
        }
      }]);
      
      console.log('Added to Pinecone corpus');
    } catch (error) {
      console.error('Failed to add to corpus:', error);
    }
  }

  async getCorpusStats(): Promise<{
    totalChunks: number;
    conceptDistribution: Record<string, number>;
    averageChunkSize: number;
  }> {
    if (!this.index) {
      return {
        totalChunks: 0,
        conceptDistribution: {},
        averageChunkSize: 0
      };
    }
    
    try {
      const stats = await this.index.describeIndexStats();
      return {
        totalChunks: stats.totalVectorCount || 0,
        conceptDistribution: {},
        averageChunkSize: 150
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalChunks: 0,
        conceptDistribution: {},
        averageChunkSize: 0
      };
    }
  }
}