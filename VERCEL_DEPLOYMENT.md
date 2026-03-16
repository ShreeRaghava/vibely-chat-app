# Vercel Deployment Guide for Vibely

## Environment Variables to Add to Vercel

Copy and paste these exact values into Vercel:

```
NEXTAUTH_SECRET=c610eb46-550c-47ec-9009-4b84346f4763
NEXTAUTH_URL=https://vibely-website-pg1r1e1m2-shreeraghavas-projects.vercel.app
MONGODB_URI=mongodb+srv://lokeshveeraraghavalu_db_user:uDHhPemRlhuBYCRw@cluster0.zfqozm9.mongodb.net/?appName=Cluster0
GOOGLE_CLIENT_ID=dummy-client-id
GOOGLE_CLIENT_SECRET=dummy-client-secret
RAZORPAY_KEY_ID=dummy-razorpay-key
RAZORPAY_KEY_SECRET=dummy-razorpay-secret
```

## Steps to Deploy

1. Go to https://vercel.com/dashboard
2. Click on your "vibely-website" project
3. Go to Settings → Environment Variables
4. Add all the variables above
5. Click on Deployments tab
6. Find the latest deployment and click "Redeploy"

## After Deployment

The website will be live at: https://vibely-website-pg1r1e1m2-shreeraghavas-projects.vercel.app

Users can now:
- Register with email/password
- Login
- Chat with other users
- Use video calling
- Access premium features

