from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Corpo do email em texto puro")
    mode: str =  Field("ai", description="'ai' | 'baseline'")

class AnalyzeResponse(BaseModel):
    category: str
    confidence: str
    reply: str
    justification: str
    model: str