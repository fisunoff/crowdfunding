from typing import Sequence

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Profile, get_db
from schemas.profile import ProfileReadData
from utils.jwt_token import verify_admin_role, verify_token

profile_router = APIRouter(
    tags=['Profile'],
)


@profile_router.get('/', response_model=list[ProfileReadData])
async def get_profiles(
        db: AsyncSession = Depends(get_db),
        _token_payload: dict = Depends(verify_admin_role),
) -> Sequence[Profile]:
    """
    Список всех сотрудников (в том числе и уже уволенных).
    Доступно только администратору.
    """
    stmt = select(Profile)
    results = (await db.execute(stmt)).scalars().all()
    return results


@profile_router.get('/me', response_model=ProfileReadData)
async def get_me(
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_token),
) -> Profile:
    """
    Сведения о себе.
    """
    pk = int(token_payload['sub'])
    stmt = select(Profile).where(Profile.id == pk)
    result = (await db.execute(stmt)).scalars().first()
    return result
