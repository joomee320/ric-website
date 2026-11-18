import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Same as the "@/*" path in tsconfig.json.
    alias: [
      { find: /^@\//, replacement: fileURLToPath(new URL('./', import.meta.url)) },
      // 'server-only' throws outside Next.js server code; tests run server code directly.
      { find: /^server-only$/, replacement: fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)) },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{js,ts,tsx}'],
  },
});
