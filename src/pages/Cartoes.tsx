import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { cartoes } from '../services/supabase';
import type { Cartao } from '../types';

export default function Cartoes() {
  const { user } = useAuth();
  const [cartaoList, setCartaoList] = useState<Cartao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCartao, setEditingCartao] = useState<Cartao | null>(null);

  useEffect(() => {
    if (user) loadCartoes();
  }, [user]);

  async function loadCartoes() {
    if (!user) return;
    const data = await cartoes.get(user.id);
    setCartaoList(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const cartao = {
      nome: formData.get('nome') as string,
      instituicao: formData.get('instituicao') as string,
      ultimo_digitos: formData.get('ultimo_digitos') as string,
      dia_fechamento: parseInt(formData.get('dia_fechamento') as string),
      dia_vencimento: parseInt(formData.get('dia_vencimento') as string),
      limite: parseFloat(formData.get('limite') as string) || 0,
      cor: formData.get('cor') as string || '#6366f1',
    };
    
    if (editingCartao?.id) {
      await cartoes.update(editingCartao.id, user.id, cartao);
    } else {
      await cartoes.create(user.id, cartao);
    }
    setShowModal(false);
    setEditingCartao(null);
    loadCartoes();
  }

  async function deleteCartao(id: string) {
    if (!user || !confirm('Excluir cartão?')) return;
    await cartoes.delete(id, user.id);
    loadCartoes();
  }

  const totalLimite = cartaoList.reduce((sum, c) => sum + c.limite, 0);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <div>
      <header className="header">
        <div className="page-info">
          <h1>Cartões de Crédito</h1>
          <p>Gerencie seus cartões de crédito</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Novo Cartão
          </button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon balance">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Limite Total</span>
            <span className="value">{formatCurrency(totalLimite)}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-data">
            <span className="label">Total de Cartões</span>
            <span className="value">{cartaoList.length}</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {cartaoList.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum cartão cadastrado</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>Adicionar cartão</button>
          </div>
        ) : (
          cartaoList.map(cartao => (
            <div key={cartao.id} className="card-item">
              <div className="card-icon" style={{background: cartao.cor || '#6366f1'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div className="card-info">
                <h3>{cartao.nome}</h3>
                <p>{cartao.instituicao} ••{cartao.ultimo_digitos}</p>
                <span className="card-value">Limite: {formatCurrency(cartao.limite)}</span>
                <span className="card-sub">Fechamento: {cartao.dia_fechamento} | Vencimento: {cartao.dia_vencimento}</span>
              </div>
              <div className="card-actions">
                <button onClick={() => { setEditingCartao(cartao); setShowModal(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => deleteCartao(cartao.id!)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingCartao(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowModal(false); setEditingCartao(null); }}>×</button>
            <div className="modal-header">
              <h2>{editingCartao ? 'Editar' : 'Novo'} Cartão</h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" name="nome" required defaultValue={editingCartao?.nome} placeholder="Ex.: Cartão Nubank" />
              </div>
              <div className="form-group">
                <label>Instituição</label>
                <input type="text" name="instituicao" defaultValue={editingCartao?.instituicao} placeholder="Ex.: Nubank" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Últimos dígitos</label>
                  <input type="text" name="ultimo_digitos" maxLength={4} defaultValue={editingCartao?.ultimo_digitos} placeholder="1234" />
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <input type="color" name="cor" defaultValue={editingCartao?.cor || '#6366f1'} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Dia de fechamento</label>
                  <input type="number" name="dia_fechamento" defaultValue={editingCartao?.dia_fechamento || 15} />
                </div>
                <div className="form-group">
                  <label>Dia de vencimento</label>
                  <input type="number" name="dia_vencimento" defaultValue={editingCartao?.dia_vencimento || 20} />
                </div>
              </div>
              <div className="form-group">
                <label>Limite</label>
                <input type="number" step="0.01" name="limite" defaultValue={editingCartao?.limite || 0} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingCartao(null); }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}