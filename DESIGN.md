# Canvas2Calendar — Design Specification

## Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| Berkeley Blue | `#003262` | Primary brand, headers, sidebar, buttons |
| Cal Gold | `#FDB515` | Accents, active states, progress bars, streak badge, CTAs |
| Background | `#F0F2F5` | App background |
| Surface | `#FFFFFF` | Cards |
| Text primary | `#111827` | Body text |
| Text secondary | `#6B7280` | Captions, labels |
| Border | `#E5E7EB` | Dividers, input borders |

### Typography
- **Font:** Inter
- Page titles: 22–24px bold
- Card headings: 15–17px semibold
- Body: 14–15px regular
- Labels / captions: 11–12px medium

### Spacing & Shape
| Property | Value |
|---|---|
| Card radius | 16px |
| Button radius | 12px |
| Input radius | 14px |
| Pill / badge radius | 999px |
| Card shadow | `0 1px 4px rgba(0,0,0,0.08)` |

---

## Shared Component: Sidebar

### Desktop (220px wide, fixed left, full height)
- Background: Berkeley Blue `#003262`
- **Top:** Cal Gold graduation-cap icon + "Canvas2Calendar" white bold text
- **Nav items** (14px medium, vertical list):
  - Dashboard — LayoutDashboard icon
  - Courses — BookOpen icon
  - Tasks — ListChecks icon
  - Calendar — CalendarDays icon
  - Settings — Settings icon
- Active: Cal Gold text + Cal Gold/15% background pill
- Inactive: white/65%, hover white
- **Bottom:** 32px circular avatar + full name (white 14px) + email (white/40% 12px)

### Mobile (bottom tab bar, 60px)
- Background: Berkeley Blue
- 4 tabs: Dashboard, Courses, Tasks, Calendar
- Active: Cal Gold icon + label
- Inactive: white/50%

---

## Screens

### 1. Auth
**Route:** `/auth` — public

Centered layout, white background, max-width 400px.

| Element | Spec |
|---|---|
| Monogram | "B" or Berkeley seal, 40px, Berkeley Blue |
| Heading | "Welcome to Canvas2Calendar" — 22px bold, Berkeley Blue |
| Subheading | "Your academic accountability partner for UC Berkeley" — 14px gray |
| Google button | Full width, 48px, white bg, Berkeley Blue border 1.5px, Google logo left, "Continue with Berkeley Google" |
| SCET badge | Bottom — "Built for SCET students", Berkeley Blue bg, white text, 11px pill |

**Flow:** → Onboarding Step 1

---

### 2. Onboarding — Step 1: Role
**Route:** `/onboarding` — public

Centered, white bg, 3-dot step indicator at top (step 1 active = Berkeley Blue filled).

| Element | Spec |
|---|---|
| Heading | "What's your role?" — 22px bold |
| Subheading | "We'll personalize Canvas2Calendar for you" — gray |
| Student card | Graduation cap icon, "I'm taking courses this semester", 140px tall, 2px border (Berkeley Blue when selected) |
| Faculty card | Briefcase icon, "I'm teaching or researching", same size |
| Continue button | Full width, Berkeley Blue bg, white text, disabled until selection |

**Flow:** Student → Step 2 · Faculty → Coming Soon

---

### 3. Onboarding — Step 2: SCET Mode
**Route:** `/onboarding` (step 2) — public

Same centered layout, step 2 of 3 active.

| Element | Spec |
|---|---|
| Heading | "How are you engaging with SCET?" |
| Certificate card | Award icon, "I'm completing the full certificate program", CORE badge |
| Single course card | BookOpen icon, "I'm enrolled in one SCET course" |
| Nav | Back link (small text) + Continue button |

---

### 4. Onboarding — Step 3: Course Selection
**Route:** `/onboarding` (step 3) — public

Same layout, step 3 of 3 active.

| Element | Spec |
|---|---|
| Heading | "Which SCET courses are you taking?" |
| Subheading | "Select all that apply this semester" |
| Course list | Grouped by category with section headers (CORE / Challenge Labs / Special Topics / DeCals) |
| Row | Checkbox (Berkeley Blue border, Cal Gold check when selected) + course code + name |
| Finish button | "Finish Setup" — full width, Berkeley Blue |

**Flow:** → Dashboard

---

### 5. Sync
**Route:** `/sync` — protected

Centered, white background, max-width 420px.

#### Default (iCal method)
| Element | Spec |
|---|---|
| Header | Canvas orange "C" logo (`#E66000` circle SVG) + "bCourses" 22px semibold |
| Step 1 | Dark circle "1" + "go to your bCourses calendar" (blue underline link) |
| Step 2 | Dark circle "2" + "click "Calendar Feed" at the bottom right" |
| Step 3 | Dark circle "3" + "copy the feed URL and paste it below" |
| Input | Full width, 48px, 16px radius, placeholder "paste calendar feed URL" |
| Button | "connect" — full width, 48px, `#111827` bg, white bold, 16px radius |
| Toggle | "use API key instead (advanced, more setup required)" — small gray text link |

#### API Key method (toggle state)
- Same layout, steps changed for token flow
- Password input instead of URL input
- Toggle: "use calendar feed instead (simpler)"

#### Syncing state
- 40px circular spinner (dark border, top transparent, rotating)
- "Syncing your courses…" heading
- "Fetching assignments and enriching with AI" subtext

