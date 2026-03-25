import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: 'layout-dashboard', label: 'Visão Geral' },
  { path: '/lancamentos', icon: 'arrow-right-left', label: 'Lançamentos' },
  { path: '/contas', icon: 'wallet', label: 'Contas financeiras' },
  { path: '/cartoes', icon: 'credit-card', label: 'Cartão de crédito' },
  { path: '/orcamento', icon: 'briefcase', label: 'Orçamento Mensal' },
  { path: '/categorias', icon: 'layout-grid', label: 'Categorias' },
  { path: '/tags', icon: 'tag', label: 'Tags' },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!darkMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [darkMode]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const toggleSubmenu = (id: string) => {
    setSubmenuOpen(submenuOpen === id ? null : id);
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={sidebarCollapsed ? "chevron-right" : "chevron-left"} />
          </svg>
        </button>
        
        <div className="logo-container">
          <span className="logo-text">HUB</span>
          <span className="logo-short">H</span>
        </div>
        
        <div className="user-profile">
          <div className="avatar"></div>
          <div className="user-info">
            <span className="user-name">Lucas Furtado</span>
            <span className="user-email">lucas@email.com</span>
          </div>
        </div>
        
        <nav className="nav-menu">
          <div className="nav-label">MENU</div>
          
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={getIconPath(item.icon)} />
              </svg>
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
          
          <div className="nav-group">
            <div className="nav-item" onClick={() => toggleSubmenu('agenda')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="calendar-range" />
              </svg>
              <span className="nav-text">Agenda Financeira</span>
              <svg className="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="chevron-down" />
              </svg>
            </div>
            <div className={`submenu-wrapper ${submenuOpen === 'agenda' ? 'open' : ''}`}>
              <div className="submenu-item">Contas a pagar</div>
              <div className="submenu-item">Contas a receber</div>
            </div>
          </div>
          
          <a href="#" className="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="bar-chart-3" />
            </svg>
            <span className="nav-text">Relatórios</span>
          </a>
        </nav>
        
        <div className="nav-footer">
          <div className="nav-item" style={{ cursor: 'pointer' }} onClick={toggleTheme}>
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
            <span className="nav-text">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </div>
          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 12px 16px' }}></div>
          <a href="#" className="nav-item"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="settings" /></svg><span className="nav-text">Configurações</span></a>
          <a href="#" className="nav-item"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="help-circle" /></svg><span className="nav-text">Ajuda</span></a>
          <a href="#" className="nav-item logout"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="log-out" /></svg><span className="nav-text">Sair</span></a>
        </div>
      </aside>
      
      <main className="content">
        {children}
      </main>
    </div>
  );
}

function getIconPath(icon: string): string {
  const icons: Record<string, string> = {
    'layout-dashboard': 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    'arrow-right-left': 'M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4',
    'wallet': 'M20 12V8H6a2 2 0 010-4h14v4M4 12v8a2 2 0 002 2h16v-4M18 12a2 2 0 100 4 2 2 0 000-4z',
    'credit-card': 'M1 10h22M1 6h22M1 14h22M23 16a2 2 0 104 0M3 16a2 2 0 104 0',
    'briefcase': 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4z',
    'layout-grid': 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    'tag': 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
  };
  return icons[icon] || 'circle';
}