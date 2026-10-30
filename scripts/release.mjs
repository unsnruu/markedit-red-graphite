import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const filename = `${pkg.name}.js`;
const digest = createHash('sha256').update(await readFile(`dist/${filename}`)).digest('hex');
await writeFile('dist/SHA256SUMS.txt', `${digest}  ${filename}\n`);
await writeFile('dist/LICENSE.txt', await readFile('LICENSE'));
await writeFile('dist/THIRD-PARTY-NOTICES.txt', `Bundled: markedit-theming 0.17.0\nhttps://github.com/MarkEdit-app/MarkEdit-theming\n\n${await readFile('node_modules/markedit-theming/LICENSE','utf8')}\nCodeMirror, Lezer and markedit-api are provided by MarkEdit at runtime, not bundled.\nNo Bear or imageslr source code, logos, images, or font files are bundled.\nDesign provenance: https://github.com/unsnruu/markedit-bear-red-graphite/blob/main/CREDITS.md\n`);
console.log(`SHA-256 ${digest}`);
