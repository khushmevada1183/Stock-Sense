# Indian Stock Analyzer - Optimized Setup Guide

This guide provides instructions for setting up the optimized version of the Indian Stock Analyzer application.

## System Requirements

- Node.js 18.x or later
- npm 8.x or later
- Git

## Project Structure

The project has been optimized with the following architecture:

```
stock-analyzer/
├── backend/               # Backend API server
│   ├── src/               # TypeScript source files
│   │   ├── controllers/   # API controllers
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── app.ts         # Express application
│   │   └── server.ts      # Server entry point
│   └── package.json       # Backend dependencies
└── frontend/              # Next.js frontend
    ├── app/               # App router pages
    ├── components/        # React components
    ├── context/           # React context providers
    ├── lib/               # Utility functions
    │   └── hooks/         # Custom React hooks
    ├── services/          # API service layer
    └── package.json       # Frontend dependencies
```

## Environment Setup

1. Create a `.env` file in the backend directory:

```
PORT=5002
FRONTEND_PORT=3001
STOCK_API_KEY=your_api_key_here
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
```

2. Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/stock-analyzer.git
cd stock-analyzer
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5002/api

### Using the Start Script

The repository includes a `start.bat` (Windows) or `start.sh` (Unix) script that will:

1. Check for and kill any processes using the required ports
2. Set up environment variables
3. Start both backend and frontend servers

```bash
# Windows
start.bat

# Unix/macOS
./start.sh
```

## Key Optimizations

The application has been optimized with:

1. **Improved Backend Architecture**
   - Clean modular structure with TypeScript
   - Enhanced error handling and logging
   - Efficient caching with configurable TTLs

2. **Frontend Performance**
   - Custom hooks for data fetching
   - Context-based state management
   - Debounced search with caching
   - Modern UI components with Tailwind CSS

3. **Security Enhancements**
   - Environment-based configuration
   - Rate limiting protection
   - Proper CORS handling
   - Input validation

## Troubleshooting

### Port Conflicts

If you encounter port conflicts:

```bash
# Check for processes using ports
# Windows
netstat -ano | findstr :5002
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :5002
lsof -i :3001

# Kill the process (replace PID with actual process ID)
# Windows
taskkill /F /PID <PID>

# Mac/Linux
kill -9 <PID>
```

### API Connection Issues

Verify your API key is correctly set in the `.env` file. The application includes a health check endpoint:

```
GET http://localhost:5002/api/health
```

This should return a status of "UP" if the server is running correctly.

## Additional Information

For detailed API documentation, visit:
- http://localhost:5002/api-docs

For more information about the project structure and code organization, see the [optimization-plan.md](./optimization-plan.md) file. 