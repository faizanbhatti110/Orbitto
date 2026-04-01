// ── CompleteProfile.jsx — Orbitto Dark Premium ──
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./CompleteProfile.scss";

function CompleteProfile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [form, setForm] = useState({
    isSeller: currentUser?.isSeller || false,
    phone: currentUser?.phone || "",
    desc: currentUser?.desc || "",
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!currentUser) { navigate("/login"); return null; }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!form.isSeller) {
      setErrorMsg("You must activate your freelancer account to continue.");
      return;
    }
    if (!form.phone.trim()) {
      setErrorMsg("Phone number is required.");
      return;
    }
    if (!form.desc.trim() || form.desc.trim().length < 20) {
      setErrorMsg(`Bio must be at least 20 characters. (${Math.max(0, 20 - form.desc.trim().length)} more needed)`);
      return;
    }

    setSaving(true);
    try {
      await newRequest.put(`/users/${currentUser._id}`, form);
      localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, ...form }));
      setSuccessMsg("Profile activated! Redirecting to post your first service…");
      setTimeout(() => navigate("/add"), 1400);
    } catch {
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const descLen = form.desc.trim().length;

  return (
    <div className="cp">
      <div className="cp__glow cp__glow--1" />
      <div className="cp__glow cp__glow--2" />

      <div className="cp__inner">
        {/* Header */}
        <div className="cp__header">
          <div className="cp__badge">Step 1 of 1</div>
          <h1 className="cp__title">Become a Service Provider</h1>
          <p className="cp__subtitle">
            Complete your profile to start offering services to your colleagues on Orbitto.
          </p>
        </div>

        <form className="cp__form" onSubmit={handleSubmit}>

          {/* Freelancer Toggle */}
          <div className="cp__card">
            <div className="cp__card-header">
              <div className="cp__card-icon">⚡</div>
              <div>
                <h3>Activate Freelancer Account</h3>
                <p>Enable this to post services and get hired within your organization</p>
              </div>
            </div>

            <div className={`cp__toggle-box ${form.isSeller ? "on" : "off"}`}>
              <div className="cp__toggle-info">
                <span className="cp__toggle-label">Freelancer Status</span>
                <span className={`cp__toggle-status ${form.isSeller ? "on" : "off"}`}>
                  {form.isSeller ? "✓ Active — you can post services after saving" : "✗ Required — turn this on to continue"}
                </span>
              </div>
              <label className="cp__switch">
                <input
                  type="checkbox"
                  checked={form.isSeller}
                  onChange={(e) => setForm((p) => ({ ...p, isSeller: e.target.checked }))}
                />
                <span className="cp__switch-slider" />
              </label>
            </div>
          </div>

          {/* Additional Info */}
          <div className="cp__card">
            <div className="cp__card-header">
              <div className="cp__card-icon">📋</div>
              <div>
                <h3>Profile Details</h3>
                <p>Help colleagues find and trust you</p>
              </div>
            </div>

            <div className="cp__field">
              <label>
                Phone Number <span className="cp__req">*</span>
              </label>
              <div className="cp__input-wrap">
                <svg className="cp__input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input
                  name="phone"
                  type="text"
                  placeholder="+92 3123456789"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="cp__field">
              <label>
                Bio / Description <span className="cp__req">*</span>
                <span className={`cp__char-count ${descLen >= 20 ? "valid" : ""}`}>
                  {descLen >= 20 ? `✓ ${descLen} chars` : `${descLen}/20 min`}
                </span>
              </label>
              <textarea
                name="desc"
                rows={5}
                placeholder="Describe your skills and what services you offer… (min. 20 characters)"
                value={form.desc}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="cp__msg cp__msg--error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="cp__msg cp__msg--success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMsg}
            </div>
          )}

          <button type="submit" className="cp__btn" disabled={saving}>
            {saving ? <><span className="cp__spinner" />Saving…</> : "Activate & Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;