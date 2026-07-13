# velplay365 Developer Documentation

This document is for the next developer who works on this frontend.

It focuses on:

- how the app is structured
- where content comes from
- which files control which pages
- how to safely change text, banners, colors, routes, and layouts
- which parts are dynamic from backend vs hardcoded in frontend

---

## 1. Project Overview

This is a Vite + React app for a betting/casino style frontend.

Main technologies:

- React 19
- React Router
- Vite
- Tailwind is installed, but a lot of the site styling is custom CSS
- `react-icons`
- `swiper` for sliders

Important styling is split between:

- `D:\winco-ishad\velplay365\src\assets\css\velplay365.css`
- `D:\winco-ishad\velplay365\src\index.css`

General rule:

- `velplay365.css` contains most of the shared home/category/site-shell styling
- `index.css` contains many page-specific redesigns and later responsive fixes

---

## 2. How To Run The Project

From:

`D:\winco-ishad\velplay365`

Commands:
   
```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

## 3. App Entry And Providers

### Entry

- `D:\winco-ishad\velplay365\src\main.jsx`

This mounts:

- `ThemeProvider`
- `App`

### Main Router

- `D:\winco-ishad\velplay365\src\App.jsx`

This is the master route map.

### App Providers

- `D:\winco-ishad\velplay365\src\context\ThemeContext.jsx`
- `D:\winco-ishad\velplay365\src\context\SiteContext.jsx`
- `D:\winco-ishad\velplay365\src\context\GameContext.jsx`

What they do:

- `ThemeContext`: stores `app-theme` in localStorage and toggles `light` / `dark`
- `SiteContext`: site branding, account info, hero banners, promo banners, login/register modal state
- `GameContext`: fetches and caches game lists

---

## 4. Important Local Storage Keys

These keys are used all over the site:

- `auth_secret_key`
- `account_id`
- `cached_site_info`
- `cached_games`
- `cached_hero_banners`
- `cached_promo_banners`
- `app-theme`

If login state looks wrong, these are the first things to inspect.

---

## 5. Backend/API Configuration

### Constants

- `D:\winco-ishad\velplay365\src\utils\constants.js`

Main values:

- `URL`
- `API_URL`
- `PAYMENT_URL`

Current default points to:

- `https://api.velplay365.com/`

If this project is moved to another backend, change these first.

### API Helper

- `D:\winco-ishad\velplay365\src\utils\apiFetch.js`

Use:

- `apiGet(route, params)`
- `apiPost(route, body, params)`

This helper sends `Route`, `AuthToken`, and `USER_ID` in both:

- query string
- headers

That redundancy is intentional. Do not simplify it unless backend behavior is confirmed.

---

## 6. Site Shell And Shared Layout

The shared site shell is the most important concept in this codebase.

### Shared Header / Mobile Footer Nav / Mobile Drawers

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaHeader.jsx`

This file controls:

- top news bar
- main desktop nav
- mobile header buttons
- mobile menu drawer
- mobile profile drawer
- mobile bottom navbar
- wagering meter in header

If a page is missing the correct mobile nav/footer behavior, it usually means:

- the page is not wrapped with `rana-layout`
- or it is not using `RanaHeader`

### Shared Home Wrapper

- `D:\winco-ishad\velplay365\src\components\home\Home.jsx`

This page composes:

- `RanaHeader`
- `RanaSidebarLeft`
- `RanaMainContent`
- `RanaSidebarRight`
- `AuthModalHost`

### Shared Footer For Some Pages

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaFooter.jsx`

Used on home/category-style pages, not every utility page.

---

## 7. Layout Classes You Should Understand

These wrapper classes matter:

- `rana-layout`
- `category-route`
- `bonus-route`
- `active-bonus-route`
- `bonus-detail-route`
- `finance-route-shell`
- `legal-route-shell`
- `promo-route`
- `invite-route`

Rule of thumb:

- if the page should behave like the redesigned velplay365 site, wrap it with `rana-layout`
- if mobile bottom nav is missing, check that first

---

## 8. Route Map And Main Page Files

### Home

- Route: `/`
- Page: `D:\winco-ishad\velplay365\src\components\home\Home.jsx`

### Wallet / Finance

