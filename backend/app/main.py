from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI(title="Email AI - API", version="0.0.1")

@app.get("/health")
def health():
    return {"ok": True, "env": "prod" if os.getenv("RENDER") else "local"}

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    category: str
    confidence: float
    reply: str
    model: str

# endpoint mockado p/ manter deploy estável
@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(_: AnalyzeRequest):
    return AnalyzeResponse(
        category="Improdutivo",
        confidence=0.5,
        reply="Obrigado pela mensagem!",
        model="mock"
    )
