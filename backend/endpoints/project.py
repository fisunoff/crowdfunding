from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import get_db, Project
from schemas.project import CreatedProjectData, BaseProjectData
from utils.jwt_token import verify_token, verify_author_role

project_router = APIRouter()


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
    if not project:
        raise HTTPException(status_code=404, detail='Проект не найден.')
    if project.author_id != int(token_payload['sub']):
        raise HTTPException(status_code=403, detail='Вы не можете удалить этот проект.')
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
    if not project:
        raise HTTPException(status_code=404, detail='Проект не найден.')
    if project.author_id != int(token_payload['sub']):
        raise HTTPException(status_code=403, detail='Вы не можете удалить этот проект.')
    if project.status != 'draft':
        raise HTTPException(status_code=403, detail='Проект нельзя перевести на модерацию.')
    project.status = 'onModeration'
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
