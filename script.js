// ==================== EXPORT FUNCTIONS ====================
function toggleExportMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('export-menu');
    if (menu) menu.classList.toggle('hidden');
}

document.addEventListener('click', function() {
    const menu = document.getElementById('export-menu');
    if (menu) menu.classList.add('hidden');
});

function exportData(format) {
    const menu = document.getElementById('export-menu');
    if (menu) menu.classList.add('hidden');
    
    const currentMonth = document.getElementById('display-month')?.innerText || '';
    const filteredTransactions = transactions.filter(t => {
        if (t.disabled) return false;
        return true;
    });
    
    if (filteredTransactions.length === 0) {
        showToastError('Nenhum lançamento para exportar.');
        return;
    }
    
    const headers = ['Data', 'Título', 'Categoria', 'Conta', 'Status', 'Tipo', 'Valor'];
    const rows = filteredTransactions.map(t => [
        t.data || '',
        t.titulo || '',
        t.categoria || '',
        t.conta || '',
        t.status || '',
        t.tipo || '',
        t.valor || 0
    ]);
    
    if (format === 'csv') {
        exportToCSV(headers, rows, `lancamentos_${currentMonth}.csv`);
    } else if (format === 'xls') {
        exportToXLS(headers, rows, `lancamentos_${currentMonth}.xls`);
    } else if (format === 'pdf') {
        exportToPDF(headers, rows, `lancamentos_${currentMonth}.pdf`);
    }
}

function exportToCSV(headers, rows, filename) {
    const BOM = '\uFEFF';
    const csvContent = BOM + headers.join(';') + '\n' + rows.map(row => 
        row.map(cell => {
            const str = String(cell);
            return str.includes(';') || str.includes('"') || str.includes('\n') 
                ? `"${str.replace(/"/g, '""')}"` 
                : str;
        }).join(';')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
}

function exportToXLS(headers, rows, filename) {
    let xlsContent = '<?xml version="1.0" encoding="UTF-8"?>';
    xlsContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    xlsContent += '<Worksheet ss:Name="Lançamentos"><Table>';
    
    xlsContent += '<Row>' + headers.map(h => `<Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`).join('') + '</Row>';
    
    rows.forEach(row => {
        xlsContent += '<Row>';
        row.forEach((cell, idx) => {
            const type = idx === 6 ? 'Number' : 'String';
            xlsContent += `<Cell><Data ss:Type="${type}">${escapeXML(String(cell))}</Data></Cell>`;
        });
        xlsContent += '</Row>';
    });
    
    xlsContent += '</Table></Worksheet></Workbook>';
    
    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    downloadBlob(blob, filename);
}

function exportToPDF(headers, rows, filename) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        showToastError('Biblioteca jsPDF não carregada. Use CSV ou Excel.');
        return;
    }
    
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Lançamentos Financeiros', 14, 20);
    
    doc.setFontSize(10);
    const now = new Date().toLocaleDateString('pt-BR');
    doc.text(`Exportado em: ${now}`, 14, 28);
    
    const startY = 35;
    const colWidths = [25, 60, 30, 40, 20, 20, 25];
    const startX = 14;
    
    doc.setFillColor(30, 30, 30);
    doc.rect(startX, startY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    
    let currentX = startX;
    headers.forEach((header, i) => {
        doc.text(header, currentX + 2, startY + 5.5);
        currentX += colWidths[i];
    });
    
    doc.setTextColor(0, 0, 0);
    let currentY = startY + 10;
    
    rows.forEach((row, rowIndex) => {
        if (rowIndex % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(startX, currentY - 4, 182, 8, 'F');
        }
        
        currentX = startX;
        row.forEach((cell, i) => {
            const text = String(cell).substring(0, colWidths[i] / 2.5);
            if (i === 5) {
                doc.setTextColor(cell === 'receita' ? 34 : 239, cell === 'receita' ? 197 : 68, cell === 'receita' ? 94 : 68);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(text, currentX + 2, currentY);
            currentX += colWidths[i];
        });
        
        currentY += 8;
        
        if (currentY > 280) {
            doc.addPage();
            currentY = 20;
        }
    });
    
    doc.save(filename);
}

function escapeXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast(`${filename} exportado com sucesso!`);
}

// ==================== IMPORT - CSV PARSER ====================
function parseCSV(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const firstLine = lines[0];
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = semicolonCount >= commaCount ? ';' : ',';
    
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
        const values = [];
        let current = '', inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') { inQuotes = !inQuotes; }
            else if (char === delimiter && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else { current += char; }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        return values;
    });
    
    return { headers, rows };
}

// ==================== IMPORT - OFX PARSER ====================
function parseOFX(content) {
    const transactions = [];
    
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;
    
    while ((match = stmtTrnRegex.exec(content)) !== null) {
        const trn = match[1];
        const getTag = (tag) => {
            const regex = new RegExp(`<${tag}>([^<\\n]+)`, 'i');
            const m = trn.match(regex);
            return m ? m[1].trim() : '';
        };
        
        const dtposted = getTag('DTPOSTED');
        const trnamt = getTag('TRNAMT');
        const name = getTag('NAME') || getTag('MEMO') || '';
        const memo = getTag('MEMO') || '';
        
        if (!dtposted || !trnamt) continue;
        
        let data = '';
        const dateMatch = dtposted.match(/(\d{4})(\d{2})(\d{2})/);
        if (dateMatch) {
            data = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
        } else if (dtposted.length >= 8) {
            const yyyy = dtposted.substring(0, 4);
            const mm = dtposted.substring(4, 6);
            const dd = dtposted.substring(6, 8);
            data = `${dd}/${mm}/${yyyy}`;
        }
        
        const valor = parseFloat(trnamt.replace(/[+-]/, ''));
        const titulo = name || memo || 'Lançamento importado';
        
        transactions.push({
            data,
            valor,
            valorStr: Math.abs(valor).toFixed(2).replace('.', ','),
            titulo: titulo.substring(0, 100),
            tipo: valor >= 0 ? 'receita' : 'despesa',
            status: valor >= 0 ? 'Recebido' : 'Pago',
            origem: 'sincronizado'
        });
    }
    
    if (transactions.length === 0) {
        const simpleMatch = /<TRNAMT>([+-]?[\d.,]+)<\/TRNAMT>[\s\S]*?<DTPOSTED>(\d{8,})/gi;
        let simpleExec;
        while ((simpleExec = simpleMatch.exec(content)) !== null) {
            const trnamt = simpleExec[1];
            const dtposted = simpleExec[2];
            
            if (!dtposted || !trnamt) continue;
            
            let data = '';
            const dateMatch = dtposted.match(/(\d{4})(\d{2})(\d{2})/);
            if (dateMatch) {
                data = `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}`;
            }
            
            const valor = parseFloat(trnamt.replace(/[+-]/, ''));
            
            transactions.push({
                data,
                valor,
                valorStr: Math.abs(valor).toFixed(2).replace('.', ','),
                titulo: 'Lançamento importado',
                tipo: valor >= 0 ? 'receita' : 'despesa',
                status: valor >= 0 ? 'Recebido' : 'Pago',
                origem: 'sincronizado'
            });
        }
    }
    
    return transactions;
}

// ==================== IMPORT - VALIDATION ====================
const EXISTING_CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Marketing', 'Serviços', 'Vendas de Produtos', 'Transferência'];

function validateImportRow(row, mapping) {
    const errors = [];
    const warnings = [];
    
    const getMappedValue = (field) => {
        const mappedVal = mapping[field];
        if (mappedVal === undefined || mappedVal === '') return null;
        if (!isNaN(mappedVal)) {
            return row[mappedVal];
        }
        return mappedVal;
    };
    
    let data, valor, titulo, categoria, tipo;
    
    let rawData = getMappedValue('data');
    if (rawData) {
        data = convertDate(rawData, importState.dateFormat);
    }
    valor = getMappedValue('valor');
    titulo = getMappedValue('titulo');
    categoria = getMappedValue('categoria');
    const mappedTipo = getMappedValue('tipo');
    if (mappedTipo && mappedTipo.trim()) {
        tipo = mappedTipo;
    } else {
        const numValor = parseBRL(valor);
        tipo = numValor >= 0 ? 'receita' : 'despesa';
    }
    
    if (!data || !data.trim()) {
        errors.push('Data obrigatória');
    } else if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(data)) {
        errors.push(`Data inválida: ${data}`);
    }
    
    if (!valor || valor.trim() === '') {
        errors.push('Valor obrigatório');
    } else {
        const numValor = parseBRL(valor);
        if (isNaN(numValor) || numValor === 0) {
            errors.push(`Valor inválido: ${valor}`);
        }
    }
    
    if (!titulo || !titulo.trim()) {
        errors.push('Título obrigatório');
    }
    
    if (!categoria || !categoria.trim()) {
        errors.push('Categoria obrigatória');
    } else if (!EXISTING_CATEGORIES.includes(categoria.trim())) {
        warnings.push(`Categoria não existe: "${categoria}" - será criada automaticamente`);
    }
    
    let status = getMappedValue('status') || '';
    let tag = getMappedValue('tag') || '';
    
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        data: data?.trim(),
        valor: parseBRL(valor),
        valorStr: formatBRL(Math.abs(parseBRL(valor))),
        titulo: titulo?.trim(),
        categoria: categoria?.trim(),
        tipo: tipo?.toLowerCase(),
        status: status?.trim() || '',
        tag: tag?.trim() || ''
    };
}

// ==================== IMPORT - DUPLICATE CHECK ====================
function checkDuplicate(data, valor) {
    if (!data || !valor) return false;
    
    const dataTs = parseDateTs(data);
    return transactions.some(t => {
        if (t.disabled) return false;
        const existingTs = parseDateTs(t.data);
        return existingTs === dataTs && Math.abs(t.valor - valor) < 0.01;
    });
}

function checkDuplicateInImport(data, valor, currentIdx) {
    if (!data || !valor) return false;
    const dataTs = parseDateTs(data);
    
    for (let i = 0; i < currentIdx; i++) {
        const other = importState.validatedRows[i];
        if (!other || other.ignored) continue;
        const otherTs = parseDateTs(other.data);
        if (otherTs === dataTs && Math.abs(other.valor - valor) < 0.01) {
            return true;
        }
    }
    return false;
}

// ==================== IMPORT - STATE ====================
let importState = {
    account: '',
    fileType: '',
    rawFile: null,
    parsedData: null,
    mapping: {},
    validatedRows: [],
    ofxDefaultCategory: 'Importação',
    ofxDefaultTags: '',
    dateFormat: 'dd/mm/yyyy'
};

// ==================== IMPORT - UI ====================
function updateImportSteps(step) {
    const step1 = document.querySelector('[data-step="1"]');
    const step2 = document.querySelector('[data-step="2"]');
    const step3 = document.querySelector('[data-step="3"]');
    const stepNum2 = document.getElementById('step-num-2');
    const stepLabel2 = document.getElementById('step-label-2');
    const stepNum3 = document.getElementById('step-num-3');
    const stepLabel3 = document.getElementById('step-label-3');
    const line1 = document.getElementById('step-line-1');
    const line2 = document.getElementById('step-line-2');
    
    [step1, step2, step3].forEach(s => s.classList.remove('active'));
    
    if (step === 1) {
        step1.classList.add('active');
        if (stepNum2) { stepNum2.style.background = '#2D2D30'; stepNum2.style.color = '#6B6B70'; }
        if (stepLabel2) stepLabel2.style.color = '#6B6B70';
        if (stepNum3) { stepNum3.style.background = '#2D2D30'; stepNum3.style.color = '#6B6B70'; }
        if (stepLabel3) stepLabel3.style.color = '#6B6B70';
        if (line1) line1.style.background = '#2D2D30';
        if (line2) line2.style.background = '#2D2D30';
    } else if (step === 2) {
        step1.classList.add('active');
        step2.classList.add('active');
        if (stepNum2) { stepNum2.style.background = 'var(--accent)'; stepNum2.style.color = '#FFF'; }
        if (stepLabel2) stepLabel2.style.color = '#FFF';
        if (stepNum3) { stepNum3.style.background = '#2D2D30'; stepNum3.style.color = '#6B6B70'; }
        if (stepLabel3) stepLabel3.style.color = '#6B6B70';
        if (line1) line1.style.background = 'var(--accent)';
        if (line2) line2.style.background = '#2D2D30';
    } else if (step === 3) {
        step1.classList.add('active');
        step2.classList.add('active');
        step3.classList.add('active');
        if (stepNum2) { stepNum2.style.background = 'var(--accent)'; stepNum2.style.color = '#FFF'; }
        if (stepLabel2) stepLabel2.style.color = '#FFF';
        if (stepNum3) { stepNum3.style.background = 'var(--accent)'; stepNum3.style.color = '#FFF'; }
        if (stepLabel3) stepLabel3.style.color = '#FFF';
        if (line1) line1.style.background = 'var(--accent)';
        if (line2) line2.style.background = 'var(--accent)';
    }
}

