#!/bin/bash

echo "🛑 Parando HRFlow..."

# Verificar e encerrar processo do backend
if [ -f .backend.pid ]; then
    backend_pid=$(cat .backend.pid)
    if ps -p $backend_pid > /dev/null; then
        echo "⏹️ Parando backend (PID: $backend_pid)..."
        kill $backend_pid
    else
        echo "ℹ️ Processo do backend não está mais rodando."
    fi
    rm .backend.pid
else
    echo "ℹ️ Arquivo .backend.pid não encontrado."
fi

# Verificar e encerrar processo do frontend
if [ -f .frontend.pid ]; then
    frontend_pid=$(cat .frontend.pid)
    if ps -p $frontend_pid > /dev/null; then
        echo "⏹️ Parando frontend (PID: $frontend_pid)..."
        kill $frontend_pid
    else
        echo "ℹ️ Processo do frontend não está mais rodando."
    fi
    rm .frontend.pid
else
    echo "ℹ️ Arquivo .frontend.pid não encontrado."
fi

# Parar serviços Docker
echo "🐳 Parando containers Docker..."
docker-compose down

echo "✅ Sistema parado com sucesso!" 