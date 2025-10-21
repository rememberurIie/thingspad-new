import React from 'react';
import TableView from '../../../views/project/components/TableView';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../language/i18n';

const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { uid: 'user123', fullName: 'Mock User' },
    }),
  },
});

// Mock tasks for preview
const MOCK_TASKS = [
  {
    id: 't1',
    name: 'Design UI',
    status: 'New task',
    assigneeId: 'u1',
    assigneeFullName: 'Netipong Sanklar',
    due: new Date().toISOString(),
    imageUrl: '',
  },
  {
    id: 't2',
    name: 'API Spec',
    status: 'Scheduled',
    assigneeId: 'u2',
    assigneeFullName: 'Aroon T.',
    due: new Date(Date.now() + 86400000).toISOString(),
    imageUrl: '',
  },
  {
    id: 't3',
    name: 'Backend CRUD',
    status: 'In progress',
    assigneeId: 'u3',
    assigneeFullName: 'Pim S.',
    due: new Date(Date.now() + 2 * 86400000).toISOString(),
    imageUrl: '',
  },
  {
    id: 't4',
    name: 'Deploy',
    status: 'Completed',
    assigneeId: 'u1',
    assigneeFullName: 'Netipong Sanklar',
    due: new Date(Date.now() - 86400000).toISOString(),
    imageUrl: '',
  },
];

export default {
  title: 'Project/Task/TableView',
  component: TableView,
  tags: ['autodocs'],
  argTypes: {
    darkMode: { control: 'boolean', defaultValue: false },
    languageToggle: { control: 'boolean', defaultValue: false },
    projectId: { control: 'text', defaultValue: null },
    initialTasks: { control: 'object', defaultValue: MOCK_TASKS },
  },
  decorators: [
    (Story, ctx) => {
      const theme = createTheme({ palette: { mode: ctx.args.darkMode ? 'dark' : 'light' } });
      const lang = ctx.args.languageToggle ? 'th' : 'en';
      if (i18n.language !== lang) i18n.changeLanguage(lang);

      return (
        <Provider store={mockStore}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <div style={{ width: '100%', maxWidth: 1200, minHeight: 600 }}>
                <Story />
              </div>
            </ThemeProvider>
          </I18nextProvider>
        </Provider>
      );
    },
  ],
};

const Template = (args) => (
  <TableView projectId={null} initialTasks={args.initialTasks} />
);

export const Default = Template.bind({});
Default.args = {
  projectId: null,
  darkMode: false,
  languageToggle: false,
  initialTasks: MOCK_TASKS,
};
