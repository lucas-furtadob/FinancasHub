import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { contas } from '../services/supabase';
import type { Conta } from '../types';

export default function Contas() {
  const { user } = useAuth();
  const [contasList, setContasList] = useState<Conta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);

  useEffect(() => {
    if (user) loadContas();
  }, [user]);

  async function loadContas() {
    if (!user) return;
    const data = await contas.get(user.id);
    setContasList(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const conta = {
      nome: formData.get('nome') as string,
      tipo: formData.get('tipo') as any,
      instituicao: formData.get('instituicao') as string,
      saldo_inicial: parseFloat(formData.get('saldo_inicial') as string) || 0,
      cor: formData.get('cor') as string || '#6366f1',
    };
    
    if (editingConta?.id) {
      await contas.update(editingConta.id, user.id, conta);
    } else {
      await contas.create(user.id, conta);
    }
    setShowModal(false);
    setEditingConta(null);
    loadContas();
  }

  async function deleteConta(id: string) {
    if (!user || !confirm('Excluir conta?')) return;
    await contas.delete(id, user.id);
    loadContas();
  }

  const totalSaldo = contasList.reduce((sum, c) => sum + (c.saldo_atual || c.saldo_inicial), 0);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div>
      <header className="header">
        <div className="page-info">
          <h1>Contas Financeiras</h1>
          <p>Gerencie suas contas bancárias e carteiras</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Nova Conta
          </button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon balance">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 010-4h14v4M4 12v8a2 2 0 002 2h16v-4M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Saldo Total</span>
            <span className="value">{formatCurrency(totalSaldo)}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-data">
            <span className="label">Total de Contas</span>
            <span className="value">{contasList.length}</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {contasList.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conta cadastrada</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>Adicionar conta</button>
          </div>
        ) : (
          contasList.map(conta => (
            <div key={conta.id} className="card-item">
              <div className="card-icon" style={{background: conta.cor || '#6366f1'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 010-4h14v4M4 12v8a2 2 0 002 2h16v-4M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
              </div>
              <div className="card-info">
                <h3>{conta.nome}</h3>
                <p>{conta.instituicao}</p>
                <span className="card-value">{formatCurrency(conta.saldo_atual || conta.saldo_inicial)}</span>
              </div>
              <div className="card-actions">
                <button onClick={() => { setEditingConta(conta); setShowModal(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => deleteConta(conta.id!)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingConta(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowModal(false); setEditingConta(null); }}>×</button>
            <div className="modal-header">
              <h2>{editingConta ? 'Editar' : 'Nova'} Conta</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="nome" required defaultValue={editingConta?.nome} placeholder="Ex.: Conta Principal" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo</label>
                  <select name="tipo" defaultValue={editingConta?.tipo || 'conta_corrente'}>
                    <option value="conta_corrente">Conta Corrente</option>
                    <option value="poupanca">Poupança</option>
                    <option value="carteira">Carteira</option>
                    <option value="investimento">Investimento</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <input type="color" name="cor" defaultValue={editingConta?.cor || '#6366f1'} />
                </div>
              </div>
              <div className="form-group">
                <label>Instituição</label>
                <input type="text" name="instituicao" defaultValue={editingConta?.instituicao} placeholder="Ex.: Nubank, Itaú" />
              </div>
              <div className="form-group">
                <label>Saldo Inicial</label>
                <input type="number" step="0.01" name="saldo_inicial" defaultValue={editingConta?.saldo_inicial || 0} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingConta(null); }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}