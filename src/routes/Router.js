import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import ProtectedRoute from '../session/protectedRoute';
import ProtectedRouteRoot from '../session/protectedRouteRoot';
import PublicRoute from '../session/publicRoute';

/* ***Layouts**** */
const FullLayout = lazy(() => import('../layouts/full/FullLayout'));
const BlankLayout = lazy(() => import('../layouts/blank/BlankLayout'));

/* ****Root***** */
const UserManagement = lazy(() => import('../views/root/UserManagement'));
const ProjectManagement = lazy(() => import('../views/root/ProjectManagement'));

/* ****Pages***** */
const Dashboard = lazy(() => import('../views/dashboard/Dashboard'));
const DirectMessage = lazy(() => import('../views/chat/dm/DirectMessage'));
const GroupMessage = lazy(() => import('../views/chat/group/GroupMessage'));
const Project = lazy(() => import('../views/project/Project'));
const InviteJoin = lazy(() => import('../views/project/InviteJoin'));

// *****auth*****
const Register = lazy(() => import('../views/authentication/Register'));
const Login = lazy(() => import('../views/authentication/Login'));
const Error = lazy(() => import('../views/authentication/Error'));

// *****context*****
import { ProjectListProvider } from '../contexts/ProjectListContext';
import { DirectMessageListProvider } from '../contexts/DirectMessageListContext';
import { GroupMessageListProvider } from '../contexts/GroupMessageListContext';
import { DashboardProvider } from '../contexts/DashboardContext'; // Add this import

const Router = [
  {
    path: '/',
    element: (
      <DashboardProvider>
        <DirectMessageListProvider>
          <GroupMessageListProvider>
            <ProjectListProvider>
              <FullLayout />
            </ProjectListProvider>
          </GroupMessageListProvider>
        </DirectMessageListProvider>
      </DashboardProvider>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" />,
      },
            {
        path: '/user_management',
        element: (
          <ProtectedRouteRoot>
            <UserManagement />
          </ProtectedRouteRoot>
        ),
      },
      {
        path: '/project_management',
        element: (
          <ProtectedRouteRoot>
            <ProjectManagement />
          </ProtectedRouteRoot>
        ),
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
        path: '/chat/group',
        element: (
          <ProtectedRoute>
            <GroupMessage />
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
        path: '/project/invite/:projectId',
        element: <InviteJoin />,
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
