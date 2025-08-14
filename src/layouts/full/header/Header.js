import React, { useState, useContext } from 'react';
import {
  Box,
  Divider,
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
import { useTheme } from "@mui/material/styles";

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';

import { ColorModeContext } from '../../../theme/ColorModeContext';
import LanguageSwitch from '../../../language/LanguageSwitch';


import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../session/authSlice";

const Header = ({
  toggleSidebar,
  toggleMobileSidebar,
  toggleSidebarMinimized,
  isSidebarMinimized,
  fullName,
  username
}) => {
  const { isDarkMode, toggle } = useContext(ColorModeContext);
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

  const theme = useTheme();

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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
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

        <Box sx={{ display: { lg: 'inline', xs: 'none' }, }}>
          <Tooltip>
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

        <Stack direction='row' alignItems='center'>

          <Tooltip>
            <span>
              <LanguageSwitch sx={{mx: 0.5, display: { xs: 'none', lg: 'flex' } }} />
            </span>
          </Tooltip>

          {/* ปุ่มสลับโหมด */}
          <Tooltip sx={{mx: 0.5, display: { xs: 'none', lg: 'flex' } }}>
            <IconButton
              aria-label='toggle color mode'
              color='inherit'
              onClick={toggle}
              size='small'
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5 ,height: 40, orderRightWidth: 2, alignSelf: 'center', display: { xs: 'none', lg: 'flex' } }}
          />

          <Stack direction="column" spacing={0} alignItems="flex-end" sx={{ pl: '9px', display: { xs: 'none', lg: 'flex' } }}>
            <Typography variant="body1" color={theme.palette.grey[600]}>{fullName}</Typography>
            <Typography variant="body2" color={theme.palette.grey[500]}>@{username}</Typography>
          </Stack>
          <Profile fullName={fullName} username={username} handleLogout={handleLogout} sx={{ px: '-10px'}} />

          <Tooltip sx={{display: { xs: 'none', lg: 'flex' } }}>
            <IconButton
              aria-label='logout'
              color='inherit'
              size='small'
              onClick={handleLogout}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>

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
