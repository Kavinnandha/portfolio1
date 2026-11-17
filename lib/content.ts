/**
 * Every word on the site lives here. Sections render from these exports and
 * never hard-code copy, so a résumé update is a one-file change.
 * Sources: SDE résumé (2026), master profile, and the project READMEs.
 */

/* ── Profile ─────────────────────────────────────────────────────────── */

export const profile = {
  name: "Kavin Nandha M K",
  firstName: "Kavin",
  lastName: "Nandha",
  initials: "KN",
  role: "Software Engineer",
  tagline:
    "I build backend systems, APIs and full-stack products — and ship them all the way to production.",
  relocation: "Open to relocation",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",
  email: "kavinnandhakavin@gmail.com",
  phone: "+91 93455 69707",
  phoneHref: "tel:+919345569707",
  site: "https://portfolio.codegarage.dev",
  resume: {
    href: "/Kavin_Nandha_MK_Resume_SoftwareEngineer.pdf",
    fileName: "Kavin_Nandha_MK_Resume_SoftwareEngineer.pdf",
    label: "Résumé",
  },
  /** One-paragraph summary, straight from the résumé. */
  summary:
    "Final-year CSE (Cyber Security) student who shipped Node.js features, MongoDB query optimizations and JWT/RBAC authentication to production during a six-month SDE internship, and deployed a bare-metal Kubernetes (k3s) platform that sustained 2,500+ concurrent users. Strong in data structures, algorithms, OOP and DBMS.",
} as const;

export type SocialLink = { label: string; handle: string; href: string };

export const socials: SocialLink[] = [
  { label: "GitHub", handle: "github.com/kavinnandha", href: "https://github.com/kavinnandha" },
  { label: "LinkedIn", handle: "linkedin.com/in/kavinnandha", href: "https://linkedin.com/in/kavinnandha" },
  { label: "Email", handle: profile.email, href: `mailto:${profile.email}` },
];

/* ── Navigation ──────────────────────────────────────────────────────── */

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Stack", href: "#stack" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

/* ── Section headers (index numbers are fixed; *asterisks* = serif italic) ── */

export const sections = {
  work: {
    index: "01",
    label: "Selected work",
    meta: "Seven builds · backend, platform, AI",
    title: "Systems I've *designed*, built and shipped.",
  },
  more: {
    label: "More projects",
    meta: "Four more builds",
    title: "Smaller builds, *same* habits.",
  },
  approach: { index: "02", label: "How I build", meta: "One request, eight layers" },
  experience: {
    index: "03",
    label: "Experience",
    meta: "2025 — 2026",
    title: "Where I've shipped to *production*.",
  },
  stack: {
    index: "04",
    label: "Stack",
    meta: "Grouped by the job it does",
    title: "Tools I reach for, and *why*.",
  },
  recognition: {
    index: "05",
    label: "Recognition",
    meta: "Awards · publications · certifications",
    title: "Built under pressure, *judged* by others.",
  },
  about: { index: "06", label: "About", meta: "B.E. CSE · 2023 — 2027" },
  contact: { index: "07", label: "Contact", meta: "Replies within a day" },
} as const;

/* ── Hero ────────────────────────────────────────────────────────────── */

export const hero = {
  eyebrow: "Software Engineer",
  place: profile.relocation,
  edition: "Portfolio ©2026",
  scrollCue: "Scroll",
  /** Rendered huge, one line each. */
  nameLines: ["Kavin", "Nandha"],
  statement: profile.tagline,
  facts: [
    { k: "Currently", v: "Final-year B.E. CSE (Cyber Security)" },
    { k: "Previously", v: "SDE Intern, TeamMistake Technologies" },
    { k: "Focus", v: "Backend · Full-stack · Systems" },
  ],
  primaryCta: { label: "See the work", href: "#work" },
  secondaryCta: { label: "Download résumé", href: profile.resume.href },
} as const;

/* ── Intro / manifesto ───────────────────────────────────────────────── */

export const intro = {
  label: "In short",
  /** Words wrapped in *asterisks* render as serif-italic emphasis. */
  statement:
    "I work the whole request path — from the *React* component to the API, the auth layer, the data model, the cache and the container it ships in. I care less about which framework is on top and more about what is happening *underneath* the abstraction.",
} as const;

/* ── Stats ───────────────────────────────────────────────────────────── */

export type Stat = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note: string;
};

export const stats: Stat[] = [
  {
    value: 5,
    prefix: "Top ",
    label: "Samsung Solve for Tomorrow",
    note: "Top 5 in AI Living, one of 20 national finalists, 2026 — with MicroLearning",
  },
  {
    value: 6,
    suffix: " mo",
    label: "Shipping to production",
    note: "Node.js / Express features, MongoDB and JWT/RBAC at TeamMistake",
  },
  {
    value: 350,
    suffix: "+",
    label: "Hackathon participants",
    note: "Won SRCAS 2.0 with Sentinel AI against a field of 350+",
  },
  {
    value: 8.67,
    decimals: 2,
    label: "CGPA",
    note: "B.E. Computer Science & Engineering (Cyber Security)",
  },
];

/* ── Projects ────────────────────────────────────────────────────────── */

export type ArchKind = "client" | "edge" | "service" | "data" | "queue" | "ai" | "external" | "infra";

