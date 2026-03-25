# Migração FinancasHub para React - Design

## Visão Geral

Migrar o app FinancasHub de HTML/Vanilla JS para React + Supabase, mantendo toda funcionalidade existente.

## Arquitetura

### Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Routing:** React Router v7
- **Backend:** Supabase (Auth + Database)
- **Icons:** Lucide React

### Estrutura de Pastas
```
src/
├── components/       # Componentes compartilhados
├── hooks/           # Custom hooks (useAuth)
├── pages/           # Páginas do app
├── services/        # Serviços Supabase
├── types/           # TypeScript types
└── utils/           # Utilitários
```

## Componentes a Criar

### Componentes Base
1. **Modal** - Genérico com header, body, footer
2. **Toast** - Notificações (success, error, info)
3. **Table** - Tabela genérica com ordenação
4. **ConfirmDialog** - Modal de confirmação
5. **SearchSelect** - Select com busca

### Componentes de UI
1. **MonthSelector** - Seletor de mês/ano
2. **IconSelector** - Seletor de ícone
3. **ColorPicker** - Seletor de cor
4. **StatusBadge** - Badge de status
5. **ProgressBar** - Barra de progresso

## Páginas a Migrar

### 1. Dashboard (`/`)
- Totalizadores (receitas, despesas, saldo)
- Gráficos simples
- Transações recentes
- Lista de contas

### 2. Lançamentos (`/lancamentos`)
- Filtros (data, tipo, categoria, conta, status)
- Lista com paginação
- Modal de CRUD
- Importação CSV
- Exportação (CSV, XLS, PDF)

### 3. Contas (`/contas`)
- CRUD completo
- Tipos (conta corrente, poupança, investimento)
- Saldo por conta

### 4. Cartões (`/cartoes`)
- CRUD completo
- Fatura atual
- Limite e utilização

### 5. Orçamento (`/orcamento`)
- Orçamento por categoria
- Alertas
- Cópia de orçamento entre meses

### 6. Categorias (`/categorias`)
- CRUD com hierarquia (pai/filho)
- Ícones e cores
- Tipos (despesa, receita, investimento)

### 7. Tags (`/tags`)
- CRUD simples

## Integrações

### Supabase Services (já existem)
- `transacoes` - CRUD transações
- `contas` - CRUD contas
- `categorias` - CRUD categorias
- `cartoes` - CRUD cartões
- `orcamentos` - CRUD orçamentos
- `tags` - CRUD tags

### Auth
- Login/logout
- ProteÇÃO de rotas
- dados do usuário

## Tema
- Modo escuro/claro
- Cores do design original
- CSS Variables para consistência
