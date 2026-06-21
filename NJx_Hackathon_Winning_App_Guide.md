# 🛡️ Lifeline — NJx Hackathon 2026 Winning Playbook
### Arc 2 (AI Defense) × Arc 3 (Accessible Security) · A family safety net against AI impersonation scams

> **One job for this document:** get you to a working two-phone demo + a 3-minute pitch that wins.
> Everything not essential to that has been cut.

---

## 0. The Pitch in One Breath

> **"Scammers can now clone your child's voice from a 3-second clip and call your mother screaming that he's in jail and needs bail money. She can't tell it's fake — nobody can. So we stopped trying to detect the fake. Lifeline verifies the call through a channel the scammer doesn't control, and defends the one thing AI can never clone: your family's shared memories."**

If a judge remembers one thing, it's: **they can clone his voice — they can't clone his childhood.**

---

## 1. Why This Wins (the strategy behind the choice)

The judging math: **Real Value (25%) + Customer Fit (15%) = 40%** of your score is *"is this for a real person, and do they need it?"* AI voice-cloning scams are causing real, devastating, *current* losses — and the victims (older adults) are the most sympathetic customer in the entire briefing.

| Criterion | Weight | How Lifeline scores |
|-----------|--------|---------------------|
| Real Value | 25% | Deepfake impersonation scams steal life savings from the elderly *right now*. Most visceral threat in the packet. |
| Execution | 20% | Out-of-band verification is a simple, bulletproof pub/sub architecture — 100% buildable and demoable in a weekend. |
| Customer Fit | 15% | Older adults + the adult children who set it up for them. You can name them and (bonus) test with a real one. |
| Innovation | 15% | Everyone else will try to *detect* deepfakes (and lose). You change the battlefield: verify + defend memories AI can't clone. |
| Pitch | 15% | You can simulate a terrifying cloned-voice call live, watch the panic, then defuse it in one tap. Maximum drama. |

**The differentiator, stated plainly:** Every other anti-deepfake project will build a *detector* — and a detector is a permanent arms race it will eventually lose to better generators. Lifeline never tries to tell real from fake. It verifies out-of-band (a channel the attacker can't touch) and falls back on private shared memories (which AI has no access to). That reframing is your innovation claim, and it is bulletproof.

**Why AI is still central (this protects you from the "why no AI at an AI hackathon?" trap):** AI does the work where it *won't* decay — generating and rotating personalized memory-based challenge questions, and analyzing the scam's social-engineering tactics in plain language. We use AI for the stable problems and human protocol for the unwinnable one. Say that out loud; it's a strength, not a gap.

---

## 2. What You're Building (scope discipline)

### The threat, concretely
A scammer clones a loved one's voice from social media audio, calls an elderly parent, and manufactures a panic emergency: *"Mom, I'm in jail, I need bail money now — and don't tell Dad."* The parent can't tell it's fake. They wire the money. It's gone.

Three manipulation levers, every time: **false urgency**, **isolation** ("don't tell anyone"), **false authority** ("this is the police").

### The product
**Lifeline = a family safety net.** An adult child sets it up for their parent in 5 minutes. When a scary call comes, the parent has a giant button that defuses it.

### MVP — build this FIRST, nothing else until it works
This is the bulletproof core and the heart of the demo:
1. Two registered devices linked as "family" (e.g., Parent ↔ Son).
2. Parent taps a big **"Verify This Call"** button.
3. A silent, high-priority push fires to the Son's *real* device: *"Is this you calling Mom for money?"* → **[I'm Safe — I'm not calling]**.
4. Parent's screen instantly flashes **RED: "SCAM — HANG UP NOW"** (or GREEN if confirmed real).

If that round-trip works between two phones, you have a winning demo. Everything below is stretch.

### Stretch goals (only after MVP works, in this order)
- **S1 — AI memory challenge (highest priority stretch; this is your innovation slide).** During setup, AI generates private challenge questions from family-supplied memories and rotates them. If the out-of-band ping isn't answered, the parent can challenge the caller: *"What did we name our first dog?"* A deepfake can't answer.
- **S2 — AI scam coaching.** While verifying, show big calm text: *"Breathe. Real emergencies never demand gift cards or wires in the next hour."* Let the user paste/record the message → AI names the tactics used (urgency / isolation / authority).
- **S3 — One-tap "loop in my family"** alert that notifies all linked members at once.
- **S4 — Accessibility pass:** huge text, high contrast, read-aloud (Web Speech API). This also earns you the Arc 3 lens for free.

---

## 3. How It Works (your technical credibility)

```
   PARENT'S PHONE                    LIFELINE BACKEND                 FAMILY MEMBER'S PHONE
   ──────────────                    ────────────────                 ─────────────────────
   "Verify This Call"  ──────────►   pub/sub + push    ──────────►    "Is this you? [Safe/Not me]"
        ▲                              (websocket /                          │
        │                               FCM push)                           │
   RED: SCAM ◄──────────────────────  relays answer  ◄────────────────────  taps answer
        │
        └── if no answer in N sec → AI memory challenge fires as fallback
```

**Three layers, each defeating the attack a different way:**
1. **Out-of-band verification** — the attacker controls the phone call, but *not* the family member's real device. Confirmation happens on a channel they can't reach. (No AI; bulletproof.)
2. **AI memory challenge** — the attacker can clone the voice, but has no access to private shared family memories. (AI generates/rotates; stable, not arms-race.)
3. **AI tactic coaching** — names the social-engineering playbook in plain words so the victim's panic breaks. (AI analysis; social-engineering patterns don't evolve like audio synthesis.)

