import React, { useEffect, useRef, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar, Box, Divider,
  List, ListItem, ListItemText, Paper, TextField, IconButton, Tooltip
} from '@mui/material';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

import useSSE from '../../../hook/useSSE';
import { useTranslation } from 'react-i18next';

const MAX_BYTES = 1_000_000; // 1 MB hard cap

const ChatContent = ({ selectedRoom, projectId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [input, setInput] = useState('');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [previewURL, setPreviewURL] = useState('');

  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { t } = useTranslation();

  useSSE(
    projectId ? 'http://localhost:3000/api/project/getProjectData' : null,
    (data) => {
      switch (data.type) {
        case 'users': {
          const map = {};
          data.payload.forEach((u) => { map[u.id] = u.fullName; });
          setUserMap(map);
          break;
        }
        case 'groupData': {
          if (data.groupId === selectedRoom?.id) setGroupData(data.payload);
          break;
        }
        case 'messages': {
          if (data.groupId === selectedRoom?.id) {
            setMessages(
              data.payload.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)
            );
          }
          break;
        }
        default:
          console.warn('Unknown SSE type:', data.type);
      }
    },
    projectId && selectedRoom?.id ? { projectId, selectedRoomId: selectedRoom.id } : null
  );

  const clearFile = () => {
    if (previewURL) URL.revokeObjectURL(previewURL);
    setFile(null);
    setPreviewURL('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > MAX_BYTES) {
      // ล้างไฟล์ แต่ไม่ล้าง error
      if (previewURL) URL.revokeObjectURL(previewURL);
      setFile(null);
      setPreviewURL('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFileError('File is larger than 1 MB.');
      return;
    }

    setFileError('');
    setFile(f);

    if (f.type.startsWith('image/') || f.type.startsWith('video/')) {
      setPreviewURL(URL.createObjectURL(f));
    } else {
      setPreviewURL('');
    }
  };


  const handleSend = async () => {
    if (!input.trim() && !file) return;

    try {
      const endpoint = 'http://localhost:3000/api/project/sendMessage';

      if (file) {
        const form = new FormData();
        form.append('groupId', selectedRoom.id);
        form.append('senderId', currentUserId);
        form.append('text', input || '');
        form.append('file', file);

        await fetch(endpoint, { method: 'POST', body: form });
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: selectedRoom.id,
            senderId: currentUserId,
            text: input,
          }),
        });
      }

      setInput('');
      clearFile();
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
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

  useEffect(() => { scrollToBottom(); }, [messages]);

  if (!selectedRoom) {
    return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px' }}>
        <CardContent>
          <Typography variant="h6">{t('project.room_select')}</Typography>
        </CardContent>
      </Card>
    );
  }

  const renderAttachment = (msg) => {
    const att = msg.attachment;
    if (!att || !att.url) return null;

    if (att.contentType?.startsWith('image/')) {
      return (
        <Box mt={0.5}>
          <img src={att.url} alt={att.name || 'image'} style={{ maxWidth: '100%', borderRadius: 8 }} />
        </Box>
      );
    }

    if (att.contentType?.startsWith('video/')) {
      return (
        <Box mt={0.5}>
          <video src={att.url} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
        </Box>
      );
    }

    // generic file
    return (
      <Box mt={0.5}>
        <Typography variant="body2">
          <a href={att.url} target="_blank" rel="noreferrer">{att.name || 'Download file'}</a>
          {att.size ? ` • ${(att.size / 1024).toFixed(0)} KB` : ''}
        </Typography>
      </Box>
    );
  };

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
      <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar>{groupData?.name?.charAt(0)}</Avatar>
          <Box ml={2}><Typography variant="h6">{groupData?.name || selectedRoom.name}</Typography></Box>
        </Box>
        <Divider />

        {/* Messages */}
        <Box sx={{
          flex: 1, overflowY: 'auto', mt: 2,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: (t) => t.palette.background.default, borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.grey[400], borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: (t) => t.palette.grey[500] },
        }} ref={messagesContainerRef}>
          <List>
            {messages.map((msg) => (
              <ListItem
                key={msg.id}
                sx={{ justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start', flexDirection: 'column', alignItems: msg.senderId === currentUserId ? 'flex-end' : 'flex-start' }}
              >

                {/* displayname at msg box */}
                {currentUserId !== msg.senderId && (
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
                )}

                <Paper
                  elevation={1}
                  sx={{ px: '10px', py: '6px', maxWidth: '50%', borderRadius: '10px', bgcolor: msg.senderId === currentUserId ? 'primary.light' : 'grey.100' }}>
                  {msg.text && (
                    <ListItemText primaryTypographyProps={{ whiteSpace: 'pre-wrap' }} primary={msg.text} />
                  )}
                  {renderAttachment(msg)}
                </Paper>

              </ListItem>
            ))}
            <div ref={bottomRef} />
          </List>
        </Box>

        {/* Composer */}
        <Box variant="outlined" sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          mt: 2,
          pt: 3,
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
        })}
>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            hidden
            onChange={onPickFile}
          />
          <Tooltip title={file ? (file.name + (file.size ? ` • ${(file.size / 1024).toFixed(0)} KB` : '')) : 'Attach (≤1 MB)'}>
            <span>
              <IconButton onClick={() => fileInputRef.current?.click()} color="primary">
                <AttachFileIcon />
              </IconButton>
            </span>
          </Tooltip>

          <TextField
            fullWidth
            placeholder="Type message..."
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />

          <IconButton color="primary" onClick={handleSend} disabled={!input.trim() && !file}>
            <SendIcon />
          </IconButton>
        </Box>

        {/* Selected file preview / chip */}
        {(file || fileError) && (
          <Box mt={1} display="flex" alignItems="center" gap={1}>
            {file && previewURL && (file.type.startsWith('image/') ? (
              <img src={previewURL} alt="preview" style={{ height: 36, width: 'auto', borderRadius: 6 }} />
            ) : file.type.startsWith('video/') ? (
              <video src={previewURL} style={{ height: 36, borderRadius: 6 }} muted />
            ) : null)}

            <Typography variant="body2" color={fileError ? 'error' : 'text.secondary'}>
              {fileError || `${file?.name || ''} ${file ? `• ${(file.size/1024).toFixed(0)} KB` : ''}`}
            </Typography>

            {file && (
              <IconButton size="small" onClick={clearFile}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatContent;