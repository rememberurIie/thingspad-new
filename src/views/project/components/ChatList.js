import React, { useState } from 'react';
import {
  Card, CardContent, Typography,
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSSE from '../../../hook/useSSE';

import { useChatList } from '../../../contexts/ChatListContext'; // create similar to ProjectListContext


const ChatList = ({ onSelect, projectId }) => {
  const { t } = useTranslation();
  const { rooms, setRooms } = useChatList();

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

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('project.rooms')}
        </Typography>

        <List>
          {rooms.map((group, idx) => (
            <React.Fragment key={group.id}>
              <ListItem button onClick={() => onSelect?.(group)}>
                <Typography variant="h5" sx={{pr: 1}}>#</Typography>
                <ListItemText primary={group?.name || 'No Name'} />
              </ListItem>
              {idx !== rooms.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ChatList;