function openImportModal() {
    importState = {
        account: '',
        fileType: '',
        rawFile: null,
        parsedData: null,
        mapping: {},
        validatedRows: [],
        ofxDefaultCategory: 'Importação',
        ofxDefaultTags: '',
        fatura: '',
        bulkEditMode: false,
        selectedRows: [],
        selectedFile: null
    };
    
    document.getElementById('import-modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('import-step-1').classList.remove('hidden');
    document.getElementById('import-step-2').classList.add('hidden');
    document.getElementById('import-step-ofx').classList.add('hidden');
    document.getElementById('import-step-3').classList.add('hidden');
    document.getElementById('import-step-loading').classList.add('hidden');
    document.getElementById('import-file').value = '';
    const contaSelect = document.getElementById('import-conta');
    if (contaSelect) contaSelect.selectedIndex = 0;
    removeSelectedFile();
    
    updateImportSteps(1);
    lucide.createIcons();
}

function closeImportModal() {
    document.getElementById('import-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('import-file').value = '';
    document.getElementById('import-step-1').classList.remove('hidden');
    document.getElementById('import-step-loading').classList.add('hidden');
    removeSelectedFile();
    importState = {
        account: '',
        fileType: '',
        rawFile: null,
        parsedData: null,
        mapping: {},
        validatedRows: [],
        ofxDefaultCategory: 'Importação',
        ofxDefaultTags: '',
        selectedFile: null
    };
}

function handleContaChange() {
    const contaSelect = document.getElementById('import-conta');
    const faturaGroup = document.getElementById('import-fatura-group');
    
    if (contaSelect && contaSelect.value.startsWith('cartao-')) {
        if (faturaGroup) {
            faturaGroup.classList.remove('hidden');
        }
    } else {
        if (faturaGroup) {
            faturaGroup.classList.add('hidden');
        }
    }
}

function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    handleFileSelected(file);
}

function handleFileSelected(file) {
    if (!file) return;
    
    const contaSelect = document.getElementById('import-conta');
    if (!contaSelect.value) {
        showToastError('Selecione uma conta antes de importar o arquivo.');
        return;
    }
    
    importState.account = contaSelect.value;
    importState.selectedFile = file;
    
    const fileName = document.getElementById('selected-file-name');
    const fileSize = document.getElementById('selected-file-size');
    const fileSection = document.getElementById('import-file-section');
    const fileSelected = document.getElementById('import-file-selected');
    const btnContinue = document.getElementById('btn-continue-file');
    
    if (fileName) fileName.innerText = file.name;
    if (fileSize) fileSize.innerText = formatFileSize(file.size);
    
    if (fileSection) fileSection.classList.add('hidden');
    if (fileSelected) fileSelected.classList.remove('hidden');
    if (btnContinue) {
        btnContinue.disabled = false;
        btnContinue.style.opacity = '1';
    }
    
    lucide.createIcons();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeSelectedFile() {
    const fileInput = document.getElementById('import-file');
    const fileSection = document.getElementById('import-file-section');
    const fileSelected = document.getElementById('import-file-selected');
    const btnContinue = document.getElementById('btn-continue-file');
    
    if (fileInput) fileInput.value = '';
    if (fileSection) fileSection.classList.remove('hidden');
    if (fileSelected) fileSelected.classList.add('hidden');
    if (btnContinue) {
        btnContinue.disabled = true;
        btnContinue.style.opacity = '0.5';
    }
    
    importState.selectedFile = null;
}

function continueToMapping() {
    const file = importState.selectedFile;
    if (!file) return;
    
    const contaSelect = document.getElementById('import-conta');
    if (!contaSelect.value) {
        showToastError('Selecione uma conta antes de continuar.');
        return;
    }
    
    importState.account = contaSelect.value;
    
    const fileType = file.name.toLowerCase().endsWith('.ofx') || file.name.toLowerCase().endsWith('.qfx') ? 'ofx' : 'csv';
    importState.fileType = fileType;
    
    document.getElementById('import-step-1').classList.add('hidden');
    document.getElementById('import-step-loading').classList.remove('hidden');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        importState.rawFile = e.target.result;
        
        if (fileType === 'csv') {
            importState.parsedData = parseCSV(e.target.result);
            if (importState.parsedData.rows.length === 0) {
                showToastError('Arquivo CSV vazio ou inválido.');
                removeSelectedFile();
                document.getElementById('import-step-1').classList.remove('hidden');
                document.getElementById('import-step-loading').classList.add('hidden');
                return;
            }
            showImportMappingStep();
        } else {
            importState.parsedData = parseOFX(e.target.result);
            if (importState.parsedData.length === 0) {
                showToastError('Nenhum lançamento encontrado no arquivo OFX.');
                removeSelectedFile();
                document.getElementById('import-step-1').classList.remove('hidden');
                document.getElementById('import-step-loading').classList.add('hidden');
                return;
            }
            showImportMappingStep();
        }
    };
    reader.onerror = () => {
        showToastError('Erro ao ler o arquivo.');
        removeSelectedFile();
        document.getElementById('import-step-loading').classList.add('hidden');
        document.getElementById('import-step-1').classList.remove('hidden');
    };
    reader.readAsText(file);
}

function downloadTemplate() {
    const template = 'Data;Título;Valor;Categoria;Forma Pagamento;Tag;Status\n01/01/2024;Lançamento Exemplo;-100,00;Alimentação;;;\n15/01/2024;Recebimento;500,00;Vendas de Produtos;;;';
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_importacao.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

function showImportOFXStep() {
    document.getElementById('import-step-loading').classList.add('hidden');
    document.getElementById('import-step-ofx').classList.remove('hidden');
    updateImportSteps(2);
    
    const categorySelect = document.getElementById('ofx-category');
    const tagsInput = document.getElementById('ofx-tags');
    
    if (categorySelect) {
        categorySelect.value = importState.ofxDefaultCategory || 'Importação';
    }
    if (tagsInput) {
        tagsInput.value = importState.ofxDefaultTags || '';
    }
    
    lucide.createIcons();
}

function showImportMappingStep() {
    document.getElementById('import-step-loading').classList.add('hidden');
    document.getElementById('import-step-2').classList.remove('hidden');
    updateImportSteps(2);
    importState.bulkEditMode = false;
    importState.selectedRows = [];
    
    const headers = importState.parsedData.headers;
    
    const mappingContainer = document.getElementById('mapping-fields');
    mappingContainer.innerHTML = '';
    
    const fields = [
        { key: 'data', label: 'Data', required: true, autoMap: ['data', 'date', 'dt', 'datacriacao', 'data_criacao'] },
        { key: 'titulo', label: 'Título', required: true, autoMap: ['titulo', 'title', 'descricao', 'description', 'nome', 'name', 'historico', 'memo'] },
        { key: 'categoria', label: 'Categoria', required: true, autoMap: ['categoria', 'category', 'tipo', 'type', 'natureza', 'segmento', 'classe', 'classificacao', 'rubrica', 'grupo'] },
        { key: 'tag', label: 'Tag', required: false, autoMap: ['tag', 'tags', 'label', 'etiqueta'] },
        { key: 'formaPagamento', label: 'Forma Pagamento', required: false, autoMap: ['forma', 'forma_pagamento', 'pagamento', 'payment', 'meio'] },
        { key: 'valor', label: 'Valor', required: true, autoMap: ['valor', 'value', 'amount', 'valororiginal', 'valor_original', 'valor_liquido'] }
    ];
    
    const autoMapping = detectColumnMapping(headers, fields);
    
    importState.mapping = {};
    Object.keys(autoMapping).forEach(key => {
        importState.mapping[key] = autoMapping[key];
    });
    
    fields.forEach(field => {
        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        const requiredStar = field.required ? ' <span class="req-star">*</span>' : '';
        
        const autoMapIndex = autoMapping[field.key];
        const notRequiredOptions = !field.required ? '<option value="-1">Não mapear</option>' : '';
        
        let customInput = '';
        if (field.hasCustomValue) {
            customInput = `
                <div style="margin-top:4px;">
                    <input type="text" id="custom-${field.key}" placeholder="Valor fixo" style="width:100%;padding:6px 8px;background:#1F1F23;border:1px solid #2D2D30;border-radius:4px;color:#FFF;font-size:11px;" oninput="setCustomValue('${field.key}', this.value)">
                </div>`;
        }
        
        div.innerHTML = `
            <label style="display:block;margin-bottom:4px;font-size:11px;font-weight:500;color:#ADADB0;">${field.label}${requiredStar}</label>
            <select id="map-${field.key}" class="mapping-select" onchange="updateMapping('${field.key}', this.value)" style="width:100%;padding:6px 8px;background:#1F1F23;border:1px solid #2D2D30;border-radius:4px;color:#FFF;font-size:12px;">
                <option value="">Selecione</option>
                ${notRequiredOptions}
                ${headers.map((h, i) => `<option value="${i}" ${String(autoMapIndex) === String(i) ? 'selected' : ''}>${h.substring(0,15)}</option>`).join('')}
            </select>
            ${customInput}
        `;
        mappingContainer.appendChild(div);
    });
    
    renderImportPreview();
}

function detectColumnMapping(headers, fields) {
    const mapping = {};
    
    headers.forEach((header, idx) => {
        const normalizedHeader = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        for (const field of fields) {
            if (mapping[field.key] !== undefined) continue;
            
            const keywords = field.autoMap || [];
            for (const keyword of keywords) {
                const normalizedKeyword = keyword.toLowerCase();
                if (normalizedHeader.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedHeader)) {
                    mapping[field.key] = idx.toString();
                    break;
                }
            }
        }
    });
    
    return mapping;
}

function updateMapping(field, value) {
    if (value === '' || value === '-1') {
        delete importState.mapping[field];
    } else {
        importState.mapping[field] = value;
    }
    if (value !== '') {
        const textInput = document.getElementById(`custom-${field}`);
        const selectInput = document.getElementById(`select-custom-${field}`);
        if (textInput) textInput.value = '';
        if (selectInput) selectInput.value = '';
    }
    renderImportPreview();
}

function setCustomValue(field, value) {
    if (value) {
        importState.mapping[field] = value;
        const colSelect = document.getElementById(`map-${field}`);
        if (colSelect) colSelect.value = '';
    }
    renderImportPreview();
}

function setDateFormat(format) {
    importState.dateFormat = format;
    renderImportPreview();
}

function convertDate(dateStr, format) {
    if (!dateStr || !dateStr.trim()) return dateStr;
    
    dateStr = dateStr.trim();
    let day, month, year;
    
    if (format === 'yyyy-mm-dd') {
        const parts = dateStr.split(/[-/]/);
        if (parts.length >= 3) {
            year = parts[0];
            month = parts[1];
            day = parts[2];
        }
    } else if (format === 'dd/mm/yyyy' || format === 'dd-mm-yyyy' || format === 'dd.mm.yyyy') {
        const parts = dateStr.split(/[-/.]/);
        if (parts.length >= 3) {
            day = parts[0];
            month = parts[1];
            year = parts[2];
        }
    } else if (format === 'mm/dd/yyyy') {
        const parts = dateStr.split(/[/]/);
        if (parts.length >= 3) {
            month = parts[0];
            day = parts[1];
            year = parts[2];
        }
    }
    
    if (day && month && year) {
        return `${day.padStart(2,'0')}/${month.padStart(2,'0')}/${year}`;
    }
    
    return dateStr;
}

function toggleBulkEdit() {
    importState.bulkEditMode = !importState.bulkEditMode;
    const toolbar = document.getElementById('bulk-edit-toolbar');
    const checkbox = document.getElementById('select-all-checkbox');
    const thCheckbox = document.getElementById('th-checkbox');
    
    if (importState.bulkEditMode) {
        toolbar.classList.remove('hidden');
        checkbox.style.display = 'block';
    } else {
        toolbar.classList.add('hidden');
        checkbox.style.display = 'none';
        importState.selectedRows = [];
    }
    renderImportPreview();
}

function toggleSelectAll(checked) {
    if (checked) {
        importState.selectedRows = importState.validatedRows.map((_, i) => i);
    } else {
        importState.selectedRows = [];
    }
    renderImportPreview();
}

function toggleRowSelection(idx) {
    const pos = importState.selectedRows.indexOf(idx);
    if (pos > -1) {
        importState.selectedRows.splice(pos, 1);
    } else {
        importState.selectedRows.push(idx);
    }
    renderImportPreview();
}

function applyBulkEdit() {
    const categorySelect = document.getElementById('bulk-category');
    const newCategory = categorySelect.value;
    
    if (!newCategory && importState.selectedRows.length === 0) {
        showToastError('Selecione ao menos uma linha ou defina uma ação.');
        return;
    }
    
    importState.selectedRows.forEach(idx => {
        if (importState.validatedRows[idx]) {
            if (newCategory) {
                importState.validatedRows[idx].categoria = newCategory;
            }
        }
    });
    
    showToast(`${importState.selectedRows.length} registro(s) atualizado(s)!`);
    importState.selectedRows = [];
    renderImportPreview();
}

function renderImportPreview() {
    const rows = importState.parsedData.rows;
    const mapping = importState.mapping;
    const validatedRows = [];
    let totalReceita = 0, totalDespesa = 0;
    
    rows.forEach((row, idx) => {
        const validated = validateImportRow(row, mapping);
        validatedRows.push(validated);
        
        if (validated.valid) {
            if (validated.tipo === 'receita') totalReceita += validated.valor;
            else if (validated.tipo === 'despesa') totalDespesa += validated.valor;
        }
    });
    
    importState.validatedRows = validatedRows;
    
    const rowsWithIssues = validatedRows.filter(v => v.errors.length > 0 || !v.categoria || !v.titulo || !v.data || !v.valor).length;
    
    document.getElementById('import-total-count').innerText = rows.length;
    document.getElementById('import-total-receita').innerText = formatBRL(totalReceita);
    document.getElementById('import-total-despesa').innerText = formatBRL(totalDespesa);
    
    const btnValidateImport = document.getElementById('btn-validate-import');
    if (btnValidateImport) {
        if (rowsWithIssues > 0) {
            btnValidateImport.disabled = true;
            btnValidateImport.style.opacity = '0.5';
            btnValidateImport.style.cursor = 'not-allowed';
            btnValidateImport.title = `${rowsWithIssues} registro(s) com pendências. Corrija antes de continuar.`;
            btnValidateImport.innerText = `Validar (${rowsWithIssues} pendente${rowsWithIssues > 1 ? 's' : ''})`;
        } else {
            btnValidateImport.disabled = false;
            btnValidateImport.style.opacity = '1';
            btnValidateImport.style.cursor = 'pointer';
            btnValidateImport.title = '';
            btnValidateImport.innerText = 'Validar e Importar';
        }
    }
    
    const previewBody = document.getElementById('import-preview-body');
    previewBody.innerHTML = '';
    
    validatedRows.slice(0, 100).forEach((v, idx) => {
        const tr = document.createElement('tr');
        const hasError = v.errors.length > 0;
        const hasWarning = v.warnings.length > 0;
        const isDuplicateInFile = checkDuplicateInImport(v.data, v.valor, idx);
        const isDuplicateInSystem = checkDuplicate(v.data, v.valor);
        
        const isIgnored = v.ignored === true;
        const isSelected = importState.selectedRows.includes(idx);
        const checkbox = importState.bulkEditMode ? 
            `<input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleRowSelection(${idx})" style="cursor:pointer;">` : '';
        
        let infoText = '';
        const allErrors = [...v.errors, ...v.warnings];
        const isPending = !v.data || !v.titulo || !v.categoria || !v.valor;
        const hasAnyError = allErrors.length > 0 || isPending;
        
        if (hasError) infoText = v.errors[0];
        else if (isIgnored) infoText = 'Ignorado';
        else if (isDuplicateInFile) infoText = 'Duplicado no arquivo';
        else if (isDuplicateInSystem) infoText = 'Já existe no sistema';
        else if (!v.data || !v.titulo || !v.categoria || !v.valor) infoText = 'Pendente';
        else if (!v.valid) infoText = 'Pendente';
        else if (hasAnyError) infoText = allErrors[0];

        const errorTooltip = allErrors.map(e => `• ${e}`).join('\n');
        
        const categoriasReceita = ['Vendas de Produtos', 'Serviços', 'Marketing', 'Transferência', 'Outras Receitas'];
        const categoriasDespesa = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Serviços', 'Marketing', 'Transferência', 'Outras Despesas'];
        const categorias = v.tipo === 'receita' ? categoriasReceita : categoriasDespesa;
        
        const EXISTING_TAGS = ['Fixo', 'Parcelado', 'Recorrente', 'PIX', 'Boleto', 'Débito', 'Crédito', 'Dinheiro', 'Trabalho', 'Pessoal'];
        
        const tituloInput = `<input type="text" value="${(v.titulo || '').replace(/"/g, '&quot;')}" 
            onchange="updateRowField(${idx}, 'titulo', this.value)" 
            style="width:100%;padding:6px 8px;background:#1F1F23;border:1px solid #2D2D30;border-radius:4px;color:#FFF;font-size:12px;" ${isIgnored ? 'disabled' : ''}>`;
        
        const categoriaSelect = `
            <select onchange="updateRowField(${idx}, 'categoria', this.value)" 
                style="width:100%;padding:6px 8px;background:#1F1F23;border:1px solid #2D2D30;border-radius:4px;color:#FFF;font-size:12px;" ${isIgnored ? 'disabled' : ''}>
                <option value="">Selecionar...</option>
                ${categorias.map(c => `<option value="${c}" ${v.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>`;
        
        const tagSelect = `
            <select onchange="updateRowField(${idx}, 'tag', this.value)" 
                style="width:100%;padding:6px 8px;background:#1F1F23;border:1px solid #2D2D30;border-radius:4px;color:#FFF;font-size:12px;" ${isIgnored ? 'disabled' : ''}>
                <option value="">Selecionar...</option>
                ${EXISTING_TAGS.map(t => `<option value="${t}" ${v.tag === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>`;
        
        const formaPagamentoSelect = `
            <select onchange="updateRowField(${idx}, 'formaPagamento', this.value)" 
                style="width:100%;padding:6px 8px;background:#1F1F23;border:1px solid #2D2D30;border-radius:4px;color:#FFF;font-size:12px;" ${isIgnored ? 'disabled' : ''}>
                <option value="">Selecionar...</option>
                ${['PIX', 'Boleto', 'Débito', 'Crédito', 'Dinheiro', 'Transferência'].map(f => `<option value="${f}" ${v.formaPagamento === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>`;
        
        tr.style.cssText = `border-bottom:1px solid #1F1F23;${hasError ? 'opacity:0.6;' : ''}${isIgnored ? 'opacity:0.5;background:rgba(239,68,68,0.05);text-decoration:line-through;' : ''}`;
        tr.dataset.idx = idx;
        tr.innerHTML = `
            <td style="padding:12px 16px;width:40px;">${checkbox}</td>
            <td style="padding:8px 12px;font-size:13px;">${v.data || '-'}</td>
            <td style="padding:8px 12px;font-size:13px;max-width:200px;">${tituloInput}</td>
            <td style="padding:8px 12px;font-size:13px;">${categoriaSelect}</td>
            <td style="padding:8px 12px;font-size:13px;">${tagSelect}</td>
            <td style="padding:8px 12px;font-size:13px;">${formaPagamentoSelect}</td>
            <td style="padding:12px 16px;font-family:'DM Mono',monospace;font-size:13px;font-weight:500;text-align:right;${v.tipo === 'receita' ? 'color:#22C55E;' : 'color:#EF4444;'}">${v.tipo === 'receita' ? '+' : '-'}${v.valorStr || '-'}</td>
            <td style="padding:12px 16px;font-size:12px;${hasAnyError ? 'background:rgba(249,115,22,0.1);border-radius:4px;padding:6px 10px;' : ''}">
                ${hasAnyError ? `<i data-lucide="alert-circle" style="width:14px;height:14px;color:#F97316;vertical-align:middle;margin-right:4px;cursor:help;" title="${errorTooltip.replace(/"/g, '&quot;').replace(/\n/g, '&#10;')}"></i>` : ''}
                <span style="color:${infoText === 'Pendente' ? '#F97316' : infoText === 'Já existe no sistema' ? '#EAB308' : '#EF4444'};">${infoText}</span>
            </td>
            <td style="padding:12px 16px;width:40px;">
                <i data-lucide="${isIgnored ? 'check' : 'trash-2'}" style="width:16px;height:16px;color:${isIgnored ? '#22C55E' : '#6B6B70'};cursor:pointer;" onclick="toggleIgnoreRow(${idx})" title="Ignorar lançamento"></i>
            </td>
        `;
        previewBody.appendChild(tr);
    });
    
    lucide.createIcons();
}

function toggleIgnoreRow(idx) {
    if (!importState.validatedRows[idx]) return;
    importState.validatedRows[idx].ignored = !importState.validatedRows[idx].ignored;
    renderImportPreview();
}

function toggleIgnoreTransaction(id) {
    closeAllMenus();
    const t = transactions.find(x => x.id === id);
    if (!t) return;
    t.ignored = !t.ignored;
    renderAll(); saveTransactions();
}

function updateRowField(idx, field, value) {
    if (!importState.validatedRows[idx]) return;
    importState.validatedRows[idx][field] = value;
}

function validateAndShowResults() {
    const mapping = importState.mapping;
    const isOFX = importState.fileType === 'ofx';
    
    const requiredFields = ['data', 'titulo', 'valor', 'categoria'];
    const missingFields = requiredFields.filter(field => {
        const val = mapping[field];
        return val === undefined || val === null || val === '';
    });
    
    if (missingFields.length > 0) {
        const fieldLabels = { data: 'Data', titulo: 'Título', valor: 'Valor', categoria: 'Categoria' };
        const missingNames = missingFields.map(f => fieldLabels[f]).join(', ');
        showToastError(`Mapeie os campos obrigatórios: ${missingNames}`);
        return;
    }
    
    const validatedRows = [];
    let totalReceita = 0, totalDespesa = 0;
    let totalDuplicados = 0;
    let totalDuplicadosFile = 0;
    let totalIgnorados = 0;
    let totalExistentes = 0;
    
    let rowsToValidate = importState.parsedData.rows;
    
    rowsToValidate.forEach((row, idx) => {
        const validated = validateImportRow(row, mapping);
        validated.isDuplicateInFile = checkDuplicateInImport(validated.data, validated.valor, idx);
        validated.isDuplicateInSystem = checkDuplicate(validated.data, validated.valor);
        validatedRows.push(validated);
        
        if (validated.valid && !validated.ignored) {
            if (validated.tipo === 'receita') totalReceita += validated.valor;
            else if (validated.tipo === 'despesa') totalDespesa += validated.valor;
        }
        
        if (validated.isDuplicateInFile) totalDuplicadosFile++;
        if (validated.isDuplicateInSystem) totalExistentes++;
        if (validated.ignored) totalIgnorados++;
    });
    
    importState.validatedRows = validatedRows;
    
    const errorsCount = validatedRows.filter(v => v.errors.length > 0).length;
    const validCount = validatedRows.filter(v => v.valid && !v.ignored).length;
    const ignoredCount = validatedRows.filter(v => v.ignored).length;
    
    document.getElementById('import-step-1').classList.add('hidden');
    document.getElementById('import-step-2').classList.add('hidden');
    document.getElementById('import-step-ofx').classList.add('hidden');
    document.getElementById('import-step-3').classList.remove('hidden');
    updateImportSteps(3);
    
    document.getElementById('result-total').innerText = validatedRows.length;
    document.getElementById('result-validos').innerText = validCount;
    document.getElementById('result-erros').innerText = errorsCount;
    document.getElementById('result-duplicados').innerText = totalDuplicadosFile + totalExistentes;
    document.getElementById('result-receita').innerText = formatBRL(totalReceita);
    document.getElementById('result-despesa').innerText = formatBRL(totalDespesa);
    
    const btnImportar = document.getElementById('btn-importar');
    const btnConciliar = document.getElementById('btn-conciliar');
    
    const hasDuplicatesToConciliate = totalExistentes > 0;
    
    if (btnConciliar) {
        if (hasDuplicatesToConciliate) {
            btnConciliar.disabled = false;
            btnConciliar.style.opacity = '1';
            btnConciliar.style.cursor = 'pointer';
        } else {
            btnConciliar.disabled = true;
            btnConciliar.style.opacity = '0.5';
            btnConciliar.style.cursor = 'not-allowed';
        }
    }
    
    if (btnImportar) {
        if (errorsCount > 0 || validCount === 0) {
            btnImportar.disabled = true;
            btnImportar.style.opacity = '0.5';
            btnImportar.style.cursor = 'not-allowed';
        } else {
            btnImportar.disabled = false;
            btnImportar.style.opacity = '1';
            btnImportar.style.cursor = 'pointer';
        }
    }
}

function executeImport() {
    const validRows = importState.validatedRows.filter(v => v.valid && !v.ignored);
    const accountSelect = document.getElementById('import-conta');
    const conta = accountSelect.options[accountSelect.selectedIndex]?.text || '';
    
    validRows.forEach(v => {
        transactions.push({
            id: generateId(),
            titulo: v.titulo,
            conta: conta,
            categoria: v.categoria,
            data: v.data,
            status: v.tipo === 'receita' ? 'Recebido' : 'Pago',
            valor: v.valor,
            valorStr: v.valorStr,
            tipo: v.tipo,
            tags: v.tag ? [v.tag] : [],
            formaPagamento: v.formaPagamento || '',
            disabled: false,
            excludeFromReports: false,
            origem: 'importado'
        });
    });
    
    closeImportModal();
    renderAll(); saveTransactions(); loadAllFilters();
    showToast(`${validRows.length} lançamento(s) importado(s) com sucesso!`);
}

function concilateAndImport() {
    const validRows = importState.validatedRows.filter(v => v.valid && !v.ignored);
    const accountSelect = document.getElementById('import-conta');
    const conta = accountSelect.options[accountSelect.selectedIndex]?.text || '';
    
    let importCount = 0;
    
    validRows.forEach(v => {
        const existingIdx = transactions.findIndex(t => {
            if (t.disabled) return false;
            const existingTs = parseDateTs(t.data);
            const newTs = parseDateTs(v.data);
            return existingTs === newTs && Math.abs(t.valor - v.valor) < 0.01;
        });
        
        if (existingIdx === -1) {
            transactions.push({
                id: generateId(),
                titulo: v.titulo,
                conta: conta,
                categoria: v.categoria,
                data: v.data,
                status: v.tipo === 'receita' ? 'Recebido' : 'Pago',
                valor: v.valor,
                valorStr: v.valorStr,
                tipo: v.tipo,
                tags: v.tag ? [v.tag] : [],
                formaPagamento: v.formaPagamento || '',
                disabled: false,
                excludeFromReports: false,
                origem: 'importado'
            });
            importCount++;
        } else {
            const existing = transactions[existingIdx];
            existing.conciliado = true;
            existing.conciliadoEm = new Date().toLocaleDateString('pt-BR');
        }
    });
    
    closeImportModal();
    renderAll(); saveTransactions(); loadAllFilters();
    showToast(`${importCount} lançamento(s) importado(s) com sucesso! ${validRows.length - importCount} duplicado(s) marcado(s) como conciliado(s).`);
}

// ==================== HELPERS ====================
let _idC = 0;
function generateId() { return 'tx-' + Date.now() + '-' + (++_idC); }
function parseBRL(s) { return parseFloat((s || '0').replace(/\./g, '').replace(',', '.')) || 0; }
function formatBRL(v) { return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function parseDateTs(d) {
    if (!d || !d.includes('/')) return 0;
    const [dd, mm, yyyy] = d.split('/');
    return parseInt((yyyy||'0') + (mm||'').padStart(2,'0') + (dd||'').padStart(2,'0'));
}
function getTodayFormatted() {
    const n = new Date();
    return String(n.getDate()).padStart(2,'0') + '/' + String(n.getMonth()+1).padStart(2,'0') + '/' + n.getFullYear();
}
function getTodayNative() {
    const n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth()+1).padStart(2,'0') + '-' + String(n.getDate()).padStart(2,'0');
}

// ==================== MASKS ====================
function maskCurrency(input) {
    let digits = input.value.replace(/\D/g, '');
    if (!digits) { input.value = ''; return; }
    digits = digits.replace(/^0+/, '') || '0';
    while (digits.length < 3) digits = '0' + digits;
    const intPart = digits.slice(0, -2);
    const decPart = digits.slice(-2);
    input.value = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decPart;
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
    document.getElementById(textId).value = d + '/' + m + '/' + y;
}

function updateTransferAccounts() {
    const orig = document.getElementById('t-origem');
    const dest = document.getElementById('t-destino');
    if (!orig || !dest) return;
    
    Array.from(orig.options).forEach(opt => opt.disabled = false);
    Array.from(dest.options).forEach(opt => opt.disabled = false);
    
    if (orig.value) {
        const destOpt = Array.from(dest.options).find(o => o.value === orig.value);
        if (destOpt) destOpt.disabled = true;
    }
    if (dest.value) {
        const origOpt = Array.from(orig.options).find(o => o.value === dest.value);
        if (origOpt) origOpt.disabled = true;
    }
}

// ==================== DATA ====================
const DEFAULT_CATEGORIES_DATA = [
    { id: 'da', nome: 'ALIMENTAÇÃO', tipo: 'despesa', icon: 'utensils', cor: '#EF4444' },
    { id: 'da1', nome: 'RESTAURANTE E LANCHES', tipo: 'despesa', icon: 'coffee', cor: '#EF4444' },
    { id: 'da2', nome: 'SUPERMERCADO', tipo: 'despesa', icon: 'shopping-cart', cor: '#EF4444' },
    { id: 'dm', nome: 'MORADIA', tipo: 'despesa', icon: 'home', cor: '#3B82F6' },
    { id: 'dm1', nome: 'ALUGUEL', tipo: 'despesa', icon: 'key', cor: '#3B82F6' },
    { id: 'dm2', nome: 'CONDOMÍNIO', tipo: 'despesa', icon: 'building', cor: '#3B82F6' },
    { id: 'dm3', nome: 'INTERNET FIXA', tipo: 'despesa', icon: 'wifi', cor: '#3B82F6' },
    { id: 'dm4', nome: 'LINHA MÓVEL', tipo: 'despesa', icon: 'smartphone', cor: '#3B82F6' },
    { id: 'dm7', nome: 'ENERGIA ELÉTRICA', tipo: 'despesa', icon: 'zap', cor: '#3B82F6' },
];

const categoryMap = {};
DEFAULT_CATEGORIES_DATA.forEach(c => categoryMap[c.id] = c);

const transactions = [
    { id: generateId(), titulo: 'Supermercado Extra', conta: 'Banco do Brasil', categoria_id: 'da2', data: '05/03/2026', status: 'Pago', valor: 350.00, valorStr: '350,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Aluguel Março', conta: 'Itaú', categoria_id: 'dm1', data: '08/03/2026', status: 'Pago', valor: 1800.00, valorStr: '1.800,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Conta de Luz', conta: 'Banco do Brasil', categoria_id: 'dm7', data: '10/03/2026', status: 'Pago', valor: 280.00, valorStr: '280,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Restaurante', conta: 'Nubank', categoria_id: 'da1', data: '12/03/2026', status: 'Pago', valor: 85.00, valorStr: '85,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Internet Vivo', conta: 'Itaú', categoria_id: 'dm3', data: '15/03/2026', status: 'Pago', valor: 120.00, valorStr: '120,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Supermercado', conta: 'Banco do Brasil', categoria_id: 'da2', data: '18/03/2026', status: 'Pago', valor: 250.00, valorStr: '250,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Lanche', conta: 'Nubank', categoria_id: 'da1', data: '20/03/2026', status: 'Pago', valor: 45.00, valorStr: '45,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Telefone', conta: 'Itaú', categoria_id: 'dm4', data: '22/03/2026', status: 'Pago', valor: 150.00, valorStr: '150,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Condomínio', conta: 'Banco do Brasil', categoria_id: 'dm2', data: '25/03/2026', status: 'Pago', valor: 650.00, valorStr: '650,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Supermercado', conta: 'Banco do Brasil', categoria_id: 'da2', data: '02/03/2026', status: 'Pago', valor: 200.00, valorStr: '200,00', tipo: 'despesa', disabled: false, excludeFromReports: false, origem: 'manual' },
    { id: generateId(), titulo: 'Salário Lucas', conta: 'Bradesco', categoria_id: 'rf1', data: '05/03/2026', status: 'Recebido', valor: 8500.00, valorStr: '8.500,00', tipo: 'receita', disabled: false, excludeFromReports: false, origem: 'sincronizado' },
];

// ==================== SIDEBAR ====================
function toggleSidebar() {
    const sb = document.getElementById('sidebar'), ic = document.getElementById('toggle-icon');
    sb.classList.toggle('collapsed');
    ic.setAttribute('data-lucide', sb.classList.contains('collapsed') ? 'chevron-right' : 'chevron-left');
    lucide.createIcons();
}
function toggleSubmenu(id) {
    if (document.getElementById('sidebar').classList.contains('collapsed')) return;
    document.getElementById(id).parentElement.classList.toggle('open');
}

// ==================== MODAL STATE & FILTERS ====================
let currentTab = 'despesa', editingId = null;
let activeFilters = { tipo: 'todos', categoria: [], conta: [], origem: [], status: [], searchTerm: '' };
let currentGrouping = 'none';
let currentDate = new Date();
let currentFilterMonth = currentDate.getMonth() + 1;
let currentFilterYear = currentDate.getFullYear();
let currentFilterDateRange = null;
const MONTH_NAMES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

function updateMonthDisplay() {
    const el = document.getElementById('display-month');
    if (el) el.innerText = `${MONTH_NAMES[currentFilterMonth - 1]} ${currentFilterYear}`;
}

function changeMonth(delta) {
    currentFilterMonth += delta;
    if (currentFilterMonth > 12) {
        currentFilterMonth = 1;
        currentFilterYear++;
    } else if (currentFilterMonth < 1) {
        currentFilterMonth = 12;
        currentFilterYear--;
    }
    updateMonthDisplay();
    renderAll();
}

// ==================== OPEN / CLOSE ====================
function openModal() {
    editingId = null; resetModal();
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = ''; editingId = null;
}
document.getElementById('modal-overlay').addEventListener('click', function(e) { if (e.target === this) closeModal(); });

// ==================== RESET ====================
function resetModal() {
    currentTab = 'despesa';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-despesa').classList.add('active');
    document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('section-despesa').classList.remove('hidden');
    document.getElementById('modal-title').innerText = 'Novo lançamento';
    document.getElementById('modal-desc').innerText = 'Preencha os campos para registrar este lançamento.';
    document.getElementById('btn-submit').innerText = 'Confirmar';
    ['d-valor','d-titulo','r-valor','r-titulo','i-valor','i-desc','t-valor','t-obs','d-obs','r-obs','i-obs']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['d-conta','d-categoria','d-pagamento','d-tipo-contato','d-contato',
     'r-conta','r-categoria','r-pagamento','i-conta','i-objetivo','i-categoria','t-origem','t-destino']
        .forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
    // Set today's date on all date fields
    const today = getTodayFormatted(), todayNative = getTodayNative();
    ['d-data','r-data','i-data','t-data'].forEach(id => { const el = document.getElementById(id); if (el) el.value = today; });
    ['d','r','i','t'].forEach(p => { const el = document.getElementById(p+'-data-native'); if (el) el.value = todayNative; });
    resetStatusGroup('d-status', 1); resetStatusGroup('r-status', 1);
    ['d-adv','r-adv','t-adv'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
    document.querySelectorAll('.btn-toggle span').forEach(el => el.innerText = 'Mostrar mais opções');
    document.querySelectorAll('.btn-toggle i').forEach(el => el.setAttribute('data-lucide','chevron-down'));
    document.querySelectorAll('.segmented-control').forEach(c =>
        c.querySelectorAll('.seg-btn').forEach((b, i) => b.classList.toggle('active', i === 0)));
    ['d-tags','r-tags','i-tags','t-tags'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    lucide.createIcons();
}
function resetStatusGroup(gid, idx) {
    const g = document.getElementById(gid);
    if (g) g.querySelectorAll('.status-option').forEach((b, i) => b.classList.toggle('active', i === idx));
}

// ==================== TABS ====================
function switchTab(type, el) {
    currentTab = type;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); el.classList.add('active');
    document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('section-' + type).classList.remove('hidden');
    const cfg = {
        despesa:       ['Novo lançamento','Preencha os campos para registrar esta despesa.','Confirmar'],
        receita:       ['Novo lançamento','Preencha os campos para registrar esta receita.','Confirmar'],
        investimento:  ['Novo lançamento','Registre um investimento ou aporte financeiro.','Confirmar'],
        transferencia: ['Nova Transferência','Registre uma transferência entre contas.','Confirmar'],
    };
    document.getElementById('modal-title').innerText = cfg[type][0];
    document.getElementById('modal-desc').innerText  = cfg[type][1];
    document.getElementById('btn-submit').innerText  = cfg[type][2];
    lucide.createIcons();
}

// ==================== FORM HELPERS ====================
function setStatus(el, gid) {
    document.getElementById(gid).querySelectorAll('.status-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
}
function toggleAdvanced(advId, btn) {
    const adv = document.getElementById(advId), hidden = adv.classList.contains('hidden');
    adv.classList.toggle('hidden');
    btn.querySelector('span').innerText = hidden ? 'Mostrar menos opções' : 'Mostrar mais opções';
    btn.querySelector('i').setAttribute('data-lucide', hidden ? 'chevron-up' : 'chevron-down');
    lucide.createIcons();
}
function setSeg(el) {
    el.closest('.segmented-control').querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}
function getAvailableTags() {
    try {
        const stored = localStorage.getItem('hub_tags');
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.filter(t => t.status === 'ativa').map(t => t.nome);
        }
    } catch (e) { console.error('Erro ao carregar tags:', e); }
    return [];
}
let currentTagContainerId = null;
function showTagPopover(btn, cid) {
    currentTagContainerId = cid;
    let popover = document.getElementById('tag-popover');
    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'tag-popover';
        popover.className = 'tag-popover';
        popover.innerHTML = '<div class="tag-popover-title">Selecione uma tag</div><div class="tag-popover-list"></div>';
        document.body.appendChild(popover);
    }
    const tags = getAvailableTags();
    const container = document.getElementById(cid);
    const exist = Array.from(container.querySelectorAll('.tag-pill span')).map(s => s.innerText);
    const available = tags.filter(t => !exist.includes(t));
    const list = popover.querySelector('.tag-popover-list');
    if (available.length === 0) {
        list.innerHTML = '<div class="tag-popover-empty">Nenhuma tag disponível</div>';
    } else {
        list.innerHTML = available.map(t => `<button type="button" class="tag-popover-item" onclick="addTagFromPopover('${t}')">${t}</button>`).join('');
    }
    const rect = btn.getBoundingClientRect();
    popover.style.display = 'block';
    popover.style.top = (rect.bottom + 4) + 'px';
    popover.style.left = rect.left + 'px';
    document.addEventListener('click', closeTagPopover);
}
function closeTagPopover(e) {
    const popover = document.getElementById('tag-popover');
    if (popover && !popover.contains(e.target) && !e.target.closest('.tag-field') && !e.target.closest('.addon-btn')) {
        popover.style.display = 'none';
        document.removeEventListener('click', closeTagPopover);
    }
}
function addTagFromPopover(tagName) {
    if (!currentTagContainerId) return;
    const c = document.getElementById(currentTagContainerId);
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = `${tagName} <i data-lucide="x" onclick="removeTag(this)"></i>`;
    c.appendChild(pill);
    lucide.createIcons();
    const popover = document.getElementById('tag-popover');
    if (popover) popover.style.display = 'none';
    document.removeEventListener('click', closeTagPopover);
}
function addTag(cid) {
    const btn = event.target.closest('.addon-btn');
    if (btn) showTagPopover(btn, cid);
}
function removeTag(ic) { ic.closest('.tag-pill').remove(); }

// ==================== VALIDATION ====================
function validateRequired(fields) {
    let ok = true;
    fields.forEach(({ el, wrap }) => {
        const wEl = document.getElementById(wrap), fg = wEl ? wEl.closest('.form-group') : null;
        const empty = !el || !el.value || !el.value.trim();
        if (empty) { if (fg) fg.classList.add('field-error'); ok = false; }
        else { if (fg) fg.classList.remove('field-error'); }
    });
    return ok;
}

// ==================== EXTRACT FORM DATA ====================
function extractFormData() {
    let titulo='', categoria='', data='', valor=0, valorStr='', tipo='', status='', conta='';
    if (currentTab === 'despesa') {
        if (!validateRequired([
            { el: document.getElementById('d-valor'),     wrap: 'd-valor-wrap' },
            { el: document.getElementById('d-conta'),     wrap: 'd-conta-wrap' },
            { el: document.getElementById('d-titulo'),    wrap: 'd-titulo-wrap' },
            { el: document.getElementById('d-data'),      wrap: 'd-data-wrap' },
            { el: document.getElementById('d-categoria'), wrap: 'd-categoria-wrap' },
        ])) return null;
        titulo = document.getElementById('d-titulo').value;
        const cs = document.getElementById('d-categoria'); categoria = cs.options[cs.selectedIndex].text;
        data = document.getElementById('d-data').value;
        valorStr = document.getElementById('d-valor').value; valor = parseBRL(valorStr);
        const ac = document.getElementById('d-conta'); conta = ac.selectedIndex > 0 ? ac.options[ac.selectedIndex].text.split('—')[0].trim() : '';
        const se = document.querySelector('#d-status .status-option.active span'); status = se ? se.innerText : 'Pendente';
        tipo = 'despesa';
    } else if (currentTab === 'receita') {
        if (!validateRequired([
            { el: document.getElementById('r-valor'),     wrap: 'r-valor-wrap' },
            { el: document.getElementById('r-conta'),     wrap: 'r-conta-wrap' },
            { el: document.getElementById('r-titulo'),    wrap: 'r-titulo-wrap' },
            { el: document.getElementById('r-data'),      wrap: 'r-data-wrap' },
            { el: document.getElementById('r-categoria'), wrap: 'r-categoria-wrap' },
        ])) return null;
        titulo = document.getElementById('r-titulo').value;
        const cs = document.getElementById('r-categoria'); categoria = cs.options[cs.selectedIndex].text;
        data = document.getElementById('r-data').value;
        valorStr = document.getElementById('r-valor').value; valor = parseBRL(valorStr);
        const ac = document.getElementById('r-conta'); conta = ac.selectedIndex > 0 ? ac.options[ac.selectedIndex].text.split('—')[0].trim() : '';
        const se = document.querySelector('#r-status .status-option.active span'); status = se ? se.innerText : 'Pendente';
        tipo = 'receita';
    } else if (currentTab === 'investimento') {
        if (!validateRequired([
            { el: document.getElementById('i-valor'),     wrap: 'i-valor-wrap' },
            { el: document.getElementById('i-categoria'), wrap: 'i-categoria-wrap' },
            { el: document.getElementById('i-data'),      wrap: 'i-data-wrap' },
        ])) return null;
        titulo = document.getElementById('i-desc').value || 'Investimento';
        const cs = document.getElementById('i-categoria'); categoria = cs.options[cs.selectedIndex].text;
        data = document.getElementById('i-data').value;
        valorStr = document.getElementById('i-valor').value; valor = parseBRL(valorStr);
        const ac = document.getElementById('i-conta'); conta = ac.selectedIndex > 0 ? ac.options[ac.selectedIndex].text.split('—')[0].trim() : '';
        status = 'Realizado'; tipo = 'investimento';
    } else if (currentTab === 'transferencia') {
        if (!validateRequired([
            { el: document.getElementById('t-origem'),  wrap: 't-origem-wrap' },
            { el: document.getElementById('t-destino'), wrap: 't-destino-wrap' },
            { el: document.getElementById('t-valor'),   wrap: 't-valor-wrap' },
            { el: document.getElementById('t-data'),    wrap: 't-data-wrap' },
        ])) return null;
        const os = document.getElementById('t-origem'), ds = document.getElementById('t-destino');
        titulo = os.options[os.selectedIndex].text.split('—')[0].trim() + ' → ' + ds.options[ds.selectedIndex].text.split('—')[0].trim();
        categoria = 'Transferência'; data = document.getElementById('t-data').value;
        valorStr = document.getElementById('t-valor').value; valor = parseBRL(valorStr);
        conta = ''; status = 'Realizado'; tipo = 'transferencia';
    }
    let tags = [];
    if (currentTab === 'despesa') {
        tags = Array.from(document.querySelectorAll('#d-tags .tag-pill span')).map(s => s.innerText);
    } else if (currentTab === 'receita') {
        tags = Array.from(document.querySelectorAll('#r-tags .tag-pill span')).map(s => s.innerText);
    } else if (currentTab === 'investimento') {
        tags = Array.from(document.querySelectorAll('#i-tags .tag-pill span')).map(s => s.innerText);
    } else if (currentTab === 'transferencia') {
        tags = Array.from(document.querySelectorAll('#t-tags .tag-pill span')).map(s => s.innerText);
    }
    return { titulo, categoria, data, valor, valorStr, tipo, status, conta, tags };
}

// ==================== SUBMIT ====================
function submitForm() {
    const fd = extractFormData();
    if (!fd) { showToastError('Preencha os campos obrigatórios.'); return; }
    if (editingId) {
        const idx = transactions.findIndex(t => t.id === editingId);
        if (idx !== -1) transactions[idx] = { ...transactions[idx], ...fd };
        showToast('Lançamento atualizado com sucesso!');
    } else {
        transactions.push({ id: generateId(), ...fd, disabled: false, excludeFromReports: false, origem: 'manual' });
        const msgs = { despesa:'Despesa registrada!', receita:'Receita registrada!', investimento:'Investimento registrado!', transferencia:'Transferência registrada!' };
        showToast(msgs[currentTab]);
    }
    closeModal(); renderAll(); saveTransactions(); loadAllFilters();
}

// ==================== RENDER ====================
function renderAll() {
    const tbody = document.getElementById('transactions-tbody');
    tbody.innerHTML = '';
    const sorted = [...transactions].sort((a, b) => parseDateTs(b.data) - parseDateTs(a.data));
    let count = 0;
    const filteredList = [];
    sorted.forEach(t => {
        const [dd, mm, yyyy] = t.data.split('/');
        
        if (currentFilterDateRange) {
            const dateTs = new Date(`${yyyy}-${mm}-${dd}T00:00:00`).getTime();
            const startTs = new Date(`${currentFilterDateRange.start}T00:00:00`).getTime();
            const endTs   = new Date(`${currentFilterDateRange.end}T00:00:00`).getTime();
            if (dateTs < startTs || dateTs > endTs) return;
        } else {
            if (parseInt(mm) !== currentFilterMonth || parseInt(yyyy) !== currentFilterYear) return;
        }

        if (activeFilters.tipo !== 'todos' && t.tipo !== activeFilters.tipo) return;
        if (activeFilters.origem && activeFilters.origem.length > 0 && !activeFilters.origem.includes(t.tipo)) return;
        if (activeFilters.categoria && activeFilters.categoria.length > 0) {
            const catInfo = categoryMap[t.categoria_id] || { nome: t.categoria || 'Outros' };
            if (!activeFilters.categoria.includes(catInfo.nome)) return;
        }
        if (activeFilters.conta && activeFilters.conta.length > 0) {
            if (!activeFilters.conta.some(ct => (t.conta||'').toLowerCase().includes(ct.toLowerCase()))) return;
        }
        if (activeFilters.tags && activeFilters.tags.length > 0) {
            const tTags = t.tags || [];
            if (!activeFilters.tags.some(tag => tTags.includes(tag))) return;
        }

        const term = activeFilters.searchTerm.toLowerCase();
        const catInfo = categoryMap[t.categoria_id] || { nome: t.categoria || 'Outros' };
        if (term && !t.titulo.toLowerCase().includes(term) && !catInfo.nome.toLowerCase().includes(term) && !(t.conta||'').toLowerCase().includes(term) && !(t.valorStr||'').includes(term) && !t.valor.toString().includes(term)) return;
        if (activeFilters.status && activeFilters.status.length > 0) {
            if (!activeFilters.status.includes(t.status)) return;
        }
        filteredList.push(t);
        count++;
    });

    if (count === 0) {
        tbody.appendChild(buildEmptyState());
    } else {
        if (currentGrouping === 'none') {
            filteredList.forEach(t => tbody.appendChild(buildRow(t)));
        } else {
            const groups = {};
            filteredList.forEach(t => {
                const catInfo = categoryMap[t.categoria_id] || { nome: t.categoria || 'Outros' };
                const key = currentGrouping === 'data' ? t.data : catInfo.nome;
                if (!groups[key]) groups[key] = [];
                groups[key].push(t);
            });
            
            const sortedKeys = Object.keys(groups);
            if (currentGrouping === 'data') {
                sortedKeys.sort((a,b) => parseDateTs(b) - parseDateTs(a));
            } else {
                sortedKeys.sort((a,b) => a.localeCompare(b));
            }
            
            sortedKeys.forEach(k => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="7" style="padding:24px 24px 12px 24px;background:transparent;color:#FFF;font-weight:600;font-size:15px;letter-spacing:0.02em;">${k}</td>`;
                tbody.appendChild(tr);
                groups[k].forEach(t => tbody.appendChild(buildRow(t)));
            });
        }
    }
    
    renderActiveFilters();
    
    // Summary applies to the current time scope globally, ignoring active table filters
    const monthFiltered = sorted.filter(t => {
        const [dd, mm, yyyy] = t.data.split('/');
        if (currentFilterDateRange) {
            const dateTs = new Date(`${yyyy}-${mm}-${dd}T00:00:00`).getTime();
            const startTs = new Date(`${currentFilterDateRange.start}T00:00:00`).getTime();
            const endTs   = new Date(`${currentFilterDateRange.end}T00:00:00`).getTime();
            return dateTs >= startTs && dateTs <= endTs;
        }
        return parseInt(mm) === currentFilterMonth && parseInt(yyyy) === currentFilterYear;
    });
    updateSummary(monthFiltered);
    
    lucide.createIcons();
}

function buildEmptyState() {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="7" style="padding:64px 24px;text-align:center;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
            <div style="width:56px;height:56px;background:rgba(255,92,0,0.08);border-radius:16px;display:flex;align-items:center;justify-content:center;">
                <i data-lucide="inbox" style="width:28px;height:28px;color:#FF5C00;opacity:.6;"></i>
            </div>
            <span style="color:#6B6B70;font-size:15px;font-weight:500;">Nenhum lançamento encontrado</span>
            <span style="color:#6B6B70;font-size:13px;">Clique em <strong style="color:#ADADB0;">Novo Lançamento</strong> para começar</span>
        </div></td>`;
    return tr;
}

function buildRow(t) {
    const catInfo = categoryMap[t.categoria_id] || { nome: t.categoria || 'Outros', icon: 'tag', cor: '#6B7280' };
    
    const cm = {
        despesa:       { icon:'shopping-cart',    ic:'#EF4444', ib:'rgba(239,68,68,0.1)',   vc:'#EF4444', vp:'- R$ ' },
        receita:       { icon:'trending-up',      ic:'#22C55E', ib:'rgba(34,197,94,0.1)',  vc:'#22C55E', vp:'+ R$ ' },
        investimento:  { icon:'target',           ic:'#FF5C00', ib:'rgba(255,92,0,0.1)',   vc:'#FF5C00', vp:'+ R$ ' },
        transferencia: { icon:'arrow-right-left', ic:'#3B82F6', ib:'rgba(59,130,246,0.1)', vc:'#3B82F6', vp:'~ R$ ' },
    };
    
    const c = cm[t.tipo] || cm.despesa;
    const ssC = { 'Pago':'#22C55E','Recebido':'#22C55E','Realizado':'#22C55E','Pendente':'#EAB308' };
    const ssBg = { 'Pago':'rgba(34,197,94,0.1)','Recebido':'rgba(34,197,94,0.1)','Realizado':'rgba(34,197,94,0.1)','Pendente':'rgba(234,179,8,0.1)' };
    const inactive = t.disabled || t.excludeFromReports || t.ignored;
    const vColor = inactive ? '#6B6B70' : c.vc;
    const sColor = ssC[t.status] || '#6B7280', sBg = ssBg[t.status] || 'rgba(107,114,128,0.1)';
    const vFmt = t.valorStr || t.valor.toFixed(2).replace('.', ',');
    const tr = document.createElement('tr');
    tr.dataset.tid = t.id; tr.dataset.tipo = t.tipo; tr.dataset.status = t.status;
    tr.style.cssText = `border-bottom:1px solid #1F1F23;opacity:${inactive?'0.4':'1'};transition:opacity 0.3s;`;
    tr.innerHTML = `
      <td style="padding:14px 8px 14px 20px;width:28px;">
        <input type="checkbox" class="row-checkbox" data-tid="${t.id}" onchange="onCheckboxChange()" style="width:15px;height:15px;accent-color:#6B6B70;opacity:0.6;cursor:pointer;">
      </td>
      <td style="padding:14px 24px;font-size:13px;">${t.data}</td>
      <td style="padding:14px 24px;font-size:13px;color:var(--text-secondary);">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:13px;">${t.titulo}</span>
            ${t.origem ? `<span style="display:inline-flex;align-items:center;cursor:help;" title="${t.origem === 'importado' ? 'Importado via arquivo' : t.origem === 'sincronizado' ? 'Sincronizado via Open Finance' : 'Inserido manualmente'}"><i data-lucide="${t.origem === 'importado' ? 'download' : t.origem === 'sincronizado' ? 'refresh-cw' : 'hand'}" style="width:12px;height:12px;color:${t.origem === 'importado' ? '#3B82F6' : t.origem === 'sincronizado' ? '#A855F7' : '#6B6B70'};flex-shrink:0;"></i></span>` : ''}
            ${t.tags && t.tags.length > 0 ? `<span style="display:inline-flex;align-items:center;cursor:help;" title="Tags: ${t.tags.join(', ')}"><i data-lucide="tag" style="width:12px;height:12px;color:#FF5C00;flex-shrink:0;"></i></span>` : ''}
          </div>
          <div style="font-size:11px;color:#6B6B70;margin-top:2px;">${t.conta || 'Sem conta'}</div>
        </div>
      </td>
      <td style="padding:14px 24px;font-size:13px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <i data-lucide="${catInfo.icon}" style="width:14px;height:14px;color:${catInfo.cor};"></i>
          <span>${catInfo.nome}</span>
        </div>
      </td>
      <td style="padding:14px 24px;">
        <span style="padding:4px 10px;background:${sBg};color:${sColor};border-radius:100px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">${t.status}</span>
      </td>
      <td style="padding:14px 24px;font-family:'DM Mono',monospace;font-size:13px;font-weight:500;">
        <span style="color:${vColor};">${c.vp}${vFmt}</span>
      </td>
      <td style="padding:16px 16px 16px 24px;width:120px;">
        <div style="display:flex;align-items:center;gap:2px;justify-content:flex-start;">
          ${t.status === 'Pendente' ? `<button class="action-icon-btn action-success" title="Marcar como realizado" onclick="openRealizeModal('${t.id}')"><i data-lucide="check"></i></button>` : `<div style="width:28px;height:28px;"></div>`}
          <button class="action-icon-btn" title="Editar" onclick="editTransaction('${t.id}')"><i data-lucide="pencil"></i></button>
          <button class="action-icon-btn action-danger" title="Excluir" onclick="openDeleteModal('${t.id}')"><i data-lucide="trash-2"></i></button>
          <div style="position:relative;opacity:1;" class="menu-wrapper">
            <button class="action-icon-btn" onclick="toggleRowMenu('${t.id}',event)" title="${t.excludeFromReports ? 'Lancamento ignorado' : 'Mais opcoes'}"><i data-lucide="more-vertical"></i></button>
            <div style="position:absolute;right:0;top:calc(100% + 4px);opacity:1;" class="row-menu hidden" id="rm-${t.id}">
              <button class="row-menu-item${t.excludeFromReports?' row-menu-item-active':''}" onclick="toggleExcludeReports('${t.id}')" style="opacity:1;">
                <i data-lucide="${t.excludeFromReports?'check-square':'square'}"></i>
                ${t.excludeFromReports?'Reconsiderar lançamento':'Ignorar lançamento'}
              </button>
            </div>
          </div>
        </div>
      </td>
    `;
    return tr;
}

// ==================== SUMMARY ====================
function updateSummary(list = transactions) {
    let recv = 0, pendR = 0, pago = 0, pendD = 0;
    list.forEach(t => {
        if (t.disabled || t.excludeFromReports) return;
        const v = t.valor || 0;
        if (t.tipo === 'receita') { if (t.status === 'Recebido' || t.status === 'Realizado') recv += v; else pendR += v; }
        if (t.tipo === 'despesa') { if (t.status === 'Pago' || t.status === 'Realizado') pago += v; else pendD += v; }
    });
    
    const saldoAtual = recv - pago;
    const saldoProjetado = saldoAtual + pendR - pendD;
    
    document.getElementById('summary-recebido').innerText  = formatBRL(recv);
    document.getElementById('summary-pago').innerText      = formatBRL(pago);
    document.getElementById('summary-saldo').innerText     = formatBRL(saldoAtual);
    document.getElementById('summary-a-receber').innerText = 'A Receber: + ' + formatBRL(pendR);
    document.getElementById('summary-a-pagar').innerText   = 'A Pagar: - ' + formatBRL(pendD);
    
    const projEl = document.getElementById('summary-projetado');
    if (projEl) {
        projEl.innerText = 'Saldo Projetado: ' + formatBRL(saldoProjetado);
        if (saldoProjetado >= 0) {
            projEl.classList.remove('danger');
            projEl.classList.add('success');
        } else {
            projEl.classList.remove('success');
            projEl.classList.add('danger');
        }
    }
}

// ==================== FILTERS ====================
function filterByTipo(el, tipo) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active'); activeFilters.tipo = tipo; renderAll();
}
function filterSearch(term) { activeFilters.searchTerm = term; renderAll(); }
function toggleFilterPopover() { 
    const popover = document.getElementById('filter-popover');
    const isHidden = popover.classList.contains('hidden');
    if (isHidden) {
        loadAllFilters();
    }
    popover.classList.toggle('hidden'); 
}
function togglePopoverSection(headerEl) {
    headerEl.classList.toggle('open');
    const content = headerEl.nextElementSibling;
    content.classList.toggle('hidden');
}
function clearFilters() {
    document.querySelectorAll('.filter-cat-cb, .filter-conta-cb, .filter-orig-cb, .filter-status-cb, .filter-tag-cb').forEach(cb => cb.checked = false);
    activeFilters.categoria=[]; activeFilters.conta=[]; activeFilters.origem=[]; activeFilters.status=[]; activeFilters.tags=[];
    document.getElementById('filter-popover').classList.add('hidden'); renderAll();
}
function applyFilters() {
    activeFilters.categoria = Array.from(document.querySelectorAll('.filter-cat-cb:checked')).map(cb => cb.value);
    activeFilters.conta     = Array.from(document.querySelectorAll('.filter-conta-cb:checked')).map(cb => cb.value);
    activeFilters.origem    = Array.from(document.querySelectorAll('.filter-orig-cb:checked')).map(cb => cb.value);
    activeFilters.status    = Array.from(document.querySelectorAll('.filter-status-cb:checked')).map(cb => cb.value);
    activeFilters.tags       = Array.from(document.querySelectorAll('.filter-tag-cb:checked')).map(cb => cb.value);
    document.getElementById('filter-popover').classList.add('hidden'); renderAll();
}

