import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../language/i18n';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ChatMember from '../../../views/project/components/ChatComponent/ChatMember';

const mockStore = configureStore({
  reducer: {
    auth: () => ({ user: { uid: 'user123', fullName: 'Mock User', role: 'admin' } }),
  },
});

const MOCK_MEMBERS = [
  { id: 'u1', fullName: 'Netipong Sanklar', username: 'netipong' },
  { id: 'u2', fullName: 'Aroon T.', username: 'aroon' },
  { id: 'u3', fullName: 'Pim S.', username: 'pim' },
];

export default {
  title: 'Project/Chat/ChatMember',
  tags: ['autodocs'],
  argTypes: {
    darkMode: { 
      control: 'boolean',
      description: 'เปิด/ปิดโหมดมืดของ UI เพื่อดูตัวอย่างการแสดงผลในธีมสีเข้มและสีสว่าง'
    },
    languageToggle: { 
      control: 'boolean',
      description: 'เปิด/สลับภาษา UI ระหว่างภาษาอังกฤษและภาษาไทย'
    },
    projectId: { 
      control: 'text',
      description: 'รหัสโปรเจกต์ (null เพื่อปิดการเชื่อมต่อ API/SSE ใน Storybook)'
    },
    initialMembers: {
      control: 'object',
      defaultValue: MOCK_MEMBERS,
      description: 'กำหนดชุดสมาชิก mock สำหรับแสดงในรายการสมาชิก ใช้สำหรับ preview ใน Storybook โดยไม่ต้องเชื่อมต่อ API จริง'
    },
  },
  decorators: [
    (Story, ctx) => {
      class MockEventSource {
        constructor(url) {
          this.url = url;
          this.onmessage = null;
          this.listeners = {};
          setTimeout(() => {
            const ev = { data: JSON.stringify(MOCK_MEMBERS) };
            this.onmessage?.(ev);
            this.listeners['message']?.forEach(fn => fn(ev));
          }, 80);
        }
        addEventListener(name, fn) {
          this.listeners[name] = this.listeners[name] || [];
          this.listeners[name].push(fn);
        }
        close() {}
      }
      global.EventSource = MockEventSource;

      const origFetch = global.fetch;
      global.fetch = async (url, opts) => {
        if (url?.includes('/getUserNotInProject')) {
          return { ok: true, json: async () => ({ users: [] }) };
        }
        if (url?.includes('/toggleUser')) {
          return { ok: true, json: async () => ({ success: true }) };
        }
        return origFetch ? origFetch(url, opts) : { ok: true, json: async () => ({}) };
      };

      const theme = createTheme({ palette: { mode: ctx.args.darkMode ? 'dark' : 'light' } });
      const lang = ctx.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      setTimeout(() => { global.fetch = origFetch; }, 10000);

      return (
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <div style={{ width: 420 }}>
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
  <ChatMember
    projectId={null} // ปิด SSE
    currentUserId={'user123'}
    initialMembers={MOCK_MEMBERS}
    onSelect={() => {}}
  />
);

export const Default = Template.bind({});
Default.args = { darkMode: false, languageToggle: false };
// เพิ่มคำอธิบายสำหรับ Default
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงตัวอย่างรายชื่อสมาชิกในโปรเจกต์ (ChatMember) พร้อมข้อมูล mock (`initialMembers`) โดยไม่เชื่อมต่อ API จริง สามารถปรับโหมดมืด/สว่างและเปลี่ยนภาษาได้ผ่าน Storybook controls',
    },
  },
};