// =============================================
//  CARTOES.JS — Lógica da tela de Cartões
// =============================================

// --- Mock Data ---
let cartoes = [
    {
        id: 'cc1',
        nome: 'Nubank Roxinho',
        bandeira: 'Mastercard',
        digitos: '4829',
        conta: 'Nubank PJ',
        limite: 10000,
        utilizado: 3450,
        fechamento: 5,
        vencimento: 12,
        cor: '#8B5CF6'
    },
    {
        id: 'cc2',
        nome: 'Cartão BB Visa Platinum',
        bandeira: 'Visa',
        digitos: '1234',
        conta: 'Banco do Brasil S.A.',
        limite: 15000,
        utilizado: 12800,
        fechamento: 20,
        vencimento: 28,
        cor: '#3B82F6'
    },
    {
        id: 'cc3',
        nome: 'Caixa Elo Empresarial',
        bandeira: 'Elo',
        digitos: '9871',
        conta: 'Caixa Econômica',
        limite: 5000,
        utilizado: 720,
        fechamento: 10,
        vencimento: 17,
        cor: '#F97316'
    }
];

// Mock de faturas por cartão
const mockFaturas = {
    'cc1': [
        { mes: 'Março 2026', valor: 3450.00, status: 'aberta' },
        { mes: 'Fevereiro 2026', valor: 2890.50, status: 'paga' },
        { mes: 'Janeiro 2026', valor: 1740.00, status: 'paga' },
    ],
    'cc2': [
        { mes: 'Março 2026', valor: 12800.00, status: 'aberta' },
        { mes: 'Fevereiro 2026', valor: 9400.00, status: 'paga' },
        { mes: 'Janeiro 2026', valor: 8100.00, status: 'paga' },
    ],
    'cc3': [
        { mes: 'Março 2026', valor: 720.00, status: 'aberta' },
        { mes: 'Fevereiro 2026', valor: 340.00, status: 'paga' },
    ]
};

// Mock de parcelas em aberto por cartão
const mockParcelas = {
    'cc1': [
        { nome: 'MacBook Pro M3', parcela: '3/12', valor: 983.34, cor: '#8B5CF6', icon: 'laptop' },
        { nome: 'Adobe Creative', parcela: '2/6', valor: 298.00, cor: '#EC4899', icon: 'palette' },
        { nome: 'Seguro Celular', parcela: '5/12', valor: 49.90, cor: '#14B8A6', icon: 'shield' },
    ],
    'cc2': [
        { nome: 'TV OLED LG', parcela: '6/12', valor: 1250.00, cor: '#3B82F6', icon: 'tv' },
        { nome: 'Passagem Aérea', parcela: '2/3', valor: 870.00, cor: '#F97316', icon: 'plane' },
    ],
    'cc3': [
        { nome: 'Curso Online', parcela: '1/4', valor: 180.00, cor: '#22C55E', icon: 'book-open' },
    ]
};

let editCartaoId = null;
let deleteCartaoId = null;
let activeSearch = '';
let selectedCor = '#8B5CF6';

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderCartoes();
});

// --- Sidebar ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ic = document.getElementById('toggle-icon');
    sb.classList.toggle('collapsed');
    ic.setAttribute('data-lucide', sb.classList.contains('collapsed') ? 'chevron-right' : 'chevron-left');
    if (sb.classList.contains('collapsed')) {
        document.querySelectorAll('.submenu-wrapper').forEach(w => w.style.display = 'none');
        document.querySelectorAll('.chevron').forEach(c => c.classList.remove('rotated'));
    }
    lucide.createIcons();
}

function toggleSubmenu(id) {
    const sb = document.getElementById('sidebar');
    if (sb.classList.contains('collapsed')) return;
    const w = document.getElementById(id);
    const chev = w.previousElementSibling.querySelector('.chevron');
    if (w.style.display === 'block') {
        w.style.display = 'none';
        chev && chev.classList.remove('rotated');
    } else {
        w.style.display = 'block';
        chev && chev.classList.add('rotated');
    }
}

// --- Formatação ---
function fmtCurrency(val) {
    return 'R$ ' + (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrencyStr(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[R$\s\.]/g, '').replace(',', '.')) || 0;
}

function maskCurrencyInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (!value) { input.value = ''; return; }
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = 'R$ ' + value;
}

