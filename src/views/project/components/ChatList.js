import React, { useState } from 'react';
import {
  Card, CardContent, Typography,
  List, ListItem, ListItemText, Divider, CircularProgress, Box, IconButton, TextField, Button // เพิ่ม CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Add this import
import { useTranslation } from 'react-i18next';
import useSSE from '../../../hook/useSSE';
import { useChatList } from '../../../contexts/ChatListContext';

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const ChatList = ({ onSelect, projectId }) => {
  const { t } = useTranslation();
  const { rooms, setRooms } = useChatList();
  const theme = useTheme(); // Add this line
  const [selectedId, setSelectedId] = useState(null); // Track selected room
  const [loading, setLoading] = useState(true); // เพิ่ม state loading
  const [showInput, setShowInput] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null); // Track open menu ID

  // Auto-select the first room in the list
  React.useEffect(() => {
    if (rooms.length > 0 && !selectedId) {
      setSelectedId(rooms[0].id);
      onSelect?.(rooms[0]);
    }
  }, [rooms, selectedId, onSelect]);

  // เมื่อ rooms เปลี่ยน (เช่นหลังโหลดเสร็จ) ให้ setLoading(false)
  React.useEffect(() => {
    if (rooms.length > 0) setLoading(false);
  }, [rooms]);

  // Get comparable timestamp (seconds) from various shapes
  const getCreatedAt = (room) => {
    const ca = room?.createdAt;
    if (!ca) return Infinity;
    if (typeof ca === 'number') return ca;                       // plain epoch seconds
    if (typeof ca === 'string') return Date.parse(ca) / 1000;    // ISO string
    if (typeof ca?._seconds === 'number') return ca._seconds;    // Firestore TS from API
    if (typeof ca?.seconds === 'number') return ca.seconds;      // Firestore TS from SDK
    return Infinity;
  };

  // SSE handler for groupData events
  useSSE(
    projectId ? 'http://192.168.1.34:3000/api/project/getProjectData' : null,
    (evt) => {
      // Expect: { type: 'groupData', groupId, payload }
      if (evt?.type === 'groupData' && evt?.groupId && evt?.payload) {
        setRooms((prev) => {
          const idx = prev.findIndex(r => r.id === evt.groupId);
          const nextRoom = { id: evt.groupId, ...evt.payload };

          let next;
          if (idx !== -1) {
            next = [...prev];
            next[idx] = nextRoom;
          } else {
            next = [...prev, nextRoom];
          }

          next.sort((a, b) => getCreatedAt(a) - getCreatedAt(b)); // oldest first
          return next;
        });
      }
    },
    projectId ? { projectId } : undefined
  );

  const handleOpenMenuAddUser = () => {
    setShowInput((prev) => !prev);
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) return;
    // TODO: Replace with your API call to create a new room
    // Example:
    // await fetch('/api/project/createRoom', { method: 'POST', body: JSON.stringify({ name: newRoomName, projectId }) });
    setRooms(prev => [
      ...prev,
      { id: `temp-${Date.now()}`, name: newRoomName }
    ]);
    setNewRoomName('');
    setShowInput(false);
  };

  const handleEditRoom = (room) => {
    setEditingId(room.id);
    setEditName(room.name);
  };

  const handleEditNameSave = () => {
    setRooms(prev =>
      prev.map(r => r.id === editingId ? { ...r, name: editName } : r)
    );
    setEditingId(null);
    setEditName('');
  };

  const handleDeleteRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    if (selectedId === roomId) setSelectedId(null);
  };

  // ถ้ายัง loading ให้โชว์ spinner
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size="30px" sx={{ color: theme.palette.grey[500] }} />
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px' }}>
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
                  setSelectedId(group.id);
                  onSelect?.(group);
                }}
                selected={selectedId === group.id}
                onMouseEnter={() => setHoveredId(group.id)}
                onMouseLeave={() => {
                  setHoveredId(null);
                  setMenuOpenId(null); // <-- Close menu when unhover
                }}
                sx={{
                  bgcolor: selectedId === group.id ? theme.palette.action.hover : 'inherit',
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
