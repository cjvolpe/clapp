# API Reference

This document describes all available API endpoints, their methods, rate limits, and expected responses.

## Base URL

```
http(s)://<your-domain>/api
```

(If your backend is served directly, endpoints are at the root `/`.)

## Endpoints

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `GET` | `/` | 100/min (global) | Health check / welcome endpoint. Returns `{ "hello": "world" }`. |
| `GET` | `/health` | Unlimited | Returns backend and Supabase connectivity status. |
| `GET` | `/featured` | 60/min | Get featured climbs set in the last 14 days. |
| `GET` | `/climbs` | 60/min | Get all non-archived climbs. |
| `GET` | `/climbs/logged/:uuid` | 60/min | Get climbs logged by a specific user (identified by UUID). |
| `POST` | `/climbs/new` | 60/min | Create a new climb. |
| `PATCH` | `/climbs/archive/:id` | 60/min | Archive (soft-delete) a climb by ID. |
| `POST` | `/climbs/search/filter` | 60/min | Search and filter climbs by difficulty, type, color, gym, date range, and archived status. |
| `POST` | `/climbs/log` | 60/min | Log a climb completion for a user. |

## Rate Limits

- **Global default**: 100 requests per minute per IP address (unless overridden per-route).
- **Route-specific**: Most data endpoints are limited to 60 requests per minute to ensure fair usage and database stability.

When a limit is exceeded, the API responds with:

- Status: `429 Too Many Requests`
- Headers:
  - `retry-after: <seconds>`
  - `x-ratelimit-limit: <limit>`
  - `x-ratelimit-remaining: 0`
  - `x-ratelimit-reset: <unix-timestamp>`

### Rate Limit Headers (on successful requests)

Every response includes rate limit headers:

| Header | Description |
|--------|-------------|
| `x-ratelimit-limit` | Maximum requests allowed in the current time window. |
| `x-ratelimit-remaining` | Number of requests remaining before hitting the limit. |
| `x-ratelimit-reset` | Unix timestamp (seconds) when the rate limit window resets. |
| `retry-after` | (Only on 429) Seconds to wait before retrying the request. |

## Responses

All endpoints (except `/health`) return JSON wrapped in a standard envelope:

Success (200):
```json
{
  "success": true,
  "data": { ... }  // or [ ... ] depending on endpoint
}
```

Error (4xx/5xx):
```json
{
  "success": false,
  "error": "Error message",
  "message": "Error message"
}
```

The `/health` endpoint returns:

Success (200):
```json
{
  "status": "ok",
  "supabase": "connected"
}
```

Service unavailable (503):
```json
{
  "status": "error",
  "supabase": "disconnected"
}
```

## Example Requests

### Get all climbs

```http
GET /climbs
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "V0 - Crimp City",
      "difficulty": "V0",
      "type": "Boulder",
      "color": "Red",
      "setter": "Alice",
      "date_set": "2026-04-20",
      "gym": "Downtown",
      "archived": false
    }
  ]
}
```

### Create a new climb

```http
POST /climbs/new
Content-Type: application/json

{
  "name": "V2 - Sloper Party",
  "difficulty": "V2",
  "type": "Boulder",
  "color": "Blue",
  "setter": "Bob",
  "dateSet": "2026-04-25",
  "gym": "Uptown"
}
```

### Search/filter climbs

```http
POST /climbs/search/filter
Content-Type: application/json

{
  "lowerDifficulty": "V2",
  "upperDifficulty": "V5",
  "type": "Boulder",
  "color": "Any",
  "startDate": "2026-01-01",
  "endDate": "",
  "gym": "Any",
  "archived": null
}
```

## Authentication

Currently, the API does not enforce authentication. Future versions may include API keys or JWT-based auth.
