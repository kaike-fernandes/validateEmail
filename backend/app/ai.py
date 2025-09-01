# app/ai.py
import os, json, re, time
from typing import Dict
from dotenv import load_dotenv
load_dotenv() 

PROD_HINTS = (
    "status", "atualização", "andamento", "suporte", "ticket", "protocolo",
    "erro", "falha", "acesso", "login", "fatura", "cobrança", "anexo", "segue em anexo",
)
IMPROD_HINTS = ("feliz natal", "boas festas", "parabéns", "obrigado", "agradeço", "bom dia", "boa tarde")

def clean(text: str) -> str:
    if not text: return ""
    return " ".join(text.replace("\r", "\n").split())

def _baseline(text: str) -> Dict:
    t = text.lower()
    score = 0
    score += any(k in t for k in PROD_HINTS)
    score -= any(k in t for k in IMPROD_HINTS)
    category = "Produtivo" if score > 0 else "Improdutivo"
    reply = (
        "Obrigado pela mensagem! Registramos sua solicitação e retornaremos com a atualização do status em breve."
        if category == "Produtivo" else
        "Agradecemos a sua mensagem! Não é necessária nenhuma ação no momento."
    )
    return {
        "category": category,
        "confidence": 0.6 if score != 0 else 0.5,
        "reply": reply,
        "justification": "Classificação por regras simples (palavras-chave).",
        "model": "baseline-rules",
    }

def _openai(text: str) -> Dict:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    system = (
        """
            Você é um classificador profissional de e-mails corporativos.
            Seu foco é ler interpretar, analisar e classificar os textos ou arquivos de e-mails.
            Qualquer assunto que fuja deste tema fora irá responder de forma sucinta, clara, objetiva e educada sugerindo uma mensagem de resposta a esse eimport matplotlib.pyplot as plt
            Todo assunto ou arquivo que tiver conteúdos importantes do viés corporativo você irá responder com clareza e de form detalhada. 
            Responda APENAS um JSON com: category ('Produtivo'|'Improdutivo'), confidence (0..1), reply (curta e profissional), justification.
        """
    )
    user = f"Classifique e gere resposta:\n---\n{text}\n---"

    t0 = time.perf_counter()
    resp = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[{"role":"system","content":system},{"role":"user","content":user}],
    )
    latency_ms = int((time.perf_counter() - t0) * 1000)

    content = resp.choices[0].message.content or "{}"
    # Extraia JSON mesmo se vier texto ao redor
    m = re.search(r"\{[\s\S]*\}", content)
    raw = m.group(0) if m else content

    try:
        data = json.loads(raw)
    except Exception as e:
        # log e fallback controlado
        print(f"[AI JSON PARSE] content='{content[:200]}...' err={type(e).__name__}: {e}")
        # resposta mínima para não quebrar contrato
        data = {"category": "Improdutivo", "confidence": 0.7, "reply": "Obrigado pela mensagem!", "justification": "Falha ao interpretar JSON da IA."}

    cat = str(data.get("category","")).lower()
    data["category"] = "Produtivo" if cat.startswith("prod") else "Improdutivo"
    data["confidence"] = float(data.get("confidence", 0.8))
    data["model"] = model
    # (opcional) incluir métricas
    # data["usage"] = getattr(resp, "usage", None) and resp.usage.to_dict()
    # data["latency_ms"] = latency_ms
    return data

def analyze(text: str, mode: str = "ai") -> Dict:
    text = clean(text)
    # Sem chave ou modo baseline → baseline
    if mode == "baseline" or not os.getenv("OPENAI_API_KEY"):
        return _baseline(text)
    # Tenta IA; se falhar, cai no baseline
    try:
        return _openai(text)
    except Exception as e:
        # Log mínimo no stdout para ver no Render
        print(f"[AI FALLBACK] {type(e).__name__}: {e}")
        return _baseline(text)
