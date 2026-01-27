import os
import google.generativeai as genai
from dotenv import load_dotenv

# Carregar ambiente
load_dotenv(dotenv_path="../.env")

# Configurar chave
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("🔍 A verificar modelos disponíveis para a tua chave...")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"❌ Erro ao listar: {e}")
