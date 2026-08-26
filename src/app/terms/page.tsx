import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions | GoFocusGen",
  description: "Terms and Conditions for using GoFocusGen.",
};

export default function TermsPage() {
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
            GoFocusGen Terms and Conditions
          </h1>
          <p className="text-sm text-white/40 italic">
            Last updated: August 17, 2026
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-white/80 leading-relaxed space-y-8 font-sans">
          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using GoFocusGen at gofocusgen.vercel.app (the &quot;Service&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you don&apos;t agree, please don&apos;t use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              2. Description of Service
            </h2>
            <p>
              GoFocusGen is a gamified study productivity platform that converts real-world travel times into study session durations, with features including AI-generated study plans, streak tracking, achievements, and optional multiplayer study sessions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              3. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to use GoFocusGen. By using the Service, you confirm that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              4. Accounts
            </h2>
            <p>
              You must sign in using Google to use the Service. You&apos;re responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us promptly of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              5. Acceptable Use
            </h2>
            <p className="mb-4">
              When using group or multiplayer features (including Co-Pilots Lounge), you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/70">
              <li>Harass, threaten, or abuse other users</li>
              <li>Post unlawful, obscene, or harmful content</li>
              <li>Impersonate another person or misrepresent your affiliation</li>
              <li>Attempt to disrupt, hack, or reverse-engineer the Service</li>
              <li>Use the Service for any purpose other than personal study or productivity use</li>
            </ul>
            <p className="mt-4">
              We reserve the right to remove content or suspend accounts that violate these Terms. If you experience or witness a violation — including harassment or abuse by another user — report it to us at <a href="mailto:gofocusgen@gmail.com" className="text-[#38bdf8] hover:underline font-medium">gofocusgen@gmail.com</a>. We will review reports and may permanently ban accounts found in violation. Creating a new account to evade a ban is itself a violation of these Terms, and any account created for that purpose may also be banned.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              6. User Content
            </h2>
            <p>
              Any messages, study goals, or other content you submit remain yours, but you grant GoFocusGen a limited license to use, store, and display that content as needed to operate the Service (for example, showing your chat messages to other session participants).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              7. AI-Generated Content
            </h2>
            <p>
              Study plans, syllabi, and other content generated by the AI Co-Pilot feature are provided as a study aid only. We do not guarantee their accuracy, completeness, or suitability for any exam, course, or curriculum. Always verify important academic material against your own course resources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              8. Intellectual Property
            </h2>
            <p>
              The GoFocusGen name, logo, design, and original content are owned by GoFocusGen and may not be copied or reused without permission. This does not apply to your own content (Section 6).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              9. No Warranty
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, express or implied. We do not guarantee the Service will be uninterrupted, error-free, or available at all times.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, GoFocusGen is not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including lost study time, missed exam preparation, or data loss.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              11. Termination
            </h2>
            <p>
              We may suspend or terminate your access to the Service at any time for violation of these Terms. You may stop using the Service or delete your account at any time. Account deletion is permanent and cannot be reversed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              12. Changes to the Service or Terms
            </h2>
            <p>
              We may modify or discontinue the Service, or update these Terms, at any time. Continued use after changes means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              13. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of India, without regard to conflict-of-law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-[#fbbf24] mb-3">
              14. Contact Us
            </h2>
            <p>
              Questions about these Terms? Contact us at <a href="mailto:gofocusgen@gmail.com" className="text-[#38bdf8] hover:underline font-medium">gofocusgen@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
