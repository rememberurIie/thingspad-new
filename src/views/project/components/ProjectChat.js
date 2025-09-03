import React, { useState, useEffect } from 'react';
import {
   Box,
   useMediaQuery,
   Drawer,
   IconButton,
   AppBar,
   Toolbar,
   Card
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';

import ChatList from './ChatComponent/ChatList';
import ChatContent from './ChatComponent/ChatContent';
import ChatMember from './ChatComponent/ChatMember';

import PageContainer from 'src/components/container/PageContainer';


const drawerWidth = 300;
const rightWidth = 280;

const ProjectChat = ({ projectId, user, projects }) => {
   const [selectedRoom, setSelectedRoom] = useState(null);
   const [mobileOpenLeft, setMobileOpenLeft] = useState(false);
   const [mobileOpenRight, setMobileOpenRight] = useState(false);
   const isMobile = useMediaQuery((theme) => theme.breakpoints.down('lg'));

   console.log(selectedRoom);

   useEffect(() => {
      // Reset selectedRoom ทุกครั้งที่ projectId เปลี่ยน
      setSelectedRoom(null);
   }, [projectId]);

   useEffect(() => {
      // ถ้า project ใหม่มี room ให้เลือกห้องแรก, ถ้าไม่มีให้ selectedRoom เป็น null
      const project = projects?.find((p) => p.id === projectId);
      if (project?.rooms?.length > 0) {
        setSelectedRoom(project.rooms[0]);
      } else {
        setSelectedRoom(null);
      }
   }, [projectId, projects]);

   const handleDrawerToggleLeft = () => setMobileOpenLeft(!mobileOpenLeft);
   const handleDrawerToggleRight = () => setMobileOpenRight(!mobileOpenRight);

   const chatListDrawer = (
      <Box sx={{ width: drawerWidth, height: '100vh', display: 'flex', flexDirection: 'column' }}>
         <ChatList
            onSelect={(group) => {
               setSelectedRoom(group);
               if (isMobile) setMobileOpenLeft(false);
            }}
            projectId={projectId}
            selectedRoomId={selectedRoom?.id}
         />
      </Box>
   );

   const ChatMemberDrawer = (
      <Box sx={{ width: rightWidth }}>
         <ChatMember projectId={projectId} currentUserId={user?.uid} />
      </Box>
   );

   return (
      <>
         {/* Left drawer / column */}

         {isMobile ? (
            <Drawer
               variant="temporary"
               open={mobileOpenLeft}
               onClose={handleDrawerToggleLeft}
               ModalProps={{ keepMounted: true }}
               sx={{
                  '& .MuiDrawer-paper': {
                     width: drawerWidth,
                     height: '100vh',
                     display: 'flex',
                     flexDirection: 'column',
                     borderRadius: 0, // Remove border radius
                  }
               }}
            >
               {chatListDrawer}
            </Drawer>
         ) : (
            <Box
               sx={{
                  width: drawerWidth,
                  minWidth: drawerWidth,
                  maxWidth: drawerWidth,
                  display: { xs: 'none', lg: 'block' },
                  minHeight: 0,
               }}
            >
               <ChatList
                  onSelect={(group) => {
                     setSelectedRoom(group);
                     if (isMobile) setMobileOpenLeft(false);
                  }}
                  projectId={projectId}
                  selectedRoomId={selectedRoom?.id}
               />
            </Box>
         )}
         {/* Middle content */}
         <Box
            component="main"
            sx={{
               flex: '1 1 0%',
               minWidth: 0,
               minHeight: 0,
               overflow: 'hidden',
               display: 'flex',
               flexDirection: 'column',
               px: { xs: 0, lg: 1 },
               width: '100%',
               borderRadius: 0, // Remove border radius if any
            }}
         >
            <ChatContent
               selectedRoomName={selectedRoom?.name}
               selectedRoomId={selectedRoom?.id}
               projectId={projectId}
               currentUserId={user?.uid}
               isMobile={isMobile}
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
               sx={{ '& .MuiDrawer-paper': { width: rightWidth, borderRadius: 0 } }}
            >
               {ChatMemberDrawer}
            </Drawer>
         ) : (
            <Box
               sx={{
                  width: rightWidth,
                  minWidth: rightWidth,
                  maxWidth: rightWidth,
                  display: { xs: 'none', lg: 'block' },
                  minHeight: 0,
               }}
            >
               <ChatMember projectId={projectId} currentUserId={user?.uid} />
            </Box>
         )}
      </>

   );
};

export default ProjectChat;