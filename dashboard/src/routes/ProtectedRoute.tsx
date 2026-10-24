import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getMyProfile } from '../services/customer.service';
import { useAuthStore } from '../stores/auth.store';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const [isLoadingProfile, setIsLoadingProfile] = useState(
    isAuthenticated && !user,
  );

  useEffect(() => {
    if (!isAuthenticated || user) {
      setIsLoadingProfile(false);
      return;
    }

    let isActive = true;

    setIsLoadingProfile(true);

    getMyProfile()
      .then((profile) => {
        if (isActive) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (isActive) {
          logout();
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, user, setUser, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingProfile) {
    return <p>Checking permissions...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/not-found" replace />;
  }

  return <Outlet />;
}
