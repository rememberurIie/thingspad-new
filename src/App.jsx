// App.jsx
import { useState, useMemo, useEffect } from 'react';
import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router';
import router from "./routes/Router.js";
import { baselightTheme, basedarkTheme } from "./theme/DefaultColors";
import { ColorModeContext } from "./theme/ColorModeContext.js";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // โหลดค่าที่เคยบันทึกไว้
  useEffect(() => {
    const saved = localStorage.getItem('prefers-dark');
    if (saved !== null) setIsDarkMode(saved === 'true');
  }, []);

  // บันทึกทุกครั้งที่เปลี่ยน
  useEffect(() => {
    localStorage.setItem('prefers-dark', String(isDarkMode));
  }, [isDarkMode]);

  const theme = useMemo(() => (isDarkMode ? basedarkTheme : baselightTheme), [isDarkMode]);
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ColorModeContext.Provider value={{ isDarkMode, toggle: toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
export default App;
