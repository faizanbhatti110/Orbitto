import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";

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

    console.log("Success page - payment_intent:", payment_intent);
    console.log("Success page - redirect_status:", redirect_status);

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
        const res = await newRequest.put("/orders", { payment_intent });
        console.log("confirmOrder response:", res.data);
        // Clear the URL params so stale intent can't be reused on back-navigation
        window.history.replaceState({}, document.title, "/success");
        setTimeout(() => navigate("/orders"), 3000);
      } catch (err) {
        console.error("confirmOrder failed:", err.response?.status, err.response?.data || err.message);
        setError(err.response?.data || "Failed to confirm order. Check console.");
      }
    };

    makeRequest();
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Montserrat, sans-serif" }}>
      {error ? (
        <>
          <h2 style={{ color: "#e53e3e" }}>Order Confirmation Issue</h2>
          <p style={{ color: "#666" }}>{String(error)}</p>
          <p style={{ color: "#999", fontSize: "13px" }}>
            Your payment may have gone through. Check your orders page or contact support.
          </p>
          <a href="/orders" style={{ color: "#46a91f", fontWeight: 600 }}>Go to Orders</a>
        </>
      ) : (
        <>
          <h2 style={{ color: "#46a91f" }}>Payment Successful!</h2>
          <p>Confirming your order… You will be redirected shortly.</p>
          <p style={{ color: "#999", fontSize: "13px" }}>Please do not close this page.</p>
        </>
      )}
    </div>
  );
};

export default Success;