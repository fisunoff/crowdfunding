import pydantic

__all__ = [
    'BaseProfileData',
    'ProfileReadData',
    'ProfileCreateData',
]


class BaseProfileData(pydantic.BaseModel):
    name: str = pydantic.Field(max_length=255)
    surname: str = pydantic.Field(max_length=255)
    patronymic: str = pydantic.Field(max_length=255)
    bank_number: str = pydantic.Field(max_length=255)
    phone_number: str | None = None

class ProfileReadData(BaseProfileData):
    id: int

    login: str

    is_admin: bool = pydantic.Field(default=False)
    is_author: bool = pydantic.Field(default=False)
    is_investor: bool = pydantic.Field(default=False)

class ProfileCreateData(BaseProfileData):
    login: str
    password: str

    is_admin: bool = pydantic.Field(default=False)
    is_author: bool = pydantic.Field(default=False)
    is_investor: bool = pydantic.Field(default=False)
