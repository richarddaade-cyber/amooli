# Online Test & Quiz Platform — Complete Product Specification and Build Prompt

## 1. Project Overview

Build a full-stack web application for creating, administering, delivering, monitoring, and scoring structured tests and quizzes.

The platform is designed around a two-sided workflow:

1. **Administrator/Test Creator**
   - Creates tests and sections.
   - Adds questions through a visual question builder.
   - Uploads question images from a computer.
   - Selects question types.
   - Configures correct answers and explanations.
   - Reorders questions.
   - Previews tests.
   - Publishes tests.
   - Generates a unique access code.
   - Monitors an active test in real time.
   - Reviews answers, progress, timing, and results.

2. **Test Taker**
   - Enters a test access code.
   - Sees only the published test associated with that code.
   - Completes the test through a clean exam-style interface.
   - Navigates between questions.
   - Saves answers automatically.
   - Uses a timer when configured.
   - Submits the test.
   - Receives results according to the test's configured result policy.

3. **Backend**
   - Stores users, tests, sections, questions, passages, options, attempts, answers, events, and results.
   - Stores uploaded images separately in object storage.
   - Provides authentication and authorization.
   - Supports real-time updates for administrator monitoring.
   - Enforces server-side timing and test-session rules.

The application should initially be a **responsive web application**, not a desktop application. A desktop wrapper can be considered later if required.

---

# 2. Core Product Principle

Do **not** build a massive question database before building the application.

The central feature is a **Question Builder** that allows the administrator to create the question bank organically while preparing tests.

The workflow should be:

```text
Administrator
    ↓
Create Test
    ↓
Create Section
    ↓
Choose Question Type
    ↓
Enter/Paste Question
    ↓
Upload Image if Needed
    ↓
Configure Answer
    ↓
Save Question
    ↓
Reorder / Edit / Preview
    ↓
Publish Test
    ↓
Generate Access Code
    ↓
Test Taker Enters Code
    ↓
Test Session Starts
    ↓
Answers Autosaved
    ↓
Administrator Monitors Progress
    ↓
Test Submitted
    ↓
Automatic Scoring
    ↓
Results + Analytics
```

The architecture must therefore prioritize flexibility and extensibility.

---

# 3. Product Goals

## Primary Goals

- Make test creation fast.
- Allow questions to be copied/pasted from existing materials.
- Allow images to be uploaded directly from a computer.
- Support different question types without creating separate applications.
- Allow questions to be arranged in any order.
- Allow passages to contain multiple questions.
- Generate secure test access codes.
- Allow a candidate to access a test using only the code.
- Autosave candidate responses.
- Prevent accidental loss of progress.
- Provide a reliable countdown timer.
- Allow administrators to monitor active attempts in real time.
- Automatically grade objectively scored questions.
- Provide useful performance information after submission.

## Secondary Goals

- Support multiple tests.
- Support multiple sections per test.
- Support multiple candidates in the future.
- Support randomized questions/options in the future.
- Support question banks and reusable questions in the future.
- Support richer analytics in the future.
- Support AI-assisted question generation/explanation in the future.

---

# 4. Recommended Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- React Router
- A component library may be used if it improves consistency and accessibility.
- Form validation using Zod or an equivalent schema validation library.
- TanStack Query or an equivalent data-fetching/cache layer where useful.

## Backend / Database

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime

## Deployment

- Vercel for the frontend
- Supabase for backend/database/storage/realtime

## Optional

- Vitest/Jest for unit tests
- Playwright for end-to-end tests
- ESLint
- Prettier

Do not introduce unnecessary backend infrastructure unless there is a clear technical requirement.

---

# 5. High-Level Architecture

```text
                         ┌─────────────────────────┐
                         │      Web Browser        │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │     React Frontend      │
                         │                         │
                         │ Admin UI                │
                         │ Test-Taker UI           │
                         │ Auth UI                 │
                         │ Monitoring UI            │
                         └────────────┬────────────┘
                                      │
                       ┌──────────────┼──────────────┐
                       │              │              │
                       ▼              ▼              ▼
                ┌────────────┐ ┌────────────┐ ┌──────────────┐
                │ Supabase   │ │ Supabase   │ │ Supabase     │
                │ PostgreSQL │ │ Storage    │ │ Realtime     │
                └─────┬──────┘ └─────┬──────┘ └──────┬───────┘
                      │              │               │
                      │              │               │
                Structured       Images/files     Live events
                   data
```

---

# 6. User Roles

## Administrator

The administrator can:

- Sign in.
- Create tests.
- Edit tests.
- Delete draft tests.
- Create sections.
- Add questions.
- Edit questions.
- Delete questions.
- Upload images.
- Add passages.
- Configure answer choices.
- Set correct answers.
- Add explanations.
- Reorder questions.
- Preview tests.
- Publish tests.
- Generate access codes.
- Monitor active attempts.
- View candidate progress.
- End an active test.
- View results.
- Review candidate answers.

## Test Taker

The test taker can:

- Enter a test code.
- Enter a display name if required.
- Start an authorized test session.
- View questions.
- View images/passages.
- Select or enter answers.
- Navigate between questions.
- Mark questions for review.
- See unanswered questions.
- Continue a session after an accidental refresh if the session is still valid.
- Submit the test.
- View results if the test permits it.

The test taker must not be able to access administrator functionality.

---

# 7. Application Routes

Suggested route structure:

```text
/
├── /login
├── /admin
│   ├── /dashboard
│   ├── /tests
│   ├── /tests/new
│   ├── /tests/:testId
│   ├── /tests/:testId/edit
│   ├── /tests/:testId/preview
│   ├── /tests/:testId/monitor
│   └── /tests/:testId/results
│
└── /test
    ├── /join
    ├── /instructions/:attemptId
    ├── /session/:attemptId
    ├── /submitted/:attemptId
    └── /results/:attemptId
```

Protect routes according to role and session state.

---

# 8. Admin Dashboard

The dashboard should immediately communicate the state of the administrator's tests.

Example:

```text
Dashboard

[ + Create Test ]

Active Tests
------------------------------------------------
Quant 1             ACTIVE       Q7K4P9
Verbal 1            ACTIVE       V2L8XM

Drafts
------------------------------------------------
GRE Practice 2      DRAFT
Mock Test 3         DRAFT

Completed
------------------------------------------------
Practice Test 1     COMPLETED
```

Each test card should display:

- Test title
- Status
- Number of sections
- Number of questions
- Duration
- Access code if active
- Number of active candidates
- Created date
- Last updated date

