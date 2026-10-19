---
title: "LedgerVault AI: Privacy-First Expense & Tax Auditor for Freelancers"
published: true
tags: devchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

## What I Built

Freelance developers, independent consultants, and solopreneurs bill **$75–$150/hour**, yet spend **4 to 8 hours every month** sorting receipts, calculating tax write-offs, and matching expenses to client projects.

More importantly, freelancers routinely sign strict **Non-Disclosure Agreements (NDAs)**. Uploading receipts containing confidential client names, meeting locations, and contractor rates to proprietary cloud AI services (OpenAI, Anthropic, Expensify) introduces serious privacy, compliance, and data-leak risks. At the same time, conventional cloud bookkeeping platforms cost **$30–$60 per month** in recurring subscription fees.

I built **LedgerVault AI**, a privacy-first, local expense and tax auditing tool designed for independent professionals.

### What Does It Do?
- **Automated Line-Item & Merchant Extraction**: Ingests expense records and receipts, identifying merchants, dates, amounts, and item details.
- **Statutory IRS Form 1040 Schedule C Mapping**: Automatically categorizes transactions into correct tax lines:
  - **Line 9**: Car & Truck / Local Travel
  - **Line 11**: Contract Labor (subcontractors & external specialists)
  - **Line 17**: Legal & Professional Services (attorneys, CPAs, advisory)
  - **Line 18**: Office Expenses & Cloud SaaS (AWS, Figma, GitHub, tooling)
  - **Line 24b**: Deductible Business Meals (automatically enforces the statutory **50% limit** under IRC § 274(n))
- **Audit Risk & Compliance Flags**: Identifies weekend dining, missing itemized receipts, and substantiation warnings.
- **Client Attribution & Billable Segregation**: Easily separates client-reimbursable project costs from internal studio overhead.
- **1-Click Bookkeeping Export**: Generates QuickBooks/Xero-compatible CSVs and structured JSON for CPA tax prep.
- **100% Local Sandbox Guarantee**: Runs entirely within the browser or through a local inference bridge. Uses bundled SVG assets and system fonts—**zero remote CDNs, zero telemetry, and zero data leakage**.

### Who Would Pay For It? (The Side Hustle Model)
Independent software developers, UX consultants, creative freelancers, and boutique agencies. 
The monetization model is a classic indie-hacker utility:
- **$29 One-Time Lifetime License** (or **$7/month** utility subscription).
- Reclaiming just one billable freelance hour easily pays for the software forever, without locking freelancers into another recurring cloud SaaS subscription.

## Demo

