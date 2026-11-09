# Red Graphite for MarkEdit

A light theme for [MarkEdit](https://github.com/MarkEdit-app/MarkEdit).

- Soft white pages, dark gray text, and rose accents.
- System fonts at 16px, with a reading width of up to 800px in the editor and Preview.
- Styles for Mixed mode, Preview, and Finder Quick Look.
- Built with [MarkEdit-theming](https://github.com/MarkEdit-app/MarkEdit-theming).

## Take a look

### Mixed mode

Rose highlights, clear task spacing, and rounded tables and callouts.

<img width="760" alt="Mixed mode with rose highlights, task checkboxes, a note callout, and a table" src="assets/previews/mixed.png" />

### Preview mode

Clear headings, soft borders, and rose links.

<img width="760" alt="Preview mode with headings, a quote, a note callout, a table, and a code block" src="assets/previews/preview.png" />

Both screenshots use the [sample note](test/fixture.md). They were taken in a separate browser test environment with MarkEdit’s editor and extensions.

## Install the theme

1. Open [Red Graphite in the Extension Registry](https://markedit-app.github.io/extensions/#markedit-theme-red-graphite).
2. Click **Add to MarkEdit** and follow the app’s install prompt.
3. Restart MarkEdit.

MarkEdit downloads and installs the theme for you.

- Use **light mode** to see Red Graphite.
- Quick Look CSS is a separate install. Follow the next section to add it.
- Using custom Bear CSS or other style scripts? Try Red Graphite in a separate MarkEdit setup first. Those styles may override it.

<details>
<summary>Manual installation</summary>

1. Download [`markedit-theme-red-graphite.js` (v1.0.3)](https://github.com/unsnruu/markedit-red-graphite/releases/download/v1.0.3/markedit-theme-red-graphite.js).
2. Copy it to MarkEdit’s user scripts folder.
3. Restart MarkEdit.

The registry version may lag behind GitHub releases. To remove a manually installed theme, delete its script and restart MarkEdit.

</details>

## Add Quick Look styles

Want the same look in Finder? Install the optional CSS file.

- It styles the **Preview** view in light mode.
- The source view and toolbar keep their usual look.
- Dark mode uses the preview extension’s existing theme.
- Install it separately from the editor theme. You do not need to change `themeName`.

### Before you start

- Use MarkEdit 1.37.0 and [Markdown View Modes](https://github.com/MarkEdit-app/MarkEdit-preview) 1.14.0. Earlier versions have not been tested.
- Enable MarkEdit’s Quick Look extension in macOS.
- Open MarkEdit once with Markdown View Modes installed. This prepares the files that Quick Look needs.

### Install

1. Download [`markedit-theme-red-graphite-quicklook.css` (v1.0.3)](https://github.com/unsnruu/markedit-red-graphite/releases/download/v1.0.3/markedit-theme-red-graphite-quicklook.css).
2. In Finder, choose **Go → Go to Folder**. Open this folder:

   ```text
   ~/Library/Group Containers/group.app.cyan.markedit/Shared/
   ```

3. Open the `styles` folder. Create it if it does not exist.
4. Copy the CSS file into `styles`.
5. Close any open Quick Look window.
6. Select a Markdown file in Finder, press Space, and choose **Preview**.

The CSS is available in the [v1.0.3 release](https://github.com/unsnruu/markedit-red-graphite/releases/tag/v1.0.3). You can also build it with `yarn build`.

### Ask an AI agent to install it

Copy the prompt below into an agent that can work with files on your Mac. This asks it to install the Quick Look CSS in your real environment.

<details>
<summary>Show the installation prompt</summary>

```text
Please install the Red Graphite Quick Look CSS on my Mac.

Source repository:
https://github.com/unsnruu/markedit-red-graphite

1. Read the repository README and its Quick Look instructions.
   Download the CSS from this release asset:
   https://github.com/unsnruu/markedit-red-graphite/releases/download/v1.0.3/markedit-theme-red-graphite-quicklook.css
   Verify its SHA-256 against SHA256SUMS.txt in the same release.
   Record the download URL and checksum.
   Confirm that the downloaded file is CSS, not a GitHub HTML page.
   Use the existing CSS; there is no need to recreate the theme.

2. Check that MarkEdit and Markdown View Modes are installed and that
   the Quick Look shared resources are ready. The documented test
   versions are MarkEdit 1.37.0 and Markdown View Modes 1.14.0.
   If required resources are missing, explain what I need to enable
   or open before continuing. Keep my existing app settings intact.

3. Install only this file:
   ~/Library/Group Containers/group.app.cyan.markedit/Shared/styles/markedit-theme-red-graphite-quicklook.css
   Create the styles folder if needed. If the destination is identical,
   leave it as it is. If it differs, back it up outside Shared/styles
   before replacing it. Report the backup path.

4. If macOS blocks terminal access, try copying the file through Finder.
   Keep system privacy settings unchanged. If access is still blocked,
   explain the exact manual step I need to take and mark installation
   as incomplete.

5. Verify that the file exists at the destination. Compare SHA-256
   checksums when readable. If only Finder verification is possible,
   report that limit instead of claiming a checksum match.

6. Report the installed path, source, backup if any, and verification.
   Tell me to close Quick Look, select a Markdown file in Finder,
   press Space, and choose Preview in light mode.
   I will check the appearance myself. Distinguish file installation
   from a visual check in Finder.

Keep the editor theme, other CSS files, and settings.json unchanged.
Do not change themeName or publish a release.
To undo this installation, tell me how to remove this CSS file only,
or restore the previous file from the backup if one was replaced.
```

</details>

### Update or remove

- **Update:** replace the CSS file with the newer version.
- **Disable or uninstall:** remove only `markedit-theme-red-graphite-quicklook.css`.
- Close and reopen Quick Look after either change.
- Keep your other styles and preview settings as they are.
- Removing the editor theme does **not** remove the Quick Look CSS.

## Settings

Add this to MarkEdit’s [settings.json](https://github.com/MarkEdit-app/MarkEdit/wiki/Customization#advanced-settings):

```json
{
  "extension.redGraphite": { "enabledMode": "light" }
}
```

- **Turn off:** change `light` to `none`, then restart MarkEdit.
- **Use `both`:** Red Graphite still applies only in light mode.
- **Change colors:** follow the [color guide](https://github.com/MarkEdit-app/MarkEdit-theming/wiki#customization).

Preview spacing is close to Mixed mode. Some Markdown may still look different. The theme keeps your text, tab width, and editing commands unchanged.

## Compatibility and testing

- **Mixed and Preview:** use [Markdown View Modes 1.14.0](https://github.com/MarkEdit-app/MarkEdit-preview). Enable its inline rendering options for tables and images while editing.
- **Highlights:** use [Text Highlight 1.0.0](https://github.com/MarkEdit-app/MarkEdit-highlight). Red Graphite adds the colors. Preview does not render `==highlights==`.
- **Browser tests:** passed with MarkEdit 1.37.0 CoreEditor in a separate Chrome environment.
- **App checks:** the quote fix and basic mode switching were checked in MarkEdit.
- **Finder check:** the maintainer confirmed Quick Look styles worked on 2026-11-02.
- **Not yet tested:** IME input, styled HTML export, and nested callouts.

Built with AI assistance. Found a problem? Please [open an issue](https://github.com/unsnruu/markedit-red-graphite/issues).

## Development

### Where to edit

- `main.ts`: editor theme setup.
- `src/`: theme colors and styles.
- `src/preview.css`: shared Preview styles.
- `src/quicklook.css`: Quick Look layout changes.
- `scripts/quicklook.mjs`: adapts Preview CSS to Quick Look’s HTML structure.

Edit the source files, then rebuild. Please do not edit `dist/` directly.

Quick Look loads the CSS through MarkEdit’s [shared style loader](https://github.com/MarkEdit-app/MarkEdit/blob/v1.37.0/QuickLookMac/QuickLookConfig.swift).

### Build

Use Node.js 22 and Yarn 1.22.22. Run these commands from the code repository root (`dev/` in the full project):

```sh
corepack enable
yarn install --frozen-lockfile
yarn run check
yarn build
```

- `dist/` contains the editor script, Quick Look CSS, checksums, and license notices.
- The editor script also includes its license notices.
- Git tracks the script and CSS. Checksums and separate notices are generated for releases.
- Building creates files only. It does not install them into MarkEdit.

### Run tests

Install Chrome. Set these environment variables to your local files:

| Variable | File |
| --- | --- |
| `MARKEDIT_HTML` | MarkEdit’s `Contents/Resources/index.html` |
| `MARKEDIT_PREVIEW_JS` | Markdown View Modes 1.14.0 release script |
| `MARKEDIT_HIGHLIGHT_JS` | Text Highlight 1.0.0 release script |

Then run `yarn test`.

- **Editor tests:** editing modes, narrow windows, theme switching, disabling, and edit/undo.
- **Quick Look tests:** CSS loading and removal, Preview styles, source view and toolbar, dark mode, view switching, and narrow/wide windows.
- **README images:** refreshed in `assets/previews/`.
- **Extra screenshots and reports:** saved locally in `test/.generated/`.

Tests use a temporary Chrome profile and a local server. They simulate native file and menu calls. They do not open Finder, run `qlmanage`, or change your MarkEdit files.

Run browser tests locally. CI checks the build and confirms that the tracked `dist/` files match it.

## Contributing and license

- Follow the [MarkEdit contribution guide](https://github.com/MarkEdit-app/extensions#contributing) for registry submissions and updates.
- Put registry entries in `themes/`. Use `theme.schema.json` with `colorScheme`, `colorPatterns`, a versioned script URL, and its SHA-256 checksum.
- Submit changes through a pull request. Extension Manager updates need to be accepted first.
- Code license: [MIT](LICENSE).
- Design sources and dependency notices: [Credits](CREDITS.md).

Red Graphite is an independent project. It is not affiliated with or endorsed by Bear or Shiny Frog. The code license does not grant rights to third-party names or designs.