---

# 9. Test Lifecycle

Every test should have a lifecycle.

Recommended states:

```text
DRAFT
  ↓
REVIEW
  ↓
PUBLISHED
  ↓
ACTIVE
  ↓
CLOSED
```

## DRAFT

The administrator can freely edit the test.

## REVIEW

Optional state for checking the test before publishing.

## PUBLISHED

The test is ready but has not necessarily started.

## ACTIVE

Candidates can access the test.

## CLOSED

New candidates cannot start the test.

Existing attempts should be handled according to the administrator's chosen policy.

---

# 10. Creating a Test

The administrator selects:

**Create Test**

Fields:

```text
Test Name
Description
Duration
Instructions
Result Visibility
Attempt Limit
Randomization Settings
```

Example:

```text
Test Name:
GRE Quantitative Practice 1

Description:
Quantitative comparison and problem-solving practice.

Duration:
35 minutes

Maximum Attempts:
1

Show Results:
After submission
```

---

# 11. Sections

A test should support multiple sections.

Example:

```text
GRE Practice Test 1

Section 1
Quantitative Reasoning

Section 2
Verbal Reasoning
```

Each section can contain its own questions and optional settings.

Section fields:

- Name
- Description
- Time limit if needed
- Question ordering
- Whether navigation is allowed
- Whether questions can be revisited

Do not assume that every test has only one section.

---

# 12. Question Builder

The Question Builder is the most important part of the administrator interface.

The administrator should choose:

```text
Question Type
```

Suggested initial types:

1. Multiple Choice
2. Quantitative Comparison
3. Numeric Entry
4. Text Completion
5. Sentence Equivalence
6. Reading Comprehension
7. Passage
8. Image-Based Question

The system must be component-driven so that adding future question types does not require rewriting the entire test system.

---

# 13. Question Type: Multiple Choice

UI:

```text
Question

[ Text Editor ]

[ Upload Image ]

Answer Options

A. [ text ]
B. [ text ]
C. [ text ]
D. [ text ]
E. [ text ]

Correct Answer:
[ B ]

Explanation:
[ Text Editor ]
```

Requirements:

- Support 2–10 options.
- Add/remove options.
- Select exactly one correct answer.
- Option text may contain images in future versions.
- Support explanations.
- Support optional question images.

---

# 14. Question Type: Quantitative Comparison

This is a critical question type.

UI:

```text
Question
[ Text Editor ]

Optional Image
[ Upload Image ]

Quantity A
[ Text/Image Content ]

Quantity B
[ Text/Image Content ]

Correct Answer

○ Quantity A is greater
○ Quantity B is greater
○ The two quantities are equal
○ The relationship cannot be determined

Explanation
[ Text Editor ]
```

Quantity A and Quantity B must support either:

- Text
- Image

Prefer a reusable rich-content structure rather than separate hard-coded fields where practical.

The final system should be able to represent:

```text
Quantity A = text
Quantity B = text
```

or:

```text
Quantity A = image
Quantity B = image
```

or:

```text
Quantity A = text + image
Quantity B = text + image
```

---

# 15. Question Type: Numeric Entry

UI:

```text
Question
[ Text Editor ]

Answer
[ Numeric answer ]

Accepted Answer:
[ 42 ]

Tolerance:
[ 0 ]

Explanation:
[ Text Editor ]
```

Support optional tolerance.

Example:

```text
Correct answer = 3.14
Tolerance = 0.01
```

Then 3.135–3.145 may be accepted depending on the configured grading method.

---

# 16. Question Type: Text Completion

Support:

- Prompt
- Blank(s)
- Answer choices where applicable
- Correct answer
- Explanation

The data model should not assume that every question is multiple choice.

---

# 17. Question Type: Sentence Equivalence

Support:

- Prompt
- Six answer options by default, configurable if necessary.
- Two correct answers.
- Explanation.

The grading engine must require both configured correct options when the question is configured as "select two."

---

# 18. Reading Comprehension

Reading comprehension should support a reusable passage.

Structure:

```text
Passage
    │
    ├── Question 1
    ├── Question 2
    ├── Question 3
    └── Question 4
```

The passage should not be duplicated in every question.

Admin interface:

```text
Passage

[ Text Editor ]

[ Add Question ]

Question 1
[ ... ]

Question 2
[ ... ]

Question 3
[ ... ]
```

Candidate interface:

```text
┌───────────────────────┬──────────────────────┐
│ Passage               │ Question             │
│                       │                      │
│ Passage text...       │ Question 1           │
│                       │                      │
│                       │ A. ...               │
│                       │ B. ...               │
│                       │ C. ...               │
└───────────────────────┴──────────────────────┘
```

On desktop, a split-pane layout is preferred.

On mobile, the layout should stack.

---

# 19. Image Upload System

Images are essential.

The administrator should be able to:

- Select an image from the computer.
- Drag and drop an image.
- Preview the image.
- Replace an image.
- Remove an image.

Supported formats:

- PNG
- JPEG/JPG
- WebP

Apply reasonable file-size limits.

Store images in Supabase Storage rather than directly inside PostgreSQL.

Database stores:

```text
storage_path
public_or_signed_url
mime_type
file_size
```

Use signed URLs where content should not be publicly accessible.

---

# 20. Rich Content Model

Avoid creating an architecture where every question has dozens of unrelated columns.

The application should support structured content.

Conceptually:

```text
Question
 ├── prompt
 ├── media[]
 ├── content_blocks[]
 ├── options[]
 ├── correct_answer
 └── explanation
```

For the first version, simpler relational fields are acceptable, but the architecture should remain extensible.

---

# 21. Question Ordering

Questions must have a `position` field.

Example:

```text
position 1 → Question A
position 2 → Question B
position 3 → Question C
```

The administrator should be able to drag questions.

When reordered:

```text
Question A
Question C
Question B
```

update the positions safely.

Do not rely on frontend order alone.

The backend must persist the order.

---

# 22. Preview Mode

Before publishing, the administrator should be able to select:

**Preview Test**

The preview should look as close as possible to the actual candidate experience.

Preview should not create a real candidate attempt.

The administrator should be able to move through:

- Questions
- Passages
- Images
- Options
- Sections

and verify the test.

---

# 23. Publishing a Test

When the administrator selects:

**Publish**

the application should validate:

- Test has a title.
- Test contains at least one section/question as required.
- Every question has required content.
- Every objective question has a valid correct answer.
- Every option-based question has valid options.
- Every uploaded image is available.
- No required field is missing.

If validation passes:

