// ── Pay.jsx — Orbitto Dark Premium ──
import React, { useEffect, useState, useRef } from "react";
import "./Pay.scss";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import newRequest from "../../utils/newRequest";
import { useParams, useNavigate } from "react-router-dom";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Pay = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const makeRequest = async () => {
      try {
        const res = await newRequest.post(`/orders/create-payment-intent/${id}`);
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        const msg = err?.response?.data?.message;
        if (err?.response?.status === 403) {
          navigate(`/gig/${id}`, {
            state: { error: msg || "You cannot purchase your own service." },
          });
          return;
        }
        setError(msg || "Failed to initialize payment. Please try again.");
      }
    };

    makeRequest();
  }, [id]);

  const appearance = { theme: "stripe" };
  const options = { clientSecret, appearance };

  return (
    <div className="pay">
      <div className="pay-inner">

        {/* ── Header ── */}
        <div className="pay-header">
          <div className="pay-logo-row">
            <div className="pay-logo-dot" />
            <span>Orbitto</span>
          </div>
          <h1>Complete Your Order</h1>
          <p>Your payment is encrypted and secure</p>
        </div>

        {/* ── Main card ── */}
        <div className="pay-card">
          <div className="pay-card-header">
            <span className="pay-card-title">Payment Details</span>
            <div className="pay-card-secure">
              <div className="lock-icon" />
              SSL Secured
            </div>
          </div>
          <div className="pay-card-body">
            {error && (
              <div className="pay-error-box">
                <span className="pay-error-icon">⚠️</span>
                <p>{error}</p>
                <button className="pay-back-btn" onClick={() => navigate(-1)}>
                  Go Back
                </button>
              </div>
            )}
            {!clientSecret && !error && (
              <div className="pay-loading">
                <div className="pay-spinner" />
                <p>Preparing your checkout…</p>
              </div>
            )}
            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            )}
          </div>
        </div>

        {/* ── Trust badges ── */}
        <div className="pay-trust">
          <div className="trust-item"><div className="trust-dot" /><span>256-bit Encryption</span></div>
          <div className="trust-item"><div className="trust-dot" /><span>No hidden fees</span></div>
          <div className="trust-item"><div className="trust-dot" /><span>Secure checkout</span></div>
        </div>

        <p className="pay-stripe-note">
          Payments powered by <span>Stripe</span>
        </p>
      </div>
    </div>
  );
};

export default Pay;