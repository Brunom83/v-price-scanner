"use server";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function saveScan(data: any) {
  try {
    let title = "Scan desconhecido";
    if (data.cpu && data.gpu) {
      title = `${data.cpu} + ${data.gpu}`;
    } else if (data.raw_text) {
      title = data.raw_text.substring(0, 30) + "...";
    }

    // --- LÓGICA NOVA: Detetar Link ---
    let detectedUrl = null;
    const text = data.raw_text || "";
    // Se começar por http ou https, assumimos que é um link
    if (text.trim().startsWith("http")) {
      detectedUrl = text.trim();
    }
    // --------------------------------

    const scan = await prisma.scan.create({
      data: {
        rawText: text,
        productUrl: detectedUrl, // <--- Guardamos aqui!
        title: title,
        fairPrice: data.calculated_fair_price || 0,
        listingPrice: data.listing_price_found || null,
        verdict: data.verdict || "N/A",
        category: data.category || "Outro",
        componentsJson: JSON.stringify(data.components || []),
      },
    });
    
    return { success: true, id: scan.id };
  } catch (error) {
    console.error("Erro ao guardar scan:", error);
    return { success: false };
  }
}

export async function getHistory() {
  try {
    const scans = await prisma.scan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12
    });
    return scans;
  } catch (error) {
    console.error("Erro a ler histórico:", error);
    return [];
  }
}

// --- NOVAS FUNÇÕES DE LIMPEZA ---

// 1. Apagar um scan específico
export async function deleteScan(id: string) {
  try {
    await prisma.scan.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao apagar scan:", error);
    return { success: false };
  }
}

// 2. Apagar TODO o histórico (Reset)
export async function clearHistory() {
  try {
    await prisma.scan.deleteMany({}); // Sem filtro apaga tudo
    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
    return { success: false };
  }
}