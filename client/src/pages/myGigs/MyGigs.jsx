// ── MyGigs.jsx — Orbitto Dark Premium ──
import React from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyGigs() {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs", currentUser?._id],
    queryFn: () =>
      newRequest
        .get(`/gigs?userId=${currentUser?._id}`)
        .then((res) => res.data.gigs),
    enabled: !!currentUser?._id,
  });

  const mutation = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["myGigs"]),
  });

  return (
    <div className="myGigs">
      <div className="myGigs__glow" />

      <div className="myGigs__inner">
        {/* Header */}
        <div className="myGigs__header">
          <div className="myGigs__header-left">
            <h1 className="myGigs__title">My Services</h1>
            {data?.length > 0 && (
              <span className="myGigs__count">{data.length} service{data.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          {currentUser?.isSeller && (
            <Link to="/add">
              <button className="myGigs__add-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Service
              </button>
            </Link>
          )}
        </div>

        {/* States */}
        {isLoading ? (
          <div className="myGigs__state">
            <div className="myGigs__spinner" />
            <p>Loading your services…</p>
          </div>
        ) : error ? (
          <div className="myGigs__state myGigs__state--error">
            <span>⚠️</span>
            <p>Failed to load services. Please refresh.</p>
          </div>
        ) : !data?.length ? (
          <div className="myGigs__empty">
            <div className="myGigs__empty-icon">🚀</div>
            <h3>No services yet</h3>
            <p>Create your first service and start getting hired by your colleagues.</p>
            <Link to="/add">
              <button className="myGigs__add-btn">Create First Service</button>
            </Link>
          </div>
        ) : (
          <div className="myGigs__table-wrap">
            <table className="myGigs__table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Sales</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((gig) => (
                  <tr key={gig._id}>
                    <td>
                      <Link to={`/gig/${gig._id}`} className="myGigs__gig-cell">
                        <img src={gig.cover} alt={gig.title} className="myGigs__cover" />
                        <div className="myGigs__gig-info">
                          <span className="myGigs__gig-title">{gig.title}</span>
                          <span className="myGigs__gig-desc">
                            {gig.shortDesc || gig.desc?.slice(0, 55) + "…"}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className="myGigs__cat-badge">{gig.cat}</span>
                    </td>
                    <td>
                      <span className="myGigs__price">${gig.price}</span>
                    </td>
                    <td>
                      <span className="myGigs__sales">{gig.sales || 0}</span>
                    </td>
                    <td>
                      <span className="myGigs__status">Active</span>
                    </td>
                    <td>
                      <div className="myGigs__actions">
                        <Link to={`/edit-gig/${gig._id}`}>
                          <button className="myGigs__edit-btn">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                        </Link>
                        <button
                          className="myGigs__delete-btn"
                          onClick={() => mutation.mutate(gig._id)}
                          disabled={mutation.isPending}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGigs;