import React, { useEffect, useRef, useState,} from 'react';
import {
  Card, CardContent, Typography, Avatar, Box, Divider,
  List, ListItem, ListItemText, Paper, TextField, IconButton, Tooltip,
  CircularProgress, Button, Menu, MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useSelector } from 'react-redux';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete'; // Add this import
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';

import useSSE from '../../../../hook/useSSE';
import { useTranslation } from 'react-i18next';

const MAX_BYTES = 1_000_000; // 1 MB hard cap


const GroupMessageChat = ({ selectedGroupId, groupName: groupNameProp, currentUserId }) => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [previewURL, setPreviewURL] = useState('');

  const [loading, setLoading] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showEditName, setShowEditName] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNameLoading, setEditNameLoading] = useState(false);
  const [editNameError, setEditNameError] = useState('');
  const [showLeave, setShowLeave] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const [groupName, setGroupName] = useState(groupNameProp || '');

  // Sync with prop if parent changes groupName
  useEffect(() => {
    setGroupName(groupNameProp || '');
  }, [groupNameProp]);

  useSSE(
    selectedGroupId ? 'http://192.168.1.36:3000/api/group/getMessage' : null,
    (data) => {
      switch (data.type) {
        case 'messages': {
          if (data.groupId === selectedGroupId) {
            setMessages(
              data.payload.sort((a, b) => {
                const getSec = (msg) =>
                  msg.createdAt?.seconds ??
                  msg.createdAt?._seconds ??
                  (typeof msg.createdAt === 'number' ? msg.createdAt : 0);
                return getSec(a) - getSec(b);
              })
            );
          }
          break;
        }
        default:
          console.warn('Unknown SSE type:', data.type);
      }
    },
    currentUserId && selectedGroupId ? { groupId: selectedGroupId } : null
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
      const endpoint = 'http://192.168.1.36:3000/api/group/sendMessage';

      if (file) {
        const form = new FormData();
        form.append('groupId', selectedGroupId);
        form.append('senderId', currentUserId);
        form.append('text', input || '');
        form.append('file', file);

        await fetch(endpoint, { method: 'POST', body: form });
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: selectedGroupId,
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

  // Add this function for delete (implement your own logic)
  const handleDeleteMessage = async (msgId) => {
    try {
      await fetch('http://192.168.1.36:3000/api/group/deleteMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          messageId: msgId,
        }),
      });
      // ลบข้อความออกจาก state ทันที (หรือรอ SSE อัปเดต)
      setMessages(msgs => msgs.filter(m => m.id !== msgId));
    } catch (err) {
      alert('Delete failed');
      console.error(err);
    }
  };

  // --- Edit Group Name ---
  const handleEditGroupName = async () => {
    if (!editName.trim()) {
      setEditNameError('Group name required');
      return;
    }
    setEditNameLoading(true);
    setEditNameError('');
    try {
      const res = await fetch('http://192.168.1.36:3000/api/group/updateGroupName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          newName: editName,
        }),
      });
      const data = await res.json();
      if (data.success || data.status === 'ok') {
        setShowEditName(false);
        setEditName('');
        setEditNameError('');
        setGroupName(editName); // <-- update group name in UI immediately
      } else {
        setEditNameError(data.error || 'Failed to update group name');
      }
    } catch (err) {
      setEditNameError('Failed to update group name');
    }
    setEditNameLoading(false);
  };

  // --- Leave Group ---
  const handleLeaveGroup = async () => {
    setLeaveLoading(true);
    setLeaveError('');
    try {
      const res = await fetch('http://192.168.1.36:3000/api/group/toggleUserinGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          userId: currentUserId,
          isMember: true,
        }),
      });
      const data = await res.json();
      if (data.success || data.status === 'ok') {
        setShowLeave(false);
        // Optionally: redirect or clear chat
        window.location.reload();
      } else {
        setLeaveError(data.error || 'Failed to leave group');
      }
    } catch (err) {
      setLeaveError('Failed to leave group');
    }
    setLeaveLoading(false);
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

  useEffect(() => {
    if (selectedGroupId) setLoading(true);
  }, [selectedGroupId]);

  useEffect(() => {
      // Always exit loading when messages are loaded, even if empty
      setLoading(false);
    }, [messages]);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size="30px" sx={{ color: theme.palette.grey[500] }} />
      </Card>
    );
  }

  if (!selectedGroupId) {
    return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px' }}>
        <CardContent>
          <Typography variant="h6">{t('group.chat_header')}</Typography>
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
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ width: 40, height: 40, fontSize: 15 }}>
            {groupName
              ? groupName.slice(0, 2).toUpperCase()
              : "??"}
          </Avatar>
          <Box ml={1.5} flex={1}>
            <Typography variant="h6">
              {groupName || ""}
            </Typography>
          </Box>
          <IconButton
            onClick={e => setMenuAnchor(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setEditName(groupName || '');
                setShowEditName(true);
              }}
            >
              {t('group.chat_menu_editname')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setShowLeave(true);
              }}
              sx={{ color: theme.palette.error.main }}
            >
              {t('group.chat_menu_leave')}
            </MenuItem>
          </Menu>
        </Box>
        <Divider />

        {/* Edit Group Name Popup */}
        {showEditName && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'rgba(0,0,0,0.25)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: 350,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <IconButton
                onClick={() => setShowEditName(false)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="subtitle1" mb={2} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                {t('group.popup_chat_edit_header')}
              </Typography>
              <TextField
                label={t('group.popup_chat_edit_groupname')}
                value={editName}
                onChange={e => {
                  if (e.target.value.length <= 32) setEditName(e.target.value);
                }}
                inputProps={{ maxLength: 32 }}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, ml: 0.5 }}>
                {editName.length}/32
              </Typography>
              {editNameError && <Typography color="error" variant="body2" mb={1}>{editNameError}</Typography>}
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleEditGroupName}
                disabled={editNameLoading || !editName.trim() || editName.length < 1}
                fullWidth
              >
                {editNameLoading ? t('group.popup_chat_edit_saving') : t('group.popup_chat_edit_save')}
              </Button>
            </Box>
          </Box>
        )}

        {/* Leave Group Popup */}
        {showLeave && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'rgba(0,0,0,0.25)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: 350,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <IconButton
                onClick={() => setShowLeave(false)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="subtitle1" mb={1} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                {t('group.popup_chat_leave_header')}
              </Typography>
              <Typography variant="subtitle1" mb={2} sx={{ fontSize: '14px'}}>
                {t('group.popup_chat_leave_description')}
              </Typography>
              {leaveError && <Typography color="error" variant="body2" mb={1}>{leaveError}</Typography>}
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CheckIcon />}
                  onClick={handleLeaveGroup}
                  disabled={leaveLoading}
                  fullWidth
                >
                  {leaveLoading ? t('group.popup_chat_leave_submitting') : t('group.popup_chat_leave_submit')}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<CloseIcon />}
                  onClick={() => setShowLeave(false)}
                  disabled={leaveLoading}
                  fullWidth
                >
                  {t('group.popup_chat_leave_cancel')}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            mt: 2,
            ml: "-9px",
            pr: 1,
            display: 'flex',
            flexDirection: 'column-reverse', // <-- This makes the chat start from the bottom
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { backgroundColor: (t) => t.palette.background.default, borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.grey[400], borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: (t) => t.palette.grey[500] },
          }}
          ref={messagesContainerRef}
        >
          <List>
            {messages.map((msg, idx) => {
              // Date separator logic
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
                      <Typography variant="caption" sx={{ color: 'text.secondary'}}>
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
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                      borderRadius: 2, // Optional: keep rounded corners
                    }}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: 15,
                        mr: 1.2,
                        mt: 0.5,
                        ml: 0, // Remove any left margin
                      }}
                    >
                      {(msg.fullName || '??').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ ml: 1, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {msg.fullName || msg.senderId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.2 , fontSize: '11px' }}>
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
                    {/* 3. Show delete button on hover and only for your own messages */}
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

export default GroupMessageChat;