#!/bin/bash

###############################################################################
# Deployment Health Monitoring Script
# Elite Developer Methodology - Continuous Monitoring & Auto-Rollback
#
# This script monitors deployment health and triggers automatic rollback
# if issues are detected.
#
# Usage:
#   ./monitor-deployment.sh <environment> <duration_minutes>
#
# Example:
#   ./monitor-deployment.sh production 15
###############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
ENVIRONMENT="${1:-staging}"
DURATION_MINUTES="${2:-15}"
CHECK_INTERVAL_SECONDS=30

if [ "$ENVIRONMENT" = "production" ]; then
    API_URL="https://api.education-platform.com"
    WEB_URL="https://education-platform.com"
else
    API_URL="https://staging-api.education-platform.com"
    WEB_URL="https://staging.education-platform.com"
fi

# Thresholds
MAX_ERROR_RATE=5          # Maximum acceptable error rate (%)
MAX_RESPONSE_TIME=2000    # Maximum acceptable response time (ms)
MAX_CONSECUTIVE_FAILURES=3 # Trigger rollback after this many failures
MIN_SUCCESS_RATE=95       # Minimum success rate (%)

log_info "Starting deployment monitoring for $ENVIRONMENT environment"
log_info "Duration: $DURATION_MINUTES minutes"
log_info "Check interval: $CHECK_INTERVAL_SECONDS seconds"
log_info "API URL: $API_URL"
echo ""

# Initialize counters
TOTAL_CHECKS=0
SUCCESSFUL_CHECKS=0
FAILED_CHECKS=0
CONSECUTIVE_FAILURES=0
ERROR_RATE=0

START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION_MINUTES * 60))

