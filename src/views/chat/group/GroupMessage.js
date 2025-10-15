import React, { useState, useMemo } from 'react';
import {
  Box,
  useMediaQuery,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';

import ChatIcon from '@mui/icons-material/Chat';

import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';
import { useGroupMessageList } from '../../../contexts/GroupMessageListContext';
import { getCachedAvatarUrl } from '../../../utils/avatarCache';

import GroupMessageList from './components/GroupMessageList';
import GroupMessageChat from './components/GroupMessageChat';
import GroupMember from './components/GroupMember';

const drawerWidth = 300;
const rightWidth = 280;

const GroupMessage = () => {
  const user = useSelector(state => state.auth.user);

  // Use context for selected group
  const { selectedGroup, setSelectedGroup } = useGroupMessageList();

  // Mobile drawers
  const [mobileOpenLeft, setMobileOpenLeft] = useState(false);
  const [mobileOpenRight, setMobileOpenRight] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const handleDrawerToggleLeft = () => setMobileOpenLeft(!mobileOpenLeft);
  const handleDrawerToggleRight = () => setMobileOpenRight(!mobileOpenRight);

  
  // const GroupMessageListDrawer = (
  //   <Box sx={{ width: drawerWidth, height: '85vh' }}>
  //     <GroupMessageList
  //       onSelect={setSelectedGroup}
  //       userId={user.uid}
  //     />
  //   </Box>
  // );

  // const GroupMemberDrawer = (
  //   <Box sx={{ width: rightWidth, height: '85vh' }}>
  //     <GroupMember selectedGroup={selectedGroup?.id} currentUserId={user?.uid} />
  //   </Box>
  // );

  // เพิ่ม useMemo สำหรับ avatar URL ใน component
  const avatarUrl = useMemo(() => getCachedAvatarUrl(user.uid), [user.uid]);

  return (
    <PageContainer title="Chat App" description="Responsive chat UI">
      <Box sx={{ height: '89vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 0, display: 'flex', flexGrow: 1 }}>
          {/* Left drawer / column */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpenLeft}
              onClose={handleDrawerToggleLeft}
              ModalProps={{ keepMounted: true }}
              sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
            >
              <GroupMessageList onSelect={setSelectedGroup} userId={user.uid}/>
            </Drawer>
          ) : (
            <Box sx={{ width: drawerWidth, display: { xs: 'none', lg: 'block' } }}>
              <GroupMessageList onSelect={setSelectedGroup} userId={user.uid}/>
            </Box>
          )}

          {/* Middle content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              px: 1
            }}
          >
            <GroupMessageChat
              selectedGroupId={selectedGroup?.id}
              groupName={selectedGroup?.groupName}
              currentUserId={user?.uid}
              onOpenChatList={handleDrawerToggleLeft}
              onOpenMemberList={handleDrawerToggleRight}
            />
          </Box>

          {/* Right drawer / column */}
          {isMobile ? (
            <Drawer
              anchor="right"
              variant="temporary"
              open={mobileOpenRight}
              onClose={handleDrawerToggleRight}
              ModalProps={{ keepMounted: true }}
              sx={{ '& .MuiDrawer-paper': { width: rightWidth } }}
            >
              <GroupMember selectedGroup={selectedGroup?.id} currentUserId={user?.uid} />
            </Drawer>
          ) : (
            <Box sx={{ width: rightWidth, display: { xs: 'none', lg: 'block' } }}>
              <GroupMember selectedGroup={selectedGroup?.id} currentUserId={user?.uid} />
            </Box>
          )}

        </Box>
      </Box>
    </PageContainer>
  );
};

export default GroupMessage;
