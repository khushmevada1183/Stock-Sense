# Indian Stock Sense

A comprehensive web application for analyzing Indian stocks with real-time data, charts, and financial insights.

![Indian Stock Sense](https://via.placeholder.com/800x400?text=Indian+Stock+Sense)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

Indian Stock Sense is a powerful web application designed to provide comprehensive analysis tools for Indian stock market investors. The platform offers real-time data from Indian exchanges, detailed stock information, technical charts, and market news in an intuitive interface.

## 🚀 Features

- **Real-time Stock Data**: Live data from Indian exchanges (NSE & BSE)
- **Stock Search**: Intelligent search with auto-complete functionality
- **Detailed Analysis**: Comprehensive stock information and interactive charts
- **Market News**: Latest financial news categorized by markets, companies, economy, and more
- **IPO Tracking**: Information on upcoming and recent IPOs
- **Portfolio Management**: Track your investments and performance
- **Responsive Design**: Full functionality across desktop and mobile devices
- **Dark Mode**: Enhanced viewing experience with dark mode support
- **Performance Optimized**: Fast loading with efficient data handling

## 💻 Tech Stack

### Backend
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Performance**: Caching with configurable TTLs
- **Security**: Helmet, Rate Limiting, CORS
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Next.js (App Router)
- **UI Library**: React with TypeScript
- **State Management**: Context API with custom hooks
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library, Cypress

## 📁 Project Structure

```
stock-sense/
├── backend/                  # Backend server
│   ├── src/                  # TypeScript source files
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── models/           # Data models
│   │   ├── middleware/       # Custom middleware
│   │   └── utils/            # Utility functions
│   ├── tests/                # Tests organized by type
│   └── server.js             # Main server entry point
├── frontend/                 # Next.js frontend
│   ├── app/                  # Next.js app router
│   ├── components/           # UI components
│   │   ├── common/           # Shared components
│   │   ├── layout/           # Layout components
│   │   ├── stocks/           # Stock-related components
│   │   ├── news/             # News components
│   │   └── ui/               # UI elements
│   ├── context/              # React context providers
│   ├── services/             # API services
│   ├── utils/                # Utility functions
│   └── cypress/              # E2E tests
├── docs/                     # Additional documentation
├── UPDATES.md                # Project updates and changelog
├── TESTING.md                # Testing documentation
├── fast-start.bat            # Quick start utility for Windows
└── start.sh                  # Quick start utility for Unix/macOS
```

## 🔧 Installation & Setup

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

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/khushmevada5005/Stock-Sense.git
   cd Stock-Sense
   ```

2. **Use the fast start utility (recommended)**
   ```bash
   # On Windows
   fast-start.bat
   
   # On Unix/macOS
   ./start.sh
   ```

3. **Or install dependencies manually**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Start the application manually**
   ```bash
   # Using the start script
   ./start.bat    # Windows
   ./start.sh     # Unix/macOS
   
   # OR manually start each service
   cd backend && npm run dev      # Terminal 1
   cd frontend && npm run dev     # Terminal 2
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5002/api

## 📚 Documentation

For additional documentation, please refer to:

- [Updates & Changelog](./UPDATES.md) - Project updates, timeline, and changes
- [Testing Documentation](./TESTING.md) - Testing strategy and implementation details

## 💡 Usage

### Stock Search
Enter a stock symbol or company name in the search bar to find relevant stocks. Click on a stock to view detailed information.

### Market News
Navigate to the News section to view the latest market news. Filter by category using the tabs.

### IPO Information
Check upcoming and recent IPOs in the IPO section.

### Portfolio Management
Create and manage your portfolio by adding stocks and tracking performance.

## 🧪 Testing

Run tests using the following commands:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
cd frontend
npm run cypress
```

For detailed testing information, refer to [TESTING.md](./TESTING.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Created by [Khush Mevada](https://github.com/khushmevadal183) 