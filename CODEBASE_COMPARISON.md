# Project Guide & Comparison: `velplay_frontend` vs `velplay_frontend_latest_new`

---

## 1. File Structure (Monorepo Layout)

```
velplay_frontend_latest_new/
├── package.json                   <-- Root Monorepo config (NPM Workspaces)
│
├── website/                       <-- Player Gaming Website Portal
│   ├── src/                       <-- Source code (205 files + new boldvelocity theme)
│   ├── dist/                      <-- Production build folder (after npm run build:website)
│   ├── package.json
│   └── vite.config.js
│
├── agent/                         <-- Agent Management Backoffice Portal (NEW)
│   ├── src/                       <-- Source code (32 files)
│   ├── dist/                      <-- Production build folder (after npm run build:agent)
│   ├── package.json
│   └── vite.config.js
│
└── affiliate/                     <-- Affiliate Marketing Portal (NEW)
    ├── src/                       <-- Source code (29 files)
    ├── dist/                      <-- Production build folder (after npm run build:affiliate)
    ├── package.json
    └── vite.config.js
```

---

## 2. Summary of Changed & Added Files

### A. New Portals Added (Brand New Applications)
* **Agent Portal** ([`agent/`](file:///d:/winco-ishad/velplay_frontend_latest_new/agent)): Downline agent tree ([`ClientsManagement.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/agent/src/pages/clients/ClientsManagement.jsx)), Player limits ([`PlayersManagement.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/agent/src/pages/players/PlayersManagement.jsx)), Risk analysis ([`SportAnalysis.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/agent/src/pages/analysis/SportAnalysis.jsx)), Real revenue & P&L statements ([`PlAgent.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/agent/src/pages/reports/PlAgent.jsx), [`RealRevenue.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/agent/src/pages/reports/RealRevenue.jsx)), and 2FA ([`Security2FA.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/agent/src/pages/settings/Security2FA.jsx)).
* **Affiliate Portal** ([`affiliate/`](file:///d:/winco-ishad/velplay_frontend_latest_new/affiliate/src)): Link generator with QR Code ([`LinksManagement.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/affiliate/src/pages/links/LinksManagement.jsx)), Sub-affiliate network tree ([`SubAffiliatesTree.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/affiliate/src/pages/network/SubAffiliatesTree.jsx)), Earnings ledger & payout requests ([`EarningsLedger.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/affiliate/src/pages/finance/EarningsLedger.jsx), [`PayoutRequests.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/affiliate/src/pages/finance/PayoutRequests.jsx)).

### B. Changes in Main Website ([`website/`](file:///d:/winco-ishad/velplay_frontend_latest_new/website))
* **New Theme Layout**: [`components/home/boldvelocity/`](file:///d:/winco-ishad/velplay_frontend_latest_new/website/src/components/home/boldvelocity) (`RanaHeader.jsx`, `RanaFooter.jsx`, `RanaMainContent.jsx`, `RanaSidebarLeft.jsx`, `RanaSidebarRight.jsx`).
* **New Search Page**: [`components/pages/SearchPage.jsx`](file:///d:/winco-ishad/velplay_frontend_latest_new/website/src/components/pages/SearchPage.jsx) for multi-category game and match search.
* **Modified Components (34 files)**: Header/footer responsiveness, Deposit/Withdraw modals, Game lobby layouts, and CSS styles (`ranamatch.css`, `velplay365.css`).

---

## 3. How to Run Locally

Run commands from the root directory (`velplay_frontend_latest_new`):

```bash
# 1. Install dependencies
npm install

# 2. Run Player Website (http://localhost:5173)
npm run dev:website

# 3. Run Agent Portal (http://localhost:5174)
npm run dev:agent

# 4. Run Affiliate Portal (http://localhost:5175)
npm run dev:affiliate
```

---

## 4. How to Host in cPanel (Panel Deployment Guide)

To host all three portals (**Website**, **Agent**, **Affiliate**) on cPanel:

### Step 1: Build Production Files
From your root folder, run:
```bash
npm run build:website
npm run build:agent
npm run build:affiliate
```
This generates 3 build folders:
- `website/dist/`
- `agent/dist/`
- `affiliate/dist/`

---

### Step 2: Set Up Subdomains in cPanel
Log into cPanel $\rightarrow$ **Domains** / **Subdomains**:
1. Main domain: `yourdomain.com` $\rightarrow$ points to `public_html`
2. Subdomain 1: `agent.yourdomain.com` $\rightarrow$ points to `public_html/agent`
3. Subdomain 2: `affiliate.yourdomain.com` $\rightarrow$ points to `public_html/affiliate`

---

### Step 3: Upload Build Files
1. **Upload Player Website**:
   - Compress contents of `website/dist/` into a `.zip` file.
   - Go to cPanel **File Manager** $\rightarrow$ `public_html/`.
   - Upload and extract the zip file directly into `public_html/`.

2. **Upload Agent Portal**:
   - Compress contents of `agent/dist/` into a `.zip` file.
   - Go to cPanel **File Manager** $\rightarrow$ `public_html/agent/`.
   - Upload and extract the zip file directly into `public_html/agent/`.

3. **Upload Affiliate Portal**:
   - Compress contents of `affiliate/dist/` into a `.zip` file.
   - Go to cPanel **File Manager** $\rightarrow$ `public_html/affiliate/`.
   - Upload and extract the zip file directly into `public_html/affiliate/`.

---

### Step 4: Add `.htaccess` for React Router (Crucial Step)

Since React apps use client-side routing, create an `.htaccess` file inside **each** root directory (`public_html/`, `public_html/agent/`, and `public_html/affiliate/`) to prevent `404 Not Found` on page refreshes:

Create `.htaccess` file with this exact content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 5. Live Portal URLs Summary

| Portal | Recommended Subdomain | Target Directory in cPanel |
| :--- | :--- | :--- |
| **Player Website** | `yourdomain.com` | `public_html/` |
| **Agent Portal** | `agent.yourdomain.com` | `public_html/agent/` |
| **Affiliate Portal** | `affiliate.yourdomain.com` | `public_html/affiliate/` |