/** Node positions live on a 100 × 60 grid (x: 0–100, y: 0–60), centre-anchored. */
export type ArchNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  kind: ArchKind;
};

export type ArchEdge = {
  from: string;
  to: string;
  label?: string;
  /** Dashed = async / out-of-band (scrapes, reconciliation, evaluation). */
  dashed?: boolean;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  /** Short category line, e.g. "Full-stack platform". */
  kicker: string;
  year?: string;
  /** One sentence, used in lists and previews. */
  summary: string;
  /** Two or three sentences, used on the featured card. */
  description: string;
  highlights: string[];
  stack: string[];
  metric?: { value: string; label: string };
  award?: string;
  links: { github?: string; live?: string; paper?: string };
  featured: boolean;
  architecture: { nodes: ArchNode[]; edges: ArchEdge[] };
};

export const projects: Project[] = [
  {
    slug: "microlearning",
    index: "01",
    title: "MicroLearning",
    kicker: "WhatsApp shop-floor training platform",
    year: "2026",
    summary:
      "A multi-tenant platform that turns factory SOPs into short WhatsApp video lessons in 15 Indian languages, graded by AI from workers' voice notes.",
    description:
      "Shop-floor workers already live in WhatsApp, so the training goes there. I built the FastAPI backend that writes lessons from SOPs with an LLM, delivers them over WhatsApp Cloud API webhooks, grades spoken answers from voice notes and schedules reviews with FSRS. It took us to the Top 5 of Samsung Solve for Tomorrow 2026.",
    highlights: [
      "FastAPI backend turning factory SOPs into short video lessons in 15 Indian languages",
      "WhatsApp Cloud API webhooks with LLM lesson writing, AI voice-note grading and FSRS reviews",
      "Multi-tenant: every query scoped to the caller's company and plant, RBAC for 3 staff roles",
      "Docker Compose and GitHub Actions CI/CD (214 backend tests) behind a Cloudflare Tunnel",
    ],
    stack: ["Python", "FastAPI", "MongoDB", "Next.js", "WhatsApp Cloud API", "LLMs", "Docker"],
    award: "Top 5, AI Living category — Samsung Solve for Tomorrow 2026 · one of 20 national finalists",
    metric: { value: "15", label: "Indian languages" },
    links: {},
    featured: true,
    architecture: {
      nodes: [
        { id: "workers", label: "Shop-floor workers", sub: "WhatsApp", x: 8, y: 14, kind: "client" },
        { id: "wa", label: "WhatsApp Cloud API", sub: "webhooks", x: 30, y: 14, kind: "external" },
        { id: "dash", label: "Next.js dashboard", sub: "3 staff roles", x: 30, y: 47, kind: "client" },
        { id: "api", label: "FastAPI", sub: "multi-tenant · RBAC", x: 54, y: 30, kind: "service" },
        { id: "llm", label: "LLM · voice grading", sub: "lessons · scores", x: 82, y: 12, kind: "ai" },
        { id: "mongo", label: "MongoDB", sub: "scoped by company · plant", x: 82, y: 48, kind: "data" },
      ],
      edges: [
        { from: "workers", to: "wa" },
        { from: "wa", to: "api", label: "webhook" },
        { from: "dash", to: "api" },
        { from: "api", to: "llm", label: "write · grade" },
        { from: "api", to: "mongo", label: "tenant-scoped" },
      ],
    },
  },
  {
    slug: "hr-connect",
    index: "02",
    title: "HR Connect",
    kicker: "Full-stack placement platform",
    summary:
      "A placement and recruitment platform for job postings, applications and candidate management across three roles.",
    description:
      "Students, recruiters and administrators each get their own dashboard on one shared system. I designed the REST API and MongoDB data model, secured every route with JWT and role-based access control, and put a Redis cache in front of the hottest reads.",
    highlights: [
      "REST API and MongoDB models for postings, applications and profiles",
      "JWT authentication with RBAC enforced in the API — never trusted to the UI",
      "Redis cache with invalidation on write to cut repeated database reads",
      "Role-specific React + TypeScript dashboards, containerized with Docker behind Nginx",
    ],
    stack: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Redis", "Docker", "Nginx"],
    metric: { value: "3", label: "user roles, one API" },
    links: {},
    featured: true,
    architecture: {
      nodes: [
        { id: "ui", label: "React + TS", sub: "3 role dashboards", x: 9, y: 30, kind: "client" },
        { id: "nginx", label: "Nginx", sub: "reverse proxy", x: 30, y: 30, kind: "edge" },
        { id: "api", label: "Express API", sub: "JWT · RBAC", x: 53, y: 30, kind: "service" },
        { id: "redis", label: "Redis", sub: "cache, invalidate on write", x: 82, y: 12, kind: "data" },
        { id: "mongo", label: "MongoDB", sub: "postings · applications", x: 82, y: 48, kind: "data" },
      ],
      edges: [
        { from: "ui", to: "nginx", label: "HTTPS" },
        { from: "nginx", to: "api" },
        { from: "api", to: "redis", label: "hot reads" },
        { from: "api", to: "mongo", label: "writes" },
      ],
    },
  },
  {
    slug: "cellular-maze",
    index: "03",
    title: "Cellular Maze",
    kicker: "ML-powered network-aware routing",
    year: "2026",
    summary:
      "A navigation platform that picks routes by predicted cellular signal quality, not just ETA and distance, so calls, rides and SOS messages don't drop in dead zones.",
    description:
      "Routing engines optimize for travel time and ignore coverage. Cellular Maze samples every alternative route every 500 m, predicts signal strength, call-drop probability and handoff risk at each point with a multi-task PyTorch model, and scores each route per carrier. A preference slider trades speed for signal, and Thompson Sampling learns each user's choice over time.",
    highlights: [
      "Up to seven road-snapped TomTom alternatives per trip, sampled every 500 m",
      "ResidualSignalNet: multi-task PyTorch model (~560K parameters) for signal, call drops and handoffs",
      "Cross-checked against COST-231 Hata and Ericsson 9999 propagation models, uncertainty via MC Dropout",
      "Published in IJRTI (Vol. 11 Issue 10, October 2026)",
    ],
    stack: ["Python", "FastAPI", "PyTorch", "Next.js", "Mapbox GL JS", "TomTom", "OpenCelliD"],
    metric: { value: "500 m", label: "signal predicted along every route" },
    links: {},
    featured: true,
    architecture: {
      nodes: [
        { id: "ui", label: "Next.js · Mapbox", sub: "routes · heatmaps", x: 8, y: 30, kind: "client" },
        { id: "api", label: "FastAPI", sub: "route scoring", x: 32, y: 30, kind: "service" },
        { id: "tomtom", label: "TomTom", sub: "routes · traffic", x: 58, y: 9, kind: "external" },
        { id: "cells", label: "OpenCelliD · weather", sub: "towers · conditions", x: 58, y: 51, kind: "data" },
        { id: "model", label: "ResidualSignalNet", sub: "PyTorch · multi-task", x: 85, y: 15, kind: "ai" },
        { id: "prefs", label: "Thompson Sampling", sub: "learns preference", x: 85, y: 46, kind: "ai" },
      ],
      edges: [
        { from: "ui", to: "api", label: "trip" },
        { from: "api", to: "tomtom", label: "≤7 routes" },
        { from: "api", to: "cells" },
        { from: "api", to: "model", label: "every 500 m" },
        { from: "api", to: "prefs", label: "rank", dashed: true },
      ],
    },
  },
  {
    slug: "email-job-scheduler",
    index: "04",
    title: "Email Job Scheduler",
    kicker: "Distributed job scheduling",
    year: "2026",
    summary:
      "An email scheduling service where every send is a BullMQ delayed job — no cron, no polling — with Postgres as the system of record.",
    description:
      "Campaigns come in over an API, land in Postgres, and fan out as one delayed BullMQ job per email. A separate worker process delivers them under per-sender rate limits that hold across any number of concurrent workers, and a boot reconciler rebuilds the whole schedule from Postgres if Redis loses its data.",
    highlights: [
      "Deterministic job IDs, status guards and a guarded UPDATE stop double sends",
      "Send slots and hourly limits enforced atomically in Redis Lua scripts",
      "API and worker scale and restart independently; Redis AOF plus boot reconciliation survive restarts",
      "Elasticsearch search with a Postgres fallback, Slack alerts on rate-limit hits",
    ],
    stack: ["TypeScript", "Node.js", "Express", "BullMQ", "Redis", "PostgreSQL", "Elasticsearch", "React", "Docker"],
    metric: { value: "0", label: "cron jobs — all delayed jobs" },
    links: { github: "https://github.com/Kavinnandha/email-job-scheduler" },
    featured: true,
    architecture: {
      nodes: [
        { id: "spa", label: "React SPA", sub: "dashboard", x: 7, y: 30, kind: "client" },
        { id: "api", label: "Express API", sub: "zod · sessions", x: 27, y: 30, kind: "service" },
        { id: "pg", label: "Postgres", sub: "system of record", x: 51, y: 8, kind: "data" },
        { id: "redis", label: "Redis · BullMQ", sub: "delayed jobs · Lua limits", x: 51, y: 30, kind: "queue" },
        { id: "es", label: "Elasticsearch", sub: "search index", x: 51, y: 52, kind: "data" },
        { id: "worker", label: "Worker", sub: "BullMQ consumer", x: 75, y: 30, kind: "service" },
        { id: "smtp", label: "SMTP · Slack", sub: "delivery · alerts", x: 94, y: 30, kind: "external" },
      ],
      edges: [
        { from: "spa", to: "api" },
        { from: "api", to: "pg", label: "1 txn" },
        { from: "api", to: "redis", label: "enqueue" },
        { from: "api", to: "es" },
        { from: "redis", to: "worker", label: "due" },
        { from: "pg", to: "worker", label: "reconcile", dashed: true },
        { from: "worker", to: "smtp" },
      ],
    },
  },
  {
    slug: "sentinel-ai",
    index: "05",
    title: "Sentinel AI",
    kicker: "ML-integrated moderation backend",
    year: "2025",
    summary:
      "A cyberbullying detection platform whose backend runs every post through an ML classifier to flag, escalate and report harmful content in real time.",
    description:
      "I built the REST APIs and the ingestion pipeline that feeds user posts to the classifier, then turned its verdicts into a moderation workflow — flag, escalate, report — with RBAC and an audit log around every action. It won SRCAS 2.0 and became a published paper.",
    highlights: [
      "Ingestion pipeline from user posts to an ML classifier, results in real time",
      "Moderation workflow: flag, escalate and report harmful content",
      "MongoDB schemas, RBAC and audit logging around every moderation action",
      "Co-authored the research paper, published in JRANNS (April 2026)",
      "Extended into a reinforcement-learning content-triage agent — published, first author",
    ],
    stack: ["Node.js", "Express", "MongoDB", "ML integration", "RBAC"],
    award: "Winner — SRCAS 2.0 Hackathon, 350+ participants",
    metric: { value: "1st", label: "of 350+ participants" },
    links: { paper: "http://hbrppublication.com/OJS/index.php/JRANNS/article/view/9606" },
    featured: true,
    architecture: {
      nodes: [
        { id: "posts", label: "User posts", sub: "real-time feed", x: 8, y: 30, kind: "client" },
        { id: "api", label: "Express API", sub: "ingest · RBAC", x: 31, y: 30, kind: "service" },
        { id: "ml", label: "ML classifier", sub: "harm score", x: 58, y: 11, kind: "ai" },
        { id: "mongo", label: "MongoDB", sub: "posts · cases · audit log", x: 58, y: 49, kind: "data" },
        { id: "mod", label: "Moderation", sub: "flag · escalate · report", x: 87, y: 30, kind: "service" },
      ],
      edges: [
        { from: "posts", to: "api" },
        { from: "api", to: "ml", label: "classify" },
        { from: "api", to: "mongo" },
        { from: "ml", to: "mod", label: "verdict" },
        { from: "mod", to: "mongo", label: "audit", dashed: true },
      ],
    },
  },
  {
    slug: "moodle-k3s",
    index: "06",
    title: "Moodle LMS on bare-metal k3s",
    kicker: "Production platform at scale",
    summary:
      "The college Moodle LMS used to crash at about 400 users; moved to a bare-metal k3s cluster, it sustained 2,500+ concurrent users at peak.",
    description:
      "On one server, every compile and heavy job ran in series, so Moodle fell over at about 400 users. Full Kubernetes was overkill for one app, so I chose k3s: one server node plus worker nodes, CodeRunner/Jobe grading moved to separate machines, and MySQL tuned for the load. Monitoring went in before go-live.",
    highlights: [
      "k3s server node on dual Intel Xeon Gold 6430, with worker nodes alongside",
      "CodeRunner/Jobe grading on separate machines, running in parallel instead of in series",
      "Fixed MySQL \"Too many connections\" at peak by raising connection limits and tuning the InnoDB buffer pool",
      "Prometheus, Grafana, cAdvisor and Node Exporter in place before the first class",
      "Compressed, incremental database backups (about 70% smaller) on a 40TB Synology NAS",
    ],
    stack: ["Kubernetes (k3s)", "Docker", "MySQL", "Prometheus", "Grafana", "Linux"],
    metric: { value: "2,500+", label: "concurrent users at peak" },
    links: {},
    featured: true,
    architecture: {
      nodes: [
        { id: "users", label: "2,500+ users", sub: "students · staff", x: 7, y: 30, kind: "client" },
        { id: "ingress", label: "Ingress", sub: "routing · TLS", x: 27, y: 30, kind: "edge" },
        { id: "moodle", label: "Moodle", sub: "web tier pods", x: 50, y: 13, kind: "service" },
        { id: "jobe", label: "CodeRunner · Jobe", sub: "separate worker machines", x: 50, y: 47, kind: "service" },
        { id: "mysql", label: "MySQL", sub: "tuned for peak load", x: 77, y: 13, kind: "data" },
        { id: "obs", label: "Prometheus · Grafana", sub: "metrics first", x: 77, y: 47, kind: "infra" },
      ],
      edges: [
        { from: "users", to: "ingress" },
        { from: "ingress", to: "moodle" },
        { from: "moodle", to: "jobe", label: "grade" },
        { from: "moodle", to: "mysql" },
        { from: "obs", to: "moodle", label: "scrape", dashed: true },
        { from: "obs", to: "jobe", dashed: true },
      ],
    },
  },
  {
    slug: "ground-score",
    index: "07",
    title: "ground-score",
    kicker: "AI agent + evaluation harness",
    year: "2026",
    summary:
      "An AI support agent built from real customer-support threads — retrieve, classify, draft, route — plus the evaluation harness that says how far to trust it.",
    description:
      "The agent is deliberately small; the engineering is in proving it. A golden set, a cross-vendor judge validated against an independent annotator, fully cached reproducible runs, and honest reporting: intent accuracy beat the baselines, the auto-routing did not, and the write-up says so.",
    highlights: [
      "Pipeline: rules → retrieve → classify → draft → route, rules before the model",
      "Intent accuracy 0.667 on traffic-proportional dev vs. 0.314 for TF-IDF + LR (pooled)",
      "Ablation: retrieval off took draft defects from 7 to 45",
      "Reproducible from committed caches — a cache miss is a hard error, not a live call",
    ],
    stack: ["Python", "RAG", "Ollama", "Gemini", "Embeddings", "Evaluation"],
    metric: { value: "7 → 45", label: "draft defects without grounding" },
    links: { github: "https://github.com/Kavinnandha/ground-score" },
    featured: true,
    architecture: {
      nodes: [
        { id: "msg", label: "Customer message", sub: "support thread", x: 7, y: 30, kind: "client" },
        { id: "rules", label: "Rules", sub: "never-auto guards", x: 25, y: 30, kind: "service" },
        { id: "retrieve", label: "Retrieve", sub: "8.5k-thread corpus", x: 46, y: 12, kind: "data" },
        { id: "classify", label: "Classify", sub: "intent", x: 46, y: 48, kind: "ai" },
        { id: "draft", label: "Draft", sub: "grounded reply", x: 68, y: 30, kind: "ai" },
        { id: "route", label: "Route", sub: "auto or human", x: 89, y: 15, kind: "service" },
        { id: "judge", label: "Judge", sub: "cross-vendor eval", x: 89, y: 48, kind: "external" },
      ],
      edges: [
        { from: "msg", to: "rules" },
        { from: "rules", to: "retrieve" },
        { from: "rules", to: "classify" },
        { from: "retrieve", to: "draft" },
        { from: "classify", to: "draft" },
        { from: "draft", to: "route" },
        { from: "draft", to: "judge", label: "eval", dashed: true },
      ],
    },
  },
  {
    slug: "ai-interview-meet",
    index: "08",
    title: "AI Interview Meet",
    kicker: "Real-time video + AI agent",
    year: "2025",
    summary:
      "Video conferencing on LiveKit with an AI voice agent that joins the room as a participant — three services, one docker-compose up.",
    description:
      "A self-hostable LiveKit server, a Next.js web client for rooms and video, and a Python AI agent with voice and avatar support that connects to the same room. Each piece ships as its own container and runs together with Docker Compose.",
    highlights: [
      "LiveKit WebRTC server, Next.js client and Python AI agent as separate services",
      "AI agent joins rooms as a participant with speech and avatar support",
      "Each service containerized; the stack runs with one docker-compose up",
    ],
    stack: ["Next.js", "TypeScript", "LiveKit", "WebRTC", "Python", "Docker"],
    links: { github: "https://github.com/Kavinnandha/ai-interview-meet" },
    featured: false,
    architecture: {
      nodes: [
        { id: "web", label: "Next.js client", sub: "rooms · video", x: 12, y: 30, kind: "client" },
        { id: "lk", label: "LiveKit", sub: "WebRTC server", x: 48, y: 30, kind: "service" },
        { id: "agent", label: "AI agent", sub: "Python · voice + avatar", x: 84, y: 14, kind: "ai" },
        { id: "llm", label: "Google AI", sub: "speech · LLM", x: 84, y: 47, kind: "external" },
      ],
      edges: [
        { from: "web", to: "lk", label: "WebRTC" },
        { from: "agent", to: "lk", label: "joins room" },
        { from: "agent", to: "llm" },
      ],
    },
  },
  {
    slug: "ncert-doubt-solver",
    index: "09",
    title: "Multilingual NCERT Doubt-Solver",
    kicker: "RAG · Intel Unnati Industrial Training",
    year: "2025",
    summary:
      "A multilingual question-answering assistant over NCERT textbooks, built on an OPEA-based retrieval-augmented generation pipeline.",
    description:
      "Built during Intel Unnati Industrial Training. Answers are grounded in retrieved textbook passages instead of the model's general knowledge, so students get explanations that match what they are actually studying — in more than one language.",
    highlights: [
      "OPEA-based RAG pipeline over NCERT textbook content",
      "Retrieval grounds every answer in the source material",
      "Multilingual questions and answers",
    ],
    stack: ["Python", "OPEA", "RAG", "LLMs", "Embeddings"],
    links: {},
    featured: false,
    architecture: {
      nodes: [
        { id: "q", label: "Student question", sub: "any language", x: 8, y: 30, kind: "client" },
        { id: "ret", label: "Retriever", sub: "OPEA pipeline", x: 36, y: 30, kind: "service" },
        { id: "idx", label: "Textbook index", sub: "NCERT chapters", x: 36, y: 54, kind: "data" },
        { id: "llm", label: "LLM", sub: "grounded answer", x: 64, y: 30, kind: "ai" },
        { id: "ans", label: "Answer", sub: "in the student's language", x: 91, y: 30, kind: "client" },
      ],
      edges: [
        { from: "q", to: "ret" },
        { from: "idx", to: "ret", label: "passages" },
        { from: "ret", to: "llm", label: "context" },
        { from: "llm", to: "ans" },
      ],
    },
  },
  {
    slug: "health-app",
    index: "10",
    title: "Health App",
    kicker: "Mobile app + REST backend",
    summary:
      "A health-tracking app with a Flutter client and a Node.js/Express/MongoDB backend for records, tracking and reminders.",
    description:
      "The backend exposes REST APIs for health records, tracking and reminders, with request validation, auth middleware and per-user authorization so every record is only ever reachable by its owner.",
    highlights: [
      "REST APIs for records, tracking and reminders",
      "Validation, auth and error-handling middleware",
      "Per-user authorization on every record",
    ],
    stack: ["Node.js", "Express", "MongoDB", "Flutter", "Dart"],
    links: { github: "https://github.com/Kavinnandha/health_app" },
    featured: false,
    architecture: {
      nodes: [
        { id: "app", label: "Flutter app", sub: "iOS · Android", x: 10, y: 30, kind: "client" },
        { id: "api", label: "Express API", sub: "validate · auth", x: 46, y: 30, kind: "service" },
        { id: "db", label: "MongoDB", sub: "records · reminders", x: 84, y: 30, kind: "data" },
      ],
      edges: [
        { from: "app", to: "api", label: "REST" },
        { from: "api", to: "db", label: "per-user" },
      ],
    },
  },
  {
    slug: "event-platform",
    index: "11",
    title: "College Tech-Event Platform",
    kicker: "Live registrations + payments",
    summary:
      "The event-management application for the college's tech events, run end to end: 1,000+ concurrent users and PhonePe payments for registrations.",
    description:
      "I ran the whole technical side of the college's tech events: the event-management application, registrations and the PhonePe payment gateway, built with payment security in mind and kept up under real users on a fixed launch date.",
    highlights: [
      "Handled 1,000+ concurrent users during registrations",
      "Integrated the PhonePe payment gateway for event registrations",
      "Owned the deploy and kept it running through fixed-date launches",
    ],
    stack: ["PhonePe payment gateway", "REST APIs"],
    metric: { value: "1,000+", label: "concurrent users" },
    links: {},
    featured: false,
    architecture: {
      nodes: [
        { id: "users", label: "Participants", sub: "1,000+ concurrent", x: 10, y: 30, kind: "client" },
        { id: "app", label: "Event app", sub: "registrations", x: 46, y: 30, kind: "service" },
        { id: "pay", label: "PhonePe", sub: "payment gateway", x: 84, y: 14, kind: "external" },
        { id: "db", label: "Database", sub: "registrations", x: 84, y: 47, kind: "data" },
      ],
      edges: [
        { from: "users", to: "app" },
        { from: "app", to: "pay", label: "pay" },
        { from: "app", to: "db" },
      ],
    },
  },
];

