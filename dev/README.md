# Development

The entry point, Vite configuration, Yarn lockfile and `dist/` layout inside `dev/` follow [VS Code](https://github.com/MarkEdit-app/MarkEdit-theme-vscode) and [One Dark](https://github.com/MarkEdit-app/MarkEdit-theme-one-dark). Presentation styles are organized under `src/`. Unlike those examples, the helper's automatic deployment plugin is disabled.

With Node.js 22 and Yarn 1.22.22, start from the repository root:

```sh
cd dev
corepack enable
yarn install --frozen-lockfile
yarn check
yarn build
```

The build produces the single script, SHA-256, and license notices under `dist/`. The bundle contains its required license notices as well.

For the browser integration test, install Chrome and set these environment variables to local files:

- `MARKEDIT_HTML`: the installed MarkEdit application's `Contents/Resources/index.html`.
- `MARKEDIT_PREVIEW_JS`: Markdown View Modes 1.14.0 release script.
- `MARKEDIT_HIGHLIGHT_JS`: Text Highlight 1.0.0 release script.

Then run `yarn test`. The test uses an ephemeral Chrome profile and a loopback server. Native file/menu calls are test doubles. It checks Source/Mixed/Preview, narrow layout, light/dark cleanup, disabling, and editing/undo; it updates sample screenshots under `../assets/previews/`. CI checks the build and committed `dist/` consistency; native-resource integration tests run locally.

## Repository boundaries

The Git repository, GitHub workflows, public README, credits, and project license remain at the repository root. Source, dependencies, tests, build configuration, and generated builds live in this directory. Run all package commands here. Installation and settings are documented in the [project README](../README.md).

Published release assets and version tags are independent of the current source layout. Moving source files does not replace v1.0.0 assets or alter the registry entry.
