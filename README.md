<div align="center">

# ⚡ PROGRESS TRUTH ENGINE

**The brutally honest gym tracker. No fluff. Only data.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-red?style=flat-square)](LICENSE)

[Live Demo]( https://progress-truth-engine.vercel.app )· [Report Bug](https://github.com/Aditya-Shukla4/Progress-Truth-Engine/issues) · [Request Feature](https://github.com/Aditya-Shukla4/Progress-Truth-Engine/issues)

</div>

---

## 📸 Overview

Progress Truth Engine (PTE) is a full-stack mobile-first gym tracking application built to give athletes honest, data-driven feedback on their training. No motivational fluff — just your numbers, your trends, and the truth about whether you're progressing.

The app features a cinematic onboarding flow, an immersive active workout mode, a weekly check-in system with brutally honest AI feedback, personal record tracking, plate calculator, rest timer, shareable workout cards, and a global leaderboard.

---

## ✨ Features

### 🏠 Dashboard
- Time-aware greeting with personalized name
- 7-day training heatmap showing this week's consistency
- Live streak badge with milestone celebrations (3, 7, 14, 21, 30, 60, 100 days)
- Today's suggested workout split based on day of the week
- Animated stat counters — total sessions, weekly workouts, total volume
- Last session recap with exercise pills
- Body weight sparkline from check-in history
- All-time best lift callout
- Daily rotating motivational quote

### 🏋️ Active Workout Mode
- Full-screen immersive session UI — takes over the whole screen
- Live elapsed timer with pulsing indicator
- Real-time stats strip (sets done, volume, exercise count)
- Exercise cards with inline autocomplete from 85+ exercise database
- Previous session values ghosted as placeholders for every set
- One-tap set completion with auto rest timer trigger
- Circular ring countdown rest timer with haptic feedback
- Swipe-safe discard confirmation with sets-logged warning
- Confetti + sound on workout completion

### 📝 Workout Log
- Quick-log form for manual entry
- Smart session name chips from history + default splits
- Save and load workout routines/templates
- Rest day logging
- Complete workout history with expandable cards
- Share workout as a styled image card (Instagram story format)
- Collapsible analytics section

### ⚖️ Weekly Check-In
- Current weight, sleep, protein, workout days, strength trend
- Instant brutally honest feedback (RED / YELLOW / GREEN)
- Visual status cards with glow effects
- Check-in history archives
- Live weight vs consistency progress chart

### 👤 Profile & RPG System
- RPG-style leveling based on total volume lifted
  - 🥦 Broccoli Head → 🐀 Gym Rat → ⛓️ Iron Addict → 🦍 Silverback → ⚡ Greek God
- Animated XP progress bar with level-specific colors
- 90-day consistency heatmap (GitHub-style)
- Session count, total volume, and monthly stats
- Height, target weight, and diet type settings

### 📊 Analytics
- **Exercise Chart** — Strength progress over time for any exercise
- **Muscle Split Chart** — Donut + horizontal bar breakdown with push/pull imbalance detection
- **1RM Estimator** — Epley formula with full training zones table (100% → 70%)
- **Personal Records** — Hall of Fame with PR flash animations and count-up numbers

### 🧮 Tools
- **Plate Calculator** — Visual barbell diagram with exact plate breakdown
- **Rest Timer** — Circular countdown with 5 presets (30s–3m)

### 🏆 Leaderboard
- Global rankings by total volume lifted
- Animated podium for top 3 with gold/silver/bronze tiers
- Skeleton loading states

### 🔐 Auth
- Email/password sign up and login
- Google OAuth via Firebase
- Session persistence with localStorage

---

## 🛠️ Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework with Turbopack |
| Framer Motion | Animations and transitions |
| Recharts | Data visualization |
| Firebase Auth | Google OAuth |
| html2canvas | Shareable workout card screenshots |
| canvas-confetti | Workout completion celebrations |
| Tailwind CSS | Utility styling |

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Render | API hosting (free tier) |

### Design System
- **Fonts** — Barlow Condensed (display), Outfit (body), JetBrains Mono (data/labels)
- **Color** — Deep charcoal blacks (`#060608`) with ember accent (`#ff4500`)
- **Approach** — CSS custom properties for all tokens, glass morphism cards, frosted navigation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Firebase project (for Google Auth)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/progresstruthengine.git
cd progresstruthengine
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/progresstruth
PORT=5000
```

Start the server:

```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd client
npm install
```

Create a `.env.local` file in `/client`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Start the development server:

```bash
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Configure API Base

In `client/src/app/page.js`, update the API base URL:

```js
// For local development:
const API_BASE = "http://localhost:5000";

// For production:
const API_BASE = "https://your-api.onrender.com";
```

---

## 📁 Project Structure

```
progresstruthengine/
├── client/                          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css          # Design system + animations
│   │   │   ├── layout.js            # Root layout
│   │   │   └── page.js              # Main app shell + routing
│   │   ├── components/
│   │   │   ├── ActiveWorkout.js     # Full-screen workout mode
│   │   │   ├── animations.js        # Animation utilities & hooks
│   │   │   ├── CheckIn.js           # Weekly check-in
│   │   │   ├── Dashboard.js         # Home screen
│   │   │   ├── ExerciseChart.js     # Strength progress chart
│   │   │   ├── Leaderboard.js       # Global rankings
│   │   │   ├── MuscleSplitChart.js  # Muscle balance chart
│   │   │   ├── Onboarding.js        # Multi-step auth flow
│   │   │   ├── OneRepMax.js         # 1RM calculator
│   │   │   ├── PersonalRecords.js   # PR hall of fame
│   │   │   ├── PlateCalculator.js   # Visual plate calculator
│   │   │   ├── Profile.js           # User profile + RPG level
│   │   │   ├── ProgressChart.js     # Weight vs consistency chart
│   │   │   ├── RestTimer.js         # Circular rest timer
│   │   │   ├── ShareableWorkoutCard.js  # Instagram story card
│   │   │   ├── StreakFire.js        # Streak badge
│   │   │   ├── TruthCalendar.js     # 90-day heatmap
│   │   │   └── WorkoutLog.js        # Log + history
│   │   └── utils/
│   │       └── exerciseDB.js        # 85+ exercise database
│   └── firebase.js                  # Firebase config
│
└── server/                          # Express backend
    ├── models/
    │   ├── CheckIn.js
    │   ├── Template.js
    │   ├── User.js
    │   └── Workout.js
    └── routes/
        ├── checkinRoutes.js
        ├── templateRoutes.js
        ├── userRoutes.js
        └── workoutRoutes.js
```

---

## 🔌 API Reference

### Users
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user/register` | Register new user |
| POST | `/api/user/login` | Login with email/password |
| POST | `/api/user/google` | Login/register via Google |
| GET | `/api/user/:id` | Get user profile |
| PUT | `/api/user/:id` | Update user settings |
| GET | `/api/user/leaderboard/global` | Global leaderboard |

### Workouts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workout/add` | Log a workout |
| GET | `/api/workout/history/:userId` | Get workout history |
| DELETE | `/api/workout/:id` | Delete a workout |
| DELETE | `/api/workout/:wId/exercise/:exId` | Remove an exercise |
| GET | `/api/workout/prs/:userId` | Get personal records |
| GET | `/api/workout/last-log` | Get last log for an exercise |

### Templates
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/template/create` | Save a routine |
| GET | `/api/template/:userId` | Get saved routines |
| DELETE | `/api/template/:id` | Delete a routine |

### Check-Ins
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/checkin/analyze` | Submit weekly check-in |
| GET | `/api/checkin/history/:userId` | Get check-in history |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd client
vercel --prod
```
Set the same environment variables from `.env.local` in your Vercel project settings.

### Backend → Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Create a new **Web Service** pointing to the `/server` folder
3. Set the **Start Command** to `node index.js`
4. Add `MONGODB_URI` as an environment variable
5. Set the health check path to `/health`

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The server includes a self-ping mechanism for production to prevent cold starts.

---

## 🎨 Design Decisions

**Why monospace for data labels?** Numbers in monospace align vertically and feel precise — they signal "this is real data", not marketing copy.

**Why Barlow Condensed italic for headings?** It's athletic, condensed, and italic — it leans forward like it's mid-sprint. Every big number feels earned.

**Why ember (#ff4500) instead of pure red?** Pure red (`#ef4444`) reads as "error" in most UIs. Ember is warmer, more like a training partner than a warning sign.

**Why one-question-per-screen onboarding?** Cognitive load research consistently shows single-focus flows have higher completion rates. Each screen asks exactly one thing.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- [Framer Motion](https://www.framer.com/motion/) — for making animations feel effortless
- [Recharts](https://recharts.org/) — clean, composable React charts
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — because finishing a workout deserves a celebration
- [Firebase](https://firebase.google.com/) — seamless Google Auth
- [Render](https://render.com/) — free tier API hosting

---

<div align="center">

Built with 🔥 by someone who actually lifts

**[⭐ Star this repo if it helped you stay consistent](https://github.com/Aditya-Shukla4/Progress-Truth-Engine)**

</div>
