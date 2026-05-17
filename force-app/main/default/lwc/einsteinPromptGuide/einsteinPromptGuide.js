import { LightningElement, track } from 'lwc';

const TEMPLATES = [
    {
        id: 1,
        name: 'Flex',
        tagline: 'Multi-object, fully custom prompt for any use case',
        category: 'sales',
        tag: 'Core',
        tagBg: '#E6F1FB', tagColor: '#0C447C',
        iconName: 'utility:custom_apps',
        iconBg: '#E6F1FB', iconColor: '#185FA5',
        persona: { initials: 'RK', name: 'Ravi Kumar', role: 'Sales Manager, Infosys BPM', avatarBg: '#E6F1FB', avatarColor: '#0C447C' },
        situation: 'Ravi\'s team handles 40+ enterprise accounts. Before each Monday review, he used to spend 90 minutes manually pulling data from Accounts, Opportunities, and Campaigns to create one-page deal briefs.',
        aiAction: 'He built a Flex prompt that pulls the Account name, open Opportunities (stage + value), last Campaign sent, and most recent Activity — all in one shot across multiple objects.',
        output: `Account: Tata Consultancy Services
Top Opportunity: Cloud Migration Suite — ₹2.4Cr | Stage: Proposal Sent
Last Campaign: Q4 Cloud Transformation (Oct 12) — 42% open rate
Last Activity: Demo call with Priya Nair (Nov 3)
Recommended Next Step: Send ROI case study + follow up by Nov 10`,
        impact: ['90 min → 4 min', '40 accounts covered', 'Zero manual effort']
    },
    {
        id: 2,
        name: 'Agent Evaluation',
        tagline: 'Score and validate AI agent response quality automatically',
        category: 'agentforce',
        tag: 'Agentforce',
        tagBg: '#EEEDFE', tagColor: '#3C3489',
        iconName: 'utility:metrics',
        iconBg: '#EEEDFE', iconColor: '#534AB7',
        persona: { initials: 'SD', name: 'Sneha Desai', role: 'AI Quality Analyst, HDFC Bank', avatarBg: '#EEEDFE', avatarColor: '#3C3489' },
        situation: 'HDFC Bank deployed an Agentforce bot for home loan queries. Sneha\'s job is to ensure it gives RBI-compliant, accurate answers. She can\'t manually review 2,000 conversations per day.',
        aiAction: 'She configured an Agent Evaluation template that scores each agent response on accuracy, tone, and compliance — all three dimensions in one automated pass.',
        output: `Evaluation Report — Conversation #4821
Accuracy: 9.2/10 — Matched loan eligibility policy correctly
Tone: 8.8/10 — Professional, no jargon
Compliance: ✅ Pass — No unapproved rate commitment
Flag: Slight ambiguity in EMI calculation → Suggest rephrasing`,
        impact: ['2,000 convos/day evaluated', 'Manual QA reduced 70%', 'Compliance audits automated']
    },
    {
        id: 3,
        name: 'Agentforce Scorer Measurement',
        tagline: 'Measure agent performance on a single numeric scale',
        category: 'agentforce',
        tag: 'Agentforce',
        tagBg: '#EEEDFE', tagColor: '#3C3489',
        iconName: 'utility:chart',
        iconBg: '#E1F5EE', iconColor: '#0F6E56',
        persona: { initials: 'AM', name: 'Arjun Mehta', role: 'CX Operations Lead, Swiggy', avatarBg: '#E1F5EE', avatarColor: '#085041' },
        situation: 'Swiggy\'s service bot handles refund requests. Arjun needs a single weekly KPI: What % of refund conversations did the bot resolve without escalation? Across 50,000 weekly chats.',
        aiAction: 'The Scorer Measurement template assigns each conversation a resolution score (0–1). Arjun\'s Flow aggregates scores weekly and pushes results to a Salesforce dashboard.',
        output: `Week of Nov 4 — Bot Resolution Score
Total conversations scored: 51,240
Avg resolution score: 0.74
Fully resolved without human: 73.8%
Escalated to agent: 26.2%
Bottom 5% trigger phrases: "refund not received", "wrong item", "double charged"`,
        impact: ['73.8% self-service rate', 'Weekly KPI automated', 'Coaching focus identified']
    },
    {
        id: 4,
        name: 'Agentforce Scorer Multilabel',
        tagline: 'Evaluate conversations across multiple criteria simultaneously',
        category: 'agentforce',
        tag: 'Agentforce',
        tagBg: '#EEEDFE', tagColor: '#3C3489',
        iconName: 'utility:multi_select_checkbox',
        iconBg: '#FAECE7', iconColor: '#993C1D',
        persona: { initials: 'PV', name: 'Priya Venkat', role: 'Head of CX, MakeMyTrip', avatarBg: '#FAECE7', avatarColor: '#712B13' },
        situation: 'Priya wants to know — simultaneously — whether each bot conversation was empathetic, factually correct, and resolved within policy time. Running 3 separate evaluations was too slow and expensive.',
        aiAction: 'Multilabel Scorer evaluates all three labels in one API pass per conversation. Each label gets its own score and justification — one call, three results.',
        output: `Conversation #MMT-88921
✅ Empathy: 8.5/10 — Acknowledged frustration about delayed flight
✅ Factual accuracy: 9.1/10 — Refund policy correctly stated
⚠️  Policy resolution time: 5.2/10 — Customer waited 18 min (policy: <10 min)
Overall: Needs improvement on speed`,
        impact: ['3-in-1 evaluation', 'Cost per eval cut 60%', 'Instant coaching signals']
    },
    {
        id: 5,
        name: 'Anomaly Analysis',
        tagline: 'Explain why an anomaly occurred with AI-generated narrative',
        category: 'security',
        tag: 'Analytics',
        tagBg: '#FAEEDA', tagColor: '#633806',
        iconName: 'utility:search',
        iconBg: '#FAEEDA', iconColor: '#854F0B',
        persona: { initials: 'VR', name: 'Vikram Rao', role: 'Revenue Analytics Manager, Zepto', avatarBg: '#FAEEDA', avatarColor: '#633806' },
        situation: 'Zepto\'s daily order volume dropped 34% on a Tuesday. Vikram\'s team was flooded with alerts but no explanation. Was it a payment gateway? App crash? Competitor promo? He needed answers in minutes, not days.',
        aiAction: 'Anomaly Analysis template read the flagged metric, cross-referenced recent campaign data, app events, and ops logs, then generated a plain-English root cause narrative.',
        output: `Anomaly Detected: Order volume drop — 34% on Nov 5 (Tuesday)

Root Cause Analysis:
Primary cause: Payment gateway timeout between 10 AM–1 PM (3 hr window)
→ 18,400 failed checkouts logged in that period
Contributing factor: Blinkit ran a "Buy 2 Get 1" promo (Nov 4–6)
impacting 12% of shared customer base

Recommended action: Credit ₹30 voucher to affected users + monitor gateway SLA`,
        impact: ['Root cause in 90 seconds', 'No data team needed', 'Proactive customer recovery']
    },
    {
        id: 6,
        name: 'Anomaly Detection',
        tagline: 'Automatically surface unusual patterns before humans notice',
        category: 'security',
        tag: 'Analytics',
        tagBg: '#FAEEDA', tagColor: '#633806',
        iconName: 'utility:warning',
        iconBg: '#FCEBEB', iconColor: '#A32D2D',
        persona: { initials: 'NS', name: 'Nandini Sharma', role: 'Finance Controller, Infosys', avatarBg: '#FCEBEB', avatarColor: '#791F1F' },
        situation: 'Nandini oversees expense reports for 3,000 employees. Fraudulent claims — duplicate receipts, inflated amounts — were slipping through manual review. She couldn\'t review every report.',
        aiAction: 'Anomaly Detection runs every night on all submitted expense records, flagging outliers based on historical patterns, amount thresholds, and duplicate receipt logic.',
        output: `Anomaly Scan — Nov 6 Expense Batch (847 reports)

⚠️  Flagged for review (3):
1. Emp #4421 — ₹42,000 hotel claim (avg: ₹6,200) — Outlier: +578%
2. Emp #2287 — Duplicate receipt detected (same vendor, 2 days apart)
3. Emp #5103 — 14 cab receipts in one day (avg: 3)

✅ 844 reports cleared automatically`,
        impact: ['844/847 auto-cleared', '3 fraud cases flagged', 'Review time cut 92%']
    },
    {
        id: 7,
        name: 'Case Details',
        tagline: 'Instant AI briefing on any support case before the agent says hello',
        category: 'service',
        tag: 'Service',
        tagBg: '#E1F5EE', tagColor: '#085041',
        iconName: 'utility:case',
        iconBg: '#E1F5EE', iconColor: '#0F6E56',
        persona: { initials: 'KP', name: 'Karthik Pillai', role: 'Senior Support Agent, Razorpay', avatarBg: '#E1F5EE', avatarColor: '#085041' },
        situation: 'Karthik picks up 30 cases a day. Each case has 10+ email threads, 3 internal notes, and a chat transcript. Reading context takes 6–8 minutes per case. Customers are frustrated they have to repeat themselves.',
        aiAction: 'Case Details template reads the full case history and surfaces a 5-line briefing the moment the case opens — before Karthik even says Hello.',
        output: `Case #RZP-44821 — Priya Malhotra (CFO, NovaTech)

Issue: Payment settlement delayed — ₹8.4L not received in 5 business days
Status: Tier 2 escalation (2nd time this month)
Root cause (last agent note): Beneficiary bank IFSC mismatch
Action taken: Correction submitted Nov 2 — pending bank confirmation
Tone note: Customer is frustrated — previous agent promised resolution by Nov 4

Recommended opening: Acknowledge delay, confirm correction is submitted, give ETA`,
        impact: ['6 min briefing → 25 seconds', 'No repeat explanations', 'CSAT scores up 18%']
    },
    {
        id: 8,
        name: 'Global Standard',
        tagline: 'Set org-wide AI behavior — tone, format, guardrails — once',
        category: 'agentforce',
        tag: 'Admin',
        tagBg: '#F1EFE8', tagColor: '#444441',
        iconName: 'utility:settings',
        iconBg: '#F1EFE8', iconColor: '#5F5E5A',
        persona: { initials: 'MT', name: 'Meera Tiwari', role: 'Salesforce Admin, Bajaj Finserv', avatarBg: '#F1EFE8', avatarColor: '#444441' },
        situation: 'Bajaj Finserv has 400 Salesforce users across sales, service, and HR. After deploying Einstein, outputs were inconsistent — some too casual, some too verbose, some missing mandatory RBI disclaimers.',
        aiAction: 'Global Standard template sets org-wide defaults: formal Hindi/English tone, 150-word output cap, mandatory AI disclosure footer, and prohibited financial phrases list.',
        output: `[Global Standard Template Applied]
Tone: Formal (English + Hindi support)
Max output length: 150 words
Required footer: "यह AI द्वारा जेनरेट किया गया है। कृपया सत्यापित करें।"
Prohibited phrases: "guaranteed", "assured returns", "100% safe"
Data masking: PAN, Aadhaar, account numbers — auto-redacted`,
        impact: ['400 users, 1 standard', 'Compliance violations: 0', 'Setup time: 2 hours']
    },
    {
        id: 9,
        name: 'Einstein AI-Generated Search Answers',
        tagline: 'Turn search into instant answers, not just a list of links',
        category: 'knowledge',
        tag: 'Knowledge',
        tagBg: '#FAEEDA', tagColor: '#633806',
        iconName: 'utility:search',
        iconBg: '#FAEEDA', iconColor: '#854F0B',
        persona: { initials: 'LS', name: 'Lakshmi Subramaniam', role: 'Service Rep, Apollo Hospitals', avatarBg: '#FAEEDA', avatarColor: '#633806' },
        situation: 'Lakshmi handles 80 patient calls a day. When a patient asks about discharge or insurance, she used to scan 5 articles and piece together the answer herself — wasting 3–4 min per call.',
        aiAction: 'She types her query in Salesforce search. Einstein reads the relevant Knowledge articles and returns a direct, cited answer in 4 seconds.',
        output: `Query: "Discharge procedure — cardiac patient, Star Health"

Answer: Cardiac patients on Star Health require:
1. Discharge summary signed by treating cardiologist
2. Pre-authorization number from Star Health (call 1800-425-2255)
3. Original bills + prescription copies (3 sets)
4. Cashless approval typically takes 2–4 hrs after doc submission

Source: Apollo Discharge Policy v4.2 | Star Health Cashless Guide`,
        impact: ['4 min → 4 seconds', '80 calls/day smoother', 'Patient satisfaction +22%']
    },
    {
        id: 10,
        name: 'Extract Product Mentions',
        tagline: 'Pull product names out of unstructured text — emails, chats, notes',
        category: 'service',
        tag: 'Service',
        tagBg: '#E1F5EE', tagColor: '#085041',
        iconName: 'utility:product_required',
        iconBg: '#E1F5EE', iconColor: '#1D9E75',
        persona: { initials: 'RP', name: 'Rohit Pandey', role: 'Product Analyst, Zoho', avatarBg: '#E1F5EE', avatarColor: '#085041' },
        situation: 'Zoho receives 3,000 support emails daily. Rohit\'s team manually tags which product each email is about to route them. It took 2 full-time employees just for tagging.',
        aiAction: 'Extract Product Mentions scans every inbound email and auto-tags the product, feature, bug vs. feature request, and severity signal — then routes automatically.',
        output: `Email from: ramesh.k@techcorp.in (Nov 6, 9:14 AM)
Subject: Issue with invoice generation

Extracted mentions:
✅ Product: Zoho Books
✅ Feature: Invoice generation module
✅ Type: Bug report
✅ Severity signal: "urgent" + "client demo tomorrow"

Auto-routed to: Books Support Queue — Priority: High`,
        impact: ['2 FTE saved', '3,000 emails/day tagged', 'Routing accuracy: 96%']
    },
    {
        id: 11,
        name: 'Forecasting Submission Summary',
        tagline: 'Narrate your team\'s forecast numbers in plain English',
        category: 'sales',
        tag: 'Sales',
        tagBg: '#E6F1FB', tagColor: '#0C447C',
        iconName: 'utility:forecast',
        iconBg: '#E6F1FB', iconColor: '#185FA5',
        persona: { initials: 'GR', name: 'Girish Rao', role: 'VP Sales, Freshworks India', avatarBg: '#E6F1FB', avatarColor: '#0C447C' },
        situation: 'Every Friday, Girish reviews forecast submissions from 6 regional managers. He used to spend 45 minutes on spreadsheets before his 4 PM CEO call. He needed a narrative summary, not rows and numbers.',
        aiAction: 'The Forecasting Submission Summary template reads all forecast records and writes a board-ready paragraph with risks, highlights, and a recommended action.',
        output: `Q4 Forecast Summary — Week of Nov 4

Total committed pipeline: ₹42.3Cr (87% of ₹48.6Cr target)
Highlight: South region (Bengaluru) at 112% — 3 deals closing early
⚠️  Risk: North region (Delhi) at 61% — 2 large deals slipped to Q1
Best case scenario: ₹47.1Cr if "Nykaa Enterprise" deal closes by Nov 25

Recommendation: CEO call focus — Delhi pipeline + accelerate Nykaa commercial`,
        impact: ['45 min prep → 5 min', 'CEO-ready language', 'Forecast accuracy improved']
    },
    {
        id: 12,
        name: 'Knowledge Answers',
        tagline: 'Let your Agentforce bot answer questions using your Knowledge base',
        category: 'knowledge',
        tag: 'Knowledge',
        tagBg: '#FAEEDA', tagColor: '#633806',
        iconName: 'utility:knowledge_base',
        iconBg: '#FAEEDA', iconColor: '#854F0B',
        persona: { initials: 'TR', name: 'Tanvir Rahman', role: 'Customer at ICICI Lombard', avatarBg: '#FAEEDA', avatarColor: '#633806' },
        situation: 'Tanvir\'s car was in an accident at 11 PM on a Saturday. He opened the app and typed his question. No human agent was available. He needed accurate cashless claim info — right now.',
        aiAction: 'The Agentforce bot, powered by a Knowledge Answers prompt template, read the cashless garage policy article and replied with a precise, empathetic answer in seconds.',
        output: `Hi Tanvir, I'm sorry about the accident. Here's what to do:

1. Call our 24/7 helpline: 1800-2666 (free, I can connect you now)
2. Visit any of our 7,200+ cashless garages
   → Nearest to you: AutoFix Bandra (0.8 km)
3. Share your policy number + car registration at the garage
4. Survey + approval typically in 4 hours

Your policy (ICICI-MV-2024-44821) is active ✅
Would you like me to locate the nearest cashless garage?`,
        impact: ['11 PM — instant help', 'Zero human needed', 'NPS score: 4.8/5']
    },
    {
        id: 13,
        name: 'Knowledge Article Summary',
        tagline: 'Compress 2,000-word guides into 5 crisp bullets agents can read mid-call',
        category: 'knowledge',
        tag: 'Knowledge',
        tagBg: '#FAEEDA', tagColor: '#633806',
        iconName: 'utility:file',
        iconBg: '#E1F5EE', iconColor: '#0F6E56',
        persona: { initials: 'FA', name: 'Fatima Ansari', role: 'L1 Support Rep, Airtel Business', avatarBg: '#E1F5EE', avatarColor: '#085041' },
        situation: 'Fatima joins calls where enterprise customers ask about BGP routing, SLA terms, or fiber outage procedures. Internal docs are 3,000-word PDFs written by engineers. She can\'t read those while a CTO is waiting.',
        aiAction: 'Article Summary template converts the full technical doc into a 5-point cheat sheet displayed right on the case record — readable in 20 seconds.',
        output: `Article: Airtel Business — Fiber SLA & Outage Procedure (v3.1)

Quick Summary for agents:
• SLA uptime guarantee: 99.9% (Enterprise) | 99.5% (SMB)
• Outage report window: Must be reported within 2 hours for SLA credit
• Credit calculation: 10x downtime hours credited against monthly bill
• Escalation path: L1 → NOC (within 30 min) → AM (if >4 hrs)
• Customer-facing ETA: Never commit — always say "checking with our network team"`,
        impact: ['3,000 words → 5 bullets', 'Onboarding time halved', 'Accuracy improved 31%']
    },
    {
        id: 14,
        name: 'Knowledge Q&A',
        tagline: 'Convert policy docs into structured Q&A pairs for training and bots',
        category: 'knowledge',
        tag: 'Knowledge',
        tagBg: '#FAEEDA', tagColor: '#633806',
        iconName: 'utility:question_mark',
        iconBg: '#FAEEDA', iconColor: '#BA7517',
        persona: { initials: 'SJ', name: 'Suresh Joshi', role: 'L&D Manager, TCS HR', avatarBg: '#FAEEDA', avatarColor: '#633806' },
        situation: 'TCS updated its Leave Policy (48-page PDF) and Suresh needed to train 12,000 employees by end of month. Creating a Q&A document manually took his team a full week last time.',
        aiAction: 'Knowledge Q&A template ingested the policy PDF and auto-generated 60 Q&A pairs — ready for training material AND to feed directly into the HR chatbot\'s Knowledge base.',
        output: `Q: How many casual leaves are TCS employees entitled to per year?
A: 12 casual leaves per calendar year. Unused leaves cannot be carried forward.

Q: Can leave be availed during the notice period?
A: Only earned leave can be availed, subject to manager approval.

Q: What is the process for emergency leave beyond entitlement?
A: Apply through Ultimatix → HR approval required within 24 hours → LOP will apply if denied.

[57 more Q&A pairs generated]`,
        impact: ['60 Q&As in 8 minutes', 'Bot updated automatically', '12,000 employees trained']
    },
    {
        id: 15,
        name: 'Record Summary',
        tagline: 'One click — get the full story of any Salesforce record in plain English',
        category: 'sales',
        tag: 'Sales',
        tagBg: '#E6F1FB', tagColor: '#0C447C',
        iconName: 'utility:summary',
        iconBg: '#E6F1FB', iconColor: '#378ADD',
        persona: { initials: 'AD', name: 'Anjali Doshi', role: 'Account Executive, Salesforce India', avatarBg: '#E6F1FB', avatarColor: '#0C447C' },
        situation: 'Anjali got a surprise call from a prospect\'s CFO she hadn\'t spoken to in 4 months. She had 30 seconds to pull up context while making small talk. She needed the full picture — deals, history, last touch — instantly.',
        aiAction: 'She hit Summarize on the Account record. The Record Summary template read all related Opportunities, Activities, Contacts, and Cases and returned a 6-line brief.',
        output: `Account: HCL Technologies (Enterprise)
Relationship: 3 years | Tier 1
Open pipeline: ₹6.2Cr across 2 opportunities
→ "Sales Cloud Expansion" — Stage: Negotiation | Close: Dec 15
→ "Service Cloud POC" — Stage: Demo Scheduled | Close: Jan 30
Last contact: Call with Ramesh Nair (VP IT) — Oct 28 — Positive
Open case: Licensing query (P2) — Due Nov 8

Talk track: Lead with Service Cloud POC progress + ask about IT budget finalization`,
        impact: ['30-second catch-up', 'No context missed', 'Deal velocity +40%']
    },
    {
        id: 16,
        name: 'SDR Qualification',
        tagline: 'Qualify inbound leads automatically before a human ever touches them',
        category: 'sales',
        tag: 'Sales',
        tagBg: '#E6F1FB', tagColor: '#0C447C',
        iconName: 'utility:lead',
        iconBg: '#E1F5EE', iconColor: '#1D9E75',
        persona: { initials: 'NK', name: 'Nikhil Kapoor', role: 'SDR Manager, CleverTap', avatarBg: '#E1F5EE', avatarColor: '#085041' },
        situation: 'CleverTap\'s SDR team was burning time calling unqualified leads — startups with 5 users, students doing research, competitors. Only 1 in 5 calls was worth taking.',
        aiAction: 'The SDR Qualification template analyzes each new Lead against ICP criteria (company size, industry, tech stack, form behavior) and generates a qualification verdict + personalized email draft.',
        output: `Lead: Madhav Rao — Head of Growth, Urban Company
ICP score: 9.1/10 ✅ HIGHLY QUALIFIED

Qualification signals:
✅ Series C company (800+ employees) — within target segment
✅ Industry: On-demand services — top CleverTap vertical
✅ Visited pricing page 3x + downloaded Mobile Retention Playbook
✅ Tech stack: Firebase (CleverTap migrates this frequently)
⚠️  No CRM field — probe during call

Suggested opener:
"Hi Madhav, we've helped Swiggy and Zomato reduce churn by 28% in 90 days.
Worth a 20-min call?"`,
        impact: ['Unqualified calls cut 60%', 'SDR focus on 9+ leads', 'Pipeline quality doubled']
    },
    {
        id: 17,
        name: 'Security Risk Analysis',
        tagline: 'AI-generated risk narrative for any anomalous user or system event',
        category: 'security',
        tag: 'Security',
        tagBg: '#FCEBEB', tagColor: '#791F1F',
        iconName: 'utility:shield',
        iconBg: '#FCEBEB', iconColor: '#A32D2D',
        persona: { initials: 'KM', name: 'Kavitha Murali', role: 'IT Security Analyst, Wipro', avatarBg: '#FCEBEB', avatarColor: '#791F1F' },
        situation: 'Kavitha\'s team monitors 18,000 Salesforce users. When a SIEM alert fires, she needs a human-readable risk summary in minutes — not a raw log dump. Compliance audits require documented risk narratives.',
        aiAction: 'Security Risk Analysis template reads the flagged user\'s activity log, compares to baseline, and generates a structured risk report with severity rating and recommended action.',
        output: `Security Risk Report — User: arun.m@wipro.com (Nov 6, 2:47 AM)
Risk Level: 🔴 HIGH

Anomaly detected:
• Login at 2:47 AM from IP: 196.45.22.10 (Lagos, Nigeria)
• Normal pattern: Weekdays 9 AM–7 PM, Chennai
• 340 Account records exported within 8 minutes
• No prior international logins in 14-month history

Assessment: Likely unauthorized access — credential compromise suspected

Recommended actions:
1. Suspend session immediately
2. Force password reset + MFA re-enrollment
3. Notify CISO + initiate incident ticket`,
        impact: ['45 min report → 2 min', 'Zero incidents missed', 'Audit-ready documentation']
    },
    {
        id: 18,
        name: 'Slack Channel Summarizer',
        tagline: 'Catch up on any Slack channel in 10 seconds, not 10 minutes',
        category: 'service',
        tag: 'Productivity',
        tagBg: '#EEEDFE', tagColor: '#3C3489',
        iconName: 'utility:chat',
        iconBg: '#EEEDFE', iconColor: '#534AB7',
        persona: { initials: 'AS', name: 'Aakash Srivastava', role: 'Product Manager, Razorpay', avatarBg: '#EEEDFE', avatarColor: '#3C3489' },
        situation: 'Aakash returned from 5 days of paternity leave to 1,200 unread Slack messages across 8 channels. He needed the gist of each before his 9 AM standup.',
        aiAction: 'Slack Channel Summarizer (connected via Salesforce + Slack integration) read each channel\'s last 5 days of messages and generated a structured summary per channel.',
        output: `#product-payment-issues (Nov 1–5)
Main themes:
• 12 merchants reported UPI timeout errors (Nov 3) — Eng fix deployed Nov 4 ✅
• 3 enterprise clients asking about RBI tokenization deadline (Dec 31)
• Feature request (5 votes): Bulk refund dashboard

Action needed from you: Reply to Flipkart thread (Nov 4) — waiting on your call

#q4-roadmap
• "Smart Routing v2" approved for Dec sprint ✅
• "POS Offline Mode" deprioritized — 3 objections from Design team`,
        impact: ['1,200 messages → 3 summaries', 'Back to speed in 10 min', 'Nothing critical missed']
    },
    {
        id: 19,
        name: 'User Investigation',
        tagline: 'Compile a full user activity report for compliance or HR investigation',
        category: 'security',
        tag: 'Security',
        tagBg: '#FCEBEB', tagColor: '#791F1F',
        iconName: 'utility:user',
        iconBg: '#FCEBEB', iconColor: '#993C1D',
        persona: { initials: 'DR', name: 'Deepa Rao', role: 'Compliance Officer, Axis Bank', avatarBg: '#FCEBEB', avatarColor: '#791F1F' },
        situation: 'A whistleblower complaint alleged that a relationship manager had been sharing client portfolio data outside the bank. Deepa needed a documented 90-day activity trail in legally required format.',
        aiAction: 'User Investigation template compiled the RM\'s 90-day Salesforce activity into a structured, audit-ready report: records accessed, data exported, logins, and notable deviations.',
        output: `User Investigation Report — Suresh B. (RM #4421) | Oct–Nov 2024
Generated: Nov 6, 2024 | Requested by: Deepa Rao (Compliance)

Key findings:
• 847 Client records accessed (avg 9/day — normal: 4)
• 23 bulk exports to Excel in 30-day period (team avg: 1)
• 3 logins from personal device (not registered) — Oct 14, 18, 22
• 2 records belonging to "Do Not Solicit" list accessed Oct 20

Risk rating: HIGH — Recommend IT forensics + HR interview
Auto-submitted to audit trail log #AXS-2024-1104`,
        impact: ['90-day trail in 3 min', 'Audit-ready format', 'Legally defensible log']
    },
    {
        id: 20,
        name: 'Write with AI',
        tagline: 'Generate personalized, context-aware content from any record in Salesforce',
        category: 'sales',
        tag: 'Sales',
        tagBg: '#E6F1FB', tagColor: '#0C447C',
        iconName: 'utility:edit',
        iconBg: '#EAF3DE', iconColor: '#3B6D11',
        persona: { initials: 'SB', name: 'Shreya Bhatia', role: 'Account Executive, HubSpot India', avatarBg: '#EAF3DE', avatarColor: '#27500A' },
        situation: 'Shreya sends 25 follow-up emails a day across different deal stages. Each should be personalized — referencing the prospect\'s industry, pain point from the last call, and a relevant case study. Writing each from scratch was eating 2 hours daily.',
        aiAction: 'Write with AI reads the Opportunity record, recent Activity notes, and Account data, then drafts a full personalized follow-up email — Shreya just reviews and hits send.',
        output: `Subject: Next steps — HubSpot for PVR Inox growth team

Hi Rohan,

Great speaking yesterday about PVR Inox's challenge with unifying customer
data across 700+ screens.

As promised, here's how BookMyShow reduced their marketing cost per
acquisition by 34% using HubSpot's unified contact timeline — similar setup
to what you're exploring.

[Attach: BookMyShow_CaseStudy.pdf]

Quick ask: Does Thursday 3 PM work for a 30-min deep dive with your CRM team?
I can walk through how we'd map your current Salesforce data into HubSpot.

Warm regards, Shreya`,
        impact: ['2 hrs/day reclaimed', 'Reply rate up 38%', 'Fully personalized, 0 effort']
    }
];

