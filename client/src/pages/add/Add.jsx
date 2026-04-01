// ── Add.jsx — Orbitto Dark Premium ──
import React, { useReducer, useState } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const CATEGORIES = [
  "Programming & Tech",
  "Video & Animation",
  "Graphics & Design",
  "Business",
  "Consulting",
  "Digital Marketing",
  "Writing & Translation",
  "Data & Analytics",
  "Music & Audio",
];

const Add = () => {
  const currentUser = getCurrentUser();
  const [singleFile, setSingleFile] = useState(undefined);
  const [coverPreview, setCoverPreview] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    dispatch({ type: "CHANGE_INPUT", payload: { name: e.target.name, value: e.target.value } });
  };

  const handleCoverFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setSingleFile(f);
    setCoverPreview(URL.createObjectURL(f));
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
      setSuccessMsg("Service created successfully! Redirecting…");
      setTimeout(() => navigate("/myGigs"), 1400);
    },
    onError: () => setErrorMsg("Failed to create service. Please try again."),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    if (!currentUser?._id) {
      setErrorMsg("You must be logged in.");
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
      const images = await Promise.all([...files].map((f) => upload(f)));
      mutation.mutate({ ...state, userId: currentUser._id, cover, images });
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="addGig">
      <div className="addGig__glow addGig__glow--1" />
      <div className="addGig__glow addGig__glow--2" />

      <div className="addGig__inner">
        {/* Header */}
        <div className="addGig__header">
          <h1 className="addGig__title">Post a New Service</h1>
          <p className="addGig__subtitle">Fill in the details below to list your service on Orbitto</p>
        </div>

        <div className="addGig__grid">
          {/* ── LEFT column ── */}
          <div className="addGig__col">
            <div className="addGig__card">
              <h3 className="addGig__card-title">Basic Info</h3>

              <div className="addGig__field">
                <label>Service Title <span className="addGig__req">*</span></label>
                <input name="title" type="text" placeholder="e.g. I will build your React web app" onChange={handleChange} />
              </div>

              <div className="addGig__field">
                <label>Category <span className="addGig__req">*</span></label>
                <select name="cat" onChange={handleChange} defaultValue="">
                  <option value="" disabled>Select a category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="addGig__field">
                <label>Full Description <span className="addGig__req">*</span></label>
                <textarea name="desc" rows={6} placeholder="Describe your service in detail — what you'll deliver, your process, requirements…" onChange={handleChange} />
              </div>
            </div>

            {/* Images */}
            <div className="addGig__card">
              <h3 className="addGig__card-title">Media</h3>

              <div className="addGig__field">
                <label>Cover Image <span className="addGig__req">*</span></label>
                <label className="addGig__file-drop" htmlFor="cover-upload">
                  {coverPreview ? (
                    <img src={coverPreview} alt="cover" className="addGig__cover-preview" />
                  ) : (
                    <div className="addGig__file-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Click to upload cover image</span>
                      <small>PNG, JPG, WEBP recommended</small>
                    </div>
                  )}
                </label>
                <input id="cover-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverFile} />
              </div>

              <div className="addGig__field">
                <label>Additional Images <span className="addGig__req">*</span>
                  <span className="addGig__hint">Select multiple</span>
                </label>
                <label className="addGig__file-drop addGig__file-drop--small" htmlFor="images-upload">
                  <div className="addGig__file-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{files.length > 0 ? `${files.length} file(s) selected` : "Upload additional images"}</span>
                  </div>
                </label>
                <input id="images-upload" type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => setFiles(e.target.files)} />
              </div>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div className="addGig__col">
            <div className="addGig__card">
              <h3 className="addGig__card-title">Service Details</h3>

              <div className="addGig__field">
                <label>Short Title <span className="addGig__req">*</span></label>
                <input name="shortTitle" type="text" placeholder="e.g. Full-stack web application" onChange={handleChange} />
              </div>

              <div className="addGig__field">
                <label>Short Description <span className="addGig__req">*</span></label>
                <textarea name="shortDesc" rows={4} placeholder="Brief summary shown on your service card…" onChange={handleChange} />
              </div>

              <div className="addGig__field-row">
                <div className="addGig__field">
                  <label>Delivery (days) <span className="addGig__req">*</span></label>
                  <input name="deliveryTime" type="number" min="1" placeholder="3" onChange={handleChange} />
                </div>
                <div className="addGig__field">
                  <label>Revisions <span className="addGig__req">*</span></label>
                  <input name="revisionNumber" type="number" min="0" placeholder="2" onChange={handleChange} />
                </div>
              </div>

              <div className="addGig__field">
                <label>Price (USD) <span className="addGig__req">*</span></label>
                <div className="addGig__price-wrap">
                  <span className="addGig__price-symbol">$</span>
                  <input name="price" type="number" min="1" placeholder="25" onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="addGig__card">
              <h3 className="addGig__card-title">Features / Inclusions</h3>
              <p className="addGig__card-sub">List what's included in this service</p>

              <form className="addGig__feature-form" onSubmit={handleFeature}>
                <input type="text" placeholder="e.g. Source files included" />
                <button type="submit">Add</button>
              </form>

              {state?.features?.length > 0 && (
                <div className="addGig__features-list">
                  {state.features.map((f) => (
                    <div className="addGig__feature-tag" key={f}>
                      <span>{f}</span>
                      <button type="button" onClick={() => dispatch({ type: "REMOVE_FEATURE", payload: f })}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="addGig__footer">
          {errorMsg && (
            <div className="addGig__msg addGig__msg--error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="addGig__msg addGig__msg--success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMsg}
            </div>
          )}
          <button
            className="addGig__submit"
            onClick={handleSubmit}
            disabled={submitting || mutation.isPending}
          >
            {submitting || mutation.isPending
              ? <><span className="addGig__spinner" />Publishing…</>
              : "Publish Service"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Add;