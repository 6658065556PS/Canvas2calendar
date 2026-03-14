Canvas2Calendar Hybrid Task Extraction UI
Design a new interaction mode for the Canvas2Calendar platform that allows users to either automatically generate tasks OR manually highlight tasks from an assignment page.
The goal is to give the user control while still offering AI automation, mimicking how students currently work: reading an assignment on screen and writing tasks down manually in their notebook.
The interface should communicate choice, control, and confidence in the AI system.

Page Layout
The page should maintain the two-column layout already present in the design.
Left Side (Source Content)
Represents the original Canvas assignment page.
Features:
• scrollable assignment content
• paragraph text
• bullet points
• instructions
• deadlines
• links
Users should be able to:
• highlight text
• select bullet points
• select sentences
When highlighted, a small contextual tooltip appears:
Create Task
Create Subtask
Ignore

Example highlight interaction:
User highlights:
"Read Chapter 3 – Understand Your Customer"
System generates a task on the right side.

Right Side (Task Generation Panel)
This panel shows structured tasks generated from user highlights or AI automation.
Header card:
Task Builder
Build your task list from this assignment

Under the header include two main options:

Mode Selector
At the top of the right panel include a choice toggle.
How would you like to create tasks?

[ Highlight tasks myself ]  (Manual Mode)
[ Let AI generate tasks ]   (Automation Mode)

Manual mode should be the default experience.
Automation remains available as a secondary shortcut.

Manual Mode (Highlight → Task)
When users highlight text on the assignment:
Tasks appear on the right side in the same card style already used in the current design.
Example generated task card:
1. Read Chapter 3 – Understand Your Customer
Due: Wed Jan 28
Type: Reading
Estimated time: 20 min

Allow:
• editing task title
• editing deadline
• tagging task type
• deleting task
• reordering tasks (drag handle)
Include drag handle icon:
⋮⋮ drag to reorder


AI Assistance for Manual Tasks
After a task is created, the system may optionally suggest subtasks.
Example:
Task: Conduct competitive analysis

Suggested subtasks:

• Identify 3 competitors
• Compare pricing
• Analyze feature differences

User can:
Accept suggestions
Ignore suggestions


Automation Mode (Existing Feature)
When users click:
Let AI generate tasks

The system runs the existing automatic decomposition engine.
Display a confirmation card like the current UI:
Decomposition Complete

Found 9 micro-tasks
Total estimated time: 4.2 hours

Tasks populate automatically in the task panel.
Users should still be able to:
• edit tasks
• delete tasks
• reorder tasks
• add tasks manually
Automation should feel like a shortcut, not a replacement for control.

Visual Feedback During Highlighting
When text is highlighted on the left:
• highlight background color: light yellow
• small floating tooltip appears
Example tooltip:
Create Task
Add as Subtask
Cancel

This should feel similar to Notion highlighting interactions.

Trust & Transparency UI
To help users trust the system, include a small indicator:
Tasks created: 4
Remaining content not converted: 60%

This reassures users they can continue scanning the assignment manually.

Microcopy
Use language emphasizing assistance rather than automation.
Examples:
Instead of:
AI Generated Tasks

Use:
Tasks from your assignment

Instead of:
AI decomposition

Use:
Build your task list


UX Goal
The design should communicate:
• students remain in control of task extraction
• AI acts as an assistant, not a replacement
• workflow mirrors how students currently break down assignments manually

Interaction Summary
User flow:
Open assignment
↓
Choose task creation mode
↓
Highlight instructions OR run AI automation
↓
Tasks appear in structured panel
↓
User edits / reorders / schedules tasks


Design Style
Maintain the existing design language:
• minimal productivity UI
• soft neutral colors
• rounded task cards
• clear typography
• subtle shadows
• drag-and-drop interactions
The interface should feel similar to Notion + Linear + Todoist.

Core UX Principle
The system should feel like:
"AI helps me organize my assignment, but I decide what matters."
