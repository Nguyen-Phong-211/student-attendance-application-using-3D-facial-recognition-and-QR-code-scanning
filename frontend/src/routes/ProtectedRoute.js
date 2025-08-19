import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../auth/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <Spin size="large" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />;
  }

  if (!user) {
    return (
      <Navigate
        to={`/account/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;