import React, { useMemo, useEffect, useState } from 'react';
import Error from '../../views/authentication/Error';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { baselightTheme, basedarkTheme } from '../../theme/DefaultColors';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

import { MemoryRouter } from 'react-router-dom';
import { ColorModeContext } from 'src/theme/ColorModeContext';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// สร้าง store mock หรือ import store จริง
const store = configureStore({ reducer: {} }); // ใส่ reducer จริงของคุณแทน {} ถ้ามี


export default {
  title: 'Error/Error',
  component: Error,
  argTypes: {
  },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
decorators: [
    (Story, context) => {
      const [isDarkMode, setIsDarkMode] = useState(context.args.darkMode);

      // Sync darkMode arg to state
      useEffect(() => {
        setIsDarkMode(context.args.darkMode);
      }, [context.args.darkMode]);

      const theme = useMemo(
        () => (isDarkMode ? basedarkTheme : baselightTheme),
        [isDarkMode]
      );

      const lang = context.args.languageToggle ? 'th' : 'en';
      useEffect(() => {
        if (i18n.language !== lang) {
          i18n.changeLanguage(lang);
        }
      }, [lang]);

      const colorModeValue = {
        isDarkMode,
        toggle: () => setIsDarkMode((prev) => !prev),
      };

      return (
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <MemoryRouter>
                <ColorModeContext.Provider value={colorModeValue}>
                  <div style={{ width: 1500, height: 500 }}>
                    <Story />
                  </div>
                </ColorModeContext.Provider>
              </MemoryRouter>
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
};

const Template = ({ languageToggle, ...args }) => {
  const language = languageToggle ? 'th' : 'en';
  return <Error {...args} language={language} />;
};

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
};