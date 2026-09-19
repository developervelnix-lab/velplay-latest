# 🚀 Velplay Frontend Documentation

This document provides a detailed guide on how to run, build, and navigate the Velplay frontend monorepo, including descriptions of the directory structures and components for the **Website**, **Agent**, and **Affiliate** applications.

---

## 📌 Overview

This repository is structured as an **NPM Monorepo** powered by **Vite**, **React 19**, and **Tailwind CSS**. It contains three primary frontend applications:

1. **`website`** (`winzoo`) – Player-facing Online Gaming & Sportsbook Web App.
2. **`agent`** (`velplay-agent`) – Agent Control Panel (Credit settlement, downstream player management, limits, agent hierarchy).
3. **`affiliate`** (`velplay-affiliate`) – Affiliate Portal (Referral links, commission tracking, network hierarchy, analytics).

---

## 🛠️ Prerequisites

Before running or building the projects, ensure you have the following installed on your system:
- **Node.js**: `v18.x` or higher (v20+ recommended)
- **NPM**: `v9.x` or higher

---

## ⚙️ Installation

To install all dependencies across all 3 applications in the monorepo with a single command, run from the repository root directory:

```bash
npm install
```

---

## 💻 Running in Development Mode

You can launch each application either from the **root directory** using workspace scripts or by navigating directly into each app directory.

### Option A: From Root Directory (Recommended)

| Application | Command | Default Port / URL |
| :--- | :--- | :--- |
| **Website (Player Portal)** | `npm run dev:website` | `http://localhost:5173` |
| **Agent Portal** | `npm run dev:agent` | `http://localhost:5174` |
| **Affiliate Portal** | `npm run dev:affiliate` | `http://localhost:5175` |

### Option B: From Individual Subdirectories

```bash
# 1. Website (Player Portal)
cd website
npm run dev

# 2. Agent Portal
cd agent
npm run dev

# 3. Affiliate Portal
cd affiliate
npm run dev
```

---

## 📦 Building for Production

To generate optimized, production-ready static bundles (compiled into the `dist/` directory of each respective app):

### Option A: Build from Root Directory

```bash
# Build Player Website
npm run build:website

# Build Agent Portal
npm run build:agent

# Build Affiliate Portal
npm run build:affiliate
```

### Option B: Build from Individual Subdirectories

