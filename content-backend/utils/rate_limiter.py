from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

# 메모리 기반 Rate Limiter (프로덕션에서는 Redis 권장)
class RateLimiter:
    def __init__(self, requests_per_minute: int = 20):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    async def check_rate_limit(self, user_id: int):
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)

        # 1분 이내 요청만 필터링
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > minute_ago
        ]

        # 제한 확인
        if len(self.requests[user_id]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {self.requests_per_minute} requests per minute."
            )

        # 요청 기록
        self.requests[user_id].append(now)

rate_limiter = RateLimiter()

def clean_expired_entries():
    """Clean up expired entries (for backwards compatibility)"""
    pass
