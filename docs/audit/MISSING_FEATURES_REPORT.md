# TrustToPay — Missing, Incomplete & Broken Features Report

**Audit Date:** 2026-11-10  
**Scope:** Incomplete, Unverified, Partially Implemented, or Broken Functionality in TrustToPay  
**Associated Checklist:** [`docs/audit/COMPLETE_FEATURE_AUDIT.md`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/docs/audit/COMPLETE_FEATURE_AUDIT.md)

---

## 1. Severity Ranking Overview

Every finding in this report is ranked according to the strict criteria defined in the audit guidelines:

- **CRITICAL**: Security vulnerability, privacy violation, authentication bypass, or data integrity flaw.
- **HIGH**: Core TrustToPay functionality missing, broken, or preventing full workflow execution.
- **MEDIUM**: Important user-facing feature incomplete, inconsistent styling, or unused bundle bloat.
- **LOW**: Minor quality-of-life, documentation discrepancies, or future architectural optimizations.

---

## 2. CRITICAL Severity Findings

### [CRIT-01] Proctoring Audio Track Requests Microphone Without Assessment Purpose
- **Status:** PARTIALLY IMPLEMENTED / PRIVACY VIOLATION
- **File:** `frontend/src/pages/skill-assessment.tsx` (Line 85)
- **Component:** `SkillAssessmentPage` -> `requestCamera`
- **Observed Behavior:**
  ```typescript
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
    audio: true, // <-- Unnecessary microphone access
  });
  ```
- **Identified Issue:** The skill assessment guidelines explicitly state: *"Uses explicit browser permission prompts... Does not access the microphone unnecessarily."* Requesting `audio: true` triggers an intrusive microphone permission prompt in the browser, yet no audio analysis, speech recognition, or audio recording is performed or needed during the code/multiple-choice assessment.
- **Impact:** Causes user friction, privacy concerns, and potential test-room authorization failures in privacy-conscious enterprise environments.
- **Remediation:** Remove `audio: true` from `getUserMedia` call:
  ```typescript
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
    audio: false,
  });
  ```

---

## 3. HIGH Severity Findings

### [HIGH-01] 79 of 83 Technical Skills Lack Assessment Question Banks
- **Status:** PARTIALLY IMPLEMENTED
- **Files:** `backend/src/services/skills/taxonomy.ts`, `backend/src/services/skills/assessmentEngine.ts`
- **Component:** `DEFAULT_SKILLS_CATALOG`, `SKILL_TAXONOMY`
- **Observed Behavior:**
  - The skill taxonomy defines 83 granular skills across 12 categories.
  - `DEFAULT_SKILLS_CATALOG` only defines question banks for **4 skills**:
    1. TypeScript (`typescript`)
    2. Python (`python`)
    3. Smart Contracts (`smart-contracts`)
    4. Distributed Systems (`distributed-systems`)
  - All other 79 skills (including C, C++, Go, Rust, Java, React, Next.js, Docker, Kubernetes, AWS, PostgreSQL, etc.) have `isAssessed: false` in the taxonomy and no `AssessmentStage` records seeded.
- **Impact:** Reviewers can select these skills on their profile, but clicking "Take Assessment" or attempting to verify them fails with `404 SKILL_NOT_FOUND` / `404 ASSESSMENT_STAGE_NOT_FOUND`. Consequently, matching tasks that require any of these 79 skills cannot find verified specialists.
- **Remediation:** Author and seed standard 3-level question banks for the highest-demand technical skills (Go, Rust, React, Docker, Kubernetes, AWS, SQL).

---

### [HIGH-02] Broken Administrator Approval Banner in Reviewer Dashboard
- **Status:** BROKEN / MISLEADING UI
- **File:** `frontend/src/pages/dashboard.tsx` (Lines 300–305)
- **Component:** `ReviewerDashboard`
- **Observed Behavior:**
  ```tsx
  {!data.approval.approved ? (
    <Alert tone="warning" icon={<AlertTriangle className="size-4" />} title="Reviewer approval pending">
      An administrator must approve your reviewer account before you can accept tasks. In demo mode seeded
      reviewers are already approved.
    </Alert>
  ) : null}
  ```
