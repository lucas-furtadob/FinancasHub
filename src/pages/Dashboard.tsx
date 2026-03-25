import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <header className="header">
        <div className="page-info">
          <h1>Visão Geral</h1>
          <p>Resumo das suas finanças</p>
        </div>
      </header>

      <div className="summary-cards">
        <div className="card">
          <div className="card-icon received">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Receitas do Mês</span>
            <span className="value">R$ 0,00</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon paid">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 010-7h5a3.5 3.5 0 000-7H6"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Despesas do Mês</span>
            <span className="value">R$ 0,00</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon balance">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 010-4h14v4M4 12v8a2 2 0 002 2h16v-4M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
          </div>
          <div className="card-data">
            <span className="label">Saldo Total</span>
            <span className="value">R$ 0,00</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Transações Recentes</h3>
          <p style={{color: '#6b6b70'}}>Nenhuma transação ainda</p>
        </div>
        
        <div className="card">
          <h3>Contas</h3>
          <p style={{color: '#6b6b70'}}>Nenhuma conta cadastrada</p>
        </div>
      </div>
    </div>
  );
}