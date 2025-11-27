import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { usePost } from '../hooks/useApi';
import { ENDPOINTS } from '../constants/endpoints';
import { STRINGS } from '../constants/strings';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { post: syncUser } = usePost();

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    setDbUser(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Sync user with backend
          const backendUser = await syncUser(ENDPOINTS.USERS.SYNC, {
            email: user.email,
            firebaseUid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
          setDbUser(backendUser);
        } catch (error) {
          console.error(STRINGS.LOGIN.ERROR_SYNC, error);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [syncUser]);

  const value = {
    currentUser,
    dbUser,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
