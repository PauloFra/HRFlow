#!/bin/bash

# Script para iniciar os serviços de monitoramento

echo "📊 Iniciando serviços de monitoramento do HRFlow..."
echo ""

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo "❌ O Docker não está rodando. Inicie o Docker e tente novamente."
  exit 1
fi

# Iniciar os serviços com o perfil de monitoramento
docker-compose --profile monitoring up -d

echo ""
echo "✅ Serviços de monitoramento iniciados com sucesso!"
echo ""
echo "📈 Acesse o Grafana em: http://localhost:3030"
echo "🔍 Acesse o Prometheus em: http://localhost:9090"
echo ""
echo "Credenciais do Grafana:"
echo "  Usuário: admin"
echo "  Senha: hrflow_grafana_password"
echo ""
echo "⚠️ Importante: Estes serviços consomem recursos significativos."
echo "   Para parar os serviços de monitoramento: docker-compose --profile monitoring down" 