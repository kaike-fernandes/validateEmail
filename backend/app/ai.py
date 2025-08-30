import os, json, re
from .preprocess import clean

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

def _baseline(text: str):
    t = text.lower()
    improd = ["feliz natal", "boas festas", "parabéns", "obrigado", "agradeço"]
    prod = ["status", "atualização", "suporte", "ticket", "protocolo", "erro", "fatura", "anexo", "segue em anexo"]

    score = 0
    score += any(k in t for k in prod)
    score -= any(k in t for k in improd)

    category = "Produtivo" if score > 0 else "Improdutivo"
    reply = (
        "Obrigado pela mensagem! Registramos sua solicitação e retornaremos com a atualização do status em breve."
        if category == "Produtivo" else
        "Agradecemos a mensagem! Não é necessária nenhuma ação no momento."
    )
    return {
        "category": category,
        "confidence": 0.6 if score != 0 else 0.5,
        "reply": reply,
        "justification": "Classificação por regras simples.",
        "model": "baseline-rules"
    }

def _openai(text: str):
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    system = (
        "Você é um classificador PT-BR. Responda em JSON com: "
        "category ('Produtivo'|'Improdutivo'), confidence (0..1), reply, justification."
    )
    user = f"Classifique e gere resposta curta e profissional:\n---\n{text}\n---"
    r = client.chat.completions.create(
        model=OPENAI_MODEL,
        temperature=0.2,
        messages=[{"role":"system","content":system},{"role":"user","content":user}]
    ).choices[0].message.content
    m = re.search(r"\{[\s\S]*\}", r)
    payload = json.loads(m.group(0) if m else r)
    payload["category"] = "Produtivo" if str(payload.get("category","")).lower().startswith("prod") else "Improdutivo"
    payload["confidence"] = float(payload.get("confidence", 0.7))
    payload["model"] = OPENAI_MODEL
    return payload

def analyze(text: str, mode: str = "ai"):
    text = clean(text)
    if mode == "baseline" or not os.getenv("OPENAI_API_KEY"):
        return _baseline(text)
    try:
        return _openai(text)
    except Exception:
        return _baseline(text)
