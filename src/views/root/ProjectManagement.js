import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Avatar, Box, Stack, Button, Paper, InputBase, IconButton, List, ListItem,
  ListItemAvatar, ListItemText, ListItemSecondaryAction, TextField, useMediaQuery, Menu,
  MenuItem, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageContainer from 'src/components/container/PageContainer';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useSelector } from 'react-redux';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import Select from '@mui/material/Select';
import { getCachedAvatarUrl } from 'src/utils/avatarCache';
import { useProjectManagement } from 'src/contexts/ProjectManagementContext';

// API endpoints
const API_ENDPOINTS = {
  toggleInviteLink: "http://192.168.1.36:3000/api/project/invite/toggleInviteLink",
  deleteProject: "http://192.168.1.36:3000/api/project/general/deleteProject",
  updateProjectName: "http://192.168.1.36:3000/api/project/general/updateProjectName",
  getUserNotInProject: "http://192.168.1.36:3000/api/project/chat/getUserNotInProject",
  addUserToProject: "http://192.168.1.36:3000/api/project/general/toggleUser"
};

const INVITE_OPTIONS = ['Enable', 'Disable'];
const INVITE_ICONS = {
  Enable: <PersonAddIcon fontSize="small" sx={{ mr: 1, color: '#0c6396ff' }} />,
  Disable: <PersonAddDisabledIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />,
};
const INVITE_COLORS = {
  Enable: '#b4e2fdff',
  Disable: '#F5F5F5',
};
const INVITE_TEXT_COLORS = {
  Enable: '#0c6396ff',
  Disable: '#757575',
};

