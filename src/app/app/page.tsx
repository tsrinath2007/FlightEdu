import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import AppWaitlistSection from "@/components/landing/AppWaitlistSection";

export const metadata: Metadata = {
  title: "GoFocusGen Mobile App | iOS & Android Waitlist",
  description: "Join the official GoFocusGen mobile app early access waitlist. Study on the go, lock in distractions, and navigate real flight paths.",
};

export default function MobileAppPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-[#f0f4ff] font-body relative overflow-x-clip noise">
      {/* Top ambient cosmic glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
          <Link href="/">
            <Logo layout="horizontal" size="md" />
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors"
            >
              ← Flight Deck
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-electric-500/20 text-electric-300 border border-electric-500/30 hover:bg-electric-500/30 transition-all"
            >
              Web Sign In
            </Link>
          </div>
        </nav>

        {/* Waitlist Section */}
        <AppWaitlistSection isStandalone={true} />

        {/* Premium First-Class Pass Preview & Pricing Guide */}
        <section className="mt-16 md:mt-24 pt-16 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Flight Pass Roadmap
            </span>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mt-4">
              Transparent & Student-Friendly Pricing
            </h3>
            <p className="text-xs md:text-sm text-white/50 mt-2">
              GoFocusGen is free for everyone to fly domestic study sessions. For pilots wanting unlimited AI study syllabi, intercontinental flights, and custom cockpits, First Class upgrades are coming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Tier 1: Free Economy */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-white/40">Economy Class</span>
                <div className="mt-2 text-2xl font-bold text-white">Free Forever</div>
                <p className="text-xs text-white/50 mt-1">For casual studiers</p>
                <ul className="mt-6 space-y-2 text-xs text-white/70">
                  <li className="flex items-center gap-2">✓ Domestic routes up to 2 hours</li>
                  <li className="flex items-center gap-2">✓ Basic streaks & pilot passport</li>
                  <li className="flex items-center gap-2">✓ Standard study lounges</li>
                  <li className="flex items-center gap-2">✓ 200 Focus coins / hour</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-white/40 text-center font-mono">
                Included with sign up
              </div>
            </div>

            {/* Tier 2: First Class Monthly / Annual */}
            <div className="rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-amber-500/10 to-navy-950 p-6 flex flex-col justify-between relative shadow-[0_0_30px_rgba(251,191,36,0.15)]">
              <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">First Class Pass</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-extrabold text-white">$3.99</span>
                  <span className="text-xs text-white/50 font-mono">/ month</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1 font-semibold">Or $29.99/year (Save ~40%)</p>
                <ul className="mt-6 space-y-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">✓ <strong>Unlimited AI Study Syllabi</strong></li>
                  <li className="flex items-center gap-2">✓ Intercontinental long-haul flights</li>
                  <li className="flex items-center gap-2">✓ Binaural cockpit ambient sounds</li>
                  <li className="flex items-center gap-2">✓ Unlimited Streak Freeze shields</li>
                  <li className="flex items-center gap-2">✓ Verified golden wings call-sign</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-amber-400/80 text-center font-mono">
                Waitlisters receive 40% off code
              </div>
            </div>

            {/* Tier 3: Founder Lifetime */}
            <div className="rounded-3xl border border-electric-500/30 bg-electric-500/5 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-electric-400 font-bold">Founder Pilot Pass</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-extrabold text-white">$49.99</span>
                  <span className="text-xs text-white/50 font-mono">one-time</span>
                </div>
                <p className="text-xs text-white/50 mt-1">Lifetime access forever</p>
                <ul className="mt-6 space-y-2 text-xs text-white/70">
                  <li className="flex items-center gap-2">✓ Everything in First Class Pass</li>
                  <li className="flex items-center gap-2">✓ Never pay a recurring subscription</li>
                  <li className="flex items-center gap-2">✓ Exclusive &quot;Founder Pilot&quot; Badge</li>
                  <li className="flex items-center gap-2">✓ 5,000 Focus Coins starting balance</li>
                  <li className="flex items-center gap-2">✓ Direct feature voting access</li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-electric-300/60 text-center font-mono">
                Limited to first 500 pilots
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 text-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} GoFocusGen — Study Like You&apos;re Travelling The World.</p>
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-white/30">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
