# Indian Stock Sense - Project Documentation

## Overview

The Indian Stock Sense is a comprehensive web application for analyzing Indian stocks with real-time data, charts, and financial insights. This document consolidates all important project information, updates, and architectural decisions.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Features](#features)
4. [Installation & Setup](#installation--setup)
5. [Development Timeline & Updates](#development-timeline--updates)
6. [Optimizations & Improvements](#optimizations--improvements)
7. [Testing Strategy](#testing-strategy)
8. [Known Issues & Fixes](#known-issues--fixes)
9. [Future Roadmap](#future-roadmap)

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Caching with configurable TTLs
- Security middleware (Helmet, Rate Limiting)
- Jest + Supertest for testing

### Frontend
- Next.js (App Router)
- React with TypeScript
- Context-based state management
- Custom hooks for data fetching
- Tailwind CSS for styling
- Jest + React Testing Library for testing
- Cypress for E2E testing

## Project Structure

```
stock-sense/
├── backend/                  # Backend server
│   ├── src/                  # TypeScript source files
│   ├── tests/                # Tests organized by type
│   │   ├── unit/             # Unit tests
│   │   ├── integration/      # Integration tests
│   │   └── api/              # API endpoint tests
│   └── server.js             # Main server entry point
├── frontend/                 # Next.js frontend
│   ├── app/                  # Next.js app router
│   ├── components/           # UI components
│   ├── context/              # React context providers
│   ├── services/             # API services
│   ├── utils/                # Utility functions
│   ├── __tests__/            # Frontend tests
│   └── cypress/              # E2E tests
├── performance/              # Performance test files
└── .github/workflows/        # CI/CD pipeline configuration
```

## Features

- Real-time stock data from Indian exchanges
- Stock search with debounced auto-complete
- Detailed stock information and charts
- Market news and IPO updates
- Top gainers and losers tracking
- Responsive design with dark mode support
- Favorites management

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm 7+
- API key from [Indian Stock API](https://stock.indianapi.in)

### Environment Configuration

**Backend (.env)**:
```
PORT=5002
FRONTEND_PORT=3001
STOCK_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:3001
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

### Installation Steps

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Start the application:
   ```bash
   # Using the start script (recommended)
   ./start.bat    # Windows
   ./start.sh     # Unix/macOS

   # OR manually start each service
   cd backend && npm run dev      # Terminal 1
   cd frontend && npm run dev     # Terminal 2
   ```

4. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5002/api

### Ports
- Backend: 5002 (configured in `.env`)
- Frontend: 3001 (configured in `.env.local`)

## Development Timeline & Updates

### 2024 Updates

#### Next.js Route Error Fix (Feb 2024)
- Fixed the error `Route "/stocks/[symbol]" used 'params.symbol'. 'params' should be awaited before using its properties`
- Updated the page component in `app/stocks/[symbol]/page.tsx` to use the async/await pattern
- Properly handled route parameters according to Next.js 14+ requirements

#### Next.js 15.x Client Component Update (Mar 2024)
- Added "use client" directive to components that use client-side features:
  - Layout components (Header, Footer)
  - UI components (Toasts, ModalContainer, ThemeToggle, SearchBar)
  - Context providers (UIContext, StockContext)
- Fixed import issues in StockContext.tsx

#### Mock Data Removal (Apr 2024)
- Removed all mock data fallbacks from the application
- Updated error handling to return proper error responses
- Replaced mock authentication with placeholder endpoints
- Removed fallback data generation for common Indian stocks
- Improved error handling to display proper error messages

### 2023 Milestones

#### Backend Architecture Redesign (Nov 2023)
- Implemented clean TypeScript architecture with controllers, services, and routes
- Added efficient caching with configurable TTLs
- Improved error handling and logging
- Added security middleware with rate limiting

#### Frontend State Management (Dec 2023)
- Created context-based state management for UI, stocks, and authentication
- Implemented custom hooks for data fetching and search optimization
- Developed component hierarchy with layout, UI, and feature components

## Optimizations & Improvements

### Backend Optimizations
- Clean modular structure with TypeScript
- Enhanced error handling and logging
- Efficient caching with configurable TTLs
- Security middleware implementation
- Improved API response structure

### Frontend Optimizations
- Custom hooks for data fetching with built-in caching
- Debounced search functionality
- Memoization for expensive computations
- Client-side caching for API requests
- Reduced unnecessary re-renders
- Responsive UI with Tailwind CSS
- Dark mode support
- Loading states and skeleton screens
- Enhanced error feedback with toast notifications

### Performance Improvements
- Optimized data fetching with parallel requests
- API response caching with configurable TTLs
- Reduced bundle sizes with code splitting
- Improved image optimization
- Efficient state management

## Testing Strategy

### Frontend Testing
- **Unit/Integration Tests**: Jest + React Testing Library
- **Component Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress

### Backend Testing
- **Unit Tests**: Jest
- **Integration Tests**: Jest
- **API Tests**: Supertest with Jest

### Performance Testing
- Load Testing: k6.io

### CI/CD
- Automation: GitHub Actions

## Known Issues & Fixes

### API Key Rate Limiting
- **Issue**: API requests fail with status code 429 (Too Many Requests)
- **Fix**: Implemented API key rotation and backoff strategy
- **Status**: Resolved in Apr 2024

### Next.js Route Parameter Handling
- **Issue**: Route params not properly awaited causing runtime errors
- **Fix**: Updated page components to use async/await pattern correctly
- **Status**: Resolved in Feb 2024

### Mobile Responsiveness
- **Issue**: Chart components not rendering properly on small screens
- **Fix**: Updated responsive breakpoints and chart configuration
- **Status**: Resolved in Mar 2024

## Future Roadmap

### Short-term (1-3 months)
- Implement comprehensive test coverage
- Add user authentication system
- Create portfolio management features
- Enhance error handling and logging

### Medium-term (3-6 months)
- Add technical analysis indicators
- Implement stock comparison feature
- Create watchlist functionality
- Add notifications for price alerts

### Long-term (6+ months)
- Integrate machine learning for stock predictions
- Add fundamental analysis tools
- Create custom dashboard with widgets
- Implement social features for sharing insights

## Project Cleanup Status

The project has recently undergone an organizational cleanup as documented in `CLEANUP_SUMMARY.md`. 
The following garbage files have been identified for removal:

1. Empty/temporary files:
   - ✅ `.env~` files in both frontend and backend (REMOVED)

2. Redundant server implementations:
   - ✅ `backend/server-alt.js` (MOVED to tools/archive)
   - ✅ `backend/server-5003.js` (MOVED to tools/archive)
   - ✅ `backend/debug-server.js` (MOVED to tools/archive)

3. Duplicate configuration:
   - ⚠️ Frontend: `.eslintrc.js` vs `eslint.config.mjs` (BACKED UP but keeping both - newer ESLint versions use .config.mjs format)

4. Redundant scripts:
   - Multiple startup scripts that may be consolidated
   - ✅ `Indian Stock Analyzer.lnk.cmd` (MOVED to tools/archive)

5. Debug files in archive directories:
   - `backend/tests-archive/` contains multiple debug scripts that should be evaluated

See `CLEANUP_SUMMARY.md` for the complete cleanup plan and progress.

---

*Last updated: May 2024* 