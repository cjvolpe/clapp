# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Production Deployment

The backend is built with Fastify and includes rate limiting, health checks, and clustering support via PM2.

### Environment Variables

The following environment variables are required:

- `FRONTEND_URL` — URL of the frontend (e.g., `https://clapp.example.com`)
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_KEY` — your Supabase service role or anon key

Create a `.env.production` file in the `backend/` directory:
```bash
cd backend
cp .env.example .env.production  # if an example exists
```

Then edit `.env.production` with your values.

### Running with PM2 (Cluster Mode)

In production, use PM2 to run the backend in cluster mode, leveraging all available CPU cores:

```bash
cd backend
npm run start:prod
```

This uses `ecosystem.config.js` which configures:
- **Cluster mode** (`exec_mode: 'cluster'`, `instances: 'max'`) — spawns one process per CPU core
- **Auto-restart** on crashes
- **Graceful shutdown** (`kill_timeout: 5000ms`)
- **Memory-based restarts** (`max_memory_restart: '300M'`)

To monitor the processes:
```bash
pm2 status
pm2 logs clapp-backend
pm2 restart clapp-backend
```

To stop and remove from PM2:
```bash
pm2 stop clapp-backend
pm2 delete clapp-backend
```

### Rate Limiting

The API implements rate limiting to protect against abuse:

- **Global limit**: 100 requests per minute per IP (applies to all routes)
- **Per-route limits**: 60 requests per minute for specific data-intensive endpoints (see [API Reference](./docs/API.md))

Rate limit headers are included in responses:
- `x-ratelimit-limit` — maximum requests allowed
- `x-ratelimit-remaining` — remaining requests in the window
- `x-ratelimit-reset` — seconds until the window resets
- `retry-after` — how many seconds to wait before retrying (when limit exceeded)

### Health Check Endpoint

The `/health` endpoint reports backend and Supabase connectivity status:

```http
GET /health
```

Success response (200):
```json
{
  "status": "ok",
  "supabase": "connected"
}
```

Failure response (503):
```json
{
  "status": "error",
  "supabase": "disconnected"
}
```

This endpoint is excluded from rate limiting and is intended for load balancer or monitoring probes.

### Reverse Proxy (nginx)

For additional security and performance, place nginx (or another reverse proxy) in front of the Node.js processes.

Example nginx configuration:

```nginx
upstream clapp_backend {
    server 127.0.0.1:8000;  # PM2 cluster listens on the same port; kernel load-balances
    # If running multiple instances on different ports, list them all
    # server 127.0.0.1:8001;
    # server 127.0.0.1:8002;
}

server {
    listen 80;
    server_name clapp.example.com;

    # Redirect HTTP to HTTPS (recommended)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clapp.example.com;

    ssl_certificate /etc/letsencrypt/live/clapp.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clapp.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://clapp_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (can be used by load balancer)
    location /health {
        proxy_pass http://clapp_backend/health;
        access_log off;  # Optional: disable logging for health checks
    }
}
```

Benefits of using nginx:
- TLS termination
- Static file serving (frontend build)
- Request buffering and compression
- IP-based access control
- Rate limiting at the proxy layer (optional)

### Systemd Service (Alternative to PM2)

If you prefer systemd over PM2, create `/etc/systemd/system/clapp-backend.service`:

```ini
[Unit]
Description=Clapp Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/clapp/backend
Environment=NODE_ENV=production
EnvironmentFile=/home/ubuntu/clapp/backend/.env.production
ExecStart=/usr/bin/node ./src/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=clapp-backend

# Security options
NoNewPrivileges=yes
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable clapp-backend
sudo systemctl start clapp-backend
sudo systemctl status clapp-backend
```
