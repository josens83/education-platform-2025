from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, DECIMAL, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    campaigns = relationship("Campaign", back_populates="user")
    segments = relationship("Segment", back_populates="user")
    gen_jobs = relationship("GenJob", back_populates="user")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    objective = Column(Text)
    channel = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="campaigns")
    creatives = relationship("Creative", back_populates="campaign")

class Segment(Base):
    __tablename__ = "segments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    filters = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="segments")
    creatives = relationship("Creative", back_populates="segment")

class Creative(Base):
    __tablename__ = "creatives"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    segment_id = Column(Integer, ForeignKey("segments.id"))
    copy_text = Column(Text)
    image_url = Column(Text)
    meta = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="creatives")
    segment = relationship("Segment", back_populates="creatives")
    metrics = relationship("Metric", back_populates="creative")
    feedbacks = relationship("Feedback", back_populates="creative")

class GenJob(Base):
    __tablename__ = "gen_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model = Column(String)
    type = Column(String)
    prompt = Column(Text)
    response = Column(Text)
    tokens = Column(Integer)
    cost = Column(DECIMAL(10, 4))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="gen_jobs")

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    creative_id = Column(Integer, ForeignKey("creatives.id"))
    date = Column(DateTime)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    ctr = Column(DECIMAL(5, 4), default=0.0)
    engagement = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    creative = relationship("Creative", back_populates="metrics")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    creative_id = Column(Integer, ForeignKey("creatives.id"))
    source = Column(String)
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    creative = relationship("Creative", back_populates="feedbacks")
