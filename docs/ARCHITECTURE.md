# System Architecture Documentation
## Education Platform 2025

Last Updated: 2025-11-25

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Infrastructure Architecture](#infrastructure-architecture)
5. [Security Architecture](#security-architecture)
6. [Monitoring Architecture](#monitoring-architecture)

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "CDN & Load Balancer"
        CDN[CloudFront CDN]
        LB[Nginx Load Balancer]
    end

    subgraph "Application Layer"
        FE[Frontend - React/Vite]
        BE1[Backend API - Node.js]
        BE2[Backend API - Node.js]
        BE3[Backend API - Node.js]
        WS[WebSocket - Socket.IO]
    end

    subgraph "Caching Layer"
        Redis[(Redis Cache)]
        Memory[In-Memory Cache]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        S3[AWS S3 - File Storage]
    end

    subgraph "External Services"
        Stripe[Stripe - Payments]
        SendGrid[SendGrid - Email]
        GoogleAuth[Google OAuth]
        KakaoAuth[Kakao OAuth]
        OpenAI[OpenAI - AI Features]
    end

    subgraph "Monitoring & Observability"
        Prometheus[Prometheus - Metrics]
        Grafana[Grafana - Dashboards]
        Loki[Loki - Logs]
        Sentry[Sentry - Errors]
        Alertmanager[Alertmanager - Alerts]
    end

    Web --> CDN
    Mobile --> CDN
    CDN --> LB
    LB --> FE
    FE --> BE1
    FE --> BE2
    FE --> BE3
    FE --> WS

    BE1 --> Redis
    BE2 --> Redis
    BE3 --> Redis
    BE1 --> Memory
    BE2 --> Memory
    BE3 --> Memory

    BE1 --> DB
    BE2 --> DB
    BE3 --> DB
    BE1 --> S3

    BE1 --> Stripe
    BE1 --> SendGrid
    BE1 --> GoogleAuth
    BE1 --> KakaoAuth
    BE1 --> OpenAI

    BE1 --> Prometheus
    BE2 --> Prometheus
    BE3 --> Prometheus
    Prometheus --> Grafana
    Prometheus --> Alertmanager
    BE1 --> Loki
    BE1 --> Sentry

    style Web fill:#4285F4
    style Mobile fill:#4285F4
    style FE fill:#61DAFB
    style BE1 fill:#68A063
    style BE2 fill:#68A063
    style BE3 fill:#68A063
    style DB fill:#336791
    style Redis fill:#DC382D
    style Prometheus fill:#E6522C
    style Grafana fill:#F46800
```

---

## Component Architecture

### Frontend Architecture

```mermaid
graph TB
    subgraph "React Application"
        Router[React Router]

        subgraph "Pages"
            Home[Home Page]
            Books[Books Page]
            Reader[Book Reader]
            Dashboard[User Dashboard]
            Auth[Auth Pages]
        end

        subgraph "State Management"
            Query[TanStack Query - Server State]
            Zustand[Zustand - Client State]
        end

        subgraph "UI Components"
            Layout[Layout Components]
            Forms[Form Components]
            Cards[Card Components]
            Modals[Modal Components]
        end

        subgraph "Utilities"
            API[API Client - Axios]
            Auth_Utils[Auth Utilities]
            Hooks[Custom Hooks]
        end
    end

    Router --> Home
    Router --> Books
    Router --> Reader
    Router --> Dashboard
    Router --> Auth

    Home --> Layout
    Home --> Cards
    Books --> Layout
    Books --> Cards
    Reader --> Layout
    Dashboard --> Layout
    Dashboard --> Forms

    Home --> Query
    Books --> Query
    Reader --> Query
    Dashboard --> Query

    Query --> API
    Auth --> Auth_Utils
    API --> Auth_Utils

    style Router fill:#61DAFB
    style Query fill:#FF4154
    style Zustand fill:#443E38
    style API fill:#5A29E4
```

### Backend Architecture

```mermaid
graph TB
    subgraph "Express Application"
        Server[Express Server]

        subgraph "Middleware Layer"
            CORS[CORS]
            Helmet[Helmet - Security]
            RateLimit[Rate Limiter]
            Auth[JWT Auth]
            CSRF[CSRF Protection]
            Metrics[Metrics Collection]
            Cache[Cache Middleware]
            Logger[Request Logger]
        end

        subgraph "Routes"
            AuthRoute[/auth - Authentication]
            UserRoute[/users - User Management]
            BookRoute[/books - Book Catalog]
            ProgressRoute[/progress - Learning Progress]
            SubRoute[/subscriptions - Subscriptions]
            PaymentRoute[/payments - Payments]
            AIRoute[/ai - AI Features]
        end

        subgraph "Services"
            AuthService[Auth Service]
            UserService[User Service]
            BookService[Book Service]
            PaymentService[Payment Service]
            EmailService[Email Service]
            AIService[AI Service]
        end

        subgraph "Data Access"
            DB_Pool[Database Pool]
            Redis_Client[Redis Client]
            S3_Client[S3 Client]
        end
    end

    Server --> CORS
    CORS --> Helmet
    Helmet --> RateLimit
    RateLimit --> Auth
    Auth --> CSRF
    CSRF --> Metrics
    Metrics --> Cache
    Cache --> Logger

    Logger --> AuthRoute
    Logger --> UserRoute
    Logger --> BookRoute
    Logger --> ProgressRoute
    Logger --> SubRoute
    Logger --> PaymentRoute
    Logger --> AIRoute

    AuthRoute --> AuthService
    UserRoute --> UserService
    BookRoute --> BookService
    SubRoute --> PaymentService
    PaymentRoute --> PaymentService
    AIRoute --> AIService

    AuthService --> DB_Pool
    UserService --> DB_Pool
    BookService --> DB_Pool
    PaymentService --> DB_Pool

    BookService --> Redis_Client
    BookService --> S3_Client
    AuthService --> EmailService

    style Server fill:#68A063
    style Auth fill:#FFA500
    style Metrics fill:#E6522C
    style Cache fill:#DC382D
    style DB_Pool fill:#336791
```

---

## Data Flow

### User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant JWT

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Query user by email
    Database-->>Backend: User record
    Backend->>Backend: Verify password (bcrypt)
    Backend->>JWT: Generate access + refresh tokens
    JWT-->>Backend: Tokens
    Backend->>Backend: Set HTTP-only cookies
    Backend-->>Frontend: 200 OK + tokens in cookies
    Frontend->>Frontend: Store user in state
    Frontend-->>User: Redirect to dashboard

    Note over User,Database: Subsequent requests include cookies automatically
    User->>Frontend: Navigate to protected page
    Frontend->>Backend: GET /api/users/me (with cookies)
    Backend->>JWT: Verify access token
    JWT-->>Backend: Token valid, user ID
    Backend->>Database: Get user details
    Database-->>Backend: User data
    Backend-->>Frontend: User data
    Frontend-->>User: Display user info
```

### Book Reading Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Redis
    participant Database
    participant S3

    User->>Frontend: Click on book
    Frontend->>Backend: GET /api/books/:id
    Backend->>Redis: Check cache

    alt Cache hit
        Redis-->>Backend: Cached book data
    else Cache miss
        Backend->>Database: Query book
        Database-->>Backend: Book record
        Backend->>Redis: Store in cache (30 min TTL)
    end

    Backend-->>Frontend: Book metadata
    Frontend-->>User: Display book details

    User->>Frontend: Start reading chapter
    Frontend->>Backend: GET /api/chapters/:id
    Backend->>Redis: Check cache

    alt Cache hit
        Redis-->>Backend: Cached chapter
    else Cache miss
        Backend->>Database: Query chapter
        Database-->>Backend: Chapter data
        Backend->>S3: Get audio file URL (if exists)
        S3-->>Backend: Signed URL
        Backend->>Redis: Store in cache
    end

    Backend-->>Frontend: Chapter content + audio URL
    Frontend-->>User: Display chapter

    User->>Frontend: Mark progress
    Frontend->>Backend: POST /api/progress
    Backend->>Database: Update progress
    Backend->>Redis: Invalidate progress cache
    Database-->>Backend: Updated progress
    Backend-->>Frontend: Success
    Frontend-->>User: Progress saved
```

### Payment Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant Stripe
    participant Email

    User->>Frontend: Select subscription plan
    Frontend->>Backend: POST /api/subscriptions/create
    Backend->>Stripe: Create checkout session
    Stripe-->>Backend: Session URL
    Backend-->>Frontend: Checkout URL
    Frontend-->>User: Redirect to Stripe

    User->>Stripe: Enter payment info
    Stripe->>Backend: Webhook: payment_intent.succeeded
    Backend->>Database: Create subscription record
    Backend->>Database: Update user subscription_tier
    Backend->>Email: Send confirmation email
    Backend-->>Stripe: Webhook acknowledged
    Stripe-->>User: Redirect to success page

    User->>Frontend: Return to app
    Frontend->>Backend: GET /api/users/me
    Backend->>Database: Get updated user
    Database-->>Backend: User with new tier
    Backend-->>Frontend: Updated user data
    Frontend-->>User: Show subscription active
```

---

## Infrastructure Architecture

### Production Deployment

```mermaid
graph TB
    subgraph "Internet"
        Users[Users]
    end

    subgraph "AWS / Cloud Provider"
        subgraph "CDN"
            CF[CloudFront CDN]
        end

        subgraph "Load Balancer"
            ALB[Application Load Balancer]
        end

        subgraph "Compute"
            subgraph "Auto Scaling Group"
                EC2_1[EC2 Instance 1<br/>Docker/PM2]
                EC2_2[EC2 Instance 2<br/>Docker/PM2]
                EC2_3[EC2 Instance 3<br/>Docker/PM2]
            end
        end

        subgraph "Data Services"
            RDS[(RDS PostgreSQL<br/>Multi-AZ)]
            ElastiCache[(ElastiCache Redis<br/>Cluster)]
            S3_Bucket[(S3 Bucket<br/>Static Assets)]
        end

        subgraph "Monitoring"
            CW[CloudWatch]
            Prometheus_Server[Prometheus]
            Grafana_Server[Grafana]
        end
    end

    subgraph "External SaaS"
        Sentry_Cloud[Sentry]
        Stripe_Cloud[Stripe]
    end

    Users --> CF
    CF --> ALB
    ALB --> EC2_1
    ALB --> EC2_2
    ALB --> EC2_3

    EC2_1 --> RDS
    EC2_1 --> ElastiCache
    EC2_1 --> S3_Bucket
    EC2_2 --> RDS
    EC2_2 --> ElastiCache
    EC2_3 --> RDS
    EC2_3 --> ElastiCache

    EC2_1 --> Sentry_Cloud
    EC2_1 --> Stripe_Cloud

    EC2_1 --> Prometheus_Server
    EC2_2 --> Prometheus_Server
    EC2_3 --> Prometheus_Server
    Prometheus_Server --> Grafana_Server
    EC2_1 --> CW
    EC2_2 --> CW
    EC2_3 --> CW

    style CF fill:#FF9900
    style ALB fill:#FF9900
    style RDS fill:#527FFF
    style ElastiCache fill:#DC382D
    style S3_Bucket fill:#569A31
```

### Development Environment

```mermaid
graph TB
    subgraph "Developer Machine"
        subgraph "Docker Compose"
            Frontend[Frontend Container<br/>Vite Dev Server<br/>Port 3000]
            Backend[Backend Container<br/>Node.js + Nodemon<br/>Port 3001]
            Postgres[PostgreSQL Container<br/>Port 5432]
            Redis_Dev[Redis Container<br/>Port 6379]
            Monitoring[Monitoring Stack<br/>Prometheus + Grafana]
        end

        IDE[VS Code / IDE]
        Git[Git Repository]
    end

    IDE --> Git
    IDE --> Frontend
    IDE --> Backend

    Frontend --> Backend
    Backend --> Postgres
    Backend --> Redis_Dev
    Backend --> Monitoring

    style Frontend fill:#61DAFB
    style Backend fill:#68A063
    style Postgres fill:#336791
    style Redis_Dev fill:#DC382D
```

---

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
        SSL[SSL/TLS Encryption]
    end

    subgraph "Application Security"
        Helmet[Helmet - Security Headers]
        CORS_Policy[CORS Policy]
        RateLimit_Layer[Rate Limiting]
        CSRF_Token[CSRF Protection]
        XSS_Prevention[XSS Prevention]
        SQL_Injection[SQL Injection Prevention]
    end

    subgraph "Authentication & Authorization"
        JWT_Auth[JWT Authentication]
        OAuth[OAuth 2.0]
        RBAC[Role-Based Access Control]
        Session[Session Management]
    end

    subgraph "Data Security"
        Encryption[Encryption at Rest]
        Hashing[Password Hashing - bcrypt]
        Secrets[Secrets Management]
        Backup[Encrypted Backups]
    end

    subgraph "Monitoring & Compliance"
        Audit[Audit Logs]
        SIEM[Security Monitoring]
        Vulnerability[Vulnerability Scanning]
        Compliance[GDPR Compliance]
    end

    WAF --> Helmet
    DDoS --> RateLimit_Layer
    SSL --> CORS_Policy

    Helmet --> JWT_Auth
    CSRF_Token --> JWT_Auth
    XSS_Prevention --> SQL_Injection

    JWT_Auth --> RBAC
    OAuth --> RBAC

    RBAC --> Encryption
    Session --> Hashing

    Encryption --> Audit
    Secrets --> Audit
    Audit --> SIEM
    SIEM --> Vulnerability

    style WAF fill:#FF4444
    style JWT_Auth fill:#FFA500
    style Encryption fill:#4CAF50
    style Audit fill:#2196F3
```

---

## Monitoring Architecture

### Observability Stack

```mermaid
graph TB
    subgraph "Application"
        App1[Backend Instance 1]
        App2[Backend Instance 2]
        App3[Backend Instance 3]
        Frontend_App[Frontend]
    end

    subgraph "Metrics Collection"
        Prom[Prometheus]
        Node_Exporter[Node Exporter]
        Postgres_Exporter[Postgres Exporter]
        Redis_Exporter[Redis Exporter]
        cAdvisor[cAdvisor]
    end

    subgraph "Log Aggregation"
        Promtail[Promtail]
        Loki_Server[Loki]
    end

    subgraph "Error Tracking"
        Sentry_Backend[Sentry - Backend]
        Sentry_Frontend[Sentry - Frontend]
    end

    subgraph "Visualization"
        Grafana[Grafana]
        subgraph "Dashboards"
            API_Dashboard[API Overview]
            DORA_Dashboard[DORA Metrics]
            System_Dashboard[System Metrics]
            Business_Dashboard[Business Metrics]
        end
    end

    subgraph "Alerting"
        Alertmanager[Alertmanager]
        subgraph "Channels"
            Slack[Slack]
            Email_Alert[Email]
            PagerDuty[PagerDuty]
        end
    end

    App1 --> Prom
    App2 --> Prom
    App3 --> Prom
    Frontend_App --> Sentry_Frontend

    Node_Exporter --> Prom
    Postgres_Exporter --> Prom
    Redis_Exporter --> Prom
    cAdvisor --> Prom

    App1 --> Promtail
    App2 --> Promtail
    App3 --> Promtail
    Promtail --> Loki_Server

    App1 --> Sentry_Backend
    App2 --> Sentry_Backend
    App3 --> Sentry_Backend

    Prom --> Grafana
    Loki_Server --> Grafana
    Grafana --> API_Dashboard
    Grafana --> DORA_Dashboard
    Grafana --> System_Dashboard
    Grafana --> Business_Dashboard

    Prom --> Alertmanager
    Alertmanager --> Slack
    Alertmanager --> Email_Alert
    Alertmanager --> PagerDuty

    style Prom fill:#E6522C
    style Grafana fill:#F46800
    style Loki_Server fill:#F9B716
    style Sentry_Backend fill:#362D59
    style Alertmanager fill:#E25822
```

---

## Technology Stack Summary

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** TanStack Query + Zustand
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **Caching:** Redis 7
- **Authentication:** JWT + OAuth 2.0 (Google, Kakao)
- **Real-time:** Socket.IO
- **Logging:** Winston

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Process Manager:** PM2 (alternative to Docker)
- **Web Server:** Nginx
- **Monitoring:** Prometheus + Grafana + Loki
- **Error Tracking:** Sentry
- **CI/CD:** GitHub Actions

### External Services
- **Payments:** Stripe
- **Email:** SendGrid
- **Storage:** AWS S3
- **AI:** OpenAI GPT-4
- **CDN:** CloudFront (optional)

---

## Architecture Principles

### Design Principles

1. **Separation of Concerns**
   - Frontend handles UI/UX
   - Backend handles business logic
   - Database handles data persistence
   - Cache handles performance

2. **Scalability**
   - Stateless backend (horizontal scaling)
   - Database connection pooling
   - Redis caching layer
   - CDN for static assets

3. **Resilience**
   - Graceful degradation
   - Health checks and auto-recovery
   - Circuit breakers for external services
   - Comprehensive error handling

4. **Security First**
   - Defense in depth
   - Least privilege access
   - Encryption at rest and in transit
   - Regular security audits

5. **Observability**
   - Comprehensive metrics
   - Structured logging
   - Distributed tracing ready
   - Proactive alerting

### Performance Targets

- **API Response Time:** <200ms (P95)
- **Database Query Time:** <100ms (P95)
- **Cache Hit Rate:** >80%
- **Frontend Load Time:** <2s (FCP)
- **Uptime:** >99.9%

---

## Related Documentation

- [Architecture Decision Records](adr/README.md) - Key architectural decisions
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide
- [ELITE_METHODOLOGY_CHECKLIST.md](../ELITE_METHODOLOGY_CHECKLIST.md) - Implementation status

---

**Last Updated:** 2025-11-25
**Maintained By:** Development Team
**Version:** 1.0
