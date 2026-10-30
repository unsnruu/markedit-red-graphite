import { overrideThemes } from 'markedit-theming';
import { EditorView } from '@codemirror/view';
import { colors } from './src/palette';
import { presentation } from './src/presentation';

// Only the light configuration is overridden. The user's dark theme stays available.
overrideThemes({
  light: {
    colors,
    extension: [EditorView.theme({ '&': { backgroundColor: '#fcfcfc', color: '#222222' } }, { dark: false }), presentation],
  },
  options: { settingsKey: 'extension.redGraphite' },
});
