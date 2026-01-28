# backend/Dockerfile
FROM python:3.10-slim

# Instalar dependências de sistema para o Playwright e Postgres
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar bibliotecas Python
COPY requirements.txt .
# Se não tiveres requirements.txt, descomenta a linha de baixo e comenta a de cima:
# RUN pip install fastapi uvicorn playwright groq python-dotenv psycopg2-binary asyncpg

# Se já tens o requirements.txt criado pelo pip freeze, usa-o. 
# Caso contrário, garante que instalas o que precisas:
RUN pip install fastapi uvicorn playwright groq python-dotenv psycopg2-binary asyncpg

# Instalar os browsers do Playwright
RUN playwright install --with-deps chromium

# Copiar o código
COPY . .

# Comando de arranque
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]