from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Animal(Base):
    __tablename__ = "animals"
    id            = Column(Integer, primary_key=True, index=True)
    type          = Column(String(20), nullable=False)
    rfid_cd       = Column(String(100), index=True)
    care_reg_no   = Column(String(100), index=True)
    dog_reg_no    = Column(String(100))
    name          = Column(String(100))
    kind_nm       = Column(String(100))
    up_kind_cd    = Column(String(20))
    process_state = Column(String(50))
    happen_place  = Column(String(200))
    neuter_yn     = Column(String(1))
    sex_cd        = Column(String(1))
    age           = Column(String(20))
    weight        = Column(String(20))
    lat           = Column(Float)
    lon           = Column(Float)
    thumbnail     = Column(String(500))
    updated_at    = Column(DateTime(timezone=True), server_default=func.now())
