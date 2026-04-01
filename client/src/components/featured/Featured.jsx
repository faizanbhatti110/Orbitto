// ── Featured.jsx — Orbitto Dark Premium Hero ──
import React, { useState } from "react";
import "./Featured.scss";
import { useNavigate } from "react-router-dom";

function Featured() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(`/gigs?search=${input}`);
  };

  const stats = [
    { value: "10K+", label: "Professionals" },
    { value: "500+", label: "Organizations" },
    { value: "98%", label: "Satisfaction" },
  ];

  const tags = ["Development", "Design", "Marketing", "Research", "Data & AI"];

  return (
    <div className="featured">
      {/* Background effects */}
      <div className="bg-glow bg-glow--1" />
      <div className="bg-glow bg-glow--2" />
      <div className="bg-grid" />

      <div className="container">
        <div className="hero-content">
          {/* Badge */}
          {/* <div className="hero-badge">
            <span className="badge-dot" />
            Internal Talent Marketplace
          </div> */}

          {/* Headline */}
          <h1 className="hero-title">
            Discover Talent
            <br />
            <span className="hero-title--accent">Within Your Organization</span>
          </h1>

          <p className="hero-subtitle">
            Orbitto connects professionals inside your organization — hire trusted
            colleagues for projects, offer your skills, and grow together.
          </p>

          {/* Search */}
          {/* <div className="hero-search">
            <div className="search-wrap">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder='Try "React Developer, UI Designer..."'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button onClick={handleSubmit}>Search</button>
            </div>
          </div> */}

          {/* Popular tags */}
          <div className="hero-tags">
            <span className="tags-label">Popular:</span>
            {tags.map((tag) => (
              <button
                key={tag}
                className="tag-btn"
                onClick={() => navigate(`/gigs?search=${tag}`)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {stats.map((s, i) => (
            <div className="stat-card" key={i}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Featured;