/**
 * FINANÇAS HUB - Supabase Client
 * Configuração e funções para conexão com o banco de dados
 * 
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 1. Crie um projeto no Supabase (https://supabase.com)
 * 2. No painel do Supabase, vá em Settings > API
 * 3. Copie a URL do projeto e a chave anônima (anon key)
 * 4. Substitua os valores abaixo:
 *    - SUPABASE_URL = 'sua-url-aqui'
 *    - SUPABASE_ANON_KEY = 'sua-chave-aqui'
 */

var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
var SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase não configurado! Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

// Cliente Supabase (evita redeclarar se já existe)
var supabase = typeof supabase !== 'undefined' ? supabase : (window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY) || null);

// Estado global
let currentUser = null;
let isLoading = false;

// =============================================
// AUTENTICAÇÃO
// =============================================

/**
 * Login com email e senha
 */
async function login(email, password) {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) return { error };
    
    currentUser = data.user;
    return { data: currentUser };
}

/**
 * Cadastro de novo usuário
 */
async function signup(email, password, nome) {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { nome }
        }
    });
    
    if (error) return { error };
    
    return { data };
}

/**
 * Logout
 */
async function logout() {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    
    const { error } = await supabase.auth.signOut();
    currentUser = null;
    return { error };
}

/**
 * Verificar sessão atual
 */
async function checkSession() {
    if (!supabase) return null;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
    }
    return currentUser;
}

/**
 * Ouvir mudanças de autenticação
 */
function onAuthChange(callback) {
    if (!supabase) return;
    
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        callback(currentUser);
    });
}

// =============================================
// CONTAS
// =============================================

async function getContas() {
    if (!supabase || !currentUser) return [];
    
    const { data, error } = await supabase
        .from('contas')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'ativa')
        .order('nome');
    
    if (error) {
        console.error('Erro ao buscar contas:', error);
        return [];
    }
    return data;
}

async function createConta(conta) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('contas')
        .insert({ ...conta, user_id: currentUser.id })
        .select()
        .single();
    
    return { data, error };
}

async function updateConta(id, updates) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('contas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();
    
    return { data, error };
}

async function deleteConta(id) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { error } = await supabase
        .from('contas')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
    
    return { error };
}

// =============================================
// CATEGORIAS
// =============================================

async function getCategorias(tipo = null) {
    if (!supabase || !currentUser) return [];
    
    let query = supabase
        .from('categorias')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'ativa')
        .order('nome');
    
    if (tipo) {
        query = query.eq('tipo', tipo);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
    return data;
}

async function createCategoria(categoria) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('categorias')
        .insert({ ...categoria, user_id: currentUser.id })
        .select()
        .single();
    
    return { data, error };
}

async function updateCategoria(id, updates) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();
    
    return { data, error };
}

async function deleteCategoria(id) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
    
    return { error };
}

// =============================================
// TAGS
// =============================================

async function getTags() {
    if (!supabase || !currentUser) return [];
    
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'ativa')
        .order('nome');
    
    if (error) {
        console.error('Erro ao buscar tags:', error);
        return [];
    }
    return data;
}

async function createTag(tag) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('tags')
        .insert({ ...tag, user_id: currentUser.id })
        .select()
        .single();
    
    return { data, error };
}

async function updateTag(id, updates) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();
    
    return { data, error };
}

async function deleteTag(id) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
    
    return { error };
}

// =============================================
// TRANSAÇÕES
// =============================================

async function getTransacoes(filtros = {}) {
    if (!supabase || !currentUser) return [];
    
    let query = supabase
        .from('transacoes')
        .select(`
            *,
            conta:contas(nome, instituicao),
            categoria:categorias(nome, icone, cor)
        `)
        .eq('user_id', currentUser.id)
        .eq('disabled', false)
        .order('data', { ascending: false });
    
    // Aplicar filtros
    if (filtros.dataInicio && filtros.dataFim) {
        query = query.gte('data', filtros.dataInicio).lte('data', filtros.dataFim);
    }
    if (filtros.mes && filtros.ano) {
        const dataInicio = `${filtros.ano}-${String(filtros.mes).padStart(2, '0')}-01`;
        const dataFim = new Date(filtros.ano, filtros.mes, 0).toISOString().split('T')[0];
        query = query.gte('data', dataInicio).lte('data', dataFim);
    }
    if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
    }
    if (filtros.categoriaId) {
        query = query.eq('categoria_id', filtros.categoriaId);
    }
    if (filtros.contaId) {
        query = query.eq('conta_id', filtros.contaId);
    }
    if (filtros.status) {
        query = query.eq('status', filtros.status);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
    }
    return data || [];
}

async function createTransacao(transacao) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('transacoes')
        .insert({ ...transacao, user_id: currentUser.id })
        .select()
        .single();
    
    return { data, error };
}

async function updateTransacao(id, updates) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('transacoes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();
    
    return { data, error };
}

async function deleteTransacao(id) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
    
    return { error };
}

// =============================================
// ORÇAMENTOS
// =============================================

async function getOrcamentos(mes, ano) {
    if (!supabase || !currentUser) return [];
    
    const { data, error } = await supabase
        .from('orcamentos')
        .select(`
            *,
            categoria:categorias(nome, icone, cor)
        `)
        .eq('user_id', currentUser.id)
        .eq('mes', mes)
        .eq('ano', ano)
        .eq('status', 'ativa');
    
    if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return [];
    }
    return data || [];
}

async function createOrcamento(orcamento) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('orcamentos')
        .insert({ ...orcamento, user_id: currentUser.id })
        .select()
        .single();
    
    return { data, error };
}

