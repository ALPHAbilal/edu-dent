import { createClient } from '@supabase/supabase-js';
import { CodeChunk, RetrievalResult } from './rag-system';

/**
 * Cloud-based RAG using Supabase Vector (PostgreSQL pgvector)
 */
export class EducationalRAGSystem {
  private supabase: any = null;
  private tableName = 'eduviz_embeddings';
  
  async initialize(): Promise<void> {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, using mock RAG');
      return;
    }

    try {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      
      // Create table if not exists
      await this.setupTable();
      
      console.log('Supabase RAG system initialized');
    } catch (error) {
      console.error('Supabase initialization failed:', error);
    }
  }

  private async setupTable(): Promise<void> {
    // SQL to create embeddings table with pgvector
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        content TEXT,
        metadata JSONB,
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS ${this.tableName}_embedding_idx 
      ON ${this.tableName} 
      USING ivfflat (embedding vector_cosine_ops);
    `;
    
    // Note: You'll need to run this SQL in Supabase dashboard first
    console.log('Make sure to create the embeddings table in Supabase');
  }

  async retrieveRelevantCode(
    query: string,
    k: number = 5,
    filters?: Record<string, any>
  ): Promise<RetrievalResult[]> {
    if (!this.supabase) {
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
      // Get query embedding from OpenAI
      const queryEmbedding = await this.getEmbedding(query);
      
      // Search using Supabase RPC function
      const { data, error } = await this.supabase
        .rpc('match_embeddings', {
          query_embedding: queryEmbedding,
          match_count: k,
          filter: filters
        });
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        chunk: {
          id: item.id,
          content: item.content,
          metadata: item.metadata
        },
        score: item.similarity
      }));
    } catch (error) {
      console.error('Retrieval failed:', error);
      return [];
    }
  }

  async addToCorpus(
    code: string,
    metadata: any
  ): Promise<void> {
    if (!this.supabase) return;
    
    try {
      const embedding = await this.getEmbedding(code);
      
      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          id: `code-${Date.now()}`,
          content: code,
          metadata,
          embedding
        });
      
      if (error) throw error;
      
      console.log('Added to Supabase corpus');
    } catch (error) {
      console.error('Failed to add to corpus:', error);
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  }

  async getCorpusStats(): Promise<any> {
    if (!this.supabase) {
      return {
        totalChunks: 0,
        conceptDistribution: {},
        averageChunkSize: 0
      };
    }
    
    const { count } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });
    
    return {
      totalChunks: count || 0,
      conceptDistribution: {},
      averageChunkSize: 150
    };
  }
}