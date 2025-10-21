import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../language/i18n';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ChatContent from '../../../views/project/components/ChatComponent/ChatContent';

const mockStore = configureStore({
  reducer: {
    auth: () => ({ user: { uid: 'user123', fullName: 'Mock User', role: 'admin' } }),
  },
});

const SAMPLE_MESSAGES = [
  { id: 'm1', senderId: 'u1', fullName: 'Netipong Sanklar', text: 'Hello from real UI', createdAt: Date.now() / 1000 },
  { id: 'm2', senderId: 'user123', fullName: 'Mock User', text: 'Reply from me', createdAt: (Date.now() - 60000) / 1000 },
];

export default {
  title: 'Project/Chat/ChatContent',
  component: ChatContent,
  tags: ['autodocs'],
  argTypes: {
    darkMode: { 
      control: 'boolean', 
      defaultValue: false, 
      description: 'เปิด/ปิดโหมดมืดของ UI เพื่อดูตัวอย่างการแสดงผลในธีมสีเข้มและสีสว่าง' 
    },
    languageToggle: { 
      control: 'boolean', 
      defaultValue: false, 
      description: 'เปิด/สลับภาษา UI ระหว่างภาษาอังกฤษและภาษาไทย', 
    },
    initialMessages: { 
      control: 'object', 
      defaultValue: SAMPLE_MESSAGES, 
      description: 'กำหนดชุดข้อความ mock สำหรับแสดงในหน้าต่างสนทนา ใช้สำหรับ preview ใน Storybook โดยไม่ต้องเชื่อมต่อ API จริง'  
    },
    selectedRoomId: { 
      control: 'text', 
      defaultValue: 'r1', 
      description: 'กำหนดรหัสห้องสนทนาที่เลือกอยู่ในขณะนั้น'
    },
    selectedRoomName: { 
      control: 'text', 
      defaultValue: 'General', 
      description: 'กำหนดชื่อห้องสนทนาที่เลือกอยู่ในขณะนั้น'
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
              <div style={{ width: 900 }}>
                <Story />
              </div>
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    }
  ]
};

const Template = (args) => (
  <ChatContent
    projectId={null} // <-- ปิด SSE
    selectedRoomId={args.selectedRoomId}
    selectedRoomName={args.selectedRoomName}
    currentUserId={'user123'}
    isMobile={false}
    initialMessages={args.initialMessages}
  />
);

export const Default = Template.bind({});
Default.args = {
  initialMessages: SAMPLE_MESSAGES,
  selectedRoomId: 'r1',
  selectedRoomName: 'General',
  darkMode: false,
  languageToggle: false,
}
Default.parameters = {
  docs: {
    description: {
      story: 'เนื้อหาการสนทนาในแต่ละห้อง แสดงข้อความ, ไฟล์แนบ, และรองรับการส่งข้อความใหม่ สามารถ mock ข้อมูลข้อความด้วย prop initialMessages เพื่อใช้งานใน Storybook โดยไม่ต้องเชื่อมต่อ API จริง',
    },
  },
};;