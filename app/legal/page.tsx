"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Legal() {
  const [agreed, setAgreed] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const router = useRouter();

  const handleAgree = () => {
    if (agreed) {
      // Store agreement in localStorage
      localStorage.setItem('legalAgreed', 'true');
      setHasAgreed(true);
    }
  };

  if (hasAgreed) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 font-sans">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div className="bg-green-600 text-white p-6 rounded-t-lg">
            <h1 className="text-3xl font-bold text-center">Welcome to Vibely!</h1>
            <p className="text-center mt-2 text-green-100">Thank you for agreeing to our terms. How would you like to continue?</p>
          </div>

          <div className="p-8 text-center">
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Link
                href="/login"
                className="block p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <h3 className="text-xl font-bold mb-2">Login</h3>
                <p>Already have an account? Sign in to continue.</p>
              </Link>

              <Link
                href="/signup"
                className="block p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <h3 className="text-xl font-bold mb-2">Sign Up</h3>
                <p>Create a new account to get started.</p>
              </Link>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 underline"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h1 className="text-3xl font-bold text-center">Welcome to Vibely</h1>
          <p className="text-center mt-2 text-blue-100">Please read and agree to our terms before continuing</p>
        </div>

        {/* Content */}
        <div className="p-8 max-h-96 overflow-y-auto">
          {/* Age Restriction Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> This service is for users 18 years and older only. By continuing, you confirm you are at least 18 years old.
                </p>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Terms of Service</h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-800">1. Acceptance of Terms</h3>
                <p>By accessing and using Vibely, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">2. Age Restriction</h3>
                <p>You must be at least 18 years old to use this service. This platform is intended for adults only.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">3. User Conduct</h3>
                <p>You agree to use the service respectfully and appropriately. Harassment, abusive behavior, or inappropriate content will result in immediate account suspension.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">4. Content and Communication</h3>
                <p>All communications on this platform should be consensual and respectful. Report any inappropriate behavior immediately.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">5. Privacy</h3>
                <p>Your privacy is important to us. We collect only necessary information for service provision and do not share personal data with third parties.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">6. Account Termination</h3>
                <p>We reserve the right to terminate accounts that violate these terms or engage in harmful behavior.</p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Privacy Policy</h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-800">1. Information We Collect</h3>
                <p>We collect basic information necessary for account creation and service provision, including name, email, and profile information.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">2. How We Use Information</h3>
                <p>Information is used solely for providing our matching and communication services, account management, and improving user experience.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">3. Data Storage</h3>
                <p>Chat messages and personal data are stored securely. We implement appropriate security measures to protect your information.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">4. Data Sharing</h3>
                <p>We do not sell, trade, or share your personal information with third parties for marketing purposes.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">5. Your Rights</h3>
                <p>You have the right to access, update, or delete your personal information. Contact us for any privacy-related requests.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Agreement Section */}
        <div className="bg-gray-50 px-8 py-6 rounded-b-lg border-t">
          <div className="flex items-start space-x-3 mb-4">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agree" className="text-sm text-gray-700 leading-relaxed">
              I have read and agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. I confirm I am 18 years or older.
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {!hasAgreed ? (
              <button
                onClick={handleAgree}
                disabled={!agreed}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  agreed
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                I Agree - Continue
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}