// components/ChatList.js

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';

const users = [
  { id: 1, name: 'Maria Hernandez', status: 'away', avatar: '/avatar1.png', message: 'Vehesarit ru wul iv duhule.' },
  { id: 2, name: 'James Johnson', status: 'online', avatar: '/avatar2.png', message: 'Puogf a wul zapyip gej...' },
  { id: 3, name: 'David Smith', status: 'busy', avatar: '/avatar3.png', message: 'Sejzori nifuczore ubo...' },
];

const ChatList = ({ onSelect }) => {
  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Chats
        </Typography>
        <List>
          {users.map((user, idx) => (
            <React.Fragment key={user.id}>
              <ListItem button onClick={() => onSelect(user)}>
                <ListItemAvatar>
                  <Avatar src={user.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary={user.message}
                />
              </ListItem>
              {idx !== users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ChatList;
