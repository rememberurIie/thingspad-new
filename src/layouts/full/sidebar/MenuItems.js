// menuitems.js
import { uniqueId } from 'lodash';
import {
  IconLayoutDashboard,
  IconAlignBoxLeftBottom,
  IconTable,
  IconUserEdit,
  IconTableOptions
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';

export const useMenuItems = () => {
  const user = useSelector(state => state.auth.user);
  console.log('Current user from Redux:', user);

  const menu = [
    // เฉพาะกรณี user.role เป็น root
    ...(user?.role === 'root'
      ? [
        {
          navlabel: true,
          subheader: 'Root',
        },

        {
          id: uniqueId(),
          title: 'User Management',
          icon: IconUserEdit,
          href: '/user_management',
        },
        {
          id: uniqueId(),
          title: 'Project Management',
          icon: IconTableOptions,
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
