# frontend/Dockerfile

# --- MUDANÇA AQUI: De 18 para 20 ---
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json ./
# Forçar a instalação do Prisma compatível
RUN npm install
RUN npm install prisma@5.19.0 @prisma/client@5.19.0 --save-exact

# Copiar código e gerar Prisma
COPY . .
RUN npx prisma generate

# Construir o site (Build)
RUN npm run build

# --- Fase Final (Runner Leve) ---
# --- MUDANÇA AQUI TAMBÉM: De 18 para 20 ---
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]