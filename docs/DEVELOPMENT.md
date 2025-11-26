# Development Guide
## Education Platform 2025

Complete guide for developers working on the Education Platform project.

Last Updated: 2025-11-25

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Development Environment](#development-environment)
4. [Development Workflow](#development-workflow)
5. [Code Style & Standards](#code-style--standards)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18.x or v20.x (LTS recommended)
- **npm** v9+ or **pnpm** v8+
- **Docker** & **Docker Compose** v24+
- **Git** v2.30+
- **PostgreSQL** v14+ (optional, can use Docker)
- **Redis** v7+ (optional, can use Docker)

### One-Command Setup

```bash
# Clone repository
git clone https://github.com/josens83/education-platform-2025.git
cd education-platform-2025

# Run setup script (installs dependencies, sets up env files, initializes database)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development servers
npm run dev
```

Your application should now be running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

### Manual Setup

If you prefer manual setup or the script fails:

#### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd apps/web
npm install

# Install backend dependencies
cd ../backend
npm install
```

#### 2. Environment Configuration

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment
cd ../apps/web
cp .env.example .env.local
# Edit .env.local with your configuration
```

**Required environment variables:**

**Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/education_platform
DB_HOST=localhost
DB_PORT=5432
DB_NAME=education_platform
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters

# Optional services (can be added later)
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-key
STRIPE_SECRET_KEY=sk_test_your-key
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

#### 3. Database Setup

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d postgres redis

# Wait for database to be ready
sleep 5

# Initialize database
cd backend
npm run db:init
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb education_platform

# Run migrations
cd backend
npm run db:init
```

#### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd apps/web
npm run dev

# Terminal 3 (optional): Start monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

---

## Project Structure

```
education-platform-2025/
├── apps/
│   └── web/                    # Frontend React application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Page components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities and helpers
│       │   ├── styles/         # Global styles
│       │   └── main.tsx        # Application entry point
│       ├── e2e/                # Playwright E2E tests
│       ├── public/             # Static assets
│       └── vite.config.ts      # Vite configuration
│
├── backend/                    # Node.js API server
│   ├── routes/                 # Express route handlers
│   ├── middleware/             # Custom middleware
│   ├── lib/                    # Shared utilities
│   ├── config/                 # Configuration files
│   ├── tests/                  # Backend tests
│   │   ├── unit/               # Unit tests
│   │   └── integration/        # Integration tests
│   └── server.js               # Server entry point
│
├── database/                   # Database related files
│   ├── migrations/             # SQL migration files
│   └── init.js                 # Database initialization script
│
├── monitoring/                 # Monitoring configuration
│   ├── prometheus/             # Prometheus config & rules
│   ├── grafana/                # Grafana dashboards
│   └── alertmanager/           # Alert configuration
│
├── docs/                       # Documentation
│   ├── adr/                    # Architecture Decision Records
│   ├── ARCHITECTURE.md         # System architecture
│   ├── DEVELOPMENT.md          # This file
│   └── API_EXAMPLES.md         # API usage examples
│
├── scripts/                    # Utility scripts
│   ├── setup.sh                # Initial setup script
│   └── backup-db.sh            # Database backup script
│
├── .github/                    # GitHub configuration
│   └── workflows/              # CI/CD workflows
│       ├── ci.yml              # Continuous Integration
│       └── lighthouse-ci.yml   # Performance testing
│
├── docker-compose.yml          # Development environment
├── docker-compose.monitoring.yml  # Monitoring stack
├── package.json                # Root package file
├── DEPLOYMENT.md               # Production deployment guide
├── CONTRIBUTING.md             # Contribution guidelines
└── README.md                   # Project overview
```

---

## Development Environment

### Using Docker Compose (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Start full development environment
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop environment
docker-compose down

# Rebuild after dependency changes
docker-compose up -d --build
```

**Services included:**
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 3001)
- Frontend (port 3000)

### Local Development (Without Docker)

If you prefer running services locally:

```bash
# Terminal 1: PostgreSQL (if not using Docker)
# Already installed and running

# Terminal 2: Redis (if not using Docker)
redis-server

# Terminal 3: Backend
cd backend
npm run dev          # Watch mode with nodemon

# Terminal 4: Frontend
cd apps/web
npm run dev          # Vite dev server with HMR

# Terminal 5 (optional): TypeScript type checking
cd apps/web
npm run type-check   # Watch mode
```

### IDE Setup

#### VS Code (Recommended)

**Recommended Extensions:**
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "Orta.vscode-jest",
    "ms-azuretools.vscode-docker"
  ]
}
```

**Workspace Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    "./apps/web",
    "./backend"
  ],
  "typescript.tsdk": "apps/web/node_modules/typescript/lib"
}
```

