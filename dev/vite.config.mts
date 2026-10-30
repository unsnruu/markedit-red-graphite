import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { defaultViteConfig } from 'markedit-vite';

const base = defaultViteConfig();
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const license = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8');
const upstreamLicense = readFileSync(new URL('./node_modules/markedit-theming/LICENSE', import.meta.url), 'utf8');

export default defineConfig({
  ...base,
  // The official helper auto-installs into MarkEdit. Building this project is local-only.
  plugins: [],
  build: {
    ...base.build,
    target: 'safari16',
    minify: false,
    lib: { entry: 'main.ts', formats: ['cjs'], fileName: () => `${pkg.name}.js` },
    rollupOptions: {
      ...base.build?.rollupOptions,
      output: { banner: `/*! ${pkg.name} ${pkg.version}\n${license}\nBundled dependency: markedit-theming 0.17.0\n${upstreamLicense}\n*/` },
    },
  },
});
