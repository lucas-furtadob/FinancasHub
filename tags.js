console.log('tags.js carregado');
const DEFAULT_TAGS = [
    { id: 'tag1', nome: 'Fixo', icon: 'pin', cor: '#6366F1', status: 'ativa' },
    { id: 'tag2', nome: 'Parcelado', icon: 'calendar', cor: '#F59E0B', status: 'ativa' },
    { id: 'tag3', nome: 'Recorrente', icon: 'repeat', cor: '#10B981', status: 'ativa' },
    { id: 'tag4', nome: 'PIX', icon: 'send', cor: '#3B82F6', status: 'ativa' },
    { id: 'tag5', nome: 'Boleto', icon: 'file-text', cor: '#EF4444', status: 'ativa' },
    { id: 'tag6', nome: 'Débito', icon: 'credit-card', cor: '#8B5CF6', status: 'ativa' },
    { id: 'tag7', nome: 'Crédito', icon: 'layers', cor: '#EC4899', status: 'ativa' },
    { id: 'tag8', nome: 'Dinheiro', icon: 'banknote', cor: '#14B8A6', status: 'ativa' },
    { id: 'tag9', nome: 'Trabalho', icon: 'briefcase', cor: '#F97316', status: 'ativa' },
    { id: 'tag10', nome: 'Pessoal', icon: 'user', cor: '#06B6D4', status: 'ativa' },
];

const LUCIDE_ICONS = [
    'tag', 'pin', 'calendar', 'repeat', 'send', 'file-text', 'credit-card', 
    'layers', 'banknote', 'briefcase', 'user', 'star', 'heart', 'home', 
    'car', 'shopping-cart', 'utensils', 'coffee', 'laptop', 'smartphone',
    'tv', 'wifi', 'zap', 'droplet', 'gift', 'trending-up', 'bar-chart-2'
];

// --- State ---
let tags = JSON.parse(localStorage.getItem('hub_tags')) || DEFAULT_TAGS;
let currentStatus = 'ativa';
let activePopoverId = null;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicialização robusta
    try {
        renderTable();
        renderIconSelector();
    } catch (e) {
        console.error('Erro ao inicializar tags:', e);
    }
});

// --- Sidebar Toggle ---
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const content = document.querySelector('.content');
    const toggleIcon = document.getElementById('toggle-icon');
    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
        content.style.marginLeft = '72px';
        toggleIcon.style.transform = 'rotate(180deg)';
    } else {
        content.style.marginLeft = '260px';
        toggleIcon.style.transform = 'rotate(0deg)';
    }
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
};

window.toggleSubmenu = function(id) {
    const wrapper = document.getElementById(id);
    const parent = wrapper.previousElementSibling;
    parent.classList.toggle('open');
    wrapper.classList.toggle('open');
};

// --- Render ---
function renderTable() {
    const tbody = document.getElementById('tags-body');
    let filtered = tags.filter(t => t.status === currentStatus);
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;padding:48px;color:var(--text-muted);"><i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:16px;opacity:0.5;"></i><br/>Nenhuma tag encontrada.</td></tr>`;
        lucide.createIcons();
        return;
    }
    
    let html = '';
    filtered.forEach(t => {
        html += renderRow(t);
    });
    tbody.innerHTML = html;
    lucide.createIcons();
}

function renderRow(t) {
    return `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:12px;padding-left:10px;">
                    <div style="background:${t.cor}18;color:${t.cor};" class="cat-icon-container">
                        <i data-lucide="${t.icon || 'tag'}"></i>
                    </div>
                    <span class="cat-name-text">${t.nome}</span>
                </div>
            </td>
            <td>
                <div class="actions-cell">
                    <button type="button" class="action-btn" onclick="window.editTag('${t.id}')" title="Editar tag">
                        <i data-lucide="pencil" style="pointer-events: none;"></i>
                    </button>
                    <button type="button" class="action-btn" onclick="window.toggleTagStatus('${t.id}')" title="${t.status === 'ativa' ? 'Arquivar' : 'Desarquivar'} tag">
                        <i data-lucide="${t.status === 'ativa' ? 'archive' : 'archive-restore'}" style="pointer-events: none;"></i>
                    </button>
                    <button type="button" class="action-btn" onclick="window.confirmDeleteTag('${t.id}')" title="Excluir tag">
                        <i data-lucide="trash-2" style="pointer-events: none;"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// --- Tabs ---
window.switchTab = function(status, e) {
    currentStatus = status;
    
    // Atualiza classes dos botões
    const tabs = document.querySelectorAll('#status-tabs .tab-btn');
    tabs.forEach(btn => {
        const btnStatus = btn.getAttribute('onclick').includes("'ativas'") ? 'ativa' : 'arquivada';
        btn.classList.toggle('active', btnStatus === status);
    });

    renderTable();
};

window.switchStatus = window.switchTab;

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    
    toastMsg.innerText = message;
    toast.classList.remove('toast-hidden');
    toast.classList.add('toast-visible');
    
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-hidden');
    }, 3000);
}

