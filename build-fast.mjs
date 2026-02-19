import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/_worker.js',
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  minify: false,
  sourcemap: false,
  logLevel: 'info',
  external: ['node:*', '__STATIC_CONTENT_MANIFEST'],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})

console.log('✅ Build completo!')
