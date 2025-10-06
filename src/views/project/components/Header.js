import React, { useState, useEffect } from 'react';
import {
   Card, CardContent, Typography,
   Box, IconButton, Menu, MenuItem, Button, ToggleButton, ToggleButtonGroup, Switch, Tooltip, Snackbar
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatIcon from '@mui/icons-material/Chat';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

import { useSelector } from 'react-redux';

import TableView from './TableView';
import KandanBoard from './KandanBoard';

const API_URL = "http://192.168.1.36:3000/api/project/invite/toggleInviteLink";
const STATUS_URL = "http://192.168.1.36:3000/api/project/invite/getInviteLinkStatus";
const FRONTEND_URL = "http://192.168.1.36:5173";

const Header = ({ projectId, projectName, view, setView }) => {
   const user = useSelector(state => state.auth.user);

   const [anchorEl, setAnchorEl] = useState(null);
   const open = Boolean(anchorEl);

   // Invite link state
   const [isCanInvite, setIsCanInvite] = useState(true);
   const [snackbarOpen, setSnackbarOpen] = useState(false);
   const [copied, setCopied] = useState(false); // เพิ่ม state

   // ดึงสถานะ invite link จาก API
   useEffect(() => {
      const fetchStatus = async () => {
         try {
            const res = await fetch(STATUS_URL, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ projectId })
            });
            const data = await res.json();
            if (typeof data.isCanInvite === 'boolean') {
               setIsCanInvite(data.isCanInvite);
            }
         } catch (e) {
            // fallback: เปิดไว้
            setIsCanInvite(true);
         }
      };
      fetchStatus();
   }, [projectId]);

   const inviteLink = `${FRONTEND_URL}/project/invite/${projectId}`;

   const handleViewChange = (event, nextView) => {
      if (nextView !== null) setView(nextView);
   };

   const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
   };
   const handleMenuClose = () => {
      setAnchorEl(null);
   };

   const handleRename = () => {
      // TODO: Implement rename logic
      handleMenuClose();
   };
   const handleExit = () => {
      // TODO: Implement exit project logic
      handleMenuClose();
   };

   // Copy invite link
   const handleCopyInviteLink = async () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
         await navigator.clipboard.writeText(inviteLink);
      } else {
         // fallback สำหรับ browser ที่ไม่รองรับ clipboard API
         const textArea = document.createElement("textarea");
         textArea.value = inviteLink;
         document.body.appendChild(textArea);
         textArea.focus();
         textArea.select();
         try {
            document.execCommand('copy');
         } catch (err) { }
         document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // กลับเป็นปกติหลัง 1.5 วิ
   };

   // Toggle invite link
   const handleToggleInvite = async (event) => {
      const newValue = event.target.checked;
      setIsCanInvite(newValue);
      await fetch(API_URL, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ projectId, isCanInvite: newValue })
      });
   };

   return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px' }}>
         <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', "&:last-child": { pb: 2 } }}>
            <Typography sx={{ mr: 2, fontSize: '25px', fontWeight: 700 }}>{projectName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               {/* Invite Link Section */}
               <Tooltip title={isCanInvite ? (copied ? "Copied!" : "Copy invite link") : "Invite link is disabled"}>
                  <span>
                     <Button
                        variant="outlined"
                        size="small"
                        startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                        onClick={handleCopyInviteLink}
                        disabled={!isCanInvite}
                        sx={{
                           mr: 1,
                           color: copied ? 'success.main' : undefined,
                           borderColor: copied ? 'success.main' : undefined,
                           // '&:hover': copied
                           //   ? { borderColor: 'success.dark', backgroundColor: 'success.light' }
                           //   : undefined,
                        }}
                     >
                        {copied ? "Copied" : "Copy Invite Link"}
                     </Button>
                  </span>
               </Tooltip>

               {(user?.role === 'root' || user?.role === 'admin') && (
                  <>
                     <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>

                        <Typography variant="body2" sx={{ mr: 1 }}>Invite Link</Typography>
                        <Switch
                           checked={isCanInvite}
                           onChange={handleToggleInvite}
                           color="primary"
                           inputProps={{ 'aria-label': 'toggle invite link' }}
                        />
                     </Box>
                  </>
               )}

               {/* View Switch */}
               <ToggleButtonGroup
                  value={view}
                  exclusive
                  onChange={handleViewChange}
                  size="small"
                  sx={{ mr: 1 }}
               >
                  <ToggleButton value="chat" aria-label="chat">
                     <ChatIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="table" aria-label="table">
                     <TableChartIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="kanban" aria-label="kanban">
                     <ViewKanbanIcon fontSize="small" />
                  </ToggleButton>
               </ToggleButtonGroup>
               <IconButton onClick={handleMenuOpen} size="small">
                  <MoreVertIcon />
               </IconButton>
               <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
               >
                  <MenuItem onClick={handleRename}>Rename Project</MenuItem>
                  <MenuItem onClick={handleExit}>Exit Project</MenuItem>
               </Menu>
            </Box>
         </CardContent>
         <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => setSnackbarOpen(false)}
            message="Invite link copied!"
         />
      </Card>
   );
}

export default Header;