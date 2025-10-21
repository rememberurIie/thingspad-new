import React from 'react';
import Dashboard from '../../views/root/ProjectManagement';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';
import ProjectManagementContext from '../../contexts/ProjectManagementContext';

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { uid: 'user123', fullName: 'Mock User', role: 'admin' },
    }),
  },
});

// Mock projects data
const MOCK_PROJECTS = [
  {
    id: 'p1',
    projectId: 'p1',
    projectName: 'ThingsPad',
    isCanInvite: true,
    members: [
      { uid: 'u1', username: 'netipong', fullName: 'Netipong Sanklar' },
      { uid: 'u2', username: 'aroon', fullName: 'Aroon T.' },
      { uid: 'u3', username: 'pim', fullName: 'Pim S.' },
    ],
  },
  {
    id: 'p2',
    projectId: 'p2',
    projectName: 'Analytics',
    isCanInvite: false,
    members: [
      { uid: 'u1', username: 'netipong', fullName: 'Netipong Sanklar' },
      { uid: 'u4', username: 'jane', fullName: 'Jane Doe' },
    ],
  },
];

export default {
  title: 'Root/ProjectManagement',
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
    projects: {
      control: 'object',
      defaultValue: MOCK_PROJECTS,
      description: 'ข้อมูลโปรเจกต์ mock สำหรับ preview ใน Storybook',
    },
    search: {
      control: 'text',
      defaultValue: '',
      description: 'ข้อความค้นหาโปรเจกต์',
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = createTheme({ palette: { mode: ctx.args.darkMode ? 'dark' : 'light' } });
      const lang = ctx.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      // Mock ProjectManagementContext
      const MockContext = React.createContext({
        projects: ctx.args.projects,
        setProjects: () => {},
        search: ctx.args.search,
        setSearch: () => {},
      });

      return (
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ProjectManagementContext.Provider
                value={{
                  projects: ctx.args.projects,
                  setProjects: () => {},
                  search: ctx.args.search,
                  setSearch: () => {},
                }}
              >
                <div style={{ width: '100%', maxWidth: 1200, minHeight: 600 }}>
                  <Story />
                </div>
              </ProjectManagementContext.Provider>
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
  projects: MOCK_PROJECTS,
  search: '',
  darkMode: false,
  languageToggle: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงตัวอย่างหน้ารายการโปรเจกต์ (ProjectManagement) พร้อมข้อมูล mock (`projects`) โดยไม่เชื่อมต่อ API จริง สามารถปรับโหมดมืด/สว่างและเปลี่ยนภาษาได้ผ่าน Storybook controls',
    },
  },
};