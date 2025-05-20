# Indian Stock Analyzer

A comprehensive full-stack web application for analyzing Indian stocks across multiple dimensions including financial fundamentals, management analysis, industry trends, and other critical factors.

## Features

- **Financial Fundamentals Analysis**: EPS, P/E ratios, debt-to-equity, revenue growth, profit margins
- **Management Analysis**: Leadership quality, track record, governance practices
- **Industry Trends**: Sector performance, competition analysis, market share
- **Government Policies**: Regulatory impacts, subsidies, taxation changes
- **Macroeconomic Indicators**: GDP growth, inflation, interest rates, currency fluctuations
- **News Analysis**: Recent developments affecting stock performance
- **Technical Analysis**: Price patterns, moving averages, momentum indicators
- **Growth Potential**: Future expansion plans, market opportunities, R&D investments
- **Institutional Investment Trends**: FII/DII flows, stake changes, block deals
- **Market Psychology**: Sentiment indicators, investor behavior patterns

## Technology Stack

### Backend
- **Node.js/Express.js**: RESTful API server
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Relational database
- **JWT**: Authentication and authorization
- **bcrypt**: Password hashing
- **Helmet**: Security headers
- **Morgan**: Request logging
- **Compression**: Response compression

### Frontend
- **Next.js**: React framework with server-side rendering
- **React.js**: UI components with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **GSAP**: Animation library
- **Axios**: HTTP client
- **Formik**: Form handling
- **React Query**: Data fetching and state management

## Project Structure

```
indian-stock-analyzer/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── config/           # Environment variables and configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── db/               # Database setup and queries
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   └── package.json          # Backend dependencies
│
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   │   ├── home/             # Homepage components
│   │   ├── layout/           # Layout components (header, footer)
│   │   ├── stocks/           # Stock related components
│   │   └── ui/               # Reusable UI components
│   ├── context/              # React context providers
│   ├── lib/                  # Utility functions
│   ├── public/               # Static files
│   └── package.json          # Frontend dependencies
│
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (v14+ recommended)
- npm or yarn

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/indian-stock-analyzer.git
   cd indian-stock-analyzer
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

4. Set up the database
   ```bash
   # Create the database
   psql -U postgres -c "CREATE DATABASE indian_stocks;"
   
   # Run the schema script
   psql -U postgres -d indian_stocks -f src/db/schema.sql
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL and other settings
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Documentation

The API follows RESTful principles and returns responses in JSON format.

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

- **POST /auth/register**: Register a new user
- **POST /auth/login**: Login and get JWT token
- **GET /auth/me**: Get current user info
- **POST /auth/change-password**: Change user password

### Stock Endpoints

- **GET /stocks**: Get all stocks with pagination and filtering
- **GET /stocks/:id**: Get stock by ID
- **GET /stocks/symbol/:symbol**: Get stock by symbol
- **POST /stocks**: Create a new stock (admin only)
- **PUT /stocks/:id**: Update a stock (admin only)
- **DELETE /stocks/:id**: Delete a stock (admin only)

### Financial Data Endpoints

- **GET /financial-data/stocks/:stockId**: Get financial data for a stock
- **GET /financial-data/stocks/:stockId/quarterly/:year**: Get quarterly data
- **GET /financial-data/stocks/:stockId/yearly**: Get yearly data
- **GET /financial-data/stocks/:stockId/growth**: Get growth metrics
- **POST /financial-data**: Create financial data (admin only)
- **PUT /financial-data/:id**: Update financial data (admin only)
- **DELETE /financial-data/:id**: Delete financial data (admin only)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

The information provided by Indian Stock Analyzer is for general informational purposes only. We make no representations or warranties of any kind regarding the accuracy or completeness of the information. Investment decisions should be made on the basis of independent research. 