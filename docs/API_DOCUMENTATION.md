# 📚 Stock Sense API Documentation (Frontend Integration Guide)

**Last Updated:** April 12, 2026  
**Target Audience:** Junior Frontend Developers  
**API Version:** v1  
**Base URL:** `http://localhost:10000/api/v1`

---

## 📑 Table of Contents

1. [Quick Start](#quick-start)
2. [API Structure Overview](#api-structure-overview)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Stock Endpoints](#stock-endpoints)
5. [Market Endpoints](#market-endpoints)
6. [Portfolio Endpoints](#portfolio-endpoints)
7. [Watchlist Endpoints](#watchlist-endpoints)
8. [Alerts Endpoints](#alerts-endpoints)
9. [Notifications Endpoints](#notifications-endpoints)
10. [News Endpoints](#news-endpoints)
11. [IPO Endpoints](#ipo-endpoints)
12. [Institutional Endpoints](#institutional-endpoints)
13. [Health & Status Endpoints](#health--status-endpoints)
14. [WebSocket Real-Time Events](#websocket-real-time-events)
15. [Frontend Integration Best Practices](#frontend-integration-best-practices)
16. [Modern 2026 UI Patterns](#modern-2026-ui-patterns)
17. [Component & Library Recommendations](#component--library-recommendations)
18. [Error Handling](#error-handling)
19. [Caching Strategy](#caching-strategy)

---

## Quick Start

### Basic API Call Template

```typescript
// Example: Fetch market overview
const fetchMarketOverview = async () => {
  try {
    const response = await fetch('http://localhost:10000/api/v1/market/overview', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if needed
        // 'Authorization': `Bearer ${accessToken}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Access the data payload
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Authentication Flow

```typescript
// 1. Signup
const signup = async (email, password, fullName) => {
  const res = await fetch('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName }),
  });
  const { data } = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};

// 2. Login
const login = async (email, password) => {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const { data } = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};

// 3. Automatic Token Refresh
const refreshTokens = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  const { data } = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};
```

---

## API Structure Overview

### Response Format (All Endpoints)

```json
{
  "success": true,
  "data": {
    // Your response payload here
  },
  "metadata": {
    // Optional pagination, caching info
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Something went wrong",
    "code": "ERR_CODE",
    "statusCode": 400,
    "details": {},
    "requestId": "uuid-here",
    "timestamp": "2026-04-12T10:30:00Z"
  }
}
```

### Status Codes

- `200` ✅ OK - Request succeeded
- `201` ✅ Created - Resource created successfully
- `400` ❌ Bad Request - Invalid parameters
- `401` ❌ Unauthorized - Missing/invalid authentication
- `403` ❌ Forbidden - No permission
- `404` ❌ Not Found - Resource doesn't exist
- `429` ❌ Too Many Requests - Rate limited
- `500` ❌ Server Error - Internal error

---

## Authentication Endpoints

### 1. `POST /auth/signup` - User Registration

**Type:** `REST`

**Purpose:** Register a new user account

**Request Payload:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "emailVerified": false,
      "createdAt": "2026-04-12T10:30:00Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "verificationOtpSent": true
  }
}
```

**Frontend Tips:**
- Store `accessToken` in memory or secure storage (NOT localStorage for security)
- Use `refreshToken` with httpOnly cookies for better security
- Show email verification prompt immediately after signup
- Implement email verification before allowing portfolio creation

### 2. `POST /auth/login` - User Login

**Type:** `REST`

**Purpose:** Authenticate user and get tokens

**Request Payload:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "emailVerified": true
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Frontend Tips:**
- Add "Remember me" checkbox to persist login state
- Show loading spinner during authentication
- Redirect to dashboard on successful login
- Display proper error messages (email not found, wrong password, etc.)

### 3. `POST /auth/oauth/login` - OAuth Login

**Type:** `REST`

**Purpose:** Login or signup via OAuth (Google, Facebook)

**Request Payload:**
```json
{
  "provider": "google", // or "facebook"
  "idToken": "google-id-token-string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isNewUser": true,
    "user": {
      "id": "user-uuid-123",
      "email": "user@gmail.com",
      "fullName": "John Doe",
      "avatar": "https://..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Frontend Tips:**
- Integrate Google Sign-In and Facebook SDK
- Use OAuth as frictionless onboarding method
- Automatically link OAuth identity if email exists
- Show avatar in profile after OAuth login

### 4. `POST /auth/refresh` - Refresh Access Token

**Type:** `REST`

**Purpose:** Get new access token using refresh token

**Request Payload:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Frontend Tips:**
- Call this automatically when access token expires (401 response)
- Implement axios/fetch interceptor for automatic refresh
- Refresh token before actual expiry (set timer 1 min before expiry)
- Keep user logged in seamlessly

### 5. `POST /auth/logout` - Logout Current Session

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Logout from current device/browser

**Request Payload:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Frontend Tips:**
- Clear tokens from memory/storage on logout
- Redirect to login page
- Optional: Show "logout successful" toast

### 6. `POST /auth/logout-all` - Logout All Sessions

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Logout from all devices/browsers

**Request Header:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionsRevoked": 5
  }
}
```

**Frontend Tips:**
- Use for security breach scenarios
- Show warning dialog before logout all
- Display count of sessions that were revoked

### 7. `GET /auth/sessions` - Get Active Sessions

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** List all active login sessions

**Request Header:**
```
Authorization: Bearer {accessToken}
?limit=20&offset=0  // Optional pagination
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "sessions": [
      {
        "id": "session-uuid-1",
        "deviceName": "Chrome on Windows",
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.1",
        "lastActivity": "2026-04-12T10:30:00Z",
        "createdAt": "2026-04-10T08:00:00Z"
      }
    ]
  }
}
```

**Frontend Tips:**
- Build a "devices" management page
- Show device type using user agent parsing
- Allow remote logout of individual sessions
- Highlight current session

### 8. `GET /auth/audit-logs` - Get Auth Audit Logs

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** View login/logout history for security audit

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 15,
    "auditLogs": [
      {
        "id": "log-uuid-1",
        "event": "login_success",
        "ipAddress": "192.168.1.1",
        "userAgent": "Chrome on Windows",
        "timestamp": "2026-04-12T10:30:00Z"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show in security/account settings
- Use timeline component for visualization
- Color code: green for login, red for failures

### 9. `POST /auth/verify-email` - Verify Email with OTP

**Type:** `REST`

**Purpose:** Confirm email ownership using OTP

**Request Payload:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "message": "Email verified successfully"
  }
}
```

**Frontend Tips:**
- Show 6-digit OTP input field
- Add "Resend OTP" button (60s cooldown)
- Pre-fill email if coming from signup flow
- Show countdown timer

### 10. `POST /auth/resend-verification` - Resend Verification OTP

**Type:** `REST`

**Purpose:** Send new OTP to email

**Request Payload:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to email",
    "nextResendAt": "2026-04-12T10:35:00Z"
  }
}
```

**Frontend Tips:**
- Enable resend button only after cooldown expires
- Show countdown timer
- Clear previous OTP input when resending

### 11. `POST /auth/forgot-password` - Request Password Reset

**Type:** `REST`

**Purpose:** Start password reset process

**Request Payload:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "If the account exists, a password reset code has been generated.",
    "expiresAt": "2026-04-20T18:20:00.000Z"
  }
}
```

**Frontend Tips:**
- Show confirmation message even if email not found (security)
- Send user to reset-password screen to verify code
- Do not expose whether account exists

### 12. `POST /auth/verify-reset-code` - Verify Reset Code

**Type:** `REST`

**Purpose:** Verify reset code before allowing password update

**Request Payload:**
```json
{
  "email": "user@example.com",
  "resetCode": "A7K9M2PQ"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Reset code verified successfully."
  }
}
```

**Frontend Tips:**
- Validate code format before submit (8 characters, uppercase alphanumeric)
- Keep email and code in state for final reset call

### 13. `POST /auth/reset-password` - Reset Password

**Type:** `REST`

**Purpose:** Complete password reset after code verification

**Request Payload:**
```json
{
  "email": "user@example.com",
  "resetCode": "A7K9M2PQ",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

**Frontend Tips:**
- Validate password strength in real-time
- Show password strength meter
- Auto-login after successful reset or redirect to login

### 13. `GET /auth/profile` - Get User Profile

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Fetch current user profile

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatar": "https://...",
      "emailVerified": true,
      "createdAt": "2026-04-10T08:00:00Z",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    }
  }
}
```

**Frontend Tips:**
- Cache profile for 5 minutes
- Use for navbar/avatar display
- Update on every app load or every 5 minutes

### 14. `PATCH /auth/profile` - Update User Profile

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Update profile information

**Request Payload:**
```json
{
  "fullName": "John Smith",
  "avatar": "https://new-avatar-url.com/avatar.jpg",
  "preferences": {
    "theme": "light",
    "notifications": false
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      // Updated user object
    }
  }
}
```

**Frontend Tips:**
- Add avatar upload with compression
- Show success toast on update
- Update local cache immediately for optimistic updates
- Add form validation before submission

---

## Stock Endpoints

### 1. `GET /stocks/search` - Search Stocks

**Type:** `REST` | **Cache:** 30s

**Purpose:** Search and filter stocks by name, symbol, or sector

**Request Query:**
```
?query=TCS&limit=10&offset=0
?sector=IT&limit=20
?symbol=INFY
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "query": "TCS",
    "count": 1,
    "results": [
      {
        "symbol": "TCS",
        "companyName": "Tata Consultancy Services Limited",
        "sector": "IT",
        "currentPrice": 3950.50,
        "change": 125.30,
        "changePercent": 3.28,
        "marketCap": 1850000000000,
        "volume": 2500000
      }
    ]
  },
  "metadata": {
    "pagination": {
      "total": 1,
      "limit": 10,
      "offset": 0
    }
  }
}
```

**Frontend Tips:**
- Implement debounced search (wait 300-500ms after typing stops)
- Show recent searches
- Display as dropdown/autocomplete
- High-light matching text in results
- Show company logo if available

**Modern 2026 UI Component:**
```typescript
// Use a modern search component with:
// - Glassmorphism background (frosted glass effect)
// - Animated search icon
// - Smooth dropdown animations
// - Trending searches section
// - Company logos and sector badges
```

### 2. `GET /stocks/{symbol}` - Get Stock Profile

**Type:** `REST` | **Cache:** 30s

**Purpose:** Get detailed stock information

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "companyName": "Tata Consultancy Services Limited",
    "isin": "INE467B01029",
    "sector": "IT",
    "industry": "Software Services",
    "description": "Leading global IT services company...",
    "website": "https://www.tcs.com",
    "headquarters": "Mumbai, India",
    "founded": 1968,
    "employees": 500000,
    "currentPrice": 3950.50,
    "pe": 28.5,
    "pb": 12.3,
    "dividend": 32.0,
    "marketCap": 1850000000000,
    "52WeekHigh": 4200.00,
    "52WeekLow": 3100.00
  }
}
```

**Frontend Tips:**
- Build a detailed stock page with tabs
- Show company info in hero section with logo
- Highlight key metrics in cards

### 3. `GET /stocks/{symbol}/quote` - Get Real-Time Quote

**Type:** `REST` | **Cache:** NO (Fresh Data)

**Purpose:** Get latest price and market data (no cache - always fresh)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "lastPrice": 3950.50,
    "change": 125.30,
    "changePercent": 3.28,
    "bidPrice": 3950.40,
    "askPrice": 3950.60,
    "open": 3850.00,
    "high": 3980.00,
    "low": 3840.00,
    "volume": 2500000,
    "timestamp": "2026-04-12T10:30:00Z"
  }
}
```

**Frontend Tips:**
- Update every 2-5 seconds for live prices
- Animate price changes (green up, red down)
- Show tick direction indicator
- Smooth number transitions using libraries like `framer-motion`

### 4. `GET /stocks/{symbol}/technical` - Get Technical Analysis

**Type:** `REST` | **Cache:** 60s

**Purpose:** Get technical indicators (RSI, MACD, Bollinger Bands, Moving Averages)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "period": "1d",
    "indicators": {
      "rsi": {
        "value": 65.5,
        "status": "overbought", // overbought, neutral, oversold
        "interpretation": "Stock is strong but might pull back"
      },
      "macd": {
        "macdLine": 125.50,
        "signalLine": 120.30,
        "histogram": 5.20,
        "status": "bullish"
      },
      "bollingerBands": {
        "middle": 3950.00,
        "upper": 4100.00,
        "lower": 3800.00,
        "position": 0.75 // 0-1 scale, 0=lower, 1=upper
      },
      "movingAverages": {
        "sma20": 3900.00,
        "sma50": 3850.00,
        "sma200": 3700.00,
        "trend": "bullish" // bullish, bearish, neutral
      }
    }
  }
}
```

**Frontend Tips:**
- Build interactive charts using `Recharts` or `Chart.js`
- Show technical indicators as overlays on candlestick chart
- Create toggle buttons for different indicators
- Add period selector (1D, 1W, 1M, 3M, 6M, 1Y, 5Y)

### 5. `GET /stocks/{symbol}/fundamental` - Get Fundamental Analysis

**Type:** `REST` | **Cache:** 3600s (1 hour)

**Purpose:** Get fundamental ratios and analysis

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "ratios": {
      "pe": 28.5,
      "pb": 12.3,
      "roe": 18.5,
      "roa": 12.3,
      "debt": 5000000000,
      "equity": 150000000000,
      "eps": 138.3,
      "bvps": 321.0
    },
    "valuation": {
      "peg": 2.1,
      "pegStatus": "fairly_valued" // undervalued, fairly_valued, overvalued
    },
    "profitability": {
      "grossMargin": 45.2,
      "operatingMargin": 25.3,
      "netMargin": 18.5
    }
  }
}
```

**Frontend Tips:**
- Create comparison tables for multiple stocks
- Show valuation status as color-coded badges
- Use gauge/progress visualizations for margins
- Compare industry averages alongside metrics

### 6. `GET /stocks/{symbol}/financials` - Get Financial Statements

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get quarterly/annual financial data

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "period": "Q4-2026",
    "revenue": 285000000000,
    "netProfit": 52500000000,
    "operatingCash": 45000000000,
    "capitalExpenditure": 5000000000,
    "totalAssets": 350000000000,
    "totalLiabilities": 150000000000,
    "shareholderEquity": 200000000000,
    "recentQuarters": [
      {
        "period": "Q4-2026",
        "revenue": 285000000000,
        "netProfit": 52500000000
      }
      // ... more quarters
    ]
  }
}
```

**Frontend Tips:**
- Build stacked bar/line charts for revenue vs net profit trends
- Show YoY and QoQ growth percentages
- Create downloadable PDF reports
- Highlight key metrics in cards

### 7. `GET /stocks/{symbol}/peers` - Get Peer Companies

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get comparable companies and peer comparison

**Request Query:**
```
?limit=10&sortBy=marketCap
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "peers": [
      {
        "symbol": "INFY",
        "companyName": "Infosys Limited",
        "currentPrice": 2850.00,
        "change": -5.30,
        "changePercent": -0.19,
        "pe": 26.5,
        "marketCap": 1200000000000
      }
      // ... more peers
    ]
  }
}
```

**Frontend Tips:**
- Build side-by-side comparison table
- Show relative strength/weakness with color coding
- Add radar chart for multi-metric comparison
- Link to peer stock details

### 8. `GET /stocks/{symbol}/sentiment` - Get Stock Sentiment

**Type:** `REST` | **Cache:** 300s (5 min)

**Purpose:** Get market sentiment from news and social media

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "overallSentiment": "bullish", // bullish, neutral, bearish
    "sentimentScore": 0.72, // -1 to 1 scale
    "newsCount": 15,
    "socialMentions": 2500,
    "trend": "positive", // positive, neutral, negative
    "recentNews": [
      {
        "title": "TCS Q4 results beat estimates",
        "source": "Economic Times",
        "published": "2026-04-12T08:00:00Z",
        "sentiment": "positive"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show sentiment as emoji or icon (🟢🟡🔴)
- Create sentiment history chart
- Show hot topics/news related to stock
- Use color psychology (green for bullish, red for bearish)

---

## Market Endpoints

### 1. `GET /market/overview` - Get Market Summary

**Type:** `REST` | **Cache:** 30s

**Purpose:** Get overall market status and key indices

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "indices": [
      {
        "name": "SENSEX",
        "value": 72450.50,
        "change": 425.30,
        "changePercent": 0.59,
        "open": 72100.00,
        "high": 72500.00,
        "low": 71900.00,
        "timestamp": "2026-04-12T15:30:00Z"
      },
      {
        "name": "NIFTY50",
        "value": 22150.25,
        "change": 135.50,
        "changePercent": 0.62,
        "open": 22050.00,
        "high": 22200.00,
        "low": 21950.00,
        "timestamp": "2026-04-12T15:30:00Z"
      }
    ],
    "marketStatus": "open", // open, closed, pre-market, post-market
    "nextOpenTime": "2026-04-13T09:15:00Z"
  }
}
```

**Frontend Tips:**
- Show on hero/banner section
- Create animated ticker with prices updating smoothly
- Use hero section with gradient background showing market trend
- Link indices to detail pages

**Modern 2026 UI:**
```
┌─────────────────────────────────────┐
│  📈 SENSEX: 72,450.50              │
│  +425.30 (+0.59%) 🟢                │
│                                     │
│  📈 NIFTY50: 22,150.25             │
│  +135.50 (+0.62%) 🟢                │
│                                     │
│  Status: Market Open ⏱ 3h 45m      │
└─────────────────────────────────────┘
```

### 2. `GET /market/sector-heatmap` - Get Sector Performance

**Type:** `REST` | **Cache:** 60s

**Purpose:** Get performance of all sectors

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sectors": [
      {
        "name": "Finance",
        "change": 2.50,
        "changePercent": 1.95,
        "stocks": 25,
        "gainers": 20,
        "losers": 5
      },
      {
        "name": "IT",
        "change": 1.20,
        "changePercent": 0.85,
        "stocks": 18,
        "gainers": 12,
        "losers": 6
      },
      {
        "name": "Energy",
        "change": -0.50,
        "changePercent": -1.20,
        "stocks": 12,
        "gainers": 5,
        "losers": 7
      }
    ]
  }
}
```

**Frontend Tips:**
- Build treemap or heatmap visualization using `recharts` or `d3`
- Size boxes by market cap
- Color by change percentage (green positive, red negative)
- Click to see sector stocks
- Add sector comparison chart

**Modern 2026 UI:**
Treemap with:
- Glassmorphic cards
- Gradient color mapping
- Hover animations
- Real-time update transitions

### 3. `GET /market/52-week-high` - Get 52-Week Highs

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get stocks hitting 52-week highs

**Request Query:**
```
?limit=20&sector=IT
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stocks": [
      {
        "symbol": "RELIANCE",
        "companyName": "Reliance Industries",
        "price": 2850.00,
        "weekHigh52": 2850.00,
        "weekHigh52Date": "2026-04-12",
        "priceFromHigh": 0,
        "percentFromHigh": 0,
        "change": 125.30,
        "changePercent": 4.59
      }
    ]
  },
  "metadata": {
    "pagination": { "total": 150, "limit": 20, "offset": 0 }
  }
}
```

**Frontend Tips:**
- Show as list/table with star icon
- Highlight stocks near 52-week high
- Create leaderboard view
- Add filter by sector

### 4. `GET /market/indices/{name}/history` - Get Index History

**Type:** `REST` | **Cache:** 30s

**Purpose:** Get historical data for specific index (Sensex, Nifty, etc.)

**Request Query:**
```
?period=1d&from=2026-03-12&to=2026-04-12
?period=1w  # 1m, 3m, 6m, 1y, 5y
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "index": "SENSEX",
    "period": "1d",
    "candles": [
      {
        "timestamp": "2026-04-12T09:15:00Z",
        "open": 72100.00,
        "high": 72500.00,
        "low": 71900.00,
        "close": 72450.50,
        "volume": 125000000
      }
    ],
    "count": 1
  },
  "metadata": {
    "pagination": { "total": 20, "limit": 20 }
  }
}
```

**Frontend Tips:**
- Build candlestick chart using `Recharts` or `TradingView Lightweight Charts`
- Support multiple timeframes with button toggle
- Add zoom and pan functionality
- Show volume as bar chart below candles

### 5. `GET /market/snapshot/latest` - Get Latest Market Snapshot

**Type:** `REST` | **Cache:** 30s

**Purpose:** Get current market snapshot with all indices and breadth

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "capturedAt": "2026-04-12T15:30:00Z",
    "indices": [...], // Same as overview
    "breadth": {
      "advances": 1850,
      "declines": 650,
      "unchanged": 200
    },
    "topGainers": [...],
    "topLosers": [...]
  }
}
```

