import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Avatar, Box, Stack, Button, TextField, Paper, InputBase,Select, MenuItem, IconButton
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
import TableSortLabel from '@mui/material/TableSortLabel';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useUserManagement } from 'src/contexts/UserManagementContext';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getCachedAvatarUrl } from 'src/utils/avatarCache';

const ROLE_OPTIONS = ['root', 'admin', 'verified', 'unverified'];

const ROLE_ICONS = {
  root: <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1, color: '#C2185B' }} />,
  admin: <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1, color: '#d39117ff' }} />,
  verified: <VerifiedUserIcon fontSize="small" sx={{ mr: 1, color: '#0fb972ff' }} />,
  unverified: <WarningAmberIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />,
};

const ROLE_COLORS = {
  root: '#F3E5F5',        // orange
  admin: '#ffefd2ff',       // magenta (ใช้สีม่วงอ่อนแทน magenta)
  verified: '#e3fdf0ff',    // blue
  unverified: '#F5F5F5',  // grey
};

const ROLE_TEXT_COLORS = {
  root: '#C2185B',        // orange
  admin: '#d39117ff',       // magenta
  verified: '#0fb972ff',    // blue
  unverified: '#757575',  // grey
};

const Dashboard = () => {
  const {
    users,
    setUsers,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    filteredUsers,
  } = useUserManagement();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // state สำหรับแก้ไขแต่ละ field แยกกัน
  const [editFullNameIdx, setEditFullNameIdx] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsernameIdx, setEditUsernameIdx] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuIdx, setMenuIdx] = useState(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [roleFilterAnchorEl, setRoleFilterAnchorEl] = useState(null);

  console.log('users', users);

  const handleRoleChange = async (idx, newRole) => {
    await handleUpdateUser(idx, 'role', newRole);
  };

  // ฟังก์ชันแก้ไขชื่อ
  const handleEditFullName = (idx, fullName) => {
    setEditFullNameIdx(idx);
    setEditFullName(fullName);
  };
  const handleSaveFullName = async (idx) => {
    await handleUpdateUser(idx, 'fullName', editFullName);
    setEditFullNameIdx(null);
    setEditFullName('');
  };

  // ฟังก์ชันแก้ไข username
  const handleEditUsername = (idx, username) => {
    setEditUsernameIdx(idx);
    setEditUsername(username);
  };
  const handleSaveUsername = async (idx) => {
    await handleUpdateUser(idx, 'username', editUsername);
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

  const handleUpdateUser = async (idx, field, value) => {
    const targetUser = users[idx];
    if (!targetUser || !user?.uid) return;

    try {
      const res = await fetch('http://192.168.1.36:3000/api/root/userManage/updateAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid, // คนที่กำลังแก้ไข
          targetUserId: targetUser.uid || targetUser.userId, // คนที่ถูกแก้ไข
          [field]: value,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev =>
          prev.map((u, i) =>
            i === idx ? { ...u, [field]: value } : u
          )
        );
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const sortedUsers = React.useMemo(() => {
    let arr = [...filteredUsers];
    if (sortBy) {
      arr.sort((a, b) => {
        let va = (a[sortBy] || '').toString().toLowerCase();
        let vb = (b[sortBy] || '').toString().toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [filteredUsers, sortBy, sortDir]);

  if (isMobile) {
    // แสดงแบบ Card list สำหรับ mobile/tablet
    return (
      <PageContainer title="Dashboard" description="this is Dashboard">
        <Card variant="outlined" sx={{ height: '100%', minHeight: 400, overflowY: 'auto', borderRadius: '10px', width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
          <CardContent sx={{ height: '100%', p: 0, "&:last-child": { pb: 0 }, width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
            <Box sx={{ p: 2 }}>
              {/* Search & Filter Controls */}
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
            <Stack spacing={2} sx={{ p: 2 }}>
              {sortedUsers.map((user, idx) => (
                <Card key={user.username} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{ width: 32, height: 32 }}
                          src={getCachedAvatarUrl(user.uid || user.userId)}
                          alt={user.fullName}
                        />
                        {/* Full Name (edit inline) */}
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
                              sx={{ width: 180 }}
                            />
                            <Button size="small" onClick={() => handleSaveFullName(idx)}>Save</Button>
                            <Button size="small" color="inherit" onClick={() => { setEditFullNameIdx(null); setEditFullName(''); }}>Cancel</Button>
                          </Box>
                        ) : (
                          <Typography fontWeight={500} sx={{ cursor: 'pointer' }} onClick={() => handleEditFullName(idx, user.fullName)}>
                            {user.fullName} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                          </Typography>
                        )}
                        <Box sx={{ flex: 1 }} />
                        <IconButton size="small" onClick={e => {
                          setMenuAnchorEl(e.currentTarget);
                          setMenuIdx(idx);
                        }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography fontSize={14} color="text.secondary">{user.email}</Typography>
                      {/* Username (edit inline) */}
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
                            sx={{ width: 180 }}
                          />
                          <Button size="small" onClick={() => handleSaveUsername(idx)}>Save</Button>
                          <Button size="small" color="inherit" onClick={() => { setEditUsernameIdx(null); setEditUsername(''); }}>Cancel</Button>
                        </Box>
                      ) : (
                        <Typography fontSize={14} color="text.secondary" fontWeight={500} sx={{ cursor: 'pointer' }} onClick={() => handleEditUsername(idx, user.username)}>
                          {user.username} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                        </Typography>
                      )}
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: ROLE_COLORS[user.role],
                            color: ROLE_TEXT_COLORS[user.role],
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            fontWeight: 500,
                            gap: 1,
                            width: 130,
                            justifyContent: 'flex-start',
                          }}
                        >
                          {ROLE_ICONS[user.role]}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
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
  }

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
                  <TableCell
                    sx={{ width: '30%', backgroundColor: theme.palette.grey[100] }}
                    sortDirection={sortBy === 'fullName' ? sortDir : false}
                  >
                    <TableSortLabel
                      active={sortBy === 'fullName'}
                      direction={sortBy === 'fullName' ? sortDir : 'asc'}
                      onClick={() => handleSort('fullName')}
                    >
                      <Typography fontWeight={700}>Full Name</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ width: '20%', backgroundColor: theme.palette.grey[100] }}
                    sortDirection={sortBy === 'email' ? sortDir : false}
                  >
                    <TableSortLabel
                      active={sortBy === 'email'}
                      direction={sortBy === 'email' ? sortDir : 'asc'}
                      onClick={() => handleSort('email')}
                    >
                      <Typography fontWeight={700}>Email</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ width: '20%', backgroundColor: theme.palette.grey[100] }}
                    sortDirection={sortBy === 'username' ? sortDir : false}
                  >
                    <TableSortLabel
                      active={sortBy === 'username'}
                      direction={sortBy === 'username' ? sortDir : 'asc'}
                      onClick={() => handleSort('username')}
                    >
                      <Typography fontWeight={700}>Username</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ width: '15%', backgroundColor: theme.palette.grey[100] }}
                    sortDirection={sortBy === 'role' ? sortDir : false}
                  >
                    <TableSortLabel
                      active={sortBy === 'role'}
                      direction={sortBy === 'role' ? sortDir : 'asc'}
                      onClick={() => handleSort('role')}
                    >
                      <Typography fontWeight={700}>Role</Typography>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ width: '5%', backgroundColor: theme.palette.grey[100] }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user, idx) => (
                  <TableRow key={user.username} hover>
                    {/* Full Name (edit inline) */}
                    <TableCell sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{ width: 32, height: 32 }}
                          src={getCachedAvatarUrl(user.uid || user.userId)}
                          alt={user.fullName}
                        />
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
                              sx={{ width: 180 }}
                            />
                            <Button size="small" onClick={() => handleSaveFullName(idx)}>Save</Button>
                            <Button size="small" color="inherit" onClick={() => { setEditFullNameIdx(null); setEditFullName(''); }}>Cancel</Button>
                          </Box>
                        ) : (
                          <Typography fontWeight={500} sx={{ cursor: 'pointer' }} onClick={() => handleEditFullName(idx, user.fullName)}>
                            {user.fullName} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {/* Email */}
                    <TableCell sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Typography>{user.email}</Typography>
                    </TableCell>
                    {/* Username (edit inline) */}
                    <TableCell sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
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
                            sx={{ width: 180 }}
                          />
                          <Button size="small" onClick={() => handleSaveUsername(idx)}>Save</Button>
                          <Button size="small" color="inherit" onClick={() => { setEditUsernameIdx(null); setEditUsername(''); }}>Cancel</Button>
                        </Box>
                      ) : (
                        <Typography fontWeight={500} sx={{ cursor: 'pointer' }} onClick={() => handleEditUsername(idx, user.username)}>
                          {user.username} <EditIcon sx={{ ml: 1, width: 12, height: 12 }} />
                        </Typography>
                      )}
                    </TableCell>
                    {/* Role */}
                    <TableCell sx={{ py: 1, borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                      <Select
                        value={user.role}
                        size="small"
                        onChange={e => handleRoleChange(idx, e.target.value)}
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
                        renderValue={role => (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: ROLE_COLORS[role],
                              color: ROLE_TEXT_COLORS[role],
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              fontWeight: 500,
                              gap: 1,
                              width: 110,
                              justifyContent: 'flex-start',
                            }}
                          >
                            {ROLE_ICONS[role]}
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </Box>
                        )}
                      >
                        {ROLE_OPTIONS.map(role => (
                          <MenuItem key={role} value={role}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: ROLE_COLORS[role],
                                color: ROLE_TEXT_COLORS[role],
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontWeight: 500,
                                gap: 1,
                                width: 130,
                                justifyContent: 'flex-start',
                              }}
                            >
                              {ROLE_ICONS[role]}
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Box>
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