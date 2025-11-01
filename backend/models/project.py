from sqlalchemy import Column, Integer, ForeignKey, String, Date, Float, Boolean
from sqlalchemy.orm import mapped_column, relationship

from models import Base

__all__ = [
    'Project',
]

class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True, autoincrement=True)
    author_id = mapped_column(ForeignKey('users.id', ondelete='RESTRICT'), nullable=False)
    author = relationship('User', back_populates='projects')
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    goal_amount = Column(Float, nullable=False)
    project_type = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)

    rewards = relationship('Rewards', back_populates='project')

class Reward(Base):
    __tablename__ = 'rewards'
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = mapped_column(ForeignKey('projects.id', ondelete='RESTRICT'), nullable=False)
    project = relationship('Project', back_populates='rewards')
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    active = Column(Boolean, nullable=False)

    contributions = relationship('Contribution', back_populates='reward')