const Dashboard = () => {
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const user = useSelector(state => state.auth.user);
  const { projects, setProjects, search, setSearch } = useProjectManagement();

  // State
  const [editIdx, setEditIdx] = useState(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [memberDialog, setMemberDialog] = useState({ open: false, project: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, project: null });
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProject, setMenuProject] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addList, setAddList] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSearch, setAddSearch] = useState('');
  const [addingUserId, setAddingUserId] = useState(null);

  // Filter projects by name
  const filteredProjects = projects.filter(p =>
    (p.projectName || p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // ----------- Project Name Edit -----------
  const handleEditProjectName = (idx, name) => {
    setEditIdx(idx);
    setEditProjectName(name);
  };
  const handleSaveProjectName = async (idx) => {
    const targetProject = filteredProjects[idx];
    if (!targetProject) return;
    try {
      await fetch(API_ENDPOINTS.updateProjectName, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: targetProject.projectId,
          newName: editProjectName,
        }),
      });
      setProjects(prev =>
        prev.map((p, i) =>
          i === idx ? { ...p, projectName: editProjectName } : p
        )
      );
    } catch (err) {
      // handle error
    }
    setEditIdx(null);
    setEditProjectName('');
  };

  // ----------- Invite Toggle -----------
  const getInviteLabel = (val) => val === true ? 'Enable' : 'Disable';
  const handleToggleInvite = async (idx, newVal) => {
    const targetProject = filteredProjects[idx];
    if (!targetProject) return;
    setProjects(prev =>
      prev.map((p, i) =>
        i === idx ? { ...p, isCanInvite: newVal } : p
      )
    );
    await fetch(API_ENDPOINTS.toggleInviteLink, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: targetProject.projectId, isCanInvite: newVal }),
    });
  };

  // ----------- Member Dialog -----------
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

  // ----------- Add Member -----------
  const handleOpenAddMember = async (project) => {
    setShowAddMember(project);
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch(API_ENDPOINTS.getUserNotInProject, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.projectId }),
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

  const handleAddUserToProject = async (projectId, userId) => {
    setAddingUserId(userId);
    try {
      await fetch(API_ENDPOINTS.addUserToProject, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, uid: userId, isMember: false }),
      });
      setAddList(list => list.filter(u => u.id !== userId));
      setProjects(prev =>
        prev.map(p =>
          p.projectId === projectId
            ? {
              ...p,
              members: [
                ...p.members,
                {
                  uid: userId,
                  username: addList.find(u => u.id === userId)?.username || '',
                  fullName: addList.find(u => u.id === userId)?.fullName || '',
                  avatar: getCachedAvatarUrl(userId),
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

  // ----------- Delete Project -----------
  const handleOpenDelete = (project) => setDeleteDialog({ open: true, project });
  const handleCloseDelete = () => setDeleteDialog({ open: false, project: null });
  const handleConfirmDelete = async () => {
    const targetProject = deleteDialog.project;
    if (!targetProject) return;
    await fetch(API_ENDPOINTS.deleteProject, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: targetProject.projectId }),
    });
    setProjects(prev => prev.filter(p => p.projectId !== targetProject.projectId));
    setDeleteDialog({ open: false, project: null });
  };

  // ----------- Menu -----------
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

  // ----------- Render -----------
  if (!isLgUp) {
    return (
      <PageContainer title="Dashboard" description="this is Dashboard">
        <Card variant="outlined" sx={{ height: '100%', minHeight: 400, overflowY: 'auto', borderRadius: '10px', width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
          <CardContent sx={{ height: '100%', p: 0, "&:last-child": { pb: 0 }, width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
            <Box sx={{ p: 2 }}>
              {/* Search */}
              <Stack direction="column" spacing={2}>
                <Paper
                  variant="outlined"
                  component="form"
                  sx={{
                    borderRadius: 2,
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
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
            <Stack spacing={2} sx={{ p: 2 }}>
              {filteredProjects.map((project, idx) => (
                <Card key={project.id} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={700} sx={{ fontSize: 18 }}>
                          {editIdx === idx ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                value={editProjectName}
                                size="small"
                                onChange={e => setEditProjectName(e.target.value)}
                                onBlur={() => handleSaveProjectName(idx)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveProjectName(idx);
                                }}
                                autoFocus
                                sx={{ width: 180 }}
                              />
                              <IconButton size="small" color="success" onClick={() => handleSaveProjectName(idx)}>
                                <CheckIcon />
                              </IconButton>
                              <IconButton size="small" color="inherit" onClick={() => { setEditIdx(null); setEditProjectName(''); }}>
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <span style={{ cursor: 'pointer' }} onClick={() => handleEditProjectName(idx, project.projectName)}>
                              {project.projectName} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                            </span>
                          )}
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        {/* MoreVertIcon for menu */}
                        <IconButton
                          size="small"
                          onClick={e => {
                            setAnchorEl(e.currentTarget);
                            setMenuProject(project);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      {/* Invite toggle */}
                      <Box sx={{ mt: 1 }}>
                        <Select
                          value={getInviteLabel(project.isCanInvite)}
                          size="small"
                          onChange={e => {
                            const newVal = e.target.value === 'Enable';
                            handleToggleInvite(idx, newVal);
                          }}
                          variant="standard"
                          disableUnderline
                          sx={{
                            minWidth: 140,
                            fontWeight: 500,
                            background: 'none',
                            boxShadow: 'none',
                            '& .MuiSelect-standard': { background: 'none' },
                            '& fieldset': { border: 'none' },
                          }}
                          renderValue={invite => (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: INVITE_COLORS[invite],
                                color: INVITE_TEXT_COLORS[invite],
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontWeight: 500,
                                gap: 1,
                                width: 110,
                                justifyContent: 'flex-start',
                              }}
                            >
                              {INVITE_ICONS[invite]}
                              {invite.charAt(0).toUpperCase() + invite.slice(1)}
                            </Box>
                          )}
                        >
                          {INVITE_OPTIONS.map(invite => (
                            <MenuItem key={invite} value={invite}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  bgcolor: INVITE_COLORS[invite],
                                  color: INVITE_TEXT_COLORS[invite],
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  fontWeight: 500,
                                  gap: 1,
                                  width: 130,
                                  justifyContent: 'flex-start',
                                }}
                              >
                                {INVITE_ICONS[invite]}
                                {invite.charAt(0).toUpperCase() + invite.slice(1)}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                      {/* Members */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        {project.members.slice(0, 7).map(member => (
                          <Avatar
                            key={member.username}
                            src={getCachedAvatarUrl(member.uid)}
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
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            {/* เมนู More */}
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
            {/* Delete Dialog */}
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
                      Are you sure you want to delete project <b>{deleteDialog.project?.projectName}</b>?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button onClick={() => setDeleteDialog({ open: false, project: null })} startIcon={<CloseIcon />}>Cancel</Button>
                      <Button
                        color="error"
                        onClick={handleConfirmDelete}
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Box>,
                document.body
              )
            }
            {/* Member Dialog & Add Member Popup (reuse from desktop) */}
            {memberDialog.open &&
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
                      maxHeight: '80vh',
                      bgcolor: 'background.paper',
                      borderRadius: 3,
                      boxShadow: 24,
                      p: 3,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      overflowY: 'auto',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                      Project Members
                    </Typography>
                    <List
                      sx={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
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
                            <Avatar src={getCachedAvatarUrl(member.uid)} alt={member.fullName} />
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
                </Box>,
                document.body
              )
            }
            {showAddMember &&
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
                                onClick={() => handleAddUserToProject(showAddMember.projectId, u.id)}
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
                </Box>,
                document.body
              )
            }
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      {isLgUp && (
        <Card variant="outlined" sx={{ height: '89vh', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 2 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Search */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 12, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: 2 }}>
              <Stack direction="row" spacing={2}>
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
                    <TableCell sx={{ width: '40%', backgroundColor: theme.palette.grey[100], borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Typography fontWeight={700}>Project Name</Typography>
                    </TableCell>
                    <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100], borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Typography fontWeight={700}>Is can invite</Typography>
                    </TableCell>
                    <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100], borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Typography fontWeight={700}>Members</Typography>
                    </TableCell>
                    <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100], borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }} align="right">
                      <Typography fontWeight={700}></Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.map((project, idx) => (
                    <TableRow key={project.id} hover>
                      {/* Project Name (edit inline) */}
                      <TableCell sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {editIdx === idx ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                value={editProjectName}
                                size="small"
                                onChange={e => setEditProjectName(e.target.value)}
                                onBlur={() => handleSaveProjectName(idx)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveProjectName(idx);
                                  if (e.key === 'Escape') { setEditIdx(null); setEditProjectName(''); }
                                }}
                                autoFocus
                                sx={{ width: 180 }}
                              />
                              <IconButton size="small" color="success" onClick={() => handleSaveProjectName(idx)}>
                                <CheckIcon />
                              </IconButton>
                              <IconButton size="small" color="inherit" onClick={() => { setEditIdx(null); setEditProjectName(''); }}>
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Typography
                              fontWeight={500}
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleEditProjectName(idx, project.projectName)}
                            >
                              {project.projectName} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      {/* toggle invite */}
                      <TableCell sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                        <Select
                          value={getInviteLabel(project.isCanInvite)}
                          size="small"
                          onChange={e => {
                            const newVal = e.target.value === 'Enable';
                            handleToggleInvite(idx, newVal);
                          }}
                          variant="standard"
                          disableUnderline
                          sx={{
                            minWidth: 140,
                            fontWeight: 500,
                            background: 'none',
                            boxShadow: 'none',
                            '& .MuiSelect-standard': { background: 'none' },
                            '& fieldset': { border: 'none' },
                          }}
                          renderValue={invite => (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: INVITE_COLORS[invite],
                                color: INVITE_TEXT_COLORS[invite],
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontWeight: 500,
                                gap: 1,
                                width: 110,
                                justifyContent: 'flex-start',
                              }}
                            >
                              {INVITE_ICONS[invite]}
                              {invite.charAt(0).toUpperCase() + invite.slice(1)}
                            </Box>
                          )}
                        >
                          {INVITE_OPTIONS.map(invite => (
                            <MenuItem key={invite} value={invite}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  bgcolor: INVITE_COLORS[invite],
                                  color: INVITE_TEXT_COLORS[invite],
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  fontWeight: 500,
                                  gap: 1,
                                  width: 130,
                                  justifyContent: 'flex-start',
                                }}
                              >
                                {INVITE_ICONS[invite]}
                                {invite.charAt(0).toUpperCase() + invite.slice(1)}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      {/* Members */}
                      <TableCell sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {project.members.slice(0, 7).map(member => (
                            <Avatar
                              key={member.username}
                              src={getCachedAvatarUrl(member.uid)}
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
                      <TableCell align="right" sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                        <IconButton
                          size="small"
                          onClick={e => {
                            setAnchorEl(e.currentTarget);
                            setMenuProject(project);
                          }}
                        >
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
      {memberDialog.open &&
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
                maxHeight: '80vh',
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 24,
                p: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflowY: 'auto',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                Project Members
              </Typography>
              <List
                sx={{
                  maxHeight: '60vh',
                  overflowY: 'auto',
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
                      <Avatar src={getCachedAvatarUrl(member.uid)} alt={member.fullName} />
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
          </Box>,
          document.body
        )}

      {/* Delete Dialog */}
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
                Are you sure you want to delete project <b>{deleteDialog.project?.projectName}</b>?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setDeleteDialog({ open: false, project: null })} startIcon={<CloseIcon />}>Cancel</Button>
                <Button
                  color="error"
                  onClick={handleConfirmDelete}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Box>,
          document.body
        )}

      {/* Add Member Popup */}
      {showAddMember &&
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
                          onClick={() => handleAddUserToProject(showAddMember.projectId, u.id)}
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
          </Box>,
          document.body
        )}

      {/* Menu */}
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
    </PageContainer>
  );
};

export default Dashboard;