- `/deposit` -> `src\components\pages\DepositPage.jsx`
- `/withdraw` -> `src\components\pages\WithdrawPage.jsx`
- `/transaction` -> `src\components\pages\Transaction.jsx`
- `/betting-profit-loss` -> `src\components\pages\ProfitLossPage.jsx`

### Bonus / Promotions

- `/promotion` -> `src\components\pages\PromotionPage.jsx`
- `/bonus` -> `src\components\pages\BonusPage.jsx`
- `/bonus-details/:id` -> `src\components\pages\BonusDetailsPage.jsx`
- `/active-bonus` -> `src\components\pages\ActiveBonusPage.jsx`
- `/inviteandearn` -> `src\components\pages\InviteAndEarnPage.jsx`

### Support / Account

- `/support` -> `src\components\pages\SupportPage.jsx`
- `/change-password` -> `src\components\pages\ChangePasswordPage.jsx`
- `/notifications` -> `src\components\pages\NotificationsPage.jsx`
- `/openbet` -> `src\components\pages\OpenBetPage.jsx`

### Legal Pages

- `/rules-regulation`
- `/exclusion`
- `/responsible-gambling`
- `/privacy-policy`

Controlled by:

- `src\components\pages\RulesAndRegulationPage.jsx`
- `src\components\pages\ExclusionPolicyPage.jsx`
- `src\components\pages\ResponsibleGamblingPage.jsx`
- `src\components\sidebar-components\legal-complience\PrivacyPolicy.jsx`

### Casino / Categories

- `/casino` -> `src\components\pages\CasinoPage.jsx`
- `/lottery` -> `src\components\pages\LotteryPage.jsx`
- `/crash-games` -> `src\components\pages\CrashGamesPage.jsx`
- `/roulette` -> `src\components\pages\RoulettePage.jsx`
- more category pages route through `CategoryGamesPage` or `GameCategoryLayout`

---

## 9. Protected Routes

- `D:\winco-ishad\velplay365\src\components\auth\ProtectedRoute.jsx`

Protected routes require:

- `accountInfo.account_id` not guest
- `auth_secret_key` in localStorage and not guest

Special case:

- guest is allowed for `/game...` routes in some situations

If a user is unexpectedly redirected to home:

- inspect `ProtectedRoute`
- inspect localStorage auth keys
- inspect `SiteContext` loading state

---

## 10. Where Home Page Content Comes From

### Home composition

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaMainContent.jsx`

This controls:

- hero banner
- promo strip
- live/casino/slots/fantasy/fishing sections
- elite offers section
- providers section
- features section
- FAQ
- footer

### Left sidebar

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaSidebarLeft.jsx`

This controls:

- sports quick links
- casino game quick links
- quick links block

### Right sidebar

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaSidebarRight.jsx`

This controls:

- login / sign-up card
- logged-in profile summary
- recent big wins panel
- app download panel

---

## 11. What Content Is Dynamic vs Hardcoded

### Dynamic from backend

From `SiteContext`:

- site name
- site logo
- marquee / latest info from account payload
- hero banners
- promo banners
- account balances

From `GameContext`:

- game lists

From dedicated API calls:

- big wins (`route-big-wins`)
- promotions (`route-offer-promotions`)
- bonuses (`route-active-promotions`)
- support tickets

### Mostly hardcoded in frontend

- many labels and section headings
- mobile quick links in `RanaHeader.jsx`
- home promo strip text in `RanaMainContent.jsx`
- left sidebar sports/casino quick links
- legal page copy in legal page components
- invite/refer copy
- some page hero copy

If text is not changing from backend, it is probably hardcoded in one of these page/component files.

---

## 12. How To Change Common Content

### A. Change top navbar latest news text

Edit:

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaHeader.jsx`

Search:

- `latestNewsItems`

### B. Change navbar links or mobile quick links

Edit:

- `RanaHeader.jsx`

Important arrays:

- `profileLinks`
- `mobileQuickLinks`
- `bottomLinks`

### C. Change home hero banner content

Dynamic source:

- backend banners from `SiteContext`

Fallback static source:

- default hero markup inside `RanaMainContent.jsx`

If backend returns banners, they are shown first.

### D. Change home promo cards under banner

Edit:

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaMainContent.jsx`

Search:

- `First Deposit`
- `Reload Bonus`
- `Refer & Earn`

### E. Change sports links on left sidebar

Edit:

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaSidebarLeft.jsx`

