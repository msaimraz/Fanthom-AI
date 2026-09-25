# Fathom AI Meeting Notetaker Rebuild

A high-fidelity, functional web reconstruction of **Fathom (fathom.video)**, the AI meeting notetaker and meeting intelligence platform. This project was developed as a 24-hour product reconstruction assignment focusing on the post-capture user experience: library management, synchronized recording playback, interactive transcripts, multi-template AI summaries, actionable tasks, trimmed clips, and spotlight search.

---

## 1. Overview

This project reconstructs the core product experience of Fathom for an evaluation assignment. Rather than building a live conferencing bot daemon (for Zoom/Google Meet/Microsoft Teams) or an external speech-to-text API pipeline, this assignment purposely focuses on the high-value **product experience after a meeting has been captured**:

```
Meetings Library ──> Meeting Detail ──> Synchronized Playback ──> Real-Time Transcript ──> AI Summary & Templates ──> Action Items ──> Clips & Highlights ──> Cross-Meeting Search
```

### Core User Experiences Rebuilt:
- **Meeting Library & Dashboard**: An overview of recorded calls with duration tags, attendee face-piles, category filtering (*Customer Deals*, *Engineering & Ops*, *1-on-1s*), and an **"Ask Fathom" AI Copilot bar** with prompt suggestions and timestamped answers.
- **Recording & Playback Stage**: A simulated conference video stage with active speaker detection, dynamic borders, and an interactive audio player supporting variable speeds (`1x` to `2x`), keyboard shortcuts (Space, Arrow keys), and chapter ticks.
- **Synchronized Transcript**: Utterances mapped to timestamps. As audio plays, the current turn highlights with Fathom's signature cyan accent. Clicking any timestamp pill seeks audio immediately; scrolling pauses auto-follow with a floating "Resume scroll" pill.
- **Multi-Template AI Summaries**: Instant template switching (*Executive Brief*, *Sales MEDDPICC*, *Engineering RCA*, *1-on-1 Coaching*) that dynamically recalculates overviews, metric grids, key discussion points, and next steps with 1-click clipboard copying.
- **Interactive Action Items**: Checkable tasks with persistent state (`localStorage`), attendee avatars, context quotes, and a direct **"Jump to quote"** audio button.
- **Highlights & Clips Creation**: Trim meeting moments into standalone clips using range sliders, preview the trimmed audio slice, generate shareable links, and inspect public standalone viewers (`/share/:clipId`).
- **Spotlight Cross-Meeting Search (`Ctrl+K` / `⌘K`)**: Deep search across call titles, spoken transcript statements, and action items with deep links directly to specific seconds (`?t=...`).

> **Note on Architecture Scope**: In accordance with the assignment guidelines, external conferencing bots (Zoom/Meet bot daemons), real-time microphone capture, authentication walls, and external database servers were intentionally excluded. The application runs entirely client-side using deterministic, realistic seeded meetings and real pre-recorded multi-speaker audio with zero login barriers.

---

## 2. Features

### Meeting Library & Intelligence
- **"Ask Fathom" AI Search**: Global AI question box with clickable prompt suggestions (`What were David Chen's latency requirements?`, `Show Elena's security & procurement next steps`) that output syntheses and deep-link buttons.
- **Smart Category Filtering**: Segmented filtering across *All Meetings*, *Customer Deals*, *Engineering & Ops*, and *1-on-1s*.
- **Rich Meeting Cards**: Displays media preview thumbnails, audio waveforms, duration badges, attendee stacks, and task completion ratios.

### Playback & Conference Visualizer
- **Realistic Speaker Stage**: Multi-participant conference video grid displaying speaker avatars, roles, host badges, and an active speaker border (`border-cyan-400 ring-1`) with a live pulsing microphone beacon.
- **Subtitles Overlay**: Real-time frosted subtitle pill pinned to the bottom of the video stage showing current speech.
- **Custom Scrubber Bar**: Cyan gradient progress fill, chapter markers with hover tooltips, and a floating timestamp preview bubble.
- **Full Player Controls**: Play/Pause toggle, skip ±5s, monospace time readouts, speed toggles (`1x`, `1.25x`, `1.5x`, `2x`), volume slider with mute toggle, and clickable chapter pills.
- **Keyboard Shortcuts**: `Space` for Play/Pause, `←` / `→` for skipping ±5s.

### Transcript Experience
- **Bidirectional Audio ↔ Transcript Synchronization**: Audio time updates illuminate the active transcript block in real time.
- **Click-to-Seek**: Every utterance features a clickable timestamp pill (`[00:22]`, `[01:08]`) that seeks audio and resumes playback.
- **In-Transcript Filter**: Instant search box within the active meeting transcript.
- **Smart Auto-Scroll**: Smoothly tracks playback; temporarily halts if the user scrolls away, showing a floating **"Resume scroll"** button.

