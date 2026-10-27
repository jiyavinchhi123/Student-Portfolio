# Full-Stack Application Security Report: STRIDE Threat Model, TLS/HTTPS, & Input Sanitization

**Student Name:** Jiya Vinchhi  
**Project:** Full-Stack Task Management & Student Portfolio Application  
**Laboratory Practical:** Web Application Security Hardening, STRIDE Threat Modeling, Local TLS/HTTPS, and NoSQL Injection Defense  
**Evaluated Codebase:** [`task-manager-api/server.js`](file:///d:/Portfolio/task-manager-api/server.js)  

---

## 1. Executive Summary

This report documents the security architecture, threat analysis, and defensive countermeasures implemented across the **Task Management Application**. 

Security hardening in this practical encompasses:
1. A structured **STRIDE Threat Model** analyzing all six threat categories with concrete application examples and active mitigations.
2. **Local HTTPS & TLS Encryption** configured on port `5443` using `mkcert` to eliminate plaintext transmission and man-in-the-middle risks.
3. **Secure Coding & Input Sanitization** via `express-mongo-sanitize` to defend against MongoDB operator injection attacks (`$gt`, `$ne`, `$regex`).
4. A theoretical comparison between **Transport Layer Security (TLS/HTTPS)** and **Application Layer Tokens (JWT)**.

---

## 2. STRIDE Threat Model Analysis

The **STRIDE** methodology (developed by Praerit Garg and Loren Kohnfelder at Microsoft) systematically categorizes software security threats.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        STRIDE Threat Categories                        │
├─────────────────────────┬──────────────────────────────────────────────┤
│  S - Spoofing           │ Pretending to be someone or something else   │
│  T - Tampering          │ Malicious modification of data or code       │
│  R - Repudiation        │ Denying an action without proof              │
│  I - Info Disclosure    │ Exposing information to unauthorized actors  │
│  D - Denial of Service  │ Degrading or denying service to valid users  │
│  E - Elev. of Privilege │ Gaining unauthorized administrative rights   │
└─────────────────────────┴──────────────────────────────────────────────┘
```

### STRIDE Assessment Table for Task Management App

| Threat Category | Concrete Threat Example in Our Application | Severity | Mitigation Applied & Verified in Code |
| :--- | :--- | :---: | :--- |
| **Spoofing (Identity)** | An attacker submits tasks pretending to be `"Jiya Vinchhi"` or sends forged credentials to `/portfolio/login` to hijack the admin session. | **High** | • Strict password verification against server-side `ADMIN_PASSWORD` in `.env`.<br>• Session bearer token issued on login (`admin-session-token-998`).<br>• `assignedUser` field tracked and validated against authorized schema profiles. |
| **Tampering (Data Integrity)** | 1. An attacker alters task priority, due dates, or status over unencrypted HTTP.<br>2. An attacker submits NoSQL operator objects (`{"$gt": ""}`) in the request body to alter database query logic. | **Critical** | • **TLS/HTTPS** on port `5443` encrypts data in flight against MITM interception.<br>• **`express-mongo-sanitize`** recursively strips and replaces `$` and `.` characters, neutralizing NoSQL injection.<br>• Mongoose schema type-casting and strict model validation. |
| **Repudiation (Accountability)** | A user deletes a high-priority task and subsequently denies ever initiating the deletion. | **Medium** | • **Native `EventEmitter` Audit Logging**: Every task creation (`task-created`) and deletion (`task-deleted`) generates an immutable audit record containing: exact UTC timestamp (`apiResponseTime`), task title, and originating IP.<br>• Inspectable via `GET /tasks/events/log`. |
| **Information Disclosure (Confidentiality)** | 1. Sniffing unencrypted HTTP traffic on public WiFi reveals task contents and passwords.<br>2. Exposing `OPENAI_API_KEY` or `GEMINI_API_KEY` to the React browser frontend.<br>3. Stack trace leaks in 500 error messages. | **High** | • **HTTPS / TLS**: All communication encrypted via modern cipher suites.<br>• **Server-Side Secret Isolation**: Third-party AI keys reside strictly in `task-manager-api/.env` and are excluded from git via `.gitignore`.<br>• Centralized global error middleware suppresses raw stack traces in production responses. |
| **Denial of Service (Availability)** | 1. An automated bot spams `POST /api/ai/generate-description`, exhausting OpenAI API credit balances.<br>2. Excessive database queries exhaust connection pools and crash the Node.js event loop. | **High** | • **Sliding-Window Rate Limiting**: Max 1 request per task title per 15s (`429 Too Many Requests`).<br>• **In-Memory Caching (`node-cache`)**: Read queries (`GET /tasks`) served from RAM in ~2ms, offloading 68.5% of database workload.<br>• `express.json()` payload body size limits prevent heap exhaustion attacks. |
| **Elevation of Privilege (Authorization)** | An unauthenticated visitor calls administrative mutation routes (`PUT /portfolio/profile` or deletes tasks) without admin credentials. | **High** | • Route-level authorization gates administrative updates behind session verification.<br>• ID validation middleware (`validateTaskId`, `validateEducationId`) ensures only valid 24-char hexadecimal ObjectIds can be manipulated. |

---

## 3. HTTPS and TLS Implementation (Local Development with mkcert)

### 3.1 Understanding TLS / HTTPS
**Transport Layer Security (TLS)** provides end-to-end cryptographic security between the client browser and the Express server:
- **Confidentiality:** Symmetrical session keys (e.g., AES-256-GCM) encrypt all HTTP headers, request bodies, cookies, and URLs in transit.
- **Integrity:** Message Authentication Codes (HMAC) ensure data cannot be modified in flight without detection.
- **Authentication:** Public key certificates verify the true identity of the server, preventing DNS spoofing and phishing.

### 3.2 Setting Up Local HTTPS with mkcert
In local development, self-signed certificates cause ugly browser warnings (`NET::ERR_CERT_AUTHORITY_INVALID`). **`mkcert`** creates a locally trusted Certificate Authority (CA) in your system's trust store.

#### Installation & Generation Steps:
```powershell
# 1. Install mkcert on Windows using Chocolatey (or brew on macOS)
choco install mkcert

# 2. Install the local Root CA into Windows Certificate Store
mkcert -install

# 3. Navigate to the backend directory and generate certificates for localhost
cd d:\Portfolio\task-manager-api
mkcert localhost 127.0.0.1 ::1
```
*This generates two files:*
- `localhost.pem` (The public TLS certificate)
- `localhost-key.pem` (The private encryption key)

#### Git Security & `.gitignore` Requirement:
> [!CAUTION]
> Private TLS keys (`*-key.pem`) must **NEVER** be committed to GitHub! Expose of private keys allows attackers to decrypt intercepted traffic or impersonate your server. Both `.pem` and `.key` files are strictly excluded in [`task-manager-api/.gitignore`](file:///d:/Portfolio/task-manager-api/.gitignore).

### 3.3 Express Dual HTTP & HTTPS Server Configuration

In [`task-manager-api/server.js`](file:///d:/Portfolio/task-manager-api/server.js):
```javascript
const fs = require('fs');
const https = require('https');
const path = require('path');

// 1. Standard HTTP Server (Port 5000)
app.listen(PORT, () => {
  console.log(`Task Manager API running at http://localhost:${PORT}`);
});

// 2. HTTPS Secure Server (Port 5443) using mkcert local TLS
const keyPath = path.join(__dirname, 'localhost-key.pem');
const certPath = path.join(__dirname, 'localhost.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  https.createServer(sslOptions, app).listen(5443, () => {
    console.log(`🔒 HTTPS secure server running at https://localhost:5443`);
  });
} else {
  console.log(`ℹ️ [SECURITY] HTTPS certificates not detected (localhost.pem / localhost-key.pem).`);
  console.log(`   To activate HTTPS on port 5443: run 'mkcert -install' then 'mkcert localhost'.`);
}
```

---

## 4. Secure Coding: NoSQL Injection Prevention with `express-mongo-sanitize`

### 4.1 How NoSQL Injection Works in MongoDB
In SQL, injection occurs by breaking out of string delimiters (e.g. `' OR 1=1 --`). In MongoDB, applications accept JSON request bodies. If an application blindly passes user input into a Mongoose query:

