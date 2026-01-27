from datetime import datetime

# --- CONFIGURAÇÕES DE PISTA (Constantes) ---
DEPRECIATION_RATE_PER_YEAR = 0.12  # 12% ao ano
NO_WARRANTY_PENALTY = 0.10         # -10% se não tiver garantia
OBSOLETE_TECH_PENALTY = 0.20       # -20% se for material antigo (DDR3, HDD)

def calculate_fair_price(current_new_price: float, year_released: int, condition: str, tech_type: str = "modern"):
    """
    Calcula o preço justo de hardware usado.
    """
    current_year = datetime.now().year
    years_used = current_year - year_released
    
    # Evitar anos negativos ou zero (mínimo 0.5 anos para peças do próprio ano)
    if years_used < 0.5:
        years_used = 0.5

    # 1. Depreciação Base por Idade
    # Fórmula: Preço * (1 - (0.15 * Anos))
    depreciation_factor = 1.0 - (DEPRECIATION_RATE_PER_YEAR * years_used)
    
    # Limite mínimo: Nunca valorizar abaixo de 20% do valor novo (sucata tem valor)
    if depreciation_factor < 0.20:
        depreciation_factor = 0.20

    current_value = current_new_price * depreciation_factor

    # 2. Penalidades Específicas
    # Se a condição não indicar "Garantia" ou "Novo", assumimos sem garantia
    if "garantia" not in condition.lower() and "novo" not in condition.lower():
        print(f"   > Aplicando penalidade de Sem Garantia (-{NO_WARRANTY_PENALTY*100}%)")
        current_value -= (current_value * NO_WARRANTY_PENALTY)

    # Penalidade por Tech Obsoleta (ex: DDR3 detetado no nome ou tipo)
    if "ddr3" in tech_type.lower() or "hdd" in tech_type.lower():
        print(f"   > Aplicando penalidade de Tech Obsoleta (-{OBSOLETE_TECH_PENALTY*100}%)")
        current_value -= (current_value * OBSOLETE_TECH_PENALTY)

    return round(current_value, 2)

# --- TESTE RÁPIDO ---
if __name__ == "__main__":
    print("--- 🏎️ Teste de Bancada V-Price ---")
    
    # Exemplo: RTX 3060 (Lançada ~2021). Preço novo hoje ~300€.
    # Cenário: Usada, sem garantia.
    preco_novo = 300.00
    ano_lancamento = 2021
    condicao = "Usado, a funcionar bem"
    
    valor_justo = calculate_fair_price(preco_novo, ano_lancamento, condicao)
    
    print(f"\nItem: RTX 3060 (Base: {ano_lancamento})")
    print(f"Preço Novo Atual: €{preco_novo}")
    print(f"Valor Justo Calculado: €{valor_justo}")
    print("-------------------------------------")