- **Identified Issue:**
  1. The Admin role, Admin account creation, and Admin dashboard were explicitly eliminated from the TrustToPay architecture.
  2. In `backend/src/routes/auth.ts` (line 73), newly registered reviewers are automatically set to `isReviewerApproved: true`.
  3. However, if a reviewer account has `isReviewerApproved: false` for any reason (e.g. database seed discrepancy), the dashboard tells the user that an "administrator" must approve them, which is impossible because no administrator role or dashboard exists.
- **Impact:** Creates dead-end confusion for reviewers who see an alert referencing a non-existent role.
- **Remediation:** Remove the obsolete administrator reference. If account verification is required, bind it to completing identity confirmation or earning at least one Level 1 verified skill credential.

---

### [HIGH-03] Live External Service Calls Unverified (Operating via Local Mocks / Demo Mode)
- **Status:** IMPLEMENTED, NOT VERIFIED
- **Components:**
  1. **Supabase Auth PKCE Flow:** `frontend/src/lib/supabase.ts` & `backend/src/auth/supabase.ts`
  2. **PayPal Sandbox Orders v2 & Payouts v1:** `backend/src/services/payments.ts`
  3. **Elasticsearch 8.x Cluster:** `backend/src/services/elastic/specialistIndexService.ts`
  4. **Jina AI Embeddings:** `backend/src/services/elastic/specialistIndexService.ts`
