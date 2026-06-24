import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'mozlz4.mjs' : 'mozlz4.cjs'),
    },
    target: 'esnext',
    minify: false,
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
})