Note:

- Cricket + Football currently open `Luck Sports`
- most others currently open `SABA Sports`

### F. Change quick links list

Edit:

- `RanaSidebarLeft.jsx` for desktop sidebar
- `RanaHeader.jsx` for mobile drawer quick links

### G. Change recent big wins

Desktop right sidebar:

- `RanaSidebarRight.jsx`

Mobile marquee wins strip:

- `RanaMainContent.jsx` -> `MobileBigWinsStrip`

API used:

- `route-big-wins`

### H. Change casino provider / category page copy

Generic category layout:

- `D:\winco-ishad\velplay365\src\components\pages\GameCategoryLayout.jsx`

Each route can pass:

- `title`
- `icon`
- `description`
- `eyebrow`
- `filterFn`

### I. Change invite & earn page content

Edit:

- `D:\winco-ishad\velplay365\src\components\sidebar-components\Miscellaneous\InviteAndEarn.jsx`

Look for:

- `steps`
- `statCards`
- hero copy
- referral card copy

### J. Change legal page content

Files:

- `RulesAndRegulation...`
- `Exclusion...`
- `ResponsibleGambling...`
- `PrivacyPolicy.jsx`

These pages are mostly content-driven React markup, not API-driven.

---

## 13. Bonus, Promotion, Invite, Support: Main Files

### Promotions

- page wrapper: `src\components\pages\PromotionPage.jsx`
- main content: `src\components\sidebar-components\Miscellaneous\Promotion.jsx`
- styles: `src\index.css` under `.promo-v2*`

### Bonus

- page wrapper: `src\components\pages\BonusPage.jsx`
- main content: `src\components\sidebar-components\Miscellaneous\Bonus.jsx`
- styles: `src\assets\css\velplay365.css` under `.bonus-v3*`

### Active Bonus

- page wrapper: `src\components\pages\ActiveBonusPage.jsx`
- styles in `velplay365.css` under `.active-bonus*`

### Invite & Earn

- page wrapper: `src\components\pages\InviteAndEarnPage.jsx`
- main content: `src\components\sidebar-components\Miscellaneous\InviteAndEarn.jsx`
- styles in `src\index.css` under `.invite-v2*`

### Support

- page wrapper: `src\components\pages\SupportPage.jsx`
- main content: `src\components\sidebar-components\contact\ContactUs.jsx`
- support history: `src\components\sidebar-components\contact\SupportHistory.jsx`

---

## 14. Finance Pages (Deposit / Withdraw / Transaction / Profit & Loss)

Page wrappers:

- `DepositPage.jsx`
- `WithdrawPage.jsx`
- `ProfitLossPage.jsx`

Main content files:

- `src\components\navbar\Deposit.jsx`
- `src\components\navbar\Withdraw.jsx`
- `src\components\sidebar-components\statements\BettingTransaction.jsx`

Main styles:

- `src\index.css`

Look for:

- `.finance-v2*`
- `.statement-v2*`
- `.wallet-*`

Note:

- these pages rely heavily on `index.css`
- many mobile fixes were done there

---

## 15. Casino Page Notes

Main file:

- `D:\winco-ishad\velplay365\src\components\pages\CasinoPage.jsx`

Important:

- this page has a lot of inline/local CSS inside the component
- many colors, provider filters, popup states, loading popup, and search styles are defined directly there
- the game launch popup on casino is separate from the home page launch popup

If something changes only on casino and not home:

- check `CasinoPage.jsx` first

---

## 16. Category Pages / Game Pages

Category layout:

- `GameCategoryLayout.jsx`

Shared category styling:

- `velplay365.css`

Game launch flow often uses:

- `route-play-games`
- `navigate("/game-url/...")`

If a category shows no games:

- inspect the `filterFn` in `App.jsx`
- inspect `GameContext`
- inspect backend game payload keys like:
  - `Game Name`
  - `Game Provider`
  - `Game UID`

---

## 17. Styling Rules For This Repo

### Main style files

- `D:\winco-ishad\velplay365\src\assets\css\velplay365.css`
- `D:\winco-ishad\velplay365\src\index.css`

### Good editing strategy

Before adding new CSS:

1. search existing class in both CSS files
2. check if page already has a wrapper class
3. add scoped styles under that page namespace

