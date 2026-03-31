import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuRef = useRef();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

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

  // Returns the role label shown next to username
  const getRoleLabel = (user) => {
    if (!user || user.isAdmin) return null;
    if (user.isSeller) {
      // return user.role === "faculty" ? "🎓 Faculty Freelancer" : "💼 Freelancer";
    }
    // return user.role === "faculty" ? "🎓 Faculty" : "👨‍🎓 Student";
  };

  const roleLabel = getRoleLabel(currentUser);

  return (
    <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>
      <div className="container">
        <div className="logo">
          <Link className="link" to="/">
            <img
              src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753722199/logo_mxst4i.png"
              alt="CampusConnect Logo"
              className="logo"
            />
          </Link>
        </div>

        <div className="search">
          <div className="searchInput">
            <img
              src="https://res.cloudinary.com/ddfridpi7/image/upload/v1753723647/search_bwgfin.png"
              alt=""
            />
            <input
              type="text"
              placeholder='Try "Campus Coders, Designers & More"'
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSubmit}>Search</button>
          </div>
        </div>

        <div className="links" ref={menuRef}>
          {/* Show "Become a Freelancer" only for logged-in non-freelancer non-admin users */}
          {currentUser && !currentUser.isSeller && !currentUser.isAdmin && (
            <Link to="/complete-profile" className="link become-freelancer">
              Become a Freelancer
            </Link>
          )}

          {currentUser ? (
            <div className="user" onClick={() => setOpen(!open)}>
              <img src={currentUser.img || "/img/noavatar.jpg"} alt="" />
              <span>{currentUser?.username}</span>

              {/* Admin badge OR role badge */}
              {currentUser.isAdmin ? (
                <span className="admin-badge">Admin</span>
              ) : (
                roleLabel && <span className="role-badge">{roleLabel}</span>
              )}

              {open && (
                <div className="options">
                  {/* ── Admin: only Admin Panel + Logout ── */}
                  {currentUser.isAdmin ? (
                    <>
                      <Link className="link admin-panel-link" to="/admin">
                        {/* <span className="option-icon">⚡</span> */}
                        Admin Panel
                      </Link>
                      <div className="options-divider" />
                      <Link className="link logout-link" onClick={handleLogout}>
                        {/* <span className="option-icon">🚪</span> */}
                        Logout
                      </Link>
                    </>
                  ) : (
                    /* ── Regular user ── */
                    <>
                      {currentUser.isSeller && (
                        <>
                          <Link className="link" to="/mygigs">Gigs</Link>
                          <Link className="link" to="/add">Add New Gig</Link>
                        </>
                      )}
                      {/* Show Complete Profile for non-freelancers */}
                      {/* {!currentUser.isSeller && (
                        <Link className="link" to="/complete-profile">
                          Complete Profile
                        </Link>
                      )} */}
                      <Link className="link" to="/orders">Orders</Link>
                      <Link className="link" to="/messages">Messages</Link>
                      <Link className="link" to="/profile">Profile</Link>
                      <Link className="link" onClick={handleLogout}>Logout</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="link">Sign in</Link>
              <Link className="link" to="/register">
                <button>Join</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;