function removeFilterBadge(type, value) {
    if (activeFilters[type] && Array.isArray(activeFilters[type])) {
        activeFilters[type] = activeFilters[type].filter(s => {
            if (type === 'origem') {
                let sVal = s === 'receita' ? 'Receita' : s === 'despesa' ? 'Despesa' : s === 'investimento' ? 'Investimento' : 'Transferência';
                return s !== value && sVal !== value;
            }
            return s !== value;
        });
        
        let cbs = [];
        if (type === 'status') cbs = document.querySelectorAll('.filter-status-cb');
        if (type === 'categoria') cbs = document.querySelectorAll('.filter-cat-cb');
        if (type === 'conta') cbs = document.querySelectorAll('.filter-conta-cb');
        if (type === 'origem') cbs = document.querySelectorAll('.filter-orig-cb');
        if (type === 'tags') cbs = document.querySelectorAll('.filter-tag-cb');
        
        cbs.forEach(cb => { 
            let mapVal = type === 'origem' ? (cb.value === 'receita' ? 'Receita' : cb.value === 'despesa' ? 'Despesa' : cb.value === 'investimento' ? 'Investimento' : 'Transferência') : cb.value;
            if (cb.value === value || mapVal === value) cb.checked = false; 
        });
    }
    renderAll();
}

