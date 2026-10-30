# Credits and provenance

The palette and visual direction were selected from an earlier personal MarkEdit adaptation inspired by Bear's Red Graphite theme and [imageslr/typora-theme-bear](https://github.com/imageslr/typora-theme-bear). That repository generates its themes from [imageslr/mweb-themes](https://github.com/imageslr/mweb-themes).

This project's MarkEdit-specific implementation is separately authored. No Bear or imageslr CSS/SCSS source files, icons, logos, images, or font files are bundled. System font names are referenced without distributing font files. Similar appearance is not, by itself, proof of permission or legal clearance.

The mweb-themes package metadata declares ISC. That declaration does not establish rights to every third-party name or design referenced by that project. Bear's [terms](https://bear.app/terms/) address intellectual property, trademarks and trade dress. The project uses the name Red Graphite. This name change does not establish legal clearance for a third-party design. This project is not affiliated with or endorsed by Bear or Shiny Frog.

## Software

- New code: MIT, copyright 2026 Red Graphite contributors.
- Bundled runtime dependency: [MarkEdit-theming](https://github.com/MarkEdit-app/MarkEdit-theming), MIT. Its complete notice is included in the JavaScript and `dev/dist/THIRD-PARTY-NOTICES.txt`.
- CodeMirror, Lezer and markedit-api are supplied by MarkEdit at runtime and are external to the bundle.
- [MarkEdit-vite](https://github.com/MarkEdit-app/MarkEdit-vite) is a build dependency. Its deployment plugin is disabled so a build leaves the installed app untouched.

The source layout under `dev/` follows the official [VS Code](https://github.com/MarkEdit-app/MarkEdit-theme-vscode) and [One Dark](https://github.com/MarkEdit-app/MarkEdit-theme-one-dark) theme examples. Registration follows the [official contributing guide](https://github.com/MarkEdit-app/extensions#contributing).
