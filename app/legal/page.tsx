"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Legal() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

  const handleAgree = () => {
    if (agreed) {
      // Store agreement in localStorage
      localStorage.setItem('legalAgreed', 'true');
      // Redirect to lobby to connect with strangers
      router.push('/lobby');
    }
  };

  return (
    <div className="min-h-screen bg-nude-beige p-2 sm:p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-black text-nude-beige p-4 sm:p-6 rounded-t-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Welcome to Vibely</h1>
          <p className="text-center mt-2 text-xs sm:text-sm text-nude-beige">Please read and agree to our terms before continuing</p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-80 overflow-y-auto text-xs sm:text-sm">
          {/* Age Restriction Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <p className="text-yellow-800 font-semibold text-xs sm:text-sm">
              ⚠️ This service is for adults 18+ only. You must be at least 18 years old to continue.
            </p>
          </div>

          {/* Terms Summary */}
          <section className="mb-4">
            <h2 className="text-sm sm:text-base font-bold mb-2 text-black">Terms of Service</h2>
            <ul className="space-y-1 text-xs sm:text-sm text-dark-grey">
              <li>• You must be 18 years or older to use this service</li>
              <li>• Be respectful and communicate consensually</li>
              <li>• No harassment, abuse, or inappropriate behavior</li>
              <li>• Violations may result in account termination</li>
              <li>• Location and gender filters require premium subscription</li>
              <li>• Guest mode available for free without filters</li>
            </ul>
          </section>

          {/* Privacy Summary */}
          <section className="mb-4">
            <h2 className="text-sm sm:text-base font-bold mb-2 text-black">Privacy Policy</h2>
            <ul className="space-y-1 text-xs sm:text-sm text-dark-grey">
              <li>• We collect minimal information for service provision</li>
              <li>• Your data is not shared with third parties</li>
              <li>• Chat data is stored securely</li>
              <li>• You can request data deletion anytime</li>
            </ul>
          </section>

          <p className="text-xs text-dark-grey italic">
            For complete terms and privacy policy, visit <a href="/terms" className="text-black underline hover:font-semibold">Terms of Service</a> or <a href="/privacy" className="text-black underline hover:font-semibold">Privacy Policy</a>
          </p>
        </div>

        {/* Agreement Section */}
        <div className="bg-gray-100 px-4 sm:px-6 py-4 rounded-b-lg border-t">
          <div className="flex items-start gap-2 mb-4">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-black"
            />
            <label htmlFor="agree" className="text-xs sm:text-sm text-dark-grey leading-tight">
              I have read and agree to the Terms of Service and Privacy Policy. I confirm I am 18 years or older.
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAgree}
              disabled={!agreed}
              className={`px-4 sm:px-6 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
                agreed
                  ? 'bg-black text-nude-beige hover:bg-dark-grey'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              I Agree - Connect Now
            </button>

            <button
              onClick={() => window.history.back()}
              className="px-4 sm:px-6 py-2 border-2 border-black text-black rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}