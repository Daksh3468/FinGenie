# Security Policy

## Overview

FinGenie is designed with security and privacy as core principles. This document outlines our security practices and responsible disclosure policy.

## Key Security Principles

### 1. No Persistent Data Storage

- **File uploads are not saved** — Documents are processed in memory and discarded immediately
- **No user accounts or databases** — No personal data collection or storage
- **Session data is ephemeral** — Conversation history exists only during the user's session
- **Zero-knowledge architecture** — FinGenie never retains your financial documents

### 2. API Key Security

- **Environment-only** — API keys are never transmitted from frontend to backend
- **Backend-only access** — Only the backend makes calls to Groq API
- **No client-side keys** — Frontend has no direct access to Groq API
- **Use environment variables** — Always load keys from `.env`, never hardcode

```python
# ✅ CORRECT
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ❌ WRONG
GROQ_API_KEY = "gsk_..."  # Never hardcode!
```

### 3. CORS Configuration

- **Restricted origins** — Only specified domains can access the API
- **Environment-based** — CORS origins are configured via `ALLOWED_ORIGINS` env var
- **Production-only** — Different origins for staging vs production

```env
# Development
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Production
ALLOWED_ORIGINS=https://app.fingenie.com,https://staging.fingenie.com
```

### 4. Input Validation

All user inputs are validated with Pydantic schemas:

| Input | Max Size | Validation |
|-------|----------|-----------|
| File Upload | 200MB | Magic signature verification, file type checking |
| Chat Message | 500 chars | Min length 1, max length 500 |
| User Session ID | 100 chars | Alphanumeric + dashes/underscores only |
| Conversation History | 20 messages | Limits token budget for LLM |
| Report Data | 1000 rows | Prevents memory exhaustion |

### 5. Output Escaping

- **HTML escaping** — All HTML tags are escaped before rendering in frontend
- **JSON parsing** — LLM responses are parsed as JSON, not evaluated as code
- **No dangerous patterns** — Markdown is rendered safely without raw HTML

```javascript
// ✅ CORRECT - Escaped HTML
function escapeHtml(text) {
  const map = { '<': '&lt;', '>': '&gt;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ❌ WRONG - Dangerous
innerHTML = userInput;  // Can enable XSS attacks
```

### 6. HTTPS Only

- **Production requirement** — All traffic must be encrypted with TLS/SSL
- **Redirect HTTP** — Redirect http:// to https:// automatically
- **HSTS headers** — Enforce HTTPS policy in browser

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 7. Error Handling

- **No sensitive details in errors** — Error messages don't expose internal paths or API keys
- **Logging for debugging** — Detailed errors logged server-side for investigation
- **User-friendly messages** — Frontend shows helpful, generic error messages

```python
# ✅ CORRECT
raise HTTPException(
    status_code=502,
    detail="Analysis service error. Please try again."
)

# ❌ WRONG
raise HTTPException(
    status_code=502,
    detail=f"Groq API key invalid: {GROQ_API_KEY}"  # Exposes key!
)
```

## API Endpoint Security

### File Upload (`POST /api/upload`)

- Validates file type by magic signature
- Limits upload size to 200MB
- Rejects unsupported file types
- Validates SEC ZIP structure before processing
- Returns 400 errors for invalid files

### Analysis (`POST /api/analyze`)

Currently handled by `/api/upload` as part of single endpoint.

### Chat (`POST /api/chat/message`)

- Validates `session_id` format (alphanumeric + dash/underscore)
- Limits message to 500 chars
- Limits conversation history to 20 messages
- Validates all input fields with Pydantic
- Returns 400 errors for invalid requests

### Report Generation (`POST /api/report/generate`)

- Validates `format_id` against allowed formats
- Limits data payload to 1000 rows
- Validates all schema bounds
- Returns 400 errors for invalid requests

## Deployment Security Checklist

Before deploying to production:

- [ ] GROQ_API_KEY is set in environment, not in code
- [ ] ALLOWED_ORIGINS is restricted to your domain(s)
- [ ] HTTPS is enabled with valid SSL certificate
- [ ] HTTP redirects to HTTPS
- [ ] HSTS headers are configured
- [ ] CSP headers are set to prevent XSS
- [ ] All input validation is enabled
- [ ] Error logging is configured
- [ ] Monitoring and alerting is set up
- [ ] Rate limiting is enabled (recommended)
- [ ] Firewall rules allow backend-to-Groq connections only
- [ ] Secrets are in env vars, not in git
- [ ] `.env` is in `.gitignore`

## Responsible Disclosure

If you discover a security vulnerability, **please do not open a public issue**. Instead:

1. **Email security@fingenie.com** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

2. **Do not:**
   - Publicly disclose the vulnerability
   - Exploit the vulnerability for anything other than testing
   - Share details with others before we've patched

3. **We will:**
   - Acknowledge receipt within 24 hours
   - Provide a timeline for patches
   - Credit you in release notes (optional)

## Known Limitations

### Not Recommended for:

- **Highly sensitive data** — Not recommended for trade secrets or extremely confidential documents
- **Regulated industries** — Verify compliance with HIPAA, SOX, GDPR, etc. before use
- **PII extraction** — Don't use to process documents containing personal information
- **Production financial decisions** — Use FinGenie as a tool to inform decisions, not as the sole decision-maker

### Requires:

- **User responsibility** — Users must ensure their documents are appropriate for analysis
- **Trust in Groq** — We use Groq's LLM service, which has its own privacy policy
- **Trust in infrastructure** — Assumes AWS/cloud provider security is adequate

## Privacy Policy

### What We Collect

- **Uploaded documents** — Processed in memory, never stored
- **API usage metrics** — Request count, file types, processing times (for analytics)
- **Error logs** — For debugging purposes only

### What We Never Collect

- Personally Identifiable Information (PII)
- Financial account numbers or credentials
- Email addresses or contact information
- Browsing history or behavioral data
- Cookies or tracking pixels

### Data Retention

- **Files** — Deleted immediately after processing
- **Logs** — Retained for 30 days for debugging
- **Analytics** — Aggregated and anonymized, never tied to individuals

## Compliance

FinGenie aims to comply with:

- **GDPR** — Right to deletion, data portability, transparent processing
- **CCPA** — California Consumer Privacy Act requirements
- **SOC 2** — If hosting on AWS/equivalent, inherits SOC 2 compliance
- **HIPAA** — Not covered; don't use for protected health information
- **PCI-DSS** — Not a payment processor; doesn't handle credit cards

For your organization's compliance requirements, consult your security team and the terms of service.

## Security Updates

- **Follow releases** — Watch this repository for security patches
- **Update regularly** — Re-deploy when patches are released
- **Monitor dependencies** — Use `npm audit` and `pip audit` regularly

## Contact

**Security questions or reports:**
- Email: security@fingenie.com
- GPG key: Available on request

**General support:**
- GitHub Issues: For non-security questions
- GitHub Discussions: For feature requests and feedback

---

**Last Updated**: April 18, 2026  
**Version**: 1.0
