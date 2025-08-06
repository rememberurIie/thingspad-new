//menuitems.js
import { uniqueId } from 'lodash';

import {
  IconCopy, IconLayoutDashboard, IconMoodHappy, IconTypography,
  IconAward,
  IconBoxMultiple,
  IconPoint,
  IconAlertCircle,
  IconNotes,
  IconCalendar,
  IconMail,
  IconTicket,
  IconEdit,
  IconCurrencyDollar,
  IconApps,
  IconFileDescription,
  IconFileDots,
  IconFiles,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconBorderAll,
  IconBorderHorizontal,
  IconBorderInner,
  IconBorderVertical,
  IconBorderTop,
  IconUserCircle,
  IconPackage,
  IconMessage2,
  IconBasket,
  IconChartLine,
  IconChartArcs,
  IconChartCandle,
  IconChartArea,
  IconChartDots,
  IconChartDonut3,
  IconChartRadar,
  IconLogin,
  IconUserPlus,
  IconRotate,
  IconBox,
  IconShoppingCart,
  IconAperture,
  IconLayout,
  IconSettings,
  IconHelp,
  IconZoomCode,
  IconBoxAlignBottom,
  IconBoxAlignLeft,
  IconBorderStyle2,
  IconAppWindow,
  IconNotebook,
  IconFileCheck,
  IconChartHistogram,
  IconChartPie2,
  IconChartScatter,
  IconChartPpf,
  IconChartArcs3,
  IconListTree,
  IconLayoutSidebar,
  IconLock, IconAlignBoxLeftBottom, IconCheckbox, IconRadar, IconSlideshow, IconCaretUpDown, IconTable, IconForms
} from '@tabler/icons-react';


const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  {
    id: uniqueId(),
    title: 'My Task',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    navlabel: true,
    subheader: 'Chat',
  },
  {
    id: uniqueId(),
    title: 'Direct Chat',
    icon: IconAlignBoxLeftBottom,
    href: '/chat/dm',
  },

  {
    id: uniqueId(),
    title: 'Chat by role',
    icon: IconTable,
    href: '/chat/role',
  },
  {
    navlabel: true,
    subheader: 'Project',
  },
  {
    id: uniqueId(),
    title: 'Project 1',
    icon: IconAperture,
    href: '/project',
  },
  
]

export default Menuitems;
