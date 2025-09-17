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



const Dashboard = () => {
   const theme = useTheme();
   const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
   const isXsUp = useMediaQuery(theme.breakpoints.up('sm'));
   const user = useSelector(state => state.auth.user);

   // Add state for tasks and loading
   const [inProgressTasks, setInProgressTasks] = useState([]);
   const [finishedTasks, setFinishedTasks] = useState([]);
   const [finishedTasks8MonthsBack, setFinishedTasks8MonthsBack] = useState([]);


   const [loadingTasks, setLoadingTasks] = useState(true);

   //in progress task
   useEffect(() => {
      const fetchTasks = async () => {
         if (!user?.uid) return;
         setLoadingTasks(true);
         const now = new Date();
         const month = now.getMonth() + 1;
         const year = now.getFullYear();
         try {
            const res = await fetch('http://192.168.1.36:3000/api/dashboard/getInProgressAllTask', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ userId: user.uid, month, year }),
            });
            const data = await res.json();
            setInProgressTasks(data.tasks || []);
         } catch (e) {
            setInProgressTasks([]);
         }
         setLoadingTasks(false);
      };
      fetchTasks();
   }, [user?.uid]);

   //finished task
   useEffect(() => {
      const fetchTasks = async () => {
         if (!user?.uid) return;
         setLoadingTasks(true);
         const now = new Date();
         const month = now.getMonth() + 1;
         const year = now.getFullYear();
         try {
            const res = await fetch('http://192.168.1.36:3000/api/dashboard/getFinishedAllTask', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ userId: user.uid, month, year }),
            });
            const data = await res.json();
            setFinishedTasks(data.tasks || []);
         } catch (e) {
            setFinishedTasks([]);
         }
         setLoadingTasks(false);
      };
      fetchTasks();
   }, [user?.uid]);
   
   //finished task 8 month back
   useEffect(() => {
      const fetchTasks = async () => {
         if (!user?.uid) return;
         setLoadingTasks(true);
         const now = new Date();
         const month = now.getMonth() + 1;
         const year = now.getFullYear();
         try {
            const res = await fetch('http://192.168.1.36:3000/api/dashboard/getFinishedTaskin8MonthBack', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ userId: user.uid, month, year }),
            });
            const data = await res.json();
            setFinishedTasks8MonthsBack(data.stats || []);
         } catch (e) {
            setFinishedTasks8MonthsBack([]);
         }
         setLoadingTasks(false);
      };
      fetchTasks();
   }, [user?.uid]);

   return (
      <PageContainer title="Dashboard" description="this is Dashboard">
         {isLgUp && (
            <Box sx={{ height: '89vh' }}>
               <Grid container spacing={3} sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
                     <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3, width: '60%' }}>
                        
                        <WelcomeCard fullName={user?.fullName || ""} />

                        <Box
                           sx={{
                              display: 'flex',
                              gap: 3,
                              flexDirection: isLgUp ? 'row' : 'column', // เปลี่ยนเป็น column เมื่อจอเล็ก
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
                        
                        <WelcomeCard fullName={user?.fullName || ""} />

                        <Box
                           sx={{
                              display: 'flex',
                              gap: 3,
                              flexDirection: isXsUp ? 'row' : 'column', // เปลี่ยนเป็น column เมื่อจอเล็ก
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