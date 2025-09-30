import React, { useMemo, useEffect, useState } from 'react';
import Register from './Register';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { baselightTheme, basedarkTheme } from '../../theme/DefaultColors';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

import { MemoryRouter } from 'react-router-dom';
import { ColorModeContext } from 'src/theme/ColorModeContext';

export default {
  title: 'Authentication/Register',
  component: Register,
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'สถานะ loading ขณะกำลังสมัครสมาชิก',
    },
    error: {
      control: 'boolean', // ใช้เป็น boolean
      description: 'แสดงข้อความ error เมื่อสมัครสมาชิกไม่สำเร็จ',
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
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <MemoryRouter>
              <ColorModeContext.Provider value={colorModeValue}>
                <div style={{ width: 2000, maxWidth: '100%' }}>
                  <Story />
                </div>
              </ColorModeContext.Provider>
            </MemoryRouter>
          </ThemeProvider>
        </I18nextProvider>
      );
    },
  ],
};

const Template = (args) => <Register {...args} />;

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
  languageToggle: false,
  loading: false,
  error: '',
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงหน้า Register ปกติ (ไม่มี error หรือ loading)',
    },
  },
};

export const Loading = Template.bind({});
Loading.args = {
  darkMode: false,
  languageToggle: false,
  loading: true,
  error: '',
};
Loading.parameters = {
  docs: {
    description: {
      story: 'แสดงสถานะขณะกำลังสมัครสมาชิก (ปุ่มสมัครจะเป็น loading)',
    },
  },
};

export const Error = Template.bind({});
Error.args = {
  darkMode: false,
  languageToggle: false,
  loading: false,
  error: true, // เปิด error
};
Error.parameters = {
  docs: {
    description: {
      story: 'แสดงข้อความ error เมื่อสมัครสมาชิกไม่สำเร็จ',
    },
  },
};