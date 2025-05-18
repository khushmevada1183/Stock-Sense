# Indian Stock Sense

A comprehensive web application for analyzing Indian stocks with real-time data, interactive charts, and financial insights.

<p align="center">
  <img src="https://via.placeholder.com/1200x600?text=Indian+Stock+Sense+Dashboard" alt="Indian Stock Sense Dashboard" width="800"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0"/>
  <img src="https://img.shields.io/badge/Next.js-13.4+-000000?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-18.2+-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-3.3+-06B6D4?logo=tailwindcss" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
</p>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Demo](#-demo)
- [Built With](#-built-with)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Usage](#-usage)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## 🔍 Overview

Indian Stock Sense is a powerful web application designed to provide comprehensive analysis tools for Indian stock market investors. The platform offers real-time data from Indian exchanges, detailed stock information, technical charts, and market news in an intuitive dark-themed interface with neon green accents. Built with performance and user experience in mind, it helps investors make informed decisions with ease.

## ✨ Key Features

- 📊 **Real-time Market Data** - Live streaming data from NSE & BSE
- 🔍 **Advanced Search & Filtering** - Find stocks by name, sector, or performance metrics
- 📈 **Interactive Charts** - Technical analysis with customizable indicators
- 📰 **Market News & Insights** - Latest updates categorized by relevance
- 🚀 **IPO Tracking** - Complete information on upcoming and recent IPOs
- 💼 **Portfolio Management** - Track performance with detailed analytics
- 🔔 **Custom Alerts** - Price and volume-based notifications
- 🌙 **Elegant Dark Theme** - Enhanced viewing with neon accents
- 📱 **Fully Responsive** - Seamless experience across all devices
- ⚡ **Performance Optimized** - Fast loading with efficient caching

## 🌐 Demo

Check out our live demo:

- 🔗 [Live Demo](https://indian-stock-sense.vercel.app)
- 🔗 [GitHub Pages](https://khushmevada1183.github.io/Stock-Sense/)
- 👤 Demo credentials:
  - Username: `demo@example.com`
  - Password: `demo123`

## 🛠️ Built With

<p align="center">
  <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js"/></a>
  <a href="https://reactjs.org/" target="_blank"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/></a>
  <a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/></a>
  <a href="https://expressjs.com/" target="_blank"><img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/></a>
  <a href="https://www.mongodb.com/" target="_blank"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/></a>
</p>

## 🚀 Features

- **Real-time Stock Data**: Live data from Indian exchanges (NSE & BSE) with minimal delay
- **Advanced Stock Search**: Intelligent search with auto-complete and filtering capabilities
- **Comprehensive Analysis Tools**: Technical indicators, chart patterns, and fundamental metrics
- **Interactive Charts**: Customizable charts with multiple timeframes and comparison tools
- **Market News & Insights**: Latest financial news categorized by markets, companies, economy, and more
- **IPO Tracking**: Detailed information on upcoming and recent IPOs with performance metrics
- **Portfolio Management**: Create and track multiple portfolios with performance analytics
- **Watchlist Functionality**: Monitor selected stocks with custom alerts
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark Mode**: Enhanced viewing experience with elegant dark theme and neon accents
- **Performance Optimized**: Fast loading with efficient data handling and caching strategies

## 💻 Tech Stack

### Backend
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **API**: RESTful architecture with OpenAPI documentation
- **Performance**: Redis caching with configurable TTLs
- **Security**: Helmet, Rate Limiting, CORS, JWT authentication
- **Testing**: Jest + Supertest for unit and integration tests

### Frontend
- **Framework**: Next.js 13+ (App Router)
- **UI Library**: React 18 with TypeScript
- **State Management**: Context API with custom hooks
- **Styling**: Tailwind CSS with custom theme
- **Charts**: Recharts for data visualization
- **Animations**: GSAP for smooth transitions
- **Testing**: Jest + React Testing Library, Cypress for E2E tests

## 📸 Screenshots

<p align="center">
  <img src="https://via.placeholder.com/400x225?text=Dashboard" alt="Dashboard" width="400"/>
  <img src="https://via.placeholder.com/400x225?text=Stock+Detail" alt="Stock Detail" width="400"/>
</p>

<p align="center">
  <img src="https://via.placeholder.com/400x225?text=Portfolio+View" alt="Portfolio" width="400"/>
  <img src="https://via.placeholder.com/400x225?text=News+Feed" alt="News" width="400"/>
</p>

## 📁 Project Structure

```
indian-stock-sense/
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
├── .github/                  # GitHub configuration files
│   ├── workflows/            # GitHub Actions workflows
│   └── ISSUE_TEMPLATE/       # Issue templates
├── UPDATES.md                # Project updates and changelog
├── TESTING.md                # Testing documentation
├── fast-start.bat            # Quick start utility for Windows
├── start.sh                  # Quick start utility for Unix/macOS
├── deploy-to-github.bat      # GitHub Pages deployment utility for Windows
└── deploy-to-github.sh       # GitHub Pages deployment utility for Unix/macOS
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm 7+
- API key from [Indian Stock API](https://stock.indianapi.in)
- MongoDB (local or Atlas)

### Environment Configuration

**Backend (.env)**:
```
PORT=5002
FRONTEND_PORT=3001
STOCK_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:3001
MONGODB_URI=mongodb://localhost:27017/stocksense
JWT_SECRET=your_jwt_secret_here
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:5002/api
NEXT_PUBLIC_APP_ENV=development
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/khushmevada1183/indian-stock-sense.git
   cd indian-stock-sense
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
   ```

## 🚀 Deployment

### GitHub Pages Deployment

To deploy the application to GitHub Pages:

1. **Update your repository settings**
   - Go to your GitHub repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Use the deployment utility**
   ```bash
   # On Windows
   deploy-to-github.bat
   
   # On Unix/macOS
   ./deploy-to-github.sh
   ```

3. **Or deploy manually**
   ```bash
   # Push your changes to GitHub
   git add .
   git commit -m "Update for GitHub Pages deployment"
   git push origin main
   ```

4. **Access your deployed site**
   - Your site will be available at `https://[your-username].github.io/Stock-Sense/`
   - For example: https://khushmevada1183.github.io/Stock-Sense/

## 📚 Documentation

For additional documentation, please refer to:

- [Updates & Changelog](./UPDATES.md) - Project updates, timeline, and changes
- [Testing Documentation](./TESTING.md) - Testing strategy and implementation details
- [API Documentation](http://localhost:5002/api-docs) - Interactive API documentation (when running locally)

## 💡 Usage

### Stock Search
Enter a stock symbol or company name in the search bar to find relevant stocks. The intelligent search supports partial matches and provides suggestions as you type. Click on a stock to view detailed information including price history, technical indicators, and company fundamentals.

### Market News
Navigate to the News section to view the latest market news. Filter by category using the tabs for Markets, Companies, Economy, and more. Save articles to read later or share them via social media.

### IPO Information
Check upcoming and recent IPOs in the IPO section. View details such as issue price, listing date, subscription status, and post-listing performance. Set reminders for upcoming IPOs.

### Portfolio Management
Create and manage your portfolio by adding stocks with purchase date, quantity, and price. Track performance with metrics like total returns, annualized returns, and comparison against market benchmarks. Generate detailed reports and insights.

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Created with ❤️ by <a href="https://github.com/khushmevada1183">Khush Mevada</a>
</p> 