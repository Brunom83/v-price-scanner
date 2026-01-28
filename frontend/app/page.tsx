"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveScan, getHistory, deleteScan, clearHistory } from "./actions"; // <--- Imports agrupados
import { 
  Search, Cpu, AlertTriangle, DollarSign, Wrench, CheckCircle, XCircle, AlertCircle, Tag, ExternalLink,
  Smartphone, Laptop, Monitor, Battery, BatteryCharging, BatteryWarning, History, ArrowRight, Trash2 // <--- Adicionei o Trash2
} from "lucide-react";

// --- Funções Auxiliares (UI Helpers) ---
const getCategoryIcon = (category: string) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("laptop") || cat.includes("portátil")) return <Laptop className="w-6 h-6 text-cyan-400" />;
  if (cat.includes("smartphone") || cat.includes("telemóvel") || cat.includes("phone")) return <Smartphone className="w-6 h-6 text-purple-400" />;
  return <Monitor className="w-6 h-6 text-blue-400" />;
};

const getBatteryStatus = (percentage: number) => {
  if (!percentage) return { color: "text-slate-500", icon: <Battery className="w-6 h-6" />, text: "Não Info" };
  if (percentage >= 90) return { color: "text-green-400", border: "border-green-500", icon: <BatteryCharging className="w-6 h-6 text-green-400" />, text: "Excelente" };
  if (percentage >= 80) return { color: "text-yellow-400", border: "border-yellow-500", icon: <Battery className="w-6 h-6 text-yellow-400" />, text: "Saudável" };
  return { color: "text-red-400", border: "border-red-500", icon: <AlertTriangle className="w-6 h-6 text-red-400" />, text: "Degradada" };
};

const getVerdictColor = (color: string) => {
  switch (color) {
    case "green": return "border-green-500 text-green-400 bg-green-950/30";
    case "yellow": return "border-yellow-500 text-yellow-400 bg-yellow-950/30";
    case "red": return "border-red-500 text-red-400 bg-red-950/30";
    default: return "border-slate-500 text-slate-400 bg-slate-950";
  }
};

