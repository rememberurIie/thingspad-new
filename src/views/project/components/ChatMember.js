import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ChatMember = ({ onSelect, projectId }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);

  const sortByFullName = (arr) =>
    arr.slice().sort((a, b) =>
      (a.fullName || '').localeCompare(b.fullName || '', undefined, { sensitivity: 'base' })
    );

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchUsersViaSSE = async () => {
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

          let messageEnd = buffer.indexOf('\n\n');
          while (messageEnd !== -1) {
            const chunk = buffer.slice(0, messageEnd);
            buffer = buffer.slice(messageEnd + 2);

            if (chunk.startsWith('data: ')) {
              try {
                const evt = JSON.parse(chunk.substring(6));

                if (evt.type === 'users' && Array.isArray(evt.payload)) {
                  // Replace entire list and sort
                  setMembers(
                    sortByFullName(
                      evt.payload.map(u => ({
                        id: u.id,
                        fullName: u.fullName || '',
                        username: u.username || '',
                        avatarUrl: u.avatarUrl || '',
                      }))
                    )
                  );
                } else if (evt.type === 'user' && evt.payload) {
                  // Upsert and sort
                  setMembers(prev => {
                    const idx = prev.findIndex(m => m.id === evt.payload.id);
                    const nextUser = {
                      id: evt.payload.id,
                      fullName: evt.payload.fullName || '',
                      username: evt.payload.username || '',
                      avatarUrl: evt.payload.avatarUrl || '',
                    };
                    let updated;
                    if (idx === -1) {
                      updated = [...prev, nextUser];
                    } else {
                      updated = [...prev];
                      updated[idx] = nextUser;
                    }
                    return sortByFullName(updated);
                  });
                }
              } catch (e) {
                console.error('JSON parse error:', e);
              }
            }

            messageEnd = buffer.indexOf('\n\n');
          }
        }
      } catch (err) {
        if (!signal.aborted) console.error('Error fetching users via SSE:', err);
      }
    };

    fetchUsersViaSSE();
    return () => controller.abort();
  }, [projectId]);

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('project.members') || 'Users'}
        </Typography>

        <List>
          {members.map((u) => {
            // Get first 2 chars from fullName, fallback to username, fallback to ??
            const initials =
              (u.fullName?.trim().slice(0, 2)) ||
              (u.username?.trim().slice(0, 2)) ||
              '??';

            return (
              <ListItem key={u.id} button onClick={() => onSelect?.(u)}>
                <ListItemAvatar>
                  <Avatar src={u.avatarUrl} alt={initials.toUpperCase()}>
                    {(!u.avatarUrl || u.avatarUrl === '') && (
                      <Typography
                        sx={{
                          fontSize: 15, // Adjust this value as needed
                          letterSpacing: 1,
                        }}
                      >
                        {initials.toUpperCase()}
                      </Typography>
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.fullName || u.username || 'Unknown'}
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
