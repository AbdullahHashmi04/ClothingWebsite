import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import Stripe from 'stripe';

// Initialize Stripe with sandbox secret key
const stripeSecretKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('⚠️  Warning: STRIPE_API_KEY or STRIPE_SECRET_KEY not found in environment. Payment endpoints will fail.');
}

const stripe = new Stripe(process.env.STRIPE_API_KEY);

const app = express.Router();

// Raw body needed for webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));

// Middleware to parse JSON for other routes
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount. Amount must be a positive number.',
      });
    }

    if (typeof amount !== 'number') {
      return res.status(400).json({
        error: 'Invalid amount type. Amount must be a number.',
      });
    }

    // Convert to cents (Stripe expects smallest currency unit)
    const amountInCents = Math.round(amount * 100);


    // Create payment intent with metadata for order tracking
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        environment: 'sandbox',
      },
    });


    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('❌ Payment intent creation error:', error.message);
    return res.status(500).json({
      error: `Failed to create payment intent: ${error.message}`,
      code: error.code,
    });
  }
});

/**
 * Retrieve Payment Intent Status
 * GET /payment/intent/:paymentIntentId
 */
app.get('/intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    console.error('❌ Error retrieving payment intent:', error.message);
    return res.status(500).json({
      error: `Failed to retrieve payment intent: ${error.message}`,
    });
  }
});


app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not configured. Webhook signature verification skipped.');
    let event = req.body;

    if (typeof event === 'string') {
      try {
        event = JSON.parse(event);
      } catch (err) {
        return res.status(400).send(`Invalid JSON: ${err.message}`);
      }
    }

    return handleWebhookEvent(event, res);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  return handleWebhookEvent(event, res);
});

function handleWebhookEvent(event, res) {

  switch (event.type) {
    case 'payment_intent.succeeded':
      break;

    case 'payment_intent.payment_failed':
      break;

    case 'payment_intent.canceled':
      break;

    case 'charge.failed':
      break;

    default:
  }

  res.json({ received: true });
}

export default app;
