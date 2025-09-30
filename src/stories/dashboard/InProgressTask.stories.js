import React, { useMemo, useEffect } from 'react';
import InProgessTask from '../../views/dashboard/components/InProgressTask';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { baselightTheme, basedarkTheme } from '../../theme/DefaultColors';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

export default {
  title: 'Dashboard/InProgressTask',
  component: InProgessTask,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
แสดงจำนวนงานที่กำลังดำเนินการในแดชบอร์ด  
สามารถปรับขนาดตัวอักษรหัวข้อและตัวเลขได้  
รองรับภาษาไทย/อังกฤษและธีมมืด
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    taskInProgressCount: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      defaultValue: 5,
      description: 'จำนวนงานที่กำลังดำเนินการ (รับค่าจาก Dashboard.js)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 0 },
      },
    },
    titleFontSize: {
      control: { type: 'number', min: 12, max: 48, step: 1 },
      defaultValue: 18,
      description: 'ขนาดตัวอักษร (px) สำหรับหัวข้อ',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 18 },
      },
    },
    countFontSize: {
      control: { type: 'number', min: 24, max: 96, step: 1 },
      defaultValue: 36,
      description: 'ขนาดตัวอักษร (px) สำหรับตัวเลขงานที่กำลังดำเนินการ',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 36 },
      },
    },
    imgSize: {
      table: {
        type: { summary: 'responsive' },
        defaultValue: { summary: 'xs:80, sm:110, md:140, lg:170 (px)' },
      },
      description: 'ขนาดรูปภาพด้านล่างขวาจะปรับตามขนาดหน้าจอ',
      control: false,
    },
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
  return <InProgessTask {...args} language={language} />;
};

export const Default = Template.bind({});
Default.args = {
  taskInProgressCount: 5,
  titleFontSize: 18,
  countFontSize: 36,
};
Default.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างแสดงจำนวนงานที่กำลังดำเนินการ (ค่าปกติ)',
    },
  },
};

export const NoValue = Template.bind({});
NoValue.args = {
  taskInProgressCount: 0,
  titleFontSize: 18,
  countFontSize: 36,
};
NoValue.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างกรณีไม่มีงานที่กำลังดำเนินการ',
    },
  },
};