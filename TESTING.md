# Testing Strategy for Stock Analyzer

This document outlines the testing approach for the Stock Analyzer application.

## Testing Stack

### Frontend
- **Unit/Integration Tests**: Jest + React Testing Library
- **Component Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress

### Backend
- **Unit Tests**: Jest
- **Integration Tests**: Jest
- **API Tests**: Supertest with Jest

### Performance Testing
- **Load Testing**: k6.io

### CI/CD
- **Automation**: GitHub Actions

## Test Directory Structure

```
stock-analyzer/
├── backend/
│   ├── tests/
│   │   ├── unit/             # Unit tests for individual functions
│   │   ├── integration/      # Integration tests for connected components
│   │   └── api/              # API endpoint tests using Supertest
│   │       └── api.test.js   # Example API test
├── frontend/
│   ├── __tests__/
│   │   ├── components/       # Component tests
│   │   │   └── StockCard.test.jsx
│   │   ├── pages/            # Page component tests
│   │   └── utils/            # Utility function tests
│   └── cypress/
│       ├── e2e/              # End-to-end tests
│       │   └── stock-search.cy.js
│       └── support/          # Cypress support files
├── performance/
│   └── api-load-test.js      # k6 performance test script
└── .github/workflows/
    └── test.yml              # GitHub Actions workflow for tests
```

## Running Tests

### Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run API tests only
npm run test:api

# Generate test coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Open Cypress Test Runner
cd frontend
npm run cypress

# Run Cypress tests headlessly
npm run cypress:headless

# Run full E2E tests (build + start + cypress)
npm run e2e
```

### Performance Tests

```bash
# Run k6 performance tests
cd stock-analyzer
k6 run performance/api-load-test.js
```

## Test Naming Conventions

- **Unit Tests**: `[function-name].test.js`
- **Component Tests**: `[ComponentName].test.jsx`
- **API Tests**: `[endpoint-name].test.js`
- **E2E Tests**: `[feature-name].cy.js`

## Test Report Generation

### Test Reports with Mochawesome

The project uses Mochawesome for generating detailed HTML reports for both frontend and backend tests.

```bash
# Generate frontend test report
cd frontend
npm run test:e2e:report

# Generate bug report (after running tests)
npm run generate:bug-report
```

Reports are generated in:
- Test report: `cypress/reports/html/index.html`
- Bug report: `cypress/bugs/bug-report.html`

## Bug Tracking

Cypress tests have custom commands for logging bugs:

```javascript
// Log a bug
cy.logBug('type', 'description', 'severity', 'location');

// Check for visual issues
cy.checkForVisualIssues('[data-testid="element"]');

// Check API responses
cy.checkApiErrors(response);
```

## Writing Tests

### Component Test Example

```jsx
// StockCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import StockCard from '../../components/StockCard';

describe('StockCard Component', () => {
  const mockStock = {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2500.75
  };

  it('renders stock information correctly', () => {
    render(<StockCard stock={mockStock} />);
    expect(screen.getByText('Reliance Industries Ltd.')).toBeInTheDocument();
    expect(screen.getByText('₹2500.75')).toBeInTheDocument();
  });
});
```

### API Test Example

```javascript
// api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Stock API', () => {
  it('returns stock data for valid symbol', async () => {
    const response = await request(app)
      .get('/api/stocks/RELIANCE')
      .expect(200);
    
    expect(response.body).toHaveProperty('symbol', 'RELIANCE');
  });
});
```

### E2E Test Example

```javascript
// stock-search.cy.js
describe('Stock Search Feature', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows users to search for stocks', () => {
    cy.get('[data-testid="search-input"]').type('RELIANCE');
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="stock-card"]').should('be.visible');
  });
});
```

## CI/CD Integration

GitHub Actions is configured to:
1. Run frontend tests
2. Run backend tests
3. Run API tests
4. Run E2E tests
5. Run performance tests

See `.github/workflows/test.yml` for the workflow configuration. 