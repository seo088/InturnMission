from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Facility(Base):
    __tablename__ = "facilities"
    id         = Column(Integer, primary_key=True, index=True)
    type       = Column(String(20), nullable=False)
    name       = Column(String(200))
    manage_no  = Column(String(100), unique=True)
    status     = Column(String(50))
    road_addr  = Column(String(300))
    sido       = Column(String(50))
    sigungu    = Column(String(50))
    lat        = Column(Float)
    lon        = Column(Float)
    phone      = Column(String(30))
    floor_area = Column(Float)
    license_dt = Column(Date)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
