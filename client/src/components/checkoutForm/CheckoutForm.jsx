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
          background: #46a91f;
          color: white;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          font-family: 'DM Sans', 'Montserrat', sans-serif;
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
          background: #337a16;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(70, 169, 31, 0.35);
        }

        .pay-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .pay-btn:disabled {
          background: #a1d28a;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .pay-btn-icon {
          font-size: 16px;
        }

        .pay-btn-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.4);
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
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.5;
          animation: fadeIn 0.2s ease;
        }

        .pay-message.error {
          background: #fff2f2;
          border: 1px solid #ffcdd2;
          color: #c0392b;
        }

        .pay-message.success {
          background: #f0fae8;
          border: 1px solid #c8ebb0;
          color: #2d7a10;
        }

        .pay-message.info {
          background: #f0f6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
        }

        .pay-message-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .pay-message.error .pay-message-dot   { background: #c0392b; }
        .pay-message.success .pay-message-dot { background: #2d7a10; }
        .pay-message.info .pay-message-dot    { background: #1e40af; }

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
          background: #eaeaea;
        }

        .pay-divider-text {
          font-size: 11px;
          color: #bbb;
          font-weight: 500;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
            <>
              {/* <span className="pay-btn-icon"></span> */}
              Pay Now
            </>
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