// Mock RAG system for testing without ChromaDB
import { CodeChunk, RetrievalResult } from './rag-system';

export class EducationalRAGSystem {
  private mockCorpus: CodeChunk[] = [];

  async initialize(): Promise<void> {
    console.log('Using mock RAG system (ChromaDB not connected)');
    
    // Add some mock data
    this.mockCorpus = [
      {
        id: 'pendulum-1',
        content: 'const pendulum = d3.select("#visualization").append("circle").attr("r", 20);',
        metadata: {
          source: 'mock',
          language: 'javascript',
          conceptType: 'physics-simulation'
        }
      }
    ];
  }

  async retrieveRelevantCode(
    query: string,
    k: number = 5,
    filters?: Record<string, any>
  ): Promise<RetrievalResult[]> {
    // Simple mock retrieval
    return this.mockCorpus
      .filter(chunk => {
        if (filters?.conceptType) {
          return chunk.metadata.conceptType === filters.conceptType;
        }
        return true;
      })
      .slice(0, k)
      .map(chunk => ({
        chunk,
        score: 0.8,
        rerankedScore: 0.9
      }));
  }

  async addToCorpus(
    code: string,
    metadata: any
  ): Promise<void> {
    this.mockCorpus.push({
      id: `mock-${Date.now()}`,
      content: code,
      metadata
    });
  }

  async getCorpusStats(): Promise<any> {
    return {
      totalChunks: this.mockCorpus.length,
      conceptDistribution: {},
      averageChunkSize: 100
    };
  }
}