#### WebStorm / IntelliJ IDEA

1. Enable ESLint: `Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
2. Enable Prettier: `Settings > Languages & Frameworks > JavaScript > Prettier`
3. Set Node.js version: `Settings > Languages & Frameworks > Node.js`

---

## Development Workflow

### Git Workflow

We follow **GitHub Flow** (simplified Git Flow):

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make changes** with descriptive commits
   ```bash
   git add .
   git commit -m "feat: Add user profile page"
   ```

3. **Push to remote**
   ```bash
   git push -u origin feature/my-feature
   ```

4. **Create Pull Request** on GitHub
   - Fill out the PR template
   - Request reviews
   - Wait for CI to pass

5. **Address review feedback**
   ```bash
   git add .
   git commit -m "refactor: Apply review feedback"
   git push
   ```

6. **Merge** (after approval + CI pass)
   - Use "Squash and merge" for cleaner history
   - Delete branch after merge

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes (dependencies, etc.)

**Examples:**
```
feat(auth): Add Google OAuth login

Implement Google OAuth 2.0 login flow using Passport.js

Closes #123
```

```
fix(api): Prevent duplicate user registrations

Add unique constraint check before creating user

Fixes #456
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Test additions/fixes
- `chore/` - Maintenance tasks

**Examples:**
- `feature/user-dashboard`
- `fix/login-error-handling`
- `refactor/api-routes`
- `docs/api-examples`

---

## Code Style & Standards

### ESLint Configuration

**Frontend (apps/web/.eslintrc.cjs):**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
```

**Backend (backend/.eslintrc.js):**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'security/detect-object-injection': 'off'
  }
}
```

**Run linting:**
```bash
# Frontend
cd apps/web
npm run lint
npm run lint:fix  # Auto-fix issues

# Backend
cd backend
npm run lint
npm run lint:fix
```

### Prettier Configuration

**.prettierrc:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

**Format code:**
```bash
npm run format       # Format all files
npm run format:check # Check formatting
```

### TypeScript Guidelines

**Use strict type checking:**
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

**Prefer interfaces over types:**
```typescript
// ✅ Good
interface BookProps {
  title: string;
  author: string;
}

// ⚠️ OK for unions/intersections
type Status = 'active' | 'inactive' | 'pending';
```

### React Guidelines

**Component structure:**
```tsx
// ✅ Good
import { useState } from 'react';
import type { FC } from 'react';

interface BookCardProps {
  title: string;
  author: string;
  onSelect?: () => void;
}

export const BookCard: FC<BookCardProps> = ({ title, author, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <h3>{title}</h3>
      <p>{author}</p>
    </div>
  );
};
```

**Use custom hooks for logic:**
```tsx
// hooks/useAuth.ts
export function useAuth() {
  const { data: user } = useQuery(['user'], fetchCurrentUser);
  const isAuthenticated = !!user;

  return { user, isAuthenticated };
}

// In component
function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  // ...
}
```

### Backend Guidelines

**Route handler structure:**
```javascript
// routes/books.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

// GET /api/books
router.get('/', cacheMiddleware({ ttl: 1800 }), async (req, res, next) => {
  try {
    const books = await BookService.getAll(req.query);
    res.json({ status: 'success', data: books });
  } catch (error) {
    next(error);
  }
});

// POST /api/books
router.post('/', authenticate, async (req, res, next) => {
  try {
    const book = await BookService.create(req.body);
    res.status(201).json({ status: 'success', data: book });
  } catch (error) {
    next(error);
  }
});
```

**Error handling:**
```javascript
// middleware/errorHandler.js
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

---

## Testing

### Running Tests

```bash
# Frontend unit tests
cd apps/web
npm test                # Run once
npm test -- --watch     # Watch mode
npm test -- --coverage  # With coverage

# Backend tests
cd backend
npm test                # All tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage   # With coverage

