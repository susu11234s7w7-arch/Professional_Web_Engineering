# DevPulse — Security Engineering & Threat Model

## 1. Security Architecture & Threat Analysis
DevPulse adheres to a defense-in-depth model across the network boundary, application layer, database interface, and client side.

| Vulnerability Class | Mitigation Strategy in DevPulse | Verification Status |
| :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Parameterized queries with prepared statements via `better-sqlite3`. Zero dynamic string interpolation in SQL. | Verified |
| **Authentication Weakness** | Salted password hashes using `bcryptjs` (10 rounds). Constant-time comparisons. Strict JWT validation with expiry. | Verified |
| **Cross-Site Scripting (XSS)** | React JSX auto-escaping, input sanitization, and `Content-Security-Policy` HTTP headers via `helmet`. | Verified |
| **Brute-Force Attacks** | IP-based sliding window rate limiter on `/api/auth/*` routes. | Verified |
| **Broken Object Level Auth (BOLA)** | Service layer explicitly checks ownership / project membership before allowing issue mutations or deletions. | Verified |
| **Credential Exposure** | Strict `.gitignore`, `.env.example` templates with no real secrets, and zero private keys in repository history. | Verified |
| **Cross-Origin Leakage** | Express CORS configured with explicit allowed origins; wildcard `*` disbarred in production. | Verified |

---

## 2. Secure Defaults

### 2.1 Password Policy
- Passwords must be at least 8 characters long.
- Enforced validation requiring alphanumeric characters.
- Passwords are salted and hashed using bcrypt before hitting the storage engine. Plaintext passwords are never returned in queries or logged to stdout.

### 2.2 JWT Token Security
- Tokens are signed with a high-entropy secret (`JWT_SECRET`).
- Tokens have a defined expiration time (`JWT_EXPIRES_IN=7d`).
- Payload contains only minimal identity fields: `userId`, `email`, and `role`. Sensitive fields (such as password hashes or PII) are strictly omitted.

### 2.3 Parameterized Queries
All database interactions use parameterized statement templates:
```typescript
// SECURE: Parameterized statement
const stmt = db.prepare('SELECT * FROM issues WHERE project_id = ? AND status = ?');
const results = stmt.all(projectId, status);
```

### 2.4 HTTP Headers (`helmet`)
Helmet is enabled globally, supplying:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (clickjacking mitigation)
- `X-XSS-Protection: 0` (modern standard)
- `Strict-Transport-Security` (enforced HTTPS)
- Removal of `X-Powered-By: Express` to prevent server fingerprinting.

---

## 3. Threat Model & Residual Risks
While DevPulse implements production-grade security patterns for self-hosted instances, the following residual risks and architectural recommendations apply:

1. **Token Invalidation on Password Reset:** Tokens are stateless JWTs. To invalidate immediately upon password revocation without waiting for token expiry, a Redis token blacklist or incrementing user token version column can be introduced in multi-instance scale deployments.
2. **Database Encryption at Rest:** SQLite database files reside on the host filesystem. In enterprise deployments, full-disk encryption (LUKS, BitLocker) or SQLCipher is recommended if the host machine is untrusted.
3. **Session Cookie Option:** For environments requiring strict `HttpOnly; SameSite=Strict` cookie transport rather than Authorization headers, DevPulse's modular middleware can be configured to read from signed cookies.

---

## 4. Reporting a Vulnerability
To report a security vulnerability in DevPulse, open a private security advisory on GitHub or contact the repository maintainers directly. Do not report security vulnerabilities through public GitHub issues.

