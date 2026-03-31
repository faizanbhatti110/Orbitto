import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

function Register() {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    img: "",
    country: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!user.username || !user.email || !user.password || !user.country) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    try {
      const url = file ? await upload(file) : "";
      await newRequest.post("/auth/register", { ...user, img: url });
      setSuccessMsg("✅ Registration successful! You can now log in.");
    } catch (err) {
      const serverMessage = err.response?.data;
      if (typeof serverMessage === "string") {
        if (serverMessage.includes("duplicate key") && serverMessage.includes("username")) {
          setErrorMsg("Username already exists. Please choose another.");
        } else if (serverMessage.includes("duplicate key") && serverMessage.includes("email")) {
          setErrorMsg("Email already exists. Please use a different email.");
        } else {
          setErrorMsg(serverMessage);
        }
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="registerModern">
      <form onSubmit={handleSubmit}>
        <h1>Join CampusConnect</h1>
        <div className="formGrid">
          <div className="card">
            <h2>General Information</h2>
            <label>Username</label>
            <input name="username" type="text" placeholder="e.g. ali_student" onChange={handleChange} />
            <label>Email</label>
            <input name="email" type="email" placeholder="your@email.com" onChange={handleChange} />
            <label>Password</label>
            <input name="password" type="password" placeholder="********" onChange={handleChange} />
            <label>Profile Picture</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <label>Country</label>
            <input name="country" type="text" placeholder="Pakistan" onChange={handleChange} />
          </div>
        </div>

        {errorMsg && <p className="error-message">{errorMsg}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default Register;