import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "./config";

axios.defaults.withCredentials = true;

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/auth/check`)
      .then((res) => {
        if (res.data.loggedIn) setIsAuth(true);
        else setIsAuth(false);
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return null; // loading state

  return isAuth ? children : <Navigate to="/" replace />;
}
