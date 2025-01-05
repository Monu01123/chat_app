import React, { useState } from 'react';
import LoginForm from './Component/Auth/Login';
import SignupForm from './component/Auth/Register';
import Chat from './component/Auth/Chat';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <div>
      {!token ? (
        <div>
          <SignupForm />
          <LoginForm setToken={setToken} />
        </div>
      ) : (
        <Chat token={token} logout={logout} />
      )}
    </div>
  );
}

export default App;
