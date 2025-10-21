import React, { useState, useContext, useMemo } from 'react';
import {
  Avatar,
  Box,
  Menu,
  Stack,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  TextField
} from '@mui/material';
import { useTheme } from "@mui/material/styles";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PasswordIcon from '@mui/icons-material/Password';
import ReactDOM from 'react-dom';

import { ColorModeContext } from '../../../theme/ColorModeContext';
import LanguageSwitch from '../../../language/LanguageSwitch';
import { useTranslation } from 'react-i18next';
import ProfileSettingDialog from './ProfileSettingDialog';
import { getCachedAvatarUrl } from '../../../utils/avatarCache';

const Profile = ({
  fullName,
  username,
  handleLogout,
  userId,
  email
}) => {
  const theme = useTheme();
  const { isDarkMode, toggle } = useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // สำหรับ edit password popup
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // สร้าง cached avatar URL
  const avatarUrl = useMemo(() => getCachedAvatarUrl(userId), [userId]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const { t } = useTranslation();

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Avatar
          src={avatarUrl}
          sx={{
            width: 35,
            height: 35,
          }}
        >
          <Typography color={theme.palette.grey[100]}>
            {fullName ? fullName.slice(0, 2).toUpperCase() : ''}
          </Typography>
        </Avatar>
        <IconButton
          size="small"
          aria-label="open profile menu"
          color="inherit"
          aria-controls="profile-menu"
          aria-haspopup="true"
          onClick={handleMenuClick}
        >
          <ArrowDropDownIcon />
        </IconButton>
      </Stack>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            backgroundColor: (theme) => theme.palette.grey[50],
            width: '300px',
            boxShadow: `0 0 20px 1px #42424233`,
            borderRadius: 3,
          }
        }}
      >
        <MenuItem sx={{display: { xs: 'flex', lg: 'none' } }} >
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

        <MenuItem >
          <Typography variant="body1" sx={{fontSize: '15px'}} color={theme.palette.grey[600]}>{t('header.profile')}</Typography>
        </MenuItem>

        <MenuItem sx={{ height: 100, display: 'flex', alignItems: 'center'}}>
          <Avatar
            src={avatarUrl}
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
        <MenuItem onClick={() => { handleMenuClose(); setProfileOpen(true); }}>
          <ListItemIcon>
            <ManageAccountsIcon />
          </ListItemIcon>
          <ListItemText>{t('profile.setting')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setPasswordOpen(true); }}>
          <ListItemIcon>
            <PasswordIcon />
          </ListItemIcon>
          <ListItemText>{t('profile.edit_password')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setLogoutOpen(true); }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText>{t('profile.logout')}</ListItemText>
        </MenuItem>
      </Menu>

      <ProfileSettingDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={{ fullName, username }}
        onSave={data => { setProfileOpen(false); /* handle save */ }}
      />

      {/* Edit Password Popup */}
      {passwordOpen &&
        ReactDOM.createPortal(
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.25)',
              zIndex: 3000,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Typography variant="h6" mb={1}>{t('profile.change_password')}</Typography>
              <TextField
                label={t('profile.old_password')}
                type="password"
                fullWidth
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label={t('profile.new_password')}
                type="password"
                fullWidth
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ minLength: 8 }}
              />
              <TextField
                label={t('profile.confirm_new_password')}
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ minLength: 8 }}
              />
              {editMessage && (
                <Typography variant="body2" color={editMessage.type === 'success' ? 'success.main' : 'error.main'}>
                  {editMessage.text}
                </Typography>
              )}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button disabled={editLoading} onClick={() => {
                  setPasswordOpen(false);
                  setEditMessage(null);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="contained"
                  disabled={
                    editLoading ||
                    !oldPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword.length < 8 ||
                    confirmPassword.length < 8 ||
                    newPassword !== confirmPassword
                  }
                  onClick={async () => {
                    setEditLoading(true);
                    setEditMessage(null);
                    try {
                      const res = await fetch('http://192.168.1.36:3000/api/account/editPassword', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          uid: userId,
                          email: email,
                          oldPassword,
                          newPassword,
                        }),
                      });
                      if (!res.ok) {
                        const err = await res.text();
                        throw new Error(err || `Status ${res.status}`);
                      }
                      setEditMessage({ type: 'success', text: 'Password changed successfully.' });
                      setTimeout(() => {
                        setPasswordOpen(false);
                        setEditLoading(false);
                        setEditMessage(null);
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }, 1500);
                    } catch (err) {
                      setEditMessage({ type: 'error', text: 'Failed to change password.' });
                      setEditLoading(false);
                    }
                  }}
                >
                  {editLoading ? t('common.saving') : t('common.save')}
                </Button>
              </Stack>
            </Box>
          </Box>,
          document.body
        )
      }

      {/* Confirm Logout Popup */}
      {logoutOpen &&
        ReactDOM.createPortal(
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.25)',
              zIndex: 3000,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 350,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Typography variant="h6" mb={2}>{t('profile.confirm_logout')}</Typography>
              <Typography mb={3}>{t('profile.confirm_logout_text')}</Typography>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => setLogoutOpen(false)}>{t('common.cancel')}</Button>
                <Button variant="contained" color="error" onClick={handleLogout}>{t('profile.logout')}</Button>
              </Stack>
            </Box>
          </Box>,
          document.body
        )
      }
    </Box>
  );
};

export default Profile;
