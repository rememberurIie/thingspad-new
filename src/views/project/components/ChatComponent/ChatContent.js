import React, { useEffect, useRef, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar, Box, Divider,
  List, ListItem, ListItemText, Paper, TextField, IconButton, Tooltip,
  CircularProgress // <-- Add this import
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // <-- Add this import

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';

import useSSE from '../../../../hook/useSSE';
import { useTranslation } from 'react-i18next';

const MAX_BYTES = 1_000_000; // 1 MB hard cap

const ChatContent = ({
  selectedRoomId,
  selectedRoomName,
  projectId,
  currentUserId,
  isMobile,
  onOpenChatList,
  onOpenMemberList
}) => {
  const theme = useTheme(); // <-- Add this line

  const [messages, setMessages] = useState([]);


  const [userMap, setUserMap] = useState({});
  const [input, setInput] = useState('');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [previewURL, setPreviewURL] = useState('');

  const [loading, setLoading] = useState(false); // <-- Add loading state
  const [hoveredMsgId, setHoveredMsgId] = useState(null);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (selectedRoomId) setLoading(true);
  }, [selectedRoomId]);

  // useEffect(() => {
  //   if (projectId) setLoading(true);
  // }, [projectId]);

  useEffect(() => {
    // Always exit loading when messages are loaded, even if empty
    setLoading(false);
  }, [messages]);

  // --- SSE: Real-time messages ---
  useSSE(
    projectId && selectedRoomId
      ? 'http://192.168.68.53:3000/api/project/chat/getMessage'
      : null,
    (data) => {
      switch (data.type) {
        case 'messages': {
          if (data.roomId === selectedRoomId || data.groupId === selectedRoomId) {
            setMessages(
              data.payload.sort((a, b) =>
                (a.createdAt.seconds ?? a.createdAt?._seconds ?? 0) -
                (b.createdAt.seconds ?? b.createdAt?._seconds ?? 0)
              )
            );
          }
          break;
        }
        default:
          console.warn('Unknown SSE type:', data.type);
      }
    },
    projectId && selectedRoomId ? { projectId, roomId: selectedRoomId } : null
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
      const endpoint = 'http://192.168.68.53:3000/api/project/chat/sendMessage';

      if (file) {
        const form = new FormData();
        form.append('projectId', projectId);
        form.append('roomId', selectedRoomId);
        form.append('senderId', currentUserId);
        form.append('text', input || '');
        form.append('file', file);

        await fetch(endpoint, { method: 'POST', body: form });
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            roomId: selectedRoomId,
            senderId: currentUserId,
            text: input,
          }),
        });
      }

      setInput('');
      clearFile();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await fetch('http://192.168.68.53:3000/api/project/chat/deleteMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          roomId: selectedRoomId,
          messageId: msgId,
        }),
      });
      // Do not filter messages here; SSE will update the list
    } catch (err) {
      alert('Delete failed');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size="30px" sx={{ color: 'grey.500' }} />
      </Card>
    );
  }

  if (!selectedRoomId) {
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
            <img
              src={att.url}
              alt={att.name || 'image'}
              style={{ maxWidth: '100%', borderRadius: 8 }}
              loading="lazy" // เพิ่มบรรทัดนี้
            />
          </Box>
        );
      }
  
      if (att.contentType?.startsWith('video/')) {
        return (
          <Box mt={0.5}>
            <video
              src={att.url}
              controls
              style={{ maxWidth: '50%', borderRadius: 8 }}
              preload="none" // ช่วยลดโหลดล่วงหน้า
            />
          </Box>
        );
      }
  
      // generic file
      return (
        <Box mt={0.5}>
          <Typography variant="body2">
            <a
              href={att.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: theme.palette.secondary.dark, fontWeight: 500 }}
            >
              {att.name || 'Download file'}
            </a>
            {att.size ? ` • ${(att.size / 1024).toFixed(0)} KB` : ''}
          </Typography>
        </Box>
      );
    };

  function linkify(text) {
  if (!text) return '';
  // Use inline style for color
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: ${theme.palette.secondary.dark}; font-weight: 500;">${url}</a>`
  );
}

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
      <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
          <Box display="flex" alignItems="center">
            {isMobile && (
              <IconButton onClick={onOpenChatList} sx={{ mr: 1 }}>
                <ChatIcon />
              </IconButton>
            )}
            <Typography variant="h5" sx={{ pl: 1 }}>#</Typography>
            <Box ml={1}>
              <Typography variant="h6">{selectedRoomName || ''}</Typography>
            </Box>
          </Box>
          {isMobile && (
            <IconButton onClick={onOpenMemberList}>
              <GroupIcon />
            </IconButton>
          )}
        </Box>
        <Divider />

        {/* Messages */}
        <Box sx={{
           flex: 1,
            overflowY: 'auto',
            mt: 2,
            ml: "-8px",
            pr: 1,
            display: 'flex',
          flexDirection: 'column-reverse', // This makes the scroll start at the bottom
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: (t) => t.palette.background.default, borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.grey[400], borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: (t) => t.palette.grey[500] },
        }} ref={messagesContainerRef}>
          <List>
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const showDate =
                !prevMsg ||
                new Date(
                  (prevMsg.createdAt?.seconds ?? prevMsg.createdAt?._seconds ?? prevMsg.createdAt)
                  * 1000
                ).toDateString() !==
                new Date(
                  (msg.createdAt?.seconds ?? msg.createdAt?._seconds ?? msg.createdAt)
                  * 1000
                ).toDateString();

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <ListItem sx={{ justifyContent: 'center', py: 0 }}>
                      <Divider sx={{ flex: 1, mr: 2 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                        {new Date(
                          (msg.createdAt?.seconds ?? msg.createdAt?._seconds ?? msg.createdAt) * 1000
                        ).toLocaleDateString(i18n.language === 'th' ? 'th' : 'en', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Divider sx={{ flex: 1, ml: 2 }} />
                    </ListItem>
                  )}
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      borderRadius: 2,
                      alignItems: 'flex-start',
                      mb: 0.5,
                      position: 'relative',
                      bgcolor: hoveredMsgId === msg.id ? 'action.hover' : 'inherit',
                      transition: 'background 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    <Avatar
                      src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${msg.senderId}/avatar.jpg?${Date.now()}`}
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: 15,
                        mr: 1.2,
                        mt: 0.5,
                      }}
                    >
                      {(msg.fullName || '??').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ ml: 1, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                         {msg.fullName || msg.senderId}
                        </Typography>
                         <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '11px' }}>
                          {msg.createdAt &&
                            new Date(
                              (msg.createdAt?.seconds ?? msg.createdAt?._seconds ?? msg.createdAt) * 1000
                            ).toLocaleString(undefined, {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          mb: 1,
                        }}
                        component="span"
                        dangerouslySetInnerHTML={{ __html: linkify(msg.text) }}
                      />
                    {renderAttachment(msg)}
                    </Box>
                    {/* Show delete button only on hover and only for your own messages */}
                    {hoveredMsgId === msg.id && msg.senderId === currentUserId && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'error.main',
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'error.light' }
                        }}
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        {/* Composer */}
        <Box variant="outlined" sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
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