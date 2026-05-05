import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/feedback`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(`Payment failed: ${error.message}`);
        setLoading(false);
        return;
      }

      // Payment succeeded
      if (paymentIntent?.status === 'succeeded') {
        setMessage('Payment successful! Creating your order...');
        setIsSuccess(true);

        // Call the onSuccess callback (which creates the order in DB and redirects to /feedback)
        if (onSuccess) {
          try {
            await onSuccess();
            // The onSuccess handler will navigate to /feedback after order is created
          } catch (orderError) {
            setMessage('Payment succeeded, but order creation failed. Please contact support.');
            setIsSuccess(false);
            setLoading(false);
          }
        }
      } else if (paymentIntent?.status === 'requires_action') {
        setMessage('Payment requires additional authentication. Please complete the verification.');
        setLoading(false);
      } else {
        setMessage(`Unexpected payment status: ${paymentIntent?.status}`);
        setLoading(false);
      }
    } catch (err) {
      setMessage(`An unexpected error occurred: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="stripe-checkout">
      <PaymentElement />
      <div className='flex w-170 justify-end'>
      <button  disabled={!stripe || loading} type="button" onClick={handleSubmit} className='font-bold rounded-3xl
      bg-gradient-to-br from-purple-600 to-pink-500 text-white w-25 h-10'>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
        </div>
      {message && (
        <p style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
          color: isSuccess ? '#155724' : '#721c24',
          border: `1px solid ${isSuccess ? '#c3e6cb' : '#f5c6cb'}`,
        }}>
          {message}
        </p>
      )}
    </div>
  );
};


export default CheckoutForm;