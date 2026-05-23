# Zimba-Moves
 
A full-stack marketplace platform that connects customers needing relocation services with verified moving companies across South Africa. Zimba-Moves streamlines the entire moving process — from quote requests through to booking confirmation and post-move reviews.
 
---
 
## The Problem
 
Finding a reliable moving company in South Africa is a fragmented, trust-deficient process. Customers rely on word-of-mouth or unverified listings, have no way to compare prices transparently, and no platform holds moving companies accountable for service quality. Zimba-Moves solves this by creating a structured, verified marketplace where the entire moving workflow happens in one place.
 
---
 
## What It Does
 
- **Quote requests** — Customers submit a move request with details including pickup location, destination, move date, and inventory size
- **Competitive quoting** — Verified moving companies on the platform review the request and submit their quotes back to the customer
- **Quote comparison** — Customers compare submitted quotes side by side and accept the offer that suits them
- **Booking and scheduling** — Once a quote is accepted, the booking is confirmed and the move is scheduled within the platform
- **Reviews and ratings** — After a completed move, customers leave reviews that build each company's public reputation on the platform
- **Admin verification** — Moving companies go through an admin approval process before they can list and quote on the platform — ensuring only legitimate operators participate
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React, TypeScript |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT, Role-based access control |
 
---
 
## System Architecture
 
```
Client (React + TypeScript)
        │
        ▼
REST API (Node.js + Express)
        │
        ├── Auth Service (JWT + RBAC)
        ├── Quote Request Service
        ├── Company Quoting Service
        ├── Booking & Scheduling Service
        ├── Reviews & Ratings Service
        └── Admin Verification Service
                │
                ▼
        PostgreSQL Database
```
 
---
 
## User Roles
 
| Role | Responsibilities |
|---|---|
| Customer | Submit move requests, compare quotes, accept bookings, leave reviews |
| Moving Company | View incoming requests, submit quotes, manage confirmed bookings |
| Administrator | Approve or reject moving company registrations, oversee platform activity |
 
---
 
## Core User Flow
 
```
Customer submits move request
        │
        ▼
Verified moving companies receive and review request
        │
        ▼
Companies submit competitive quotes
        │
        ▼
Customer compares quotes and accepts one
        │
        ▼
Booking confirmed — move scheduled
        │
        ▼
Move completed — customer leaves review
```
 
---
 
## Getting Started
 
### Prerequisites
- Node.js 18+
- PostgreSQL
### Installation
 
```bash
# Clone the repository
git clone https://github.com/andile593/Zimba-Moves.git
cd Zimba-Moves
 
# Install dependencies
npm install
 
# Set up environment variables
cp .env.example .env
# Add your DATABASE_URL and JWT_SECRET
 
# Run database migrations
npx prisma migrate dev
 
# Start development server
npm run dev
```
 
---

## Author
 
**Andile Mhlanga**
[LinkedIn](https://linkedin.com/in/andile-mhlanga-370985316) · [GitHub](https://github.com/andile593)
