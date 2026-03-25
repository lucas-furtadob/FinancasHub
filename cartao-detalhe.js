// =============================================
//  CARTAO-DETALHE.JS
//  Página de detalhe do cartão com faturas
// =============================================

// --- Dados de cartões (compartilhado via localStorage, fallback para mock) ---
const MOCK_CARTOES = [
    { id: 'cc1', nome: 'Nubank Roxinho',       bandeira: 'Mastercard', digitos: '4829', conta: 'Nubank PJ',          limite: 10000, utilizado: 3450,  fechamento: 5,  vencimento: 12, cor: '#8B5CF6' },
    { id: 'cc2', nome: 'Cartão BB Visa Platinum', bandeira: 'Visa',    digitos: '1234', conta: 'Banco do Brasil S.A.', limite: 15000, utilizado: 12800, fechamento: 20, vencimento: 28, cor: '#3B82F6' },
    { id: 'cc3', nome: 'Caixa Elo Empresarial',   bandeira: 'Elo',     digitos: '9871', conta: 'Caixa Econômica',     limite: 5000,  utilizado: 720,   fechamento: 10, vencimento: 17, cor: '#F97316' },
];

// --- Mock de faturas ---
// Cada fatura: { id, cartaoId, mes (YYYY-MM), titulo, vencimento, status ('aberta'|'fechada'), total, lancamentos[], pagamentoLancId }
let faturas = JSON.parse(localStorage.getItem('hub_faturas') || 'null') || [
    // Nubank cc1
    { id: 'f1', cartaoId: 'cc1', mes: '2026-03', titulo: 'Março 2026',    vencimento: '12/03/2026', status: 'aberta',  total: 3450.00, lancamentos: [
        { id: 'l1', titulo: 'iFood - Almoço',      categoria: 'Alimentação',  data: '05/03/2026', valor: 89.90,   parcela: null, icon: 'utensils', cor: '#F97316' },
        { id: 'l2', titulo: 'MacBook Pro M3',       categoria: 'Tecnologia',   data: '03/03/2026', valor: 983.34,  parcela: '3/12', icon: 'laptop',   cor: '#8B5CF6' },
        { id: 'l3', titulo: 'Adobe Creative Cloud', categoria: 'Assinaturas', data: '01/03/2026', valor: 298.00,  parcela: '2/6',  icon: 'palette',  cor: '#EC4899' },
        { id: 'l4', titulo: 'Postagem Correios',    categoria: 'Logística',    data: '08/03/2026', valor: 47.60,   parcela: null, icon: 'package',  cor: '#14B8A6' },
        { id: 'l5', titulo: 'Seguro Celular',        categoria: 'Seguros',     data: '01/03/2026', valor: 49.90,   parcela: '5/12', icon: 'shield',   cor: '#22C55E' },
        { id: 'l6', titulo: 'Mercado Livre - Frete', categoria: 'Compras',    data: '10/03/2026', valor: 19.90,   parcela: null, icon: 'shopping-cart', cor: '#3B82F6' },
        { id: 'l7', titulo: 'Gasolina - ANP Posto',  categoria: 'Transporte', data: '11/03/2026', valor: 200.66,  parcela: null, icon: 'fuel',     cor: '#EF4444' },
        { id: 'l8', titulo: 'Jantar Restaurante',    categoria: 'Alimentação', data: '07/03/2026', valor: 145.00,  parcela: null, icon: 'wine',     cor: '#F97316' },
        { id: 'l9', titulo: 'Assinatura Canva Pro',  categoria: 'Assinaturas', data: '01/03/2026', valor: 89.90,   parcela: null, icon: 'figma',    cor: '#EC4899' },
        { id: 'l10', titulo: 'Uber - Corrida',        categoria: 'Transporte', data: '06/03/2026', valor: 32.70,   parcela: null, icon: 'car',      cor: '#14B8A6' },
        { id: 'l11', titulo: 'Farmácia',               categoria: 'Saúde',     data: '09/03/2026', valor: 73.50,   parcela: null, icon: 'pill',     cor: '#22C55E' },
        { id: 'l12', titulo: 'Amazon - Livro',         categoria: 'Educação',  data: '04/03/2026', valor: 79.90,   parcela: null, icon: 'book',     cor: '#3B82F6' },
        { id: 'l13', titulo: 'Café - Starbucks',       categoria: 'Alimentação', data: '02/03/2026', valor: 31.90, parcela: null, icon: 'coffee',   cor: '#F97316' },
        { id: 'l14', titulo: 'Streaming - Netflix',    categoria: 'Entretenimento', data: '01/03/2026', valor: 55.90, parcela: null, icon: 'tv', cor: '#EF4444' },
        { id: 'l15', titulo: 'Passagem Metrô',         categoria: 'Transporte', data: '10/03/2026', valor: 12.00, parcela: null, icon: 'train',    cor: '#6366F1' },
        { id: 'l16', titulo: 'Academia',               categoria: 'Saúde',     data: '01/03/2026', valor: 150.00, parcela: null, icon: 'dumbbell', cor: '#22C55E' },
        { id: 'l17', titulo: 'Papelaria',              categoria: 'Escritório', data: '07/03/2026', valor: 38.00, parcela: null, icon: 'pen-tool', cor: '#F59E0B' },
        { id: 'l18', titulo: 'Supermercado',           categoria: 'Alimentação', data: '06/03/2026', valor: 245.80, parcela: null, icon: 'shopping-bag', cor: '#F97316' },
        { id: 'l19', titulo: 'Estacionamento',         categoria: 'Transporte', data: '08/03/2026', valor: 28.00, parcela: null, icon: 'parking-circle', cor: '#14B8A6' },
        { id: 'l20', titulo: 'Spotify Premium',        categoria: 'Assinaturas', data: '01/03/2026', valor: 21.90, parcela: null, icon: 'music',    cor: '#22C55E' },
    ], pagamentoLancId: null },
    { id: 'f2', cartaoId: 'cc1', mes: '2026-02', titulo: 'Fevereiro 2026', vencimento: '12/02/2026', status: 'fechada', total: 2890.50, lancamentos: [
        { id: 'l21', titulo: 'Almoço Executivo',    categoria: 'Alimentação', data: '08/02/2026', valor: 340.00, parcela: null,  icon: 'utensils', cor: '#F97316' },
        { id: 'l22', titulo: 'MacBook Pro M3',      categoria: 'Tecnologia',  data: '03/02/2026', valor: 983.34, parcela: '2/12', icon: 'laptop',  cor: '#8B5CF6' },
        { id: 'l23', titulo: 'Supermercado',        categoria: 'Alimentação', data: '14/02/2026', valor: 380.90, parcela: null,  icon: 'shopping-bag', cor: '#F97316' },
        { id: 'l24', titulo: 'Uber',                categoria: 'Transporte',  data: '10/02/2026', valor: 85.40,  parcela: null,  icon: 'car', cor: '#14B8A6' },
        { id: 'l25', titulo: 'Academia',            categoria: 'Saúde',       data: '01/02/2026', valor: 150.00, parcela: null,  icon: 'dumbbell', cor: '#22C55E' },
        { id: 'l26', titulo: 'Netflix + Spotify',   categoria: 'Assinaturas', data: '01/02/2026', valor: 89.90,  parcela: null,  icon: 'tv', cor: '#EF4444' },
        { id: 'l27', titulo: 'Farmácia',            categoria: 'Saúde',       data: '12/02/2026', valor: 112.30, parcela: null,  icon: 'pill', cor: '#22C55E' },
        { id: 'l28', titulo: 'Combustível',         categoria: 'Transporte',  data: '15/02/2026', valor: 200.00, parcela: null,  icon: 'fuel', cor: '#EF4444' },
        { id: 'l29', titulo: 'Seguro Celular',      categoria: 'Seguros',     data: '01/02/2026', valor: 49.90,  parcela: '4/12', icon: 'shield', cor: '#22C55E' },
        { id: 'l30', titulo: 'Café',                categoria: 'Alimentação', data: '05/02/2026', valor: 42.70,  parcela: null,  icon: 'coffee', cor: '#F97316' },
        { id: 'l31', titulo: 'Estacionamento',      categoria: 'Transporte',  data: '18/02/2026', valor: 56.00,  parcela: null,  icon: 'parking-circle', cor: '#14B8A6' },
        { id: 'l32', titulo: 'Livros - Amazon',     categoria: 'Educação',    data: '08/02/2026', valor: 159.90, parcela: null,  icon: 'book', cor: '#3B82F6' },
        { id: 'l33', titulo: 'Adobe Creative',      categoria: 'Assinaturas', data: '01/02/2026', valor: 298.00, parcela: '1/6',  icon: 'palette', cor: '#EC4899' },
        { id: 'l34', titulo: 'Jantar',              categoria: 'Alimentação', data: '20/02/2026', valor: 182.16, parcela: null,  icon: 'wine', cor: '#F97316' },
    ], pagamentoLancId: 'paid-f2' },
    { id: 'f3', cartaoId: 'cc1', mes: '2026-01', titulo: 'Janeiro 2026', vencimento: '12/01/2026', status: 'fechada', total: 1740.00, lancamentos: [
        { id: 'l35', titulo: 'MacBook Pro M3',      categoria: 'Tecnologia',  data: '03/01/2026', valor: 983.34, parcela: '1/12', icon: 'laptop',  cor: '#8B5CF6' },
        { id: 'l36', titulo: 'Supermercado',        categoria: 'Alimentação', data: '10/01/2026', valor: 320.00, parcela: null,   icon: 'shopping-bag', cor: '#F97316' },
        { id: 'l37', titulo: 'Academia',            categoria: 'Saúde',       data: '01/01/2026', valor: 150.00, parcela: null,   icon: 'dumbbell', cor: '#22C55E' },
        { id: 'l38', titulo: 'Combustível',         categoria: 'Transporte',  data: '15/01/2026', valor: 200.00, parcela: null,   icon: 'fuel', cor: '#EF4444' },
        { id: 'l39', titulo: 'Streaming',           categoria: 'Assinaturas', data: '01/01/2026', valor: 86.66,  parcela: null,   icon: 'tv', cor: '#EF4444' },
    ], pagamentoLancId: 'paid-f3' },
    // Visa cc2
    { id: 'f4', cartaoId: 'cc2', mes: '2026-03', titulo: 'Março 2026',    vencimento: '28/03/2026', status: 'aberta',  total: 12800.00, lancamentos: [
        { id: 'l40', titulo: 'TV OLED LG',          categoria: 'Tecnologia',  data: '05/03/2026', valor: 1250.00, parcela: '6/12', icon: 'tv',        cor: '#3B82F6' },
        { id: 'l41', titulo: 'Passagem Aérea SP-RJ',categoria: 'Viagem',      data: '15/03/2026', valor: 870.00,  parcela: '2/3',  icon: 'plane',     cor: '#F97316' },
        { id: 'l42', titulo: 'Aluguel Sala',        categoria: 'Infraestrutura', data: '01/03/2026', valor: 3500.00, parcela: null,  icon: 'building', cor: '#6366F1' },
        { id: 'l43', titulo: 'Fornecedor A',        categoria: 'Produtos',    data: '08/03/2026', valor: 7180.00, parcela: null,  icon: 'package',   cor: '#22C55E' },
    ], pagamentoLancId: null },
    { id: 'f5', cartaoId: 'cc2', mes: '2026-02', titulo: 'Fevereiro 2026', vencimento: '28/02/2026', status: 'fechada', total: 9400.00, lancamentos: [
        { id: 'l44', titulo: 'TV OLED LG',          categoria: 'Tecnologia',  data: '05/02/2026', valor: 1250.00, parcela: '5/12', icon: 'tv',     cor: '#3B82F6' },
        { id: 'l45', titulo: 'Fornecedor B',        categoria: 'Produtos',    data: '12/02/2026', valor: 8150.00, parcela: null,   icon: 'package', cor: '#22C55E' },
    ], pagamentoLancId: 'paid-f5' },
    // Elo cc3
    { id: 'f6', cartaoId: 'cc3', mes: '2026-03', titulo: 'Março 2026',    vencimento: '17/03/2026', status: 'aberta',  total: 720.00, lancamentos: [
        { id: 'l46', titulo: 'Curso Online Udemy',  categoria: 'Educação',    data: '05/03/2026', valor: 180.00, parcela: '1/4',  icon: 'book-open', cor: '#22C55E' },
        { id: 'l47', titulo: 'Hospedagem AWS',      categoria: 'Tecnologia',  data: '01/03/2026', valor: 340.00, parcela: null,   icon: 'cloud',     cor: '#3B82F6' },
        { id: 'l48', titulo: 'Domínio Registro.br', categoria: 'Tecnologia',  data: '10/03/2026', valor: 45.00,  parcela: null,   icon: 'globe',     cor: '#6366F1' },
        { id: 'l49', titulo: 'DNS Cloudflare',      categoria: 'Tecnologia',  data: '01/03/2026', valor: 155.00, parcela: null,   icon: 'wifi',      cor: '#14B8A6' },
    ], pagamentoLancId: null },
    { id: 'f7', cartaoId: 'cc3', mes: '2026-02', titulo: 'Fevereiro 2026', vencimento: '17/02/2026', status: 'fechada', total: 340.00, lancamentos: [
        { id: 'l50', titulo: 'Hospedagem AWS',      categoria: 'Tecnologia',  data: '01/02/2026', valor: 280.00, parcela: null,   icon: 'cloud',     cor: '#3B82F6' },
        { id: 'l51', titulo: 'Domínio',             categoria: 'Tecnologia',  data: '05/02/2026', valor: 60.00,  parcela: null,   icon: 'globe',     cor: '#6366F1' },
    ], pagamentoLancId: 'paid-f7' },
];

