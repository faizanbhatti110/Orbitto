import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import newRequest from "../../utils/newRequest";
import Review from "../review/Review";
import "./Reviews.scss";

const Reviews = ({ gigId }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["reviews", gigId],
    queryFn: () => newRequest.get(`/reviews/${gigId}`).then((res) => res.data),
  });

  const { data: gigData } = useQuery({
    queryKey: ["gig-owner", gigId],
    queryFn: () => newRequest.get(`/gigs/single/${gigId}`).then((res) => res.data),
  });

  const isOwnGig = currentUser && gigData && gigData.userId === currentUser._id;

  const mutation = useMutation({
    mutationFn: (review) => newRequest.post("/reviews", review),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      setSubmitError(null);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to submit review.";
      setSubmitError(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!currentUser) { setSubmitError("Please log in to leave a review."); return; }
    if (isOwnGig) { setSubmitError("You cannot review your own gig."); return; }

    const desc = e.target[0].value.trim();
    const star = Number(e.target[1].value);

    if (!desc) { setSubmitError("Please write something before submitting."); return; }

    mutation.mutate({ gigId, desc, star, userId: currentUser._id });
    e.target.reset();
  };

  return (
    <div className="reviews">
      <h2>Reviews</h2>

      {isLoading ? (
        <p className="reviews-loading">Loading reviews…</p>
      ) : error ? (
        <p className="reviews-error">Something went wrong loading reviews.</p>
      ) : data.length === 0 ? (
        <p className="reviews-empty">No reviews yet. Be the first!</p>
      ) : (
        data.map((review) => <Review key={review._id} review={review} />)
      )}

      {/* ── Add a review ── */}
      <div className="add">
        <h3>Add a Review</h3>

        {isOwnGig ? (
          <p className="add-blocked">You cannot review your own gig.</p>
        ) : !currentUser ? (
          <p className="add-blocked">Please log in to leave a review.</p>
        ) : (
          <>
            {submitError && <p className="add-error">{submitError}</p>}
            {submitSuccess && <p className="add-success">✓ Review submitted successfully!</p>}

            <form className="addForm" onSubmit={handleSubmit}>
              <textarea
                placeholder="Share your experience with this gig…"
                required
                rows={5}
              />

              <div className="rating-row">
                <p>Select Rating</p>
                <select name="star" defaultValue={5}>
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={mutation.isLoading}>
                  {mutation.isLoading ? "Sending…" : "Submit Review"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;