import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ProjectManagementContext = createContext();

export const useProjectManagement = () => useContext(ProjectManagementContext);

export const ProjectManagementProvider = ({ children }) => {
  const user = useSelector(state => state.auth.user);

  return (
    <ProjectManagementContext.Provider>
      {children}
    </ProjectManagementContext.Provider>
  );
};