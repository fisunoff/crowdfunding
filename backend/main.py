from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(
    title='Краудфандинговая платформа',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Разрешенные домены
    allow_methods=['*'],  # Разрешенные методы (GET, POST и т. д.)
    allow_headers=['*'],  # Разрешенные заголовки
)

