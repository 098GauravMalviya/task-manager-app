import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const role = localStorage.getItem("userRole");

  // If role is missing → user is not logged in
  if (!role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;