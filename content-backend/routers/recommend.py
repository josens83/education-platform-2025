from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.vector_db import search_similar_copies
from app.database import get_db
from app.models import Creative

router = APIRouter(prefix="/recommend", tags=["Recommendations"])

@router.get("/copies")
async def recommend_copies(
    creative_id: int,
    top_k: int = 5,
    db: Session = Depends(get_db)
):
    # Creative 조회
    creative = db.query(Creative).filter(Creative.id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")

    # 유사 카피 검색
    similar = search_similar_copies(creative.copy_text, top_k)

    return {
        "creative_id": creative_id,
        "recommendations": similar,
        "count": len(similar)
    }
