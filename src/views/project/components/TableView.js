import React, { useState } from 'react';
import {
   Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
   Typography, Chip, Avatar, Box, Stack, useMediaQuery, IconButton, InputBase, Paper, Menu, MenuItem, Button, TextField, Dialog, DialogContent, DialogActions, DialogTitle,
   Select, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { mockColumns } from './KandanBoard';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TableSortLabel from '@mui/material/TableSortLabel';

// Flatten tasks for table view
const getAllTasks = () => {
   const rows = [];
   mockColumns.forEach(col => {
      col.tasks.forEach(task => {
         rows.push({
            ...task,
            status: col.title,
            due: task.due,
            assignee: task.assignee,
         });
      });
   });
   return rows;
};

// Update statusColor to get color from mockColumnsInit
const statusColor = (status) => {
   const col = mockColumns.find(col => col.title === status);
   return col ? col.color : 'default';
};

const STATUS_OPTIONS = [
   'New task',
   'Scheduled',
   'In progress',
   'Completed'
];

const getAllAssignees = (rows) => {
   // Get unique assignees for filter dropdown
   const names = rows.map(r => r.assignee).filter(Boolean);
   return Array.from(new Set(names));
};

const TableView = () => {
   const rows = getAllTasks();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
   const [search, setSearch] = useState('');
   const [addOpen, setAddOpen] = useState(false);
   const [editOpen, setEditOpen] = useState(false);
   const [deleteOpen, setDeleteOpen] = useState(false);
   const [selectedRow, setSelectedRow] = useState(null);
   const [menuAnchor, setMenuAnchor] = useState(null);
   const [menuRow, setMenuRow] = useState(null);
   const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
   const [statusMenuRow, setStatusMenuRow] = useState(null);
   const [sortBy, setSortBy] = useState(''); // 'name', 'status', 'due', 'assignee'
   const [sortDirection, setSortDirection] = useState('asc');

   // Filter states
   const [statusFilter, setStatusFilter] = useState('');
   const [assigneeFilter, setAssigneeFilter] = useState('');

   // Add Task State
   const [addData, setAddData] = useState({ name: '', assignee: '', due: '' });

   // Edit Task State
   const [editData, setEditData] = useState({ id: '', name: '', assignee: '', due: '' });

   const handleSearchChange = (e) => setSearch(e.target.value);

   // --- Filter logic ---
   const assigneeOptions = getAllAssignees(rows);

   const filteredRows = rows.filter(row =>
      (row.name.toLowerCase().includes(search.toLowerCase()) ||
         row.assignee?.toLowerCase().includes(search.toLowerCase()))
      && (statusFilter ? row.status === statusFilter : true)
      && (assigneeFilter ? row.assignee === assigneeFilter : true)
   );

   // --- Sorting logic ---
   const handleSort = (column) => {
      if (sortBy === column) {
         setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
         setSortBy(column);
         setSortDirection('asc');
      }
   };

   const sortedRows = React.useMemo(() => {
      const arr = [...filteredRows];
      if (!sortBy) return arr;
      return arr.sort((a, b) => {
         let aValue = a[sortBy] || '';
         let bValue = b[sortBy] || '';
         if (sortBy === 'due') {
            // Try to sort by date if possible, fallback to string
            return sortDirection === 'asc'
               ? String(aValue).localeCompare(String(bValue))
               : String(bValue).localeCompare(String(aValue));
         }
         return sortDirection === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
      });
   }, [filteredRows, sortBy, sortDirection]);

   // --- Menu handlers ---
   const handleMenuOpen = (event, row) => {
      setMenuAnchor(event.currentTarget);
      setMenuRow(row);
   };
   const handleMenuClose = () => {
      setMenuAnchor(null);
      setMenuRow(null);
   };

   // --- Add Task handlers ---
   const handleAddOpen = () => {
      setAddData({ name: '', assignee: '', due: '' });
      setAddOpen(true);
   };
   const handleAddClose = () => setAddOpen(false);
   const handleAddSubmit = () => {
      handleAddClose();
   };

   // --- Edit Task handlers ---
   const handleEditOpen = (row) => {
      setEditData({ ...row });
      setEditOpen(true);
      handleMenuClose();
   };
   const handleEditClose = () => setEditOpen(false);
   const handleEditSubmit = () => {
      handleEditClose();
   };

   // --- Delete Task handlers ---
   const handleDeleteOpen = (row) => {
      setSelectedRow(row);
      setDeleteOpen(true);
      handleMenuClose();
   };
   const handleDeleteClose = () => setDeleteOpen(false);
   const handleDeleteConfirm = () => {
      setDeleteOpen(false);
   };

   // --- Status Change handlers ---
   const handleStatusMenuOpen = (event, row) => {
      setStatusMenuAnchor(event.currentTarget);
      setStatusMenuRow(row);
   };
   const handleStatusMenuClose = () => {
      setStatusMenuAnchor(null);
      setStatusMenuRow(null);
   };
   const handleStatusChange = (status) => {
      if (statusMenuRow) {
         statusMenuRow.status = status;
      }
      handleStatusMenuClose();
   };

   // --- Render Add/Edit/Delete Popups ---
   const renderPopup = () => (
      <>
         {/* Add Task Popup */}
         {addOpen && (
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
                  <Typography variant="subtitle1" mb={2} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                     Add Task
                  </Typography>
                  <TextField
                     fullWidth
                     label="Task Name"
                     value={addData.name}
                     onChange={e => setAddData({ ...addData, name: e.target.value })}
                     sx={{ mb: 2 }}
                  />
                  <TextField
                     fullWidth
                     label="Assignee"
                     value={addData.assignee}
                     onChange={e => setAddData({ ...addData, assignee: e.target.value })}
                     sx={{ mb: 2 }}
                  />
                  <TextField
                     fullWidth
                     label="Due"
                     value={addData.due}
                     onChange={e => setAddData({ ...addData, due: e.target.value })}
                     sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     <Button onClick={handleAddClose} startIcon={<CloseIcon />}>Cancel</Button>
                     <Button variant="contained" onClick={handleAddSubmit} startIcon={<AddIcon />}>Add</Button>
                  </Box>
               </Box>
            </Box>
         )}
         {/* Edit Task Popup */}
         {editOpen && (
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
                  <Typography variant="subtitle1" mb={2} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                     Edit Task
                  </Typography>
                  <TextField
                     fullWidth
                     label="Task Name"
                     value={editData.name}
                     onChange={e => setEditData({ ...editData, name: e.target.value })}
                     sx={{ mb: 2 }}
                  />
                  <TextField
                     fullWidth
                     label="Assignee"
                     value={editData.assignee}
                     onChange={e => setEditData({ ...editData, assignee: e.target.value })}
                     sx={{ mb: 2 }}
                  />
                  <TextField
                     fullWidth
                     label="Due"
                     value={editData.due}
                     onChange={e => setEditData({ ...editData, due: e.target.value })}
                     sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     <Button onClick={handleEditClose} startIcon={<CloseIcon />}>Cancel</Button>
                     <Button variant="contained" onClick={handleEditSubmit} startIcon={<EditIcon />}>Save</Button>
                  </Box>
               </Box>
            </Box>
         )}
         {/* Delete Confirm Popup */}
         {deleteOpen && (
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
                  <Typography variant="subtitle1" mb={2} sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                     Confirm Delete
                  </Typography>
                  <Typography mb={3}>
                     Are you sure you want to delete <b>{selectedRow?.name}</b>?
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     <Button onClick={handleDeleteClose} startIcon={<CloseIcon />}>Cancel</Button>
                     <Button variant="contained" color="error" onClick={handleDeleteConfirm} startIcon={<DeleteIcon />}>Delete</Button>
                  </Box>
               </Box>
            </Box>
         )}
      </>
   );

   const FilterControls = (
      <Stack
         direction={{ xs: 'column', sm: 'row' }}
         spacing={1}
         sx={{ minWidth: 0, width: '100%' }}
         alignItems="stretch"
      >
         <Button
            onClick={handleAddOpen}
            startIcon={<AddIcon />}
            variant="contained"
            sx={{
               borderRadius: 2,
               textTransform: 'none',
               fontWeight: 600,
               height: 40,
               minWidth: 110
            }}
         >
            Add new
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
               height: 40 // Ensure consistent height
            }}
         >
            <IconButton sx={{ p: '6px' }} aria-label="search">
               <SearchIcon />
            </IconButton>
            <InputBase
               sx={{ ml: 1, flex: 1 }}
               placeholder="Search tasks"
               inputProps={{ 'aria-label': 'search tasks' }}
               value={search}
               onChange={handleSearchChange}
            />
         </Paper>
         <FormControl
            size="small"
            sx={{
               minWidth: 120,
               height: 40,
               justifyContent: 'center',
               '.MuiInputBase-root': { height: 40, alignItems: 'center' }
            }}
         >
            <InputLabel>Status</InputLabel>
            <Select
               label="Status"
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value)}
               sx={{ height: 40, display: 'flex', alignItems: 'center' }}
            >
               <MenuItem value="">All</MenuItem>
               {STATUS_OPTIONS.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
               ))}
            </Select>
         </FormControl>
         <FormControl
            size="small"
            sx={{
               minWidth: 140,
               height: 40,
               justifyContent: 'center',
               '.MuiInputBase-root': { height: 40, alignItems: 'center' }
            }}
         >
            <InputLabel>Responsible</InputLabel>
            <Select
               label="Responsible"
               value={assigneeFilter}
               onChange={e => setAssigneeFilter(e.target.value)}
               sx={{ height: 40, display: 'flex', alignItems: 'center' }}
            >
               <MenuItem value="">All</MenuItem>
               {assigneeOptions.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
               ))}
            </Select>
         </FormControl>
      </Stack>
   );

   if (isMobile) {
      // Card list for mobile
      return (
         <>
            <Card
               variant="outlined"
               sx={{
                  height: '100%',
                  overflowY: 'auto',
                  borderRadius: '10px'
               }}
            >
               <CardContent sx={{ p: 0, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ p: 2 }}>{FilterControls}</Box>
                  <Stack spacing={2}>
                     {filteredRows.map((row, idx) => (
                        <Card key={row.id || idx} variant="outlined" sx={{ borderRadius: 2 }}>
                           <CardContent sx={{ p: 2 }}>
                              <Stack spacing={1}>
                                 <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography fontWeight={600}>{row.name}</Typography>
                                    {row.status && row.status.match(/^\d+\/\d+$/) && (
                                       <Chip label={row.status} size="small" />
                                    )}
                                    <Box sx={{ ml: 'auto' }}>
                                       <IconButton size="small" onClick={e => handleMenuOpen(e, row)}>
                                          <MoreVertIcon fontSize="small" />
                                       </IconButton>
                                    </Box>
                                 </Stack>
                                 <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                       label={row.status}
                                       color={statusColor(row.status)}
                                       size="small"
                                       icon={
                                          <span>
                                             {row.status === 'In progress'
                                                ? '🚀'
                                                : row.status === 'Scheduled'
                                                   ? '📅'
                                                   : row.status === 'Completed'
                                                      ? '✅'
                                                      : '📄'}
                                          </span>
                                       }
                                       sx={{ fontWeight: 600, cursor: 'pointer' }}
                                       onClick={e => handleStatusMenuOpen(e, row)}
                                       deleteIcon={<ArrowDropDownIcon />}
                                       onDelete={e => handleStatusMenuOpen(e, row)}
                                    />
                                    {row.due && (
                                       <Chip label={row.due} color="warning" size="small" />
                                    )}
                                 </Stack>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{row.assignee?.[0]}</Avatar>
                                    <Typography fontSize={14}>{row.assignee}</Typography>
                                 </Box>
                              </Stack>
                           </CardContent>
                        </Card>
                     ))}
                  </Stack>
               </CardContent>
            </Card>
            <Menu
               anchorEl={menuAnchor}
               open={Boolean(menuAnchor)}
               onClose={handleMenuClose}
            >
               <MenuItem onClick={() => handleEditOpen(menuRow)}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
               </MenuItem>
               <MenuItem onClick={() => handleDeleteOpen(menuRow)}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
               </MenuItem>
            </Menu>
            <Menu
               anchorEl={statusMenuAnchor}
               open={Boolean(statusMenuAnchor)}
               onClose={handleStatusMenuClose}
            >
               {STATUS_OPTIONS.map(option => (
                  <MenuItem
                     key={option}
                     selected={option === statusMenuRow?.status}
                     onClick={() => handleStatusChange(option)}
                  >
                     {option}
                  </MenuItem>
               ))}
            </Menu>
            {renderPopup()}
         </>
      );
   }

   // Table for desktop/tablet
   return (
      <>
         <Card
            variant="outlined"
            sx={{
               height: '100%',
               width: '100%',
               borderRadius: '10px',
               display: 'flex',
               flexDirection: 'column',
               minHeight: 0, // ensures flex children can shrink
               minWidth: 0,  // ensures flex children can shrink
            }}
         >
            <CardContent sx={{ p: 0, "&:last-child": { pb: 2 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
               {/* Sticky search/filter bar */}
               <Box sx={{ position: 'sticky', top: 0, zIndex: 12, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: 2 }}>
                  {FilterControls}
               </Box>
               {/* Scrollable Table with sticky TableHead */}
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
                           <TableCell sortDirection={sortBy === 'name' ? sortDirection : false}>
                              <TableSortLabel
                                 active={sortBy === 'name'}
                                 direction={sortBy === 'name' ? sortDirection : 'asc'}
                                 onClick={() => handleSort('name')}
                              >
                                 <Typography fontWeight={700}>Task</Typography>
                              </TableSortLabel>
                           </TableCell>
                           <TableCell sortDirection={sortBy === 'status' ? sortDirection : false}>
                              <TableSortLabel
                                 active={sortBy === 'status'}
                                 direction={sortBy === 'status' ? sortDirection : 'asc'}
                                 onClick={() => handleSort('status')}
                              >
                                 <Typography fontWeight={700}>Status</Typography>
                              </TableSortLabel>
                           </TableCell>
                           <TableCell sortDirection={sortBy === 'due' ? sortDirection : false}>
                              <TableSortLabel
                                 active={sortBy === 'due'}
                                 direction={sortBy === 'due' ? sortDirection : 'asc'}
                                 onClick={() => handleSort('due')}
                              >
                                 <Typography fontWeight={700}>Due date</Typography>
                              </TableSortLabel>
                           </TableCell>
                           <TableCell sortDirection={sortBy === 'assignee' ? sortDirection : false}>
                              <TableSortLabel
                                 active={sortBy === 'assignee'}
                                 direction={sortBy === 'assignee' ? sortDirection : 'asc'}
                                 onClick={() => handleSort('assignee')}
                              >
                                 <Typography fontWeight={700}>Responsible</Typography>
                              </TableSortLabel>
                           </TableCell>
                           <TableCell align="right"></TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {sortedRows.map((row, idx) => (
                           <TableRow
                              key={row.id || idx}
                              hover
                              sx={{
                                 cursor: 'pointer',
                                 transition: 'background 0.2s',
                                 '&:hover': {
                                    backgroundColor: (theme) => theme.palette.action.hover,
                                 },
                              }}
                           >
                              <TableCell>
                                 <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography fontWeight={500}>{row.name}</Typography>
                                    {row.status && row.status.match(/^\d+\/\d+$/) && (
                                       <Chip label={row.status} size="small" />
                                    )}
                                 </Stack>
                              </TableCell>
                              <TableCell>
                                 <Chip
                                    label={row.status}
                                    size="small"
                                    icon={
                                        <span
                                          style={{
                                             paddingLeft: 4,
                                             paddingRight: 4,
                                             display: 'flex',
                                             alignItems: 'center',
                                             fontSize: 16, // Change icon size here
                                          }}
                                       >
                                            {row.status === 'In progress'
                                                ? '🚀'
                                                : row.status === 'Scheduled'
                                                ? '📅'
                                                : row.status === 'Completed'
                                                ? '✅'
                                                : '📄'}
                                        </span>
                                    }
                                    sx={{
                                       
                                       fontWeight: 600,
                                       cursor: 'pointer',
                                       width: 135,
                                       backgroundColor: statusColor(row.status),
                                       justifyContent: 'flex-start',
                                       '& .MuiChip-label': {
                                             width: '100%',
                                             textAlign: 'left',
                                             px: 1,
                                             color: '#111 !important', // Always black text for label
                                       },
                                       '& .MuiChip-icon': {
                                             color: '#111 !important', // Always black icon
                                       }   
                                    }}
                                    onClick={e => handleStatusMenuOpen(e, row)}
                                    deleteIcon={<ArrowDropDownIcon />}
                                    onDelete={e => handleStatusMenuOpen(e, row)}
                                 />
                              </TableCell>
                              <TableCell>
                                 {row.due && (
                                    <Chip label={row.due} color="warning" size="small" />
                                 )}
                              </TableCell>
                              <TableCell>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{row.assignee?.[0]}</Avatar>
                                    <Typography fontSize={14}>{row.assignee}</Typography>
                                 </Box>
                              </TableCell>
                              <TableCell align="right">
                                 <IconButton size="small" onClick={e => handleMenuOpen(e, row)}>
                                    <MoreVertIcon fontSize="small" />
                                 </IconButton>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </TableContainer>
            </CardContent>
         </Card>
         <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
         >
            <MenuItem onClick={() => handleEditOpen(menuRow)}>
               <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => handleDeleteOpen(menuRow)}>
               <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
            </MenuItem>
         </Menu>
         <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={handleStatusMenuClose}
         >
            {STATUS_OPTIONS.map(option => (
               <MenuItem
                  key={option}
                  selected={option === statusMenuRow?.status}
                  onClick={() => handleStatusChange(option)}
               >
                  {option}
               </MenuItem>
            ))}
         </Menu>
         {renderPopup()}
      </>
   );
};

export default TableView;
