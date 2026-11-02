import { chromium } from 'playwright';
import { readFile, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

for (const key of ['MARKEDIT_HTML', 'MARKEDIT_PREVIEW_JS']) {
  assert.ok(process.env[key], `Set ${key}; see README.md. No files are installed into MarkEdit.`);
}
const [app, preview, css, fixture] = await Promise.all([
  process.env.MARKEDIT_HTML, process.env.MARKEDIT_PREVIEW_JS,
  'dist/markedit-theme-red-graphite-quicklook.css', 'test/fixture.md',
].map(path => readFile(path, 'utf8')));
// Mirror QuickLookConfig.swift: lite host, read-only, no editor theme extension.
const config = {
  host: 'quicklook', text: fixture, theme: 'github-light',
  fontFace: { family: 'ui-monospace' }, fontSize: 12, lineHeight: 1.4,
  showLineNumbers: false, showActiveLineIndicator: false, invisiblesBehavior: 'never',
  readOnlyMode: true, typewriterMode: false, focusMode: false, lineWrapping: true,
  suggestWhileTyping: false, smartQuotesEnabled: false, autoCharacterPairs: false,
  indentBehavior: 'never', standardDirectories: {}, runtimeInfo: null, localizable: null,
};
// A temporary shared container models native CSS loading without touching the real one.
const container = await mkdtemp(join(tmpdir(), 'red-graphite-quicklook-'));
const styles = join(container, 'Shared', 'styles');
await mkdir(styles, { recursive: true });
const installed = join(styles, 'markedit-theme-red-graphite-quicklook.css');
await writeFile(installed, css);
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/preview.js') {
      res.setHeader('Content-Type', 'text/javascript'); res.end(preview); return;
    }
    const stylesheet = await readFile(installed, 'utf8').catch(e => {
      if (e.code === 'ENOENT') return ''; throw e;
    });
    res.setHeader('Content-Type', 'text/html');
    res.end(app.replace('"{{EDITOR_CONFIG}}"', JSON.stringify(config))
      .replace('"{{USER_SETTINGS}}"', '{}')
      .replace('</body>', '<script type="module" src="/preview.js"></script></body>')
      + `<style id="quicklook-companion">${stylesheet}</style>`);
  } catch (error) { res.statusCode = 500; res.end(String(error)); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 880, height: 1120 }, colorScheme: 'light' });
const errors = []; page.on('pageerror', error => errors.push(error.message));
const pane = page.locator('body.quicklook > .markdown-body');
const load = async () => {
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.locator('.quicklook-segment').nth(1).click();
  await pane.locator('h1').waitFor();
};
const appearance = () => pane.evaluate(el => {
  const style = getComputedStyle(el);
  const heading = getComputedStyle(el.querySelector('h1'));
  return { background: style.backgroundColor, font: style.fontSize, heading: heading.fontSize };
});
const chromeAppearance = () => page.evaluate(() => {
  const selectors = ['.cm-editor', '.cm-scroller', '.quicklook-toolbar', '.quicklook-segment'];
  return selectors.map(selector => {
    const s = getComputedStyle(document.querySelector(selector));
    return [s.color, s.backgroundColor, s.fontSize, s.padding, s.height];
  });
});
try {
  await load();
  assert.deepEqual(await appearance(), { background: 'rgb(252, 252, 252)', font: '16px', heading: '26px' });
  assert.equal(await pane.locator('a').first().evaluate(el => getComputedStyle(el).color), 'rgb(224, 110, 115)');
  assert.equal(await pane.locator('.markdown-alert').evaluate(el => getComputedStyle(el).borderRadius), '10px');
  assert.equal(await pane.locator('table').evaluate(el => getComputedStyle(el).borderRadius), '8px');
  assert.equal(await pane.locator('.quicklook-content > p').first().evaluate(el => getComputedStyle(el).marginTop), '24px');
  const baselineChrome = await chromeAppearance();
  await page.locator('#quicklook-companion').evaluate(el => el.remove());
  assert.deepEqual(await chromeAppearance(), baselineChrome, 'No changes to source editor or toolbar');
  const defaultLight = await appearance();
  assert.notDeepEqual(defaultLight, { background: 'rgb(252, 252, 252)', font: '16px', heading: '26px' });
  await page.addStyleTag({ content: css });
  await page.emulateMedia({ colorScheme: 'dark' });
  const themedDark = await appearance();
  await page.locator('head style').last().evaluate(el => el.remove());
  assert.deepEqual(await appearance(), themedDark, 'Dark appearance matches the unmodified preview');
  await page.addStyleTag({ content: css });
  await page.emulateMedia({ colorScheme: 'light' });
  assert.equal((await appearance()).background, 'rgb(252, 252, 252)');
  await mkdir('test/.generated', { recursive: true });
  await page.screenshot({ path: 'test/.generated/quicklook.png', fullPage: true });
  for (const width of [420, 1200]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await pane.evaluate(el => el.scrollWidth <= el.clientWidth), true, 'No horizontal pane overflow');
    const h = await pane.locator('h1').boundingBox();
    const toolbar = await page.locator('.quicklook-toolbar').boundingBox();
    assert.ok(h.y >= toolbar.y + toolbar.height, 'Heading clears the toolbar');
    await page.screenshot({ path: `test/.generated/quicklook-${width}.png` });
  }
  await page.locator('.quicklook-segment').nth(0).click();
  assert.equal(await pane.evaluate(el => el.classList.contains('overlay')), false);
  await page.locator('.quicklook-segment').nth(1).click();
  assert.equal((await appearance()).background, 'rgb(252, 252, 252)');
  // Removing the companion and reopening restores the original light preview.
  await rm(installed);
  await load();
  assert.deepEqual(await appearance(), defaultLight);
  assert.deepEqual(errors, []);
  await writeFile('test/.generated/quicklook-verification.json', JSON.stringify({
    host: 'MarkEdit 1.37.0 Quick Look configuration in isolated Chrome',
    preview: '1.14.0', result: 'passed', nativeFinderVerified: false,
    checks: ['shared CSS loading/removal', 'preview palette and typography', 'wrapper spacing',
      'tables and callouts', 'source and toolbar unchanged', 'dark mode baseline equality',
      'light restoration', '420px and 1200px layout', 'source/preview switching', 'no page errors'],
  }, null, 2));
  console.log('PASS: isolated Quick Look companion, light/dark, source/preview, narrow/wide, removal.');
} finally {
  await browser.close(); await new Promise(resolve => server.close(resolve));
  await rm(container, { recursive: true, force: true });
}
