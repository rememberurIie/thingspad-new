import React, { useMemo } from 'react';
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
import { useDirectMessageList } from '../../../contexts/DirectMessageListContext';
import { getCachedAvatarUrl } from '../../../utils/avatarCache';

import DirectMessageList from './components/DirectMessageList';
import DirectMessageChat from './components/DirectMessageChat';

const drawerWidth = 300;

const DirectMessage = () => {
  const user = useSelector(state => state.auth.user);

  // Remove local selectedDm state
  const { selectedDm, setSelectedDm } = useDirectMessageList();

  // Mobile drawers
  const [mobileOpenLeft, setMobileOpenLeft] = React.useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const handleDrawerToggleLeft = () => setMobileOpenLeft(!mobileOpenLeft);

  const DirectMessageListDrawer = (
    <Box sx={{ width: drawerWidth, height: '85vh' }}>
      <DirectMessageList
        onSelect={setSelectedDm}
        userId={user.uid}
      />
    </Box>
  );

  // เพิ่ม useMemo สำหรับ avatar URL ใน component
  const avatarUrl = useMemo(() => getCachedAvatarUrl(user.uid), [user.uid]);

  return (
    <PageContainer title="Chat App" description="Responsive chat UI">
      {/* เปลี่ยน 90vh เป็น 89vh ให้ตรงกับ Dashboard */}
      <Box sx={{ height: '89vh', display: 'flex', flexDirection: 'column' }}>
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
              {DirectMessageListDrawer}
            </Drawer>
          ) : (
            <Box sx={{ width: drawerWidth, display: { xs: 'none', lg: 'block' } }}>
              {DirectMessageListDrawer}
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
              pl: 1 
            }}
          >
            <DirectMessageChat
              selectedDmId={selectedDm?.dmId}
              otherUserId={selectedDm?.userId}
              otherFullName={selectedDm?.fullName}
              currentUserId={user?.uid}
              avatarUrl={avatarUrl} // ใช้ avatarUrl แทน URL เดิมใน Avatar component
            />
          </Box>

        </Box>
      </Box>
    </PageContainer>
  );
};

export default DirectMessage;
