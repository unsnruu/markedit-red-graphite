import { chromium } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
const required = ['MARKEDIT_HTML', 'MARKEDIT_PREVIEW_JS', 'MARKEDIT_HIGHLIGHT_JS'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) throw new Error(`Set ${missing.join(', ')} to local MarkEdit / extension resources. See dev/README.md. The test never installs files into MarkEdit.`);
const appPath = process.env.MARKEDIT_HTML;
const previewPath = process.env.MARKEDIT_PREVIEW_JS;
const highlightPath = process.env.MARKEDIT_HIGHLIGHT_JS;
const [app, preview, highlight, theme, fixture] = await Promise.all([appPath,previewPath,highlightPath,'dist/markedit-theme-red-graphite.js','test/fixture.md'].map(p=>readFile(p,'utf8')));
const config = { host:'mainApp', text:fixture, theme:'github', fontFace:{family:'Menlo'}, fontSize:17, showLineNumbers:false, showActiveLineIndicator:true, invisiblesBehavior:'never',readOnlyMode:false,typewriterMode:false,focusMode:false,lineWrapping:true,lineHeight:1.5,suggestWhileTyping:false,smartQuotesEnabled:false,autoCharacterPairs:true,indentBehavior:'paragraph',standardDirectories:{},runtimeInfo:{appVersion:'1.37.0',osVersion:'26.0'},localizable:{previewButtonTitle:'Preview',closeButtonTitle:'Close',cmdClickToFollow:'Follow',cmdClickToToggleTodo:'Toggle'}};
function html(disabled=false) {
 const settings = {'extension.redGraphite':{enabledMode:disabled?'none':'light'},'extension.markeditPreview':{inlineRendering:['table','image'],imageHoverPreview:false}};
 const prelude = `window.testMenus=[]; MarkEdit.addMainMenuItem=item=>window.testMenus.push(item); MarkEdit.getFileInfo=async()=>({filePath:'/test.md'}); MarkEdit.addSettingsPane=()=>{};`;
 return app.replace('"{{EDITOR_CONFIG}}"',JSON.stringify(config)).replace('"{{USER_SETTINGS}}"',JSON.stringify(settings)).replace('</body>',`<script type="module" src="/extensions.js"></script></body>`);
}
const server = createServer((req,res)=> { if(req.url === '/extensions.js') { res.setHeader('Content-Type','text/javascript'); res.end(`window.testMenus=[]; MarkEdit.addMainMenuItem=item=>window.testMenus.push(item); MarkEdit.getFileInfo=async()=>({filePath:'/test.md'}); MarkEdit.addSettingsPane=()=>{};\n(()=>{${preview}\n})();\n(()=>{${highlight}\n})();\n(()=>{${theme}\n})();`); } else {res.setHeader('Content-Type','text/html'); res.end(html(req.url.includes('disabled')));} });
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1100,height:1100},colorScheme:'light'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error') console.log('console:',m.text());});
try {
 console.log('browser launched'); await page.goto(`http://127.0.0.1:${server.address().port}`, {timeout:20000}); console.log('page loaded', errors);
 await page.waitForFunction(()=>window.MarkEdit?.editorView && document.documentElement.hasAttribute('data-red-graphite'),{},{timeout:15000});
 await mkdir('../assets/previews',{recursive:true});
 const mode = async title => { await page.evaluate(title=>testMenus[0].children.find(x=>x.title===title).action(),title); };
 const text = () => page.evaluate(()=>MarkEdit.editorView.state.doc.toString());
 const metrics = () => page.evaluate(()=>({
   background:getComputedStyle(MarkEdit.editorView.dom).backgroundColor,
   highlight:getComputedStyle(document.querySelector('.cm-md-textHighlight')).backgroundColor,
   font:getComputedStyle(MarkEdit.editorView.scrollDOM).fontSize,
   tab:MarkEdit.editorView.state.facet(require('@codemirror/state').EditorState.tabSize),
 }));
 assert.equal(await text(), fixture);
 assert.deepEqual(await metrics(),{background:'rgb(252, 252, 252)',highlight:'rgb(244, 211, 213)',font:'16px',tab:4});
 await page.screenshot({path:'../assets/previews/editor.png',fullPage:true});
 await mode('Mixed (Syntax Hidden)');
 await page.waitForFunction(()=>document.querySelector('.cm-md-syntaxHiddenTable')?.shadowRoot?.querySelector('table'));
 await page.waitForFunction(()=>document.querySelector('.cm-md-syntaxHiddenTable')?.shadowRoot?.querySelector('[data-red-graphite-style]'));
 assert.equal(await page.locator('.rg-callout').count(),3);
 assert.equal(await page.locator('.cm-md-syntaxHiddenTaskCheckboxFrame').first().evaluate(el=>getComputedStyle(el).marginInlineEnd),'8px');
 assert.equal(await page.locator('.rg-first').evaluate(el=>getComputedStyle(el).borderTopLeftRadius),'10px');
 await page.waitForFunction(()=>document.querySelector('[data-rg-callout-bar]'));
 assert.equal(await page.locator('[data-rg-callout-bar]').evaluateAll(els=>els.every(el=>getComputedStyle(el).visibility==='hidden')),true);
 assert.equal(await page.locator('.cm-md-syntaxHiddenBlockquoteBar:not([data-rg-callout-bar])').first().evaluate(el=>getComputedStyle(el).visibility),'visible');
 await page.screenshot({path:'../assets/previews/mixed.png',fullPage:true});
 await mode('Preview (Overlay)');
 await page.waitForSelector('body > .markdown-body h1');
 assert.equal(await page.locator('body > .markdown-body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(252, 252, 252)');
 assert.equal(await page.locator('body > .markdown-body .markdown-alert').evaluate(el=>getComputedStyle(el).borderRadius),'10px');
 await page.screenshot({path:'../assets/previews/preview.png',fullPage:true});
 await page.setViewportSize({width:420,height:900});
 assert.equal(await page.locator('body > .markdown-body').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
 await page.screenshot({path:'../assets/previews/preview-narrow.png',fullPage:true});
 await page.setViewportSize({width:1100,height:1100});
 await mode('Mixed (Syntax Hidden)');
 await page.emulateMedia({colorScheme:'dark'});
 await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-red-graphite'));
 assert.equal(await page.locator('style[data-red-graphite-style]').count(),0);
 assert.equal(await page.locator('.rg-callout').count(),0);
 assert.equal(await page.locator('[data-rg-callout-bar]').count(),0);
 assert.equal(await text(),fixture);
 await page.emulateMedia({colorScheme:'light'});
 await page.waitForFunction(()=>document.documentElement.hasAttribute('data-red-graphite'));
 assert.equal(await page.locator('head style[data-red-graphite-style]').count(),1);
 await mode('Markdown Source');
 await page.evaluate(()=>MarkEdit.editorView.dispatch({changes:{from:0,insert:'한글 편집 테스트\n'}}));
 assert.equal(await text(),'한글 편집 테스트\n'+fixture);
 await page.evaluate(()=>require('@codemirror/commands').undo(MarkEdit.editorView));
 assert.equal(await text(),fixture);
 await page.goto(`http://127.0.0.1:${server.address().port}/disabled`);
 await page.waitForFunction(()=>window.MarkEdit?.editorView);
 assert.equal(await page.locator('html[data-red-graphite]').count(),0);
 assert.equal(await page.locator('style[data-red-graphite-style]').count(),0);
 assert.equal(await text(),fixture);
 assert.deepEqual(errors,[]);
 await writeFile('../assets/previews/verification.json',JSON.stringify({checkedAt:new Date().toISOString(),host:'MarkEdit 1.37.0 CoreEditor in isolated Chrome',preview:'1.14.0',highlight:'1.0.0',checks:['source mode palette and typography','Mixed table shadow root styling','checkbox spacing','callout container','Preview styling','420px narrow layout','dark mode cleanup','light mode restoration without duplicate style tags','edit and undo preserve original','disabled setting','no page exceptions'],result:'passed'},null,2));
 console.log('PASS: Source, Mixed, Preview, narrow layout, dark/light lifecycle, editing/undo and disabled settings.');

} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