**Frontend Tips:**
- Show advance-decline ratio
- Create breadth chart with stacked bars
- Update every 30 seconds

---

## Portfolio Endpoints

### 1. `GET /portfolios` - List All Portfolios

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get user's all portfolios

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "portfolios": [
      {
        "id": "portfolio-uuid-1",
        "name": "My Main Portfolio",
        "description": "Long-term investments",
        "createdAt": "2026-03-01T10:00:00Z",
        "summary": {
          "investedAmount": 500000,
          "currentValue": 525000,
          "gainLoss": 25000,
          "gainLossPercent": 5.00,
          "holdings": 5
        }
      }
    ]
  }
}
```

**Frontend Tips:**
- Show portfolio cards with summary stats
- Create new portfolio button
- Click card to go to portfolio detail
- Show gain/loss with color coding (green/red)

### 2. `POST /portfolios` - Create Portfolio

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Create a new portfolio

**Request Payload:**
```json
{
  "name": "My New Portfolio",
  "description": "Short-term trading"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "portfolioId": "portfolio-uuid-new",
    "portfolio": {
      "id": "portfolio-uuid-new",
      "name": "My New Portfolio",
      "description": "Short-term trading",
      "createdAt": "2026-04-12T10:00:00Z"
    }
  }
}
```

**Frontend Tips:**
- Show modal/form to create portfolio
- Validate name (required, max length)
- Show success toast and redirect to portfolio
- Add emoji selector for portfolio icon

### 3. `GET /portfolios/{portfolioId}` - Get Portfolio Details

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get detailed portfolio information

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "details": {
      "id": "portfolio-uuid-1",
      "name": "My Main Portfolio",
      "holdings": 5,
      "investedAmount": 500000,
      "currentValue": 525000,
      "gainLoss": 25000,
      "gainLossPercent": 5.00,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  }
}
```

