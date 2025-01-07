import React, { useEffect, useState } from 'react';
import { socket } from '../../services/socket';
import axios from 'axios';
import UsersList from '../Auth/UsersList';

const Chat = ({ token, logout }) => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [file, setFile] = useState(null);

  // Fetch users and join socket room
  useEffect(() => {
    if (token) {
      socket.emit('join', username);
      axios
        .get('http://localhost:3000/users')
        .then((res) => setUsers(res.data))
        .catch(() => alert('Failed to fetch users'));
    }

    // Listen for active users and new messages
    socket.on('activeUsers', (users) => setActiveUsers(users));
    socket.on('newMessage', (message) => {
      if (
        (message.sender === username && message.recipient === currentRecipient) ||
        (message.sender === currentRecipient && message.recipient === username)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('activeUsers');
      socket.off('newMessage');
    };
  }, [token, username, currentRecipient]);

  // Fetch messages for the current recipient
  useEffect(() => {
    if (currentRecipient) {
      axios
        .get('http://localhost:3000/messages', {
          params: { sender: username, recipient: currentRecipient },
        })
        .then((res) => setMessages(res.data))
        .catch(() => alert('Failed to fetch messages'));
    }
  }, [currentRecipient, username]);

  const sendMessage = async () => {
    if (!currentRecipient) {
      alert('Please select a recipient');
      return;
    }

    try {
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
    } catch (err) {
      alert('Failed to send message');
    }
  };

  return (
    <div>
      <button onClick={logout}>Log Out</button>
      <UsersList
        users={users}
        activeUsers={activeUsers}
        setCurrentRecipient={(recipient) => {
          setCurrentRecipient(recipient);
          setMessages([]); // Clear messages before fetching
        }}
      />
      <div>
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
    </div>
  );
};

export default Chat;
