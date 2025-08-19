import React, { useState, useContext } from 'react';
import { Link } from 'react-router';
import {
  Avatar,
  Box,
  Menu,
  Button,
  Stack,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText, Typography
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";
import ProfileImg from 'src/assets/images/profile/user-1.jpg';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';

import { ColorModeContext } from '../../../theme/ColorModeContext';
import LanguageSwitch from '../../../language/LanguageSwitch';

import { useTranslation } from 'react-i18next';
  
const Profile = ({
  fullName,
  username,
  handleLogout // <-- receive as prop
}) => {

  const theme = useTheme();
  const { isDarkMode, toggle } = useContext(ColorModeContext);

  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const { t } = useTranslation();

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          sx={{
            width: 35,
            height: 35,
          }}
        >
          <Typography color={theme.palette.grey[100]}>{fullName ? fullName.slice(0, 2).toUpperCase() : ''}</Typography>
        </Avatar>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={(theme) => ({
          '& .MuiMenu-paper': {
            backgroundColor: (theme) => theme.palette.grey[50],
            width: '300px',
            display: { xs: 'flex', lg: 'none' },
            boxShadow: `0 0 20px 1px #42424233`, // blue glow + soft shadow
            borderRadius: 3,
          }})}
      >
        <MenuItem>
          <Stack direction="row" spacing={1} alignItems="center" width="100%">
            <LanguageSwitch />
            <IconButton
              aria-label='toggle color mode'
              color='inherit'
              onClick={e => { e.stopPropagation(); toggle(); }}
              size='small'
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Stack>
        </MenuItem>

        <MenuItem sx={{ mt: 2 }}>
          <Typography variant="body1" size="30px" color={theme.palette.grey[600]}>{t('header.profile')}</Typography>
        </MenuItem>

        <MenuItem sx={{ height: 100, display: 'flex', alignItems: 'center',mb: 2 }}>
          <Avatar
            sx={{
              width: 75,
              height: 75,
              mr: 2,
            }}
          >
            {fullName ? fullName.slice(0, 2).toUpperCase() : ''}
          </Avatar>
          <Stack direction="column" spacing={0} alignItems="flex-start">
            <Typography variant="body1" color={theme.palette.grey[600]}>{fullName}</Typography>
            <Typography variant="body2" color={theme.palette.grey[500]}>@{username}</Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Profile;
