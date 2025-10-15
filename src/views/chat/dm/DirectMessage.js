import React, { useMemo, useState } from 'react';
import {Box, useMediaQuery, Drawer,} from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';
import { useDirectMessageList } from '../../../contexts/DirectMessageListContext';
import { getCachedAvatarUrl } from '../../../utils/avatarCache';

import DirectMessageList from './components/DirectMessageList';
import DirectMessageChat from './components/DirectMessageChat';

const drawerWidth = 300;

const DirectMessage = () => {
  // Redux user
  const user = useSelector(state => state.auth.user);

  // Context: selected DM
  const { selectedDm, setSelectedDm } = useDirectMessageList();

  // Mobile drawer state
  const [mobileOpenLeft, setMobileOpenLeft] = useState(false);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('lg'));

  // Drawer toggle
  const handleDrawerToggleLeft = () => setMobileOpenLeft(v => !v);

  // Memoized avatar URL
  const avatarUrl = useMemo(() => getCachedAvatarUrl(user.uid), [user.uid]);

  // // Drawer content
  // const DirectMessageListDrawer = (
  //   <Box sx={{ width: drawerWidth, height: '85vh' }}>
  //     <DirectMessageList
  //       onSelect={setSelectedDm}
  //       userId={user.uid}
  //     />
  //   </Box>
  // );

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
              <DirectMessageList onSelect={setSelectedDm} userId={user.uid}/>
            </Drawer>
          ) : (
            <Box sx={{ width: drawerWidth, display: { xs: 'none', lg: 'block' } }}>
              <DirectMessageList onSelect={setSelectedDm} userId={user.uid}/>
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
              avatarUrl={avatarUrl}
              onOpenChatList={handleDrawerToggleLeft}
            />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default DirectMessage;
