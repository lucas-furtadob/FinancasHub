# Design: Orçamento Mensal

## Visão Geral
Tela para controle de orçamento por categoria de despesa, com histórico mensal, totalizadores e insight de IA.

## Estrutura da Página

### Cabeçalho
- Título: "Orçamento Mensal"
- Seletor de mês: mesmo componente do index.html (chevron-left/right + mês/ano)
- Botão "Copiar Orçamento": abre modal para selecionar mês de origem
- Botão "Nova Categoria": abre modal para adicionar orçamento

### Totalizadores (4 cards)
| Card | Descrição |
|------|-----------|
| Total Orçado | Soma dos `valor_planejado` de todas as categorias do mês |
| Total Gasto | Soma dos `gasto_real_periodo` de todas as categorias |
| Restante | `Total Orçado - Total Gasto` |
| Status | `% usado = Total Gasto / Total Orçado` |

### Insight IA
- Box destacado abaixo dos totalizadores
- Ícone de "lâmpada" (lucide: lightbulb)
- Texto gerado por IA analisando padrões do mês
- Sugestões práticas baseadas nos dados

### Lista de Orçamentos por Categoria
Cada item (card ou linha) mostra:
- Nome da categoria + ícone + cor
- **Barra de progresso**: visualização gráfica do % usado
- **Valores**: Gasto | Orçado | Restante
- **Alerta**: ícone de warning se `gasto >= alerta_percentual × valor_planejado`
- **Estouro**: destaque em vermelho se `gasto_real > valor_planejado`
- Ações: editar, arquivar

## Modal: Novo/Editar Orçamento

### Campos
| Campo | Tipo | Validação |
|-------|------|-----------|
| Categoria | Dropdown com busca | Obrigatório; apenas categorias com `tipo = despesa` |
| Valor Planejado | Número (R$) | Obrigatório; >= 0 |
| Alerta Ativo | Toggle | Opcional |
| Alerta Percentual | Número (%) | Obrigatório se alerta ativo; 0 < valor <= 100 |

### Validações de Negócio
- Unicidade: apenas um orçamento ativo por (categoria_id, mês, ano)
- Categoria deve ser do tipo despesa

## Modal: Copiar Orçamento

### Fluxo
1. Usuário clica em "Copiar Orçamento"
2. Abre modal com dropdown para selecionar mês de origem
3. Ao confirmar, copia todos os orçamentos do mês selecionado para o mês atual
4. Se já existirem orçamentos no mês destino, pergunta se deseja sobrescrever ou mesclar

## Dados e Armazenamento

### Estrutura localStorage
```javascript
{
  "hub_orcamentos": [
    {
      "id": "orc_123",
      "categoria_id": "da",
      "ano": 2026,
      "mes": 3,
      "valor_planejado": 800,
      "alerta_ativo": true,
      "alerta_percentual": 80,
      "status": "ativo" // ativo, arquivado
    }
  ]
}
```

### Cálculo de Gasto Real
Para um mês MM/AAAA:
- Buscar lançamentos de despesa na categoria (e descendentes)
- Filtrar por data dentro do mês
- Somar valores

## UI/UX

### Cores e Estilos
- Seguir variáveis CSS existentes (var(--accent), etc.)
- Barra de progresso: verde (< 75%), amarelo (75-99%), vermelho (>= 100%)
- Insight box: fundo destacado (ex: rgba de cor accent)

### Componentes
- Usar mesma estrutura de modais de categorias.js
- Reutilizar icon-selector de categorias
- Seguir padrão de estilos de categorias.css

## Navegação
- Menu: Planejamento > Orçamento Mensal
- Link: orcamento.html (criar arquivo)
