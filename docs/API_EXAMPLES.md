# API Usage Examples

Complete API usage examples for the Education Platform API.

## Table of Contents

1. [Authentication](#authentication)
2. [Books & Content](#books--content)
3. [Subscriptions](#subscriptions)
4. [Payments](#payments)
5. [User Management](#user-management)
6. [Learning Progress](#learning-progress)
7. [Vocabulary & Notes](#vocabulary--notes)
8. [Admin Operations](#admin-operations)
9. [Error Handling](#error-handling)

---

## Authentication

### Register a New User

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123!",
    "username": "John Doe"
  }'
```

**JavaScript/TypeScript:**
```typescript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'student@example.com',
    password: 'SecurePass123!',
    username: 'John Doe',
  }),
});

const data = await response.json();
console.log('Token:', data.data.token);
console.log('User:', data.data.user);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "student@example.com",
      "username": "John Doe",
      "role": "student",
      "created_at": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

### Login

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123!"
  }'
```

**JavaScript/TypeScript:**
```typescript
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const { data } = await response.json();

  // Store token for future requests
  localStorage.setItem('authToken', data.token);

  return data;
}
```

### Forgot Password

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_email",
    "password": "NewSecurePass123!"
  }'
```

---

## Books & Content

### Get All Books

**cURL:**
```bash
curl -X GET http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getBooks(filters?: {
  category?: string;
  difficulty?: string;
  search?: string;
}) {
  const params = new URLSearchParams(filters as any);

  const response = await fetch(`http://localhost:5000/api/books?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}

// Usage
const books = await getBooks({ difficulty: 'intermediate', search: 'business' });
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Business English Basics",
      "author": "John Smith",
      "difficulty": "intermediate",
      "category_id": 2,
      "category_name": "Business",
      "cover_image_url": "https://cdn.example.com/covers/book1.jpg",
      "audio_url": "https://cdn.example.com/audio/book1.mp3",
      "description": "Learn essential business English vocabulary and phrases",
      "total_chapters": 12,
      "estimated_hours": 8
    }
  ]
}
```

### Get Book Details

**cURL:**
```bash
curl -X GET http://localhost:5000/api/books/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getBookDetails(bookId: number) {
  const response = await fetch(`http://localhost:5000/api/books/${bookId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Business English Basics",
    "author": "John Smith",
    "difficulty": "intermediate",
    "chapters": [
      {
        "id": 1,
        "chapter_number": 1,
        "title": "Introduction to Business Communication",
        "content": "In this chapter, we'll explore...",
        "audio_url": "https://cdn.example.com/audio/book1_ch1.mp3",
        "estimated_minutes": 30
      }
    ],
    "user_progress": {
      "completed_chapters": 3,
      "total_chapters": 12,
      "percentage": 25
    }
  }
}
```

### Search Books

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/books/search?q=business&difficulty=intermediate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function searchBooks(query: string, filters?: {
  difficulty?: string;
  category?: string;
}) {
  const params = new URLSearchParams({
    q: query,
    ...filters,
  } as any);

  const response = await fetch(`http://localhost:5000/api/books/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}
```

---

## Subscriptions

### Get Subscription Plans

**cURL:**
```bash
curl -X GET http://localhost:5000/api/subscriptions/plans
```

**JavaScript/TypeScript:**
```typescript
async function getSubscriptionPlans() {
  const response = await fetch('http://localhost:5000/api/subscriptions/plans');
  return await response.json();
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Basic",
      "price": 9900,
      "duration_days": 30,
      "features": [
        "Access to 50+ books",
        "Basic quizzes",
        "Progress tracking"
      ],
      "is_active": true
    },
    {
      "id": 2,
      "name": "Premium",
      "price": 29900,
      "duration_days": 30,
      "features": [
        "Access to all books",
        "Advanced quizzes",
        "Progress tracking",
        "Audio content",
        "AI tutor support"
      ],
      "is_active": true
    }
  ]
}
```

### Get My Subscription

**cURL:**
```bash
curl -X GET http://localhost:5000/api/subscriptions/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getMySubscription() {
  const response = await fetch('http://localhost:5000/api/subscriptions/my', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "plan_name": "Premium",
    "status": "active",
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-02-01T00:00:00.000Z",
    "auto_renew": true,
    "days_remaining": 17
  }
}
```

### Create Subscription

**cURL:**
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 2,
    "coupon_code": "WELCOME2025"
  }'
```

**JavaScript/TypeScript:**
```typescript
async function createSubscription(planId: number, couponCode?: string) {
  const response = await fetch('http://localhost:5000/api/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      coupon_code: couponCode,
    }),
  });

  return await response.json();
}
```

### Cancel Subscription

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/subscriptions/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Payments

### Create Checkout Session (Stripe)

**cURL:**
```bash
curl -X POST http://localhost:5000/api/payments/create-checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 2,
    "coupon_code": "WELCOME2025"
  }'