/** Interface labels for the Work section. */
export const workCopy = {
  figure: "Architecture",
  legend: { sync: "request", async: "async" },
  stack: "Stack",
  newTab: "(opens in a new tab)",
  links: {
    github: { label: "Source code", cursor: "Code" },
    paper: { label: "Read the paper", cursor: "Paper" },
    live: { label: "Live site", cursor: "Open" },
  },
} as const;

export const featuredProjects = projects.filter((p) => p.featured);
export const moreProjects = projects.filter((p) => !p.featured);

/* ── Request lifecycle ("how I build") ───────────────────────────────── */

export const lifecycle = {
  label: "How I build",
  title: "Follow one request through *everything* I build.",
  intro:
    "Most bugs live between components, not inside them. So I think about the whole path a request takes — and what each layer owes the next.",
  steps: [
    {
      index: "01",
      layer: "Client",
      tech: "React · TypeScript",
      body: "Role-aware interfaces and protected routes. The UI shows what you can do; it never decides what you are allowed to do.",
      log: "→ GET /api/jobs?status=open   (recruiter dashboard)",
    },
    {
      index: "02",
      layer: "Edge",
      tech: "DNS · TLS · Nginx",
      body: "The name resolves, TLS terminates, and a reverse proxy hands the request to the right upstream.",
      log: "dns ✓  tls ✓  nginx → upstream api:4000",
    },
    {
      index: "03",
      layer: "Middleware",
      tech: "Express · JWT · RBAC",
      body: "Validate every user-controlled input, verify the token, enforce the role. Authorization lives in the API.",
      log: "validate ✓  jwt ✓  rbac: role=recruiter ✓",
    },
    {
      index: "04",
      layer: "Service layer",
      tech: "Business logic",
      body: "Routes stay thin. Services hold the rules, so the logic is testable and independent of any client.",
      log: "jobs.service.listOpen({ recruiterId })",
    },
    {
      index: "05",
      layer: "Cache",
      tech: "Redis",
      body: "Hot reads come from cache and are invalidated on write — used where the read/write trade-off earns it, not everywhere.",
      log: "redis GET jobs:open → MISS → fill",
    },
    {
      index: "06",
      layer: "Data",
      tech: "MongoDB · PostgreSQL · MySQL",
      body: "Schemas modelled on real query patterns. Indexes where they matter, and no redundant round trips on hot endpoints.",
      log: "db.jobs.find({ status: \"open\" })  ↳ index scan",
    },
    {
      index: "07",
      layer: "Ship",
      tech: "Docker · GitHub Actions",
      body: "One container image, built and released by CI, so the thing I tested is the thing that runs.",
      log: "image api@sha-7f3c built and released by CI",
    },
    {
      index: "08",
      layer: "Observe",
      tech: "Logs · Prometheus · Grafana",
      body: "Metrics in place before go-live, so capacity and debugging decisions come from data instead of guesses.",
      log: "http_requests_total{route=\"/api/jobs\"} += 1",
    },
  ],
  /** Illustrative final line of the request log (not a real metric). */
  response: "← 200 OK  application/json",
  quote:
    "How does this entire system need to work, how will it fail, how will I observe it, and how will I secure it?",
} as const;

