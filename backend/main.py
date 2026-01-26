# backend/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Status": "Pronto para a corrida", "Driver": "Vicius"}