function maskOnlyDigits(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 4);
}

// --- Barra de cor baseada em % ---
function getBarColor(pct) {
    if (pct >= 90) return '#EF4444';
    if (pct >= 70) return '#F97316';
    if (pct >= 50) return '#F59E0B';
    return '#22C55E';
}

// --- Renderizar Cards ---
function renderCartoes() {
    const grid = document.getElementById('cartoes-grid');
    grid.innerHTML = '';

    let filtered = [...cartoes];
    if (activeSearch) {
        const s = activeSearch.toLowerCase();
        filtered = filtered.filter(c =>
            c.nome.toLowerCase().includes(s) ||
            c.bandeira.toLowerCase().includes(s) ||
            c.conta.toLowerCase().includes(s)
        );
    }

    // Summary
    const totalLimite    = cartoes.reduce((acc, c) => acc + c.limite, 0);
    const totalUtilizado = cartoes.reduce((acc, c) => acc + c.utilizado, 0);
    const totalDisp      = totalLimite - totalUtilizado;
    const pctGeral       = totalLimite > 0 ? Math.round((totalUtilizado / totalLimite) * 100) : 0;

    document.getElementById('sum-limite').textContent    = fmtCurrency(totalLimite);
    document.getElementById('sum-utilizado').textContent = fmtCurrency(totalUtilizado);
    document.getElementById('sum-disponivel').textContent = fmtCurrency(totalDisp);
    document.getElementById('sum-utilizado-pct').textContent = `${pctGeral}% do limite total`;

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="cartoes-empty"><i data-lucide="credit-card"></i><p>Nenhum cartão encontrado.</p></div>`;
        lucide.createIcons();
        return;
    }

    filtered.forEach(c => {
        const pct       = c.limite > 0 ? Math.min(Math.round((c.utilizado / c.limite) * 100), 100) : 0;
        const disponivel = c.limite - c.utilizado;
        const barColor   = getBarColor(pct);

        const card = document.createElement('div');
        card.className = 'cc-card';
        card.onclick = () => {
            localStorage.setItem('hub_cartoes', JSON.stringify(cartoes));
            window.location.href = 'cartao-detalhe.html?id=' + c.id;
        };
        card.innerHTML = `
            <!-- Header Colorido -->
            <div class="cc-card-header" style="background:linear-gradient(135deg,${c.cor},${c.cor}AA);">
                <div class="cc-card-top">
                    <div>
                        <div class="cc-card-title">${c.nome}</div>
                        <div class="cc-card-subtitle">
                            <span class="cc-bandeira-badge">${c.bandeira}</span>
                            <span>•</span>
                            <span>${c.conta}</span>
                        </div>
                    </div>
                    <div class="cc-chip-icon"><i data-lucide="cpu"></i></div>
                </div>
                <div style="color:rgba(255,255,255,0.5);font-size:13px;font-family:'DM Mono',monospace;letter-spacing:2px;position:relative;z-index:1;">
                    •••• •••• •••• ${c.digitos}
                </div>
            </div>

            <!-- Uso do Limite -->
            <div class="cc-limit-section">
                <div class="cc-limit-label-row">
                    <span class="cc-limit-label">Uso do limite</span>
                    <span class="cc-limit-pct" style="color:${barColor};">${pct}%</span>
                </div>
                <div class="cc-progress-bar">
                    <div class="cc-progress-fill" style="width:${pct}%;background:${barColor};"></div>
                </div>
            </div>

            <!-- Valores -->
            <div class="cc-values-row">
                <div class="cc-value-box">
                    <div class="cc-value-box-label">Disponível</div>
                    <div class="cc-value-box-amount" style="color:#22C55E;">${fmtCurrency(disponivel)}</div>
                </div>
                <div class="cc-value-box">
                    <div class="cc-value-box-label">Utilizado</div>
                    <div class="cc-value-box-amount" style="color:${barColor};">${fmtCurrency(c.utilizado)}</div>
                </div>
            </div>

            <!-- Datas -->
            <div class="cc-dates-row">
                <div class="cc-date-item">
                    <i data-lucide="calendar-x"></i>
                    <span class="cc-date-text">Fechamento: <strong>dia ${c.fechamento}</strong></span>
                </div>
                <div class="cc-date-item">
                    <i data-lucide="calendar-check"></i>
                    <span class="cc-date-text">Vencimento: <strong>dia ${c.vencimento}</strong></span>
                </div>
            </div>

            <!-- Ações -->
            <div class="cc-actions">
                <button class="cc-btn-import" onclick="event.stopPropagation();importarFatura('${c.id}')">
                    <i data-lucide="upload"></i>
                    Importar Fatura
                </button>
                <button class="cc-btn-edit" title="Editar" onclick="event.stopPropagation();openCartaoModal('${c.id}')">
                    <i data-lucide="pencil"></i>
                </button>
                <button class="cc-btn-delete" title="Excluir" onclick="event.stopPropagation();openDeleteModal('${c.id}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    lucide.createIcons();
}