/* ── Experience ──────────────────────────────────────────────────────── */

export type Role = {
  company: string;
  title: string;
  period: string;
  start: string;
  end: string;
  kind: string;
  summary: string;
  points: string[];
  stack: string[];
};

export const experience: Role[] = [
  {
    company: "TeamMistake Technologies",
    title: "SDE Intern",
    period: "Oct 2025 — Mar 2026",
    start: "2025-10",
    end: "2026-03",
    kind: "Internship · 6 months",
    summary:
      "Worked on the Admin Dashboard module — building its production Node.js / Express services end to end, from data modelling and API design to deployment and production debugging.",
    points: [
      "Owned backend features for the Admin Dashboard module end to end, from data modelling and API design to deployment.",
      "Designed MongoDB schemas and rewrote queries to remove redundant database calls on high-traffic endpoints.",
      "Built JWT authentication and role-based access control (RBAC) from scratch for user and admin workflows.",
      "Containerized services with Docker, shipped releases through GitHub Actions CI/CD, and managed DNS and SSL/TLS.",
    ],
    stack: ["Node.js", "Express", "MongoDB", "JWT", "Docker", "GitHub Actions", "Nginx"],
  },
  {
    company: "Sri Shakthi Institute of Engineering and Technology",
    title: "Infrastructure & IT Operations",
    period: "Jan 2025 — Jun 2026",
    start: "2025-01",
    end: "2026-06",
    kind: "Alongside studies · ~18 months",
    summary:
      "Ran the college's entire firewall and network, and the servers behind its Moodle platform, while studying.",
    points: [
      "Administered Sophos firewalls, Fortinet FortiGate 60F for the cyber security labs, and MikroTik and Ubiquiti routers and access points.",
      "Moved the Moodle LMS from a single server that crashed at about 400 users to a k3s cluster that held 2,500+ concurrent users at peak.",
      "Rebuilt database backups: compressed (about 70% smaller), incremental, and stored on a dedicated 40TB Synology NAS.",
      "Worked on the infrastructure of three institutions: managed one end to end, supported two.",
    ],
    stack: ["Linux", "k3s", "MySQL", "Sophos", "FortiGate", "Prometheus", "Grafana"],
  },
  {
    company: "Intel Unnati Industrial Training",
    title: "Industrial Trainee",
    period: "Oct — Dec 2025",
    start: "2025-10",
    end: "2025-12",
    kind: "Industrial training",
    summary:
      "Built a multilingual NCERT doubt-solving assistant on an OPEA-based retrieval-augmented generation pipeline.",
    points: [
      "Combined retrieval with an LLM so answers come from the textbook, not the model's general knowledge.",
      "Supported questions and answers across multiple languages.",
    ],
    stack: ["Python", "OPEA", "RAG", "LLMs"],
  },
];

