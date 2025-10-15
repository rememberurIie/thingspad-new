import React, { useMemo } from 'react';
import GroupMessageList from '../../views/chat/group/components/GroupMessageList';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { GroupMessageListContext } from '../../contexts/GroupMessageListContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

// สร้าง mock store
const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { uid: 'user123', fullName: 'Mock User' }
    }),
  },
});

const mockUserId = 'user123';

const MOCK_GROUPS = [
  {
    id: 'group1',
    groupId: 'group1',
    groupName: 'Dev Team',
    latestMessage: {
      senderId: mockUserId,
      text: 'สวัสดี Dev!',
      createdAt: { _seconds: Math.floor(Date.now() / 1000) - 3600 },
    },
  },
  {
    id: 'group2',
    groupId: 'group2',
    groupName: 'Marketing',
    latestMessage: {
      senderId: 'user456',
      text: 'ประชุมบ่ายนี้',
      createdAt: { _seconds: Math.floor(Date.now() / 1000) - 1800 },
    },
  },
];

export default {
  title: 'GroupChat/GroupMessageList',
  component: GroupMessageList,
   tags: ['autodocs'],
  argTypes: {
    darkMode: { control: 'boolean', defaultValue: false },
    languageToggle: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปลี่ยนภาษา: ปิด = อังกฤษ, เปิด = ไทย',
    },
    groups: { control: 'object', defaultValue: MOCK_GROUPS },
  },
  decorators: [
    (Story, context) => {
      const theme = useMemo(
        () => createTheme({ palette: { mode: context.args.darkMode ? 'dark' : 'light' } }),
        [context.args.darkMode]
      );
      const lang = context.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      const mockContextValue = {
        groups: context.args.groups,
        setGroups: () => {},
        selectedGroup: context.args.groups?.[0] || null,
        setSelectedGroup: () => {},
        loading: false,
      };
      return (
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <GroupMessageListContext.Provider value={mockContextValue}>
                <div style={{ width: 350, maxWidth: '100%' }}>
                  <Story />
                </div>
              </GroupMessageListContext.Provider>
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
};

const Template = (args) => (
  <GroupMessageList userId={mockUserId} onSelect={group => {}} />
);

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
  languageToggle: false,
  groups: MOCK_GROUPS,
};
Default.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างที่เลือกกลุ่มปกติ (mock message)',
    },
  },
};

export const NoGroup = Template.bind({});
NoGroup.args = {
  darkMode: false,
  languageToggle: false,
  groups: [],
  mockUserId: '',
};
NoGroup.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างเมื่อยังไม่มีกลุ่ม',
    },
  },
};