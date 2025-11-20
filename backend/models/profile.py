from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.orm import relationship

from models.base import Base

__all__ = [
    'Profile',
]

class Profile(Base):
    __tablename__ = 'profile'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    surname = Column(String(255), nullable=False)
    patronymic = Column(String(255), nullable=False)
    bank_number = Column(String(255), nullable=False)

    is_admin = Column(Boolean, nullable=False, default=False)
    is_author = Column(Boolean, nullable=False, default=False)
    is_investor = Column(Boolean, nullable=False, default=False)

    login = Column(String(255), nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)

    projects = relationship('Project', back_populates='author')
    contributions = relationship('Contribution', back_populates='profile')
