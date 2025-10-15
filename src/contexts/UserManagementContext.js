import React, { createContext, useContext, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSSE from 'src/hook/useSSE';

const UserManagementContext = createContext();

export const useUserManagement = () => useContext(UserManagementContext);

export const UserManagementProvider = ({ children }) => {
  const user = useSelector(state => state.auth.user);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState([]);

  // SSE for users
  useSSE(
    user?.uid ? 'http://192.168.1.36:3000/api/root/userManage/getAllUser' : null,
    (data) => {
      setUsers(data);
      return data;
    },
    { userId: user?.uid }
  );

  // Filtered users
  const filteredUsers = useMemo(() => (
  Array.isArray(users)
    ? users.filter(
        u =>
          (u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.username?.toLowerCase().includes(search.toLowerCase())) &&
          (roleFilter.length === 0 || roleFilter.includes(u.role))
      )
    : []
), [users, search, roleFilter]);

  return (
    <UserManagementContext.Provider value={{
      users,
      setUsers,
      search,
      setSearch,
      roleFilter,
      setRoleFilter,
      filteredUsers,
    }}>
      {children}
    </UserManagementContext.Provider>
  );
};