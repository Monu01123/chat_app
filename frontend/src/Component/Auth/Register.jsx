import React, { useState } from 'react';
import axios from 'axios';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signup = async () => {
    try {
      await axios.post('http://localhost:3000/signup', { username, password });
      alert('Signup successful');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={signup}>Sign Up</button>
    </div>
  );
};

export default SignupForm;
