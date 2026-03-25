-- =============================================
-- FINANÇAS HUB - SCHEMA DO BANCO DE DADOS
-- =============================================

-- Tabela de USUÁRIOS (usa auth.users do Supabase)
-- Profile estende o usuário padrão do Supabase
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de CONTAS BANCÁRIAS
CREATE TABLE public.contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('conta_corrente', 'poupanca', 'cartao_credito', 'carteira', 'investimento')),
    instituicao TEXT,
    agencia TEXT,
    numero_conta TEXT,
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    saldo_atual DECIMAL(15,2) DEFAULT 0,
    cor TEXT DEFAULT '#6B7280',
    icone TEXT DEFAULT 'wallet',
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de CATEGORIAS
CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('despesa', 'receita', 'investimento', 'transferencia')),
    pai_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    cor TEXT DEFAULT '#6B7280',
    icone TEXT DEFAULT 'tag',
    orcamento_mensal DECIMAL(15,2),
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, nome, tipo)
);

-- Tabela de TAGS
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    cor TEXT DEFAULT '#FF5C00',
    icone TEXT DEFAULT 'tag',
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, nome)
);

-- Tabela de TRANSAÇÕES (lançamentos)
CREATE TABLE public.transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conta_id UUID REFERENCES public.contas(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    
    tipo TEXT NOT NULL CHECK (tipo IN ('despesa', 'receita', 'investimento', 'transferencia')),
    titulo TEXT NOT NULL,
    descricao TEXT,
    valor DECIMAL(15,2) NOT NULL,
    data DATE NOT NULL,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'recebido', 'realizado', 'cancelado')),
    
    -- Campos opcionais
    conta_destino_id UUID REFERENCES public.contas(id) ON DELETE SET NULL,
    forma_pagamento TEXT,
    tags TEXT[], -- array de IDs das tags
    obs TEXT,
    arquivo_url TEXT,
    
    -- Campos de controle
    origem TEXT DEFAULT 'manual' CHECK (origem IN ('manual', 'importado', 'sincronizado')),
    conciliado BOOLEAN DEFAULT FALSE,
    conciliado_em TIMESTAMPTZ,
    
    -- Campos de sistema
    disabled BOOLEAN DEFAULT FALSE,
    exclude_from_reports BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de ORÇAMENTOS
CREATE TABLE public.orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE CASCADE NOT NULL,
    
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
    valor_planejado DECIMAL(15,2) NOT NULL,
    
    alerta_ativo BOOLEAN DEFAULT TRUE,
    alerta_percentual INTEGER DEFAULT 80,
    
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, categoria_id, mes, ano)
);

-- Tabela de CARTÕES DE CRÉDITO
CREATE TABLE public.cartoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    instituicao TEXT,
    ultimo_digitos VARCHAR(4),
    dia_fechamento INTEGER DEFAULT 25,
    dia_vencimento INTEGER DEFAULT 10,
    limite DECIMAL(15,2),
    cor TEXT DEFAULT '#6B7280',
    icone TEXT DEFAULT 'credit-card',
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de FATURAS (cartão de crédito)
CREATE TABLE public.faturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cartao_id UUID REFERENCES public.cartoes(id) ON DELETE CASCADE NOT NULL,
    
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    valor_fechado DECIMAL(15,2),
    data_fechamento DATE,
    data_vencimento DATE,
    status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada', 'paga')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, cartao_id, mes, ano)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_contas_user ON public.contas(user_id);
CREATE INDEX idx_categorias_user ON public.categorias(user_id);
CREATE INDEX idx_tags_user ON public.tags(user_id);
CREATE INDEX idx_transacoes_user ON public.transacoes(user_id);
CREATE INDEX idx_transacoes_data ON public.transacoes(data);
CREATE INDEX idx_transacoes_categoria ON public.transacoes(categoria_id);
CREATE INDEX idx_transacoes_conta ON public.transacoes(conta_id);
CREATE INDEX idx_orcamentos_user ON public.orcamentos(user_id);
CREATE INDEX idx_orcamentos_mes_ano ON public.orcamentos(mes, ano);
CREATE INDEX idx_cartoes_user ON public.cartoes(user_id);
CREATE INDEX idx_faturas_user ON public.faturas(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can CRUD own contas" ON public.contas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own categorias" ON public.categorias FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own tags" ON public.tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own transacoes" ON public.transacoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own orcamentos" ON public.orcamentos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own cartoes" ON public.cartoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own faturas" ON public.faturas FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNÇÕES ÚTEIS
-- =============================================

-- Função para atualizar timestamp automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at automático
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contas_updated_at BEFORE UPDATE ON public.contas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON public.transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cartoes_updated_at BEFORE UPDATE ON public.cartoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_faturas_updated_at BEFORE UPDATE ON public.faturas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para criar perfil automaticamente ao se registrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
