import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ProjectManagementContext = createContext();

export const useProjectManagement = () => useContext(ProjectManagementContext);

export const ProjectManagementProvider = ({ children }) => {
  const user = useSelector(state => state.auth.user);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const fetchProjects = async () => {
      const res = await fetch('http://192.168.1.36:3000/api/root/projectManage/getAllProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid }),
      });
      const data = await res.json();
      setProjects(data);
    };
    fetchProjects();
  }, [user?.uid]);

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