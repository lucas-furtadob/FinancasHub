let contas = [
    { id: 'c1', nome: 'Nubank PJ', banco: '260 - Nubank', tipo: 'Conta Corrente', saldo: 15400.00, saldoPrevisto: 18400.00, situacao: 'Ativa', principal: true, cor: '#8B5CF6' },
    { id: 'c2', nome: 'Banco do Brasil S.A.', banco: '001 - Banco do Brasil', tipo: 'Conta Corrente', saldo: 1250.75, saldoPrevisto: 520.00, situacao: 'Ativa', principal: false, cor: '#3B82F6' },
    { id: 'c3', nome: 'Caixa Econômica', banco: '104 - Caixa Econômica', tipo: 'Poupança', saldo: 50.00, saldoPrevisto: 50.00, situacao: 'Inativa', principal: false, cor: '#3B82F6' }
];

let activeFilterTipo = 'todos';
let activeSearchStr = '';
let editContaId = null;
let deleteContaId = null;
let popoverContaId = null;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderContas();
});

// Sidebar
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ic = document.getElementById('toggle-icon');
    sb.classList.toggle('collapsed');
    if (sb.classList.contains('collapsed')) {
        ic.setAttribute('data-lucide', 'chevron-right');
        document.querySelectorAll('.submenu-wrapper').forEach(w => {
            w.style.display = 'none';
        });
        document.querySelectorAll('.chevron').forEach(c => c.classList.remove('rotated'));
    } else {
        ic.setAttribute('data-lucide', 'chevron-left');
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
        chev.classList.remove('rotated');
    } else {
        w.style.display = 'block';
        chev.classList.add('rotated');
    }
}

