# Agent Panel: Features & Specification Analysis

This document provides a comprehensive breakdown of the public landing page, onboarding forms, dashboard views, action triggers, data grids, and API endpoints utilized in the Agent Panel. You can use this specification to rebuild the features with your own custom design layout.

---

## 1. Public Landing Pages & Onboarding

### 1. Home Page / Landing Page (`/`)
*The unauthenticated homepage offering agent acquisition details and access redirects.*
- **Header (`PublicHeader`)**: Nav links to Home, Apply, Check Status, and Sign In.
- **Hero Section**:
  - Title: "Run your book on the same console we do".
  - Subtitle: "The Dollara agent panel gives you a live view of every bet under you, a downline you control..."
  - Calls-to-action: "Apply for an account" (leads to `/apply`) and "Sign in" (leads to `/login`).
- **Dynamic Program Stats**:
  - Endpoint: `/api/v1/agent/program`
  - Values Displayed: Default Partnership percentage, Commission on turnover, and Typical review time in hours.
- **Features List ("What you get")**:
  - Highlights: Live book analysis, downline management controls, report exports, hierarchy scoped protection, and sports/casino aggregation.
- **Agent Hierarchy Tree**:
  - Visual hierarchy representation using the levels fetched from the `/api/v1/agent/program` endpoint (e.g., `Super Agent` -> `Master Agent` -> `Agent` -> `Players`).
- **FAQ Section**:
  - Interactive Q&A list explaining review time, partnership splits, credit reference mechanics, and account creation boundaries.

### 2. Apply Page / Wizard (`/apply`)
*A 3-step onboarding form allowing applicants to request an agent account.*
- **Endpoint**: `/api/v1/agent/apply` (POST payload with form values)
- **Step 1: Login Details**:
  - **Username**: Must be 4-30 chars (alphanumeric, dot, or underscore).
  - **Password** & **Confirm Password**: Password must be at least 6 characters.
- **Step 2: About You**:
  - **Full Name** (Required).
  - **Company Name** (Optional).
  - **Email Address** (Required, validated format).
  - **Phone Number** (Optional).
- **Step 3: Your Operation**:
  - **Market / Region**: Text input.
  - **Expected Players**: Select dropdown (`Under 10`, `10-50`, `50-200`, `200-1000`, `1000+`).
  - **Experience**: Select dropdown (`New to this`, `Under 1 year`, `1-3 years`, `3-5 years`, `5+ years`).
  - **Upline Code**: Optional referral identifier. If passed via query param (`?ref=CODE`), it pre-fills this input.
  - **Notes / Anything Else**: Optional text area.
- **Success screen**:
  - Displays reference code, username, status (Pending), and links to Check Status or return Home.

### 3. Check Status Page (`/apply/status`)
*Allows applicants to check the progress of their submission.*
- **Endpoint**: `/api/v1/agent/apply/status?email=EMAIL` (GET request)
- **Status Results & Actions**:
  - **Pending review**: Reviewer has it. Link to Back to Home.
  - **More information needed**: Action item request. Re-displays status guidelines.
  - **Approved (Active)**: Displays "Your account is live". Includes button to redirect to `/login`.
  - **Not Approved (Rejected)**: Displays rejection reason if returned by server.
  - **No application found**: Option to redirect back to `/apply` to register.

---

## 2. Global Shell & Navigation Layout

The layout uses a persistent structure across all authenticated routes. The main viewport is wrapped in an `AgentProvider` context that stores global state (logged-in identity and date ranges).

### 1. Persistent Top Navigation (`TopNav`)
- **Links/Tabs**:
  - **Dashboard**: Home screen with aggregated metrics.
  - **Clients**: Management page for downstream agent accounts.
  - **Players**: Management page for downstream direct players.
  - **Sport Analysis**: Live monitoring dashboard.
  - **Reports**: Dropdown with 8 specialized reports.
  - **Profile**: Settings and details of the current agent.
  - **Logout**: Triggers session clear and redirects to `/login`.
- **Collapse Mode**: A collapse rail toggle lets the agent hide the top navigation entirely, expanding the data tables to fill the viewport (useful on smaller laptops).

### 2. Global Credit Strip (`CreditSummary`)
A persistent header widget summarizing the current agent's credit capacity:
- **Balance**: Current total credit.
- **Exposure**: Total funds currently at risk (unsettled bets).
- **Available Credit**: `Balance` minus `Exposure`. What remains that can be delegated downstream.

