import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const menuRef = useRef();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.setItem("currentUser", null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const [input, setInput] = useState("");
  const handleSubmit = () => {
    navigate(`/gigs?search=${input}`);
  };

  const isHome = pathname === "/";

  return (
    <div className={`navbar ${scrolled || !isHome ? "scrolled" : ""}`}>
      <div className="container">
        {/* Logo */}
        <div className="logo">
          <Link className="link" to="/">
            <span className="logo-text">
              Orbit<span className="logo-accent">to</span>
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="search">
          <div className="searchInput">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder='Search talent, skills, or services...'
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button onClick={handleSubmit}>Search</button>
          </div>
        </div>

        {/* Links */}
        <div className="links" ref={menuRef}>
          {currentUser && !currentUser.isSeller && !currentUser.isAdmin && (
            <Link to="/complete-profile" className="link become-freelancer">
              Offer Services
            </Link>
          )}

          {currentUser ? (
            <div className="user" onClick={() => setOpen(!open)}>
              <img src={currentUser.img || "/img/noavatar.jpg"} alt="" />
              <span>{currentUser?.username}</span>
              {currentUser.isAdmin && (
                <span className="admin-badge">Admin</span>
              )}
              {open && (
                <div className="options">
                  {currentUser.isAdmin ? (
                    <>
                      <Link className="link admin-panel-link" to="/admin">Admin Panel</Link>
                      <div className="options-divider" />
                      <Link className="link logout-link" onClick={handleLogout}>Logout</Link>
                    </>
                  ) : (
                    <>
                      {currentUser.isSeller && (
                        <>
                          <Link className="link" to="/mygigs">My Services</Link>
                          <Link className="link" to="/add">Post a Service</Link>
                        </>
                      )}
                      <Link className="link" to="/orders">Orders</Link>
                      <Link className="link" to="/messages">Messages</Link>
                      <Link className="link" to="/profile">Profile</Link>
                      <div className="options-divider" />
                      <Link className="link logout-link" onClick={handleLogout}>Logout</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="link sign-in">Sign in</Link>
              <Link className="link" to="/register">
                <button className="join-btn">Get Started</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;