import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, facilityApi, notificationApi } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const DEMO_PRESETS = [
  { email: 'driver@parkease.demo', name: 'Dev Driver', role: 'driver', desc: 'Driver with booked spots & vehicles' },
  { email: 'operator@parkease.demo', name: 'Om Operator', role: 'operator', desc: 'Operator of Central Park & Koramangala' },
  { email: 'admin@parkease.demo', name: 'Alex Admin', role: 'admin', desc: 'System Admin with platform oversight' },
  { email: 'user@parkease.demo', name: 'Uma User', role: 'driver', desc: 'Secondary driver profile' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { addToast } = useToast();

  const fetchProfileAndNotifications = useCallback(async () => {
    try {
      const [meRes, notifRes] = await Promise.allSettled([
        authApi.getMe(),
        notificationApi.getAll()
      ]);

      if (meRes.status === 'fulfilled' && meRes.value.data.success) {
        const u = meRes.value.data.user;
        setUser(u);
        setFavorites(u.favoritesFacilities?.map(f => (typeof f === 'string' ? f : f._id)) || []);
      }

      if (notifRes.status === 'fulfilled' && notifRes.value.data.success) {
        setUnreadCount(notifRes.value.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.message);
    }
  }, []);

  // Initialize demo user on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const stored = localStorage.getItem('parkease_demo_user');
      let targetUser = null;

      if (stored) {
        try {
          targetUser = JSON.parse(stored);
        } catch (e) {
          console.error('Invalid user in localStorage', e);
        }
      }

      // Default to Dev Driver if none exists
      if (!targetUser || !targetUser.email) {
        targetUser = {
          email: 'driver@parkease.demo',
          name: 'Dev Driver',
          role: 'driver',
        };
      }

      try {
        const res = await authApi.demoLogin({
          email: targetUser.email,
          name: targetUser.name || 'Demo User',
          role: targetUser.role || 'driver',
        });
        if (res.data.success) {
          const loggedUser = res.data.user;
          setUser(loggedUser);
          localStorage.setItem('parkease_demo_user', JSON.stringify(loggedUser));
          await fetchProfileAndNotifications();
        }
      } catch (err) {
        console.error('Demo login failed on init:', err);
        // Fallback local state if offline/server loading
        setUser(targetUser);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchProfileAndNotifications]);

  const login = async (email, role = 'driver', name = '') => {
    try {
      setLoading(true);
      const res = await authApi.demoLogin({ email, role, name });
      if (res.data.success) {
        const logged = res.data.user;
        setUser(logged);
        localStorage.setItem('parkease_demo_user', JSON.stringify(logged));
        await fetchProfileAndNotifications();
        addToast(`Signed in as ${logged.name} (${logged.role})`, 'success');
        return { success: true, user: logged };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to login demo account';
      addToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole) => {
    if (!user) return;
    try {
      const res = await authApi.switchRole({ email: user.email, role: newRole });
      if (res.data.success) {
        const updated = { ...user, role: newRole };
        setUser(updated);
        localStorage.setItem('parkease_demo_user', JSON.stringify(updated));
        addToast(`Switched role to ${newRole.toUpperCase()}`, 'info');
      }
    } catch (err) {
      // Local fallback for smooth demonstration
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('parkease_demo_user', JSON.stringify(updated));
      addToast(`Switched role to ${newRole.toUpperCase()}`, 'info');
    }
  };

  const quickSwitchUser = async (presetEmail) => {
    const preset = DEMO_PRESETS.find(p => p.email === presetEmail);
    if (!preset) return;
    await login(preset.email, preset.role, preset.name);
  };

  const logout = () => {
    localStorage.removeItem('parkease_demo_user');
    setUser(null);
    setFavorites([]);
    setUnreadCount(0);
    addToast('Signed out of demo session', 'info');
  };

  const toggleFavorite = async (facilityId) => {
    if (!user) {
      addToast('Please login to save favorites', 'warning');
      return false;
    }
    try {
      const res = await facilityApi.toggleFavorite(facilityId);
      if (res.data.success) {
        setFavorites(res.data.favorites.map(f => (typeof f === 'string' ? f : f._id)));
        addToast(res.data.isFavorite ? 'Added to favorites' : 'Removed from favorites', 'success');
        return res.data.isFavorite;
      }
    } catch (err) {
      addToast('Failed to update favorites', 'error');
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'driver',
        isAuthenticated: !!user,
        loading,
        favorites,
        unreadCount,
        login,
        switchRole,
        quickSwitchUser,
        logout,
        toggleFavorite,
        refreshProfile: fetchProfileAndNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
