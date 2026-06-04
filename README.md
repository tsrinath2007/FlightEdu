# ✈️ VoyageIQ & GoFocusGen 🧭

> **Study like you're travelling the world.** Translate real-world travel paths into dedicated focus blocks, land at international airports, earn focus coins, and unlock global territories.

VoyageIQ (also branded as **GoFocusGen**) is an immersive, high-fidelity, gamified study-focus cockpit. Designed as a flight simulator experience, it transforms standard Pomodoro timer concepts into deep focus voyages. Pilots select real-world routes (Flights, Trains, Cars, or Buses) across an interactive global map, board multiplayer cabins, check in on autopilot presence alerts, personalize chibi cadets, and archive holographic boarding passes in their pilot closet.

---

## 🚀 Key Premium Features

### 1. 🛫 Journey-Based Focus Telemetry
* **Real Paths, Real Time**: Convert actual travel times between coordinates (e.g., Dubai `DXB` ➔ Singapore `SIN`) into study countdown timers.
* **Multi-Modal Transit**: Choose your fleet—Flights ✈️, Trains 🚂, Cars 🚗, or Buses 🚌.
* **AI Co-Pilot Advisor**: Dynamic generation of tailored study plans via Anthropic Claude AI matching your study subject and voyage duration.

### 2. 🎮 Autopilot Lounge & Multi-Pilot Cabin
* **Multipilot Lounges**: Study live with fellow cadets in real-time. Pick an active cabin pod to inspect stats, and view custom cadet dreams.
* **Chibi Avatar Customization**: Personalize your spiky chibi pilot hair, outfit, eyes, and study accessories.
* **Interactive Emote Streams**: Send floating glassmorphic claps `👏`, cheers `🎉`, or warm amber-gradient **Coffee Focus Fuel** vibes `☕` directly across active cabin seats.
* **Chill vs. Hardcore Flight Modes**:
  * **Chill Mode**: Safe focus cockpit with normal pacing.
  * **Hardcore Mode**: Penalty-enforced. Safe cockpit exit requires upfront deposits. If any pilot fails the Autopilot Presence Check-in, the entire crew cabin is penalized!

### 3. 🛡️ Telemetry Safeguards & Presence Checks
* **Autopilot Master Warning Alerts**: Real-time browser master notifications keep you aligned with active flights.
* **Autopilot Presence Check-in**: Random verification checkpoints (e.g., answering math flight calculations or typing confirmation keywords) prevent slacking.
* **Holographic Focus Shield**: Shield upgrades defend cabin scores from dropouts.

### 4. 🗃️ Digital Passport & Boarding Pass Closet
* **commemorative Boarding Passes**: Generate ultra-premium ticket-styled digital passes detailing seat alignment, cabin class, coins earned, and custom focus subjects.
* **Passport Visa Booklet**: Deterministically tilt-stamped pages detailing all your historical global landings.
* **Pilot License Closet**: Archival drawers displaying successfully filed holographic ticket credentials.
* **Route Mastery Badges**: Unlock badges (e.g., *"Around the World"*, *"Red-Eye Warrior"*) for completing specific geographic flights.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router), React, TypeScript | Core application rendering and strict type safety |
| **Styling** | TailwindCSS, Glassmorphism, Harmonious HSL colors | Sleek, modern, responsive premium dark-themed UI |
| **Animations**| Framer Motion | Smooth spring animations and custom interactive state flows |
| **Auth** | Supabase OAuth (Google Gateway) | Secure pilot gateway credentials |
| **Database** | Prisma ORM, PostgreSQL | Highly structured records for streaks, transactions, and logs |
| **APIs & AI** | Anthropic API (Claude), Google Maps Web API | Intelligent study plans and interactive flight route rendering |

---

## 🗄️ Database Model Architecture

The project maps complex study logs into an interactive database manifest using Prisma:

* **User**: Manages credentials, pilot code designation (`@pilotId`), cumulative coin treasury, focus hours, fire streaks, and freeze shields.
* **Session**: Represents active travel voyages with origin, destination, duration, transport fleet, chill/hardcore mode state, and session phase status.
* **SessionParticipant**: Resolves active seats inside real-time co-pilot cabins, logs specific coins accrued, and tracks individual flight completions.
* **Transaction**: Registers histories of focus coin accruals and hardcore mode exit penalties.
* **LeaderboardEntry**: Aggregates weekly global ranks sorted by cumulative hours, coins, and streaks.
* **Badge / UserBadge**: Manages dynamic achievements unlocked by route milestones.
* **Friendship & ChatMessage**: Controls wingman co-pilot lists, custom crew nicknames, and direct chat logs.

---

## 📦 Getting Started & Installation

Follow these steps to recruit yourself as a pilot cadet and run VoyageIQ locally:

### 1. Prerequisite Requirements
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18.x or above)
* [PostgreSQL](https://www.postgresql.org/) (or a Supabase DB reference link)

### 2. Clone the Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/tsrinath2007/FlightEdu.git
cd voyageiq

# Install packages
npm install
```

### 3. Setup Local Environment Variables
Create a `.env` file in the root directory and configure the required environment variables:

- `DATABASE_URL` (Prisma connection pooler URL)
- `DIRECT_URL` (Direct connection URL for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` (Supabase API URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase Anon public key)
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase Service role key)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Google Maps API key)
- `ANTHROPIC_API_KEY` (Anthropic Claude API key)
- `NEXT_PUBLIC_APP_URL` (Local development app URL)


### 4. Database Setup & Migrations
Synchronize your schema models and seed files with PostgreSQL using Prisma:
```bash
# Generate type-safe Prisma client
npx prisma generate

# Apply active migrations to database
npx prisma db push
```

### 5. Run the Cockpit Dev Server
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. You can bypass full OAuth to test routes instantly by selecting **⚡ Simulation Takeoff (Bypass OAuth)** on the entry boarding gate!

### 6. Verify Strict Type Safety
Ensure codebases remain type-safe:
```bash
npx tsc --noEmit
```

---

## 🗺️ Project Navigation

```
voyageiq/
├── prisma/                 # Database schemas and postgres migrations
├── public/                 # Static asset vectors and cockpit alerts
└── src/
    ├── app/
    │   ├── api/            # API Route handlers (Badges, Coins, Onboarding)
    │   ├── dashboard/      # Base flight center & stats hub
    │   ├── journey/        # Boarding Pass generator ticket deck
    │   ├── leaderboard/    # Global pilot rankings
    │   ├── map/            # Interactive 3D World flight paths selector
    │   ├── onboarding/     # Personalized configuration manifest
    │   ├── profile/        # Pilot license closets & visa stamps pages
    │   └── session/[id]/   # Cockpit flight tracker Pomodoro engine
    ├── components/         # Premium UI component design libraries
    └── lib/                # Database and third-party API clients
```

---

## 👥 Social & Crew Support

* **Created By**: [Srinath](https://www.linkedin.com/in/tses/)
* **Instagram**: [@gofocusgen](https://www.instagram.com/gofocusgen/?utm_source=ig_web_button_share_sheet)
* **LinkedIn**: [Srinath on LinkedIn](https://www.linkedin.com/in/tses/)

> *"Maintain cabin pressure, engage guidance, and let's conquer our dreams, cadet!"* 🚀
