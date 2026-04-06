export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">1. Information We Collect</h2>
            <p>We collect basic information necessary for account creation and service provision, including name, email, and profile information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">2. How We Use Information</h2>
            <p>Information is used solely for providing our matching and communication services, account management, and improving user experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">3. Data Storage</h2>
            <p>Chat messages and personal data are stored securely. We implement appropriate security measures to protect your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">4. Data Sharing</h2>
            <p>We do not sell, trade, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">5. Cookies and Tracking</h2>
            <p>We use cookies for session management and basic analytics. No tracking for advertising purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">6. Data Retention</h2>
            <p>Account data is retained while your account is active. You can request data deletion at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">7. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. Contact us for any privacy-related requests.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">8. Security</h2>
            <p>We implement industry-standard security measures, but no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">9. Age Restriction</h2>
            <p>This service is for users 18 years and older. We do not knowingly collect information from minors.</p>
          </section>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Last updated: April 6, 2026</p>
        </div>
      </div>
    </div>
  );
}