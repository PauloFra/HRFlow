# 🚀 HRFlow - Sistema de Gestão de RH

Um sistema completo de gestão de recursos humanos com foco em segurança, escalabilidade e experiência do usuário.

## 📋 Funcionalidades Principais

- **Autenticação e Autorização**
  - Login seguro com JWT
  - Autenticação em dois fatores (2FA)
  - Controle de acesso baseado em papéis (RBAC)
  - Recuperação de senha segura

- **Gestão de Funcionários**
  - Cadastro completo de funcionários
  - Gerenciamento de departamentos e equipes
  - Histórico de alterações e auditoria
  - Upload de documentos e fotos de perfil

- **Perfis de Usuário**
  - Edição de perfil completa
  - Upload de fotos com MinIO
  - Configurações de preferências
  - Histórico de atividades

- **Auditoria e Segurança**
  - Logging de todas as ações
  - Interface para visualização de logs
  - Relatórios de auditoria
  - Proteção contra vulnerabilidades comuns

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- JWT Authentication
- Clean Architecture

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (Estado)
- React Hook Form + Zod (Validação)

### Infraestrutura
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- MinIO (Armazenamento)
- Kafka (Mensageria)

## 🚦 Requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL 15
- Redis 7

## 🏗️ Estrutura do Projeto

```
/
├── backend/               # Aplicação backend
│   ├── prisma/            # Schema e migrações do Prisma
│   └── src/               # Código fonte
│       ├── config/        # Configurações
│       ├── domains/       # Entidades e regras de negócio
│       ├── interfaces/    # Controladores e rotas
│       ├── useCases/      # Casos de uso
│       └── repositories/  # Repositórios de dados
│
├── frontend/              # Aplicação frontend
│   ├── public/            # Arquivos estáticos
│   └── src/               # Código fonte
│       ├── app/           # Páginas e rotas (App Router)
│       ├── components/    # Componentes React
│       ├── hooks/         # Custom hooks
│       └── lib/           # Utilitários e serviços
│
├── docker/                # Configuração Docker
└── docs/                  # Documentação
```

## 🏁 Como Iniciar

### Desenvolvimento

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/hrflow.git
   cd hrflow
   ```

2. Instale as dependências do backend:
   ```bash
   cd backend
   npm install
   ```

3. Instale as dependências do frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Configure as variáveis de ambiente:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

5. Inicie os serviços com Docker:
   ```bash
   docker-compose up -d
   ```

6. Execute as migrações do banco de dados:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

7. Inicie o backend:
   ```bash
   cd backend
   npm run dev
   ```

8. Em outro terminal, inicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

9. Acesse o aplicativo em `http://localhost:3000`

### Produção

1. Configure as variáveis de ambiente para produção
2. Execute:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 👨‍💻 Desenvolvimento

### Convenções de Código

- Siga os padrões ESLint e Prettier configurados
- Use TypeScript com tipagem estrita
- Escreva testes para funcionalidades críticas

### Fluxo de Trabalho Git

1. Crie uma branch a partir de `main` para cada feature/fix
2. Nomeie a branch de acordo com o tipo: `feature/nome-feature` ou `fix/nome-fix`
3. Faça commit seguindo a convenção Conventional Commits
4. Abra um Pull Request para `main`

## 📝 Licença

Este projeto está licenciado sob a licença [MIT](LICENSE).

---

Desenvolvido com ❤️ para gerenciamento eficiente de recursos humanos.

## 💭 Sobre o Projeto

Após trabalhar por anos em empresas que lutavam com sistemas de RH fragmentados e pouco intuitivos, decidi criar uma solução moderna que realmente atendesse às necessidades do dia a dia.

O HRFlow nasceu da frustração de usar planilhas para controlar ponto, emails para solicitar férias e múltiplos sistemas que não conversavam entre si. A ideia é simples: um lugar só para tudo relacionado a RH.

## ✨ Principais Funcionalidades

### Ponto Eletrônico
- Registro via web com validação de localização
- Cálculo automático de horas extras e banco de horas
- Justificativas para irregularidades
- Relatórios individuais e gerenciais

### Gestão de Pessoas
- Cadastro completo de funcionários
- Organograma interativo
- Controle de hierarquias e aprovações
- Sistema de permissões por cargo

