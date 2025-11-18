---
description: |
  Audits code and dependencies for security vulnerabilities (security audit, vulnerability scan, dependency check,
  XSS detection, SQL injection, secret detection). Detects hardcoded secrets, insecure patterns, outdated dependencies
  with known CVEs. Validates authentication/authorization implementations against OWASP Top 10.
allowed-tools: [Read, Grep, Bash]
---

# Security Auditor Skill

Comprehensive security validation enforcing OWASP Top 10 compliance, dependency vulnerability scanning, and secure coding patterns. Detects common vulnerabilities (XSS, injection, hardcoded secrets) and validates auth implementations.

## Capabilities

### 1. Dependency Vulnerability Scanning

- **npm audit** integration for known CVEs
- **Outdated dependency detection** with security advisories
- **License compliance** check for restrictive licenses
- **Severity classification** (critical, high, moderate, low)

**Usage**:

```bash
tsx .claude/skills/security-auditor/scripts/check-dependencies.ts
```

**Detects**:

- Packages with known security vulnerabilities
- Outdated packages with available patches
- Transitive dependency vulnerabilities
- Packages with restrictive licenses (GPL, AGPL)

### 2. Code Pattern Security Analysis

- **XSS prevention** - Detects unsafe innerHTML, eval(), dangerouslySetInnerHTML
- **Injection prevention** - SQL injection patterns, command injection
- **Secrets detection** - Hardcoded API keys, passwords, tokens
- **Insecure crypto** - Weak algorithms, hardcoded keys
- **Path traversal** - Unsafe file path operations

**Usage**:

```bash
tsx .claude/skills/security-auditor/scripts/check-code-patterns.ts src/
```

**Patterns Detected**:

```typescript
// ❌ XSS vulnerability
element.innerHTML = userInput; // UNSAFE
eval(userCode); // UNSAFE
dangerouslySetInnerHTML={{ __html: data }} // UNSAFE

// ❌ SQL injection
db.query(`SELECT * FROM users WHERE id = ${userId}`); // UNSAFE

// ❌ Hardcoded secrets
const API_KEY = "sk_live_abc123def456"; // UNSAFE
const PASSWORD = "MyPassword123"; // UNSAFE

// ❌ Weak crypto
crypto.createHash('md5'); // UNSAFE (use SHA-256 minimum)
```

### 3. Authentication/Authorization Validation

- **Session management** - Secure session configuration
- **Password handling** - Hashing, salt usage, complexity
- **Token validation** - JWT verification, expiration checks
- **Authorization patterns** - Role-based access control (RBAC)
- **OAuth/OIDC** - Proper flow implementation

**Usage**:

```bash
tsx .claude/skills/security-auditor/scripts/check-auth.ts src/
```

**Validates**:

- Password hashing (bcrypt, argon2 - NOT plain text or MD5)
- JWT signature verification
- Session cookie security (httpOnly, secure, sameSite)
- Authorization checks before sensitive operations
- CSRF token implementation

## Auto-Trigger Conditions

This skill activates when:

- Creating/modifying authentication/authorization code
- Adding new dependencies (triggers vulnerability scan)
- Creating API endpoints with user input
- Before deployment (pre-commit, CI/CD)
- After security-related bug reports

## Validation Report Format

When issues found, provides actionable fixes:

````markdown
## Security Audit Report

### File: src/lib/auth/login.ts

#### CRITICAL: Hardcoded Secrets

- Line 12: API key exposed in source code
  ```typescript
  const API_KEY = "sk_live_abc123"; // CRITICAL
  ```
````

**Fix**: Move to environment variable

```typescript
const API_KEY = process.env.VITE_API_KEY;
```

#### HIGH: SQL Injection Vulnerability

- Line 34: Unsafe query construction
  ```typescript
  db.query(`SELECT * FROM users WHERE email = '${email}'`);
  ```
  **Fix**: Use parameterized queries
  ```typescript
  db.query("SELECT * FROM users WHERE email = ?", [email]);
  ```

#### MODERATE: Weak Password Hashing

- Line 56: MD5 hash detected
  **Fix**: Use bcrypt or argon2
  ```typescript
  import bcrypt from "bcrypt";
  const hash = await bcrypt.hash(password, 10);
  ```

### Dependency Vulnerabilities

#### CRITICAL: 2 vulnerabilities

- axios@0.21.0 (CVE-2021-3749) - Upgrade to >=0.21.2
- lodash@4.17.15 (CVE-2020-8203) - Upgrade to >=4.17.21

#### Recommended Actions

1. Run: `pnpm update axios lodash`
2. Review breaking changes
3. Re-run security audit

```

## Integration

Works with:

- **validation-orchestrator** - Security audit in tier 1 validation
- **code-validator** - AST-based security pattern detection
- **devops-engineer** - Dependency update workflow
- **pre-commit-gate** hook - Block commits with security violations

## Success Criteria

1. ✅ Zero CRITICAL or HIGH severity vulnerabilities in production
2. ✅ No hardcoded secrets (API keys, passwords) in source code
3. ✅ All dependencies up-to-date with security patches
4. ✅ Authentication uses strong hashing (bcrypt, argon2)
5. ✅ All user input sanitized (XSS prevention)
6. ✅ Parameterized queries (SQL injection prevention)
7. ✅ OWASP Top 10 compliance verified

## OWASP Top 10 Coverage

| Risk | Detection | Prevention |
|------|-----------|------------|
| A01: Broken Access Control | check-auth.ts | Authorization pattern validation |
| A02: Cryptographic Failures | check-code-patterns.ts | Weak crypto detection |
| A03: Injection | check-code-patterns.ts | SQL/command injection patterns |
| A04: Insecure Design | Manual review | Architecture consultation |
| A05: Security Misconfiguration | check-dependencies.ts | Default config detection |
| A06: Vulnerable Components | check-dependencies.ts | npm audit, CVE scanning |
| A07: Identification Failures | check-auth.ts | Session/auth validation |
| A08: Software Integrity Failures | check-dependencies.ts | Dependency verification |
| A09: Logging Failures | Manual review | Logging pattern validation |
| A10: Server-Side Request Forgery | check-code-patterns.ts | SSRF pattern detection |

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [SvelteKit Security](https://kit.svelte.dev/docs/security)
```