/* ── Skills ──────────────────────────────────────────────────────────── */

export type SkillGroup = { title: string; note: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    note: "What I think in",
    items: ["TypeScript", "JavaScript", "Python", "SQL", "Bash"],
  },
  {
    title: "Backend",
    note: "My strongest layer",
    items: ["Node.js", "Express.js", "FastAPI", "REST API design", "JWT / RBAC", "Middleware & validation", "BullMQ"],
  },
  {
    title: "Data",
    note: "Modelled on query patterns",
    items: ["MongoDB", "PostgreSQL", "MySQL", "Redis", "Schema design", "Query optimization"],
  },
  {
    title: "Frontend",
    note: "Component-driven",
    items: ["React", "Next.js", "Tailwind CSS", "React Native", "Flutter"],
  },
  {
    title: "Ship & run",
    note: "From commit to production",
    items: ["Docker", "Kubernetes (k3s)", "GitHub Actions", "AWS", "Linux", "Nginx", "Git"],
  },
  {
    title: "AI engineering",
    note: "Grounded, measured",
    items: ["LLM APIs (Claude, OpenAI, Gemini)", "RAG", "Evaluation harnesses"],
  },
  {
    title: "Core CS",
    note: "The fundamentals",
    items: ["Data structures & algorithms", "OOP", "DBMS", "Operating systems", "Computer networks"],
  },
];

