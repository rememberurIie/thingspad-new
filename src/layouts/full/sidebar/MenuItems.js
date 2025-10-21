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

  const menu = [
    // เฉพาะกรณี user.role เป็น root
    ...(user?.role === 'root'
      ? [
        {
          navlabel: true,
          subheader: 'menu.root',
        },

        {
          id: uniqueId(),
          title: 'menu.user_management',
          icon: IconUserEdit,
          href: '/user_management',
        },
        {
          id: uniqueId(),
          title: 'menu.project_management',
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
