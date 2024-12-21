import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const register = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!fullname || !email || !password) {
      setError(" frontned Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        fullname,
        email,
        password,
      });

      // If registration is successful
      setSuccessMessage(response.data.message);
      setError(""); // Clear error if registration is successful

      // Clear input fields
      setFullName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      // Handle errors from the backend
      if (error.response) {
        setError(error.response.data.message); // Show the error from backend
      } else {
        setError("An error occurred while registering the user.");
      }
      setSuccessMessage(""); // Clear success message if there's an error
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={register}>
        {error && <h2 style={{ color: "red" }}>{error}</h2>}
        {successMessage && <h2 style={{ color: "green" }}>{successMessage}</h2>}

        <div>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            placeholder="Enter your full name"
            value={fullname}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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

export default Register;
