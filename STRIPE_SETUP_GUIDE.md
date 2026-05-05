# Stripe Sandbox Setup Diagnostic Guide

## Symptoms
- Page refreshes when clicking "Continue to Secure Payment"
- No Stripe checkout appears
- You're redirected back to OrderForm

## Root Cause
The **VITE_STRIPE_PUBLISHABLE_KEY** is likely missing from your frontend `.env` file.

---

## Quick Fix

### Step 1: Get Your Stripe Publishable Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Look for **Publishable key** (starts with `pk_test_`)
3. Copy the entire key

### Step 2: Add to Frontend .env

Edit: `Frontend/.env`

Add this line:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_BACKEND_URI=http://localhost:3000
VITE_BACKEND_URL=http://localhost:3000
```

Replace `pk_test_YOUR_KEY_HERE` with your actual Stripe publishable key.

### Step 3: Restart Frontend Dev Server

```bash
# In the Frontend folder
npm run dev
```

Clear your browser cache (Ctrl+Shift+Delete) and refresh the page.

---

## Verify It's Working

### Check 1: Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. You should NOT see this error:
   ```
   ❌ Stripe publishable key is missing!
   ```
4. When you click "Continue to Secure Payment", the Payment component should appear

### Check 2: Network Tab
1. In DevTools, go to **Network** tab
2. Click "Continue to Secure Payment"
3. Look for a request to `/payment/create-payment-intent`
4. It should return:
   ```json
   {
     "clientSecret": "pi_test_...",
     "paymentIntentId": "pi_...",
     "status": "requires_payment_method"
   }
```

### Check 3: Stripe Component
If clientSecret loads successfully, you should see:
- A payment form labeled "Card information" or "Pay Now"
- NOT a text error message

---

## Stripe Sandbox Test Card

Once Stripe loads, use this test card:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVC**: Any 3 digits (e.g., `123`)
- **Name**: Any name

---

## If It Still Doesn't Work

### Check Backend .env
Verify `Backend/.env` has:
```env
STRIPE_API_KEY=sk_test_YOUR_SECRET_KEY
```

### Check Errors in Console
1. **Frontend Console** (Browser DevTools)
   - Look for Stripe errors
   - Look for network errors to `/payment/create-payment-intent`

2. **Backend Console** (Terminal running `npm start`)
   - Look for "Payment intent creation error" messages
   - Look for Stripe API errors

### Restart Everything
```bash
# Terminal 1 (Backend)
cd Backend
npm start

# Terminal 2 (Frontend)
cd Frontend
npm run dev
```

---

## Backend Endpoints

- **POST** `/payment/create-payment-intent` - Creates payment intent
  - Body: `{ amount: number, currency?: "usd" }`
  - Response: `{ clientSecret, paymentIntentId, status }`

- **GET** `/payment/intent/:paymentIntentId` - Check payment status

- **POST** `/payment/webhook` - Stripe webhook listener

---

## Flow Diagram

```
OrderForm (Collect Shipping Details)
    ↓
[Continue to Secure Payment Button]
    ↓
Payment Component (Fetches clientSecret)
    ↓
[API Call: POST /payment/create-payment-intent]
    ↓
CheckoutForm (Stripe Elements)
    ↓
[Stripe Payment Form Renders]
    ↓
[User enters card: 4242 4242 4242 4242]
    ↓
[Stripe Confirms Payment]
    ↓
[Backend creates order]
    ↓
Redirect to /feedback
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Page refreshes | Missing `VITE_STRIPE_PUBLISHABLE_KEY` in `.env` |
| "Loading payment form..." stays | Backend not responding or amount = 0 |
| Error: "Stripe is not defined" | Publishable key is invalid |
| Payment form won't submit | Check browser console for Stripe JS errors |

---

## Get Help

If still stuck:
1. Take a screenshot of the browser console error
2. Take a screenshot of the backend console error
3. Verify both .env files have the correct keys
