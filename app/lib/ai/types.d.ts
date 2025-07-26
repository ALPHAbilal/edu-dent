// Type declarations for packages without TypeScript support

declare module 'gpt-tokenizer' {
  export function encode(text: string): number[];
  export function decode(tokens: number[]): string;
}

declare module 'chromadb' {
  export class ChromaClient {
    constructor(config?: { path?: string });
    createCollection(params: {
      name: string;
      metadata?: Record<string, any>;
    }): Promise<Collection>;
    getCollection(params: { name: string }): Promise<Collection>;
  }
  
  export interface Collection {
    add(params: {
      ids: string[];
      embeddings?: number[][];
      metadatas?: Record<string, any>[];
      documents?: string[];
    }): Promise<void>;
    
    query(params: {
      queryEmbeddings?: number[][];
      nResults?: number;
      where?: Record<string, any>;
    }): Promise<{
      ids?: string[][];
      distances?: number[][];
      metadatas?: Record<string, any>[][];
      documents?: string[][];
    }>;
    
    get(): Promise<{
      ids?: string[];
      metadatas?: Record<string, any>[];
      documents?: string[];
    }>;
  }
}

declare module '@langchain/community/embeddings/hf_transformers' {
  export class HuggingFaceTransformersEmbeddings {
    constructor(config: {
      modelName: string;
      model?: {
        pooling?: string;
        normalize?: boolean;
      };
    });
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
  }
}