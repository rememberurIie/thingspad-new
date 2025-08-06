import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';

const ChatList = ({ onSelect, projectId }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchGroups = async () => {
      try {
        const response = await fetch('http://192.168.1.32:3000/api/project/getProjectData', {  // เปลี่ยนเป็น SSE API ที่ส่ง stream
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
          signal,
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
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
              try {
                const parsedData = JSON.parse(message.substring(6));
                // SSE ข้อมูลส่งมาแบบ { type: "...", groupId?, payload: ... }

                // เราจะสนใจเฉพาะข้อมูล type === "groupData"
                if (parsedData.type === "groupData") {
                  // payload คือข้อมูลกลุ่มเดียว => เราต้องอัพเดตรายการ rooms
                  setRooms((prevRooms) => {
                    // ถ้ากลุ่มนี้มีใน prevRooms อยู่แล้ว ให้ update
                    const existsIndex = prevRooms.findIndex(r => r.id === parsedData.groupId);

                    if (existsIndex !== -1) {
                      const newRooms = [...prevRooms];
                      newRooms[existsIndex] = { id: parsedData.groupId, ...parsedData.payload };
                      return newRooms;
                    } else {
                      // เพิ่มกลุ่มใหม่เข้า array
                      return [...prevRooms, { id: parsedData.groupId, ...parsedData.payload }];
                    }
                  });
                }

                // ถ้าต้องการจัดการ type อื่น เช่น users, messages ก็ทำได้ที่นี่
                // else if (parsedData.type === "users") { ... }
              } catch (err) {
                console.error("JSON parse error:", err);
              }
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

  }, [projectId]);

  return (
    <Card variant="outlined" sx={{ height: '100%', overflowY: 'auto', borderRadius: '10px', backgroundColor: '#ecf4fc' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rooms
        </Typography>
        <List>
          {rooms.map((group, idx) => (
            <React.Fragment key={group.id}>
              <ListItem button onClick={() => onSelect(group)}>
                <ListItemAvatar>
                  <Avatar>{group.name ? group.name.charAt(0) : '?'}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={group.name || 'No Name'}
                />
              </ListItem>
              {idx !== rooms.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ChatList;
