import React, { createContext, useContext, useState } from "react";

const DirectMessageListContext = createContext();

export const useDirectMessageList = () => useContext(DirectMessageListContext);

export const DirectMessageListProvider = ({ children }) => {
  const [dms, setDms] = useState([]);
  const [selectedDm, setSelectedDm] = useState(null);
  const [messagesByDmId, setMessagesByDmId] = useState({});

  // Save messages for a DM
  const setMessagesForDm = (dmId, messages) => {
    setMessagesByDmId(prev => ({ ...prev, [dmId]: messages }));
  };

  return (
    <DirectMessageListContext.Provider
      value={{
        dms, setDms,
        selectedDm, setSelectedDm,
        messagesByDmId, setMessagesForDm
      }}
    >
      {children}
    </DirectMessageListContext.Provider>
  );
};