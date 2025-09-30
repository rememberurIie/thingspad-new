import React, { useMemo, useEffect, useState } from 'react';
import Login from './Login';

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
  title: 'Authentication/Login',
  component: Login,
  argTypes: {
    email: {
      control: 'text',
      description: 'อีเมลที่ใช้สำหรับเข้าสู่ระบบ',
    },
    password: {
      control: 'text',
      description: 'รหัสผ่านที่ใช้สำหรับเข้าสู่ระบบ',
    },
    loading: {
      control: 'boolean',
      description: 'สถานะ loading ขณะกำลังเข้าสู่ระบบ',
    },
    error: {
      control: 'boolean',
      description: 'แสดงข้อความ error เมื่อ login ไม่สำเร็จ',
    },
    darkMode: {
      control: 'boolean',
      defaultValue: false,
      description: 'Toggle dark mode theme.',
    },
    languageToggle: {
      control: 'boolean',
      name: 'ภาษาไทย',
      description: 'เปลี่ยนภาษาไทย/อังกฤษ',
    },
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
                  <div style={{ width: 2000}}>
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
  return <Login {...args} language={language} />;
};

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
  languageToggle: false,
  loading: false,
  error: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงหน้า Login ปกติ (ไม่มี error หรือ loading)',
    },
  },
};

export const Loading = Template.bind({});
Loading.args = {
  darkMode: false,
  languageToggle: false,
  loading: true,
  error: false,
};
Loading.parameters = {
  docs: {
    description: {
      story: 'แสดงสถานะขณะกำลัง login (ปุ่ม Sign In จะเป็น loading)',
    },
  },
};

export const Error = Template.bind({});
Error.args = {
  darkMode: false,
  languageToggle: false,
  loading: false,
  error: true,
};
Error.parameters = {
  docs: {
    description: {
      story: 'แสดงข้อความ error เมื่อ login ไม่สำเร็จ (Invalid user)',
    },
  },
};