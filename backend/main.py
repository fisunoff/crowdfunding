from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from endpoints import auth, profiles

app = FastAPI(
    title='Краудфандинговая платформа',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Разрешенные домены
    allow_methods=['*'],  # Разрешенные методы (GET, POST и т. д.)
    allow_headers=['*'],  # Разрешенные заголовки
)

app.include_router(auth.auth_router, prefix='/auth')
app.include_router(profiles.profile_router, prefix='/profile')
