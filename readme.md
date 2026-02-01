
### Passos:
## 🚀 Como Executar Localmente (Front-end)

```bash
### Pré-requisitos:
- Node.js (recomendado: 18+ ou 20+)
- npm (ou yarn/pnpm)
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd mini-kanban-web

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env se necessário 

# 4. Iniciar o front-end
npm run dev

# 5. Acessar o Front-end
http://localhost:5173

### Pré-requisitos:
- Docker
- Docker Compose
```

## 🚀 Como Executar Localmente (Back-end)


```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd mini-kanban-api

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env se necessário 

# 3. Iniciar containers
docker compose up --build

# 4. Acessar a API
Swagger: http://localhost:8080/docs

# 5. Testes unitários
npm run test
