import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Helper to register all HTML pages as Rollup entry points for multi-page build
function getHtmlEntries(dir = __dirname, entries = {}) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (
      item.name === 'node_modules' ||
      item.name === 'dist' ||
      item.name === '_backup' ||
      item.name.startsWith('.')
    ) {
      continue;
    }
    const fullPath = resolve(dir, item.name);
    if (item.isDirectory()) {
      getHtmlEntries(fullPath, entries);
    } else if (item.name.endsWith('.html')) {
      const relPath = fullPath.substring(__dirname.length + 1).replace(/\\/g, '/');
      const key = relPath.replace(/\.html$/, '').replace(/\//g, '_');
      entries[key] = fullPath;
    }
  }
  return entries;
}

// Pre-create dist directories to prevent concurrent mkdir race conditions on Windows
function ensureDistDirs() {
  const dist = resolve(__dirname, 'dist');
  if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      if (
        item.name === 'node_modules' ||
        item.name === 'dist' ||
        item.name === '_backup' ||
        item.name.startsWith('.')
      ) {
        continue;
      }
      const full = resolve(currentDir, item.name);
      if (item.isDirectory()) {
        const rel = full.substring(__dirname.length + 1);
        const target = resolve(dist, rel);
        if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
        walk(full);
      }
    }
  }
  walk(__dirname);
}

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: 'localhost',
  },
  preview: {
    port: 3000,
    host: 'localhost',
  },
  optimizeDeps: {
    noDiscovery: true,
  },
  plugins: [
    {
      name: 'catalyst-builder',
      buildStart() {
        ensureDistDirs();
      },
      closeBundle() {
        // Ensure all static assets (scripts, styles, evidence images) are copied to dist/assets
        const srcAssets = resolve(__dirname, 'assets');
        const distAssets = resolve(__dirname, 'dist', 'assets');
        if (fs.existsSync(srcAssets)) {
          fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
        }
      },
    },
  ],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
});
