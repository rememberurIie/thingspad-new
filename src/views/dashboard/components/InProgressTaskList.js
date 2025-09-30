import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { useTranslation } from 'react-i18next';

const InProgessTaskList = ({
  tasks = [],
  loading = false,
  titleFontSize = 18,
  taskFontSize = 16,
  projectFontSize = 12,
}) => {
  const { t } = useTranslation();
  return (
    <Card variant="outlined" sx={{ height: '89vh', overflowY: 'auto', borderRadius: '10px' }}>
      <CardHeader
        title={
          <Typography sx={{ fontSize: titleFontSize, fontWeight: 700 }}>
            {t('dashboard.inprogress_list')}
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Timeline
          className="theme-timeline"
          sx={{
            p: 0,
            mb: '-40px',
            '& .MuiTimelineConnector-root': {
              width: '1px',
              backgroundColor: '#efefef'
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.5,
              paddingLeft: 0,
            },
          }}
        >
          {loading ? (
            <TimelineItem>
              <TimelineOppositeContent>Loading...</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary" variant="outlined" />
              </TimelineSeparator>
              <TimelineContent>
                <Typography>Loading tasks...</Typography>
              </TimelineContent>
            </TimelineItem>
          ) : tasks.length === 0 ? (
            <TimelineItem>
              <TimelineOppositeContent />
              <TimelineSeparator>
                <TimelineDot color="primary" variant="outlined" />
              </TimelineSeparator>
              <TimelineContent>
                <Typography>No tasks found</Typography>
              </TimelineContent>
            </TimelineItem>
          ) : (
            tasks.map((task, idx) => (
              <TimelineItem key={task.id}>
                <TimelineOppositeContent>
                  {task.due
                    ? new Date(task.due).toLocaleString([], {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : ''}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" variant="outlined" />
                  {idx < tasks.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography fontWeight="600" sx={{ fontSize: taskFontSize }}>
                    {task.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: projectFontSize }}>
                    {task.projectName}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))
          )}
        </Timeline>
      </CardContent>
    </Card>
  );
};

export default InProgessTaskList;