// Lançamentos extras registrados via pagamento de fatura
let extraLancamentos = JSON.parse(localStorage.getItem('hub_extra_lancamentos') || '[]');

// Estado atual
let cartaoAtual = null;
let payFaturaId = null;
let reopenFaturaId = null;
let openFaturaIds = new Set(); // rastreia quais faturas estão expandidas

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Tenta carregar cartões do localStorage (salvo pela cartoes.js)
    const storedCartoes = JSON.parse(localStorage.getItem('hub_cartoes') || 'null');
    const lista = storedCartoes || MOCK_CARTOES;

    cartaoAtual = lista.find(c => c.id === id) || lista[0];

    lucide.createIcons();
    renderPage();
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

// --- Helpers ---
function fmtCurrency(v) {
    return 'R$ ' + (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function maskDateInput(input) {
    let raw = input.value.replace(/\D/g, '').substring(0, 8);
    if (raw.length >= 5) raw = raw.substring(0,2) + '/' + raw.substring(2,4) + '/' + raw.substring(4);
    else if (raw.length >= 3) raw = raw.substring(0,2) + '/' + raw.substring(2);
    input.value = raw;
}

function getTodayFormatted() {
    const n = new Date();
    return String(n.getDate()).padStart(2,'0') + '/' + String(n.getMonth()+1).padStart(2,'0') + '/' + n.getFullYear();
}

function getBarColor(pct) {
    if (pct >= 90) return '#EF4444';
    if (pct >= 70) return '#F97316';
    if (pct >= 50) return '#F59E0B';
    return '#22C55E';
}

function saveFaturas() {
    localStorage.setItem('hub_faturas', JSON.stringify(faturas));
    localStorage.setItem('hub_extra_lancamentos', JSON.stringify(extraLancamentos));
}

// --- Render Page ---
function renderPage(keepOpenIds) {
    if (!cartaoAtual) return;

    // Se não foi passado um conjunto de IDs abertos, usa o estado global
    if (keepOpenIds !== undefined) {
        openFaturaIds = keepOpenIds;
    }

    const c = cartaoAtual;
    const pct = c.limite > 0 ? Math.min(Math.round((c.utilizado / c.limite) * 100), 100) : 0;
    const disponivel = c.limite - c.utilizado;
    const barColor = getBarColor(pct);

    const faturasDeste = faturas.filter(f => f.cartaoId === c.id);

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <!-- CABEÇALHO HERO -->
        <div class="cd-hero" style="background:linear-gradient(135deg,${c.cor},${c.cor}99);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;position:relative;z-index:1;">
                <a href="cartoes.html" class="cd-back-btn">
                    <i data-lucide="arrow-left"></i>
                    Voltar para Cartões
                </a>
                <button class="cd-import-btn" onclick="showToast('Importar fatura — em breve!','info')">
                    <i data-lucide="upload"></i>
                    Importar Fatura OFX/CSV
                </button>
            </div>

            <div class="cd-hero-body">
                <div class="cd-hero-info">
                    <div class="cd-hero-title">${c.nome}</div>
                    <div class="cd-hero-subtitle">
                        <span class="cc-bandeira-badge">${c.bandeira}</span>
                        <span>• ${c.conta}</span>
                    </div>
                    <div class="cd-hero-digits">•••• •••• •••• ${c.digitos}</div>
                </div>
                <div class="cd-hero-stats">
                    <div class="cd-hero-stat">
                        <div class="cd-hero-stat-icon">
                            <i data-lucide="shield-check" style="color:#FFF;"></i>
                        </div>
                        <div class="cd-hero-stat-content">
                            <div class="cd-hero-stat-label">Limite Total</div>
                            <div class="cd-hero-stat-value">${fmtCurrency(c.limite)}</div>
                        </div>
                    </div>
                    <div class="cd-hero-stat">
                        <div class="cd-hero-stat-icon">
                            <i data-lucide="check-circle" style="color:#22C55E;"></i>
                        </div>
                        <div class="cd-hero-stat-content">
                            <div class="cd-hero-stat-label">Disponível</div>
                            <div class="cd-hero-stat-value" style="color:#22C55E;">${fmtCurrency(disponivel)}</div>
                        </div>
                    </div>
                    <div class="cd-hero-stat">
                        <div class="cd-hero-stat-icon">
                            <i data-lucide="alert-circle" style="color:${barColor};"></i>
                        </div>
                        <div class="cd-hero-stat-content">
                            <div class="cd-hero-stat-label">Utilizado</div>
                            <div class="cd-hero-stat-value" style="color:${barColor};">${fmtCurrency(c.utilizado)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Barra de Uso -->
            <div class="cd-limit-bar-section">
                <div class="cd-limit-bar-row">
                    <span class="cd-limit-bar-label">Uso do limite</span>
                    <span class="cd-limit-bar-pct" style="color:#FFF;background:${barColor};padding:2px 8px;border-radius:4px;font-size:10px;">${pct}%</span>
                </div>
                <div class="cd-progress-track">
                    <div class="cd-progress-fill" style="width:${pct}%;background:${barColor};"></div>
                </div>
            </div>
        </div>

        <!-- FATURAS -->
        <div class="cd-faturas-section">
            <div class="cd-section-title" style="margin-top:24px;">
                <i data-lucide="file-text"></i>
                Faturas (${faturasDeste.length})
            </div>
            <div id="faturas-list">
                ${faturasDeste.length === 0
                    ? `<p style="color:var(--text-muted);font-size:14px;padding:24px 0;">Nenhuma fatura encontrada para este cartão.</p>`
                    : faturasDeste.map(f => renderFaturaCard(f)).join('')}
            </div>
        </div>
    `;

    lucide.createIcons();

    // Restaura faturas que estavam abertas antes do re-render
    openFaturaIds.forEach(id => {
        const body = document.getElementById('fatura-body-' + id);
        const chev = document.getElementById('chev-' + id);
        if (body) body.classList.add('open');
        if (chev) chev.classList.add('open');
    });
}

function renderFaturaCard(f) {
    const isAberta = f.status === 'aberta';
    const statusBg    = isAberta ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)';
    const statusColor = isAberta ? '#F59E0B' : '#22C55E';
    const statusLabel = isAberta ? 'Em aberto' : 'Paga';
    const statusIcon  = isAberta ? 'clock' : 'check-circle';

    const monthBg    = isAberta ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)';
    const monthColor = isAberta ? '#F59E0B' : '#22C55E';
    const monthIcon  = isAberta ? 'calendar-clock' : 'calendar-check';

    const lancsTotais = f.lancamentos.reduce((acc, l) => acc + l.valor, 0);

    // Pagamento registrado
    let pagamentoBadgeHTML = '';
    if (!isAberta && f.pagamentoLancId) {
        pagamentoBadgeHTML = `
            <div class="cd-fatura-pagamento-badge">
                <i data-lucide="check-circle"></i>
                <span class="cd-fatura-pagamento-badge-text">
                    Pagamento de <strong>${fmtCurrency(f.total)}</strong> registrado em Lançamentos
                </span>
            </div>`;
    }

    return `
        <div class="cd-fatura-card" id="fatura-card-${f.id}">
            <!-- Cabeçalho da fatura (clicável para expandir) -->
            <div class="cd-fatura-header" onclick="toggleFatura('${f.id}')">
                <div class="cd-fatura-header-left">
                    <div class="cd-fatura-month-icon" style="background:${monthBg};">
                        <i data-lucide="${monthIcon}" style="color:${monthColor};"></i>
                    </div>
                    <div>
                        <div class="cd-fatura-month">${f.titulo}</div>
                        <div class="cd-fatura-venc">Vencimento: ${f.vencimento} · ${f.lancamentos.length} lançamento${f.lancamentos.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                <div class="cd-fatura-header-right">
                    <div>
                        <div class="cd-fatura-total" style="color:#FFF;">${fmtCurrency(f.total)}</div>
                    </div>
                    <span class="cd-fatura-status-badge" style="background:${statusBg};color:${statusColor};">
                        <i data-lucide="${statusIcon}"></i>
                        ${statusLabel}
                    </span>
                    <div class="cd-fatura-chevron" id="chev-${f.id}">
                        <i data-lucide="chevron-down"></i>
                    </div>
                </div>
            </div>

            <!-- Ações da fatura -->
            <div class="cd-fatura-actions">
                ${isAberta
                    ? `<button class="cd-fatura-btn-pay" onclick="openPayModal('${f.id}')">
                            <i data-lucide="credit-card"></i>
                            Pagar Fatura
                        </button>
                        <button class="cd-fatura-btn-add" onclick="openLancamentoModal('${f.id}')">
                            <i data-lucide="plus"></i>
                            Incluir Lançamento
                        </button>
                        <button class="cd-fatura-btn-import-inline" onclick="showToast('Importando lançamentos desta fatura — em breve!','info')">
                            <i data-lucide="upload"></i>
                            Importar lançamentos
                        </button>`
                    : `<button class="cd-fatura-btn-reopen" onclick="openReopenModal('${f.id}')">
                            <i data-lucide="refresh-cw"></i>
                            Reabrir Fatura
                        </button>
                        <button class="cd-fatura-btn-import-inline" onclick="showToast('Importando lançamentos desta fatura — em breve!','info')">
                            <i data-lucide="upload"></i>
                            Importar lançamentos
                        </button>`}
            </div>

            <!-- Corpo Expansível -->
            <div class="cd-fatura-body" id="fatura-body-${f.id}">
                <div class="cd-lancamentos-table-wrapper">
                    ${(() => {
                        // Ordenar do mais recente para o mais antigo
                        const sorted = [...f.lancamentos].sort((a, b) => {
                            const [da, ma, ya] = (a.data || '').split('/').map(Number);
                            const [db, mb, yb] = (b.data || '').split('/').map(Number);
                            const dtA = new Date(ya, ma - 1, da);
                            const dtB = new Date(yb, mb - 1, db);
                            return dtB - dtA;
                        });
                        if (sorted.length === 0) return `<div class="cd-fatura-empty">Nenhum lançamento nesta fatura.</div>`;
                        return `<table class="cd-lancamentos-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Valor</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sorted.map(l => `
                                    <tr>
                                        <td style="white-space:nowrap;color:var(--text-secondary);">${l.data}</td>
                                        <td>
                                            <span style="color:#FFF;font-weight:600;">
                                                ${l.titulo}
                                                ${l.parcela ? `<span class="cd-lanc-parcela" style="margin-left:8px;">${l.parcela}</span>` : ''}
                                            </span>
                                        </td>
                                        <td style="color:var(--text-secondary);">${l.categoria}</td>
                                        <td class="${l.tipo === 'receita' ? 'cd-lanc-val-pos' : 'cd-lanc-val-neg'}">
                                            ${l.tipo === 'receita' ? '+' : '-'}${fmtCurrency(l.valor)}
                                        </td>
                                        <td>
                                            <div class="cd-actions-cell">
                                                <button class="cd-btn-icon-action" onclick="editLancamento('${f.id}', '${l.id}')" title="Editar">
                                                    <i data-lucide="pencil" style="width:14px;height:14px;"></i>
                                                </button>
                                                <button class="cd-btn-icon-action delete" onclick="deleteLancamento('${f.id}', '${l.id}')" title="Excluir">
                                                    <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>`).join('')}
                            </tbody>
                           </table>`;
                    })()}
                    <!-- Linha de total -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 22px;background:rgba(255,255,255,0.02);border-top:1px solid var(--border);margin-top:4px;">
                        <span style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">${f.lancamentos.length} lançamentos</span>
                        <span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:700;color:#FFF;">${fmtCurrency(lancsTotais)}</span>
                    </div>
                </div>
                ${pagamentoBadgeHTML}
            </div>
        </div>`;
}

function toggleFatura(id) {
    const body = document.getElementById('fatura-body-' + id);
    const chev = document.getElementById('chev-' + id);
    body.classList.toggle('open');
    chev.classList.toggle('open');
    // Atualiza estado de faturas abertas
    if (body.classList.contains('open')) {
        openFaturaIds.add(id);
    } else {
        openFaturaIds.delete(id);
    }
    lucide.createIcons();
}

// =============================================
//  MODAL PAGAR FATURA
// =============================================
function openPayModal(faturaId) {
    payFaturaId = faturaId;
    const f = faturas.find(x => x.id === faturaId);
    if (!f) return;

    document.getElementById('pay-modal-title').textContent = `Pagar Fatura — ${f.titulo}`;
    document.getElementById('pay-modal-sub').textContent = `Fatura de ${fmtCurrency(f.total)} com vencimento em ${f.vencimento}.`;
    document.getElementById('pay-fatura-id').value = faturaId;
    document.getElementById('pay-valor').value = 'R$ ' + f.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('pay-data').value = getTodayFormatted();
    document.getElementById('pay-conta').value = cartaoAtual.conta || '';
    document.getElementById('pay-modal').classList.add('active');
    lucide.createIcons();
}

function closePayModal() {
    document.getElementById('pay-modal').classList.remove('active');
    payFaturaId = null;
}

function handlePayModalClick(e) {
    if (e.target === document.getElementById('pay-modal')) closePayModal();
}

function confirmPagamento() {
    const valor = parseCurrencyStr(document.getElementById('pay-valor').value);
    const data  = document.getElementById('pay-data').value;
    const conta = document.getElementById('pay-conta').value;

    if (!valor || valor <= 0) { showToast('Informe o valor pago.', 'error'); return; }
    if (!data || data.length < 10) { showToast('Informe a data do pagamento.', 'error'); return; }
    if (!conta) { showToast('Selecione a conta debitada.', 'error'); return; }

    const f = faturas.find(x => x.id === payFaturaId);
    if (!f) return;

    // Registra lançamento
    const lancId = 'pagfat-' + Date.now();
    const novoLanc = {
        id: lancId,
        titulo: `Pagamento Fatura — ${cartaoAtual.nome} (${f.titulo})`,
        categoria: 'Cartão de Crédito',
        data,
        valor,
        valorStr: valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        tipo: 'despesa',
        status: 'Pago',
        conta,
        origem: 'pagamento_fatura',
        disabled: false,
        excludeFromReports: false
    };

    extraLancamentos.push(novoLanc);

    // Atualiza fatura
    f.status = 'fechada';
    f.pagamentoLancId = lancId;

    saveFaturas();
    closePayModal();
    showToast(`Pagamento registrado! Lançamento criado em Lançamentos.`, 'success');
    renderPage();
}

// =============================================
//  MODAL REABRIR FATURA
// =============================================
function openReopenModal(faturaId) {
    reopenFaturaId = faturaId;
    const f = faturas.find(x => x.id === faturaId);
    if (!f) return;

    document.getElementById('reopen-fatura-id').value = faturaId;
    document.getElementById('reopen-modal-sub').textContent = `Fatura de ${fmtCurrency(f.total)} — ${f.titulo}`;
    document.getElementById('reopen-modal').classList.add('active');
    lucide.createIcons();
}

function closeReopenModal() {
    document.getElementById('reopen-modal').classList.remove('active');
    reopenFaturaId = null;
}

function handleReopenModalClick(e) {
    if (e.target === document.getElementById('reopen-modal')) closeReopenModal();
}

function confirmReabrir() {
    const f = faturas.find(x => x.id === reopenFaturaId);
    if (!f) return;

    // Remove lançamento de pagamento se existir
    if (f.pagamentoLancId) {
        extraLancamentos = extraLancamentos.filter(l => l.id !== f.pagamentoLancId);
        f.pagamentoLancId = null;
    }

    f.status = 'aberta';
    saveFaturas();
    closeReopenModal();
    showToast('Fatura reaberta. O lançamento de pagamento foi removido.', 'success');
    renderPage();
}
// =============================================
//  MODAL NOVO/EDITAR LANÇAMENTO
// =============================================
const CATEGORY_ICONS = {
    'Alimentação': { icon: 'utensils', cor: '#F97316' },
    'Tecnologia':  { icon: 'laptop',   cor: '#8B5CF6' },
    'Transporte':  { icon: 'car',      cor: '#14B8A6' },
    'Saúde':       { icon: 'pill',     cor: '#22C55E' },
    'Educação':    { icon: 'book',     cor: '#3B82F6' },
    'Assinaturas': { icon: 'tv',       cor: '#EF4444' },
    'Compras':     { icon: 'shopping-cart', cor: '#EC4899' },
    'Lazer':       { icon: 'palmtree', cor: '#06B6D4' },
    'Outros':      { icon: 'tag',      cor: '#6366F1' },
    'Anuidade':    { icon: 'credit-card', cor: '#94A3B8' },
    'Taxas':       { icon: 'percent',  cor: '#94A3B8' },
    'Multa':       { icon: 'alert-triangle', cor: '#EF4444' },
    'Juros':       { icon: 'trending-up', cor: '#EF4444' },
    'Estorno':     { icon: 'refresh-ccw', cor: '#22C55E' },
    'Mercado':     { icon: 'shopping-bag', cor: '#F97316' },
    'Restaurante': { icon: 'utensils', cor: '#F97316' },
    'Investimento': { icon: 'trending-up', cor: '#10B981' }
};

function openLancamentoModal(faturaId, lancId = null) {
    const f = faturas.find(x => x.id === faturaId);
    if (!f) return;

    document.getElementById('edit-fatura-id').value = faturaId;
    document.getElementById('edit-lanc-id').value = lancId || '';

    // Popula categorias no select (se necessário dinamicamente, mas vamos fixo por enquanto no HTML)
    
    if (lancId) {
        // Editar
        const l = f.lancamentos.find(x => x.id === lancId);
        if (!l) return;
        document.getElementById('lanc-modal-title').textContent = 'Editar Lançamento';
        document.getElementById('lanc-titulo').value = l.titulo;
        document.getElementById('lanc-valor').value = 'R$ ' + l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        document.getElementById('lanc-data').value = l.data;
        document.getElementById('lanc-categoria').value = CATEGORY_ICONS[l.categoria] ? l.categoria : 'Outros';
        document.getElementById('lanc-parcela').value = l.parcela || '';
        document.querySelector(`input[name="lanc-tipo"][value="${l.tipo || 'despesa'}"]`).checked = true;
    } else {
        // Novo
        document.getElementById('lanc-modal-title').textContent = 'Novo Lançamento';
        document.getElementById('lanc-titulo').value = '';
        document.getElementById('lanc-valor').value = '';
        document.getElementById('lanc-data').value = getTodayFormatted();
        document.getElementById('lanc-categoria').value = 'Alimentação';
        document.getElementById('lanc-parcela').value = '';
        document.querySelector('input[name="lanc-tipo"][value="despesa"]').checked = true;
    }

    document.getElementById('lancamento-modal').classList.add('active');
    lucide.createIcons();
}

function closeLancamentoModal() {
    document.getElementById('lancamento-modal').classList.remove('active');
}

function handleLancamentoModalClick(e) {
    if (e.target === document.getElementById('lancamento-modal')) closeLancamentoModal();
}

function saveLancamento() {
    const fId = document.getElementById('edit-fatura-id').value;
    const lId = document.getElementById('edit-lanc-id').value;
    const f = faturas.find(x => x.id === fId);
    if (!f) return;

    const titulo = document.getElementById('lanc-titulo').value;
    const valor  = parseCurrencyStr(document.getElementById('lanc-valor').value);
    const data   = document.getElementById('lanc-data').value;
    const cat    = document.getElementById('lanc-categoria').value;
    const parc   = document.getElementById('lanc-parcela').value;
    const tipo   = document.querySelector('input[name="lanc-tipo"]:checked').value;

    if (!titulo) { showToast('Informe a descrição.', 'error'); return; }
    if (!valor || valor <= 0) { showToast('Informe o valor.', 'error'); return; }
    if (!data || data.length < 10) { showToast('Informe a data.', 'error'); return; }

    const mapping = CATEGORY_ICONS[cat] || CATEGORY_ICONS['Outros'];

    if (lId) {
        // Update
        const l = f.lancamentos.find(x => x.id === lId);
        if (l) {
            l.titulo = titulo;
            l.valor = valor;
            l.data = data;
            l.categoria = cat;
            l.parcela = parc || null;
            l.tipo = tipo;
            l.icon = mapping.icon;
            l.cor = mapping.cor;
        }
    } else {
        // Create
        const novo = {
            id: 'l' + Date.now(),
            titulo,
            valor,
            data,
            categoria: cat,
            parcela: parc || null,
            tipo,
            icon: mapping.icon,
            cor: mapping.cor
        };
        f.lancamentos.unshift(novo);
    }

    // Recalcula total da fatura
    f.total = f.lancamentos.reduce((acc, x) => {
        if (x.tipo === 'receita') return acc - x.valor;
        return acc + x.valor;
    }, 0);

    // Atualiza utilizado do cartão se for a fatura atual
    updateCardUtilizado(f);

    saveFaturas();
    closeLancamentoModal();
    showToast(lId ? 'Lançamento atualizado.' : 'Lançamento adicionado à fatura.', 'success');
    renderPage();
}

function updateCardUtilizado(fatura) {
    // Em teoria, o 'utilizado' do cartão é a soma das faturas abertas + parcelas futuras
    // Mas para o prototype, vamos apenas atualizar com base na fatura de Março 2026
    if (fatura.mes === '2026-03') {
        cartaoAtual.utilizado = fatura.total;
        
        // Atualiza na lista de cartões para persistir
        const stored = JSON.parse(localStorage.getItem('hub_cartoes') || '[]');
        const idx = stored.findIndex(c => c.id === cartaoAtual.id);
        if (idx !== -1) {
            stored[idx].utilizado = fatura.total;
            localStorage.setItem('hub_cartoes', JSON.stringify(stored));
        }
    }
}

function editLancamento(faturaId, lancId) {
    openLancamentoModal(faturaId, lancId);
}

function deleteLancamento(faturaId, lancId) {
    const f = faturas.find(x => x.id === faturaId);
    if (!f) return;
    const l = f.lancamentos.find(x => x.id === lancId);
    if (!l) return;

    document.getElementById('delete-fatura-id').value = faturaId;
    document.getElementById('delete-lanc-id').value = lancId;
    document.getElementById('delete-lanc-name').textContent = l.titulo;
    document.getElementById('delete-lanc-modal').classList.add('active');
    lucide.createIcons();
}

function closeDeleteLancModal() {
    document.getElementById('delete-lanc-modal').classList.remove('active');
}

function handleDeleteLancModalClick(e) {
    if (e.target === document.getElementById('delete-lanc-modal')) closeDeleteLancModal();
}

function confirmDeleteLancamento() {
    const fId = document.getElementById('delete-fatura-id').value;
    const lId = document.getElementById('delete-lanc-id').value;

    const f = faturas.find(x => x.id === fId);
    if (!f) return;

    f.lancamentos = f.lancamentos.filter(x => x.id !== lId);

    // Recalcula total
    f.total = f.lancamentos.reduce((acc, x) => {
        if (x.tipo === 'receita') return acc - x.valor;
        return acc + x.valor;
    }, 0);

    // Atualiza utilizado
    updateCardUtilizado(f);

    saveFaturas();
    closeDeleteLancModal();
    showToast('Lançamento removido da fatura.', 'success');
    renderPage();
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
    }, 3500);
}