# Monitoring loop
while [ $(date +%s) -lt $END_TIME ]; do
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    CURRENT_TIME=$(date +"%Y-%m-%d %H:%M:%S")

    log_info "Check #$TOTAL_CHECKS at $CURRENT_TIME"

    # Health check
    HEALTH_CHECK_FAILED=false

    # 1. Check API health endpoint
    log_info "  Checking API health endpoint..."
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/health" 2>/dev/null || echo "0")
    HEALTH_HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)

    if [ "$HEALTH_HTTP_CODE" = "200" ]; then
        log_success "  ✅ API health check passed (HTTP $HEALTH_HTTP_CODE)"
    else
        log_error "  ❌ API health check failed (HTTP $HEALTH_HTTP_CODE)"
        HEALTH_CHECK_FAILED=true
    fi

    # 2. Check API response time
    log_info "  Checking API response time..."
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$API_URL/api/health" 2>/dev/null || echo "999999")
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d. -f1)

    if [ "$RESPONSE_TIME_MS" -lt "$MAX_RESPONSE_TIME" ]; then
        log_success "  ✅ Response time acceptable (${RESPONSE_TIME_MS}ms < ${MAX_RESPONSE_TIME}ms)"
    else
        log_warning "  ⚠️ Response time high (${RESPONSE_TIME_MS}ms > ${MAX_RESPONSE_TIME}ms)"
    fi

    # 3. Check detailed health endpoint
    log_info "  Checking detailed health status..."
    DETAILED_HEALTH=$(curl -s "$API_URL/api/health/detailed" 2>/dev/null || echo '{"status":"error"}')
    DB_STATUS=$(echo "$DETAILED_HEALTH" | grep -o '"database":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    REDIS_STATUS=$(echo "$DETAILED_HEALTH" | grep -o '"redis":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

    if [ "$DB_STATUS" = "connected" ] || [ "$DB_STATUS" = "healthy" ]; then
        log_success "  ✅ Database: $DB_STATUS"
    else
        log_error "  ❌ Database: $DB_STATUS"
        HEALTH_CHECK_FAILED=true
    fi

    if [ "$REDIS_STATUS" = "connected" ] || [ "$REDIS_STATUS" = "healthy" ]; then
        log_success "  ✅ Redis: $REDIS_STATUS"
    else
        log_warning "  ⚠️ Redis: $REDIS_STATUS"
    fi

    # 4. Check web application
    log_info "  Checking web application..."
    WEB_RESPONSE=$(curl -s -w "\n%{http_code}" "$WEB_URL" 2>/dev/null || echo "0")
    WEB_HTTP_CODE=$(echo "$WEB_RESPONSE" | tail -1)

    if [ "$WEB_HTTP_CODE" = "200" ]; then
        log_success "  ✅ Web application responding (HTTP $WEB_HTTP_CODE)"
    else
        log_error "  ❌ Web application failed (HTTP $WEB_HTTP_CODE)"
        HEALTH_CHECK_FAILED=true
    fi

    # Update counters
    if [ "$HEALTH_CHECK_FAILED" = true ]; then
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        log_error "  Health check FAILED (consecutive failures: $CONSECUTIVE_FAILURES)"
    else
        SUCCESSFUL_CHECKS=$((SUCCESSFUL_CHECKS + 1))
        CONSECUTIVE_FAILURES=0
        log_success "  Health check PASSED"
    fi

    # Calculate metrics
    SUCCESS_RATE=$(echo "scale=2; ($SUCCESSFUL_CHECKS * 100) / $TOTAL_CHECKS" | bc)
    ERROR_RATE=$(echo "scale=2; ($FAILED_CHECKS * 100) / $TOTAL_CHECKS" | bc)

    log_info "  Success rate: ${SUCCESS_RATE}% | Error rate: ${ERROR_RATE}%"

    # Check if rollback is needed
    SHOULD_ROLLBACK=false
    ROLLBACK_REASON=""

    if [ "$CONSECUTIVE_FAILURES" -ge "$MAX_CONSECUTIVE_FAILURES" ]; then
        SHOULD_ROLLBACK=true
        ROLLBACK_REASON="Consecutive failures threshold exceeded ($CONSECUTIVE_FAILURES >= $MAX_CONSECUTIVE_FAILURES)"
    fi

    if (( $(echo "$ERROR_RATE > $MAX_ERROR_RATE" | bc -l) )); then
        SHOULD_ROLLBACK=true
        ROLLBACK_REASON="Error rate too high (${ERROR_RATE}% > ${MAX_ERROR_RATE}%)"
    fi

    if (( $(echo "$SUCCESS_RATE < $MIN_SUCCESS_RATE" | bc -l) )) && [ "$TOTAL_CHECKS" -ge 5 ]; then
        SHOULD_ROLLBACK=true
        ROLLBACK_REASON="Success rate too low (${SUCCESS_RATE}% < ${MIN_SUCCESS_RATE}%)"
    fi

    # Trigger automatic rollback if needed
    if [ "$SHOULD_ROLLBACK" = true ]; then
        log_error ""
        log_error "🚨 CRITICAL: Deployment health check failed!"
        log_error "Reason: $ROLLBACK_REASON"
        log_error ""
        log_error "Metrics:"
        log_error "  - Total checks: $TOTAL_CHECKS"
        log_error "  - Successful: $SUCCESSFUL_CHECKS"
        log_error "  - Failed: $FAILED_CHECKS"
        log_error "  - Success rate: ${SUCCESS_RATE}%"
        log_error "  - Error rate: ${ERROR_RATE}%"
        log_error "  - Consecutive failures: $CONSECUTIVE_FAILURES"
        log_error ""
        log_error "🔄 Triggering automatic rollback..."

        # Trigger GitHub Actions rollback workflow
        if [ -n "$GITHUB_TOKEN" ]; then
            log_info "Triggering auto-rollback via GitHub Actions..."
            curl -X POST \
                -H "Accept: application/vnd.github+json" \
                -H "Authorization: Bearer $GITHUB_TOKEN" \
                -H "X-GitHub-Api-Version: 2022-11-28" \
                "https://api.github.com/repos/${GITHUB_REPOSITORY}/dispatches" \
                -d "{\"event_type\":\"auto-rollback-trigger\",\"client_payload\":{\"environment\":\"$ENVIRONMENT\",\"reason\":\"$ROLLBACK_REASON\"}}"

            log_error "Rollback triggered via GitHub Actions"
        else
            log_error "GITHUB_TOKEN not set - cannot trigger automatic rollback"
            log_error "Please trigger rollback manually"
        fi

        exit 1
    fi

    echo ""
    log_info "Next check in $CHECK_INTERVAL_SECONDS seconds..."
    sleep $CHECK_INTERVAL_SECONDS
done

# Final report
log_success ""
log_success "========================================="
log_success "Monitoring completed successfully!"
log_success "========================================="
log_success "Environment: $ENVIRONMENT"
log_success "Duration: $DURATION_MINUTES minutes"
log_success ""
log_success "Final Metrics:"
log_success "  - Total checks: $TOTAL_CHECKS"
log_success "  - Successful: $SUCCESSFUL_CHECKS"
log_success "  - Failed: $FAILED_CHECKS"
log_success "  - Success rate: ${SUCCESS_RATE}%"
log_success "  - Error rate: ${ERROR_RATE}%"
log_success ""

if (( $(echo "$SUCCESS_RATE >= $MIN_SUCCESS_RATE" | bc -l) )); then
    log_success "✅ Deployment is healthy and stable"
    exit 0
else
    log_warning "⚠️ Deployment has issues but didn't trigger rollback"
    log_warning "Please investigate and monitor closely"
    exit 1
fi
