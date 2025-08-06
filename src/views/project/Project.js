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
import MenuIcon from '@mui/icons-material/Menu';
import PageContainer from 'src/components/container/PageContainer';

// Components
import ChatList from './components/ChatList';
import ChatContent from './components/ChatContent';

const drawerWidth = 300;

const Project = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, height: '85vh', /*p: 2*/ }}>
      <ChatList onSelect={(user) => {
        setSelectedUser(user);
        if (isMobile) setMobileOpen(false);
      }} />
    </Box>
  );

  return (
    <PageContainer title="Chat App" description="Responsive chat UI">
      <Box sx={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <AppBar position="static" color="default" elevation={0}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap>
                Chat app
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ flex: 0, display: 'flex' }}>
          {/* Drawer for mobile */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
            >
              {drawer}
            </Drawer>
          ) : (
            <Box sx={{ width: drawerWidth, display: { xs: 'none', lg: 'block' } }}>
              {drawer}
            </Box>
          )}

          {/* Chat content area */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              // p: 2,
              height: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ChatContent selectedUser={selectedUser} />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Project;