- **Observed Behavior:** Code for each integration is fully written and tested against in-memory mock adapters and local fallbacks. However, live API keys for Supabase, PayPal Sandbox, Elastic Cloud, and Jina AI were not configured during local audit execution.
- **Impact:** While local development and deterministic test suites pass 100%, end-to-end network communication against external provider servers remains unverified in this local workspace.
- **Remediation:** Deploy to staging environment with active Sandbox credentials according to [`docs/ENVIRONMENT_SETUP_GUIDE.md`](file:///C:/Users/Win11%20Pro/antigravity/TrustToPay/docs/ENVIRONMENT_SETUP_GUIDE.md).

---

## 4. MEDIUM Severity Findings

### [MED-01] Residual Dark Theme Hardcoded Colors in Dashboard Charts
- **Status:** PARTIALLY IMPLEMENTED / UI HYGIENE
- **File:** `frontend/src/pages/dashboard.tsx` (Lines 161, 178)
- **Component:** `RequesterDashboard` -> `ChartCard` Recharts components
- **Observed Behavior:**
  ```tsx
  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2B42" />
  ...
  contentStyle={{
    fontSize: 11,
    borderRadius: 8,
    borderColor: "#1E2B42",
    backgroundColor: "#0E1522", // <-- Hardcoded dark obsidian background
    color: "#F1F5F9",
  }}
  ```
- **Identified Issue:** The entire application was redesigned into a bright, warm ivory/cream palette (`#F7F5EF`, surfaces `#FFFEFA`, borders `#E5E1D7`). The dark tooltip and grid lines lingering in the dashboard chart violate the design consistency requirement ("Check that no obsolete dark-themed page remains").
- **Remediation:** Update chart tooltip to use warm surface tokens: `backgroundColor: "#FFFEFA"`, `borderColor: "#E5E1D7"`, `color: "#202722"`, and `stroke: "#E5E1D7"`.

---

### [MED-02] Unused AG Grid Community & React Dependencies
- **Status:** PARTIALLY IMPLEMENTED / BUNDLE BLOAT
- **Files:** `frontend/package.json` (lines 20–21), `frontend/src/index.css` (lines 1–2)
- **Observed Behavior:**
  - `frontend/package.json` declares:
    ```json
    "ag-grid-community": "^32.3.3",
    "ag-grid-react": "^32.3.3"
    ```
  - `frontend/src/index.css` imports:
    ```css
    @import "ag-grid-community/styles/ag-grid.css";
    @import "ag-grid-community/styles/ag-theme-quartz.css";
    ```
  - However, an exhaustive code search reveals that **zero components** in `frontend/src/` import or render an `<AgGridReact>` component.
- **Identified Issue:** When the Admin operational grids were removed from the user-facing UI, the packages and stylesheets were left behind in the build. This introduces unnecessary CSS overhead (over 270KB) and extra vendor dependencies.
- **Remediation:** Remove `ag-grid-community` and `ag-grid-react` from `frontend/package.json` and delete the two `@import` lines in `frontend/src/index.css`.

---

### [MED-03] External Notification Dispatch Is Database-Only
- **Status:** PARTIALLY IMPLEMENTED
- **File:** `backend/src/lib/audit.ts` (`notify`), `backend/src/services/matching/offerDispatcher.ts`
- **Observed Behavior:** When a task offer is dispatched to the top 5 specialists, `notify()` inserts a row into the Prisma `Notification` table. No outbound email (Resend / SendGrid), SMS, or push webhook is triggered.
- **Impact:** Specialists must already be logged into the web application to see that an offer has arrived; without external notification, offers with 15-minute TTL may expire before specialists notice them.
- **Remediation:** Add an outbound email/webhook hook to `notify()` for newly dispatched offers.

---

## 5. LOW Severity Findings

### [LOW-01] Secret Scanner Is Rule-Based Rather Than Entropy-Based
- **Status:** VERIFIED COMPLETE (Functioning as designed, enhancement recommended)
- **File:** `backend/src/services/security/deterministicScanner.ts`
- **Observed Behavior:** Uses 8 regular expressions to detect high-profile API keys and private keys. Does not compute Shannon entropy on arbitrary hex/base64 strings.
- **Remediation:** Consider adding entropy threshold scanning for arbitrary unidentified secrets.

### [LOW-02] Assessment Code Tasks Graded via Pattern Checks Rather Than Test Runners
- **Status:** VERIFIED COMPLETE (Functioning as designed, enhancement recommended)
- **File:** `backend/src/services/skills/assessmentEngine.ts` (`gradeAssessmentQuestions`)
- **Observed Behavior:** Code submissions in assessments are evaluated by checking for required structural constructs (e.g., `tx.task.update`, `$transaction`) and forbidden patterns (`eval(`). Untrusted student code is never executed in-process.
- **Remediation:** In a future enhancement, execute assessment code tasks in the isolated sandbox runner for dynamic runtime test suite verification.

---

## 6. Summary Defect & Gap Matrix

| ID | Title | Severity | Area | Recommended Action |
| :--- | :--- | :---: | :--- | :--- |
| **CRIT-01** | Unnecessary microphone access during proctoring | **CRITICAL** | Frontend Proctoring | Set `audio: false` in `getUserMedia` |
| **HIGH-01** | 79 of 83 taxonomy skills lack question banks | **HIGH** | Skills Assessment | Author question banks for Go, Rust, React, AWS, Docker |
| **HIGH-02** | Misleading administrator approval alert on reviewer dashboard | **HIGH** | Frontend Dashboard | Remove obsolete alert banner |
| **HIGH-03** | External provider APIs unverified in live environments | **HIGH** | Integrations | Verify in staging with live Sandbox credentials |
| **MED-01** | Hardcoded dark colors in dashboard Recharts tooltips | **MEDIUM** | UI Theme Consistency | Update tooltips to warm ivory palette |
| **MED-02** | Unused `ag-grid-community` dependencies in frontend | **MEDIUM** | Frontend Build / Bundle | Prune package and delete CSS imports |
| **MED-03** | Specialist offer dispatch lacks outbound email alerts | **MEDIUM** | Dispatch Notifications | Wire email provider to `notify()` |
| **LOW-01** | Secret scanner relies purely on regex rules | **LOW** | Security Scanner | Add Shannon entropy scanner |
| **LOW-02** | Assessment code tasks graded by static AST regex | **LOW** | Assessment Engine | Wire isolated sandbox runner |