```text
Test Status → PUBLISHED
```

The administrator can then activate the test.

---

# 24. Access Code Generation

When a test becomes active, generate a short, human-friendly code.

Example:

```text
Q7K4P9
```

Requirements:

- Sufficient entropy.
- Case-insensitive input if desired.
- Avoid ambiguous characters such as O/0 and I/1 if practical.
- Unique among active/relevant tests.
- Server-generated.
- Never rely on a predictable sequential number.

The database should enforce uniqueness.

---

# 25. Test Taker Join Flow

Candidate opens:

```text
/test/join
```

UI:

```text
Enter Test Code

[ Q7K4P9 ]

[ Continue ]
```

Backend:

1. Normalize code.
2. Find active test.
3. Verify availability.
4. Check attempt limits.
5. Create or resume an attempt.
6. Return appropriate session information.

Do not send unnecessary administrator information to the client.

---

# 26. Candidate Identity

The first version may use:

```text
Candidate Name
```

Optional future authentication can support:

- Email
- Student ID
- Candidate account
- Institution ID

Do not require a complicated candidate account system for the MVP unless needed.

---

# 27. Test Instructions

Before starting:

```text
Quantitative Reasoning

Duration: 35 minutes
Questions: 30
Attempts: 1

Instructions:
- Answer all questions.
- You may revisit questions.
- Your answers are automatically saved.
- The test will automatically submit when time expires.

[ Start Test ]
```

The actual test should not begin until the candidate selects Start.

The server records:

```text
started_at
expires_at
```

---

# 28. Test Session

A candidate attempt is separate from the test definition.

Example:

```text
Test
  ↓
Attempt
  ↓
Answers
```

This allows the same test to be taken by multiple candidates.

Attempt fields should include:

- ID
- Test ID
- Candidate name
- Status
- Started at
- Expires at
- Submitted at
- Current question
- Last activity
- Score
- Percentage

---

# 29. Timer Architecture

The timer must be enforced by the server.

Do not trust:

```text
setInterval()
```

as the authoritative timer.

Instead:

```text
server_started_at
server_expires_at
```

The frontend calculates the display:

```text
remaining = expires_at - current_server_time
```

When the deadline is reached:

1. Disable further answer changes.
2. Submit the attempt.
3. Grade the attempt.
4. Mark it as expired/submitted.

This prevents users from extending time by manipulating their browser clock.

---

# 30. Autosave

Every meaningful answer change should be persisted.

Example:

```text
Candidate selects B
       ↓
Frontend updates UI immediately
       ↓
Save answer to backend
       ↓
Backend confirms
       ↓
UI shows "Saved"
```

Use debouncing where appropriate to avoid excessive writes.

For radio-button answers, immediate saving is acceptable.

For text/numeric fields, debounce typing.

---

# 31. Offline/Connection Resilience

The application should tolerate short connection interruptions.

Use local state/local storage as a temporary recovery mechanism.

Example:

```text
Answer
 ↓
Local state
 ↓
Local recovery cache
 ↓
Backend
```

When connection returns:

```text
Sync pending answers
```

The backend remains authoritative.

Do not allow stale local data to overwrite newer server data without conflict handling.

---

# 32. Candidate Question Navigation

The test interface should include:

- Previous
- Next
- Question number
- Answer status
- Mark for review
- Submit

Example:

```text
Question 17 of 30

[ Previous ]          [ Next ]

Question Navigator:
1 ✓
2 ✓
3 -
4 ⚑
5 ✓
...
17 ●
...
30 -
```

Legend:

```text
✓ Answered
- Unanswered
⚑ Marked for review
● Current
```

---

# 33. Mark for Review

Candidates should be able to mark a question.

This should be stored separately from the answer.

Example:

```text
is_marked_for_review = true
```

A candidate may have:

```text
Answered + marked
Unanswered + marked
Answered + unmarked
Unanswered + unmarked
```

---

# 34. Submission

When the candidate selects Submit:

Show confirmation:

```text
You have:

Answered: 27
Unanswered: 3
Marked for review: 2

Are you sure you want to submit?

[ Cancel ] [ Submit Test ]
```

If the timer expires, submission should occur automatically.

---

# 35. Grading Engine

The grading system should be modular.

Conceptually:

```text
gradeAttempt(attempt)
        ↓
for each answer
        ↓
identify question type
        ↓
apply grading strategy
        ↓
store correctness
        ↓
calculate score
```

Examples:

### Multiple Choice

```text
selected === correct
```

### Quantitative Comparison

Compare selected category against configured correct category.

### Numeric Entry

Check exact value or configured tolerance.

### Multiple Correct Answers

Compare selected set against expected set.

Do not implement grading logic directly inside React components.

---

# 36. Results

After submission:

```text
Test Complete

Score:
24 / 30

Percentage:
80%

Correct:
24

Incorrect:
4

Unanswered:
2
```

Result visibility should be configurable.

Possible modes:

```text
Immediate
After test closes
Administrator only
Never show candidate
```

---

# 37. Administrator Live Monitoring

This is one of the most important advanced features.

Admin opens:

```text
/tests/:testId/monitor
```

Display:

```text
QUANT 1
LIVE ●

Candidate: Nicholas

Time Remaining: 24:37
Progress: 17 / 30

Answered: 16
Unanswered: 1
Marked: 2

Current Question: 17
Last Activity: 2 seconds ago
Connection: Online
```

---

# 38. Real-Time Events

Use Supabase Realtime.

Useful events:

```text
attempt_started
question_viewed
answer_changed
question_marked
question_unmarked
section_changed
attempt_submitted
attempt_expired
candidate_connected
candidate_disconnected
```

The administrator does not necessarily need every raw event in the UI, but the backend can use them for monitoring and audit history.

---

# 39. Live Question Progress

The administrator should be able to see:

```text
1 ✓
2 ✓
3 ✓
4 ✗
5 ✓
6 ✓
7 -
8 ✓
9 ⚑
10 ✓
...
17 ●
```

This provides an immediate understanding of candidate progress.

Whether correctness is visible during an active test should be configurable.

For a real exam, default to **not revealing correctness to the administrator unless necessary** or provide only after submission.

---

# 40. Administrator Candidate Panel

For multiple candidates in the future:

```text
Candidates

Nicholas
● Active
Question 17/30
24:37 remaining

Candidate 2
● Active
Question 21/30
19:12 remaining

Candidate 3
○ Disconnected
Question 12/30
28:51 remaining
```

Clicking a candidate opens detailed monitoring.

---

# 41. Security and Authorization

