import datetime

import pydantic

from schemas.project import CreatedProjectData
from schemas.reward import RewardData

__all__ = [
    'ContribSchema',
]


class ContribSchema(pydantic.BaseModel):
    id: int
    project_id: int
    reward_id: int
    profile_id: int
    status: str
    created_at: datetime.datetime


class DetailedContribSchema(ContribSchema):
    project: CreatedProjectData
    reward: RewardData
