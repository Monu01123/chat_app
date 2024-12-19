import { useState } from "react";

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