**Frontend Tips:**
- Show in detailed portfolio page header
- Use in title/breadcrumbs

### 4. `GET /portfolios/{portfolioId}/holdings` - Get Holdings

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get all stocks in portfolio with P&L

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "holdings": [
      {
        "symbol": "TCS",
        "quantity": 100,
        "buyPrice": 3200.00,
        "lastPrice": 3950.50,
        "change": 750.50,
        "changePercent": 23.45,
        "marketValue": 395050,
        "investedValue": 320000,
        "profitLoss": 75050,
        "profitLossPercent": 23.45,
        "realizedPnl": 5000,
        "buyDate": "2026-01-15"
      }
    ]
  }
}
```

**Frontend Tips:**
- Build holdings table with sortable columns
- Show P&L with color coding (green/red)
- Add percentage next to absolute values
- Show held duration (days/months)
- Create pie chart of portfolio allocation

### 5. `GET /portfolios/{portfolioId}/summary` - Get Portfolio Summary

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get portfolio performance metrics

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInvested": 500000,
      "currentValue": 525000,
      "totalGainLoss": 25000,
      "totalGainLossPercent": 5.00,
      "totalRealizedGainLoss": 5000,
      "unrealizedGainLoss": 20000,
      "volatility": 12.5,
      "diversification": 0.75 // 0-1 score
    }
  }
}
```