// --- Modal ---
window.openTagModal = function(id = null) {
    document.getElementById('modal-tag-title').innerText = id ? 'Editar Tag' : 'Nova Tag';
    document.getElementById('tag-form').reset();
    document.getElementById('tag-id').value = '';
    renderIconSelector();
    
    if (id) {
        const tag = tags.find(t => t.id === id);
        if (tag) {
            document.getElementById('tag-id').value = tag.id;
            document.getElementById('tag-nome').value = tag.nome;
            document.getElementById('tag-icon').value = tag.icon || 'tag';
            document.getElementById('tag-cor').value = tag.cor;
        }
    }
    
    document.getElementById('tag-modal').style.display = 'flex';
};

window.editTag = window.openTagModal;

window.closeTagModal = function() {
    document.getElementById('tag-modal').style.display = 'none';
};

// --- Icon Selector ---
function renderIconSelector() {
    const grid = document.getElementById('icon-selector-grid');
    grid.innerHTML = LUCIDE_ICONS.map(icon => `
        <div class="icon-option" data-icon="${icon}" onclick="selectIcon('${icon}')" style="cursor:pointer;">
            <i data-lucide="${icon}"></i>
        </div>
    `).join('');
    lucide.createIcons();
    
    const selected = document.getElementById('tag-icon').value;
    document.querySelectorAll('.icon-option').forEach(opt => {
        if (opt.dataset.icon === selected) opt.classList.add('selected');
    });
}

window.selectIcon = function(icon) {
    document.getElementById('tag-icon').value = icon;
    document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`.icon-option[data-icon="${icon}"]`).classList.add('selected');
};

// --- Form Submit ---
document.getElementById('tag-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('tag-id').value;
    const nome = document.getElementById('tag-nome').value.trim();
    const icon = document.getElementById('tag-icon').value;
    const cor = document.getElementById('tag-cor').value;
    
    if (!nome) return;
    
    if (id) {
        const idx = tags.findIndex(t => t.id === id);
        if (idx !== -1) {
            tags[idx].nome = nome;
            tags[idx].icon = icon;
            tags[idx].cor = cor;
        }
    } else {
        const newTag = {
            id: 'tag_' + Date.now(),
            nome: nome,
            icon: icon,
            cor: cor,
            status: 'ativa'
        };
        tags.push(newTag);
    }
    
    localStorage.setItem('hub_tags', JSON.stringify(tags));
    closeTagModal();
    renderTable();
});

// --- Actions ---
window.toggleTagStatus = function(id) {
    const idx = tags.findIndex(t => t.id === id);
    if (idx !== -1) {
        const newStatus = tags[idx].status === 'ativa' ? 'arquivada' : 'ativa';
        tags[idx].status = newStatus;
        localStorage.setItem('hub_tags', JSON.stringify(tags));
        renderTable();
        showToast(newStatus === 'ativa' ? 'Tag desarquivada com sucesso!' : 'Tag arquivada com sucesso!');
    }
};

// --- Delete Modal ---
window.confirmDeleteTag = function(id) {
    const tag = tags.find(t => t.id === id);
    if (!tag) return;
    
    activePopoverId = id;
    const modal = document.getElementById('delete-tag-modal');
    if (modal) modal.style.display = 'flex';
    
    document.getElementById('confirm-delete-tag-btn').onclick = function() {
        tags = tags.filter(t => t.id !== id);
        localStorage.setItem('hub_tags', JSON.stringify(tags));
        closeDeleteTagModal();
        renderTable();
        showToast('Tag excluída com sucesso!');
    };
};

window.closeDeleteTagModal = function() {
    const modal = document.getElementById('delete-tag-modal');
    if (modal) modal.style.display = 'none';
    activePopoverId = null;
};