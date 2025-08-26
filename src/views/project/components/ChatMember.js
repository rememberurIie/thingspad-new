import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemAvatar, ListItemText,  Box, IconButton, TextField, Button 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSSE from '../../../hook/useSSE';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const ChatMember = ({ onSelect, projectId }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);

  const sortByFullName = (arr) =>
    arr.slice().sort((a, b) =>
      (a.fullName || '').localeCompare(b.fullName || '', undefined, { sensitivity: 'base' })
    );

  // Use SSE for users and user events
  useSSE(
    projectId ? 'http://192.168.1.34:3000/api/project/getProjectData' : null,
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

        <Box display="flex" alignItems="center" sx={{ mt: "-7px" }}>
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            {t('project.members') || 'Users'}
          </Typography>
          <IconButton
            color="inherit"
            // onClick={handleOpenMenuAddUser}
            sx={{ mr: '-10px', mt: '-5px'}}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="inherit"
            // onClick={handleOpenMenuAddUser}
            sx={{ mr: '-10px', mt: '-5px'}}
          >
            <AddIcon />
          </IconButton>
        </Box>

        <List>
          {members.map((u) => {
            const initials =
              (u.fullName?.trim().slice(0, 2)) ||
              (u.username?.trim().slice(0, 2)) ||
              '??';

            return (
              <ListItem
                key={u.id}
                button
                onClick={() => onSelect?.(u)}
                sx={{
                  borderRadius: 2,
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 2, // keep border radius on hover
                  },
                }}
              >
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