/** Big scrolling ticker rows. */
export const marqueeRows: string[][] = [
  ["TypeScript", "Node.js", "Express", "React", "Next.js", "Python", "REST APIs", "JWT / RBAC"],
  ["MongoDB", "PostgreSQL", "Redis", "BullMQ", "Docker", "Kubernetes", "GitHub Actions", "RAG"],
];

/* ── Recognition ─────────────────────────────────────────────────────── */

export type Award = { title: string; result: string; detail: string; year: string; highlight?: boolean };

export const awards: Award[] = [
  {
    title: "Samsung Solve for Tomorrow",
    result: "Top 5 · AI Living category",
    detail: "One of 20 national finalists",
    year: "2026",
    highlight: true,
  },
  { title: "SRCAS 2.0 Hackathon", result: "Winner", detail: "350+ participants · with Sentinel AI", year: "2025" },
  {
    title: "MobilityX 2.0 Hackathon",
    result: "Runner-up · Software Track Winner",
    detail: "250+ participants · 24-hour build",
    year: "2025",
  },
  {
    title: "MAHE Mobility Challenge",
    result: "AI Track Finalist",
    detail: "MIT Bengaluru",
    year: "2026",
  },
];

/** Photo spotlight shown under the awards list for the headline result. */
export const awardSpotlight = {
  label: "Spotlight",
  title: "Samsung Solve for Tomorrow 2026",
  result: "Top 5 · AI Living category",
  detail: "Grand finale · ₹1,00,000 award · Visited Samsung R&D Institute India, Noida",
  photos: {
    finale: "On stage at the Samsung Solve for Tomorrow 2026 grand finale, receiving the Top 5 finalist award",
    noida: "The team at Samsung R&D Institute India, Noida",
  },
} as const;

