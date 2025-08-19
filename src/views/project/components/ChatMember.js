import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSSE from '../../../hook/useSSE';

const ChatMember = ({ onSelect, projectId }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);

  const sortByFullName = (arr) =>
    arr.slice().sort((a, b) =>
      (a.fullName || '').localeCompare(b.fullName || '', undefined, { sensitivity: 'base' })
    );

  // Use SSE for users and user events
  useSSE(
    projectId ? 'http://192.168.1.38:3000/api/project/getProjectData' : null,
    (evt) => {
      if (evt.type === 'users' && Array.isArray(evt.payload)) {
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
    },
    projectId ? { projectId } : undefined
  );

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('project.members') || 'Users'}
        </Typography>

        <List>
          {members.map((u) => {
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
