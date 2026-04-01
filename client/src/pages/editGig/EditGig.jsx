// ── EditGig.jsx — Orbitto Dark Premium ──
import React, { useReducer, useState, useEffect } from "react";
import "./EditGig.scss";
import { gigReducer } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate, useParams } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const EMPTY_STATE = {
  userId: "", title: "", cat: "", cover: "", images: [],
  desc: "", shortTitle: "", shortDesc: "",
  deliveryTime: 0, revisionNumber: 0, features: [], price: 0,
};

const EditGig = () => {
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [singleFile, setSingleFile] = useState(undefined);
  const [coverPreview, setCoverPreview] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [state, dispatch] = useReducer(gigReducer, EMPTY_STATE);

  const { isLoading, error, data: gig } = useQuery({
    queryKey: ["editGig", id],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
    staleTime: 0,
    cacheTime: 0,
  });

  useEffect(() => {
    setInitialized(false);
    setSingleFile(undefined);
    setCoverPreview(null);
    setFiles([]);
    setErrorMsg("");
    setSuccessMsg("");
  }, [id]);

  useEffect(() => {
    if (gig && !initialized) {
      dispatch({ type: "SET_ALL", payload: gig });
      setInitialized(true);
    }
  }, [gig, initialized]);

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
    mutationFn: (updatedGig) => newRequest.put(`/gigs/${id}`, updatedGig),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      queryClient.removeQueries(["editGig", id]);
      setSuccessMsg("Service updated! Redirecting…");
      setTimeout(() => navigate("/myGigs"), 1400);
    },
    onError: () => {
      setErrorMsg("Failed to update service. Please try again.");
      setSubmitting(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    if (!state.title || !state.desc || !state.price ||
        !state.shortTitle || !state.shortDesc ||
        !state.deliveryTime || !state.revisionNumber) {
      setErrorMsg("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const cover = singleFile ? await upload(singleFile) : state.cover;
      const images = files.length > 0
        ? await Promise.all([...files].map((f) => upload(f)))
        : state.images;
      mutation.mutate({ ...state, cover, images });
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="editGig editGig--state">
      <div className="editGig__spinner" />
      <p>Loading service…</p>
    </div>
  );

  if (error) return (
    <div className="editGig editGig--state editGig--error">
      <span>⚠️</span>
      <p>Failed to load service.</p>
    </div>
  );

  return (
    <div className="editGig">
      <div className="editGig__glow" />

      <div className="editGig__inner">
        {/* Header */}
        <div className="editGig__header">
          <h1 className="editGig__title">Edit Service</h1>
          <p className="editGig__subtitle">Update your service details below</p>
        </div>

        <div className="editGig__grid">
          {/* ── LEFT ── */}
          <div className="editGig__col">
            <div className="editGig__card">
              <h3 className="editGig__card-title">Basic Info</h3>

              <div className="editGig__field">
                <label>Service Title <span className="editGig__req">*</span></label>
                <input name="title" type="text" value={state.title} onChange={handleChange} />
              </div>

              <div className="editGig__field">
                <label>
                  Category
                  <span className="editGig__locked-tag">locked</span>
                </label>
                <input type="text" value={state.cat} disabled className="editGig__locked-input" />
              </div>

              <div className="editGig__field">
                <label>Full Description <span className="editGig__req">*</span></label>
                <textarea name="desc" rows={6} value={state.desc} onChange={handleChange} />
              </div>
            </div>

            <div className="editGig__card">
              <h3 className="editGig__card-title">Media</h3>

              <div className="editGig__field">
                <label>Cover Image
                  <span className="editGig__hint">leave empty to keep current</span>
                </label>
                <label className="editGig__file-drop" htmlFor="eg-cover">
                  {coverPreview || state.cover ? (
                    <img src={coverPreview || state.cover} alt="cover" className="editGig__cover-preview" />
                  ) : (
                    <div className="editGig__file-placeholder">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Click to change cover</span>
                    </div>
                  )}
                </label>
                <input id="eg-cover" type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverFile} />
              </div>

              <div className="editGig__field">
                <label>Additional Images
                  <span className="editGig__hint">leave empty to keep current</span>
                </label>
                {state.images?.length > 0 && (
                  <div className="editGig__thumb-row">
                    {state.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="editGig__thumb" />
                    ))}
                  </div>
                )}
                <label className="editGig__file-drop editGig__file-drop--small" htmlFor="eg-images">
                  <div className="editGig__file-placeholder">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{files.length > 0 ? `${files.length} new file(s) selected` : "Upload new images"}</span>
                  </div>
                </label>
                <input id="eg-images" type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => setFiles(e.target.files)} />
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="editGig__col">
            <div className="editGig__card">
              <h3 className="editGig__card-title">Service Details</h3>

              <div className="editGig__field">
                <label>Short Title <span className="editGig__req">*</span></label>
                <input name="shortTitle" type="text" value={state.shortTitle} onChange={handleChange} />
              </div>

              <div className="editGig__field">
                <label>Short Description <span className="editGig__req">*</span></label>
                <textarea name="shortDesc" rows={4} value={state.shortDesc} onChange={handleChange} />
              </div>

              <div className="editGig__field-row">
                <div className="editGig__field">
                  <label>Delivery (days) <span className="editGig__req">*</span></label>
                  <input name="deliveryTime" type="number" min="1" value={state.deliveryTime} onChange={handleChange} />
                </div>
                <div className="editGig__field">
                  <label>Revisions <span className="editGig__req">*</span></label>
                  <input name="revisionNumber" type="number" min="0" value={state.revisionNumber} onChange={handleChange} />
                </div>
              </div>

              <div className="editGig__field">
                <label>Price (USD) <span className="editGig__req">*</span></label>
                <div className="editGig__price-wrap">
                  <span className="editGig__price-symbol">$</span>
                  <input name="price" type="number" min="1" value={state.price} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="editGig__card">
              <h3 className="editGig__card-title">Features</h3>

              <form className="editGig__feature-form" onSubmit={handleFeature}>
                <input type="text" placeholder="e.g. Source files included" />
                <button type="submit">Add</button>
              </form>

              {state?.features?.length > 0 && (
                <div className="editGig__features-list">
                  {state.features.map((f) => (
                    <div className="editGig__feature-tag" key={f}>
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
        <div className="editGig__footer">
          {errorMsg && (
            <div className="editGig__msg editGig__msg--error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="editGig__msg editGig__msg--success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMsg}
            </div>
          )}
          <button
            className="editGig__submit"
            onClick={handleSubmit}
            disabled={submitting || mutation.isPending}
          >
            {submitting || mutation.isPending
              ? <><span className="editGig__spinner-btn" />Saving…</>
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGig;