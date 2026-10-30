"use strict";
const state = require("@codemirror/state");
const highlight = require("@lezer/highlight");
const markeditApi = require("markedit-api");
const view = require("@codemirror/view");
const language = require("@codemirror/language");
const $global$1 = window;
const extractStyleRules = $global$1.__extractStyleRules__ ?? ((theme) => theme.value?.rules);
const extractHighlightSpecs = $global$1.__extractHighlightSpecs__ ?? ((theme) => theme.value?.specs);
function injectStyles(cssText2) {
  const style = document.createElement("style");
  style.textContent = cssText2;
  document.head.appendChild(style);
  return style;
}
function extractTheme(extension) {
  if (extension.length === 0) {
    return [{}, []];
  }
  const themes = flattenThemes(extension);
  const styles = Object.fromEntries(themes.flatMap((theme) => {
    const rules = extractStyleRules(theme)?.join("\n") ?? "";
    return Object.entries(parseCssRules(rules));
  }));
  return [styles, themes.flatMap((theme) => extractHighlightSpecs(theme) ?? [])];
}
function extractTaggedColor(styles, tag, fallback) {
  return styles.find((style) => {
    if (style.tag.toString().includes(tag.toString()) && style.color !== void 0) {
      return true;
    }
    return false;
  })?.color ?? fallback;
}
function findBackground(styles, selector, exclude) {
  for (const [key, value] of Object.entries(styles)) {
    if (key.includes(selector) && (exclude === void 0 || !key.includes(exclude))) {
      const background = value["background"] ?? value["backgroundColor"];
      if (background !== void 0) {
        return background;
      }
    }
  }
  return void 0;
}
function lighterColor(textColor, alpha = 0.6) {
  const rgba = textColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (rgba === null) {
    return void 0;
  }
  const [red, green, blue] = rgba.slice(1, 4).map(Number);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
function isEmptyObject(object) {
  const isValid = (value) => value !== null && typeof value === "object";
  if (!isValid(object)) {
    return true;
  }
  const entries = Object.entries(object);
  const hasValue = (value) => value !== void 0 && value !== null;
  for (const [, value] of entries) {
    if (isValid(value)) {
      if (!isEmptyObject(value)) {
        return false;
      }
    } else if (hasValue(value)) {
      return false;
    }
  }
  return true;
}
function flattenThemes(node) {
  if ($global$1.__flattenThemeExtensions__ !== void 0) {
    return $global$1.__flattenThemeExtensions__(node);
  }
  if (Array.isArray(node)) {
    return node.flatMap(flattenThemes);
  } else if ("extension" in node && node.extension !== node) {
    return flattenThemes(node.extension);
  } else {
    return [node];
  }
}
function parseCssRules(cssText2) {
  const result = {};
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText2);
  for (const rule of sheet.cssRules) {
    const { style, selectorText: selector } = rule;
    const { background, backgroundColor } = style;
    result[selector] = {};
    if (background.length > 0) {
      result[selector].background = background;
    }
    if (backgroundColor.length > 0) {
      result[selector].backgroundColor = backgroundColor;
    }
  }
  return result;
}
const toObject = (value, fallback = {}) => value ?? fallback;
const userSettings = toObject(markeditApi.MarkEdit.userSettings);
const rootValue = settingsForKey("extension.markeditTheming");
const lightColors = isModeEnabled(false) ? toObject(rootValue.lightTheme) : void 0;
const darkColors = isModeEnabled(true) ? toObject(rootValue.darkTheme) : void 0;
function settingsForKey(key) {
  return key === void 0 ? {} : toObject(userSettings[key]);
}
function enabledMode(settings) {
  return settings.enabledMode ?? "both";
}
function isModeEnabled(isDark, mode = enabledMode(rootValue)) {
  return ["both", isDark ? "dark" : "light"].includes(mode);
}
function buildBlendedTheme(isDark, extension, colors2) {
  const mergedColors = mergeColors({
    lhs: colors2,
    rhs: isDark ? darkColors : lightColors
  });
  flattenThemes(extension ?? []).forEach((input) => {
    const typed = input;
    if (typed.value && Array.isArray(typed.value?.rules)) {
      typed.value.rules = typed.value?.rules.filter((rule) => !`${rule}`.includes(".cm-tooltip"));
    }
  });
  const custom = isDark ? createTheme(mergedColors, { dark: true }) : createTheme(mergedColors);
  return {
    // In CodeMirror, extensions added earlier have higher priority
    extensions: [...custom, extension].filter((ext) => ext !== void 0),
    colors: mergedColors
  };
}
function createTheme(colors2, options) {
  const cssStyles = {};
  const tagStyles = [];
  const editorColors = colors2.editor;
  const highlightColors = colors2.highlight;
  if (editorColors?.textColor) {
    cssStyles["&"] ??= {};
    cssStyles["&"].color = editorColors?.textColor;
    cssStyles[".cm-activeLineGutter"] = { backgroundColor: editorColors?.textColor };
  }
  if (editorColors?.backgroundColor) {
    cssStyles["&"] ??= {};
    cssStyles["&"].backgroundColor = editorColors?.backgroundColor;
  }
  if (editorColors?.activeLineBackground) {
    cssStyles[".cm-activeLine"] = { backgroundColor: editorColors?.activeLineBackground };
  }
  if (editorColors?.caretColor) {
    cssStyles[".cm-content"] = { caretColor: editorColors?.caretColor };
    cssStyles[".cm-cursor, .cm-dropCursor"] = { borderLeftColor: editorColors?.caretColor };
  }
  if (editorColors?.selectionBackground) {
    cssStyles["&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection"] = {
      backgroundColor: editorColors?.selectionBackground
    };
  }
  if (editorColors?.matchingBracketBackground) {
    cssStyles["&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket"] = {
      backgroundColor: editorColors?.matchingBracketBackground
    };
  }
  if (editorColors?.gutterText) {
    cssStyles[".cm-gutters"] ??= {};
    cssStyles[".cm-gutters"].color = editorColors?.gutterText;
  }
  if (editorColors?.gutterBackground) {
    cssStyles[".cm-gutters"] ??= {};
    cssStyles[".cm-gutters"].backgroundColor = editorColors?.gutterBackground;
    cssStyles[".cm-gutters"].border = "none";
  }
  if (editorColors?.foldPlaceholderText) {
    cssStyles[".cm-foldPlaceholder"] ??= {};
    cssStyles[".cm-foldPlaceholder"].color = editorColors?.foldPlaceholderText;
  }
  if (editorColors?.foldPlaceholderBackground) {
    cssStyles[".cm-foldPlaceholder"] ??= {};
    cssStyles[".cm-foldPlaceholder"].backgroundColor = editorColors?.foldPlaceholderBackground;
    cssStyles[".cm-foldPlaceholder"].border = "none";
  }
  if (editorColors?.searchMatchBackground) {
    cssStyles[".cm-searchMatch"] = { backgroundColor: editorColors?.searchMatchBackground };
  }
  if (editorColors?.selectionMatchBackground) {
    cssStyles[".cm-selectionMatch"] = { backgroundColor: editorColors?.selectionMatchBackground };
  }
  if (highlightColors?.heading) {
    tagStyles.push({ tag: highlight.tags.heading, color: highlightColors?.heading });
  }
  if (highlightColors?.bold) {
    tagStyles.push({ tag: highlight.tags.strong, color: highlightColors?.bold });
  }
  if (highlightColors?.italic) {
    tagStyles.push({ tag: highlight.tags.emphasis, color: highlightColors?.italic });
  }
  if (highlightColors?.strikethrough) {
    tagStyles.push({ tag: highlight.tags.strikethrough, color: highlightColors?.strikethrough });
  }
  if (highlightColors?.quote) {
    tagStyles.push({ tag: highlight.tags.quote, color: highlightColors?.quote });
  }
  if (highlightColors?.link) {
    tagStyles.push({ tag: [highlight.tags.url, highlight.tags.link], color: highlightColors?.link });
  }
  if (highlightColors?.divider) {
    tagStyles.push({ tag: highlight.tags.contentSeparator, color: highlightColors?.divider });
  }
  if (highlightColors?.comment) {
    tagStyles.push({ tag: highlight.tags.comment, color: highlightColors?.comment });
  }
  if (highlightColors?.meta) {
    tagStyles.push({ tag: highlight.tags.meta, color: highlightColors?.meta });
  }
  if (highlightColors?.keyword) {
    tagStyles.push({ tag: highlight.tags.keyword, color: highlightColors?.keyword });
  }
  if (highlightColors?.atom) {
    tagStyles.push({ tag: [highlight.tags.atom, highlight.tags.bool], color: highlightColors?.atom });
  }
  if (highlightColors?.literal) {
    tagStyles.push({ tag: [highlight.tags.literal, highlight.tags.inserted], color: highlightColors?.literal });
  }
  if (highlightColors?.string) {
    tagStyles.push({ tag: [highlight.tags.string, highlight.tags.deleted], color: highlightColors?.string });
  }
  if (highlightColors?.special) {
    tagStyles.push({ tag: [highlight.tags.regexp, highlight.tags.escape, highlight.tags.special(highlight.tags.string)], color: highlightColors?.special });
  }
  if (highlightColors?.variable) {
    tagStyles.push({ tag: highlight.tags.definition(highlight.tags.variableName), color: highlightColors?.variable });
  }
  if (highlightColors?.local) {
    tagStyles.push({ tag: highlight.tags.local(highlight.tags.variableName), color: highlightColors?.local });
  }
  if (highlightColors?.type) {
    tagStyles.push({ tag: [highlight.tags.typeName, highlight.tags.namespace], color: highlightColors?.type });
  }
  if (highlightColors?.class) {
    tagStyles.push({ tag: highlight.tags.className, color: highlightColors?.class });
  }
  if (highlightColors?.macro) {
    tagStyles.push({ tag: [highlight.tags.special(highlight.tags.variableName), highlight.tags.macroName], color: highlightColors?.macro });
  }
  if (highlightColors?.property) {
    tagStyles.push({ tag: highlight.tags.definition(highlight.tags.propertyName), color: highlightColors?.property });
  }
  if (highlightColors?.label) {
    tagStyles.push({ tag: highlight.tags.labelName, color: highlightColors?.label });
  }
  if (highlightColors?.operator) {
    tagStyles.push({ tag: [highlight.tags.operator, highlight.tags.operatorKeyword], color: highlightColors?.operator });
  }
  if (highlightColors?.constant) {
    tagStyles.push({ tag: [highlight.tags.color, highlight.tags.constant(highlight.tags.name), highlight.tags.standard(highlight.tags.name)], color: highlightColors?.constant });
  }
  if (highlightColors?.instruction) {
    tagStyles.push({ tag: [highlight.tags.separator, highlight.tags.processingInstruction, highlight.tags.definition(highlight.tags.name)], color: highlightColors?.instruction });
  }
  if (highlightColors?.invalid) {
    tagStyles.push({ tag: highlight.tags.invalid, color: highlightColors?.invalid });
  }
  const extensions = [];
  if (Object.keys(cssStyles).length > 0) {
    extensions.push(view.EditorView.theme(cssStyles, options));
  }
  if (tagStyles.length > 0) {
    extensions.push(language.syntaxHighlighting(language.HighlightStyle.define(tagStyles)));
  }
  return extensions;
}
function mergeColors(colors2) {
  return {
    editor: {
      ...colors2.lhs?.editor,
      ...colors2.rhs?.editor
    },
    highlight: {
      ...colors2.lhs?.highlight,
      ...colors2.rhs?.highlight
    },
    allowsFallback: colors2.rhs?.allowsFallback ?? colors2.lhs?.allowsFallback
  };
}
const selectors = {
  selectionBackground: ".cm-selectionBackground",
  primaryText: ".cm-lineNumbers > .cm-activeLineGutter, .cm-tooltip-autocomplete ul li, .cm-tooltip-autocomplete ul li[aria-selected]",
  secondaryText: ".cm-foldGutter, .cm-foldPlaceholder, .cm-visibleSpace, .cm-visibleSpace::before, .cm-visibleLineBreak, .cm-visibleLineBreak::before",
  matchingBracket: ".cm-matchingBracket",
  activeIndicator: ".cm-md-activeIndicator",
  accentColor: ".cm-md-header:not(.tok-meta):not(.cm-md-quote), .cm-md-codeInfo, .cm-completionMatchedText",
  syntaxMarker: ".cm-md-header.tok-meta:not(.cm-md-quote), .cm-md-codeMark, .cm-md-linkMark, .cm-md-listMark, .cm-md-quoteMark, .cm-md-bold.tok-meta, .cm-md-italic.tok-meta, .cm-md-strikethrough.tok-meta",
  boldText: ".cm-md-bold:not(.tok-meta)",
  italicText: ".cm-md-italic:not(.tok-meta)",
  quoteText: ".cm-md-quote:not(.cm-md-quoteMark)",
  dividerColor: ".cm-md-horizontalRule",
  autocomplete: ".cm-tooltip-autocomplete",
  autocompleteHighlight: ".cm-tooltip-autocomplete ul li[aria-selected]"
};
const cssText = `
.cm-activeLineGutter { background: inherit !important }
.cm-searchMatch.cm-searchMatch-selected { outline: inherit !important }
${selectors.primaryText} {}
${selectors.secondaryText} {}
${selectors.matchingBracket} {}
${selectors.activeIndicator} {}
${selectors.accentColor} {}
${selectors.syntaxMarker} {}
${selectors.boldText} {}
${selectors.italicText} {}
${selectors.quoteText} {}
${selectors.dividerColor} {}
${selectors.autocomplete} {}
${selectors.autocompleteHighlight} {}
`;
function overrideThemes(config) {
  const key = config.options?.settingsKey;
  const mode = enabledMode(settingsForKey(key));
  if (config.light !== void 0 && isModeEnabled(false, mode)) {
    $context().customThemes.light = config.light;
  }
  if (config.dark !== void 0 && isModeEnabled(true, mode)) {
    $context().customThemes.dark = config.dark;
  }
  if (typeof markeditApi.MarkEdit.editorView === "object") {
    updateTheme(markeditApi.MarkEdit.editorView);
  }
}
const $global = window;
const $context = () => $global.__markeditTheming__;
const $scheme = matchMedia("(prefers-color-scheme: dark)");
if (typeof $context() !== "object") {
  initContext();
}
function initContext() {
  $global.__markeditTheming__ = {
    styleSheet: injectStyles(cssText),
    configurator: new state.Compartment(),
    customThemes: {},
    lightOriginalRules: {},
    darkOriginalRules: {},
    circularReferencePatched: true
  };
  markeditApi.MarkEdit.addExtension($context().configurator.of([]));
  markeditApi.MarkEdit.onEditorReady((editor) => updateTheme(editor));
  const invokeUpdate = () => setTimeout(() => updateTheme(markeditApi.MarkEdit.editorView), 200);
  $scheme.addEventListener("change", invokeUpdate);
  $context().mainThemeName = $global.config.theme;
  Object.defineProperty($global.config, "theme", {
    get() {
      return $context().mainThemeName;
    },
    set(value) {
      $context().mainThemeName = value;
      invokeUpdate();
    }
  });
}
function updateTheme(editor) {
  const isDark = $scheme.matches;
  const theme = isDark ? $context().customThemes.dark : $context().customThemes.light;
  const { extensions, colors: colors2 } = buildBlendedTheme(isDark, theme?.extension, theme?.colors);
  editor.dispatch({
    effects: $context().configurator.reconfigure(extensions)
  });
  const [cssStyles, tagStyles] = extractTheme(extensions);
  const isDisabled = extensions.length === 0 && isEmptyObject(colors2);
  const shouldFallback = colors2.allowsFallback ?? theme?.extension !== void 0;
  $context().styleSheet.disabled = isDisabled;
  overrideStyles(
    editor,
    isDark,
    isDisabled,
    cssStyles,
    tagStyles,
    colors2,
    shouldFallback
  );
}
function overrideStyles(editor, isDark, isDisabled, cssStyles, tagStyles, colors2, shouldFallback) {
  const activeLine = findBackground(cssStyles, ".cm-activeLine", ".cm-activeLineGutter");
  const selectionBackground = findBackground(cssStyles, selectors.selectionBackground);
  const matchingBracket = findBackground(cssStyles, selectors.matchingBracket);
  const backgroundColor = getComputedStyle(editor.dom).backgroundColor;
  const primaryColor = getComputedStyle(editor.contentDOM).color;
  const secondaryColor = colors2.editor?.visibleSpaceColor ?? lighterColor(primaryColor);
  const fallbackColor = shouldFallback ? primaryColor : void 0;
  const accentColor = extractTaggedColor(tagStyles, highlight.tags.heading, fallbackColor);
  const syntaxMarkerColor = extractTaggedColor(tagStyles, highlight.tags.processingInstruction, fallbackColor);
  const boldTextColor = extractTaggedColor(tagStyles, highlight.tags.strong, fallbackColor);
  const italicTextColor = extractTaggedColor(tagStyles, highlight.tags.emphasis, fallbackColor);
  const quoteTextColor = extractTaggedColor(tagStyles, highlight.tags.quote, fallbackColor);
  const dividerColor = extractTaggedColor(tagStyles, highlight.tags.contentSeparator, fallbackColor);
  const propertyUpdates = [
    [selectors.activeIndicator, activeLine, "background"],
    [selectors.matchingBracket, matchingBracket, "background"],
    [selectors.primaryText, primaryColor, "color"],
    [selectors.secondaryText, secondaryColor, "color"],
    [selectors.accentColor, accentColor, "color"],
    [selectors.syntaxMarker, syntaxMarkerColor, "color"],
    [selectors.boldText, boldTextColor, "color"],
    [selectors.italicText, italicTextColor, "color"],
    [selectors.quoteText, quoteTextColor, "color"],
    [selectors.dividerColor, dividerColor, "color"],
    [selectors.autocomplete, lighterColor(backgroundColor), "background"],
    [selectors.autocomplete, `1px solid ${lighterColor(primaryColor, 0.3)}`, "border"],
    [selectors.autocompleteHighlight, lighterColor(primaryColor, 0.1), "background"]
  ];
  const styles = Array.from(document.querySelectorAll("style"));
  const originalRules = isDark ? $context().darkOriginalRules : $context().lightOriginalRules;
  for (const style of styles) {
    const rules = style.sheet?.cssRules;
    if (rules === void 0) {
      continue;
    }
    for (let index = 0; index < rules.length; ++index) {
      const rule = rules[index];
      const selector = rule.selectorText ?? "";
      if (selector.includes(".cm-focused") && selector.includes(selectors.selectionBackground)) {
        originalRules.selectionBackground ??= rule.cssText;
        if (isDisabled) {
          rule.cssText = originalRules.selectionBackground;
        } else if (selectionBackground !== void 0) {
          rule.style.setProperty("background", selectionBackground, "important");
        }
      }
      if (accentColor !== void 0 && (selector === ".cm-md-header" || selector === ".cm-md-header:not(.cm-md-quote)")) {
        originalRules.markdownHeader ??= rule.cssText;
        if (isDisabled) {
          rule.cssText = originalRules.markdownHeader;
        } else {
          rule.style.removeProperty("color");
        }
      }
      for (const [target, color, property] of propertyUpdates) {
        if (selector !== target) {
          continue;
        }
        if (color === void 0) {
          rule.style.removeProperty(property);
        } else {
          rule.style.setProperty(property, color, "important");
          if (selector === selectors.matchingBracket || selector === selectors.activeIndicator) {
            rule.style.setProperty("box-shadow", "unset", "important");
          }
        }
      }
    }
  }
}
const palette = {
  background: "#fcfcfc",
  text: "#222222",
  heading: "#262626",
  muted: "#525252",
  accent: "#e06e73",
  selection: "#f4d3d5",
  active: "#f7f2f2",
  divider: "#f1f1f1"
};
const colors = {
  editor: {
    textColor: palette.text,
    backgroundColor: palette.background,
    activeLineBackground: palette.active,
    caretColor: palette.accent,
    selectionBackground: palette.selection,
    matchingBracketBackground: palette.selection,
    gutterText: "#a0a0a0",
    gutterBackground: palette.background,
    searchMatchBackground: "#f7e5cb",
    selectionMatchBackground: "#f7e5e6"
  },
  highlight: {
    heading: palette.heading,
    bold: palette.text,
    italic: palette.muted,
    quote: palette.muted,
    link: palette.accent,
    divider: palette.divider,
    keyword: "#a74e5c",
    string: "#687647",
    comment: "#858585",
    literal: "#8d638e",
    instruction: palette.accent
  }
};
const editorCSS = `/* Independently authored MarkEdit styling from the user's visual specification. */
html[data-bear-red-graphite="light"] .cm-editor {
  --brg-paper: #fcfcfc; --brg-ink: #222; --brg-accent: #e06e73;
  background: var(--brg-paper) !important; color: var(--brg-ink) !important;
}
html[data-bear-red-graphite="light"] .cm-editor .cm-scroller {
  background: var(--brg-paper) !important;
  font: 16px/1.68 -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Apple SD Gothic Neo', sans-serif !important;
}
html[data-bear-red-graphite="light"] .cm-editor .cm-content {
  max-width: 800px; margin-inline: auto !important; padding-block: 28px !important;
  font-family: inherit !important; caret-color: var(--brg-accent) !important;
}
html[data-bear-red-graphite="light"] .cm-editor .cm-line { padding-inline: 24px; font-family: inherit; }
html[data-bear-red-graphite="light"] .cm-editor :is(.cm-md-header, .cm-md-header:not(.cm-md-quote)) {
  color: #262626 !important; font-weight: 500 !important; text-shadow: none !important; font-family: inherit !important;
}
html[data-bear-red-graphite="light"] .cm-editor .cm-md-heading1 { font-size: 26px !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-heading2 { font-size: 22px !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-heading3 { font-size: 20px !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-heading4 { font-size: 18px !important; }
html[data-bear-red-graphite="light"] .cm-editor :is(.cm-md-heading5,.cm-md-heading6) { font-size: 16px !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-heading6 { color: #525252 !important; }
html[data-bear-red-graphite="light"] .cm-editor :is(.cm-md-bold) { color: #222 !important; }
html[data-bear-red-graphite="light"] .cm-editor :is(.cm-md-quote,.cm-md-italic) { color: #525252 !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-quote { font-style: normal !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-italic { font-style: italic !important; }
html[data-bear-red-graphite="light"] .cm-editor :is(.tok-link,.cm-md-url,.cm-md-linkMark,.cm-md-listMark,.cm-md-quoteMark,.cm-md-syntaxHiddenLinkButton,.cm-md-syntaxHiddenListBullet) { color: var(--brg-accent) !important; }
html[data-bear-red-graphite="light"] .cm-editor :is(.cm-activeLine,.cm-md-activeIndicator,.cm-activeLineGutter) { background: #f7f2f2 !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-selectionBackground { background: #f4d3d5 !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-cursor { border-left-color: var(--brg-accent) !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-gutters { background:#fcfcfc !important; color:#a0a0a0 !important; border:0; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-monospace { font-family: ui-monospace, Menlo, monospace !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-inlineCode { background:#f3f3f3 !important; color:#424242 !important; border-radius:4px; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-codeBlockWrapper { background:#f3f3f3 !important; border-radius:6px !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-textHighlight { background:#f4d3d5 !important; color:#222 !important; border-radius:3px; }
html[data-bear-red-graphite="light"] .cm-editor input[type="checkbox"] { accent-color:var(--brg-accent) !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-syntaxHiddenTaskCheckboxFrame { margin-inline-end:8px !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-syntaxHiddenImage { border-radius:8px !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-syntaxHiddenTable { width:fit-content !important; max-width:100%; margin-left:24px; padding:0 !important; background:transparent !important; border:0 !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-syntaxHiddenHorizontalRule { border-top:1px solid #f1f1f1 !important; }
html[data-bear-red-graphite="light"] .cm-editor .cm-md-syntaxHiddenBlockquoteBar { background:#e06e73 !important; border-radius:2px; }
html[data-bear-red-graphite="light"] .cm-editor.cm-md-syntaxHiddenMode .brg-callout { position:relative; z-index:1; background:#f7f7f7 !important; border-inline:1px solid #e5e5e5; margin-inline:24px; padding-inline:18px !important; }
html[data-bear-red-graphite="light"] .cm-editor.cm-md-syntaxHiddenMode .brg-first { border-top:1px solid #e5e5e5; border-radius:10px 10px 0 0; padding-top:12px; }
html[data-bear-red-graphite="light"] .cm-editor.cm-md-syntaxHiddenMode .brg-last { border-bottom:1px solid #e5e5e5; border-radius:0 0 10px 10px; padding-bottom:12px; }
html[data-bear-red-graphite="light"] .cm-editor.cm-md-syntaxHiddenMode .brg-first.brg-last { border-radius:10px; }
html[data-bear-red-graphite="light"] .cm-editor.cm-md-syntaxHiddenMode .brg-callout::before { content:''; position:absolute; pointer-events:none; left:-4px; width:4px; top:-1px; bottom:-1px; background:#fcfcfc; }
html[data-bear-red-graphite="light"] :is(.cm-md-syntaxHiddenMermaid,.markdown-body .mermaid) :is(.node rect,.node polygon,.node circle,rect.actor) { fill:#f7f2f2 !important; stroke:#e06e73 !important; }
html[data-bear-red-graphite="light"] :is(.cm-md-syntaxHiddenMermaid,.markdown-body .mermaid) :is(.nodeLabel,.label,text.actor,.messageText) { color:#262626 !important; fill:#262626 !important; }

html[data-bear-red-graphite="light"] .cm-editor [data-brg-callout-bar] { visibility:hidden !important; }
`;
const previewCSS = `.markdown-body { box-sizing:border-box; min-width:0 !important; max-width:800px; margin-inline:auto; padding:32px 48px !important; overflow-wrap:anywhere; color-scheme:light; background:#fcfcfc !important; color:#222 !important; font:16px/1.68 -apple-system,BlinkMacSystemFont,'Helvetica Neue','Apple SD Gothic Neo',sans-serif !important; -webkit-font-smoothing:antialiased; }
.markdown-body :is(h1,h2,h3,h4,h5,h6) { color:#262626 !important; font-weight:500; line-height:1.4; margin:1em 0 .37em; padding-bottom:0; border-bottom:0 !important; text-shadow:none !important; }
.markdown-body h1 { font-size:26px; } .markdown-body h2 { font-size:22px; } .markdown-body h3 { font-size:20px; } .markdown-body h4 { font-size:18px; } .markdown-body :is(h5,h6) { font-size:16px; } .markdown-body h6 { color:#525252 !important; }
.markdown-body :is(p,ul,ol) { margin-block:8px; }
.markdown-body a { color:#e06e73 !important; text-decoration:none; } .markdown-body a:hover { text-decoration:underline; }
.markdown-body li::marker { color:#e06e73; }
.markdown-body input[type="checkbox"] { accent-color:#e06e73; margin-inline-end:8px; }
.markdown-body blockquote { color:#525252; border-left:2px solid #e06e73; padding-left:14px; border-radius:6px; }
.markdown-body pre { background:#f3f3f3 !important; color:#424242; border:1px solid #e5e5e5; border-radius:6px; padding:16px; overflow:auto; }
.markdown-body :is(code,kbd) { background:#f3f3f3; color:#424242; border-radius:4px; font-family:ui-monospace,Menlo,monospace; }
.markdown-body pre code { background:transparent; border-radius:0; }
.markdown-body img { max-width:100%; border-radius:8px; }
.markdown-body table { width:fit-content; max-width:100%; border:1px solid #d8d8d8; border-collapse:separate !important; border-spacing:0; border-radius:8px; overflow:hidden; }
.markdown-body :is(th,td) { padding:6px 13px !important; border:0 !important; border-right:1px solid #d8d8d8 !important; border-bottom:1px solid #d8d8d8 !important; }
.markdown-body th { background:#f0f0f0 !important; }
.markdown-body tr { background:#fcfcfc !important; } .markdown-body tr:nth-child(2n) { background:#f7f7f7 !important; }
.markdown-body tr>:last-child { border-right:0 !important; } .markdown-body table>:last-child>tr:last-child>* { border-bottom:0 !important; }
.markdown-body hr { border:0 !important; height:1px !important; background:#f1f1f1 !important; }
.markdown-body mark { color:#222; background:#f4d3d5; border-radius:3px; padding-inline:2px; }
.markdown-body kbd { border:1px solid #d8d8d8; box-shadow:0 1px 0 #d8d8d8; padding:2px 5px; }
.markdown-body details { border:1px solid #d8d8d8; border-radius:6px; padding:10px 14px; margin-block:12px; }
.markdown-body summary { color:#525252; cursor:pointer; } .markdown-body summary::marker { color:#e06e73; }
.markdown-body .footnotes { color:#525252; font-size:.9em; }
.markdown-body .markdown-alert { border:1px solid #e5e5e5 !important; border-radius:10px !important; background:#f7f7f7 !important; padding:14px 18px !important; margin-block:16px !important; color:#525252 !important; box-shadow:0 2px 5px #00000005; }
.markdown-body ::selection { background:#f4d3d5; }
@media(max-width:540px) { .markdown-body { padding:24px !important; } }
`;
const attribute = "data-bear-red-graphite";
function callouts(view$1) {
  const lines = /* @__PURE__ */ new Map();
  for (const range of view$1.visibleRanges) {
    language.syntaxTree(view$1.state).iterate({ ...range, enter(node) {
      if (node.name !== "Blockquote" || node.node.parent?.name !== "Document") return;
      const first = view$1.state.doc.lineAt(node.from);
      if (!/^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i.test(first.text)) return;
      const last = view$1.state.doc.lineAt(Math.max(node.from, node.to - 1));
      for (let n = first.number; n <= last.number; n++) {
        const line = view$1.state.doc.line(n);
        lines.set(line.from, `brg-callout${n === first.number ? " brg-first" : ""}${n === last.number ? " brg-last" : ""}`);
      }
    } });
  }
  return view.Decoration.set([...lines].map(([pos, name]) => view.Decoration.line({ attributes: { class: name } }).range(pos)), true);
}
const presentation = view.ViewPlugin.fromClass(class {
  constructor(view2) {
    this.view = view2;
    this.decorations = callouts(view2);
    this.previous = document.documentElement.getAttribute(attribute);
    document.documentElement.setAttribute(attribute, "light");
    this.style = document.createElement("style");
    this.style.dataset.bearRedGraphiteStyle = "";
    this.style.textContent = editorCSS + "\n" + previewCSS.replaceAll(".markdown-body", 'html[data-bear-red-graphite="light"] .markdown-body');
    document.head.append(this.style);
    this.observer = new MutationObserver(() => this.schedule());
    this.observer.observe(view2.dom, { childList: true, subtree: true });
    view2.scrollDOM.addEventListener("scroll", this.onScroll, { passive: true });
    this.schedule();
  }
  view;
  decorations;
  style;
  observer;
  sheets = /* @__PURE__ */ new Map();
  frame = 0;
  destroyed = false;
  onScroll = () => this.schedule();
  previous;
  update(update) {
    if (update.docChanged || update.viewportChanged || language.syntaxTree(update.startState) !== language.syntaxTree(update.state)) {
      this.decorations = callouts(update.view);
    }
    this.schedule();
  }
  schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.tables();
      this.calloutBars();
    });
  }
  tables() {
    for (const [root, style] of this.sheets) {
      if (!root.host.isConnected) {
        style.remove();
        this.sheets.delete(root);
      }
    }
    for (const host of this.view.dom.querySelectorAll(".cm-md-syntaxHiddenTable")) {
      const root = host.shadowRoot;
      if (!root || this.sheets.has(root)) continue;
      const style = document.createElement("style");
      style.dataset.bearRedGraphiteStyle = "";
      style.textContent = previewCSS + "\n.markdown-body { padding:0!important; margin:0!important; font-size:inherit!important }";
      root.append(style);
      this.sheets.set(root, style);
    }
  }
  calloutBars() {
    this.view.requestMeasure({
      key: this,
      read: () => {
        const boxes = [...this.view.dom.querySelectorAll(".cm-md-syntaxHiddenMode .brg-callout")].map((el) => el.getBoundingClientRect());
        return [...this.view.dom.querySelectorAll(".cm-md-syntaxHiddenBlockquoteBar-depth-1")].map((bar) => {
          const box = bar.getBoundingClientRect();
          const middle = (box.top + box.bottom) / 2;
          return { bar, hidden: boxes.some((line) => middle >= line.top - 1 && middle <= line.bottom + 1 && Math.abs(line.left - box.left) < 32) };
        });
      },
      write: (matches) => {
        if (this.destroyed) return;
        for (const { bar, hidden } of matches) bar.toggleAttribute("data-brg-callout-bar", hidden);
      }
    });
  }
  destroy() {
    this.destroyed = true;
    this.view.scrollDOM.removeEventListener("scroll", this.onScroll);
    this.view.dom.querySelectorAll("[data-brg-callout-bar]").forEach((el) => el.removeAttribute("data-brg-callout-bar"));
    this.observer.disconnect();
    cancelAnimationFrame(this.frame);
    this.style.remove();
    for (const style of this.sheets.values()) style.remove();
    this.sheets.clear();
    if (this.previous === null) document.documentElement.removeAttribute(attribute);
    else document.documentElement.setAttribute(attribute, this.previous);
  }
}, { decorations: (plugin) => plugin.decorations });
overrideThemes({
  light: {
    colors,
    extension: [view.EditorView.theme({ "&": { backgroundColor: "#fcfcfc", color: "#222222" } }, { dark: false }), presentation]
  },
  options: { settingsKey: "extension.bearRedGraphite" }
});
