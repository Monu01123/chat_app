import React, { useState } from "react";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Chat from "./chat.jsx";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <>
          <Register />
          <Login setUser={setUser} />
        </>
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
}

export default App;
