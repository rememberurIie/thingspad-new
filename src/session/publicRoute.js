import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const sessionUser = sessionStorage.getItem("firebaseUserId");

  if (user || sessionUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
