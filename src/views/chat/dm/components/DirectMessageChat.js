import React, { useEffect, useRef, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar, Box, Divider,
  List, ListItem, TextField, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import useSSE from '../../../../hook/useSSE';
import { useTranslation } from 'react-i18next';
import { useDirectMessageList } from '../../../../contexts/DirectMessageListContext';
import { getCachedAvatarUrl } from '../../../../utils/avatarCache';

const MAX_BYTES = 1_000_000; // 1 MB hard cap

//api
const API_ENDPOINTS = {
  getMessage: 'http://192.168.1.36:3000/api/dm/getMessage',
  sendMessage: 'http://192.168.1.36:3000/api/dm/sendMessage',
  deleteMessage: 'http://192.168.1.36:3000/api/dm/deleteMessage',
};

const DirectMessageChat = ({
  selectedDmId,
  otherUserId,
  otherFullName,
  currentUserId,
  onOpenChatList
}) => {
  // Context
  const { messagesByDmId, setMessagesForDm } = useDirectMessageList();

  // State
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [previewURL, setPreviewURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);

  // Refs
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Messages
  const messages = messagesByDmId[selectedDmId] || [];

  // Theme & i18n
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // SSE: Get messages
  useSSE(
    selectedDmId ? API_ENDPOINTS.getMessage : null,
    (data) => {
      if (data.type === 'messages' && data.dmId === selectedDmId) {
        const sorted = data.payload.sort((a, b) => {
          const getSec = (msg) =>
            msg.createdAt?.seconds ??
            msg.createdAt?._seconds ??
            (typeof msg.createdAt === 'number' ? msg.createdAt : 0);
          return getSec(a) - getSec(b);
        });
        setMessagesForDm(selectedDmId, sorted);
      }
    },
    currentUserId && selectedDmId ? { directMessageId: selectedDmId } : null
  );

  // File handlers
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

  // Send message
  const handleSend = async () => {
    if (!input.trim() && !file) return;
    try {
      const endpoint = API_ENDPOINTS.sendMessage;
      if (file) {
        const form = new FormData();
        form.append('directMessageId', selectedDmId);
        form.append('senderId', currentUserId);
        form.append('text', input || '');
        form.append('file', file);
        await fetch(endpoint, { method: 'POST', body: form });
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directMessageId: selectedDmId,
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

  // Delete message
  const handleDeleteMessage = async (msgId) => {
    try {
      await fetch(API_ENDPOINTS.deleteMessage, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directMessageId: selectedDmId,
          messageId: msgId,
        }),
      });
      setMessagesForDm(selectedDmId, messages.filter(m => m.id !== msgId));
    } catch (err) {
      alert('Delete failed');
      console.error(err);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (selectedDmId) setLoading(true); }, [selectedDmId]);
  useEffect(() => { setLoading(false); }, [messages]);

  // Render attachment
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
            loading="lazy"
          />
        </Box>
      );
    }
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

  // Linkify text
  function linkify(text) {
    if (!text) return '';
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: ${theme.palette.secondary.dark}; font-weight: 500;">${url}</a>`
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box display="flex" alignItems="center" mb={2}>
            {isMobile && (
              <IconButton sx={{ mr: 2 }} onClick={onOpenChatList}>
                <PersonIcon />
              </IconButton>
            )}
            <Avatar
              src={getCachedAvatarUrl(otherUserId)}
              sx={{ width: 40, height: 40, fontSize: 15 }}>
              {otherFullName
                ? otherFullName.slice(0, 2).toUpperCase()
                : "??"}
            </Avatar>
            <Box ml={1.5}>
              <Typography variant="h6">
                {otherFullName || ""}
              </Typography>
            </Box>
          </Box>
          <Divider />
          {/* Loading spinner and text */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CircularProgress size="30px" sx={{ color: theme.palette.grey[500], mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading messages...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // No DM selected
  if (!selectedDmId) {
    return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0 }}>
          {/* Header */}
          {isMobile && (
            <>
              <Box display="flex" alignItems="center" sx={{ p: 2, pb: 0 }} mb={2}>
                <IconButton onClick={onOpenChatList} sx={{ mr: 2 }}>
                  <PersonIcon />
                </IconButton>
              </Box>
              <Divider />
            </>
          )}
          {/* Centered message */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="h6">{t('dm.chat_header')}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Main chat UI
  return (
    <Card variant="outlined" sx={{ height: '89vh', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
      <CardContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          {isMobile && (
            <IconButton sx={{ mr: 2 }} onClick={onOpenChatList}>
              <PersonIcon />
            </IconButton>
          )}
          <Avatar
            src={getCachedAvatarUrl(otherUserId)}
            sx={{ width: 40, height: 40, fontSize: 15 }}>
            {otherFullName
              ? otherFullName.slice(0, 2).toUpperCase()
              : "??"}
          </Avatar>
          <Box ml={1.5}>
            <Typography variant="h6">
              {otherFullName || ""}
            </Typography>
          </Box>
        </Box>
        <Divider />

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            mt: 2,
            ml: "-9px",
            pr: 1,
            display: 'flex',
            flexDirection: 'column-reverse',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { backgroundColor: (t) => t.palette.background.default, borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.grey[400], borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: (t) => t.palette.grey[500] },
          }}
          ref={messagesContainerRef}
        >
          <List>
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const showDate =
                !prevMsg ||
                new Date(
                  (prevMsg.createdAt?.seconds ?? prevMsg.createdAt?._seconds ?? prevMsg.createdAt) * 1000
                ).toDateString() !==
                new Date(
                  (msg.createdAt?.seconds ?? msg.createdAt?._seconds ?? msg.createdAt) * 1000
                ).toDateString();

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <ListItem sx={{ justifyContent: 'center', py: 0 }}>
                      <Divider sx={{ flex: 1, mr: 2 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                      alignItems: 'flex-start',
                      position: 'relative',
                      bgcolor: hoveredMsgId === msg.id ? theme.palette.action.hover : 'inherit',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: theme.palette.action.hover },
                      borderRadius: 2,
                    }}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    <Avatar
                      src={getCachedAvatarUrl(msg.senderId)}
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: 15,
                        mr: 1.2,
                        mt: 0.5,
                        ml: 0,
                      }}
                    >
                      {(msg.fullName || '??').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ ml: 1, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {msg.displayName || (msg.senderId === currentUserId ? msg.fullName : otherFullName) || msg.senderId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '11px' }}>
                          {msg.createdAt &&
                            new Date(
                              (msg.createdAt?.seconds ?? msg.createdAt?._seconds ?? msg.createdAt) * 1000
                            ).toLocaleString(undefined, {
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
                    {/* Show delete button on hover and only for your own messages */}
                    {hoveredMsgId === msg.id && msg.senderId === currentUserId && (
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: theme.palette.error.main,
                          bgcolor: theme.palette.background.paper,
                          '&:hover': { bgcolor: theme.palette.error.light }
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
            <div ref={bottomRef} />
          </List>
        </Box>

        {/* Composer */}
        <Box
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'center',
            pt: 3,
            gap: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
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
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
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
              {fileError || `${file?.name || ''} ${file ? `• ${(file.size / 1024).toFixed(0)} KB` : ''}`}
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

export default DirectMessageChat;