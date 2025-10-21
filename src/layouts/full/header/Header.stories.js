import React from 'react';
import Header from './Header';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../language/i18n';
import { ColorModeContext } from '../../../theme/ColorModeContext';
import { MemoryRouter } from 'react-router-dom';

const MOCK_USER = {
  fullName: 'Netipong Sanklar',
  username: 'netipong',
  userId: 'u1',
  email: 'netipong@example.com',
};

const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { ...MOCK_USER },
    }),
  },
});

export default {
  title: 'Layouts/Header',
  component: Header,
  tags: ['autodocs'],
  argTypes: {
    darkMode: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปิด/ปิดโหมดมืดของ UI เพื่อดูตัวอย่างการแสดงผลในธีมสีเข้มและสีสว่าง',
    },
    languageToggle: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปิด/สลับภาษา UI ระหว่างภาษาอังกฤษและภาษาไทย',
    },
    fullName: {
      control: 'text',
      defaultValue: MOCK_USER.fullName,
      description: 'ชื่อเต็มของผู้ใช้',
    },
    username: {
      control: 'text',
      defaultValue: MOCK_USER.username,
      description: 'ชื่อผู้ใช้',
    },
    userId: {
      control: 'text',
      defaultValue: MOCK_USER.userId,
      description: 'รหัสผู้ใช้',
    },
    email: {
      control: 'text',
      defaultValue: MOCK_USER.email,
      description: 'อีเมลผู้ใช้',
    },
    isSidebarMinimized: {
      control: 'boolean',
      defaultValue: false,
      description: 'สถานะ sidebar แบบ minimized',
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = createTheme({ palette: { mode: ctx.args.darkMode ? 'dark' : 'light' } });
      const lang = ctx.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      const colorModeValue = {
        isDarkMode: ctx.args.darkMode,
        toggle: () => {},
      };

      return (
        <Provider store={mockStore}>
          <MemoryRouter>
            <ColorModeContext.Provider value={colorModeValue}>
              <I18nextProvider i18n={i18n}>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <div style={{ width: '100%', maxWidth: 1200 }}>
                    <Story />
                  </div>
                </ThemeProvider>
              </I18nextProvider>
            </ColorModeContext.Provider>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
};

const Template = (args) => (
  <Header
    toggleSidebar={() => {}}
    toggleMobileSidebar={() => {}}
    toggleSidebarMinimized={() => {}}
    isSidebarMinimized={args.isSidebarMinimized}
    fullName={args.fullName}
    username={args.username}
    userId={args.userId}
    email={args.email}
  />
);

export const Default = Template.bind({});
Default.args = {
  ...MOCK_USER,
  isSidebarMinimized: false,
  darkMode: false,
  languageToggle: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงตัวอย่าง Header พร้อมข้อมูลผู้ใช้ mock โดยไม่เชื่อมต่อ API จริง สามารถปรับโหมดมืด/สว่างและเปลี่ยนภาษาได้ผ่าน Storybook controls',
    },
  },
};