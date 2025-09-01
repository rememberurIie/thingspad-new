import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemText, Divider, IconButton, Box,
  Menu, MenuItem, CircularProgress, TextField, Button, Checkbox
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSSE from '../../../../hook/useSSE'; // Add this import
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useGroupMessageList } from '../../../../contexts/GroupMessageListContext'; // Adjust the import path as needed


const GroupMessageList = ({ onSelect, userId }) => {
  const theme = useTheme(); // <-- get theme
  const { t } = useTranslation();
  const user = useSelector(state => state.auth.user);


  const { groups, setGroups } = useGroupMessageList();
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true); // เพิ่ม state loading
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [userList, setUserList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([userId]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [createError, setCreateError] = useState('');

  // --- SSE for Group List ---
  useSSE(
    userId ? 'http://localhost:3000/api/group/getGroupList' : null,
    (data) => {
      if (data.type === 'groupList' && Array.isArray(data.payload)) {
        // แทนที่ทั้ง array เลย ไม่ต้อง merge
        const merged = data.payload.map(group => ({
          id: group.groupId,
          name: group.groupName,
          ...group,
        })).sort((a, b) => {
          const aSec = a.latestMessage?.createdAt?._seconds ?? 0;
          const bSec = b.latestMessage?.createdAt?._seconds ?? 0;
          return bSec - aSec;
        });
        setGroups(prev => {
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



  // Filter groups by search
  const filteredGroups = (groups || []).filter(group =>
  (group.fullName || group.name || group.username || '')
    .toLowerCase()
    .includes(groupSearch.toLowerCase())
);

  // Auto-select the first group in the filtered list
  React.useEffect(() => {
    if (filteredGroups.length > 0 && !selectedId) {
      setSelectedId(filteredGroups[0].id);
      onSelect?.(filteredGroups[0]);
    }
  }, [filteredGroups, selectedId, onSelect]);

  // เมื่อ rooms เปลี่ยน (เช่นหลังโหลดเสร็จ) ให้ setLoading(false)
    React.useEffect(() => {
      if (filteredGroups.length > 0) setLoading(false);
    }, [filteredGroups]);

  // ถ้ายัง loading ให้โชว์ spinner
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size="30px" sx={{ color: theme.palette.grey[500] }} />
      </Card>
    );
  }

  // Fetch user list for group creation
  const handleOpenCreate = async () => {
    setShowCreate(true);
    setCreateError('');
    setLoadingUsers(true);
    try {
      const res = await fetch('http://localhost:3000/api/group/getUserToCreateGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setUserList((data.users || []).map(u => ({
          ...u,
          id: u.userId, // เพิ่ม id สำหรับใช้ใน UI
        })));
    } catch (err) {
      setUserList([]);
    }
    setLoadingUsers(false);
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
    setNewGroupName('');
    setSelectedMembers([userId]);
    setCreateError('');
  };

  const handleToggleMember = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(uid => uid !== id)
        : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setCreateError('Group name required');
      return;
    }
    if (selectedMembers.length < 3) {
      setCreateError('Select at least 3 members (including you)');
      return;
    }
    setCreateError('');
    try {
      const res = await fetch('http://localhost:3000/api/group/createGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: newGroupName,
          memberIds: selectedMembers,
        }),
      });
      const data = await res.json();

      // ตรวจสอบ response ตามจริง
      if (data.group || data.groupId || data.success) {
        setShowCreate(false);
        setNewGroupName('');
        setSelectedMembers([userId]);
        setCreateError('');
        // Optionally auto-select new group
        onSelect?.({
          ...(data.group || {}),
          id: data.groupId || data.group?.groupId,
          groupName: data.groupName || newGroupName,
        });
      } else {
        setCreateError(data.error || 'Create group failed');
      }
    } catch (err) {
      setCreateError('Create group failed');
    }
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px' }}>
      <CardContent>
        <Box display="flex" alignItems="center" sx={{ mt: "-7px" }}>
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            {t('group.list_header')}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => {
              if (showCreate) {
                handleCloseCreate();
              } else {
                handleOpenCreate();
              }
            }}
            sx={{ mr: '-10px' }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* Create Group Dialog */}
        {showCreate && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'rgba(0,0,0,0.25)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: 370,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="subtitle2" mb={1} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                {t('group.popup_list_header')}
              </Typography>
              <Typography variant="subtitle2" mb={2}>
                {t('group.popup_list_description')}
              </Typography>
              <IconButton
                onClick={handleCloseCreate}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <CloseIcon />
              </IconButton>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  label={t('group.popup_list_group_name')}
                  size="small"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  fullWidth
                  sx={{ mr: 1 }}
                />
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('project.select_members', 'Select members (min 3)')}
              </Typography>
              {loadingUsers ? (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CircularProgress size={18} /> {t('Loading...')}
                </Box>
              ) : (
                <Box sx={{ maxHeight: 180, overflowY: 'auto', mb: 1 }}>
                  {userList.map(u => (
                    <Box key={u.id} display="flex" alignItems="center" mb={0.5}>
                      <Checkbox
                        checked={selectedMembers.includes(u.id)}
                        onChange={() => handleToggleMember(u.id)}
                        disabled={u.id === user?.uid || u.uid === user?.uid}
                        size="small"
                      />
                      <Avatar src={u.avatarUrl} sx={{ width: 28, height: 28, fontSize: 12, mr: 1 }}>
                        {(u.fullName || u.username || '??').slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{u.fullName || u.username || u.id}</Typography>
                    </Box>
                  ))}

                  {/* Always show yourself as checked and disabled
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Checkbox checked disabled size="small" />
                    <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: 12, bgcolor: 'primary.main' }}>
                      {(userList.find(u => u.id === userId)?.fullName || 'Me').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{t('group.popup_list_you')}</Typography>
                  </Box> */}
                </Box>
              )}
              {createError && <Typography color="error" variant="body2" mb={1}>{createError}</Typography>}
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedMembers.length < 3}
                fullWidth
              >
                {t('group.popup_list_submit_button')}
              </Button>
            </Box>
          </Box>
        )}

        <TextField
          fullWidth
          size="small"
          placeholder={t('group.search_chat_box')}
          value={groupSearch}
          onChange={e => setGroupSearch(e.target.value)}
          sx={{ my: 1 }}
        />

        <List>
          {filteredGroups.map((group, idx) => (
            <React.Fragment key={group.id}>
              <ListItem
                sx={{
                  bgcolor: selectedId === group.id ? theme.palette.action.hover : 'inherit',
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  pl: 1.5
                }}
                button
                selected={selectedId === group.id}
                onClick={() => {
                  setSelectedId(group.id);
                  onSelect?.(group);
                }}
              >
                <Avatar sx={{ width: 40, height: 40, fontSize: 15 }}>
                  {group?.groupName
                    ? group.groupName.slice(0, 2).toUpperCase()
                    : "??"}
                </Avatar>
                <ListItemText
                  sx={{ pl: 1.5 }}
                  primary={
                    <span
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={group?.groupName || 'No Name'}
                    >
                      {group?.groupName || 'No Name'}
                    </span>
                  }
                  secondary={
                    (() => {
                      const msg = group.latestMessage;
                      if (!msg) return null;
                      const isYou = msg.senderId === userId;
                      let text = '';
                      if (msg.attachment) {
                        let typeLabel = 'attachment';
                        if (msg.attachment.contentType?.startsWith('image/')) typeLabel = 'photo';
                        else if (msg.attachment.contentType?.startsWith('video/')) typeLabel = 'video';
                        text = `${isYou ? t('group.popup_list_you') + ': send' : 'send'} ${typeLabel}`;
                      } else if (isYou) {
                        text = `${t('group.popup_list_you')}: ${msg.text}`;
                      } else {
                        text = msg.text;
                      }
                      return (
                        <span
                          style={{
                            color: '#888',
                            fontSize: 13,
                            display: 'block',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={text}
                        >
                          {text}
                        </span>
                      );
                    })()
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default GroupMessageList;
