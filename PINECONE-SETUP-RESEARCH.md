# Pinecone Platform Research Prompt - 2025 Interface

## Context
I need to set up Pinecone for my EduViz AI project's RAG system. I have created an account and have my API key, but the platform interface has changed from older documentation. Please help me find the exact current steps and interface elements.

## What I Need to Find:

### 1. Current Dashboard Layout
- What does the main dashboard look like after login?
- What are the menu items in the sidebar?
- Where exactly is the "Create Index" button/option located?
- Has the terminology changed? (Is it still called "Index" or something else?)

### 2. Index Creation Process (2025 Version)
- What are the EXACT steps to create a new index in the current interface?
- What fields are required?
- What are the current options for:
  - Dimensions (I need 1536 for OpenAI embeddings)
  - Metric types (cosine, euclidean, dotproduct)
  - Pod types for free tier
  - Regions available
- Are there any new required fields or settings?

### 3. Free Tier Limitations (Current)
- What are the current free tier limits?
- How many vectors allowed?
- How many indexes?
- Any rate limits?
- Storage limits?

### 4. API Configuration
- Where exactly do I find:
  - API Key (I have this)
  - Environment/Region identifier
  - Project ID (if needed)
  - Index endpoint/URL
- Has the API authentication method changed?

### 5. New Features or Requirements
- Is there a new SDK version I should use?
- Any new initialization steps?
- OAuth or additional security requirements?
- Any required project setup before creating indexes?

### 6. Common Issues (2025)
- What are current common setup errors?
- Any known issues with Next.js integration?
- CORS configuration requirements?
- Any specific npm package versions needed?

## Specific Questions:

1. **Is the index creation immediate or does it require approval/verification?**
2. **Do I need to set up a "Project" before creating an index?**
3. **Is the environment still called "gcp-starter" or has it changed?**
4. **Are there any required configurations for JavaScript/TypeScript projects?**

## My Setup:
- Next.js 15.4.4
- TypeScript
- Using `@pinecone-database/pinecone` npm package
- OpenAI embeddings (1536 dimensions)
- Need to store educational code snippets

## Please Search For:
- "Pinecone dashboard 2025"
- "Pinecone create index current version"
- "Pinecone free tier limits 2025"
- "Pinecone Next.js setup guide latest"
- "Pinecone JavaScript SDK v2 initialization"
- Current Pinecone documentation
- Recent tutorials or YouTube videos showing the actual interface

## Screenshots or Descriptions Needed:
1. Main dashboard after login
2. Index creation form/modal
3. API keys section
4. Any project or organization setup screens
5. The exact values shown for environment/region

Please provide the most current, accurate information about the Pinecone platform interface and setup process as it exists RIGHT NOW, not from outdated documentation.

---

*Note: I specifically need to know what's different from older tutorials that show simply creating an index with name, dimensions, and metric. The interface seems to have changed.*