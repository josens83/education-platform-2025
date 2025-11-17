#!/bin/bash

# 영어 학습 플랫폼 시작 스크립트
# 이 스크립트는 개발 환경에서 백엔드와 프론트엔드를 동시에 실행합니다.

echo "🚀 영어 학습 플랫폼 시작 중..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 환경 체크
echo -e "${BLUE}📋 환경 체크...${NC}"

# Node.js 체크
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# PostgreSQL 체크 (선택적)
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL: $(psql --version | head -n 1)${NC}"
else
    echo -e "${RED}⚠️  PostgreSQL이 설치되어 있지 않거나 PATH에 없습니다.${NC}"
fi

echo ""

# .env 파일 체크
echo -e "${BLUE}📝 환경 변수 체크...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env 파일이 없습니다.${NC}"
    echo -e "${BLUE}💡 backend/.env.example을 복사하여 backend/.env를 생성하세요.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ backend/.env 파일 존재${NC}"

if [ ! -f "apps/web/.env" ]; then
    echo -e "${RED}⚠️  apps/web/.env 파일이 없습니다.${NC}"
    echo -e "${BLUE}💡 apps/web/.env.example을 복사하여 apps/web/.env를 생성하는 것을 권장합니다.${NC}"
fi

echo ""

# API Client 빌드 체크
echo -e "${BLUE}📦 API Client 체크...${NC}"

if [ ! -d "packages/api-client/dist" ]; then
    echo -e "${BLUE}🔨 API Client 빌드 중...${NC}"
    cd packages/api-client
    npm install
    npm run build
    cd ../..
    echo -e "${GREEN}✅ API Client 빌드 완료${NC}"
else
    echo -e "${GREEN}✅ API Client 이미 빌드됨${NC}"
fi

echo ""

# 의존성 설치 체크
echo -e "${BLUE}📦 의존성 체크...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📥 Backend 의존성 설치 중...${NC}"
    cd backend
    npm install
    cd ..
fi

if [ ! -d "apps/web/node_modules" ]; then
    echo -e "${BLUE}📥 Frontend 의존성 설치 중...${NC}"
    cd apps/web
    npm install
    cd ../..
fi

echo -e "${GREEN}✅ 의존성 확인 완료${NC}"
echo ""

# tmux 또는 별도 터미널에서 실행
echo -e "${BLUE}🚀 서버 시작...${NC}"
echo ""

# tmux가 있으면 tmux 사용
if command -v tmux &> /dev/null; then
    echo -e "${GREEN}tmux를 사용하여 서버를 시작합니다.${NC}"
    echo -e "${BLUE}💡 세션에 연결하려면: tmux attach -t education-platform${NC}"
    echo -e "${BLUE}💡 세션을 종료하려면: Ctrl+C 후 tmux kill-session -t education-platform${NC}"
    echo ""
    
    # tmux 세션 생성
    tmux new-session -d -s education-platform
    
    # Backend 실행
    tmux send-keys -t education-platform "cd backend && npm run dev" C-m
    
    # 창 분할 및 Frontend 실행
    tmux split-window -h -t education-platform
    tmux send-keys -t education-platform "cd apps/web && npm run dev" C-m
    
    # tmux 세션에 연결
    tmux attach -t education-platform
    
else
    # tmux가 없으면 순차 실행 (권장하지 않음)
    echo -e "${RED}⚠️  tmux가 설치되어 있지 않습니다.${NC}"
    echo -e "${BLUE}💡 별도의 터미널에서 다음 명령어를 실행하세요:${NC}"
    echo ""
    echo -e "${GREEN}터미널 1 (Backend):${NC}"
    echo "  cd backend && npm run dev"
    echo ""
    echo -e "${GREEN}터미널 2 (Frontend):${NC}"
    echo "  cd apps/web && npm run dev"
    echo ""
    echo -e "${BLUE}또는 tmux를 설치하세요: sudo apt install tmux (Ubuntu) 또는 brew install tmux (Mac)${NC}"
fi
