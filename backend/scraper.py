import os
import json
import re
from groq import AsyncGroq  # <--- CLIENTE ASSÍNCRONO
from dotenv import load_dotenv
from playwright.async_api import async_playwright # <--- DRONE ASSÍNCRONO

load_dotenv(dotenv_path="../.env")

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("❌ ERRO: GROQ_API_KEY não encontrada no .env")

# Inicializa o cliente Async
client = AsyncGroq(api_key=api_key)

async def fetch_ad_text(url: str):
    """Drone Assíncrono: Não bloqueia o servidor enquanto navega."""
    print(f"🌍 A aceder ao Realm (Async): {url}")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Tenta enganar detetores de bots
            await page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
            
            # Timeout curto para não prender o servidor
            await page.goto(url, timeout=20000)
            await page.wait_for_load_state("domcontentloaded")
            
            text = await page.inner_text("body")
            await browser.close()
            
            clean_text = re.sub(r'\s+', ' ', text).strip()
            return clean_text[:12000]
    except Exception as e:
        print(f"🔥 Falha no drone: {e}")
        return None

async def extract_hardware_data(text_input: str):
    # 1. Se for URL, chama o Drone Assíncrono
    if text_input.startswith("http"):
        scraped_text = await fetch_ad_text(text_input) # <--- AWAIT AQUI
        if scraped_text:
            text_input = scraped_text
        else:
            return {"error": "O Drone falhou (Site bloqueado ou Login necessário). Tenta colar o texto manual."}

    # 2. Prompt (Mantém-se igual)
    prompt = f"""
    És um perito em avaliação de tecnologia usada em Portugal (Hardware PC, Portáteis, Smartphones).
    Analisa o texto e cria uma tabela de avaliação com foco em DESGASTE.

    TEXTO: "{text_input[:6000]}"

    REGRAS ESPECÍFICAS PARA SMARTPHONES:
    1. Procura EXPLICITAMENTE por "Saúde da Bateria", "Capacidade Máxima", "Battery Health" ou "%".
    2. Se encontrares a % (ex: 87%):
       - Acima de 90%: Valoriza o equipamento.
       - Entre 80% e 89%: Desvaloriza ligeiramente (uso normal).
       - Abaixo de 80%: Desvaloriza MUITO (aplica o custo de uma bateria nova, ~80€, no preço usado).
    3. Se não encontrares a %, assume "Desconhecido" mas avisa que é arriscado.

    REGRAS CRÍTICAS PARA RAM:
    1. Procura ativamente por configurações de pentes: "2x8GB", "4x4GB", "1x16GB", "Dual Channel", "Quad Channel".
    2. Se encontrares apenas "16GB" sem detalhes de pentes, assume o cenário mais comum (geralmente 2x8GB em desktops gamer, 1x16GB em laptops baratos), mas adiciona "(Verificar Fotos)" no nome.
    3. Se o texto mencionar explicitamente a quantidade de pentes (ex: "tem 4 pentes"), usa isso para calcular.

    TAREFAS:
    1. Classifica o tipo: "Desktop", "Laptop" ou "Smartphone".
    2. Identifica componentes (CPU, GPU, RAM, Ecrã, Bateria, etc.).
    3. Estima preços (Novo vs Usado) em Euros.

    RESPOSTA JSON OBRIGATÓRIA:
    {{
         "category": "Desktop/Laptop/Smartphone",
         "cpu": "...", "gpu": "...", "ram": "Ex: 16GB (2x8GB) DDR4", "storage": "...",
         "condition": "Usado",
         "battery_health": 87 (ou null se não for telemóvel/laptop ou não disser),
         "battery_verdict": "Bom/Aceitável/Mau - Precisa Trocar",
         "year_estimation": 20XX,
         "listing_price_found": 0.0 (ou null),
         "components": [
             {{ "name": "Peça", "model": "Detalhe", "price_new": 0.0, "price_used": 0.0 }}
         ]
    }}
    """

    try:
        # Chamada Assíncrona ao Groq
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a JSON extraction machine. Only JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        json_str = chat_completion.choices[0].message.content
        return json.loads(json_str)

    except Exception as e:
        return {"error": f"Erro no motor IA: {str(e)}"}