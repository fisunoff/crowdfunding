from datetime import date

import pydantic


class BaseProjectData(pydantic.BaseModel):
    title: str
    description: str
    goal_amount: float
    project_type: str
    start_date: date
    end_date: date


class CreatedProjectData(BaseProjectData):
    id: int
    author_id: int
    status: str
    moderator_comment: str | None = None