Examples:

- `.promo-v2*`
- `.invite-v2*`
- `.legal-v2*`
- `.bonus-v3*`
- `.finance-v2*`
- `.statement-v2*`

Avoid adding global generic rules unless absolutely necessary.

---

## 18. Mobile Behavior Rules

For redesigned pages, mobile header/footer behavior depends on:

- `rana-layout`
- `RanaHeader`
- enough bottom padding on the page content area

If mobile bottom nav overlaps content:

- add more bottom padding to that page main wrapper
- usually around `100px` to `110px`

If mobile nav/footer is missing completely:

- check the page wrapper class
- check whether `RanaHeader` is mounted

---

## 19. Fonts And Theme

Font constants:

- `D:\winco-ishad\velplay365\src\constants\theme.js`

Current fonts:

- `display`: Sora
- `ui`: Inter
- `head`: Space Grotesk

Shared colors are also in `theme.js`, but many pages now use direct CSS gradients and values.

Do not assume changing `theme.js` updates the whole site.

---

## 20. Known Architecture Quirks

1. This repo mixes:
   - old component styles
   - newer `rana-layout` redesign
   - custom page-level CSS

2. Some pages are styled in `velplay365.css`, some in `index.css`, some inline.

3. A few files still contain old text encoding artifacts in source comments or strings.

4. Some older utility files exist in repo root (`fix_*.cjs`, `sample.html`, zip files, etc.).
   They are not core runtime files.

5. `PrivacyPolicy` route is directly mounted from the sidebar component file instead of a dedicated page wrapper file.

---

## 21. Recommended Safe Workflow For Future Changes

When changing a page:

1. Find route in `App.jsx`
2. Open the page wrapper component
3. Find the content component
4. Search the page namespace in:
   - `velplay365.css`
   - `index.css`
5. Keep changes scoped to that page namespace

When changing content:

1. Decide if it is backend-driven or hardcoded
2. If backend-driven, inspect:
   - `SiteContext`
   - `GameContext`
   - `apiFetch`
   - specific page fetch call
3. If hardcoded, edit the component directly

---

## 22. Quick File Reference

### Core

- `src\App.jsx`
- `src\main.jsx`
- `src\utils\constants.js`
- `src\utils\apiFetch.js`

### Shared contexts

- `src\context\SiteContext.jsx`
- `src\context\GameContext.jsx`
- `src\context\ThemeContext.jsx`

### Shared site shell

- `src\components\home\Home.jsx`
- `src\components\home\velplay365\RanaHeader.jsx`
- `src\components\home\velplay365\RanaMainContent.jsx`
- `src\components\home\velplay365\RanaSidebarLeft.jsx`
- `src\components\home\velplay365\RanaSidebarRight.jsx`
- `src\components\home\velplay365\RanaFooter.jsx`

### Main style files

- `src\assets\css\velplay365.css`
- `src\index.css`

---

## 23. If You Need To Rebrand The Site

Primary places:

1. `src\utils\constants.js`
2. `src\context\SiteContext.jsx`
3. `src\components\home\velplay365\RanaHeader.jsx`
4. `src\components\home\velplay365\RanaMainContent.jsx`
5. `src\assets\css\velplay365.css`
6. `src\index.css`

Also review:

- logo paths
- app download URL
- support URL
- latest news strings
- quick links
- footer copy

---

## 24. Suggested Next Cleanup Tasks

These are reasonable future cleanup items:

- move remaining inline-heavy page CSS into scoped CSS modules or dedicated files
- centralize page route wrappers so every redesigned page follows the same pattern
- standardize rupee sign formatting everywhere
- split `CasinoPage.jsx` into smaller components
- separate backend-driven content from fallback static content more clearly
- review root-level old helper scripts and archives before deleting them

---

## 25. Final Advice For The Next Developer

This app is workable, but it has evolved in layers.

The safest approach is:

- preserve `rana-layout` for redesigned pages
- keep mobile fixes scoped
- avoid broad global CSS
- always check whether content is coming from backend, localStorage cache, or hardcoded JSX

If something looks wrong only on mobile:

- inspect page wrapper
- inspect `RanaHeader`
- inspect bottom padding
- inspect the page namespace in CSS

If something looks wrong only on one page:

- check the page component first
- then search its namespace in CSS

---