**Frontend Tips:**
- Show key metrics in card grid
- Display realized vs unrealized gains separately
- Show diversification score with visual indicator
- Use sparkline charts for volatility trend

### 6. `GET /portfolios/{portfolioId}/performance` - Get Performance History

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get portfolio value over time

**Request Query:**
```
?period=1m&resolution=daily
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "performance": [
      {
        "date": "2026-04-12",
        "value": 525000,
        "gainLoss": 25000,
        "gainLossPercent": 5.00
      }
    ]
  }
}
```

**Frontend Tips:**
- Build line chart showing portfolio value over time
- Show gain/loss on hover
- Add moving average line
- Toggle timeframe (1w, 1m, 3m, 6m, 1y)

### 7. `GET /portfolios/{portfolioId}/xirr` - Get Portfolio XIRR (Internal Rate of Return)

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Calculate portfolio return percentage (XIRR)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "xirr": 15.25, // Percentage
    "period": "ytd",
    "fromDate": "2026-01-01",
    "toDate": "2026-04-12"
  }
}
```

**Frontend Tips:**
- Show as primary KPI on portfolio dashboard
- Use large, prominent typography
- Color code positive (green) and negative (red) XIRR
- Show period selector (3m, 6m, 1y, 3y, etc.)

### 8. `POST /portfolios/{portfolioId}/transactions` - Add Transaction

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Record buy/sell transaction

**Request Payload:**
```json
{
  "symbol": "TCS",
  "type": "buy", // buy or sell
  "quantity": 50,
  "price": 3950.50,
  "date": "2026-04-12",
  "fees": 500
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transactionId": "tx-uuid-123",
    "transaction": {
      "id": "tx-uuid-123",
      "symbol": "TCS",
      "type": "buy",
      "quantity": 50,
      "price": 3950.50,
      "date": "2026-04-12",
      "fees": 500,
      "totalValue": 197525
    }
  }
}
```

**Frontend Tips:**
- Build transaction form modal
- Add date picker for transaction date
- Auto-calculate total value
- Add optional fees/charges field
- Show confirmation dialog before submission

### 9. `GET /portfolios/{portfolioId}/export` - Export Portfolio as CSV

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Download portfolio holdings as CSV file

**Response:** CSV file download

**Frontend Tips:**
- Show export button in portfolio actions
- File name: `portfolio-{name}-{date}.csv`
- Include headers: Symbol, Quantity, Buy Price, Current Price, P&L, etc.
- Use Excel-friendly formatting

### 10. `PUT /portfolios/{portfolioId}` - Update Portfolio

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Update portfolio name/description

**Request Payload:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "portfolio": { /* updated portfolio */ }
  }
}
```

**Frontend Tips:**
- Show inline edit or modal
- Use optimistic updates
- Show success toast

### 11. `DELETE /portfolios/{portfolioId}` - Delete Portfolio

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Delete entire portfolio

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Portfolio deleted"
  }
}
```

**Frontend Tips:**
- Show confirmation dialog with warning
- Show count of holdings being deleted
- Redirect to portfolios list after deletion
- Optional: Keep in trash for 30 days recovery

---

## Watchlist Endpoints

### 1. `GET /watchlists` - Get All Watchlists

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get user's watchlists

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "watchlists": [
      {
        "id": "watchlist-uuid-1",
        "name": "Top Tech Stocks",
        "description": "IT sector leaders",
        "itemCount": 5,
        "createdAt": "2026-03-01T10:00:00Z",
        "items": [
          {
            "id": "item-uuid-1",
            "symbol": "TCS",
            "position": 1,
            "addedAt": "2026-03-01T10:00:00Z"
          }
        ]
      }
    ]
  }
}
```

**Frontend Tips:**
- Show watchlists in sidebar or as tabs
- Click to see watchlist items
- Show item count on each watchlist
- Create new watchlist button

### 2. `POST /watchlists` - Create Watchlist

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Create new watchlist

**Request Payload:**
```json
{
  "name": "Pharma Sector",
  "description": "Pharmaceutical companies"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "watchlist": {
      "id": "watchlist-uuid-new",
      "name": "Pharma Sector"
    }
  }
}
```

**Frontend Tips:**
- Show create modal/form
- Minimal fields (name, optional description)
- Show success message with "Add stocks" action
- Quick redirect to add items

