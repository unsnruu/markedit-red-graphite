import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import editorCSS from './editor.css?raw';
import previewCSS from './preview.css?raw';

const attribute = 'data-red-graphite';

function callouts(view: EditorView): DecorationSet {
  const lines = new Map<number, string>();
  for (const range of view.visibleRanges) {
    syntaxTree(view.state).iterate({ ...range, enter(node) {
      if (node.name !== 'Blockquote' || node.node.parent?.name !== 'Document') return;
      const first = view.state.doc.lineAt(node.from);
      if (!/^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i.test(first.text)) return;
      const last = view.state.doc.lineAt(Math.max(node.from, node.to - 1));
      for (let n = first.number; n <= last.number; n++) {
        const line = view.state.doc.line(n);
        lines.set(line.from, `rg-callout${n === first.number ? ' rg-first' : ''}${n === last.number ? ' rg-last' : ''}`);
      }
    }});
  }
  return Decoration.set([...lines].map(([pos, name]) => Decoration.line({ attributes: { class: name } }).range(pos)), true);
}

// Lifecycle belongs to the light theme's CodeMirror compartment, including Preview styles.
export const presentation = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  private style: HTMLStyleElement;
  private observer: MutationObserver;
  private sheets = new Map<ShadowRoot, HTMLStyleElement>();
  private frame = 0;
  private destroyed = false;
  private onScroll = () => this.schedule();
  private previous: string | null;
  constructor(private view: EditorView) {
    this.decorations = callouts(view);
    this.previous = document.documentElement.getAttribute(attribute);
    document.documentElement.setAttribute(attribute, 'light');
    this.style = document.createElement('style');
    this.style.dataset.redGraphiteStyle = '';
    this.style.textContent = editorCSS + '\n' + previewCSS.replaceAll('.markdown-body', 'html[data-red-graphite="light"] .markdown-body');
    document.head.append(this.style);
    this.observer = new MutationObserver(() => this.schedule());
    this.observer.observe(view.dom, { childList: true, subtree: true });
    view.scrollDOM.addEventListener('scroll', this.onScroll, { passive: true });
    this.schedule();
  }
  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) !== syntaxTree(update.state)) {
      this.decorations = callouts(update.view);
    }
    this.schedule();
  }
  private schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => { this.frame = 0; this.tables(); this.calloutBars(); });
  }
  private tables() {
    for (const [root, style] of this.sheets) {
      if (!root.host.isConnected) { style.remove(); this.sheets.delete(root); }
    }
    for (const host of this.view.dom.querySelectorAll('.cm-md-syntaxHiddenTable')) {
      const root = host.shadowRoot;
      if (!root || this.sheets.has(root)) continue;
      const style = document.createElement('style');
      style.dataset.redGraphiteStyle = '';
      style.textContent = previewCSS + '\n.markdown-body { padding:0!important; margin:0!important; font-size:inherit!important }';
      root.append(style);
      this.sheets.set(root, style);
    }
  }
  private calloutBars() {
    this.view.requestMeasure({
      key: this,
      read: () => {
        const boxes = [...this.view.dom.querySelectorAll('.cm-md-syntaxHiddenMode .rg-callout')].map(el => el.getBoundingClientRect());
        return [...this.view.dom.querySelectorAll('.cm-md-syntaxHiddenBlockquoteBar-depth-1')].map(bar => {
          const box = bar.getBoundingClientRect();
          const middle = (box.top + box.bottom) / 2;
          return { bar, hidden: boxes.some(line => middle >= line.top - 1 && middle <= line.bottom + 1 && Math.abs(line.left - box.left) < 32) };
        });
      },
      write: matches => {
        if (this.destroyed) return;
        for (const { bar, hidden } of matches) bar.toggleAttribute('data-rg-callout-bar', hidden);
      },
    });
  }
  destroy() {
    this.destroyed = true;
    this.view.scrollDOM.removeEventListener('scroll', this.onScroll);
    this.view.dom.querySelectorAll('[data-rg-callout-bar]').forEach(el => el.removeAttribute('data-rg-callout-bar'));
    this.observer.disconnect();
    cancelAnimationFrame(this.frame);
    this.style.remove();
    for (const style of this.sheets.values()) style.remove();
    this.sheets.clear();
    if (this.previous === null) document.documentElement.removeAttribute(attribute);
    else document.documentElement.setAttribute(attribute, this.previous);
  }
}, { decorations: plugin => plugin.decorations });
