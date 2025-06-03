#!/bin/bash

echo "🚀 Iniciando HRFlow em ambiente de desenvolvimento..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado! Por favor, instale o Docker e tente novamente."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado! Por favor, instale o Docker Compose e tente novamente."
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado! Por favor, instale o Node.js e tente novamente."
    exit 1
fi

# Verificar a versão do Node.js (deve ser >= 16.0.0)
node_version=$(node -v | cut -d 'v' -f 2)
required_version="16.0.0"

if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Versão do Node.js deve ser >= 16.0.0. Versão atual: $node_version"
    exit 1
fi

echo "✅ Pré-requisitos verificados com sucesso!"

# Iniciar infraestrutura com Docker Compose
echo "🐳 Iniciando infraestrutura (PostgreSQL, Redis, Kafka, MinIO)..."
docker-compose up -d postgres redis kafka zookeeper minio

# Aguardar serviços inicializarem
echo "⏳ Aguardando serviços inicializarem..."
sleep 5

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend && npm install

# Executar migrações do banco de dados
echo "🔄 Executando migrações do banco de dados..."
npx prisma migrate dev

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend && npm install

# Iniciar backend em segundo plano
echo "🚀 Iniciando backend em segundo plano..."
cd ../backend && npm run dev &
backend_pid=$!

# Iniciar frontend em segundo plano
echo "🚀 Iniciando frontend em segundo plano..."
cd ../frontend && npm run dev &
frontend_pid=$!

# Registrar PIDs para finalização correta
echo $backend_pid > .backend.pid
echo $frontend_pid > .frontend.pid

echo "✅ Sistema iniciado com sucesso!"
echo "📱 Frontend disponível em: http://localhost:3000"
echo "🔌 Backend disponível em: http://localhost:3001"
echo "📊 MinIO disponível em: http://localhost:9001 (minioadmin/minioadmin)"
echo "💾 Postgres disponível em: localhost:5433 (hrflow_user/hrflow_password)"

echo "⚠️ Para parar o sistema, execute: ./scripts/stop-dev.sh"

# Aguardar até que o usuário interrompa manualmente
trap "echo '🛑 Encerrando...' && kill $backend_pid $frontend_pid" SIGINT SIGTERM
wait 