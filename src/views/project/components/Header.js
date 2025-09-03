import React, { useState } from 'react';
import {
   Card, CardContent, Typography,
   Box, IconButton, Menu, MenuItem, Button, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatIcon from '@mui/icons-material/Chat';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';

import TableView from './TableView';
import KandanBoard from './KandanBoard';

const Header = ({ projectName, view, setView }) => {
   const [anchorEl, setAnchorEl] = useState(null);
   const open = Boolean(anchorEl);

   const handleViewChange = (event, nextView) => {
      if (nextView !== null) setView(nextView);
   };

   const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
   };
   const handleMenuClose = () => {
      setAnchorEl(null);
   };

   const handleRename = () => {
      // TODO: Implement rename logic
      handleMenuClose();
   };
   const handleExit = () => {
      // TODO: Implement exit project logic
      handleMenuClose();
   };

   return (
      <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px' }}>
         <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', "&:last-child": { pb: 2 }}}>
            <Typography sx={{ mr: 2, fontSize: '25px', fontWeight: 700 }}>{projectName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
               <IconButton onClick={handleMenuOpen} size="small">
                  <MoreVertIcon />
               </IconButton>
               <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
               >
                  <MenuItem onClick={handleRename}>Rename Project</MenuItem>
                  <MenuItem onClick={handleExit}>Exit Project</MenuItem>
               </Menu>
            </Box>
         </CardContent>
      </Card>
   );
}
 
export default Header;