import React, { createContext, useContext, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSSE from 'src/hook/useSSE';

const ProjectManagementContext = createContext();

export const useProjectManagement = () => useContext(ProjectManagementContext);

export const ProjectManagementProvider = ({ children }) => {
  const user = useSelector(state => state.auth.user);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');

  
  // SSE for users
  useSSE(
    user?.uid ? 'http://192.168.1.36:3000/api/root/projectManage/getAllProject' : null,
    (data) => {
      setProjects(data);
      return data;
      // setProjects(prev => {
      //     return prev.map(p => p.projectId === data.projectId ? data : p);
      //   }
      //   // ถ้ายังไม่มี ให้เพิ่มใหม่
      //   return [...prev, data];
      // });
    },
    { userId: user?.uid }
  );

  return (
    <ProjectManagementContext.Provider value={{
      projects,
      setProjects,
      search,
      setSearch
    }}>
      {children}
    </ProjectManagementContext.Provider>
  );
};