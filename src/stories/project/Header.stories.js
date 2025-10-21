import React, { useState, useMemo } from 'react';
import Header from '../../views/project/components/Header';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

const mockProjectId = 'project1';
const mockProjectName = 'Demo Project';

const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { uid: 'user123', fullName: 'Mock User', role: 'admin' }
    }),
  },
});

export default {
  title: 'Project/Header',
  component: Header,
  tags: ['autodocs'],
  argTypes: {
    darkMode: { control: 'boolean', defaultValue: false },
    languageToggle: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปลี่ยนภาษา: ปิด = อังกฤษ, เปิด = ไทย',
    },
    projectId: { control: 'text', defaultValue: mockProjectId },
    projectName: { control: 'text', defaultValue: mockProjectName },
    view: {
      control: { type: 'radio' },
      options: ['chat', 'table', 'kanban'],
      defaultValue: 'chat',
    },
    inviteLink: {
      control: 'boolean',
      defaultValue: false,
      description: 'Invite Link toggle (off = ไม่แสดง, on = แสดง)',
    },
  },
  decorators: [
    (Story, context) => {
      const theme = useMemo(
        () => createTheme({ palette: { mode: context.args.darkMode ? 'dark' : 'light' } }),
        [context.args.darkMode]
      );
      const lang = context.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      return (
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <div style={{ width: 700, maxWidth: '100%' }}>
                <Story />
              </div>
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
};

const Template = (args) => {
  const [view, setView] = useState(args.view);
  return (
    <Header
      projectId={args.projectId}
      projectName={args.projectName}
      view={view}
      setView={setView}
      inviteLink={args.inviteLink}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
  languageToggle: false,
  projectId: mockProjectId,
  projectName: mockProjectName,
  view: 'chat',
  inviteLink: false, // ปิด
};
Default.parameters = {
  docs: {
    description: {
      story: 'Header ของ Project (ค่าปกติ)',
    },
  },
};

export const InviteLinkOn = Template.bind({});
InviteLinkOn.args = {
  darkMode: false,
  languageToggle: false,
  projectId: mockProjectId,
  projectName: mockProjectName,
  view: 'chat',
  inviteLink: true, // เปิด
};
InviteLinkOn.parameters = {
  docs: {
    description: {
      story: 'แสดง Header ของ Project โดยเปิด Invite Link',
    },
  },
};

export const VerifiedUser = Template.bind({});
VerifiedUser.args = {
  darkMode: false,
  languageToggle: false,
  projectId: mockProjectId,
  projectName: mockProjectName,
  view: 'chat',
  inviteLink: false,
};
VerifiedUser.parameters = {
  docs: {
    description: {
      story: 'แสดง Header ของ Project สำหรับ user ที่มี role = verified',
    },
  },
};

VerifiedUser.decorators = [
  (Story, context) => {
    const theme = useMemo(
      () => createTheme({ palette: { mode: context.args.darkMode ? 'dark' : 'light' } }),
      [context.args.darkMode]
    );
    const lang = context.args.languageToggle ? 'th' : 'en';
    if (i18n.language !== lang) i18n.changeLanguage(lang);

    // mockStore สำหรับ user role = verified
    const verifiedStore = configureStore({
      reducer: {
        auth: () => ({
          user: { uid: 'user999', fullName: 'Verified User', role: 'verified' }
        }),
      },
    });

    return (
      <Provider store={verifiedStore}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ width: 700, maxWidth: '100%' }}>
              <Story />
            </div>
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
    );
  },
];
