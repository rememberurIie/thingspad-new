import React, { useState, useMemo, useEffect } from 'react';
import useSSE from 'src/hook/useSSE';
import {
   Card, CardContent, Box, Paper, Typography, Chip, Avatar, Stack, Button, Tabs, Tab, useMediaQuery, Fab, IconButton, Menu, MenuItem, TextField, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';

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

const API_BASE = 'http://192.168.68.81:3000/api/project/task';

const getStatusColor = (task, col, theme) => {
   if (task.cardColor) return task.cardColor;
   const isDark = theme.palette.mode === 'dark';
   if (col.title === 'New task') return isDark ? '#71aaebff' : '#9dc5f3';
   if (col.title === 'Scheduled') return isDark ? '#59c0b4ff' : '#7ccfc6';
   if (col.title === 'In progress') return isDark ? '#eec46bff' : '#f8d68b';
   if (col.title === 'Completed') return isDark ? '#5adb8eff' : '#74db9d';
   return isDark ? theme.palette.background.paper : '#fff';
};

const getCardColor = (task, col, theme) => {
   if (task.cardColor) return task.cardColor;
   const isDark = theme.palette.mode === 'dark';
   if (col.title === 'New task') return isDark ? '#94cbffff' : '#e0f0ffff';
   if (col.title === 'Scheduled') return isDark ? '#7ad6cdff' : '#d6f5f2';
   if (col.title === 'In progress') return isDark ? '#ffd392ff' : '#fdf1dfff';
   if (col.title === 'Completed') return isDark ? '#74eca6ff' : '#d3fce4ff';
   return isDark ? theme.palette.background.paper : '#fff';
};

const KandanBoard = ({ projectId }) => {
   const { t } = useTranslation();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
   const [tab, setTab] = useState(0);

   // --- Load tasks from API ---
   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);

   // --- Load all user API (for assigned )---
   const [allUsers, setAllUsers] = useState([]);
   
   // Drag state
   const [draggedTask, setDraggedTask] = useState(null);
   const [draggedFromCol, setDraggedFromCol] = useState(null);

   // More menu state
   const [menuAnchor, setMenuAnchor] = useState(null);
   const [menuTask, setMenuTask] = useState(null);
   const [menuColIdx, setMenuColIdx] = useState(null);

   // Popup state
   const [editOpen, setEditOpen] = useState(false);
   const [deleteOpen, setDeleteOpen] = useState(false);
   const [editData, setEditData] = useState({ id: '', name: '', assignee: '', due: '' });
   const [selectedTask, setSelectedTask] = useState(null);
   const [addOpen, setAddOpen] = useState(false);
   const [addData, setAddData] = useState({ name: '', assignee: '', due: '' });
   const [fullImage, setFullImage] = useState(null); // State for full image view
   const [addImage, setAddImage] = useState(null);
   const [editImage, setEditImage] = useState(null);
   const [removeImage, setRemoveImage] = useState(false);

      // --- Group tasks by status ---
   const columns = useMemo(() =>
      STATUS_OPTIONS.map(status => ({
         title: status,
         statusColor: getStatusColor({}, { title: status }, theme),
         cardColor: getCardColor({}, { title: status }, theme),
         tasks: tasks.filter(task => task.status === status)
      })), [tasks, theme]
   );

   useEffect(() => {
   if (!projectId) return;
   fetch('http://192.168.68.81:3000/api/project/chat/getMemberListNonSSE', {
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


   // --- Drag and Drop Handlers ---
   const handleDragStart = (task, colIdx) => {
      setDraggedTask(task);
      setDraggedFromCol(colIdx);
   };
   const handleDragEnd = () => {
      setDraggedTask(null);
      setDraggedFromCol(null);
   };
   const handleDrop = async (colIdx) => {
      if (draggedTask && draggedFromCol !== null && draggedFromCol !== colIdx) {
         await fetch(`${API_BASE}/editTask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...draggedTask,
               status: STATUS_OPTIONS[colIdx],
               projectId
            }),
         });
      }
      handleDragEnd();
   };

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

   // --- Edit Popups ---
   const handleEditOpen = () => {
      // หา userId จากชื่อ ถ้า editData.assignee ไม่ใช่ userId
      let assigneeId = menuTask.assigneeId;

      if (allUsers.length && assigneeId && assigneeId.length > 0 && assigneeId.length !== 28) {
         // ถ้าไม่ใช่ userId (userId ปกติยาว 28 ตัว)
         const found = allUsers.find(u => u.fullName === assigneeId || u.username === assigneeId);
         if (found) assigneeId = found.userId;
      }
      // แปลง due เป็น Date object ถ้าเป็น string
      let dueDate = menuTask.due;
      if (dueDate && typeof dueDate === 'string') {
         const parsed = new Date(dueDate);
         dueDate = isNaN(parsed) ? null : parsed;
      }
      setEditData({ ...menuTask, assigneeId: assigneeId, due: dueDate });
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
   const handleDeleteOpen = () => {
      setSelectedTask(menuTask);
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
   const handleAddOpen = (colIdx) => {
      setAddData({ name: '', assigneeId: '', due: '' });
      setAddOpen(colIdx);
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
      formData.append('status', STATUS_OPTIONS[addOpen]);
      if (addImage) formData.append('image', addImage);

      await fetch(`${API_BASE}/addTask`, {
         method: 'POST',
         body: formData,
      });
      setAddOpen(false);
      setAddImage(null);
   };

   // --- Render Edit/Delete/Add Popups (Box style like TableView) ---
   const renderPopup = () => (
      <>
         {/* Add Task Popup */}
         {addOpen !== false && (
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
                     gap: 2 // เพิ่ม gap ระหว่างแต่ละ element
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
                     ListboxProps={{ style: { maxHeight: 200 } }} // scroll ถ้าเกิน 4 คน
                     renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                              {(option.fullName || option.username || '?')[0]}
                           </Avatar>
                           <Typography>{option.fullName || option.username}</Typography>
                        </Box>
                     )}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                     <DatePicker
                        label="Due"
                        value={addData.due || null}
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
                        // Compress image
                        const compressed = await compressImage(file, 0.7); // 0.7 quality
                        setAddImage(compressed);
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
                     gap: 2 // เพิ่ม gap ระหว่างแต่ละ element
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
                  />
                  <Autocomplete
                     options={allUsers}
                     getOptionLabel={option => option.fullName || option.username}
                     value={allUsers.find(u => u.userId === editData.assigneeId) || null}
                     onChange={(_, value) => setEditData({ ...editData, assigneeId: value ? value.userId : '' })}
                     renderInput={(params) => (
                        <TextField {...params} label="Assignee" />
                     )}
                     isOptionEqualToValue={(option, value) => option.userId === value.userId}
                     ListboxProps={{ style: { maxHeight: 200 } }}
                     renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                              {(option.fullName || option.username || '?')[0]}
                           </Avatar>
                           <Typography>{option.fullName || option.username}</Typography>
                        </Box>
                     )}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns} >
                     <DatePicker
                        label="Due"
                        value={editData.due || null}
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
                           const compressed = await compressImage(file, 0.7);
                           setEditImage(compressed);
                           setRemoveImage(false);
                        }}
                        style={{ marginBottom: 16 }}
                     />
                  </>
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
                     Are you sure you want to delete <b>{selectedTask?.name}</b>?
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     <Button onClick={handleDeleteClose} startIcon={<CloseIcon />}>Cancel</Button>
                     <Button variant="contained" color="error" onClick={handleDeleteConfirm} startIcon={<DeleteIcon />}>Delete</Button>
                  </Box>
               </Box>
            </Box>
         )}
         {/* Full Image View */}
         {fullImage && (
            <Box
               onClick={() => setFullImage(null)}
               sx={{
                  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                  bgcolor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
               }}
            >
               <img src={fullImage} alt="full" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }} />
            </Box>
         )}
      </>
   );

   if (loading) {
      return (
         <Box sx={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
         </Box>
      );
   }

   return (
      <>
         {isMobile ? (
            <Card variant="outlined" sx={{ height: '100%', minHeight: 400, overflowY: 'auto', borderRadius: '10px', width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
               <CardContent sx={{ height: '100%', p: 0, "&:last-child": { pb: 0 }, width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
                  <Tabs
                     value={tab}
                     onChange={(_, v) => setTab(v)}
                     variant="fullWidth" // เพิ่มตรงนี้
                     allowScrollButtonsMobile
                     scrollButtons="auto"
                     sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        backgroundColor: (t) => t.palette.grey[100],
                        px: 1,
                        pt: 1,
                        '& .MuiTabs-indicator': { background: '#2196f3', height: 3, borderRadius: 2 },
                        minWidth: 0,
                        width: '100%',
                     }}
                  >
                     {columns.map((col, idx) => (
                        <Tab
                           key={col.title}
                           label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                 <Typography sx={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
                                    {col.title}
                                 </Typography>
                                 <Chip
                                    label={col.tasks.length}
                                    size="small"
                                    sx={{
                                       fontWeight: 600,
                                       backgroundColor: (t) => t.palette.grey[50],
                                       color: (t) => t.palette.grey[800],
                                       display: { xs: 'none', sm: 'inline-flex' },
                                    }}
                                 />
                              </Box>
                           }
                           sx={{
                              flex: 1,           // เพิ่ม
                              minWidth: 0,       // เพิ่ม
                              maxWidth: 'none',  // เพิ่ม
                              minHeight: 48,
                              fontWeight: 600,
                              color: theme.palette.grey[700],
                              background: tab === idx ? theme.palette.grey[300] : 'transparent',
                              borderRadius: 2,
                              px: 1.25,
                           }}
                        />
                     ))}
                  </Tabs>

                  <Box sx={{ p: 2, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>

                     <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        sx={{
                           borderRadius: 2,
                           textTransform: 'none',
                           fontWeight: 600,
                           width: '100%',
                           mb: 2
                        }}
                        onClick={() => handleAddOpen(tab)}
                     >
                        Add new
                     </Button>

                     <Stack spacing={2} sx={{ pb: 7 }}>
                        {columns[tab].tasks.map((task, taskIdx) => (
                           <Paper
                              key={task.id}
                              sx={{
                                 p: 2,
                                 borderRadius: 2,
                                 boxShadow: 1,
                                 display: 'flex',
                                 flexDirection: 'column',
                                 gap: 1,
                                 background: getStatusColor(task, columns[tab], theme), // ใช้ columns[tab] แทน col
                                 position: 'relative',
                                 cursor: 'grab',
                                 '&:hover .morevert-btn': { opacity: 1 },
                                 opacity: draggedTask && draggedTask.id === task.id ? 0.5 : 1,
                              }}
                              draggable
                              onDragStart={() => handleDragStart(task, tab)}
                              onDragEnd={handleDragEnd}
                           >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                 <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1f1f1fff' }}>{task.name}</Typography>
                                 <Box sx={{ ml: 'auto' }}>
                                    <IconButton
                                       className="morevert-btn"
                                       size="small"
                                       sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                                       onClick={e => handleMenuOpen(e, task, tab)}
                                    >
                                       <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                 </Box>
                              </Box>
                              {task.imageUrl && (
                                 <img
                                    src={task.imageUrl}
                                    alt="task"
                                    style={{
                                       maxHeight: 250,
                                       maxWidth: '100%',
                                       width: 'auto',
                                       height: 'auto',
                                       borderRadius: 8,
                                       cursor: 'pointer',
                                       display: 'block',
                                       objectFit: 'contain'
                                    }}
                                    onClick={() => setFullImage(task.imageUrl)}
                                 />
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', my: 1, flexWrap: 'wrap' }}>
                                 {task.due && (
                                    <Chip
                                       label={
                                          (() => {
                                             try {
                                                const date = new Date(task.due);
                                                return isNaN(date) ? task.due : format(date, 'dd MMM yyyy');
                                             } catch {
                                                return task.due;
                                             }
                                          })()
                                       }
                                       color="warning"
                                       size="small"
                                       sx={{ color: '#3f3f3fff', fontWeight: 600 }}
                                    />
                                 )}
                                 {/* {task.status && <Chip label={task.status} color="default" size="small" sx={{ color: '#3d3d3dff', fontWeight: 600 }} />} */}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{task.assigneeFullName[0]}</Avatar>
                                 <Typography sx={{ fontSize: 13, color: '#000000', fontWeight: 600 }}>{task.assigneeFullName}</Typography>
                              </Box>
                           </Paper>
                        ))}
                     </Stack>

                  </Box>
               </CardContent>
               <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
               >
                  <MenuItem onClick={handleEditOpen}>
                     <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                     <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                  </MenuItem>
               </Menu>
               {renderPopup()}
            </Card>
         ) : (
            <Card
               variant="outlined"
               sx={{
                  height: '100%',
                  minHeight: 400,
                  overflow: 'hidden',
                  borderRadius: '10px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  maxWidth: 'none',
                  boxSizing: 'border-box'
               }}
            >
               <CardContent sx={{
                  height: '100%',
                  p: isMobile ? 0 : 2,
                  "&:last-child": { pb: 2 },
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  width: '100%',
                  maxWidth: 'none',
                  boxSizing: 'border-box'
               }}
               >
                  <Box
                     sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 2,
                        width: '100%',
                        height: '100%',
                        minHeight: 0,
                        maxWidth: 'none',
                        boxSizing: 'border-box'
                     }}
                  >
                     {columns.map((col, colIdx) => (
                        <Paper
                           key={col.title}
                           sx={{
                              flex: 1,
                              minWidth: 0, // allow shrinking to fit
                              background: col.statusColor,
                              borderRadius: 3,
                              p: 2,
                              boxShadow: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              minHeight: 300,
                              maxWidth: '100%', // ensure no overflow
                           }}
                           onDragOver={e => { e.preventDefault(); }}
                           onDrop={() => handleDrop(colIdx)}
                        >
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#000000' }}>{col.title} <Chip label={col.tasks.length} size="small" sx={{ ml: 1, color: '#000000', backgroundColor: 'rgba(0, 0, 0, 0.08)' }} /></Typography>
                              {col.title === 'New task' && (
                                 <Button onClick={() => handleAddOpen(colIdx)} startIcon={<AddIcon />} size="small" variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Add new</Button>
                              )}
                           </Box>
                           <Stack
                              spacing={2}
                              sx={{
                                 flex: 1,
                                 overflowY: 'auto',
                                 pr: 1,
                                 '&::-webkit-scrollbar': { width: '6px' },
                                 '&::-webkit-scrollbar-track': { backgroundColor: (t) => t.palette.primary.transparent, borderRadius: '3px' },
                                 '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.grey[400], borderRadius: '3px' },
                                 '&::-webkit-scrollbar-thumb:hover': { backgroundColor: (t) => t.palette.grey[500] },
                              }}
                           >
                              {col.tasks.map((task, taskIdx) => (
                                 <Paper
                                    key={task.id}
                                    sx={{
                                       p: 2,
                                       borderRadius: 2,
                                       boxShadow: 1,
                                       display: 'flex',
                                       flexDirection: 'column',
                                       gap: 1,
                                       background: col.cardColor, // ส่ง theme เข้าไปด้วย
                                       position: 'relative',
                                       cursor: 'grab',
                                       '&:hover .morevert-btn': { opacity: 1 },
                                       opacity: draggedTask && draggedTask.id === task.id ? 0.5 : 1,
                                    }}
                                    draggable
                                    onDragStart={() => handleDragStart(task, colIdx)}
                                    onDragEnd={handleDragEnd}
                                 >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
                                       <Typography sx={{ fontWeight: 500, fontSize: 15, color: '#000000' }}>{task.name}</Typography>
                                       <Box sx={{ ml: 'auto' }}>
                                          <IconButton
                                             className="morevert-btn"
                                             size="small"
                                             sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                                             onClick={e => handleMenuOpen(e, task, colIdx)}
                                          >
                                             <MoreVertIcon fontSize="small" />
                                          </IconButton>
                                       </Box>
                                    </Box>
                                    {task.imageUrl && (
                                       <img
                                          src={task.imageUrl}
                                          alt="task"
                                          style={{
                                             maxHeight: 250,
                                             maxWidth: '100%',
                                             width: 'auto',
                                             height: 'auto',
                                             borderRadius: 8,
                                             cursor: 'pointer',
                                             display: 'block',
                                             objectFit: 'contain'
                                          }}
                                          onClick={() => setFullImage(task.imageUrl)}
                                       />
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', my: 1, flexWrap: 'wrap' }}>
                                       {task.due && (
                                          <Chip
                                             label={
                                                (() => {
                                                   try {
                                                      const date = new Date(task.due);
                                                      return isNaN(date) ? task.due : format(date, 'dd MMM yyyy');
                                                   } catch {
                                                      return task.due;
                                                   }
                                                })()
                                             }
                                             color="warning"
                                             size="small"
                                             sx={{ color: '#3f3f3fff', fontWeight: 600 }}
                                          />
                                       )}
                                       {/* {task.status && <Chip label={task.status} color="default" size="small" sx={{color: '#3f3f3fff', fontWeight: 600}}/>} */}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                       <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{task.assigneeFullName[0]}</Avatar>
                                       <Typography sx={{ fontSize: 13, color: '#000000', fontWeight: 600 }}>{task.assigneeFullName}</Typography>
                                    </Box>

                                 </Paper>
                              ))}
                           </Stack>
                        </Paper>
                     ))}
                  </Box>
               </CardContent>
               <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
               >
                  <MenuItem onClick={handleEditOpen}>
                     <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={handleDeleteOpen}>
                     <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                  </MenuItem>
               </Menu>
               {renderPopup()}
            </Card>
         )}
      </>
   );
}

// Add this function outside your component
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

export default KandanBoard;