---

## 3. Key Pages & Feature Specifications

### 1. Dashboard (`/dashboard`)
*Aggregated overview of the book's health.*
- **Endpoint**: `/api/v1/agent/me` (to fetch identity and current balances).
- **Features**: Displays summary metrics and shortcuts to downline management.

---

### 2. Clients Management (`/clients`)
*Manages downstream agent accounts immediately beneath this agent.*
- **Endpoint**: `/api/v1/agent/clients?page=X&perPage=Y&search=NAME&status=STATUS`
- **Data Grid Columns**:
  - **Username**: Displays client username and account code.
  - **Level**: Rung in the agent tree (e.g., Master Agent, Agent).
  - **Credit Ref**: The maximum credit limit configured for them.
  - **Balance**: Current balance.
  - **Exposure**: Active exposure on open bets.
  - **Available**: Available credit (`Balance` - `Exposure`).
  - **Partnership**: Percentage of profits they retain (e.g., `10%`).
  - **Players**: Number of players under them.
  - **Status**: Status indicator (`active`, `suspended`, `locked`, `closed`) and betting status.
  - **Actions**: Utility buttons.
- **Key User Actions**:
  - **Search/Filter**: Search by Username/Name or filter by Status.
  - **Credit Transfer**: Modal triggering a POST/PATCH write to adjust client credit up or down (within the agent's available credit).
  - **Lock/Unlock Bets**: A toggle action prompting a confirmation modal. Stops the client (and their entire downline) from placing new bets.
  - **Create Account**: Modal to create a new downline agent, prompting for Username, Level, Partnership percentage, and Credit Reference.

---

### 3. Players Management (`/players`)
*Manages direct players that roll up to this agent.*
- **Endpoint**: `/api/v1/agent/players?page=X&perPage=Y&playerId=ID&username=NAME`
- **Data Grid Columns**:
  - **Username**: Player username and ID.
  - **Available Bal**: The player's current credit balance for betting.
  - **Current P&L**: Player's net profit or loss (color-coded green/red).
  - **Exposure**: Sum of player's open stakes on unsettled markets.
  - **Type**: player level type (`direct`, etc.).
  - **Actions**: Utility buttons.
- **Key User Actions**:
  - **Search/Filter**: Filter by Player ID and Username.
  - **Credit Transfer**: Transfer credit up/down to the player.
  - **Block/Unblock Player**: Suspends player login and betting access.
  - **Create Player Account**: Instantly provisions a new direct player account under this agent.

---

### 4. Sport Analysis (`/sport-analysis`)
*A real-time, live view of active liability across the book. Crucially, this screen is **not** date-filtered; it shows absolute risk today.*
- **Endpoint**: `/api/v1/agent/sport-analysis`
- **Tabs**: Groups active markets by sport (e.g., `Cricket`, `Soccer`, `Tennis`, `Horse Racing`, `Greyhound`). Each tab displays the number of active matches.
- **Data Grid Columns (Fixtures)**:
  - **Event Name**: Fixture name and date/time. Expandable to show individual markets.
  - **Total Bets**: Total bet slips placed on this event.
  - **Exposure**: Live monetary risk (signed negative if net loss).
  - **Total Amount**: Total amount staked.
  - **Max Profit**: Maximum potential upside for the book.
- **Expanded Market Table (Inside fixture rows)**:
  - Clicking on a fixture expands a sub-table:
    - **Markets**: E.g., Match Odds, Bookmaker, Fancy.
    - **Bets**: Bet count on this specific market.
    - **Exposure**: Net exposure on this market.
    - **Max Profit**: Potential profit on this market.

---

## 4. Reports Specification (`/reports/...`)

All eight reports share a common layout wrapper called `ReportShell`, providing:
1. **Period Picker**: Standard From/To date filter.
2. **Filters**: Specialized input fields depending on the report.
3. **Excel Export**: A download button calling the corresponding export endpoint (e.g., `/api/v1/agent/reports/[kind]/export?...`) to fetch a CSV.
4. **Totals Line**: Displays grand totals at the bottom of the table.

---

### Report 1: P&L Report By Market (`/reports/pl-market`)
- **Endpoint**: `/api/v1/agent/reports/pl-market`
- **Filters**: Sport Type (Select), Market Type (Select), Event (Text), Agent Name (Text).
- **Columns (using PlTable schema)**:
  - **Lead Columns**: Sport, Event, Market.
  - **MEMBER columns**: Total Bets, T/O (Turnover), Win, Comm (Commission), Net P&L.
  - **AGENT columns**: Win, Comm, Net P&L.
  - **UPLINE columns**: Net P&L.

### Report 2: P&L Report By Agent (`/reports/pl-agent`)
- **Endpoint**: `/api/v1/agent/reports/pl-agent`
- **Filters**: Standard date range + search inputs.
- **Columns (using PlTable schema)**:
  - **Lead Columns**: Agent Username.
  - **MEMBER / AGENT / UPLINE columns**: (Same as P&L by Market, showing aggregated performance under that agent's sub-tree).

### Report 3: P&L Report By Event (`/reports/event-pl`)
- **Endpoint**: `/api/v1/agent/reports/event-pl`
- **Filters**: Standard date range + Event search.
- **Columns (using PlTable schema)**:
  - **Lead Columns**: Sport, Event Fixture.
  - **MEMBER / AGENT / UPLINE columns**: (Same as P&L by Market, showing aggregated performance on that specific match).

---

### Report 4: Bet List (`/reports/bet-list`)
- **Endpoint**: `/api/v1/agent/reports/bet-list` (Paginated)
- **Filters**: Sport Type, Market Type, Event, Player Username.
- **Columns**:
  - **Placed**: Date & time the slip was created.
  - **Player**: Account username.
  - **Event**: The fixture name.
  - **Market**: Market type.
  - **Selection**: What option they backed (e.g., "Team A").
  - **Side**: Back (Blue) or Lay (Pink).
  - **Odds**: Execution odds.
  - **Stake**: Amount wagered.
  - **Liability**: Total money at risk for the player (on Lay bets).
  - **P&L**: Settled profit/loss.
  - **Status**: Bet state (Settled, Void, Open).

---

### Report 5: Transfer Statement (`/reports/transfer-statement`)
- **Endpoint**: `/api/v1/agent/reports/transfer-statement` (Paginated)
- **Filters**: Direction (Credit Down / Credit Up).
- **Columns**:
  - **Date**: Date/Time.
  - **Account**: Target downline account.
  - **Type**: Agent or Player.
  - **Direction**: Credit Down / Credit Up.
  - **Amount**: Flow value (signed negative for credit pushed down).
  - **Balance After**: Agent's balance remaining after transaction.
  - **Remark**: Memo or reference description.

---

### Report 6: Settlement Report (`/reports/settlement`)
- **Endpoint**: `/api/v1/agent/reports/settlement` (Paginated)
- **Filters**: Standard date range.
- **Columns**:
  - **Date**: Date/Time.
  - **Account**: Downline account settled.
  - **Type**: Agent / Player.
  - **Amount**: Cleared cash (Positive if payment received, negative if paid out).
  - **P&L Before**: Unsettled P&L balance before clearance.
  - **P&L After**: Residual balance remaining.
  - **Period**: Date span settled.
  - **Note**: Settlement remarks.

---

### Report 7: Transactions Report (`/reports/transactions`)
- **Endpoint**: `/api/v1/agent/reports/transactions` (Paginated)
- **Filters**: Player Username, Type (Deposit, Withdrawal, Bonus Credit, Adjustment), Status (Completed, Pending, Rejected, Failed).
- **Columns**:
  - **Date**: Date/Time.
  - **Player**: Username.
  - **Type**: Deposit/Withdrawal/etc.
  - **Amount**: Amount transacted.
  - **Status**: Status badge.
  - **Method**: E.g., manual, payment gateway.
  - **Reference**: Transaction ticket ID.

---

### Report 8: Real Revenue Report (`/reports/real-revenue`)
*Measures actual cash flow (Deposits vs. Withdrawals) in the downline compared to the book's nominal wins.*
- **Endpoint**: `/api/v1/agent/reports/real-revenue`
- **Columns**:
  - **Agent**: Username.
  - **Level**: Level code.
  - **Players**: Number of active players.
  - **Deposits**: Total cash deposited.
  - **Withdrawals**: Total cash withdrawn.
  - **Sports P&L**: Book's sports result.
  - **Casino P&L**: Book's casino aggregator result.
  - **Gross Revenue**: Nominal book performance.
  - **Real Revenue**: Realized revenue (`Deposits` - `Withdrawals`).
