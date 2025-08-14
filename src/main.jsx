import React, { Suspense, useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { Provider } from 'react-redux';
import { store } from './session/store';

import CircularProgress from '@mui/material/CircularProgress';

// Add these imports for theme
import { CssBaseline, ThemeProvider } from '@mui/material';
import { baselightTheme, basedarkTheme } from "./theme/DefaultColors";
import { ColorModeContext } from "./theme/ColorModeContext";

// Custom wrapper to handle theme and fallback
function ThemedApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('prefers-dark');
    if (saved !== null) setIsDarkMode(saved === 'true');
  }, []);

  const theme = useMemo(() => (isDarkMode ? basedarkTheme : baselightTheme), [isDarkMode]);
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      localStorage.setItem('prefers-dark', !prev);
      return !prev;
    });
  };

  return (
    <ColorModeContext.Provider value={{ isDarkMode, toggle: toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={
          <div style={{
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
              <CircularProgress size="30px" color={theme.palette.grey[500]}/>
          </div>
        }>
          <App />
        </Suspense>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemedApp />
  </Provider>
);