## 26. Detailed Route Inventory

This section is a more literal route-to-file map.

### Public routes

| Route | Component | Notes |
|---|---|---|
| `/` | `Home` | Main redesigned home page |
| `/promotion` | `PromotionPage` | Promotions catalogue |
| `/bonus` | `BonusPage` | Bonus catalogue |
| `/casino` | `CasinoPage` | Separate casino lobby implementation |
| `/roulette` | `RoulettePage` | Category page |
| `/lottery` | `LotteryPage` | Category page |
| `/crash-games` | `CrashGamesPage` | Category page |
| `/rules-regulation` | `RulesAndRegulationPage` | Legal page |
| `/exclusion` | `ExclusionPolicyPage` | Legal page |
| `/responsible-gambling` | `ResponsibleGamblingPage` | Legal page |
| `/privacy-policy` | `PrivacyPolicy` | Legal page mounted directly |

### Protected routes

| Route | Component | Notes |
|---|---|---|
| `/withdraw` | `WithdrawPage` | Wallet page |
| `/deposit` | `DepositPage` | Wallet page |
| `/transaction` | `Transaction` | Wallet/statement page |
| `/betting-profit-loss` | `ProfitLossPage` | Bet history / profit-loss page |
| `/change-password` | `ChangePasswordPage` | Account page |
| `/openbet` | `OpenBetPage` | Account page |
| `/gifrcardreedom` | `GifrCardPage` | Protected utility page |
| `/active-bonus` | `ActiveBonusPage` | Active bonus tracker |
| `/inviteandearn` | `InviteAndEarnPage` | Refer-and-earn page |
| `/notifications` | `NotificationsPage` | Notifications page |
| `/game/:gameName` | `GameplayComponent` | Game launch page |
| `/game-url/:gameUrl/:gameName` | `GameplayComponent` | Encoded game URL launch |

### Category routes via generic page

Many casino-style routes are passed through `CategoryGamesPage` with custom `filterFn`.

Examples in `App.jsx`:

- `/blackjack`
- `/baccarat`
- `/dragon-tiger`
- `/teen-patti`
- `/poker`
- `/game-shows`
- `/andar-bahar`
- `/sic-bo`
- `/lucky-7`

If adding a new category route:

1. Add route in `App.jsx`
2. Pass `title`, `icon`, `sectionId`, and `filterFn`
3. Ensure the new category is linked from:
   - `RanaHeader.jsx`
   - `RanaSidebarLeft.jsx`
   - any mobile quick links if needed

---

## 27. Detailed Home Page Structure

Home page composition is:

1. `RanaHeader`
2. `RanaSidebarLeft`
3. `RanaMainContent`
4. `RanaSidebarRight`
5. `AuthModalHost`

### `RanaMainContent.jsx` sections in order

1. Hero banner
2. Mobile big wins strip
3. Promo strip under hero
4. `Live`
5. `CasinoLobby`
6. `GamesDisplay` sections
7. `Turbogames`
8. More `GamesDisplay` sections
9. Elite offers section
10. Game providers
11. Features section
12. FAQ
13. `RanaFooter`

If the user asks:

- “change top banner” -> edit hero banner area or backend banner data
- “change offer cards under banner” -> edit promo strip in `RanaMainContent.jsx`
- “change elite offers” -> check `promoBanners` + elite offer block in `RanaMainContent.jsx`
- “change why choose us” -> `FeaturesSection.jsx`
- “change FAQ” -> `Faq.jsx`

---

## 28. Shared Header / Mobile Drawer Details

### File

- `D:\winco-ishad\velplay365\src\components\home\velplay365\RanaHeader.jsx`

### What it controls

- top latest news marquee
- desktop nav
- desktop deposit/withdraw buttons
- wagering meter
- desktop profile popover
- mobile login/signup or deposit/withdraw buttons
- mobile menu trigger
- mobile profile trigger
- mobile account drawer
- mobile menu drawer
- mobile bottom navbar

### Important arrays inside `RanaHeader.jsx`

#### `profileLinks`

Controls links inside profile panel:

- My Tickets
- Change Password
- Refer & Earn
- Transaction
- Bet History

#### `mobileQuickLinks`

Controls the menu drawer links on mobile:

