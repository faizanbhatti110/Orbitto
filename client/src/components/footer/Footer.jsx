import React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-column footer-about">
            <Link to="/" className="footer-logo-link">
              <img
                src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/logo_mxst4i.png"
                alt="CampusConnect logo"
                className="footer-logo"
              />
            </Link>
            <p className="footer-description">
              Empowering Students & Faculty with Academic and Professional Opportunities.
            </p>
            <div className="social-links">
              <a href="#"><img src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722200/1_21_lpqmh6.svg" alt="Instagram" /></a>
              <a href="#"><img src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722200/1_23_ryp0f4.svg" alt="Twitter" /></a>
              <a href="#"><img src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722200/1_25_acqwc9.svg" alt="Facebook" /></a>
            </div>
          </div>

          <div className="footer-column footer-links">
            <h3 className="footer-title">For Students</h3>
            <ul>
              <li><Link to="/gigs">Browse Gigs</Link></li>
              <li><Link to="/post">Offer Skills</Link></li>
              <li><Link to="/gigs">Hire Faculty</Link></li>
              {/* <li><Link to="/policy/refund">Refund Policy</Link></li>
              <li><Link to="/policy/privacy">Privacy Policy</Link></li> */}
            </ul>
          </div>

          <div className="footer-column footer-links">
            <h3 className="footer-title">For Faculty</h3>
            <ul>
              <li><Link to="/gigs">Hire Students</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div className="footer-column footer-contact">
            <h3 className="footer-title">Contact</h3>
            <ul>
              {/* <li className="contact-item">
                <img src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/1_11_rpmvos.svg" alt="Location" />
                <span>Karachi, Pakistan</span>
              </li> */}
              <li className="contact-item">
                <img src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722200/1_14_u7gofg.svg" alt="Phone" />
                <span>+92 300 0000000</span>
              </li>
              <li className="contact-item">
                <img src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722200/1_17_dqx92i.svg" alt="Email" />
                <span>support@campusconnect.pk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} CampusConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