### Comunicação Interna
- Feed de notícias da empresa
- Sistema de publicação com moderação
- Calendário de eventos corporativos
- Notificações em tempo real

### Férias e Licenças
- Solicitação com calendário visual
- Fluxo de aprovação automático
- Controle de saldos e períodos
- Planejamento de cobertura de equipes

## 🚀 Stack Tecnológica

Escolhi tecnologias modernas que me permitem entregar rapidez e qualidade:

**Backend:**
- Node.js + TypeScript - Para tipagem forte e produtividade
- Express.js - Framework minimalista e flexível
- Prisma - ORM moderno com excelente DX
- PostgreSQL - Banco robusto para dados relacionais
- Redis - Cache e sessões
- Apache Kafka - Para comunicação assíncrona

**Frontend:**
- Next.js 14 - Com App Router para melhor performance
- TypeScript - Tipagem em todo o projeto
- Tailwind CSS - Produtividade no styling
- Zustand - Estado global simples
- React Hook Form - Formulários performáticos

**DevOps:**
- Docker - Ambiente isolado e reproduzível
- MinIO - Storage de arquivos
- NGINX - Proxy reverso
- GitHub Actions - CI/CD automatizado

## 📁 Estrutura do Projeto

```
hrflow/
├── backend/          # API REST com Clean Architecture
├── frontend/         # Interface web responsiva
├── shared/           # Tipos compartilhados
├── docker/           # Configurações de containers
└── docs/             # Documentação técnica
```

## 🛠️ Como Rodar

### Desenvolvimento Rápido (Docker)

```bash
git clone https://github.com/seu-usuario/hrflow.git
cd hrflow

# Subir toda a infraestrutura
docker-compose up -d

# Acessar
# Frontend: http://localhost:3000
# API: http://localhost:3001
# Docs: http://localhost:3001/docs
```

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Subir apenas banco e serviços
docker-compose up -d postgres redis kafka minio

# Backend
cd backend && npm run dev

# Frontend (nova aba)
cd frontend && npm run dev
```

## 🔐 Autenticação e Segurança

Implementei um sistema robusto pensando em empresas que levam segurança a sério:

- JWT com refresh tokens
- 2FA opcional via TOTP
- RBAC granular (Admin, RH, Gestor, Funcionário)
- Rate limiting
- Logs de auditoria completos
- Validação de geolocalização para ponto

## 📊 Arquitetura

Segui os princípios de Clean Architecture para facilitar manutenção e testes:

- **Camada de Apresentação**: Controllers REST
- **Camada de Aplicação**: Use cases e serviços
- **Camada de Domínio**: Entidades e regras de negócio
- **Camada de Infraestrutura**: Repositórios e integrações

## 🧪 Qualidade de Código

- ESLint + Prettier configurados
- Husky para hooks de git
- Testes unitários e de integração
- Documentação automática com Swagger
- TypeScript strict em todo o projeto

## 📈 Status de Desenvolvimento

### ✅ Concluído
- [x] Estrutura base do projeto
- [x] Configuração Docker completa
- [x] Schema do banco com Prisma
- [x] Sistema de logs estruturados
- [x] Configuração de qualidade de código

### 🔄 Em Progresso
- [ ] Sistema de autenticação completo
- [ ] CRUD de funcionários
- [ ] Interface web base

### 📋 Próximos Passos
- [ ] Ponto eletrônico
- [ ] Gestão de férias
- [ ] Comunicação interna
- [ ] Relatórios gerenciais

## 🎯 Objetivos do Projeto

Este projeto faz parte do meu portfólio e demonstra:

- Capacidade de arquitetar sistemas complexos
- Conhecimento em tecnologias modernas
- Foco em experiência do usuário
- Boas práticas de desenvolvimento
- Pensamento em escalabilidade e manutenção

## 🤝 Contato

Desenvolvido por [Seu Nome]

- LinkedIn: [seu-linkedin]
- Email: [seu-email]
- Portfolio: [seu-site]

---

*"Código limpo não é escrito seguindo um conjunto de regras. Você não se torna um artesão de software aprendendo uma lista do que fazer e não fazer. Profissionalismo e artesanato vêm de valores e disciplina."* - Robert C. Martin

 
 