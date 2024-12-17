import React, { useEffect, useState } from "react";
import socket from "./socket.js";

const Chat = ({ user }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = { sender: user.email, content: message };
      socket.emit("sendMessage", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages &&
          messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.sender}:</strong> {msg.content}
            </p>
          ))}
      </div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
