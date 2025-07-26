# Pinecone Setup Guide for EduViz AI (2025 Version)

## Quick Setup Steps

### 1. Create Pinecone Account
- Go to https://app.pinecone.io
- Sign up with email or Google/GitHub
- Verify your email

### 2. Create Your Index

In the Pinecone dashboard:

1. Click **"Indexes"** in the left sidebar
2. Click **"Create Index"** button
3. Configure with these exact settings:
   - **Name**: `eduviz-rag`
   - **Dimensions**: `1536` (for OpenAI embeddings)
   - **Metric**: `cosine`
   - **Deployment Type**: Choose **Serverless**
   - **Cloud**: `AWS`
   - **Region**: `us-east-1`

4. Click **"Create Index"** and wait ~1 minute

### 3. Get Your API Key

1. Click **"API Keys"** in the left sidebar
2. Copy your API key (looks like: `abcd1234-5678-90ef-ghij-klmnopqrstuv`)

### 4. Configure Your Project

Add to your `.env.local` file:

```bash
# Pinecone Configuration
PINECONE_API_KEY=your-api-key-here
PINECONE_INDEX=eduviz-rag

# No environment variable needed anymore!
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Test Your Setup

1. Restart your dev server:
```bash
npm run dev
```

2. Check the console for:
```
Using Pinecone for RAG
Pinecone RAG system initialized successfully
Base examples indexed to Pinecone
```

3. Try generating a visualization!

## What Changed in 2025?

- ✅ **No Environment Variable** - Just API key needed
- ✅ **Serverless Indexes** - New deployment option
- ✅ **Global API URL** - Simplified connections
- ✅ **Better Free Tier** - 2GB storage, 2M writes/month

## Troubleshooting

### "Index does not exist"
- Make sure index name is exactly `eduviz-rag`
- Check it's created in the dashboard
- Verify it's in `us-east-1` region

### "Using mock RAG system"
- Check `.env.local` has correct API key
- Restart dev server after adding credentials
- Make sure no typos in variable names

### API Errors
- Verify API key is copied correctly
- Check Pinecone dashboard for any issues
- Free tier limits: 2M writes, 1M reads per month

## Free Tier Limits (Starter Plan)
- **Storage**: 2 GB
- **Indexes**: Up to 5
- **Writes**: 2M/month
- **Reads**: 1M/month
- **Inactivity**: Pauses after 3 weeks

## Next Steps

Your RAG system is now:
- ✅ Storing visualizations in the cloud
- ✅ Finding relevant examples for better generation
- ✅ Learning from your usage patterns
- ✅ Persistent across restarts

Try these prompts to test:
- "Create a double pendulum simulation"
- "Show wave interference patterns"
- "Visualize projectile motion with air resistance"

The system will automatically find similar examples from Pinecone to improve generation quality!