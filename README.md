# Indian Stock Analyzer

A comprehensive web application for analyzing Indian stocks with real-time data, charts, and financial insights.

## 🚀 Optimized Version

This repository contains the optimized version of the Indian Stock Analyzer application. Key improvements include:

- **Modern Architecture**: Clean, modular codebase with TypeScript
- **Enhanced Performance**: Efficient caching, debouncing, and parallel data fetching
- **Improved Security**: Environment variables, rate limiting, and input validation
- **Better User Experience**: Responsive UI, dark mode, and accessibility improvements
- **Development Efficiency**: Better error handling, logging, and code organization

## 🛠️ Tech Stack

- **Backend**:
  - Node.js + Express
  - TypeScript
  - Caching with configurable TTLs
  - Security middleware (Helmet, Rate Limiting)

- **Frontend**:
  - Next.js (App Router)
  - React with TypeScript
  - Context-based state management
  - Custom hooks for data fetching
  - Tailwind CSS for styling

## 📝 Features

- Real-time stock data from Indian exchanges
- Stock search with debounced auto-complete
- Detailed stock information and charts
- Market news and IPO updates
- Top gainers and losers tracking
- Responsive design with dark mode support
- Favorites management

## 🔧 Setup

See the [OPTIMIZED_SETUP.md](./OPTIMIZED_SETUP.md) file for detailed installation and setup instructions.

## 📊 Stock Data

The application uses the Indian Stock API for real-time market data. You'll need to:

1. Get an API key from [Indian Stock API](https://stock.indianapi.in)
2. Add it to your `.env` file as described in the setup guide

## 🌐 Ports

- Backend: 5002 (configured in `.env`)
- Frontend: 3001 (configured in `.env.local`)

## 📑 Documentation

- [Optimization Plan](./optimization-plan.md) - Details of the optimization strategy
- [Setup Guide](./OPTIMIZED_SETUP.md) - Detailed setup instructions

## 📷 Screenshots

![Dashboard](https://stock-analyzer-screenshots.vercel.app/dashboard.png)
![Stock Details](https://stock-analyzer-screenshots.vercel.app/stock-details.png)
![Market Overview](https://stock-analyzer-screenshots.vercel.app/market.png)

## 🚧 Future Improvements

- Implement comprehensive test suite
- Add user authentication and portfolios
- Enhance analytics with machine learning predictions
- Integrate with additional data sources

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 