### 3. `POST /watchlists/{watchlistId}/items` - Add Stock to Watchlist

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Add stock to watchlist

**Request Payload:**
```json
{
  "symbol": "SUNPHARMA"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item-uuid-1",
      "symbol": "SUNPHARMA",
      "position": 1
    }
  }
}
```

**Frontend Tips:**
- Show quick add button on stock detail pages
- Allow batch add multiple stocks
- Show count of items added

### 4. `DELETE /watchlists/{watchlistId}/items/{itemId}` - Remove Stock

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Remove stock from watchlist

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Item removed"
  }
}
```

**Frontend Tips:**
- Show delete button with trash icon on hover
- Confirm before deletion
- Show success toast

### 5. `PATCH /watchlists/{watchlistId}` - Update Watchlist

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Update watchlist name/description

**Request Payload:**
```json
{
  "name": "New Name"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* updated watchlist */ }
}
```

### 6. `DELETE /watchlists/{watchlistId}` - Delete Watchlist

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Delete entire watchlist

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Watchlist deleted"
  }
}
```

### 7. `PATCH /watchlists/{watchlistId}/items/reorder` - Reorder Items

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Reorder watchlist items (drag & drop)

**Request Payload:**
```json
{
  "items": [
    { "id": "item-uuid-2", "position": 1 },
    { "id": "item-uuid-1", "position": 2 }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* updated watchlist */ }
}
```

**Frontend Tips:**
- Implement drag & drop reordering
- Use `react-beautiful-dnd` or `dnd-kit`
- Show optimistic updates
- Auto-save on reorder

---

## Alerts Endpoints

### 1. `GET /alerts` - Get Price Alerts

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get user's price alerts

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-uuid-1",
        "symbol": "TCS",
        "alertType": "price", // price, change_percent
        "condition": "above", // above, below
        "value": 4000,
        "currentPrice": 3950.50,
        "isActive": true,
        "createdAt": "2026-04-01T10:00:00Z",
        "lastTriggered": "2026-04-11T14:30:00Z"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show alerts as list/cards
- Toggle on/off status
- Show last triggered time
- Delete individual alerts
- Show current price vs alert level

### 2. `POST /alerts` - Create Price Alert

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Create new price alert

**Request Payload:**
```json
{
  "symbol": "TCS",
  "alertType": "price",
  "condition": "above",
  "value": 4000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "alert": {
      "id": "alert-uuid-new",
      "symbol": "TCS",
      "alertType": "price",
      "condition": "above",
      "value": 4000
    }
  }
}
```

**Frontend Tips:**
- Show create form on stock detail page
- Allow multiple alert types (price, % change, crossover)
- Show current price as reference
- Add condition selector (above/below)
- Show success toast

### 3. `GET /alerts/evaluator/status` - Get Alert Evaluator Status

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Check if alert system is running

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "lastRunAt": "2026-04-12T10:30:00Z",
    "nextRunAt": "2026-04-12T10:35:00Z",
    "pendingAlerts": 23,
    "healthStatus": "healthy"
  }
}
```

**Frontend Tips:**
- Show system health indicator
- Display next evaluation time
- Show pending alerts count

### 4. `PATCH /alerts/{alertId}` - Update Alert

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Update alert settings

**Request Payload:**
```json
{
  "value": 4100,
  "isActive": true
}
```

### 5. `DELETE /alerts/{alertId}` - Delete Alert

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Remove alert

---

## Notifications Endpoints

### 1. `GET /notifications` - Get Notifications

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Get user notifications (alerts triggered, etc.)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid-1",
        "type": "alert_triggered",
        "title": "Price Alert: TCS",
        "message": "TCS crossed above ₹4000",
        "symbol": "TCS",
        "read": false,
        "createdAt": "2026-04-12T14:30:00Z"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show in notification center/dropdown
- Show unread count in bell icon
- Mark as read on click
- Sort by newest first
- Add pagination

### 2. `GET /notifications/delivery/status` - Get Notification Delivery Status

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Check notification system health

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "channels": {
      "email": { "enabled": true, "pendingCount": 5 },
      "push": { "enabled": true, "pendingCount": 12 },
      "sms": { "enabled": false }
    }
  }
}
```

### 3. `POST /notifications/push-devices` - Register Push Device

**Type:** `REST` | **Auth Required:** ✅ Yes

**Purpose:** Register device for push notifications

**Request Payload:**
```json
{
  "token": "push-notification-token-from-firebase",
  "deviceName": "iPhone 14 Safari"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "device": {
      "id": "device-uuid-1",
      "token": "push-token...",
      "deviceName": "iPhone 14 Safari"
    }
  }
}
```

**Frontend Tips:**
- Request permission for push notifications
- Use `react-push-notifications` or Firebase Cloud Messaging
- Show opt-in prompt after user login
- Store device token

### 4. `GET /notifications/push-devices` - Get Registered Devices

**Type:** `REST` | **Auth Required:** ✅ Yes

### 5. `DELETE /notifications/push-devices/{deviceId}` - Unregister Device

**Type:** `REST` | **Auth Required:** ✅ Yes

---

## News Endpoints

### 1. `GET /news` - Get News Feed

**Type:** `REST` | **Cache:** 300s (5 min)

**Purpose:** Get latest financial news

**Request Query:**
```
?limit=20&offset=0&category=all
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "news-uuid-1",
        "title": "TCS Q4 results beat estimates",
        "summary": "Tata Consultancy Services reported...",
        "source": "Economic Times",
        "imageUrl": "https://...",
        "sentiment": "positive", // positive, neutral, negative
        "symbols": ["TCS", "INFY"],
        "publishedAt": "2026-04-12T08:00:00Z",
        "url": "https://..."
      }
    ]
  }
}
```

**Frontend Tips:**
- Build news card layout with image
- Show sentiment badge/emoji
- Link to source article
- Show related stock symbols
- Add "Read more" link

### 2. `GET /news/category/{category}` - Get News by Category

**Type:** `REST` | **Cache:** 300s

**Purpose:** Get news filtered by category

**Request Query:**
```
?category=technology&limit=10
```

**Response:** Same as news feed

**Categories:** technology, finance, market, corporate, earnings, etc.

### 3. `GET /news/trending` - Get Trending News

**Type:** `REST` | **Cache:** 300s

**Purpose:** Get top trending news articles

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "trendingArticles": [
      // Same article format as news feed, sorted by popularity
    ]
  }
}
```

**Frontend Tips:**
- Show in dashboard or dedicated section
- Display with ranking badge (1, 2, 3...)
- Add view count if available
- Show "trending 🔥" badge

### 4. `GET /news/alerts` - Get News Alerts

**Type:** `REST` | **Cache:** 60s

**Purpose:** Get critical/urgent news

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        // High priority news items
      }
    ]
  }
}
```

