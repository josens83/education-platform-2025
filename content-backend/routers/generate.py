from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import openai
import google.generativeai as genai
from app.database import get_db
from app.models import Creative, Campaign, Segment, GenJob
from app.config import get_settings
from utils.jwt_handler import get_current_user
import json

router = APIRouter(prefix="/generate", tags=["Content Generation"])
settings = get_settings()

# API 설정
openai.api_key = settings.openai_api_key
genai.configure(api_key=settings.gemini_api_key)

class TextGenerateRequest(BaseModel):
    campaign_id: int
    segment_id: int
    tone: str = "professional"
    length: str = "medium"
    keywords: List[str] = []

class ImageGenerateRequest(BaseModel):
    creative_id: int
    prompt: str
    size: str = "1024x1024"

@router.post("/text")
async def generate_text(
    request: TextGenerateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # JWT 인증
):
    # 캠페인과 세그먼트 확인
    campaign = db.query(Campaign).filter(Campaign.id == request.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    segment = db.query(Segment).filter(Segment.id == request.segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    # 프롬프트 생성
    prompt = f"""
    Generate marketing copy for:
    Campaign: {campaign.name}
    Objective: {campaign.objective}
    Segment: {json.dumps(segment.filters)}
    Tone: {request.tone}
    Length: {request.length}
    Keywords: {', '.join(request.keywords)}

    Format as JSON:
    {{
        "headline": "...",
        "body": "...",
        "cta": "...",
        "hashtags": ["..."]
    }}
    """

    try:
        # Gemini API 호출 (더 저렴)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)

        # 응답 파싱
        result = json.loads(response.text)

        # Creative 저장
        creative = Creative(
            campaign_id=request.campaign_id,
            segment_id=request.segment_id,
            copy_text=json.dumps(result),
            meta={
                "tone": request.tone,
                "length": request.length,
                "keywords": request.keywords
            }
        )
        db.add(creative)

        # GenJob 기록 (비용 추적)
        job = GenJob(
            user_id=current_user["user_id"],
            campaign_id=request.campaign_id,
            model="gemini-pro",
            type="text",
            prompt={"content": prompt},
            response=result,
            input_tokens=len(prompt.split()),  # 대략적 계산
            output_tokens=len(response.text.split()),
            cost_usd=0.0001  # Gemini 비용 (대략)
        )
        db.add(job)

        db.commit()

        return {
            "creative_id": creative.id,
            "copy": result,
            "job_id": job.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image")
async def generate_image(
    request: ImageGenerateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Creative 확인
    creative = db.query(Creative).filter(Creative.id == request.creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")

    try:
        # DALL-E 3 호출 (또는 더 저렴한 대안)
        response = openai.Image.create(
            model="dall-e-3",
            prompt=request.prompt,
            size=request.size,
            quality="standard",
            n=1,
        )

        image_url = response['data'][0]['url']

        # Creative 업데이트
        creative.image_url = image_url

        # GenJob 기록
        job = GenJob(
            user_id=current_user["user_id"],
            campaign_id=creative.campaign_id,
            model="dall-e-3",
            type="image",
            prompt={"content": request.prompt, "size": request.size},
            response={"url": image_url},
            cost_usd=0.04  # DALL-E 3 비용
        )
        db.add(job)

        db.commit()

        return {
            "creative_id": creative.id,
            "image_url": image_url,
            "job_id": job.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
