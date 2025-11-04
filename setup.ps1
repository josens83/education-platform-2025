# Artify Platform 통합 설치 스크립트
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Artify Platform 설치 시작" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Node.js 버전 확인
Write-Host "[1/5] Node.js 버전 확인..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "✓ Node.js $nodeVersion 설치됨" -ForegroundColor Green
Write-Host ""

# Python 버전 확인
Write-Host "[2/5] Python 버전 확인..." -ForegroundColor Yellow
$pythonVersion = python --version
Write-Host "✓ $pythonVersion 설치됨" -ForegroundColor Green
Write-Host ""

# Backend 의존성 설치
Write-Host "[3/5] Backend 의존성 설치..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend 의존성 설치 완료" -ForegroundColor Green
} else {
    Write-Host "✗ Backend 의존성 설치 실패" -ForegroundColor Red
}
Set-Location ..
Write-Host ""

# AI Service 의존성 설치
Write-Host "[4/5] AI Service 의존성 설치..." -ForegroundColor Yellow
Set-Location ai-service
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ AI Service 의존성 설치 완료" -ForegroundColor Green
} else {
    Write-Host "✗ AI Service 의존성 설치 실패" -ForegroundColor Red
}
Set-Location ..
Write-Host ""

# 환경 변수 확인
Write-Host "[5/5] 환경 변수 설정 확인..." -ForegroundColor Yellow

if (Test-Path "backend\.env") {
    Write-Host "✓ backend/.env 파일 존재" -ForegroundColor Green
} else {
    Write-Host "! backend/.env 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "  수동으로 생성해주세요." -ForegroundColor Yellow
}

if (Test-Path "ai-service\.env") {
    Write-Host "✓ ai-service/.env 파일 존재" -ForegroundColor Green
} else {
    Write-Host "! ai-service/.env 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "  수동으로 생성해주세요." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  설치 완료!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan