// menuitems.js
import { uniqueId } from 'lodash';
import {
  IconLayoutDashboard,
  IconAlignBoxLeftBottom,
  IconTable
} from '@tabler/icons-react';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'menu.home', // ใช้ key แทนข้อความ
  },
  {
    id: uniqueId(),
    title: 'menu.myTask',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    navlabel: true,
    subheader: 'menu.chats',
  },
  {
    id: uniqueId(),
    title: 'menu.directChat',
    icon: IconAlignBoxLeftBottom,
    href: '/chat/dm',
  },
  {
    id: uniqueId(),
    title: 'menu.chatByRole',
    icon: IconTable,
    href: '/chat/role',
  }
];

export default Menuitems;
