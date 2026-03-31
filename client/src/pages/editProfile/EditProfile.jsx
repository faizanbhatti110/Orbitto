import React, { useState } from "react";
import "./EditProfile.scss";
import upload from "../../utils/upload";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const EditProfile = () => {

    const currentUser = getCurrentUser();
    const navigate = useNavigate();

    const [file, setFile] = useState(null)

    const [form, setForm] = useState({
        username: currentUser.username,
        email: currentUser.email,
        country: currentUser.country,
        phone: currentUser.phone || "",
        desc: currentUser.desc || ""
    })

    const [saving, setSaving] = useState(false)

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {

            let imgUrl = currentUser.img

            if (file) {
                imgUrl = await upload(file)
            }

            const res = await newRequest.put(`/users/${currentUser._id}`, {
                ...form,
                img: imgUrl
            })

            localStorage.setItem("currentUser", JSON.stringify(res.data))
            navigate("/profile")

        } catch (err) {
            console.log(err)
        }

        setSaving(false)
    }

    return (
        <div className="editProfile">
            <div className="container">

                <h1>Profile</h1>

                <div className="sections">

                    {/* LEFT */}
                    <div className="info">

                        <label>Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                        />

                        <label>Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <label>Country</label>
                        <input
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                        />

                        <label>Profile Image</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                        />

                    </div>

                    {/* RIGHT */}
                    <div className="details">

                        <label>Phone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        <label>Bio</label>
                        <textarea
                            rows="6"
                            name="desc"
                            value={form.desc}
                            onChange={handleChange}
                        />

                        <label>Role</label>
                        <input value={currentUser.role} disabled />

                        <label>Freelancer Account</label>
                        <input value={currentUser.isSeller ? "Active" : "Inactive"} disabled />

                    </div>

                </div>

                <div className="formFooter">
                    <button
                        className="submitBtn"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? "Updating..." : "Update Profile"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditProfile;