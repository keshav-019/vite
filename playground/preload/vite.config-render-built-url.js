import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist/render-built-url',
  },
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        // Resolves to a different URL than a relative `import()` from the
        // importing chunk would, like a CDN or runtime-configured base.
        return { runtime: JSON.stringify(`/${filename}?render-built-url`) }
      }
      return { relative: true }
    },
  },
  cacheDir: 'node_modules/.vite-render-built-url',
})
