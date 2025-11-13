# Artify Platform 개발 서버 실행 스크립트
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Artify Platform 시작 중..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 환경 변수 확인
if (-not (Test-Path "backend\.env")) {
    Write-Host "✗ backend/.env 파일이 없습니다!" -ForegroundColor Red
    Write-Host "  먼저 환경 변수를 설정해주세요." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "ai-service\.env")) {
    Write-Host "✗ ai-service/.env 파일이 없습니다!" -ForegroundColor Red
    Write-Host "  먼저 환경 변수를 설정해주세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ 환경 변수 파일 확인 완료" -ForegroundColor Green
Write-Host ""
Write-Host "다음 서비스가 시작됩니다:" -ForegroundColor Yellow
Write-Host "  1. Backend API    → http://localhost:3001" -ForegroundColor White
Write-Host "  2. AI Service     → http://localhost:8000" -ForegroundColor White
Write-Host "  3. Frontend       → http://localhost:3000" -ForegroundColor White
Write-Host ""

# Backend 시작
Write-Host "[1/3] Backend 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend 서버 시작...' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 2

# AI Service 시작
Write-Host "[2/3] AI Service 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\ai-service'; Write-Host 'AI Service 시작...' -ForegroundColor Green; python main.py"
Start-Sleep -Seconds 2

# Frontend 시작
Write-Host "[3/3] Frontend 시작 중..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend 서버 시작...' -ForegroundColor Green; python -m http.server 3000"

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  모든 서비스가 시작되었습니다!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "브라우저에서 접속: http://localhost:3000/login.html" -ForegroundColor Green
Write-Host ""