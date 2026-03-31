import React, { useReducer, useState, useEffect } from "react";
import "./EditGig.scss";
import { gigReducer } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate, useParams } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const EMPTY_STATE = {
    userId: "",
    title: "",
    cat: "",
    cover: "",
    images: [],
    desc: "",
    shortTitle: "",
    shortDesc: "",
    deliveryTime: 0,
    revisionNumber: 0,
    features: [],
    price: 0,
};

const EditGig = () => {
    const { id } = useParams();
    const currentUser = getCurrentUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [singleFile, setSingleFile] = useState(undefined);
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [initialized, setInitialized] = useState(false);

    // Always start with a clean empty state — never inherit stale state
    const [state, dispatch] = useReducer(gigReducer, EMPTY_STATE);

    const { isLoading, error, data: gig } = useQuery({
        queryKey: ["editGig", id],
        queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
        staleTime: 0,       // always refetch fresh on mount
        cacheTime: 0,       // don't cache between edits
    });

    // Populate fields ONCE when gig loads — reset initialized on id change
    useEffect(() => {
        setInitialized(false);
        setSingleFile(undefined);
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
        mutationFn: (updatedGig) => newRequest.put(`/gigs/${id}`, updatedGig),
        onSuccess: () => {
            queryClient.invalidateQueries(["myGigs"]);
            queryClient.removeQueries(["editGig", id]);
            setSuccessMsg("✅ Gig updated successfully!");
            setTimeout(() => navigate("/myGigs"), 1500);
        },
        onError: () => {
            setErrorMsg("❌ Failed to update gig. Please try again.");
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
        } catch (err) {
            console.error("Upload error:", err);
            setErrorMsg("❌ Upload failed. Please try again.");
            setSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="editGig">
            <div className="container"><p className="state-msg">Loading gig…</p></div>
        </div>
    );
    if (error) return (
        <div className="editGig">
            <div className="container"><p className="state-msg error">Failed to load gig.</p></div>
        </div>
    );

    return (
        <div className="editGig">
            <div className="container">
                <div className="page-header">
                    <h1>Edit Gig</h1>
                    {/* <span className="locked-notice">Category cannot be changed after creation</span> */}
                </div>

                <div className="sections">
                    {/* ── Left ── */}
                    <div className="info">
                        <label>Title <span className="req">*</span></label>
                        <input
                            name="title"
                            type="text"
                            value={state.title}
                            onChange={handleChange}
                        />

                        <label>
                            Category
                            <span className="locked-label"> — locked</span>
                        </label>
                        <input
                            type="text"
                            value={state.cat}
                            disabled
                            className="locked-input"
                        />

                        <div className="images">
                            <div className="imagesInputs">
                                <label>Cover Image <span className="req-note">leave empty to keep current</span></label>
                                {state.cover && (
                                    <img src={state.cover} alt="cover" className="preview-cover" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSingleFile(e.target.files[0])}
                                />

                                <label>Additional Images <span className="req-note">leave empty to keep current</span></label>
                                {state.images?.length > 0 && (
                                    <div className="preview-images-row">
                                        {state.images.map((img, i) => (
                                            <img key={i} src={img} alt="" className="preview-thumb" />
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setFiles(e.target.files)}
                                />
                            </div>
                        </div>

                        <label>Description <span className="req">*</span></label>
                        <textarea
                            name="desc"
                            rows="8"
                            value={state.desc}
                            onChange={handleChange}
                        />
                    </div>

                    {/* ── Right ── */}
                    <div className="details">
                        <label>Service Title <span className="req">*</span></label>
                        <input
                            type="text"
                            name="shortTitle"
                            value={state.shortTitle}
                            onChange={handleChange}
                        />

                        <label>Short Description <span className="req">*</span></label>
                        <textarea
                            name="shortDesc"
                            rows="5"
                            value={state.shortDesc}
                            onChange={handleChange}
                        />

                        <label>Delivery Time (days) <span className="req">*</span></label>
                        <input
                            type="number"
                            name="deliveryTime"
                            min="1"
                            value={state.deliveryTime}
                            onChange={handleChange}
                        />

                        <label>Revision Number <span className="req">*</span></label>
                        <input
                            type="number"
                            name="revisionNumber"
                            min="0"
                            value={state.revisionNumber}
                            onChange={handleChange}
                        />

                        <label>Features</label>
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
                        <input
                            type="number"
                            name="price"
                            min="1"
                            value={state.price}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="formFooter">
                    {errorMsg && <p className="error-message">{errorMsg}</p>}
                    {successMsg && <p className="success-message">{successMsg}</p>}
                    <button
                        className="submitBtn"
                        onClick={handleSubmit}
                        disabled={submitting || mutation.isPending}
                    >
                        {submitting || mutation.isPending ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditGig;