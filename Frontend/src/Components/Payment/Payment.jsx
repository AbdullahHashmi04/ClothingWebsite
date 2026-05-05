import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './Stripe';
import CheckoutForm from './CheckoutForm';

const BACKEND_URI = (
    import.meta.env.VITE_BACKEND_URI ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
).replace(/\/+$/, "");

const Payment = ({ amount, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!BACKEND_URI) {
      setError('Backend URL is not configured. Set VITE_BACKEND_URI or VITE_BACKEND_URL.');
      return;
    }

    if (!stripePromise) {
      setError('Stripe publishable key is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY for sandbox mode.');
      return;
    }

    fetch(`${BACKEND_URI}/payment/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setError('');
        } else {
          setError(data.error || 'Unable to initialize Stripe payment intent.');
        }
      })
      .catch(() => setError('Unable to reach the payment service.'));
  }, [amount]);

  if (error) {
    return <p>{error}</p>;
  }

  return clientSecret ? (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  ) : (
    <p>Loading Payment form...</p>
  );
};

export default Payment;