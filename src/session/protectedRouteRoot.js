import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRouteAdmin = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  // ถ้าไม่มี user หรือ role ไม่ใช่ root หรือ admin ให้ redirect
  if (!user || (user.role !== 'root')) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRouteAdmin;