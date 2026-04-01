// ── Register.jsx — Orbitto Dark Premium ──
import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!user.username || !user.email || !user.password || !user.country) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const url = file ? await upload(file) : "";
      await newRequest.post("/auth/register", { ...user, img: url });
      setSuccessMsg("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const serverMessage = err.response?.data;
      if (typeof serverMessage === "string") {
        if (serverMessage.includes("duplicate key") && serverMessage.includes("username")) {
          setErrorMsg("Username already taken. Please choose another.");
        } else if (serverMessage.includes("duplicate key") && serverMessage.includes("email")) {
          setErrorMsg("Email already registered. Try logging in instead.");
        } else {
          setErrorMsg(serverMessage);
        }
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "username", label: "Username", type: "text", placeholder: "e.g. john_doe", icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )},
    { name: "email", label: "Email Address", type: "email", placeholder: "you@company.com", icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    )},
    { name: "password", label: "Password", type: "password", placeholder: "Min. 8 characters", icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    )},
    { name: "country", label: "Country", type: "text", placeholder: "e.g. Pakistan", icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    )},
  ];

  return (
    <div className="register">
      <div className="register__glow register__glow--1" />
      <div className="register__glow register__glow--2" />

      <div className="register__card">
        {/* Header */}
        <div className="register__header">
          <Link to="/" className="register__logo">Orbit<span>to</span></Link>
          <h1 className="register__title">Create your account</h1>
          <p className="register__subtitle">Join your organization's talent network</p>
        </div>

        {/* Avatar upload */}
        <div className="register__avatar-section">
          <label className="register__avatar-label" htmlFor="avatar-upload">
            {preview ? (
              <img src={preview} alt="preview" className="register__avatar-preview" />
            ) : (
              <div className="register__avatar-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Upload photo</span>
              </div>
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <p className="register__avatar-hint">Optional profile picture</p>
        </div>

        {/* Form */}
        <form className="register__form" onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div className="register__field" key={f.name}>
              <label>{f.label} <span className="register__req">*</span></label>
              <div className="register__input-wrap">
                <span className="register__input-icon">{f.icon}</span>
                <input
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  onChange={handleChange}
                  autoComplete={f.name}
                />
              </div>
            </div>
          ))}

          {errorMsg && (
            <div className="register__msg register__msg--error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="register__msg register__msg--success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMsg}
            </div>
          )}

          <button type="submit" className="register__btn" disabled={loading}>
            {loading ? <><span className="register__spinner" />Creating account…</> : "Create Account"}
          </button>
        </form>

        <p className="register__footer">
          Already have an account?{" "}
          <Link to="/login" className="register__footer-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;