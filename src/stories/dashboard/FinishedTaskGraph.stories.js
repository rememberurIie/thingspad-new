import React, { useMemo, useEffect } from 'react';
import FinishedTaskGraph from '../../views/dashboard/components/FinishedTaskGraph';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { baselightTheme, basedarkTheme } from '../../theme/DefaultColors';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

export default {
  title: 'Dashboard/FinishedTaskGraph',
  component: FinishedTaskGraph,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    finishedTasks8MonthsBack: {
      control: 'object',
      description: 'อาร์เรย์ของจำนวนงานที่เสร็จในแต่ละเดือนย้อนหลัง 8 เดือน',
      table: {
        type: { summary: 'array' },
        defaultValue: { summary: '[]' },
      },
    },
    titleFontSize: {
      control: { type: 'number', min: 12, max: 48, step: 1 },
      defaultValue: 18,
      description: 'ขนาดตัวอักษร (px) สำหรับหัวข้อกราฟ',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 18 },
      },
    },
    axisFontSize: {
      control: { type: 'number', min: 8, max: 32, step: 1 },
      defaultValue: 12,
      description: 'ขนาดตัวอักษร (px) สำหรับชื่อแกนกราฟ',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 12 },
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
            <div style={{ width: 700, height: 400, maxWidth: '100%' }}>
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
  return <FinishedTaskGraph {...args} language={language} />;
};

export const Default = Template.bind({});
Default.args = {
  finishedTasks8MonthsBack: [
    { month: 1, year: 2025, count: 5 },
    { month: 2, year: 2025, count: 8 },
    { month: 3, year: 2025, count: 6 },
    { month: 4, year: 2025, count: 10 },
    { month: 5, year: 2025, count: 7 },
    { month: 6, year: 2025, count: 12 },
    { month: 7, year: 2025, count: 9 },
    { month: 8, year: 2025, count: 11 },
  ],
  titleFontSize: 18,
  axisFontSize: 12,
  // darkMode: false,
  // languageToggle: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'กราฟแสดงจำนวนงานที่เสร็จในแต่ละเดือนย้อนหลัง 8 เดือน',
    },
  },
};

export const NoValue = Template.bind({});
NoValue.args = {
  finishedTasks8MonthsBack: [],
  titleFontSize: 18,
  axisFontSize: 12,
  // darkMode: false,
  // languageToggle: false,
};
NoValue.parameters = {
  docs: {
    description: {
      story: 'กราฟไม่มีข้อมูลงานที่เสร็จในช่วง 8 เดือนที่ผ่านมา',
    },
  },
};