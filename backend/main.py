from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Importar os nossos módulos
from scraper import extract_hardware_data

app = FastAPI(title="V-Price Scanner API")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELO DE DADOS ATUALIZADO ---
class AnalysisRequest(BaseModel):
    raw_text: str
    manual_price: Optional[float] = None  # <--- NOVO CAMPO: Preço inserido pelo Vicius

@app.get("/")
def read_root():
    return {"status": "online", "system": "V-Price Scanner v2.1 (Groq Edition)"}

@app.post("/analyze/specs")
async def analyze_specs(request: AnalysisRequest):
    print(f"📡 A analisar input...")
    
    # --- MUDANÇA CRÍTICA AQUI ---
    # Adicionámos 'await' porque agora a função é assíncrona
    data = await extract_hardware_data(request.raw_text) 
    # ----------------------------
    
    if "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])
    
    # Garante que a categoria existe (fallback para Desktop se a IA falhar)
    category = data.get("category", "Desktop") 
    data["category"] = category

    # --- LÓGICA NOVA DE SOMA ---
    total_used = 0.0
    total_new = 0.0
    
    # Percorre a lista de componentes que a IA gerou
    components = data.get("components", [])
    for comp in components:
        total_used += comp.get("price_used", 0)
        total_new += comp.get("price_new", 0)

    # Cálculos Finais
    fair_bundle_price = total_used * 0.90 # 10% desconto bundle
    
    data["total_parts_value_used"] = round(total_used, 2)
    data["total_parts_value_new"] = round(total_new, 2)
    data["calculated_fair_price"] = round(fair_bundle_price, 2)

    # --- LÓGICA DO VEREDITO (Mantém-se a mesma, mas adaptada às variáveis novas) ---
    listing_price = request.manual_price if request.manual_price else data.get("listing_price_found")
    if request.manual_price:
        listing_price = request.manual_price
        data["listing_price_found"] = listing_price

    # ... (Lógica do Veredito igual ao que tinhas antes) ...
    verdict = "N/A"
    verdict_color = "gray"
    tactic = ""
    
    if listing_price and listing_price > 0:
        if listing_price <= fair_bundle_price:
            verdict = "COMPENSA COMPRAR ✅"
            verdict_color = "green"
            tactic = f"Preço top! Pede {listing_price}€, vale {round(fair_bundle_price)}€."
        elif listing_price <= (fair_bundle_price * 1.15):
            verdict = "NEGOCIÁVEL ⚠️"
            verdict_color = "yellow"
            tactic = f"Pede {listing_price}€. O justo é {round(fair_bundle_price)}€. Oferece {round(fair_bundle_price*0.95)}€."
        else:
            verdict = "NÃO COMPENSA ❌"
            verdict_color = "red"
            tactic = f"Roubo! Pede {listing_price}€ por material de {round(fair_bundle_price)}€."
    else:
        tactic = f"Vale ~{round(fair_bundle_price)}€. Pergunta o preço."

    data["verdict"] = verdict
    data["verdict_color"] = verdict_color
    data["negotiation_tactic"] = tactic

    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)