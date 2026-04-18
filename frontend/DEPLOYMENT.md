# Frontend Deployment Guide

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running at a known URL
- Vite build tooling (included in package.json)

## Environment Setup

### 1. Create `.env` file

Copy from `.env.example`:

```bash
cp .env.example .env
```

Configure the backend API URL:

```env
# Local development
VITE_API_BASE_URL=http://localhost:8000

# Production
# VITE_API_BASE_URL=https://api.fingenie.com
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run Local Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

## Production Build

### 1. Build the Project

```bash
npm run build
```

This generates a `dist/` folder with optimized production-ready files.

### 2. Preview the Build Locally

```bash
npm run preview
```

### 3. Deploy the `dist/` Folder

Deploy the `dist` folder contents to your web host:

#### Using Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### Using Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

#### Using AWS S3 + CloudFront

```bash
aws s3 sync dist/ s3://your-bucket-name/
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

#### Using GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"deploy": "npm run build && gh-pages -d dist"

npm run deploy
```

#### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t fingenie-frontend .
docker run -p 3000:80 fingenie-frontend
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Backend API base URL (without `/api`) |

## Build Configuration

### Vite Config

Edit `vite.config.js` to customize:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,  // Set to true for debugging production
    minify: 'terser',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

## Security Best Practices

1. **No API Keys in Frontend**: API keys should ONLY be on the backend
2. **CORS Configuration**: Ensure backend ALLOWED_ORIGINS includes your frontend domain
3. **HTTPS**: Always use HTTPS in production
4. **Content Security Policy**: Add headers to prevent XSS:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
   ```
5. **HTML Sanitization**: All user input from LLM is escaped before rendering

## Performance Optimization

### 1. Enable Gzip Compression

Add to nginx config or web server:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. Enable Browser Caching

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### 3. Use CDN for Static Assets

```javascript
// In vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[hash][extname]'
      }
    }
  }
})
```

## Monitoring

### Track These Metrics

1. **Page Load Time** — Aim for < 2 seconds
2. **Time to Interactive (TTI)** — Aim for < 3 seconds
3. **API Response Times** — Monitor `/api/health` endpoint
4. **Error Rate** — Track failed uploads, LLM errors
5. **File Upload Success Rate** — Should be > 95%

### Tools

- Google Analytics
- Sentry (error tracking)
- Datadog (APM)
- CloudWatch (AWS)

## Troubleshooting

### API Connection Refused

```
Error: Network error — check backend is running
```

Check:
1. Backend is running at `VITE_API_BASE_URL`
2. Firewall allows connection to backend
3. CORS headers are properly configured

### Blank Page on Load

1. Check browser console for JavaScript errors
2. Verify `dist/` folder exists and contains `index.html`
3. Check server is serving `index.html` for all routes (SPA routing)

### nginx SPA Routing

Add to nginx config:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Vite Build Errors

```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Testing

```bash
# Run component tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Version Updates

### Update React/Dependencies

```bash
npm update
# or selective update
npm update react react-dom
```

### Check for Vulnerabilities

```bash
npm audit
npm audit fix
```

## Staging vs Production

### Environment-Specific Builds

Create `.env.staging` and `.env.production`:

```bash
# Build for staging
VITE_API_BASE_URL=https://staging-api.fingenie.com npm run build

# Build for production
VITE_API_BASE_URL=https://api.fingenie.com npm run build
```

## Support

For issues, check:
- Vite documentation: https://vitejs.dev
- React documentation: https://react.dev
- Backend API docs: Available at `/docs` on your backend
