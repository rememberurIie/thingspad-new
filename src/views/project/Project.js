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
import { useParams, Navigate } from "react-router-dom";

import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';

import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';
import { useProjectList } from '../../contexts/ProjectListContext'; // หรือดึงจาก Redux

import ChatList from './components/ChatList';
import ChatContent from './components/ChatContent';
import ChatMember from './components/ChatMember';

const drawerWidth = 300;
const rightWidth = 280;

const Project = () => {
  const { projectId } = useParams();
  const { projects } = useProjectList(); // หรือดึงจาก Redux
  const user = useSelector(state => state.auth.user);

  const [selectedRoom, setSelectedRoom] = useState(null);

  // Mobile drawers
  const [mobileOpenLeft, setMobileOpenLeft] = useState(false);
  const [mobileOpenRight, setMobileOpenRight] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const handleDrawerToggleLeft = () => setMobileOpenLeft(!mobileOpenLeft);
  const handleDrawerToggleRight = () => setMobileOpenRight(!mobileOpenRight);

  const chatListDrawer = (
    <Box sx={{ width: drawerWidth, height: '85vh' }}>
      <ChatList
        onSelect={(group) => {
          setSelectedRoom(group);
          if (isMobile) setMobileOpenLeft(false);
        }}
        projectId={projectId}
      />
    </Box>
  );

  const ChatMemberDrawer = (
    <Box sx={{ width: rightWidth, height: '85vh' }}>
      <ChatMember projectId={projectId} currentUserId={user?.uid} />
    </Box>
  );

  // ตรวจสอบว่า user มีสิทธิ์ใน projectId นี้หรือไม่
  const hasAccess = projects.some(p => p.id === projectId);

  if (!hasAccess) {
    // redirect ไปหน้า 404 หรือหน้า dashboard
    return <Navigate to="/" replace />;
    // หรือ return <div>Access Denied</div>
  }

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
              
              <IconButton
                color="inherit"
                aria-label="open members list"
                edge="end"
                onClick={handleDrawerToggleRight}
              >
                <GroupIcon />
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
              {chatListDrawer}
            </Drawer>
          ) : (
            <Box sx={{ width: drawerWidth, display: { xs: 'none', lg: 'block' } }}>
              {chatListDrawer}
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
            }}
          >
            <ChatContent
              selectedRoomName={selectedRoom?.name}
              selectedRoomId={selectedRoom?.id}
              projectId={projectId}
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
              {ChatMemberDrawer}
            </Drawer>
          ) : (
            <Box sx={{ width: rightWidth, display: { xs: 'none', lg: 'block' }, pl: 1 }}>
              {ChatMemberDrawer}
            </Box>
          )}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Project;
