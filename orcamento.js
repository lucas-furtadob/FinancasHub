console.log('orcamento.js carregado');

const MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

const DEFAULT_CATEGORIES = [
    { id: 'da', nome: 'ALIMENTAÇÃO', tipo: 'despesa', paiId: null, icon: 'utensils', cor: '#EF4444', status: 'ativa' },
    { id: 'da1', nome: 'RESTAURANTE E LANCHES', tipo: 'despesa', paiId: 'da', icon: 'coffee', cor: '#EF4444', status: 'ativa' },
    { id: 'da2', nome: 'SUPERMERCADO', tipo: 'despesa', paiId: 'da', icon: 'shopping-cart', cor: '#EF4444', status: 'ativa' },
    { id: 'da3', nome: 'SUPLEMENTOS', tipo: 'despesa', paiId: 'da', icon: 'container', cor: '#EF4444', status: 'ativa' },
    { id: 'da4', nome: 'CLUBE IFOOD', tipo: 'despesa', paiId: 'da', icon: 'smartphone', cor: '#EF4444', status: 'ativa' },
    { id: 'da5', nome: 'ANUIDADE SAMS CLUB', tipo: 'despesa', paiId: 'da', icon: 'credit-card', cor: '#EF4444', status: 'ativa' },
    { id: 'dm', nome: 'MORADIA', tipo: 'despesa', paiId: null, icon: 'home', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm1', nome: 'ALUGUEL', tipo: 'despesa', paiId: 'dm', icon: 'key', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm2', nome: 'CONDOMÍNIO', tipo: 'despesa', paiId: 'dm', icon: 'building', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm3', nome: 'INTERNET FIXA', tipo: 'despesa', paiId: 'dm', icon: 'wifi', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm4', nome: 'LINHA MÓVEL', tipo: 'despesa', paiId: 'dm', icon: 'smartphone', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm5', nome: 'IPTU', tipo: 'despesa', paiId: 'dm', icon: 'file-text', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm6', nome: 'PRODUTOS / ITENS PARA CASA', tipo: 'despesa', paiId: 'dm', icon: 'shopping-bag', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm7', nome: 'ENERGIA ELÉTRICA', tipo: 'despesa', paiId: 'dm', icon: 'zap', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm8', nome: 'ÁGUA E ESGOTO', tipo: 'despesa', paiId: 'dm', icon: 'droplet', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm9', nome: 'GÁS', tipo: 'despesa', paiId: 'dm', icon: 'flame', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm10', nome: 'FAXINA / LIMPEZA', tipo: 'despesa', paiId: 'dm', icon: 'spray-can', cor: '#3B82F6', status: 'ativa' },
    { id: 'dm11', nome: 'DEDETIZAÇÃO', tipo: 'despesa', paiId: 'dm', icon: 'bug', cor: '#3B82F6', status: 'ativa' },
];

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let lancamentos = [];
let categorias = [];

function getMonthKey(mes, ano) {
    return `${ano}-${String(mes).padStart(2, '0')}`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPercent(value) {
    return `${Math.round(value)}%`;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    loadData();
    console.log('Data loaded, orcamentos:', getOrcamentos());
    updateMonthDisplay();
    renderOrcamentos();
    renderCopySourceMonths();
    setupEventListeners();
    lucide.createIcons();
    console.log('Setup complete');
});

