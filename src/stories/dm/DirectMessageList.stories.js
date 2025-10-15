import React, { useMemo } from 'react';
import DirectMessageList from '../../views/chat/dm/components/DirectMessageList';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { DirectMessageListContext } from '../../contexts/DirectMessageListContext';

const mockUserId = 'Smxw91lXjdgMOgyo0p3cuyWjFKK2';

const MOCK_DMS = [
  {
    id: 'dm1',
    userId: 'user456',
    fullName: 'Jane Doe',
    username: 'jane.doe',
    latestMessage: {
      senderId: mockUserId,
      text: 'Hello Jane!',
      createdAt: { _seconds: Math.floor(Date.now() / 1000) - 3600 },
    },
  },
  {
    id: 'dm2',
    userId: 'user789',
    fullName: 'Bob Smith',
    username: 'bob.smith',
    latestMessage: {
      senderId: 'user789',
      text: 'See you tomorrow!',
      createdAt: { _seconds: Math.floor(Date.now() / 1000) - 1800 },
    },
  },
];

export default {
  title: 'DMChat/DirectMessageList',
  component: DirectMessageList,
  parameters: {
    docs: {
      description: {
        component: `
DirectMessageList แสดงรายชื่อแชทส่วนตัว (DM)  
รองรับธีมมืด/สว่าง สามารถปรับ darkMode ได้  
รองรับกรณีไม่มี DM list (แสดงสถานะว่าง)
        `,
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    darkMode: { control: 'boolean', defaultValue: false },
  },
  decorators: [
    (Story, context) => {
      const theme = useMemo(
        () => createTheme({ palette: { mode: context.args.darkMode ? 'dark' : 'light' } }),
        [context.args.darkMode]
      );
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ width: 350, maxWidth: '100%' }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

const Template = (args) => {
  // ใช้ context จำลอง
  const mockContextValue = {
    dms: args.dms,
    setDms: () => {},
    selectedDm: args.dms?.[0] || null,
    setSelectedDm: () => {},
  };
  return (
    <DirectMessageListContext.Provider value={mockContextValue}>
      <DirectMessageList userId={mockUserId} onSelect={dm => {}} />
    </DirectMessageListContext.Provider>
  );
};

export const Default = Template.bind({});
Default.args = {
  darkMode: false,
  dms: MOCK_DMS,
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงรายชื่อ DM ปกติ',
    },
  },
};

export const NoDMList = Template.bind({});
NoDMList.args = {
  darkMode: false,
  dms: [],
};
NoDMList.parameters = {
  docs: {
    description: {
      story: 'กรณีไม่มี DM list (ว่าง)',
    },
  },
};