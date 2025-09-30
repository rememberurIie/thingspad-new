import React, { useEffect, useState } from 'react';
import {
  Box,
  useMediaQuery,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  CircularProgress
} from '@mui/material';
import { useParams, Navigate } from "react-router-dom";

import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';

import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';
import { useProjectList } from '../../contexts/ProjectListContext'; // หรือดึงจาก Redux

import ChatList from './components/ChatComponent/ChatList';
import ChatContent from './components/ChatComponent/ChatContent';
import ChatMember from './components/ChatComponent/ChatMember';
import Header from './components/Header';
import TableView from './components/TableView';
import KandanBoard from './components/KandanBoard';
import ProjectChat from './components/ProjectChat';

const drawerWidth = 300;
const rightWidth = 280;

const Project = () => {
  const { projectId } = useParams();
  const { projects } = useProjectList();
  const user = useSelector(state => state.auth.user);

  const [view, setView] = useState('chat');

  // If projects are still loading, show nothing or a spinner
  if (!projects || projects.length === 0) {
    return null;
  }

  const hasAccess = projects.some(p => p.id === projectId);
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageContainer title="Chat App" description="Responsive chat UI">
      <Box
        sx={{
          height: '89vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ mb: 1 }}>
          <Header projectId={projectId} projectName={projects.find(p => p.id === projectId)?.name} view={view} setView={setView} />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
          {view === 'chat' && (
            <Box sx={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex' }}>
              <ProjectChat projectId={projectId} user={user} projects={projects} />
            </Box>
          )}
          {view === 'table' && (
            <Box sx={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex' }}>
              <TableView projectId={projectId}/>
            </Box>
          )}
          {view === 'kanban' && (
            <Box sx={{ flex: 1, width: '100%', minHeight: 0, position: 'relative', display: 'flex' }}>
              <KandanBoard projectId={projectId}/>
            </Box>
          )}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Project;