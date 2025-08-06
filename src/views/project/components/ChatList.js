// ChatList.js
import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';

const ChatList = ({ onSelect, uid }) => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchGroups = async () => {
      try {
        const response = await fetch('http://192.168.1.32:3000/api/getGroupList', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: uid }), // แก้ไขภายหลังให้ dynamic
          signal,
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let messageEnd = buffer.indexOf('\n\n');
          while (messageEnd !== -1) {
            const message = buffer.slice(0, messageEnd);
            buffer = buffer.slice(messageEnd + 2);

            if (message.startsWith("data: ")) {
              const data = JSON.parse(message.substring(6));
              setGroups(data);
            }

            messageEnd = buffer.indexOf('\n\n');
          }
        }

      } catch (error) {
        if (!signal.aborted) {
          console.error("Error fetching group list:", error);
        }
      }
    };

    fetchGroups();
    return () => controller.abort();
  }, []);

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px', backgroundColor: '#ecf4fc'}}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rooms
        </Typography>
        <List>
          {groups.map((group, idx) => (
            <React.Fragment key={group.id}>
              <ListItem button onClick={() => onSelect(group)}>
                <ListItemAvatar>
                  <Avatar>{group.name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={group.name}
                  secondary={`สมาชิก ${group.members?.length || 0} คน`}
                />
              </ListItem>
              {idx !== groups.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ChatList;
