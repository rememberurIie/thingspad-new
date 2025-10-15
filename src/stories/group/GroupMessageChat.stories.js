import React, { useMemo } from 'react';
import GroupMessageChat from '../../views/chat/group/components/GroupMessageChat';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { GroupMessageListContext } from '../../contexts/GroupMessageListContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

const mockCurrentUserId = 'user123';
const mockSelectedGroupId = 'group1';
const mockGroupName = 'Dev Team';

const MOCK_MESSAGES = [
  {
    id: 'msg1',
    senderId: 'user123',
    fullName: 'John Doe',
    text: 'สวัสดีทุกคน!',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
  },
  {
    id: 'msg2',
    senderId: 'user456',
    fullName: 'Jane Smith',
    text: 'สวัสดีค่ะ John',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3500 },
  },
  {
    id: 'msg3',
    senderId: 'user789',
    fullName: 'Bob Brown',
    text: 'เจอกันประชุม 10 โมงนะ',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3400 },
  },
];

export default {
  title: 'GroupChat/GroupMessageChat',
  component: GroupMessageChat,
  tags: ['autodocs'],
  argTypes: {
    darkMode: { control: 'boolean', defaultValue: false },
    languageToggle: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปลี่ยนภาษา: ปิด = อังกฤษ, เปิด = ไทย',
    },
    selectedGroupId: {
      control: 'text',
      description: 'ID ของกลุ่มที่เลือก (undefined = ยังไม่ได้เลือก)',
      defaultValue: mockSelectedGroupId,
    },
    groupName: {
      control: 'text',
      description: 'ชื่อกลุ่ม',
      defaultValue: mockGroupName,
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

      // Mock context value
      const mockContextValue = {
        messagesByGroupId: {
          [mockSelectedGroupId]: MOCK_MESSAGES,
        },
        setMessagesForGroup: () => {},
      };
      return (
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GroupMessageListContext.Provider value={mockContextValue}>
              <div style={{ width: 600, maxWidth: '100%' }}>
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
  <GroupMessageChat
    selectedGroupId={args.selectedGroupId}
    groupName={args.groupName}
    currentUserId={mockCurrentUserId}
    onOpenChatList={() => {}}
    onOpenMemberList={() => {}}
  />
);

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
  languageToggle: false,
  selectedGroupId: mockSelectedGroupId,
  groupName: mockGroupName,
};
Default.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างแชทกลุ่มปกติ (mock message)',
    },
  },
};

export const NoDmSelected = Template.bind({});
NoDmSelected.args = {
  darkMode: false,
  languageToggle: false,
  selectedGroupId: undefined,
  groupName: '',
};
NoDmSelected.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างเมื่อยังไม่ได้เลือกห้องแชท',
    },
  },
};