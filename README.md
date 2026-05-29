# Spassu Code Challenge

Aplicação full stack para registrar vendas de uma papelaria e calcular comissões de vendedores com base nos percentuais cadastrados nos produtos e nas regras configuráveis por dia da semana.

O projeto foi desenvolvido com backend em Django REST Framework e frontend em React com TypeScript. A ideia foi manter uma estrutura simples, mas com separação clara entre cadastro, regras de negócio, API e interface.

## Aplicação publicada

- Frontend: https://spassu-code-challenge.vercel.app
- Backend: https://spassu-code-challenge-api.onrender.com
- Swagger: https://spassu-code-challenge-api.onrender.com/api/docs/

## Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Função |
| --- | --- | --- |
| Python | 3.12.8 no deploy | Linguagem base do backend |
| Django | 5.2.14 | Framework web |
| Django REST Framework | 3.16.1 | Construção da API REST |
| drf-spectacular | 0.28.0 | Documentação Swagger/OpenAPI |
| django-cors-headers | 4.9.0 | Configuração de CORS |
| dj-database-url | 2.3.0 | Configuração do banco via `DATABASE_URL` |
| Gunicorn | 23.0.0 | Servidor WSGI de produção |
| WhiteNoise | 6.11.0 | Servir arquivos estáticos no deploy |
| PostgreSQL | Gerenciado pelo Render | Banco de dados de produção |
| SQLite | Padrão local | Banco de dados para desenvolvimento |

### Frontend

| Tecnologia | Versão | Função |
| --- | --- | --- |
| Node.js | 24.16.0 | Runtime JavaScript |
| npm | 11.13.0 | Gerenciador de pacotes |
| React | 19.2.6 | Construção da interface |
| TypeScript | 6.0.2 | Tipagem estática |
| Vite | 8.0.12 | Build e servidor de desenvolvimento |
| ESLint | 10.3.0 | Padronização e análise estática do código |
| CSS | — | Estilização da interface |

### Infraestrutura

| Tecnologia | Função |
| --- | --- |
| Render | Deploy do backend Django |
| Vercel | Deploy do frontend React |
| GitHub | Versionamento e integração com deploy |
| PostgreSQL | Banco de dados em produção |

## Funcionalidades

- Cadastro de produtos, clientes e vendedores pelo Django Admin.
- Cadastro de regras de comissão por dia da semana pelo Django Admin.
- CRUD de produtos, clientes, vendedores e vendas via API REST.
- Cadastro, edição, exclusão e listagem de vendas pelo frontend.
- Visualização dos itens de uma venda.
- Relatório de comissões por período.
- Cálculo de comissão respeitando mínimo e máximo configurados para cada dia da semana.
- Documentação da API com Swagger.
- Deploy remoto com backend no Render, banco PostgreSQL e frontend na Vercel.

## Endpoints da API

| Método | Endpoint | Função |
| --- | --- | --- |
| GET | `/api/saude/` | Verificar se a API está ativa |
| GET | `/api/produtos/` | Listar produtos |
| POST | `/api/produtos/` | Criar produto |
| GET | `/api/produtos/{id}/` | Detalhar produto |
| PUT | `/api/produtos/{id}/` | Atualizar produto |
| DELETE | `/api/produtos/{id}/` | Remover produto |
| GET | `/api/clientes/` | Listar clientes |
| POST | `/api/clientes/` | Criar cliente |
| GET | `/api/vendedores/` | Listar vendedores |
| POST | `/api/vendedores/` | Criar vendedor |
| GET | `/api/regras-comissao/` | Listar regras de comissão |
| POST | `/api/regras-comissao/` | Criar regra de comissão |
| GET | `/api/vendas/` | Listar vendas |
| POST | `/api/vendas/` | Criar venda |
| GET | `/api/vendas/{id}/` | Detalhar venda |
| PUT | `/api/vendas/{id}/` | Atualizar venda |
| DELETE | `/api/vendas/{id}/` | Remover venda |
| GET | `/api/comissoes/?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD` | Gerar relatório de comissões por período |
| GET | `/api/docs/` | Acessar documentação Swagger |
| GET | `/api/schema/` | Acessar schema OpenAPI |
| GET | `/api/redoc/` | Acessar documentação ReDoc |

## Estrutura do Projeto

