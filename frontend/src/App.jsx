import { useState } from "react";
import io from "socket.io-client";

function App() {
  const socket = io();
  const [message, setMessage] = useState("");
  
  return (
    <>
      <h1>App</h1>
    </>
  );
}

export default App;
