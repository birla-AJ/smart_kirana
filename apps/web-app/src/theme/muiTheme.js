import { createTheme } from '@mui/material/styles';

// Nimad Kirana brand theme — derived from the approved logo & splash design
export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#065f46',
      dark: '#064e3b',
      light: '#10b981',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f97316',
      dark: '#ea580c',
      light: '#fb923c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f2419',
      secondary: '#5b6b63',
    },
    divider: '#e5e7eb',
    success: { main: '#16a34a' },
    warning: { main: '#f59e0b' },
    error: { main: '#dc2626' },
    info: { main: '#0ea5e9' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: [
      'Poppins',
      'Inter',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingLeft: 20, paddingRight: 20 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none', borderBottom: '1px solid #e5e7eb' },
      },
    },
  },
});

export default muiTheme;
