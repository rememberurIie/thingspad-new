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
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import useSSE from '../../../hook/useSSE';


const API_ENDPOINTS = {
  toggleInviteLink: "http://192.168.1.36:3000/api/project/invite/toggleInviteLink",
  getInviteLinkStatus: "http://192.168.1.36:3000/api/project/invite/getInviteLinkStatus",
  deleteProject: "http://192.168.1.36:3000/api/project/general/deleteProject",
  updateProjectName: "http://192.168.1.36:3000/api/project/general/updateProjectName",
  exitProject: "http://192.168.1.36:3000/api/project/general/toggleUser",
};

const FRONTEND_URL = "http://192.168.1.36:5173";

// เพิ่ม inviteLink ใน props
const Header = ({ projectId, projectName, view, setView, inviteLink }) => {

   const user = useSelector(state => state.auth.user);

   const [anchorEl, setAnchorEl] = useState(null);
   const open = Boolean(anchorEl);

   // Invite link state
   const [isCanInvite, setIsCanInvite] = useState(true);
   const [snackbarOpen, setSnackbarOpen] = useState(false);
   const [copied, setCopied] = useState(false); // เพิ่ม state

   const [deleteDialog, setDeleteDialog] = useState({ open: false });
   const [renameDialog, setRenameDialog] = useState({ open: false, newName: '' });
   const [exitDialog, setExitDialog] = useState({ open: false });

   const theme = useTheme();
   const isXsDown = useMediaQuery(theme.breakpoints.down('md'));

   const inviteLinkUrl = `${FRONTEND_URL}/project/invite/${projectId}`;

   const handleViewChange = (event, nextView) => {
      if (nextView !== null) setView(nextView);
   };

   // Menu handlers
   const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
   };
   const handleMenuClose = () => {
      setAnchorEl(null);
   };

   // Delete project
   const handleDelete = () => {
      setDeleteDialog({ open: true });
      handleMenuClose();
   };
   const handleCloseDelete = () => setDeleteDialog({ open: false });
   const handleConfirmDelete = async () => {
      await fetch(API_ENDPOINTS.deleteProject, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ projectId }),
      });
      setDeleteDialog({ open: false });
   };

   // Rename project
   const handleRename = () => {
      setRenameDialog({ open: true, newName: projectName });
      handleMenuClose();
   };
   const handleCloseRename = () => setRenameDialog({ open: false, newName: '' });
   const handleConfirmRename = async () => {
      await fetch(API_ENDPOINTS.updateProjectName, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ projectId, newName: renameDialog.newName }),
      });
      setRenameDialog({ open: false, newName: '' });
   };

   // Exit project
   const handleExit = () => {
      setExitDialog({ open: true });
      handleMenuClose();
   };
   const handleCloseExit = () => setExitDialog({ open: false });
   const handleConfirmExit = async () => {
      await fetch(API_ENDPOINTS.exitProject, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ projectId, uid: user.uid, isMember: true }),
      });
      setExitDialog({ open: false });
   };

   // ถ้าได้รับ prop inviteLink (จาก Storybook) ให้ override state
   const canInvite = typeof inviteLink === 'boolean' ? inviteLink : isCanInvite;

   // ดึงสถานะ invite link จาก API เฉพาะกรณีไม่ได้ใช้ prop inviteLink
   useSSE(
      typeof inviteLink === 'undefined' && projectId ? API_ENDPOINTS.getInviteLinkStatus : null,
      (data) => {
         if (typeof data.isCanInvite === 'boolean') {
            setIsCanInvite(data.isCanInvite);
         }
      },
      { projectId }
   );

   // Copy invite link
   const handleCopyInviteLink = async () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
         await navigator.clipboard.writeText(inviteLinkUrl);
      } else {
         // fallback สำหรับ browser ที่ไม่รองรับ clipboard API
         const textArea = document.createElement("textarea");
         textArea.value = inviteLinkUrl;
         document.body.appendChild(textArea);
         textArea.focus();
         textArea.select();
         try {
            document.execCommand('copy');
         } catch (err) { }
         document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
   };

   // Toggle invite link
   const handleToggleInvite = async (event) => {
      const newValue = event.target.checked;
      setIsCanInvite(newValue);
      await fetch(API_ENDPOINTS.toggleInviteLink, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ projectId, isCanInvite: newValue })
      });
   };

   return (
      <Card variant="outlined" sx={{ height: '100%', borderRadius: '10px' }}>
         <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', "&:last-child": { pb: 2 } }}>
            <Typography sx={{ mr: 2, fontSize: '20px', fontWeight: 700 }}>{projectName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               {/* Invite Link Section (desktop only) */}
               {!isXsDown && (
                  <>
                     <Tooltip title={canInvite ? (copied ? "Copied!" : "Copy invite link") : "Invite link is disabled"}>
                        <span>
                           <Button
                              variant="outlined"
                              size="small"
                              startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                              onClick={handleCopyInviteLink}
                              disabled={!canInvite}
                              sx={{
                                 mr: 1,
                                 color: copied ? 'success.main' : undefined,
                                 borderColor: copied ? 'success.main' : undefined,
                              }}
                           >
                              {copied ? "Copied" : "Copy Invite Link"}
                           </Button>
                        </span>
                     </Tooltip>
                     {(user?.role === 'root' || user?.role === 'admin') && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                           <Typography variant="body2" sx={{ mr: 1 }}>Invite Link</Typography>
                           <Switch
                              checked={canInvite}
                              onChange={handleToggleInvite}
                              color="primary"
                              inputProps={{ 'aria-label': 'toggle invite link' }}
                           />
                        </Box>
                     )}
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

               {/* More menu (always show on mobile, show for admin/root on desktop) */}
               {(isXsDown || user?.role === 'root' || user?.role === 'admin') && (
                  <IconButton onClick={handleMenuOpen} size="small">
                     <MoreVertIcon />
                  </IconButton>
               )}

               <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
               >
                  {/* Show invite controls in menu if mdDown */}
                  {isXsDown && (
                     <>
                        <MenuItem disabled={!isCanInvite} onClick={handleCopyInviteLink}>
                           <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                           {copied ? "Copied" : "Copy Invite Link"}
                        </MenuItem>
                        {(user?.role === 'root' || user?.role === 'admin') && (
                           <MenuItem>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                 <Typography variant="body2" sx={{ mr: 1 }}>Invite Link</Typography>
                                 <Switch
                                    checked={isCanInvite}
                                    onChange={handleToggleInvite}
                                    color="primary"
                                    inputProps={{ 'aria-label': 'toggle invite link' }}
                                    size="small"
                                 />
                              </Box>
                           </MenuItem>
                        )}
                        <MenuItem divider />
                     </>
                  )}
                  {/* Project actions */}
                  {(user?.role === 'root' || user?.role === 'admin') && (
                     <div>
                        <MenuItem onClick={handleRename}>Rename Project</MenuItem>
                        <MenuItem onClick={handleExit}>Exit Project</MenuItem>
                        <MenuItem onClick={handleDelete}>Delete Project</MenuItem>

                     </div>
                  )}
                  {user?.role === 'verified' && (
                     <MenuItem onClick={handleExit}>
                        <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
                        Exit Project
                     </MenuItem>
                  )}
               </Menu>

               {user?.role === 'verified' && !isXsDown && (
                  <ExitToAppIcon onClick={handleExit} fontSize="small" sx={{ mr: 1 }} />
               )}
            </Box>
         </CardContent>
         <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => setSnackbarOpen(false)}
            message="Invite link copied!"
         />
         {deleteDialog.open &&
            ReactDOM.createPortal(
               <Box
                  sx={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     width: '100vw',
                     height: '100vh',
                     bgcolor: 'rgba(0,0,0,0.25)',
                     zIndex: 3000,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                  }}
               >
                  <Box
                     sx={{
                        width: 450,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 3,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                     }}
                  >
                     <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                        Delete Project
                     </Typography>
                     <Typography>
                        Are you sure you want to delete project <b>{projectName}</b>?
                     </Typography>
                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleCloseDelete} startIcon={<CloseIcon />}>Cancel</Button>
                        <Button color="error" onClick={handleConfirmDelete} startIcon={<DeleteIcon />}>Delete</Button>
                     </Box>
                  </Box>
               </Box>,
               document.body
            )
         }

         {renameDialog.open &&
            ReactDOM.createPortal(
               <Box
                  sx={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     width: '100vw',
                     height: '100vh',
                     bgcolor: 'rgba(0,0,0,0.25)',
                     zIndex: 3000,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                  }}
               >
                  <Box
                     sx={{
                        width: 450,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 3,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                     }}
                  >
                     <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                        Rename Project
                     </Typography>
                     <Typography>
                        Enter new project name:
                     </Typography>
                     <input
                        value={renameDialog.newName}
                        onChange={e => setRenameDialog(d => ({ ...d, newName: e.target.value }))}
                        style={{ padding: 8, fontSize: 16, marginBottom: 16 }}
                     />
                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleCloseRename} startIcon={<CloseIcon />}>Cancel</Button>
                        <Button onClick={handleConfirmRename}>Update</Button>
                     </Box>
                  </Box>
               </Box>,
               document.body
            )
         }

         {exitDialog.open &&
            ReactDOM.createPortal(
               <Box
                  sx={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     width: '100vw',
                     height: '100vh',
                     bgcolor: 'rgba(0,0,0,0.25)',
                     zIndex: 3000,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                  }}
               >
                  <Box
                     sx={{
                        width: 450,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 3,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                     }}
                  >
                     <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                        Exit Project
                     </Typography>
                     <Typography>
                        Are you sure you want to exit project <b>{projectName}</b>?
                     </Typography>
                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleCloseExit} startIcon={<CloseIcon />}>Cancel</Button>
                        <Button color="error" onClick={handleConfirmExit} startIcon={<ExitToAppIcon />}>Exit</Button>
                     </Box>
                  </Box>
               </Box>,
               document.body
            )
         }
      </Card>
   );
}

export default Header;