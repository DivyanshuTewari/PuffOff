import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, loginUser, registerUser, logoutUser, setUser } from '../store/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload || 'Login failed');
    }
    return result.payload;
  };

  const register = async (username, email, password) => {
    const result = await dispatch(registerUser({ username, email, password }));
    if (registerUser.rejected.match(result)) {
      throw new Error(result.payload || 'Registration failed');
    }
    return result.payload;
  };

  const logout = async () => {
    await dispatch(logoutUser());
  };

  const updateUser = (updatedUser) => {
    dispatch(setUser(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
