import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10, // Virtual users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
  },
};

export default function() {
  // Health check endpoint test
  const healthRes = http.get('http://localhost:5002/api/health');
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check has correct status': (r) => r.json().status === 'ok',
  });
  
  // Stock data endpoint test
  const stockSymbol = 'RELIANCE';
  const stockRes = http.get(`http://localhost:5002/api/stocks/${stockSymbol}`);
  check(stockRes, {
    'stock data status is 200': (r) => r.status === 200,
    'stock data has correct symbol': (r) => r.json().symbol === stockSymbol,
  });
  
  // Search endpoint test (if available)
  const searchRes = http.get('http://localhost:5002/api/stocks/search?q=rel');
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search returns results': (r) => r.json().length > 0,
  });
  
  sleep(1);
} 