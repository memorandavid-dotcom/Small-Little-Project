# ⏳ Chronos AI: Smart Time Manager & Academic Suite

An orchestrator for daily workflows, task division, curriculum diagnostics, and intelligent time allocation. Chronos AI is a full-stack, responsive productivity environment designed to keep individuals and teams focused, synchronized, and performing at their absolute highest capacity.

---

## 🚀 The Core Philosophy: Intention Over Noise

Chronos AI removes the chaos of multi-app juggling. Instead of scattering task managers, calendars, GPA calculators, pomodoro timers, and billing systems across separate services, Chronos AI bundles these tools into a single, cohesive, grid-aligned desktop and mobile control center.

---

## 🎯 Modular Feature Walkthrough

### 1. Unified Control Center (Dashboard)
* **Visual Rhythm**: Real-time analytical dashboard presenting your productive hours, current task loads, and chronological countdowns.
* **Smart Reminders**: Inline priority alerts indicating high-impact overdue goals or high-priority team task requirements.
* **Instant Action Targets**: Allows adding tasks or scheduling time slots with automated state updates.

### 2. Task & Project Partitioning (`Tasks & Projects`)
* **Hierarchical Checklists**: Deconstruct larger workflows into ordered, completion-tracked sub-steps.
* **Reminders & Alert Loops**: Specify exact reminder policies—ranging from Hourly bursts within custom quiet windows, to Daily specific times, to Weekly repeats.
* **Requirement Tracking**: Explicit inputs for process criteria (such as review stages) and essential physical or digital materials required to initiate work.
* **Estimated vs. Actual Analytics**: Built-in timers and logs to compare estimated workloads with real-time actual completion spans.

### 3. Progressive Scheduling & Time-Blocking (`Schedule`)
* **Dual-View Switch**: Transition instantly between an intuitive Month grid and a detailed daily Time-Block agenda.
* **Location-Aware Context**: Categorize events as **Online** (with automated connection links), **Hybrid**, or **In-Person** (with exact physical coordinates or location names).
* **AI Proposal Buffers**: Automatically synchronize schedule blocks with rest times and priority focus sessions.

### 4. Interactive Focus & Interval Engine (`Focus Timer`)
* **Three-Phase Loops**: Fully configured **Work**, **Break**, and **Review** Pomodoro intervals.
* **Radial Animation Ring**: High-contrast, dynamic SVG border displaying exact visual countdown percentages, adjusting color based on active state.
* **Control Center**: Instant pause, skip, reset, and custom configuration modifiers.

### 5. Unified Mail Center (`Mail Center`)
* **Avatar-Driven Inboxes**: Simulated mail flow highlighting important team messages and task dependencies.
* **One-Click Actions**: Flag emails as Important, Archive threads instantly, or read full content panels beside your active task tracking lists.

### 6. Academic Hub & Curriculum GPA Wizard (`Academic Hub`)
* **Stepped Subject Wizard**: A three-step progressive wizard that manages subject identification (Course Code, Name, Credits), temporal term lifecycles (Start and End bounds), and granular element parameters.
* **Intelligent Grading Systems**:
  * **Alphabetical Support**: Configurable A to F grading systems with manual percentage-point boundary mappings.
  * **Numerical Support**: 100 to 0 grading distributions with a special "Lower is Better" option for penalty or error-minimizing ranking formats.
* **Weight Impacts & Sliders**: Assess granular homeworks, quizzes, and examinations. Adjust individual assignment weight sliders (0-100%) and instant scoring indices to automatically synthesize full curriculum averages.

### 7. Team Sync & Client Billing Solutions (`Team Sync`)
* **Billable Hour Ledger**: Log accurate consulting or professional hours, assign precise rates, and record date matrices.
* **Structured PDF/CSV Export Mock**: Track which hours are "Invoiced" or "Unbilled" to avoid resource leakage.

### 8. System Settings & Customization (`Settings`)
* **Dynamic Tier Switching**: Seamlessly test Basic, Student, Pro, Premium, and Business configuration layers.
* **Two-Step Verification (2SV)**: Security layer modeling with verification badges.
* **Device Control**: Full-screen zoom viewports for avatar customization.

---

## 🧠 Gemini AI Copilot Integration

Chronos AI integrates directly with **Google Gemini models** through the modern `@google/genai` TypeScript SDK:

* **Intent Recognition Engine (`parsePrompt`)**: Evaluates unstructured conversational input and classifies it into clean actions:
  * `schedule_day`: Generates structured schedule coordinate blocks.
  * `task_breakdown`: Safely divides bulk descriptions into detailed sub-steps.
  * `clear_event`: Identifies target date boundaries for event cleanup.
  * `analyze_time`: Synthesizes time tracking logs into productivity analysis reports containing safety ratings and efficiency advice.
* **Task Decomposition Engine (`breakdownTask`)**: Generates actionable, itemized steps for any complex project with custom recommendations.

---

## 🛠️ Infrastructure & Tech Stack

* **Frontend**: React 19, Vite, Tailwind CSS 4 (Vite CSS module), Lucide Icons for vector clarity, and framer-motion (Motion React) for micro-animations.
* **Backend**: Express (CJS Bundle compiler output via `esbuild`), Tsx runner in development.
* **AI Model Pipeline**: `@google/genai` targeting `gemini-3-flash-preview` models over secure server-side proxy routes keeping secrets hidden from the browser.

---

## 🏃‍♂️ Getting Started

### Prerequisites

* Node.js 18 or superior
* Gemini API Key

### Environment Variables

Configure your `.env` following `.env.example`:

```env
# Server secret (never exposed to browser)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation

1. Install dependencies from package.json:
   ```bash
   npm install
   ```

2. Direct local development execution:
   ```bash
   npm run dev
   ```

3. High-Performance bundle build:
   ```bash
   npm run build
   ```

4. Boot compiled server:
   ```bash
   npm start
   ```
