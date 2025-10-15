import React, { useMemo } from 'react';
import ChatMember from '../../views/chat/group/components/GroupMember';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { GroupMessageListContext } from '../../contexts/GroupMessageListContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

const mockCurrentUserId = 'user123';
const mockSelectedGroup = 'group1';

const MOCK_MEMBERS = [
  {
    id: 'user123',
    fullName: 'John Doe',
    username: 'john.doe',
    avatarUrl: '',
    email: 'john@example.com',
    role: 'member',
  },
  {
    id: 'user456',
    fullName: 'Jane Smith',
    username: 'jane.smith',
    avatarUrl: '',
    email: 'jane@example.com',
    role: 'admin',
  },
  {
    id: 'user789',
    fullName: 'Bob Brown',
    username: 'bob.brown',
    avatarUrl: '',
    email: 'bob@example.com',
    role: 'member',
  },
];

export default {
  title: 'GroupChat/GroupMember',
  component: ChatMember,
  tags: ['autodocs'],
  argTypes: {
    darkMode: { control: 'boolean', defaultValue: false },
    languageToggle: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปลี่ยนภาษา: ปิด = อังกฤษ, เปิด = ไทย',
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

      const mockContextValue = {
        membersByGroupId: {
          [mockSelectedGroup]: MOCK_MEMBERS,
        },
        setMembersForGroup: () => {},
      };
      return (
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
      );
    },
  ],
};

const Template = (args) => (
  <ChatMember
    selectedGroup={mockSelectedGroup}
    currentUserId={mockCurrentUserId}
    onSelect={member => {}}
  />
);

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
  languageToggle: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงรายชื่อ DM ปกติ',
    },
  },
};

export const NoMember = Template.bind({});
NoMember.args = {
  darkMode: false,
  languageToggle: false,
};
NoMember.parameters = {
  docs: {
    description: {
      story: 'กรณีไม่มี DM list (ว่าง)',
    },
  },
};
NoMember.decorators = [
  (Story, context) => {
    const theme = useMemo(
      () => createTheme({ palette: { mode: context.args.darkMode ? 'dark' : 'light' } }),
      [context.args.darkMode]
    );
    const lang = context.args.languageToggle ? 'th' : 'en';
    if (i18n.language !== lang) i18n.changeLanguage(lang);

    const mockContextValue = {
      membersByGroupId: {
        [mockSelectedGroup]: [],
      },
      setMembersForGroup: () => {},
    };
    return (
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
    );
  },
];