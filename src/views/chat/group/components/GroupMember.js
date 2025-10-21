import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Box, IconButton, TextField, Button, CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSSE from '../../../../hook/useSSE';
import { getCachedAvatarUrl } from '../../../../utils/avatarCache';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';


import { useGroupMessageList } from '../../../../contexts/GroupMessageListContext'; // <-- import context

const ChatMember = ({ onSelect, selectedGroup, currentUserId }) => {
  const theme = useTheme(); // <-- get theme
  const { t } = useTranslation();
  const {
    membersByGroupId,
    setMembersForGroup
  } = useGroupMessageList(); // <-- use context

  const members = membersByGroupId[selectedGroup] || []; // <-- get from context
  const [editMode, setEditMode] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // เพิ่มเช็ค mobile

  // Add user modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addList, setAddList] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addingUserId, setAddingUserId] = useState(null);
  const [addSearch, setAddSearch] = useState('');

  const sortByFullName = (arr) =>
    arr.slice().sort((a, b) =>
      (a.fullName || '').localeCompare(b.fullName || '', undefined, { sensitivity: 'base' })
    );

  // Use SSE for users and user events
  useSSE(
    selectedGroup ? 'http://192.168.1.36:3000/api/group/getGroupMember' : null,
    (evt) => {
      if (evt.type === 'members' && Array.isArray(evt.payload)) {
        setMembersForGroup(
          selectedGroup,
          sortByFullName(
            evt.payload.map(u => ({
              id: u.userId,
              fullName: u.fullName || '',
              username: u.username || '',
              avatarUrl: u.avatarUrl || '',
              email: u.email || '',
              role: u.role || '',
            }))
          )
        );
      }
    },
    selectedGroup ? { groupId: selectedGroup } : undefined
  );

  // --- Add User Logic ---
  const handleOpenAdd = async () => {
    setShowAdd(true);
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch('http://192.168.1.36:3000/api/group/getUserToAdd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedGroup }),
      });
      const data = await res.json();
      setAddList(
        (data.users || []).map(u => ({
          id: u.userId,
          fullName: u.fullName || '',
          username: u.username || '',
          avatarUrl: u.avatarUrl || '',
        }))
      );
    } catch {
      setAddList([]);
      setAddError('Failed to load users');
    }
    setAddLoading(false);
  };

  const handleAddUser = async (userId) => {
    setAddingUserId(userId);
    try {
      await fetch('http://192.168.1.36:3000/api/group/toggleUserinGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedGroup, userId, isMember: false }),
      });
      setAddList(list => list.filter(u => u.id !== userId));
      // Optionally: refetch members or rely on SSE update
    } catch {
      setAddError('Failed to add user');
    }
    setAddingUserId(null);
  };

  // --- Remove User Logic ---
  const handleRemoveUser = async (userId) => {
    setAddingUserId(userId);
    try {
      await fetch('http://192.168.1.36:3000/api/group/toggleUserinGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedGroup, userId, isMember: true }),
      });
      setConfirmRemoveId(null);
      // Optionally: refetch members or rely on SSE update
    } catch {
      // handle error if needed
    }
    setAddingUserId(null);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: isMobile ? '100vh' : '89vh',
        overflowY: 'auto',
        borderRadius: isMobile ? 0 : '10px'
      }}
    >      <CardContent>
        <Box display="flex" alignItems="center" sx={{ mt: "-7px" }}>
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            {t('project.members') || 'Users'}
          </Typography>
          <IconButton
            color={editMode ? "primary" : "inherit"}
            onClick={() => {
              setEditMode(!editMode);
              setConfirmRemoveId(null);
            }}
            sx={{ mr: '-10px', mt: '-5px' }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color={showAdd ? "primary" : "inherit"}
            onClick={() => {
              if (showAdd) {
                setShowAdd(false);
                setAddList([]);
                setAddError('');
              } else {
                handleOpenAdd();
              }
            }}
            sx={{ mr: '-10px', mt: '-5px' }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* Add User Modal */}
        {showAdd &&
          ReactDOM.createPortal(
            <Box
              sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.25)',
                zIndex: 4000,
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Box
                sx={{
                  width: 350,
                  height: 350,
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: 24,
                  p: 3,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="subtitle1" mb={2} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {t('group.popup_member_header')}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('group.popup_member_searchbox')}
                  value={addSearch}
                  onChange={e => setAddSearch(e.target.value)}
                  sx={{ mb: 2 }}
                />
                {addLoading ? (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CircularProgress size={18} /> Loading...
                  </Box>
                ) : addList.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">{t('group.popup_member_nouser')}</Typography>
                ) : (
                  <List>
                    {addList
                      .filter(u =>
                        (u.fullName || u.username || '')
                          .toLowerCase()
                          .includes(addSearch.toLowerCase())
                      )
                      .map(u => (
                        <ListItem key={u.id} secondaryAction={
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAddUser(u.id)}
                            disabled={addingUserId === u.id}
                          >
                            {addingUserId === u.id ? t('group.popup_member_adding') : t('group.popup_member_add')}
                          </Button>
                        }>
                          <ListItemAvatar>
                            <Avatar src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${u.id}/avatar.jpg?${Date.now()}`}>
                              {(u.fullName || u.username || '??').slice(0, 2).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={u.fullName || u.username || u.id}
                            secondary={u.username ? `@${u.username}` : null}
                          />
                        </ListItem>
                      ))}
                  </List>
                )}
                {addError && <Typography color="error" variant="body2" mt={1}>{addError}</Typography>}
                <IconButton
                  onClick={() => {
                    setShowAdd(false);
                    setAddList([]);
                    setAddError('');
                    setAddSearch('');
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>,
            document.body
          )
        }

        <List>
          {members.map((u) => {
            const initials =
              (u.fullName?.trim().slice(0, 2)) ||
              (u.username?.trim().slice(0, 2)) ||
              '??';

            const memberAvatarUrl = getCachedAvatarUrl(u.id);

            return (
              <ListItem
                key={u.id}
                button={!editMode}
                onClick={!editMode ? () => onSelect?.(u) : undefined}
                sx={{
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                  },
                }}
                secondaryAction={
                  // ไม่แสดงปุ่มลบถ้าเป็น user ตัวเอง
                  editMode && u.id !== currentUserId && (
                    <Box sx={{ mt: 0.5 }}>
                      {confirmRemoveId === u.id ? (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => handleRemoveUser(u.id)}
                            disabled={addingUserId === u.id}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            color="inherit"
                            onClick={() => setConfirmRemoveId(null)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton
                          color="error"
                          onClick={() => setConfirmRemoveId(u.id)}
                          disabled={addingUserId}
                          sx={{ marginRight: '-8px' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={memberAvatarUrl}
                    alt={initials.toUpperCase()}>
                    {(!u.avatarUrl || u.avatarUrl === '') && (
                      <Typography
                        sx={{
                          fontSize: 15,
                          letterSpacing: 1,
                        }}
                      >
                        {initials.toUpperCase()}
                      </Typography>
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Typography
                        variant="body1"
                        noWrap
                        sx={{
                          maxWidth: 120, // adjust as needed
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                        title={u.fullName || u.username || 'Unknown'}
                      >
                        {u.fullName || u.username || 'Unknown'}
                      </Typography>
                    </Box>
                  }
                  secondary={u.username ? `@${u.username}` : null}
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default ChatMember;
