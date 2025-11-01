import pydantic


class BaseProjectData(pydantic.BaseModel):
    title: str
    description: str
    goal_amount: float
    project_type: str