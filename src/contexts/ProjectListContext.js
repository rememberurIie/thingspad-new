import React, { createContext, useContext, useState } from "react";

const ProjectListContext = createContext();

export const useProjectList = () => useContext(ProjectListContext);

export const ProjectListProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  return (
    <ProjectListContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectListContext.Provider>
  );
};