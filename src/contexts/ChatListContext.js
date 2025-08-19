import React, { createContext, useContext, useState } from "react";

const ChatListContext = createContext();

export const useChatList = () => useContext(ChatListContext);

export const ChatListProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  return (
    <ChatListContext.Provider value={{ rooms, setRooms }}>
      {children}
    </ChatListContext.Provider>
  );
};