// ── EditProfile.jsx — Orbitto Dark Premium ──
import React, { useState } from "react";
import "./EditProfile.scss";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const EditProfile = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentUser?.img || null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    country: currentUser?.country || "",
    phone: currentUser?.phone || "",
    desc: currentUser?.desc || "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let imgUrl = currentUser.img;
      if (file) imgUrl = await upload(file);

      const res = await newRequest.put(`/users/${currentUser._id}`, { ...form, img: imgUrl });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => navigate("/"), 1400);
    } catch {
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ep">
      <div className="ep__glow ep__glow--1" />

      <div className="ep__inner">
        {/* Page header */}
        <div className="ep__page-header">
          <h1 className="ep__page-title">Edit Profile</h1>
          <p className="ep__page-sub">Update your personal information and preferences</p>
        </div>

        <form className="ep__form" onSubmit={handleSubmit}>
          <div className="ep__layout">

            {/* LEFT — avatar + account status */}
            <div className="ep__sidebar">
              <div className="ep__avatar-card">
                <div className="ep__avatar-wrap">
                  <img
                    src={preview || "/img/noavatar.jpg"}
                    alt="avatar"
                    className="ep__avatar-img"
                  />
                  <label className="ep__avatar-overlay" htmlFor="ep-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </label>
                  <input id="ep-avatar" type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                </div>
                <div className="ep__avatar-info">
                  <span className="ep__avatar-name">{currentUser?.username}</span>
                  <span className="ep__avatar-email">{currentUser?.email}</span>
                </div>
              </div>

              {/* Account status */}
              <div className="ep__status-card">
                <h4 className="ep__status-title">Account Status</h4>
                <div className="ep__status-row">
                  <span className="ep__status-label">Freelancer</span>
                  <span className={`ep__status-badge ${currentUser?.isSeller ? "active" : "inactive"}`}>
                    {currentUser?.isSeller ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="ep__status-row">
                  <span className="ep__status-label">Account Type</span>
                  <span className="ep__status-badge neutral">
                    {currentUser?.isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — editable fields */}
            <div className="ep__fields">
              <div className="ep__section">
                <h3 className="ep__section-title">Personal Information</h3>
                <div className="ep__grid">
                  {[
                    { name: "username", label: "Username", type: "text", placeholder: "your_username" },
                    { name: "email",    label: "Email",    type: "email", placeholder: "you@company.com" },
                    { name: "country",  label: "Country",  type: "text", placeholder: "e.g. Pakistan" },
                    { name: "phone",    label: "Phone",    type: "text", placeholder: "+92 3001234567" },
                  ].map((f) => (
                    <div className="ep__field" key={f.name}>
                      <label>{f.label}</label>
                      <input
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.name]}
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="ep__section">
                <h3 className="ep__section-title">Bio</h3>
                <div className="ep__field">
                  <label>About You</label>
                  <textarea
                    name="desc"
                    rows={5}
                    placeholder="Describe your skills and expertise…"
                    value={form.desc}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="ep__footer">
            {errorMsg && (
              <div className="ep__msg ep__msg--error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="ep__msg ep__msg--success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {successMsg}
              </div>
            )}
            <button type="submit" className="ep__btn" disabled={saving}>
              {saving ? <><span className="ep__spinner" />Saving…</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;