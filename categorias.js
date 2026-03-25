const DEFAULT_CATEGORIES = [
    // TIPO - RECEITAS
    { id: 'rf', nome: 'RECEITAS FIXAS', tipo: 'receita', paiId: null, icon: 'banknote', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rf1', nome: 'SALÁRIO LUCAS', tipo: 'receita', paiId: 'rf', icon: 'user', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rf2', nome: 'SALÁRIO ILANA', tipo: 'receita', paiId: 'rf', icon: 'user', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rf3', nome: 'VALE ALIMENTAÇÃO / REFEIÇÃO', tipo: 'receita', paiId: 'rf', icon: 'utensils', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rf4', nome: '13º SALÁRIO', tipo: 'receita', paiId: 'rf', icon: 'calendar', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },

    { id: 'rv', nome: 'RECEITAS VARIÁVEIS', tipo: 'receita', paiId: null, icon: 'trending-up', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rv1', nome: 'PROLABORE', tipo: 'receita', paiId: 'rv', icon: 'briefcase', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rv2', nome: 'OUTROS RECEBIMENTOS - TRIBUTADOS', tipo: 'receita', paiId: 'rv', icon: 'file-text', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rv3', nome: 'OUTROS RECEBIMENTOS - NÃO TRIBUTADOS', tipo: 'receita', paiId: 'rv', icon: 'file-text', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rv4', nome: 'ENTRADA EMPRÉSTIMO', tipo: 'receita', paiId: 'rv', icon: 'hand-coins', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },
    { id: 'rv5', nome: 'REEMBOLSO IMPOSTO DE RENDA', tipo: 'receita', paiId: 'rv', icon: 'landmark', cor: '#10B981', status: 'ativa', relatorio: true, desc: '' },

    // TIPO - INVESTIMENTOS
    { id: 'inv1', nome: 'JUROS APLICAÇÕES - INVESTIMENTOS', tipo: 'investimento', paiId: null, icon: 'bar-chart-2', cor: '#6366F1', status: 'ativa', relatorio: true, desc: '' },
    { id: 'inv2', nome: 'APLICAÇÃO CDB - BANCO C6 - LUCAS', tipo: 'investimento', paiId: null, icon: 'banknote', cor: '#6366F1', status: 'ativa', relatorio: true, desc: '' },
    { id: 'inv3', nome: 'APLICAÇÃO CDB - BANCO INTER - ILANA', tipo: 'investimento', paiId: null, icon: 'banknote', cor: '#6366F1', status: 'ativa', relatorio: true, desc: '' },

    // TIPO - DESPESA
    { id: 'da', nome: 'ALIMENTAÇÃO', tipo: 'despesa', paiId: null, icon: 'utensils', cor: '#EF4444', status: 'ativa', relatorio: true, desc: '' },
    { id: 'da1', nome: 'RESTAURANTE E LANCHES', tipo: 'despesa', paiId: 'da', icon: 'coffee', cor: '#EF4444', status: 'ativa', relatorio: true, desc: '' },
    { id: 'da2', nome: 'SUPERMERCADO', tipo: 'despesa', paiId: 'da', icon: 'shopping-cart', cor: '#EF4444', status: 'ativa', relatorio: true, desc: '' },
    { id: 'da3', nome: 'SUPLEMENTOS', tipo: 'despesa', paiId: 'da', icon: 'container', cor: '#EF4444', status: 'ativa', relatorio: true, desc: '' },
    { id: 'da4', nome: 'CLUBE IFOOD', tipo: 'despesa', paiId: 'da', icon: 'smartphone', cor: '#EF4444', status: 'ativa', relatorio: true, desc: '' },
    { id: 'da5', nome: 'ANUIDADE SAMS CLUB', tipo: 'despesa', paiId: 'da', icon: 'credit-card', cor: '#EF4444', status: 'ativa', relatorio: true, desc: '' },

    { id: 'dm', nome: 'MORADIA', tipo: 'despesa', paiId: null, icon: 'home', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm1', nome: 'ALUGUEL', tipo: 'despesa', paiId: 'dm', icon: 'key', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm2', nome: 'CONDOMÍNIO', tipo: 'despesa', paiId: 'dm', icon: 'building', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm3', nome: 'INTERNET FIXA', tipo: 'despesa', paiId: 'dm', icon: 'wifi', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm4', nome: 'LINHA MÓVEL', tipo: 'despesa', paiId: 'dm', icon: 'smartphone', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm5', nome: 'IPTU', tipo: 'despesa', paiId: 'dm', icon: 'file-text', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm6', nome: 'PRODUTOS / ITENS PARA CASA', tipo: 'despesa', paiId: 'dm', icon: 'shopping-bag', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm7', nome: 'ENERGIA ELÉTRICA', tipo: 'despesa', paiId: 'dm', icon: 'zap', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm8', nome: 'AGUA E ESGOTO', tipo: 'despesa', paiId: 'dm', icon: 'droplet', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm9', nome: 'GÁS', tipo: 'despesa', paiId: 'dm', icon: 'flame', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm10', nome: 'FAXINA / LIMPEZA', tipo: 'despesa', paiId: 'dm', icon: 'spray-can', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
    { id: 'dm11', nome: 'DEDETIZAÇÃO', tipo: 'despesa', paiId: 'dm', icon: 'bug', cor: '#3B82F6', status: 'ativa', relatorio: true, desc: '' },
];

const LUCIDE_ICONS = [
    'tag', 'shopping-cart', 'utensils', 'car', 'fuel', 'home', 'navigation', 'banknote',
    'laptop', 'trending-up', 'bar-chart-2', 'landmark', 'bitcoin', 'shield', 'gift',
    'heart', 'coffee', 'book', 'smartphone', 'tv', 'wifi', 'zap', 'droplet'
];

// --- State ---
let categories = JSON.parse(localStorage.getItem('hub_categories')) || DEFAULT_CATEGORIES;
let currentType = 'despesa'; // despesa, receita, investimento
let currentStatus = 'ativa'; // ativa, inativa
let activePopoverId = null;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa carregando os estados padrão (Despesas + Ativas)
    switchType(currentType);
    switchStatus(currentStatus);

    renderIconSelector();
    updatePaiOptions();

    // Reset inline styles from submenus to allow CSS classes control
    document.querySelectorAll('.submenu-wrapper').forEach(w => {
        if (!w.closest('.nav-group').classList.contains('open')) {
            w.style.display = '';
        }
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        const popover = document.getElementById('popover-menu');
        if (!e.target.closest('.action-btn') && !e.target.closest('.popover-menu')) {
            popover.style.display = 'none';
        }
    });

    // Form Submit
    document.getElementById('cat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCategory();
    });
});

