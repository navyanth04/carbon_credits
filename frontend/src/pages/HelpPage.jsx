// src/pages/HelpPage.jsx
import React from 'react';

const faqs = [
  {
    question: "How does the Carbon Credits system work?",
    answer:
      "Each time an employee uses low‑carbon transport (carpool, public transit, working from home, etc.), they earn credits based on CO₂ avoided compared to driving alone. Those credits roll up to their employer’s account and can be traded between organizations.",
  },
  {
    question: "How do I log a new trip?",
    answer:
      "Head to the Journey Tracker, click “Start Journey,” then “End Journey” when you’re done. Finally, tap “Submit Trip” to record your distance, mode, and credits earned.",
  },
  // …add more FAQ items here
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-xl sm:max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Help &amp; FAQ
        </h1>

        {faqs.map(({ question, answer }) => (
          <section key={question} className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
              {question}
            </h2>
            <p className="mt-2 text-gray-600 leading-relaxed">{answer}</p>
          </section>
        ))}

        <section className="mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
            Contact Support
          </h2>
          <p className="mt-2 text-gray-600">
            Email us at{" "}
            <a
              href="mailto:support@carboncreditsplatform.com"
              className="text-blue-600 hover:underline"
            >
              support@carboncreditsplatform.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
