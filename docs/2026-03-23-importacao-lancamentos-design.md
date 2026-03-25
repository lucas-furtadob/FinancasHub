# Design: Fluxo de Importação de Lançamentos

## Visão Geral
Permitir que o usuário importe lançamentos financeiros de arquivos CSV e OFX para o sistema, com mapeamento flexível de colunas e validações completas.

## Fontes Suportadas
- **CSV**: delimitador ponto-e-vírgula
- **OFX/QFX**: formato padrão de extrato bancário

---

## Fluxo de Importação

### 1. Modal Inicial
Ao clicar no botão "Importar" existente:
- **Seleção de conta**: dropdown com contas cadastradas (obrigatório)
- **Tipo de arquivo**: radio buttons para CSV ou OFX
- **Selecionar arquivo**: input file accepting .csv, .ofx, .qfx
- Botão "Próximo" para processar

### 2. Modal de Mapeamento (apenas para CSV)
- **Resumo**: total de lançamentos, somatório receita, somatório despesas
- **Lista mapeada**: todos os lançamentos em formato de tabela
- **Colunas do arquivo**: listar colunas detectadas no CSV
- **Campos do sistema**: dropdown para cada campo:
  - Data
  - Título
  - Valor
  - Categoria (obrigatório)
  - Status
  - Tag
  - Tipo de lançamento (obrigatório)
  - Forma de pagamento

### 3. Validações e Verificações
- **Campos obrigatórios**:
  - Tipo (sempre obrigatório)
  - Valor (sempre obrigatório)
  - Data (sempre obrigatória)
  - Categoria (sempre obrigatória)
  - Título (obrigatório para despesa/receita)
- **Categorias não existentes**: sinalizar para criar automaticamente
- **Datas inválidas**: sinalizar com alerta visual
- **Duplicados/Conciliação**: comparar Data + Valor → verificar se já existe no sistema

### 4. Resultado
- Resumo: X importados, Y erros/inconsistências, Z duplicados
- Opção de importar apenas válidos ou revisar

### 5. Processamento OFX
- Sem modal de mapeamento (colunas padrão do OFX)
- Detectar tipo pelo sinal do valor:
  - Positivo = receita
  - Negativo = despesa
- Mesmas validações e conciliação

---

## Componentes UI

### Modal de Importação
- Container com header, body, footer
- Steps: Seleção → Mapeamento → Resultado
- Validação por passo

### Tabela de Preview
- Exibir todos os registros mapeados
- Status visual por registro (ok, erro, duplicado)
- Ícones de alerta para problemas

### Badges de Resumo
- Total de linhas
- Total receita (verde)
- Total despesa (vermelho)
- Registros duplicados (amarelo)
- Registros com erro (vermelho)

---

## Integração com Código Existente

### Estrutura de Dados
Lançamento:
```javascript
{
  id: string,
  titulo: string,
  conta: string,
  categoria: string,
  data: string,    // DD/MM/YYYY
  status: string,  // Pendente, Pago, Recebido, Realizado
  valor: number,
  valorStr: string,
  tipo: string,    // despesa, receita, investimento, transferencia
  tags: string[],
  formaPagamento: string,
  disabled: boolean,
  excludeFromReports: boolean
}
```

###Funções Utilitárias Existentes
- `parseBRL(s)` - converter string BRL para número
- `formatBRL(v)` - formatar número para BRL
- `parseDateTs(d)` - converter data para timestamp
- `generateId()` - gerar ID único
- `transactions` - array global de lançamentos

### Validações
1. **Duplicados**: `transactions.some(t => parseDateTs(t.data) === parseDateTs(novaData) && t.valor === novoValor)`
2. **Categoria**: verificar se existe em `categorias` (se houver lista)
3. **Data**: validar formato DD/MM/YYYY

---

## Critérios de Sucesso
- [ ] Usuário consegue importar CSV com mapeamento de colunas
- [ ] Usuário consegue importar OFX sem mapeamento
- [ ] Validação de campos obrigatórios funcionando
- [ ] Detecção de duplicados por Data + Valor
- [ ] Detecção de categorias inexistentes
- [ ] Detecção de datas inválidas
- [ ] Resumo com totais correto
- [ ] Integração com sistema existente sem breaking changes
