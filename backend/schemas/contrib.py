import datetime

import pydantic

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
