import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const ADD_MEMBER_URL = "http://192.168.68.53:3000/api/project/invite/inviteLink";

const InviteJoin = () => {
  const { projectId } = useParams();
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { replace: true });
      return;
    }
    fetch(ADD_MEMBER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        newMembers: [user.uid]
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data.error === "Project not found") {
            setError("Project not found.");
          } else if (data.error === "Inviting members is not allowed for this project") {
            setError("Inviting members is not allowed for this project.");
          } else {
            setError("Failed to join project.");
          }
        } else {
          // ถ้า success: true และสมาชิกมี user อยู่แล้ว ให้ redirect เลย
          if (data.success === true) {
            navigate(`/project/${projectId}`, { replace: true });
          } else {
            setError("Failed to join project.");
          }
        }
      })
      .catch(() => setError("Failed to join project."));
  }, [user, projectId, navigate]);

  const handleClose = () => {
    navigate('/', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
      <Dialog open={!!error} onClose={handleClose}>
        <DialogTitle>Caution</DialogTitle>
        <DialogContent>
          {error}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InviteJoin;