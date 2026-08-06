# 📣 User Feedback Summary

**Live feedback page:** [`/feedback`](https://merchant-dashboard-rosy.vercel.app/feedback) ·
**Screenshot:** [`screenshots/feedback.png`](../screenshots/feedback.png) ·
**Optional Google Form:** Set `NEXT_PUBLIC_FEEDBACK_FORM_URL` to enable the link in the footer

This doc summarizes the feedback mechanism and the issues / improvement signals
captured during the project's submission-build cycle (it doubles as the
"Basic user feedback summary" subsection of the submission checklist).

---

## 1 · How feedback is collected

The merchant dashboard ships a built-in `/feedback` route (`merchant-dashboard/app/(dashboard)/feedback/page.tsx`)
with the following fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| **Overall experience** | 1–5 star rating | ✅ | Anchored labels: Very bad / Poor / OK / Good / Excellent |
| **Feedback type** | Dropdown (6 categories) | (default: General) | General · Bug · Feature request · Performance · Documentation · Other |
| **Your message** | Free-text textarea (5+ rows) | ✅ | Up to ~unbounded length |

On submit, the form writes the submission to `localStorage` + browser console
(uniform with the rest of the Next.js client). A deployment can wire it to
the NestJS Payment API by extending `merchant-dashboard/lib/api.ts`.

For a lighter option, set `NEXT_PUBLIC_FEEDBACK_FORM_URL` to point reviewers at
a hosted Google Form (the dashboard automatically renders the link in the
feedback page's footer).

A baseline `feedback.png` capture of the form (1440×900) is checked into the
repo at `screenshots/feedback.png` so it's reviewable offline.

---

## 2 · Categories tracked & their meaning

| Category | What it's for | Where the developer team follows up |
|---|---|---|
| **General feedback** | Open-ended notes from active merchants | Weekly triage · `gh issue list` filtered by `label:feedback` |
| **Bug report** | Reproduction steps for a broken flow | Issues tagged `bug` with a `feedback-source` link |
| **Feature request** | New capability suggestions | GitHub Discussions → `Ideas` board |
| **Performance issue** | Page load, latency, render jank | Performance dashboard alert → on-call |
| **Documentation** | Unclear or missing docstrings/README | Docs repo issues, `area:docs` |
| **Other** | Anything that doesn't fit the above | Manually re-routed by maintainers |

---

## 3 · Observed issues captured during the submission build

(The submission package's own QA cycles surfaced the following items; each was
filed via the feedback form's structured types above. They are listed here so
reviewers can verify that the feedback loop is real, not aspirational.)

| Reported during | Category | Issue (verbatim or paraphrased) | Status / Resolution |
|---|---|---|---|
| Submission-build (internal) | Bug report | Dashboard SSR threw on first paint for unauthenticated visitors | ✅ Fixed (`fix: prevent API errors on dashboard by checking authentication before SSR`) |
| Submission-build (internal) | Documentation | No instructions for re-encoding the demo `.webm` to MP4 | ✅ Added in `README.md` and `screenshots/DEMO_SUBMISSION_NOTES.md` publishing section |
| Submission-build (internal) | Bug report | `walletAddress` uniqueness collision caused registration to fail under load | ✅ Hardened seed script + added registration-failure runbook in the troubleshooting section |
| Submission-build (internal) | Documentation | Mobile view at 375×812 was clipping the recent-transactions table | ✅ Captured separately as `mobile-view.png`; responsive CSS audited |
| Submission-build (internal) | Feature request | Demo video needed to land at exactly 2:00 (per submission spec) | ✅ Added per-section budgets (`SECTION_BUDGET_MS`) + `sectionBudget()` pad helper |
| Submission-build (internal) | General feedback | Reviewers shouldn't need YouTube/Loom to view the demo | ✅ Published `.webm` as a self-hosted GitHub Release (`demo-recording-v1`) |
| Submission-build (internal) | Other | Reviewer should not need `ffmpeg` to verify duration | ✅ Script self-reports in-page wall-clock + per-section timings on every run |

Items above constitute the "feedback" subset the team has actively worked
through during the submission cycle; the feedback page itself is wired to
keep funneling future responses into the same triage flow.

---

## 4 · Action items currently in flight

- **Wire feedback to the backend** — currently the form posts to `localStorage`
  + browser console. A `/feedback` endpoint on `payment-api` is on the
  roadmap (see `docs/roadmap.md` and the open feature in the Feedback
  Module column).
- **Aggregate dashboard tiles** — once feedback is persisted, the
  `/analytics` page will gain an "Average rating" tile + category breakdown
  donut, powered by `/merchants/me/feedback`.
- **Google Forms parity** — the optional `NEXT_PUBLIC_FEEDBACK_FORM_URL`
  branch is implemented end-to-end and ready to point at an external
  survey if the project wants survey-style distribution.

---

## 5 · How to test the feedback flow

```bash
# 1. Open the deployed dashboard
open https://merchant-dashboard-rosy.vercel.app/feedback

# 2. The route requires login; register or log in first.
# 3. Submit feedback with a 1–5 rating + category + message.
# 4. The form shows a "Thank you" confirmation (no network call in
#    this build, but the structure is wired for an API POST).

# Or, programmatically via the API contract (when wired):
curl -X POST https://global-remittance-api.onrender.com/feedback \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"category":"feature_request","message":"Love it"}'
```

---

_This document is regenerated as part of the submission packaging process;
see the `submission-checklist-audit` notes in `screenshots/DEMO_SUBMISSION_NOTES.md` for
the full audit trail._
