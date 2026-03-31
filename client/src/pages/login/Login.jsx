import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username || !password) {
      setErrorMsg("Please fill in both username and password.");
      return;
    }

    try {
      const res = await newRequest.post("/auth/login", { username, password });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      setSuccessMsg("✅ Login successful. Redirecting...");
      
      setTimeout(() => {
        navigate("/");
      }, 1500); // Optional delay for UX
    } catch (err) {
      console.error(err);

      const message = err.response?.data;

      if (typeof message === "string") {
        if (message.toLowerCase().includes("user not found")) {
          setErrorMsg("❌ User not found. Please check your username.");
        } else if (message.toLowerCase().includes("wrong password")) {
          setErrorMsg("❌ Incorrect password. Please try again.");
        } else {
          setErrorMsg(`❌ ${message}`);
        }
      } else {
        setErrorMsg("❌ Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>

        <div className="group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="icon">
            <circle strokeWidth="1.5" stroke="#1C274C" r="4" cy="6" cx="10"></circle>
            <path strokeLinecap="round" strokeWidth="1.5" stroke="#1C274C" d="M21 10H19M19 10H17M19 10L19 8M19 10L19 12"></path>
            <path strokeLinecap="round" strokeWidth="1.5" stroke="#1C274C" d="M17.9975 18C18 17.8358 18 17.669 18 17.5C18 15.0147 14.4183 13 10 13C5.58172 13 2 15.0147 2 17.5C2 19.9853 2 22 10 22C12.231 22 13.8398 21.8433 15 21.5634"></path>
          </svg>
          <input
            className="input"
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="group">
          <svg stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="icon" strokeLinejoin="round" strokeLinecap="round">
            <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path>
          </svg>
          <input
            className="input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Login</button>

        {/* Error and success messages */}
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}
      </form>
    </div>
  );
}

export default Login;
