# Indian Stock Analyzer

A comprehensive web application for analyzing Indian stocks with real-time data, search functionality, and detailed analysis.

## Features

- **Real-time Stock Data**: Get up-to-date information on Indian stocks
- **Search Functionality**: Search for stocks by name or symbol from a single search bar in the header
- **Stock Details**: View detailed information about any stock including price, change, volume, etc.
- **Market Overview**: See market indices, top gainers, and top losers at a glance
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Data Source**: Integration with stock market APIs with caching layer

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/khushmevada5005/Stock-Sense.git
cd Stock-Sense
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create environment files:

```bash
# Backend .env
cd ../backend
touch .env
# Add the following:
# PORT=5001
# API_KEY=your_api_key_here

# Frontend .env
cd ../frontend
touch .env.local
# Add the following:
# NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Usage

- Use the search bar in the header to find stocks
- Browse market overview to see trending stocks
- Click on any stock to view detailed information and analysis
- View IPO information, news, and more from the homepage

## API Documentation

The backend provides several API endpoints:

- `/api/stocks/search?query=<query>` - Search for stocks
- `/api/stocks/:symbol` - Get details for a specific stock
- `/api/stocks/:symbol/historical` - Get historical data for a stock
- `/api/market-indices` - Get market indices data
- `/api/featured-stocks` - Get featured stocks
- Additional endpoints for various market data

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 