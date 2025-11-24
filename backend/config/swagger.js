/**
 * Swagger/OpenAPI Configuration
 *
 * API 문서화를 위한 Swagger 설정
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Education Platform API',
      version: '1.0.0',
      description: '구독형 영어 원서 읽기 플랫폼 API 문서',
      contact: {
        name: 'Education Platform Support',
        email: 'support@education-platform.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.education-platform.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 사용한 인증. 로그인 후 받은 토큰을 입력하세요.',
        },
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            username: { type: 'string', example: 'johndoe' },
            role: { type: 'string', enum: ['student', 'teacher', 'admin'], example: 'student' },
            email_verified: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', example: 1 },
            full_name: { type: 'string', example: 'John Doe' },
            avatar_url: { type: 'string', format: 'uri', nullable: true },
            bio: { type: 'string', nullable: true },
            language_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
            learning_goals: { type: 'array', items: { type: 'string' } },
          },
        },

        // Authentication Schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', format: 'password', example: 'SecurePass123!' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'username'],
          properties: {
            email: { type: 'string', format: 'email', example: 'newuser@example.com' },
            password: { type: 'string', format: 'password', example: 'SecurePass123!' },
            username: { type: 'string', example: 'newuser' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: '로그인 성공' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },

        // Book Schemas
        Book: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'The Great Gatsby' },
            author: { type: 'string', example: 'F. Scott Fitzgerald' },
            description: { type: 'string' },
            cover_image_url: { type: 'string', format: 'uri' },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
            category_id: { type: 'integer', example: 1 },
            is_published: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Chapter: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            book_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Chapter 1: Introduction' },
            content: { type: 'string' },
            chapter_number: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // Subscription Schemas
        SubscriptionPlan: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Monthly Plan' },
            description: { type: 'string' },
            price: { type: 'number', format: 'float', example: 9.99 },
            duration_days: { type: 'integer', example: 30 },
            features: { type: 'array', items: { type: 'string' } },
            is_active: { type: 'boolean', example: true },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            plan_id: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['active', 'cancelled', 'expired'], example: 'active' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // Payment Schemas
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            amount: { type: 'number', format: 'float', example: 9.99 },
            currency: { type: 'string', example: 'USD' },
            status: { type: 'string', enum: ['pending', 'succeeded', 'failed'], example: 'succeeded' },
            payment_method: { type: 'string', example: 'stripe' },
            stripe_payment_id: { type: 'string', example: 'pi_1234567890' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // Quiz Schemas
        Quiz: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            chapter_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Chapter 1 Quiz' },
            description: { type: 'string' },
            passing_score: { type: 'integer', example: 70 },
            time_limit_minutes: { type: 'integer', example: 30, nullable: true },
          },
        },
        QuizAttempt: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            quiz_id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            score: { type: 'number', format: 'float', example: 85.5 },
            passed: { type: 'boolean', example: true },
            started_at: { type: 'string', format: 'date-time' },
            completed_at: { type: 'string', format: 'date-time' },
          },
        },

        // Error Schemas
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: '오류가 발생했습니다' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: '입력 데이터가 올바르지 않습니다' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: '유효한 이메일을 입력해주세요' },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: '인증 실패',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: '인증이 필요합니다' },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: '권한 없음',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: '권한이 없습니다' },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: '리소스를 찾을 수 없음',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: '요청한 리소스를 찾을 수 없습니다' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: '입력 검증 실패',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        InternalServerError: {
          description: '서버 내부 오류',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: '서버 오류가 발생했습니다' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: '인증 관련 API' },
      { name: 'Users', description: '사용자 관리 API' },
      { name: 'Books', description: '도서 관리 API' },
      { name: 'Chapters', description: '챕터 관리 API' },
      { name: 'Audio', description: '오디오 관리 API' },
      { name: 'Quizzes', description: '퀴즈 관리 API' },
      { name: 'Subscriptions', description: '구독 관리 API' },
      { name: 'Payments', description: '결제 관리 API' },
      { name: 'Progress', description: '학습 진도 API' },
      { name: 'Vocabulary', description: '단어장 API' },
      { name: 'Reviews', description: '리뷰 관리 API' },
      { name: 'Admin', description: '관리자 API' },
      { name: 'Analytics', description: '분석 API' },
      { name: 'AI', description: 'AI 기능 API' },
      { name: 'Search', description: '검색 API' },
      { name: 'Notifications', description: '알림 API' },
      { name: 'Health', description: '헬스 체크 API' },
    ],
  },
  apis: ['./routes/*.js', './server.js'], // JSDoc 주석이 있는 파일 경로
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
