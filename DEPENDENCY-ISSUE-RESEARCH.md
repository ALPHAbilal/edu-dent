 ✓ Compiled /favicon.ico in 608ms (530 modules)
 GET /favicon.ico 200 in 843ms
 ○ Compiling /api/generate ...
 ⨯ ./app/lib/ai/semantic-compression.ts:1:1
Module not found: Can't resolve 'gpt-tokenizer'
> 1 | import { encode } from 'gpt-tokenizer';
    | ^
  2 |
  3 | export interface ConversationTurn {
  4 |   role: 'user' | 'assistant' | 'system';

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/lib/ai/advanced-orchestrator.ts
./app/lib/ai/orchestrator.ts
./app/api/generate/route.ts
 ⨯ ./app/lib/ai/semantic-compression.ts:1:1
Module not found: Can't resolve 'gpt-tokenizer'
> 1 | import { encode } from 'gpt-tokenizer';
    | ^
  2 |
  3 | export interface ConversationTurn {
  4 |   role: 'user' | 'assistant' | 'system';

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./app/lib/ai/advanced-orchestrator.ts
./app/lib/ai/orchestrator.ts
./app/api/generate/route.ts
 POST /api/generate 500 in 2715ms
 GET / 500 in 97ms
 GET / 500 in 40ms
