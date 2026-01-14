# 💰 Stripe Setup Guide for VoiceGlow

This guide will help you set up Stripe payments for VoiceGlow.

---

## 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a new account
3. Complete verification (or use Test Mode for development)

---

## 2. Get API Keys

### Development (Test Mode)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
2. Click **Developers** → **API keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Production

1. **Enable your account** (complete verification)
2. Switch to **Live mode** (toggle in top right)
3. Get **Live API keys** (starts with `pk_live_` and `sk_live_`)

---

## 3. Configure Environment Variables

Create `.env.local` file:

```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**⚠️ Important**: Never commit `.env.local` to Git!

---

## 4. Set Up Webhooks (For Production)

Webhooks allow Stripe to notify your app when payments complete.

### Development (Using Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # Windows (with Scoop)
   scoop install stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add to `.env.local`

### Production (Vercel)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your deployment URL:
   ```
   https://yourdomain.com/api/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Vercel environment variables:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET
   ```

---

## 5. Test the Integration

### Test Cards

Use these test card numbers in Test Mode:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Decline (insufficient funds) |
| `4000 0082 6000 0000` | 3D Secure required |

- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Testing Flow

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Complete a voice analysis

3. On result page, click **"Unlock for $4.99"**

4. Use test card `4242 4242 4242 4242`

5. Complete checkout

6. Verify:
   - Redirected to result page with `?payment=success`
   - OTO modal appears
   - Roast is unlocked

---

## 6. Deploy to Production

### Vercel Deployment

1. **Add environment variables** to Vercel:
   ```bash
   vercel env add STRIPE_SECRET_KEY
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  
   vercel env add STRIPE_WEBHOOK_SECRET
   vercel env add NEXT_PUBLIC_BASE_URL
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set up webhook** (see step 4)

4. **Switch to Live Mode** keys once ready for real payments

---

## 7. Pricing Configuration

Current prices are hardcoded in `src/app/api/checkout/route.ts`:

```typescript
const amount = isVault ? 1000 : 499; // $10.00 or $4.99
```

To change prices, modify these values:
- `1000` = $10.00 (in cents)
- `499` = $4.99 (in cents)

---

## 8. Monitoring & Analytics

### Stripe Dashboard

- **Payments**: [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
- **Customers**: [https://dashboard.stripe.com/customers](https://dashboard.stripe.com/customers)
- **Revenue**: Auto-calculated in dashboard

### Key Metrics to Track

- **Conversion Rate**: (Payments / Total Results) × 100
- **OTO Acceptance**: (Vault purchases after unlock) / (Unlock purchases)
- **Average Order Value**: Total revenue / Number of orders

---

## 9. Security Best Practices

1. ✅ **Never expose Secret Key** - only use on server
2. ✅ **Always verify webhook signatures** (already implemented)
3. ✅ **Use HTTPS in production** (Vercel handles this)
4. ✅ **Keep Stripe.js updated**: `npm update @stripe/stripe-js`
5. ✅ **Monitor for suspicious activity** in Stripe Dashboard

---

## 10. Troubleshooting

### "No Stripe key provided"
- Check `.env.local` exists
- Restart dev server after adding env vars

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- In dev, use `stripe listen --forward-to localhost:3000/api/webhook`

### "Payment succeeded but result not updated"
- Check Firestore rules allow writes
- Check webhook is receiving events (Stripe Dashboard → Webhooks → Logs)

### "OTO modal not showing"
- Clear URL params: `?payment=success&type=unlock` (not `&type=vault`)
- Check browser console for errors

---

## 📊 Expected Revenue (Sample)

| Metric | Value |
|--------|-------|
| **Monthly Visitors** | 10,000 |
| **Conversion to Unlock ($4.99)** | 5% = 500 | 
| **OTO Acceptance ($10)** | 20% = 100 |
| **Monthly Revenue** | $2,495 + $1,000 = **$3,495** |

**Annual Revenue**: ~$42,000

---

## ✅ Setup Checklist

- [ ] Stripe account created
- [ ] Test API keys added to `.env.local`
- [ ] Stripe CLI installed (for local testing)
- [ ] Webhook endpoint configured
- [ ] Test purchase completed successfully
- [ ] OTO modal tested
- [ ] Production keys ready
- [ ] Vercel env vars configured
- [ ] Production webhook set up
- [ ] Legal pages updated (Terms, Privacy)

---

**Next Steps**: Test the full flow locally, then deploy to Vercel with production keys when ready!
