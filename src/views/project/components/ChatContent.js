import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatContent = ({ selectedUser }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'self', text: 'Feubiej mat we beswo rilzu.', time: '1 hour ago' },
    { id: 2, sender: 'self', text: 'Natabe isigidis udo nuvnot ecawre tipi jan bek zeipa bosojauz.', time: '31 minutes ago' },
    { id: 3, sender: 'Maria Hernandez', text: 'Ka penidag pizid hofku cidihol.', time: '7 minutes ago' },
    { id: 4, sender: 'self', text: 'Vehesarit ru wul iv duhule.', time: '2 minutes ago' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'self', text: input, time: 'Just now' }]);
    setInput('');
  };

  if (!selectedUser) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6">Select a user to start chatting</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={selectedUser.avatar} />
          <Box ml={2}>
            <Typography variant="h6">{selectedUser.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedUser.status}
            </Typography>
          </Box>
        </Box>
        <Divider />

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', mt: 2 }}>
          <List>
            {messages.map((msg) => (
              <ListItem
                key={msg.id}
                sx={{
                  justifyContent: msg.sender === 'self' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: msg.sender === 'self' ? 'primary.light' : 'grey.100',
                  }}
                >
                  <ListItemText
                    primary={msg.text}
                    secondary={msg.time}
                  />
                </Paper>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Message input */}
        <Box
          sx={{
            display: 'flex',
            mt: 2,
            pt: 1,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <TextField
            fullWidth
            placeholder="Type a message"
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <IconButton color="primary" onClick={handleSend}>
            <SendIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChatContent;
