import React from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../language/i18n';
import ProjectListContext from 'src/contexts/ProjectListContext';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: {
        uid: 'u1',
        fullName: 'Netipong Sanklar',
        username: 'netipong',
        email: 'netipong@example.com',
        role: 'root', // ต้องมี role: 'root' เพื่อโชว์เมนู root
      },
    }),
  },
});

// ตัวอย่างเมนู mock
import {
  IconLayoutDashboard,
  IconAlignBoxLeftBottom,
  IconTable,
  IconUserEdit,
  IconTableOptions
} from '@tabler/icons-react';

const MOCK_MENU = [
  {
    navlabel: true,
    subheader: 'menu.root',
  },
  {
    id: 'user-management',
    title: 'menu.user_management',
    icon: IconUserEdit,
    href: '/user_management',
  },
  {
    id: 'project-management',
    title: 'menu.project_management',
    icon: IconTableOptions,
    href: '/project_management',
  },
  {
    navlabel: true,
    subheader: 'menu.home',
  },
  {
    id: 'my-task',
    title: 'menu.myTask',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    navlabel: true,
    subheader: 'menu.chats',
  },
  {
    id: 'direct-chat',
    title: 'menu.directChat',
    icon: IconAlignBoxLeftBottom,
    href: '/chat/dm',
  },
  {
    id: 'group-chat',
    title: 'menu.groupChat',
    icon: IconTable,
    href: '/chat/group',
  }
];

export default {
  title: 'Layouts/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  argTypes: {
    darkMode: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปิด/ปิดโหมดมืดของ UI',
    },
    languageToggle: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปิด/สลับภาษา UI ระหว่างภาษาอังกฤษและภาษาไทย',
    },
    isSidebarMinimized: {
      control: 'boolean',
      defaultValue: false,
      description: 'สถานะ sidebar แบบ minimized',
    },
    isSidebarOpen: {
      control: 'boolean',
      defaultValue: true,
      description: 'สถานะ sidebar แบบเปิด (desktop)',
    },
    isMobileSidebarOpen: {
      control: 'boolean',
      defaultValue: false,
      description: 'สถานะ sidebar แบบเปิด (mobile)',
    },
    onSidebarClose: {
      action: 'close',
      description: 'ฟังก์ชันปิด sidebar (mobile)',
    },
    projects: {
      control: 'object',
      defaultValue: [],
      description: 'ข้อมูลโครงการ mock สำหรับ Sidebar',
    },
    search: {
      control: 'text',
      defaultValue: '',
      description: 'ข้อความค้นหาโครงการ',
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = createTheme({ palette: { mode: ctx.args.darkMode ? 'dark' : 'light' } });
      const lang = ctx.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      return (
        <Provider store={mockStore}>
          <MemoryRouter>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <I18nextProvider i18n={i18n}>
                <ProjectListContext.Provider
                  value={{
                    projects: ctx.args.projects || [],
                    setProjects: () => {},
                    search: ctx.args.search || '',
                    setSearch: () => {},
                  }}
                >
                  <div style={{ width: '100%', maxWidth: 1200, height: '70vh', padding: 16, boxSizing: 'border-box' }}>
                    <Story />
                  </div>
                </ProjectListContext.Provider>
              </I18nextProvider>
            </ThemeProvider>
          </MemoryRouter>
        </Provider>
      );
    },
  ],
};

const Template = (args) => <Sidebar {...args} menuItems={MOCK_MENU} />;

export const Desktop = Template.bind({});
Desktop.args = {
  isSidebarMinimized: false,
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
  darkMode: false,
};
Desktop.parameters = {
  docs: {
    description: {
      story: 'Sidebar สำหรับ desktop สามารถปรับ minimized และ dark mode ได้',
    },
  },
};

export const Minimized = Template.bind({});
Minimized.args = {
  isSidebarMinimized: true,
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
  darkMode: false,
};
Minimized.parameters = {
  docs: {
    description: {
      story: 'Sidebar สำหรับ desktop ในสถานะ minimized',
    },
  },
};

export const Mobile = Template.bind({});
Mobile.args = {
  isSidebarMinimized: false,
  isSidebarOpen: false,
  isMobileSidebarOpen: true,
  darkMode: false,
};
Mobile.parameters = {
  docs: {
    description: {
      story: 'Sidebar สำหรับ mobile สามารถปิดได้ผ่าน action',
    },
  },
};

export const WithProjects = Template.bind({});
WithProjects.args = {
  isSidebarMinimized: false,
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
  darkMode: false,
  projects: [
    {
      id: 'project-1',
      name: 'Project A',
      description: 'Description of Project A',
    },
    {
      id: 'project-2',
      name: 'Project B',
      description: 'Description of Project B',
    },
  ],
};
WithProjects.parameters = {
  docs: {
    description: {
      story: 'Sidebar สำหรับ desktop พร้อมกับข้อมูลโครงการ',
    },
  },
};