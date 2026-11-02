import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { quickLookCSS } from './quicklook.mjs';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const filename = `${pkg.name}.js`;
const cssFilename = `${pkg.name}-quicklook.css`;
await writeFile(`dist/${cssFilename}`, `/*! ${pkg.name} ${pkg.version} — Quick Look companion\n${await readFile('LICENSE', 'utf8')}\n*/\n${await quickLookCSS()}`);
const checksums = await Promise.all([filename, cssFilename].map(async name => {
  const digest = createHash('sha256').update(await readFile(`dist/${name}`)).digest('hex');
  return `${digest}  ${name}\n`;
}));
await writeFile('dist/SHA256SUMS.txt', checksums.join(''));
await writeFile('dist/LICENSE.txt', await readFile('LICENSE'));
await writeFile('dist/THIRD-PARTY-NOTICES.txt', `Bundled: markedit-theming 0.17.0\nhttps://github.com/MarkEdit-app/MarkEdit-theming\n\n${await readFile('node_modules/markedit-theming/LICENSE','utf8')}\nCodeMirror, Lezer and markedit-api are provided by MarkEdit at runtime, not bundled.\nNo Bear or imageslr source code, logos, images, or font files are bundled.\nDesign provenance: https://github.com/unsnruu/markedit-red-graphite/blob/main/CREDITS.md\n`);
console.log(checksums.join('').trim());
