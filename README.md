# CATALYST — Accelerating Change. Creating Impact.

A societal innovation platform designed to transform verified community problems into structured, supervised real-world projects connecting students, universities, researchers, and industry partners.

---

## Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (included with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

The terminal will display the local development URL:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Available Scripts

- `npm run dev`: Starts the Vite development server on `http://localhost:3000` with hot-reloading and instant live refresh.
- `npm run build`: Compiles and bundles all HTML pages and assets into the production-ready `dist/` directory.
- `npm run preview`: Previews the production build locally on `http://localhost:3000`.
- `npm run start`: Starts the dev server and automatically opens the browser.

---

## Project Structure

```
catalyst/
├── assets/                    # Static and runtime assets
│   ├── css/                   # Design system tokens and styles
│   │   ├── base.css           # CSS variables, typography, reset
│   │   ├── components.css     # Buttons, badges, cards, inputs
│   │   ├── dashboard.css      # Portal and dashboard layouts
│   │   ├── home.css           # Landing page hero and sections
│   │   ├── pages.css          # Public page styles
│   │   ├── shell.css          # Navigation headers and footers
│   │   └── wordmark.css       # Dynamic SVG interactive wordmark
│   ├── img/                   # Evidence and media assets
│   │   └── evidence/          # Community problem photographs
│   └── js/                    # Application logic and runtime
│       ├── auth.js            # Authentication views and handling
│       ├── core.js            # Core runtime, router, store, modal, toasts
│       ├── data.js            # Seed data, repositories, API mock layer
│       ├── pages-app.js       # Dynamic application views (detail, projects)
│       ├── pages-public.js    # Public static page controllers
│       ├── portals.js         # Student, University, Industry, Admin portals
│       ├── ui.js              # Reusable UI component builders
│       └── wordmark.js        # Interactive SVG wordmark engine
├── about/                     # About Catalyst & mission
├── admin/                     # Administrator portal
│   ├── analytics/             # Platform metrics & analytics
│   ├── challenges/            # Intake & review queue
│   ├── partners/              # Industry & academic partner management
│   ├── projects/              # Active projects oversight
│   └── users/                 # Role & user management
├── challenges/                # Legacy problem redirect route
├── dashboard/                 # Unified user dashboard
├── explore/                   # Browse and filter community challenges
├── forgot-password/           # Password recovery workflow
├── how-it-works/              # 4-stage operational process explanation
├── industry/                  # Industry partner workspace
│   ├── opportunities/         # Sponsorship and project adoption
│   ├── profile/               # Organization profile & preferences
│   └── projects/              # Sponsored projects tracker
├── login/                     # Secure authentication portal
├── onboarding/                # Role selection & profile setup
├── problems/                  # Detailed problem view & team formation
├── profile/                   # User profile and account settings
├── projects/                  # Active solutions showcase
├── register/                  # Account registration
├── report/                    # Citizen problem intake form with AI preview
├── student-universe/          # Student opportunities & teams
├── students/                  # Student innovation portal
│   ├── activities/            # Tasks, milestones & logs
│   ├── opportunities/         # Recommended challenges
│   ├── portfolio/             # Verified achievements & contributions
│   ├── profile/               # Skills & academic details
│   ├── projects/              # Active project workspaces
│   └── teams/                 # Team collaboration hubs
├── universities/              # University & faculty portal
│   ├── challenges/            # Vetted challenges for coursework/capstone
│   ├── profile/               # Department & faculty credentials
│   ├── projects/              # Supervised student initiatives
│   └── teams/                 # Research group management
├── index.html                 # Main landing page
├── package.json               # Node.js dependencies and run scripts
├── vite.config.js             # Vite development & build configuration
├── .gitignore                 # Git ignore rules
└── .env.example               # Environment variables template
```

---

## Authentication & Demo Accounts

This prototype includes a client-side authentication system with persistent local storage (`catalyst.store.v2`) and pre-seeded accounts for testing all user roles.

All demo accounts use password: `demo1234`

| Role | Email | Portal Route |
| :--- | :--- | :--- |
| **Student** | `student@catalyst.demo` | `/students/` |
| **University / Faculty** | `faculty@catalyst.demo` | `/universities/` |
| **Industry Partner** | `industry@catalyst.demo` | `/industry/` |
| **Administrator** | `admin@catalyst.demo` | `/admin/` |
| **Citizen / Reporter** | `citizen@catalyst.demo` | `/dashboard/` |

---

## Backend Integration Note

The project is structured with an API-ready data repository layer in `assets/js/data.js` and `assets/js/core.js`. All methods return Promises and follow RESTful data contracts. To connect a live backend (Supabase, FastAPI, PostgreSQL, etc.):
1. Update `assets/js/data.js` to dispatch `fetch()` calls to your live API endpoints.
2. Store your API URLs and public keys in `.env.local` (prefixed with `VITE_`).
