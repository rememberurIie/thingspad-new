import React, { createContext, useContext, useState } from "react";
import useSSE from "../hook/useSSE"; // adjust path as needed
import { useSelector } from "react-redux";

const ProjectListContext = createContext();

export const useProjectList = () => useContext(ProjectListContext);

export const ProjectListProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const user = useSelector(state => state.auth.user);

  useSSE(
    user ? "http://192.168.68.81:3000/api/project/chat/getProjectList" : null,
    (data) => {
      setProjects(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data)) {
          return data;
        }
        return prev;
      });
    },
    user ? { uid: user.uid } : undefined
  );

  return (
    <ProjectListContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectListContext.Provider>
  );
};