---
name: frontend-production-audit
description: 'Deep live-site frontend audit workflow. Use when auditing UI/UX quality, responsive behavior, network/API correctness, UI-vs-API mapping, duplicate API calls, and generating a continuous markdown issue report.'
argument-hint: 'Live site URL and optional route overrides'
---

# Frontend Production Audit

## What This Skill Produces

- A complete end-to-end audit of a live frontend website.
- Continuous issue logging in `frontend-audit-report.md` during execution, not only at the end.
- Severity-classified findings with actionable fixes.
- Verification that UI data matches network/API responses.

## Use When

- You need a full production UI/UX and API integration audit.
- You need responsive behavior testing across breakpoints.
- You need to detect duplicate API calls, overfetching, or render loops.
- You need route-by-route evidence of issues and fixes.

## Required Inputs

- `baseUrl`: Live website URL to audit.
- `routeList` (optional): Routes to audit; defaults to the mandatory list below.

## Mandatory Default Route List

If `routeList` is not provided, audit all of these routes:

- /
- /_not-found
- /about
- /accessibility
- /alerts
- /api-docs
- /api-test
- /api/health
- /auth/forgot-password
- /auth/login
- /auth/profile
- /auth/register
- /auth/reset-password
- /auth/sessions
- /auth/verify-email
- /blog
- /contact
- /faq

Also discover and test dynamically reachable routes from menus, cards, links, buttons, and in-page navigation.

## Non-Negotiable Execution Order

Follow this strict order for each route and major component. Do not code first.

1. Full visual exploration.
2. Responsiveness testing.
3. Network/API validation.
4. UI vs API data verification.
5. Duplicate API call detection.
6. Recursive section/component/element pass.

## Execution Workflow

### 0. Setup

1. Open `baseUrl` in browser tooling.
2. Create `frontend-audit-report.md` at repo root if missing.
3. Add report header with timestamp and audited base URL.
4. Prepare route queue with mandatory routes plus discovered dynamic routes.

### 1. Full Visual Exploration

For each route:

1. Traverse full page:
   - Top to bottom scroll.
   - Bottom to top scroll.
   - Left-right regions and overflow containers.
2. Interact with all visible controls:
   - Buttons, links, tabs, filters, forms, drawers, modals, accordions.
3. Record UX and visual defects:
   - Spacing/alignment issues.
   - Typography inconsistencies.
   - Visual hierarchy problems.
   - Broken layouts or hidden content.
   - Missing/loading/error state defects.

### 2. Responsiveness Testing

For each route, test at minimum:

- Mobile width.
- Tablet width.
- Laptop width.
- Large desktop width.

Log:

- Overflow and clipping.
- Broken stacking/wrapping.
- Hidden or unusable interactive elements.
- Navigation and modal usability regressions.

### 3. Network/API Validation

For each user interaction that should fetch/update data:

1. Capture request details:
   - Endpoint URL.
   - Method.
   - Payload/query params.
   - Relevant headers.
2. Capture response details:
   - Status code.
   - Response schema/shape.
   - Data payload quality.
3. Mark failures immediately when endpoints are wrong, responses are malformed, or status indicates error.

### 4. UI vs API Data Verification

For each data-driven component:

1. Compare network response fields with rendered UI values.
2. Detect and log:
   - Missing data in UI.
   - Wrong field mapping.
   - Partial rendering.
   - Hardcoded/mock data replacing real data.
   - Stale async states.
3. Classify any mismatch as `CRITICAL`.

### 5. Duplicate API Call Detection

Check for:

- Repeated identical requests from a single interaction.
- Request storms from rerenders/effect loops.
- Missing caching/memoization behavior where expected.

Classify confirmed duplicate-call issues as `CRITICAL` performance findings.

### 6. Recursive Coverage Pass

For each route, recurse:

- Page
- Section
- Component
- Element

Repeat visual check, network check, and mapping check at each level until coverage is complete.

## Logging Rules

Update `frontend-audit-report.md` continuously while testing. Do not defer logging.

For every issue, append immediately:

```md
### [Severity] - Issue Title

**Page/Route:**
**Component:**

**Problem:**
(What is wrong)

**Expected Behavior:**
(What should happen)

**Actual Behavior:**
(What is happening)

**Root Cause (if identifiable):**
(Why it is happening)

**Suggested Fix:**
(Short actionable fix)

---
```

## Severity Classification

- `CRITICAL`
  - API data mismatch.
  - Data not displayed though API succeeds.
  - Duplicate API calls / render-loop request storms.
  - Broken core functionality.
- `HIGH`
  - Major UI/UX or responsiveness failures.
- `MEDIUM`
  - Noticeable hierarchy, spacing, and consistency issues.
- `LOW`
  - Minor cosmetic issues.

## Decision Branches

