// ── Success.jsx — Orbitto Dark Premium ──
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Success.scss";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const hasCalled = useRef(false);
  const [error, setError] = useState(null);

  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");
  const redirect_status = params.get("redirect_status");

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    if (redirect_status !== "succeeded") {
      setError(`Payment status: ${redirect_status}. Order not confirmed.`);
      return;
    }

    if (!payment_intent) {
      setError("No payment reference found in URL.");
      return;
    }

    const makeRequest = async () => {
      try {
        await newRequest.put("/orders", { payment_intent });
        window.history.replaceState({}, document.title, "/success");
        setTimeout(() => navigate("/orders"), 3500);
      } catch (err) {
        setError(err.response?.data || "Failed to confirm order. Please check your orders page.");
      }
    };

    makeRequest();
  }, []);

  return (
    <div className="success">
      {error ? (
        <div className="success-card success-card--error">
          <div className="success-icon">⚠️</div>
          <h2>Order Confirmation Issue</h2>
          <p>{String(error)}</p>
          <p className="success-note">
            Your payment may have gone through. Check your orders page or contact support.
          </p>
          <a href="/orders" className="success-btn">Go to Orders</a>
        </div>
      ) : (
        <div className="success-card">
          <div className="success-glow" />
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Confirming your order… you'll be redirected shortly.</p>
          <p className="success-note">Please do not close this page.</p>
          <div className="success-spinner" />
        </div>
      )}
    </div>
  );
};

export default Success;