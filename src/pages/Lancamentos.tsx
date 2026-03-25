import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { transacoes, contas, categorias, tags } from '../services/supabase';
import type { Transacao, Conta, Categoria, Tag } from '../types';

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function Lancamentos() {
  const { user } = useAuth();
  const [transacoesList, setTransacoesList] = useState<Transacao[]>([]);
  const [contasList, setContasList] = useState<Conta[]>([]);
  const [categoriasList, setCategoriasList] = useState<Categoria[]>([]);
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { mes: now.getMonth() + 1, ano: now.getFullYear() };
  });
  const [showModal, setShowModal] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState<'despesa' | 'receita' | 'investimento' | 'transferencia'>('despesa');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentMonth]);

  async function loadData() {
    if (!user) return;
    const [t, c, ct, tg] = await Promise.all([
      transacoes.get(user.id, { mes: currentMonth.mes, ano: currentMonth.ano }),
      contas.get(user.id),
      categorias.get(user.id),
      tags.get(user.id)
    ]);
    setTransacoesList(t);
    setContasList(c);
    setCategoriasList(ct);
    setTagsList(tg);
  }

  const filteredTransacoes = transacoesList.filter(t => {
    if (filterTipo !== 'todos' && t.tipo !== filterTipo) return false;
    if (searchTerm && !t.titulo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalReceita = transacoesList.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
  const totalDespesa = transacoesList.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0);
  const saldo = totalReceita - totalDespesa;

  function changeMonth(delta: number) {
    setCurrentMonth(prev => {
      let newMes = prev.mes + delta;
      let newAno = prev.ano;
      if (newMes < 1) { newMes = 12; newAno--; }
      if (newMes > 12) { newMes = 1; newAno++; }
      return { mes: newMes, ano: newAno };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const transacao = {
      tipo: tipoTransacao,
      titulo: formData.get('titulo') as string,
      valor: parseFloat(formData.get('valor') as string),
      data: formData.get('data') as string,
      status: formData.get('status') as any || 'Pendente',
      conta_id: formData.get('conta_id') as string || null,
      categoria_id: formData.get('categoria_id') as string || null,
      forma_pagamento: formData.get('forma_pagamento') as string || null,
    };
    
    await transacoes.create(user.id, transacao);
    setShowModal(false);
    loadData();
  }

  async function deleteTransacao(id: string) {
    if (!user || !confirm('Excluir transação?')) return;
    await transacoes.delete(id, user.id);
    loadData();
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div>
      <header className="header">
        <div className="page-info">
          <h1>Lançamentos</h1>
          <p>Gerencie suas receitas e despesas</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Importar
          </button>
          <button className="btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Exportar
          </button>
          <div className="month-selector">
            <button onClick={() => changeMonth(-1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span>{meses[currentMonth.mes - 1]} {currentMonth.ano}</span>
            <button onClick={() => changeMonth(1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Novo Lançamento
          </button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon received">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Recebido</span>
            <span className="value">{formatCurrency(totalReceita)}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon paid">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 010-7h5a3.5 3.5 0 000-7H6"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Pago</span>
            <span className="value">{formatCurrency(totalDespesa)}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon balance">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 010-4h14v4M4 12v8a2 2 0 002 2h16v-4M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Saldo</span>
            <span className={`value ${saldo >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(saldo)}</span>
          </div>
        </div>
      </div>

      <div className="filters-row">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-pills">
          <button className={`pill ${filterTipo === 'todos' ? 'active' : ''}`} onClick={() => setFilterTipo('todos')}>Todos</button>
          <button className={`pill ${filterTipo === 'receita' ? 'active' : ''}`} onClick={() => setFilterTipo('receita')}>Receitas</button>
          <button className={`pill ${filterTipo === 'despesa' ? 'active' : ''}`} onClick={() => setFilterTipo('despesa')}>Despesas</button>
          <button className={`pill ${filterTipo === 'investimento' ? 'active' : ''}`} onClick={() => setFilterTipo('investimento')}>Investimentos</button>
          <button className={`pill ${filterTipo === 'transferencia' ? 'active' : ''}`} onClick={() => setFilterTipo('transferencia')}>Transferências</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransacoes.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: '40px', color: '#6b6b70'}}>Nenhum lançamento encontrado</td></tr>
            ) : (
              filteredTransacoes.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                  <td>{t.titulo}</td>
                  <td>{categoriasList.find(c => c.id === t.categoria_id)?.nome || '-'}</td>
                  <td>{contasList.find(c => c.id === t.conta_id)?.nome || '-'}</td>
                  <td><span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                  <td className={t.tipo === 'receita' ? 'positive' : 'negative'}>{t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}</td>
                  <td>
                    <button className="btn-icon" onClick={() => deleteTransacao(t.id!)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <div className="modal-header">
              <h2>Novo lançamento</h2>
            </div>
            <div className="modal-tabs">
              <button className={`tab-btn ${tipoTransacao === 'despesa' ? 'active' : ''}`} onClick={() => setTipoTransacao('despesa')}>Despesa</button>
              <button className={`tab-btn ${tipoTransacao === 'receita' ? 'active' : ''}`} onClick={() => setTipoTransacao('receita')}>Receita</button>
              <button className={`tab-btn ${tipoTransacao === 'investimento' ? 'active' : ''}`} onClick={() => setTipoTransacao('investimento')}>Investimento</button>
              <button className={`tab-btn ${tipoTransacao === 'transferencia' ? 'active' : ''}`} onClick={() => setTipoTransacao('transferencia')}>Transferência</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Valor *</label>
                  <input type="number" step="0.01" name="valor" required placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label>Conta</label>
                  <select name="conta_id">
                    <option value="">Selecione</option>
                    {contasList.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Título *</label>
                <input type="text" name="titulo" required placeholder="Ex.: Almoço com equipe" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input type="date" name="data" required />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select name="categoria_id">
                    <option value="">Selecione</option>
                    {categoriasList.filter(c => c.tipo === tipoTransacao || c.tipo === 'despesa').map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Forma de pagamento</label>
                  <select name="forma_pagamento">
                    <option value="">Selecione</option>
                    <option value="pix">Pix</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                    <option value="boleto">Boleto</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status">
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Recebido">Recebido</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}