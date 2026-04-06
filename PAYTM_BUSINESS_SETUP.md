# 🎯 PAYTM BUSINESS INTEGRATION GUIDE

## ✅ STEP 1: CREATE PAYTM BUSINESS ACCOUNT

### 1.1 Sign Up for Paytm Business
1. Go to: **https://dashboard.paytm.com**
2. Click **"Sign Up"** button
3. Enter your **mobile number**
4. Complete the OTP verification
5. Fill in your business details:
   - Business name: "Vibely"
   - Business type: Technology/SaaS
   - Business address
   - Tax ID (optional for testing)
6. Complete KYC verification

### 1.2 Dashboard Access
Once approved, you'll have access to:
- **Paytm Business Dashboard**
- **Payment Settings**
- **API Keys**
- **Transaction Reports**

---

## 📋 STEP 2: GET PAYTM API CREDENTIALS

### 2.1 Navigate to API Settings
1. Login to **Paytm Dashboard**: https://dashboard.paytm.com
2. Go to **Settings** (sidebar) → **API Keys / Onboarding**
3. You'll see your credentials:

| Credential | Where to Find | Example |
|-----------|-------------|---------|
| **Merchant ID (MID)** | Settings → API Keys | `999988881234567` |
| **Merchant Key** | Settings → API Keys | `aBcDeFgHiJkLmNoP` |
| **Website Name** | Settings → Configuration | `WEBSTAGING` or `DEFAULT` |
| **Channel ID** | Settings → Configuration | `WEB` |

### 2.2 Copy Your Credentials
```
PAYTM_MID = 999988881234567          (from dashboard)
PAYTM_MERCHANT_KEY = aBcDeFgHiJkLmNoP (from dashboard)
PAYTM_WEBSITE = WEBSTAGING            (or DEFAULT)
PAYTM_CHANNEL_ID = WEB
```

---

## 🔄 STEP 3: PAYMENT MODES ENABLED IN PAYTM BUSINESS

Your Paytm Business account automatically supports ALL payment methods:

✅ **Credit Cards** (Visa, Mastercard, American Express)  
✅ **Debit Cards** (all banks)  
✅ **UPI** (Google Pay, PhonePe, BHIM, WhatsApp Pay)  
✅ **Net Banking** (all banks)  
✅ **Digital Wallets** (Paytm Wallet, Others)  
✅ **EMI Options**  
✅ **Prepaid Instruments**  

**No additional configuration needed** - all payment modes are enabled by default in Business account.

---

## 🌐 STEP 4: ENVIRONMENT VARIABLES SETUP

### 4.1 For Local Development

Open your `.env.local` file and add:

```env
# ============================================
# PAYTM BUSINESS CONFIGURATION (REQUIRED)
# ============================================
PAYTM_MID=999988881234567
PAYTM_MERCHANT_KEY=aBcDeFgHiJkLmNoP
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CHANNEL_ID=WEB
PAYTM_ENV=staging

# ============================================
# NEXTAUTH CONFIGURATION (REQUIRED)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here

# ============================================
# DATABASE (REQUIRED)
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster

# ============================================
# GOOGLE OAUTH (OPTIONAL)
# ============================================
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 4.2 Generate NEXTAUTH_SECRET

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` value.

### 4.3 Verify .env.local

Your project now has:
- ✅ Only Paytm credentials
- ✅ Removed Razorpay keys
- ✅ Removed PayU keys

---

## ☁️ STEP 5: VERCEL ENVIRONMENT VARIABLES

### 5.1 Add Variables to Vercel

1. Go to: **https://vercel.com/dashboard**
2. Select your **"meet-new-make-new"** project
3. Click **Settings** (tab)
4. Go to **Environment Variables** (sidebar)
5. Click **Add New**

### 5.2 Add Each Variable

Add the following variables one by one:

| Variable | Value | Environment |
|----------|-------|-------------|
| `PAYTM_MID` | `999988881234567` | Production + Preview + Development |
| `PAYTM_MERCHANT_KEY` | `aBcDeFgHiJkLmNoP` | Production + Preview + Development |
| `PAYTM_WEBSITE` | `DEFAULT` (for production) or `WEBSTAGING` | All |
| `PAYTM_CHANNEL_ID` | `WEB` | All |
| `PAYTM_ENV` | `production` | Production |
| `PAYTM_ENV` | `staging` | Preview + Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://preview-*.vercel.app` | Preview |
| `NEXTAUTH_SECRET` | Same as local | All |
| `MONGODB_URI` | Your MongoDB connection | All |
| `GOOGLE_CLIENT_ID` | If using Google OAuth | All |
| `GOOGLE_CLIENT_SECRET` | If using Google OAuth | All |

### 5.3 Check Environment Variable Status

After adding all variables:
- ✅ All variables should show as "Added"
- ✅ No red error indicators
- ✅ All environments should be selected

---

## 🧪 STEP 6: TESTING THE INTEGRATION

### 6.1 Test Locally

1. **Stop your dev server** (if running): `Ctrl+C`
2. **Update dependencies**: `npm install` (removed razorpay)
3. **Start dev server**: `npm run dev`
4. **Go to**: http://localhost:3000/premium
5. **Click "Subscribe Now"** button
6. You should see Paytm checkout page

### 6.2 Test Payment Flow

