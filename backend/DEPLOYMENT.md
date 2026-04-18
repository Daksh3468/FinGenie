# Backend Deployment Guide

## Prerequisites

- Python 3.9+
- pip or conda for package management
- Groq API key (from https://console.groq.com)

## Environment Setup

### 1. Create `.env` file

Copy from `.env.example`:

```bash
cp .env.example .env
```

Then update with your actual API keys:

```env
# Required
GROQ_API_KEY=gsk_your_api_key_here

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Production example:
# ALLOWED_ORIGINS=https://app.fingenie.com,https://staging.fingenie.com
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Local Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs` (Swagger UI)
- Alternative docs: `http://localhost:8000/redoc` (ReDoc)

## Production Deployment

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t fingenie-api .
docker run -e GROQ_API_KEY=$GROQ_API_KEY -e ALLOWED_ORIGINS=https://yourdomain.com -p 8000:8000 fingenie-api
```

### Using Gunicorn (recommended for production)

```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using systemd (Linux)

Create `/etc/systemd/system/fingenie.service`:

```ini
[Unit]
Description=FinGenie API
After=network.target

[Service]
Type=notify
User=fingenie
WorkingDirectory=/opt/fingenie
Environment="PATH=/opt/fingenie/venv/bin"
ExecStart=/opt/fingenie/venv/bin/gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl start fingenie
sudo systemctl enable fingenie
```

## Health Check

```bash
curl http://localhost:8000/api/health
```

Should return:

```json
{
  "status": "ok",
  "message": "FinGenie API is running"
}
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ Yes | - | API key from Groq console |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated CORS origins |

## Logging

Logs are printed to stdout in JSON format by default. For production, use a log aggregator like:
- CloudWatch (AWS)
- Stackdriver (GCP)
- ELK Stack (on-premises)

## API Rate Limiting

Currently no rate limiting is enforced. For production, add:
- FastAPI Limiter
- nginx rate limiting
- Cloud provider rate limiting (AWS API Gateway, etc.)

## Security Considerations

1. **API Keys**: Always use environment variables, never commit keys
2. **CORS**: Restrict to your frontend domains only
3. **HTTPS**: Always use HTTPS in production
4. **File Upload**: Max size is 200MB, validate file types on upload
5. **Input Validation**: All endpoints validate request bodies with Pydantic

## Monitoring & Alerts

Monitor these endpoints:
- `/api/health` — Application health
- Groq API error rates and latencies
- File upload success/failure rates
- LLM response times

## Troubleshooting

### 502 Bad Gateway / Groq API Errors

```
Detail: "Groq API error: ..."
```

Check:
1. GROQ_API_KEY is valid and not expired
2. Groq service status at https://status.groq.com
3. Network connectivity to api.groq.com

### 504 Gateway Timeout

The LLM took too long to respond. User should:
1. Try with a smaller/simpler document
2. Reduce token budget for the specific endpoint
3. Try again later (Groq might be overloaded)

### CORS Errors

Check that frontend origin is in `ALLOWED_ORIGINS`:

```bash
curl -H "Origin: https://app.example.com" http://localhost:8000/api/health -v
```

If you see `Access-Control-Allow-Origin` header, CORS is properly configured.

## Updating Dependencies

```bash
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt  # Update lock file
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=services --cov=routers

# Run specific test file
pytest tests/test_parser.py -v
```

## Support

For issues, check:
- [Groq API Docs](https://console.groq.com/docs)
- FinGenie GitHub Issues
- Backend logs with `grep ERROR` for errors
