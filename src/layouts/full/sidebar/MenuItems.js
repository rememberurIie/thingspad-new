// menuitems.js
import { uniqueId } from 'lodash';
import {
  IconLayoutDashboard,
  IconAlignBoxLeftBottom,
  IconTable
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';

export const useMenuItems = () => {
  const user = useSelector(state => state.auth.user);

  const menu = [
    {
      navlabel: true,
      subheader: 'Root',
    },
    // เฉพาะกรณี user ไม่เป็น null
    ...(user
      ? [
          {
            id: uniqueId(),
            title: 'User Management',
            icon: IconLayoutDashboard,
            href: '/user_management',
          },
          {
            id: uniqueId(),
            title: 'Project Management',
            icon: IconLayoutDashboard,
            href: '/project_management',
          },
        ]
      : []),
    {
      navlabel: true,
      subheader: 'menu.home',
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
      title: 'menu.groupChat',
      icon: IconTable,
      href: '/chat/group',
    }
  ];

  return menu;
};

export default useMenuItems;
