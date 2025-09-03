import React, { useState } from 'react';
import {
   Card, CardContent, Box, Paper, Typography, Chip, Avatar, Stack, Button, Tabs, Tab, useMediaQuery, Fab, IconButton, Menu, MenuItem, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const mockColumnsInit = [
   {
      title: 'New task',
      color: '#9dc5f3ff',
      tasks: [
         { id: 1, name: 'Deploy the website to the development hosting server', assignee: 'Alice', avatar: '', due: '', status: '' },
         { id: 2, name: 'Review and comment on website design', assignee: 'Bob', avatar: '', due: '', status: '' },
         { id: 3, name: 'Fix all the bugs reported by the team', assignee: 'Charlie', avatar: '', due: '', status: '' },
         { id: 4, name: 'Prepare design files for web developer', assignee: 'Dana', avatar: '', due: '', status: '0/2', cardColor: '#ffd6d6' },
         { id: 5, name: 'Send new website link to the team', assignee: 'Eve', avatar: '', due: '', status: '' },
         { id: 6, name: 'Review the new website and provide feedback', assignee: 'Frank', avatar: '', due: '', status: '' },
         { id: 7, name: 'Deploy the website to the production environment', assignee: 'Grace', avatar: '', due: '', status: '' },
         { id: 8, name: 'Final check of the website', assignee: 'Helen', avatar: '', due: '', status: '0/7' },
      ],
   },
   {
      title: 'Scheduled',
      color: '#7ccfc6ff',
      tasks: [
         { id: 9, name: 'Design the entire website in a chosen style', assignee: 'Ivan', avatar: '', due: '6 days left', status: '' },
         { id: 10, name: 'Write meta title & meta description for each page', assignee: 'Jane', avatar: '', due: '', status: '' },
         { id: 11, name: 'Develop the website using the chosen CMS platform', assignee: 'Kate', avatar: '', due: '10 days left', status: '0/4' },
         { id: 12, name: 'Implement responsive design', assignee: 'Leo', avatar: '', due: '', status: '' },
      ],
   },
   {
      title: 'In progress',
      color: '#f8d68bff',
      tasks: [
         { id: 13, name: 'Write website copy', assignee: 'Mona', avatar: '', due: '3 days left', status: '1/3' },
         { id: 14, name: 'Design drafts in 3 different styles', assignee: 'Nina', avatar: '', due: 'Due tomorrow', status: '' },
         { id: 15, name: 'Develop a wireframe', assignee: 'Oscar', avatar: '', due: '', status: '' },
      ],
   },
   {
      title: 'Completed',
      color: '#74db9dff',
      tasks: [
         { id: 16, name: 'Research potential CMS platforms for website', assignee: 'Pam', avatar: '', due: '', status: '' },
         { id: 17, name: 'Develop a structure for a new website', assignee: 'Quinn', avatar: '', due: '', status: '2/4' },
      ],
   },
];

const STATUS_OPTIONS = [
   'New task',
   'Scheduled',
   'In progress',
   'Completed'
];

const getCardColor = (task, col) => {
   if (task.cardColor) return task.cardColor;
   if (col.title === 'New task') return '#bfe0ff';
   if (col.title === 'Scheduled') return '#d6f5f2';
   if (col.title === 'In progress') return '#ffe7c2';
   if (col.title === 'Completed') return '#e2f5ea';
   return '#fff';
};

const KandanBoard = () => {
   const { t } = useTranslation();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
   const [tab, setTab] = useState(0);
   const [columns, setColumns] = useState(mockColumnsInit);

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

   // --- Drag and Drop Handlers ---
   const handleDragStart = (task, colIdx) => {
      setDraggedTask(task);
      setDraggedFromCol(colIdx);
   };
   const handleDragEnd = () => {
      setDraggedTask(null);
      setDraggedFromCol(null);
   };
   const handleDrop = (colIdx) => {
      if (draggedTask && draggedFromCol !== null && draggedFromCol !== colIdx) {
         // Remove from old column
         const newColumns = columns.map((col, idx) => {
            if (idx === draggedFromCol) {
               return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.id) };
            }
            return col;
         });
         // Add to new column
         newColumns[colIdx].tasks = [...newColumns[colIdx].tasks, { ...draggedTask }];
         setColumns(newColumns);
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

   // --- Edit/Delete Popups ---
   const handleEditOpen = () => {
      setEditData({ ...menuTask });
      setEditOpen(true);
      handleMenuClose();
   };
   const handleEditClose = () => setEditOpen(false);
   const handleEditSubmit = () => {
      // Update task in columns
      const newColumns = columns.map((col, idx) => {
         if (idx === menuColIdx) {
            return {
               ...col,
               tasks: col.tasks.map(t => t.id === editData.id ? { ...t, ...editData } : t)
            };
         }
         return col;
      });
      setColumns(newColumns);
      setEditOpen(false);
   };

   const handleDeleteOpen = () => {
      setSelectedTask(menuTask);
      setDeleteOpen(true);
      handleMenuClose();
   };
   const handleDeleteClose = () => setDeleteOpen(false);
   const handleDeleteConfirm = () => {
      // Remove task from columns
      const newColumns = columns.map((col, idx) => {
         if (idx === menuColIdx) {
            return {
               ...col,
               tasks: col.tasks.filter(t => t.id !== selectedTask.id)
            };
         }
         return col;
      });
      setColumns(newColumns);
      setDeleteOpen(false);
   };

   // --- Add Task handlers ---
   const handleAddOpen = (colIdx) => {
      setAddData({ name: '', assignee: '', due: '' });
      setAddOpen(colIdx);
   };
   const handleAddClose = () => setAddOpen(false);
   const handleAddSubmit = () => {
      if (addOpen !== false && addData.name) {
         const newTask = {
            id: Date.now(),
            name: addData.name,
            assignee: addData.assignee,
            due: addData.due,
            status: '',
         };
         const newColumns = columns.map((col, idx) =>
            idx === addOpen
               ? { ...col, tasks: [...col.tasks, newTask] }
               : col
         );
         setColumns(newColumns);
      }
      handleAddClose();
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
                     Are you sure you want to delete <b>{selectedTask?.name}</b>?
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

   return (
      <>
         {isMobile ? (
            <Card variant="outlined" sx={{ height: '100%', minHeight: 400, overflowY: 'auto', borderRadius: '10px' }}>
               <CardContent sx={{ height: '100%', p: isMobile ? 0 : 2, "&:last-child": { pb: 2 } }}>
                  <Tabs
                     value={tab}
                     onChange={(_, v) => setTab(v)}
                     variant="scrollable"
                     allowScrollButtonsMobile
                     scrollButtons="auto"
                     sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        background: '#fff',
                        px: 1,
                        pt: 1,
                        '& .MuiTabs-indicator': { background: '#2196f3', height: 3, borderRadius: 2 },
                        // สำคัญ: อนุญาตให้ tabs ย่อได้จริง
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
                                       background: '#e5e8ef',
                                       color: '#222',
                                       // ซ่อนบนจอเล็กเพื่อไม่ดันความกว้าง
                                       display: { xs: 'none', sm: 'inline-flex' },
                                    }}
                                 />
                              </Box>
                           }
                           sx={{
                              minHeight: 48,
                              fontWeight: 600,
                              color: tab === idx ? '#222' : '#888',
                              background: tab === idx ? '#f5faff' : 'transparent',
                              borderRadius: 2,
                              // สำคัญ: ตัดค่า default ของ MUI
                              minWidth: 0,
                              flexShrink: 1,
                              px: 1.25,
                           }}
                        />
                     ))}
                  </Tabs>

                  <Box sx={{ p: 2 }}>
                     <Stack spacing={2} sx={{ pb: 7 }}>
                        {columns[tab].tasks.map((task, taskIdx) => (
                           <Paper
                              key={task.id}
                              sx={{
                                 p: 2,
                                 borderRadius: 3,
                                 boxShadow: 1,
                                 background: getCardColor(task, columns[tab]),
                                 display: 'flex',
                                 flexDirection: 'column',
                                 gap: 1,
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
                                 <Avatar sx={{ width: 32, height: 32, fontSize: 16 }}>{task.assignee[0]}</Avatar>
                                 <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{task.name}</Typography>
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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                 {task.due && <Chip label={task.due} color="warning" size="small" />}
                                 {task.status && <Chip label={task.status} color="default" size="small" />}
                              </Box>
                           </Paper>
                        ))}
                     </Stack>
                     <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        sx={{
                           borderRadius: 2,
                           textTransform: 'none',
                           fontWeight: 600,
                           width: '100%',
                           mt: 2
                        }}
                        onClick={() => handleAddOpen(tab)}
                     >
                        Add new
                     </Button>
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
            <Card variant="outlined" sx={{ height: '100%', minHeight: 400, overflow: 'hidden', borderRadius: '10px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
               <CardContent sx={{ height: '100%', p: isMobile ? 0 : 2, "&:last-child": { pb: 2 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <Box
                     sx={{
                        display: 'flex',
                        gap: 3,
                        flex: 1,
                        overflowX: 'auto',
                        height: '100%',
                        width: '100%',
                        minHeight: 0,
                     }}>
                     {columns.map((col, colIdx) => (
                        <Paper
                           key={col.title}
                           sx={{
                              flex: 1,
                              minWidth: 0, // allow shrinking to fit
                              background: col.color,
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
                                       background: getCardColor(task, col),
                                       position: 'relative',
                                       cursor: 'grab',
                                       '&:hover .morevert-btn': { opacity: 1 },
                                       opacity: draggedTask && draggedTask.id === task.id ? 0.5 : 1,
                                    }}
                                    draggable
                                    onDragStart={() => handleDragStart(task, colIdx)}
                                    onDragEnd={handleDragEnd}
                                 >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                       {task.due && <Chip label={task.due} color="warning" size="small" />}
                                       {task.status && <Chip label={task.status} color="default" size="small" />}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                       <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{task.assignee[0]}</Avatar>
                                       <Typography sx={{ fontSize: 13, color: '#000000' }}>{task.assignee}</Typography>
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

export default KandanBoard;
export { mockColumnsInit as mockColumns };
