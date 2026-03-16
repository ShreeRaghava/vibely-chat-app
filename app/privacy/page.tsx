export default function Privacy() {
  return (
    <div className="min-h-screen bg-nude-beige p-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-dark-grey">
          <p>1. We collect minimal personal information for authentication.</p>
          <p>2. Chat data is stored temporarily and deleted after sessions.</p>
          <p>3. We use cookies for session management.</p>
          <p>4. Your data is not shared with third parties.</p>
          <p>5. Contact us for data deletion requests.</p>
        </div>
      </div>
    </div>
  );
}