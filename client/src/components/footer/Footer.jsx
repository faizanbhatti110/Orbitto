// ── Footer.jsx — Orbitto Dark Premium ──
import React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="footer-container">
        <div className="footer-main">

          {/* Brand column */}
          <div className="footer-column footer-about">
            <Link to="/" className="footer-logo-link">
              <span className="footer-logo-text">
                Orbit<span className="footer-logo-accent">to</span>
              </span>
            </Link>
            <p className="footer-description">
              The internal talent marketplace for modern organizations.
              Hire trusted colleagues. Offer your skills. Grow together.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Instagram" className="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* For Hirers */}
          <div className="footer-column">
            <h3 className="footer-title">For Hirers</h3>
            <ul>
              <li><Link to="/gigs">Browse Services</Link></li>
              <li><Link to="/gigs">Find Talent</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div className="footer-column">
            <h3 className="footer-title">For Professionals</h3>
            <ul>
              <li><Link to="/complete-profile">Offer a Service</Link></li>
              <li><Link to="/register">Join Orbitto</Link></li>
              <li><Link to="/orders">Manage Orders</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column footer-contact">
            <h3 className="footer-title">Contact</h3>
            <ul>
              <li className="contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>+92 300 0000000</span>
              </li>
              <li className="contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>support@orbitto.io</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom__left">
            <p>&copy; {new Date().getFullYear()} Orbitto. All rights reserved.</p>
          </div>
          <div className="footer-bottom__right">
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;