**Key talking point:** "We never try to detect the fake. Detection is a losing arms race. We win on channels and knowledge the attacker fundamentally cannot access."

---

## 4. Tech Stack (matched to your tools)

- **Build with:** your AI coding agents (GHCP / Antigravity / Lovable) to scaffold fast.
- **App:** mobile-friendly PWA (works on two phones in the room) or React Native if comfortable. A clean responsive web app is enough for the demo.
- **Out-of-band channel:** WebSocket pub/sub (simplest for a live demo — e.g., Supabase Realtime, Firebase, or a tiny Node socket server) OR push notifications (FCM). **Pub/sub over a hosted realtime DB is the fastest bulletproof path.**
- **AI layer (Claude/OpenAI API):** generate memory challenge questions during setup; classify the manipulation tactics in a pasted scam message; write the plain-English coaching copy.
- **Demo deepfake clip:** generate one cloned-voice sample with a free TTS/voice tool for the live scare moment (use your *own* voice or a teammate's, with consent — don't impersonate a real public figure).
- **Deploy:** Vercel / Supabase free tier → live URL for the README and demo.

---

## 5. Build Order (do not deviate)

1. **Hour 0:** Public GitHub repo + README skeleton + deploy an empty app to a live URL. Commit.
2. **Build the link:** two devices register as a family pair (hardcode the pairing if needed for the demo — don't waste time on full auth). Commit.
3. **Build the out-of-band round-trip:** Parent taps Verify → Son's phone gets the prompt → answer flashes RED/GREEN on Parent's phone. Test across two real phones. Commit. **← This is the MVP. Protect it.**
4. **Polish the panic-moment UI:** giant button, RED/GREEN full-screen result, calm copy. Commit.
5. **S1 — AI memory challenge:** setup flow generates questions; fallback challenge screen. Commit.
6. **S2 — AI tactic coaching** if time. Commit.
7. **S4 — accessibility pass** (big text, contrast, read-aloud) — cheap points, do it if any time remains.
8. **Stop building 2 hours before deadline.** README + slides + practice the two-phone demo.

**Commit every 1–2 hours** — judges check history; steady commits beat a single Sunday dump.

---

## 6. Validate With a Real Person (do this Saturday — it's nearly free points)

You said you can reach someone outside. Use it. Within the first afternoon:
- Show the concept (even a rough mockup) to a real older adult — a grandparent, neighbor, anyone 60+.
- Ask: *"Have you ever gotten a call like this? Would you have known it was fake? Would you use a button like this?"*
- Capture **one quote.** "I would have sent the money" or "My friend lost $4,000 to exactly this" is the single most powerful line you can put in your pitch.

Almost no high-school team will walk in with real user validation. This is how you lock the 40% (Real Value + Customer Fit).

---

## 7. GitHub Repo — What Judges Need to See

Public repo. Clean structure. Working README.

**README must contain, in order:**
1. One-line description + the threat in 2 sentences
2. **Who it's for** (older adults + the adult children who set it up) — and your real-user quote if you got one
3. Live demo link
4. 2–3 screenshots (the RED "SCAM" screen is your hero image)
5. The 3-layer architecture diagram from Section 3
6. Tech stack + how to run locally
7. Team names + roles

**Before submitting:**
- [ ] Repo is **public**
- [ ] No API keys / secrets committed (check `.gitignore`)
- [ ] 5+ commits across the weekend
- [ ] Live demo URL works from a fresh browser
- [ ] README shows the RED scam-detected screen
- [ ] Local-run instructions actually work

---

## 8. Presentation — 8 Slides, ~3 Minutes

**Slide 1 — The Hook (30s).**
> *"Your mother just wired $5,000 to a kidnapper who doesn't exist — because she heard your voice asking for it."*

Single dark slide. No logo yet. Let that sentence sit for three seconds before you continue. The threat is real: AI voice-cloning scams stole **$1.1 billion from Americans last year**, disproportionately targeting adults over 60. This is not a hypothetical — it is happening in New Jersey today.

---

**Slide 2 — The Threat, Demonstrated (25s).**
Play your **pre-recorded cloned-voice clip** (your own voice or a teammate's, generated with a free TTS tool). Let judges hear the panic — *"Mom, I need bail money, please don't tell Dad"* — in a voice that sounds real.

Then land the brutal truth:
> *"A 3-second clip from any public video is enough. The victim hears a voice they trust. Their brain shuts down. That's the exploit — not technology. Panic."*

Stat overlay: **1 in 4 American adults has experienced an AI voice-cloning attempt.** Older adults lose an average of **$9,000 per incident**.

---

**Slide 3 — Why Every Other Team Will Fail (20s).**
> *"The obvious answer is a deepfake detector. Build one, ship it, win. Except — the next model ships, and your detector is wrong again. Detection is a permanent arms race you cannot win."*

Show the arms-race diagram: detector vs. generator, forever escalating.

> *"We refused to play that game. KinCode never tries to tell real from fake. It wins on terrain the attacker fundamentally cannot access."*

This slide pre-empts every competing project in the room and frames your innovation as strategically superior.

---

**Slide 4 — The People This Is For (15s).**
Photo of a real older adult (stock or your own contact). Name them — *"This is Margaret, 71, retired nurse from Trenton."*

> *"She doesn't need AI literacy. She needs one big button when she's scared. And her daughter in Philadelphia needs to know the moment it rings."*

If you collected a real-user quote on Saturday, drop it here in large text. *"I would have sent the money."* That one sentence is worth more than any technical diagram to these judges.

---

**Slide 5 — Introducing KinCode (20s).**
Show the **aurora gradient landing screen** — the app's actual UI, not a mockup.

> *"KinCode is a family safety net. Set up in 5 minutes. Works on any phone. No app store. No subscription. When a scary call comes, one tap activates a silent alert to every family member — on a channel the scammer cannot reach."*

Tagline, large:
> **"They can clone his voice. They can't crack your KinCode."**

Logo + team name: **Team TechTitan · NJx Hackathon 2026**.

---

**Slide 6 — LIVE DEMO (65–75s). This is the entire presentation.**

Run the demo exactly in this order — no deviations:

1. **The scare moment** — play the cloned-voice clip through your speaker. Let silence land.
2. **Parent phone** — show the aurora home screen. Tap **"I'm a Parent"**, show the circular pulsing red VERIFY button with its three expanding rings.
3. **Tap VERIFY** — the button sends a Firebase alert in under 1 second.
4. **Family phone** — screen strobes red, 8px border flashing, two 140px buttons: ✅ **YES IT'S ME** and 🚫 **NO I'M NOT CALLING**.
5. **Tap the NO button** — parent's screen slams to the **SCAM** result: animated diagonal red stripes sweeping across, 80px white "SCAM" text, "HANG UP NOW" below it.
6. **Then say:** *"But what if the family member doesn't answer? The scammer cloned the voice — they cannot clone the childhood."*
7. **Show the AI memory challenge screen** — *"What did we name our yellow dog?"* — generated live by Gemini 2.5 Flash from memories the family entered during setup. Personalized, unguessable, rotating.
8. **Bonus beat** — flip back to the parent idle screen, show the **verification history log**: ✅ Safe · Jun 18, 🚨 Scam blocked · Jun 19. *"Every outcome is logged. The family builds a record."*

---

**Slide 7 — Three Layers, One Architecture (20s).**

Show the ASCII architecture diagram. Walk it fast:

> **Layer 1 — Out-of-band verification.** Firebase Realtime Database. The scammer controls the phone call — they do not control your family member's device. Round-trip confirmed in under 3 seconds.

> **Layer 2 — AI Memory Challenge.** Gemini 2.5 Flash generates 3 personalized questions from private family memories during setup. Triggers automatically at 30 seconds — or immediately if a family member marks themselves unavailable. No deepfake can answer *"What's our secret pizza topping?"*

> **Layer 3 — Anti-panic coaching.** Rotating safety tips while waiting — including stalling scripts: *"Hold on, I need to get my reading glasses."* Buys time. Breaks the panic. Defeats urgency, the scammer's most powerful weapon.

> *"PWA-installable, works offline, accessible — large text toggle, read-aloud results, 140px buttons that hands don't miss when they're shaking."*

---

**Slide 8 — Close (15s).**

Return to the aurora landing screen. Minimal text.

> *"Every family has a KinCode. Today: two phones in this room. Tomorrow: the conversation you have with your parents this weekend — 'Let me set this up for you, it takes five minutes.'"*

> *"They can clone his voice. They can't crack your KinCode."*

**Team TechTitan** · [GitHub link] · [Live demo URL]

Ask for questions.

---

## 9. The 3-Minute Script (fill in [brackets], practice 3× out loud)

```
[0:00] "Imagine your mother's phone rings. It's your voice — panicked, in jail, begging
for bail money, telling her not to tell anyone. Except it isn't you. It's a clone built
from three seconds of your voice online. She can't tell. Nobody can.

[0:30] This is happening right now, and it's stealing billions from the people we love most.
Every instinct says build a deepfake detector — but detection is an arms race you lose the
day a better AI ships. So we refused to play that game.

[0:55] We built Lifeline — a family safety net. Let me show you. [TWO-PHONE DEMO:
play clone clip → Parent taps Verify → Brother confirms safe → Parent's screen goes RED.]

[2:00] And if he couldn't answer? The scammer cloned his voice — but they can't answer
'what did we name our first dog?' Our AI sets up and rotates private memory challenges no
deepfake can pass. We use AI where it wins, and human protocol where AI can't be trusted.

[2:35] [If you have a real-user quote:] We showed this to [real person], who told us '[quote].'
Today it's two phones in this room. Tomorrow, every family protects the people they're afraid
of losing — in five minutes. They can clone his voice. They can't clone his childhood.
We're [team]. Code's at [GitHub]. Thank you."
```

---

## 10. Demo-Day Safety

- [ ] The two-phone round-trip works on **your** actual devices, on the room's WiFi (test it there — realtime needs connectivity). Have a phone hotspot backup.
- [ ] **Recorded video backup** of the full two-phone flow, saved locally, in case live networking fails.
- [ ] Cloned-voice clip pre-loaded and ready to play (don't generate it live).
- [ ] Family pairing pre-set so you're not registering accounts on stage.
- [ ] Both phone screens visible to judges (mirror to the laptop/projector if possible, or hold them up clearly).

**Judge Q&A prep:**
- *"What if the family member doesn't answer the verification?"* → "That's exactly why there's a second layer — the AI memory challenge the caller can't pass, plus coaching that breaks the panic. Defense in depth."
- *"Isn't this just a safe word? People forget those."* → "Static safe words get forgotten or leaked. Ours are AI-generated from real memories and rotate, and the out-of-band ping needs no memory at all — just a tap."
- *"Why no deepfake detection at all?"* → "Because it's unwinnable long-term. We deliberately built on things the attacker can never access — a second device and private memory. That's what makes it durable."
- *"How is the verification secure / can't a scammer trigger it?"* → "Verification only flows between pre-linked family devices; an outsider can't inject into the loop."

---

## 11. Final Validation Before You Submit

- [ ] Two-phone round-trip works end-to-end: Verify → confirm → RED/GREEN result
- [ ] Demo tested on the venue network with a hotspot fallback ready
- [ ] AI memory-challenge stretch working (your innovation slide depends on it — prioritize it)
- [ ] Real-user quote captured (Saturday) — even one sentence
- [ ] GitHub public, README complete with the RED screen screenshot, no secrets, steady commits
- [ ] 8 slides, opens with the hook, two-phone demo included
- [ ] Pitch practiced out loud, timed under 3 minutes, 3 times
- [ ] Video backup of the demo saved locally

---

**The one thing that wins this:** in your demo, make the judges feel the parent's panic when the cloned voice begs for money — then defuse it in one tap. Build that moment. Everything else serves it.

*NJx Hackathon 2026 · Submission deadline: 12:00 PM Sunday*