### Multi-Template AI Summaries
- **Dynamic Template Switching**:
  - **Executive Brief**: High-level executive synthesis, strategic impact, and critical deadlines.
  - **Sales (MEDDPICC)**: Metrics (latency, RPM, budget), Economic Buyer, Decision Criteria, Decision Process, and Pain Points.
  - **Engineering (RCA)**: Timeline of events, root cause analysis, detection gaps, and preventive measures.
  - **1-on-1 Coaching**: Wins & highlights, blockers, development goals, and feedback exchange.
- **Quantitative Metrics Grid**: Displays extracted SLA numbers, throughput, contract values, or latency figures in clean metric cards.
- **One-Click Copy**: Copies markdown-formatted meeting summaries directly to the clipboard.

### Action Items & Productivity
- **Interactive Checkboxes**: Click to toggle task completion with immediate visual strikethrough.
- **State Persistence**: Task completions persist across page reloads using browser `localStorage`.
- **Context Evidence**: Expandable context quotes showing the exact statement made during the meeting.
- **"Jump to Quote" Audio Link**: Dedicated button seeking audio to the exact second the task was agreed upon.

### Clips, Highlights & Public Sharing
- **Clip Trimming Modal**: Range sliders to adjust start and end trim bounds, live duration calculation, selected dialogue preview, and audio test playback.
- **Clip Management**: List of saved clips with duration badges, quote snippets, speaker tags, and delete actions.
- **Share Modal**: Read-only public share URL generator, 1-click URL copier, and embed `<iframe>` snippet.
- **Standalone Public Share Route (`/share/:clipId`)**: Dedicated public viewer route featuring isolated audio slice playback, waveform progress, quote card, and a "View Full Meeting" button.

### Global Command Palette (`Ctrl+K` / `⌘K`)
- **Spotlight Search**: Modal overlay accessible from anywhere via `Ctrl+K`, `⌘K`, or the navigation bar.
- **Cross-Entity Queries**: Searches meeting titles, spoken transcript turns, and action items simultaneously.
- **Timestamp Deep-Linking**: Clicking any matching transcript moment navigates to `/meetings/:id?t=:seconds&tab=transcript` and auto-seeks the audio.

---

## 3. Tech Stack

