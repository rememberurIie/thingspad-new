import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ChatList = ({ onSelect, projectId }) => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);

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

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const run = async () => {
      try {
        const res = await fetch('http://192.168.1.38:3000/api/project/getProjectData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
          signal,
        });
        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let end = buffer.indexOf('\n\n');
          while (end !== -1) {
            const chunk = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);

            if (chunk.startsWith('data: ')) {
              try {
                const evt = JSON.parse(chunk.substring(6));

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
              } catch (e) {
                console.error('JSON parse error:', e);
              }
            }

            end = buffer.indexOf('\n\n');
          }
        }
      } catch (err) {
        if (!signal.aborted) console.error('Error fetching group list:', err);
      }
    };

    run();
    return () => controller.abort();
  }, [projectId]);

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
