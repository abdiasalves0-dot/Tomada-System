# Guia de Diagramação, Distribuição e Estilo de Elementos - Tomada System

Este documento estabelece as regras obrigatórias de **diagramação**, **grid**, **hierarquia visual**, **distribuição de informações** e **formatos de elementos UI** do sistema Tomada.

---

## 1. Diagramação e Layout Padrão (Grid System)

Todo o sistema Tomada utiliza um layout fluido e altamente responsivo. NENHUMA aba nova pode ser criada sem respeitar a estrutura de contêineres abaixo.

### 1.1. Container Principal da Aba
```html
<div class="main-content">
  <!-- 1. Cabeçalho de Título & Badge de Usuário -->
  <div class="header-dashboard">
    <div>
      <h1 class="page-title">Título da Aba</h1>
      <p class="page-subtitle">Subtítulo descritivo da página explicativo sobre o contexto</p>
    </div>
    <div class="creator-profile-badge">
      <div class="avatar">A</div>
      <span class="profile-name">Nome do Usuário</span>
    </div>
  </div>

  <!-- 2. Barra de Switchers / Sub-abas (Opcional, quando houver sub-visões) -->
  <div class="cs-period-selector-container" style="margin-bottom: 24px;">
    <div class="cs-period-selector-desktop">
      <div class="cs-period-slider" id="period-slider"></div>
      <button class="cs-period-btn active" onclick="trocarSubAba('visao1')">Visão Principal</button>
      <button class="cs-period-btn" onclick="trocarSubAba('visao2')">Segunda Visão</button>
    </div>
  </div>

  <!-- 3. Grade Principal de Conteúdo (2 Colunas: 2fr | 1fr) -->
  <div class="grid-dashboard">
    <!-- Coluna Principal (Esquerda - 66% da largura) -->
    <div class="grid-main-col">
      <!-- Card Bento Principal -->
      <div class="card">
        <div class="card-title">
          <span><i data-lucide="layers"></i> Listagem Principal</span>
          <button class="btn-primary" onclick="abrirNovoModal()">
            <i data-lucide="plus"></i> Novo Item
          </button>
        </div>
        
        <!-- Conteúdo / Lista -->
        <div class="card-body-list" id="lista-conteudo">
          <!-- Itens dinâmicos -->
        </div>
      </div>
    </div>

    <!-- Coluna Lateral (Direita - 33% da largura: Filtros & Widgets) -->
    <div class="grid-sidebar-col">
      <!-- Widget 1: Resumo / KPIs -->
      <div class="card">
        <h4 class="card-title"><i data-lucide="bar-chart-3"></i> Resumo Rápido</h4>
        <div class="kpi-mini-grid">
          <div class="kpi-item">
            <span class="kpi-number">12</span>
            <span class="kpi-label">Ativos</span>
          </div>
          <div class="kpi-item">
            <span class="kpi-number">98%</span>
            <span class="kpi-label">Taxa Sucesso</span>
          </div>
        </div>
      </div>

      <!-- Widget 2: Ações Rápidas -->
      <div class="card">
        <h4 class="card-title"><i data-lucide="zap"></i> Ações Rápidas</h4>
        <div class="action-buttons-stack">
          <button class="btn-secondary full-width" onclick="exportarRelatorio()">
            <i data-lucide="download"></i> Exportar Dados
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 2. Regras de Distribuição de Informação

1. **Raciocínio Z & F Pattern**:
   * O título e status do usuário sempre no **canto superior esquerdo/direito**.
   * Ações primárias (ex: botões `+ Criar`, `+ Novo`) ficam sempre no **topo dos cards**, alinhadas à direita.
   * Filtros e tabelas de busca ocupam a **coluna da esquerda (2fr)**.
   * Resumos, métricas secundárias e atalhos ficam na **coluna da direita (1fr)**.

2. **Espaçamento e Ritmo Vertical**:
   * `gap: 24px` a `32px` entre seções principais.
   * `gap: 16px` entre cards individuais.
   * `padding: 24px` dentro de qualquer `.card`.
   * `padding: 16px` dentro de itens individuais de listas (`.project-item`, `.card-item`).

---

## 3. Estilo dos Elementos UI (Componentes Padrão)

### 3.1. Cards Bento (.card)
* **Fundo**: `var(--bg-card)` (`#FFFFFF`)
* **Borda**: `1px solid var(--separator)` (`#EBE5DF`)
* **Arredondamento**: `var(--radius-lg)` (`16px`)
* **Sombra**: `var(--shadow-sm)`
* **Hover**: Transição de elevação `transform: translateY(-2px)` com sombra `var(--shadow-md)`

### 3.2. Botões (.btn-primary & .btn-secondary)
* **Primary Button**:
  ```css
  background: var(--primary); /* #E55A2B */
  color: #FFFFFF;
  border-radius: var(--radius-md); /* 12px */
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  ```
* **Secondary Button**:
  ```css
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--separator);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-weight: 500;
  ```

### 3.3. Badges de Status (.badge)
Os status de itens devem utilizar badges pílula arredondados (`var(--radius-full)`):
* **Pendente / Em Espera**: Fundo `rgba(245, 158, 11, 0.12)`, Texto `#D97706`
* **Em Produção / Ativo**: Fundo `rgba(229, 90, 43, 0.12)`, Texto `#E55A2B`
* **Concluído / Sucesso**: Fundo `rgba(16, 185, 129, 0.12)`, Texto `#059669`
* **Cancelado / Erro**: Fundo `rgba(239, 68, 68, 0.12)`, Texto `#DC2626`

### 3.4. Inputs e Selects Formulário (.form-control / .p-input)
* **Fundo**: `#FFFFFF` ou `var(--bg-card)`
* **Borda**: `1px solid var(--separator)`
* **Focus State**: `border-color: var(--primary)`, `box-shadow: 0 0 0 3px rgba(229, 90, 43, 0.15)`
* **Border Radius**: `var(--radius-md)` (`12px`)

---

## 4. Checklist para a IA ao Criar uma Nova Aba

Quando for solicitado criar uma nova aba ou funcionalidade:
- [ ] O layout possui `header-dashboard` no topo?
- [ ] A distribuição usa `grid-dashboard` (coluna 2fr + 1fr)?
- [ ] As cores usadas vêm estritamente de `variables.css`?
- [ ] Os botões de ação usam `btn-primary` com o tom `#E55A2B`?
- [ ] Todos os modais/popups abertos usam a estrutura com `backdrop-filter: blur(4px)` e `Components.showModal`?
- [ ] O código utiliza ícones do `lucide-react` / `lucide.createIcons()`?
