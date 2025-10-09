import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const UserManagementContext = createContext();

export const useUserManagement = () => useContext(UserManagementContext);

export const UserManagementProvider = ({ children }) => {
  const user = useSelector(state => state.auth.user);

  return (
    <UserManagementContext.Provider>
      {children}
    </UserManagementContext.Provider>
  );
};