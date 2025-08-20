import React, { useState } from 'react';
import {
  Card, CardContent, Typography,
  List, ListItem, ListItemText, Divider, CircularProgress // เพิ่ม CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Add this import
import { useTranslation } from 'react-i18next';
import useSSE from '../../../hook/useSSE';
import { useChatList } from '../../../contexts/ChatListContext';

const ChatList = ({ onSelect, projectId }) => {
  const { t } = useTranslation();
  const { rooms, setRooms } = useChatList();
  const theme = useTheme(); // Add this line
  const [selectedId, setSelectedId] = useState(null); // Track selected room
  const [loading, setLoading] = useState(true); // เพิ่ม state loading

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
    projectId ? 'http://192.168.1.38:3000/api/project/getProjectData' : null,
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
        <Typography variant="h6" gutterBottom>
          {t('project.rooms')}
        </Typography>

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
                sx={{
                  bgcolor: selectedId === group.id ? theme.palette.action.hover : 'inherit',
                  borderRadius: 2,
                  transition: 'background 0.2s'
                }}
              >
                <Typography variant="h5" sx={{pr: 1}}>#</Typography>
                <ListItemText primary={group?.name || 'No Name'} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ChatList;