// --- Sidebar ---
window.toggleSidebar = function () {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('collapsed');
    const ic = document.getElementById('toggle-icon');
    ic.setAttribute('data-lucide', sb.classList.contains('collapsed') ? 'chevron-right' : 'chevron-left');
    lucide.createIcons();
}

window.toggleSubmenu = function (id) {
    const sb = document.getElementById('sidebar');
    if (sb.classList.contains('collapsed')) return;

    const wrapper = document.getElementById(id);
    const group = wrapper.parentElement;

    // Toggle class .open on the .nav-group to expand submenu via CSS transition
    group.classList.toggle('open');
}

// --- Tabs ---
window.switchType = function (type) {
    currentType = type;
    // Update UI for type tabs (despesa, receita, investimento)
    document.querySelectorAll('.tabs-group:first-child .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${type}'`));
    });
    renderTable();
}

window.switchStatus = function (status) {
    currentStatus = status;
    // Update UI for status tabs (ativa, inativa)
    // Note: HTML uses 'ativas' and 'arquivadas' in switchTab calls
    document.querySelectorAll('.tabs-group.align-right .tab-btn').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (status === 'ativa') {
            btn.classList.toggle('active', onclick.includes("'ativas'"));
        } else {
            btn.classList.toggle('active', onclick.includes("'arquivadas'"));
        }
    });
    renderTable();
}

// Para manter compatibilidade se necessário (ou podemos atualizar o HTML)
window.switchTab = function (tab) {
    if (['despesa', 'receita', 'investimento'].includes(tab)) switchType(tab);
    else switchStatus(tab === 'ativas' ? 'ativa' : 'inativa');
}

// --- Icons ---
function renderIconSelector() {
    const grid = document.getElementById('icon-selector-grid');
    grid.innerHTML = LUCIDE_ICONS.map(icon => `
        <div class="icon-item ${icon === 'tag' ? 'selected' : ''}" onclick="selectIcon('${icon}', this)">
            <i data-lucide="${icon}"></i>
        </div>
    `).join('');
    lucide.createIcons({ attrs: { "stroke-width": 2 } }, grid);
}

function selectIcon(icon, el) {
    document.querySelectorAll('.icon-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('cat-icon').value = icon;
}

// --- Table Rendering ---
function renderTable() {
    const tbody = document.getElementById('categories-body');

    // Filtro independente: Tipo E Status
    let filtered = categories.filter(c => c.tipo === currentType && c.status === currentStatus);

    let html = '';

    // Organiza por hierarquia
    const parentsInFilter = filtered.filter(c => !c.paiId);
    const childrenInFilter = filtered.filter(c => c.paiId);

    // 1. Renderiza os pais que estão no filtro e suas filhas que também estão no filtro
    parentsInFilter.forEach(p => {
        html += renderRow(p, false);
        const children = childrenInFilter.filter(c => c.paiId === p.id);
        children.forEach(child => {
            html += renderRow(child, true);
        });
    });

    // 2. Renderiza filhas que estão no filtro mas o pai NÃO está (ex: subcategoria arquivada com pai ativo)
    const orphanedChildren = childrenInFilter.filter(child => !parentsInFilter.some(p => p.id === child.paiId));
    if (orphanedChildren.length > 0) {
        // Se estivermos na aba de arquivadas, podemos agrupar ou apenas listar
        orphanedChildren.forEach(child => {
            html += renderRow(child, true);
        });
    }

    if (html === '') {
        const typeMsg = currentType === 'despesa' ? 'Despesas' : (currentType === 'receita' ? 'Receitas' : 'Investimentos');
        const statusMsg = currentStatus === 'ativa' ? 'ativas' : 'arquivadas';
        html = `<tr><td colspan="3" style="text-align:center; padding: 40px; color: var(--text-muted);">Nenhuma categoria de ${typeMsg} ${statusMsg} encontrada.</td></tr>`;
    }

    tbody.innerHTML = html;
    lucide.createIcons();
}

function renderRow(c, isChild) {
    return `
        <tr class="${isChild ? 'sub-category' : ''}">
            <td>
                <div class="cat-name-cell" style="padding-left: ${isChild ? '18px' : '10px'}">
                    ${isChild ? '<i data-lucide="corner-down-right" class="indent-icon"></i>' : ''}
                    <div class="cat-icon-container" style="background: ${c.cor}18; color: ${c.cor};">
                        <i data-lucide="${c.icon || 'tag'}"></i>
                    </div>
                    <span class="cat-name-text">${c.nome}</span>
                </div>
            </td>
            <td>
                <span class="report-badge ${c.relatorio ? 'show' : 'hide'}">
                    ${c.relatorio ? 'Exibir' : 'Ocultar'}
                </span>
            </td>
            <td>
                <div class="actions-cell">
                    <button type="button" class="action-btn" onclick="window.editCategory('${c.id}')" title="Editar categoria">
                        <i data-lucide="pencil" style="pointer-events: none;"></i>
                    </button>
                    <button type="button" class="action-btn" onclick="window.confirmDeleteCategory('${c.id}')" title="Excluir categoria">
                        <i data-lucide="trash-2" style="pointer-events: none;"></i>
                    </button>
                    ${!isChild ? `
                        <button type="button" class="action-btn" onclick="window.addSubcategory('${c.id}')" title="Adicionar subcategoria">
                            <i data-lucide="plus" style="pointer-events: none;"></i>
                        </button>
                    ` : '<div style="width:32px;"></div>'}
                    <button type="button" class="action-btn" onclick="window.openPopover(event, '${c.id}')" title="Mais opções">
                        <i data-lucide="more-horizontal" style="pointer-events: none;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// --- Modal ---
window.openCategoriaModal = function (parentId = 'none') {
    document.getElementById('modal-cat-title').innerText = parentId === 'none' ? 'Nova Categoria' : 'Nova Subcategoria';
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-form').reset();
    document.getElementById('cat-tipo').value = currentType;
    updatePaiOptions();
    document.getElementById('cat-pai').value = parentId;
    document.getElementById('cat-modal').style.display = 'flex';
}

window.closeCatModal = function () {
    document.getElementById('cat-modal').style.display = 'none';
}

function updatePaiOptions() {
    const tipo = document.getElementById('cat-tipo').value;
    const select = document.getElementById('cat-pai');
    const parents = categories.filter(c => c.tipo === tipo && !c.paiId);

    let html = '<option value="none">Nenhuma (Categoria Principal)</option>';
    parents.forEach(p => {
        html += `<option value="${p.id}">${p.nome}</option>`;
    });
    select.innerHTML = html;
}

function saveCategory() {
    const id = document.getElementById('cat-id').value;
    const nome = document.getElementById('cat-nome').value;
    const tipo = document.getElementById('cat-tipo').value;
    const paiId = document.getElementById('cat-pai').value === 'none' ? null : document.getElementById('cat-pai').value;
    const icon = document.getElementById('cat-icon').value;
    const cor = document.getElementById('cat-cor').value;
    const desc = document.getElementById('cat-desc').value;

    if (id) {
        // Edit
        const idx = categories.findIndex(c => c.id === id);
        if (idx !== -1) {
            categories[idx] = { ...categories[idx], nome, tipo, paiId, icon, cor, desc };
        }
    } else {
        // Create
        const newCat = {
            id: 'cat_' + Date.now(),
            nome, tipo, paiId, icon, cor, desc,
            status: 'ativa',
            relatorio: true
        };
        categories.push(newCat);
    }

    localStorage.setItem('hub_categories', JSON.stringify(categories));
    closeCatModal();
    renderTable();
}

window.editCategory = function (id) {
    console.log('Editando categoria:', id);
    const c = categories.find(cat => cat.id === id);
    if (!c) {
        console.error('Categoria não encontrada:', id);
        return;
    }

    document.getElementById('modal-cat-title').innerText = 'Editar Categoria';
    document.getElementById('cat-id').value = c.id;
    document.getElementById('cat-nome').value = c.nome;
    document.getElementById('cat-tipo').value = c.tipo;
    updatePaiOptions();
    document.getElementById('cat-pai').value = c.paiId || 'none';
    document.getElementById('cat-icon').value = c.icon;
    document.getElementById('cat-cor').value = c.cor;
    document.getElementById('cat-desc').value = c.desc || '';

    // Update icon selector
    document.querySelectorAll('.icon-item').forEach(item => {
        const iconEl = item.querySelector('[data-lucide]');
        const iconName = iconEl ? iconEl.getAttribute('data-lucide') : null;
        if (iconName === c.icon) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    document.getElementById('cat-modal').style.display = 'flex';
}

let categoryToDelete = null;

window.confirmDeleteCategory = function (id) {
    categoryToDelete = id;
    document.getElementById('delete-cat-modal').style.display = 'flex';
}

window.closeDeleteCatModal = function () {
    document.getElementById('delete-cat-modal').style.display = 'none';
    categoryToDelete = null;
}

document.getElementById('confirm-delete-cat-btn').addEventListener('click', () => {
    if (categoryToDelete) {
        categories = categories.filter(c => c.id !== categoryToDelete && c.paiId !== categoryToDelete);
        localStorage.setItem('hub_categories', JSON.stringify(categories));
        renderTable();
        closeDeleteCatModal();
    }
});

window.addSubcategory = function (parentId) {
    openCategoriaModal(parentId);
}

// --- Popover ---
window.openPopover = function (e, id) {
    e.stopPropagation();
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    activePopoverId = id;
    const popover = document.getElementById('popover-menu');

    // Posicionamento
    const rect = e.currentTarget.getBoundingClientRect();
    popover.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    popover.style.left = (rect.right - 180 + window.scrollX) + 'px';
    popover.style.display = 'block';

    // Texto dinâmico
    document.getElementById('popover-status-toggle').innerHTML = `
        <i data-lucide="${cat.status === 'ativa' ? 'archive' : 'archive-restore'}"></i> ${cat.status === 'ativa' ? 'Arquivar' : 'Desarquivar'}
    `;
    document.getElementById('popover-report-toggle').innerHTML = `
        <i data-lucide="${cat.relatorio ? 'eye-off' : 'eye'}"></i> ${cat.relatorio ? 'Ocultar dos relatórios' : 'Exibir nos relatórios'}
    `;
    lucide.createIcons();
}

window.handleStatusToggle = function () {
    const idx = categories.findIndex(c => c.id === activePopoverId);
    if (idx !== -1) {
        categories[idx].status = categories[idx].status === 'ativa' ? 'inativa' : 'ativa';
        // Se inativar pai, inativa filhos? (Opcional, mas comum)
        if (categories[idx].status === 'inativa') {
            categories.filter(c => c.paiId === activePopoverId).forEach(child => {
                child.status = 'inativa';
            });
        }
    }
    localStorage.setItem('hub_categories', JSON.stringify(categories));
    document.getElementById('popover-menu').style.display = 'none';
    renderTable();
}

window.handleReportToggle = function () {
    const idx = categories.findIndex(c => c.id === activePopoverId);
    if (idx !== -1) {
        categories[idx].relatorio = !categories[idx].relatorio;
    }
    localStorage.setItem('hub_categories', JSON.stringify(categories));
    document.getElementById('popover-menu').style.display = 'none';
    renderTable();
}

window.updatePaiOptions = updatePaiOptions;