Security must be implemented at the database/backend level, not only through frontend route protection.

Use Supabase Row Level Security.

Administrator should only access authorized administrative data.

Candidate should only access:

- Their own attempt.
- Questions belonging to the test they are authorized to take.
- Their own answers.

Never expose:

- Correct answers before allowed.
- Other candidates' answers.
- Administrator credentials.
- Private storage paths unnecessarily.
- Internal database fields that are not required.

---

# 42. Correct Answer Protection

This is extremely important.

Do not simply send:

```text
correct_answer
```

to the candidate browser during an active exam.

Otherwise a technically knowledgeable user could inspect the network response or JavaScript state.

Instead, candidate-facing APIs should return only what is necessary to display the question.

Grading should happen server-side.

---

# 43. Database Schema

Recommended initial relational structure:

```text
profiles
--------
id
user_id
display_name
role
created_at
updated_at


tests
-----
id
owner_id
title
description
instructions
status
access_code
duration_seconds
attempt_limit
result_visibility
created_at
updated_at
published_at
closed_at


sections
--------
id
test_id
title
description
position
duration_seconds
created_at
updated_at


passages
--------
id
section_id
title
content
position
created_at
updated_at


questions
---------
id
section_id
passage_id
type
prompt
explanation
position
points
settings
created_at
updated_at


question_media
--------------
id
question_id
storage_path
mime_type
file_size
position
created_at


options
-------
id
question_id
option_key
content
position
created_at


question_answers
----------------
id
question_id
answer_type
answer_data
created_at


attempts
--------
id
test_id
candidate_name
status
started_at
expires_at
submitted_at
current_question_id
last_activity_at
score
max_score
percentage
created_at
updated_at


answers
-------
id
attempt_id
question_id
selected_answer
answer_data
is_correct
points_awarded
answered_at
updated_at


review_marks
------------
id
attempt_id
question_id
created_at


attempt_events
--------------
id
attempt_id
event_type
question_id
metadata
created_at
```

The exact schema can be optimized during implementation.

---

# 44. Data Relationships

```text
profiles
   │
   └── tests
          │
          ├── sections
          │      │
          │      ├── passages
          │      │      └── questions
          │      │
          │      └── questions
          │             ├── options
          │             └── media
          │
          └── attempts
                 │
                 ├── answers
                 ├── review_marks
                 └── attempt_events
```

---

# 45. Storage Architecture

Recommended storage buckets:

```text
question-images
test-assets
```

Example storage path:

```text
question-images/
    test-{testId}/
        question-{questionId}/
            image-001.webp
```

Do not use random unstructured storage paths if they make management difficult.

Use generated UUIDs for actual security/uniqueness while keeping logical folder organization.

---

# 46. API / Data Access Principles

Use typed data-access functions rather than scattering database queries throughout UI components.

Example conceptual functions:

```text
createTest()
updateTest()
createSection()
createQuestion()
updateQuestion()
deleteQuestion()
uploadQuestionImage()
publishTest()
activateTest()
generateAccessCode()
joinTest()
startAttempt()
saveAnswer()
markQuestion()
submitAttempt()
getAttempt()
getResults()
subscribeToAttemptEvents()
```

Components should consume these services/hooks rather than directly manipulating database tables everywhere.

---

# 47. Frontend Component Architecture

Suggested structure:

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── question-builder/
│   ├── question-renderer/
│   ├── test-navigation/
│   ├── timer/
│   └── monitoring/
│
├── features/
│   ├── auth/
│   ├── tests/
│   ├── questions/
│   ├── attempts/
│   ├── results/
│   └── monitoring/
│
├── pages/
│   ├── admin/
│   └── test/
│
├── hooks/
├── lib/
├── services/
├── types/
└── utils/
```

---

# 48. Question Renderer Architecture

The candidate interface should not have huge conditional JSX logic.

Use a registry pattern.

Conceptually:

```text
question.type
       ↓
QuestionRenderer
       ↓
┌─────────────────────────────┐
│ multiple_choice             │
│ quantitative_comparison     │
│ numeric_entry               │
│ text_completion             │
│ sentence_equivalence        │
│ reading_comprehension       │
└─────────────────────────────┘
```

This makes future question types easier to add.

---

# 49. Question Builder Architecture

Similarly:

```text
QuestionBuilder
      ↓
QuestionTypeSelector
      ↓
QuestionEditor
      ↓
Specific Editor
```

Examples:

```text
MultipleChoiceEditor
QuantitativeComparisonEditor
NumericEntryEditor
SentenceEquivalenceEditor
PassageEditor
```

Each editor should validate its own requirements.

---

# 50. UI/UX Principles

The interface should feel like a serious assessment platform, not a generic CRUD dashboard.

## Admin

Prioritize:

- Fast question entry.
- Minimal clicks.
- Clear hierarchy.
- Autosaving drafts where practical.
- Drag-and-drop ordering.
- Preview.
- Strong validation.

## Candidate

Prioritize:

- Minimal distractions.
- Large readable text.
- Clear question numbering.
- Obvious navigation.
- Visible timer.
- Reliable autosave.
- Mobile responsiveness.
- Accessibility.

---

# 51. Admin Question Entry Efficiency

The administrator may copy questions from existing materials.

Therefore the system should optimize for:

```text
Copy
 ↓
Paste
 ↓
Select type
 ↓
Upload image if needed
 ↓
Select answer
 ↓
Save
```

Avoid forcing the administrator through unnecessary configuration screens.

Provide:

**Save & Add Another**

so the administrator can quickly enter many questions.

Example:

```text
[ Save Question ]

[ Save & Add Another ]

