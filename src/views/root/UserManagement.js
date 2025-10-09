import React, { useEffect, useState, } from 'react';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, Avatar, Box, Stack, Button, TextField, Paper, InputBase, useMediaQuery,
  Select, MenuItem, IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Menu from '@mui/material/Menu';
import ReactDOM from 'react-dom';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';

import { useUserManagement } from 'src/contexts/UserManagementContext'; // Add this import
import { width } from '@mui/system';

const mockUsers = [
  {
    email: 'm@gmail.com',
    fullName: 'TEST',
    role: 'unverified',
    username: 'test3sadasd',
    avatar: 'https://i.pravatar.cc/100?u=test3sadasd',
  },
  {
    email: 'a@gmail.com',
    fullName: 'Netipong Sanklar',
    role: 'admin',
    username: 'netipong',
    avatar: 'https://i.pravatar.cc/100?u=netipong',
  },
];

const roleColor = {
  admin: 'success',
  unverified: 'warning',
  user: 'info',
};

const ROLE_OPTIONS = ['root', 'admin', 'verified', 'unverified'];

const Dashboard = () => {
  const theme = useTheme();
  const [search, setSearch] = React.useState('');
  const [roleFilterAnchorEl, setRoleFilterAnchorEl] = useState(null);
  // เปลี่ยน roleFilter เป็น array
  const [roleFilter, setRoleFilter] = useState([]);
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const isXsUp = useMediaQuery(theme.breakpoints.up('sm'));
  const user = useSelector(state => state.auth.user);

  const [users, setUsers] = useState(mockUsers);

  // state สำหรับแก้ไขแต่ละ field แยกกัน
  const [editFullNameIdx, setEditFullNameIdx] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsernameIdx, setEditUsernameIdx] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuIdx, setMenuIdx] = useState(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  // filter users ใหม่
  const filteredUsers = users.filter(
    u =>
      (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter.length === 0 || roleFilter.includes(u.role))
  );

  const handleRoleChange = (idx, newRole) => {
    setUsers(prev =>
      prev.map((u, i) => (i === idx ? { ...u, role: newRole } : u))
    );
  };

  // ฟังก์ชันแก้ไขชื่อ
  const handleEditFullName = (idx, fullName) => {
    setEditFullNameIdx(idx);
    setEditFullName(fullName);
  };
  const handleSaveFullName = (idx) => {
    setUsers(prev =>
      prev.map((u, i) =>
        i === idx ? { ...u, fullName: editFullName } : u
      )
    );
    setEditFullNameIdx(null);
    setEditFullName('');
  };

  // ฟังก์ชันแก้ไข username
  const handleEditUsername = (idx, username) => {
    setEditUsernameIdx(idx);
    setEditUsername(username);
  };
  const handleSaveUsername = (idx) => {
    setUsers(prev =>
      prev.map((u, i) =>
        i === idx ? { ...u, username: editUsername } : u
      )
    );
    setEditUsernameIdx(null);
    setEditUsername('');
  };

  // ลบผู้ใช้
  const handleDeleteUser = (idx) => {
    setUsers(prev => prev.filter((_, i) => i !== idx));
    setConfirmDeleteIdx(null);
    setMenuAnchorEl(null);
    setMenuIdx(null);
  };

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Card variant="outlined" sx={{ height: '89vh', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 2 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Search bar */}
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
                  placeholder="Search users"
                  inputProps={{ 'aria-label': 'search users' }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </Paper>
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 120, textTransform: 'none' }}
                onClick={e => setRoleFilterAnchorEl(e.currentTarget)}
              >
                {roleFilter.length === 0
                  ? 'All Roles'
                  : roleFilter.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
              </Button>
              <Menu
                anchorEl={roleFilterAnchorEl}
                open={Boolean(roleFilterAnchorEl)}
                onClose={() => setRoleFilterAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={() => {
                    setRoleFilter([]);
                    setRoleFilterAnchorEl(null);
                  }}
                >
                  <ListItemIcon>
                    <Checkbox checked={roleFilter.length === 0} />
                  </ListItemIcon>
                  All Roles
                </MenuItem>
                {ROLE_OPTIONS.map(role => (
                  <MenuItem
                    key={role}
                    onClick={() => {
                      if (roleFilter.includes(role)) {
                        setRoleFilter(roleFilter.filter(r => r !== role));
                      } else {
                        setRoleFilter([...roleFilter, role]);
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox checked={roleFilter.includes(role)} />
                    </ListItemIcon>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Menu>
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
                  <TableCell sx={{ width: '30%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                    <Typography fontWeight={700}>Full Name</Typography>
                  </TableCell>
                  <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                    <Typography fontWeight={700}>Email</Typography>
                  </TableCell>
                  <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                    <Typography fontWeight={700}>Username</Typography>
                  </TableCell>
                  <TableCell sx={{ width: '15%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                    <Typography fontWeight={700}>Role</Typography>
                  </TableCell>
                  <TableCell sx={{ width: '5%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, idx) => (
                  <TableRow key={user.username} hover>
                    {/* Full Name (edit inline) */}
                    <TableCell sx={{ py: 1,  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }} src={user.avatar} alt={user.fullName} />
                        {editFullNameIdx === idx ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              value={editFullName}
                              size="small"
                              onChange={e => setEditFullName(e.target.value)}
                              onBlur={() => handleSaveFullName(idx)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveFullName(idx);
                              }}
                              autoFocus
                              sx={{ width: 120 }}
                            />
                            <Button size="small" onClick={() => handleSaveFullName(idx)}>Save</Button>
                          </Box>
                        ) : (
                          <Typography fontWeight={500} sx={{ cursor: 'pointer' }} onClick={() => handleEditFullName(idx, user.fullName)}>
                            {user.fullName} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {/* Email */}
                    <TableCell sx={{ py: 1,  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Typography>{user.email}</Typography>
                    </TableCell>
                    {/* Username (edit inline) */}
                    <TableCell sx={{ py: 1,  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      {editUsernameIdx === idx ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            value={editUsername}
                            size="small"
                            onChange={e => setEditUsername(e.target.value)}
                            onBlur={() => handleSaveUsername(idx)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveUsername(idx);
                            }}
                            autoFocus
                            sx={{ width: 120 }}
                          />
                          <Button size="small" onClick={() => handleSaveUsername(idx)}>Save</Button>
                        </Box>
                      ) : (
                        <Typography fontWeight={500} sx={{ cursor: 'pointer' }} onClick={() => handleEditUsername(idx, user.username)}>
                          {user.username} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                        </Typography>
                      )}
                    </TableCell>
                    {/* Role */}
                    <TableCell sx={{ py: 1,  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Select
                        value={user.role}
                        size="small"
                        onChange={e => handleRoleChange(idx, e.target.value)}
                        sx={{ minWidth: 120, fontWeight: 500 }}
                      >
                        {ROLE_OPTIONS.map(role => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    {/* Actions */}
                    <TableCell align="right" sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <IconButton
                        onClick={e => {
                          setMenuAnchorEl(e.currentTarget);
                          setMenuIdx(idx);
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
          {/* เมนู More */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => { setMenuAnchorEl(null); setMenuIdx(null); }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                setConfirmDeleteIdx(menuIdx);
                setMenuAnchorEl(null);
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete User
            </MenuItem>
          </Menu>
          {/* Confirm Delete Popup */}
          {confirmDeleteIdx !== null &&
            ReactDOM.createPortal(
              <Box
                sx={{
                  position: 'fixed',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.25)',
                  zIndex: 3000,
                  display: 'grid',
                  placeItems: 'center',
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
                    gap: 2
                  }}
                >
                  <Typography variant="h6" mb={2}>Confirm Delete</Typography>
                  <Typography mb={3}>
                    Are you sure you want to delete user <b>{users[confirmDeleteIdx]?.fullName}</b>?
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button onClick={() => setConfirmDeleteIdx(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => handleDeleteUser(confirmDeleteIdx)}>
                      Delete
                    </Button>
                  </Stack>
                </Box>
              </Box>,
              document.body
            )
          }
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Dashboard;