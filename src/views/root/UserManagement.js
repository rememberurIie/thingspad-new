import React, { useEffect, useState, } from 'react';
import {
  Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, Avatar, Box, Stack, Button, TextField, Paper, InputBase, useMediaQuery,
  Select, MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';


import { useDashboard } from 'src/contexts/DashboardContext'; // Add this import

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
  const [roleFilter, setRoleFilter] = useState('all');
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

  const filteredUsers = mockUsers.filter(
    u =>
      (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === 'all' || u.role === roleFilter)
  );

  const [users, setUsers] = useState(mockUsers);

  const handleRoleChange = (idx, newRole) => {
    setUsers(prev =>
      prev.map((u, i) => (i === idx ? { ...u, role: newRole } : u))
    );
  };

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      {/* {isLgUp && ( */}
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
                    <Select
                      value={roleFilter}
                      size="small"
                      onChange={e => setRoleFilter(e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      {ROLE_OPTIONS.map(role => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                      ))}
                    </Select>
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
                        <TableCell sx={{ width: '25%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                          <Typography fontWeight={700}>Email</Typography>
                        </TableCell>
                        <TableCell sx={{ width: '20%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                          <Typography fontWeight={700}>Username</Typography>
                        </TableCell>
                        <TableCell sx={{ width: '15%', backgroundColor: theme.palette.grey[100],  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                          <Typography fontWeight={700}>Role</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user, idx) => (
                        <TableRow key={user.username} hover>
                          <TableCell sx={{ py: 1,  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 32, height: 32 }} src={user.avatar} alt={user.fullName} />
                              <Typography fontWeight={500}>{user.fullName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1,  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                            <Typography>{user.email}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1,  borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                            <Typography>{user.username}</Typography>
                          </TableCell>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          {/* )}  {!isLgUp && (
            <Box >
              <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              </Box>
            </Box>
          )} */}
    </PageContainer>
  );
};

export default Dashboard;