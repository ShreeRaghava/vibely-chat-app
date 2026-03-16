# Vibely

A stranger chat web application built with Next.js, TypeScript, and Tailwind CSS. Connect with random people worldwide through anonymous text and video chats.

## Features

- Anonymous guest mode for instant chatting
- Video calls with WebRTC
- Premium filters (gender, location) with UPI payments
- User reporting and moderation
- Responsive design with nude & monochrome theme

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS with Framer Motion animations
- **Backend:** Node.js with Socket.io and PeerJS for real-time communication
- **Database:** MongoDB with Mongoose
- **Auth:** NextAuth.js with Google OAuth
- **Payments:** Razorpay integration

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js app directory with pages and layouts
- `components/` - Reusable UI components
- `lib/` - Utility functions and configurations
- `public/` - Static assets

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

## Deployment

Deploy on Vercel or any Node.js hosting platform.

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

## License

This project is licensed under the MIT License.
