import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(" frontned Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        },
        {
          withCredentials: true, 
        }
      );

      setSuccessMessage(response.data.message);
      setError(""); 
      setEmail("");
      setPassword("");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message); 
      } else {
        setError("An error occurred while registering the user.");
      }
      setSuccessMessage(""); 
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={login}>
        {error && <h2 style={{ color: "red" }}>{error}</h2>}
        {successMessage && <h2 style={{ color: "green" }}>{successMessage}</h2>}

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Login;