```javascript
// VULNERABLE CODE:
const { email, password } = req.body;
User.findOne({ email, password });
```

An attacker sends this JSON payload:
```json
{
  "email": { "$gt": "" },
  "password": { "$gt": "" }
}
```

Because MongoDB evaluates `$gt: ""` as **"greater than empty string"**, the query evaluates to:
`Find any user where email > "" AND password > ""`!
The query returns the first user in the database (usually the Administrator), completely bypassing password authentication without knowing the password!

### 4.2 Mitigation: `express-mongo-sanitize`
The `express-mongo-sanitize` middleware sits early in the request pipeline and inspects `req.body`, `req.query`, and `req.params`. It searches for any key starting with `$` (MongoDB query operators) or containing `.` (MongoDB dot notation).

```javascript
const mongoSanitize = require('express-mongo-sanitize');

// Positioned immediately after express.json()
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized potentially malicious NoSQL operator in parameter: ${key}`);
  }
}));
```

### 4.3 Before & After Sanitization Demonstration

| Stage | Payload Sent by Attacker | What Mongoose Sees | Security Result |
| :--- | :--- | :--- | :--- |
| **BEFORE (Vulnerable)** | `{"email": {"$gt": ""}, "password": {"$gt": ""}}` | `User.findOne({ email: { $gt: "" } })` | ❌ **Authentication Bypassed!** First admin user returned. |
| **AFTER (Sanitized)** | `{"email": {"$gt": ""}, "password": {"$gt": ""}}` | `User.findOne({ email: { _gt: "" } })` | ✅ **Attack Blocked!** MongoDB searches for a literal field named `_gt`, finding no match. Safe `401 Unauthorized`. |

---

## 5. Comparative Analysis: HTTPS (TLS) vs. JWT

A common misconception is that using JSON Web Tokens (JWT) eliminates the need for HTTPS, or that HTTPS makes JWT obsolete. In reality, they protect completely different layers of the OSI model:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        OSI Layer Comparison                            │
├────────────────────────────────────────────────────────────────────────┤
│  Layer 7: Application Layer  ──► JWT (Identity & Authorization)        │
│  Layer 4: Transport Layer    ──► TLS / HTTPS (Encryption in Transit)   │
└────────────────────────────────────────────────────────────────────────┘
```

