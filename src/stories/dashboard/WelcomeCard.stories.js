import React, { useMemo, useEffect } from 'react';
import WelcomeCard from '../../views/dashboard/components/WelcomeCard';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { baselightTheme, basedarkTheme } from '../../theme/DefaultColors';

import { I18nextProvider } from 'react-i18next';
import i18n from '../../language/i18n';

export default {
   title: 'Dashboard/WelcomeCard',
   component: WelcomeCard,
   parameters: {
      layout: 'centered',
      docs: {
         description: {
            component: `
การ์ดต้อนรับผู้ใช้ในแดชบอร์ด  
แสดงชื่อผู้ใช้ รหัสผู้ใช้ และรูปโปรไฟล์  
สามารถปรับขนาดตัวอักษรและรูปภาพได้  
รองรับภาษาไทย/อังกฤษและธีมมืด
            `,
         },
      },
   },
   tags: ['autodocs'],
   argTypes: {
      fullName: {
         control: 'text',
         defaultValue: 'John Doe',
         description: 'ชื่อเต็มของผู้ใช้ (รับค่าจาก Dashboard.js)',
      },
      userId: {
         control: 'text',
         defaultValue: 'user123',
         description: 'รหัสประจำตัวผู้ใช้ (รับค่าจาก Dashboard.js) ใช้สำหรับเรียก API รูปโปรไฟล์',
      },
      avatarSize: {
         control: { type: 'number', min: 30, max: 150, step: 1 },
         defaultValue: 75,
         description: 'ขนาด (px) ของรูปโปรไฟล์ผู้ใช้',
         table: {
            type: { summary: 'number' },
            defaultValue: { summary: 75 },
         },
      },
      welcomeFontSize: {
         control: { type: 'number', min: 10, max: 40, step: 1 },
         defaultValue: 22,
         description: 'ขนาดตัวอักษร (px) สำหรับข้อความต้อนรับ',
         table: {
            type: { summary: 'number' },
            defaultValue: { summary: 22 },
         },
      },
      nameFontSize: {
         control: { type: 'number', min: 10, max: 50, step: 1 },
         defaultValue: 30,
         description: 'ขนาดตัวอักษร (px) สำหรับชื่อผู้ใช้',
         table: {
            type: { summary: 'number' },
            defaultValue: { summary: 30 },
         },
      },
      // darkMode: {
      //    control: 'boolean',
      //    defaultValue: false,
      //    description: 'เปลี่ยนธีมเป็นโหมดมืด',
      // },
      // languageToggle: {
      //    control: 'boolean',
      //    defaultValue: false,
      //    description: 'เปลี่ยนภาษา: ปิด = อังกฤษ, เปิด = ไทย',
      // },
      imgSize: {
         table: {
            type: { summary: 'responsive' },
            defaultValue: { summary: 'xs:80, sm:110, md:140, lg:150 (px)' },
         },
         description: 'ขนาดรูปดอกไม้ด้านล่างขวาจะปรับตามขนาดหน้าจอโดยอัตโนมัติ',
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

         // Set a fixed width for the WelcomeCard in Storybook
         return (
            <I18nextProvider i18n={i18n}>
               <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <div style={{ width: 550, maxWidth: '100%' }}>
                     <Story />
                  </div>
               </ThemeProvider>
            </I18nextProvider>
         );
      },
   ],
};

// Map the boolean to the component's `language` prop
const Template = ({ languageToggle, ...args }) => {
   const language = languageToggle ? 'th' : 'en';
   return <WelcomeCard {...args} language={language} />;
};

// เพิ่ม description ให้แต่ละ story
export const Default = Template.bind({});
Default.args = {
   fullName: 'Netipong Sanklar',
   userId: 'Smxw91lXjdgMOgyo0p3cuyWjFKK2',
   avatarSize: 75,
   welcomeFontSize: 22,
   nameFontSize: 30,
};
Default.parameters = {
   docs: {
      description: {
         story: 'ตัวอย่างการ์ดต้อนรับผู้ใช้ที่มีข้อมูลครบถ้วน',
      },
   },
};

export const NoAvatar = Template.bind({});
NoAvatar.args = {
   fullName: 'Netipong Sanklar',
   userId: '',
   avatarSize: 75,
   welcomeFontSize: 22,
   nameFontSize: 30,
};
NoAvatar.parameters = {
   docs: {
      description: {
         story: 'ตัวอย่างการ์ดต้อนรับผู้ใช้ที่ไม่มีรูปโปรไฟล์',
      },
   },
};

export const NoValue = Template.bind({});
NoValue.args = {
   fullName: 'No Data',
   userId: '',
   avatarSize: 75,
   welcomeFontSize: 22,
   nameFontSize: 30,
};
NoValue.parameters = {
   docs: {
      description: {
         story: 'ตัวอย่างการ์ดต้อนรับเมื่อไม่มีข้อมูลผู้ใช้',
      },
   },
};