```text
.
|-- backend/
|   |-- config/          # configurações do Django, URLs e comandos
|   |-- pessoas/         # clientes e vendedores
|   |-- produtos/        # cadastro de produtos
|   `-- vendas/          # vendas, itens, regras e cálculo de comissão
|-- frontend/
|   |-- src/
|   |   |-- api/         # cliente HTTP usado pelo React
|   |   |-- assets/      # logo e arquivos visuais
|   |   |-- App.tsx      # telas e fluxo principal
|   |   `-- App.css      # estilos da interface
|   `-- vercel.json      # configuração do frontend na Vercel
|-- render.yaml          # configuração do backend e banco no Render
`-- .env.example         # exemplo de variáveis de ambiente
```

## Como Rodar Localmente

### Pré-requisitos

- Python 3.12 ou superior
- Node.js 20 ou superior
- npm
- Git

### 1. Clonar o repositório

```bash
git clone https://github.com/franfernandes/Spassu-Code-Challenge.git
cd Spassu-Code-Challenge
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto usando o `.env.example` como base:

```bash
cp .env.example .env
```

Para desenvolvimento local, os valores principais são:

```env
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
VITE_API_BASE_URL=/api
```

### 3. Rodar o backend

No Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

No Linux/macOS:

```bash
python -m venv .venv
source .venv/bin/activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend local:

- API: http://127.0.0.1:8000/api/
- Admin: http://127.0.0.1:8000/admin/
- Swagger: http://127.0.0.1:8000/api/docs/

### 4. Rodar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend local:

- http://127.0.0.1:5173/

O Vite usa proxy para encaminhar `/api` para o backend local.

## Testes e Qualidade

Backend:

```bash
cd backend
python manage.py test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Regra de Comissão

Cada produto possui um percentual de comissão entre 0% e 10%. A comissão de um item da venda é calculada assim:

```text
quantidade * valor_unitario * percentual_aplicado / 100
```

Quando existe uma regra configurada para o dia da semana da venda, o percentual do produto passa pelos limites mínimo e máximo daquele dia.

Exemplo:

- Produto com 10% de comissão.
- Regra de quinta-feira com máximo de 8%.
- Venda feita em uma quinta-feira.
- Percentual aplicado: 8%.

Essa lógica ficou concentrada em `backend/vendas/services.py`, para não misturar regra de negócio com view ou serializer.

## Decisões de Desenvolvimento

No backend, separei as entidades em apps pequenos: `pessoas`, `produtos` e `vendas`. A regra de comissão ficou em `services.py` porque ela é uma regra de negócio e pode ser reutilizada tanto na API de vendas quanto no relatório de comissões.

Os serializers ficaram responsáveis por validar e transformar os dados de entrada e saída da API. A criação e atualização de vendas também passam por eles, porque uma venda sempre precisa ter ao menos um item.

As views usam `ModelViewSet` para os CRUDs principais e uma view específica para o relatório de comissões, que recebe `data_inicio` e `data_fim` pela query string.

No frontend, usei React com TypeScript para deixar os formatos dos dados mais claros. A comunicação com a API ficou centralizada em `frontend/src/api/cliente-http.ts`, evitando repetir `fetch` em várias partes da tela. A interface seguiu o protótipo do desafio, com telas para vendas, cadastro/edição de venda e relatório de comissões.

Também deixei as configurações por variáveis de ambiente, seguindo a ideia do Twelve-Factor App. Assim, o mesmo código roda localmente com SQLite e em produção com PostgreSQL, mudando apenas configurações externas.

## Deploy

Backend:

- Render
- PostgreSQL gerenciado pelo Render
- Configuração via `render.yaml`
- Variáveis sensíveis fora do código

Frontend:

- Vercel
- Root directory: `frontend`
- Framework preset: Vite
- Variável de ambiente:

```env
VITE_API_BASE_URL=https://spassu-code-challenge-api.onrender.com/api
```

## Melhorias Futuras

Algumas melhorias que eu gostaria de implementar no futuro:

- Autenticação e autorização, separando acesso de administrador, vendedor e usuário comum.
- Testes unitários no frontend, principalmente para formulários e fluxo de cadastro/edição de venda.
- Paginação, filtros e ordenação nas listagens.
- Tela administrativa própria, sem depender apenas do Django Admin.
- Melhor tratamento de estados vazios e erros de rede.
- CI com GitHub Actions para rodar testes e build a cada push.
- Docker para padronizar ainda mais o ambiente local.
- Auditoria das vendas, registrando quem criou, alterou ou removeu uma venda.
- Exportação do relatório de comissões em CSV ou PDF.
