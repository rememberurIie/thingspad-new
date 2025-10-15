import React, { useMemo } from 'react';
import DirectMessageChat from '../../views/chat/dm/components/DirectMessageChat';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';
import { DirectMessageListContext } from '../../contexts/DirectMessageListContext';

const MOCK_MESSAGES = [
  {
    id: 'msg1',
    senderId: 'user123',
    fullName: 'John Doe',
    text: 'Hello!',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
  },
  {
    id: 'msg2',
    senderId: 'user456',
    fullName: 'Jane Doe',
    text: 'Hi John! How are you?',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3500 },
  },
  {
    id: 'msg3',
    senderId: 'user123',
    fullName: 'John Doe',
    text: 'I am fine, thanks!',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3400 },
  },
];

export default {
  title: 'DMChat/DirectMessageChat',
  component: DirectMessageChat,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
      DirectMessageChat สำหรับแชทส่วนตัว  
      รองรับธีมมืด/สว่างและภาษาไทย/อังกฤษ  
      สามารถกำหนดผู้ส่ง ผู้รับ และสถานะการเลือกห้องแชทได้
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    selectedDmId: {
      control: 'text',
      defaultValue: 'dm1',
      description: 'ID ของห้องแชทที่เลือก',
    },
    otherUserId: {
      control: 'text',
      defaultValue: 'user456',
      description: 'รหัสผู้ใช้ปลายทาง',
    },
    otherFullName: {
      control: 'text',
      defaultValue: 'Jane Doe',
      description: 'ชื่อเต็มผู้ใช้ปลายทาง',
    },
    currentUserId: {
      control: 'text',
      defaultValue: 'user123',
      description: 'รหัสผู้ใช้ปัจจุบัน',
    },
    darkMode: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปลี่ยนธีมเป็นโหมดมืด',
    },
    languageToggle: {
      control: 'boolean',
      defaultValue: false,
      description: 'เปลี่ยนภาษา: ปิด = อังกฤษ, เปิด = ไทย',
    },
  },
  decorators: [
    (Story, context) => {
      const isDarkMode = context.args.darkMode;
      const theme = useMemo(
        () => createTheme({ palette: { mode: isDarkMode ? 'dark' : 'light' } }),
        [isDarkMode]
      );
      const lang = context.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      // Mock context value
      const mockContextValue = {
        messagesByDmId: {
          [context.args.selectedDmId]: MOCK_MESSAGES,
        },
        setMessagesForDm: () => {},
      };

      return (
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ width: 600, maxWidth: '100%' }}>
              <DirectMessageListContext.Provider value={mockContextValue}>
                <Story />
              </DirectMessageListContext.Provider>
            </div>
          </ThemeProvider>
        </I18nextProvider>
      );
    },
  ],
};

const Template = ({ languageToggle, darkMode, ...args }) => {
  return <DirectMessageChat {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  selectedDmId: 'dm1',
  otherUserId: 'user456',
  otherFullName: 'Jane Doe',
  currentUserId: 'user123',
  darkMode: false,
  languageToggle: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างแชทส่วนตัวปกติ (mock message)',
    },
  },
};

export const NoDmSelected = Template.bind({});
NoDmSelected.args = {
  selectedDmId: '',
  otherUserId: 'user456',
  otherFullName: 'Jane Doe',
  currentUserId: 'user123',
  darkMode: false,
  languageToggle: false,
};
NoDmSelected.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างเมื่อยังไม่ได้เลือกห้องแชท',
    },
  },
};