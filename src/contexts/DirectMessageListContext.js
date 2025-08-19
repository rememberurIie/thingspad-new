import React, { createContext, useContext, useState } from "react";

const DirectMessageListContext = createContext();

export const useDirectMessageList = () => useContext(DirectMessageListContext);

export const DirectMessageListProvider = ({ children }) => {
  const [dms, setDms] = useState([]);
  return (
    <DirectMessageListContext.Provider value={{ dms, setDms }}>
      {children}
    </DirectMessageListContext.Provider>
  );
};