export const publication = {
  title: "Sentinel AI: Cyber Bully Detection and Prevention",
  venue: "Journal of Research in Artificial Neural Network Systems (JRANNS)",
  detail: "Vol. 2, No. 2 · April 2026 · Co-author",
  href: "http://hbrppublication.com/OJS/index.php/JRANNS/article/view/9606",
} as const;

/** The other published papers, listed under the featured one. */
export const otherPublications: { title: string; venue: string }[] = [
  {
    title:
      "Cellular Maze: A Cellular Network-Aware Routing System Using Machine Learning-Based Signal Quality Prediction",
    venue: "IJRTI · Vol. 11 Issue 10 · October 2026 · Co-author",
  },
  {
    title: "Reinforcement Learning-Based Content Triage Agent for Intelligent Social Media Moderation",
    venue: "First author",
  },
  {
    title:
      "Automated CIS Benchmark Auditing and Remediation Tool: A Windows System Security Assessment Solution",
    venue: "IEEE · Co-author",
  },
  { title: "Smart Health Monitoring and Recommendation System", venue: "IRJMETS · Co-author" },
];

export type Certification = { title: string; issuer: string; year: string; href?: string };

export const certifications: Certification[] = [
  {
    title: "Claude Code in Action",
    issuer: "Anthropic",
    year: "2026",
    href: "https://verify.skilljar.com/c/jthoxb9dq4s9",
  },
  { title: "AWS Cloud Practitioner Essentials", issuer: "AWS Skill Builder", year: "2026" },
  { title: "Demystifying Networking", issuer: "NPTEL", year: "2026" },
  { title: "Aspire Leaders Program", issuer: "Aspire Institute", year: "2026" },
  { title: "Intel Unnati Industrial Training", issuer: "Intel", year: "2025" },
];