const DEFAULT_ORCAMENTOS = [
    { id: 'orc_1', categoria_id: 'da', mes: 3, ano: 2026, valor_planejado: 1500, alerta_ativo: true, alerta_percentual: 80, status: 'ativa' },
    { id: 'orc_2', categoria_id: 'dm', mes: 3, ano: 2026, valor_planejado: 4000, alerta_ativo: true, alerta_percentual: 80, status: 'ativa' },
    { id: 'orc_3', categoria_id: 'dm1', mes: 3, ano: 2026, valor_planejado: 1800, alerta_ativo: false, alerta_percentual: 80, status: 'ativa' },
    { id: 'orc_4', categoria_id: 'dm7', mes: 3, ano: 2026, valor_planejado: 300, alerta_ativo: true, alerta_percentual: 70, status: 'ativa' },
    { id: 'orc_5', categoria_id: 'da2', mes: 3, ano: 2026, valor_planejado: 800, alerta_ativo: true, alerta_percentual: 80, status: 'ativa' },
    { id: 'orc_6', categoria_id: 'dm4', mes: 3, ano: 2026, valor_planejado: 150, alerta_ativo: false, alerta_percentual: 80, status: 'ativa' },
    { id: 'orc_7', categoria_id: 'dm3', mes: 3, ano: 2026, valor_planejado: 120, alerta_ativo: false, alerta_percentual: 80, status: 'ativa' },
];

const DEFAULT_LANCAMENTOS = [
    { id: 'l1', data_lancamento: '2026-03-05', descricao: 'Supermercado Extra', valor: '350.00', tipo_categoria: 'SAIDA', categoria_id: 'da2', conta_id: 'conta1' },
    { id: 'l2', data_lancamento: '2026-03-08', descricao: 'Aluguel Março', valor: '1800.00', tipo_categoria: 'SAIDA', categoria_id: 'dm1', conta_id: 'conta1' },
    { id: 'l3', data_lancamento: '2026-03-10', descricao: 'Conta de Luz', valor: '280.00', tipo_categoria: 'SAIDA', categoria_id: 'dm7', conta_id: 'conta1' },
    { id: 'l4', data_lancamento: '2026-03-12', descricao: 'Restaurante', valor: '85.00', tipo_categoria: 'SAIDA', categoria_id: 'da1', conta_id: 'conta1' },
    { id: 'l5', data_lancamento: '2026-03-15', descricao: 'Internet Vivo', valor: '120.00', tipo_categoria: 'SAIDA', categoria_id: 'dm3', conta_id: 'conta1' },
    { id: 'l6', data_lancamento: '2026-03-18', descricao: 'Supermercado', valor: '250.00', tipo_categoria: 'SAIDA', categoria_id: 'da2', conta_id: 'conta1' },
    { id: 'l7', data_lancamento: '2026-03-20', descricao: 'Lanche', valor: '45.00', tipo_categoria: 'SAIDA', categoria_id: 'da1', conta_id: 'conta1' },
    { id: 'l8', data_lancamento: '2026-03-22', descricao: 'Telefone', valor: '150.00', tipo_categoria: 'SAIDA', categoria_id: 'dm4', conta_id: 'conta1' },
    { id: 'l9', data_lancamento: '2026-03-25', descricao: 'Condomínio', valor: '650.00', tipo_categoria: 'SAIDA', categoria_id: 'dm2', conta_id: 'conta1' },
    { id: 'l10', data_lancamento: '2026-03-02', descricao: 'Supermercado', valor: '200.00', tipo_categoria: 'SAIDA', categoria_id: 'da2', conta_id: 'conta1' },
    { id: 'l11', data_lancamento: '2026-03-03', descricao: 'Farmácia', valor: '120.00', tipo_categoria: 'SAIDA', categoria_id: 'da', conta_id: 'conta1' },
    { id: 'l12', data_lancamento: '2026-03-06', descricao: 'Posto de Gasolina', valor: '200.00', tipo_categoria: 'SAIDA', categoria_id: 'da', conta_id: 'conta1' },
    { id: 'l13', data_lancamento: '2026-03-09', descricao: 'Academia', valor: '150.00', tipo_categoria: 'SAIDA', categoria_id: 'dm', conta_id: 'conta1' },
];

