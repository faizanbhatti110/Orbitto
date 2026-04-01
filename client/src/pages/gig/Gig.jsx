// Gig.jsx
import React from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import { useNavigate } from "react-router-dom";

function Gig() {
  const { id } = useParams();
  const location = useLocation();
  const redirectError = location.state?.error || null;

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  });

  const userId = data?.userId;
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isOwnGig = currentUser && data && data.userId === currentUser._id;
  const navigate = useNavigate();

  const handleContact = async () => {
    if (isOwnGig) return;
    try {
      const res = await newRequest.post("/conversations", { to: dataUser._id });
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      if (err?.response?.status === 403) {
        alert(err.response.data.message || "You cannot message yourself.");
      } else {
        console.error("Failed to start conversation:", err);
      }
    }
  };

  const { isLoading: isLoadingUser, error: errorUser, data: dataUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => newRequest.get(`/users/${userId}`).then((res) => res.data),
    enabled: !!userId,
  });

  const avgRating = data?.starNumber > 0
    ? Math.round(data.totalStars / data.starNumber)
    : 0;

  if (isLoading) return <div className="gig-loading"><div className="spinner" /></div>;
  if (error) return <div className="gig-error">Something went wrong loading this gig.</div>;

  return (
    <div className="gigPage">
      <div className="gig-layout">

        {/* ── LEFT COLUMN ── */}
        <div className="gig-left">

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/gigs">Gigs</Link>
            <span>/</span>
            <span>{data.cat}</span>
          </div>

          {/* Title + seller */}
          <div className="gig-title-block">
            <h1>{data.title}</h1>
            {!isLoadingUser && !errorUser && dataUser && (
              <div className="seller-pill">
                <img src={dataUser.img || "/img/noavatar.jpg"} alt={dataUser.username} />
                <span className="seller-name">{dataUser.username}</span>
                {avgRating > 0 && (
                  <div className="rating-inline">
                    {Array.from({ length: avgRating }).map((_, i) => (
                      <img src="/img/star.png" alt="star" key={i} className="star" />
                    ))}
                    <span>{avgRating}.0</span>
                  </div>
                )}
                {/* <span className={`role-tag ${dataUser.role === "faculty" ? "faculty" : "student"}`}>
                  {dataUser.role === "faculty" ? "Faculty" : "Student"}
                </span> */}
              </div>
            )}
          </div>

          {/* Image slider */}
          <div className="gig-slider">
            <Slider slidesToShow={1} arrowsScroll={1}>
              {data.images.map((img) => (
                <img key={img} src={img} alt="gig" />
              ))}
            </Slider>
          </div>

          {/* Description */}
          <div className="gig-section">
            <h2 className="section-title">About This Gig</h2>
            <p className="gig-desc">{data.desc}</p>
          </div>

          {/* What's included */}
          <div className="gig-section">
            <h2 className="section-title">What's Included</h2>
            <div className="inclusions-grid">
              <div className="inclusion-item">
                <img src="/img/clock.png" alt="" />
                <div>
                  <span className="inc-label">Delivery Time</span>
                  <span className="inc-value">{data.deliveryTime} Day{data.deliveryTime > 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="inclusion-item">
                <img src="/img/recycle.png" alt="" />
                <div>
                  <span className="inc-label">Revisions</span>
                  <span className="inc-value">{data.revisionNumber}</span>
                </div>
              </div>
              {data.features.map((feature) => (
                <div className="inclusion-item feature" key={feature}>
                  <img src="/img/greencheck.png" alt="" />
                  <span className="inc-value">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* About seller */}
          {!isLoadingUser && !errorUser && dataUser && (
            <div className="gig-section seller-section">
              <h2 className="section-title">About the Seller</h2>
              <div className="seller-card">
                <img
                  src={dataUser.img || "/img/noavatar.jpg"}
                  alt={dataUser.username}
                  className="seller-avatar"
                />
                <div className="seller-card-info">
                  <div className="seller-card-top">
                    <span className="seller-card-name">{dataUser.username}</span>
                    {/* <span className={`role-tag ${dataUser.role === "faculty" ? "faculty" : "student"}`}>
                      {dataUser.role === "faculty" ? "Faculty" : "Student"}
                    </span> */}
                  </div>
                  {avgRating > 0 && (
                    <div className="rating-inline">
                      {Array.from({ length: avgRating }).map((_, i) => (
                        <img src="/img/star.png" alt="star" key={i} className="star" />
                      ))}
                      <span>{avgRating}.0</span>
                    </div>
                  )}
                  <div className="seller-meta">
                    <div className="meta-item">
                      <span className="meta-label">From</span>
                      <span className="meta-value">{dataUser.country}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Member since</span>
                      <span className="meta-value">
                        {dataUser.createdAt
                          ? new Date(dataUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Languages</span>
                      <span className="meta-value">English</span>
                    </div>
                  </div>
                  {dataUser.desc && <p className="seller-bio">{dataUser.desc}</p>}
                  {!isOwnGig && (
                    <button className="contact-btn" onClick={handleContact}>
                      Contact Seller
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="gig-section">
            <Reviews gigId={id} />
          </div>
        </div>

        {/* ── RIGHT COLUMN: sticky purchase card ── */}
        <div className="gig-right">
          <div className="purchase-card">
            <div className="purchase-card-header">
              <h3>{data.shortTitle}</h3>
              <div className="purchase-price">
                <span className="currency">$</span>
                <span className="amount">{data.price}</span>
              </div>
            </div>

            <p className="purchase-desc">{data.shortDesc}</p>

            <div className="purchase-meta">
              <div className="purchase-meta-item">
                <img src="/img/clock.png" alt="" />
                <span>{data.deliveryTime}-day delivery</span>
              </div>
              <div className="purchase-meta-item">
                <img src="/img/recycle.png" alt="" />
                <span>{data.revisionNumber} revision{data.revisionNumber !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="purchase-features">
              {data.features.map((f) => (
                <div className="purchase-feature-item" key={f}>
                  <img src="/img/greencheck.png" alt="" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {redirectError && (
              <div className="purchase-own-error">⚠️ {redirectError}</div>
            )}

            {isOwnGig ? (
              <button className="continue-btn continue-btn--disabled" disabled>
                This is your gig
              </button>
            ) : (
              <Link to={`/pay/${id}`}>
                <button className="continue-btn">Continue — ${data.price}</button>
              </Link>
            )}

            <p className="purchase-note">You won't be charged yet</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Gig;