import React, { createContext, useContext, useState } from "react";

const GroupMessageListContext = createContext();

export const useGroupMessageList = () => useContext(GroupMessageListContext);

export const GroupMessageListProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  return (
    <GroupMessageListContext.Provider value={{ groups, setGroups }}>
      {children}
    </GroupMessageListContext.Provider>
  );
};