```

**JavaScript/TypeScript:**
```typescript
async function createCheckoutSession(planId: number, couponCode?: string) {
  const response = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      coupon_code: couponCode,
    }),
  });

  const { data } = await response.json();

  // Redirect to Stripe Checkout
  window.location.href = data.url;
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
  }
}
```

### Verify Payment Session

**cURL:**
```bash
curl -X GET http://localhost:5000/api/payments/verify-session/cs_test_a1b2c3d4e5f6g7h8i9j0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function verifyPayment(sessionId: string) {
  const response = await fetch(`http://localhost:5000/api/payments/verify-session/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}

// Usage after Stripe redirect
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  const result = await verifyPayment(sessionId);
  if (result.success) {
    console.log('Payment successful!');
  }
}
```

### Get Payment History

**cURL:**
```bash
curl -X GET http://localhost:5000/api/payments/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getPaymentHistory() {
  const response = await fetch('http://localhost:5000/api/payments/history', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 29900,
      "currency": "KRW",
      "status": "completed",
      "plan_name": "Premium",
      "payment_method": "card",
      "created_at": "2025-01-01T10:30:00.000Z",
      "stripe_session_id": "cs_test_a1b2c3d4e5f6g7h8i9j0"
    }
  ]
}
```

---

## User Management

### Get Profile

**cURL:**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getUserProfile() {
  const response = await fetch('http://localhost:5000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}
```

### Update Profile

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Updated",
    "bio": "Passionate about learning English",
    "learning_goal": "Business communication"
  }'
```

**JavaScript/TypeScript:**
```typescript
async function updateProfile(updates: {
  username?: string;
  bio?: string;
  learning_goal?: string;
}) {
  const response = await fetch('http://localhost:5000/api/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return await response.json();
}
```

### Upload Profile Picture

**cURL:**
```bash
curl -X POST http://localhost:5000/api/users/profile-picture \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg"
```

**JavaScript/TypeScript:**
```typescript
async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await fetch('http://localhost:5000/api/users/profile-picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: formData,
  });

  return await response.json();
}

// Usage with file input
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const result = await uploadProfilePicture(file);
    console.log('New profile picture URL:', result.data.profile_picture_url);
  }
});
```

---

## Learning Progress

### Get Progress Summary

**cURL:**
```bash
curl -X GET http://localhost:5000/api/progress/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getProgressSummary() {
  const response = await fetch('http://localhost:5000/api/progress/summary', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_books_started": 5,
    "total_books_completed": 2,
    "total_chapters_completed": 38,
    "total_quizzes_completed": 15,
    "average_quiz_score": 85,
    "total_study_hours": 24.5,
    "current_streak_days": 7,
    "longest_streak_days": 14
  }
}
```

### Update Chapter Progress

**cURL:**
```bash
curl -X POST http://localhost:5000/api/progress/chapter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chapter_id": 5,
    "completed": true,
    "time_spent_minutes": 45
  }'
```

**JavaScript/TypeScript:**
```typescript
async function updateChapterProgress(
  chapterId: number,
  completed: boolean,
  timeSpentMinutes: number
) {
  const response = await fetch('http://localhost:5000/api/progress/chapter', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chapter_id: chapterId,
      completed,
      time_spent_minutes: timeSpentMinutes,
    }),
  });

  return await response.json();
}
```

### Submit Quiz Answer

**cURL:**
```bash
curl -X POST http://localhost:5000/api/quizzes/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": 3,
    "answers": [
      {"question_id": 1, "selected_option": 2},
      {"question_id": 2, "selected_option": 1}
    ]
  }'
```

**JavaScript/TypeScript:**
```typescript
interface QuizAnswer {
  question_id: number;
  selected_option: number;
}

async function submitQuiz(quizId: number, answers: QuizAnswer[]) {
  const response = await fetch('http://localhost:5000/api/quizzes/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quiz_id: quizId,
      answers,
    }),
  });

  return await response.json();
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "total_questions": 10,
    "correct_answers": 8,
    "passed": true,
    "details": [
      {
        "question_id": 1,
        "correct": true,
        "explanation": "The correct answer is B because..."
      }
    ]
  }
}
```

---

## Vocabulary & Notes

### Add Vocabulary

**cURL:**
```bash
curl -X POST http://localhost:5000/api/vocabulary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "ambiguous",
    "definition": "open to more than one interpretation",
    "example": "The ending of the movie was ambiguous.",
    "book_id": 1
  }'
```

**JavaScript/TypeScript:**
```typescript
async function addVocabulary(vocabulary: {
  word: string;
  definition: string;
  example?: string;
  book_id?: number;
}) {
  const response = await fetch('http://localhost:5000/api/vocabulary', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vocabulary),
  });

  return await response.json();
}
```

### Get My Vocabulary

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/vocabulary?book_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getVocabulary(bookId?: number) {
  const params = bookId ? `?book_id=${bookId}` : '';

  const response = await fetch(`http://localhost:5000/api/vocabulary${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  return await response.json();
}
```

### Create Note

**cURL:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "chapter_id": 5,
    "content": "Important concept about business communication",
    "page_number": 42
  }'
```

**JavaScript/TypeScript:**
```typescript
async function createNote(note: {
  book_id: number;
  chapter_id?: number;
  content: string;
  page_number?: number;
}) {
  const response = await fetch('http://localhost:5000/api/notes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  return await response.json();
}
```

### Add Bookmark

**cURL:**
```bash
curl -X POST http://localhost:5000/api/bookmarks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "chapter_id": 5,
    "page_number": 42
  }'
```

---

## Admin Operations

### Get All Users (Admin Only)

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**JavaScript/TypeScript:**
```typescript
async function getAllUsers(page = 1, limit = 20) {
  const response = await fetch(
    `http://localhost:5000/api/admin/users?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );

  return await response.json();
}
```

### Update User Role (Admin Only)

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/admin/users/123/role \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "teacher"
  }'
```

### Create Book (Teacher/Admin)

**cURL:**
```bash
curl -X POST http://localhost:5000/api/admin/books \
  -H "Authorization: Bearer TEACHER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Business English",
    "author": "Jane Doe",
    "difficulty": "advanced",
    "category_id": 2,
    "description": "Master advanced business communication"
  }'
```

### Get Platform Statistics (Admin)

**cURL:**
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 1543,
    "active_subscriptions": 892,
    "total_revenue": 26540000,
    "total_books": 156,
    "total_quizzes_taken": 12450,
    "average_completion_rate": 68.5
  }
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "AUTH_INVALID_CREDENTIALS",
    "status": 401
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `AUTH_INVALID_CREDENTIALS` | Invalid email/password |
| 401 | `AUTH_TOKEN_EXPIRED` | JWT token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| 404 | `RESOURCE_NOT_FOUND` | Requested resource not found |
| 409 | `RESOURCE_CONFLICT` | Resource already exists |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |

### Error Handling Example

**JavaScript/TypeScript:**
```typescript
async function apiRequest(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
try {
  const books = await apiRequest('http://localhost:5000/api/books');
  console.log('Books:', books.data);
} catch (error) {
  alert(`Error: ${error.message}`);
}
```

### Retry Logic for Rate Limiting

```typescript
async function apiRequestWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.status === 429) {
        // Rate limited, wait and retry
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }

      return data;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}
```

---

## Complete TypeScript Client Example

```typescript
class EducationPlatformAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request(
    endpoint: string,
    options?: RequestInit
  ): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  }

  // Authentication
  async register(email: string, password: string, username: string) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });

    this.token = data.token;
    localStorage.setItem('authToken', data.token);

    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = data.token;
    localStorage.setItem('authToken', data.token);

    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Books
  async getBooks(filters?: any) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/books?${params}`);
  }

  async getBook(bookId: number) {
    return this.request(`/api/books/${bookId}`);
  }

  // Subscriptions
  async getPlans() {
    return this.request('/api/subscriptions/plans');
  }

  async createSubscription(planId: number, couponCode?: string) {
    return this.request('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId, coupon_code: couponCode }),
    });
  }

  // Progress
  async updateChapterProgress(
    chapterId: number,
    completed: boolean,
    timeSpentMinutes: number
  ) {
    return this.request('/api/progress/chapter', {
      method: 'POST',
      body: JSON.stringify({
        chapter_id: chapterId,
        completed,
        time_spent_minutes: timeSpentMinutes,
      }),
    });
  }
}

// Usage
const api = new EducationPlatformAPI();

// Login
await api.login('student@example.com', 'SecurePass123!');

// Get books
const books = await api.getBooks({ difficulty: 'intermediate' });

// Update progress
await api.updateChapterProgress(5, true, 45);
```

---

## WebSocket Events

### Connect to Socket.IO

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('authToken'),
  },
});

socket.on('connect', () => {
  console.log('Connected to server');
});

// Join a study room
socket.emit('join-room', { roomId: 'book-1' });

// Listen for live study updates
socket.on('user-joined', (data) => {
  console.log(`${data.username} joined the study room`);
});

// Real-time progress updates
socket.on('progress-update', (data) => {
  console.log('Someone completed a chapter:', data);
});
```

---

## Rate Limiting

The API implements rate limiting:

- **Authentication endpoints**: 5 requests per 15 minutes
- **General API endpoints**: 100 requests per 15 minutes
- **Admin endpoints**: 200 requests per 15 minutes

When rate limited, you'll receive:

```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "code": "RATE_LIMIT_EXCEEDED",
    "status": 429
  }
}
```

The response includes a `Retry-After` header indicating how many seconds to wait.

---

For more information, visit:
- **API Documentation**: http://localhost:5000/api-docs
- **GitHub Repository**: https://github.com/josens83/education-platform-2025