[ Cancel ]
```

---

# 52. Bulk Question Entry — Future Feature

A future feature can allow importing:

- CSV
- Excel
- JSON
- Word documents
- Plain text

However, do not make this a prerequisite for the MVP.

Manual visual entry is the priority.

---

# 53. AI Features — Future, Not MVP

AI should not be required for the first version.

Possible future capabilities:

- Generate explanations.
- Convert pasted content into structured questions.
- Detect question type.
- Extract options from pasted text.
- Generate distractors.
- Generate practice questions.
- Summarize performance.
- Identify weak topics.

AI must remain optional.

The platform must work completely without AI.

---

# 54. Analytics

Initial analytics:

```text
Score
Percentage
Correct
Incorrect
Unanswered
Time used
```

Future analytics:

```text
Accuracy by question type
Accuracy by section
Average time per question
Questions taking longest
Most frequently missed topics
Change in performance over time
```

---

# 55. Audit Trail

Store important events.

Examples:

```text
Test published
Test activated
Attempt started
Question viewed
Answer changed
Question marked
Test submitted
Test expired
```

This helps debug issues and provides accountability.

---

# 56. Error Handling

The system must handle:

- Invalid test code.
- Expired test.
- Closed test.
- Attempt limit reached.
- Network interruption.
- Image upload failure.
- Database failure.
- Session expiration.
- Duplicate submission.
- Browser refresh.
- Candidate reconnecting.

Errors should be user-friendly.

Do not display raw database errors to users.

---

# 57. Duplicate Submission Protection

Submission must be idempotent.

If a candidate clicks Submit twice:

```text
First request → submits
Second request → returns existing submission
```

Do not create duplicate results.

---

# 58. Race Conditions

Be careful with:

- Timer expiry vs manual submission.
- Simultaneous answer saves.
- Reordering questions.
- Multiple browser tabs.
- Candidate reconnecting.
- Admin closing a test while a candidate is active.

The backend must be authoritative.

---

# 59. Multiple Tabs

Consider detecting multiple active tabs for the same attempt.

For the MVP:

- Allow only one active session where practical.
- Warn the candidate if another tab is detected.

Future versions can enforce single-session policies server-side.

---

# 60. Accessibility

The candidate interface should support:

- Keyboard navigation.
- Proper labels.
- Focus management.
- Sufficient contrast.
- Screen-reader-friendly controls.
- Accessible buttons.
- Clear error messages.

Do not make question interaction dependent exclusively on mouse input.

---

# 61. Responsive Design

Desktop:

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
├───────────────────────┬─────────────────────┤
│ Passage               │ Question            │
│                       │                     │
│                       │ Answers             │
└───────────────────────┴─────────────────────┘
```

Mobile:

```text
Header
Timer

Question

Answers

Navigation

Question Navigator
```

The candidate must be able to take the test on a phone if required.

---

# 62. Admin Monitoring Layout

Desktop-first layout:

```text
┌────────────────────────────────────────────────────────┐
│ Test: Quant 1                  LIVE ●                   │
├────────────────────────────────────────────────────────┤
│ Candidate        Progress       Time       Status       │
│ Nicholas         17/30          24:37      Active       │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Current Question                                      │
│                                                        │
│ Question 17                                            │
│                                                        │
│ Candidate Answer: B                                    │
│                                                        │
├────────────────────────────────────────────────────────┤
│ Activity                                               │
│ 23:12 Question 17 viewed                               │
│ 23:13 Answer changed                                   │
└────────────────────────────────────────────────────────┘
```

---

# 63. Candidate Interface

Suggested layout:

```text
┌───────────────────────────────────────────────┐
│ Quant 1                  Question 17 / 30     │
│                          24:37 remaining       │
├───────────────────────────────────────────────┤
│                                               │
│ Question                                      │
│                                               │
│ ...                                           │
│                                               │
│ A. ...                                        │
│ B. ...                                        │
│ C. ...                                        │
│ D. ...                                        │
│                                               │
├───────────────────────────────────────────────┤
│ [Previous] [Mark for Review] [Next]           │
└───────────────────────────────────────────────┘
```

---

# 64. MVP Feature List

The first release must include:

## Authentication

- [ ] Admin login
- [ ] Role protection

## Test Creation

- [ ] Create test
- [ ] Edit test
- [ ] Delete draft
- [ ] Create sections
- [ ] Set duration
- [ ] Set instructions

## Question Builder

- [ ] Multiple choice
- [ ] Quantitative comparison
- [ ] Numeric entry
- [ ] Text completion
- [ ] Sentence equivalence
- [ ] Reading comprehension
- [ ] Image-based questions
- [ ] Upload images
- [ ] Add explanations
- [ ] Reorder questions
- [ ] Delete/edit questions

## Publishing

- [ ] Validate test
- [ ] Publish
- [ ] Activate
- [ ] Generate access code
- [ ] Close test

## Candidate

- [ ] Enter code
- [ ] Candidate name
- [ ] Instructions
- [ ] Start test
- [ ] Timer
- [ ] Navigate questions
- [ ] Mark for review
- [ ] Autosave
- [ ] Submit

## Grading

- [ ] Automatic grading
- [ ] Score calculation
- [ ] Result calculation

## Admin Monitoring

- [ ] Active candidate list
- [ ] Current question
- [ ] Progress
- [ ] Time remaining
- [ ] Last activity
- [ ] Real-time updates

## Results

- [ ] Candidate result
- [ ] Admin result
- [ ] Correct/incorrect/unanswered
- [ ] Percentage

---

# 65. Future Feature List

Do not implement these before the MVP works unless there is a strong reason:

- [ ] Multiple candidates
- [ ] Candidate accounts
- [ ] Question bank
- [ ] Reusable questions
- [ ] Randomized questions
- [ ] Randomized answer options
- [ ] CSV import
- [ ] Excel import
- [ ] PDF export
- [ ] Advanced analytics
- [ ] Performance history
- [ ] AI question generation
- [ ] AI explanations
- [ ] Institution accounts
- [ ] Multiple administrators
- [ ] Proctoring
- [ ] Webcam monitoring
- [ ] Browser lockdown
- [ ] Desktop application
- [ ] Mobile application

---

# 66. Development Strategy

Build incrementally.

## Milestone 1 — Foundation

Create:

- React application
- TypeScript
- Tailwind
- Supabase connection
- Environment configuration
- Authentication

Success criterion:

> Administrator can log in.

## Milestone 2 — Test Management

Build:

- Dashboard
- Create test
- Edit test
- Test status
- Sections

Success criterion:

> Administrator can create a test containing sections.

## Milestone 3 — Question Builder

Build:

- Question type selector
- Multiple choice
- Quantitative comparison
- Numeric entry
- Image upload
- Question ordering

Success criterion:

> Administrator can create a realistic test without touching the database manually.

## Milestone 4 — Candidate Experience

Build:

- Join by code
- Candidate identity
- Instructions
- Start attempt
- Question rendering
- Navigation
- Autosave

Success criterion:

> Candidate can complete a test from beginning to end.

## Milestone 5 — Grading

Build:

- Server-side grading
- Results
- Submission
- Expiration

Success criterion:

> A completed test automatically produces a correct score.

## Milestone 6 — Live Monitoring

Build:

- Realtime
- Candidate activity
- Current question
- Progress
- Timer
- Connection state

Success criterion:

> Administrator can watch an active test without refreshing the page.

