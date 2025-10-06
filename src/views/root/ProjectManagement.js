import React, { useEffect, useState } from 'react';
import {
   Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
   Typography, Avatar, Box, Stack, Button, Paper, InputBase, IconButton, Dialog, DialogTitle,
   DialogContent, DialogActions, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
   TextField, useMediaQuery, Menu, MenuItem, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageContainer from 'src/components/container/PageContainer';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';

import { useDashboard } from 'src/contexts/DashboardContext'; // Add this import

const mockProjects = [
   {
      id: 1,
      name: 'ThingsPad',
      members: [
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'netipong', fullName: 'Netipong Sanklar', avatar: 'https://i.pravatar.cc/100?u=netipong' },
         { username: 'test3sadasd', fullName: 'TEST', avatar: 'https://i.pravatar.cc/100?u=test3sadasd' },

      ],
   },
   {
      id: 2,
      name: 'Demo Project',
      members: [
         { username: 'demo', fullName: 'Demo User', avatar: 'https://i.pravatar.cc/100?u=demo' },
      ],
   },
];

const Dashboard = () => {
   const theme = useTheme();
   const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
   const isXsUp = useMediaQuery(theme.breakpoints.up('sm'));
   const user = useSelector(state => state.auth.user);

   // Use context instead of local state
   const {
      inProgressTasks,
      finishedTasks,
      finishedTasks8MonthsBack,
      loadingTasks,
   } = useDashboard();

   const [projects, setProjects] = useState(mockProjects);
   const [search, setSearch] = useState('');
   const [editId, setEditId] = useState(null);
   const [editName, setEditName] = useState('');
   const [memberDialog, setMemberDialog] = useState({ open: false, project: null });
   const [deleteDialog, setDeleteDialog] = useState({ open: false, project: null });
   const [newProjectDialog, setNewProjectDialog] = useState(false);
   const [newProjectName, setNewProjectName] = useState('');
   const [anchorEl, setAnchorEl] = useState(null);
   const [menuProject, setMenuProject] = useState(null);
   // เพิ่ม state สำหรับ popup เพิ่มสมาชิก
   const [showAddMember, setShowAddMember] = useState(false);
   const [addList, setAddList] = useState([]);
   const [addLoading, setAddLoading] = useState(false);
   const [addError, setAddError] = useState('');
   const [addSearch, setAddSearch] = useState('');
   const [addingUserId, setAddingUserId] = useState(null);

   // Filter projects by name
   const filteredProjects = projects.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
   );

   // Edit project name
   const handleEditName = (id, name) => {
      setEditId(id);
      setEditName(name);
   };
   const handleSaveName = (id) => {
      setProjects(prev =>
         prev.map(p => (p.id === id ? { ...p, name: editName } : p))
      );
      setEditId(null);
      setEditName('');
   };

   // Member dialog
   const handleOpenMember = (project) => setMemberDialog({ open: true, project });
   const handleCloseMember = () => setMemberDialog({ open: false, project: null });
   const handleDeleteMember = (username) => {
      setProjects(prev =>
         prev.map(p =>
            p.id === memberDialog.project.id
               ? { ...p, members: p.members.filter(m => m.username !== username) }
               : p
         )
      );
   };
   const handleAddMember = () => {
      if (memberDialog.project) {
         setProjects(prev =>
            prev.map(p =>
               p.id === memberDialog.project.id
                  ? {
                     ...p,
                     members: [
                        ...p.members,
                        {
                           username: `new${Date.now()}`,
                           fullName: 'New Member',
                           avatar: `https://i.pravatar.cc/100?u=new${Date.now()}`,
                        },
                     ],
                  }
                  : p
            )
         );
      }
   };

   // Delete project
   const handleOpenDelete = (project) => setDeleteDialog({ open: true, project });
   const handleCloseDelete = () => setDeleteDialog({ open: false, project: null });
   const handleConfirmDelete = () => {
      setProjects(prev => prev.filter(p => p.id !== deleteDialog.project.id));
      handleCloseDelete();
   };

   // Create project
   const handleOpenNewProject = () => setNewProjectDialog(true);
   const handleCloseNewProject = () => setNewProjectDialog(false);
   const handleCreateProject = () => {
      if (newProjectName.trim()) {
         setProjects(prev => [
            ...prev,
            {
               id: Date.now(),
               name: newProjectName,
               members: [],
            },
         ]);
         setNewProjectName('');
         handleCloseNewProject();
      }
   };

   const handleOpenMenu = (event, project) => {
      setAnchorEl(event.currentTarget);
      setMenuProject(project);
   };
   const handleCloseMenu = () => {
      setAnchorEl(null);
      setMenuProject(null);
   };
   const handleMenuDelete = () => {
      handleOpenDelete(menuProject);
      handleCloseMenu();
   };

   // ฟังก์ชันเปิด popup และโหลดรายชื่อผู้ใช้ที่ยังไม่ได้อยู่ในโปรเจกต์
   const handleOpenAddMember = async (project) => {
      setShowAddMember(project);
      setAddLoading(true);
      setAddError('');
      try {
         const res = await fetch('http://192.168.1.36:3000/api/project/chat/getUserNotInProject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id }),
         });
         const data = await res.json();
         setAddList(
            (data.users || data || []).map(u => ({
               id: u.userId || u.id,
               fullName: u.fullName || '',
               username: u.username || '',
               avatarUrl: u.avatarUrl || '',
            }))
         );
      } catch {
         setAddList([]);
         setAddError('Failed to load users');
      }
      setAddLoading(false);
   };

   const handleAddUserToProject = async (userId) => {
      setAddingUserId(userId);
      try {
         await fetch('http://192.168.1.36:3000/api/project/chat/toggleUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: showAddMember.id, uid: userId, isMember: false }),
         });
         setAddList(list => list.filter(u => u.id !== userId));
         // เพิ่มสมาชิกใน projects state ด้วยถ้าต้องการ
         setProjects(prev =>
            prev.map(p =>
               p.id === showAddMember.id
                  ? {
                     ...p,
                     members: [
                        ...p.members,
                        {
                           username: userId,
                           fullName: addList.find(u => u.id === userId)?.fullName || '',
                           avatar: `https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${userId}/avatar.jpg?${Date.now()}`
                        }
                     ]
                  }
                  : p
            )
         );
      } catch {
         setAddError('Failed to add user');
      }
      setAddingUserId(null);
   };

   return (
      <PageContainer title="Dashboard" description="this is Dashboard">
         {isLgUp && (
            <Card variant="outlined" sx={{ height: '89vh', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
               <CardContent sx={{ p: 0, "&:last-child": { pb: 2 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {/* Search & Create */}
                  <Box sx={{ position: 'sticky', top: 0, zIndex: 12, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: 2 }}>
                     <Stack direction="row" spacing={2}>
                        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenNewProject}>
                           Create project
                        </Button>
                        <Paper
                           variant="outlined"
                           component="form"
                           sx={{
                              borderRadius: 2,
                              p: '2px 4px',
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1,
                              minWidth: 0,
                              height: 40
                           }}
                        >
                           <InputBase
                              sx={{ ml: 1, flex: 1 }}
                              placeholder="Search projects"
                              inputProps={{ 'aria-label': 'search projects' }}
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                           />
                        </Paper>
                     </Stack>
                  </Box>
                  {/* Table */}
                  <TableContainer
                     sx={{
                        flex: 1,
                        minHeight: 0,
                        maxHeight: '100%',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-track': { backgroundColor: (t) => t.palette.primary.transparent, borderRadius: '3px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.grey[400], borderRadius: '3px' },
                        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: (t) => t.palette.grey[500] },
                     }}
                  >
                     <Table stickyHeader sx={{ minWidth: 650 }}>
                        <TableHead>
                           <TableRow>
                              <TableCell sx={{ width: '60%', backgroundColor: theme.palette.grey[100] }}>
                                 <Typography fontWeight={700}>Project Name</Typography>
                              </TableCell>
                              <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100] }}>
                                 <Typography fontWeight={700}>Members</Typography>
                              </TableCell>
                              <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100] }} align="right">
                                 <Typography fontWeight={700}></Typography>
                              </TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {filteredProjects.map((project) => (
                              <TableRow key={project.id} hover>
                                 {/* Project Name (click to edit) */}
                                 <TableCell sx={{ py: 1 }}>
                                    {editId === project.id ? (
                                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <TextField
                                             value={editName}
                                             size="small"
                                             onChange={e => setEditName(e.target.value)}
                                             onBlur={() => handleSaveName(project.id)}
                                             onKeyDown={e => {
                                                if (e.key === 'Enter') handleSaveName(project.id);
                                             }}
                                             autoFocus
                                          />
                                          <Button size="small" onClick={() => handleSaveName(project.id)}>Save</Button>
                                       </Box>
                                    ) : (
                                       <Typography
                                          fontWeight={500}
                                          sx={{ cursor: 'pointer' }}
                                          onClick={() => handleEditName(project.id, project.name)}
                                       >
                                          {project.name}
                                       </Typography>
                                    )}
                                 </TableCell>
                                 {/* Members (click to see/add/delete) */}
                                 <TableCell sx={{ py: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                       {project.members.slice(0, 7).map(member => (
                                          <Avatar
                                             key={member.username}
                                             src={member.avatar}
                                             alt={member.fullName}
                                             sx={{ width: 32, height: 32, cursor: 'pointer' }}
                                             onClick={() => handleOpenMember(project)}
                                          />
                                       ))}
                                       {project.members.length > 7 && (
                                          <Box
                                             sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: 'grey.500',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 500,
                                                fontSize: 14,
                                                cursor: 'pointer',
                                             }}
                                             onClick={() => handleOpenMember(project)}
                                          >
                                             +{project.members.length - 7}
                                          </Box>
                                       )}
                                       <IconButton size="small" onClick={() => handleOpenAddMember(project)}>
                                          <AddIcon />
                                       </IconButton>
                                    </Stack>
                                 </TableCell>
                                 {/* Actions */}
                                 <TableCell align="right" sx={{ py: 1 }}>
                                    <IconButton onClick={e => handleOpenMenu(e, project)}>
                                       <MoreVertIcon />
                                    </IconButton>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </TableContainer>
               </CardContent>
            </Card>
         )}  {!isLgUp && (
            <Box >
               <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
               </Box>
            </Box>
         )}


         {/* Member Dialog */}
         {memberDialog.open && (
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
                     maxHeight: '80vh', // เพิ่มบรรทัดนี้
                     bgcolor: 'background.paper',
                     borderRadius: 3,
                     boxShadow: 24,
                     p: 3,
                     position: 'relative',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 2,
                     overflowY: 'auto', // เพิ่มให้ scroll ได้
                  }}
               >
                  <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                     Project Members
                  </Typography>
                  <List
                     sx={{
                        maxHeight: '60vh', // กำหนดความสูงสูงสุดของรายชื่อสมาชิก
                        overflowY: 'auto', // ให้ scroll เฉพาะตรงนี้
                        mb: 2,
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-track': { backgroundColor: (t) => t.palette.background.default, borderRadius: '3px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.grey[400], borderRadius: '3px' },
                        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: (t) => t.palette.grey[500] },
                     }}
                  >
                     {memberDialog.project?.members.map(member => (
                        <ListItem key={member.username}>
                           <ListItemAvatar>
                              <Avatar src={member.avatar} alt={member.fullName} />
                           </ListItemAvatar>
                           <ListItemText primary={member.fullName} secondary={member.username} />
                           <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => handleDeleteMember(member.username)}>
                                 <DeleteIcon />
                              </IconButton>
                           </ListItemSecondaryAction>
                        </ListItem>
                     ))}
                  </List>
                  <Button
                     variant="outlined"
                     startIcon={<AddIcon />}
                     onClick={() => handleOpenAddMember(memberDialog.project)}
                     sx={{ mt: 2 }}
                  >
                     Add Member
                  </Button>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     <Button onClick={handleCloseMember} startIcon={<CloseIcon />}>Close</Button>
                  </Box>
               </Box>
            </Box>
         )}

         {/* Delete Dialog */}
         {deleteDialog.open && (
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
                     Are you sure you want to delete project <b>{deleteDialog.project?.name}</b>?
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     <Button onClick={handleCloseDelete} startIcon={<CloseIcon />}>Cancel</Button>
                     <Button color="error" onClick={handleConfirmDelete} startIcon={<DeleteIcon />}>Delete</Button>
                  </Box>
               </Box>
            </Box>
         )}

         {/* Create Project Dialog */}
         {newProjectDialog && (
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
                     maxHeight: '90vh',
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
                     Create Project
                  </Typography>
                  <TextField
                     fullWidth
                     label="Project Name"
                     value={newProjectName}
                     onChange={e => setNewProjectName(e.target.value)}
                     autoFocus
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     <Button onClick={handleCloseNewProject} startIcon={<CloseIcon />}>Cancel</Button>
                     <Button variant="contained" onClick={handleCreateProject} startIcon={<AddIcon />}>Create</Button>
                  </Box>
               </Box>
            </Box>
         )}

         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
         >
            <MenuItem onClick={handleMenuDelete}>
               <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
               Delete this project
            </MenuItem>
         </Menu>

         {/* Add Member Popup */}
         {showAddMember && (
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
                     width: 350,
                     height: 350,
                     bgcolor: 'background.paper',
                     borderRadius: 3,
                     boxShadow: 24,
                     p: 3,
                     position: 'relative',
                     display: 'flex',
                     flexDirection: 'column',
                  }}
               >
                  <Typography variant="subtitle1" mb={2} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                     Add member
                  </Typography>
                  <TextField
                     fullWidth
                     size="small"
                     placeholder="Search user"
                     value={addSearch}
                     onChange={e => setAddSearch(e.target.value)}
                     sx={{ mb: 2 }}
                  />
                  {addLoading ? (
                     <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CircularProgress size={18} /> Loading...
                     </Box>
                  ) : addList.length === 0 ? (
                     <Typography variant="body2" color="text.secondary">No users to add</Typography>
                  ) : (
                     <List>
                        {addList
                           .filter(u =>
                              (u.fullName || u.username || '')
                                 .toLowerCase()
                                 .includes(addSearch.toLowerCase())
                           )
                           .map(u => (
                              <ListItem key={u.id} secondaryAction={
                                 <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleAddUserToProject(u.id)}
                                    disabled={addingUserId === u.id}
                                 >
                                    {addingUserId === u.id ? 'Adding...' : 'Add'}
                                 </Button>
                              }>
                                 <ListItemAvatar>
                                    <Avatar src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${u.id}/avatar.jpg?${Date.now()}`}>
                                       {(u.fullName || u.username || '??').slice(0, 2).toUpperCase()}
                                    </Avatar>
                                 </ListItemAvatar>
                                 <ListItemText
                                    primary={u.fullName || u.username || u.id}
                                    secondary={u.username ? `@${u.username}` : null}
                                 />
                              </ListItem>
                           ))}
                     </List>
                  )}
                  {addError && <Typography color="error" variant="body2" mt={1}>{addError}</Typography>}
                  <IconButton
                     onClick={() => {
                        setShowAddMember(false);
                        setAddList([]);
                        setAddError('');
                        setAddSearch('');
                     }}
                     sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                     <CloseIcon />
                  </IconButton>
               </Box>
            </Box>
         )}
      </PageContainer>
   );
};

export default Dashboard;