export const certificatesFolder =
  "https://drive.google.com/drive/folders/1LxJ57Xye420axeNnlkJy1O5LkC5YRG9I?usp=sharing";

/** Interface strings used by the Recognition section. */
export const recognitionUi = {
  readPaper: "Read the paper",
  readCursor: "Read",
  verify: "Verify",
  viewAll: "View all certificates",
} as const;

/* ── About ───────────────────────────────────────────────────────────── */

export const about = {
  label: "About",
  title: "Engineer by *building*, not just by studying.",
  paragraphs: [
    "I'm a final-year Computer Science and Engineering (Cyber Security) student at Sri Shakthi Institute of Engineering and Technology. Most of what I know came from building, deploying, breaking and fixing real systems.",
    "For about 16 months I also ran my college's firewall and network (Sophos, FortiGate, MikroTik, Ubiquiti) and the servers behind its Moodle platform, so I know what happens below the API too.",
    "I like owning a feature across every boundary: design the API, model the data, implement authentication, containerize it, deploy it, and then debug it when a user says something is wrong. A security background means I design access control in from the start instead of bolting it on.",
    "I'm looking for a software engineering role where I can own work end to end and keep learning what happens underneath the abstraction.",
  ],
  portrait: { src: "/portrait.webp", alt: "Portrait of Kavin Nandha M K" },
  educationLabel: "Education",
  education: [
    {
      degree: "B.E. Computer Science and Engineering (Cyber Security)",
      school: "Sri Shakthi Institute of Engineering and Technology",
      period: "2023 — 2027",
      score: "CGPA 8.67 / 10",
    },
    {
      degree: "Higher Secondary Certificate (HSC)",
      school: "VVM Matric Hr. Sec. School",
      period: "2023",
      score: "83.4%",
    },
  ],
} as const;

/* ── Contact ─────────────────────────────────────────────────────────── */

export const contact = {
  label: "Contact",
  /** Rendered as huge lines; *asterisks* = serif-italic emphasis. */
  titleLines: ["Let's build", "something that", "*holds up.*"],
  body: "Open to software engineering opportunities and open to relocation. The fastest way to reach me is email.",
  ui: {
    phone: "Phone",
    copy: "Copy",
    copied: "Copied",
    copyLabel: "Copy email address",
    emailCursor: "Write",
  },
} as const;

export const footer = {
  builtWith: "Built with Next.js, TypeScript, GSAP & Lenis",
  copyright: "© 2026 Kavin Nandha M K",
} as const;

/** Control labels for the global chrome (nav, menu, footer, preloader). */
export const chromeCopy = {
  primaryNav: "Primary",
  footerNav: "Footer",
  menu: "Menu",
  close: "Close",
  menuDialog: "Site menu",
  menuNav: "Sections",
  portfolio: "Portfolio",
  navigation: "Navigation",
  elsewhere: "Elsewhere",
  localTime: "Local time",
  backToTop: "Back to top",
} as const;
