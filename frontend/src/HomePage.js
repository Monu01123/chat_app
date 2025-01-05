import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (token) {
      const loggedInUser = localStorage.getItem('username');
      setUsername(loggedInUser);
      socket.emit('join', loggedInUser);
      axios.get('http://localhost:3000/users').then((res) => setUsers(res.data));
    }
  }, [token]);

  useEffect(() => {
    socket.on('activeUsers', (users) => setActiveUsers(users));
    socket.on('newMessage', (message) => {
      if (
        (message.sender === username && message.recipient === currentRecipient) ||
        (message.sender === currentRecipient && message.recipient === username)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('loadOldMessages', (loadedMessages) => {
      setMessages((prev) => [...prev, ...loadedMessages]);
    });

    return () => {
      socket.off('activeUsers');
      socket.off('newMessage');
      socket.off('loadOldMessages');
    };
  }, [currentRecipient, username]);

  useEffect(() => {
    if (currentRecipient) {
      axios
        .get('http://localhost:3000/messages', {
          params: { sender: username, recipient: currentRecipient },
        })
        .then((res) => setMessages(res.data));
    }
  }, [currentRecipient, username]);

  const signup = async () => {
    try {
      await axios.post('http://localhost:3000/signup', { username, password });
      alert('Signup successful');
    } catch (err) {
      alert('Signup failed');
    }
  };

  const login = async () => {
    try {
      const { data } = await axios.post('http://localhost:3000/login', { username, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      socket.emit('join', username);
    } catch (err) {
      alert('Login failed');
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername('');
    setPassword('');
    setCurrentRecipient('');
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!currentRecipient) {
      alert('Please select a recipient');
      return;
    }

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post('http://localhost:3000/upload', formData);
      const message = { sender: username, recipient: currentRecipient, type: 'file', fileUrl: data.fileUrl };
      socket.emit('message', message);
      setFile(null);
    } else {
      const message = { sender: username, recipient: currentRecipient, content: currentMessage, type: 'text' };
      socket.emit('message', message);
      setCurrentMessage('');
    }
  };

  return (
    <div>
      {!token ? (
        <div>
          <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={signup}>Sign Up</button>
          <button onClick={login}>Log In</button>
        </div>
      ) : (
        <div>
          <button onClick={logout}>Log Out</button>
          <h3>All Users</h3>
          <ul>
            {users.map((user, index) => (
              <li
                key={index}
                onClick={() => setCurrentRecipient(user.username)}
                style={{ cursor: 'pointer', color: activeUsers.includes(user.username) ? 'green' : 'black' }}
              >
                {user.username}
              </li>
            ))}
          </ul>

          <h3>Messages with {currentRecipient || 'Select a user'}</h3>
          <div style={{ border: '1px solid black', padding: '10px', height: '300px', overflowY: 'scroll' }}>
            {messages.map((msg, index) => (
              <p key={index}>
                <b>{msg.sender}:</b>{' '}
                {msg.type === 'text' ? (
                  msg.content
                ) : (
                  <img
                    src={msg.fileUrl}
                    alt="file"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                )}
              </p>
            ))}
          </div>

          {currentRecipient && (
            <div>
              <input
                placeholder="Type your message"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              />
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <button onClick={sendMessage}>Send</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