function loadData() {
    categorias = JSON.parse(localStorage.getItem('hub_categories')) || DEFAULT_CATEGORIES;
    lancamentos = JSON.parse(localStorage.getItem('hub_lancamentos')) || DEFAULT_LANCAMENTOS;
    
    if (!localStorage.getItem('hub_orcamentos')) {
        localStorage.setItem('hub_orcamentos', JSON.stringify(DEFAULT_ORCAMENTOS));
    }
    if (!localStorage.getItem('hub_categories')) {
        localStorage.setItem('hub_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem('hub_lancamentos')) {
        localStorage.setItem('hub_lancamentos', JSON.stringify(DEFAULT_LANCAMENTOS));
    }
}

function updateMonthDisplay() {
    const display = document.getElementById('display-month');
    display.textContent = `${MESES[currentMonth - 1]} ${currentYear}`;
}

window.changeMonth = function(delta, event) {
    if (event) event.stopPropagation();
    
    currentMonth += delta;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    } else if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    
    updateMonthDisplay();
    renderOrcamentos();
};

function getOrcamentos() {
    return JSON.parse(localStorage.getItem('hub_orcamentos')) || [];
}

function saveOrcamentos(orcamentos) {
    console.log('Salvando orçamentos:', orcamentos);
    localStorage.setItem('hub_orcamentos', JSON.stringify(orcamentos));
}

function getOrcamentosDoMes(mes, ano) {
    const orcamentos = getOrcamentos();
    return orcamentos.filter(o => 
        Number(o.mes) === Number(mes) && 
        Number(o.ano) === Number(ano) && 
        (o.status === 'ativa' || !o.status)
    );
}

function getGastoReal(categoriaId, mes, ano) {
    const mesStr = String(mes).padStart(2, '0');
    const dataInicio = `${ano}-${mesStr}-01`;
    const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0];
    
    const categoria = categorias.find(c => c.id === categoriaId);
    const categoriasIds = [categoriaId];
    
    if (categoria && !categoria.paiId) {
        const subs = categorias.filter(c => c.paiId === categoriaId);
        subs.forEach(s => categoriasIds.push(s.id));
    }
    
    return lancamentos
        .filter(l => {
            if (l.tipo_categoria !== 'SAIDA') return false;
            if (!categoriasIds.includes(l.categoria_id)) return false;
            return l.data_lancamento >= dataInicio && l.data_lancamento <= dataFim;
        })
        .reduce((sum, l) => sum + (parseFloat(l.valor) || 0), 0);
}

function getCategoriaById(id) {
    return categorias.find(c => c.id === id);
}

