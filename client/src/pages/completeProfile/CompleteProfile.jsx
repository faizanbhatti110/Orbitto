import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./CompleteProfile.scss";

function CompleteProfile() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const [form, setForm] = useState({
        role: currentUser?.role || "student",
        isSeller: currentUser?.isSeller || false,
        phone: currentUser?.phone || "",
        desc: currentUser?.desc || "",
    });

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    if (!currentUser) {
        navigate("/login");
        return null;
    }

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRole = (role) => {
        setForm((prev) => ({ ...prev, role }));
    };

    const handleSeller = (e) => {
        setForm((prev) => ({ ...prev, isSeller: e.target.checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        // ── All fields required ──
        if (!form.role) {
            setErrorMsg("Please select your role — Student or Faculty.");
            return;
        }

        // Freelancer toggle MUST be on to submit this form
        if (!form.isSeller) {
            setErrorMsg("You must activate your Freelancer account to continue.");
            return;
        }

        if (!form.phone.trim()) {
            setErrorMsg("Phone number is required.");
            return;
        }

        if (!form.desc.trim()) {
            setErrorMsg("Bio / Description is required.");
            return;
        }

        if (form.desc.trim().length < 20) {
            setErrorMsg("Bio must be at least 20 characters.");
            return;
        }

        setSaving(true);

        try {
            await newRequest.put(`/users/${currentUser._id}`, form);
            localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, ...form }));
            setSuccessMsg("✅ Profile updated! Redirecting to create your first gig…");
            setTimeout(() => navigate("/add"), 1500);
        } catch (err) {
            setErrorMsg("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="completeProfile">
            <form onSubmit={handleSubmit}>
                <div className="cp-header">
                    <h1>Become a Freelancer</h1>
                    <p>Complete all details below to activate your freelancer account</p>
                    <div className="cp-required-note">
                        All fields marked <span className="required">*</span> are required
                    </div>
                </div>

                <div className="cp-card">
                    {/* ── Role Selection ── */}
                    <div className="cp-section">
                        <h2>I am a… <span className="required">*</span></h2>
                        <p className="cp-hint">Select the role that best describes you</p>
                        <div className="roleSelector">
                            <div
                                className={`roleCard ${form.role === "student" ? "active" : ""}`}
                                onClick={() => handleRole("student")}
                            >
                                <span className="roleEmoji">👨‍🎓</span>
                                <h3>Student</h3>
                                <p>Offering skills and services as a student</p>
                            </div>
                            <div
                                className={`roleCard ${form.role === "faculty" ? "active" : ""}`}
                                onClick={() => handleRole("faculty")}
                            >
                                <span className="roleEmoji">🎓</span>
                                <h3>Faculty</h3>
                                <p>Offering academic or research expertise</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Freelancer Toggle ── */}
                    <div className="cp-section">
                        <h2>Activate Freelancer Account <span className="required">*</span></h2>
                        <p className="cp-hint">Must be turned on to submit this form</p>
                        <div className={`toggleSwitch ${form.isSeller ? "toggle-on" : "toggle-off"}`}>
                            <div className="toggle-label-group">
                                <label>Freelancer Account</label>
                                <span className={`toggle-status ${form.isSeller ? "status-on" : "status-off"}`}>
                                    {form.isSeller
                                        ? "✓ Active — you can post gigs after saving"
                                        : "✗ Required — please turn this on to continue"}
                                </span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={form.isSeller}
                                    onChange={handleSeller}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    {/* ── Additional Info ── */}
                    <div className="cp-section">
                        <h2>Additional Info</h2>

                        <label>
                            Phone Number <span className="required">*</span>
                        </label>
                        <input
                            name="phone"
                            type="text"
                            placeholder="+92 3123456789"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        <label>
                            Bio / Description <span className="required">*</span>
                            <span className="char-count">
                                {form.desc.length} chars{" "}
                                {form.desc.length >= 20 ? "✓" : `(${20 - form.desc.length} more needed)`}
                            </span>
                        </label>
                        <textarea
                            name="desc"
                            rows="5"
                            placeholder="Describe your skills, expertise, or what you offer… (min. 20 characters)"
                            value={form.desc}
                            onChange={handleChange}
                        />
                    </div>

                    {errorMsg && <p className="error-message">{errorMsg}</p>}
                    {successMsg && <p className="success-message">{successMsg}</p>}

                    <button type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Activate & Continue"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CompleteProfile;