# Security Auditor Reference

## OWASP Top 10 2021

### A01:2021 – Broken Access Control

**Risk**: Unauthorized access to resources or actions.

**Detection**:

- Missing authorization checks before sensitive operations
- Role-based access control (RBAC) violations
- Insecure direct object references (IDOR)

**Prevention**:

```typescript
// ❌ WRONG: No authorization check
async function deleteUser(userId: string) {
	await db.users.delete(userId);
}

// ✅ CORRECT: Check permissions first
async function deleteUser(userId: string, currentUser: User) {
	if (!currentUser.isAdmin) {
		throw new Error("Unauthorized");
	}
	await db.users.delete(userId);
}
```

---

### A02:2021 – Cryptographic Failures

**Risk**: Sensitive data exposure due to weak or missing encryption.

**Detection**:

- MD5/SHA1 usage for passwords
- Hardcoded encryption keys
- Weak TLS configuration

**Prevention**:

```typescript
// ❌ WRONG: Weak hashing
const hash = crypto.createHash("md5").update(password).digest("hex");

// ✅ CORRECT: Strong password hashing
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(password, 10);
```

---

### A03:2021 – Injection

**Risk**: Untrusted data executed as code (SQL, OS commands, etc.).

**Detection**:

- String concatenation in queries
- Template literals in exec commands
- Unsafe deserialization

**Prevention**:

```typescript
// ❌ WRONG: SQL injection vulnerable
const users = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ CORRECT: Parameterized query
const users = await db.query("SELECT * FROM users WHERE email = ?", [email]);
```

---

### A04:2021 – Insecure Design

**Risk**: Missing or ineffective security controls.

**Detection**: Manual architecture review

**Prevention**:

- Threat modeling during design phase
- Security requirements as user stories
- Secure design patterns (defense in depth, least privilege)

---

### A05:2021 – Security Misconfiguration

**Risk**: Insecure default configurations or missing hardening.

**Detection**:

- Default credentials
- Unnecessary features enabled
- Verbose error messages exposing internals

**Prevention**:

```typescript
// ❌ WRONG: Verbose error in production
app.use((err, req, res, next) => {
	res.status(500).json({ error: err.stack });
});

// ✅ CORRECT: Generic error in production
app.use((err, req, res, next) => {
	const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
	res.status(500).json({ error: message });
});
```

---

### A06:2021 – Vulnerable and Outdated Components

**Risk**: Using libraries with known vulnerabilities.

**Detection**:

- `npm audit` findings
- Outdated dependencies
- Unmaintained packages

**Prevention**:

```bash
# Regular audits
npm audit
npm audit fix

# Automated updates
pnpm update

# Dependency management
pnpm outdated
```

---

### A07:2021 – Identification and Authentication Failures

**Risk**: Broken authentication allowing account takeover.

**Detection**:

- Weak password policies
- Missing MFA
- Session fixation vulnerabilities
- Insecure password recovery

**Prevention**:

```typescript
// ✅ Secure session configuration
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true, // Prevent XSS
			secure: true, // HTTPS only
			sameSite: "strict", // CSRF protection
			maxAge: 1000 * 60 * 60 // 1 hour
		}
	})
);
```

---

### A08:2021 – Software and Data Integrity Failures

**Risk**: Insecure CI/CD, auto-updates, or deserialization.

**Detection**:

- Missing integrity checks (SRI)
- Unsigned packages
- Insecure deserialization

**Prevention**:

```html
<!-- ✅ Subresource Integrity -->
<script
	src="https://cdn.example.com/lib.js"
	integrity="sha384-..."
	crossorigin="anonymous"
></script>
```

---

### A09:2021 – Security Logging and Monitoring Failures

**Risk**: Breaches undetected due to insufficient logging.

**Detection**: Manual review of logging implementation

**Prevention**:

```typescript
// ✅ Log authentication events
logger.info("Login attempt", {
	user: email,
	success: true,
	ip: req.ip,
	timestamp: new Date()
});
```

---

### A10:2021 – Server-Side Request Forgery (SSRF)

**Risk**: Application fetches remote resources without validation.

**Detection**:

- Unvalidated user-supplied URLs
- Internal network access from web app

**Prevention**:

```typescript
// ❌ WRONG: SSRF vulnerable
const response = await fetch(req.query.url);

// ✅ CORRECT: Validate URL
const allowedDomains = ["api.example.com"];
const url = new URL(req.query.url);
if (!allowedDomains.includes(url.hostname)) {
	throw new Error("Invalid domain");
}
const response = await fetch(url.toString());
```

---

## Common Vulnerability Patterns

### XSS (Cross-Site Scripting)

```typescript
// ❌ Reflected XSS
element.innerHTML = userInput;

// ✅ Safe alternative
element.textContent = userInput;

// ✅ Or sanitize
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userInput);
```

### CSRF (Cross-Site Request Forgery)

```typescript
// ✅ CSRF token validation
import csrf from "csurf";
app.use(csrf({ cookie: true }));

app.post("/transfer", (req, res) => {
	// Token automatically validated by middleware
	performTransfer(req.body.amount, req.body.to);
});
```

### Path Traversal

```typescript
// ❌ Path traversal vulnerable
const file = readFileSync(`./uploads/${req.query.filename}`);

// ✅ Validate and sanitize
import path from "path";
const safeFilename = path.basename(req.query.filename);
const file = readFileSync(path.join("./uploads", safeFilename));
```

---

## Secure Coding Checklist

### Authentication

- [ ] Use bcrypt or argon2 for password hashing (NOT MD5/SHA1)
- [ ] Implement rate limiting on login attempts
- [ ] Use secure session cookies (httpOnly, secure, sameSite)
- [ ] Validate JWT signatures and expiration
- [ ] Implement MFA for sensitive operations

### Authorization

- [ ] Check permissions before every sensitive operation
- [ ] Use role-based access control (RBAC)
- [ ] Never trust client-side authorization checks
- [ ] Implement least privilege principle

### Input Validation

- [ ] Validate all user input (whitelist, not blacklist)
- [ ] Use parameterized queries (NO string concatenation)
- [ ] Sanitize HTML output (DOMPurify for innerHTML)
- [ ] Validate file uploads (type, size, content)

### Data Protection

- [ ] NO hardcoded secrets (use environment variables)
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS everywhere (secure cookies, HSTS)
- [ ] Implement proper key rotation

### Error Handling

- [ ] Generic error messages in production
- [ ] NO stack traces exposed to users
- [ ] Log errors securely (no sensitive data in logs)

### Dependencies

- [ ] Run `npm audit` regularly
- [ ] Keep dependencies updated
- [ ] Review licenses for restrictive terms
- [ ] Minimize dependency count

---

## Tools & Resources

### Security Scanners

- `npm audit` - Dependency vulnerability scanner
- `eslint-plugin-security` - ESLint security rules
- `semgrep` - Static analysis for security patterns
- OWASP ZAP - Dynamic application security testing

### Libraries

- `bcrypt` - Password hashing
- `helmet` - HTTP security headers
- `csurf` - CSRF protection
- `rate-limiter-flexible` - Rate limiting
- `DOMPurify` - HTML sanitization

### References

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [npm Security Best Practices](https://docs.npmjs.com/security)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
