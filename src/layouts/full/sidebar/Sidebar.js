import { useMediaQuery, Box, Drawer, IconButton, Tooltip } from '@mui/material';
import SidebarItems from './SidebarItems';
import Scrollbar from "../../../components/custom-scroll/Scrollbar";
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useState } from 'react';


const Sidebar = (props) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  // ✅ ใช้ props แทน local state
  const isMinimized = props.isSidebarMinimized;

  const expandedWidth = '270px';
  const minimizedWidth = '92px';
  const sidebarWidth = isMinimized ? minimizedWidth : expandedWidth;

  if (lgUp) {
    return (
      <Box sx={{ width: sidebarWidth, flexShrink: 0, transition: 'width 0.3s' }}>
        <Drawer
          anchor="left"
          open={props.isSidebarOpen}
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                width: sidebarWidth,
                boxSizing: 'border-box',
                top: '15px',
                overflowX: 'hidden',
                transition: 'width 0.3s',
              },
            }
          }}
        >
          <Scrollbar sx={{ height: "calc(100% - 40px)" }}>
            <Box>
              <SidebarItems isMinimized={isMinimized} />
            </Box>
          </Scrollbar>
        </Drawer>
      </Box>
    );
  }
  return (
    <Drawer
      anchor="left"
      open={props.isMobileSidebarOpen}
      onClose={props.onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            boxShadow: (theme) => theme.shadows[8],
          },
        }
      }}
    >
      <Scrollbar sx={{ height: "calc(100% - 40px)"}}>
        {/* ------------------------------------------- */}
        {/* Sidebar For Mobile */}
        {/* ------------------------------------------- */}
        <SidebarItems/>
      </Scrollbar>
    </Drawer>
  );
};
export default Sidebar;
