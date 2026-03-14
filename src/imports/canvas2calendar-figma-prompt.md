Good. Now we’re moving from **concept clarity → interface translation**.

I’m going to give you a **high-quality Figma Make / AI prompt** that:

* Reflects your updated product direction
* Matches your persona (Marcus + Priya)
* Shows automation + manual control clearly
* Avoids feature creep
* Focuses on “Weekly Execution Engine”

You can paste this directly into Figma AI / FigJam generation.

---

# 🎨 FIGMA PROMPT — Canvas2Calendar (Iteration 2)

---

## 🧠 Context for Figma

Design a clean, modern productivity web app called:

**Canvas2Calendar – Weekly Execution Engine**

The product connects to Canvas, automatically extracts weekly coursework (assignments, prereading, discussion posts, hidden subtasks), breaks them into structured micro-tasks, and lets students manually prioritize and drag tasks into a weekly calendar.

This is NOT a generic to-do app.
It is a course-aware academic execution tool.

Primary user:
Busy Berkeley student taking 3–5 courses who wants control, structure, and clarity without manual rewriting.

---

# 🖥️ Create 5 Core Screens

---

## 1️⃣ Screen 1: Connect & Select Course

**Goal:** Show light automation + user control.

Layout:

* Clean dashboard with card layout of Canvas courses
* Button: “Sync with Canvas”
* After sync → show list of courses
* User selects: SCET 183 – Product Management

UI Elements:

* Course cards
* Status badge: “Synced 2 mins ago”
* CTA button: “Import This Week”

Design tone:
Minimal, calm, academic.
No clutter.

---

## 2️⃣ Screen 2: Auto Breakdown Review (Trust Layer)

Title:
“Here’s what your week actually contains.”

This screen builds trust before automation proceeds.

Layout:
Left side:

* Extracted assignments
* Each expandable

When expanded:

* Microtasks auto-generated:

  * Section 1a – Read brief
  * Section 1b – Draft response
  * Section 1c – Submit screenshots
  * Pre-reading Chapter 3
  * Optional Participation Points

Each task shows:

* Official deadline
* Estimated time
* Category tag (Reading / Assignment / Discussion / Optional)

Buttons:

* “Approve All”
* “Review Individually”

Important:
User must confirm before tasks move forward.

This aligns with persona need for control.

---

## 3️⃣ Screen 3: Structured Weekly Workspace (Priority View)

Title:
“Organize Your Week”

Layout:
Two columns:

LEFT: Task Inbox

* All approved tasks
* Sorted by deadline initially
* Draggable

RIGHT: Priority Stack

* Vertical list
* User drags tasks top → bottom
* Top = highest priority

Under each task:

* Deadline
* Time estimate
* Expand arrow for rubric/material details

Design must feel:
Structured.
Intentional.
Not chaotic.

This is the manual control moment.

---

## 4️⃣ Screen 4: Weekly Calendar Builder

Title:
“Turn priorities into execution”

Layout:
Weekly calendar (Mon–Sun)

Left panel:
Remaining tasks

User interaction:

* Drag tasks into time blocks
* Blocks auto-size based on estimated time
* Smart suggestions (ghost suggestions):
  “Suggested Wednesday 4–5PM”

User can:

* Accept suggestion
* Override manually

Visual detail:
Color-code by category:
Blue = Reading
Orange = Assignment
Purple = Discussion
Gray = Optional

This is where automation supports, but does not override.

---

## 5️⃣ Screen 5: Execution Dashboard

Title:
“Weekly Execution Dashboard”

Shows:

* Progress bar
* % completed
* Tasks remaining
* Hours scheduled vs remaining

Daily view:
Monday
✔ Read Chapter 3
✔ Watch Lecture
◻ Draft Discussion

Feature:
If a task is not completed:
System suggests rebalancing remaining tasks automatically.

But does NOT reschedule without confirmation.

---

# 🧩 Interaction Notes to Include in Design

Add small UI indicators:

* “Auto-generated from Canvas”
* “Last synced: 2 hours ago”
* “New syllabus update detected”

Optional micro-feature:
Hover on task → View rubric / materials / link to Canvas.

---

# 🎨 Design System Direction

Style:

* Calm academic tech
* Neutral background (off-white)
* Subtle shadows
* Rounded 12px cards
* Clean sans-serif font (Inter or SF Pro)

Avoid:

* Gamification
* Too many colors
* Playful design

This is productivity infrastructure.

---

# 🔥 Key Product Principles to Reflect in UI

1. Automation reduces friction.
2. User retains prioritization control.
3. Calendar becomes execution engine.
4. Trust layer before automation.
5. Structured > chaotic.

---

# 🧠 Now I Need 4 Answers From You

1. Do you want multi-course view in MVP or single course only?
2. Should silent updates auto-alert?
3. Do we show estimated time automatically or let user edit?
4. Should AI suggest priority order or never touch it?

Answer these and I’ll refine this into a tighter V2 Figma prompt aligned with your exact product positioning.
