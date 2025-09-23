import React, { useEffect, useState } from 'react';
import { Grid, Box, Stack, Card, CardContent, Typography, useMediaQuery } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

// components
import FinishedTaskGraph from './components/FinishedTaskGraph';
import FinishedTask from './components/FinishedTask';
import InProgessTaskList from './components/InProgressTaskList';
import InProgessTask from './components/InProgressTask';
import WelcomeCard from './components/WelcomeCard';

import { useDashboard } from 'src/contexts/DashboardContext'; // Add this import

const Dashboard = () => {
   const theme = useTheme();
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

   return (
      <PageContainer title="Dashboard" description="this is Dashboard">
         {isLgUp && (
            <Box sx={{ height: '89vh' }}>
               <Grid container spacing={3} sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
                     <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3, width: '60%' }}>
                        <WelcomeCard fullName={user?.fullName || ""} userId={user?.uid || ""} />
                        <Box
                           sx={{
                              display: 'flex',
                              gap: 3,
                              flexDirection: isLgUp ? 'row' : 'column',
                           }}
                        >
                           <Box sx={{ flex: 1 }}>
                              <InProgessTask taskInProgressCount={inProgressTasks.length} />
                           </Box>
                           <Box sx={{ flex: 1 }}>
                              <FinishedTask taskInProgressCount={inProgressTasks.length} taskFinishedCount={finishedTasks.length} />
                           </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                           <FinishedTaskGraph sx={{ flex: 1, height: '20%' }} finishedTasks8MonthsBack={finishedTasks8MonthsBack}/>
                        </Box>
                     </Box>
                     <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: 3 }}>
                        <InProgessTaskList
                           tasks={inProgressTasks}
                           loading={loadingTasks}
                        />
                     </Box>
                  </Box>
               </Grid>
            </Box>
         )}  {!isLgUp && (
            <Box >
               <Grid container spacing={3} sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
                     <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3, width: '60%' }}>
                        <WelcomeCard fullName={user?.fullName || ""} userId={user?.uid || ""} />
                        <Box
                           sx={{
                              display: 'flex',
                              gap: 3,
                              flexDirection: isXsUp ? 'row' : 'column',
                           }}
                        >
                           <Box sx={{ flex: 1 }}>
                              <InProgessTask taskInProgressCount={inProgressTasks.length} />
                           </Box>
                           <Box sx={{ flex: 1 }}>
                              <FinishedTask taskInProgressCount={inProgressTasks.length} taskFinishedCount={finishedTasks.length} />
                           </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                           <FinishedTaskGraph sx={{ flex: 1, height: '60%' }} finishedTasks8MonthsBack={finishedTasks8MonthsBack} />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column'}}>
                           <InProgessTaskList
                              tasks={inProgressTasks}
                              loading={loadingTasks}
                           />
                        </Box>
                     </Box>
                  </Box>
               </Grid>
            </Box>
         )}
      </PageContainer>
   );
};

export default Dashboard;