function renderOrcamentos() {
    console.log('Renderizando orçamentos para:', currentMonth, currentYear);
    const orcamentos = getOrcamentosDoMes(currentMonth, currentYear);
    console.log('Orçamentos encontrados:', orcamentos);
    
    const tbody = document.getElementById('orcamento-body');
    const emptyState = document.getElementById('empty-orcamento');
    const table = document.getElementById('orcamento-table');
    
    if (orcamentos.length === 0) {
        tbody.innerHTML = '';
        table.style.display = 'none';
        emptyState.style.display = 'flex';
        renderTotals(0, 0, 0);
        renderInsight([], []);
        return;
    }
    
    table.style.display = 'table';
    emptyState.style.display = 'none';
    
    let totalOrcado = 0;
    let totalGasto = 0;
    
    let html = '';
    orcamentos.forEach(orc => {
        const cat = getCategoriaById(orc.categoria_id);
        if (!cat) return;
        
        const gastoReal = getGastoReal(orc.categoria_id, currentMonth, currentYear);
        const restante = orc.valor_planejado - gastoReal;
        const percentual = orc.valor_planejado > 0 ? (gastoReal / orc.valor_planejado) * 100 : 0;
        
        totalOrcado += orc.valor_planejado;
        totalGasto += gastoReal;
        
        const isEstouro = gastoReal > orc.valor_planejado;
        const isAlerta = !isEstouro && orc.alerta_ativo && percentual >= orc.alerta_percentual;
        
        let progressColor = '#22C55E';
        if (percentual >= 100) progressColor = '#EF4444';
        else if (percentual >= 75) progressColor = '#F59E0B';
        
        let categoriaPaiNome = '';
        if (cat.paiId) {
            const pai = getCategoriaById(cat.paiId);
            if (pai) categoriaPaiNome = pai.nome;
        }
        
        html += `
            <tr class="${isEstouro ? 'orcamento-estouro' : ''}">
                <td>
                    <div style="display:flex;align-items:center;gap:12px;padding-left:10px;">
                        <div style="background:${cat.cor}20;color:${cat.cor};" class="cat-icon-container">
                            <i data-lucide="${cat.icon || 'tag'}"></i>
                        </div>
                        <div style="display:flex;flex-direction:column;">
                            <span class="cat-name-text">${cat.nome}</span>
                            ${categoriaPaiNome ? `<span class="cat-subtitle">${categoriaPaiNome}</span>` : ''}
                        </div>
                        ${isAlerta ? '<i data-lucide="alert-triangle" style="color:#F59E0B;width:16px;height:16px;" title="Alerta: limite aproximado"></i>' : ''}
                        ${isEstouro ? '<i data-lucide="alert-circle" style="color:#EF4444;width:16px;height:16px;" title="Orçamento estourado"></i>' : ''}
                    </div>
                </td>
                <td style="text-align:left;font-weight:600;${isEstouro ? 'color:#EF4444;' : ''}">
                    ${formatCurrency(gastoReal)}
                </td>
                <td style="text-align:left;">
                    ${formatCurrency(orc.valor_planejado)}
                </td>
                <td style="text-align:left;${restante < 0 ? 'color:#EF4444;' : 'color:#22C55E;'}">
                    ${formatCurrency(restante)}
                </td>
                <td style="text-align:center;">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width:${Math.min(percentual, 100)}%;background:${progressColor};"></div>
                        <span class="progress-percent">${formatPercent(percentual)}</span>
                    </div>
                </td>
                <td>
                    <div class="actions-cell">
                        <button type="button" class="action-btn" onclick="window.viewLancamentos('${orc.categoria_id}', ${currentMonth}, ${currentYear})" title="Ver lançamentos">
                            <i data-lucide="eye" style="pointer-events: none;"></i>
                        </button>
                        <button type="button" class="action-btn" onclick="window.editOrcamento('${orc.id}')" title="Editar orçamento">
                            <i data-lucide="pencil" style="pointer-events: none;"></i>
                        </button>
                        <button type="button" class="action-btn" onclick="window.confirmDeleteOrcamento('${orc.id}')" title="Excluir">
                            <i data-lucide="trash-2" style="pointer-events: none;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    lucide.createIcons();
    
    renderTotals(totalOrcado, totalGasto, totalOrcado - totalGasto);
    renderInsight(orcamentos, lancamentos);
}

function renderTotals(orcado, gasto, restante) {
    document.getElementById('total-orcado').textContent = formatCurrency(orcado);
    document.getElementById('total-gasto').textContent = formatCurrency(gasto);
    document.getElementById('total-restante').textContent = formatCurrency(restante);
    
    const percentual = orcado > 0 ? (gasto / orcado) * 100 : 0;
    document.getElementById('total-percentual').textContent = formatPercent(percentual);
    
    const statusIcon = document.getElementById('status-icon-card');
    if (percentual >= 100) {
        statusIcon.style.color = '#EF4444';
    } else if (percentual >= 75) {
        statusIcon.style.color = '#F59E0B';
    } else {
        statusIcon.style.color = '#22C55E';
    }
}

function renderInsight(orcamentos, lancamentos) {
    const insightText = document.getElementById('insight-text');
    
    if (orcamentos.length === 0) {
        insightText.textContent = 'Adicione categorias ao orçamento para gerar insights personalizados sobre seus gastos.';
        return;
    }
    
    const mesNome = MESES[currentMonth - 1];
    const totalOrcado = orcamentos.reduce((sum, o) => sum + o.valor_planejado, 0);
    const totalGasto = orcamentos.reduce((sum, o) => sum + getGastoReal(o.categoria_id, currentMonth, currentYear), 0);
    const percentual = totalOrcado > 0 ? (totalGasto / totalOrcado) * 100 : 0;
    
    const estouradas = orcamentos.filter(o => getGastoReal(o.categoria_id, currentMonth, currentYear) > o.valor_planejado);
    const alertas = orcamentos.filter(o => {
        const gasto = getGastoReal(o.categoria_id, currentMonth, currentYear);
        return o.alerta_ativo && gasto >= (o.alerta_percentual / 100) * o.valor_planejado && gasto <= o.valor_planejado;
    });
    
    let insights = [];
    
    if (percentual >= 100) {
        insights.push(`Você já estourou o orçamento de ${mesNome} (${formatPercent(percentual)}%).`);
    } else if (percentual >= 75) {
        insights.push(`Cuidado! Você já usou ${formatPercent(percentual)} do orçamento total.`);
    } else {
        insights.push(`Você está dentro do planejado, com ${formatPercent(percentual)} do orçamento utilizado.`);
    }
    
    if (estouradas.length > 0) {
        const nomes = estouradas.map(o => {
            const cat = getCategoriaById(o.categoria_id);
            return cat ? cat.nome : 'desconhecida';
        });
        insights.push(`Categorias estouradas: ${nomes.join(', ')}.`);
    }
    
    if (alertas.length > 0) {
        const nomes = alertas.map(o => {
            const cat = getCategoriaById(o.categoria_id);
            return cat ? cat.nome : 'desconhecida';
        });
        insights.push(`${nomes.join(', ')} estão próximas do limite.`);
    }
    
    if (percentual < 50 && estouradas.length === 0) {
        insights.push('Parabéns! Você estáコントロール bem suas finanças este mês.');
    }
    
    insightText.textContent = insights.join(' ');
}

function setupEventListeners() {
    console.log('Setup event listeners called');
    document.getElementById('orcamento-form').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        saveOrcamento();
    });
    
    document.getElementById('copy-budget-form').addEventListener('submit', function(e) {
        e.preventDefault();
        copyOrcamento();
    });
    
    document.getElementById('orcamento-alerta-ativo').addEventListener('change', function() {
        const group = document.getElementById('alerta-percentual-group');
        group.style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('categoria-search').addEventListener('focus', function() {
        filterCategorias(this.value);
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-select-container')) {
            document.getElementById('categoria-dropdown').style.display = 'none';
        }
    });
    
    const valorInput = document.getElementById('orcamento-valor');
    if (valorInput) {
        valorInput.oninput = function() {
            this.value = this.value.replace(/[^\d,]/g, '');
        };
        
        valorInput.onblur = function() {
            let value = this.value.replace(/[^\d]/g, '');
            if (value) {
                value = parseFloat(value) / 100;
                this.value = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        };
        
        valorInput.onfocus = function() {
            let value = this.value.replace(/[^\d]/g, '');
            if (value) {
                this.value = value;
            } else {
                this.value = '';
            }
        };
    }
}

function filterCategorias(query) {
    const dropdown = document.getElementById('categoria-dropdown');
    let despesas = categorias.filter(c => c.tipo === 'despesa' && c.status === 'ativa');
    
    if (query) {
        const q = query.toLowerCase();
        despesas = despesas.filter(c => c.nome.toLowerCase().includes(q));
    }
    
    const existingOrcamentos = getOrcamentosDoMes(currentMonth, currentYear);
    const existingIds = existingOrcamentos.map(o => o.categoria_id);
    
    const principais = despesas.filter(c => !c.paiId);
    const subcats = despesas.filter(c => c.paiId);
    
    if (despesas.length === 0) {
        dropdown.innerHTML = '<div class="search-select-no-results">Nenhuma categoria encontrada</div>';
    } else {
        let html = '';
        
        principais.forEach(cat => {
            const disabled = existingIds.includes(cat.id) ? 'disabled' : '';
            const text = existingIds.includes(cat.id) ? ' (já orçado)' : '';
            html += `
                <div class="search-select-option ${disabled}" data-id="${cat.id}" onclick="selectCategoria('${cat.id}', '${cat.nome.replace(/'/g, "\\'")}', '${cat.icon || 'tag'}', '${cat.cor}')" ${disabled}>
                    <i data-lucide="${cat.icon || 'tag'}" style="color:${cat.cor};width:16px;height:16px;"></i>
                    <span>${cat.nome}${text}</span>
                </div>
            `;
            
            const subcatsFiltradas = subcats.filter(s => s.paiId === cat.id);
            subcatsFiltradas.forEach(sub => {
                const disabledSub = existingIds.includes(sub.id) ? 'disabled' : '';
                const textSub = existingIds.includes(sub.id) ? ' (já orçado)' : '';
                html += `
                    <div class="search-select-option sub-item ${disabledSub}" data-id="${sub.id}" onclick="selectCategoria('${sub.id}', '${sub.nome.replace(/'/g, "\\'")}', '${sub.icon || 'tag'}', '${sub.cor}')" ${disabledSub}>
                        <i data-lucide="${sub.icon || 'tag'}" style="color:${sub.cor};width:14px;height:14px;margin-left:24px;"></i>
                        <span style="margin-left:4px;">${sub.nome}${textSub}</span>
                    </div>
                `;
            });
        });
        
        dropdown.innerHTML = html;
    }
    
    dropdown.style.display = 'block';
    lucide.createIcons();
}

window.selectCategoria = function(id, nome, icon, cor) {
    console.log('selectCategoria called:', id, nome);
    document.getElementById('orcamento-categoria-id').value = id;
    
    const searchInput = document.getElementById('categoria-search');
    searchInput.value = nome;
    searchInput.dataset.selectedId = id;
    searchInput.readOnly = true;
    searchInput.style.cursor = 'pointer';
    
    searchInput.onclick = function() {
        this.value = '';
        this.readOnly = false;
        this.dataset.selectedId = '';
        document.getElementById('orcamento-categoria-id').value = '';
        filterCategorias('');
    };
    
    document.getElementById('categoria-dropdown').style.display = 'none';
};

window.openOrcamentoModal = function(id = null) {
    document.getElementById('modal-orcamento-title').innerText = id ? 'Editar Orçamento' : 'Novo Orçamento';
    document.getElementById('orcamento-form').reset();
    document.getElementById('orcamento-id').value = '';
    document.getElementById('orcamento-categoria-id').value = '';
    
    const catSearch = document.getElementById('categoria-search');
    if (catSearch) {
        catSearch.style.display = 'block';
        catSearch.value = '';
        catSearch.readOnly = false;
        catSearch.onclick = null;
    }
    
    const alertaGroup = document.getElementById('alerta-percentual-group');
    if (alertaGroup) {
        alertaGroup.style.display = 'none';
    }
    
    const alertaAtivo = document.getElementById('orcamento-alerta-ativo');
    if (alertaAtivo) {
        alertaAtivo.checked = false;
    }
    
    if (id) {
        const orcamentos = getOrcamentos();
        const orc = orcamentos.find(o => o.id === id);
        if (orc) {
            document.getElementById('orcamento-id').value = orc.id;
            document.getElementById('orcamento-categoria-id').value = orc.categoria_id;
            
            const cat = getCategoriaById(orc.categoria_id);
            if (cat) {
                const catSearch = document.getElementById('categoria-search');
                if (catSearch) {
                    catSearch.value = cat.nome;
                    catSearch.readOnly = true;
                    catSearch.style.cursor = 'not-allowed';
                    catSearch.title = 'Categoria não pode ser alterada na edição';
                    catSearch.onclick = null;
                }
            }
            
            const valorInput = document.getElementById('orcamento-valor');
            if (valorInput) {
                valorInput.value = orc.valor_planejado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            
            const alertaAtivo = document.getElementById('orcamento-alerta-ativo');
            if (alertaAtivo) {
                alertaAtivo.checked = orc.alerta_ativo;
            }
            
            if (orc.alerta_ativo) {
                const alertaGroup = document.getElementById('alerta-percentual-group');
                if (alertaGroup) {
                    alertaGroup.style.display = 'block';
                }
                const alertaPerc = document.getElementById('orcamento-alerta-percentual');
                if (alertaPerc) {
                    alertaPerc.value = orc.alerta_percentual;
                }
            }
        }
    }
    
    document.getElementById('orcamento-modal').style.display = 'flex';
};

window.editOrcamento = window.openOrcamentoModal;

window.closeOrcamentoModal = function() {
    document.getElementById('orcamento-modal').style.display = 'none';
};

function saveOrcamento() {
    console.log('saveOrcamento called');
    const id = document.getElementById('orcamento-id')?.value || '';
    let categoriaId = document.getElementById('orcamento-categoria-id')?.value || '';
    
    if (!categoriaId) {
        const searchInput = document.getElementById('categoria-search');
        if (searchInput?.dataset?.selectedId) {
            categoriaId = searchInput.dataset.selectedId;
        }
    }
    
    const valorInput = document.getElementById('orcamento-valor')?.value || '0';
    const valorStr = valorInput.replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(valorStr) || 0;
    const alertaAtivo = document.getElementById('orcamento-alerta-ativo')?.checked || false;
    const alertaPercentual = parseInt(document.getElementById('orcamento-alerta-percentual')?.value) || 80;
    
    console.log('Values:', { id, categoriaId, valor, valorInput, alertaAtivo, alertaPercentual });
    
    if (!categoriaId) {
        showToast('Selecione uma categoria');
        console.log('No categoria selected');
        return;
    }
    
    if (valor < 0) {
        showToast('O valor deve ser maior ou igual a zero');
        return;
    }
    
    if (alertaAtivo && (alertaPercentual <= 0 || alertaPercentual > 100)) {
        showToast('O percentual de alerta deve estar entre 1 e 100');
        return;
    }
    
    let orcamentos = getOrcamentos();
    
    if (id) {
        const idx = orcamentos.findIndex(o => o.id === id);
        if (idx !== -1) {
            orcamentos[idx].valor_planejado = valor;
            orcamentos[idx].alerta_ativo = alertaAtivo;
            orcamentos[idx].alerta_percentual = alertaPercentual;
        }
    } else {
        const exists = orcamentos.find(o => 
            o.categoria_id === categoriaId && 
            o.mes === currentMonth && 
            o.ano === currentYear && 
            o.status === 'ativa'
        );
        
        if (exists) {
            showToast('Já existe um orçamento ativo para esta categoria neste mês');
            return;
        }
        
        const newOrcamento = {
            id: 'orc_' + Date.now(),
            categoria_id: categoriaId,
            mes: currentMonth,
            ano: currentYear,
            valor_planejado: valor,
            alerta_ativo: alertaAtivo,
            alerta_percentual: alertaPercentual,
            status: 'ativa'
        };
        
        orcamentos.push(newOrcamento);
    }
    
    saveOrcamentos(orcamentos);
    closeOrcamentoModal();
    renderOrcamentos();
    showToast(id ? 'Orçamento atualizado!' : 'Orçamento criado!');
}

window.toggleOrcamentoStatus = function(id) {
    let orcamentos = getOrcamentos();
    const idx = orcamentos.findIndex(o => o.id === id);
    
    if (idx !== -1) {
        const newStatus = orcamentos[idx].status === 'ativa' ? 'arquivado' : 'ativa';
        orcamentos[idx].status = newStatus;
        saveOrcamentos(orcamentos);
        renderOrcamentos();
        showToast(newStatus === 'ativa' ? 'Orçamento ativado!' : 'Orçamento arquivado!');
    }
};

window.confirmDeleteOrcamento = function(id) {
    const orcamentos = getOrcamentos();
    const orc = orcamentos.find(o => o.id === id);
    if (!orc) return;
    
    const modal = document.getElementById('delete-orcamento-modal');
    modal.style.display = 'flex';
    
    document.getElementById('confirm-delete-orcamento-btn').onclick = function() {
        const updated = orcamentos.filter(o => o.id !== id);
        saveOrcamentos(updated);
        closeDeleteOrcamentoModal();
        renderOrcamentos();
        showToast('Orçamento excluído!');
    };
};

window.closeDeleteOrcamentoModal = function() {
    document.getElementById('delete-orcamento-modal').style.display = 'none';
};

function renderCopySourceMonths() {
    const select = document.getElementById('copy-source-month');
    const orcamentos = getOrcamentos();
    
    const mesesComOrcamento = [];
    orcamentos.forEach(o => {
        const key = `${o.ano}-${o.mes}`;
        if (!mesesComOrcamento.includes(key)) {
            mesesComOrcamento.push(key);
        }
    });
    
    mesesComOrcamento.sort((a, b) => b.localeCompare(a));
    
    const currentKey = getMonthKey(currentMonth, currentYear);
    const options = mesesComOrcamento
        .filter(key => key !== currentKey)
        .map(key => {
            const [ano, mes] = key.split('-');
            return `<option value="${key}">${MESES[parseInt(mes) - 1]} ${ano}</option>`;
        });
    
    if (options.length === 0) {
        select.innerHTML = '<option value="">Nenhum orçamento para copiar</option>';
    } else {
        select.innerHTML = '<option value="">Selecione...</option>' + options.join('');
    }
}

window.openCopyBudgetModal = function() {
    renderCopySourceMonths();
    document.getElementById('copy-budget-form').reset();
    document.getElementById('copy-budget-modal').style.display = 'flex';
};

window.closeCopyBudgetModal = function() {
    document.getElementById('copy-budget-modal').style.display = 'none';
};

function copyOrcamento() {
    const sourceKey = document.getElementById('copy-source-month').value;
    const overwrite = document.getElementById('copy-overwrite').checked;
    
    if (!sourceKey) {
        showToast('Selecione um mês de origem');
        return;
    }
    
    const [sourceAno, sourceMes] = sourceKey.split('-').map(Number);
    
    let orcamentosSource = JSON.parse(localStorage.getItem('hub_orcamentos')) || [];
    orcamentosSource = orcamentosSource.filter(o => 
        o.mes === sourceMes && 
        o.ano === sourceAno && 
        o.status === 'ativa'
    );
    
    if (orcamentosSource.length === 0) {
        showToast('Nenhum orçamento encontrado no mês de origem');
        return;
    }
    
    let orcamentosDestino = getOrcamentos();
    
    if (!overwrite) {
        const existingIds = orcamentosDestino
            .filter(o => o.mes === currentMonth && o.ano === currentYear)
            .map(o => o.categoria_id);
        
        orcamentosSource = orcamentosSource.filter(o => !existingIds.includes(o.categoria_id));
    } else {
        orcamentosDestino = orcamentosDestino.filter(o => 
            !(o.mes === currentMonth && o.ano === currentYear)
        );
    }
    
    orcamentosSource.forEach(o => {
        orcamentosDestino.push({
            id: 'orc_' + Date.now() + Math.random().toString(36).substr(2, 9),
            categoria_id: o.categoria_id,
            mes: currentMonth,
            ano: currentYear,
            valor_planejado: o.valor_planejado,
            alerta_ativo: o.alerta_ativo,
            alerta_percentual: o.alerta_percentual,
            status: 'ativa'
        });
    });
    
    saveOrcamentos(orcamentosDestino);
    closeCopyBudgetModal();
    renderOrcamentos();
    renderCopySourceMonths();
    showToast(`${orcamentosSource.length} orçamento(s) copiado(s)!`);
}

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

window.viewLancamentos = function(categoriaId, mes, ano) {
    const cat = getCategoriaById(categoriaId);
    const catNome = cat ? cat.nome : categoriaId;
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0];
    const url = `index.html?categoria=${encodeURIComponent(catNome)}&dataInicio=${dataInicio}&dataFim=${dataFim}&tipo=SAIDA`;
    window.location.href = url;
};

window.filterCategorias = filterCategorias;
window.selectCategoria = selectCategoria;