function renderActiveFilters() {
    const container = document.getElementById('active-filters-tags');
    const badge = document.getElementById('filter-badge');
    if (!container || !badge) return;

    let activeCount = 0;
    container.innerHTML = '';

    const addTag = (type, label, value) => {
        activeCount++;
        const span = document.createElement('span');
        span.className = 'filter-tag';
        span.innerHTML = '<strong>' + label + ':</strong> ' + value + ' <i data-lucide="x" onclick="removeFilterBadge(\'' + type + '\', \'' + value + '\')"></i>';
        container.appendChild(span);
    };

    if (activeFilters.categoria && activeFilters.categoria.length > 0) activeFilters.categoria.forEach(s => addTag('categoria', 'Categoria', s));
    if (activeFilters.conta && activeFilters.conta.length > 0) activeFilters.conta.forEach(s => addTag('conta', 'Conta', s));
    if (activeFilters.tags && activeFilters.tags.length > 0) activeFilters.tags.forEach(s => addTag('tags', 'Tag', s));
    if (activeFilters.origem && activeFilters.origem.length > 0) {
        activeFilters.origem.forEach(s => {
            let orText = s === 'receita' ? 'Receita' : s === 'despesa' ? 'Despesa' : s === 'investimento' ? 'Investimento' : 'Transferência';
            addTag('origem', 'Origem', orText);
        });
    }
    if (activeFilters.status && activeFilters.status.length > 0) activeFilters.status.forEach(s => addTag('status', 'Status', s));

    if (activeCount > 0) {
        container.classList.remove('hidden');
        badge.classList.remove('hidden');
        badge.innerText = activeCount;
    } else {
        container.classList.add('hidden');
        badge.classList.add('hidden');
    }
}

