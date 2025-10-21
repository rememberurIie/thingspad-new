import React from 'react';
import Dashboard from '../../views/root/UserManagement';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';
import UserManagementContext from '../../contexts/UserManagementContext';

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { uid: 'user123', fullName: 'Mock User', role: 'admin' },
    }),
  },
});

// Mock users data
const MOCK_USERS = [
  {
    uid: 'u1',
    fullName: 'Netipong Sanklar',
    username: 'netipong',
    email: 'netipong@example.com',
    role: 'root',
  },
  {
    uid: 'u2',
    fullName: 'Aroon T.',
    username: 'aroon',
    email: 'aroon@example.com',
    role: 'admin',
  },
  {
    uid: 'u3',
    fullName: 'Pim S.',
    username: 'pim',
    email: 'pim@example.com',
    role: 'verified',
  },
  {
    uid: 'u4',
    fullName: 'Jane Doe',
    username: 'jane',
    email: 'jane@example.com',
    role: 'unverified',
  },
];

export default {
  title: 'Root/UserManagement',
  component: Dashboard,
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
    users: {
      control: 'object',
      defaultValue: MOCK_USERS,
      description: 'ข้อมูลผู้ใช้ mock สำหรับ preview ใน Storybook',
    },
    search: {
      control: 'text',
      defaultValue: '',
      description: 'ข้อความค้นหาผู้ใช้',
    },
    roleFilter: {
      control: 'object',
      defaultValue: [],
      description: 'ตัวกรอง role สำหรับ preview',
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = createTheme({ palette: { mode: ctx.args.darkMode ? 'dark' : 'light' } });
      const lang = ctx.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      return (
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <UserManagementContext.Provider
                value={{
                  users: ctx.args.users,
                  setUsers: () => {},
                  search: ctx.args.search,
                  setSearch: () => {},
                  roleFilter: ctx.args.roleFilter,
                  setRoleFilter: () => {},
                  filteredUsers: ctx.args.users.filter(u =>
                    (ctx.args.roleFilter.length === 0 || ctx.args.roleFilter.includes(u.role)) &&
                    (u.fullName?.toLowerCase().includes(ctx.args.search.toLowerCase()) ||
                      u.email?.toLowerCase().includes(ctx.args.search.toLowerCase()) ||
                      u.username?.toLowerCase().includes(ctx.args.search.toLowerCase()))
                  ),
                }}
              >
                <div style={{ width: '100%', maxWidth: 1200, minHeight: 600 }}>
                  <Story />
                </div>
              </UserManagementContext.Provider>
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
};

const Template = (args) => <Dashboard />;

export const Default = Template.bind({});
Default.args = {
  users: MOCK_USERS,
  search: '',
  roleFilter: [],
  darkMode: false,
  languageToggle: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงตัวอย่างหน้าจัดการผู้ใช้ (UserManagement) พร้อมข้อมูล mock (`users`) โดยไม่เชื่อมต่อ API จริง สามารถปรับโหมดมืด/สว่างและเปลี่ยนภาษาได้ผ่าน Storybook controls',
    },
  },
};