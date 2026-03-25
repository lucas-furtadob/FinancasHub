import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, Wallet, CreditCard, Briefcase, LayoutGrid, Tag, CalendarRange, BarChart3, Settings, HelpCircle, LogOut, Moon, Sun, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Visão Geral' },
  { path: '/lancamentos', icon: ArrowRightLeft, label: 'Lançamentos' },
  { path: '/contas', icon: Wallet, label: 'Contas financeiras' },
  { path: '/cartoes', icon: CreditCard, label: 'Cartão de crédito' },
  { path: '/orcamento', icon: Briefcase, label: 'Orçamento Mensal' },
  { path: '/categorias', icon: LayoutGrid, label: 'Categorias' },
  { path: '/tags', icon: Tag, label: 'Tags' },
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
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
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
              <item.icon size={20} />
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
          
          <div className="nav-group">
            <div className="nav-item" onClick={() => toggleSubmenu('agenda')}>
              <CalendarRange size={20} />
              <span className="nav-text">Agenda Financeira</span>
              <ChevronDown size={16} className="chevron" />
            </div>
            <div className={`submenu-wrapper ${submenuOpen === 'agenda' ? 'open' : ''}`}>
              <div className="submenu-item">Contas a pagar</div>
              <div className="submenu-item">Contas a receber</div>
            </div>
          </div>
          
          <div className="nav-item">
            <BarChart3 size={20} />
            <span className="nav-text">Relatórios</span>
          </div>
        </nav>
        
        <div className="nav-footer">
          <div className="nav-item" style={{ cursor: 'pointer' }} onClick={toggleTheme}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <span className="nav-text">{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </div>
          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 12px 16px' }}></div>
          <div className="nav-item"><Settings size={20} /><span className="nav-text">Configurações</span></div>
          <div className="nav-item"><HelpCircle size={20} /><span className="nav-text">Ajuda</span></div>
          <div className="nav-item logout"><LogOut size={20} /><span className="nav-text">Sair</span></div>
        </div>
      </aside>
      
      <main className="content">
        {children}
      </main>
    </div>
  );
}