// --- Filtro ---
function filterCartoes(val) {
    activeSearch = val;
    renderCartoes();
}

// =============================================
//  PAINEL DE DETALHE
// =============================================
function openDetailPanel(id) {
    const c = cartoes.find(x => x.id === id);
    if (!c) return;

    const pct        = c.limite > 0 ? Math.min(Math.round((c.utilizado / c.limite) * 100), 100) : 0;
    const disponivel  = c.limite - c.utilizado;
    const barColor    = getBarColor(pct);
    const faturas     = mockFaturas[id] || [];
    const parcelas    = mockParcelas[id] || [];

    const totalParcelas = parcelas.reduce((acc, p) => acc + p.valor, 0);

    // Faturas HTML
    const faturasHTML = faturas.map(f => {
        const isAberta = f.status === 'aberta';
        const statusBg  = isAberta ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)';
        const statusColor = isAberta ? '#F59E0B' : '#22C55E';
        const statusLabel = isAberta ? 'Em aberto' : 'Paga';
        const icon = isAberta ? 'clock' : 'check-circle';
        return `
            <div class="cc-panel-fatura-row">
                <div>
                    <div class="cc-panel-fatura-mes">${f.mes}</div>
                    <span class="cc-panel-fatura-status" style="background:${statusBg};color:${statusColor};">
                        <i data-lucide="${icon}" style="width:10px;height:10px;"></i>
                        ${statusLabel}
                    </span>
                </div>
                <div class="cc-panel-fatura-amount" style="color:${isAberta ? '#F59E0B' : '#FFF'};">${fmtCurrency(f.valor)}</div>
            </div>`;
    }).join('');

    // Parcelas HTML
    const parcelasHTML = parcelas.length === 0
        ? `<p style="color:var(--text-muted);font-size:13px;">Nenhuma parcela em aberto.</p>`
        : parcelas.map(p => `
            <div class="cc-panel-parcela-row">
                <div class="cc-panel-parcela-left">
                    <div class="cc-panel-parcela-icon" style="background:${p.cor}20;">
                        <i data-lucide="${p.icon}" style="color:${p.cor};"></i>
                    </div>
                    <div>
                        <div class="cc-panel-parcela-name">${p.nome}</div>
                        <div class="cc-panel-parcela-meta">Parcela ${p.parcela}</div>
                    </div>
                </div>
                <div class="cc-panel-parcela-amount">-${fmtCurrency(p.valor)}</div>
            </div>`).join('');

    const panel = document.getElementById('cc-detail-panel');
    panel.innerHTML = `
        <!-- Cabeçalho Colorido -->
        <div class="cc-panel-header" style="background:linear-gradient(135deg,${c.cor},${c.cor}AA);">
            <div class="cc-panel-top-row">
                <div>
                    <div class="cc-panel-title">${c.nome}</div>
                    <div class="cc-panel-subtitle">
                        <span class="cc-bandeira-badge">${c.bandeira}</span>
                        <span>• ${c.conta}</span>
                    </div>
                </div>
                <button class="cc-panel-close-btn" onclick="closeDetailPanel()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="cc-panel-digits">•••• •••• •••• ${c.digitos}</div>
        </div>

        <!-- Limite -->
        <div class="cc-panel-limit">
            <div class="cc-panel-limit-label-row">
                <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:.5px;">Uso do limite</span>
                <span style="font-family:'DM Mono',monospace;font-size:12px;font-weight:700;color:${barColor};">${pct}%</span>
            </div>
            <div class="cc-progress-bar">
                <div class="cc-progress-fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
            <div class="cc-panel-values">
                <div class="cc-panel-value-item">
                    <div class="cc-panel-value-label">Disponível</div>
                    <div class="cc-panel-value-amount" style="color:#22C55E;">${fmtCurrency(disponivel)}</div>
                </div>
                <div class="cc-panel-value-item">
                    <div class="cc-panel-value-label">Limite Total</div>
                    <div class="cc-panel-value-amount" style="color:#FFF;">${fmtCurrency(c.limite)}</div>
                </div>
                <div class="cc-panel-value-item" style="grid-column:1/-1;">
                    <div class="cc-panel-value-label">Utilizado neste mês</div>
                    <div class="cc-panel-value-amount" style="color:${barColor};">${fmtCurrency(c.utilizado)}</div>
                </div>
            </div>
        </div>

        <!-- Informações -->
        <div class="cc-panel-section">
            <div class="cc-panel-section-title">
                <i data-lucide="info"></i>
                Informações do Cartão
            </div>
            <div class="cc-panel-info-grid">
                <div class="cc-panel-info-item">
                    <i data-lucide="calendar-x"></i>
                    <div>
                        <div class="cc-panel-info-label">Fechamento</div>
                        <div class="cc-panel-info-value">Todo dia ${c.fechamento}</div>
                    </div>
                </div>
                <div class="cc-panel-info-item">
                    <i data-lucide="calendar-check"></i>
                    <div>
                        <div class="cc-panel-info-label">Vencimento</div>
                        <div class="cc-panel-info-value">Todo dia ${c.vencimento}</div>
                    </div>
                </div>
                <div class="cc-panel-info-item" style="grid-column:1/-1;">
                    <i data-lucide="wallet"></i>
                    <div>
                        <div class="cc-panel-info-label">Conta vinculada</div>
                        <div class="cc-panel-info-value">${c.conta}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Parcelas em Aberto -->
        <div class="cc-panel-section">
            <div class="cc-panel-section-title">
                <i data-lucide="layers"></i>
                Parcelas em Aberto
                ${parcelas.length > 0 ? `<span style="margin-left:auto;font-family:'DM Mono',monospace;font-size:12px;color:#EF4444;font-weight:600;">${fmtCurrency(totalParcelas)}/mês</span>` : ''}
            </div>
            ${parcelasHTML}
        </div>

        <!-- Últimas Faturas -->
        <div class="cc-panel-section">
            <div class="cc-panel-section-title">
                <i data-lucide="file-text"></i>
                Últimas Faturas
            </div>
            ${faturasHTML}
        </div>

        <!-- Ações do Painel -->
        <div class="cc-panel-actions">
            <button class="cc-panel-btn-primary" onclick="importarFatura('${c.id}')">
                <i data-lucide="upload"></i>
                Importar Fatura
            </button>
            <button class="cc-panel-btn-secondary" onclick="closeDetailPanel();openCartaoModal('${c.id}')">
                <i data-lucide="pencil"></i>
                Editar
            </button>
            <button class="cc-panel-btn-danger" onclick="closeDetailPanel();openDeleteModal('${c.id}')">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `;

    document.getElementById('cc-detail-overlay').classList.add('active');
    lucide.createIcons();
}