document.addEventListener('click', function(e) {
    const btn = document.getElementById('filter-btn'), pop = document.getElementById('filter-popover');
    if (btn && pop && !btn.contains(e.target) && !pop.contains(e.target)) pop.classList.add('hidden');
    
    const gbtn = document.getElementById('group-btn'), gpop = document.getElementById('group-popover');
    if (gbtn && gpop && !gbtn.contains(e.target) && !gpop.contains(e.target)) gpop.classList.add('hidden');
    
    closeAllMenus(e);
});

// ==================== ROW ACTIONS ====================
function editTransaction(id) {
    const t = transactions.find(x => x.id === id); if (!t) return;
    editingId = id; resetModal();
    const tabEl = document.getElementById('tab-' + t.tipo);
    if (tabEl) switchTab(t.tipo, tabEl);
    const vStr = t.valorStr || t.valor.toFixed(2).replace('.', ',');
    const fillSel = (sid, text) => {
        const s = document.getElementById(sid); if (!s || !text) return;
        for (let i = 0; i < s.options.length; i++) if (s.options[i].text.includes(text)) { s.selectedIndex = i; break; }
    };
    const fillStatus = (gid, txt) => {
        const g = document.getElementById(gid); if (!g) return;
        g.querySelectorAll('.status-option').forEach(b => { const sp=b.querySelector('span'); b.classList.toggle('active', sp&&sp.innerText===txt); });
    };
    const loadTags = (containerId, tags) => {
        const container = document.getElementById(containerId);
        if (!container || !tags) return;
        container.innerHTML = '';
        tags.forEach(tagName => {
            const pill = document.createElement('span');
            pill.className = 'tag-pill';
            pill.innerHTML = `${tagName} <i data-lucide="x" onclick="removeTag(this)"></i>`;
            container.appendChild(pill);
        });
    };
    if (t.tipo==='despesa') { document.getElementById('d-valor').value=vStr; document.getElementById('d-titulo').value=t.titulo; document.getElementById('d-data').value=t.data; fillSel('d-conta',t.conta); fillSel('d-categoria',t.categoria); fillStatus('d-status',t.status); loadTags('d-tags', t.tags); }
    else if (t.tipo==='receita') { document.getElementById('r-valor').value=vStr; document.getElementById('r-titulo').value=t.titulo; document.getElementById('r-data').value=t.data; fillSel('r-conta',t.conta); fillSel('r-categoria',t.categoria); fillStatus('r-status',t.status); loadTags('r-tags', t.tags); }
    else if (t.tipo==='investimento') { document.getElementById('i-valor').value=vStr; document.getElementById('i-desc').value=t.titulo; document.getElementById('i-data').value=t.data; fillSel('i-categoria',t.categoria); loadTags('i-tags', t.tags); }
    else if (t.tipo==='transferencia') { document.getElementById('t-valor').value=vStr; document.getElementById('t-data').value=t.data; fillSel('t-origem', (t.titulo.split('→')[0] || '').trim()); fillSel('t-destino', (t.titulo.split('→')[1] || '').trim()); updateTransferAccounts(); loadTags('t-tags', t.tags); }
    document.getElementById('modal-title').innerText = 'Editar lançamento';
    document.getElementById('btn-submit').innerText  = 'Confirmar';
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden'; lucide.createIcons();
}
function toggleDisable(id) {
    const t = transactions.find(x=>x.id===id); if (!t) return;
    t.disabled = !t.disabled; renderAll(); saveTransactions();
    showToast(t.disabled ? 'Lançamento inativado.' : 'Lançamento reativado.');
}
function toggleExcludeReports(id) {
    const t = transactions.find(x=>x.id===id); if (!t) return;
    t.excludeFromReports = !t.excludeFromReports; renderAll(); saveTransactions();
    showToast(t.excludeFromReports ? 'Lançamento ignorado' : 'Lançamento reconsiderado');
}
function toggleRowMenu(id, evt) {
    evt.stopPropagation();
    const menu = document.getElementById('rm-'+id); if (!menu) return;
    const wasHidden = menu.classList.contains('hidden');
    closeAllMenus(); if (wasHidden) menu.classList.remove('hidden');
}

