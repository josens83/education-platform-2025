# 6. Testing Strategy

Date: 2025-11-25
Status: **Accepted**

## Context

A comprehensive testing strategy is essential for:
- Preventing regressions
- Enabling confident refactoring
- Documenting expected behavior
- Reducing production bugs
- Supporting continuous deployment

We need tests at multiple levels:
- Unit tests (individual functions/components)
- Integration tests (API endpoints, database)
- E2E tests (full user workflows)

## Decision

Implement a **multi-layer testing pyramid**:

```
        /\
       /E2E\         10% - Full user flows
      /──────\
     /  Int.  \      20% - API & Services
    /──────────\
   /    Unit    \    70% - Functions & Components
  /──────────────\
```

### 1. Unit Tests - 70% of tests
**Frontend:** Vitest + React Testing Library
**Backend:** Jest + Supertest

**Location:** `apps/web/src/**/*.test.tsx`, `backend/tests/unit/`

**Coverage:**
- React components
- Utility functions
- Business logic
- State management
- Form validation

**Target:** 80% code coverage (enforced in CI)

```javascript
// Example: Component test
describe('BookCard', () => {
  it('displays book title and author', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('Book Title')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests - 20% of tests
**Framework:** Jest + Supertest
**Location:** `backend/tests/integration/`

**Coverage:**
- API endpoint testing
- Database operations
- Authentication flows
- Third-party integrations
- Caching behavior

```javascript
// Example: API integration test
describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

### 3. E2E Tests - 10% of tests
**Framework:** Playwright
**Location:** `apps/web/e2e/`

**Coverage:**
- Critical user journeys
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness
- Performance regression

**Critical Flows:**
- User registration and login
- Book browsing and reading
- Subscription purchase
- Progress tracking

```javascript
// Example: E2E test
test('user can complete registration', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name="email"]', 'user@test.com');
  await page.fill('[name="password"]', 'SecurePass123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Test Execution Strategy

### Local Development
```bash
# Frontend unit tests (watch mode)
cd apps/web && npm test

# Backend unit tests
cd backend && npm test

# E2E tests (headed mode)
cd apps/web && npm run e2e:ui
```

### CI Pipeline
**Location:** `.github/workflows/ci.yml`

```yaml
jobs:
  test:
    - Install dependencies
    - Lint code (ESLint)
    - Type check (TypeScript)
    - Run unit tests (Jest/Vitest)
    - Run integration tests
    - Run E2E tests (Playwright)
    - Upload coverage to Codecov
    - Enforce 80% coverage threshold
```

**Required Checks:**
- All tests passing
- Coverage ≥ 80%
- No linting errors
- No TypeScript errors

## Coverage Requirements

**Minimum Coverage: 80% overall**

**Per-category minimums:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Exemptions:**
- Configuration files
- Type definitions
- Migration scripts
- Development utilities

**Enforcement:**
```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "statements": 80,
      "branches": 75,
      "functions": 80,
      "lines": 80
    }
  }
}
```

## Testing Best Practices

### 1. Test Naming
```javascript
// Pattern: describe what, test should do what
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw error for duplicate email', () => {});
  });
});
```

### 2. AAA Pattern
```javascript
// Arrange - Setup
const user = { email: 'test@test.com' };

// Act - Execute
const result = await createUser(user);

// Assert - Verify
expect(result).toHaveProperty('id');
```

### 3. Test Isolation
- Each test is independent
- No shared state between tests
- Setup and teardown properly
- Use factories for test data

### 4. Mock External Dependencies
```javascript
// Mock database
jest.mock('../lib/db');

// Mock API calls
vi.mock('axios');
```

## Consequences

### Positive

1. **Quality Assurance**
   - Catch bugs before production
   - Prevent regressions
   - Document expected behavior
   - Enable confident refactoring

2. **Developer Confidence**
   - Safe to make changes
   - Quick feedback loop
   - Reduced fear of breaking things
   - Better code design (testability)

3. **Continuous Deployment**
   - Automated quality gates
   - Deploy with confidence
   - Fast feedback on PRs
   - Reduced manual testing

4. **Documentation**
   - Tests as living documentation
   - Examples of usage
   - Edge cases documented
   - API contract verification

### Negative

1. **Development Time**
   - Writing tests takes time (20-30% overhead)
   - Maintaining tests as code changes
   - Learning curve for testing tools
   - Flaky tests require debugging

2. **CI/CD Time**
   - Test suite adds 5-10 minutes to pipeline
   - E2E tests can be slow
   - Increased CI minutes usage
   - Potential for pipeline failures

3. **Maintenance Burden**
   - Update tests when code changes
   - Fix failing tests
   - Update mocks and fixtures
   - Manage test data

4. **False Confidence**
   - 80% coverage doesn't mean bug-free
   - Tests can have bugs too
   - Mocked tests may not catch integration issues
   - Still need manual QA

### Neutral

1. **Test Data Management**
   - Need fixtures and factories
   - Database seeding for integration tests
   - Cleanup between tests
   - Shared test utilities

## Test Environment

**Database:** PostgreSQL test database
**Redis:** Separate Redis instance for tests
**Environment:** `.env.test` file
**Isolation:** Transactions rolled back after each test

## Continuous Improvement

**Metrics to track:**
- Coverage percentage (target: ≥80%)
- Test execution time (target: <10 min)
- Flaky test rate (target: <2%)
- Tests per module
- Time to fix failing tests

**Review quarterly:**
- Test suite performance
- Coverage gaps
- Flaky tests
- Test value vs maintenance cost

## Alternatives Considered

### Lower Coverage Threshold (50-60%)
**Rejected because:**
- Not enough protection against regressions
- Industry best practice is 80%+
- Enables more confident deployment

### More E2E Tests
**Rejected because:**
- Slower execution
- More brittle (browser dependencies)
- Higher maintenance
- Unit tests catch most issues faster

### Manual Testing Only
**Rejected because:**
- Not scalable
- Human error prone
- Slow feedback
- Blocks continuous deployment

## Related Decisions

- [002: Technology Stack](002-technology-stack.md) - Testing tools chosen
- [007: Deployment Strategy](007-deployment-strategy.md) - Tests gate deployment

## References

- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Kent C. Dodds - Testing](https://kentcdodds.com/blog/write-tests)
