import React, { createContext, useContext, useState } from "react";

const GroupMessageListContext = createContext();

export const useGroupMessageList = () => useContext(GroupMessageListContext);

export const GroupMessageListProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messagesByGroupId, setMessagesByGroupId] = useState({});
  const [membersByGroupId, setMembersByGroupId] = useState({}); // <-- add this

  // Save messages for a group
  const setMessagesForGroup = (groupId, messages) => {
    setMessagesByGroupId(prev => ({ ...prev, [groupId]: messages }));
  };

  // Save members for a group
  const setMembersForGroup = (groupId, members) => {
    setMembersByGroupId(prev => ({ ...prev, [groupId]: members }));
  };

  return (
    <GroupMessageListContext.Provider
      value={{
        groups, setGroups,
        selectedGroup, setSelectedGroup,
        messagesByGroupId, setMessagesForGroup,
        membersByGroupId, setMembersForGroup // <-- add to value
      }}
    >
      {children}
    </GroupMessageListContext.Provider>
  );
};