# FoodShare — Food Donation & Surplus Management Frontend

A modern, standalone React + Vite web application for food surplus management, natural language donation parsing, intelligent matching, and distribution logistics.

## Features
- **Role-based Dashboards**: Tailored views for Donors, Recipients (NGOs/Shelters), and System Administrators.
- **Rule-based NLP Extraction**: Natural language donation and requirement parsing executed locally with zero API latency.
- **Explainable Matching Algorithm**: 6-factor weighted compatibility calculation (Category, Diet, Servings, Timing, Location, Urgency).
- **Standalone In-Browser Data Store**: Built-in mock database with `localStorage` persistence — no backend server or MySQL setup required.
- **1-Click Demo Accounts**: Instant login access for Donor, Recipient, and Administrator roles directly from the sign-in page.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

## Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Donor** (Green Leaf Restaurant) | `donor1@foodshare.org` | `DonorPassword@123` |
| **Recipient** (Hope Community NGO) | `recipient1@foodshare.org` | `RecipientPassword@123` |
| **Administrator** | `admin@foodshare.org` | `AdminPassword@123` |
*(Or simply click the 1-Click Demo buttons on the Sign In page)*
