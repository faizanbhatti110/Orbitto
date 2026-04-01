// ── Review.jsx ──
import { useQuery } from "@tanstack/react-query";
import React from "react";
import newRequest from "../../utils/newRequest";
import "./Review.scss";

const Review = ({ review }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: [review.userId],
    queryFn: () =>
      newRequest.get(`/users/${review.userId}`).then((res) => res.data),
  });

  return (
    <div className="reviewCard">
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "Error loading user."
      ) : (
        <div className="reviewHeader">
          <img className="avatar" src={data.img || "/img/noavatar.jpg"} alt="user" />
          <div className="userInfo">
            <span className="username">{data.username}</span>
            <div className="countryInfo">
              <span>{data.country}</span>
            </div>
          </div>
        </div>
      )}

      <div className="reviewStars">
        {Array(review.star)
          .fill()
          .map((_, i) => (
            <img src="/img/star.png" alt="star" key={i} />
          ))}
        <span>{review.star}</span>
      </div>

      <p className="reviewDesc">{review.desc}</p>

      {/* Optional helpful block (uncomment if needed)
      <div className="helpfulBlock">
        <span>Helpful?</span>
        <img src="/img/like.png" alt="like" />
        <span>Yes</span>
        <img src="/img/dislike.png" alt="dislike" />
        <span>No</span>
      </div>
      */}
    </div>
  );
};

export default Review;
