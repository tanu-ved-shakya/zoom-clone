import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import meetings, participants, users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zoom Clone API",
    description="Backend API powering the Zoom Web Application Clone",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(meetings.router)
app.include_router(participants.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Zoom Web App Clone API",
        "docs_url": "/docs"
    }

if __name__ == "_main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
