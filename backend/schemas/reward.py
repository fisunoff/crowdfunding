from pydantic import BaseModel


class BaseRewardData(BaseModel):
    title: str
    description: str
    price: float
    quantity: int

class RewardData(BaseRewardData):
    id: int
    active: bool