function toggleGroupPopover() {
    closeAllMenus();
    const pop = document.getElementById('group-popover');
    if (pop) pop.classList.toggle('hidden');
}

function setGrouping(val, el) {
    currentGrouping = val;
    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
        item.style.color = '#ADADB0';
        item.querySelector('.group-check').classList.add('hidden');
    });
    el.classList.add('active');
    el.style.color = '#FFF';
    el.querySelector('.group-check').classList.remove('hidden');
    
    // Update button text
    const btnText = document.getElementById('group-btn-text');
    if (btnText) {
        btnText.innerText = el.querySelector('span').innerText;
    }
    
    document.getElementById('group-popover').classList.add('hidden');
    renderAll();
}

function closeAllMenus(evt) {
    const t = evt ? evt.target : null;
    document.querySelectorAll('.row-menu').forEach(m => { if (!t || !m.contains(t)) m.classList.add('hidden'); });
}

// ==================== REALIZE MODAL ====================
let currentRealizeId = null;
function openRealizeModal(id) {
    currentRealizeId = id;
    const t = transactions.find(x => x.id === id);
    if (!t) return;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('realize-data').value = today;
    const vStr = t.valor.toFixed(2).replace('.', ',');
    document.getElementById('realize-valor').value = vStr;
    document.getElementById('realize-modal').style.display = 'flex';
}
function closeRealizeModal() {
    document.getElementById('realize-modal').style.display = 'none';
    currentRealizeId = null;
}
function confirmRealize() {
    if (!currentRealizeId) return;
    const dataObj = document.getElementById('realize-data');
    const valorObj = document.getElementById('realize-valor');
    if (!dataObj.value || !valorObj.value) return;
    
    const t = transactions.find(x => x.id === currentRealizeId);
    if (!t) return;
    
    t.valorStr = valorObj.value;
    t.valor = parseBRL(t.valorStr);
    const dateParts = dataObj.value.split('-');
    t.data = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
    t.status = t.tipo === 'despesa' ? 'Pago' : 'Recebido';
    
    renderAll(); saveTransactions();
    closeRealizeModal();
    showToast('Lançamento efetivado com sucesso!');
}