### 5. `GET /news/fear-greed` - Get Fear & Greed Index

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get market fear & greed sentiment

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "index": 65,
    "status": "greed", // fear, neutral, greed
    "trend": "increasing",
    "description": "Market showing signs of greed",
    "factors": [
      { "name": "Market Momentum", "value": 70 },
      { "name": "Price Strength", "value": 60 },
      { "name": "Junk Bond Demand", "value": 65 }
    ]
  }
}
```

**Frontend Tips:**
- Create gauge chart showing -100 to +100
- Color code: Red (fear 0-30), Yellow (neutral 30-70), Green (greed 70-100)
- Show component factors
- Update daily

### 6. `POST /news/sync` - Sync News (Admin Only)

**Type:** `REST` | **No Cache**

**Purpose:** Manually trigger news sync (requires API key)

**Response:** Sync status

---

## IPO Endpoints

### 1. `GET /ipo/calendar` - Get IPO Calendar

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get upcoming and recent IPOs

**Request Query:**
```
?status=upcoming,open,closed&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ipos": [
      {
        "id": "ipo-uuid-1",
        "companyName": "ABC Finance Ltd",
        "symbol": "ABCFI",
        "issueSize": 5000000000,
        "issuePrice": 500,
        "minLot": 30,
        "openDate": "2026-04-15",
        "closeDate": "2026-04-17",
        "listingDate": "2026-04-20",
        "status": "upcoming", // upcoming, open, closed, listed
        "sector": "Finance"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show calendar-style layout OR timeline
- Color code status (blue upcoming, green open, gray closed, gold listed)
- Show countdown timer for opening dates
- Include pricing details
- Link to detailed IPO page

### 2. `GET /ipo/{ipoId}` - Get IPO Details

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get detailed IPO information

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ipo": {
      "id": "ipo-uuid-1",
      "companyName": "ABC Finance Ltd",
      "symbol": "ABCFI",
      "sector": "Finance",
      "description": "Leading non-banking financial company...",
      "issueSize": 5000000000,
      "issuePrice": 500,
      "minLot": 30,
      "openDate": "2026-04-15",
      "closeDate": "2026-04-17",
      "listingDate": "2026-04-20",
      "allotmentDate": "2026-04-18",
      "shareholdingPattern": {
        "promoters": 65,
        "fia": 15,
        "dia": 10,
        "retail": 10
      }
    }
  }
}
```

### 3. `GET /ipo/subscriptions/latest` - Get IPO Subscription Data

**Type:** `REST` | **Cache:** 300s

**Purpose:** Get latest subscription/bidding data for open IPOs

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "ipoId": "ipo-uuid-1",
        "symbol": "ABCFI",
        "bidDate": "2026-04-17",
        "totalSubscription": 12.5,
        "retailSubscription": 2.0,
        "institutionalSubscription": 8.5,
        "eliteSubscription": 2.0,
        "status": "open"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show subscription ratio prominently
- Create bar chart showing bid breakdown
- Color code oversubscription (red if >5x)
- Show real-time updates

### 4. `GET /ipo/gmp/latest` - Get Grey Market Premium

**Type:** `REST` | **Cache:** 300s

**Purpose:** Get GMP (Grey Market Premium) for IPOs

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gmpPrices": [
      {
        "ipoId": "ipo-uuid-1",
        "symbol": "ABCFI",
        "issuePrice": 500,
        "gmpPrice": 625,
        "gmpPremium": 125,
        "gmpPremiumPercent": 25.0,
        "updatedAt": "2026-04-17T15:30:00Z"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show GMP prediction prominently
- Calculate expected listing price (issue price + GMP)
- Show as percentage gain
- Disclaimer: GMP is speculative, not guaranteed

---

## Institutional Endpoints

### 1. `GET /institutional/fii-dii` - Get FII/DII Latest Activity

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get latest Foreign and Domestic Institutional Investor flows

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-04-12",
    "fii": {
      "buying": 1500000000,
      "selling": 800000000,
      "netInflow": 700000000,
      "trend": "positive"
    },
    "dii": {
      "buying": 2000000000,
      "selling": 1500000000,
      "netInflow": 500000000,
      "trend": "positive"
    },
    "netFlowTotal": 1200000000
  }
}
```

**Frontend Tips:**
- Create flow visualization (inflow in green, outflow in red)
- Show net flow prominently
- Build historical chart for FII/DII trends
- Add buy vs sell breakdown

### 2. `GET /institutional/fii-dii/history` - Get FII/DII History

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get historical FII/DII data

**Request Query:**
```
?from=2026-03-12&to=2026-04-12&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2026-04-12",
        "fiiNet": 700000000,
        "diiNet": 500000000
      }
    ]
  }
}
```

### 3. `GET /institutional/block-deals` - Get Block Deals

**Type:** `REST` | **Cache:** 1800s

**Purpose:** Get recent large block transactions (>5L shares typically)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "blockDeals": [
      {
        "id": "deal-uuid-1",
        "date": "2026-04-12",
        "symbol": "TCS",
        "quantity": 1000000,
        "price": 3950.50,
        "value": 3950500000,
        "buyer": "Investment Fund ABC",
        "seller": "Promoter Group"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show in table with buyer/seller info
- Highlight large deals (>10% of daily volume)
- Link to stock detail page
- Show deal value in crores

### 4. `GET /institutional/insider-trades` - Get Insider Trading

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get promoter/key personnel transactions

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": "trade-uuid-1",
        "date": "2026-04-12",
        "symbol": "TCS",
        "personName": "John Doe",
        "designation": "Director",
        "transactionType": "Buy",
        "quantity": 50000,
        "price": 3950.50,
        "value": 197525000
      }
    ]
  }
}
```

**Frontend Tips:**
- Show insider buys/sells separately
- Mark insider buying as bullish signal
- Show person designation/relationship
- Aggregate by person for performance tracking

### 5. `GET /institutional/shareholding` - Get Shareholding Pattern

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get share ownership breakdown (promoters, institutions, public, etc.)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "symbol": "TCS",
    "shareholding": {
      "promoters": 72.5,
      "institutions": 15.3,
      "public": 12.2
    },
    "history": [
      {
        "date": "2026-04-12",
        "promoters": 72.5,
        "institutions": 15.3,
        "public": 12.2
      }
    ]
  }
}
```

**Frontend Tips:**
- Create pie/donut chart
- Show shareholding breakdown
- Build trend chart for changes over time
- Highlight increasing institutional interest

### 6. `GET /institutional/corporate-actions` - Get Corporate Actions

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get dividends, splits, bonus, mergers, etc.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "corporateActions": [
      {
        "id": "action-uuid-1",
        "symbol": "TCS",
        "actionType": "dividend",
        "ratio": "18:100", // for splits, bonus
        "value": 18, // per share for dividend
        "exDate": "2026-04-15",
        "paymentDate": "2026-05-15",
        "recordDate": "2026-04-16"
      }
    ]
  }
}
```

**Frontend Tips:**
- Show upcoming and past actions
- Calculate impact on shareholding (for splits)
- Show dividend history for income investors
- Add to portfolio dashboard

### 7. `GET /institutional/earnings-calendar` - Get Earnings Calendar

**Type:** `REST` | **Cache:** 3600s

**Purpose:** Get company earnings/results announcement dates

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "earnings": [
      {
        "id": "earnings-uuid-1",
        "symbol": "TCS",
        "companyName": "Tata Consultancy Services",
        "period": "Q4-2026",
        "announcementDate": "2026-04-15",
        "season": "Q4",
        "expectation": "beat" // beat, meet, miss (historical)
      }
    ]
  }
}
```

