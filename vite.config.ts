import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{
            debugName: 'corpus-index',
            name(id) {
              return id.replaceAll('\\', '/').endsWith('/src/data/corpus.ts') ? 'corpus-index' : null;
            },
          }],
        },
      },
    },
  },
});
