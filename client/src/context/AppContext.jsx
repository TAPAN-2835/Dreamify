import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../lib/socket';

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [credit, setCredit] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const loadCreditsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/credits', { headers: { token } });
      if (data.success) {
        setCredit(data.credits);
        setUser(data.user);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const generateImage = async (prompt) => {
    try {
      const userId = user?.id || localStorage.getItem('userId');
      const { data } = await axios.post(
        backendUrl + '/api/image/generate-image',
        { prompt, userId },
        { headers: { token } }
      );

      if (data.success) {
        return data.jobId;
      } else {
        toast.error(data.message);
        loadCreditsData();
        if (data.creditBalance === 0) navigate('/buy');
        return null;
      }
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken('');
    setUser(null);
    disconnectSocket();
  };

  // Init socket when token changes
  useEffect(() => {
    if (token) {
      loadCreditsData();
      connectSocket(token);
    } else {
      disconnectSocket();
    }
    return () => {
      // Don't disconnect on re-render — only on logout
    };
  }, [token]);

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    token,
    setToken,
    credit,
    setCredit,
    loadCreditsData,
    logout,
    generateImage,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
