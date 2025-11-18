# Production Readiness Checklist

영어 학습 플랫폼을 프로덕션 환경에 배포하기 전에 확인해야 할 체크리스트입니다.

## 📋 목차
- [보안](#보안)
- [데이터베이스](#데이터베이스)
- [환경 변수](#환경-변수)
- [네트워크 및 인프라](#네트워크-및-인프라)
- [모니터링 및 로깅](#모니터링-및-로깅)
- [백업 및 복구](#백업-및-복구)
- [성능 최적화](#성능-최적화)
- [결제 시스템](#결제-시스템)
- [이메일 시스템](#이메일-시스템)
- [법적 준수](#법적-준수)
- [테스트](#테스트)
- [문서화](#문서화)

---

## 🔒 보안

### 필수 항목
- [ ] **JWT_SECRET 변경**: 강력한 랜덤 시크릿 키로 변경 (최소 32자)
  ```bash
  # 랜덤 시크릿 생성
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] **데이터베이스 비밀번호**: 강력한 비밀번호로 변경
  - 대소문자, 숫자, 특수문자 포함
  - 최소 16자 이상

- [ ] **환경 변수 파일 보안**
  - `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
  - 프로덕션 서버에서 파일 권한 설정: `chmod 600 backend/.env`

- [ ] **CORS 설정 검증**
  - `CORS_ORIGIN`을 프로덕션 도메인으로 변경
  - 와일드카드(`*`) 사용 금지

- [ ] **Rate Limiting 활성화**
  - 모든 엔드포인트에 적절한 rate limit 적용
  - DDoS 공격 대비

- [ ] **Helmet 보안 헤더 설정**
  - CSP, HSTS, X-Frame-Options 등 확인
  - `server.js`의 Helmet 설정 검토

- [ ] **SQL Injection 방어**
  - 모든 쿼리가 parameterized queries 사용하는지 확인
  - 사용자 입력이 직접 쿼리에 들어가지 않는지 확인

- [ ] **XSS 방어**
  - 모든 사용자 입력이 sanitize되는지 확인
  - React의 기본 XSS 방어 메커니즘 활용
  - `dangerouslySetInnerHTML` 사용 시 sanitize 필수

- [ ] **HTTPS 설정**
  - SSL/TLS 인증서 설치 (Let's Encrypt 권장)
  - HTTP → HTTPS 리다이렉트 설정
  - HSTS 헤더 활성화

### 권장 항목
- [ ] 2FA (Two-Factor Authentication) 구현
- [ ] 비밀번호 정책 강화 (최소 길이, 복잡도)
- [ ] 세션 타임아웃 설정
- [ ] IP 화이트리스트/블랙리스트
- [ ] WAF (Web Application Firewall) 설정

---

## 💾 데이터베이스

### 필수 항목
- [ ] **데이터베이스 마이그레이션**
  ```bash
  # 모든 마이그레이션 실행 확인
  psql -U postgres -d education_platform -f database/migrations/001_init_schema.sql
  psql -U postgres -d education_platform -f database/migrations/002_performance_indexes.sql
  psql -U postgres -d education_platform -f database/migrations/003_add_password_reset_fields.sql
  psql -U postgres -d education_platform -f database/migrations/004_add_email_verification.sql
  ```

- [ ] **인덱스 생성 확인**
  - 모든 성능 최적화 인덱스가 생성되었는지 확인
  - `002_performance_indexes.sql` 실행 확인

- [ ] **데이터베이스 연결 풀 설정**
  ```javascript
  // database/index.js에서 확인
  max: 20,  // 최대 연결 수
  min: 5,   // 최소 연결 수
  idle: 10000,  // 유휴 연결 시간
  ```

- [ ] **데이터베이스 백업 설정**
  - 자동 백업 스크립트 설정 (`scripts/backup-database.sh`)
  - cron job 등록
  ```bash
  # crontab -e
  0 2 * * * /path/to/scripts/backup-database.sh
  ```

- [ ] **데이터베이스 권한 설정**
  - 앱 전용 데이터베이스 사용자 생성
  - 필요한 최소 권한만 부여

### 권장 항목
- [ ] 읽기 전용 복제본 설정 (Read Replica)
- [ ] 연결 풀 모니터링
- [ ] 슬로우 쿼리 로그 활성화
- [ ] 정기적인 VACUUM 및 ANALYZE 실행

---

## ⚙️ 환경 변수

### 필수 항목
- [ ] **환경 변수 검증 실행**
  ```bash
  npm run check:env
  ```

- [ ] **프로덕션 환경 변수 설정**
  ```bash
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=postgresql://user:password@host:5432/education_platform
  JWT_SECRET=<strong-random-secret>
  STRIPE_SECRET_KEY=sk_live_...  # 테스트 키가 아닌 실제 키
  STRIPE_WEBHOOK_SECRET=whsec_...
  EMAIL_HOST=smtp.gmail.com
  EMAIL_USER=<real-email>
  EMAIL_PASSWORD=<app-password>
  ADMIN_EMAILS=admin@yourplatform.com,tech@yourplatform.com
  FRONTEND_URL=https://yourdomain.com
  CORS_ORIGIN=https://yourdomain.com
  ```

- [ ] **Stripe 프로덕션 키**
  - 테스트 모드에서 라이브 모드로 전환
  - `sk_live_...` 키 사용
  - Webhook 엔드포인트 등록 및 시크릿 업데이트

- [ ] **이메일 설정 검증**
  - 실제 이메일 전송 테스트
  - SMTP 서버 연결 확인
  - 스팸 필터 대비 SPF, DKIM, DMARC 설정

### 권장 항목
- [ ] Secrets Manager 사용 (AWS Secrets Manager, HashiCorp Vault)
- [ ] 환경 변수 암호화
- [ ] 정기적인 시크릿 로테이션

---

## 🌐 네트워크 및 인프라

### 필수 항목
- [ ] **도메인 설정**
  - DNS A 레코드 설정
  - 서브도메인 설정 (api.yourdomain.com 등)

- [ ] **Nginx 설정**
  - 프록시 설정 확인 (`/etc/nginx/sites-available/`)
  - Gzip 압축 활성화
  - Static file 캐싱 설정
  - Client body size 제한 설정

- [ ] **SSL/TLS 인증서**
  ```bash
  # Let's Encrypt
  sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
  ```
  - 자동 갱신 설정
  ```bash
  sudo crontab -e
  0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
  ```

- [ ] **방화벽 설정**
  ```bash
  # UFW 설정 예시
  sudo ufw allow 22/tcp    # SSH
  sudo ufw allow 80/tcp    # HTTP
  sudo ufw allow 443/tcp   # HTTPS
  sudo ufw enable
  ```

- [ ] **서버 시간 동기화**
  ```bash
  sudo timedatectl set-ntp true
  ```

### 권장 항목
- [ ] CDN 설정 (CloudFlare, AWS CloudFront)
- [ ] Load Balancer 설정 (다중 서버 환경)
- [ ] DDoS 보호 서비스
- [ ] 자동 스케일링 설정

---

## 📊 모니터링 및 로깅

### 필수 항목
- [ ] **로깅 시스템 확인**
  - 파일 로깅 활성화 (`ENABLE_FILE_LOGGING=true`)
  - 로그 디렉토리 권한 설정
  - 로그 로테이션 설정

- [ ] **Health Check 엔드포인트**
  ```bash
  curl http://localhost:3001/api/health
  ```

- [ ] **관리자 알림 시스템**
  - `ADMIN_EMAILS` 환경 변수 설정
  - 이메일 알림 테스트
    - 새 구독 알림
    - 결제 실패 알림
    - 시스템 오류 알림

- [ ] **에러 추적**
  - 로그 파일 모니터링
  - 에러 패턴 확인

### 권장 항목
- [ ] APM 도구 설치 (New Relic, Datadog)
- [ ] 로그 집계 시스템 (ELK Stack, Splunk)
- [ ] 외부 모니터링 서비스 (UptimeRobot, Pingdom)
- [ ] 알림 채널 다양화 (Slack, Discord, PagerDuty)
- [ ] 대시보드 구성 (Grafana)

---

## 💾 백업 및 복구

### 필수 항목
- [ ] **자동 백업 설정**
  ```bash
  # Cron 설정
  0 2 * * * /path/to/scripts/backup-database.sh
  ```

- [ ] **백업 검증**
  - 최소 1회 복구 테스트 수행
  ```bash
  ./scripts/restore-database.sh --dry-run /path/to/backup.backup
  ```

- [ ] **백업 저장소**
  - 로컬 백업: `/var/backups/education-platform`
  - 원격 백업: S3, Google Cloud Storage 등
  - 최소 30일 보관

- [ ] **재해 복구 계획 (DRP)**
  - 복구 절차 문서화
  - RTO (Recovery Time Objective) 정의
  - RPO (Recovery Point Objective) 정의

### 권장 항목
- [ ] 다중 지역 백업
- [ ] 백업 암호화
- [ ] 정기적인 복구 훈련
- [ ] 데이터베이스 스냅샷 (클라우드)

---

## ⚡ 성능 최적화

### 필수 항목
- [ ] **프론트엔드 빌드 최적화**
  ```bash
  cd apps/web && npm run build
  ```
  - Code splitting 확인
  - Tree shaking 확인
  - 번들 사이즈 확인

- [ ] **이미지 최적화**
  - 적절한 포맷 사용 (WebP)
  - Lazy loading 구현
  - CDN 사용

- [ ] **캐싱 전략**
  - Static files: 1년 캐시
  - API 응답: 적절한 캐시 헤더
  - Redis/Memcached (선택적)

- [ ] **Gzip/Brotli 압축**
  - Nginx에서 압축 활성화
  - Backend에서 compression 미들웨어 사용

- [ ] **데이터베이스 쿼리 최적화**
  - N+1 쿼리 문제 해결
  - 적절한 인덱스 사용
  - 쿼리 실행 계획 분석 (`EXPLAIN ANALYZE`)

### 권장 항목
- [ ] HTTP/2 활성화
- [ ] 서버 사이드 렌더링 (SSR)
- [ ] 정적 사이트 생성 (SSG)
- [ ] 데이터베이스 연결 풀링
- [ ] 비동기 작업 큐 (Bull, RabbitMQ)

---

## 💳 결제 시스템

### 필수 항목
- [ ] **Stripe 프로덕션 설정**
  - Live API 키로 변경
  - Webhook 엔드포인트 등록
    - URL: `https://yourdomain.com/api/payments/webhook`
    - 이벤트: `checkout.session.completed`, `invoice.payment_failed`, etc.
  - Webhook 시크릿 저장

- [ ] **결제 플로우 테스트**
  - 성공 케이스
  - 실패 케이스
  - 환불 프로세스

- [ ] **결제 보안**
  - PCI DSS 준수
  - Stripe Checkout 사용 (카드 정보 직접 처리 안 함)

- [ ] **이메일 알림**
  - 결제 성공 이메일
  - 결제 실패 이메일
  - 영수증 발송

### 권장 항목
- [ ] 다국적 결제 지원
- [ ] 추가 결제 수단 (PayPal, Toss, 카카오페이)
- [ ] 정기 결제 관리 대시보드
- [ ] 결제 분석 및 리포팅

---

## 📧 이메일 시스템

### 필수 항목
- [ ] **SMTP 설정 검증**
  - 실제 이메일 전송 테스트
  - 발신자 이메일 주소 확인

- [ ] **이메일 템플릿 검증**
  - 웰컴 이메일
  - 비밀번호 리셋 이메일
  - 결제 관련 이메일
  - 구독 관련 이메일

- [ ] **스팸 방지 설정**
  - SPF 레코드 설정
  ```
  v=spf1 include:_spf.google.com ~all
  ```
  - DKIM 서명 설정
  - DMARC 정책 설정

- [ ] **발송 제한 확인**
  - SMTP 제공업체의 일일 발송 제한 확인
  - Rate limiting 설정

### 권장 항목
- [ ] 전문 이메일 서비스 (SendGrid, AWS SES)
- [ ] 이메일 대기열 시스템
- [ ] 이메일 분석 (오픈율, 클릭률)
- [ ] 구독 취소 (Unsubscribe) 기능

---

## ⚖️ 법적 준수

### 필수 항목
- [ ] **이용 약관 (Terms of Service)**
  - 명확하고 이해하기 쉬운 약관
  - 최신 법규 반영
  - 회원가입 시 동의 받기

- [ ] **개인정보 처리방침 (Privacy Policy)**
  - GDPR 준수 (유럽 사용자 대상 시)
  - 개인정보 수집/이용 목적 명시
  - 제3자 제공 내역
  - 데이터 보관 기간

- [ ] **쿠키 정책**
  - 쿠키 사용 안내
  - 동의 메커니즘

- [ ] **환불 정책**
  - 명확한 환불 조건
  - 환불 절차 안내

- [ ] **저작권 표시**
  - 콘텐츠 출처 명시
  - 라이선스 정보

### 권장 항목
- [ ] 법률 자문 받기
- [ ] 정기적인 약관 검토 및 업데이트
- [ ] 사용자 데이터 다운로드/삭제 기능 (GDPR)

---

## 🧪 테스트

### 필수 항목
- [ ] **기능 테스트**
  - 회원가입/로그인
  - 책 읽기
  - 퀴즈
  - 결제
  - 구독 관리

- [ ] **크로스 브라우저 테스트**
  - Chrome
  - Firefox
  - Safari
  - Edge

- [ ] **모바일 테스트**
  - iOS Safari
  - Android Chrome
  - 반응형 디자인 확인

- [ ] **성능 테스트**
  - 페이지 로드 시간
  - API 응답 시간
  - 동시 사용자 부하 테스트

- [ ] **보안 테스트**
  - SQL Injection 시도
  - XSS 시도
  - CSRF 시도
  - Rate limiting 테스트

### 권장 항목
- [ ] 자동화된 테스트 (Jest, Cypress)
- [ ] CI/CD 파이프라인
- [ ] 침투 테스트 (Penetration Testing)
- [ ] 접근성 테스트 (WCAG)

---

## 📚 문서화

### 필수 항목
- [ ] **README.md**
  - 프로젝트 개요
  - 설치 방법
  - 사용 방법

- [ ] **DEPLOYMENT.md**
  - 배포 가이드
  - 서버 설정
  - 환경 변수

- [ ] **API 문서**
  - 엔드포인트 목록
  - 요청/응답 예시
  - 인증 방법

- [ ] **운영 매뉴얼**
  - 일상적인 운영 작업
  - 문제 해결 가이드
  - 긴급 연락처

### 권장 항목
- [ ] Swagger/OpenAPI 문서
- [ ] 아키텍처 다이어그램
- [ ] 데이터베이스 ERD
- [ ] 변경 이력 (CHANGELOG.md)

---

## 🚀 배포 직전 최종 확인

### 배포 1일 전
- [ ] 모든 체크리스트 항목 재확인
- [ ] 스테이징 환경에서 최종 테스트
- [ ] 데이터베이스 백업 수행
- [ ] 롤백 계획 수립

### 배포 당일
- [ ] 서비스 점검 공지 (필요 시)
- [ ] 데이터베이스 마이그레이션
- [ ] 애플리케이션 배포
- [ ] Health check 확인
- [ ] 주요 기능 smoke test

### 배포 후
- [ ] 모니터링 대시보드 확인
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 모니터링
- [ ] 성능 메트릭 확인

---

## 📞 지원 및 연락처

### 긴급 상황 대응
- **서버 다운**: [관리자 연락처]
- **데이터베이스 문제**: [DBA 연락처]
- **보안 문제**: [보안팀 연락처]
- **결제 문제**: [재무팀 연락처]

### 외부 서비스 지원
- **Stripe 지원**: https://support.stripe.com
- **AWS 지원**: https://console.aws.amazon.com/support
- **Let's Encrypt 문서**: https://letsencrypt.org/docs/

---

## ✅ 체크리스트 요약

총 항목: **100+**

프로덕션 배포 전에 최소한 **필수 항목**은 모두 완료해야 합니다.

**우선순위:**
1. 🔴 보안 (Critical)
2. 🟡 데이터베이스 (High)
3. 🟢 성능 (Medium)

---

**마지막 업데이트**: 2025-01-17

**다음 검토 예정일**: [배포 후 1주일]

---

> 💡 **팁**: 이 체크리스트를 팀과 공유하고, 각 항목의 책임자를 지정하세요.
>
> 💡 **팁**: 배포 후에도 정기적으로 이 체크리스트를 검토하고 업데이트하세요.
