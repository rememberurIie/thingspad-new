import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom'; // เพิ่มบรรทัดนี้
import {
   Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
   Typography, Chip, Avatar, Box, Stack, useMediaQuery, IconButton, InputBase, Paper, Menu, MenuItem, Button, TextField, Dialog, DialogContent, DialogActions, DialogTitle,
   Select, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import TableSortLabel from '@mui/material/TableSortLabel';
import useSSE from 'src/hook/useSSE';
import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';


import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { format } from 'date-fns';

const STATUS_OPTIONS = [
   'New task',
   'Scheduled',
   'In progress',
   'Completed'
];

const API_BASE = 'http://192.168.1.36:3000/api/project/task';

const statusColor = (status) => {
   switch (status) {
      case 'New task': return '#bfe0ff';
      case 'Scheduled': return '#d6f5f2';
      case 'In progress': return '#ffe7c2';
      case 'Completed': return '#e2f5ea';
      default: return 'default';
   }
};

const getAllAssignees = (rows) => {
   const names = rows.map(r => r.assigneeFullName).filter(Boolean);
   return Array.from(new Set(names));
};

const TableView = ({ projectId }) => {
   const { t } = useTranslation();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
   const [tab, setTab] = useState(0);

   const [search, setSearch] = useState('');
   const [sortBy, setSortBy] = useState('');
   const [sortDirection, setSortDirection] = useState('asc');
   const [statusFilter, setStatusFilter] = useState('');
   const [assigneeFilter, setAssigneeFilter] = useState('');


   // --- Load tasks from API ---
   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);

   // --- Load all user API (for assigned )---
   const [allUsers, setAllUsers] = useState([]);

   // More menu state
   const [menuAnchor, setMenuAnchor] = useState(null);
   const [menuTask, setMenuTask] = useState(null);
   const [menuColIdx, setMenuColIdx] = useState(null);

   // Status menu state
   const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
   const [statusMenuRow, setStatusMenuRow] = useState(null);

   const [selectedRow, setSelectedRow] = useState(null);

   // Popup state
   const [editOpen, setEditOpen] = useState(false);
   const [fullTask, setFullTask] = useState(null);
   const [editData, setEditData] = useState({ id: '', name: '', assignee: '', due: '' });
   const [deleteOpen, setDeleteOpen] = useState(false);
   const [selectedTask, setSelectedTask] = useState(null);
   const [addOpen, setAddOpen] = useState(false);
   const [addData, setAddData] = useState({ name: '', assigneeId: '', due: '', status: STATUS_OPTIONS[0] }); const [fullImage, setFullImage] = useState(null); // State for full image view
   const [addImage, setAddImage] = useState(null);
   const [editImage, setEditImage] = useState(null);
   const [removeImage, setRemoveImage] = useState(false);

   const assigneeOptions = useMemo(() => getAllAssignees(tasks), [tasks]);

   useEffect(() => {
      if (!projectId) return;
      fetch('http://192.168.1.36:3000/api/project/chat/getMemberListNonSSE', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ projectId }) // ส่ง projectId ไปด้วย
      })
         .then(res => res.json())
         .then(data => {
            // Always set as array
            const arr = Array.isArray(data) ? data : (data.members || []);
            setAllUsers(arr);
         });
   }, [projectId]);

   // --- Load all task API ---
   useSSE(
      projectId ? `${API_BASE}/getTask` : null,
      (data) => {
         setTasks(data || []);
         setLoading(false);
      },
      projectId ? { projectId } : undefined
   );

   // --- Filltered Rows ---
   const filteredRows = useMemo(() =>
      tasks.filter(row =>
         (row.name?.toLowerCase().includes(search.toLowerCase()) ||
            row.assigneeFullName?.toLowerCase().includes(search.toLowerCase()))
         && (statusFilter ? row.status === statusFilter : true)
         && (assigneeFilter ? row.assigneeFullName === assigneeFilter : true)
      ), [tasks, search, statusFilter, assigneeFilter]
   );

   const sortedRows = useMemo(() => {
      const arr = [...filteredRows];
      if (!sortBy) return arr;
      return arr.sort((a, b) => {
         let aValue = a[sortBy] || '';
         let bValue = b[sortBy] || '';
         // กรณี due ให้เปรียบเทียบวันที่
         if (sortBy === 'due') {
            return sortDirection === 'asc'
               ? new Date(aValue) - new Date(bValue)
               : new Date(bValue) - new Date(aValue);
         }
         // กรณีอื่นเปรียบเทียบเป็น string
         return sortDirection === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
      });
   }, [filteredRows, sortBy, sortDirection]);

   // --- More Menu Handlers ---
   const handleMenuOpen = (event, task, colIdx) => {
      setMenuAnchor(event.currentTarget);
      setMenuTask(task);
      setMenuColIdx(colIdx);
   };
   const handleMenuClose = () => {
      setMenuAnchor(null);
      setMenuTask(null);
      setMenuColIdx(null);
   };

   // --- Status Menu Handlers ---
   const handleStatusMenuOpen = (event, row) => {
      setStatusMenuAnchor(event.currentTarget);
      setStatusMenuRow(row);
   };
   const handleStatusMenuClose = () => {
      setStatusMenuAnchor(null);
      setStatusMenuRow(null);
   };
   const handleStatusChange = async (status) => {
      if (statusMenuRow) {
         await fetch(`${API_BASE}/editTask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...statusMenuRow, status, projectId }),
         });
      }
      handleStatusMenuClose();
   };

   // --- Edit Popups ---
   const handleEditOpen = (task) => {
      let assigneeId = task.assigneeId;
      if (allUsers.length && assigneeId && assigneeId.length > 0 && assigneeId.length !== 28) {
         const found = allUsers.find(u => u.fullName === assigneeId || u.username === assigneeId);
         if (found) assigneeId = found.userId;
      }
      let dueDate = task.due;
      if (dueDate && typeof dueDate === 'string') {
         const parsed = new Date(dueDate);
         dueDate = isNaN(parsed) ? null : parsed;
      }
      setEditData({ ...task, assigneeId: assigneeId, due: dueDate });
      setEditOpen(true);
      handleMenuClose();
   };

   const handleEditClose = () => setEditOpen(false);


   const handleEditSubmit = async () => {
      if (
         !editImage &&
         !removeImage &&
         (!editData.name?.trim() || !editData.assigneeId || !editData.due)
      ) {
         alert('Please fill in all required fields.');
         return;
      }
      const formData = new FormData();
      formData.append('projectId', editData.projectId || projectId);
      formData.append('id', editData.id);
      formData.append('name', editData.name);
      formData.append('assigneeId', editData.assigneeId);
      formData.append('due', editData.due);
      formData.append('status', editData.status);

      if (editImage) {
         formData.append('image', editImage);
      }
      if (removeImage) {
         formData.append('removeImage', '1');
      }

      await fetch(`${API_BASE}/editTask`, {
         method: 'POST',
         body: formData,
      });
      setEditOpen(false);
      setEditImage(null);
      setRemoveImage(false);
   };
   // --- Delete Popups ---
   const handleDeleteOpen = (task) => {
      setSelectedTask(task);
      setDeleteOpen(true);
      handleMenuClose();
   };
   const handleDeleteClose = () => setDeleteOpen(false);
   const handleDeleteConfirm = async () => {
      await fetch(`${API_BASE}/deleteTask`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: selectedTask.id, projectId }),
      });
      setDeleteOpen(false);
   };

   // --- Add Task handlers ---
   const handleAddOpen = () => {
      setAddData({ name: '', assigneeId: '', due: '', status: STATUS_OPTIONS[0] });
      setAddOpen(true);
   };
   const handleAddClose = () => setAddOpen(false);
   const handleAddSubmit = async () => {
      // ต้องกรอกชื่อ, assignee, due หรือแนบรูป
      if (
         !addData.name?.trim() ||
         !addData.assigneeId ||
         !addData.due
      ) {
         if (!addImage) {
            alert('Please fill in all required fields.');
            return;
         }
      }
      const formData = new FormData();
      formData.append('name', addData.name);
      formData.append('assigneeId', addData.assigneeId);
      formData.append('due', addData.due);
      formData.append('projectId', projectId);
      formData.append('status', addData.status);
      if (addImage) formData.append('image', addImage);

      await fetch(`${API_BASE}/addTask`, {
         method: 'POST',
         body: formData,
      });
      setAddOpen(false);
      setAddImage(null);
   };

   // ---- sorting handler ---
   const handleSort = (column) => {
   if (sortBy === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
   } else {
      setSortBy(column);
      setSortDirection('asc');
   }
   };


   // --- Render Add/Edit/Delete Popups ---
   const renderPopup = () => ReactDOM.createPortal(
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
               zIndex: 3000, // เพิ่ม zIndex ให้สูงขึ้น
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
                  gap: 2
               }}
            >
               <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                  Add Task
               </Typography>
               <TextField
                  fullWidth
                  label="Task Name"
                  value={addData.name}
                  onChange={e => setAddData({ ...addData, name: e.target.value })}
               />
               <Autocomplete
                  options={allUsers}
                  getOptionLabel={option => option.fullName || option.username}
                  value={allUsers.find(u => u.userId === addData.assigneeId) || null}
                  onChange={(_, value) => setAddData({ ...addData, assigneeId: value ? value.userId : '' })}
                  renderInput={(params) => (
                     <TextField {...params} label="Assignee" />
                  )}
                  isOptionEqualToValue={(option, value) => option.userId === value.userId}
                  renderOption={(props, option) => (
                     <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                           src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${option.userId}/avatar.jpg`}
                           sx={{ width: 24, height: 24, fontSize: 14 }}
                        >
                           {(option.fullName || option.username || '?')[0]}
                        </Avatar>
                        <Typography>{option.fullName || option.username}</Typography>
                     </Box>
                  )}
               />
               <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                     label="Due"
                     value={addData.due}
                     onChange={date => setAddData({ ...addData, due: date })}
                     renderInput={(params) => <TextField {...params} fullWidth />}
                  />
               </LocalizationProvider>
               <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                     const file = e.target.files[0];
                     if (file && file.size > 1024 * 1024) {
                        alert('File must be less than 1MB');
                        return;
                     }
                     // Compress image (optional, use your compressImage if needed)
                     setAddImage(file);
                  }}
                  style={{ marginBottom: 16 }}
               />
               {addImage && (
                  <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 1 }}>
                     <img
                        src={URL.createObjectURL(addImage)}
                        alt="preview"
                        style={{
                           maxHeight: 250,
                           maxWidth: '100%',
                           width: 'auto',
                           height: 'auto',
                           borderRadius: 8,
                           cursor: 'pointer',
                           display: 'block',
                           margin: '0 auto'
                        }}
                     />
                     <IconButton
                        size="small"
                        color="error"
                        sx={{
                           position: 'absolute',
                           top: 8,
                           right: 8,
                           minWidth: 0,
                           p: 0.5,
                           bgcolor: 'white',
                           boxShadow: 1
                        }}
                        onClick={() => setAddImage(null)}
                     >
                        <CloseIcon fontSize="small" />
                     </IconButton>
                  </Box>
               )}
               <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                     label="Status"
                     value={addData.status}
                     onChange={e => setAddData({ ...addData, status: e.target.value })}
                  >
                     {STATUS_OPTIONS.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                     ))}
                  </Select>
               </FormControl>
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
               zIndex: 3000, // เพิ่ม zIndex ให้สูงขึ้น
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
                  gap: 2
               }}
            >
               <Typography variant="subtitle1" sx={{ fontSize: '24px', fontWeight: 'bold' }}>
                  Edit Task
               </Typography>
               <TextField
                  fullWidth
                  label="Task Name"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
               />
               <Autocomplete
                  disablePortal
                  options={allUsers}
                  getOptionLabel={option => option.fullName || option.username || 'Unknown User'}
                  value={allUsers.find(u => u.userId === editData.assigneeId) || null}
                  onChange={(_, value) => {
                     console.log('Selected user:', value); // Add debugging
                     setEditData({ ...editData, assigneeId: value ? value.userId : '' })
                  }}
                  renderInput={(params) => (
                     <TextField
                        {...params}
                        label="Assignee"
                        placeholder="Select an assignee..."
                     />
                  )}
                  isOptionEqualToValue={(option, value) => option.userId === value?.userId}
                  ListboxProps={{ style: { maxHeight: 200 } }}
                  renderOption={(props, option) => (
                     <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                           src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${option.userId}/avatar.jpg`}
                           sx={{ width: 24, height: 24, fontSize: 14 }}
                        >
                           {(option.fullName || option.username || '?')[0]}
                        </Avatar>
                        <Typography>{option.fullName || option.username || 'Unknown User'}</Typography>
                     </Box>
                  )}
                  noOptionsText="No users found"
               />
               <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                     label="Due"
                     value={editData.due ? new Date(editData.due) : null}
                     onChange={date => setEditData({ ...editData, due: date })}
                     renderInput={(params) => <TextField {...params} fullWidth />}
                  />
               </LocalizationProvider>
               <>
                  {editData.imageUrl && !removeImage && !editImage && (
                     <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <img
                           src={editData.imageUrl}
                           alt="current"
                           style={{
                              maxHeight: 250,
                              maxWidth: '100%',
                              width: 'auto',
                              height: 'auto',
                              borderRadius: 8,
                              cursor: 'pointer',
                           }}
                        />
                        <IconButton
                           size="small"
                           color="error"
                           sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              minWidth: 0,
                              p: 0.5,
                              bgcolor: 'white',
                              boxShadow: 1
                           }}
                           onClick={() => setRemoveImage(true)}
                        >
                           <CloseIcon fontSize="small" />
                        </IconButton>
                     </Box>
                  )}
                  {editImage && (
                     <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <img
                           src={URL.createObjectURL(editImage)}
                           alt="preview"
                           style={{
                              maxHeight: 250,
                              maxWidth: '100%',
                              width: 'auto',
                              height: 'auto',
                              borderRadius: 8,
                              cursor: 'pointer',
                              display: 'block',
                              margin: '0 auto'
                           }}
                        />
                        <IconButton
                           size="small"
                           color="error"
                           sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              minWidth: 0,
                              p: 0.5,
                              bgcolor: 'white',
                              boxShadow: 1
                           }}
                           onClick={() => setEditImage(null)}
                        >
                           <CloseIcon fontSize="small" />
                        </IconButton>
                     </Box>
                  )}
                  <input
                     type="file"
                     accept="image/*"
                     onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file && file.size > 1024 * 1024) {
                           alert('File must be less than 1MB');
                           return;
                        }
                        setEditImage(file);
                        setRemoveImage(false);
                     }}
                     style={{ marginBottom: 16 }}
                  />
               </>
               <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                     label="Status"
                     value={editData.status}
                     onChange={e => setEditData({ ...editData, status: e.target.value })}
                  >
                     {STATUS_OPTIONS.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                     ))}
                  </Select>
               </FormControl>
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
               zIndex: 3000, // เพิ่ม zIndex ให้สูงขึ้น
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
      {/* Full Task View Popup */}
      {fullTask && (
         <Box
            onClick={() => setFullTask(null)}
            sx={{
               position: 'fixed',
               top: 0,
               left: 0,
               width: '100vw',
               height: '100vh',
               bgcolor: 'rgba(0,0,0,0.7)',
               zIndex: 4000, // ให้สูงสุด
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'zoom-out'
            }}
         >
            <Box
               onClick={e => e.stopPropagation()}
               sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: 24,
                  p: 3,
                  minWidth: 320,
                  maxWidth: 400,
                  width: '90vw',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  position: 'relative'
               }}
            >
               <IconButton
                  onClick={() => setFullTask(null)}
                  sx={{
                     position: 'absolute',
                     top: 8,
                     right: 8,
                     zIndex: 10
                  }}
                  size="small"
               >
                  <CloseIcon />
               </IconButton>


               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {fullTask.status && (
                     <Chip
                        label={fullTask.status}
                        size="small"
                        sx={{
                           color: '#3f3f3fff',
                           fontWeight: 600,
                           backgroundColor: statusColor(fullTask.status),
                           mt: '5px',
                        }}
                     />
                  )}
                  <Typography fontWeight={700} fontSize={20}>{fullTask.name}</Typography>
               </Box>

               {fullTask.imageUrl && (
                  <img
                     src={fullTask.imageUrl}
                     alt="task"
                     style={{
                        maxWidth: '100%',
                        maxHeight: 220,
                        borderRadius: 8,
                        objectFit: 'contain'
                     }}
                  />
               )}

               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={16} fontWeight={600}>Due Date: </Typography>
                  {fullTask.due && (
                     <Chip
                        label={(() => {
                           try {
                              const date = new Date(fullTask.due);
                              return isNaN(date) ? fullTask.due : format(date, 'dd MMM yyyy');
                           } catch {
                              return fullTask.due;
                           }
                        })()}
                        color="warning"
                        size="small"
                        sx={{ color: '#3f3f3fff', fontWeight: 600 }}
                     />
                  )}
               </Box>

               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                     src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${fullTask.assigneeId}/avatar.jpg`}
                     sx={{ width: 32, height: 32, fontSize: 18 }}
                  >
                     {fullTask.assigneeFullName?.[0]}
                  </Avatar>
                  <Typography fontSize={16} fontWeight={600}>{fullTask.assigneeFullName}</Typography>
               </Box>
            </Box>
         </Box>
      )}
   </>,
   document.body
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
               height: 40
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
               onChange={e => setSearch(e.target.value)}
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
            <Autocomplete
               options={assigneeOptions}
               value={assigneeFilter || null}
               onChange={(_, value) => setAssigneeFilter(value || '')}
               freeSolo
               clearOnEscape
               renderInput={(params) => (
                  <TextField {...params} label="Responsible" size="small" />
               )}
               sx={{ minWidth: 140 }}
            />
         </FormControl>
      </Stack>
   );

   if (loading) {
      return (
         <Box sx={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
         </Box>
      );
   }

   if (isMobile) {
      // Card list for mobile
      return (
         <>
            <Card variant="outlined" sx={{ height: '100%', minHeight: 400, overflowY: 'auto', borderRadius: '10px', width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
               <CardContent sx={{ height: '100%', p: 0, "&:last-child": { pb: 0 }, width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
                  <Box sx={{ p: 2 }}>{FilterControls}</Box>
                  <Stack spacing={2}>
                     {filteredRows.map((row, idx) => (
                        <Card key={row.id || idx} variant="outlined" sx={{ borderRadius: 2 }} onDoubleClick={() => setFullTask(row)}>
                           <CardContent sx={{ p: 2 }}>
                              <Stack spacing={1}>
                                 <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography fontWeight={600}>{row.name}</Typography>
                                    <Box sx={{ flex: 1 }} />
                                    <IconButton size="small" onClick={e => handleMenuOpen(e, row)}>
                                       <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                 </Stack>
                                 <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                       label={row.status}
                                       color="default"
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

                                       <Chip
                                          label={
                                             (() => {
                                                try {
                                                   const date = new Date(row.due);
                                                   return isNaN(date) ? row.due : format(date, 'dd MMM yyyy');
                                                } catch {
                                                   return row.due;
                                                }
                                             })()
                                          }
                                          color="warning"
                                          size="small"
                                          sx={{ color: '#3f3f3fff', fontWeight: 600 }}
                                       />

                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                       <Avatar
                                           src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${row.assigneeId}/avatar.jpg`}
                                           sx={{ width: 24, height: 24, fontSize: 14 }}
                                       />
                                       <Typography fontSize={14}>{row.assigneeFullName}</Typography>
                                    </Box>

                                 </Stack>
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
               <MenuItem onClick={() => handleEditOpen(menuTask)}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
               </MenuItem>
               <MenuItem onClick={() => handleDeleteOpen(menuTask)}>
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
               minHeight: 0,
               minWidth: 0,
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
                           <TableCell
                              sx={{ width: '50%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}`, backgroundColor: theme => theme.palette.grey[100] }}
                              sortDirection={sortBy === 'name' ? sortDirection : false}
                           >
                              <TableSortLabel
                                 active={sortBy === 'name'}
                                 direction={sortBy === 'name' ? sortDirection : 'asc'}
                                 onClick={() => handleSort('name')}
                              >
                                 <Typography fontWeight={700}>Task</Typography>
                              </TableSortLabel>
                           </TableCell>
                           <TableCell
                              sx={{ width: '15%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}`, backgroundColor: theme => theme.palette.grey[100] }}
                              sortDirection={sortBy === 'status' ? sortDirection : false}
                           >
                              <TableSortLabel
                                 active={sortBy === 'status'}
                                 direction={sortBy === 'status' ? sortDirection : 'asc'}
                                 onClick={() => handleSort('status')}
                              >
                                 <Typography fontWeight={700}>Status</Typography>
                              </TableSortLabel>
                           </TableCell>
                           <TableCell
                              sx={{ width: '15%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}`, backgroundColor: theme => theme.palette.grey[100] }}
                              sortDirection={sortBy === 'due' ? sortDirection : false}
                           >
                              <TableSortLabel
                                 active={sortBy === 'due'}
                                 direction={sortBy === 'due' ? sortDirection : 'asc'}
                                 onClick={() => handleSort('due')}
                              >
                                 <Typography fontWeight={700}>Due date</Typography>
                              </TableSortLabel>
                           </TableCell>
                           <TableCell
                           sx={{ width: '15%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}`, backgroundColor: theme => theme.palette.grey[100] }}
                           sortDirection={sortBy === 'assigneeFullName' ? sortDirection : false}
                           >
                           <TableSortLabel
                              active={sortBy === 'assigneeFullName'}
                              direction={sortBy === 'assigneeFullName' ? sortDirection : 'asc'}
                              onClick={() => handleSort('assigneeFullName')}
                           >
                              <Typography fontWeight={700}>Responsible</Typography>
                           </TableSortLabel>
                           </TableCell>
                           <TableCell sx={{ width: '5%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}`, backgroundColor: theme => theme.palette.grey[100] }}></TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>

                        {sortedRows.map((row, idx) => (
                           <TableRow
                              key={row.id || idx}
                              hover
                              onDoubleClick={() => setFullTask(row)}
                              sx={{ cursor: 'pointer' }}
                           >
                              <TableCell sx={{ width: '50%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                                 <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography fontWeight={500}>{row.name}</Typography>
                                 </Stack>
                              </TableCell>
                              <TableCell sx={{ width: '15%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
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
                                             fontSize: 16,
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
                                          color: '#111 !important',
                                       },
                                       '& .MuiChip-icon': {
                                          color: '#111 !important',
                                       }
                                    }}
                                    onClick={e => handleStatusMenuOpen(e, row)}
                                    deleteIcon={<ArrowDropDownIcon />}
                                    onDelete={e => handleStatusMenuOpen(e, row)}
                                 />
                              </TableCell>
                              <TableCell sx={{ width: '15%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                                 {row.due && (

                                    <Chip
                                       label={
                                          (() => {
                                             try {
                                                const date = new Date(row.due);
                                                return isNaN(date) ? row.due : format(date, 'dd MMM yyyy');
                                             } catch {
                                                return row.due;
                                             }
                                          })()
                                       }
                                       color="warning"
                                       size="small"
                                       sx={{ color: '#3f3f3fff', fontWeight: 600 }}
                                    />
                                 )}

                              </TableCell>
                              <TableCell sx={{ width: '15%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                       src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${row.assigneeId}/avatar.jpg`}
                                       sx={{ width: 24, height: 24, fontSize: 14 }}
                                    />
                                    <Typography fontSize={14}>{row.assigneeFullName}</Typography>
                                 </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ width: '5%', borderBottom: theme => `1px solid ${theme.palette.grey[300]}` }}>
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
            <MenuItem onClick={() => handleEditOpen(menuTask)}>
               <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => handleDeleteOpen(menuTask)}>
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

// Add this function outside your component if you want image compression
function compressImage(file, quality = 0.7) {
   return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
         const img = new window.Image();
         img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 1024 / img.width, 1024 / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
               (blob) => {
                  if (blob.size > 1024 * 1024) {
                     alert('Compressed image is still larger than 1MB.');
                     resolve(null);
                  } else {
                     resolve(new File([blob], file.name, { type: blob.type }));
                  }
               },
               'image/jpeg',
               quality
            );
         };
         img.src = event.target.result;
      };
      reader.readAsDataURL(file);
   });
}
