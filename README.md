# 🛡️ KinCode — Family Safety Net Against AI Voice Scams

> *"They can clone his voice. They can't crack your KinCode."*

KinCode is a real-time family verification app that lets elderly parents instantly confirm a suspicious call is genuine — with one tap and a shared family secret that no AI can fake.

---

## 🚨 The Threat

AI voice-cloning technology can now impersonate a family member's voice from as little as 3 seconds of audio, enabling scammers to call grandparents pretending to be their child in a "grandparent scam." These attacks stole **over $2 billion from Americans in 2023 alone**, and the sophistication is accelerating.

---

## 👥 Who It's For

| Role | Who |
|:---|:---|
| **Parent / Grandparent** | Receives the suspicious call; taps one button to verify |
| **Family Member** | Adult child or relative who set up the app and responds to verification pings |

---

## 🔴 Live Demo

> **[https://kincode.vercel.app](https://kincode.vercel.app)**

Open on **two devices** simultaneously — one as Parent, one as Family — to see the real-time round-trip in under 3 seconds.

---

## 📸 Screenshots

| SCAM Detected | Verified Safe | Family Alert |
|:---:|:---:|:---:|
| ![Scam screen](docs/scam-screen.png) | ![Safe screen](docs/safe-screen.png) | ![Family alert](docs/alert-screen.png) |

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    KinCode — 3-Layer Defense                │
├─────────────────┬───────────────────┬───────────────────────┤
│   LAYER 1       │   LAYER 2         │   LAYER 3             │
│   Real-Time     │   Out-of-Band     │   AI Memory           │
│   Verification  │   Channel         │   Challenge           │
├─────────────────┼───────────────────┼───────────────────────┤
│ Parent taps     │ Alert goes to     │ If no response in     │
│ VERIFY →        │ family member's   │ 30s → Gemini shows    │
│ Firebase writes │ phone instantly   │ a private family      │
│ status=pending  │ via Firebase      │ memory question       │
│                 │ (different        │ only a real family    │
│ Family taps     │ network path      │ member could answer   │
│ YES/NO →        │ than the call)    │                       │
│ Parent sees     │                   │ AI can clone a voice. │
│ RED or GREEN    │                   │ It can't clone a      │
│ in <3 seconds   │                   │ private memory.       │
└─────────────────┴───────────────────┴───────────────────────┘
```

**Flow:**
1. Parent receives suspicious call
2. Taps 🚨 **VERIFY THIS CALL** on KinCode
3. Family member gets an instant alert on their phone
4. Family taps **"Yes, it's me"** → Parent sees ✅ GREEN screen
5. Family taps **"No — I'm NOT calling!"** → Parent sees 🚨 RED screen
6. If family doesn't respond in 30 seconds → AI-generated memory question appears as backup

### ✨ Additional features

- **🎭 Scam-call simulator** — a built-in demo mode that plays a realistic AI-cloned voice ("Mom, I'm in jail, wire bail money…") through the browser's speech synthesis, so anyone can *experience* the threat before seeing KinCode defuse it. Clearly labelled as a demo simulation.
- **🔎 AI scam-tactic analyzer** — after a scam is flagged, paste what the caller said and Gemini names the manipulation tactics (false urgency, isolation, false authority, financial pressure) with a plain-English explanation. We analyze the *social-engineering playbook* (stable), never the audio (an arms race).
- **🧠 AI memory challenges**, **📞 multi-member alerts**, **🟢 availability status**, and **🕑 verification history**.

---

## 🔐 Security & Privacy Notes

- **Gemini key never ships to the browser.** In production the app calls a Vercel serverless function (`/api/gemini`) that holds the key server-side. The browser never sees it. (A direct-call path exists only for local dev when `VITE_GEMINI_API_KEY` is set.)
- **Scoped database rules.** `database.rules.json` replaces open test mode — reads/writes are scoped to a 4-digit family node rather than the whole database.
- **No personal accounts.** Pairing uses an ephemeral 4-digit code; no email, password, or phone number is collected.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|:---|:---|:---|
| Frontend | Vite + React 19 | Fast scaffolding, component-based |
| Styling | Vanilla CSS (dark theme) | Zero overhead, full accessibility control |
| Real-time | Firebase Realtime Database | Sub-second `onValue` listener, zero server code |
| AI Layer | Google Gemini 2.5 Flash | Memory challenges + scam-tactic analysis |
| AI Security | Vercel serverless proxy | Keeps the Gemini key off the client |
| Deployment | Vercel | GitHub-connected, instant preview URLs |
| Font | Outfit (Google Fonts) | Rounded, modern, highly legible |

---

## 🚀 How to Run Locally

### 1. Clone & install

```bash
git clone https://github.com/your-team/kincode.git
cd kincode
npm install
```

### 2. Create `.env` file

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=kincode-xxxxx.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://kincode-xxxxx-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=kincode-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=kincode-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key_for_LOCAL_DEV_only
```

> Get Firebase config from [Firebase Console](https://console.firebase.google.com/) → Project Settings → Web App
> Get Gemini key from [Google AI Studio](https://aistudio.google.com/apikey)

> ⚠️ **Production deploy:** Do **not** set `VITE_GEMINI_API_KEY` in Vercel. Instead set `GEMINI_API_KEY` (no `VITE_` prefix) in the Vercel project so the `/api/gemini` serverless proxy uses it server-side and the key never reaches the browser.

### 3. Run

```bash
npm run dev
```

Open `http://localhost:5173` on two browser tabs (or two devices on the same network) — one as **Parent**, one as **Family**.

### 4. Test the full flow

```
Tab A → "I'm a Parent" → Enter name → get code e.g. 4729
Tab B → "I'm Family"  → Enter code 4729 + your name → join

Tab A → Tap "VERIFY THIS CALL"
Tab B → Alert appears → Tap "No — I'm NOT calling!"
Tab A → Full-screen RED "SCAM DETECTED — HANG UP NOW" ✅
```

---

## 📁 Project Structure

```
kincode/
├── api/
│   └── gemini.js                # Vercel serverless proxy (hides Gemini key)
├── src/
│   ├── App.jsx                  # Router + global TextSizeToggle + InstallPrompt
│   ├── App.css                  # Dark theme, CSS variables, animations
│   ├── firebase.js              # Firebase init + all DB helper functions
│   ├── pages/
│   │   ├── Landing.jsx/css      # Home — role selection
│   │   ├── Setup.jsx/css        # Create/join family + AI memory setup
│   │   ├── Parent.jsx/css       # Verify button, RED/GREEN results, tips
│   │   └── Family.jsx/css       # Alert screen + response buttons
│   ├── components/
│   │   ├── TextSizeToggle.jsx   # A / A+ / A++ accessibility toggle
│   │   ├── InstallPrompt.jsx    # PWA "Add to Home Screen" banner
│   │   ├── ScamCallSimulator.jsx# 🎭 Demo: plays an AI-cloned scam call
│   │   └── ScamTacticAnalysis.jsx# 🔎 Gemini-powered scam tactic analyzer
│   └── services/
│       └── gemini.js            # Gemini calls (proxy + dev fallback)
├── database.rules.json          # Scoped Firebase security rules
├── .env.example                 # Env var template
├── vercel.json                  # SPA routing (excludes /api)
└── vite.config.js
```

---

## ♿ Accessibility Features

- **Text size toggle** (A / A+ / A++) — persisted across sessions, visible on every screen
- **Read Aloud** on SCAM and VERIFIED result screens via Web Speech API
- Minimum **80px** tap targets; **120px** on the primary verify button
- `aria-label` on every interactive element
- High-contrast palette: `#ff2d2d` red / `#00e676` green on near-black backgrounds
- Landscape mode fully scrollable

---

## 🤖 AI Memory Challenge

During setup, the parent enters up to 3 private family memories (e.g. *"Our first dog was named Buddy"*). Gemini 2.0 Flash generates 5 personalised verification questions and stores them in Firebase.

If the family member doesn't respond within **30 seconds**, KinCode shows a secret question:

> *"What was our first dog's name?"*

A scammer — even one with a cloned voice — cannot answer. Only the real family member can.

**Fallback:** If the Gemini API is unavailable, 3 hardcoded generic questions are used automatically.

---

## 👩‍💻 Team TechTitan — NJx Hackathon 2026

| Member | Role |
|:---|:---|
| Tulika | Full-stack development, UI/UX design |
| *(add teammates)* | *(add roles)* |

---

## 📄 License

MIT — open source for the community.