// Format Currency
function fmtCurrency(val) {
    return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseCurrencyStr(str) {
    if (!str) return 0;
    let s = str.replace(/[R$\s\.]/g, '').replace(',', '.');
    return parseFloat(s) || 0;
}
function maskCurrency(input) {
    let value = input.value.replace(/\D/g, "");
    if (!value) { input.value = ''; return; }
    value = (parseInt(value) / 100).toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    input.value = "R$ " + value;
}
function maskNumber(input) {
    input.value = input.value.replace(/\D/g, '');
}
function maskDate(input) {
    let raw = input.value.replace(/\D/g, '').substring(0, 8);
    if (raw.length >= 5) raw = raw.substring(0,2) + '/' + raw.substring(2,4) + '/' + raw.substring(4);
    else if (raw.length >= 3) raw = raw.substring(0,2) + '/' + raw.substring(2);
    input.value = raw;
}
function setDateFromNative(nativeInput, textId) {
    const v = nativeInput.value;
    if (!v) return;
    const [y, m, d] = v.split('-');
    document.getElementById(textId).value = `${d}/${m}/${y}`;
}

// Rendering
function renderContas() {
    const tbody = document.getElementById('contas-tbody');
    tbody.innerHTML = '';
    
    let filtered = contas;
    
    if (activeFilterTipo !== 'todos') {
        const tMap = { 'corrente': 'Conta Corrente', 'poupanca': 'Conta Poupança', 'investimento': 'Conta Investimento' };
        filtered = filtered.filter(c => c.tipo === tMap[activeFilterTipo]);
    }
    
    if (activeSearchStr) {
        const s = activeSearchStr.toLowerCase();
        filtered = filtered.filter(c => c.nome.toLowerCase().includes(s) || c.tipo.toLowerCase().includes(s));
    }
    
    let tGeral = 0, tCor = 0, tInv = 0;
    contas.forEach(c => {
        tGeral += c.saldo;
        if (c.tipo === 'Conta Corrente') tCor += c.saldo;
        if (c.tipo === 'Conta Poupança' || c.tipo === 'Conta Investimento') tInv += c.saldo;
    });
    
    document.getElementById('tot-geral').innerText = fmtCurrency(tGeral);
    document.getElementById('tot-corrente').innerText = fmtCurrency(tCor);
    document.getElementById('tot-invest').innerText = fmtCurrency(tInv);
    document.getElementById('tot-contas').innerText = `${contas.length} contas cadastradas`;
    
    if (filtered.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="padding:48px 24px;text-align:center;color:var(--text-muted);"><i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:16px;opacity:0.5;"></i><br/>Nenhuma conta encontrada.</td>`;
        tbody.appendChild(tr);
        lucide.createIcons();
        return;
    }
    
    filtered.forEach(c => {
        const bancoSimples = c.banco && c.banco.includes(' - ') ? c.banco.split(' - ')[1] : (c.banco || '');
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #1F1F23';
        tr.innerHTML = `
            <td style="padding:16px 24px;">
                <span style="color:var(--text-secondary);font-size:14px;">${bancoSimples}</span>
            </td>
            <td style="padding:16px 24px;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:10px;height:10px;border-radius:50%;background:${c.cor || '#ADADB0'}"></div>
                    <span style="font-weight:600;color:#FFF;">${c.nome}</span>
                    ${c.principal ? '<i data-lucide="star" style="width:14px;height:14px;fill:var(--warning);stroke:var(--warning);"></i>' : ''}
                </div>
            </td>
            <td style="padding:16px 24px;" class="valor-mono">
                ${fmtCurrency(c.saldo)}
            </td>
            <td style="padding:16px 24px;color:var(--text-secondary);" class="valor-mono">
                ${fmtCurrency(c.saldoPrevisto || c.saldo)}
            </td>
            <td style="padding:16px 24px;">
                <span style="background:${c.situacao === 'Ativa' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)'};color:${c.situacao === 'Ativa' ? 'var(--success)' : 'var(--text-muted)'};padding:4px 10px;border-radius:100px;font-size:12px;font-weight:600;">${c.situacao}</span>
            </td>
            <td style="padding:16px 24px;">
                <div style="display:flex;align-items:center;gap:2px;justify-content:flex-start;">
                    <button class="action-icon-btn" title="Editar" onclick="openContaModal('${c.id}')"><i data-lucide="pencil"></i></button>
                    <button class="action-icon-btn" title="${c.situacao === 'Ativa' ? 'Desativar' : 'Ativar'}" onclick="toggleContaStatus('${c.id}')"><i data-lucide="power"></i></button>
                    <button class="action-icon-btn action-danger" title="Excluir" onclick="openDeleteModal('${c.id}')"><i data-lucide="trash-2"></i></button>
                    <button class="action-icon-btn" title="Menu Opções" onclick="toggleMenuOpcoes(event, '${c.id}')"><i data-lucide="more-vertical"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
}

// Filters & Search
function filterByTipo(el, tipo) {
    document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    activeFilterTipo = tipo;
    renderContas();
}
function filterSearch(val) {
    activeSearchStr = val;
    renderContas();
}

// Modals
function openContaModal(id = null) {
    editContaId = id;
    document.getElementById('conta-modal').style.display = 'flex';
    document.getElementById('c-id').value = '';
    document.getElementById('c-nome').value = '';
    try { document.getElementById('c-tipo').selectedIndex = 0; } catch(e){}
    document.getElementById('c-banco').selectedIndex = 0;
    document.getElementById('c-agencia').value = '';
    document.getElementById('c-conta-num').value = '';
    document.getElementById('c-saldo').value = '';
    document.getElementById('c-data-saldo').value = '';
    document.getElementById('c-obs').value = '';
    document.getElementById('c-principal').checked = false;
    selectColor(document.querySelector('.color-opt'), '#EF4444');

    if (id) {
        document.getElementById('conta-modal-title').innerText = 'Editar conta';
        const c = contas.find(x => x.id === id);
        if (c) {
            document.getElementById('c-id').value = id;
            document.getElementById('c-nome').value = c.nome;
            document.getElementById('c-saldo').value = fmtCurrency(c.saldo);
            
            // Safe assignment for dropdowns
            let optsTipo = document.getElementById('c-tipo').options;
            for(let i=0; i<optsTipo.length; i++) {
                if(optsTipo[i].value === c.tipo) { document.getElementById('c-tipo').selectedIndex = i; break; }
            }
            // Set mock new fields if they existed on c
            if(c.banco) {
                let optsBanco = document.getElementById('c-banco').options;
                for(let i=0; i<optsBanco.length; i++) {
                    if(optsBanco[i].value === c.banco) { document.getElementById('c-banco').selectedIndex = i; break; }
                }
            }
            document.getElementById('c-agencia').value = c.agencia || '';
            document.getElementById('c-conta-num').value = c.contaNum || '';
            document.getElementById('c-data-saldo').value = c.dataSaldo || '';
            document.getElementById('c-obs').value = c.obs || '';

            document.getElementById('c-principal').checked = c.principal;
            
            // set color
            const matchOpt = Array.from(document.querySelectorAll('.color-opt')).find(o => o.getAttribute('onclick').includes(c.cor.toUpperCase()));
            if (matchOpt) selectColor(matchOpt, c.cor);
            else selectColor(document.querySelector('.color-opt'), c.cor);
        }
    } else {
        document.getElementById('conta-modal-title').innerText = 'Nova Conta Financeira';
    }
}
function closeContaModal() {
    document.getElementById('conta-modal').style.display = 'none';
}
function selectColor(el, color) {
    document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('c-cor').value = color;
}

function saveConta() {
    const nome = document.getElementById('c-nome').value;
    const tipo = document.getElementById('c-tipo').value;
    const banco = document.getElementById('c-banco').value;
    const agencia = document.getElementById('c-agencia').value;
    const contaNum = document.getElementById('c-conta-num').value;
    const saldo = parseCurrencyStr(document.getElementById('c-saldo').value);
    const dataSaldo = document.getElementById('c-data-saldo').value;
    const obs = document.getElementById('c-obs').value;
    const principal = document.getElementById('c-principal').checked;
    const cor = document.getElementById('c-cor').value;

    if (!nome || !tipo) { showToast('Preencha os campos obrigatórios!', 'danger'); return; }

    if (principal) {
        contas.forEach(c => c.principal = false);
    }

    if (editContaId) {
        const c = contas.find(x => x.id === editContaId);
        c.nome = nome; c.tipo = tipo; c.banco = banco; c.agencia = agencia; c.contaNum = contaNum;
        c.saldo = saldo; c.dataSaldo = dataSaldo; c.obs = obs;
        c.principal = principal; c.cor = cor;
        showToast('Conta atualizada!');
    } else {
        contas.push({
            id: Date.now().toString(),
            nome, tipo, banco, agencia, contaNum, saldo, dataSaldo, obs, principal, cor, situacao: 'Ativa'
        });
        showToast('Conta cadastrada com sucesso!');
    }

    closeContaModal();
    renderContas();
}

function toggleContaStatus(id) {
    const c = contas.find(x => x.id === id);
    if (!c) return;
    if (c.situacao === 'Ativa') {
        c.situacao = 'Inativa';
        showToast('Conta desativada.');
    } else {
        c.situacao = 'Ativa';
        showToast('Conta reativada!');
    }
    renderContas();
}

function openDeleteModal(id) {
    if (contas.length === 1) { showToast('Não é possível apagar a única conta do sistema.', 'danger'); return; }
    deleteContaId = id;
    document.getElementById('delete-conta-modal').style.display = 'flex';
}
function closeDeleteContaModal() {
    document.getElementById('delete-conta-modal').style.display = 'none';
}
function confirmDeleteConta() {
    if (deleteContaId) {
        contas = contas.filter(c => c.id !== deleteContaId);
        showToast('Conta excluída.');
        closeDeleteContaModal();
        renderContas();
    }
}

// Popover Logic
function toggleMenuOpcoes(e, id) {
    const popover = document.getElementById('acoes-popover');
    if (popoverContaId === id && !popover.classList.contains('hidden')) {
        popover.classList.add('hidden');
        popoverContaId = null;
    } else {
        popoverContaId = id;
        popover.classList.remove('hidden');
        
        const rect = e.currentTarget.getBoundingClientRect();
        popover.style.top = (rect.bottom + window.scrollY + 4) + 'px';
        popover.style.left = (rect.left + window.scrollX - 120) + 'px';
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#acoes-popover') && !e.target.closest('button[title="Menu Opções"]')) {
        const p = document.getElementById('acoes-popover');
        if (p) p.classList.add('hidden');
    }
});

function verTransacoesPopover() {
    if (!popoverContaId) return;
    const c = contas.find(x => x.id === popoverContaId);
    if (c) {
        window.location.href = 'index.html?conta_filter=' + encodeURIComponent(c.nome);
    }
    document.getElementById('acoes-popover').classList.add('hidden');
}

function openAjusteModalPopover() {
    if (!popoverContaId) return;
    const c = contas.find(x => x.id === popoverContaId);
    if (!c) return;
    
    document.getElementById('ajuste-conta-id').value = c.id;
    document.getElementById('ajuste-saldo-atual').innerText = fmtCurrency(c.saldo);
    document.getElementById('ajuste-valor').value = '';
    document.getElementById('ajuste-desc').value = '';
    selectAjusteTipo('transacao');
    
    document.getElementById('ajuste-modal').style.display = 'flex';
    document.getElementById('acoes-popover').classList.add('hidden');
}

function selectAjusteTipo(tipo) {
    document.getElementById('opt-transacao').classList.remove('active');
    document.getElementById('opt-modificar').classList.remove('active');
    document.getElementById('opt-' + tipo).classList.add('active');
}

function closeAjusteModal() {
    document.getElementById('ajuste-modal').style.display = 'none';
}

function saveAjuste() {
    const id = document.getElementById('ajuste-conta-id').value;
    const valText = document.getElementById('ajuste-valor').value;
    const val = parseCurrencyStr(valText);
    
    if (!valText || val < 0) {
        showToast('Informe um valor válido para o ajuste.', 'danger');
        return;
    }
    
    const c = contas.find(x => x.id === id);
    if (!c) return;
    
    c.saldo = val; 
    renderContas();
    closeAjusteModal();
    showToast('Reajuste de saldo efetuado!');
}

// Toast
function showToast(msg, type='success') {
    const tc = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-hidden';
    toast.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.style.color = '#FFF';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
    toast.style.transition = 'all 0.3s ease-out';
    
    toast.innerHTML = `<i data-lucide="${type==='success'?'check-circle':'alert-circle'}" style="width:18px;height:18px;"></i> ${msg}`;
    tc.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => { toast.classList.remove('toast-hidden'); toast.classList.add('toast-visible'); }, 50);
    setTimeout(() => { 
        toast.classList.remove('toast-visible'); toast.classList.add('toast-hidden');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
