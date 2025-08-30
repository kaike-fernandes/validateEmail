from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from.schemas import AnalyzeRequest, AnalyzeResponse
from .preprocess import extract_text_from_pdf_bytes
from .ai import analyze
import os


app = FastAPI(title="Email AI - API", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {
        "success": True,
        "message": "Olá, você está na API de validação de Email"}


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


@app.post("/upload", response_model=AnalyzeResponse)
async def upload(file: UploadFile = File(...), mode: str = "ai"):
    if file.content_type not in ("text/plain", "application/pdf"):
        raise HTTPException(400, "Apenas .txt ou .pdf")
    data = await file.read()
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf_bytes(data)
    else:
        text = data.decode("utf-8", errors="ignore")
    if not text:
        raise HTTPException(400, "Não foi possível extrair texto")
    return AnalyzeResponse(**analyze(text, mode=mode))