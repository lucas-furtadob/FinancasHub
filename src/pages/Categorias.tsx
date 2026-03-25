import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Categorias() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'despesa' | 'receita' | 'investimento'>('despesa');
  const [statusTab, setStatusTab] = useState<'ativas' | 'arquivadas'>('ativas');

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <header className="header">
        <div className="page-info">
          <h1>Categorias</h1>
          <p>Gerencie as categorias de suas receitas, despesas e investimentos.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Nova Categoria
          </button>
        </div>
      </header>

      <div className="tabs-header-row">
        <div className="tabs-group">
          <span className="tabs-label">Tipo de categoria</span>
          <div className="tabs-container" id="type-tabs">
            <div 
              className={`tab-btn ${activeTab === 'despesa' ? 'active' : ''}`}
              onClick={() => setActiveTab('despesa')}
            >
              Despesas
            </div>
            <div 
              className={`tab-btn ${activeTab === 'receita' ? 'active' : ''}`}
              onClick={() => setActiveTab('receita')}
            >
              Receitas
            </div>
            <div 
              className={`tab-btn ${activeTab === 'investimento' ? 'active' : ''}`}
              onClick={() => setActiveTab('investimento')}
            >
              Investimentos
            </div>
          </div>
        </div>
        <div className="tabs-group align-right">
          <span className="tabs-label">Status da categoria</span>
          <div className="tabs-container" id="status-tabs">
            <div 
              className={`tab-btn ${statusTab === 'ativas' ? 'active' : ''}`}
              onClick={() => setStatusTab('ativas')}
            >
              Ativas
            </div>
            <div 
              className={`tab-btn ${statusTab === 'arquivadas' ? 'active' : ''}`}
              onClick={() => setStatusTab('arquivadas')}
            >
              Arquivadas
            </div>
          </div>
        </div>
      </div>

      <div className="categories-card">
        <div className="table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Relatórios</th>
                <th style={{ textAlign: 'right', width: '140px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#6b6b70' }}>
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