function closeDetailPanel() {
    document.getElementById('cc-detail-overlay').classList.remove('active');
}

function handleDetailOverlayClick(e) {
    if (e.target === document.getElementById('cc-detail-overlay')) closeDetailPanel();
}

// =============================================
//  MODAL CARTÃO
// =============================================
function openCartaoModal(id = null) {
    editCartaoId = id;
    const title = document.getElementById('modal-cartao-title');

    // Reset
    ['cc-id','cc-nome','cc-digitos','cc-limite','cc-fechamento','cc-vencimento'].forEach(x => document.getElementById(x).value = '');
    document.getElementById('cc-bandeira').value = '';
    document.getElementById('cc-conta').value = '';

    selectedCor = '#8B5CF6';
    document.querySelectorAll('.cc-cor-btn').forEach(b => {
        b.classList.remove('active');
        if (b.dataset.cor === selectedCor) b.classList.add('active');
    });

    if (id) {
        const c = cartoes.find(x => x.id === id);
        if (!c) return;
        title.textContent = 'Editar Cartão';
        document.getElementById('cc-id').value = c.id;
        document.getElementById('cc-nome').value = c.nome;
        document.getElementById('cc-bandeira').value = c.bandeira;
        document.getElementById('cc-digitos').value = c.digitos;
        document.getElementById('cc-limite').value = 'R$ ' + c.limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        document.getElementById('cc-conta').value = c.conta;
        document.getElementById('cc-fechamento').value = c.fechamento;
        document.getElementById('cc-vencimento').value = c.vencimento;
        selectedCor = c.cor || '#8B5CF6';
        document.querySelectorAll('.cc-cor-btn').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.cor === selectedCor) b.classList.add('active');
        });
    } else {
        title.textContent = 'Novo cartão de crédito';
    }

    document.getElementById('cartao-modal').classList.add('active');
    lucide.createIcons();
}