async function updateOrcamento(id, updates) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('orcamentos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();
    
    return { data, error };
}

async function deleteOrcamento(id) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
    
    return { error };
}

// =============================================
// CARTÕES
// =============================================

async function getCartoes() {
    if (!supabase || !currentUser) return [];
    
    const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'ativa')
        .order('nome');
    
    if (error) {
        console.error('Erro ao buscar cartões:', error);
        return [];
    }
    return data;
}

async function createCartao(cartao) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('cartoes')
        .insert({ ...cartao, user_id: currentUser.id })
        .select()
        .single();
    
    return { data, error };
}

async function updateCartao(id, updates) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('cartoes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single();
    
    return { data, error };
}

async function deleteCartao(id) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { error } = await supabase
        .from('cartoes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
    
    return { error };
}

// =============================================
// PERFIL DO USUÁRIO
// =============================================

async function getProfile() {
    if (!supabase || !currentUser) return null;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
    
    if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
    }
    return data;
}

async function updateProfile(updates) {
    if (!supabase || !currentUser) return { error: { message: 'Não autenticado' } };
    
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single();
    
    return { data, error };
}

// =============================================
// MIGRAÇÃO DE DADOS LOCAIS
// =============================================

/**
 * Migra dados do localStorage para o Supabase
 * Use apenas na primeira vez que o usuário fazer login
 */
async function migrateLocalData() {
    const localData = {
        contas: JSON.parse(localStorage.getItem('hub_contas') || '[]'),
        categorias: JSON.parse(localStorage.getItem('hub_categories') || '[]'),
        tags: JSON.parse(localStorage.getItem('hub_tags') || '[]'),
        transacoes: JSON.parse(localStorage.getItem('hub_transactions') || '[]'),
        orcamentos: JSON.parse(localStorage.getItem('hub_orcamentos') || '[]'),
        cartoes: JSON.parse(localStorage.getItem('hub_cartoes') || '[]')
    };
    
    if (!supabase || !currentUser) {
        console.error('Não autenticado para migrar dados');
        return { error: { message: 'Não autenticado' } };
    }
    
    const resultados = {
        contas: 0,
        categorias: 0,
        tags: 0,
        transacoes: 0,
        orcamentos: 0,
        cartoes: 0
    };
    
    // Migrar contas
    for (const conta of localData.contas) {
        const { error } = await createConta({
            nome: conta.nome,
            tipo: conta.tipo || 'conta_corrente',
            instituicao: conta.instituicao,
            saldo_inicial: conta.saldo_inicial || 0,
            cor: conta.cor,
            icone: conta.icone
        });
        if (!error) resultados.contas++;
    }
    
    // Migrar categorias
    for (const cat of localData.categorias) {
        const { error } = await createCategoria({
            nome: cat.nome,
            tipo: cat.tipo || 'despesa',
            cor: cat.cor,
            icone: cat.icone,
            pai_id: cat.paiId
        });
        if (!error) resultados.categorias++;
    }
    
    // Migrar tags
    for (const tag of localData.tags) {
        const { error } = await createTag({
            nome: tag.nome,
            cor: tag.cor,
            icone: tag.icone
        });
        if (!error) resultados.tags++;
    }
    
    // Migrar transações
    for (const transacao of localData.transacoes) {
        const { error } = await createTransacao({
            tipo: transacao.tipo,
            titulo: transacao.titulo,
            descricao: transacao.descricao,
            valor: transacao.valor,
            data: transacao.data,
            status: transacao.status || 'pago',
            tags: transacao.tags,
            forma_pagamento: transacao.formaPagamento,
            origem: 'importado'
        });
        if (!error) resultados.transacoes++;
    }
    
    // Migrar orçamentos
    for (const orc of localData.orcamentos) {
        const { error } = await createOrcamento({
            categoria_id: orc.categoria_id,
            mes: orc.mes,
            ano: orc.ano,
            valor_planejado: orc.valor_planejado,
            alerta_ativo: orc.alerta_ativo,
            alerta_percentual: orc.alerta_percentual
        });
        if (!error) resultados.orcamentos++;
    }
    
    // Migrar cartões
    for (const cartao of localData.cartoes) {
        const { error } = await createCartao({
            nome: cartao.nome,
            instituicao: cartao.instituicao,
            ultimo_digitos: cartao.ultimo_digitos,
            dia_fechamento: cartao.dia_fechamento,
            dia_vencimento: cartao.dia_vencimento,
            limite: cartao.limite,
            cor: cartao.cor
        });
        if (!error) resultados.cartoes++;
    }
    
    return { data: resultados };
}

// Exportar para uso global
window.supabaseClient = {
    supabase,
    currentUser: () => currentUser,
    isConfigured: () => !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    
    // Auth
    login,
    signup,
    logout,
    checkSession,
    onAuthChange,
    
    // Dados
    contas: { get: getContas, create: createConta, update: updateConta, delete: deleteConta },
    categorias: { get: getCategorias, create: createCategoria, update: updateCategoria, delete: deleteCategoria },
    tags: { get: getTags, create: createTag, update: updateTag, delete: deleteTag },
    transacoes: { get: getTransacoes, create: createTransacao, update: updateTransacao, delete: deleteTransacao },
    orcamentos: { get: getOrcamentos, create: createOrcamento, update: updateOrcamento, delete: deleteOrcamento },
    cartoes: { get: getCartoes, create: createCartao, update: updateCartao, delete: deleteCartao },
    
    // Perfil
    profile: { get: getProfile, update: updateProfile },
    
    // Migração
    migrateLocalData
};

console.log('✅ Supabase Client carregado');