**Frontend Tips:**
- Create calendar view for earnings announcements
- Show countdown to earnings
- Build earnings surprise tracker
- Link to results/transcripts

---

## Health & Status Endpoints

### 1. `GET /health` - Service Health Check

**Type:** `REST` | **No Cache**

**Purpose:** Check if API is running (used for monitoring)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "service": "stock-sense-backend-v1",
    "timestamp": "2026-04-12T15:30:00Z",
    "environment": "production"
  }
}
```

**Frontend Tips:**
- Check before making critical API calls
- Use for startup verification
- Monitor in dashboard

### 2. `GET /health/db` - Database Health

**Type:** `REST` | **No Cache**

**Purpose:** Check database connection and status

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "database": {
      "connected": true,
      "responseTime": 12,
      "poolActive": 8,
      "poolIdle": 7
    },
    "timestamp": "2026-04-12T15:30:00Z"
  }
}
```

---

## WebSocket Real-Time Events

### Connection Setup

```typescript
// Client-side WebSocket connection
import io from 'socket.io-client';

const socket = io('http://localhost:10000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('subscribe', { symbols: ['TCS', 'INFY'] });
});
```

### 1. `live-tick` - Live Stock Price Updates

**Type:** `WebSocket`

**Purpose:** Real-time price updates for subscribed stocks

**Event Data:**
```json
{
  "event": "live-tick",
  "data": {
    "symbol": "TCS",
    "price": 3950.50,
    "change": 10.50,
    "changePercent": 0.27,
    "volume": 2500000,
    "bid": 3950.40,
    "ask": 3950.60,
    "timestamp": "2026-04-12T15:30:00Z"
  }
}
```

**Frontend Tips:**
- Subscribe to ticks you want to track
- Update prices smoothly using animation libraries
- Color code changes (green up, red down)
- Unsubscribe when leaving page/unmounting

### 2. `market-snapshot` - Market Overview Updates

**Type:** `WebSocket`

**Purpose:** Real-time market index updates

**Event Data:**
```json
{
  "event": "market-snapshot",
  "data": {
    "indices": [
      {
        "name": "SENSEX",
        "value": 72450.50,
        "change": 425.30,
        "changePercent": 0.59
      }
    ],
    "timestamp": "2026-04-12T15:30:00Z"
  }
}
```

### 3. `portfolio-update` - Portfolio Real-Time Updates

**Type:** `WebSocket` | **Auth Required:** ✅ Yes

**Purpose:** Real-time portfolio value changes (triggered by stock price updates)

**Event Data:**
```json
{
  "event": "portfolio-update",
  "data": {
    "portfolioId": "portfolio-uuid-1",
    "holdings": [
      {
        "symbol": "TCS",
        "quantity": 100,
        "lastPrice": 3950.50,
        "change": 10.50,
        "marketValue": 395050
      }
    ],
    "totalValue": 525000,
    "gainLoss": 25000,
    "timestamp": "2026-04-12T15:30:00Z"
  }
}
```

**Frontend Tips:**
- Show real-time portfolio value updates
- Animate value changes
- Maintain live P&L calculation

### 4. `alert-triggered` - Price Alert Notifications

**Type:** `WebSocket` | **Auth Required:** ✅ Yes

**Purpose:** Notify when price alert conditions are met

**Event Data:**
```json
{
  "event": "alert-triggered",
  "data": {
    "alertId": "alert-uuid-1",
    "symbol": "TCS",
    "condition": "above",
    "targetPrice": 4000,
    "currentPrice": 4005,
    "timestamp": "2026-04-12T14:30:00Z"
  }
}
```

**Frontend Tips:**
- Show toast notification
- Play sound alert (optional)
- Add to notification center
- Allow quick navigate to stock page

---

## Frontend Integration Best Practices

### 1. API Client Setup

```typescript
// lib/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api/v1';

class APIClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    // Load from secure storage
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Try to refresh token
      await this.refreshAccessToken();
      return this.request(endpoint, options); // Retry
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    this.accessToken = data.data.accessToken;
    this.refreshToken = data.data.refreshToken;
    this.saveTokens();
  }

  private saveTokens() {
    localStorage.setItem('accessToken', this.accessToken!);
    localStorage.setItem('refreshToken', this.refreshToken!);
  }
}

export const apiClient = new APIClient();
```

### 2. React Query/SWR Integration

```typescript
// hooks/useStocks.ts
import { useQuery } from '@tanstack/react-query';

export const useStockSearch = (query: string) => {
  return useQuery({
    queryKey: ['stocks', 'search', query],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/stocks/search?query=${query}`
      );
      return response.json();
    },
    enabled: query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useStockQuote = (symbol: string) => {
  return useQuery({
    queryKey: ['stocks', symbol, 'quote'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/quote`);
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 0, // No cache
  });
};

export const useMarketOverview = () => {
  return useQuery({
    queryKey: ['market', 'overview'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/market/overview`);
      return response.json();
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 30 * 1000,
  });
};
```

### 3. WebSocket Hook

```typescript
// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (symbols: string[]) => {
  const [ticks, setTicks] = useState({});

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000');

    socket.on('connect', () => {
      socket.emit('subscribe', { symbols });
    });

    socket.on('live-tick', (data) => {
      setTicks(prev => ({
        ...prev,
        [data.symbol]: data
      }));
    });

    return () => {
      socket.emit('unsubscribe', { symbols });
      socket.disconnect();
    };
  }, [symbols]);

  return ticks;
};
```

### 4. Error Handling

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  }

  if (error.response?.status === 429) {
    // Rate limited - show message
    console.error('Rate limited. Please wait before trying again.');
  }

  if (error.response?.status >= 500) {
    // Server error
    console.error('Server error. Please try again later.');
  }

  return {
    message: error.response?.data?.error?.message || 'An error occurred',
    code: error.response?.data?.error?.code,
  };
};
```

---

## Modern 2026 UI Patterns

### 1. Glassmorphism Cards

```typescript
// components/StockCard.tsx
export const StockCard = ({ stock }) => {
  return (
    <div className="
      bg-white/10
      backdrop-blur-xl
      rounded-2xl
      border border-white/20
      p-6
      hover:bg-white/15
      transition-all duration-300
      shadow-xl
    ">
      {/* Content */}
    </div>
  );
};
```

### 2. Smooth Animations

```typescript
// components/PriceChange.tsx
import { motion } from 'framer-motion';

export const PriceChange = ({ price, change }) => {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.5 }}
      className={change > 0 ? 'text-green-500' : 'text-red-500'}
    >
      {price}
      <span className="ml-2">{change > 0 ? '📈' : '📉'}</span>
    </motion.div>
  );
};
```

### 3. Gradient Backgrounds

```typescript
// components/HeroSection.tsx
export const HeroSection = () => {
  return (
    <div className="
      bg-gradient-to-br
      from-blue-500/20
      via-purple-500/20
      to-pink-500/20
      backdrop-blur-lg
      rounded-3xl
      p-12
    ">
      {/* Content */}
    </div>
  );
};
```

### 4. Real-Time Price Updates

