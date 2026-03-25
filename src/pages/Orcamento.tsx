import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Orcamento() {
  const { user, loading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (loading) {
    return <div>Carregando...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  return (
    <div>
      <header className="header">
        <div className="page-info">
          <h1>Orçamento Mensal</h1>
          <p>Defina limites de despesa por categoria e acompanhe seus gastos.</p>
        </div>
        <div style={{ display: 'flex' }}>
          <button 
            className="month-selector" 
            style={{ background: 'transparent', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#FFF', cursor: 'pointer' }}
            onClick={() => changeMonth(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em' }}>{formatMonth(currentMonth)}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copiar Orçamento
          </button>
          <button className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Novo Orçamento
          </button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon planned">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Total Orçado</span>
            <span className="value">R$ 0,00</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon spent">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 010-4h14v4M4 12v8a2 2 0 002 2h16v-4M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Total Gasto</span>
            <span className="value">R$ 0,00</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon remaining">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Restante</span>
            <span className="value">R$ 0,00</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon status-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Status</span>
            <span className="value">0%</span>
          </div>
        </div>
      </div>

      <div className="insight-box">
        <div className="insight-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          <span>Insight do Mês</span>
        </div>
        <p className="insight-text">
          Adicione categorias ao orçamento para gerar insights personalizados sobre seus gastos.
        </p>
      </div>

      <div className="categories-card">
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th style={{ textAlign: 'right' }}>Gasto</th>
                <th style={{ textAlign: 'right' }}>Orçado</th>
                <th style={{ textAlign: 'right' }}>Restante</th>
                <th style={{ textAlign: 'center' }}>Progresso</th>
                <th style={{ textAlign: 'left', width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b6b70' }}>
                  Nenhum orçamento configurado para este mês.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
