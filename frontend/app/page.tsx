"use client";

import React, { useState } from "react";
import axios from "axios";
import { 
  Search, Cpu, AlertTriangle, DollarSign, Wrench, CheckCircle, XCircle, AlertCircle, Tag, ExternalLink,
  Smartphone, Laptop, Monitor, Battery, BatteryCharging, BatteryWarning // <--- NOVOS ÍCONES
} from "lucide-react";

interface SpecItemProps {
  label: string;
  value: any;
}

const SpecItem: React.FC<SpecItemProps> = ({ label, value }) => (
  <div className="flex flex-col mb-2">
    <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">{label}</span>
    <span className="text-cyan-100 font-medium truncate font-mono text-sm">
      {value || "N/A"}
    </span>
  </div>
);

const getCategoryIcon = (category: string) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("laptop") || cat.includes("portátil")) return <Laptop className="w-6 h-6 text-cyan-400" />;
  if (cat.includes("smartphone") || cat.includes("telemóvel") || cat.includes("phone")) return <Smartphone className="w-6 h-6 text-purple-400" />;
  return <Monitor className="w-6 h-6 text-blue-400" />; // Desktop por defeito
};

const getBatteryStatus = (percentage: number) => {
  if (!percentage) return { color: "text-slate-500", icon: <Battery className="w-6 h-6" />, text: "Não Info" };
  
  if (percentage >= 90) return { color: "text-green-400", border: "border-green-500", icon: <BatteryCharging className="w-6 h-6 text-green-400" />, text: "Excelente" };
  if (percentage >= 80) return { color: "text-yellow-400", border: "border-yellow-500", icon: <Battery className="w-6 h-6 text-yellow-400" />, text: "Saudável" };
  return { color: "text-red-400", border: "border-red-500", icon: <AlertTriangle className="w-6 h-6 text-red-400" />, text: "Degradada (Trocar!)" };
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!inputText) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post("http://localhost:8000/analyze/specs", {
        raw_text: inputText,
        manual_price: manualPrice ? parseFloat(manualPrice) : null,
      });
      setResult(response.data);
    } catch (err) {
      setError("Falha na conexão. Verifica o backend (porta 8000).");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (color: string) => {
    switch (color) {
      case "green": return "border-green-500 text-green-400 bg-green-950/30";
      case "yellow": return "border-yellow-500 text-yellow-400 bg-yellow-950/30";
      case "red": return "border-red-500 text-red-400 bg-red-950/30";
      default: return "border-slate-500 text-slate-400 bg-slate-950";
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
              V-PRICE SCANNER <span className="text-xs text-slate-500 font-normal align-top">v2.5</span>
            </h1>
          </div>
          <div className="hidden md:block text-xs text-slate-500">
             System: <span className="text-green-500">GROQ // KUANTOKUSTA LINK</span>
          </div>
        </div>

        {/* INPUT */}
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

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {error}
          </div>
        )}

        {/* RESULTADOS */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            
            {/* 1. VEREDITO (Topo) */}
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
            
            {/* 2. COLUNA ESQUERDA (Resumo) */}
            <div className="col-span-1 lg:col-span-4 space-y-6">

              {/* BADGE DE CATEGORIA */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(result.category)}
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Tipo Detetado</span>
                    <h3 className="text-lg font-bold text-white capitalize">{result.category || "Desktop"}</h3>
                  </div>
                </div>
              </div>

              {/* BATERIA */}
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

              {/* Valor Justo */}
              <div className="bg-slate-900 p-6 rounded-xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-32 h-32 text-green-500" /></div>
                <h2 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-2">Valor Real (Usado)</h2>
                <span className="text-5xl font-black text-white tracking-tighter">{result.calculated_fair_price}€</span>
                <p className="text-xs text-slate-400 mt-2">Valor para o sistema completo.</p>
              </div>

               {/* Estratégia */}
               <div className="bg-slate-900 p-6 rounded-xl border border-cyan-500/30">
                  <span className="text-xs text-cyan-400 font-mono block mb-2 font-bold tracking-wider flex items-center gap-2">
                    <Wrench className="w-3 h-3" /> ESTRATÉGIA
                  </span>
                  <p className="text-sm text-cyan-100 leading-relaxed font-medium">"{result.negotiation_tactic}"</p>
               </div>

                {/* Specs Resumo */}
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Specs Principais</h3>
                  <SpecItem label="CPU" value={result.cpu} />
                  <SpecItem label="GPU" value={result.gpu} />
                  <SpecItem label="RAM" value={result.ram} />
               </div>
            </div>

            {/* 3. COLUNA DIREITA (Tabela Detalhada) */}
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
              <p className="text-[10px] text-slate-600 mt-4 text-center italic">
                *Clica no nome da peça para ver preços reais no KuantoKusta.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}