1. Click subscription button
2. Paytm checkout modal opens
3. You'll see payment options:
   - 💳 Cards
   - 📱 UPI
   - 🏦 Net Banking
   - 👛 Wallets
4. Select any test option (Paytm provides test credentials)
5. Payment should process

### 6.3 TestPaytm Credentials (Staging)

Paytm provides test credentials in staging mode:

**Test Card:**
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- OTP: 123456

---

## 📡 STEP 7: VERCEL DEPLOYMENT WITH PAYTM

### 7.1 Redeploy After Environment Variables

1. Go to **Vercel Dashboard**
2. Select **"meet-new-make-new"** project
3. Go to **Deployments** tab
4. Click on latest deployment
5. Click **Redeploy** button
6. Wait for 2-3 minutes for deployment

### 7.2 Verify Deployment

1. Visit your live URL: `https://your-domain.vercel.app`
2. Go to `/premium` page
3. Click subscribe button
4. Should see Paytm checkout

---

## 🔐 STEP 8: PRODUCTION CONFIGURATION

### 8.1 Switch to Production Environment

When you're ready for live payments:

**In Vercel Environment Variables:**

Change `PAYTM_ENV` from `staging` to `production` for Production environment

**In Paytm Dashboard:**

Update: `PAYTM_WEBSITE = DEFAULT` (not WEBSTAGING)

### 8.2 Get Live Merchant Credentials

1. In Paytm Dashboard
2. Go to: **Settings** → **Onboarding**
3. Complete business verification
4. Request **Live Merchant Credentials**
5. You'll receive new MID and Key for production

### 8.3 Update Production Keys

In Vercel, update **Production environment only**:
- `PAYTM_MID` = Your production MID
- `PAYTM_MERCHANT_KEY` = Your production key
- `PAYTM_WEBSITE` = DEFAULT
- `PAYTM_ENV` = production

---

## 📱 WHAT PAYMENT METHODS WILL USERS SEE?

When a user clicks **"Subscribe Now"**, they'll see:

### On Paytm Checkout Page:
```
┌─────────────────────────────────────┐
│  💳 CREDIT/DEBIT CARD               │
│  Enter card number & CVV             │
├─────────────────────────────────────┤
│  📱 UPI                              │
│  Google Pay, PhonePe, BHIM, etc      │
├─────────────────────────────────────┤
│  🏦 NET BANKING                      │
│  All bank options                    │
├─────────────────────────────────────┤
│  👛 WALLETS                          │
│  Paytm Wallet, Others                │
├─────────────────────────────────────┤
│  💸 BUY NOW PAY LATER                │
│  EMI options                         │
└─────────────────────────────────────┘
```

**Users can pick ANY method they prefer** - no need to create separate integrations!

---

## ✅ API CHANGES MADE

No new APIs needed! But here's what was changed:

### API Routes Updated:
1. **`/api/payment/create-order`** - Now only creates Paytm orders
2. **`/api/payment/paytm-verify`** - Verifies Paytm payments (unchanged)
3. **`/api/payment/renew`** - Now only uses Paytm for auto-renewal
4. **`/api/payment/verify`** - Deprecated (marked as gone)
5. **`/api/payment/payu-verify`** - Deprecated (marked as gone)

### Removed:
- ❌ Razorpay payment route
- ❌ PayU payment logic
- ❌ Razorpay dependency from package.json

### No New APIs Required:
✅ Paytm provides all payment methods in ONE checkout  
✅ No need for separate Razorpay API  
✅ No need for separate PayU API  

---

## 🐛 TROUBLESHOOTING

### Issue: "Payment gateway not configured"

**Solution:**
1. Check Vercel Environment Variables
2. Verify PAYTM_MID and PAYTM_MERCHANT_KEY are set
3. Redeploy after adding variables
4. Wait 2-3 minutes for deployment

### Issue: "Paytm checkout SDK not available"

**Solution:**
1. Check browser console for errors
2. Verify network tab (should load Paytm SDK)
3. Try different browser
4. Clear browser cache

### Issue: "Payment verification failed"

**Solution:**
1. Check MongoDB is connected
2. Verify user is logged in
3. Check server logs for errors
4. Ensure API route is responding

### Issue: "Invalid Merchant ID"

**Solution:**
1. Re-check MID from Paytm Dashboard
2. No typos or extra spaces
3. For production: use production MID, not staging
4. Verify PAYTM_WEBSITE matches your Paytm account

---

## 📋 FINAL CHECKLIST

- [ ] Created Paytm Business account
- [ ] Got Merchant ID (MID)
- [ ] Got Merchant Key
- [ ] Added to `.env.local` locally
- [ ] Added all 6 Paytm variables to Vercel
- [ ] Ran `npm install` (removed razorpay)
- [ ] Started dev server successfully
- [ ] Tested in local (http://localhost:3000/premium)
- [ ] Redeployed Vercel after environment variables
- [ ] Tested payment flow on live URL
- [ ] All payment methods showing in checkout

---

## 🎉 YOU'RE DONE!

Your Vibely app now uses **Paytm Business** with support for:
- ✅ All payment methods (cards, UPI, net banking, wallets, etc.)
- ✅ Simplified single integration
- ✅ Production-ready configuration
- ✅ Easy deployment

**Users can now subscribe with ANY payment method they prefer!**

Need help? Check Paytm docs: https://developer.paytm.com/docs/
