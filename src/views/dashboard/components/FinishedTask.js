import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Card, CardContent, CardActions } from '@mui/material';

import { useTranslation } from 'react-i18next';


const FinishedTask = ({ taskInProgressCount, taskFinishedCount }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Ensure integer values
  const safeFinished = Number.isFinite(taskFinishedCount) ? taskFinishedCount : 0;
  const safeInProgress = Number.isFinite(taskInProgressCount) ? taskInProgressCount : 0;
  const totalTasks = safeFinished + safeInProgress;

  console.log('Finished:', safeFinished, 'In Progress:', safeInProgress);



  const options = {
    chart: {
      type: 'bar',
      stacked: true,
      foreColor: '#adb0bb',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '100%',
      },
    },
    colors: [primary, secondary],
    legend: {
      show: false,
      position: 'bottom',
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
    yaxis: {
      show: false,
    },
    xaxis: {
      show: false,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
      lines: { show: false },
      min: 0,
      max: totalTasks > 0 ? totalTasks : 1,
    },
    grid: {
      show: false,
      padding: { left: 0, right: 15, bottom: 0, top: 0 }, // ปรับ padding ซ้ายขวาเป็น 0
    },
  };

  const series = [
    {
      name: 'Finished',
      data: [safeFinished],
    },
    {
      name: 'In Progress',
      data: [safeInProgress],
    },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: '10px', height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="700">
            {t('dashboard.finished')}
          </Typography>
        </Stack>
        <Typography variant="h1" fontWeight="700" mt="-10px">
          {safeFinished}/{totalTasks} {t('dashboard.task_ea')}
        </Typography>
      </CardContent>
      <CardActions
        sx={{

          width: '100%',
          display: 'flex',
          height: '90px',
          position: 'relative', // เพิ่มบรรทัดนี้
        }}
        disableSpacing
      >
        <Chart
          options={options}
          series={series}
          type="bar"
          height="80px"
          style={{ flex: 1 }} // เพิ่มบรรทัดนี้
        />

      </CardActions>
    </Card>
  );
};

export default FinishedTask;
