from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import get_db, Project
from models.project import Reward
from schemas.project import CreatedProjectData, BaseProjectData
from schemas.reward import RewardData, BaseRewardData
from utils.jwt_token import verify_token, verify_author_role, verify_admin_role

project_router = APIRouter(
    tags=['Проекты'],
)


async def verify_project_by_author(project, author_id):
    if not project:
        raise HTTPException(status_code=404, detail='Проект не найден.')
    if project.author_id != int(author_id):
        raise HTTPException(status_code=403, detail='Вы не можете вносить изменения в данный проект.')

@project_router.get('/', response_model=list[CreatedProjectData])
async def get_projects(
        db: AsyncSession = Depends(get_db),
        _token_payload: dict = Depends(verify_token)
) -> Sequence[Project]:
    stmt = select(Project)
    results = await db.execute(stmt)
    projects = results.scalars().all()
    return projects


@project_router.post('/', response_model=CreatedProjectData)
async def create_project(
        project_data: BaseProjectData,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_author_role)
):
    """
    Создание проекта. Только для авторов.
    """
    project = Project(
        author_id=int(token_payload['sub']),
        status='draft',
        **project_data.model_dump(),
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@project_router.delete('{pk}', status_code=204)
async def delete_project(
        pk: int,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_author_role),
):
    """
    Удалить проект. Доступно только автору на стадии черновика либо согласования.
    """
    project = await db.get(Project, pk)
    await verify_project_by_author(project, token_payload['sub'])
    if project.status not in {'draft', 'onModeration'}:
        raise HTTPException(status_code=403, detail='Проект на данной стадии удалить уже нельзя.')
    await db.delete(project)
    await db.commit()
    return None


@project_router.post(
    '/{pk}/submit',
    response_model=CreatedProjectData,
)
async def submit_project(
        pk: int,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_author_role),
):
    """
    Отправить проект на модерацию. Доступно только автору на стадии черновика.
    """
    project = await db.get(Project, pk)
    await verify_project_by_author(project, token_payload['sub'])

    if project.status != 'draft':
        raise HTTPException(status_code=403, detail='Проект нельзя перевести на модерацию.')
    project.status = 'onModeration'
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@project_router.post(
    '/{pk}/reject',
    response_model=CreatedProjectData,
)
async def reject_project(
        pk: int,
        message: str,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_admin_role),
):
    """
    Отказать проекту. Доступно администратору.
    """
    project = await db.get(Project, pk)

    if project.status != 'onModeration':
        raise HTTPException(status_code=403, detail='Проекту нельзя, так как он не находится на модерации.')
    project.status = 'rejected'
    project.moderator_comment = message
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@project_router.post(
    '/{pk}/accept',
    response_model=CreatedProjectData,
)
async def accept_project(
        pk: int,
        message: str,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_admin_role),
):
    """
    Подтвердить проект. Доступно администратору.
    """
    project = await db.get(Project, pk)

    if project.status != 'onModeration':
        raise HTTPException(status_code=403, detail='Проект нельзя подтвердить, так как он не находится на модерации.')
    project.status = 'accepted'
    project.moderator_comment = message
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@project_router.post(
    '/{pk}/to_draft',
    response_model=CreatedProjectData,
)
async def to_draft_project(
        pk: int,
        message: str,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_admin_role),
):
    """
    Отправить на доработку проект. Доступно администратору.
    """
    project = await db.get(Project, pk)

    if project.status != 'onModeration':
        raise HTTPException(status_code=403, detail='Проект нельзя отправить на доработку, так как он не находится на модерации.')
    project.status = 'draft'
    project.moderator_comment = message
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@project_router.get('/{pk}', response_model=CreatedProjectData)
async def get_project(
        pk: int,
        db: AsyncSession = Depends(get_db),
        _token_payload: dict = Depends(verify_token),
):
    project = await db.get(Project, pk)
    if not project:
        raise HTTPException(status_code=404, detail='Проект не найден.')
    return project

@project_router.put('/{pk}', status_code=200, response_model=CreatedProjectData)
async def update_project(
        pk: int,
        data: BaseProjectData,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_author_role),
):
    project = await db.get(Project, pk)
    await verify_project_by_author(project, token_payload['sub'])

    if project.status != 'draft':
        raise HTTPException(status_code=403, detail='Проект редактировать уже нельзя.')

    project.title = data.title
    project.description = data.description
    project.goal_amount = data.goal_amount
    project.project_type = data.project_type
    project.start_date = data.start_date
    project.end_date = data.end_date
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@project_router.get('/{project_pk}/rewards', response_model=list[RewardData])
async def get_rewards(
        project_pk: int,
        db: AsyncSession = Depends(get_db),
):
    """
    Просмотреть список наград.
    """
    stmt = select(Reward).where(Reward.project_id == project_pk)
    results = await db.execute(stmt)
    rewards = results.scalars().all()
    return rewards


@project_router.post('/{project_pk}/rewards', response_model=RewardData)
async def create_reward(
        project_pk: int,
        reward_data: BaseRewardData,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_author_role),
):
    project = await db.get(Project, project_pk)
    await verify_project_by_author(project, token_payload['sub'])

    reward = Reward(
        project_id=project_pk,
        active=True,
        **reward_data.model_dump(),
    )
    db.add(reward)
    await db.commit()
    await db.refresh(reward)
    return reward


@project_router.delete('/{project_pk}/rewards/{pk}', status_code=204)
async def delete_reward(
        project_pk: int,
        pk: int,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_author_role),
):
    """
    Удалить награду может только автор проекта и только если ее еще никто не выбрал.
    Иначе награда делается неактивной
    """
    project = await db.get(Project, project_pk)
    await verify_project_by_author(project, token_payload['sub'])

    # todo: проверка на донаты и перевод на active=False

    reward = await db.get(Reward, pk)
    if not reward or reward.project_id != project_pk:
        raise HTTPException(status_code=404, detail='Награда не найдена')
    await db.delete(reward)
    await db.commit()
    return None

@project_router.patch('/{project_pk}/rewards/{pk}', status_code=200, response_model=RewardData)
async def update_reward(
        project_pk: int,
        pk: int,
        reward_data: BaseRewardData,
        db: AsyncSession = Depends(get_db),
        token_payload: dict = Depends(verify_author_role),
):
    project = await db.get(Project, project_pk)
    await verify_project_by_author(project, token_payload['sub'])
    reward = await db.get(Reward, pk)
    if not reward or reward.project_id != project_pk:
        raise HTTPException(status_code=404, detail='Награда не найдена')

    db_reward_data = RewardData(**reward.__dict__)
    update_data = reward_data.model_dump(exclude_unset=True)
    updated = db_reward_data.model_copy(update=update_data)
    db.add(updated)
    await db.commit()
    await db.refresh(updated)
    return updated