- **Live Demo / Deployed Link**: [https://farrosilman.github.io/LedgerVault/](https://farrosilman.github.io/LedgerVault/)
- **Video Walkthrough**: *(Interactive live web demo available at the link above; video demonstration available upon request)*

### Interactive Walkthrough Highlights
1. **Zero-CDN Isolated Dashboard**: Open the application—notice zero remote network requests, instant loading, and local vector icons.
2. **Preset & Receipt Ingestion**: Select realistic freelance expense presets (AWS cloud infrastructure, client dinner meetings, rideshare transit, subcontractor invoices) or paste receipt transcripts.
3. **Real-Time Tax Audit**: Observe the automatic enforcement of IRS Schedule C classifications, including the 50% business meal deduction cap.
4. **Client Attribution**: Filter expenses by billable client projects to generate client reimbursement reports.
5. **Data Export**: Export the audited expense ledger into QuickBooks-ready CSV or CPA-ready JSON with one click.
6. **Local AI Diagnostics**: Inspect the live connection bridge to verify whether a local Ollama instance is active.

## Code

{% github https://github.com/FarrosIlman/LedgerVault %}

- **GitHub Repository**: [https://github.com/FarrosIlman/LedgerVault](https://github.com/FarrosIlman/LedgerVault)
- **License**: MIT License (open-source and permissive)
- **Tech Stack**: Vanilla HTML5, CSS3, modern ES6+ JavaScript. No npm build steps, Webpack, or bundler bloat required. Completely transparent, inspectable, and self-contained.

## How I Built It

LedgerVault AI is built around a dual-tier local processing architecture:

### 1. Open-Source AI via Local Ollama Bridge
The application includes a direct connection bridge to a local **Ollama** daemon running at `http://localhost:11434`.
- **Supported Open-Weight Models**: Optimized for **Llama 3.2 3B** and **Mistral 7B**.
- **Structured JSON Schema Output**: Sends extraction prompts with strict JSON schema definitions (`format: 'json'`), ensuring reliable entity extraction (merchant, date, subtotal, tax, category, audit risk flag) directly on local GPU/CPU hardware.
- **Zero Cloud API Keys**: No API keys, no per-token charges, and no external data transmission.

### 2. Client-Side Statutory Tax Engine & Rule Parser
When Ollama is not installed or when running on low-resource machines, LedgerVault AI falls back to a deterministic, client-side statutory heuristic engine:
- Encodes official IRS Schedule C rules and deduction formulas directly into browser JavaScript.
- Instantly categorizes common freelance merchants and flags compliance requirements (such as business purpose substantiation).

### 3. Local-First Assets & Zero-Egress Privacy Sandbox
- Zero external dependencies: All icons are bundled locally as inline SVGs.
- System typography stack: Completely eliminates Google Fonts and external CDN calls.
- Built-in live telemetry inspector verifying local origin execution and zero external egress.

## Why Does Open Innovation Matter?

Open-source AI and open-weight models fundamentally change what is possible for privacy-critical software:

1. **Non-Negotiable Client Confidentiality (NDA Protection)**: Freelancers cannot legally or ethically send client names, project scopes, hourly rates, and NDA-covered details to proprietary cloud AI APIs whose terms permit prompt logging or model training. Open innovation allows the AI to come to the user's data, rather than the data going to a third party.
2. **Elimination of the "Token Tax"**: Proprietary cloud APIs charge per call and per image token. For a small side hustle or solo freelancer reviewing dozens of receipts each month, variable token costs make software unpredictable and expensive. Open-weight models turn AI into a fixed-cost, zero-marginal-cost local utility.
3. **Vendor Independence & Longevity**: Tax and bookkeeping records must be retained for at least 7 years under IRS regulations. Closed SaaS products can shut down, hike prices 300%, or deprecate APIs overnight. Open-source software running open-weight models remains functional on your machine decades into the future.

## My Agent Session

This project was built and audited with the help of **Google Antigravity** AI assistant.

The agent pair-programming workflow was used to:
- Formulate the dual-tier architecture (Ollama open-weight bridge + deterministic browser tax engine).
- Implement the IRS Form 1040 Schedule C classification rules and 50% meal deduction logic.
- Strip all remote CDN dependencies down to a clean, verifiable local-first sandbox.
- Validate project integrity, telemetry diagnostics, and export formats.

## My First User

To validate the side hustle concept, I ran a pilot test with **Alex R.**, an independent freelance full-stack developer managing 3 concurrent client retainers.

### The Test
Alex imported a typical month of business expenses:
- Monthly AWS cloud hosting bill ($142.50)
- Client lunch meeting at an Italian bistro ($78.40)
- Lyft rides to an on-site client meeting ($36.20)
- A freelance UI designer's contract invoice ($650.00)

### User Feedback
> *"Normally, doing my quarterly expense sorting is a headache because I have to manually redact client names and project codes before uploading anything to cloud apps. With LedgerVault, the 50% meal cap was calculated instantly, the contractor fee was flagged for 1099 tracking, and knowing none of my receipts left my laptop gave me complete peace of mind. I'd easily pay $29 once to avoid recurring Expensify fees."*

### Commercial Validation
Alex confirmed that paying a **$29 one-time license** was an immediate no-brainer compared to $30–$60/month subscriptions, and suggested adding batch CSV import and multi-currency support in the next update.

## Prize Categories

- **Hacktoberfest Open-Source AI Challenge: Side Hustle Track**  
  *(A commercial-grade, privacy-first productivity tool built for the freelance economy, demonstrating a clear monetization hypothesis and zero-cloud open-weight AI integration).*

---

#devchallenge #hf26challenge
