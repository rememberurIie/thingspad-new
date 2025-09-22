import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Card, CardContent, Box } from '@mui/material'; // เพิ่ม Box

import { useTranslation } from 'react-i18next';

const InProgessTask = ({ taskInProgressCount }) => {
  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

  const { t } = useTranslation();

  // chart
  const optionscolumnchart = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };
  const seriescolumnchart = [
    {
      name: '',
      color: secondary,
      data: [25, 66, 20, 40, 12, 58, 20],
    },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: '10px', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="700">
             {t('dashboard.inprogress')}
          </Typography>
        </Stack>
        <Typography variant="h1" fontWeight="700" mt="-10px">
          {taskInProgressCount || 0} {t('dashboard.task_ea')}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          {/* <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
            <IconArrowDownRight width={20} color="#FA896B" />
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            +9%
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            last year
          </Typography> */}
        </Stack>
      </CardContent>
      {/* <CardActions sx={{ p: 0, width: '100%', display: 'block' }} disableSpacing>
      <Chart
        options={optionscolumnchart}
        series={seriescolumnchart}
        type="area"
        height="60px"
        width="100%"
      />
    </CardActions> */}
      {/* รูปภาพที่มุมขวาล่าง */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          bottom: '-13px',         // ขยับให้ชิดขอบล่าง
          width: 170,         // ปรับขนาดให้เหมาะสม
          height: 'auto',        // ปรับขนาดให้เหมาะสม
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <img
          src="src\assets\images\InProgressCard.png"
          alt="man working"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>
    </Card>
  );
};

export default InProgessTask;