// --- Componente Principal ---
export default function Home() {
  const [inputText, setInputText] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  // Carregar histórico ao iniciar
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleAnalyze = async () => {
    if (!inputText) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Chamar o Backend (Python + Groq)
      const response = await axios.post("/api/python/analyze/specs", {
        raw_text: inputText,
        manual_price: manualPrice ? parseFloat(manualPrice) : null,
      });
      
      const scanData = response.data;
      setResult(scanData);

      // 2. Guardar na Base de Dados (Prisma)
      await saveScan({ ...scanData, raw_text: inputText });
      
      // 3. Atualizar a lista
      loadHistory();

    } catch (err) {
      setError("Falha na conexão. Verifica o backend (porta 8000).");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Restaurar scan do histórico
  const restoreScan = (scan: any) => {
    setResult({
      category: scan.category,
      calculated_fair_price: scan.fairPrice,
      listing_price_found: scan.listingPrice,
      verdict: scan.verdict,
      verdict_color: scan.verdict.includes("COMPENSA") ? "green" : scan.verdict.includes("NEGOCIÁVEL") ? "yellow" : "red",
      components: JSON.parse(scan.componentsJson),
      negotiation_tactic: "Histórico recuperado.",
      battery_health: null, // Valores padrão para evitar crash
      total_parts_value_new: 0,
      total_parts_value_used: scan.fairPrice / 0.9 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apagar um scan individual
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Trava o clique para não abrir o scan
    if (confirm("Tens a certeza que queres apagar este scan?")) {
      await deleteScan(id);
      loadHistory();
    }
  };

  // Apagar tudo
  const handleClearAll = async () => {
    if (confirm("⚠️ CUIDADO: Isto vai apagar TODO o histórico. Continuar?")) {
      await clearHistory();
      loadHistory();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-mono selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-cyan-500/30 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="text-cyan-400 w-8 h-8 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              V-PRICE SCANNER <span className="text-xs text-slate-500 font-normal align-top">v3.0</span>
            </h1>
          </div>
          <div className="hidden md:block text-xs text-slate-500">
             DB Status: <span className="text-green-500">CONNECTED</span>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl relative group hover:border-cyan-500/30 transition-all">
          <label className="block text-sm text-slate-400 mb-2 font-bold tracking-wide flex items-center gap-2">
            <Search className="w-4 h-4" /> DADOS DO ANÚNCIO
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-4 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all placeholder:text-slate-600 font-mono mb-4"
            placeholder="Cola aqui o link ou texto..."
          />
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="Preço Vendedor (€)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText}
              className="w-full md:w-2/3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              {loading ? (
                <span className="flex items-center gap-2 animate-pulse"><Wrench className="animate-spin w-4 h-4" /> A CALCULAR...</span>
              ) : (
                <>INICIAR SCANNER</>
              )}
            </button>
          </div>
        </div>

        {/* MENSAGEM DE ERRO */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {error}
          </div>
        )}

        {/* RESULTADOS (SÓ APARECE SE TIVERES UM SCAN) */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* 1. VEREDITO */}
            {result.verdict && result.verdict !== "N/A" && (
              <div className={`col-span-1 lg:col-span-12 p-6 rounded-xl border-2 flex flex-col md:flex-row items-center justify-between shadow-lg gap-4 ${getVerdictColor(result.verdict_color)}`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-black/20 rounded-full">
                    {result.verdict_color === 'green' ? <CheckCircle className="w-8 h-8" /> : 
                     result.verdict_color === 'red' ? <XCircle className="w-8 h-8" /> : 
                     <AlertCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Veredito</h3>
                    <span className="text-3xl font-black tracking-tighter drop-shadow-md">{result.verdict}</span>
                  </div>
                </div>
                {result.listing_price_found && (
                  <div className="bg-black/20 p-3 rounded-lg text-right">
                    <span className="text-xs block opacity-70">Preço Pedido</span>
                    <span className="text-2xl font-bold line-through decoration-white/50 opacity-80">{result.listing_price_found}€</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 2. COLUNA ESQUERDA */}
            <div className="col-span-1 lg:col-span-4 space-y-6">
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(result.category)}
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Tipo Detetado</span>
                    <h3 className="text-lg font-bold text-white capitalize">{result.category || "Desktop"}</h3>
                  </div>
                </div>
              </div>

               {(result.category === 'Smartphone' || result.category === 'Laptop') && (
                <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg bg-slate-900 ${result.battery_health ? getBatteryStatus(result.battery_health).border : 'border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/30 rounded-full">
                       {getBatteryStatus(result.battery_health).icon}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Bateria</span>
                      <span className={`text-xl font-bold ${getBatteryStatus(result.battery_health).color}`}>
                        {result.battery_health ? `${result.battery_health}%` : "N/D"}
                      </span>
                    </div>
                  </div>
                  {result.battery_health && (
                    <div className="text-right">
                       <span className={`text-xs font-bold px-2 py-1 rounded bg-black/40 ${getBatteryStatus(result.battery_health).color}`}>
                         {getBatteryStatus(result.battery_health).text}
                       </span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-slate-900 p-6 rounded-xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-32 h-32 text-green-500" /></div>
                <h2 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-2">Valor Real (Usado)</h2>
                <span className="text-5xl font-black text-white tracking-tighter">{result.calculated_fair_price}€</span>
                <p className="text-xs text-slate-400 mt-2">Valor para o sistema completo.</p>
              </div>

               <div className="bg-slate-900 p-6 rounded-xl border border-cyan-500/30">
                  <span className="text-xs text-cyan-400 font-mono block mb-2 font-bold tracking-wider flex items-center gap-2">
                    <Wrench className="w-3 h-3" /> ESTRATÉGIA
                  </span>
                  <p className="text-sm text-cyan-100 leading-relaxed font-medium">"{result.negotiation_tactic}"</p>
               </div>
            </div>

            {/* 3. COLUNA DIREITA (Tabela) */}
            <div className="col-span-1 lg:col-span-8 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col">
               <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-500" /> Comparador de Mercado
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Componente</th>
                      <th className="px-4 py-3 text-right text-cyan-500">Novo (Est.)</th>
                      <th className="px-4 py-3 text-right text-green-500">Usado (Est.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.components && result.components.map((comp: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-bold">{comp.name}</span>
                            <a 
                              href={`https://www.kuantokusta.pt/search?q=${encodeURIComponent(comp.model || "")}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-white font-medium truncate max-w-[200px] md:max-w-xs group-hover:text-cyan-400 flex items-center gap-1 transition-colors"
                            >
                              {comp.model || "Genérico"} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-cyan-200">
                          {comp.price_new > 0 ? `${comp.price_new}€` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-green-400 font-bold">
                          {comp.price_used}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950/50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-right text-white">TOTAL PEÇAS</td>
                      <td className="px-4 py-3 text-right text-cyan-500">{result.total_parts_value_new}€</td>
                      <td className="px-4 py-3 text-right text-green-500">{result.total_parts_value_used}€</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- 4. SECÇÃO DE HISTÓRICO --- */}
        <div className="border-t border-slate-800 pt-8 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          {/* Header da Secção com Botão Limpar Tudo */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-400 flex items-center gap-2">
              <History className="w-5 h-5" /> Histórico de Scans
            </h2>
            {history.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 border border-red-900/50 px-3 py-1.5 rounded hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Limpar Tudo
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.length > 0 ? (
              history.map((scan) => (
                <div key={scan.id} className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-[1.02] relative group">
                  
                  {/* Cabeçalho do Cartão */}
                  <div className="flex justify-between items-start mb-2" onClick={() => restoreScan(scan)}>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase bg-cyan-950/30 px-2 py-0.5 rounded">{scan.category}</span>
                    <span className="text-[10px] text-slate-500">{new Date(scan.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Título */}
                  <h3 className="text-white font-bold truncate mb-2 cursor-pointer group-hover:text-cyan-300 transition-colors" onClick={() => restoreScan(scan)}>
                    {scan.title}
                  </h3>
                  
                  {/* Dados */}
                  <div className="flex justify-between items-center text-sm mb-3" onClick={() => restoreScan(scan)}>
                    <span className="text-slate-400">Justo: <span className="text-white font-mono">{scan.fairPrice}€</span></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scan.verdict.includes("COMPENSA") ? "bg-green-900 text-green-400" :
                      scan.verdict.includes("NEGOCIÁVEL") ? "bg-yellow-900 text-yellow-400" : "bg-red-900 text-red-400"
                    }`}>
                      {scan.verdict}
                    </span>
                  </div>

                  {/* Rodapé: Botões de Ação */}
                  <div className="flex justify-between items-center border-t border-slate-800 pt-2 mt-2">
                    
                    {/* Botão de Link Original */}
                    {scan.productUrl ? (
                      <a 
                        href={scan.productUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        <ExternalLink className="w-3 h-3" /> Ver Anúncio
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-600">Scan Manual</span>
                    )}

                    {/* Lado Direito: Apagar e Detalhes */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleDelete(e, scan.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        title="Apagar este Scan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => restoreScan(scan)}
                        className="text-[10px] text-slate-500 group-hover:text-cyan-500 flex items-center gap-1"
                      >
                        Detalhes <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-600 italic col-span-3 text-center py-10">
                Ainda não há dados na Caixa Negra. Faz o teu primeiro scan!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}