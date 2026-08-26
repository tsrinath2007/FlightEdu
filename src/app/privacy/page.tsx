import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | GoFocusGen",
  description: "Privacy Policy for GoFocusGen.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-[#f0f4ff] font-body relative overflow-x-hidden noise">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.05),transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Navigation / Back Button */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 hover:text-[#fbbf24] transition-colors"
          >
            ← Return to Flight Deck
          </Link>
        </div>

        {/* Header */}
        <header className="mb-12 border-b border-white/5 pb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold tracking-tight mb-4">
            GoFocusGen Privacy Policy
          </h1>
          <p className="text-sm text-white/40 italic">
            Last updated: August 17, 2026
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-white/80 leading-relaxed space-y-8 font-sans">
          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              1. Introduction
            </h2>
            <p>
              GoFocusGen (&quot;GoFocusGen,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a study productivity web app that turns focus sessions into simulated travel journeys. This Privacy Policy explains what information we collect through gofocusgen.vercel.app (the &quot;Service&quot;), how we use it, and the choices you have. By using the Service, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-4">
              <strong>Account information.</strong> To use GoFocusGen, you sign in with Google. We receive your name, email address, and profile picture from your Google account.
            </p>
            <p className="mb-4">
              <strong>Study and activity data.</strong> The study sessions you complete — durations, routes/destinations selected, and the topics or goals you enter for the AI-generated study syllabus feature.
            </p>
            <p className="mb-4">
              <strong>Gamification data.</strong> Focus coins, streak history, pilot rank, and passport stamps/achievements tied to your account.
            </p>
            <p className="mb-4">
              <strong>Chat and social content.</strong> If you use group study modes (Co-Pilots Lounge or multiplayer sessions), messages you send may be visible to other participants in that session.
            </p>
            <p className="mb-4">
              <strong>Usage and device data.</strong> Standard technical data such as browser type, device type, and pages visited, collected automatically through analytics tools (e.g., Google Analytics) once enabled.
            </p>
            <p>
              <strong>Cookies.</strong> We use cookies or similar technologies for sign-in sessions and analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>To provide and operate the Service (run focus sessions, track streaks and rank, generate AI study plans)</li>
              <li>To personalize your experience</li>
              <li>To support leaderboards, streaks, and multiplayer features</li>
              <li>To monitor and improve the Service through analytics</li>
              <li>To communicate with you about your account or the Service, if needed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              4. Third-Party Services
            </h2>
            <p className="mb-4">
              We rely on third-party providers to operate GoFocusGen, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li><strong>Google</strong> — for sign-in (OAuth) and, if enabled, Analytics</li>
              <li><strong>Vercel</strong> — for hosting the Service</li>
              <li><strong>Anthropic (Claude API)</strong> — to generate AI study syllabi from the topics you submit</li>
            </ul>
            <p className="mt-4">
              These providers process data on our behalf and have their own privacy practices. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              5. Data Retention
            </h2>
            <p>
              We retain account and activity data for as long as your account is active. You can request deletion of your account and associated data at any time (see Section 11). Account deletion is permanent — once your account and associated data are deleted, they cannot be restored.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              6. Your Choices and Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>Request access to, correction of, or deletion of your personal data by contacting us</li>
              <li>Opt out of analytics cookies through your browser settings, where available</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              7. Children&apos;s Privacy
            </h2>
            <p>
              GoFocusGen is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              8. Security
            </h2>
            <p>
              We take reasonable measures to protect your information, but no method of transmission or storage is 100% secure, and we cannot guarantee absolute security. Chat messages and other stored account data are not accessed or viewed by our team except as necessary to investigate a reported violation of these Terms, comply with a legal obligation, or with your permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              9. International Users
            </h2>
            <p>
              GoFocusGen may be accessed from anywhere in the world, and your data may be processed in a country other than your own, including India, where the Service is operated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be reflected by updating the &quot;Last updated&quot; date above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              11. Contact Us
            </h2>
            <p>
              Questions about this policy or your data? Contact us at <a href="mailto:gofocusgen@gmail.com" className="text-[#38bdf8] hover:underline font-medium">gofocusgen@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