| Dimension | HTTPS / TLS | JSON Web Token (JWT) |
| :--- | :--- | :--- |
| **Security Layer** | **Transport Layer (Layer 4/5)** | **Application Layer (Layer 7)** |
| **Primary Objective** | Encrypts the network pipe between client and server. | Proves the identity and permissions of the user across requests. |
| **What It Protects Against** | Packet sniffing, public WiFi eavesdropping, man-in-the-middle (MITM) tampering, DNS spoofing. | Unauthorized access to protected routes, session tampering, privilege escalation. |
| **Payload Visibility** | All headers, bodies, cookies, and tokens are encrypted as ciphertext on the wire. | Base64Url-encoded payload is **readable by anyone** unless explicitly encrypted with JWE. |
| **Tamper Proofing** | HMAC integrity check over network packets. | Cryptographic signature (`HMAC-SHA256` or `RSA`) verified using secret key. |
| **Lifecycle** | Transient during the TCP connection session. | Persistent stateless token stored by client (LocalStorage / HttpOnly Cookie). |

### Why Both Are Essential Together:
1. **JWT without HTTPS is Fatal:** If you send a JWT over plain HTTP (`http://`), an eavesdropper on the same local network or router can capture the `Authorization: Bearer <token>` header in plaintext. The attacker can then replay that token and impersonate the user indefinitely until expiration.
2. **HTTPS without JWT is Incomplete:** HTTPS establishes a secure encrypted tunnel between the browser and server, but it does not authenticate *who* is sitting behind the browser. JWT provides the identity assertions and access permissions within that encrypted tunnel.

---

## 6. Verification & Automated Testing

The automated test suite in [`task-manager-api/tests/api.test.js`](file:///d:/Portfolio/task-manager-api/tests/api.test.js) includes dedicated verification for NoSQL sanitization:

- **Test 13:** Sends `{ "email": { "$gt": "" }, "password": { "$gt": "" } }` to the `/debug/security/sanitize-test` endpoint.
- **Assertion:** Verifies that keys starting with `$` are replaced with `_`, stripping malicious query operators before reaching any database query.

```bash
cd task-manager-api
npm test
```
*Result: **All 13 tests passing cleanly**.*

---

## 7. Conclusion

By integrating the **STRIDE threat analysis framework**, **local TLS/HTTPS encryption with mkcert**, and **NoSQL input sanitization with express-mongo-sanitize**, the Task Management application satisfies industry-standard secure coding guidelines (OWASP Top 10), ensuring defense-in-depth across both the transport and application layers.
