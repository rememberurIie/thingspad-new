import React from 'react';
import DirectMessageChat from './DirectMessageChat';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export default {
  title: 'Chat/DirectMessageChat',
  component: DirectMessageChat,
};

const theme = createTheme({ palette: { mode: 'light' } });

export const Default = () => (
  <ThemeProvider theme={theme}>
    <DirectMessageChat
      selectedDmId="dm1"
      otherUserId="user456"
      otherFullName="Jane Doe"
      currentUserId="user123"
    />
  </ThemeProvider>
);