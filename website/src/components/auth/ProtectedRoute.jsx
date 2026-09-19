import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

const ProtectedRoute = ({ children }) => {
  const { accountInfo, setShowLogin, loading } = useSite();
  const location = useLocation();
  
  // Use same logic as Navbar: require both memory state and localStorage token
  const authSecretKey = localStorage.getItem("auth_secret_key");
  const isGuest = authSecretKey === "guest";
  const isRealUser = !!(accountInfo?.account_id && accountInfo.account_id !== "guest" && authSecretKey && authSecretKey !== "guest");
  
  // Allow guest only for game routes
  const isGameRoute = location.pathname.startsWith('/game');
  const isAuthorized = isRealUser || (isGuest && isGameRoute);

  useEffect(() => {
    // If not authorized and not currently loading initial site data
    if (!loading && !isAuthorized) {
      setShowLogin(true);
    }
  }, [isAuthorized, setShowLogin, loading]);

  if (loading) {
    return null; // Or a loader component
  }

  if (!isAuthorized) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
