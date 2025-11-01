from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import mapped_column, relationship

from models import Base

__all__ = [
    'Contribution',
]


class Contribution(Base):
    __tablename__ = 'contributions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = mapped_column(ForeignKey('projects.id', ondelete='RESTRICT'), nullable=False)
    project = relationship('Project', back_populates='contributions')
    reward_id = mapped_column(ForeignKey('rewards.id', ondelete='RESTRICT'), nullable=False)
    reward = relationship('Reward', back_populates='contributions')
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=False)