## Milestone 7 — Hardening

Add:

- Security
- RLS
- Edge cases
- Error handling
- Race-condition handling
- Tests
- Accessibility
- Responsive improvements

---

# 67. Recommended Build Order for Code

Do not start by implementing every question type.

Start with:

```text
1. Authentication
2. Database schema
3. Admin dashboard
4. Test creation
5. Section creation
6. Multiple choice
7. Quantitative comparison
8. Image upload
9. Candidate join
10. Attempt/session
11. Autosave
12. Timer
13. Submission
14. Grading
15. Results
16. Realtime monitoring
17. Additional question types
```

This produces a working vertical slice early.

---

# 68. Testing Strategy

## Unit Tests

Test:

- Grading logic
- Numeric tolerance
- Multiple-answer grading
- Access code generation
- Timer calculations
- Question validation

## Integration Tests

Test:

- Create test
- Add question
- Publish
- Generate code
- Join
- Start attempt
- Save answer
- Submit
- Grade

## End-to-End Tests

Simulate:

```text
Admin logs in
 ↓
Creates test
 ↓
Adds questions
 ↓
Publishes
 ↓
Gets code
 ↓
Candidate enters code
 ↓
Candidate takes test
 ↓
Admin sees live progress
 ↓
Candidate submits
 ↓
Results generated
```

---

# 69. Security Checklist

Before production:

- [ ] Supabase RLS enabled.
- [ ] Admin routes protected.
- [ ] Candidate routes protected.
- [ ] Correct answers hidden from candidates.
- [ ] Server-side grading.
- [ ] Server-side timing.
- [ ] Access codes generated securely.
- [ ] Attempt limits enforced server-side.
- [ ] Storage permissions configured.
- [ ] File upload validation.
- [ ] Input validation.
- [ ] SQL/database queries parameterized through the official client.
- [ ] No secrets committed to Git.
- [ ] Environment variables configured correctly.
- [ ] Duplicate submission protection.
- [ ] Authorization checked on every sensitive operation.

---

# 70. Environment Variables

Use environment variables for:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

to the browser.

Server-only secrets must remain server-side.

---

# 71. Git/GitHub Workflow

Recommended branches:

```text
main
develop
feature/*
fix/*
```

Commit examples:

```text
feat: add test creation flow
feat: add quantitative comparison questions
feat: add question image uploads
feat: add candidate test session
feat: add server-side grading
feat: add realtime monitoring
fix: prevent duplicate test submission
```

Each major milestone should have a stable commit.

---

# 72. README Requirements

The project README should contain:

- Project description
- Features
- Architecture
- Tech stack
- Setup instructions
- Environment variables
- Database setup
- Storage setup
- Authentication setup
- Local development
- Testing
- Deployment
- Known limitations
- Future roadmap

---

# 73. Detailed Database Rules

Important invariants:

### Test

A test must belong to an administrator.

### Section

A section must belong to a test.

### Question

A question must belong to a section.

### Passage

A passage belongs to a section and may contain multiple questions.

### Option

An option belongs to exactly one question.

### Attempt

An attempt belongs to exactly one test.

### Answer

An answer belongs to exactly one attempt and one question.

Add unique constraints where necessary.

For example:

```text
unique(attempt_id, question_id)
```

This prevents duplicate answer rows for the same question in the same attempt.

---

# 74. Score Model

Every question should optionally have:

```text
points
```

Default:

```text
1
```

Then:

```text
max_score = sum(question.points)
score = sum(points_awarded)
percentage = score / max_score * 100
```

This allows weighted questions later.

---

# 75. Result Example

```text
QUANT 1

Candidate:
Nicholas

Score:
24 / 30

Percentage:
80%

Correct:
24

Incorrect:
4

Unanswered:
2

Time Used:
28:13

Section Performance:
Quantitative Comparison: 8/10
Problem Solving: 10/12
Data Interpretation: 6/8
```

---

# 76. Question Metadata

The question model should support future metadata such as:

```text
difficulty
topic
subtopic
source
tags
estimated_time
```

These do not need to be prominent in the MVP.

They become useful when a reusable question bank is implemented.

---

# 77. Reusable Question Bank — Future Architecture

Eventually separate:

```text
Question Bank
       ↓
Reusable Question
       ↓
Test Question Instance
```

This allows one question to be reused across several tests without duplicating its underlying definition.

Do not force this complexity into the MVP unless reuse is immediately required.

---

# 78. Access Code Rules

Example:

```text
Q7K4P9
```

When a candidate enters:

```text
q7k4p9
```

the application may normalize it to:

```text
Q7K4P9
```

The database lookup must remain case-safe.

Expired/closed codes should not allow new attempts.

---

# 79. Real-Time Monitoring Architecture

Conceptually:

```text
Candidate Browser
       │
       │ answer_changed
       ▼
Supabase
       │
       │ realtime event
       ▼
Admin Browser
       │
       ▼
Live Dashboard
```

The administrator should not have to continuously refresh the page.

Use real-time subscriptions only where needed.

Do not create a real-time subscription for every database table indiscriminately.

---

# 80. Presence/Connection State

For live monitoring, distinguish:

```text
Active
Idle
Disconnected
Submitted
Expired
```

Do not infer everything solely from browser visibility.

Use heartbeat/last-activity information.

Example:

```text
last_activity_at
```

The UI can classify:

```text
recent activity → Active
no recent activity → Possibly idle
connection closed → Disconnected
```

---

# 81. Important Privacy Principle

The administrator should only see information necessary for administering the test.

Avoid collecting unnecessary personal information.

For the initial version, candidate name is enough.

If additional information is introduced later, clearly define why it is collected and who can access it.

---

# 82. Performance Requirements

The application should feel immediate.

Target:

- Question navigation should not require a full page reload.
- Previously loaded questions should render quickly.
- Answers should save without blocking the UI.
- Images should be optimized.
- Large passages should not cause unnecessary re-renders.
- Realtime updates should update only affected UI components.

Use lazy loading where useful.

---

# 83. Image Optimization

When images are uploaded:

- Validate dimensions.
- Validate MIME type.
- Consider resizing very large images.
- Prefer WebP where practical.
- Preserve enough quality for mathematical/diagram questions.
- Do not aggressively compress images containing small text.

The image may contain the actual question, so readability is more important than extreme compression.

---

# 84. Candidate Recovery

If the candidate refreshes:

```text
Refresh
 ↓
Recover attempt ID/session
 ↓
Check server status
 ↓
Check expires_at
 ↓
Load saved answers
 ↓
Restore current question
```