```bash
# Example: Building Website
cd website
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Monorepo File Structure & Component Descriptions

```
velplay_frontend_latest_new/
├── package.json              # Monorepo configuration & workspace scripts
├── FRONTEND_DOCUMENTATION.md # Project documentation (this file)
├── website/                  # Player Portal (Main Platform)
├── agent/                    # Agent Management Portal
└── affiliate/                # Affiliate Marketing Portal
```

---

### 1. 🌐 Website (`/website`) – Player Web App

The main portal where users register/login, play casino games, view live sports, make deposits/withdrawals, and manage their wallets.

```
website/
├── public/                  # Static public assets (logos, icons, web manifest)
├── src/
│   ├── App.jsx              # App entry router & provider wrap
│   ├── main.jsx             # React DOM entry point
│   ├── index.css            # Base Tailwind CSS, glassmorphism styles & design tokens
│   ├── assets/              # Promotional banners, game icons, brand assets
│   ├── components/          # Application UI Components
│   │   ├── auth/            # Login, Registration & OTP verification modals
│   │   ├── common/          # Reusable UI (Buttons, Modals, Loaders, Sliders)
│   │   ├── home/            # Home page sections, Casino grids, Sportsbook widgets
│   │   ├── navbar/          # Top navigation bar, User balance indicator, Profile dropdown
│   │   ├── pages/           # Full Page Views (Casino, Live Dealer, Sports, Wallet)
│   │   └── sidebar-components/ # Game category filters & side navigation bar
│   ├── constants/           # Global constants, API URLs, Game provider list
│   ├── context/             # React Context (Auth state, Wallet balance, Modals)
│   ├── hooks/               # Custom hooks (Data fetchers, WebSocket listeners)
│   └── utils/               # Utilities & Axios HTTP client helper
└── vite.config.js           # Vite build & PWA configuration
```

#### Key Components & Modules:
- **`components/auth/`**: Standardized Auth modal dialogs (Login, Sign-Up, Reset Password).
- **`components/home/`**: Banners, featured games, game provider cards, recent big winners.
- **`components/pages/`**: Player dashboard, game iframe container (`GamePlayComponent.jsx`), deposit & withdrawal forms, transaction history logs.

---

### 2. 🛡️ Agent (`/agent`) – Agent Management Portal

Administrative panel for master agents and sub-agents to manage downstream players, delegate credit limits, process payout settlements, and review operational metrics.

```
agent/
├── public/                  # Static branding & asset directory
├── src/
│   ├── App.jsx              # Main routing & Agent Auth guard
│   ├── main.jsx             # React DOM entry point
│   ├── index.css            # Global theme styles & utilities
│   ├── components/          # Reusable Agent UI components
│   │   ├── common/          # Tables, pagination controls, search bars, metric cards
│   │   └── navbar/          # Agent header, hierarchy level badge, quick actions
│   ├── context/             # Agent Auth & Permission context
│   ├── pages/               # Main operational modules
│   │   ├── analysis/        # Turnover, P&L, Win/Loss reporting charts
│   │   ├── auth/            # Agent login & security challenge screens
│   │   ├── clients/         # Sub-agent hierarchy & downline management
│   │   ├── dashboard/       # Overview (Active players, Total credit, Exposure)
│   │   ├── players/         # Player list, Account creation, Limit adjustment, Lock/Unlock
│   │   ├── reports/         # Settlement reports, Agent payout logs, Bet history
│   │   └── settings/        # Commission structure & limit allocation controls
│   └── utils/               # API integration & currency formatters
└── vite.config.js           # Vite build configuration
```

#### Key Components & Modules:
- **`pages/players/`**: Downstream player account management (Creation, Limit loading, Cash-in/Cash-out).
- **`pages/reports/`**: Settlement payout records, agent commission breakdown, win/loss statement.
- **`pages/clients/`**: Sub-agent creation and credit quota delegation.

---

### 3. 🤝 Affiliate (`/affiliate`) – Affiliate Portal

Marketing platform for affiliates to track referral links, monitor traffic conversions, review multi-tier earnings, and manage payout requests.

```
affiliate/
├── public/                  # Public static assets & favicon icons
├── src/
│   ├── App.jsx              # Application router & context wrap
│   ├── main.jsx             # React entry point
│   ├── index.css            # Base styles & layout variables
│   ├── components/          # Affiliate UI elements
│   ├── context/             # Affiliate Auth & currency context
│   ├── hooks/               # Custom hooks for tracking & analytics
│   ├── pages/               # Core affiliate pages
│   │   ├── activity/        # Real-time player registration & bet activity feed
│   │   ├── auth/            # Affiliate login & registration forms
│   │   ├── dashboard/       # Earnings summary, Click statistics, Active referrals
│   │   ├── finance/         # Earnings wallet, Withdrawal requests, Payout history
│   │   ├── integration/     # Marketing banners, API keys, Tracking pixels
│   │   ├── links/           # Referral link generator & QR code builder
│   │   ├── network/         # Multi-tier affiliate tree structure
│   │   ├── referrals/       # Referred player list & conversion rates
│   │   ├── reports/         # Monthly income statement, Commission reports
│   │   └── settings/        # Payment method setup (Bank, Crypto, E-Wallets)
│   ├── services/            # API integration for referral & tracking endpoints
│   └── utils/               # Analytics helper functions & formatters
└── vite.config.js           # Vite build configuration
```

#### Key Components & Modules:
- **`pages/links/`**: Custom referral link & campaign QR code generator.
- **`pages/network/`**: Sub-affiliate network tree showing downline levels & revenue split.
- **`pages/finance/`**: Earnings balance, payout request submission, and settlement receipts.

---

## 🧰 Technology Stack Summary

| Package / Library | Description |
| :--- | :--- |
| **React 19** | Core UI component framework |
| **Vite 6** | Lightning-fast development server & bundler |
| **Tailwind CSS** | Utility-first CSS styling framework |
| **React Router DOM 7** | Client-side application router |
| **Axios** | HTTP client for backend REST APIs |
| **Lucide React / FontAwesome** | Icon suites |
| **Framer Motion** | UI animations and modal transitions |
| **Flowbite React / Radix UI** | Accessible component primitives |