# E2E tests
cd apps/web
npm run e2e             # Headless mode
npm run e2e:ui          # UI mode (interactive)
npm run e2e:debug       # Debug mode
```

### Writing Tests

**Frontend component test:**
```tsx
// BookCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author'
  };

  it('renders book title and author', () => {
    render(<BookCard {...mockBook} />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<BookCard {...mockBook} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Test Book'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
```

**Backend API test:**
```javascript
// auth.test.js
const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body.data).toHaveProperty('token');
  });

  it('returns 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
  });
});
```

**E2E test:**
```typescript
// login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  await page.goto('/login');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### Coverage Requirements

- **Minimum coverage:** 80%
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 80%
- **Lines:** 80%

**View coverage report:**
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

---

## Debugging

### Frontend Debugging

**Chrome DevTools:**
1. Open Chrome DevTools (F12)
2. Go to Sources tab
3. Find your file in webpack:// or similar
4. Set breakpoints
5. Refresh page

**React DevTools:**
1. Install React DevTools browser extension
2. Open DevTools
3. Use Components and Profiler tabs

**Vite specific:**
```typescript
// Add debugger statement
function MyComponent() {
  debugger; // Execution will pause here
  // ...
}
```

### Backend Debugging

**Using VS Code:**

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/server.js",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**Using Node Inspector:**
```bash
node --inspect backend/server.js
# Open chrome://inspect in Chrome
```

**Debug logging:**
```javascript
const logger = require('./lib/logger');

logger.debug('Debug message', { data: someData });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error: err });
```

---

## Common Tasks

### Adding a New API Endpoint

1. **Create route handler:**
```javascript
// backend/routes/myroute.js
const router = require('express').Router();

router.get('/', async (req, res, next) => {
  try {
    // Your logic here
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

2. **Register route in server.js:**
```javascript
const myRoutes = require('./routes/myroute');
app.use('/api/myroute', myRoutes);
```

3. **Add tests:**
```javascript
// backend/tests/integration/myroute.test.js
describe('GET /api/myroute', () => {
  it('returns expected data', async () => {
    // Test implementation
  });
});
```

4. **Update Swagger docs:**
```javascript
/**
 * @swagger
 * /api/myroute:
 *   get:
 *     summary: Get my data
 *     responses:
 *       200:
 *         description: Success
 */
```

### Adding a New React Page

1. **Create page component:**
```tsx
// apps/web/src/pages/MyPage.tsx
import type { FC } from 'react';

export const MyPage: FC = () => {
  return (
    <div>
      <h1>My Page</h1>
    </div>
  );
};
```

2. **Add route:**
```tsx
// apps/web/src/App.tsx
import { MyPage } from './pages/MyPage';

<Routes>
  <Route path="/my-page" element={<MyPage />} />
</Routes>
```

3. **Add navigation (if needed):**
```tsx
<Link to="/my-page">My Page</Link>
```

### Database Migrations

**Create migration:**
```sql
-- database/migrations/006_add_new_table.sql
CREATE TABLE IF NOT EXISTS my_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Run migration:**
```bash
cd backend
npm run db:migrate
```

### Cache Invalidation

```javascript
const { invalidateEndpoint, clearCache } = require('./middleware/cache');

// Invalidate specific endpoint cache
await invalidateEndpoint('/books');

// Invalidate by pattern
await invalidateCache('api:GET:/books:*');

// Clear all caches
await clearCache();
```

---

## Troubleshooting

### Common Issues

#### "Port 3000 already in use"
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### "Database connection refused"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Start PostgreSQL
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or for frontend/backend specifically
cd apps/web && rm -rf node_modules && npm install
```

#### Hot reload not working
```bash
# Restart dev server
# Ctrl+C then npm run dev

# Or rebuild Docker container
docker-compose up -d --build
```

#### TypeScript errors in IDE
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or rebuild
cd apps/web
npm run build
```

### Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Ask in team chat
4. Create a GitHub issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

---

## Resources

### Documentation
- [Project README](../README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [ADRs](./adr/README.md)
- [API Documentation](http://localhost:3001/api-docs)
- [Deployment Guide](../DEPLOYMENT.md)

### External Resources
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL GUI
- [RedisInsight](https://redis.io/insight/) - Redis GUI

---

**Last Updated:** 2025-11-25
**Questions?** Create an issue or ask in team chat