// ==================== DELETE MODAL ====================
let deletingId = null;
function openDeleteModal(id) {
    deletingId = id; const t = transactions.find(x=>x.id===id);
    if (t) document.getElementById('delete-modal-title').innerText = t.titulo;
    document.getElementById('delete-modal-overlay').classList.add('active');
}
function closeDeleteModal() { document.getElementById('delete-modal-overlay').classList.remove('active'); deletingId=null; }
function confirmDelete() {
    if (!deletingId) return;
    const idx = transactions.findIndex(x=>x.id===deletingId);
    if (idx !== -1) transactions.splice(idx, 1);
    closeDeleteModal(); renderAll(); saveTransactions(); showToast('Lançamento excluído com sucesso.');
}

// ==================== BULK SELECTION ====================
function onCheckboxChange() {
    const checked = document.querySelectorAll('.row-checkbox:checked');
    document.getElementById('bulk-count').innerText = checked.length + ' selecionado' + (checked.length!==1?'s':'');
    document.getElementById('bulk-action-bar').classList.toggle('hidden', checked.length===0);
}
function selectAll(masterCb) {
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = masterCb.checked); onCheckboxChange();
}
function clearSelection() {
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked=false);
    const mc = document.getElementById('master-checkbox'); if (mc) mc.checked=false;
    document.getElementById('bulk-action-bar').classList.add('hidden');
}
function bulkDelete() {
    const ids = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb=>cb.dataset.tid);
    if (!ids.length) return;
    ids.forEach(id => { const i=transactions.findIndex(x=>x.id===id); if(i!==-1) transactions.splice(i,1); });
    clearSelection(); renderAll(); saveTransactions(); loadAllFilters(); showToast(ids.length+' lançamento(s) excluído(s).');
}
function bulkChangeCategory() {
    const cat = prompt('Nova categoria:'); if (!cat) return;
    Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb=>cb.dataset.tid).forEach(id => {
        const t=transactions.find(x=>x.id===id); if(t) t.categoria=cat;
    });
    clearSelection(); renderAll(); saveTransactions(); loadAllFilters(); showToast('Categoria atualizada!');
}

