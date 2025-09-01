# app/main.py
import os, io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pypdf import PdfReader
from .ai import analyze
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Email Classifier AI", version="1.0.0")

origins = list(filter(None, [
    os.getenv("FRONTEND_ORIGIN"),
    "http://localhost:5173", "http://127.0.0.1:5173",
]))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=5)
    mode: str = Field("ai", description="'ai' | 'baseline'")

class AnalyzeResponse(BaseModel):
    category: str
    confidence: float
    reply: str
    justification: str
    model: str

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/diag")
async def diag():
    return {
        "has_key": bool(os.getenv("OPENAI_API_KEY")),
        "model_env": os.getenv("OPENAI_MODEL"),
        "cors_origins": list(origins) if origins else ["*"],
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(body: AnalyzeRequest):
    data = analyze(body.text, mode=body.mode)
    return AnalyzeResponse(**data)

@app.post("/upload", response_model=AnalyzeResponse)
async def upload(file: UploadFile = File(...), mode: str = "ai"):
    if file.content_type not in ("text/plain", "application/pdf"):
        raise HTTPException(400, "Apenas .txt ou .pdf")

    raw = await file.read()
    if file.content_type == "application/pdf":
        reader = PdfReader(io.BytesIO(raw))
        text = "\n".join((p.extract_text() or "") for p in reader.pages).strip()
    else:
        text = raw.decode("utf-8", errors="ignore").strip()

    if not text or len(text) < 5:
        raise HTTPException(400, "Não foi possível extrair texto útil")

    data = analyze(text, mode=mode)
    return AnalyzeResponse(**data)
