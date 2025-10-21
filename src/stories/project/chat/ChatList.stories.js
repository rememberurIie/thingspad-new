import React, { useMemo } from 'react';
import ChatList from '../../../views/project/components/ChatComponent/ChatList';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../language/i18n';

// mock redux store
const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { uid: 'user123', fullName: 'Mock User' },
    }),
  },
});

const SAMPLE_ROOMS = [
  { id: 'r1', name: 'General' },
  { id: 'r2', name: 'Design' },
  { id: 'r3', name: 'Backend' },
];

export default {
  title: 'Project/Chat/ChatList',
  component: ChatList,
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
    initialRooms: { 
      control: 'object', 
      defaultValue: SAMPLE_ROOMS, 
      description: 'กำหนดชุดห้องสนทนา mock สำหรับแสดงในรายการห้อง ใช้สำหรับ preview ใน Storybook โดยไม่ต้องเชื่อมต่อ API จริง', 
    },
    selectedRoomId: {
      control: 'text',
      defaultValue: null,
      description: 'กำหนดรหัสห้องสนทนาที่เลือกอยู่ในขณะนั้น',
    },
    onSelect: {
      description: 'ฟังก์ชัน callback เมื่อผู้ใช้เลือกห้องสนทนา',
    },
    projectId: {
      control: 'text',
      defaultValue: null,
      description: 'รหัสโปรเจกต์ (null เพื่อปิดการเชื่อมต่อ API/SSE ใน Storybook)',
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
              <Box sx={{ width: 360, padding: 2 }}>
                <Story />
              </Box>
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
};

const Template = (args) => <ChatList {...args} />;

export const Default = Template.bind({});
Default.args = {
  initialRooms: SAMPLE_ROOMS,
  selectedRoomId: null,
  onSelect: (room) => console.log('room-selected', room),
  projectId: null,
  darkMode: false,
  languageToggle: false,
};
// เพิ่มคำอธิบายสำหรับ Default
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงตัวอย่างรายการห้องสนทนา (ChatList) พร้อมข้อมูล mock (`initialRooms`) โดยไม่เชื่อมต่อ API จริง สามารถปรับโหมดมืด/สว่างและเปลี่ยนภาษาได้ผ่าน Storybook controls',
    },
  },
};

export const Loading = Template.bind({});
Loading.args = {
  initialRooms: [],
  onSelect: (room) => console.log('room-selected', room),
  projectId: null,
  darkMode: false,
  languageToggle: false,
};
// เพิ่มคำอธิบายสำหรับ Loading
Loading.parameters = {
  docs: {
    description: {
      story: 'แสดงสถานะกำลังโหลด (loading spinner) เมื่อไม่มีข้อมูลห้องสนทนาใน prop `initialRooms`',
    },
  },
};