```typescript
// components/LivePrice.tsx
import { useWebSocket } from '@/hooks/useWebSocket';
import { motion } from 'framer-motion';

export const LivePrice = ({ symbol }) => {
  const ticks = useWebSocket([symbol]);
  const tick = ticks[symbol];

  return (
    <motion.div
      animate={{
        color: tick?.change > 0 ? '#10b981' : '#ef4444',
      }}
      transition={{ duration: 0.3 }}
    >
      ₹{tick?.price?.toFixed(2)}
      <span className={tick?.change > 0 ? 'text-green-500' : 'text-red-500'}>
        ({tick?.changePercent?.toFixed(2)}%)
      </span>
    </motion.div>
  );
};
```

---

## Component & Library Recommendations

### Essential Libraries (2026 Stack)

```json
{
  "dependencies": {
    "next": "^15.4.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.4.17",
    "@tanstack/react-query": "^5.28.0",
    "socket.io-client": "^4.8.3",
    "framer-motion": "^10.16.4",
    "recharts": "^2.12.4",
    "@radix-ui/react-*": "*",
    "zustand": "^4.5.0",
    "axios": "^1.6.8"
  }
}
```

### Component Library Choices

#### For Stock List/Table
- **shadcn/ui Table** + **Recharts** for charts
- Or **TanStack Table** (React Table) for advanced features

#### For Charts
- **Recharts** (Recommended for beginners)
- **Chart.js** (More features)
- **TradingView Lightweight Charts** (For financial charts)

#### For Real-Time Updates
- **Socket.io** (Already in stack)
- **Framer Motion** for smooth transitions

#### For Forms
- **React Hook Form** + **Zod/Yup** validation
- **shadcn/ui** form components

#### For State Management
- **Zustand** (Lightweight)
- **TanStack Query** (Server state management)
- **Context API** (For small features)

### Recommended Component Architecture

```
components/
├── common/                 # Reusable components
│   ├── Card.tsx           # Glassmorphic card
│   ├── Badge.tsx          # Status badges
│   ├── Spinner.tsx        # Loading spinner
│   └── ErrorBoundary.tsx  # Error handling
├── stocks/
│   ├── StockCard.tsx      # Individual stock card
│   ├── StockList.tsx      # List of stocks
│   ├── StockTable.tsx     # Detailed table view
│   ├── PriceChart.tsx     # Stock price chart
│   └── TechnicalAnalysis.tsx
├── market/
│   ├── MarketOverview.tsx
│   ├── IndexCard.tsx
│   ├── SectorHeatmap.tsx
│   └── BreadthChart.tsx
├── portfolio/
│   ├── PortfolioCard.tsx
│   ├── HoldingsTable.tsx
│   ├── PerformanceChart.tsx
│   └── AllocationPie.tsx
└── shared/
    ├── Navbar.tsx
    ├── Sidebar.tsx
    ├── Footer.tsx
    └── ThemeToggle.tsx
```

---

## Error Handling

### Global Error Handler

```typescript
// lib/errorHandler.ts
export enum ApiErrorCode {
  UNAUTHORIZED = 'ERR_UNAUTHORIZED',
  FORBIDDEN = 'ERR_FORBIDDEN',
  NOT_FOUND = 'ERR_NOT_FOUND',
  RATE_LIMITED = 'ERR_RATE_LIMITED',
  SERVER_ERROR = 'ERR_SERVER_ERROR',
  VALIDATION_ERROR = 'ERR_VALIDATION_ERROR',
}

interface ApiError {
  message: string;
  code: ApiErrorCode;
  statusCode: number;
  details?: any;
}

export const parseApiError = (error: any): ApiError => {
  const defaultError: ApiError = {
    message: 'Something went wrong. Please try again.',
    code: ApiErrorCode.SERVER_ERROR,
    statusCode: 500,
  };

  if (!error.response) {
    return defaultError;
  }

  const { status, data } = error.response;

  return {
    message: data?.error?.message || defaultError.message,
    code: data?.error?.code || defaultError.code,
    statusCode: status,
    details: data?.error?.details,
  };
};
```

### Toast Notifications

```typescript
// Show success
toast.success('Portfolio created successfully!');

// Show error
toast.error('Failed to update profile. Please try again.');

// Show loading
const { dismiss } = toast.loading('Fetching data...');
// Later: dismiss();
```

---

## Caching Strategy

### Query Cache Durations

- **Real-time data (quotes, ticks):** No cache / 0s
- **Market overview:** 30 seconds
- **Stock profile:** 30 seconds
- **Technical analysis:** 60 seconds
- **Fundamental data:** 3600 seconds (1 hour)
- **Historical data:** 3600 seconds
- **Sector heatmap:** 60 seconds
- **News:** 300 seconds (5 minutes)
- **Fear & Greed:** 3600 seconds

### Cache Invalidation

```typescript
// When prices update
queryClient.invalidateQueries({ queryKey: ['stocks', symbol, 'quote'] });

// When portfolio changes
queryClient.invalidateQueries({ queryKey: ['portfolios'] });
queryClient.invalidateQueries({ queryKey: ['market', 'overview'] });

// Manual cache clear
queryClient.clear();
```

---

## Summary Table: All APIs at a Glance

| Module | Endpoint | Method | Auth | Cache | Purpose |
|--------|----------|--------|------|-------|---------|
| Auth | `/signup` | POST | ❌ | - | Register user |
| Auth | `/login` | POST | ❌ | - | Login user |
| Auth | `/profile` | GET | ✅ | - | Get profile |
| Stocks | `/search` | GET | ❌ | 30s | Search stocks |
| Stocks | `/{symbol}` | GET | ❌ | 30s | Get profile |
| Stocks | `/{symbol}/quote` | GET | ❌ | 0s | Get price |
| Stocks | `/{symbol}/technical` | GET | ❌ | 60s | Tech analysis |
| Market | `/overview` | GET | ❌ | 30s | Market status |
| Market | `/sector-heatmap` | GET | ❌ | 60s | Sectors |
| Portfolio | `/` | GET | ✅ | - | List portfolios |
| Portfolio | `/{id}/holdings` | GET | ✅ | - | Holdings |
| Watchlist | `/` | GET | ✅ | - | Get watchlists |
| News | `/` | GET | ❌ | 300s | News feed |
| IPO | `/calendar` | GET | ❌ | 3600s | IPO list |
| Institutional | `/fii-dii` | GET | ❌ | 3600s | FII/DII data |

---

## Next Steps for Frontend Team

1. **Setup:** Initialize Next.js project with TypeScript
2. **Auth:** Implement login/signup flows
3. **Market:** Build market overview page with indices
4. **Stocks:** Create stock search and detail pages
5. **Portfolio:** Build portfolio management features
6. **Real-time:** Integrate WebSocket for live prices
7. **Notifications:** Setup push notifications
8. **Testing:** Add unit and integration tests
9. **Performance:** Optimize with lazy loading, code splitting
10. **Deploy:** Setup CI/CD and deploy to production

---

**Document Version:** 1.0  
**Last Updated:** April 12, 2026  
**Maintainer:** Backend Team  
**Questions?** Check `/api/health` for API status
