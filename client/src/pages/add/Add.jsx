import React, { useReducer, useState } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const CATEGORIES = [
  { value: "Programming & Tech", label: "Programming & Tech" },
  { value: "Video & Animation", label: "Video & Animation" },
  { value: "Graphics & Design", label: "Graphics & Design" },
  { value: "Business", label: "Business" },
  { value: "Tutoring", label: "Tutoring" },
  { value: "Digital Marketing", label: "Digital Marketing" },
  { value: "Writing & Translation", label: "Writing & Translation" },
  { value: "Music & Audio", label: "Music & Audio" },
];

const Add = () => {
  const currentUser = getCurrentUser();
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };

  const handleFeature = (e) => {
    e.preventDefault();
    const val = e.target[0].value.trim();
    if (val) {
      dispatch({ type: "ADD_FEATURE", payload: val });
      e.target[0].value = "";
    }
  };

  const mutation = useMutation({
    mutationFn: (gig) => newRequest.post("/gigs", gig),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      setSuccessMsg("✅ Gig created successfully!");
      setTimeout(() => navigate("/myGigs"), 1500);
    },
    onError: () => {
      setErrorMsg("❌ Failed to create gig. Please try again.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    if (!currentUser || !currentUser._id) {
      setErrorMsg("You must be logged in to create a gig.");
      setSubmitting(false);
      return;
    }

    if (!state.title || !state.desc || !state.price || !state.cat ||
      !state.shortTitle || !state.shortDesc || !state.deliveryTime || !state.revisionNumber) {
      setErrorMsg("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    if (!singleFile || files.length === 0) {
      setErrorMsg("Please select a cover image and at least one additional image.");
      setSubmitting(false);
      return;
    }

    try {
      const cover = await upload(singleFile);
      const images = await Promise.all([...files].map((file) => upload(file)));
      mutation.mutate({ ...state, userId: currentUser._id, cover, images });
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("❌ Something went wrong during upload. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="add">
      <div className="container">
        <h1>Add New Gig</h1>

        <div className="sections">
          {/* ── Left: Main Info ── */}
          <div className="info">
            <label>Title <span className="req">*</span></label>
            <input name="title" type="text" placeholder="e.g. I will design your logo" onChange={handleChange} />

            <label>Category <span className="req">*</span></label>
            <select name="cat" onChange={handleChange} defaultValue="">
              <option value="" disabled>Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <div className="images">
              <div className="imagesInputs">
                <label>Cover Image <span className="req">*</span></label>
                <input type="file" accept="image/*" onChange={(e) => setSingleFile(e.target.files[0])} />
                <label>Additional Images <span className="req">*</span></label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
              </div>
            </div>

            <label>Description <span className="req">*</span></label>
            <textarea name="desc" rows="8" placeholder="Describe your gig in detail" onChange={handleChange} />
          </div>

          {/* ── Right: Details ── */}
          <div className="details">
            <label>Service Title <span className="req">*</span></label>
            <input type="text" name="shortTitle" placeholder="e.g. One-page website" onChange={handleChange} />

            <label>Short Description <span className="req">*</span></label>
            <textarea name="shortDesc" rows="5" placeholder="Brief summary of what you offer" onChange={handleChange} />

            <label>Delivery Time (days) <span className="req">*</span></label>
            <input type="number" name="deliveryTime" min="1" placeholder="e.g. 3" onChange={handleChange} />

            <label>Revision Number <span className="req">*</span></label>
            <input type="number" name="revisionNumber" min="0" placeholder="e.g. 2" onChange={handleChange} />

            <label>Add Features</label>
            {/* ── renamed from "add" to "featureForm" to avoid class conflict ── */}
            <form className="featureForm" onSubmit={handleFeature}>
              <input type="text" placeholder="e.g. Source file included" />
              <button type="submit">Add</button>
            </form>
            <div className="addedFeatures">
              {state?.features?.map((f) => (
                <div className="item" key={f}>
                  <button type="button" onClick={() => dispatch({ type: "REMOVE_FEATURE", payload: f })}>
                    {f} <span>X</span>
                  </button>
                </div>
              ))}
            </div>

            <label>Price (USD) <span className="req">*</span></label>
            <input type="number" name="price" min="1" placeholder="e.g. 25" onChange={handleChange} />
          </div>
        </div>

        <div className="formFooter">
          {errorMsg && <p className="error-message">{errorMsg}</p>}
          {successMsg && <p className="success-message">{successMsg}</p>}
          <button className="submitBtn" onClick={handleSubmit} disabled={submitting || mutation.isPending}>
            {submitting || mutation.isPending ? "Creating…" : "Create Gig"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Add;