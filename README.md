# MarkEdit-theme-red-graphite

A light theme for [MarkEdit](https://github.com/MarkEdit-app/MarkEdit), built on [MarkEdit-theming](https://github.com/MarkEdit-app/MarkEdit-theming). Rose accents, graphite text, rounded tables and callouts, and comfortable checkbox spacing.

<img width="344" alt="Mixed mode" src="assets/previews/mixed.png" /> <img width="344" alt="Preview mode" src="assets/previews/preview.png" />

> Light mode only. This is an independent project, not affiliated with or endorsed by Bear or Shiny Frog. Registry registration is pending.

## Implementation note

This theme was implemented with AI assistance. Despite the checks described below, it may contain overlooked bugs, incomplete styling, or compatibility issues. Please report problems through [GitHub Issues](https://github.com/unsnruu/markedit-red-graphite/issues).

## Installation

Download [`markedit-theme-red-graphite.js` from v1.0.0](https://github.com/unsnruu/markedit-red-graphite/releases/download/v1.0.0/markedit-theme-red-graphite.js). Copy the script into MarkEdit's user scripts directory and restart MarkEdit. Building this project does **not** install the theme, restart the app, or change existing files.

Use an isolated MarkEdit environment if you already have custom Bear CSS or companion scripts: those global styles can override this theme. To remove this theme, remove only its script and restart MarkEdit.

- Tested host: MarkEdit 1.37.0 CoreEditor in an isolated Chrome browser.
- [Markdown View Modes](https://github.com/MarkEdit-app/MarkEdit-preview) 1.14.0 provides Mixed/Preview rendering. Enable table/image inline rendering there when needed.
- [Text Highlight](https://github.com/MarkEdit-app/MarkEdit-highlight) 1.0.0 provides highlight syntax. This theme only supplies its colors; it does not add `==` parsing to Preview.
- Native macOS installation and IME composition have not been validated by the browser tests. Styled HTML export and nested callout rendering are outside the v1 compatibility guarantee.

## Settings

In MarkEdit's [settings.json](https://github.com/MarkEdit-app/MarkEdit/wiki/Customization#advanced-settings):

```json
{
  "extension.redGraphite": { "enabledMode": "light" }
}
```

Use `none` to disable, then restart MarkEdit. `both` also applies only the supplied light theme; no dark theme is supplied. Color customization is documented by [MarkEdit-theming](https://github.com/MarkEdit-app/MarkEdit-theming/wiki#customization).

The design uses system fonts at 16px, line height 1.68 and maximum content width 800px. It does not change tab width, document content, or editing commands.

## Development

Source, tests, build scripts, dependencies, and generated builds are maintained under [`dev/`](dev/README.md). See the [development guide](dev/README.md) for build and browser-test instructions. Sample screenshots live under `assets/previews/`; GitHub workflows remain under `.github/workflows/`.

## Contribution and license

The [MarkEdit registry contributing guide](https://github.com/MarkEdit-app/extensions#contributing) governs registration. A theme entry belongs under `themes/`, uses `theme.schema.json`, and includes `colorScheme`, `colorPatterns`, a versioned JavaScript URL and its SHA-256. Registry registration is requested through a pull request; availability in the Extension Manager depends on acceptance.

New implementation: [MIT](LICENSE). See [credits and provenance](CREDITS.md) for design references and bundled dependency notices. The code license does not grant rights to third-party names or designs.
