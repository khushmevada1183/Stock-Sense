# API Key Rotation System

This system provides automatic rotation of API keys when one hits its rate limit or monthly quota, ensuring continuous operation of the stock analyzer application. It allows you to add multiple API keys that will be used in rotation.

## Features

- **Automatic Rotation**: When an API key hits its rate limit (HTTP 429 response) or monthly quota, the system automatically switches to the next available key.
- **API Key Management**: Add, remove, and list API keys through a REST API or command-line interface.
- **Status Tracking**: The system tracks which keys have hit limits and when they'll become available again.
- **Quota Monitoring**: Tracks monthly usage for each key to avoid exceeding the 500 requests/month quota.
- **Fallback Mechanism**: If all keys hit their limits, the system provides clear error messages.

## Rate Limits & Quotas

The system is configured for the following API limits:
- **Monthly Quota**: 500 requests per month per API key
- **Rate Limit**: 1 request per second per API key

When a key hits either of these limits, the system automatically rotates to the next available key.

## How It Works

1. **Key Storage**: API keys are stored in a JSON configuration file with their status.
2. **Rate Limit Detection**: When a request returns a 429 status code, the current key is marked as unavailable for 1 second.
3. **Monthly Quota Tracking**: Each key's monthly usage is tracked and reset at the beginning of each month.
4. **Automatic Switching**: The system automatically switches to the next available key that hasn't exceeded its quotas.
5. **Cooldown Tracking**: Each key has a cooldown period after which it becomes available again for rate limits.

## Setup

1. Ensure your backend server is running.
2. Make the CLI script executable:
   ```bash
   chmod +x api-key-manager.sh
   ```

## Usage

### Using the Command-Line Interface

The `api-key-manager.sh` script provides a simple interface for managing API keys:

#### List all API keys

```bash
./api-key-manager.sh list
```

This will display all keys with their current status, including:
- Whether they are available or rate-limited
- Current usage count
- Monthly usage and remaining quota
- Whether the key is currently active

#### Add a new API key

```bash
./api-key-manager.sh add YOUR_API_KEY_HERE
```

#### Remove an API key

```bash
./api-key-manager.sh remove YOUR_API_KEY_HERE
```

#### Manually rotate to the next available key

```bash
./api-key-manager.sh rotate
```

#### Get help

```bash
./api-key-manager.sh help
```

### Using the REST API

You can also manage API keys programmatically using the REST API:

#### List all API keys

```
GET http://localhost:5002/api/keys
```

Header:
```
x-admin-password: admin123
```

#### Add a new API key

```
POST http://localhost:5002/api/keys
```

Headers:
```
Content-Type: application/json
x-admin-password: admin123
```

Body:
```json
{
  "apiKey": "YOUR_API_KEY_HERE"
}
```

#### Remove an API key

```
DELETE http://localhost:5002/api/keys
```

Headers:
```
Content-Type: application/json
x-admin-password: admin123
```

Body:
```json
{
  "apiKey": "YOUR_API_KEY_HERE"
}
```

#### Manually rotate to the next available key

```
POST http://localhost:5002/api/keys/rotate
```

Header:
```
x-admin-password: admin123
```

## Security

By default, the API key management routes are protected with a simple password-based authentication system using the `x-admin-password` header. The default password is `admin123`.

For production use, set a strong password using the `ADMIN_PASSWORD` environment variable:

```bash
export ADMIN_PASSWORD="your-strong-password-here"
```

## Configuration

API keys are stored in the `backend/config/api-keys.json` file. This file is created automatically when the server starts if it doesn't exist.

## Adding Multiple API Keys

To maximize API availability, it's recommended to add multiple API keys from different accounts. Keys will be used in rotation to:
1. Avoid hitting the 1 request/second rate limit
2. Extend your total monthly quota (500 requests per key)

For example, with 3 API keys, you can make up to 1,500 requests per month.

## Best Practices

1. **Monitor Key Usage**: Use the list command to monitor key usage and monthly quotas.
2. **Regular Update**: Update your API keys periodically for security.
3. **Set Strong Password**: Change the default admin password for the key management API.
4. **Distribute Load**: For heavy usage, consider having at least 3-5 API keys in rotation to maximize your monthly quota.
5. **Implement Caching**: Whenever possible, cache API responses to reduce the number of requests made.
6. **Plan for Month-End**: Be aware of potential service disruptions at the end of the month if all keys approach their monthly quotas. 