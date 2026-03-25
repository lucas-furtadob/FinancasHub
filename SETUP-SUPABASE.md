# 🚀 Guia de Configuração - Supabase + Vercel

Este guia passo a passo vai ajudá-lo a configurar o banco de dados e colocar o projeto no ar.

---

## PARTE 1: CONFIGURAR SUPABASE

### Passo 1: Criar Projeto no Supabase
1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: `financas-hub` (ou outro nome)
   - **Database Password**: Crie uma senha forte e guarde!
   - **Region**: Escolha a mais próxima de você (South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser criado

### Passo 2: Executar Schema do Banco
1. No painel do Supabase, clique em **SQL Editor** (no menu à esquerda)
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor SQL
5. Clique em **"Run"** ou pressione `Ctrl + Enter`
6. Você verá mensagens de sucesso (CREATE TABLE, etc)

### Passo 3: Obter Credenciais
1. No menu do Supabase, vá em **Settings** (ícone de engrenagem) → **API**
2. Você verá:
   - **Project URL**: algo como `https://xxxxx.supabase.co`
   - **anon public / public (service_role)**: sua chave anônima (começa com `eyJ...`)

### Passo 4: Configurar no Código
1. Abra o arquivo `supabase-client.js` na raiz do projeto
2. Substitua as linhas no topo:

```javascript
// DE:
const SUPABASE_URL = 'SUA_URL_DO_SUPABASE_AQUI';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANONIMA_AQUI';

// PARA (exemplo):
const SUPABASE_URL = 'https://abc123.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## PARTE 2: CONFIGURAR GITHUB

### Passo 1: Criar Repositório
1. Acesse https://github.com/new
2. **Repository name**: `financas-hub`
3. **Description**: Seu gerenciador de finanças pessoal
4. Marque **"Public"** (ou Private se preferir)
5. Clique em **"Create repository"**

### Passo 2: Enviar Código Local
No terminal, na pasta do projeto:

```bash
# Inicializar git (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Criar commit inicial
git commit -m "Initial commit - Finanças Hub"

# Adicionar remoto
git remote add origin https://github.com/SEU_USUARIO/financas-hub.git

# Enviar para GitHub
git push -u origin main
```

*(Substitua `SEU_USUARIO` pelo seu username do GitHub)*

---

## PARTE 3: DEPLOY NA VERCEL

### Passo 1: Conectar Vercel ao GitHub
1. Acesse https://vercel.com e faça login com GitHub
2. Clique em **"Add New..."** → **"Project"**
3. Autorize o acesso ao GitHub (se necessário)
4. Você verá seu repositório `financas-hub`
5. Clique em **"Import"**

### Passo 2: Configurar Deploy
1. Na tela de configuração:
   - **Framework Preset**: `Other` (ou `Vite` se detectar)
   - **Build Command**: deixar vazio ou `npm run build`
   - **Output Directory**: deixar `.` ou `dist`
2. Clique em **"Deploy"**

### Passo 3: Variáveis de Ambiente (se necessário)
Se seu projeto precisar de variáveis de ambiente:
1. No painel da Vercel, vá em **Settings** → **Environment Variables**
2. Adicione as variáveis necessárias

### Passo 4: Acessar o Site
1. Após o deploy (1-2 minutos), a Vercel dará uma URL como:
   `https://financas-hub.vercel.app`
2. Clique no link e seu app estará no ar! 🌐

---

## Estrutura do Banco de Dados

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │    profiles     │
│ (auth.users)   │────<│   (nome, avatar)│
└─────────────────┘     └─────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  contas  │   │categorias│   │   tags   │   │ cartoes  │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘
         │              │              │
         │              │              │
         ▼              ▼              ▼
   ┌─────────────────────────────────────────┐
   │              transacoes                 │
   │  (titulo, valor, data, status, etc)    │
   └─────────────────────────────────────────┘
         │
         ▼
   ┌──────────────┐
   │  orcamentos   │
   │(valor_planejado, mes, ano)            │
   └──────────────┘
```

---

## Próximos Passos

Após configurar tudo:

1. **Teste local**: Abra `index.html` no navegador e faça login/cadastro
2. **Migração**: Na primeira vez, os dados do localStorage podem ser migrados
3. **Deploy**: Qualquer push para `main` fará deploy automático na Vercel

---

## Solução de Problemas

### "Supabase não configurado"
- Verifique se editou o `supabase-client.js` com as credenciais corretas

### "Não autenticado"
- Faça login ou cadastro na aplicação
- Verifique se o RLS está configurado (execute o schema.sql)

### Erro ao fazer deploy
- Verifique se o repositório está no GitHub
- Confirme que a Vercel tem acesso ao repositório
- Verifique o log de build no painel da Vercel

---

Precisa de ajuda? É só perguntar! 😊
