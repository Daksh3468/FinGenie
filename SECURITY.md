# Security Policy

## Overview

Security is a core design principle for FinGenie. This document describes our architecture, security practices, and how we handle vulnerability reports. We take security seriously and continuously improve our defenses based on threat modeling and best practices.

**Important**: This is an early-stage project. While we implement industry-standard security controls, we recommend security review before use with highly sensitive data. See [Limitations](#limitations) for details.

## Core Security Architecture

### 1. Ephemeral Data Processing

FinGenie is designed with a "process-and-purge" architecture where all financial documents are handled transiently:

- **No persistent storage** — Uploaded files exist only in memory during processing; they are discarded immediately after analysis completes
- **No user accounts or databases** — We don't maintain user profiles, authentication systems, or databases of personal information
- **Session-only state** — Conversation history, analysis results, and intermediate data exist only in memory during the user's active session
- **Minimal logging** — We log errors and security events for debugging, but not full request/response content containing user data

This architecture provides inherent privacy protection: even if the system were breached, there would be no stored documents to compromise.

### 2. API Credential Security

Sensitive credentials are protected through environment isolation:

- **Groq API keys stored server-side only** — The Groq API key is loaded at server startup from the environment and never transmitted to the frontend
- **No client-side secrets** — The frontend has zero knowledge of any authentication credentials; it communicates exclusively with the backend API
- **Environment-based configuration** — All credentials are injected via environment variables (`GROQ_API_KEY`, `ALLOWED_ORIGINS`), never hardcoded or version-controlled
- **Secrets rotation ready** — The architecture supports rotating API keys by restarting the service with new environment variables

### 3. Transport Security (HTTPS/TLS)

All network communication is encrypted:

- **TLS 1.2+ required** — Production deployments must enforce TLS 1.2 or higher for all HTTP traffic
- **HSTS enforcement** — The backend sends `Strict-Transport-Security` headers to prevent downgrade attacks and enforce encrypted connections
- **Certificate pinning ready** — Deployments on trusted infrastructure can implement certificate pinning for additional protection
- **CORS-validated origins** — Cross-Origin requests are validated against a configurable whitelist to prevent cross-site attacks

### 4. Input Validation & Sanitization

All user input is validated before processing:

**File Uploads:**
- Magic signature validation (checks actual file bytes, not just extension)
- File type whitelist: `.pdf`, `.xlsx`, `.xls`, `.csv`
- Maximum file size: 200MB
- Malformed file rejection with user-friendly error messages

**Chat & Analysis Input:**
- Session ID format validation (alphanumeric + dashes/underscores only)
- Message length limits (min 1 char, max 500 chars)
- Conversation history limit (max 20 messages to prevent token exhaustion)
- Report data row limits (max 1000 rows to prevent memory exhaustion)
- Pydantic schema validation on all endpoints with strict type checking

**Injection Prevention:**
- LLM responses are parsed as JSON data, never evaluated as code
- All HTML output is entity-encoded before rendering
- Markdown rendering is restricted to safe formatting rules only

### 5. Output Encoding & XSS Prevention

Frontend rendering is protected against injection attacks:

- **HTML entity encoding** — All user-controlled content rendered through the frontend is HTML-entity encoded before insertion into the DOM
- **Content Security Policy ready** — Deployment templates include CSP headers to prevent inline script injection
- **Safe JSON parsing** — LLM responses are validated as JSON structures before use; response bodies are not eval'd or treated as executable code
- **Markdown-safe rendering** — The markdown renderer uses a restrictive whitelist that excludes raw HTML passthrough

### 6. Rate Limiting & Abuse Prevention

The API implements protections against resource exhaustion:

- **Request throttling** — Endpoints have implicit rate limits through resource constraints (file size limits, conversation history limits, row limits)
- **Timeout protection** — LLM API calls timeout after 45 seconds for analysis, 30 seconds for reports, preventing indefinite blocking
- **Concurrent request handling** — Async/await architecture prevents individual slow requests from blocking the server
- **Deployment-level rate limiting** — Production deployments should implement additional rate limiting via reverse proxy (nginx, AWS API Gateway, etc.)

## API Security Details

### File Upload Endpoint (`POST /api/upload`)

**Security Controls:**
- File type validation via magic signature (prevents file spoofing)
- Size limit enforcement (200MB maximum)
- Structural validation of financial tables
- Error messages don't reveal internal paths or system details

**Risk Mitigation:**
- Malicious files are rejected before parsing
- Oversized uploads are rejected before buffering
- Malformed files fail gracefully with user-facing guidance

### Chat Endpoint (`POST /api/chat/message`)

**Security Controls:**
- Session ID format validation (regex: `^[a-zA-Z0-9_\-]{1,100}$`)
- Message length enforcement (min 1, max 500 chars)
- Conversation history limited to 20 messages (prevents token exhaustion)
- Input field bounds checked via Pydantic validation
- All responses returned as JSON with content-type headers

**Risk Mitigation:**
- Invalid session IDs are rejected
- Oversized messages are rejected
- Conversation history prevents DoS through token limits
- Type mismatches caught before processing

### Report Generation Endpoint (`POST /api/report/generate`)

**Security Controls:**
- Format ID validation against whitelist
- Data payload size limits (1000 rows max)
- All schema bounds enforced
- Timeout protection on LLM calls (30 seconds)

**Risk Mitigation:**
- Invalid format requests are rejected early
- Memory exhaustion attacks prevented through row limits
- Slow LLM responses don't block other requests

## Dependency Security

We maintain security awareness across the software supply chain:

- **Dependency tracking** — All dependencies are listed in `requirements.txt` (backend) and `package.json` (frontend)
- **Vulnerability scanning** — We recommend running `pip audit` (Python) and `npm audit` (JavaScript) during development and deployment
- **Regular updates** — Dependencies should be updated regularly; security patches should be applied immediately
- **Minimal dependencies** — We use well-maintained, popular libraries (Groq, FastAPI, React) with good security track records
- **Transitive dependencies** — We're aware that direct dependencies have transitive dependencies; vulnerability scanning tools check the entire tree

**Known Dependency Risks:**
- The Groq API client libraries are maintained by Groq; we depend on their security practices
- LLM outputs are inherently unpredictable; we rely on output sanitization to mitigate risks

## Logging & Monitoring

Operational security depends on observability:

- **Error logging** — All exceptions and failures are logged server-side with timestamp, endpoint, and error type
- **Access logging** — HTTP requests/responses are logged (without sensitive data) for audit trails
- **Log retention** — Error logs are retained for 30 days for debugging; logs are deleted thereafter
- **Structured logging** — Logs use consistent formats to enable alerting and analysis
- **No data logging** — User-uploaded documents and conversation content are never logged
- **Deployment monitoring** — Production deployments should monitor error rates, API latencies, and Groq API health

**Recommended Monitoring:**
- Alert on spike in 400/500 errors (possible attack or configuration issue)
- Alert on file upload failures (possible malicious uploads or system overload)
- Monitor Groq API latency and error rates (third-party dependency health)
- Track LLM response times (performance and potential DoS detection)

## Error Handling

Error responses are designed to be helpful without revealing system internals:

- **User-facing errors are generic** — "Analysis failed. Please try again or contact support." instead of exposing stack traces
- **Server logs contain details** — Backend logs include full error context for debugging
- **No credential exposure** — Error messages never contain API keys, file paths, or internal URLs
- **Graceful degradation** — System failures don't crash the application or expose raw exceptions to clients
- **HTTP status codes are correct** — 400 for client errors, 500 for server errors, 502 for upstream (Groq) failures

## Incident Response

If a security issue is discovered:

1. **Vulnerability is confirmed** and severity assessed
2. **Patch is developed** and tested
3. **Release is published** with clear changelog
4. **Users are notified** via GitHub release notes and security advisories
5. **Post-incident review** identifies root cause and prevents recurrence

For details, see [Responsible Disclosure](#responsible-disclosure).

## Data Processing & Privacy

### What We Process

During normal operation, FinGenie processes:

- **Uploaded financial documents** — PDFs, Excel files, CSV files
- **User messages** — Text input for the chat interface
- **Analysis parameters** — Session IDs, document type indicators, report format selections

### What We Retain

- **Session memory only** — Analysis results and conversation history exist during the user's session only
- **Error logs** — Errors are logged for 30 days for debugging purposes
- **System metrics** — Aggregated request counts and response times (no user data)

### What We Delete

- **Documents immediately** — After analysis completes, uploaded files are discarded and not recovered
- **Session data on logout** — When the user leaves the application, conversation history is cleared
- **Error logs after 30 days** — Old logs are purged automatically
- **Cache entries** — Temporary data is evicted based on memory pressure

### What We Never Collect

- Personally Identifiable Information (names, emails, phone numbers, IP addresses)
- Financial credentials (bank accounts, API keys, passwords)
- Behavioral tracking (cookies, pixel tracking, session tracking across sites)
- User identity (we don't know who uses FinGenie)
- Metadata about documents (file names, document metadata, access patterns)

### Third-Party Data Sharing

- **Groq API** — Document content and user queries are sent to Groq's LLM API; see Groq's privacy policy
- **Deployment infrastructure** — If deployed on AWS/GCP/Azure, those providers may have access to server logs
- **No other sharing** — We don't sell, trade, or share user data with any third parties

## Limitations & Honest Assessment

### Not Recommended For

- **Trade secrets or confidential business data** — Early-stage projects should conduct security review before processing sensitive information
- **Regulated data (HIPAA, PCI, etc.)** — Do not process PHI, PII, or payment card data without additional controls
- **Production financial decisions** — Use FinGenie as a tool to inform decisions, not as the sole basis for investment decisions
- **Compliance-critical workflows** — If you need audit trails or regulatory compliance, conduct a security assessment first

### This Project Is

- ✅ **Security-conscious** — We implement standard controls and best practices
- ✅ **Privacy-respecting** — We minimize data collection and retention
- ✅ **Transparent** — We clearly document our architecture and limitations
- ✅ **Open-source** — Code is publicly available for security review
- ⚠️ **Early-stage** — Not yet battle-tested in production at scale
- ⚠️ **Depends on Groq** — Security depends partly on Groq's API infrastructure
- ⚠️ **Requires secure deployment** — Security benefits are only achieved with proper deployment (HTTPS, environment variables, secure hosting)

### User Responsibility

Users of FinGenie are responsible for:

- **Data classification** — Determining what data is appropriate to upload
- **Secure deployment** — Setting up production instances with HTTPS, secure credentials, and monitoring
- **Dependency updates** — Keeping software dependencies patched and up-to-date
- **Compliance** — Ensuring their use complies with applicable regulations and policies

## Security Headers & Configuration

Production deployments should include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'
X-XSS-Protection: 1; mode=block
```

See [Backend Deployment Guide](backend/DEPLOYMENT.md) for complete configuration examples.

## Dependency Updates & Maintenance

We recommend:

- **Run `pip audit` regularly** — Check Python dependencies for known vulnerabilities
- **Run `npm audit` regularly** — Check JavaScript dependencies for known vulnerabilities
- **Update dependencies monthly** — Keep packages current but test before production rollout
- **Monitor Groq API** — Check https://status.groq.com for third-party service health
- **Watch GitHub releases** — Star this repo to receive notifications of security patches

## Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

### Reporting Process

1. **Do not open a public issue** — Security issues should be reported privately
2. **Use GitHub private vulnerability reporting** — Visit the [Security Advisories](../../security/advisories) tab and click "Report a vulnerability"
3. **Include details:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

Alternatively, contact the maintainer via GitHub profile or README.

### Our Commitment

- We aim to acknowledge reports within 48 hours
- We'll provide a timeline for patches based on severity
- We'll credit you in release notes if you wish
- We take all reports seriously and prioritize security fixes

### What We Ask

- Don't publicly disclose the issue before we've patched
- Don't exploit vulnerabilities for any purpose other than testing
- Don't share details with others until we've released a fix
- Allow reasonable time (7-14 days) for us to patch before disclosure

## Security Best Practices for Users

If you deploy FinGenie, follow these practices:

1. **Environment variables** — Store `GROQ_API_KEY` in environment, never in code
2. **HTTPS only** — Deploy with TLS/SSL certificates and disable HTTP
3. **CORS configuration** — Set `ALLOWED_ORIGINS` to your specific domains only
4. **Keep dependencies updated** — Regular updates patch vulnerabilities
5. **Monitor logs** — Watch for error spikes or unusual access patterns
6. **Rate limiting** — Deploy behind reverse proxy (nginx, Cloudflare, etc.) with rate limiting
7. **Secrets management** — Use secure credential storage (AWS Secrets Manager, GitHub Secrets, etc.)
8. **Network isolation** — Restrict API access to trusted networks if possible
9. **Regular backups** — Though FinGenie doesn't persist data, maintain application backups
10. **Security review** — Before processing sensitive data, conduct a threat assessment for your use case

## Compliance & Standards

### Standards We Follow

- **OWASP Top 10** — Our design addresses common web vulnerabilities
- **RESTful API best practices** — Proper HTTP methods, status codes, and error handling
- **Secure coding** — Input validation, output encoding, error handling per industry standards
- **Privacy by design** — Minimal data collection, ephemeral storage, no tracking

### Standards We Don't Make Claims About

- ❌ **SOC 2** — We haven't completed SOC 2 audit (not necessary for early-stage projects)
- ❌ **ISO 27001** — We haven't completed ISO certification
- ❌ **HIPAA compliance** — We don't meet healthcare data security requirements
- ❌ **PCI DSS** — We don't process payment cards
- ❌ **GDPR compliance** — We follow GDPR principles (data minimization, right to deletion) but haven't completed formal audit

### Compliance Guidance

If you need specific compliance:
- **GDPR**: Our "no persistent storage" approach supports GDPR's right-to-deletion, but verify data flows through third parties
- **CCPA**: We don't collect personal data, so CCPA doesn't apply, but disclose Groq as a data processor
- **HIPAA**: Don't process PHI without additional controls and Business Associate Agreement with Groq
- **SOX/audit requirements**: Implement your own logging, monitoring, and audit trails on top of FinGenie

## Security Timeline & Transparency

| Date | Event |
|------|-------|
| 2024-2025 | Initial development with security-first architecture |
| 2026-04-18 | Public release with this security policy |
| Ongoing | Community security review and vulnerability reports |

## Changelog

**Version 1.0 (2026-04-18)**
- Initial security policy
- Core controls documented
- Responsible disclosure process established
- Privacy policy defined

---

**Last Updated:** April 18, 2026  
**Maintained by:** FinGenie Project Maintainers  
**Questions?** Open an issue on GitHub or contact via maintainer profile
