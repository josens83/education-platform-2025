# Web App Dockerfile - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 및 공유 라이브러리 복사
COPY package*.json ./
COPY ../../packages ./packages

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# Production stage
FROM nginx:alpine

# Nginx 설정
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
