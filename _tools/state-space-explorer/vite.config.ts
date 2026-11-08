import { defineConfig } from 'vite';
export default defineConfig({base: '/labs/state-space-explorer/', build: {outDir: '../../labs/state-space-explorer', emptyOutDir: true, rollupOptions:{output:{entryFileNames:'assets/explorer.js',chunkFileNames:'assets/[name].js',manualChunks:{'vendor/three':['three'],'vendor/math':['ml-matrix','d3-force-3d','papaparse']}}}}});