If the attempt has already been submitted:

```text
Show submitted state.
```

If expired:

```text
Show expired state/results according to policy.
```

---

# 85. Admin Draft Autosave

Admin question creation should also be resilient.

Where appropriate:

```text
Edit question
 ↓
Draft state
 ↓
Autosave
```

But avoid excessive database writes.

A manual Save button must always exist.

---

# 86. UX for Question Creation

The administrator should be able to add a question in as few steps as possible.

Recommended flow:

```text
[ + Add Question ]

Choose Type
        ↓
Question Editor
        ↓
[ Save & Add Another ]
```

After saving, automatically return to the question list or open the next question editor.

This is especially important when manually entering dozens of questions.

---

# 87. Admin Question List

Example:

```text
Questions — Quant 1

☰ 01  Quantitative Comparison    ✓ Complete
☰ 02  Multiple Choice             ✓ Complete
☰ 03  Numeric Entry               ✓ Complete
☰ 04  Quantitative Comparison     ⚠ Missing Answer
☰ 05  Reading Comprehension       ✓ Complete

[ + Add Question ]
```

Validation status should be obvious.

---

# 88. Publish Validation

The administrator should never publish a broken test.

Example warning:

```text
Cannot publish.

2 issues found:

1. Question 4 has no correct answer.
2. Question 8 contains an unavailable image.

[ Review Issues ]
```

Clicking an issue should take the administrator directly to the relevant question.

---

# 89. Candidate Exam Integrity

For normal practice tests, basic browser behavior is sufficient.

For higher-stakes examinations, consider future features such as:

- Full-screen mode.
- Tab-switch detection.
- Browser focus monitoring.
- Copy/paste restrictions.
- Webcam proctoring.
- Identity verification.
- Secure browser.

These should **not** be required for the initial MVP.

---

# 90. Desktop App Decision

Do not start with Electron/Tauri.

The web application is better initially because:

- The administrator and candidate can use different devices.
- Deployment is simpler.
- Updates are immediate.
- Realtime communication is straightforward.
- No installer is required.
- Supabase integrates naturally.
- The application can later be wrapped as a desktop application.

If a desktop application becomes necessary, consider Tauri or Electron later.

---

# 91. Suggested Project Structure

```text
test-platform/
│
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── admin/
│   │   ├── candidate/
│   │   ├── questions/
│   │   └── monitoring/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── tests/
│   │   ├── questions/
│   │   ├── attempts/
│   │   ├── grading/
│   │   └── monitoring/
│   │
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   ├── types/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── functions/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
├── .env.example
├── README.md
├── package.json
└── tsconfig.json
```

---

# 92. Development Rules

When implementing the project:

1. Use TypeScript throughout.
2. Avoid `any` unless absolutely necessary.
3. Keep business logic out of UI components.
4. Validate data at boundaries.
5. Keep grading server-side.
6. Keep timing authoritative on the server.
7. Use RLS for authorization.
8. Keep correct answers out of candidate payloads.
9. Build reusable question components.
10. Keep the UI responsive.
11. Write tests for grading logic.
12. Do not over-engineer features that are not required for the MVP.
13. Make the system extensible for new question types.
14. Prefer small, composable components.
15. Keep database migrations version-controlled.
16. Never commit secrets.
17. Handle errors explicitly.
18. Make critical operations idempotent.

---

# 93. Definition of Done for MVP

The MVP is complete when the following scenario works without manually editing the database:

```text
Administrator logs in.
        ↓
Creates "Quant 1".
        ↓
Creates a Quantitative section.
        ↓
Adds a Quantitative Comparison question.
        ↓
Uploads an image.
        ↓
Adds Quantity A and Quantity B.
        ↓
Selects the correct answer.
        ↓
Adds another multiple-choice question.
        ↓
Reorders the questions.
        ↓
Previews the test.
        ↓
Publishes the test.
        ↓
Activates the test.
        ↓
System generates Q7K4P9.
        ↓
Candidate enters Q7K4P9.
        ↓
Candidate enters name.
        ↓
Candidate starts the test.
        ↓
Timer starts.
        ↓
Candidate answers questions.
        ↓
Answers autosave.
        ↓
Administrator sees candidate activity.
        ↓
Candidate submits.
        ↓
Backend grades answers.
        ↓
Candidate sees result if permitted.
        ↓
Administrator sees complete result.
```

If this workflow works reliably, the core product is successful.

---

# 94. Master AI Coding Prompt

Use the following as the primary prompt when asking an AI coding assistant to build the application.

---

## MASTER PROMPT

You are a senior full-stack software engineer and product architect.

Build a production-quality MVP of a web-based assessment platform called **Test Platform**.

The platform has two primary interfaces:

1. An administrator interface for creating, editing, publishing, and monitoring tests.
2. A candidate interface for entering an access code and taking a test.

Use:

- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime

Use a clean, modular architecture.

The system must be extensible because additional question types will be added later.

### Core requirement

The administrator must be able to create a test without manually entering data into the database.

The administrator should be able to:

1. Create a test.
2. Add sections.
3. Select a question type.
4. Enter/paste the question.
5. Upload images from a local computer.
6. Configure answers.
7. Add explanations.
8. Save the question.
9. Add another question.
10. Reorder questions.
11. Preview the test.
12. Publish the test.
13. Activate the test.
14. Generate an access code.
15. Monitor candidates in real time.
16. View results.

The candidate should be able to:

1. Enter the access code.
2. Enter their name if required.
3. Read test instructions.
4. Start the test.
5. See the questions.
6. Answer questions.
7. Navigate between questions.
8. Mark questions for review.
9. See a countdown timer.
10. Have answers automatically saved.
11. Recover after an accidental refresh if the attempt remains active.
12. Submit the test.
13. See results according to the test's configured result visibility.

### Question types

Implement these initial question types:

- Multiple Choice
- Quantitative Comparison
- Numeric Entry
- Text Completion
- Sentence Equivalence
- Reading Comprehension
- Image-Based Question

The architecture must use a question-type registry/component strategy so future types can be added without rewriting the whole application.

### Quantitative Comparison

This question type is especially important.

The administrator must be able to enter:

- Question prompt
- Optional question image
- Quantity A
- Quantity B
- Correct relationship
- Explanation

Quantity A and Quantity B must support text and/or images.

Correct answer options:

- Quantity A is greater
- Quantity B is greater
- The two quantities are equal
- The relationship cannot be determined

### Reading Comprehension

A passage must be reusable by multiple questions.

Model:

