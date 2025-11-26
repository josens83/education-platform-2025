# 3. Authentication Strategy

Date: 2025-11-25
Status: **Accepted**

## Context

The Education Platform needs secure user authentication supporting:
- Email/password login
- Social login (Google, Kakao)
- Session management
- API authentication
- Security best practices

## Decision

Implement a **hybrid authentication strategy**:

1. **JWT (JSON Web Tokens)** for stateless API authentication
   - Access tokens (7 days)
   - Refresh tokens (30 days)
   - Stored in HTTP-only cookies

2. **OAuth 2.0** for social login
   - Google OAuth
   - Kakao OAuth
   - Passport.js for provider abstraction

3. **CSRF Protection** for mutation operations
   - Double-submit cookie pattern
   - Conditional protection (skips GET, webhooks, API tokens)

4. **Rate Limiting** for brute-force protection
   - Auth endpoints: 5 requests/minute
   - API endpoints: 10 requests/second

## Implementation

**Location:** `backend/middleware/auth.js`, `backend/routes/auth.js`

**Flow:**
```
1. User Login (Email/Password or OAuth)
   ↓
2. Generate JWT Access + Refresh Tokens
   ↓
3. Store tokens in HTTP-only cookies
   ↓
4. Client includes cookies in subsequent requests
   ↓
5. Middleware validates JWT and attaches user to req.user
```

## Consequences

### Positive

1. **Security**
   - HTTP-only cookies prevent XSS attacks
   - JWT stateless validation (no database lookup per request)
   - CSRF protection for mutations
   - Rate limiting prevents brute force

2. **Scalability**
   - Stateless tokens enable horizontal scaling
   - No session store required (can use Redis if needed)
   - Load balancers don't need sticky sessions

3. **User Experience**
   - Social login reduces friction
   - Long-lived refresh tokens (30 days)
   - Automatic token refresh
   - Remember me functionality

4. **Developer Experience**
   - Standard JWT claims
   - Easy to debug and test
   - Well-documented Passport.js strategies

### Negative

1. **Token Revocation**
   - Cannot instantly revoke JWTs (need to wait for expiry)
   - Mitigation: Short access token TTL (7 days) + refresh token rotation

2. **Cookie Size**
   - JWTs in cookies increase request size
   - Mitigation: Keep payload minimal (user ID, email, role)

3. **Complexity**
   - Multiple authentication methods to maintain
   - OAuth callback handling
   - Token rotation logic

### Neutral

1. **Storage**
   - Cookies vs localStorage trade-off
   - HTTP-only cookies chosen for security
   - Requires CORS credentials: true

## Security Measures

1. **Password Security**
   - bcrypt hashing (10 rounds)
   - Minimum 8 characters, complexity requirements
   - Password reset with time-limited tokens

2. **Token Security**
   - Strong JWT secret (32+ characters)
   - Separate refresh token secret
   - Token rotation on use
   - Blacklist for compromised tokens (if needed)

3. **OAuth Security**
   - State parameter for CSRF prevention
   - Validate OAuth provider responses
   - Link OAuth accounts to existing users

4. **Additional Protections**
   - Account lockout after failed attempts
   - Email verification required
   - Two-factor authentication ready (future)

## Alternatives Considered

### Session-Based Authentication
**Rejected because:**
- Requires session store (Redis/database)
- Less scalable for distributed systems
- Sticky sessions needed for load balancers

### OAuth-Only Authentication
**Rejected because:**
- Not all users have social accounts
- Privacy concerns for some users
- Dependency on third-party availability

### API Keys Only
**Rejected because:**
- Less suitable for web applications
- No user context in requests
- Harder to manage expiration

## Related Decisions

- [002: Technology Stack](002-technology-stack.md) - Node.js works well with JWT
- [004: Caching Strategy](004-caching-strategy.md) - Can cache user permissions

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Passport.js Documentation](http://www.passportjs.org/docs/)
