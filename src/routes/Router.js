import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import ProtectedRoute from '../session/protectedRoute';
import PublicRoute from '../session/publicRoute';

/* ***Layouts**** */
const FullLayout = lazy(() => import('../layouts/full/FullLayout'));
const BlankLayout = lazy(() => import('../layouts/blank/BlankLayout'));

/* ****Pages***** */
const Dashboard = lazy(() => import('../views/dashboard/Dashboard'));
const DirectMessage = lazy(() => import('../views/chat/dm/DirectMessage'));
const ChatbyRole = lazy(() => import('../views/chat/role/ChatbyRole'));
const Project = lazy(() => import('../views/project/Project'));


// *****auth*****
const Register = lazy(() => import('../views/authentication/Register'));
const Login = lazy(() => import('../views/authentication/Login'));
const Error = lazy(() => import('../views/authentication/Error'));

// *****context*****
import { ChatListProvider } from '../contexts/ChatListContext';
import { ProjectListProvider } from '../contexts/ProjectListContext';
import { DirectMessageListProvider } from '../contexts/DirectMessageListContext';

const Router = [
  {
    path: '/',
    element: (
      <ChatListProvider>
        <ProjectListProvider>
          <DirectMessageListProvider>
            <FullLayout />
          </DirectMessageListProvider>
        </ProjectListProvider>
      </ChatListProvider>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/chat/dm',
        element: (
          <ProtectedRoute>
            <DirectMessage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/chat/role',
        element: (
          <ProtectedRoute>
            <ChatbyRole />
          </ProtectedRoute>
        ),
      },
      {
        path: '/project',
        element: (
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        ),
      },
      {
        path: '/project/:projectId',
        element: (
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/auth/404" />,
      },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      {
        path: '404',
        element: <Error />,
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/auth/404" />,
      },
    ],
  },
];


const router = createBrowserRouter(Router);

export default router;
