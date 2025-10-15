import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemText, IconButton, Box,
  Menu, MenuItem, CircularProgress, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import useSSE from '../../../../hook/useSSE';
import { getCachedAvatarUrl } from '../../../../utils/avatarCache';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDirectMessageList } from '../../../../contexts/DirectMessageListContext';

//api
const API_ENDPOINTS = {
  getDMList: 'http://192.168.1.36:3000/api/dm/getDMList',
  getUserToCreateDM: 'http://192.168.1.36:3000/api/dm/getUserToCreateDM',
  createDM: 'http://192.168.1.36:3000/api/dm/createDM',
};

const DirectMessageList = ({ onSelect, userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { t } = useTranslation();
  const { dms, setDms, selectedDm, setSelectedDm } = useDirectMessageList();

  // State
  const [anchorEl, setAnchorEl] = useState(null);
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [search, setSearch] = useState('');
  const [dmSearch, setDmSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // SSE: DM List
  useSSE(
    userId ? API_ENDPOINTS.getDMList : null,
    (data) => {
      if (data.type === 'dmList' && Array.isArray(data.payload)) {
        const merged = data.payload.map(dm => ({
          id: dm.dmId,
          name: dm.username,
          ...dm,
        })).sort((a, b) => {
          const aSec = a.latestMessage?.createdAt?._seconds ?? 0;
          const bSec = b.latestMessage?.createdAt?._seconds ?? 0;
          return bSec - aSec;
        });
        setDms(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(merged)) {
            return merged;
          }
          return prev;
        });
        setLoading(false);
      }
    },
    userId ? { userId } : null
  );

  // Fetch people to create DM with
  const handleOpenMenu = async (event) => {
    setAnchorEl(event.currentTarget);
    setLoadingPeople(true);
    try {
      const res = await fetch(API_ENDPOINTS.getUserToCreateDM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setPeople(data.users || []);
    } catch {
      setPeople([]);
    }
    setLoadingPeople(false);
    setSearch('');
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSearch('');
  };

  const handleSelectPerson = async (person) => {
    handleCloseMenu();
    try {
      const res = await fetch(API_ENDPOINTS.createDM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId1: userId,
          userId2: person.userId,
        }),
      });
      const data = await res.json();
      if (onSelect && data.dm) {
        onSelect(data.dm);
      }
    } catch (err) {
      console.error('Failed to create DM:', err);
    }
  };

  // Filter people by search
  const filteredPeople = people.filter(person =>
    (person.fullName || person.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Filter DMs by search
  const filteredDms = dms.filter(dm =>
    (dm.fullName || dm.name || dm.username || '')
      .toLowerCase()
      .includes(dmSearch.toLowerCase())
  );

  // Auto-select the first DM in the filtered list
  useEffect(() => {
    if (filteredDms.length > 0 && !selectedDm) {
      setSelectedDm(filteredDms[0]);
      onSelect?.(filteredDms[0]);
    }
  }, [filteredDms, selectedDm, setSelectedDm, onSelect]);

  // เมื่อ rooms เปลี่ยน (เช่นหลังโหลดเสร็จ) ให้ setLoading(false)
  useEffect(() => {
    if (filteredDms.length > 0) setLoading(false);
  }, [filteredDms]);

  // Loading spinner
  if (loading) {
    return (
      <Card variant="outlined" sx={{
        height: '100%',
        overflowY: 'auto',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress size="30px" sx={{ color: theme.palette.grey[500] }} />
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: isMobile ? '100vh' : '89vh',
        overflowY: 'auto',
        borderRadius: isMobile ? 0 : '10px'
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" sx={{ mt: "-7px" }}>
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            {t('dm.list_header')}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleOpenMenu}
            sx={{ mr: '-10px' }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* Menu for creating DM */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: { minWidth: 300, py: 1, px: 2, borderRadius: 2 }
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            {t('dm.find_user')}
          </Typography>
          <Box sx={{ pt: 1, pb: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder={t('dm.search_user_box')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ mb: 1 }}
            />
          </Box>
          {loadingPeople ? (
            <MenuItem sx={{ minWidth: 240, ml: "-12px" }} disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} /> {t('Loading...')}
            </MenuItem>
          ) : filteredPeople.length === 0 ? (
            <MenuItem disabled>{t('No users found')}</MenuItem>
          ) : (
            filteredPeople.map((person) => (
              <MenuItem
                key={person.id}
                onClick={() => handleSelectPerson(person)}
                sx={{ minWidth: 240, ml: "-12px" }}
              >
                <Avatar
                  src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${person.userId}/avatar.jpg?${Date.now()}`}
                  sx={{ width: 30, height: 30, fontSize: 12, mr: 1 }}
                >
                  {(person.fullName || person.username || '??').slice(0, 2).toUpperCase()}
                </Avatar>
                {person.fullName || person.username || 'No Name'}
              </MenuItem>
            ))
          )}
        </Menu>

        {/* Search DM */}
        <TextField
          fullWidth
          size="small"
          placeholder={t('dm.search_chat_box')}
          value={dmSearch}
          onChange={e => setDmSearch(e.target.value)}
          sx={{ my: 1 }}
        />

        {/* DM List */}
        <List>
          {filteredDms.map((user) => {
            const contactAvatarUrl = getCachedAvatarUrl(user.userId);
            const msg = user.latestMessage;
            const isYou = msg?.senderId === userId;
            let secondary = null;
            if (msg) {
              if (msg.attachment) {
                let typeLabel = 'attachment';
                if (msg.attachment.contentType?.startsWith('image/')) typeLabel = 'photo';
                else if (msg.attachment.contentType?.startsWith('video/')) typeLabel = 'video';
                secondary = (
                  <span style={{ color: '#888', fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isYou ? 'you: send' : 'send'} {typeLabel}
                  </span>
                );
              } else if (isYou) {
                secondary = (
                  <span style={{ color: '#888', fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    you: {msg.text}
                  </span>
                );
              } else {
                secondary = (
                  <span style={{ color: '#888', fontSize: 13, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.text}
                  </span>
                );
              }
            }
            return (
              <ListItem
                key={user.id}
                sx={{
                  bgcolor: selectedDm?.id === user.id ? theme.palette.action.hover : 'inherit',
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  pl: 1.5
                }}
                button
                selected={selectedDm?.id === user.id}
                onClick={() => {
                  setSelectedDm(user);
                  onSelect?.(user);
                }}
              >
                <Avatar
                  src={contactAvatarUrl}
                  sx={{ width: 40, height: 40, fontSize: 15 }}
                >
                  {user?.fullName
                    ? user.fullName.slice(0, 2).toUpperCase()
                    : "??"}
                </Avatar>
                <ListItemText
                  sx={{ pl: 1.5 }}
                  primary={user?.fullName || 'No Name'}
                  secondary={secondary}
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default DirectMessageList;
