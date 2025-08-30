# Hydrogen Credit System - Fullstack Demo

A production-like demo web application for a Hydrogen Credit System where 1 ton hydrogen = 1 credit. Complete UI/UX with React frontend and mock backend API.

## Features

### 🏪 **Landing/Marketplace** (`/`)
- Public marketplace overview with producer listings
- Search functionality for producers
- Live market stats and activity feed
- Quick purchase modal for authenticated users

### 🏭 **Producer Dashboard** (`/producer`)
- Production report submission with file uploads
- Credit balance and transaction history
- Create marketplace offers
- Draft and verification workflow

### 🛡️ **Regulatory Dashboard** (`/regulator`)
- Review and approve pending production reports
- Monthly production charts and analytics
- Credit distribution visualization
- Bulk approval workflows

### 💳 **Buyer Dashboard** (`/buyer`)
- Browse and filter marketplace listings
- Purchase credits with quantity selection
- Transaction history with export
- Budget management

### 📊 **Public Ledger** (`/public`)
- Transparent view of all transactions
- Advanced filtering by date, producer, type
- Cumulative credits chart
- Top producers leaderboard

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **UI Components**: shadcn/ui with custom design system
- **Charts**: Recharts for data visualization
- **Authentication**: Mock JWT-based auth with role-based access
- **API**: Axios for HTTP requests
- **State Management**: React hooks with Context API

## Design System

The app uses a role-based color system:
- 🟢 **Green** - Producers (hydrogen generation)
- 🔵 **Blue** - Regulators (oversight & verification)
- 🟡 **Yellow** - Buyers (credit purchases)
- 🟦 **Teal** - Public (transparency & ledger)

## Quick Start

```bash
npm install
npm run dev
```

## Mock Authentication

Login with any username and select your role:
- `producer` - Access production dashboard
- `buyer` - Access buyer dashboard  
- `regulator` - Access regulatory dashboard
- `public` - No auth required for public pages

## API Integration Points

The frontend is ready to connect to a real backend. Key integration points:

- `/api/login` - JWT authentication
- `/api/marketplace` - Credit listings
- `/api/production` - Production reports
- `/api/approve` - Regulatory approvals
- `/api/trade` - Credit transactions
- `/api/ledger` - Transaction history

*Ready for Hyperledger Fabric SDK integration with modular API service layer.*