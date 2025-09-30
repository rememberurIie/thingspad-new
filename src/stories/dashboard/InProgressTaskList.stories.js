import React, { useMemo, useEffect } from 'react';
import InProgessTaskList from '../../views/dashboard/components/InProgressTaskList';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { baselightTheme, basedarkTheme } from '../../theme/DefaultColors';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

export default {
  title: 'Dashboard/InProgressTaskList',
  component: InProgessTaskList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
รายการงานที่กำลังดำเนินการในแดชบอร์ด  
สามารถปรับขนาดตัวอักษรหัวข้อ รายการงาน และชื่อโปรเจกต์ได้  
รองรับภาษาไทย/อังกฤษและธีมมืด
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tasks: {
      control: 'object',
      description: 'อาร์เรย์ของงานที่กำลังดำเนินการ (แต่ละงานมี id, name, projectName, due)',
      table: {
        type: { summary: 'array' },
        defaultValue: { summary: '[]' },
      },
    },
    loading: {
      control: 'boolean',
      defaultValue: false,
      description: 'สถานะกำลังโหลดข้อมูลรายการงาน',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    titleFontSize: {
      control: { type: 'number', min: 12, max: 48, step: 1 },
      defaultValue: 18,
      description: 'ขนาดตัวอักษร (px) สำหรับหัวข้อรายการงาน',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 18 },
      },
    },
    taskFontSize: {
      control: { type: 'number', min: 10, max: 32, step: 1 },
      defaultValue: 16,
      description: 'ขนาดตัวอักษร (px) สำหรับชื่อรายการงาน',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 16 },
      },
    },
    projectFontSize: {
      control: { type: 'number', min: 8, max: 24, step: 1 },
      defaultValue: 12,
      description: 'ขนาดตัวอักษร (px) สำหรับชื่อโปรเจกต์',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 12 },
      },
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
            <div style={{ width: 600,  maxWidth: '100%' }}>
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
  return <InProgessTaskList {...args} language={language} />;
};

export const Default = Template.bind({});
Default.args = {
  loading: false,
  tasks: [
    {
      id: 1,
      name: 'ออกแบบ Dashboard UI',
      projectName: 'ThingsPad',
      due: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'เชื่อมต่อ API',
      projectName: 'ThingsPad',
      due: new Date(Date.now() + 86400000).toISOString(),
    },
  ],
  titleFontSize: 18,
  taskFontSize: 16,
  projectFontSize: 12,
};
Default.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างรายการงานที่กำลังดำเนินการ (มีข้อมูลงาน)',
    },
  },
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
  tasks: [],
  titleFontSize: 18,
  taskFontSize: 16,
  projectFontSize: 12,
};
Loading.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างขณะกำลังโหลดข้อมูลงาน',
    },
  },
};

export const NoValue = Template.bind({});
NoValue.args = {
  loading: false,
  tasks: [],
  titleFontSize: 18,
  taskFontSize: 16,
  projectFontSize: 12,
};
NoValue.parameters = {
  docs: {
    description: {
      story: 'ตัวอย่างกรณีไม่มีงานที่กำลังดำเนินการ',
    },
  },
};