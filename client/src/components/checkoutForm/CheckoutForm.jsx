// ── CheckoutForm.jsx — Orbitto Dark Premium ──
import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );
    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          setMessageType("success");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          setMessageType("info");
          break;
        case "requires_payment_method":
          setMessage("Payment was not successful. Please try again.");
          setMessageType("error");
          break;
        default:
          setMessage("Something went wrong.");
          setMessageType("error");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173/success",
      },
    });

    if (error?.type === "card_error" || error?.type === "validation_error") {
      setMessage(error.message);
      setMessageType("error");
    } else if (error) {
      setMessage("An unexpected error occurred.");
      setMessageType("error");
    }

    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pay-btn {
          width: 100%;
          padding: 15px;
          margin-top: 8px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: white;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }

        .pay-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .pay-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(124, 58, 237, 0.4);
        }

        .pay-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .pay-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .pay-btn-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: checkoutSpin 0.75s linear infinite;
          flex-shrink: 0;
        }

        @keyframes checkoutSpin {
          to { transform: rotate(360deg); }
        }

        .pay-message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.5;
          animation: fadeIn 0.2s ease;
        }

        .pay-message.error {
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.2);
          color: #fca5a5;
        }

        .pay-message.success {
          background: rgba(52, 211, 153, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.2);
          color: #6ee7b7;
        }

        .pay-message.info {
          background: rgba(167, 139, 250, 0.08);
          border: 1px solid rgba(167, 139, 250, 0.2);
          color: #c4b5fd;
        }

        .pay-message-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }

        .pay-message.error   .pay-message-dot { background: #f87171; }
        .pay-message.success .pay-message-dot { background: #34d399; }
        .pay-message.info    .pay-message-dot { background: #a78bfa; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pay-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }

        .pay-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
        }

        .pay-divider-text {
          font-size: 11px;
          color: rgba(240, 238, 255, 0.35);
          font-weight: 600;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <LinkAuthenticationElement id="link-authentication-element" />

        <div className="pay-divider">
          <div className="pay-divider-line" />
          <span className="pay-divider-text">Card Details</span>
          <div className="pay-divider-line" />
        </div>

        <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

        <button
          className="pay-btn"
          disabled={isLoading || !stripe || !elements}
          type="submit"
        >
          {isLoading ? (
            <>
              <div className="pay-btn-spinner" />
              Processing…
            </>
          ) : (
            <>Pay Now</>
          )}
        </button>

        {message && (
          <div className={`pay-message ${messageType}`}>
            <div className="pay-message-dot" />
            {message}
          </div>
        )}
      </form>
    </>
  );
};

export default CheckoutForm;