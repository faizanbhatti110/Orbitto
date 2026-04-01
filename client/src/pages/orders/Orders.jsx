// ── Orders.jsx — Orbitto Dark Premium ──
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Orders.scss";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const Orders = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: () => newRequest.get(`/orders`).then((res) => res.data),
  });

  const handleContact = async (order) => {
    const sellerId = order.sellerId;
    const buyerId = order.buyerId;
    const id = sellerId + buyerId;
    try {
      const res = await newRequest.get(`/conversations/single/${id}`);
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      if (err.response.status === 404) {
        const res = await newRequest.post(`/conversations/`, {
          to: currentUser.isSeller ? buyerId : sellerId,
        });
        navigate(`/message/${res.data.id}`);
      }
    }
  };

  if (isLoading) return (
    <div className="orders">
      <div className="orders__state">
        <div className="orders__spinner" />
        <p>Loading your orders…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="orders">
      <div className="orders__state orders__state--error">
        <span>⚠️</span>
        <p>Failed to load orders. Please refresh.</p>
      </div>
    </div>
  );

  return (
    <div className="orders">
      <div className="container">
        <div className="title">
          <h1>Orders</h1>
          {data?.length > 0 && (
            <span className="orders__count">
              {data.length} order{data.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {data?.length === 0 ? (
          <div className="orders__empty">
            <div className="orders__empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Orders you place or receive will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {data.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <img className="image" src={order.img} alt={order.title} />
                    </td>
                    <td className="order-title">{order.title}</td>
                    <td>
                      <span className="order-price">${order.price}</span>
                    </td>
                    <td>
                      <button
                        className="contact-btn"
                        onClick={() => handleContact(order)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Message
                      </button>
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
};

export default Orders;