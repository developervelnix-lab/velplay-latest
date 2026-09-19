# VelPlay365 — Agent & Affiliate Re-Branding & Design Customization Guide

This document provides a step-by-step guide on how to change the **design, color theme, logos, hero banners, and brand identity** for both the **Agent Console** and **Affiliate Portal** while maintaining 100% of the core backend functionality, APIs, database logic, and security workflows.

---

## ??? Architecture Overview

The VelPlay365 ecosystem consists of a **unified PHP backend** and three decoupled **React Vite frontends**:

```
velplay-latest/
+-- backend/ (d:\xampp\htdocs)
¦   +-- admin/manage-settings/
¦   ¦   +-- site-branding.php         <-- Main Site Branding (Logo, Colors, Social Links)
¦   ¦   +-- agent-control.php         <-- Agent & Affiliate Names + Banners
¦   +-- route-paths/
¦       +-- request-app-status.php    <-- Serves Main App Branding JSON
¦       +-- request-agent-affiliate-status.php <-- Serves Agent & Affiliate Branding JSON
¦
+-- frontend/ (d:\winco-ishad\velplay_frontend_latest_new)
    +-- agent/                        <-- Agent Management Console
    +-- affiliate/                    <-- Affiliate Partner Portal
```

---

## 1. ??? Agent Console Re-Branding (`agent/`)

To change the design and appearance of the **Agent Console**, update the following 5 sections:

### 1.1 Brand Color Palette & Theme Tokens
- **File**: `agent/src/index.css`
- **What to Change**:
  - Update primary gradients, background colors, and border colors:
  ```css
  /* Example: Changing from Slate-Cyan to Dark Emerald / Gold */
  :root {
    --brand-primary: #10b981;        /* Primary accent color */
    --brand-secondary: #059669;      /* Secondary accent color */
    --brand-bg: #064e3b;             /* Main background */
    --brand-card-bg: #022c22;        /* Panel & Card background */
  }
  ```
  - Replace Tailwind color utility classes (e.g. `from-blue-600 to-cyan-400` -> `from-emerald-600 to-teal-400`).

### 1.2 Logos & Graphics Assets
- **Folder**: `agent/public/`
- **Files to Replace**:
  - `public/logo512.png` — High-resolution Agent brand logo.
  - `public/favicon.ico` — Browser tab icon.
  - `public/affiliate_hero_premium.jpg` — Landing page hero preview card image.

### 1.3 Header & Navigation Bar
- **File**: `agent/src/components/layout/Header.jsx`
- **What to Change**:
  - Brand name text (`VELPLAY` -> `YOUR_BRAND_NAME` or dynamic `{siteName}`).
  - Header logo image tag (`<img src="/logo512.png" />`).
  - Background styling (gradient overlays or dark glassmorphism effects).

### 1.4 Left Sidebar Navigation
- **File**: `agent/src/components/layout/Sidebar.jsx`
- **What to Change**:
  - Top brand header logo & taglines (`Agent Console` -> `Partner Portal`).
  - Active link highlight styling (`border-cyan-400`, `text-cyan-300`).
  - Sidebar background gradient & scrollbar styling.

### 1.5 Landing Page & Marketing Copies
- **File**: `agent/src/pages/auth/Landing.jsx`
- **What to Change**:
  - **Hero Headline**: `Run your book on the same console we do.`
  - **Hero Subtitle**: Update value propositions and target agent audience copy.
  - **Features Grid**: Icons, titles, and feature cards (`benefits` array).
  - **Hierarchy Tree Section**: Super Agent ? Master Agent ? Agent ? Players.

---

## 2. ?? Affiliate Portal Re-Branding (`affiliate/`)

To change the design and appearance of the **Affiliate Portal**, update the following 5 sections:

### 2.1 Theme & Dark/Light Mode Variables
- **Files**:
  - `affiliate/src/index.css`
  - `affiliate/src/contexts/ThemeContext.jsx`
- **What to Change**:
  - Define custom light & dark theme CSS variables (e.g. `--bg-primary`, `--accent-color`, `--card-bg`).
  - Update accent glow effects (`rgba(6, 182, 212, 0.15)`).

### 2.2 Logos & Graphic Assets
- **Folder**: `affiliate/public/`
- **Files to Replace**:
  - `public/logo512.png` — Affiliate Portal logo.
  - `public/favicon.ico` — Tab favicon.
  - Custom banners & promotional graphics.

### 2.3 Header & Top Navigation
- **File**: `affiliate/src/components/layout/Header.jsx`
- **What to Change**:
  - Brand identity badge.
  - Dropdown menu theme colors & notification badge styling.

### 2.4 Sidebar Navigation
- **File**: `affiliate/src/components/layout/Sidebar.jsx` & `affiliate/src/components/Sidebar.jsx`
- **What to Change**:
  - Logo branding & header layout.
  - Active tab indicator styles.
  - Dark/Light mode color adaptations.

### 2.5 Affiliate Landing & Onboarding Pages
- **Files**:
  - `affiliate/src/pages/auth/Landing.jsx`
  - `affiliate/src/pages/onboarding/OnboardingWizard.jsx`
- **What to Change**:
  - Commission Rates & Earnings Calculator settings (e.g. RevShare %, CPA offers).
  - Marketing hero banner text & promotional call-to-action (CTA) buttons.

---

## 3. ?? Admin Panel No-Code Dynamic Control

You can also change company names and banners **dynamically from the Admin Panel** without redeploying code:

1. Open **Admin Panel > Agent & Affiliate Control** (`/admin/manage-settings/agent-control.php`).
2. Update **Agent Panel Company Name** and **Affiliate Panel Company Name**.
3. Upload new **Agent Banners** or **Affiliate Banners** dynamically.
4. The frontends automatically fetch these updates in real time via the API route:
   - `GET /route-agent-affiliate-status`

---

## ?? Quick Customization Checklist

| Task | Target Folder / File | Impact |
| :--- | :--- | :--- |
| **Change Agent Colors** | `agent/src/index.css` | Alters full Agent panel theme |
| **Change Agent Logo** | `agent/public/logo512.png` | Updates logo across Header & Sidebar |
| **Change Agent Hero Text** | `agent/src/pages/auth/Landing.jsx` | Modifies Agent landing page copy |
| **Change Affiliate Colors** | `affiliate/src/index.css` | Alters full Affiliate portal theme |
| **Change Affiliate Logo** | `affiliate/public/logo512.png` | Updates logo in Affiliate Header & Sidebar |
| **Change Affiliate Calculator**| `affiliate/src/pages/auth/Landing.jsx` | Updates commission rates preview |
| **Dynamic Name & Banners** | Admin Panel (`agent-control.php`) | Dynamic server-side name & banner updates |

---

> [!TIP]
> **Important**: When customizing designs, do NOT alter the API endpoints (`apiUrl(...)`) or context providers (`AgentContext.jsx` / `AuthContext`). Keeping the state management and API routes intact ensures all downline management, approvals, revenue tracking, and security features continue working seamlessly.
