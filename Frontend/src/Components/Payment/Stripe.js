import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
  '';

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error(
    '❌ Stripe publishable key is missing! Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.\n' +
    'Get your key from: https://dashboard.stripe.com/apikeys'
  );
}

export const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;