#### Success state
- 48px green circle + white checkmark
- "Connected!" heading
- "Taking you to your assignments…" subtext

**Flow:** connect → syncing → success → Dashboard

---

### 6. Dashboard
**Route:** `/dashboard` — protected, uses Sidebar

#### Header bar
- Full width, Berkeley Blue, 56px tall
- Left: user avatar (36px circular)
- Center: "Canvas2Calendar Dashboard" white bold
- Right: "CB" monogram in Cal Gold circle

#### Today's Focus card
- White card, 16px radius, shadow
- **Header strip:** Berkeley Blue bg, "TODAY'S FOCUS" white bold uppercase centered
- **Task rows** (3 tasks):
  - 32px checkbox (rounded square, Berkeley Blue border) + task name 15px bold + course/source 12px gray below
  - Completed: checkbox filled Berkeley Blue + white checkmark, name strikethrough
- **Progress section:**
  - "DAILY GOAL: 75% COMPLETE" — 11px bold uppercase
  - Cal Gold progress bar, 12px tall, rounded full

#### Weekly Momentum card
- White card, 16px radius
- "WEEKLY MOMENTUM" — Berkeley Blue bold 17px
- Area chart, 190px tall:
  - Cal Gold line (3px stroke) + Cal Gold/25% area fill
  - Horizontal-only gray grid lines
  - X-axis: Mon Tue Wed Thu Fri Sat Sun
  - Y-axis: 0% 20% 40% 60% 80% 100%
  - Dots: Cal Gold filled 5px circles
  - Upward-trending sample data (5%, 20%, 40%, 50%, 60%, 80%, 92%)
- "On Track: 4 of 5 Days with High Focus" — 14px centered below chart

#### Quick-link cards (2 columns)
- **Courses:** Cal Gold BookOpen icon + "Courses" Berkeley Blue bold + "Track progress" gray
- **Calendar:** Cal Gold CalendarDays icon + "Calendar" Berkeley Blue bold + "Schedule tasks" gray

---

### 7. Coursework
**Route:** `/coursework` — protected, uses Sidebar

#### Header
- "Coursework Accountability" — 24px bold, Berkeley Blue on `#F0F2F5`

#### Streak + Finals row (white card)
- Left: Cal Gold pill — flame icon + "14 Day Streak" (Berkeley Blue bold 15px) with "Study Streak" label above in 11px gray
- Right: Cal Gold calendar icon + "32 Days Until Finals" Berkeley Blue 15px semibold

#### Demo notice (shown when no Canvas data synced)
- Amber border + bg, BookOpen icon, message, "Sync →" link on right

#### Course grid (2 columns, 16px gap)
Each card (white, 16px radius, shadow):
- Course name: 15px bold, leading-snug
- Cal Gold progress bar: 14px tall, rounded full
- Completion label: "75% Complete (9/12 assignments)" — 13px gray
- "Deep Dive" button: full width, 40px, Cal Gold bg, Berkeley Blue bold text, 12px radius

Sample courses:
| Course | Progress |
|---|---|
| CS 61A: Structure & Interpretation of Computer Programs | 75% |
| DATA 8: Foundations of Data Science | 60% |
| ECON 1: Introduction to Economics | 45% |
| POL SCI 2: Intro to Comparative Politics | 90% |

#### Overall Progress card (bottom)
- "Overall Progress" label
- Cal Gold progress bar (average of all courses)
- "67% average across 4 courses" caption

**Deep Dive flow:** → Decomposition / Tasks page

---

### 8. Coming Soon
**Route:** `/coming-soon` — public

| Element | Spec |
|---|---|
| Background | Berkeley Blue full screen |
| Monogram | "CB" — Cal Gold, 64px |
| Heading | "Coming Soon" — white 28px bold |
| Body | "Faculty features are under development. We'll notify you when they're ready." — white/70% 15px centered |
| Link | "Back to login" — Cal Gold small text |

---

## Navigation & Flows

```
/auth
  └── Google sign-in
        ├── new user → /onboarding (step 1 → 2 → 3) → /dashboard
        └── returning user → /dashboard

/onboarding step 1
  ├── Student → step 2 → step 3 → /dashboard
  └── Faculty → /coming-soon

/sync
  └── connect (iCal or API key) → syncing → success → /dashboard

Sidebar (all protected pages)
  Dashboard ↔ Courses ↔ Tasks ↔ Calendar ↔ Settings
```

---

## Responsive Behavior

| Breakpoint | Sidebar | Content |
|---|---|---|
| Desktop (≥ 768px) | Fixed left, 220px wide | Offset 220px left |
| Mobile (< 768px) | Hidden — replaced by bottom tab bar | Full width, padding-bottom 60px |

---

## Design Principles

- **Academic, not startup.** Berkeley Blue and Cal Gold should feel authoritative. No gradients, no illustrations, no playful copy.
- **Cards on `#F0F2F5`.** All content lives in white cards on the gray background — maintains hierarchy.
- **Gold for progress.** Progress bars, streak badges, active states, and primary CTAs all use Cal Gold. Reserve it — don't overuse.
- **Sidebar is always present** on desktop for authenticated pages. It anchors the identity of the app.
- **Data-forward.** The momentum chart and progress bars are the hero elements of the dashboard — size and position them prominently.
