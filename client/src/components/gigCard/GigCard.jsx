// ── GigCard.jsx ──
import React from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const GigCard = ({ item }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["gigcard-user", item.userId],
    queryFn: () => newRequest.get(`/users/${item.userId}`).then((res) => res.data),
  });

  const avgRating = item.starNumber > 0
    ? (item.totalStars / item.starNumber).toFixed(1)
    : null;

  return (
    <Link to={`/gig/${item._id}`} className="gigCard-link">
      <div className="gigCard">
        {/* Cover image */}
        <div className="gigCard__cover">
          <img src={item.cover} alt={item.title} />
          <div className="gigCard__cat">{item.cat}</div>
        </div>

        {/* Body */}
        <div className="gigCard__body">
          {/* Seller row */}
          <div className="gigCard__seller">
            {isLoading ? (
              <div className="gigCard__avatar-skeleton" />
            ) : error ? null : (
              <>
                <img
                  src={data.img || "/img/noavatar.jpg"}
                  alt={data.username}
                  className="gigCard__avatar"
                />
                <div className="gigCard__seller-info">
                  <span className="gigCard__username">{data.username}</span>
                  {/* <span className={`gigCard__role ${data.role === "faculty" ? "faculty" : "student"}`}>
                    {data.role === "faculty" ? "Faculty" : "Student"}
                  </span> */}
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <p className="gigCard__title">{item.title}</p>

          {/* Rating */}
          {avgRating && (
            <div className="gigCard__rating">
              <img src="/img/star.png" alt="star" />
              <span className="gigCard__stars">{avgRating}</span>
              <span className="gigCard__reviews">({item.starNumber})</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="gigCard__footer">
          <span className="gigCard__starting">Starting at</span>
          <span className="gigCard__price">${item.price}</span>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;