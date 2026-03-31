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
      <div className="container">
        <div className="title">
          <div className="title-left">
            <h1>My Gigs</h1>
            <span className="gig-count">
              {data?.length || 0} gig{data?.length !== 1 ? "s" : ""}
            </span>
          </div>
          {currentUser?.isSeller && (
            <Link to="/add">
              <button className="add-btn">+ Add New Gig</button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="state-box">Loading your gigs…</div>
        ) : error ? (
          <div className="state-box error">Failed to load gigs.</div>
        ) : !data?.length ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <p>You haven't created any gigs yet.</p>
            {/* <Link to="/add">
              <button className="add-btn">Create Your First Gig</button>
            </Link> */}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Gig</th>
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
                      <Link to={`/gig/${gig._id}`} className="gig-cell">
                        <img src={gig.cover} alt={gig.title} className="gig-cover" />
                        <div className="gig-info">
                          <span className="gig-title">{gig.title}</span>
                          <span className="gig-desc">
                            {gig.shortDesc || gig.desc?.slice(0, 60) + "…"}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className="cat-badge">{gig.cat}</span>
                    </td>
                    <td>
                      <span className="price">${gig.price}</span>
                    </td>
                    <td>
                      <span className="sales">{gig.sales || 0}</span>
                    </td>
                    <td>
                      <span className="status-badge active">Active</span>
                    </td>
                    <td>
                      <div className="action-group">
                        <Link to={`/edit-gig/${gig._id}`}>
                          <button className="edit-btn" style={{ marginRight: "10px" }} title="Edit gig">
                            Edit
                          </button>
                        </Link>
                        <button
                          className="delete-btn"
                          onClick={() => mutation.mutate(gig._id)}
                          title="Delete gig"
                        >
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