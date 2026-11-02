import { readFile } from 'node:fs/promises';

// Keep typography and content styling in preview.css. Only adapt the host here.
export async function quickLookCSS() {
  const preview = await readFile(new URL('../src/preview.css', import.meta.url), 'utf8');
  const scope = 'body.quicklook > .markdown-body';
  const adapted = preview
    .replaceAll('body > .markdown-body', '.markdown-body')
    .replace(/\.markdown-body\s*>\s*/g, '.markdown-body > .quicklook-content > ')
    .replaceAll('.markdown-body', scope);
  const host = await readFile(new URL('../src/quicklook.css', import.meta.url), 'utf8');
  return `@media (prefers-color-scheme: light) {\n${adapted}\n${host}\n}\n`;
}
