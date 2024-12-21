import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./Component/Auth/Register.jsx";
import Login from "./Component/Auth/Login.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

// import React, { useState, useEffect } from "react";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");

// function App() {
//   const [nickname, setNickname] = useState("");
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [isNicknameSet, setIsNicknameSet] = useState(false);
//   const [typing, setTyping] = useState("");
//   const [privateRecipient, setPrivateRecipient] = useState("");
//   const [privateMessage, setPrivateMessage] = useState("");

//   const handleNicknameSubmit = (e) => {
//     e.preventDefault();
//     if (nickname.trim()) {
//       socket.emit("setNickname", nickname);
//       setIsNicknameSet(true);
//     }
//   };

//   useEffect(() => {
//     socket.on("chatMessage", (msg) => {
//       setMessages((prevMessages) => [...prevMessages, msg]);
//     });

//     socket.on("privateMessage", (msg) => {
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { nickname: msg.nickname, message: `Private: ${msg.message}` },
//       ]);
//     });

//     socket.on("typing", (nickname) => {
//       setTyping(`${nickname} is typing...`);
//     });

//     socket.on("stopTyping", () => {
//       setTyping("");
//     });

//     socket.on("onlineUsers", (users) => {
//       setOnlineUsers(users);
//     });

//     return () => {
//       socket.off("chatMessage");
//       socket.off("privateMessage");
//       socket.off("typing");
//       socket.off("stopTyping");
//       socket.off("onlineUsers");
//     };
//   }, []);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (message.trim()) {
//       const newMessage = { nickname, message };
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//       setMessage("");
//       socket.emit("chatMessage", newMessage);
//       socket.emit("stopTyping");
//     }
//   };

//   const sendPrivateMessage = (e) => {
//     e.preventDefault();
//     if (privateMessage.trim() && privateRecipient.trim()) {
//       socket.emit("privateMessage", {
//         recipient: privateRecipient,
//         message: privateMessage,
//         nickname,
//       });
//       setPrivateMessage("");
//     }
//   };

//   const handleTyping = (e) => {
//     setMessage(e.target.value);
//     if (e.target.value && !typing) {
//       socket.emit("typing", nickname);
//     }
//     if (!e.target.value) {
//       socket.emit("stopTyping");
//     }
//   };

//   return (
//     <div>
//       {!isNicknameSet ? (
//         <form onSubmit={handleNicknameSubmit}>
//           <h1>Enter your nickname</h1>
//           <input
//             type="text"
//             value={nickname}
//             onChange={(e) => setNickname(e.target.value)}
//             placeholder="Your nickname"
//             required
//             style={{ padding: "8px", fontSize: "16px" }}
//           />
//           <button
//             type="submit"
//             style={{ padding: "8px 16px", fontSize: "16px" }}
//           >
//             Join Chat
//           </button>
//         </form>
//       ) : (
//         <div>
//           <h1>Chat Room</h1>
//           <div
//             id="online-users"
//             style={{
//               marginBottom: "10px",
//               borderBottom: "1px solid #ccc",
//               paddingBottom: "10px",
//             }}
//           >
//             <h3>Online Users</h3>
//             <ul>
//               {onlineUsers.map((user, index) => (
//                 <li key={index}>{user}</li>
//               ))}
//             </ul>
//           </div>
//           <div
//             id="chat-box"
//             style={{
//               height: "300px",
//               overflowY: "scroll",
//               border: "1px solid #ccc",
//               padding: "10px",
//               marginBottom: "10px",
//             }}
//           >
//             {messages.map((msg, index) => (
//               <div key={index}>
//                 <strong>{msg.nickname}:</strong> {msg.message}
//               </div>
//             ))}
//           </div>
//           <div>{typing}</div>
//           <form onSubmit={sendMessage} style={{ display: "flex" }}>
//             <input
//               type="text"
//               value={message}
//               onChange={handleTyping}
//               placeholder="Type a message..."
//               style={{ flex: "1", padding: "8px" }}
//             />
//             <button type="submit" style={{ padding: "8px 16px" }}>
//               Send
//             </button>
//           </form>

//           <h3>Send Private Message</h3>
//           <form onSubmit={sendPrivateMessage}>
//             <input
//               type="text"
//               value={privateRecipient}
//               onChange={(e) => setPrivateRecipient(e.target.value)}
//               placeholder="Recipient's nickname"
//               style={{ padding: "8px", marginRight: "10px" }}
//             />
//             <input
//               type="text"
//               value={privateMessage}
//               onChange={(e) => setPrivateMessage(e.target.value)}
//               placeholder="Your private message"
//               style={{ padding: "8px", marginRight: "10px" }}
//             />
//             <button type="submit" style={{ padding: "8px 16px" }}>
//               Send Private Message
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
