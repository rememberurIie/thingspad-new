import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Tooltip
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';
import Profile from './Profile';
import PropTypes from 'prop-types';

const Header = ({
  toggleSidebar,
  toggleMobileSidebar,
  toggleSidebarMinimized,
  isSidebarMinimized,
  fullName,
  username
}) => {
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  // notification menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBarStyled position='sticky' color='default'>
      <ToolbarStyled>
        <IconButton
          color='inherit'
          aria-label='menu'
          onClick={toggleMobileSidebar}
          sx={{ display: { lg: 'none', xs: 'inline' } }}
        >
          <IconMenu width='20' height='20' />
        </IconButton>

        <Box sx={{ display: { lg: 'inline', xs: 'none' }, ml: 2 }}>
          <Tooltip title={isSidebarMinimized ? "Expand" : "Minimize"}>
            <IconButton onClick={toggleSidebarMinimized} size="small">
              {isSidebarMinimized ? <MenuIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box>
          <IconButton
            aria-label='show notifications'
            color='inherit'
            aria-controls='notification-menu'
            aria-haspopup='true'
            onClick={handleClick}
          >
            <Badge variant='dot' color='primary'>
              <IconBellRinging size='21' stroke='1.5' />
            </Badge>
          </IconButton>

          <Menu
            id='notification-menu'
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorReference='anchorPosition'
            anchorPosition={menuPosition ? { top: menuPosition.top, left: menuPosition.left } : undefined}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  boxShadow: 9,
                  minWidth: '200px',
                },
              },
            }}
          >
            <MenuItem onClick={handleClose}>
              <Typography variant='body1'>Item 1</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Typography variant='body1'>Item 2</Typography>
            </MenuItem>
          </Menu>
        </Box>

        <Box flexGrow={1} />

        <Stack spacing={1} direction='row' alignItems='center'>
          <Stack direction="column" spacing={0} alignItems="flex-end">
            <Typography variant="body1">{fullName}</Typography>
            <Typography variant="body2" color="text.secondary">@{username}</Typography>
          </Stack>
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  toggleMobileSidebar: PropTypes.func.isRequired,
  toggleSidebarMinimized: PropTypes.func.isRequired,
  isSidebarMinimized: PropTypes.bool.isRequired,
  fullName: PropTypes.string,
  username: PropTypes.string,
};

export default Header;
