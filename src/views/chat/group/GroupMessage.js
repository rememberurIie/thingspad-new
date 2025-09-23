import React, { useState } from 'react';
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

  const GroupMessageListDrawer = (
    <Box sx={{ width: drawerWidth, height: '85vh' }}>
      <GroupMessageList
        onSelect={setSelectedGroup}
        userId={user.uid}
      />
    </Box>
  );

  const GroupMemberDrawer = (
      <Box sx={{ width: rightWidth, height: '85vh' }}>
        <GroupMember selectedGroup={selectedGroup?.id} currentUserId={user?.uid} />
      </Box>
    );

  return (
    <PageContainer title="Chat App" description="Responsive chat UI">
      <Box sx={{ height: '88vh', display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <AppBar position="static" color="default" elevation={0}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <IconButton
                color="inherit"
                aria-label="open chat list"
                edge="start"
                onClick={handleDrawerToggleLeft}
              >
                <ChatIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

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
              {GroupMessageListDrawer}
            </Drawer>
          ) : (
            <Box sx={{ width: drawerWidth, display: { xs: 'none', lg: 'block' } }}>
              {GroupMessageListDrawer}
            </Box>
          )}

          {/* Middle content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              height: '85vh',
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
                {GroupMemberDrawer}
              </Drawer>
            ) : (
              <Box sx={{ width: rightWidth, display: { xs: 'none', lg: 'block' }}}>
                {GroupMemberDrawer}
              </Box>
            )}

        </Box>
      </Box>
    </PageContainer>
  );
};

export default GroupMessage;