- My Account
- Deposit
- Withdrawal
- Bet History
- Promotions
- Bonus
- VIP Club
- Refer a Friend
- Rules
- Exclusion
- Privacy
- Responsible
- Support

#### `latestNewsItems`

Static latest-news marquee text.

#### `bottomLinks`

Bottom mobile navbar items:

- Casino
- Sports
- Home
- Promos
- Support

### If mobile profile/menu is broken

Check:

1. `mobilePanel` state in `RanaHeader.jsx`
2. `mobile-home-menu-open` body class behavior
3. CSS under `.mobile-home-dock`, `.mobile-header-actions`, `.mobile-panel-*` in `velplay365.css`

---

## 29. Auth Modal System

### Files

- `D:\winco-ishad\velplay365\src\components\common\AuthModalHost.jsx`
- `D:\winco-ishad\velplay365\src\components\auth\Login.jsx`
- `D:\winco-ishad\velplay365\src\components\auth\Register.jsx`

### How it works

`SiteContext` owns:

- `showLogin`
- `showRegister`
- `setShowLogin`
- `setShowRegister`

`AuthModalHost` reads those values and renders:

- `Login`
- or `Register`

If a page needs login modal behavior, it should:

- either use `RanaHeader`
- or directly call `setShowLogin(true)` / `setShowRegister(true)`

If login/register popup styling looks wrong:

- search `auth-modal`, `auth-`, `Login`, `Register` in `velplay365.css`

---

## 30. Game Launch Flow

There are at least two game-launch flows:

### A. Home/category/shared game sections

Main file:

- `D:\winco-ishad\velplay365\src\components\home\GameSection.jsx`

Important flow:

1. user clicks a game
2. app checks `auth_secret_key`
3. opens confirmation popup
4. calls `apiPost("route-play-games", ...)`
5. backend returns `game_url`
6. app encodes URL with `btoa(...)`
7. navigates to `/game-url/...`

### B. Casino page game popup

Main file:

- `D:\winco-ishad\velplay365\src\components\pages\CasinoPage.jsx`

This page has its own popup and loading behavior.

Important note:

- if popup colors or structure differ on casino vs home, that is expected because casino owns a separate implementation

---

## 31. Site Branding Data In `SiteContext`

`SiteContext.jsx` merges:

- initial defaults
- cached localStorage values
- backend site/account data

### Initial fallback fields

Examples:

- `service_site_name`
- `service_site_logo`
- `service_tagline`
- `service_marquee`
- `service_app_download_url`
- `service_support_url`

If backend branding fails:

- these fallback values may still show

### Banner sources

#### `heroBanners`

Built from:

- backend `slideShowList`
- frontend `DEFAULT_HERO_BANNERS`

#### `promoBanners`

Built from:

- backend `promo_banners`
- frontend `DEFAULT_PROMO_BANNERS`

Current defaults are mostly empty, so backend banners are important.

---

## 32. Game Data In `GameContext`

### File

- `D:\winco-ishad\velplay365\src\context\GameContext.jsx`

### Returned buckets

The game payload is cached into categories like:

- `slots`
- `casino`
- `fishing`
- `poker`
- `turbo`
- `live`
- `casino_lobby`
- `topslot`

If a page is not showing games:

1. inspect backend response from `route-get-games`
2. inspect if correct game bucket is being used
3. inspect filter logic in route page

---

## 33. Detailed “How To Change Content” Recipes

### Change site name or logo everywhere

Priority order:

1. backend payload used by `SiteContext`
2. fallback defaults in `SiteContext.jsx`
3. logo render helper in `RanaHeader.jsx`

### Change app download link

Files:

- `SiteContext.jsx` fallback `service_app_download_url`
- backend account/site response
- `RanaHeader.jsx` `handleGetApp`

### Change support link

Files:

- `SiteContext.jsx` fallback `service_support_url`
- backend response
- footer/support page links

### Change homepage hero images

Backend preferred:

- `slideShowList`

Frontend fallback:

- `DEFAULT_HERO_BANNERS` in `SiteContext.jsx`
- fallback hero JSX in `RanaMainContent.jsx`

### Change homepage offer images

Backend preferred:

- `promo_banners`

Frontend rendering:

- elite offers in `RanaMainContent.jsx`

### Change big wins source or format

Files:

- `RanaSidebarRight.jsx`
- `RanaMainContent.jsx` (`MobileBigWinsStrip`)