// ==================== DATE PICKER MODAL ====================
let calCurrentMonth = new Date().getMonth();
let calCurrentYear = new Date().getFullYear();

const monthShortNames = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
function openDatePicker() {
    document.getElementById('date-picker-modal').style.display = 'flex';
    calCurrentMonth = currentFilterDateRange ? parseInt(currentFilterDateRange.start.split('-')[1],10)-1 : currentFilterMonth - 1;
    calCurrentYear = currentFilterDateRange ? parseInt(currentFilterDateRange.start.split('-')[0],10) : currentFilterYear;
    renderCustomCalendar();
}

function changeCalendarMonth(delta) {
    calCurrentMonth += delta;
    if (calCurrentMonth < 0) { calCurrentMonth = 11; calCurrentYear--; }
    else if (calCurrentMonth > 11) { calCurrentMonth = 0; calCurrentYear++; }
    renderCustomCalendar();
}

function syncCalendarFromInputs() { renderCustomCalendar(); }

function selectCalDay(y, m, d) {
    const sInput = document.getElementById('dp-start');
    const eInput = document.getElementById('dp-end');
    const sVal = sInput.value;
    const eVal = eInput.value;
    
    const ds = String(d).padStart(2, '0');
    const ms = String(m + 1).padStart(2, '0');
    const clickedDateStr = y + '-' + ms + '-' + ds;
    
    if (!sVal || (sVal && eVal)) {
        sInput.value = clickedDateStr;
        eInput.value = '';
    } else if (sVal && !eVal) {
        if (new Date(clickedDateStr+'T00:00:00') < new Date(sVal+'T00:00:00')) {
            eInput.value = sVal;
            sInput.value = clickedDateStr;
        } else {
            eInput.value = clickedDateStr;
        }
    }
    renderCustomCalendar();
}

function renderCustomCalendar() {
    const sVal = document.getElementById('dp-start').value;
    const eVal = document.getElementById('dp-end').value;
    let sTime = sVal ? new Date(sVal + 'T00:00:00').getTime() : null;
    let eTime = eVal ? new Date(eVal + 'T00:00:00').getTime() : null;
    
    document.getElementById('calendar-month-label').innerText = MONTH_NAMES[calCurrentMonth] + ' ' + calCurrentYear;
    
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';
    
    const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
    const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    
    for(let i=0; i<firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'cal-day cal-day-empty';
        daysContainer.appendChild(emptyDiv);
    }
    
    for(let i=1; i<=daysInMonth; i++) {
        const dDiv = document.createElement('div');
        dDiv.className = 'cal-day';
        dDiv.innerText = i;
        dDiv.onclick = () => selectCalDay(calCurrentYear, calCurrentMonth, i);
        
        const padM = String(calCurrentMonth+1).padStart(2,'0');
        const padD = String(i).padStart(2,'0');
        const thisTime = new Date(calCurrentYear + '-' + padM + '-' + padD + 'T00:00:00').getTime();
        
        if (sTime && eTime) {
            if (thisTime === sTime && thisTime === eTime) dDiv.classList.add('cal-selected-single');
            else if (thisTime === sTime) dDiv.classList.add('cal-selected-start');
            else if (thisTime === eTime) dDiv.classList.add('cal-selected-end');
            else if (thisTime > sTime && thisTime < eTime) dDiv.classList.add('cal-in-range');
        } else if (sTime) {
            if (thisTime === sTime) dDiv.classList.add('cal-selected-single');
        } else if (eTime) {
            if (thisTime === eTime) dDiv.classList.add('cal-selected-single');
        }
        
        daysContainer.appendChild(dDiv);
    }
}

function closeDatePicker() {
    document.getElementById('date-picker-modal').style.display = 'none';
}
function clearDatePicker(evt) {
    if(evt) evt.stopPropagation();
    currentFilterDateRange = null;
    document.getElementById('dp-start').value = '';
    document.getElementById('dp-end').value = '';
    
    document.getElementById('classic-month-selector').classList.remove('hidden');
    document.getElementById('date-range-badge').classList.add('hidden');
    
    closeDatePicker();
    renderAll();
}
function applyDatePicker() {
    const s = document.getElementById('dp-start').value;
    const e = document.getElementById('dp-end').value;
    if (!s || !e) { showToast('Preencha as duas datas.'); return; }
    if (new Date(s) > new Date(e)) { showToast('Início não pode ser maior que o fim.'); return; }
    
    currentFilterDateRange = { start: s, end: e };
    
    const [sy, sm, sd] = s.split('-');
    const [ey, em, ed] = e.split('-');
    
    const sStr = parseInt(sd, 10) + ' ' + monthShortNames[parseInt(sm,10)-1] + ' ' + sy.slice(-2);
    const eStr = parseInt(ed, 10) + ' ' + monthShortNames[parseInt(em,10)-1] + ' ' + ey.slice(-2);
    
    document.getElementById('date-range-text').innerText = sStr + ' até ' + eStr;
    
    document.getElementById('classic-month-selector').classList.add('hidden');
    document.getElementById('date-range-badge').classList.remove('hidden');
    
    closeDatePicker();
    renderAll();
}

// ==================== TOAST ====================
function showToast(msg) {
    const t = document.getElementById('toast');
    t.style.borderColor=''; 
    const icon = t.querySelector('i') || t.querySelector('svg');
    if (icon) icon.style.color='';
    document.getElementById('toast-message').innerText = msg;
    t.classList.remove('toast-hidden'); t.classList.add('toast-visible');
    setTimeout(() => { t.classList.remove('toast-visible'); t.classList.add('toast-hidden'); }, 3500);
}
function showToastError(msg) {
    const t = document.getElementById('toast');
    t.style.borderColor='#EF4444'; 
    const icon = t.querySelector('i') || t.querySelector('svg');
    if (icon) icon.style.color='#EF4444';
    document.getElementById('toast-message').innerText = msg;
    t.classList.remove('toast-hidden'); t.classList.add('toast-visible');
    setTimeout(() => {
        t.classList.remove('toast-visible'); t.classList.add('toast-hidden');
        setTimeout(() => { t.style.borderColor=''; if(icon) icon.style.color=''; }, 400);
    }, 3000);
}

// ==================== DYNAMIC FILTERS ====================
function loadFilterCategories() {
    const container = document.querySelector('#fp-categorias .popover-section-content');
    if (!container) return;
    
    let categories = [];
    try {
        const stored = localStorage.getItem('hub_categories');
        if (stored) {
            categories = JSON.parse(stored).filter(c => c.status === 'ativa');
        }
    } catch (e) { console.error('Erro ao carregar categorias:', e); }
    
    if (categories.length === 0) {
        categories = DEFAULT_CATEGORIES_DATA;
    }
    
    const uniqueNames = [...new Set(categories.map(c => c.nome))];
    container.innerHTML = uniqueNames.map(nome => 
        `<label class="cb-filter-label"><input type="checkbox" value="${nome}" class="filter-cat-cb"> ${nome}</label>`
    ).join('');
}

function loadFilterAccounts() {
    const container = document.querySelector('#fp-contas .popover-section-content');
    if (!container) return;
    
    const uniqueAccounts = [...new Set(transactions.map(t => t.conta).filter(c => c))];
    
    if (uniqueAccounts.length === 0) {
        uniqueAccounts.push('Banco do Brasil', 'Nubank PJ', 'Itaú PF', 'Caixa Econômica', 'Bradesco Empresas', 'C6 Bank');
    }
    
    container.innerHTML = uniqueAccounts.map(nome => 
        `<label class="cb-filter-label"><input type="checkbox" value="${nome}" class="filter-conta-cb"> ${nome}</label>`
    ).join('');
}

function loadFilterTags() {
    const container = document.querySelector('#fp-tags .popover-section-content');
    if (!container) return;
    
    let allTags = [];
    try {
        const stored = localStorage.getItem('hub_tags');
        if (stored) {
            allTags = JSON.parse(stored).filter(t => t.status === 'ativa').map(t => t.nome);
        }
    } catch (e) { console.error('Erro ao carregar tags:', e); }
    
    if (allTags.length === 0) {
        const tagNames = transactions.flatMap(t => t.tags || []).filter(Boolean);
        allTags = [...new Set(tagNames)];
    }
    
    if (allTags.length === 0) {
        container.innerHTML = '<div style="color:#6B6B70;font-size:12px;padding:8px;">Nenhuma tag encontrada</div>';
    } else {
        container.innerHTML = allTags.map(nome => 
            `<label class="cb-filter-label"><input type="checkbox" value="${nome}" class="filter-tag-cb"> ${nome}</label>`
        ).join('');
    }
}

function loadAllFilters() {
    loadFilterCategories();
    loadFilterAccounts();
    loadFilterTags();
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    // Load transactions from localStorage or use defaults
    const storedTransactions = localStorage.getItem('hub_transactions');
    if (storedTransactions) {
        transactions.length = 0;
        JSON.parse(storedTransactions).forEach(t => transactions.push(t));
    } else {
        localStorage.setItem('hub_transactions', JSON.stringify(transactions));
    }
    
    function saveTransactions() {
        localStorage.setItem('hub_transactions', JSON.stringify(transactions));
    }
    
    window.saveTransactions = saveTransactions;
    
    loadAllFilters();
    
    updateMonthDisplay();

    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('conta_filter')) {
        const cf = urlParams.get('conta_filter').toLowerCase().trim();
        let found = false;
        document.querySelectorAll('.filter-conta-cb').forEach(cb => {
            const textLabel = cb.parentNode.textContent.toLowerCase().trim();
            if (textLabel.includes(cf) || cf.includes(textLabel)) {
                cb.checked = true;
                found = true;
            }
        });
    }
    
    if (urlParams.has('categoria')) {
        const catFilter = urlParams.get('categoria').toLowerCase().trim();
        document.querySelectorAll('.filter-cat-cb').forEach(cb => {
            const textLabel = cb.parentNode.textContent.toLowerCase().trim();
            const cbValue = cb.value.toLowerCase().trim();
            if (textLabel.includes(catFilter) || catFilter.includes(textLabel) || cbValue.includes(catFilter) || catFilter.includes(cbValue)) {
                cb.checked = true;
            }
        });
    }
    
    if (urlParams.has('dataInicio') && urlParams.has('dataFim')) {
        const dataInicio = urlParams.get('dataInicio');
        const dataFim = urlParams.get('dataFim');
        document.getElementById('start-date').value = dataInicio;
        document.getElementById('end-date').value = dataFim;
        document.getElementById('date-range-badge').classList.remove('hidden');
        document.getElementById('classic-month-selector').classList.add('hidden');
        
        const startDate = new Date(dataInicio);
        const endDate = new Date(dataFim);
        const options = { day: 'numeric', month: 'short', year: '2-digit' };
        document.getElementById('date-range-text').textContent = 
            `${startDate.toLocaleDateString('pt-BR', options)} até ${endDate.toLocaleDateString('pt-BR', options)}`;
        
        currentFilterDateRange = { start: dataInicio, end: dataFim };
    }
    
    if (urlParams.has('tipo')) {
        const tipoFilter = urlParams.get('tipo').toUpperCase();
        if (tipoFilter === 'SAIDA') {
            document.querySelectorAll('.filter-type-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.toUpperCase().includes('SAIDA')) {
                    btn.classList.add('active');
                }
            });
            activeFilters.tipo = 'despesa';
        } else if (tipoFilter === 'ENTRADA') {
            document.querySelectorAll('.filter-type-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.toUpperCase().includes('ENTRADA')) {
                    btn.classList.add('active');
                }
            });
            activeFilters.tipo = 'receita';
        }
    }
    
    if (urlParams.has('categoria') || urlParams.has('dataInicio') || urlParams.has('conta_filter') || urlParams.has('tipo')) {
        applyFilters();
    } else {
        renderAll();
    }
});
