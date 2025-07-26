/**
 * Optional dependency loader for external services
 * Allows the app to work without all packages installed
 */

export const loadPinecone = async () => {
  try {
    const { Pinecone } = await import('@pinecone-database/pinecone');
    console.log('Pinecone SDK loaded successfully');
    return Pinecone;
  } catch (error: any) {
    console.warn('Pinecone not available:', error.message);
    return null;
  }
};

export const loadAnthropic = async () => {
  try {
    const Anthropic = await import('@anthropic-ai/sdk');
    console.log('Anthropic SDK loaded successfully');
    return Anthropic.default || Anthropic;
  } catch (error: any) {
    console.warn('Anthropic SDK not available:', error.message);
    return null;
  }
};

export const loadSupabase = async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    console.log('Supabase SDK loaded successfully');
    return createClient;
  } catch (error: any) {
    console.warn('Supabase not available:', error.message);
    return null;
  }
};

export const loadChromaDB = async () => {
  try {
    const { ChromaClient } = await import('chromadb');
    console.log('ChromaDB loaded successfully');
    return ChromaClient;
  } catch (error: any) {
    console.warn('ChromaDB not available:', error.message);
    return null;
  }
};

export const loadLangchain = async () => {
  try {
    const langchain = await import('langchain');
    console.log('Langchain loaded successfully');
    return langchain;
  } catch (error: any) {
    console.warn('Langchain not available:', error.message);
    return null;
  }
};

/**
 * Check which services are available
 */
export const getAvailableServices = async () => {
  const services = {
    pinecone: false,
    anthropic: false,
    supabase: false,
    chromadb: false,
    langchain: false,
    openai: true // Assuming OpenAI is always available
  };
  
  // Test each service availability
  const [pinecone, anthropic, supabase, chromadb, langchain] = await Promise.all([
    loadPinecone(),
    loadAnthropic(),
    loadSupabase(),
    loadChromaDB(),
    loadLangchain()
  ]);
  
  services.pinecone = !!pinecone;
  services.anthropic = !!anthropic;
  services.supabase = !!supabase;
  services.chromadb = !!chromadb;
  services.langchain = !!langchain;
  
  return services;
};

/**
 * Feature availability checker
 */
export const isFeatureAvailable = async (feature: string): Promise<boolean> => {
  const services = await getAvailableServices();
  
  switch (feature) {
    case 'vectorSearch':
      return services.pinecone || services.chromadb;
    case 'advancedAI':
      return services.anthropic;
    case 'database':
      return services.supabase;
    default:
      return false;
  }
};