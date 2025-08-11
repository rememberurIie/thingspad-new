// App.jsx
import { useState, useMemo, useEffect } from 'react';
import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router';
import router from "./routes/Router.js";
import { baselightTheme, basedarkTheme } from "./theme/DefaultColors";
import { ColorModeContext } from "./theme/ColorModeContext.js";

// 1) โหลด i18n config
import { I18nextProvider } from 'react-i18next';
import i18n from './language/i18n';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // โหลด dark mode จาก localStorage
  useEffect(() => {
    const saved = localStorage.getItem('prefers-dark');
    if (saved !== null) setIsDarkMode(saved === 'true');
  }, []);

  // บันทึก dark mode ทุกครั้งที่เปลี่ยน
  useEffect(() => {
    localStorage.setItem('prefers-dark', String(isDarkMode));
  }, [isDarkMode]);

  const theme = useMemo(() => (isDarkMode ? basedarkTheme : baselightTheme), [isDarkMode]);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    // 2) ห่อด้วย I18nextProvider
    <I18nextProvider i18n={i18n}>
      <ColorModeContext.Provider value={{ isDarkMode, toggle: toggleDarkMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {/* router */}
          <RouterProvider router={router} />

        </ThemeProvider>
      </ColorModeContext.Provider>
    </I18nextProvider>
  );
}

export default App;
