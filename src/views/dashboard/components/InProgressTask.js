import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Card, CardContent, Box } from '@mui/material';

import { useTranslation } from 'react-i18next';

const InProgessTask = ({
  taskInProgressCount,
  titleFontSize = 18,
  countFontSize = 36,
}) => {

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
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{ fontSize: titleFontSize }}
          >
            {t('dashboard.inprogress')}
          </Typography>
        </Stack>
        <Typography
          variant="h1"
          fontWeight="700"
          mt="-20px"
          sx={{ fontSize: countFontSize }}
        >
          {taskInProgressCount || 0} {t('dashboard.task_ea')}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">

        </Stack>
      </CardContent>

      {/* รูปภาพที่มุมขวาล่าง */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 8, sm: 16, md: 24, lg: 32 },
          bottom: { xs: '-8px', sm: '-12px', md: '-15px' },
          width: { xs: 80, sm: 110, md: 140, lg: 170 }, // responsive width
          height: 'auto',
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
