mport trace for requested module:
./app/lib/ai/advanced-orchestrator.ts
./app/lib/ai/orchestrator.ts
./app/api/generate/route.ts
 POST /api/generate 500 in 24181ms
 GET / 500 in 7515ms
 GET / 500 in 84ms
 GET / 500 in 81ms
 ✓ Compiled /_not-found in 4.5s (905 modules)
 ⚠ Fast Refresh had to perform a full reload due to a runtime error.
 GET /_next/static/webpack/42d887041138d797.webpack.hot-update.json 404 in 5115ms
 GET / 200 in 335ms
 ○ Compiling /favicon.ico ...
 ✓ Compiled /favicon.ico in 700ms (531 modules)
 GET /favicon.ico 200 in 1276ms
 ✓ Compiled in 219ms (391 modules)
 GET / 200 in 184ms
 ✓ Compiled in 295ms (391 modules)
 GET / 200 in 74ms
 ✓ Compiled in 340ms (391 modules)
 GET / 200 in 62ms
PS F:\my\edu-dent>
                   npm run dev

> eduviz-ai@0.1.0 dev
> next dev

   ▲ Next.js 15.4.4
   - Local:        http://localhost:3000
   - Network:      http://172.20.80.1:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 5s
 ○ Compiling / ...
 ✓ Compiled / in 6.5s (571 modules)
 ✓ Compiled in 1678ms (238 modules)
 GET / 200 in 8367ms
 ○ Compiling /favicon.ico ...
 ✓ Compiled /favicon.ico in 1094ms (350 modules)
 GET /favicon.ico 200 in 1485ms
 ○ Compiling /api/generate ...
 ⨯ ./app/lib/ai/rag-pinecone.ts:1:1
Module not found: Can't resolve '@pinecone-database/pinecone'
> 1 | import { Pinecone } from '@pinecone-database/pinecone';
    | ^
  2 | import { CodeChunk, RetrievalResult } from './rag-system';
  3 |
  4 | /**

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/lib/ai/advanced-orchestrator.ts
./app/lib/ai/orchestrator.ts
./app/api/generate/route.ts
 ⨯ ./app/lib/ai/rag-pinecone.ts:1:1
Module not found: Can't resolve '@pinecone-database/pinecone'
> 1 | import { Pinecone } from '@pinecone-database/pinecone';
    | ^
  2 | import { CodeChunk, RetrievalResult } from './rag-system';
  3 |
  4 | /**

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/lib/ai/advanced-orchestrator.ts
./app/lib/ai/orchestrator.ts
./app/api/generate/route.ts
 ⨯ ./app/lib/ai/rag-pinecone.ts:1:1
Module not found: Can't resolve '@pinecone-database/pinecone'
> 1 | import { Pinecone } from '@pinecone-database/pinecone';
    | ^
  2 | import { CodeChunk, RetrievalResult } from './rag-system';
  3 |
  4 | /**

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/lib/ai/advanced-orchestrator.ts
./app/lib/ai/orchestrator.ts
./app/api/generate/route.ts
 ⨯ ./app/lib/ai/rag-pinecone.ts:1:1
Module not found: Can't resolve '@pinecone-database/pinecone'
> 1 | import { Pinecone } from '@pinecone-database/pinecone';
    | ^
  2 | import { CodeChunk, RetrievalResult } from './rag-system';
  3 |
  4 | /**

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/lib/ai/advanced-orchestrator.ts
./app/lib/ai/orchestrator.ts
./app/api/generate/route.ts
 POST /api/generate 500 in 10569ms
 GET / 500 in 2727ms
 GET / 500 in 46ms
 GET / 500 in 25ms