API:

- `route-big-wins`

If user says “still hardcoded,” check those two components first.

### Change account overview card

Desktop right sidebar:

- `RanaSidebarRight.jsx`

Mobile profile panel:

- `RanaHeader.jsx`

### Change quick links for desktop only

- `RanaSidebarLeft.jsx`

### Change quick links for mobile only

- `RanaHeader.jsx`

### Change footer content

Main footer used on home/category pages:

- `RanaFooter.jsx`

### Change provider logos / provider section

- `GameProvider.jsx`

### Change feature cards / “Why choose …”

- `FeaturesSection.jsx`

### Change FAQ content

- `Faq.jsx`

---

## 34. Page-Specific Styling Index

Use this as a search map.

### Home / shell / shared site

- file: `velplay365.css`
- search: `.rana-layout`, `.top-bar`, `.header-*`, `.mobile-*`, `.side-*`, `.promo-*`

### Category pages

- file: `velplay365.css`
- search: `.category-*`

### Bonus pages

- file: `velplay365.css`
- search: `.bonus-v3*`

### Active bonus tracker

- file: `velplay365.css`
- search: `.active-bonus*`

### Finance pages

- file: `index.css`
- search: `.finance-v2*`

### Statement / transaction / bet history pages

- file: `index.css`
- search: `.statement-v2*`, `.wallet-*`

### Promotions

- file: `index.css`
- search: `.promo-v2*`

### Invite & earn

- file: `index.css`
- search: `.invite-v2*`

### Legal pages

- file: `index.css`
- search: `.legal-v2*`

### Game launch popup shared

- file: `index.css`
- search: `.game-launch-*`

### Casino page custom visuals

- file: `CasinoPage.jsx`
- many styles are inline / embedded in component

---

## 35. Common Real-World Tasks And Where To Start

### “Make page responsive”

1. confirm wrapper has `rana-layout`
2. check if content area has enough bottom padding
3. find page namespace in CSS
4. add mobile `@media` rules only inside that page namespace

### “Header/footer mobile nav missing”

1. page must use `RanaHeader`
2. page wrapper should usually be `rana-layout`
3. check if page uses old finance shell without `rana-layout`

### “Popup colors do not match home”

1. identify whether popup is:
   - shared game popup
   - casino-only popup
   - auth modal
   - support/finance modal
2. edit the local implementation, not global colors first

### “Content change is not reflecting”

Check in this order:

1. backend API response
2. localStorage cache
3. component fallback text
4. wrong route/page being edited

### “Text is black / not visible”

Likely causes:

- a broad `.rana-layout` color override
- a page-specific class not forcing text color
- desktop/mobile rule collision

Search both:

- `index.css`
- `velplay365.css`

---

## 36. Files That Look Important But Are Mostly Utility / Legacy

Repo root contains files like:

- `casino_sample.html`
- `sample.html`
- `igaming_casino_page_clean.html`
- `fix-popup.*`
- `theme_fix*.cjs`
- `resize_icons.cjs`
- zip archives like `src.zip`, `src (2).zip`

These are not part of the normal runtime path.

Do not delete them blindly unless product owner confirms cleanup is wanted.

---

## 37. Suggested Future Refactor Plan

If this repo gets a cleanup sprint, the best order is:

1. normalize all page wrappers to `rana-layout`
2. move casino popup styling out of `CasinoPage.jsx`
3. unify finance wrappers and mobile spacing
4. move hardcoded text blocks into a content config layer
5. centralize route metadata for desktop/mobile navs
6. remove legacy root helper scripts after verification
7. split `RanaHeader.jsx` into:
   - top bar
   - desktop nav
   - mobile nav
   - profile panel
   - menu drawer

---

## 38. Final Maintenance Notes

### Before editing a page

- find route in `App.jsx`
- find wrapper component
- find content component
- search page class namespace in CSS

### Before assuming content is static

- inspect `SiteContext`
- inspect `GameContext`
- inspect page-level fetches
- inspect localStorage cache

### Before removing a file

- run search with `rg`
- confirm route/component/import is unused
- confirm it is not referenced dynamically

### Before changing mobile layout

- test with fixed header + fixed bottom nav in mind
- preserve bottom padding
- inspect drawer overlays and z-index stacking

