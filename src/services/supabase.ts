import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey 
  ? createSupabaseClient(supabaseUrl, supabaseKey)
  : null;

export const isConfigured = () => !!(supabaseUrl && supabaseKey);

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  if (!supabase) return { error: { message: 'Supabase não configurado' } };
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, nome: string) => {
  if (!supabase) return { error: { message: 'Supabase não configurado' } };
  return await supabase.auth.signUp({ email, password, options: { data: { nome } } });
};

export const signOut = async () => {
  if (!supabase) return { error: { message: 'Supabase não configurado' } };
  return await supabase.auth.signOut();
};

export const onAuthChange = (callback: (user: any) => void) => {
  if (!supabase) return () => {};
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
};

export const transacoes = {
  get: async (userId: string, filters?: { mes?: number; ano?: number; tipo?: string; categoriaId?: string; contaId?: string; status?: string }) => {
    if (!supabase) return [];
    let query = supabase.from('transacoes').select('*').eq('user_id', userId).eq('disabled', false).order('data', { ascending: false });
    if (filters?.mes && filters?.ano) {
      const dataInicio = `${filters.ano}-${String(filters.mes).padStart(2, '0')}-01`;
      const dataFim = new Date(filters.ano, filters.mes, 0).toISOString().split('T')[0];
      query = query.gte('data', dataInicio).lte('data', dataFim);
    }
    if (filters?.tipo) query = query.eq('tipo', filters.tipo);
    if (filters?.categoriaId) query = query.eq('categoria_id', filters.categoriaId);
    if (filters?.contaId) query = query.eq('conta_id', filters.contaId);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data } = await query;
    return data || [];
  },
  create: async (userId: string, transacao: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('transacoes').insert({ ...transacao, user_id: userId }).select().single();
  },
  update: async (id: string, userId: string, updates: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('transacoes').update(updates).eq('id', id).eq('user_id', userId).select().single();
  },
  delete: async (id: string, userId: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('transacoes').delete().eq('id', id).eq('user_id', userId);
  }
};

export const contas = {
  get: async (userId: string) => {
    if (!supabase) return [];
    const { data } = await supabase.from('contas').select('*').eq('user_id', userId).eq('status', 'ativa').order('nome');
    return data || [];
  },
  create: async (userId: string, conta: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('contas').insert({ ...conta, user_id: userId }).select().single();
  },
  update: async (id: string, userId: string, updates: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('contas').update(updates).eq('id', id).eq('user_id', userId).select().single();
  },
  delete: async (id: string, userId: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('contas').delete().eq('id', id).eq('user_id', userId);
  }
};

export const categorias = {
  get: async (userId: string, tipo?: string) => {
    if (!supabase) return [];
    let query = supabase.from('categorias').select('*').eq('user_id', userId).eq('status', 'ativa').order('nome');
    if (tipo) query = query.eq('tipo', tipo);
    const { data } = await query;
    return data || [];
  },
  create: async (userId: string, categoria: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('categorias').insert({ ...categoria, user_id: userId }).select().single();
  },
  update: async (id: string, userId: string, updates: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('categorias').update(updates).eq('id', id).eq('user_id', userId).select().single();
  },
  delete: async (id: string, userId: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('categorias').delete().eq('id', id).eq('user_id', userId);
  }
};

export const cartoes = {
  get: async (userId: string) => {
    if (!supabase) return [];
    const { data } = await supabase.from('cartoes').select('*').eq('user_id', userId).eq('status', 'ativa').order('nome');
    return data || [];
  },
  create: async (userId: string, cartao: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('cartoes').insert({ ...cartao, user_id: userId }).select().single();
  },
  update: async (id: string, userId: string, updates: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('cartoes').update(updates).eq('id', id).eq('user_id', userId).select().single();
  },
  delete: async (id: string, userId: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('cartoes').delete().eq('id', id).eq('user_id', userId);
  }
};

export const orcamentos = {
  get: async (userId: string, mes: number, ano: number) => {
    if (!supabase) return [];
    const { data } = await supabase.from('orcamentos').select('*').eq('user_id', userId).eq('mes', mes).eq('ano', ano).eq('status', 'ativa');
    return data || [];
  },
  create: async (userId: string, orcamento: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('orcamentos').insert({ ...orcamento, user_id: userId }).select().single();
  },
  update: async (id: string, userId: string, updates: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('orcamentos').update(updates).eq('id', id).eq('user_id', userId).select().single();
  },
  delete: async (id: string, userId: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('orcamentos').delete().eq('id', id).eq('user_id', userId);
  }
};

export const tags = {
  get: async (userId: string) => {
    if (!supabase) return [];
    const { data } = await supabase.from('tags').select('*').eq('user_id', userId).eq('status', 'ativa').order('nome');
    return data || [];
  },
  create: async (userId: string, tag: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('tags').insert({ ...tag, user_id: userId }).select().single();
  },
  update: async (id: string, userId: string, updates: any) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('tags').update(updates).eq('id', id).eq('user_id', userId).select().single();
  },
  delete: async (id: string, userId: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } };
    return await supabase.from('tags').delete().eq('id', id).eq('user_id', userId);
  }
};