function closeCartaoModal() {
    document.getElementById('cartao-modal').classList.remove('active');
    editCartaoId = null;
}

function handleModalClick(e) {
    if (e.target === document.getElementById('cartao-modal')) closeCartaoModal();
}

function selectCor(btn, cor) {
    document.querySelectorAll('.cc-cor-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCor = cor;
}

function saveCartao() {
    const nome       = document.getElementById('cc-nome').value.trim();
    const bandeira   = document.getElementById('cc-bandeira').value;
    const digitos    = document.getElementById('cc-digitos').value.trim();
    const limite     = parseCurrencyStr(document.getElementById('cc-limite').value);
    const conta      = document.getElementById('cc-conta').value;
    const fechamento = parseInt(document.getElementById('cc-fechamento').value);
    const vencimento = parseInt(document.getElementById('cc-vencimento').value);

    if (!nome)   { showToast('Informe o nome do cartão.', 'error'); return; }
    if (!limite || limite <= 0) { showToast('Informe um limite válido.', 'error'); return; }

    const existing = document.getElementById('cc-id').value;

    if (existing) {
        const idx = cartoes.findIndex(c => c.id === existing);
        if (idx !== -1) {
            cartoes[idx] = { ...cartoes[idx], nome, bandeira, digitos, limite, conta, fechamento: fechamento||1, vencimento: vencimento||1, cor: selectedCor };
            showToast('Cartão atualizado!', 'success');
        }
    } else {
        cartoes.push({ id: 'cc' + Date.now(), nome, bandeira, digitos, limite, utilizado: 0, conta, fechamento: fechamento||1, vencimento: vencimento||1, cor: selectedCor });
        showToast('Cartão cadastrado!', 'success');
    }

    closeCartaoModal();
    renderCartoes();
}

// =============================================
//  MODAL EXCLUIR
// =============================================
function openDeleteModal(id) {
    deleteCartaoId = id;
    const c = cartoes.find(x => x.id === id);
    if (c) document.getElementById('delete-cartao-msg').textContent = `Tem certeza que deseja excluir o cartão "${c.nome}"? Esta ação não pode ser desfeita.`;
    document.getElementById('delete-cartao-modal').classList.add('active');
    lucide.createIcons();
}

function closeDeleteModal() {
    document.getElementById('delete-cartao-modal').classList.remove('active');
    deleteCartaoId = null;
}

function handleDeleteModalClick(e) {
    if (e.target === document.getElementById('delete-cartao-modal')) closeDeleteModal();
}

function confirmDeleteCartao() {
    cartoes = cartoes.filter(c => c.id !== deleteCartaoId);
    showToast('Cartão excluído.', 'success');
    closeDeleteModal();
    renderCartoes();
}

// --- Importar Fatura ---
function importarFatura(id) {
    const c = cartoes.find(x => x.id === id);
    if (c) showToast(`Importar fatura: ${c.nome} — em breve!`, 'info');
}

// --- Toast ---
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast toast-visible';
    const colors = { success: '#22C55E', error: '#EF4444', info: '#3B82F6' };
    const icons  = { success: 'check-circle', error: 'x-circle', info: 'info' };
    t.innerHTML = `<i data-lucide="${icons[type]}" style="width:16px;height:16px;color:${colors[type]};flex-shrink:0;"></i><span>${msg}</span>`;
    t.style.borderColor = colors[type];
    container.appendChild(t);
    lucide.createIcons();
    setTimeout(() => {
        t.classList.remove('toast-visible');
        t.classList.add('toast-hidden');
        setTimeout(() => t.remove(), 400);
    }, 3000);
}
