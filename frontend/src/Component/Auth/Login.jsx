import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const { data } = await axios.post('http://localhost:3000/login', { username, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Log In</button>
    </div>
  );
};

export default LoginForm;
