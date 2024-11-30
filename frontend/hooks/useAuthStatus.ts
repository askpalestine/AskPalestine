import { useState, useEffect } from 'react';

function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
      setIsAuthenticated(localStorage.getItem('token') !== null);
      setUsername(localStorage.getItem('username'));
      setBio(localStorage.getItem('bio'));
      setAuthToken(localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUsername('');
    setAuthToken('');
    setBio('');
  };

  const handleLogin = (data) => {
    if (!data || !data.token || !data.username) {
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('bio', data.bio);
    localStorage.setItem('photo', data.photo);

    setUsername(data.username);
    setBio(data.bio);
    setAuthToken(data.token);
    setIsAuthenticated(true);
  }

  return { isAuthenticated, username, bio, handleLogin, handleLogout, authToken};
}

export default useAuthStatus;