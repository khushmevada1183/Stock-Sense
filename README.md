# Indian Stock Sense

A comprehensive web application for analyzing Indian stocks with real-time data, charts, and financial insights.

## 🚀 Quick Start

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the application**
   ```bash
   # Using the start script (recommended)
   ./start.bat    # Windows
   ./start.sh     # Unix/macOS
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5002/api

## 📚 Documentation

For complete documentation, please refer to:

- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Comprehensive project information and updates
- [Testing Documentation](./TESTING.md) - Testing strategy and implementation details

## 📁 Project Structure

```
stock-sense/
├── backend/                 # Backend server (Node.js/Express)
├── frontend/                # Frontend application (Next.js)
├── performance/             # Performance test files
├── tools/                   # Utility scripts and tools
├── docs/                    # Additional documentation
├── PROJECT_DOCUMENTATION.md # Main project documentation
├── TESTING.md               # Testing strategy documentation
├── start.bat                # Windows startup script
└── start.sh                 # Unix/macOS startup script
```

## 📊 Features

- Real-time stock data from Indian exchanges
- Stock search with auto-complete
- Detailed stock information and charts
- Market news and trends
- Responsive design with dark mode support

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

## 📄 License

This project is licensed under the MIT License. 