Passage → Question 1
Passage → Question 2
Passage → Question 3

Do not duplicate the passage unnecessarily.

### Images

Use Supabase Storage.

Allow:

- File picker
- Drag and drop
- Preview
- Replace
- Delete

Validate file type and size.

### Tests

Tests should support:

- Title
- Description
- Instructions
- Duration
- Sections
- Questions
- Question ordering
- Attempt limit
- Result visibility
- Status

Statuses:

- Draft
- Review
- Published
- Active
- Closed

### Access codes

Generate secure, human-friendly codes such as:

Q7K4P9

Avoid ambiguous characters where practical.

Access codes must be generated server-side and uniquely constrained.

### Attempts

An attempt is a separate entity from a test.

Store:

- Candidate name
- Test
- Status
- Started time
- Expiration time
- Submitted time
- Current question
- Last activity
- Score
- Maximum score
- Percentage

### Timer

Do not trust the browser timer as the authority.

The server must store:

- started_at
- expires_at

The frontend displays the remaining time using server-derived timing.

When time expires:

- Lock the attempt.
- Submit automatically.
- Grade it.
- Store the result.

### Autosave

Answers must be saved automatically.

Candidate answer changes should persist to the backend.

The UI should remain responsive while saving.

Show a subtle saved/saving/error state.

### Recovery

If the candidate refreshes the browser:

- Find the active attempt.
- Verify it is still valid.
- Load saved answers.
- Restore current question.
- Restore remaining time.

If submitted or expired, show the appropriate state.

### Grading

Grading must happen server-side.

Implement modular grading strategies for:

- Multiple choice
- Quantitative comparison
- Numeric entry
- Multiple correct answers
- Other objective types

Do not expose correct answers to the candidate during an active test.

### Monitoring

Implement real-time administrator monitoring with Supabase Realtime.

The administrator should see:

- Candidate name
- Active/inactive status
- Current question
- Progress
- Answered count
- Unanswered count
- Marked count
- Time remaining
- Last activity
- Submission status

The administrator should not need to refresh the browser.

Create an event architecture for:

- attempt_started
- question_viewed
- answer_changed
- question_marked
- question_unmarked
- attempt_submitted
- attempt_expired
- candidate_connected
- candidate_disconnected

### Security

Use Supabase Row Level Security.

The administrator must only access authorized administrative resources.

Candidates must only access their own attempt and the questions they are authorized to see.

Never send correct answers to the candidate browser during an active exam.

Never expose service-role credentials in frontend code.

Validate all user input.

Use server-side authorization for sensitive operations.

### UI

Create a clean, modern assessment interface.

Admin should feel like a professional dashboard.

Candidate should feel like a focused examination environment.

Use responsive layouts.

On desktop, reading comprehension can use a split-pane passage/question layout.

On mobile, stack the content vertically.

Provide:

- Question navigator
- Previous/Next
- Mark for review
- Timer
- Progress
- Submit confirmation

### Admin question creation

Optimize for fast manual entry.

Include:

- Save
- Save & Add Another
- Preview
- Edit
- Delete
- Drag-to-reorder

Show validation problems clearly.

Do not allow publishing a test containing invalid questions.

### Architecture

Use a modular feature-based project structure.

Keep:

- UI components
- database services
- business logic
- grading logic
- authentication
- realtime logic

separated.

Do not place all logic inside page components.

Use typed service functions/hooks.

### Database

Create migrations for the database.

At minimum, implement tables/entities for:

- profiles
- tests
- sections
- passages
- questions
- question_media
- options
- question_answers
- attempts
- answers
- review_marks
- attempt_events

Add appropriate:

- foreign keys
- indexes
- unique constraints
- timestamps
- RLS policies

Ensure:

unique(attempt_id, question_id)

for answers.

### Storage

Create an appropriate Supabase Storage bucket for question images.

Use structured storage paths.

Do not store image binaries directly in PostgreSQL.

### Testing

Write tests for:

- Question validation
- Grading
- Numeric tolerance
- Access-code generation
- Timer expiration
- Duplicate submission
- Candidate authorization
- Admin authorization

Create an end-to-end test covering:

Admin creates test → publishes → generates code → candidate joins → candidate answers → autosave → admin sees live activity → candidate submits → grading → results.

### Development methodology

Do not attempt to build every feature simultaneously.

Implement in vertical slices.

Start with:

1. Project setup
2. Supabase integration
3. Authentication
4. Database schema/migrations
5. Admin dashboard
6. Test creation
7. Sections
8. Multiple choice questions
9. Quantitative comparison
10. Image upload
11. Candidate join
12. Attempt/session
13. Autosave
14. Timer
15. Submission
16. Grading
17. Results
18. Realtime monitoring
19. Remaining question types
20. Security hardening
21. Tests
22. Deployment

At every stage, keep the application runnable.

Do not create placeholder buttons that appear functional but do nothing.

Do not silently skip required functionality.

If a feature is intentionally deferred, clearly label it as deferred rather than pretending it exists.

### Code quality

Use:

- TypeScript
- Strong typing
- Reusable components
- Clear naming
- Small functions
- Proper error handling
- Environment variables
- Database migrations
- RLS
- Automated tests

Avoid:

- Massive components
- Duplicated question-rendering logic
- Hard-coded test questions
- Hard-coded access codes
- Client-only security
- Client-only timing
- Exposing correct answers
- Secrets in source code
- Unnecessary dependencies

### Important product philosophy

The system must be generic.

Do not hard-code the application around "Quiz 1", "Quant 1", or "Verbal 1".

The administrator should be able to create arbitrary tests such as:

- Quiz 1
- Quant 1
- Verbal 1
- GRE Practice Test
- Mathematics Test
- Mock Examination
- Reading Practice

The same application must support all of them.

The central concept is:

```text
Test
 → Sections
   → Passages
   → Questions
     → Options/Media/Answers
```

and:

```text
Test
 → Attempts
   → Answers
   → Events
```

The final system should be maintainable, secure, extensible, and suitable for evolving from a single-user private testing tool into a multi-user assessment platform.

Before implementing a major feature, inspect the existing architecture and reuse existing abstractions where appropriate.

Do not rewrite working parts unnecessarily.

At the end of each implementation milestone, verify that:

1. The application builds.
2. TypeScript checks pass.
3. Tests pass.
4. The feature works end-to-end.
5. No secrets are exposed.
6. Database migrations are included.
7. RLS policies are included where relevant.

The final MVP should allow a real administrator and a real candidate to complete the complete workflow without manual database manipulation.
