import React from 'react';
import { Select, MenuItem, Card, CardContent, CardHeader, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';

import { useTranslation } from 'react-i18next';

const FinishedTaskGraph = ({
  finishedTasks8MonthsBack = [],
  titleFontSize = 18,
  axisFontSize = 12,
}) => {
  const { t } = useTranslation();

  // select
  const [month, setMonth] = React.useState('1');

  const handleChange = (event) => {
    setMonth(event.target.value);
  };

  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Prepare data for chart
  const categories = finishedTasks8MonthsBack.map(
    d => `${d.month.toString().padStart(2, '0')}/${d.year}`
  );
  const finishedCounts = finishedTasks8MonthsBack.map(d => d.count);

  const optionscolumnchart = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: true,
      },
      height: '100%',
    },
    colors: [primary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: '60%',
        columnWidth: '42%',
        borderRadius: [6],
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    yaxis: {
      tickAmount: 4,
      labels: {
        style: {
          fontSize: `${axisFontSize}px`,
        },
      },
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      labels: {
        style: {
          fontSize: `${axisFontSize}px`,
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
  };
  const seriescolumnchart = [
    {
      name: 'Finished Tasks',
      data: finishedCounts,
    }
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: titleFontSize, fontWeight: 700 }}>
            {t('dashboard.finished_graph')}
          </Typography>
        }
        sx={{ pb: 0, flexShrink: 0 }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 0,
          }}
        >
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="bar"
            height="100%"
            width="100%"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinishedTaskGraph;
