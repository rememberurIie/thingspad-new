import React, { useMemo, useEffect } from 'react';
import FinishedTask from '../../views/dashboard/components/FinishedTask';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { baselightTheme, basedarkTheme } from '../../theme/DefaultColors';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

export default {
  title: 'Dashboard/FinishedTask',
  component: FinishedTask,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    taskFinishedCount: {
      control: { type: 'number'},
      defaultValue: 8,
      description: 'จำนวนงานที่เสร็จสิ้นแล้ว',
    },
    taskInProgressCount: {
      control: { type: 'number'},
      defaultValue: 2,
      description: 'จำนวนงานที่กำลังดำเนินการ',
    },
    titleFontSize: {
      control: { type: 'number', min: 12, max: 48, step: 1 },
      defaultValue: 24,
      description: 'ขนาดตัวอักษร (px) สำหรับหัวข้อ',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 18 },
      },
    },
    countFontSize: {
      control: { type: 'number', min: 24, max: 96, step: 1 },
      defaultValue: 48,
      description: 'ขนาดตัวอักษร (px) สำหรับตัวเลขจำนวนงาน',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 36 },
      },
    },
    // darkMode: {
    //   control: 'boolean',
    //   defaultValue: false,
    //   description: 'เปลี่ยนธีมเป็นโหมดมืด',
    // },
    // languageToggle: {
    //   control: 'boolean',
    //   defaultValue: false,
    //   description: 'เปลี่ยนภาษา: ปิด = อังกฤษ, เปิด = ไทย',
    // },
  },
  decorators: [
    (Story, context) => {
      const isDarkMode = context.args.darkMode;
      const theme = useMemo(
        () => (isDarkMode ? basedarkTheme : baselightTheme),
        [isDarkMode]
      );

      const lang = context.args.languageToggle ? 'th' : 'en';
      useEffect(() => {
        if (i18n.language !== lang) {
          i18n.changeLanguage(lang);
        }
      }, [lang]);

      return (
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ width: 400, height: 185, maxWidth: '100%' }}>
              <Story />
            </div>
          </ThemeProvider>
        </I18nextProvider>
      );
    },
  ],
};

const Template = ({ languageToggle, ...args }) => {
  const language = languageToggle ? 'th' : 'en';
  return <FinishedTask {...args} language={language} />;
};

export const Default = Template.bind({});
Default.args = {
  taskFinishedCount: 8,
  taskInProgressCount: 2,
  titleFontSize: 18,
  countFontSize: 36,
};
Default.parameters = {
  docs: {
    description: {
      story: 'แสดงจำนวนงานที่เสร็จและกำลังดำเนินการ (ตัวอย่างปกติ)',
    },
  },
};

export const AllTaskFinished = Template.bind({});
AllTaskFinished.args = {
  taskFinishedCount: 8,
  taskInProgressCount: 0,
  titleFontSize: 18,
  countFontSize: 36,
};
AllTaskFinished.parameters = {
  docs: {
    description: {
      story: 'แสดงกรณีที่งานทั้งหมดเสร็จแล้ว ไม่มีงานค้าง',
    },
  },
};

export const NoTask = Template.bind({});
NoTask.args = {
  taskFinishedCount: 0,
  taskInProgressCount: 0,
  titleFontSize: 18,
  countFontSize: 36,
};
NoTask.parameters = {
  docs: {
    description: {
      story: 'แสดงกรณีที่ไม่มีงานในระบบเลย',
    },
  },
};