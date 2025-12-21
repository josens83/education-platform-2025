# Contributing to Education Platform

Thank you for your interest in contributing to the Education Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Reporting Bugs](#reporting-bugs)
10. [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- **Be respectful** and considerate in all interactions
- **Be collaborative** and help others learn and grow
- **Be patient** with those who are new to the project
- **Focus on what is best** for the community and project
- **Show empathy** towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or derogatory comments
- Trolling, insulting comments, or personal attacks
- Publishing others' private information
- Any conduct that could be considered inappropriate in a professional setting

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v16+)
- PostgreSQL (v15+)
- Redis (v7+)
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/education-platform-2025.git
cd education-platform-2025
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/josens83/education-platform-2025.git
```

### Initial Setup

1. **Install dependencies:**
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd apps/web
npm install
cd ../..
```

2. **Configure environment:**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your local configuration

# Frontend
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your local configuration
```

3. **Setup database:**
```bash
# Create database
createdb education_platform

# Run migrations
cd backend
npm run db:migrate:up

# Seed demo data (optional)
npm run db:seed
```

4. **Start development servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clear, readable code
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed
- Keep commits small and focused

### 3. Test Your Changes

```bash
# Backend tests
cd backend
npm test
npm run lint

# Frontend tests
cd apps/web
npm test
npm run lint

# E2E tests (if applicable)
npm run test:e2e
```

### 4. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Coding Standards

### JavaScript/TypeScript

**Style Guide:**
- Use **ESLint** configuration provided in the project
- Use **Prettier** for code formatting (run `npm run format`)
- Use **meaningful variable names** (avoid single letters except in loops)
- **Comment complex logic** but avoid obvious comments
- Use **async/await** instead of promises chains
- **Handle errors** properly with try/catch

**Example:**
```javascript
// ❌ Bad
async function getData(id) {
  const d = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return d.rows[0];
}

// ✅ Good
async function getUserById(userId) {
  try {
    const result = await pool.query(
      'SELECT id, email, username FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    throw new Error('Database query failed');
  }
}
```

### React/Frontend

- Use **functional components** with hooks
- Keep components **small and focused** (< 200 lines)
- Use **TypeScript** for type safety
- Extract **reusable logic** into custom hooks
- Follow **React best practices** for performance (memo, useCallback, useMemo)

**Example:**
```typescript
// ✅ Good
interface BookCardProps {
  book: Book;
  onSelect: (bookId: number) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(book.id);
  }, [book.id, onSelect]);

  return (
    <div className="book-card" onClick={handleClick}>
      <h3>{book.title}</h3>
      <p>{book.author}</p>
    </div>
  );
};

export default memo(BookCard);
```

### Database

- Use **parameterized queries** (never string concatenation)
- Create **indexes** for frequently queried columns
- Write **migrations** for schema changes
- Use **transactions** for multi-step operations

**Example:**
```javascript
// ❌ Bad - SQL Injection vulnerability!
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good - Parameterized query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await pool.query(query, [email]);
```

### API Design

- Use **RESTful conventions**
- Return **consistent response formats**
- Include **appropriate HTTP status codes**
- Validate **all input data**
- Document **all endpoints** with Swagger/JSDoc

**Response Format:**
```javascript
// Success
{
  "success": true,
  "data": { /* result */ }
}

// Error
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

---

## Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
feat(auth): add two-factor authentication support

Implement TOTP-based 2FA using speakeasy library.
Users can enable 2FA in their profile settings.

Closes #123

---

fix(payments): prevent duplicate payment processing

Add transaction locking to prevent race conditions
when processing payments.

Fixes #456

---

docs(api): update authentication endpoints documentation

Add examples for OAuth login flow and refresh tokens.
```

### Commit Best Practices

- **One commit per logical change**
- **Write clear, descriptive messages**
- **Use present tense** ("add feature" not "added feature")
- **Reference issues** when applicable
- **Keep commits atomic** (can be reverted independently)

---

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Documentation is updated
- [ ] New tests added for new features
- [ ] Branch is rebased on latest `main`
- [ ] Commit messages follow guidelines

### PR Title

Follow the same format as commit messages:
```
feat(auth): add OAuth login support
fix(api): resolve race condition in payment processing
```

### PR Description

Use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran to verify your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Closes #123
Relates to #456
```

### Review Process

1. **Automated checks** will run (CI/CD, linting, tests)
2. **Code review** by maintainers
3. **Address feedback** and make requested changes
4. **Approval** from at least one maintainer
5. **Merge** by maintainers

### After Merge

- Delete your feature branch
- Pull the latest `main` branch
- Thank the reviewers! 🙏

---

## Testing Guidelines

### Test Coverage

- Aim for **>80% code coverage**
- Write tests for **all new features**
- Include **edge cases** and error scenarios
- Test **both success and failure** paths

### Backend Tests

```javascript
// Example: Integration test
describe('POST /api/auth/login', () => {
  it('should login user with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });

  it('should return 401 for invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});
```

### Frontend Tests

```typescript
// Example: Component test
import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from './BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author'
  };

  it('renders book information', () => {
    render(<BookCard book={mockBook} onSelect={jest.fn()} />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<BookCard book={mockBook} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Test Book'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
```

---

## Documentation

### When to Update Documentation

- Adding new features
- Changing API endpoints
- Modifying environment variables
- Updating deployment process
- Adding new dependencies

### Documentation Locations

- **API Documentation**: Update Swagger/JSDoc comments in route files
- **Setup Instructions**: Update README.md
- **Deployment**: Update docs/DEPLOYMENT.md
- **Code Examples**: Update docs/API_EXAMPLES.md

### Writing Good Documentation

- **Be clear and concise**
- **Include code examples**
- **Show expected outputs**
- **Document edge cases**
- **Keep it up to date**

---

## Reporting Bugs

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Check if it's already fixed** in the latest version
3. **Verify it's reproducible** on a clean install

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Ubuntu 22.04]
 - Node version: [e.g. 18.17.0]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

---

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Are you willing to implement this feature?**
- [ ] Yes, I can work on this
- [ ] No, but I can help with testing
- [ ] No, just suggesting
```

---

## Questions?

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussions
- **Email**: For private inquiries

---

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Project README.md (for significant contributions)
- Release notes (for features and major fixes)

Thank you for contributing! 🎉
