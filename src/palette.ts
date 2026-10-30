export const palette = {
  background: '#fcfcfc', text: '#222222', heading: '#262626', muted: '#525252',
  accent: '#e06e73', selection: '#f4d3d5', active: '#f7f2f2',
  code: '#f3f3f3', border: '#d8d8d8', divider: '#f1f1f1',
};
export const colors = {
  editor: {
    textColor: palette.text, backgroundColor: palette.background,
    activeLineBackground: palette.active, caretColor: palette.accent,
    selectionBackground: palette.selection, matchingBracketBackground: palette.selection,
    gutterText: '#a0a0a0', gutterBackground: palette.background,
    searchMatchBackground: '#f7e5cb', selectionMatchBackground: '#f7e5e6',
  },
  highlight: {
    heading: palette.heading, bold: palette.text, italic: palette.muted,
    quote: palette.muted, link: palette.accent, divider: palette.divider,
    keyword: '#a74e5c', string: '#687647', comment: '#858585',
    literal: '#8d638e', instruction: palette.accent,
  },
};
