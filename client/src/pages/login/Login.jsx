// ── Login.jsx — Orbitto Dark Premium ──
import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!username || !password) {
      setErrorMsg("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await newRequest.post("/auth/login", { username, password });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      setSuccessMsg("Login successful! Redirecting…");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const message = err.response?.data;
      if (typeof message === "string") {
        if (message.toLowerCase().includes("user not found")) {
          setErrorMsg("No account found with that username.");
        } else if (message.toLowerCase().includes("wrong password")) {
          setErrorMsg("Incorrect password. Please try again.");
        } else {
          setErrorMsg(message);
        }
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__glow login__glow--1" />
      <div className="login__glow login__glow--2" />

      <div className="login__card">
        <div className="login__header">
          <Link to="/" className="login__logo">Orbit<span>to</span></Link>
          <h1 className="login__title">Welcome back</h1>
          <p className="login__subtitle">Sign in to your Orbitto account</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label>Username</label>
            <div className="login__input-wrap">
              <svg className="login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login__field">
            <label>Password</label>
            <div className="login__input-wrap">
              <svg className="login__input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="login__toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="login__msg login__msg--error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="login__msg login__msg--success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMsg}
            </div>
          )}

          <button type="submit" className="login__btn" disabled={loading}>
            {loading ? <><span className="login__spinner" />Signing in…</> : "Sign In"}
          </button>
        </form>

        <p className="login__footer">
          Don't have an account?{" "}
          <Link to="/register" className="login__footer-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;