from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import get_db, Contribution
from models.project import Reward, Project
from schemas.contrib import ContribSchema, DetailedContribSchema
from utils.jwt_token import verify_investor_role

contrib_router = APIRouter(
    tags=['Взносы'],
)


@contrib_router.post('/{project_pk}/rewards/{reward_pk}/contrib', response_model=ContribSchema)
async def make_contribution(
        project_pk: int,
        reward_pk: int,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_investor_role),
):
    project = await db.get(Project, project_pk)
    # todo: возможно жертвовать только при определенном статусе
    reward = await db.get(Reward, reward_pk)
    if not reward or reward.project_id != project_pk:
        raise HTTPException(status_code=404)
    profile_contrib = Contribution(
        project_id=project_pk,
        reward_id=reward_pk,
        profile_id=int(token_payload['sub']),
        status='Новый',
        created_at=datetime.now(),
    )
    db.add(profile_contrib)
    await db.commit()
    await db.refresh(profile_contrib)
    return profile_contrib


@contrib_router.get('/{project_pk}/rewards/{reward_pk}/contrib', response_model=list[ContribSchema])
async def get_contributions(
        project_pk: int,
        reward_pk: int,
        db: AsyncSession = Depends(get_db),
):
    project = await db.get(Project, project_pk)
    reward = await db.get(Reward, reward_pk)
    if reward.project_id != project_pk:
        raise HTTPException(status_code=404)

    stmt = select(Contribution).where(Contribution.reward_id == reward_pk)
    contribs = (await db.execute(stmt)).scalars().all()
    return contribs


@contrib_router.get('/my', response_model=list[DetailedContribSchema])
async def get_my_contributions(
    db: AsyncSession = Depends(get_db),
    token_payload: dict = Depends(verify_investor_role),
):
    """
    Просмотреть свои вклады. Доступно только инвестору.
    """
    stmt = (
        select(Contribution)
        .where(Contribution.profile_id == int(token_payload['sub']))
        .options(
            selectinload(Contribution.reward),
            selectinload(Contribution.project),
        )
    )

    results = (await db.execute(stmt)).scalars().all()
    return results


class ContribStats(BaseModel):
    total_count: int
    total_amount: float
    cool_projects: int

@contrib_router.get('/stats')
async def get_contribution_stats(
        db: AsyncSession = Depends(get_db)
):
    """
    Общая статистика по вкладам
    """
    stmt = select(
        func.count(Contribution.id).label("total_count"),
        func.sum(Reward.price).label("total_amount")
    ).join(Contribution.reward)

    result = await db.execute(stmt)
    stats = result.one()

    stmt = (
        select(
            Project.id,
            Project.title,
            Project.goal_amount,
            func.coalesce(func.sum(Reward.price), 0).label("total_raised")
        )
        .outerjoin(Contribution, Project.id == Contribution.project_id)
        .outerjoin(Reward, Contribution.reward_id == Reward.id)
        .group_by(Project.id)
    )

    cool_projects = 0
    result = (await db.execute(stmt)).all()
    for project_id, project_title, goal_amount, total in result:
        if total >= goal_amount:
            cool_projects += 1

    return ContribStats(total_count=stats[0], total_amount=stats[1], cool_projects=cool_projects)
