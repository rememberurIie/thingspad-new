// ChatContent.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar, Box, Divider,
  List, ListItem, ListItemText, Paper, TextField, IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import useSSE from '../../../hook/useSSE';

import { useTranslation } from 'react-i18next';

const ChatContent = ({ selectedRoom, projectId, currentUserId }) => {

  const [messages, setMessages] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [input, setInput] = useState('');

  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { t } = useTranslation();


  useSSE(
    projectId ? 'http://192.168.1.41:3000/api/project/getProjectData' : null,
    (data) => {
      switch (data.type) {
        case 'users':
          const map = {};
          data.payload.forEach((u) => {
            map[u.id] = u.fullName;
          });
          setUserMap(map);
          break;

        case 'groupData':
          // ✅ ถ้ามี selectedRoom, กรองเฉพาะ group ที่ตรงกัน
          if (data.groupId === selectedRoom?.id) {
            setGroupData(data.payload);
          }
          break;

        case 'messages':
          // ✅ เฉพาะ messages ของ selectedRoom
          if (data.groupId === selectedRoom?.id) {
            setMessages(
              data.payload.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)
            );
          }
          break;

        default:
          console.warn('Unknown SSE type:', data.type);
      }
    },
    projectId && selectedRoom?.id ? { projectId, selectedRoomId: selectedRoom.id } : null

  );

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await fetch("http://192.168.1.41:3000/api/project/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedRoom.id,
          senderId: currentUserId, // Replace this dynamically
          text: input,
        }),
      });
      setInput('');
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  if (!selectedRoom) {
    return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px', }}>
        <CardContent>
          <Typography variant="h6">{t('project.room_select')}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '10px', }}>
      <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar>{groupData?.name?.charAt(0)}</Avatar>
          <Box ml={2}>
            <Typography variant="h6">{groupData?.name || selectedRoom.name}</Typography>
          </Box>
        </Box>
        <Divider />

        {/* Messages */}
        <Box sx={{
          flex: 1, overflowY: 'auto', mt: 2, '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: (theme) => theme.palette.background.default,
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.grey[400],
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: (theme) => theme.palette.grey[500],
          },
        }} ref={messagesContainerRef}>
          <List>
            {messages.map((msg) => (
              <ListItem
                key={msg.id}
                sx={{ justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start', flexDirection: 'column', alignItems: msg.senderId === currentUserId ? 'flex-end' : 'flex-start' }}
              >
                {/* ชื่อผู้ส่ง อยู่ด้านบน นอกกรอบ */}
                <Typography
                  variant="caption"
                  sx={{
                    mb: 0.3,
                    color: 'text.secondary',
                    fontWeight: 'bold',
                    userSelect: 'none',
                  }}
                >
                  {userMap[msg.senderId] || msg.senderId}
                </Typography>

                {/* ข้อความในกรอบ */}
                <Paper
                  elevation={1}
                  sx={{
                    px: "10px",
                    py: "4px",
                    maxWidth: '70%',
                    borderRadius: '10px',
                    bgcolor: msg.senderId === currentUserId ? 'primary.light' : 'grey.100',
                  }}
                >
                  <ListItemText
                    primary={msg.text}
                    secondary={null}  // ลบ secondary ออก
                  />
                </Paper>
              </ListItem>
            ))}
            <div ref={bottomRef} />
          </List>
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', mt: 2, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder="Type message..."
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
