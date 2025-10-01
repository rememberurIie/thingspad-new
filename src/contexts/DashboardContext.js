import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const user = useSelector(state => state.auth.user);

  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [finishedTasks, setFinishedTasks] = useState([]);
  const [finishedTasks8MonthsBack, setFinishedTasks8MonthsBack] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Fetch in-progress tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.uid) return;
      setLoadingTasks(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      try {
        const res = await fetch('http://192.168.68.53:3000/api/dashboard/getInProgressAllTask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, month, year }),
        });
        const data = await res.json();
        setInProgressTasks(data.tasks || []);
      } catch (e) {
        setInProgressTasks([]);
      }
      setLoadingTasks(false);
    };
    fetchTasks();
  }, [user?.uid]);

  // Fetch finished tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.uid) return;
      setLoadingTasks(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      try {
        const res = await fetch('http://192.168.68.53:3000/api/dashboard/getFinishedAllTask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, month, year }),
        });
        const data = await res.json();
        setFinishedTasks(data.tasks || []);
      } catch (e) {
        setFinishedTasks([]);
      }
      setLoadingTasks(false);
    };
    fetchTasks();
  }, [user?.uid]);

  // Fetch finished tasks 8 months back
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.uid) return;
      setLoadingTasks(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      try {
        const res = await fetch('http://192.168.68.53:3000/api/dashboard/getFinishedTaskin8MonthBack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, month, year }),
        });
        const data = await res.json();
        setFinishedTasks8MonthsBack(data.stats || []);
      } catch (e) {
        setFinishedTasks8MonthsBack([]);
      }
      setLoadingTasks(false);
    };
    fetchTasks();
  }, [user?.uid]);

  return (
    <DashboardContext.Provider
      value={{
        inProgressTasks,
        finishedTasks,
        finishedTasks8MonthsBack,
        loadingTasks,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};