# Multi-stage build para HRFlow Frontend
FROM node:18-alpine AS base

# Configuração do diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# ================================
# Estágio de dependências
# ================================
FROM base AS deps

# Instala todas as dependências incluindo devDependencies
RUN npm ci

# ================================
# Estágio de build
# ================================
FROM base AS builder

# Copia node_modules do estágio deps
COPY --from=deps /app/node_modules ./node_modules

# Copia todo o código-fonte
COPY . .

# Configura variáveis de ambiente para build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Constrói a aplicação
RUN npm run build

# ================================
# Estágio de produção
# ================================
FROM node:18-alpine AS production

# Instala curl para health checks
RUN apk add --no-cache curl

# Cria usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hrflow

# Configuração do diretório de trabalho
WORKDIR /app

# Copia next.config.js
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public

# Copia dependências
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copia os arquivos de build
COPY --from=builder --chown=hrflow:nodejs /app/.next/standalone ./
COPY --from=builder --chown=hrflow:nodejs /app/.next/static ./.next/static

# Define usuário não-root
USER hrflow

# Expõe a porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Define variável de ambiente
ENV PORT 3000
ENV NODE_ENV production

# Comando para iniciar a aplicação
CMD ["node", "server.js"] 