- If a route requires authentication, attempt valid auth flow and continue. If blocked by missing credentials, log blocker with exact route and prerequisite.
- If a route is unreachable (404/redirect loop/permission denial), log issue and continue with remaining routes.
- If API cannot be observed for an interaction, log evidence and continue with fallback functional checks.
- If dynamic routes are discovered, append them to the queue and audit them before completion.

## Completion Criteria

Audit is complete only when all conditions are met:

1. Mandatory routes audited.
2. Dynamically discovered routes audited.
3. Visual checks completed across breakpoints.
4. Network/API checks performed for data interactions.
5. UI-vs-API verification completed for data-driven components.
6. Duplicate call/performance checks completed.
7. `frontend-audit-report.md` fully updated with severity and fixes.

## Output Expectations

- Provide concise progress updates during execution.
- Final summary must include:
  - What was audited.
  - What was broken/fixed/recommended.
  - Remaining blockers (if any).
You are a senior frontend engineer and UI/UX auditor with strong debugging skills.

Your task is to open and deeply analyze this live production website:
https://stock-sense-iota.vercel.app/

---

## OBJECTIVE

Perform a complete end-to-end audit of the website including:
- UI/UX quality
- Responsiveness across screen sizes
- API integration correctness
- Data consistency between backend (Network tab) and frontend (UI)
- Performance issues like duplicate API calls

You must work recursively across:
- All pages
- All components
- All modules
- All UI elements

Do NOT stop at surface-level checks.

---

## ROUTES TO COVER (MANDATORY)

You MUST explicitly visit and test all of these routes:

- /
- /_not-found
- /about
- /accessibility
- /alerts
- /api-docs
- /api-test
- /api/health
- /auth/forgot-password
- /auth/login
- /auth/profile
- /auth/register
- /auth/reset-password
- /auth/sessions
- /auth/verify-email
- /blog
- /contact
- /faq

Additionally:
- Discover and test any dynamically reachable routes
- Do NOT skip hidden or indirectly accessible pages

---

## ⚠️ CONTINUOUS ISSUE LOGGING (VERY IMPORTANT)

- As you test, you MUST continuously document findings in a `.md` file.
- Do NOT wait until the end.

Create and maintain:
→ `frontend-audit-report.md`

Update it SIDE BY SIDE while testing.

For EVERY issue found, immediately append:

```md
### [Severity] - Issue Title

**Page/Route:**  
**Component:**  

**Problem:**  
(What is wrong)

**Expected Behavior:**  
(What should happen)

**Actual Behavior:**  
(What is happening)

**Root Cause (if identifiable):**  
(Why it's happening)

**Suggested Fix:**  
(Short actionable fix)

---
HOW TO EXECUTE (STRICT FLOW)
1. FULL VISUAL EXPLORATION (FIRST PRIORITY)
Explore like a real user
Scroll completely:
→ Top → Bottom
→ Bottom → Top
→ Left ↔ Right
Interact with EVERYTHING:
→ Buttons
→ Inputs
→ Filters
→ Tabs
→ Navigation
Identify UI/UX issues:
→ Spacing inconsistencies
→ Alignment issues
→ Poor hierarchy (color / gradients)
→ Font mismatch (parent vs child)
→ Inconsistent typography
→ Broken layouts
2. RESPONSIVENESS TESTING
Test:
→ Mobile
→ Tablet
→ Laptop
→ Large screens
Detect:
→ Layout breaking
→ Overflow
→ Hidden UI
→ Bad stacking
3. NETWORK TAB + API VALIDATION (CRITICAL)
Open DevTools → Network tab

For every interaction:

Capture API calls

Validate:

Endpoint correctness
Method correctness
Payload correctness
Headers

Check response:

Status code
Structure
Data accuracy
4. UI vs API DATA VERIFICATION (MOST IMPORTANT)

For EVERY component:

Compare:
→ API response
VS
→ UI display

Detect:

Missing data
Wrong mapping
Partial rendering
Hardcoded values
Async issues

If mismatch:
→ Log as CRITICAL

5. DUPLICATE API CALL DETECTION
Identify:
→ Multiple identical API calls
→ Infinite re-renders
→ No caching/memoization

→ Log as CRITICAL PERFORMANCE ISSUE

6. RECURSIVE ANALYSIS (MANDATORY)

For each:

Page
→ Section
→ Component
→ Element

Repeat:

Visual check
API check
Data mapping check
BUG SEVERITY CLASSIFICATION

CRITICAL:

API data mismatch
Data not displayed
Duplicate API calls
Broken functionality

HIGH:

Major UI/UX issues
Responsiveness failures

MEDIUM:

Spacing / hierarchy issues

LOW:

Minor cosmetic fixes
OUTPUT EXPECTATION
Maintain .md file LIVE during testing
At the end, ensure:
→ All issues are documented
→ Proper severity classification
→ Clear actionable fixes
IMPORTANT RULES
Do NOT assume — always verify via UI + Network tab
Do NOT skip routes
Do NOT stop early
Do NOT ignore small issues
Always log issues immediately (no memory-based reporting)