Inspect `package.json` to verify the actual installed dependencies and tools used:

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) (`^19.0.0`) | Latest declarative UI library with React DOM (`^19.0.0`) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (`~5.7.3`) | Strictly typed interfaces for meetings, transcripts, summaries, and actions |
| **Build Tool & Dev Server** | [Vite 6](https://vitejs.dev/) (`^6.2.0`) | Rapid HMR bundling with `@vitejs/plugin-react` |
| **Routing** | [React Router v7](https://reactrouter.com/) (`^7.3.0`) | Client-side routing (`/meetings`, `/meetings/:id`, `/share/:clipId`) |
| **Styling & Design System**| [Tailwind CSS v4](https://tailwindcss.com/) (`^4.0.12`) | Modern utility CSS with `@tailwindcss/vite` plugin and Fathom design tokens |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) (`^5.0.3`) | Lightweight state stores with `persist` middleware for `localStorage` persistence |
| **Icons** | [Lucide React](https://lucide.dev/) (`^1.16.0`) | Modern SVG icon library for SaaS controls and audio indicators |
| **Class Utilities** | `clsx` (`^2.1.1`), `tailwind-merge` (`^3.0.2`) | Conditional and merged utility classes |
| **Automated Testing** | [Puppeteer Core](https://pptr.dev/) (`^25.11.0`) | Headless browser automation QA suite for 20 verification flows |

---

## 4. Project Structure

```
Fanthom-AI/
├── .agents/                      # Continuous agent turn capture scripts (do not modify)
├── .agent-logs/                  # Verified session logs from the capture system
├── CAPTURE-TEST.md               # Capture hook verification artifact
├── public/
│   ├── favicon.svg               # Fathom cyan brand icon
│   └── assets/
│       └── audio/
│           └── hero-sales.mp3    # Authentic 153.1s multi-speaker audio asset
├── src/
│   ├── main.tsx                  # Application entry point mounting to root
│   ├── index.css                 # Fathom design tokens, scrollbars, and range slider styles
│   ├── app/
│   │   └── App.tsx               # Primary layout shell, navigation, and Route definitions
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx        # Sticky header with breadcrumbs and ⌘K trigger
│   │       ├── Sidebar.tsx       # 224px navigation sidebar with smart views and profile
│   │       └── GlobalSearchModal.tsx # Spotlight Ctrl+K cross-meeting search dialog
│   ├── data/
│   │   ├── seed/                 # Deterministic seeded meeting datasets
│   │   │   ├── heroSalesMeeting.ts   # Acme Corp x CloudScale Enterprise Sales (Hero)
│   │   │   ├── incidentMeeting.ts    # P0 Incident Post-Mortem (Auth Latency Spike)
│   │   │   ├── productMeeting.ts     # Q4 Product Strategy & Mobile App Design
│   │   │   ├── oneOnOneMeeting.ts    # Quarterly Career & Feedback Review
│   │   │   └── index.ts              # Aggregated seed registry
│   │   └── templates/
│   │       └── index.ts          # AI summary template definitions (Sales, Exec, RCA, 1:1)
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx # Meetings library, "Ask Fathom" AI box, category filters
│   │   │   └── MeetingCard.tsx   # Individual meeting preview cards with duration badges
│   │   ├── detail/
│   │   │   └── MeetingDetailPage.tsx # Main split workspace (player + intelligence tabs)
│   │   ├── player/
│   │   │   ├── MediaPlayer.tsx   # Audio controls, scrubber, chapter markers, speed toggles
│   │   │   └── SpeakerStage.tsx  # Conference video grid, active speaker highlighting, subtitles
│   │   ├── transcript/
│   │   │   └── TranscriptView.tsx # Click-to-seek utterances, active turn sync, auto-scroll
│   │   ├── summary/
│   │   │   └── SummaryView.tsx   # Template selector, overview, metric cards, next steps
│   │   ├── actions/
│   │   │   └── ActionItemsView.tsx # Persistent checkboxes, assignee tags, jump-to-quote seek
│   │   └── clips/
│   │       ├── ClipsView.tsx     # Highlights list and saved trimmed clips
│   │       ├── CreateClipModal.tsx # Start/end time trimming modal
│   │       ├── ShareClipModal.tsx  # Share link and iframe embed snippet dialog
│   │       └── ShareClipPage.tsx   # Standalone public route (/share/:clipId)
│   ├── store/
│   │   ├── useMeetingsStore.ts   # Meetings collection, active templates, and action persistence
│   │   └── usePlaybackStore.ts   # Decoupled high-frequency playback time, rate, and active turns
│   ├── types/
│   │   └── index.ts              # Type definitions (Meeting, Participant, Turn, ActionItem, etc.)
│   └── utils/
│       └── formatters.ts         # Time (MM:SS), date, and duration formatting helpers
├── index.html                    # Root HTML document with Google Fonts (Plus Jakarta Sans)
├── package.json                  # Dependencies and build scripts
├── tsconfig.json                 # TypeScript project configuration
└── vite.config.ts                # Vite configuration with React and Tailwind CSS v4 plugins
```

---

## 5. Requirements

To run this project locally, ensure you have the following software installed:

- **Node.js**: `v18.0.0` or later (Recommended: `v20.x` or `v22.x` / `v25.x` LTS)
- **npm**: `v9.0.0` or later (bundled with Node.js)
- **Web Browser**: Any modern browser (Google Chrome, Microsoft Edge, Firefox, or Safari) with HTML5 Audio support

---

## 6. Installation — Step by Step

Follow these steps to clone, install, and run the project locally.

### Step 1 — Clone the repository

```bash
git clone https://github.com/msaimraz/Fanthom-AI.git
```

### Step 2 — Enter the project directory

```bash
cd Fanthom-AI
```

### Step 3 — Install dependencies

Install the project dependencies via npm:

```bash
npm install
```

### Step 4 — Run the development server

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Once started, open your browser and navigate to the displayed local address (typically **[http://localhost:5173](http://localhost:5173)**).

### Step 5 — Production build & preview (Recommended for evaluation)

To compile the production bundle and preview it in an optimized production-like environment:

```bash
# Compile TypeScript and bundle assets with Vite
npm run build

# Preview the production build
npm run preview -- --port 4173
```

Open **[http://localhost:4173](http://localhost:4173)** in your browser.

---

## 7. Evaluating the Experience (Recommended Walkthrough)

To quickly evaluate the core user loops as an evaluator:

1. **Dashboard & Library (`/meetings`)**:
   - Notice the **"Ask Fathom" AI Assistant** at the top. Click any of the suggestion chips (e.g. *"What were David Chen's latency requirements?"*) and click **"Jump to moment in call"**.
   - Filter by categories (*Customer Deals*, *Engineering & Ops*, *1-on-1s*) and inspect the cards.
2. **Hero Meeting (`Enterprise Sales Discovery & Demo`)**:
   - Open the hero meeting card.
   - Press `Space` or click the cyan **Play** button to begin the authentic multi-speaker audio conversation.
   - Observe the **Speaker Stage**: the active speaker's tile illuminates with a cyan border, active badge, and live subtitle display.
3. **Synchronized Transcript**:
   - As audio plays, watch the transcript auto-scroll and highlight the speaking participant.
   - Click any timestamp pill (e.g. `[00:22]` or `[01:08]`) to verify instant seek and playback continuation.
   - Scroll up during playback: notice auto-scroll pauses and a floating **"Resume scroll"** button appears.
4. **AI Summary & Multi-Template Switching**:
   - Switch to the **Summary** tab.
   - Click between the templates (*Executive Brief*, *Sales MEDDPICC*, *Engineering RCA*, *1-on-1 Coaching*) to verify dynamic content recalculation.
   - Click **"Copy Summary"** and verify clipboard feedback.
5. **Interactive Action Items**:
   - Switch to the **Tasks** tab.
   - Click a checkbox to toggle completion.
   - Click **"Jump to quote"** to seek playback to the moment the task was discussed.
   - Refresh the browser (`F5`): verify completed states persist via `localStorage`.
6. **Highlights & Clips Creation**:
   - Switch to the **Clips** tab and click any highlight to seek to that moment.
   - Click **"New Clip"**, adjust the start/end trim sliders, and save the clip.
   - Click **"Share"** on any clip, copy the link, or click **"Open Public Clip Page"** to inspect the standalone `/share/:clipId` viewer.
7. **Spotlight Search (`Ctrl+K` / `⌘K`)**:
   - Press `Ctrl+K` (or click Search in the header).
   - Type `"latency"` and press `Enter` on any spoken quote to deep-link straight to that second in the meeting.

---

## 8. Automated Browser QA Suite

The repository includes a standalone Puppeteer test runner verifying 20 critical user flows (play/pause, scrubbing, timestamp seeking, active speaker borders, template switching, action persistence, clip creation, public sharing, and responsive layouts):

```bash
# 1. Build and launch preview in one terminal
npm run build
npm run preview -- --port 4173

# 2. In another terminal, run the automated QA runner
node scratch/qa_runner.mjs
```

All 20 flows execute headlessly in Chrome/Edge and report:
- `20 / 20 Tests Passed`
- `0 Browser Console Errors`

---

## Backend

Fanthom uses Supabase PostgreSQL and the Supabase API (`@supabase/supabase-js`) as its runtime data layer and source of truth.

### 1. Create a Supabase Project
1. Sign in to the [Supabase Dashboard](https://supabase.com/dashboard) and create a new PostgreSQL project.
2. Navigate to **Project Settings → API** and copy your **Project URL** and **`anon` `public` API key**.

### 2. Required Environment Variables
Copy `.env.example` to `.env` in the repository root and provide your public project credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

> **Security Note**: Never commit `.env` or expose your `service_role` secret key in any `VITE_` variable or browser code. Only the public `anon` key is used by the frontend.

### 3. Run Database Migrations
1. Open the **SQL Editor** in your Supabase Dashboard.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
3. This creates all 10 relational tables (`workspaces`, `profiles`, `meetings`, `participants`, `meeting_participants`, `transcript_segments`, `summaries`, `action_items`, `highlights`, and `clips`), foreign keys, search/timestamp indexes, and least-privilege Row Level Security (RLS) policies.

### 4. Seed Demo Data
Run the repeatable, non-destructive seed script to populate the demo workspace (`Fanthom Intelligence`), admin profile (`Sarah Lin — Workspace Admin`), and the 4 meetings with their participants, transcripts, summaries, action items, highlights, and clips:

```bash
npm run seed
```

Running `npm run seed` (`scripts/seed-supabase.ts`) uses `ON CONFLICT DO NOTHING` (`ignoreDuplicates: true`) so re-running it never creates duplicate rows, never overwrites completed action items, and never deletes user-created highlights or clips.

### 5. Run Locally
```bash
npm run dev
```

### 6. How the Demo Workspace & RLS Security Model Work
- All seeded meetings belong to a single deterministic demo workspace (`00000000-0000-4000-8000-000000000001`) and admin profile (`Sarah Lin — Workspace Admin`).
- **Row Level Security (RLS)** is enabled on all 10 tables and scoped strictly to the demo workspace:
  - Core reference tables (`workspaces`, `profiles`, `participants`, `meeting_participants`, `transcript_segments`, `summaries`) forbid anonymous `UPDATE` and `DELETE` operations.
  - Interactive tables (`action_items`, `highlights`, `clips`) allow scoped reads and persisted user interactions (`UPDATE` on action item status, `INSERT` on highlights and clips, and `DELETE` restricted solely to non-seeded user-created clips).
  - Public database reset is disabled in the UI to protect shared workspace state.

### 7. Current Authentication Limitation
This demo uses a public demo workspace without user authentication. Production authentication and stricter workspace authorization would be added before real customer deployment.


