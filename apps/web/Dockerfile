# Web App Dockerfile - Multi-stage build
# Build context should be the root directory
FROM node:20-alpine AS builder

WORKDIR /app

# 전체 프로젝트 복사
COPY . .

# 1. api-client 패키지 빌드 (TypeScript 컴파일)
WORKDIR /app/packages/api-client
RUN npm install && npm run build

# 2. shared 패키지 빌드 (TypeScript 컴파일)
WORKDIR /app/packages/shared
RUN npm install && npm run build

# 3. Web app 빌드 (이제 컴파일된 패키지를 사용할 수 있음)
WORKDIR /app/apps/web
RUN npm install && npm run build

# Production stage
FROM nginx:alpine

# Nginx 설정
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