const FILTERS = [
    { id: 'all', label: 'All (20)' },
    { id: 'sales', label: 'Sales' },
    { id: 'service', label: 'Service' },
    { id: 'agentforce', label: 'Agentforce' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'security', label: 'Security & AI Ops' }
];

export default class EinsteinPromptGuide extends LightningElement {

    @track activeFilter = 'all';
    @track searchTerm = '';
    @track openCards = new Set();
    @track reviewedCards = new Set();
    @track showToast = false;
    @track toastMessage = '';
    toastTimer = null;

    get filterButtons() {
        return FILTERS.map(f => ({
            ...f,
            cssClass: `filter-btn${f.id === this.activeFilter ? ' active' : ''}`
        }));
    }

    get filteredTemplates() {
        let list = TEMPLATES;
        if (this.activeFilter !== 'all') {
            list = list.filter(t => t.category === this.activeFilter);
        }
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            list = list.filter(t =>
                t.name.toLowerCase().includes(term) ||
                t.tagline.toLowerCase().includes(term) ||
                t.situation.toLowerCase().includes(term) ||
                t.tag.toLowerCase().includes(term)
            );
        }
        return list.map(t => ({
            ...t,
            isOpen: this.openCards.has(t.id),
            cardCss: `template-card${this.openCards.has(t.id) ? ' open' : ''}${this.reviewedCards.has(t.id) ? ' reviewed' : ''}`,
            chevronIcon: this.openCards.has(t.id) ? 'utility:chevronup' : 'utility:chevrondown',
            iconStyle: `background:${t.iconBg}; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;`,
            iconColorStyle: `--lwc-colorTextIconDefault:${t.iconColor};`,
            tagStyle: `background:${t.tagBg}; color:${t.tagColor};`,
            avatarStyle: `background:${t.persona.avatarBg}; color:${t.persona.avatarColor};`,
            reviewedVariant: this.reviewedCards.has(t.id) ? 'success' : 'neutral'
        }));
    }

    get filteredCount() {
        return this.filteredTemplates.length;
    }

    get expandedCount() {
        return this.openCards.size;
    }

    get reviewedCount() {
        return this.reviewedCards.size;
    }

    get noResults() {
        return this.filteredTemplates.length === 0;
    }

    get progressStyle() {
        const pct = Math.round((this.reviewedCards.size / 20) * 100);
        return `width:${pct}%`;
    }

    handleFilter(event) {
        this.activeFilter = event.currentTarget.dataset.id;
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    clearSearch() {
        this.searchTerm = '';
    }

    handleToggle(event) {
        const id = parseInt(event.currentTarget.dataset.id, 10);
        const updated = new Set(this.openCards);
        if (updated.has(id)) {
            updated.delete(id);
        } else {
            updated.add(id);
        }
        this.openCards = updated;
    }

    handleCopy(event) {
        event.stopPropagation();
        const id = parseInt(event.currentTarget.dataset.id, 10);
        const t = TEMPLATES.find(x => x.id === id);
        if (t) {
            const text = `Template: ${t.name}\nPerson: ${t.persona.name} — ${t.persona.role}\nProblem: ${t.situation}\nAI Action: ${t.aiAction}\nOutput:\n${t.output}\nImpact: ${t.impact.join(' | ')}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showToastMsg(`✅ "${t.name}" scenario copied to clipboard!`);
            }).catch(() => {
                this.showToastMsg(`Copied: ${t.name}`);
            });
        }
    }

    handleReview(event) {
        event.stopPropagation();
        const id = parseInt(event.currentTarget.dataset.id, 10);
        const t = TEMPLATES.find(x => x.id === id);
        const updated = new Set(this.reviewedCards);
        if (updated.has(id)) {
            updated.delete(id);
            this.showToastMsg(`Unmarked: ${t.name}`);
        } else {
            updated.add(id);
            this.showToastMsg(`✅ Marked as reviewed: ${t.name}`);
        }
        this.reviewedCards = updated;
    }

    showToastMsg(msg) {
        this.toastMessage = msg;
        this.showToast = true;
        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }
}
