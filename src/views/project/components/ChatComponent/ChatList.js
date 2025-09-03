import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography,
  List, ListItem, ListItemText, Divider, CircularProgress, Box, IconButton, TextField, Button // เพิ่ม CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Add this import
import { useTranslation } from 'react-i18next';
import useSSE from '../../../../hook/useSSE';
import { useChatList } from '../../../../contexts/ChatListContext';

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const ChatList = ({ onSelect, projectId, selectedRoomId }) => {
  const { t } = useTranslation();
  const { rooms, setRooms } = useChatList();
  const theme = useTheme(); // Add this line
  const [loading, setLoading] = useState(true); // เพิ่ม state loading
  const [showInput, setShowInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null); // Track open menu ID

  // เมื่อ rooms เปลี่ยน (เช่นหลังโหลดเสร็จ) ให้ setLoading(false)
  React.useEffect(() => {
    if (rooms.length > 0) setLoading(false);
  }, [rooms]);

   // Show loading spinner when projectId changes
  useEffect(() => {
    setLoading(true);
  }, [projectId]);

  // --- SSE: Real-time room list ---
  useSSE(
    projectId ? 'http://192.168.1.32:3000/api/project/getRoomList' : null,
    (evt) => {
      // กรณี 1: { type: 'rooms', payload: [...] }
      if (Array.isArray(evt)) {
        setRooms(evt.map(r => ({
          ...r,
          id: r.id,
          name: r.name,
        })));
        setLoading(false);
      }
    },
    projectId ? { projectId } : undefined
  );

  

  const handleOpenMenuAddUser = () => {
    setShowInput((prev) => !prev);
  };

  // Add room
  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const res = await fetch('http://192.168.1.32:3000/api/project/createRoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, roomName: newRoomName }),
      });
      const data = await res.json();
      if (data.room) {
        setRooms(prev => [
          ...prev,
          {
            ...data.room,
            id: data.room.roomId || data.room.id,
            name: data.room.roomName || data.room.name,
          }
        ]);
      }
    } catch {}
    setNewRoomName('');
    setShowInput(false);
  };

  // Edit room name
  const handleEditNameSave = async () => {
    if (!editName.trim()) return;
    try {
      await fetch('http://192.168.1.32:3000/api/project/updateRoomName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, roomId: editingId, newName: editName }),
      });
      setRooms(prev =>
        prev.map(r => r.id === editingId ? { ...r, name: editName } : r)
      );
      // แจ้ง parent ว่าห้องนี้ชื่อใหม่แล้ว (ถ้าเลือกอยู่)
      if (selectedRoomId === editingId && onSelect) {
        const updatedRoom = rooms.find(r => r.id === editingId);
        if (updatedRoom) onSelect({ ...updatedRoom, name: editName });
      }
    } catch {}
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await fetch('http://192.168.1.32:3000/api/project/deleteRoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, roomId }),
      });
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (selectedRoomId === roomId) setSelectedId(null);
    } catch {}
  };

  const handleEditRoom = (group) => {
    setEditingId(group.id);
    setEditName(group.name || '');
    setMenuOpenId(null);
  };

  // ถ้ายัง loading และ rooms มีมากกว่า 0 ให้โชว์ spinner
  if (loading) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          overflowY: 'auto',
          borderRadius: { xs: 0, lg: '10px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={30} sx={{ color: theme.palette.grey[500] }} />
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: { xs: 0, lg: '10px' } }}>
      <CardContent>
        <Box display="flex" alignItems="center" sx={{ mt: "-7px" }}>
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            {t('project.rooms')}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleOpenMenuAddUser}
            sx={{ mr: '-10px', mt: '-5px'}}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {showInput && (
          <Box display="flex" alignItems="center" gap={1} my={2}>
            <TextField
              size="small"
              variant="outlined"
              placeholder={t('project.newroom_name')}
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              autoFocus
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddRoom}
              disabled={!newRoomName.trim()}
            >
              {t('project.newroom_create')}
            </Button>
          </Box>
        )}

        <List>
          {rooms.map((group, idx) => (
            <React.Fragment key={group.id}>
              <ListItem
                button
                onClick={() => {
                  onSelect?.(group);
                }}
                selected={selectedRoomId === group.id}
                onMouseEnter={() => setHoveredId(group.id)}
                onMouseLeave={() => {
                  setHoveredId(null);
                  setMenuOpenId(null); // <-- Close menu when unhover
                }}
                sx={{
                  bgcolor: selectedRoomId === group.id ? theme.palette.action.hover : 'inherit',
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
              >
                <Typography variant="h5" sx={{ pr: 1 }}>#</Typography>
                {editingId === group.id ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mr:"-10px" }}>
                    <TextField
                      size="small"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditNameSave();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                    />
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handleEditNameSave}
                      disabled={!editName.trim()}
                      sx={{ ml: 0.5 }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="inherit"
                      onClick={() => setEditingId(null)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <ListItemText primary={group?.name || 'No Name'} />
                    {hoveredId === group.id && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: "-10px"}}>
                        {menuOpenId === group.id ? (
                          <>
                            <IconButton size="small" onClick={e => { e.stopPropagation(); handleEditRoom(group); }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={e => { e.stopPropagation(); handleDeleteRoom(group.id); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={e => { e.stopPropagation(); setMenuOpenId(null); }}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={e => { e.stopPropagation(); setMenuOpenId(group.id); }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ChatList;