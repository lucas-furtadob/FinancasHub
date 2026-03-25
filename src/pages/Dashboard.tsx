import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase, transacoes, contas } from '../services/supabase';
import MonthSelector from '../components/MonthSelector';
import StatusBadge from '../components/StatusBadge';

interface Transacao {
  id: string;
  titulo: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'investimento' | 'transferencia';
  data: string;
  categoria?: string;
  status: string;
}

interface Conta {
  id: string;
  nome: string;
  tipo: string;
  saldo: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [transacoesList, setTransacoesList] = useState<Transacao[]>([]);
  const [contasList, setContasList] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentMonth]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    const mes = currentMonth.getMonth() + 1;
    const ano = currentMonth.getFullYear();

    const [transacoesData, contasData] = await Promise.all([
      transacoes.get(user.id, { mes, ano }),
      contas.get(user.id)
    ]);

    setTransacoesList(transacoesData);
    setContasList(contasData);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalReceitas = transacoesList
    .filter(t => t.tipo === 'receita' && (t.status === 'Recebido' || t.status === 'Realizado'))
    .reduce((sum, t) => sum + t.valor, 0);

  const totalDespesas = transacoesList
    .filter(t => t.tipo === 'despesa' && (t.status === 'Pago' || t.status === 'Realizado'))
    .reduce((sum, t) => sum + t.valor, 0);

  const saldoTotal = contasList.reduce((sum, c) => sum + c.saldo, 0);

  const transacoesRecentes = transacoesList.slice(0, 5);

  if (authLoading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div>
      <header className="header">
        <div className="page-info">
          <h1>Visão Geral</h1>
          <p>Resumo das suas finanças</p>
        </div>
        <div style={{ display: 'flex' }}>
          <MonthSelector value={currentMonth} onChange={setCurrentMonth} />
        </div>
      </header>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon received">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Receitas do Mês</span>
            <span className="value">{formatCurrency(totalReceitas)}</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon paid">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 010-7h5a3.5 3.5 0 000-7H6"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Despesas do Mês</span>
            <span className="value">{formatCurrency(totalDespesas)}</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon balance">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 010-4h14v4M4 12v8a2 2 0 002 2h16v-4M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Saldo Total</span>
            <span className="value">{formatCurrency(saldoTotal)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Transações Recentes</h3>
          {transacoesRecentes.length === 0 ? (
            <p style={{ color: '#6b6b70', marginTop: '16px' }}>Nenhuma transação este mês</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {transacoesRecentes.map((t) => (
                <div key={t.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{t.titulo}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 600,
                    color: t.tipo === 'receita' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card">
          <h3>Contas</h3>
          {contasList.length === 0 ? (
            <p style={{ color: '#6b6b70', marginTop: '16px' }}>Nenhuma conta cadastrada</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {contasList.map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{c.nome}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {c.tipo}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {formatCurrency(c.saldo)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
