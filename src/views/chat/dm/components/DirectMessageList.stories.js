import React from 'react';
import DirectMessageList from './DirectMessageList';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DirectMessageListProvider } from '../../../../contexts/DirectMessageListContext';

export default {
  title: 'Chat/DirectMessageList',
  component: DirectMessageList,
};

const theme = createTheme({ palette: { mode: 'light' } });
const mockUserId = 'Smxw91lXjdgMOgyo0p3cuyWjFKK2';

export const Default = () => (
  <ThemeProvider theme={theme}>
    <DirectMessageListProvider>
      <DirectMessageList userId={mockUserId} onSelect={dm => {}} />
    </DirectMessageListProvider>
  </ThemeProvider>
);