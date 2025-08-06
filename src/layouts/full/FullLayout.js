import React, { useState } from "react";
import { styled, Container, Box } from '@mui/material';

import { useSelector } from 'react-redux';
import { store } from "../../session/store";

import Header from './header/Header';
import Sidebar from './sidebar/Sidebar';
import { Outlet } from "react-router";
// import Topbar from "./header/Topbar";
import Footer from "./footer/Footer";

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  //minHeight: '100vh',
  width: '100%',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
 // paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
}));

const FullLayout = () => {

  const user = useSelector(state => state.auth.user);

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

   // minimized sidebar
  const [isSidebarMinimized, setSidebarMinimized] = useState(true);
  

  // toggle ฟังก์ชัน minimized sidebar
  const toggleSidebarMinimized = () => {
    setSidebarMinimized((prev) => !prev);
  };

  return (
    <>
      {/* ------------------------------------------- */}
      {/* Topbar */}
      {/* ------------------------------------------- */}
      {/* <Topbar/> */}
    <MainWrapper
      className='mainwrapper'
    >

      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      <Sidebar isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        isSidebarMinimized={isSidebarMinimized} // ✅ ส่ง state
        onSidebarClose={() => setMobileSidebarOpen(false)} />


      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <PageWrapper
        className="page-wrapper"
      >
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          toggleMobileSidebar={() => setMobileSidebarOpen(true)} 
          toggleSidebarMinimized={toggleSidebarMinimized} 
          isSidebarMinimized={isSidebarMinimized}
          fullName={user?.fullName || "Guest"}
          username={user?.username || ""}
        />
        {/* ------------------------------------------- */}
        {/* PageContent */}
        {/* ------------------------------------------- */}
        <Container sx={{
          paddingTop: "20px",
          maxWidth: '1200px',
        }}
        >
          {/* ------------------------------------------- */}
          {/* Page Route */}
          {/* ------------------------------------------- */}
          <Box sx={{ minHeight: 'calc(100vh - 250px)' }}>
            <Outlet />
          </Box>
          {/* ------------------------------------------- */}
          {/* End Page */}
          {/* ------------------------------------------- */}
        </Container>
        <Footer />
      </PageWrapper>
    </MainWrapper>
    </>
  );
};

export default FullLayout;
