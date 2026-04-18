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
- **Runtime injection** — API keys are loaded at runtime from secure environment variables, not embedded in code or configuration files
- **Separation of concerns** — Frontend never has knowledge of or access to authentication credentials

### 3. CORS Configuration

- **Restricted origins** — Only specified domains can access the API via browser-based requests
- **Environment-based** — CORS origins are configured via environment variables, not hardcoded
- **Production-specific** — Different origin whitelists for development, staging, and production environments
- **Preflight handling** — Browser sends preflight requests which are validated against the whitelist before actual requests are processed
- **Credential separation** — CORS policies ensure sensitive operations cannot be triggered from unauthorized domains

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

- **HTML entity encoding** — All potentially harmful HTML characters are converted to their safe entity representations before rendering
- **Content sanitization** — LLM responses undergo validation and transformation to remove or neutralize any executable code patterns
- **Safe parsing models** — JSON responses are parsed as data structures, never evaluated as executable code
- **Markdown safety** — Markdown rendering uses only a safe subset of formatting rules, excluding raw HTML passthrough
- **Defense against XSS** — These measures prevent Cross-Site Scripting attacks even if user input somehow contains malicious content

### 6. HTTPS Only

- **Transport encryption** — All traffic is encrypted end-to-end using TLS/SSL protocols
- **Automatic redirection** — Plain HTTP requests are automatically redirected to encrypted HTTPS connections
- **HSTS enforcement** — Strict Transport Security headers inform browsers to always use encrypted connections for this domain, preventing downgrade attacks
- **Certificate validation** — SSL/TLS certificates are validated to ensure communication is with the legitimate server, not an impostor
- **Forward secrecy** — Perfect Forward Secrecy (PFS) ensures that session encryption keys cannot be compromised even if long-term keys are breached

### 7. Error Handling

- **Information hiding** — Error messages returned to users are intentionally vague and never expose internal system details, API keys, file paths, or database structure
- **Server-side logging** — Detailed error information is logged on the backend for debugging and monitoring purposes, but not transmitted to the client
- **Generic user feedback** — Users receive helpful but non-technical error messages that guide them to retry or seek support without revealing vulnerabilities
- **Graceful degradation** — System errors are handled without crashing the application or exposing stack traces to the client
- **Audit trails** — All errors are logged with context (user, timestamp, action) for security investigation and compliance purposes

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
