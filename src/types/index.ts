export interface Transacao {
  id?: string;
  user_id?: string;
  tipo: 'receita' | 'despesa' | 'investimento' | 'transferencia';
  titulo: string;
  descricao?: string;
  valor: number;
  data: string;
  status: 'Pendente' | 'Pago' | 'Recebido' | 'Realizado';
  conta_id?: string;
  categoria_id?: string;
  forma_pagamento?: string;
  tags?: string[];
  disabled?: boolean;
  created_at?: string;
}

export interface Conta {
  id?: string;
  user_id?: string;
  nome: string;
  tipo: 'conta_corrente' | 'poupanca' | 'carteira' | 'investimento' | 'outro';
  instituicao: string;
  saldo_inicial: number;
  saldo_atual?: number;
  cor?: string;
  icone?: string;
  status?: 'ativa' | 'inativa';
  created_at?: string;
}

export interface Categoria {
  id?: string;
  user_id?: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'investimento' | 'transferencia';
  cor?: string;
  icone?: string;
  pai_id?: string;
  status?: 'ativa' | 'inativa';
  created_at?: string;
}

export interface Cartao {
  id?: string;
  user_id?: string;
  nome: string;
  instituicao: string;
  ultimo_digitos: string;
  dia_fechamento: number;
  dia_vencimento: number;
  limite: number;
  cor?: string;
  status?: 'ativa' | 'inativa';
  created_at?: string;
}

export interface Orcamento {
  id?: string;
  user_id?: string;
  categoria_id: string;
  mes: number;
  ano: number;
  valor_planejado: number;
  valor_gasto?: number;
  alerta_ativo?: boolean;
  alerta_percentual?: number;
  status?: 'ativa' | 'inativa';
  created_at?: string;
}

export interface Tag {
  id?: string;
  user_id?: string;
  nome: string;
  cor?: string;
  icone?: string;
  status?: 'ativa' | 'inativa';
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    nome?: string;
  };
}

export interface Filters {
  tipo?: string;
  categoriaId?: string;
  contaId?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  tags?: string[];
  search?: string;
}

export interface MonthYear {
  mes: number;
  ano: number;
}