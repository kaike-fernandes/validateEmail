# Case - Classificador de E-mails com IA

- Vaga: **Desenvolvedor Pleno**
- Nome Completo: **Kaike de Souza Fernandes**

📦 Requisitos
    - Python 3.10+
    - Node.js 18+
    - Chave OpenAI (opcional – só para modo IA)
    - Sem chave OpenAI a app funciona em baseline (regras simples).

 *Estrutura*

 ```
  ├─ backend/
  │  ├─ app/
  │  │  ├─ main.py
  │  │  ├─ ai.py
  |  |  ├─ schemas.py
  │  │  └─ preprocess.py
  │  ├─ requirements.txt
  │  └─ .env 
  └─ frontend/
     ├─ src/App.jsx
     ├─ src/index.css
     ├─ index.html
     └─ package.json  
 ```


⚙️ Variáveis de Ambiente
**Backend (backend/.env)**

# Para usar IA (opcional). Sem esta chave, cai em baseline automaticamente.
    OPENAI_API_KEY=coloque_sua_chave_aqui
    OPENAI_MODEL=gpt-4o-mini

# (opcional) libera CORS para seu front local/produção
    FRONTEND_ORIGIN=http://localhost:5173

**Frontend (frontend/.env)**

    VITE_API_BASE_URL=http://localhost:8000


## ▶️ Rodar o Backend (FastAPI)

    ```
        cd backend
        python -m venv .venv
        pip install -r requirements.txt
        python -m uvicorn app.main:app --reload --port 8000
    ```

## ▶️ Rodar o Frontend (Vite/React)

    ```
        cd frontend
        npm install
        npm run dev
    ```

## 🧪 Como validar o fluxo (fim-a-fim)

**1.** Suba o backend (uvicorn) e verifique /health.
**2.** Inicie o frontend (npm run dev).
**3.** Na UI:

    - Cole um texto de email produtivo (ex.: “poderiam informar o status do ticket 123?”) → categoria Produtivo.
    - Cole um texto improdutivo (ex.: “Feliz Natal!”) → categoria Improdutivo.
    - Faça upload de .txt/.pdf (com texto selecionável).

**4.** Verifique no JSON retornado (console/network) o campo model:

    - gpt-… → IA ativa.
    - baseline-rules → baseline/fallback.