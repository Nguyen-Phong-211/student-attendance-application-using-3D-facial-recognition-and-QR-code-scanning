import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    return <Navigate to="/account/login/*" replace />;
  }

  return children;
};

export default ProtectedRoute;