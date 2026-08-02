/**
 * Orçamentos Module - SPA Controller & CRUD
 * Bancada - Sistema de Gestão para Marcenaria
 *
 * Os campos de busca de Cliente e Produto usam as classes globais
 * .cliente-search-field / .cliente-dropdown / .cliente-dropdown-item
 * (definidas no styles.css principal), o MESMO padrão usado no modal
 * "Editar Tarefa" do Cronograma (ver cronograma.tasks.js,
 * _clienteSearchHTML / _initClienteSearch / _initProdutoSearch).
 * Isso garante visual 100% idêntico sem duplicar CSS.
 */

const Orcamentos = {
  viewMode: 'lista', // 'lista' ou 'kanban'
  subTab: 'orcamentos', // 'orcamentos' ou 'contratos'
  searchTerm: '',
  orcamentos: [],
  clientes: [],
  produtos: [],
  contratos: [],
  activeOrcamento: null, // Para edição ou visualização
  activeContrato: null,
  mobileViewMode: 'dashboard',
  hideValue: false,

  renderStyles() {
    if (document.getElementById('orcamentos-custom-styles')) return;
    const style = document.createElement('style');
    style.id = 'orcamentos-custom-styles';
    style.innerHTML = `
      /* Header & Navigation custom alignment */
      .orc-header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      /* KPI grid */
      .orc-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .orc-kpi-card {
        background: #FFFFFF;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        position: relative;
        border: 1px solid rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 110px;
      }
      
      .orc-kpi-card.highlight {
        background: #E55A2B;
        color: #FFFFFF;
      }
      
      .orc-kpi-label {
        font-size: 12px;
        font-weight: 600;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .orc-kpi-card.highlight .orc-kpi-label {
        color: rgba(255,255,255,0.8);
      }
      
      .orc-kpi-val {
        font-size: 28px;
        font-weight: 800;
        color: #1A1A1A;
        margin: 8px 0 4px 0;
      }
      
      .orc-kpi-card.highlight .orc-kpi-val {
        color: #FFFFFF;
      }
      
      .orc-kpi-sub {
        font-size: 13px;
        color: #6B7280;
      }
      
      .orc-kpi-card.highlight .orc-kpi-sub {
        color: rgba(255,255,255,0.7);
      }
      
      .orc-kpi-icon {
        position: absolute;
        top: 16px;
        right: 16px;
        font-size: 16px;
        color: #9CA3AF;
      }
      
      .orc-kpi-card.highlight .orc-kpi-icon {
        color: rgba(255,255,255,0.9);
      }
      
      /* Filter controls bar */
      .orc-filters-bar {
        background: #FFFFFF;
        border-radius: 12px;
        padding: 12px 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 16px;
      }
      
      /* Toggle switches */
      .orc-toggle-group {
        background: #F3F4F6;
        padding: 4px;
        border-radius: 10px;
        display: flex;
        gap: 4px;
        border: 1px solid rgba(0,0,0,0.05);
      }
      
      .orc-toggle-btn {
        border: none;
        background: transparent;
        padding: 6px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #4B5563;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .orc-toggle-btn.active {
        background: #FFFFFF;
        color: #1A1A1A;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }
      
      /* Primary and Action buttons */
      .orc-btn-primary {
        background: #E55A2B;
        color: #FFFFFF;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }
      
      .orc-btn-primary:hover {
        background: #C94A1E;
        transform: translateY(-1px);
      }
      
      .orc-search-wrapper {
        position: relative;
        flex: 1;
        max-width: 320px;
      }
      
      .orc-search-input {
        width: 100%;
        background: #F3F4F6;
        border: 1px solid rgba(0,0,0,0.05);
        border-radius: 8px;
        padding: 8px 12px 8px 36px;
        font-size: 13px;
        outline: none;
        transition: all 0.2s;
      }
      
      .orc-search-input:focus {
        background: #FFFFFF;
        border-color: #E55A2B;
        box-shadow: 0 0 0 3px rgba(229,90,43,0.15);
      }
      
      .orc-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9CA3AF;
        width: 16px;
        height: 16px;
      }
      
      /* Badges styling */
      .orc-badge {
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .orc-badge-rascunho { background: #F3F4F6; color: #4B5563; }
      .orc-badge-enviado { background: #FEF3C7; color: #D97706; }
      .orc-badge-aprovado { background: #DCFCE7; color: #16A34A; }
      .orc-badge-em_producao { background: #FFEDD5; color: #EA580C; }
      .orc-badge-concluido { background: #DBEAFE; color: #2563EB; }
      .orc-badge-cancelado { background: #FEE2E2; color: #DC2626; }
      
      /* Tab bar & Tab button styles */
      .hig-tab-bar {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(0,0,0,0.06);
        padding-bottom: 0px;
        font-family: var(--font-main);
      }
      
      .hig-tab-btn {
        background: none;
        border: none;
        font-size: 15px;
        font-weight: 700;
        color: var(--text-secondary, #7A7567);
        cursor: pointer;
        padding: 8px 16px;
        border-bottom: 3px solid transparent;
        transition: var(--transition, all 0.2s);
        margin-bottom: -1px;
        border-radius: 8px 8px 0 0;
      }
      
      .hig-tab-btn:hover {
        color: var(--primary, #E55A2B);
        background-color: rgba(229, 90, 43, 0.04);
      }
      
      .hig-tab-btn.active {
        color: var(--primary, #E55A2B);
        border-bottom-color: var(--primary, #E55A2B);
      }

      /* Contratos custom styles */
      .orc-badge-enviado_para_assinatura { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
      .orc-badge-assinado_por_uma_parte { background: rgba(37, 99, 235, 0.1); color: #2563EB; }
      .orc-badge-assinado_por_ambas { background: rgba(16, 185, 129, 0.1); color: var(--success); }
      
      .contrato-warning-banner {
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid var(--warning);
        border-radius: var(--radius-md);
        padding: 14px 16px;
        color: var(--text-main);
        font-size: 13px;
        font-family: var(--font-main);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
        text-align: left;
        line-height: 1.5;
      }
      .contrato-warning-banner i {
        margin-top: 2px;
        flex-shrink: 0;
        width: 18px;
        height: 18px;
        color: var(--warning);
      }
      
      /* Table container & actions */
      .orc-table-container {
        background: #FFFFFF;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.05);
        box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        overflow: hidden;
      }
      
      .orc-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      
      .orc-table th {
        background: #F9FAFB;
        color: #6B7280;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }
      
      .orc-table td {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(0,0,0,0.04);
        font-size: 13px;
        color: #1F2937;
        vertical-align: middle;
      }
      
      .orc-table tbody tr {
        transition: background-color 0.15s;
      }
      
      .orc-table tbody tr:hover {
        background-color: rgba(229,90,43,0.04);
      }
      
      .orc-client-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .orc-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #E55A2B;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
      }
      
      .orc-validade-vencida {
        color: #EF4444 !important;
        font-weight: 700;
      }
      
      .orc-actions-btn {
        background: transparent;
        border: none;
        color: #6B7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
        margin-right: 4px;
      }
      
      .orc-actions-btn:hover {
        background: #F3F4F6;
        color: #111827;
      }
      
      .orc-actions-btn.delete:hover {
        background: #FEE2E2;
        color: #DC2626;
      }
      
      /* ============================================================
         KANBAN — restilizado no padrão visual do Cronograma
         (cards brancos com sombra leve, header de coluna com fundo
         branco e borda inferior laranja, contador em pill cinza,
         coluna em fundo levemente off-white em vez de cinza F3F4F6)
         ============================================================ */
      .orc-kanban-board {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 16px;
        align-items: stretch;
      }
      
      .orc-kanban-col {
        flex: 1;
        min-width: 240px;
        background: #FAFAF8;
        border-radius: 14px;
        padding: 0;
        border: 1px solid rgba(0,0,0,0.06);
        max-height: calc(100vh - 300px);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      
      .orc-kanban-col-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 14px 12px 12px;
        background: #FFFFFF;
        border-radius: 14px 14px 0 0;
        border-bottom: 3px solid transparent;
        position: sticky;
        top: 0;
        z-index: 1;
      }
      
      .orc-kanban-col-header.is-current {
        border-bottom-color: #E55A2B;
      }
      
      .orc-kanban-col-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #9CA3AF;
        letter-spacing: 0.06em;
      }
      
      .orc-kanban-col-header.is-current .orc-kanban-col-title {
        color: #E55A2B;
      }
      
      .orc-kanban-col-count {
        font-size: 22px;
        font-weight: 800;
        color: #1A1A1A;
        line-height: 1;
      }
      
      .orc-kanban-col-header.is-current .orc-kanban-col-count {
        color: #E55A2B;
      }
      
      .orc-kanban-col-body {
        padding: 12px;
        min-height: 160px;
        flex: 1;
      }
      
      .orc-kanban-card {
        background: #FFFFFF;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        border: 1px solid rgba(0,0,0,0.05);
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .orc-kanban-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 14px rgba(0,0,0,0.07);
        border-color: rgba(229,90,43,0.35);
      }
      
      .orc-card-code {
        font-size: 11px;
        color: #9CA3AF;
        font-weight: 600;
        margin-bottom: 6px;
      }
      
      .orc-card-title {
        font-size: 13px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .orc-card-price {
        font-size: 18px;
        font-weight: 800;
        color: #E55A2B;
        margin-bottom: 12px;
      }
      
      .orc-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(0,0,0,0.05);
        padding-top: 10px;
        margin-top: 10px;
        font-size: 11px;
        color: #6B7280;
      }
      
      .orc-kanban-empty {
        font-size: 12px;
        color: #C4C4C0;
        text-align: center;
        padding: 24px 8px;
        font-style: italic;
      }
      
      /* Drag-and-drop — feedback visual ao arrastar cards entre colunas */
      .orc-kanban-card[draggable="true"] {
        cursor: grab;
      }
      
      .orc-kanban-card.is-dragging {
        opacity: 0.4;
        cursor: grabbing;
      }
      
      .orc-kanban-col-body.is-drag-over {
        background: rgba(229,90,43,0.06);
        outline: 2px dashed rgba(229,90,43,0.4);
        outline-offset: -4px;
        border-radius: 8px;
      }
      
      /* ============================================================
         MODAL — restilizado no padrão beige/cards (igual ao
         modal "Nova Tarefa" do Cronograma): fundo creme, labels
         com ícone + uppercase, inputs arredondados beige claro,
         seções agrupadas em "cartões" com borda suave.
         ============================================================ */
      .orc-modal-layout {
        display: flex;
        gap: 24px;
        min-height: 480px;
        background: #F5F3EC;
        padding: 4px;
        border-radius: 12px;
      }
      
      .orc-modal-left {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .orc-modal-right {
        flex: 1.2;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .orc-modal-card {
        background: #FFFFFF;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.06);
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      
      .orc-modal-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 700;
        color: #8A8775;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      
      .orc-modal-card-title i {
        width: 15px;
        height: 15px;
        color: #C9810F;
      }
      
      /* Form inputs styling — fundo beige claro, igual ao Cronograma */
      .orc-field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        position: relative;
      }
      
      .orc-field-group label {
        font-size: 11px;
        font-weight: 700;
        color: #6B6A5C;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        min-height: 28px;
        display: flex;
        align-items: flex-end;
      }
      
      .orc-input, .orc-textarea, .orc-modal-layout select {
        width: 100%;
        background: #F1EFE4;
        border: 1px solid #E3E0D2;
        border-radius: 8px;
        padding: 9px 12px;
        font-size: 13px;
        color: #1A1A1A;
        outline: none;
        box-sizing: border-box;
        transition: all 0.2s;
      }
      
      .orc-input:focus, .orc-textarea:focus, .orc-modal-layout select:focus {
        background: #FFFFFF;
        border-color: #E55A2B;
        box-shadow: 0 0 0 3px rgba(229,90,43,0.15);
      }
      
      .orc-textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .orc-total-section {
        margin-top: 16px;
        border-top: 2px solid #E3E0D2;
        padding: 16px;
        background: #FAF9F5;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
      }
      
      .orc-total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        font-size: 13px;
        color: #6B6A5C;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .orc-total-row.grand-total {
        color: #E55A2B;
        font-size: 22px;
        font-weight: 800;
        border-top: 2px dashed #E3E0D2;
        padding-top: 12px;
        margin-top: 4px;
      }
      
      /* Modal footer buttons — preto (cancelar) + laranja (salvar),
         igual ao padrão "Cancelar / Salvar Tarefa" */
      .orc-modal-btn-cancel {
        background: #FFFFFF;
        color: #1A1A1A;
        border: 1px solid #E3E0D2;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .orc-modal-btn-cancel:hover {
        background: #F5F3EC;
      }
      
      .orc-modal-btn-outline {
        background: #FFFFFF;
        color: #E55A2B;
        border: 1px solid #E55A2B;
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .orc-modal-btn-outline:hover {
        background: rgba(229,90,43,0.06);
      }
      
      /* Printable preview modal layout */
      .orc-preview-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 16px;
        padding: 40px;
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #1E293B;
        box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        max-width: 100%;
        box-sizing: border-box;
      }
      
      .orc-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      
      .orc-preview-logo svg {
        display: block;
        width: 160px;
        height: auto;
      }
      
      .orc-preview-company-info {
        text-align: right;
        font-size: 13px;
        color: #64748B;
        line-height: 1.5;
      }
      
      .orc-preview-company-info h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: #1E293B;
        font-weight: 700;
      }
      
      .orc-preview-company-info p {
        margin: 0;
      }
      
      .orc-preview-divider {
        border-bottom: 1px solid #E2E8F0;
        margin: 24px 0;
      }
      
      .orc-preview-client-project-section {
        margin-bottom: 24px;
      }
      
      .orc-preview-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .orc-preview-title-row h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
        color: #D85A30;
      }
      
      .orc-preview-date-badge {
        font-size: 12px;
        font-weight: 600;
        background: #F1F5F9;
        color: #475569;
        padding: 6px 12px;
        border-radius: 9999px;
      }
      
      .orc-preview-client-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        font-size: 14px;
        color: #334155;
        background: #F8FAFC;
        padding: 16px;
        border-radius: 12px;
      }
      
      .orc-preview-section-title {
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        color: #475569;
        margin-bottom: 12px;
        letter-spacing: 0.05em;
      }
      
      .orc-preview-items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      
      .orc-preview-items-table th {
        background: #F8FAFC;
        font-size: 12px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        padding: 10px 14px;
        border-bottom: 2px solid #E2E8F0;
        text-align: left;
      }
      
      .orc-preview-items-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #F1F5F9;
        font-size: 13px;
        color: #334155;
      }
      
      .orc-preview-summary-container {
        display: flex;
        justify-content: space-between;
        gap: 40px;
        margin-top: 20px;
      }
      
      .orc-preview-terms-col {
        flex: 1.2;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        font-size: 13px;
        color: #475569;
        background: #F8FAFC;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #E2E8F0;
        height: fit-content;
      }
      
      .orc-preview-term-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .orc-preview-term-item strong {
        font-size: 11px;
        text-transform: uppercase;
        color: #64748B;
        letter-spacing: 0.05em;
      }
      
      .orc-preview-term-item span {
        font-size: 13.5px;
        color: #1E293B;
        font-weight: 500;
      }
      
      .orc-preview-values-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: flex-end;
      }
      
      .orc-preview-value-row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 13px;
        color: #64748B;
      }
      
      .orc-preview-value-row strong {
        color: #1E293B;
      }
      
      .orc-preview-value-row.discount-row strong {
        color: #EF4444;
      }
      
      .orc-preview-total-box {
        width: 100%;
        background: #FFF3F0;
        border: 1px solid #FFD3C4;
        border-radius: 12px;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        margin-top: 8px;
        box-sizing: border-box;
      }
      
      .orc-preview-total-box .total-label {
        font-size: 11px;
        font-weight: 700;
        color: #D85A30;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      
      .orc-preview-total-box .total-value {
        font-size: 26px;
        font-weight: 800;
        color: #D85A30;
      }
      
      .orc-preview-notes {
        font-size: 13px;
        line-height: 1.6;
        color: #475569;
        background: #F8FAFC;
        padding: 16px;
        border-radius: 12px;
        border-left: 4px solid #D85A30;
      }
      
      .orc-preview-signature-section {
        margin-top: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 32px;
        font-size: 13px;
        color: #475569;
      }
      
      .signature-line-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 320px;
        gap: 6px;
      }
      
      .signature-line {
        width: 100%;
        border-bottom: 1px solid #94A3B8;
      }
    `;
    document.head.appendChild(style);
  },

  setMobileViewMode(mode) {
    this.mobileViewMode = mode;
    this.searchTerm = '';
    const container = document.getElementById('page-container');
    if (container) {
      this.renderMobile(container);
    }
  },

  toggleMobileValue() {
    this.hideValue = !this.hideValue;
    localStorage.setItem('hide-orcamento-values', this.hideValue ? 'true' : 'false');
    const container = document.getElementById('page-container');
    if (container) {
      this.renderMobile(container);
    }
  },

  setSearchTermMobile(val, viewMode) {
    this.searchTerm = val;
    const container = document.getElementById('page-container');
    if (container) {
      const listContent = viewMode === 'lista' 
        ? this.renderMobileList(this.getFilteredOrcamentos())
        : this.renderMobileContratosList(this.getFilteredContratos());
      const innerContentEl = container.querySelector('.m-orc-inner-content');
      if (innerContentEl) {
        innerContentEl.innerHTML = listContent;
        Components.renderIcons();
      }
    }
  },

  renderMobile(container) {
    if (localStorage.getItem('hide-orcamento-values') === 'true') {
      this.hideValue = true;
    }
    const user = API.getUser() || { nome: 'Ben' };
    const filteredOrcamentos = this.getFilteredOrcamentos();
    const totalCount = this.orcamentos.length;
    const approvedSum = this.orcamentos.reduce((sum, o) => sum + (o.valor_total || 0), 0);
    const pendingCount = this.orcamentos.filter(o => ['Rascunho', 'Enviado'].includes(o.status)).length;

    // Get recent clients from recent budgets (max 4 distinct clients)
    const recentClients = [];
    const clientIdsSeen = new Set();
    const sortedOrcamentosDesc = [...this.orcamentos].sort((a, b) => new Date(b.data) - new Date(a.data));
    for (const o of sortedOrcamentosDesc) {
      if (o.clienteId && o.clienteNome && !clientIdsSeen.has(o.clienteId)) {
        clientIdsSeen.add(o.clienteId);
        recentClients.push({ id: o.clienteId, nome: o.clienteNome });
        if (recentClients.length >= 4) break;
      }
    }

    if (this.mobileViewMode === 'dashboard') {
      const displayValue = this.hideValue ? '••••••' : this.formatCurrency(approvedSum);
      
      let clientsAvatarsHtml = '';
      recentClients.forEach(c => {
        const initials = c.nome ? c.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C';
        clientsAvatarsHtml += `
          <button class="m-orc-client-btn" onclick="Orcamentos.openFormModal(null, '${c.id}', '${c.nome.replace(/'/g, "\\'")}')" aria-label="Criar para ${c.nome}">
            <div class="m-orc-client-avatar">${initials}</div>
            <span class="m-orc-client-name">${c.nome.split(' ')[0]}</span>
          </button>
        `;
      });
      
      if (recentClients.length === 0) {
        clientsAvatarsHtml = `<div class="m-orc-no-clients">Sem clientes recentes</div>`;
      }

      const recentActivities = sortedOrcamentosDesc.slice(0, 3);
      let activitiesHtml = '';
      recentActivities.forEach(o => {
        const statusColors = {
          'Rascunho': 'gray',
          'Enviado': 'orange',
          'Aprovado': 'green',
          'Recusado': 'red'
        };
        const color = statusColors[o.status] || 'gray';
        const displayTotal = this.hideValue ? '••••' : this.formatCurrency(o.valor_total || 0);
        activitiesHtml += `
          <div class="m-orc-activity-item" onclick="Orcamentos.openFormModal('${o.id}')">
            <div class="m-orc-activity-left">
              <div class="m-orc-activity-icon-box ${color}">
                <i data-lucide="${o.status === 'Aprovado' ? 'check-circle' : 'file-text'}" style="width: 18px; height: 18px;"></i>
              </div>
              <div class="m-orc-activity-info">
                <span class="m-orc-activity-title">${o.clienteNome || 'Cliente Sem Nome'}</span>
                <span class="m-orc-activity-subtitle">${o.codigo} • ${o.descricao || 'Sem descrição'}</span>
              </div>
            </div>
            <div class="m-orc-activity-right">
              <span class="m-orc-activity-value">${displayTotal}</span>
              <span class="m-orc-activity-status-badge ${color}">${o.status}</span>
            </div>
          </div>
        `;
      });

      if (recentActivities.length === 0) {
        activitiesHtml = `<div class="m-orc-no-activity">Nenhum orçamento cadastrado</div>`;
      }

      container.innerHTML = `
        <div class="m-orc-layout-shell">
          
          <!-- 1. Wallet Header Card -->
          <div class="m-orc-header-card">
            <div class="m-orc-header-top">
              <div class="m-orc-user-greet">
                <div class="m-orc-avatar-placeholder">${(user.nome || 'B').substring(0, 1).toUpperCase()}</div>
                <div class="m-orc-greet-text">
                  <span class="m-orc-greet-title">Olá, ${user.nome.split(' ')[0] || 'Parceiro'}!</span>
                  <span class="m-orc-greet-subtitle">Bem-vindo aos Orçamentos</span>
                </div>
              </div>
              <div class="m-orc-header-actions">
                <button class="m-orc-icon-btn grid-icon" onclick="Orcamentos.setMobileViewMode('lista')" aria-label="Visualizar Grid">
                  <i data-lucide="layout-grid" style="width: 18px; height: 18px;"></i>
                </button>
                <button class="m-orc-icon-btn" onclick="App.navigate('relatorios')" aria-label="Notificações">
                  <i data-lucide="bell" style="width: 18px; height: 18px;"></i>
                  <span class="m-orc-notif-badge"></span>
                </button>
              </div>
            </div>
            
            <div class="m-orc-balance-block">
              <div class="m-orc-balance-label-row">
                <span class="m-orc-balance-currency-pill">💵 BRL</span>
                <button class="m-orc-eye-btn" onclick="Orcamentos.toggleMobileValue()" aria-label="Alternar Visibilidade">
                  <i data-lucide="${this.hideValue ? 'eye-off' : 'eye'}" style="width: 16px; height: 16px;"></i>
                </button>
              </div>
              <div class="m-orc-balance-value">${displayValue}</div>
              <div class="m-orc-trend-pill">
                <i data-lucide="trending-up" style="width: 12px; height: 12px;"></i>
                <span>+4.8% este mês</span>
              </div>
            </div>
          </div>

          <!-- 2. Quick Actions Capsule -->
          <div class="m-orc-actions-container">
            <div class="m-orc-actions-capsule">
              <button class="m-orc-action-btn primary" onclick="Orcamentos.openChoiceModal()">
                <span>Novo</span>
                <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i>
              </button>
              
              <button class="m-orc-action-btn-middle" onclick="Orcamentos.setMobileViewMode('lista')">
                <i data-lucide="search" style="width: 18px; height: 18px;"></i>
              </button>
              
              <button class="m-orc-action-btn secondary" onclick="Orcamentos.setMobileViewMode('contratos')">
                <span>Contratos</span>
                <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </div>

          <!-- 3. Split Layout Grid (Clientes Recentes / Your Income Stats) -->
          <div class="m-orc-split-grid">
            
            <!-- Left Card: Clientes Recentes (Send Again style) -->
            <div class="m-orc-split-card left">
              <h3 class="m-orc-card-title">Novos Recentes</h3>
              <div class="m-orc-clients-list">
                ${clientsAvatarsHtml}
                <button class="m-orc-client-btn add-new" onclick="Orcamentos.openChoiceModal()" aria-label="Adicionar Novo">
                  <div class="m-orc-client-avatar add">
                    <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
                  </div>
                  <span class="m-orc-client-name">Novo</span>
                </button>
              </div>
            </div>

            <!-- Right Card: Your Income Mini-chart -->
            <div class="m-orc-split-card right">
              <h3 class="m-orc-card-title">Faturamento</h3>
              <div class="m-orc-income-meta">
                <span class="m-orc-income-label">Projeção</span>
                <span class="m-orc-income-val">${this.hideValue ? '••••' : this.formatCurrency(approvedSum * 0.7)}</span>
              </div>
              <div class="m-orc-mini-chart-box">
                <svg viewBox="0 0 100 35" class="m-orc-svg-chart">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#E55A2B" stop-opacity="0.25"></stop>
                      <stop offset="100%" stop-color="#E55A2B" stop-opacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M 0,25 C 20,22 40,28 50,15 C 65,8 80,18 100,5" fill="none" stroke="#E55A2B" stroke-width="2.5" stroke-linecap="round"></path>
                  <path d="M 0,25 C 20,22 40,28 50,15 C 65,8 80,18 100,5 L 100,35 L 0,35 Z" fill="url(#chartGrad)"></path>
                </svg>
                <div class="m-orc-mini-chart-badge">+2.10%</div>
              </div>
            </div>
          </div>

          <!-- 4. Atividades Recentes (Recent Activity) -->
          <div class="m-orc-activity-section">
            <div class="m-orc-activity-header">
              <h3 class="m-orc-section-title">Últimos Orçamentos</h3>
              <button class="m-orc-see-all-btn" onclick="Orcamentos.setMobileViewMode('lista')" aria-label="Ver todos">
                <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
              </button>
            </div>
            
            <div class="m-orc-activity-list">
              ${activitiesHtml}
            </div>
          </div>

        </div>
      `;
    } else if (this.mobileViewMode === 'lista') {
      const listContent = this.renderMobileList(filteredOrcamentos);
      
      container.innerHTML = `
        <div class="m-orc-layout-shell inner-view">
          <div class="m-orc-inner-header">
            <button class="m-orc-back-btn" onclick="Orcamentos.setMobileViewMode('dashboard')">
              <i data-lucide="chevron-left" style="width: 20px; height: 20px;"></i>
              <span>Dashboard</span>
            </button>
            <h2 class="m-orc-inner-title">Orçamentos</h2>
            <button class="m-orc-action-circle-btn" onclick="Orcamentos.openChoiceModal()" aria-label="Novo Orçamento">
              <i data-lucide="plus" style="width: 20px; height: 20px;"></i>
            </button>
          </div>

          <div class="m-orc-search-bar-row">
            <div class="m-orc-search-box">
              <i data-lucide="search" class="m-orc-search-icon"></i>
              <input type="text" class="m-orc-search-field" placeholder="Buscar orçamentos..." value="${this.searchTerm}" oninput="Orcamentos.setSearchTermMobile(this.value, 'lista')">
            </div>
          </div>

          <div class="m-orc-inner-content">
            ${listContent}
          </div>
        </div>
      `;
    } else if (this.mobileViewMode === 'contratos') {
      const filteredContratos = this.getFilteredContratos();
      const listContent = this.renderMobileContratosList(filteredContratos);
      
      container.innerHTML = `
        <div class="m-orc-layout-shell inner-view">
          <div class="m-orc-inner-header">
            <button class="m-orc-back-btn" onclick="Orcamentos.setMobileViewMode('dashboard')">
              <i data-lucide="chevron-left" style="width: 20px; height: 20px;"></i>
              <span>Dashboard</span>
            </button>
            <h2 class="m-orc-inner-title">Contratos</h2>
            <div style="width: 36px;"></div>
          </div>

          <div class="m-orc-search-bar-row">
            <div class="m-orc-search-box">
              <i data-lucide="search" class="m-orc-search-icon"></i>
              <input type="text" class="m-orc-search-field" placeholder="Buscar contratos..." value="${this.searchTerm}" oninput="Orcamentos.setSearchTermMobile(this.value, 'contratos')">
            </div>
          </div>

          <div class="m-orc-inner-content">
            ${listContent}
          </div>
        </div>
      `;
    }

    Components.renderIcons();
  },

  renderMobileList(orcList) {
    if (orcList.length === 0) {
      return Components.empty('search', 'Nenhum orçamento encontrado');
    }

    let html = '<div class="m-orc-list-container">';
    orcList.forEach(o => {
      const statusColors = {
        'Rascunho': 'gray',
        'Enviado': 'orange',
        'Aprovado': 'green',
        'Recusado': 'red'
      };
      const color = statusColors[o.status] || 'gray';
      const displayTotal = this.hideValue ? '••••' : this.formatCurrency(o.valor_total || 0);

      html += `
        <div class="m-orc-card-item">
          <div class="m-orc-card-top" onclick="Orcamentos.openFormModal('${o.id}')">
            <div class="m-orc-card-info">
              <span class="m-orc-card-title">${o.clienteNome || 'Cliente Sem Nome'}</span>
              <span class="m-orc-card-desc">${o.codigo} • ${o.descricao || 'Sem descrição'}</span>
              <span class="m-orc-card-date">Criado em: ${o.data ? o.data.split('-').reverse().join('/') : ''}</span>
            </div>
            <div class="m-orc-card-value-block">
              <span class="m-orc-card-value">${displayTotal}</span>
              <span class="m-orc-card-badge ${color}">${o.status}</span>
            </div>
          </div>
          <div class="m-orc-card-actions">
            <button class="m-orc-card-btn action" onclick="Orcamentos.openFormModal('${o.id}')">
              <i data-lucide="edit-2" style="width:13px;height:13px;margin-right:4px;"></i> Editar
            </button>
            <button class="m-orc-card-btn proposal" onclick="Orcamentos.openPreviewModal('${o.id}')">
              <i data-lucide="eye" style="width:13px;height:13px;margin-right:4px;"></i> Proposta
            </button>
            ${o.status === 'Aprovado' ? `
              <button class="m-orc-card-btn contract" onclick="Orcamentos.gerarContrato('${o.id}')">
                <i data-lucide="file-signature" style="width:13px;height:13px;margin-right:4px;"></i> Contrato
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  },

  renderMobileContratosList(contratoList) {
    if (contratoList.length === 0) {
      return Components.empty('file-text', 'Nenhum contrato encontrado');
    }

    let html = '<div class="m-orc-list-container">';
    contratoList.forEach(c => {
      const statusColors = {
        'Enviado para assinatura': 'orange',
        'Assinado por uma parte': 'blue',
        'Assinado por ambas': 'green',
        'Cancelado': 'red'
      };
      const color = statusColors[c.status] || 'gray';
      const displayTotal = this.hideValue ? '••••' : this.formatCurrency(c.valor || 0);

      html += `
        <div class="m-orc-card-item">
          <div class="m-orc-card-top" onclick="Orcamentos.openContratoDetailsModal('${c.id}')">
            <div class="m-orc-card-info">
              <span class="m-orc-card-title">${c.clienteNome || 'Contrato Sem Cliente'}</span>
              <span class="m-orc-card-desc">Contrato de ${c.codigo} • ${c.objeto || 'Serviços'}</span>
              <span class="m-orc-card-date">Emitido em: ${c.criadoEm ? c.criadoEm.split('T')[0].split('-').reverse().join('/') : ''}</span>
            </div>
            <div class="m-orc-card-value-block">
              <span class="m-orc-card-value">${displayTotal}</span>
              <span class="m-orc-card-badge ${color}" style="font-size: 9.5px;">${c.status}</span>
            </div>
          </div>
          <div class="m-orc-card-actions">
            <button class="m-orc-card-btn action" onclick="Orcamentos.openContratoDetailsModal('${c.id}')">
              <i data-lucide="info" style="width:13px;height:13px;margin-right:4px;"></i> Detalhes
            </button>
            ${c.pdfPath ? `
              <a href="${c.pdfPath}" target="_blank" class="m-orc-card-btn-link">
                <i data-lucide="download" style="width:13px;height:13px;margin-right:4px;"></i> PDF
              </a>
            ` : ''}
          </div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  },

  async render() {
    this.renderStyles();
    const container = document.getElementById('page-container');
    if (!container) return;

    // Carregar dados de Orçamentos, Clientes, Produtos e Contratos do servidor
    try {
      const [orcList, clientList, prodList, contratoList] = await Promise.all([
        API.get('/api/orcamentos'),
        API.get('/api/clientes'),
        API.get('/api/produtos'),
        API.get('/api/contratos').catch(() => [])
      ]);
      this.orcamentos = orcList;
      this.clientes = clientList;
      this.produtos = prodList.filter(p => p.ativo);
      this.contratos = contratoList || [];
    } catch (e) {
      console.error('Erro ao buscar dados na aba Orçamentos/Contratos:', e);
      Components.toast('Erro ao buscar dados do servidor. Exibindo dados locais.', 'error');
    }

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.renderMobile(container);
      return;
    }

    // Renderizar sub-tabs no topo
    let subTabHtml = `
      <div class="hig-tab-bar">
        <button class="hig-tab-btn ${this.subTab === 'orcamentos' ? 'active' : ''}" onclick="Orcamentos.setSubTab('orcamentos')">Orçamentos</button>
        <button class="hig-tab-btn ${this.subTab === 'contratos' ? 'active' : ''}" onclick="Orcamentos.setSubTab('contratos')">Contratos</button>
      </div>
    `;

    let viewHtml = '';
    
    if (this.subTab === 'orcamentos') {
      // Calcular KPIs de Orçamentos
      const filteredOrcamentos = this.getFilteredOrcamentos();
      const totalCount = this.orcamentos.length;
      const approvedSum = this.orcamentos.reduce((sum, o) => sum + (o.valor_total || 0), 0);
      const pendingCount = this.orcamentos.filter(o => ['Rascunho', 'Enviado'].includes(o.status)).length;
      const ticketMedio = totalCount > 0 ? approvedSum / totalCount : 0;

      let kpisHtml = `
        <div class="orc-kpi-grid">
          <div class="orc-kpi-card cascade-item" style="--index: 1;">
            <span class="orc-kpi-label">Total de Orçamentos</span>
            <span class="orc-kpi-val">${totalCount}</span>
            <span class="orc-kpi-sub">cadastrados no sistema</span>
            <span class="orc-kpi-icon">↗</span>
          </div>
          <div class="orc-kpi-card highlight cascade-item" style="--index: 2;">
            <span class="orc-kpi-label">Valor Total</span>
            <span class="orc-kpi-val">${this.formatCurrency(approvedSum)}</span>
            <span class="orc-kpi-sub">soma de todas as cotações</span>
            <span class="orc-kpi-icon">↗</span>
          </div>
          <div class="orc-kpi-card cascade-item" style="--index: 3;">
            <span class="orc-kpi-label">Aguardando Aprovação</span>
            <span class="orc-kpi-val">${pendingCount}</span>
            <span class="orc-kpi-sub">rascunhos e enviados</span>
            <span class="orc-kpi-icon">↗</span>
          </div>
          <div class="orc-kpi-card cascade-item" style="--index: 4;">
            <span class="orc-kpi-label">Ticket Médio</span>
            <span class="orc-kpi-val">${this.formatCurrency(ticketMedio)}</span>
            <span class="orc-kpi-sub">valor médio por proposta</span>
            <span class="orc-kpi-icon">↗</span>
          </div>
        </div>
      `;

      let filtersHtml = `
        <div class="orc-filters-bar cascade-item" style="--index: 5;">
          <div class="orc-toggle-group">
            <button class="orc-toggle-btn ${this.viewMode === 'lista' ? 'active' : ''}" onclick="Orcamentos.setViewMode('lista')">
              <i data-lucide="list"></i> Lista
            </button>
            <button class="orc-toggle-btn ${this.viewMode === 'kanban' ? 'active' : ''}" onclick="Orcamentos.setViewMode('kanban')">
              <i data-lucide="kanban"></i> Kanban
            </button>
          </div>
          
          <div style="display:flex; gap:16px; align-items:center; width:100%; justify-content:flex-end;">
            <div class="orc-search-wrapper">
              <i data-lucide="search" class="orc-search-icon"></i>
              <input type="text" class="orc-search-input" placeholder="Buscar por cliente, projeto..." value="${this.searchTerm}" oninput="Orcamentos.setSearchTerm(this.value)">
            </div>
            <button class="orc-btn-primary" onclick="Orcamentos.openChoiceModal()">
              <i data-lucide="plus"></i> Novo
            </button>
          </div>
        </div>
      `;

      let viewContent = this.viewMode === 'lista' ? this.renderList(filteredOrcamentos) : this.renderKanban(filteredOrcamentos);

      viewHtml = `
        ${kpisHtml}
        ${filtersHtml}
        <div id="orc-view-container">${viewContent}</div>
      `;
    } else {
      // Calcular KPIs de Contratos
      const filteredContratos = this.getFilteredContratos();
      const totalContratos = this.contratos.length;
      const pendingContratos = this.contratos.filter(c => ['Enviado para assinatura', 'Assinado por uma parte'].includes(c.status)).length;
      const signedContratos = this.contratos.filter(c => c.status === 'Assinado por ambas').length;
      const cancelledContratos = this.contratos.filter(c => c.status === 'Cancelado').length;

      let kpisHtml = `
        <div class="orc-kpi-grid">
          <div class="orc-kpi-card cascade-item" style="--index: 1;">
            <span class="orc-kpi-label">Total de Contratos</span>
            <span class="orc-kpi-val">${totalContratos}</span>
            <span class="orc-kpi-sub">gerados a partir de orçamentos</span>
            <span class="orc-kpi-icon"><i data-lucide="file-text" style="width: 20px; height: 20px;"></i></span>
          </div>
          <div class="orc-kpi-card highlight cascade-item" style="--index: 2;">
            <span class="orc-kpi-label">Assinados</span>
            <span class="orc-kpi-val">${signedContratos}</span>
            <span class="orc-kpi-sub">assinados por ambas as partes</span>
            <span class="orc-kpi-icon"><i data-lucide="check-circle" style="width: 20px; height: 20px;"></i></span>
          </div>
          <div class="orc-kpi-card cascade-item" style="--index: 3;">
            <span class="orc-kpi-label">Pendentes de Assinatura</span>
            <span class="orc-kpi-val">${pendingContratos}</span>
            <span class="orc-kpi-sub">enviados ou c/ uma assinatura</span>
            <span class="orc-kpi-icon"><i data-lucide="clock" style="width: 20px; height: 20px;"></i></span>
          </div>
          <div class="orc-kpi-card cascade-item" style="--index: 4;">
            <span class="orc-kpi-label">Cancelados</span>
            <span class="orc-kpi-val">${cancelledContratos}</span>
            <span class="orc-kpi-sub">contratos cancelados</span>
            <span class="orc-kpi-icon"><i data-lucide="x-circle" style="width: 20px; height: 20px;"></i></span>
          </div>
        </div>
      `;

      let filtersHtml = `
        <div class="orc-filters-bar cascade-item" style="--index: 5;">
          <span style="font-weight:700; font-size:15px; color:var(--text-main); font-family:var(--font-main);">Lista de Contratos</span>
          <div style="display:flex; gap:16px; align-items:center; width:100%; justify-content:flex-end;">
            <div class="orc-search-wrapper">
              <i data-lucide="search" class="orc-search-icon"></i>
              <input type="text" class="orc-search-input" placeholder="Buscar contratos..." value="${this.searchTerm}" oninput="Orcamentos.setSearchTerm(this.value)">
            </div>
          </div>
        </div>
      `;

      let viewContent = this.renderContratosList(filteredContratos);

      viewHtml = `
        ${kpisHtml}
        ${filtersHtml}
        <div id="orc-view-container">${viewContent}</div>
      `;
    }

    container.innerHTML = `
      <div style="padding: 24px;">
        ${subTabHtml}
        ${viewHtml}
      </div>
    `;

    Components.renderIcons();
  },

  setSubTab(tab) {
    this.subTab = tab;
    this.searchTerm = ''; // Limpar busca
    this.render();
  },

  setViewMode(mode) {
    if (this.viewMode === mode) return;

    // Toggle active state in buttons immediately for responsive feedback
    document.querySelectorAll('.orc-toggle-group .orc-toggle-btn').forEach(btn => {
      const isList = mode === 'lista' && btn.textContent.includes('Lista');
      const isKanban = mode === 'kanban' && btn.textContent.includes('Kanban');
      btn.classList.toggle('active', isList || isKanban);
    });

    const container = document.getElementById('orc-view-container');
    if (container && this.subTab === 'orcamentos') {
      container.classList.add('page-exit-active');
      setTimeout(() => {
        container.classList.remove('page-exit-active');
        this.viewMode = mode;
        const filtered = this.getFilteredOrcamentos();
        container.innerHTML = this.viewMode === 'lista' ? this.renderList(filtered) : this.renderKanban(filtered);
        Components.renderIcons();
      }, 180);
    } else {
      this.viewMode = mode;
      this.render();
    }
  },

  setSearchTerm(term) {
    this.searchTerm = term.trim().toLowerCase();
    const container = document.getElementById('orc-view-container');
    if (container) {
      if (this.subTab === 'orcamentos') {
        const filtered = this.getFilteredOrcamentos();
        container.innerHTML = this.viewMode === 'lista' ? this.renderList(filtered) : this.renderKanban(filtered);
      } else {
        const filtered = this.getFilteredContratos();
        container.innerHTML = this.renderContratosList(filtered);
      }
      Components.renderIcons();
    }
  },

  getFilteredOrcamentos() {
    if (!this.searchTerm) return this.orcamentos;
    return this.orcamentos.filter(o =>
      (o.codigo && o.codigo.toLowerCase().includes(this.searchTerm)) ||
      (o.clienteNome && o.clienteNome.toLowerCase().includes(this.searchTerm)) ||
      (o.descricao && o.descricao.toLowerCase().includes(this.searchTerm))
    );
  },

  getFilteredContratos() {
    if (!this.searchTerm) return this.contratos;
    return this.contratos.filter(c =>
      (c.codigo && c.codigo.toLowerCase().includes(this.searchTerm)) ||
      (c.clienteNome && c.clienteNome.toLowerCase().includes(this.searchTerm)) ||
      (c.orcamentoCodigo && c.orcamentoCodigo.toLowerCase().includes(this.searchTerm)) ||
      (c.projeto && c.projeto.toLowerCase().includes(this.searchTerm))
    );
  },

  renderList(orcList) {
    if (orcList.length === 0) {
      return Components.empty('file-text', 'Nenhum orçamento encontrado.');
    }

    const rows = orcList.map((o, idx) => {
      const isExpired = new Date(o.validade) < new Date() && o.status !== 'Aprovado' && o.status !== 'Concluído';
      const formattedDate = this.formatDate(o.data);
      const formattedValidade = this.formatDate(o.validade);
      const initials = o.clienteNome ? o.clienteNome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'CL';

      const animationIndex = Math.min(idx, 8) + 6;

      // Buscar se existe contrato para este orçamento
      const contrato = this.contratos.find(c => c.orcamentoId === o.id);
      let contratoCellHtml = '';
      if (contrato) {
        let badgeClass = 'rascunho';
        if (contrato.status === 'Enviado para assinatura') badgeClass = 'enviado_para_assinatura';
        else if (contrato.status === 'Assinado por uma parte') badgeClass = 'assinado_por_uma_parte';
        else if (contrato.status === 'Assinado por ambas') badgeClass = 'assinado_por_ambas';
        else if (contrato.status === 'Cancelado') badgeClass = 'cancelado';

        contratoCellHtml = `
          <button class="orc-badge orc-badge-${badgeClass}" style="border:none; cursor:pointer; font-weight:700; font-size:10px; padding:2px 8px;" onclick="Orcamentos.openContratoDetailsModal('${contrato.id}')" title="Ver Detalhes do Contrato">
            ${contrato.status}
          </button>
        `;
      } else if (o.status === 'Aprovado') {
        contratoCellHtml = `
          <button class="orc-btn-primary" style="padding:4px 8px; font-size:11px; border-radius:6px; font-weight:700; background:#4B5563;" onclick="Orcamentos.openCreateContratoModal('${o.id}')">
            Gerar Contrato
          </button>
        `;
      } else {
        contratoCellHtml = `<span style="color:#9CA3AF; font-size:12px; font-style:italic;">Não aprovado</span>`;
      }

      return `
        <tr class="cascade-item" style="--index: ${animationIndex};">
          <td><input type="checkbox" style="cursor:pointer;"></td>
          <td style="font-weight:700;color:var(--text-secondary);">${o.codigo}</td>
          <td>
            <div class="orc-client-cell">
              <div class="orc-avatar">${initials}</div>
              <span style="font-weight:700;">${o.clienteNome || 'Cliente Não Atribuído'}</span>
            </div>
          </td>
          <td>${o.descricao || '—'}</td>
          <td>${formattedDate}</td>
          <td style="font-weight:800;font-size:14px;color:#1A1A1A;">${this.formatCurrency(o.valor_total)}</td>
          <td><span class="orc-badge orc-badge-${o.status.toLowerCase().replace(' ', '_')}">${o.status}</span></td>
          <td>${contratoCellHtml}</td>
          <td class="${isExpired ? 'orc-validade-vencida' : ''}">${formattedValidade}</td>
          <td>
            <button class="orc-actions-btn" onclick="Orcamentos.openPreviewModal('${o.id}')" title="Visualizar Proposta"><i data-lucide="eye" style="width:16px;height:16px;"></i></button>
            <button class="orc-actions-btn" onclick="Orcamentos.openFormModal('${o.id}')" title="Editar Orçamento"><i data-lucide="edit-3" style="width:16px;height:16px;"></i></button>
            <button class="orc-actions-btn delete" onclick="Orcamentos.deleteBudget('${o.id}')" title="Excluir"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="orc-table-container">
        <table class="orc-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" style="cursor:pointer;"></th>
              <th>CÓDIGO</th>
              <th>CLIENTE</th>
              <th>DESCRIÇÃO</th>
              <th>DATA</th>
              <th>VALOR TOTAL</th>
              <th>STATUS</th>
              <th>CONTRATO</th>
              <th>VALIDADE</th>
              <th width="120">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Kanban por STATUS (estrutura inalterada), mas com o visual
   * restilizado no padrão do Kanban do Cronograma:
   * - header de coluna em destaque (fundo branco + contador grande)
   * - cards brancos levemente mais arredondados
   * - coluna em fundo off-white (#FAFAF8) em vez de cinza (#F3F4F6)
   */
  renderKanban(orcList) {
    const columns = ['Rascunho', 'Enviado', 'Aprovado', 'Em produção', 'Concluído'];
    const colContents = {};
    columns.forEach(col => { colContents[col] = []; });

    orcList.forEach(o => {
      if (colContents[o.status] !== undefined) {
        colContents[o.status].push(o);
      }
    });

    const columnsHtml = columns.map((col, colIdx) => {
      const cards = colContents[col];
      const cardsHtml = cards.map((o, cardIdx) => {
        const initials = o.clienteNome ? o.clienteNome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'CL';

        // Stagger card entrance animation based on column index and card index
        const cardAnimIndex = colIdx + Math.min(cardIdx, 4) + 6;

        return `
          <div class="orc-kanban-card cascade-item" style="--index: ${cardAnimIndex};" draggable="true" data-id="${o.id}" ondragstart="Orcamentos.handleDragStart(event, '${o.id}')" ondragend="Orcamentos.handleDragEnd(event)" onclick="Orcamentos.openPreviewModal('${o.id}')">
            <div class="orc-card-code">${o.codigo}</div>
            <div class="orc-card-title">${o.descricao}</div>
            <div class="orc-card-price">${this.formatCurrency(o.valor_total)}</div>
            <div class="orc-client-cell" style="margin-bottom:8px;">
              <div class="orc-avatar" style="width:22px;height:22px;font-size:9px;">${initials}</div>
              <span style="font-size:12px;font-weight:600;color:#4B5563;">${o.clienteNome}</span>
            </div>
            <div class="orc-card-footer">
              <span>Validade: ${this.formatDate(o.validade)}</span>
              <span class="orc-badge orc-badge-${o.status.toLowerCase().replace(' ', '_')}" style="padding:2px 8px;font-size:10px;">${o.status}</span>
            </div>
          </div>
        `;
      }).join('') || `<div class="orc-kanban-empty">Nenhum orçamento aqui</div>`;

      // Coluna "Aprovado" recebe destaque visual igual ao "dia atual" do Cronograma
      const isCurrent = col === 'Aprovado';

      return `
        <div class="orc-kanban-col">
          <div class="orc-kanban-col-header ${isCurrent ? 'is-current' : ''}">
            <span class="orc-kanban-col-title">${col}</span>
            <span class="orc-kanban-col-count">${cards.length}</span>
          </div>
          <div class="orc-kanban-col-body" data-status="${col}" ondragover="Orcamentos.handleDragOver(event)" ondragleave="Orcamentos.handleDragLeave(event)" ondrop="Orcamentos.handleDrop(event, '${col}')">
            ${cardsHtml}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="orc-kanban-board">
        ${columnsHtml}
      </div>
    `;
  },

  // ============================================================
  // Drag-and-drop dos cards do Kanban entre colunas de Status
  // ============================================================
  draggedId: null,

  handleDragStart(event, id) {
    this.draggedId = id;
    event.target.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  },

  handleDragEnd(event) {
    event.target.classList.remove('is-dragging');
    this.draggedId = null;
    document.querySelectorAll('.orc-kanban-col-body.is-drag-over').forEach(el => {
      el.classList.remove('is-drag-over');
    });
  },

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const colBody = event.currentTarget;
    if (!colBody.classList.contains('is-drag-over')) {
      colBody.classList.add('is-drag-over');
    }
  },

  handleDragLeave(event) {
    event.currentTarget.classList.remove('is-drag-over');
  },

  async handleDrop(event, novoStatus) {
    event.preventDefault();
    event.currentTarget.classList.remove('is-drag-over');

    const id = this.draggedId || event.dataTransfer.getData('text/plain');
    if (!id) return;

    const orcamento = this.orcamentos.find(o => o.id === id);
    if (!orcamento || orcamento.status === novoStatus) return;

    const statusAnterior = orcamento.status;
    orcamento.status = novoStatus;

    // Atualiza a UI imediatamente (otimista) e só então persiste
    const container = document.getElementById('orc-view-container');
    if (container) {
      container.innerHTML = this.renderKanban(this.getFilteredOrcamentos());
      Components.renderIcons();
    }

    try {
      await API.put(`/api/orcamentos/${id}`, orcamento);
      Components.toast(`Orçamento movido para "${novoStatus}".`, 'success');

      if (novoStatus === 'Aprovado') {
        this.checkApprovedWorkflow(orcamento);
      }
    } catch (e) {
      console.error(e);
      // Reverte em caso de falha na persistência
      orcamento.status = statusAnterior;
      if (container) {
        container.innerHTML = this.renderKanban(this.getFilteredOrcamentos());
        Components.renderIcons();
      }
      Components.toast('Erro ao mover orçamento. Tente novamente.', 'error');
    }
  },

  openChoiceModal() {
    this.renderStyles(); // Garante que os estilos customizados existam

    const contentHtml = `
      <div class="choice-modal-container" style="display: flex; gap: 16px; padding: 16px 8px; justify-content: center; flex-wrap: wrap; font-family: var(--font-main);">
        <div class="choice-card" onclick="Components.closeModal(); Orcamentos.openFormModal();" style="flex: 1; min-width: 180px; max-width: 220px; background: #FFFFFF; border: 1.5px solid var(--separator); border-radius: 16px; padding: 24px 16px; text-align: center; cursor: pointer; transition: all 0.2s ease-in-out; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <div class="choice-icon-box" style="width: 48px; height: 48px; border-radius: 50%; background: rgba(229, 90, 43, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center;">
            <i data-lucide="file-text" style="width: 24px; height: 24px;"></i>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">Orçamento</div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">Crie uma nova proposta comercial detalhada com itens e valores.</div>
        </div>
        
        <div class="choice-card" onclick="Components.closeModal(); Orcamentos.openSelectBudgetForContratoModal();" style="flex: 1; min-width: 180px; max-width: 220px; background: #FFFFFF; border: 1.5px solid var(--separator); border-radius: 16px; padding: 24px 16px; text-align: center; cursor: pointer; transition: all 0.2s ease-in-out; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <div class="choice-icon-box" style="width: 48px; height: 48px; border-radius: 50%; background: rgba(30, 75, 255, 0.1); color: #1E4BFF; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="file-signature" style="width: 24px; height: 24px;"></i>
          </div>
          <div style="font-size: 16px; font-weight: 700; color: var(--text-main);">Contrato</div>
          <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">Gere um contrato de prestação de serviços a partir de um orçamento aprovado.</div>
        </div>
      </div>
    `;

    Components.showModal('O que você deseja criar?', contentHtml, '', 'new-choice-modal');
    Components.renderIcons();

    // Injeta os estilos de hover dinâmicos
    const styleEl = document.getElementById('orcamentos-custom-styles');
    if (styleEl && !styleEl.innerHTML.includes('.choice-card:hover')) {
      styleEl.innerHTML += `
        .choice-card {
          transition: all 0.2s ease-in-out !important;
        }
        .choice-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
        }
        .choice-card:active {
          transform: translateY(-1px);
        }
      `;
    }
  },

  openSelectBudgetForContratoModal() {
    this.renderStyles();
    const approvedBudgets = this.orcamentos.filter(o => 
      o.status === 'Aprovado' && !this.contratos.some(c => c.orcamentoId === o.id)
    );

    if (approvedBudgets.length === 0) {
      const contentHtml = `
        <div style="text-align: center; padding: 32px 16px; font-family: var(--font-main);">
          <div style="font-size: 48px; margin-bottom: 16px; color: var(--text-secondary);">📝</div>
          <h4 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Nenhum Orçamento Aprovado Disponível</h4>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 24px; max-width: 320px; margin-left: auto; margin-right: auto;">
            Para gerar um contrato, você precisa primeiro de um orçamento com status <strong>Aprovado</strong> que ainda não possua um contrato de assinatura vinculado.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-secondary" onclick="Components.closeModal()">Fechar</button>
            <button class="btn" style="background: var(--primary); color:#FFF; border:none; padding:10px 20px; border-radius:12px; font-weight:700;" onclick="Components.closeModal(); Orcamentos.openFormModal();">Criar Orçamento</button>
          </div>
        </div>
      `;
      Components.showModal('Gerar Contrato', contentHtml);
      return;
    }

    let listHtml = '';
    approvedBudgets.forEach(o => {
      const formattedDate = this.formatDate(o.data);
      const total = this.formatCurrency(o.valor_total || 0);
      listHtml += `
        <div class="budget-select-item" onclick="Components.closeModal(); Orcamentos.openCreateContratoModal('${o.id}')" data-search="${(o.clienteNome || '').toLowerCase()} ${(o.codigo || '').toLowerCase()} ${(o.descricao || '').toLowerCase()}" style="padding: 12px 16px; background: #FFF; border: 1.5px solid var(--separator); border-radius: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
          <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">${o.clienteNome || 'Cliente Sem Nome'}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${o.codigo} • ${o.descricao || 'Sem descrição'}</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Aprovado em: ${formattedDate}</div>
          </div>
          <div style="text-align: right; flex-shrink: 0; margin-left: 12px;">
            <div style="font-size: 14px; font-weight: 800; color: var(--primary);">${total}</div>
            <span style="font-size: 10px; background: rgba(16, 185, 129, 0.1); color: #10B981; padding: 2px 6px; border-radius: 6px; font-weight: 700; margin-top: 4px; display: inline-block;">Aprovado</span>
          </div>
        </div>
      `;
    });

    const contentHtml = `
      <div style="font-family: var(--font-main); display: flex; flex-direction: column; gap: 16px;">
        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
          Selecione um dos orçamentos aprovados abaixo para gerar o contrato correspondente:
        </div>
        <div class="orc-search-wrapper" style="width: 100%; box-sizing: border-box; margin: 0;">
          <i data-lucide="search" class="orc-search-icon"></i>
          <input type="text" id="budget-search-input" class="orc-search-input" placeholder="Buscar por cliente, código ou projeto..." style="width: 100%; box-sizing: border-box;" oninput="Orcamentos.filterBudgetSelect(this.value)">
        </div>
        <div id="budget-select-list" style="max-height: 300px; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 4px;">
          ${listHtml}
        </div>
      </div>
    `;

    Components.showModal('Selecione o Orçamento Aprovado', contentHtml);
    Components.renderIcons();

    const styleEl = document.getElementById('orcamentos-custom-styles');
    if (styleEl && !styleEl.innerHTML.includes('.budget-select-item:hover')) {
      styleEl.innerHTML += `
        .budget-select-item {
          transition: all 0.2s ease !important;
        }
        .budget-select-item:hover {
          border-color: var(--primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .budget-select-item:active {
          transform: translateY(0);
        }
      `;
    }
  },

  filterBudgetSelect(query) {
    const q = query.trim().toLowerCase();
    const items = document.querySelectorAll('.budget-select-item');
    let visibleCount = 0;
    items.forEach(item => {
      const searchData = item.getAttribute('data-search') || '';
      if (searchData.includes(q)) {
        item.style.display = 'flex';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    let emptyMsg = document.getElementById('budget-select-empty');
    if (visibleCount === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement('div');
        emptyMsg.id = 'budget-select-empty';
        emptyMsg.style.cssText = 'text-align:center; padding: 24px; color: var(--text-secondary); font-size: 13px; font-family: var(--font-main);';
        emptyMsg.innerHTML = 'Nenhum orçamento aprovado corresponde à busca.';
        document.getElementById('budget-select-list').appendChild(emptyMsg);
      }
    } else if (emptyMsg) {
      emptyMsg.remove();
    }
  },

  // Modal Novo / Editar Orçamento
  openFormModal(id = null, preselectedClientId = null, preselectedClientNome = null) {
    this.activeOrcamento = id ? this.orcamentos.find(o => o.id === id) : {
      codigo: '',
      clienteId: preselectedClientId || '',
      clienteNome: preselectedClientNome || '',
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Rascunho',
      categoria: 'Cozinha',
      observacoes: '',
      marcenariaNome: 'Bancada Móveis Planejados',
      marcenariaDocumento: '12.345.678/0001-90',
      marcenariaTelefone: '(11) 99876-5432',
      marcenariaEmail: 'contato@bancadaplanejados.com.br',
      condicoesPagamento: '50% entrada, 50% na entrega',
      prazoEntrega: '30 dias úteis',
      itens: [],
      maoDeObra: 0,
      descontoPct: 0,
      incrementoPct: 0,
      valor_total: 0
    };

    const isEdit = !!id;
    const title = isEdit ? `Editar Orçamento ${this.activeOrcamento.codigo}` : 'Novo Orçamento';

    // Construir HTML do formulário modal de dois painéis — restilizado
    // no padrão beige/cards do modal "Nova Tarefa" do Cronograma.
    // Campos de busca (Cliente / Produto) usam as classes globais
    // .cliente-search-field / .cliente-dropdown, IDÊNTICAS às do
    // Cronograma (ver cronograma.tasks.js → _clienteSearchHTML).
    const contentHtml = `
      <div class="orc-modal-layout">
        <!-- Painel Esquerdo -->
        <div class="orc-modal-left">
          <div class="orc-modal-card">
            <div class="orc-modal-card-title"><i data-lucide="user"></i> Cliente e Projeto</div>

            <div class="orc-field-group">
              <label>Cliente</label>
              <div class="cliente-search-wrapper" id="orc-cliente-search-wrapper">
                <input type="hidden" id="form-cliente-id" value="${this.activeOrcamento.clienteId}">
                <div class="cliente-search-input-wrap">
                  <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    class="cliente-search-field${this.activeOrcamento.clienteNome ? ' has-value' : ''}"
                    id="form-cliente-search"
                    placeholder="Pesquisar cliente..."
                    value="${this.activeOrcamento.clienteNome}"
                    autocomplete="off"
                  >
                </div>
                <div class="cliente-dropdown" id="form-cliente-dropdown"></div>
              </div>
            </div>

            <div class="orc-field-group">
              <label>Descrição do Projeto</label>
              <textarea id="form-descricao" class="orc-textarea" placeholder="Ex: Cozinha planejada 3m">${this.activeOrcamento.descricao}</textarea>
            </div>

            <div class="orc-field-group">
              <label>Categoria do Projeto</label>
              <select id="form-categoria" class="orc-input trello-select">
                <option value="Cozinha" ${this.activeOrcamento.categoria === 'Cozinha' ? 'selected' : ''}>Cozinha</option>
                <option value="Quarto" ${this.activeOrcamento.categoria === 'Quarto' ? 'selected' : ''}>Quarto</option>
                <option value="Escritório" ${this.activeOrcamento.categoria === 'Escritório' ? 'selected' : ''}>Escritório</option>
                <option value="Outros" ${this.activeOrcamento.categoria === 'Outros' ? 'selected' : ''}>Outros</option>
              </select>
            </div>
          </div>

          <div class="orc-modal-card">
            <div class="orc-modal-card-title"><i data-lucide="calendar"></i> Agendamento e Status</div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="orc-field-group">
                <label>Data de Validade</label>
                <input type="date" id="form-validade" class="orc-input" value="${this.activeOrcamento.validade}">
              </div>

              <div class="orc-field-group">
                <label>Status</label>
                <select id="form-status" class="orc-input trello-select">
                  <option value="Rascunho" ${this.activeOrcamento.status === 'Rascunho' ? 'selected' : ''}>Rascunho</option>
                  <option value="Enviado" ${this.activeOrcamento.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                  <option value="Aprovado" ${this.activeOrcamento.status === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
                  <option value="Em produção" ${this.activeOrcamento.status === 'Em produção' ? 'selected' : ''}>Em produção</option>
                  <option value="Concluído" ${this.activeOrcamento.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                  <option value="Cancelado" ${this.activeOrcamento.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          <div class="orc-modal-card">
            <div class="orc-modal-card-title"><i data-lucide="credit-card"></i> Pagamento e Prazo</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="orc-field-group">
                <label>Condições de Pagamento</label>
                <input type="text" id="form-condicoes-pagamento" class="orc-input" placeholder="Ex: 50% entrada, 50% na entrega" value="${this.activeOrcamento.condicoesPagamento || '50% entrada, 50% na entrega'}">
              </div>
              <div class="orc-field-group">
                <label>Prazo Estimado de Execução</label>
                <input type="text" id="form-prazo-entrega" class="orc-input" readonly style="cursor: pointer;" placeholder="Ex: 30 dias úteis" value="${this.activeOrcamento.prazoEntrega || '30 dias úteis'}" onclick="Orcamentos.openPrazoPopover(event)">
              </div>
            </div>
          </div>

          <div class="orc-modal-card">
            <div class="orc-modal-card-title"><i data-lucide="align-left"></i> Observação</div>
            <div class="orc-field-group">
              <textarea id="form-observacoes" class="orc-textarea" placeholder="Notas sobre o orçamento...">${this.activeOrcamento.observacoes || ''}</textarea>
            </div>
          </div>
        </div>
        
        <!-- Painel Direito -->
        <div class="orc-modal-right">
          <div class="orc-modal-card">
            <div class="orc-modal-card-title"><i data-lucide="home"></i> Dados da Marcenaria</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="orc-field-group">
                <label>Nome do Negócio</label>
                <input type="text" id="form-marcenaria-nome" class="orc-input" placeholder="Ex: Bancada Móveis" value="${this.activeOrcamento.marcenariaNome || 'Bancada Móveis Planejados'}">
              </div>
              <div class="orc-field-group">
                <label>CPF ou CNPJ</label>
                <input type="text" id="form-marcenaria-documento" class="orc-input" placeholder="Ex: 12.345.678/0001-90" value="${this.activeOrcamento.marcenariaDocumento || '12.345.678/0001-90'}">
              </div>
              <div class="orc-field-group">
                <label>Telefone</label>
                <input type="text" id="form-marcenaria-telefone" class="orc-input" placeholder="Ex: (11) 99876-5432" value="${this.activeOrcamento.marcenariaTelefone || '(11) 99876-5432'}">
              </div>
              <div class="orc-field-group">
                <label>E-mail</label>
                <input type="text" id="form-marcenaria-email" class="orc-input" placeholder="Ex: contato@empresa.com" value="${this.activeOrcamento.marcenariaEmail || 'contato@bancadaplanejados.com.br'}">
              </div>
            </div>
          </div>

          <div class="orc-modal-card">
            <div class="orc-modal-card-title" style="margin:0;"><i data-lucide="briefcase"></i> Serviços do Orçamento</div>

            <div id="orc-itens-list" style="max-height: 250px; overflow-y: auto; display:flex; flex-direction:column; gap:10px; padding-right:4px;">
              <!-- Cards dos itens inseridos aqui via appendOrcItemCard -->
            </div>

            <!-- Busca de produto — FORA da área com scroll, exatamente
                 como o Cronograma faz no orçamento de insumos da tarefa
                 (trello-orcamento-items-list + busca abaixo dela).
                 Por não estar dentro de um container com overflow,
                 o dropdown nunca é cortado. -->
            <div class="cliente-search-wrapper" id="orc-produto-search-wrapper">
              <div class="cliente-search-input-wrap">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  class="cliente-search-field"
                  id="form-produto-search"
                  placeholder="Pesquisar serviço..."
                  autocomplete="off"
                  style="padding-left: 38px; width: 100%;"
                >
              </div>
              <div class="cliente-dropdown" id="form-produto-dropdown"></div>
            </div>

            <!-- Seção de Totais -->
            <div class="orc-total-section">
              <div class="orc-total-row">
                <span>Mão de Obra</span>
                <div style="position: relative; display: flex; align-items: center;">
                  <span style="position: absolute; left: 10px; font-size: 13px; color: #8A8775; font-weight: 700;">R$</span>
                  <input type="number" id="form-maodeobra" class="orc-input" style="width: 140px; text-align: right; padding-left: 30px; font-weight: 700;" value="${this.activeOrcamento.maoDeObra || 0}" oninput="Orcamentos.calculateTotal()">
                </div>
              </div>
              <div class="orc-total-row">
                <span>Incrementar Ganho</span>
                <div style="position: relative; display: flex; align-items: center;">
                  <input type="number" id="form-incremento" class="orc-input" style="width: 140px; text-align: right; padding-right: 24px; font-weight: 700;" value="${this.activeOrcamento.incrementoPct || 0}" oninput="Orcamentos.calculateTotal()">
                  <span style="position: absolute; right: 10px; font-size: 13px; color: #8A8775; font-weight: 700;">%</span>
                </div>
              </div>
              <div class="orc-total-row">
                <span>Desconto</span>
                <div style="position: relative; display: flex; align-items: center;">
                  <input type="number" id="form-desconto" class="orc-input" style="width: 140px; text-align: right; padding-right: 24px; font-weight: 700;" value="${this.activeOrcamento.descontoPct || 0}" oninput="Orcamentos.calculateTotal()">
                  <span style="position: absolute; right: 10px; font-size: 13px; color: #8A8775; font-weight: 700;">%</span>
                </div>
              </div>
              <div class="orc-total-row grand-total">
                <span>TOTAL</span>
                <span id="form-total-label">${this.formatCurrency(this.activeOrcamento.valor_total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Footer no padrão "Cancelar (branco/preto) + Salvar (laranja)"
    const footerHtml = `
      <button class="orc-modal-btn-cancel" onclick="Components.closeModal()">Cancelar</button>
      <button class="orc-modal-btn-outline" onclick="Orcamentos.saveForm(false)">Salvar Rascunho</button>
      <button class="orc-btn-primary" style="padding: 10px 20px;" onclick="Orcamentos.saveForm(true)">Salvar e Enviar</button>
    `;

    Components.showModal(title, contentHtml, footerHtml, 'orcamento-modal');

    // Configurar largura customizada do modal
    const modalEl = document.querySelector('.modal-content.orcamento-modal');
    if (modalEl) {
      modalEl.style.maxWidth = '950px';
      modalEl.style.width = '95%';
      modalEl.style.background = '#F5F3EC';
    }

    // Carregar itens existentes no modal
    if (this.activeOrcamento.itens && this.activeOrcamento.itens.length > 0) {
      this.activeOrcamento.itens.forEach(item => {
        const prod = this.produtos.find(p => p.id === item.produtoId) ||
          { id: item.produtoId, descricao: item.produtoNome, preco: item.precoUnitario, estoque: 0 };
        this.appendOrcItemCard(prod, item.quantidade, item.precoUnitario);
      });
    }

    // Inicializa o comportamento interativo dos campos de busca
    // (mesmo padrão focus/input/blur do Cronograma)
    this.initClienteSearchOrc();
    this.initProdutoSearchOrc();

    this.calculateTotal();
    Components.renderIcons();

    if (window.HigPopovers) {
      setTimeout(() => {
        window.HigPopovers.initCustomSelects();
      }, 50);
    }
  },

  // ──────────────────────────────────────────────────────────────
  // Busca e seleção de Cliente — mesmo padrão do Cronograma
  // (cronograma.tasks.js → _initClienteSearch / _selectCliente)
  // ──────────────────────────────────────────────────────────────
  initClienteSearchOrc() {
    const input = document.getElementById('form-cliente-search');
    const dropdown = document.getElementById('form-cliente-dropdown');
    const hiddenId = document.getElementById('form-cliente-id');
    if (!input || !dropdown) return;

    const renderItems = (filter = '') => {
      const q = filter.trim().toLowerCase();
      const filtered = q
        ? this.clientes.filter(c => {
          const nome = (c.nome || '').toLowerCase();
          const codigo = (c.codigo || '').toLowerCase();
          return nome.includes(q) || codigo.includes(q);
        })
        : this.clientes;

      if (filtered.length === 0) {
        dropdown.innerHTML = `
          <div class="cliente-dropdown-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px;opacity:.4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Nenhum cliente encontrado
          </div>`;
        return;
      }

      dropdown.innerHTML = filtered.map(c => {
        const nome = c.nome || '';
        const codigo = c.codigo || '';
        const initials = nome.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
        const safeNome = nome.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
          <div class="cliente-dropdown-item" data-id="${c.id}" onmousedown="Orcamentos.selectClient('${c.id}', '${safeNome}')">
            <div class="item-avatar">${initials || '?'}</div>
            <div class="item-info">
              <div class="item-name">${nome}</div>
              ${codigo ? `<div class="item-bairro">${codigo}</div>` : ''}
            </div>
          </div>`;
      }).join('');
    };

    input.addEventListener('focus', () => {
      renderItems(input.value);
      dropdown.classList.add('open');
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('open'), 200);
    });

    input.addEventListener('input', () => {
      if (hiddenId) hiddenId.value = '';
      input.classList.remove('has-value');
      renderItems(input.value);
      if (!dropdown.classList.contains('open')) dropdown.classList.add('open');
    });
  },

  selectClient(id, nome) {
    const hiddenId = document.getElementById('form-cliente-id');
    const input = document.getElementById('form-cliente-search');
    const dropdown = document.getElementById('form-cliente-dropdown');

    if (hiddenId) hiddenId.value = id;
    if (input) {
      input.value = nome;
      input.classList.add('has-value');
    }
    if (dropdown) dropdown.classList.remove('open');
  },

  // ──────────────────────────────────────────────────────────────
  // Busca e seleção de Produto — mesmo padrão do Cronograma
  // (cronograma.tasks.js → _initProdutoSearch / _selectProduto)
  // ──────────────────────────────────────────────────────────────
  initProdutoSearchOrc() {
    const input = document.getElementById('form-produto-search');
    const dropdown = document.getElementById('form-produto-dropdown');
    if (!input || !dropdown) return;

    const renderItems = (filter = '') => {
      const q = filter.trim().toLowerCase();
      const filtered = q
        ? this.produtos.filter(p => (p.descricao || '').toLowerCase().includes(q) || (p.codigo || '').toLowerCase().includes(q))
        : this.produtos;

      if (filtered.length === 0) {
        dropdown.innerHTML = `
          <div class="cliente-dropdown-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 8px;opacity:.4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Nenhum serviço encontrado
          </div>`;
        return;
      }

      dropdown.innerHTML = filtered.map(p => {
        const desc = p.descricao || '';
        const initials = desc.split(/[\s–-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
        const safeDesc = desc.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
          <div class="cliente-dropdown-item" data-id="${p.id}" onmousedown="Orcamentos.selectProduto('${p.id}')">
            <div class="item-avatar">${initials || '?'}</div>
            <div class="item-info">
              <div class="item-name">${desc}</div>
              <div class="item-bairro" style="display:flex; justify-content:space-between;">
                <span>${this.formatCurrency(p.preco || 0)}</span>
              </div>
            </div>
          </div>`;
      }).join('');
    };

    input.addEventListener('focus', () => {
      renderItems(input.value);
      dropdown.classList.add('open');
    });

    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.remove('open'), 200);
    });

    input.addEventListener('input', () => {
      renderItems(input.value);
      if (!dropdown.classList.contains('open')) dropdown.classList.add('open');
    });
  },

  selectProduto(id) {
    const prod = this.produtos.find(p => p.id === id);
    if (!prod) return;

    // Evita duplicar produto já adicionado — foca a quantidade existente
    const existingInput = document.querySelector(`#orc-itens-list .form-prod-qty[data-id="${id}"]`);
    if (existingInput) {
      existingInput.focus();
      existingInput.select();
      Components.toast('Serviço já adicionado ao orçamento.', 'info');
      return;
    }

    this.appendOrcItemCard(prod, 1, prod.preco || 0);

    const input = document.getElementById('form-produto-search');
    const dropdown = document.getElementById('form-produto-dropdown');
    if (input) { input.value = ''; input.blur(); }
    if (dropdown) dropdown.classList.remove('open');
    this.calculateTotal();
  },

  // ──────────────────────────────────────────────────────────────
  // Cards de item do orçamento (substitui a antiga tabela de itens)
  // ──────────────────────────────────────────────────────────────
  appendOrcItemCard(prod, quantidade, precoUnitario) {
    const listContainer = document.getElementById('orc-itens-list');
    if (!listContainer) return;

    const rowId = 'row-' + Math.random().toString(36).substr(2, 6);
    const qty = quantidade || 1;
    const price = precoUnitario !== undefined && precoUnitario !== null ? precoUnitario : (prod.preco || 0);
    const subtotal = qty * price;

    const card = document.createElement('div');
    card.className = 'orc-item-card';
    card.id = rowId;
    card.style.cssText = 'display:flex; flex-direction:column; gap:8px; padding:10px 12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px;';
    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <span style="font-size:13px; font-weight:700; color:#1E293B; flex-grow:1;">${prod.descricao}</span>
        <button type="button" class="orc-actions-btn delete" onclick="Orcamentos.removeItemRow('${rowId}')" title="Remover item" style="margin:0; padding:2px;">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </div>
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:11px; color:#64748B;">Qtd:</span>
          <input type="number" class="form-prod-qty" value="${qty}" min="1" data-id="${prod.id}" oninput="Orcamentos.calculateRowSubtotal('${rowId}')" style="width:55px;height:28px;border:1px solid #D2CABD;border-radius:6px;padding:2px 6px;font-size:12px;outline:none;background:white;">
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:11px; color:#64748B;">Preço Un:</span>
          <input type="number" class="form-prod-price" value="${price}" step="0.01" oninput="Orcamentos.calculateRowSubtotal('${rowId}')" style="width:75px;height:28px;border:1px solid #D2CABD;border-radius:6px;padding:2px 6px;font-size:12px;outline:none;background:white;">
        </div>
        <div style="margin-left:auto; text-align:right;">
          <span class="form-row-subtotal" style="font-size:13px; font-weight:700; color:#1A1A1A;">${this.formatCurrency(subtotal)}</span>
        </div>
      </div>
    `;

    const hiddenName = document.createElement('input');
    hiddenName.type = 'hidden';
    hiddenName.className = 'form-prod-name';
    hiddenName.value = prod.descricao;
    card.appendChild(hiddenName);

    const hiddenId = document.createElement('input');
    hiddenId.type = 'hidden';
    hiddenId.className = 'form-prod-id';
    hiddenId.value = prod.id;
    card.appendChild(hiddenId);

    listContainer.appendChild(card);
    Components.renderIcons();
  },

  removeItemRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
      row.remove();
      this.calculateTotal();
    }
  },

  calculateRowSubtotal(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const qty = parseInt(row.querySelector('.form-prod-qty').value, 10) || 0;
    const price = parseFloat(row.querySelector('.form-prod-price').value) || 0;
    const subtotal = qty * price;

    row.querySelector('.form-row-subtotal').innerText = this.formatCurrency(subtotal);
    this.calculateTotal();
  },

  calculateTotal() {
    let itemsSum = 0;
    document.querySelectorAll('#orc-itens-list .orc-item-card').forEach(card => {
      const qty = parseInt(card.querySelector('.form-prod-qty').value, 10) || 0;
      const price = parseFloat(card.querySelector('.form-prod-price').value) || 0;
      itemsSum += qty * price;
    });

    const maoDeObra = parseFloat(document.getElementById('form-maodeobra').value) || 0;
    const incrementoPct = parseFloat(document.getElementById('form-incremento').value) || 0;
    const descontoPct = parseFloat(document.getElementById('form-desconto').value) || 0;

    const baseTotal = itemsSum + maoDeObra;
    const incremento = Math.round(baseTotal * (incrementoPct / 100) * 100) / 100;
    const totalSemDesconto = baseTotal + incremento;
    const desconto = Math.round(totalSemDesconto * (descontoPct / 100) * 100) / 100;
    const total = Math.round((totalSemDesconto - desconto) * 100) / 100;

    const totalLabel = document.getElementById('form-total-label');
    if (totalLabel) totalLabel.innerText = this.formatCurrency(total);

    return total;
  },

  // Salvar Orçamento
  async saveForm(sendImmediately = false) {
    const clienteNome = document.getElementById('form-cliente-search').value.trim();
    const clienteId = document.getElementById('form-cliente-id').value;
    const descricao = document.getElementById('form-descricao').value.trim();
    const validade = document.getElementById('form-validade').value;
    const statusSelect = document.getElementById('form-status');
    const observacoes = document.getElementById('form-observacoes').value.trim();
    const marcenariaNome = document.getElementById('form-marcenaria-nome').value.trim();
    const marcenariaDocumento = document.getElementById('form-marcenaria-documento').value.trim();
    const marcenariaTelefone = document.getElementById('form-marcenaria-telefone').value.trim();
    const marcenariaEmail = document.getElementById('form-marcenaria-email').value.trim();
    const condicoesPagamento = document.getElementById('form-condicoes-pagamento').value.trim();
    const prazoEntrega = document.getElementById('form-prazo-entrega').value.trim();
    const categoria = document.getElementById('form-categoria').value;
    const maoDeObra = parseFloat(document.getElementById('form-maodeobra').value) || 0;
    const incrementoPct = parseFloat(document.getElementById('form-incremento').value) || 0;
    const descontoPct = parseFloat(document.getElementById('form-desconto').value) || 0;

    if (!clienteNome) {
      Components.toast('Selecione ou insira o nome de um cliente.', 'error');
      return;
    }
    if (!descricao) {
      Components.toast('Insira uma breve descrição do projeto.', 'error');
      return;
    }
    if (!validade) {
      Components.toast('Selecione uma data de validade.', 'error');
      return;
    }

    // Mapear itens
    const itens = [];
    let itemsSum = 0;
    let itemsValid = true;

    document.querySelectorAll('#orc-itens-list .orc-item-card').forEach(card => {
      const produtoNome = card.querySelector('.form-prod-name').value;
      const produtoId = card.querySelector('.form-prod-id').value;
      const quantidade = parseInt(card.querySelector('.form-prod-qty').value, 10) || 0;
      const precoUnitario = parseFloat(card.querySelector('.form-prod-price').value) || 0;

      if (!produtoNome) {
        itemsValid = false;
        return;
      }

      const subtotal = quantidade * precoUnitario;
      itemsSum += subtotal;
      itens.push({ produtoId, produtoNome, quantidade, precoUnitario, subtotal });
    });

    if (!itemsValid) {
      Components.toast('Erro ao processar os itens. Remova e adicione novamente.', 'error');
      return;
    }

    const baseTotal = itemsSum + maoDeObra;
    const incremento = Math.round(baseTotal * (incrementoPct / 100) * 100) / 100;
    const totalSemDesconto = baseTotal + incremento;
    const desconto = Math.round(totalSemDesconto * (descontoPct / 100) * 100) / 100;
    const valor_total = Math.round((totalSemDesconto - desconto) * 100) / 100;
    const status = sendImmediately ? 'Enviado' : statusSelect.value;

    const payload = {
      ...this.activeOrcamento,
      clienteNome,
      clienteId,
      descricao,
      validade,
      status,
      observacoes,
      marcenariaNome,
      marcenariaDocumento,
      marcenariaTelefone,
      marcenariaEmail,
      condicoesPagamento,
      prazoEntrega,
      itens,
      maoDeObra,
      incrementoPct,
      descontoPct,
      valor_total,
      categoria
    };

    try {
      if (this.activeOrcamento.id) {
        // Edit existing
        await API.put(`/api/orcamentos/${this.activeOrcamento.id}`, payload);
        Components.toast('Orçamento atualizado com sucesso.', 'success');
      } else {
        // Create new
        await API.post('/api/orcamentos', payload);
        Components.toast('Orçamento criado com sucesso.', 'success');
      }

      Components.closeModal();
      this.render();

      // Trigger automatic prompt if status changed to approved
      if (status === 'Aprovado') {
        this.checkApprovedWorkflow(payload);
      }

    } catch (e) {
      console.error(e);
      Components.toast('Erro ao salvar orçamento: ' + e.message, 'error');
    }
  },

  async deleteBudget(id) {
    Components.confirm('Deseja realmente excluir este orçamento?', async () => {
      try {
        await API.delete(`/api/orcamentos/${id}`);
        Components.toast('Orçamento excluído.', 'success');
        this.render();
      } catch (e) {
        Components.toast('Erro ao excluir orçamento.', 'error');
      }
    });
  },

  // Logo personalizada usada no cabeçalho da proposta (visualização e impressão/PDF).
  getLogoSvg() {
    const custom = localStorage.getItem('bancada_custom_logo_svg') || '';
    if (custom && custom.trim()) {
      const trimmed = custom.trim();
      if (trimmed.startsWith('<svg')) {
        return trimmed;
      }
      if (trimmed.startsWith('data:image') || trimmed.startsWith('http')) {
        return `<img src="${trimmed}" style="max-height:80px; max-width:220px; object-fit:contain;" />`;
      }
      return trimmed;
    }
    // De padrão sem a logo do bancada
    return '';
  },

  getLogoSvgBase64() {
    const svgString = this.getLogoSvg();
    if (!svgString) return '';
    if (svgString.startsWith('<img')) {
      const match = svgString.match(/src="([^"]+)"/);
      return match ? match[1] : '';
    }
    if (svgString.startsWith('data:image')) {
      return svgString;
    }
    try {
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString.trim())));
    } catch(e) {
      return '';
    }
  },

  // Modal de Visualização Imprimível / Exportável
  openPreviewModal(id) {
    const o = this.orcamentos.find(item => item.id === id);
    if (!o) return;

    this.activeOrcamento = o;
    const formattedDate = this.formatDate(o.data);
    const formattedValidade = this.formatDate(o.validade);
    const itemsSum = o.itens ? o.itens.reduce((sum, item) => sum + (item.subtotal || 0), 0) : 0;

    // Calculate increment and display values
    const baseTotal = itemsSum + (o.maoDeObra || 0);
    const incremento = Math.round(baseTotal * ((o.incrementoPct || 0) / 100) * 100) / 100;
    const totalSemDesconto = baseTotal + incremento;
    const descValue = Math.round(totalSemDesconto * ((o.descontoPct || 0) / 100) * 100) / 100;

    // Apply increment to products if items exist; otherwise add to labor
    let itemsSumExibido = itemsSum;
    let maoDeObraExibida = o.maoDeObra || 0;
    let productFactor = 1;

    if (itemsSum > 0) {
      itemsSumExibido = itemsSum + incremento;
      maoDeObraExibida = o.maoDeObra || 0;
      productFactor = itemsSumExibido / itemsSum;
    } else {
      itemsSumExibido = 0;
      maoDeObraExibida = (o.maoDeObra || 0) + incremento;
      productFactor = 1;
    }

    let scaledItens = [];
    if (o.itens && o.itens.length > 0) {
      const targetItemsSum = itemsSumExibido;
      let sumOfScaledSubtotals = 0;
      scaledItens = o.itens.map((item) => {
        const scaledPrecoUnitario = Math.round(item.precoUnitario * productFactor * 100) / 100;
        const scaledSubtotal = Math.round(scaledPrecoUnitario * item.quantidade * 100) / 100;
        sumOfScaledSubtotals += scaledSubtotal;
        return {
          ...item,
          scaledPrecoUnitario,
          scaledSubtotal
        };
      });

      // Distribute rounding difference to the last item to make the sum of subtotals match targetItemsSum exactly
      const diff = Math.round((targetItemsSum - sumOfScaledSubtotals) * 100) / 100;
      if (diff !== 0 && scaledItens.length > 0) {
        const lastItem = scaledItens[scaledItens.length - 1];
        lastItem.scaledSubtotal = Math.round((lastItem.scaledSubtotal + diff) * 100) / 100;
        if (lastItem.quantidade > 0) {
          lastItem.scaledPrecoUnitario = Math.round((lastItem.scaledSubtotal / lastItem.quantidade) * 100) / 100;
        }
      }
    }

    const contentHtml = `
      <div class="orc-preview-card" id="printable-proposal-card">
        <!-- CABEÇALHO (logo + dados da marcenaria) -->
        <div class="orc-preview-header">
          ${this.getLogoSvg() ? `<div class="orc-preview-logo">${this.getLogoSvg()}</div>` : ''}
          <div class="orc-preview-company-info">
            <h3>${o.marcenariaNome || 'Bancada Móveis Planejados'}</h3>
            <p>CNPJ/CPF: ${o.marcenariaDocumento || '12.345.678/0001-90'}</p>
            <p>Tel: ${o.marcenariaTelefone || '(11) 99876-5432'}</p>
            <p>E-mail: ${o.marcenariaEmail || 'contato@bancadaplanejados.com.br'}</p>
          </div>
        </div>
        
        <div class="orc-preview-divider"></div>
        
        <!-- DADOS DO CLIENTE E PROJETO -->
        <div class="orc-preview-client-project-section">
          <div class="orc-preview-title-row">
            <h2>ORÇAMENTO: ${o.codigo}</h2>
            <span class="orc-preview-date-badge">Emissão: ${formattedDate}</span>
          </div>
          <div class="orc-preview-client-info-grid">
            <div><strong>Cliente:</strong> ${o.clienteNome || 'Não Atribuído'}</div>
            <div><strong>Validade:</strong> ${formattedValidade}</div>
            <div style="grid-column: span 2; margin-top: 4px;"><strong>Projeto/Descrição:</strong> ${o.descricao || '—'}</div>
          </div>
        </div>
        
        <div class="orc-preview-divider"></div>
        
        <!-- ITENS DO ORÇAMENTO -->
        <div class="orc-preview-section-title">Itens do Orçamento</div>
        <table class="orc-preview-items-table">
          <thead>
            <tr>
              <th>Item / Produto</th>
              <th style="text-align: center; width: 60px;">Qtd</th>
              <th style="text-align: right; width: 120px;">Preço Unitário</th>
              <th style="text-align: right; width: 120px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${scaledItens && scaledItens.length > 0 ? scaledItens.map(item => `
              <tr>
                <td>${item.produtoNome}</td>
                <td style="text-align: center;">${item.quantidade}</td>
                <td style="text-align: right;">${this.formatCurrency(item.scaledPrecoUnitario)}</td>
                <td style="text-align: right; font-weight: 600;">${this.formatCurrency(item.scaledSubtotal)}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4" style="text-align: center; color: #94A3B8; font-style: italic; padding: 16px;">Sem itens cadastrados</td>
              </tr>
            `}
          </tbody>
        </table>
        
        <div class="orc-preview-divider"></div>
        
        <!-- VALORES, CONDIÇÕES DE PAGAMENTO E PRAZO -->
        <div class="orc-preview-summary-container">
          <div class="orc-preview-terms-col">
            <div class="orc-preview-term-item">
              <strong>Prazo Estimado de Execução</strong>
              <span>${o.prazoEntrega || '30 dias úteis'}</span>
            </div>
            <div class="orc-preview-term-item" style="margin-top: 14px;">
              <strong>Condições de Pagamento</strong>
              <span>${o.condicoesPagamento || '50% entrada, 50% na entrega'}</span>
            </div>
          </div>
          <div class="orc-preview-values-col">
            <div class="orc-preview-value-row">
              <span>Subtotal dos Itens:</span>
              <strong>${this.formatCurrency(itemsSumExibido)}</strong>
            </div>
            ${maoDeObraExibida > 0 ? `
              <div class="orc-preview-value-row">
                <span>Mão de Obra:</span>
                <strong>${this.formatCurrency(maoDeObraExibida)}</strong>
              </div>
            ` : ''}
            ${o.descontoPct > 0 ? `
              <div class="orc-preview-value-row discount-row">
                <span>Desconto (${o.descontoPct}%):</span>
                <strong>-${this.formatCurrency(descValue)}</strong>
              </div>
            ` : ''}
            <div class="orc-preview-total-box">
              <span class="total-label">VALOR TOTAL LÍQUIDO</span>
              <span class="total-value">${this.formatCurrency(o.valor_total)}</span>
            </div>
          </div>
        </div>
        
        ${o.observacoes ? `
          <div class="orc-preview-divider"></div>
          <div class="orc-preview-section-title">Observações</div>
          <div class="orc-preview-notes">
            ${o.observacoes}
          </div>
        ` : ''}
        
        <!-- CAMPO DE ASSINATURA -->
        <div class="orc-preview-signature-section">
          <p>Aceito este orçamento em: ____/____/________</p>
          <div class="signature-line-container">
            <div class="signature-line"></div>
            <span>Assinatura do Cliente (${o.clienteNome})</span>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="Components.closeModal()">Fechar</button>
      <button class="btn btn-secondary" style="border:1px solid #4B5563;" onclick="Orcamentos.printProposal()"><i data-lucide="printer" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px;"></i> Imprimir / PDF</button>
      ${o.status !== 'Aprovado' && o.status !== 'Concluído' ? `
        <button class="orc-btn-primary" style="background:#16A34A; padding: 10px 20px;" onclick="Orcamentos.approveProposal('${o.id}')">Aprovar ✓</button>
      ` : ''}
    `;

    Components.showModal('Visualizar Proposta', contentHtml, footerHtml, 'orcamento-preview-modal');

    const modalEl = document.querySelector('.modal-content.orcamento-preview-modal');
    if (modalEl) {
      modalEl.style.maxWidth = '750px';
      modalEl.style.width = '95%';
      modalEl.style.background = '#FFFFFF';
    }

    Components.renderIcons();
  },

  printProposal() {
    const printContent = document.getElementById('printable-proposal-card').innerHTML;

    // Abrir janela de impressão customizada
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Orçamento ${this.activeOrcamento.codigo}</title>
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
              padding: 40px;
              color: #1E293B;
              background: #FFFFFF;
            }
            .orc-preview-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
            }
            .orc-preview-logo svg {
              display: block;
              width: 160px;
              height: auto;
            }
            .orc-preview-company-info {
              text-align: right;
              font-size: 13px;
              color: #64748B;
              line-height: 1.5;
            }
            .orc-preview-company-info h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              color: #1E293B;
              font-weight: 700;
            }
            .orc-preview-company-info p {
              margin: 0;
            }
            .orc-preview-divider {
              border-bottom: 1px solid #E2E8F0;
              margin: 24px 0;
            }
            .orc-preview-client-project-section {
              margin-bottom: 24px;
            }
            .orc-preview-title-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
            }
            .orc-preview-title-row h2 {
              margin: 0;
              font-size: 20px;
              font-weight: 800;
              color: #D85A30;
            }
            .orc-preview-date-badge {
              font-size: 12px;
              font-weight: 600;
              background: #F1F5F9;
              color: #475569;
              padding: 6px 12px;
              border-radius: 9999px;
            }
            .orc-preview-client-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              font-size: 14px;
              color: #334155;
              background: #F8FAFC;
              padding: 16px;
              border-radius: 12px;
            }
            .orc-preview-section-title {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
              margin-bottom: 12px;
              letter-spacing: 0.05em;
            }
            .orc-preview-items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .orc-preview-items-table th {
              background: #F8FAFC;
              font-size: 12px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              padding: 10px 14px;
              border-bottom: 2px solid #E2E8F0;
              text-align: left;
            }
            .orc-preview-items-table td {
              padding: 12px 14px;
              border-bottom: 1px solid #F1F5F9;
              font-size: 13px;
              color: #334155;
            }
            .orc-preview-summary-container {
              display: flex;
              justify-content: space-between;
              gap: 40px;
              margin-top: 20px;
            }
            .orc-preview-terms-col {
              flex: 1.2;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              font-size: 13px;
              color: #475569;
              background: #F8FAFC;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #E2E8F0;
              height: fit-content;
            }
            .orc-preview-term-item {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .orc-preview-term-item strong {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748B;
              letter-spacing: 0.05em;
            }
            .orc-preview-term-item span {
              font-size: 13.5px;
              color: #1E293B;
              font-weight: 500;
            }
            .orc-preview-values-col {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 10px;
              align-items: flex-end;
            }
            .orc-preview-value-row {
              display: flex;
              justify-content: space-between;
              width: 100%;
              font-size: 13px;
              color: #64748B;
            }
            .orc-preview-value-row strong {
              color: #1E293B;
            }
            .orc-preview-value-row.discount-row strong {
              color: #EF4444;
            }
            .orc-preview-total-box {
              width: 100%;
              background: #FFF3F0;
              border: 1px solid #FFD3C4;
              border-radius: 12px;
              padding: 16px 20px;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              margin-top: 8px;
              box-sizing: border-box;
            }
            .orc-preview-total-box .total-label {
              font-size: 11px;
              font-weight: 700;
              color: #D85A30;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 4px;
            }
            .orc-preview-total-box .total-value {
              font-size: 26px;
              font-weight: 800;
              color: #D85A30;
            }
            .orc-preview-notes {
              font-size: 13px;
              line-height: 1.6;
              color: #475569;
              background: #F8FAFC;
              padding: 16px;
              border-radius: 12px;
              border-left: 4px solid #D85A30;
            }
            .orc-preview-signature-section {
              margin-top: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 32px;
              font-size: 13px;
              color: #475569;
            }
            .signature-line-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 320px;
              gap: 6px;
            }
            .signature-line {
              width: 100%;
              border-bottom: 1px solid #94A3B8;
            }
            @media print {
              body { padding: 0; }
              .orc-preview-card { border: none; box-shadow: none; padding: 0; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  },

  openPrazoPopover(e) {
    e.stopPropagation();
    const input = e.target;

    // Fechar outros popovers abertos
    document.querySelectorAll('.prazo-popover-menu, .hig-select-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'hig-select-menu prazo-popover-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = '999999';
    menu.style.opacity = '0';
    menu.style.transform = 'scale(0.95) translateY(-5px)';
    menu.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    menu.style.width = `${input.offsetWidth}px`;

    // Lista de opções padrão
    const options = ['15 dias úteis', '20 dias úteis', '30 dias úteis', 'Personalizado...'];

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'hig-select-items';

    options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'hig-select-item';
      if (input.value === opt) {
        item.classList.add('selected');
        item.innerHTML = `<span>${opt}</span><i data-lucide="check" class="hig-check" style="width:16px;height:16px;color:#E55A2B;"></i>`;
      } else {
        item.innerHTML = `<span>${opt}</span>`;
      }

      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        menu.remove();
        document.removeEventListener('click', closeHandler);

        if (opt === 'Personalizado...') {
          Components.showPrompt('Prazo Personalizado', 'Ex: 45 dias úteis', (customVal) => {
            if (customVal !== null && customVal.trim() !== '') {
              input.value = customVal.trim();
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
          // Pre-populate prompt input with current value
          const promptInput = document.getElementById('ios-prompt-input');
          if (promptInput) {
            promptInput.value = input.value && input.value !== 'Personalizado...' ? input.value : '';
          }
        } else {
          input.value = opt;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      itemsContainer.appendChild(item);
    });

    menu.appendChild(itemsContainer);
    document.body.appendChild(menu);

    // Cálculo do posicionamento
    const rect = input.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 180;

    let top;
    if (spaceBelow < estimatedHeight + 10 && spaceAbove > spaceBelow) {
      top = rect.top - estimatedHeight - 4;
      menu.style.transformOrigin = 'bottom center';
    } else {
      top = rect.bottom + 4;
      menu.style.transformOrigin = 'top center';
    }
    menu.style.top = `${top}px`;

    if (window.lucide) {
      window.lucide.createIcons({ root: menu });
    }

    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'scale(1) translateY(0)';
    });

    const closeHandler = (ev) => {
      if (!menu.contains(ev.target) && ev.target !== input) {
        menu.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  },

  async approveProposal(id) {
    const o = this.orcamentos.find(item => item.id === id);
    if (!o) return;

    try {
      o.status = 'Aprovado';
      await API.put(`/api/orcamentos/${id}`, o);
      Components.toast('Orçamento Aprovado!', 'success');
      Components.closeModal();
      this.render();

      this.checkApprovedWorkflow(o);
    } catch (e) {
      Components.toast('Erro ao aprovar orçamento.', 'error');
    }
  },

  // Pergunta se deseja criar tarefa no Cronograma
  checkApprovedWorkflow(orcamento) {
    this.lastApprovedOrcamento = orcamento;
    setTimeout(() => {
      Components.confirm(`Deseja criar automaticamente uma tarefa no Cronograma vinculada ao cliente ${orcamento.clienteNome}?`, async () => {
        // Pegar primeiro padeiro ativo
        let padeiroId = '';
        let padeiroNome = '';
        try {
          const padeiros = await API.get('/api/padeiros');
          const ativo = padeiros.find(p => p.ativo);
          if (ativo) {
            padeiroId = ativo.id;
            padeiroNome = ativo.nome;
          }
        } catch (err) {
          console.warn('Erro ao obter padeiro ativo:', err);
        }

        // Caso não tenha clienteId, criar ou pesquisar no cadastro de clientes do Bancada
        let clientMatchId = orcamento.clienteId;
        if (!clientMatchId) {
          const match = this.clientes.find(c => c.nome.toLowerCase() === orcamento.clienteNome.toLowerCase());
          if (match) clientMatchId = match.id;
        }

        // Criar formulário modal simples para detalhes do cronograma
        const cronFormHtml = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <p>Selecione a data e o horário para iniciar a produção de <strong>${orcamento.descricao}</strong>:</p>
            <div class="orc-field-group">
              <label>Data de Início</label>
              <input type="date" id="cron-data" class="orc-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="orc-field-group">
              <label>Horário</label>
              <input type="time" id="cron-horario" class="orc-input" value="08:00">
            </div>
          </div>
        `;

        const footerHtml = `
          <button class="orc-modal-btn-cancel" onclick="Components.closeModal()">Ignorar</button>
          <button class="orc-btn-primary" onclick="Orcamentos.createCronogramaTask('${clientMatchId || ''}', '${orcamento.clienteNome.replace(/'/g, "\\'")}', '${orcamento.descricao.replace(/'/g, "\\'")}', '${padeiroId}', '${padeiroNome.replace(/'/g, "\\'")}')">Criar Tarefa</button>
        `;

        Components.showModal('Agendar Produção', cronFormHtml, footerHtml);
      });
    }, 400);
  },

  async createCronogramaTask(clienteId, clienteNome, descricao, padeiroId, padeiroNome) {
    const data = document.getElementById('cron-data').value;
    const horario = document.getElementById('cron-horario').value;

    if (!data) {
      Components.toast('Preencha a data de início.', 'error');
      return;
    }

    let finalClienteId = clienteId;

    // Obter custo de insumos (soma dos subtotais dos itens) e receita (valor total do orçamento)
    const itemsSum = this.lastApprovedOrcamento && this.lastApprovedOrcamento.itens
      ? this.lastApprovedOrcamento.itens.reduce((sum, item) => {
          // Usar subtotal se disponível, senão calcular de precoUnitario * quantidade
          const sub = item.subtotal || (item.precoUnitario || item.preco_unitario || 0) * (item.quantidade || 1);
          return sum + sub;
        }, 0)
      : 0;
    const receita = this.lastApprovedOrcamento ? (this.lastApprovedOrcamento.valor_total || 0) : 0;

    try {
      // Se não tiver ID do cliente, mas temos o nome, criamos o cliente no banco
      if (!finalClienteId && clienteNome) {
        const novoCliente = await API.post('/api/clientes', {
          nome: clienteNome,
          receita: receita,
          custoInsumos: itemsSum
        });
        if (novoCliente && novoCliente.id) {
          finalClienteId = novoCliente.id;
          // Atualiza a lista local de clientes se existir
          if (this.clientes) {
            this.clientes.push(novoCliente);
          }
        }
      } else if (finalClienteId) {
        // Se já tiver o cliente, atualiza receita e custo de insumos
        await API.put(`/api/clientes/${finalClienteId}`, {
          receita: receita,
          custoInsumos: itemsSum
        });

        // Atualiza na lista local de clientes se existir
        if (this.clientes) {
          const idx = this.clientes.findIndex(c => c.id === finalClienteId);
          if (idx !== -1) {
            this.clientes[idx].receita = receita;
            this.clientes[idx].custoInsumos = itemsSum;
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao processar/atualizar cliente para o cronograma:', err);
    }

    try {
      const payload = {
        padeiroId: padeiroId || null,
        padeiroNome: padeiroNome || 'Não atribuído',
        clienteId: finalClienteId || null,
        clienteNome: clienteNome,
        data: data,
        horario: horario,
        tarefas: descricao,
        status: 'pendente',
        observacao: 'Criado automaticamente a partir do Orçamento aprovado.',
        checklist: [
          { text: 'Cliente aprovar orçamento', done: true },
          { text: 'comprar os materiais', done: false },
          { text: 'organizar o projeto tipo fazaer tal parte', done: false },
          { text: 'fabricação', done: false },
          { text: 'montagem:', done: false },
          { text: 'montagem entrega na casa do cliente', done: false }
        ],
        progresso: 17
      };

      // Adicionar os itens do orçamento na seção orçamento da tarefa com metadados
      if (this.lastApprovedOrcamento) {
        const prazoStr = this.lastApprovedOrcamento.prazoEntrega || '30 dias úteis';
        const match = prazoStr.match(/(\d+)/);
        const prazoDias = match ? parseInt(match[1], 10) : 30;

        payload.orcamento = {
          orcamentoId: this.lastApprovedOrcamento.id,
          codigo: this.lastApprovedOrcamento.codigo,
          valor_total: receita,
          ganhoLiquido: receita - itemsSum,
          prazoDias: prazoDias,
          itens: (this.lastApprovedOrcamento.itens || []).map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade
          }))
        };
      }

      await API.post('/api/cronograma', payload);
      Components.toast('Tarefa criada com sucesso no Cronograma!', 'success');
      Components.closeModal();

      // Navigate to cronograma view
      App.navigate('cronograma');
    } catch (e) {
      console.error(e);
      Components.toast('Erro ao criar tarefa no Cronograma: ' + e.message, 'error');
    }
  },

  renderContratosList(contratoList) {
    if (contratoList.length === 0) {
      return Components.empty('file-text', 'Nenhum contrato encontrado.');
    }

    const rows = contratoList.map((c, idx) => {
      const formattedDate = this.formatDate(c.criadoEm.split('T')[0]);
      const formattedPrazo = this.formatDate(c.prazo);
      
      let badgeClass = 'rascunho';
      if (c.status === 'Enviado para assinatura') badgeClass = 'enviado_para_assinatura';
      else if (c.status === 'Assinado por uma parte') badgeClass = 'assinado_por_uma_parte';
      else if (c.status === 'Assinado por ambas') badgeClass = 'assinado_por_ambas';
      else if (c.status === 'Cancelado') badgeClass = 'cancelado';

      const animationIndex = Math.min(idx, 8) + 6;

      return `
        <tr class="cascade-item" style="--index: ${animationIndex};">
          <td style="font-weight:700;color:var(--text-secondary);">${c.codigo}</td>
          <td style="font-weight:600;color:var(--text-secondary); font-family:var(--font-main);">${c.orcamentoCodigo}</td>
          <td><span style="font-weight:700; color:var(--text-main); font-family:var(--font-main);">${c.clienteNome}</span></td>
          <td style="color:var(--text-main); font-family:var(--font-main);">${c.projeto || '—'}</td>
          <td style="font-weight:800;font-size:14px;color:var(--text-main); font-family:var(--font-main);">${this.formatCurrency(c.valor)}</td>
          <td><span class="orc-badge orc-badge-${badgeClass}">${c.status}</span></td>
          <td style="color:var(--text-secondary); font-family:var(--font-main);">${formattedDate}</td>
          <td>
            <button class="orc-actions-btn" onclick="Orcamentos.openContratoDetailsModal('${c.id}')" title="Ver Detalhes do Contrato"><i data-lucide="eye" style="width:16px;height:16px;"></i></button>
            <a href="${c.pdfPath}" target="_blank" class="orc-actions-btn" title="Visualizar/Baixar PDF" style="display:inline-flex; align-items:center; justify-content:center;"><i data-lucide="download" style="width:16px;height:16px;"></i></a>
            ${c.status !== 'Cancelado' && c.status !== 'Assinado por ambas' ? `
              <button class="orc-actions-btn delete" onclick="Orcamentos.cancelContrato('${c.id}')" title="Cancelar Contrato"><i data-lucide="x-circle" style="width:16px;height:16px;"></i></button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="orc-table-container">
        <table class="orc-table">
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>ORÇAMENTO</th>
              <th>CLIENTE</th>
              <th>PROJETO</th>
              <th>VALOR TOTAL</th>
              <th>STATUS</th>
              <th>DATA CRIAÇÃO</th>
              <th width="120">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  },

  openCreateContratoModal(orcamentoId) {
    const o = this.orcamentos.find(item => item.id === orcamentoId);
    if (!o) return;

    const client = this.clientes.find(c => c.id === o.clienteId);
    const clientEmail = client ? (client.email || '') : '';
    const clientDocumento = client ? (client.cnpj || '') : '';
    const clientTelefone = client ? (client.celular || client.telefone || '') : '';

    // Sugere uma data de entrega de 30 dias a partir de hoje
    const defaultDeliveryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const contentHtml = `
      <div style="display:flex; flex-direction:column; gap:16px; background:#F5F3EC; padding:4px;">
        
        <!-- Alerta de Revisão Legal -->
        <div class="contrato-warning-banner">
          <i data-lucide="alert-triangle"></i>
          <div>
            <strong>Aviso de Modelo Padrão:</strong> As cláusulas listadas abaixo servem como um modelo de referência para marcenarias e devem ser revisadas por um advogado de sua confiança antes do primeiro uso real. Você pode editar o texto de qualquer cláusula abaixo.
          </div>
        </div>

        <div class="orc-modal-layout" style="flex-direction:column; gap:16px;">
          <!-- Card 1: Signatários -->
          <div class="orc-modal-card">
            <div class="orc-modal-card-title"><i data-lucide="users"></i> Informações dos Signatários (ZapSign)</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="orc-field-group">
                <label>Nome do Cliente (Contratante)</label>
                <input type="text" id="contrato-cliente-nome" class="orc-input" value="${o.clienteNome || ''}">
              </div>
              <div class="orc-field-group">
                <label>E-mail do Cliente (Obrigatório para ZapSign)</label>
                <input type="email" id="contrato-cliente-email" class="orc-input" placeholder="exemplo@email.com" value="${clientEmail}">
              </div>
              <div class="orc-field-group">
                <label>Responsável da Marcenaria (Contratada)</label>
                <input type="text" id="contrato-responsavel-nome" class="orc-input" value="${o.marcenariaNome || 'Bancada Móveis Planejados'}">
              </div>
              <div class="orc-field-group">
                <label>E-mail do Responsável (Obrigatório para ZapSign)</label>
                <input type="email" id="contrato-responsavel-email" class="orc-input" value="${o.marcenariaEmail || 'contato@bancadaplanejados.com.br'}">
              </div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:8px;">
              <div class="orc-field-group">
                <label>CPF/CNPJ do Cliente</label>
                <input type="text" id="contrato-cliente-doc" class="orc-input" placeholder="000.000.000-00 ou CNPJ" value="${clientDocumento}">
              </div>
              <div class="orc-field-group">
                <label>Telefone do Cliente</label>
                <input type="text" id="contrato-cliente-tel" class="orc-input" value="${clientTelefone}">
              </div>
            </div>
          </div>

          <!-- Card 2: Cláusulas Gerais -->
          <div class="orc-modal-card">
            <div class="orc-modal-card-title"><i data-lucide="file-text"></i> Condições e Cláusulas Contratuais</div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div class="orc-field-group">
                <label>Prazo Específico de Execução/Entrega</label>
                <input type="date" id="contrato-prazo" class="orc-input" value="${defaultDeliveryDate}">
              </div>
              <div class="orc-field-group">
                <label>Foro / Comarca para Resolução de Conflitos</label>
                <input type="text" id="contrato-foro" class="orc-input" value="São Paulo/SP">
              </div>
            </div>

            <div class="orc-field-group" style="margin-top:12px;">
              <label>Forma de Pagamento Detalhada</label>
              <textarea id="contrato-forma-pagamento" class="orc-textarea" placeholder="Descreva os marcos de pagamento...">40% na assinatura do contrato, 40% na entrega dos materiais na obra e 20% na conclusão da instalação dos móveis.</textarea>
            </div>

            <div class="orc-field-group" style="margin-top:12px;">
              <label>Multa por Atraso</label>
              <textarea id="contrato-multa-atraso" class="orc-textarea">Em caso de atraso injustificado na entrega ou na execução de qualquer etapa por responsabilidade de qualquer uma das partes, incidirá multa de 2% (dois por cento) sobre o valor total do projeto, acrescido de juros moratórios de 1% (um por cento) ao mês.</textarea>
            </div>

            <div class="orc-field-group" style="margin-top:12px;">
              <label>Garantia dos Serviços e Materiais</label>
              <textarea id="contrato-garantia" class="orc-textarea">A CONTRATADA oferece garantia de 90 (noventa) dias contra defeitos de fabricação, montagem ou instalação dos móveis planejados, contados a partir da data de entrega do projeto concluído, não cobrindo desgaste natural ou mau uso.</textarea>
            </div>

            <div class="orc-field-group" style="margin-top:12px;">
              <label>Cláusula de Cancelamento / Rescisão</label>
              <textarea id="contrato-rescisao" class="orc-textarea">Em caso de cancelamento imotivado da execução do projeto por parte do CONTRATANTE, haverá a retenção do valor integral correspondente aos materiais já adquiridos para o projeto e 20% (vinte por cento) do saldo restante a título de encargos administrativos e mão de obra de projeto.</textarea>
            </div>

            <div class="orc-field-group" style="margin-top:12px;">
              <label>Responsabilidade por Danos durante Instalação</label>
              <textarea id="contrato-danos" class="orc-textarea">A CONTRATADA responsabiliza-se civilmente por quaisquer danos e avarias causados diretamente ao imóvel do CONTRATANTE decorrentes de negligência ou imperícia na montagem dos móveis planejados por seus colaboradores.</textarea>
            </div>

            <div class="orc-field-group" style="margin-top:12px;">
              <label>Cláusula de Reserva de Propriedade (Reserva de Domínio)</label>
              <textarea id="contrato-propriedade" class="orc-textarea">Todos os móveis, ferragens e insumos fabricados e entregues pela CONTRATADA permanecerão sob sua exclusiva propriedade legal até que ocorra a quitação total de todas as parcelas e valores estipulados na cláusula de preço deste instrumento.</textarea>
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="orc-modal-btn-cancel" onclick="Components.closeModal()">Voltar</button>
      <button class="orc-btn-primary" style="padding: 10px 20px;" onclick="Orcamentos.saveContrato('${orcamentoId}')"><i data-lucide="check-circle" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:6px;"></i> Gerar Contrato e Enviar</button>
    `;

    Components.showModal(`Gerar Contrato a partir de ${o.codigo}`, contentHtml, footerHtml, 'contrato-create-modal');

    const modalEl = document.querySelector('.modal-content.contrato-create-modal');
    if (modalEl) {
      modalEl.style.maxWidth = '900px';
      modalEl.style.width = '95%';
      modalEl.style.background = '#F5F3EC';
    }

    Components.renderIcons();
  },

  async saveContrato(orcamentoId) {
    const orc = this.orcamentos.find(item => item.id === orcamentoId);
    if (!orc) return;

    // Obter dados dos inputs
    const clienteNome = document.getElementById('contrato-cliente-nome').value.trim();
    const clienteEmail = document.getElementById('contrato-cliente-email').value.trim();
    const responsavelNome = document.getElementById('contrato-responsavel-nome').value.trim();
    const responsavelEmail = document.getElementById('contrato-responsavel-email').value.trim();
    const clienteDocumento = document.getElementById('contrato-cliente-doc').value.trim();
    const clienteTelefone = document.getElementById('contrato-cliente-tel').value.trim();

    const prazo = document.getElementById('contrato-prazo').value;
    const foro = document.getElementById('contrato-foro').value.trim();
    const formaPagamento = document.getElementById('contrato-forma-pagamento').value.trim();
    const multaAtraso = document.getElementById('contrato-multa-atraso').value.trim();
    const garantia = document.getElementById('contrato-garantia').value.trim();
    const clausulaRescisao = document.getElementById('contrato-rescisao').value.trim();
    const danosInstalacao = document.getElementById('contrato-danos').value.trim();
    const propriedadeMateriais = document.getElementById('contrato-propriedade').value.trim();

    if (!clienteNome || !clienteEmail || !responsavelNome || !responsavelEmail) {
      Components.toast('Preencha os nomes e e-mails obrigatórios para ambos os signatários.', 'error');
      return;
    }
    if (!prazo) {
      Components.toast('Preencha a data específica de execução/entrega.', 'error');
      return;
    }

    // Loader
    Components.toast('Gerando PDF e enviando para ZapSign...', 'info');

    // Mapear itens de orçamento escalados
    const itemsSum = orc.itens ? orc.itens.reduce((sum, item) => sum + (item.subtotal || 0), 0) : 0;
    const baseTotal = itemsSum + (orc.maoDeObra || 0);
    const incremento = Math.round(baseTotal * ((orc.incrementoPct || 0) / 100) * 100) / 100;
    let itemsSumExibido = itemsSum;
    let productFactor = 1;

    if (itemsSum > 0) {
      itemsSumExibido = itemsSum + incremento;
      productFactor = itemsSumExibido / itemsSum;
    }

    let scaledItens = [];
    if (orc.itens && orc.itens.length > 0) {
      const targetItemsSum = itemsSumExibido;
      let sumOfScaledSubtotals = 0;
      scaledItens = orc.itens.map((item) => {
        const scaledPrecoUnitario = Math.round(item.precoUnitario * productFactor * 100) / 100;
        const scaledSubtotal = Math.round(scaledPrecoUnitario * item.quantidade * 100) / 100;
        sumOfScaledSubtotals += scaledSubtotal;
        return {
          ...item,
          scaledPrecoUnitario,
          scaledSubtotal
        };
      });

      const diff = Math.round((targetItemsSum - sumOfScaledSubtotals) * 100) / 100;
      if (diff !== 0 && scaledItens.length > 0) {
        const lastItem = scaledItens[scaledItens.length - 1];
        lastItem.scaledSubtotal = Math.round((lastItem.scaledSubtotal + diff) * 100) / 100;
        if (lastItem.quantidade > 0) {
          lastItem.scaledPrecoUnitario = Math.round((lastItem.scaledSubtotal / lastItem.quantidade) * 100) / 100;
        }
      }
    }

    // Criar elemento HTML temporário para renderizar o PDF do contrato
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    
    // Layout do PDF com a identidade visual do orçamento
    tempDiv.innerHTML = `
      <div id="contract-pdf-template" style="width: 720px; padding: 45px; font-family: 'Inter', 'Segoe UI', sans-serif; color: #1E293B; background: #FFFFFF; font-size: 13px; line-height: 1.6;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D85A30; padding-bottom: 12px; margin-bottom: 24px;">
          <div>
            ${this.getLogoSvgBase64() ? `<img src="${this.getLogoSvgBase64()}" style="max-width: 150px; max-height: 80px; height: auto; display: block;" />` : ''}
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <h3 style="margin: 0; color: #1E293B; font-size: 15px; font-weight: 700;">${orc.marcenariaNome || 'Bancada Móveis'}</h3>
            <p style="margin: 2px 0 0 0;">CNPJ/CPF: ${orc.marcenariaDocumento || '12.345.678/0001-90'}</p>
            <p style="margin: 2px 0 0 0;">Tel: ${orc.marcenariaTelefone || '(11) 99876-5432'}</p>
            <p style="margin: 2px 0 0 0;">E-mail: ${orc.marcenariaEmail || 'contato@bancada.com'}</p>
          </div>
        </div>

        <h2 style="text-align: center; color: #D85A30; font-size: 17px; font-weight: 800; margin-bottom: 30px; letter-spacing: 0.05em; text-transform: uppercase;">
          CONTRATO DE PRESTAÇÃO DE SERVIÇOS E FABRICAÇÃO DE MÓVEIS PLANEJADOS
        </h2>

        <div style="margin-bottom: 20px; font-size: 12.5px; text-align: justify;">
          Pelo presente instrumento particular, de um lado, na qualidade de <strong>CONTRATANTE</strong>, 
          ${clienteNome}, portador(a) do CPF/CNPJ sob o nº <strong>${clienteDocumento || '____________________'}</strong>, 
          residente no telefone ${clienteTelefone || '—'} e e-mail ${clienteEmail}. E de outro lado, na qualidade de 
          <strong>CONTRATADA</strong>, ${responsavelNome}, inscrita sob o CNPJ/CPF ${orc.marcenariaDocumento || '12.345.678/0001-90'}, 
          telefone ${orc.marcenariaTelefone || '(11) 99876-5432'} e e-mail ${responsavelEmail}. 
          Pactuam, de forma justa e contratada, o presente Contrato mediante as cláusulas a seguir expostas.
        </div>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA PRIMEIRA - OBJETO</h3>
        <p style="margin-top: 5px;">O objeto deste instrumento consiste na fabricação, fornecimento e instalação dos móveis planejados sob medida, conforme as especificações descritas a seguir:</p>
        <div style="background: #F8FAFC; padding: 10px; border-radius: 8px; border-left: 3px solid #D85A30; margin-bottom: 12px;">
          <strong>Projeto:</strong> ${orc.descricao}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
          <thead>
            <tr style="background: #F8FAFC; border-bottom: 2px solid #E2E8F0; text-align: left; font-weight: 700; color: #475569;">
              <th style="padding: 6px;">Descrição do Item</th>
              <th style="padding: 6px; text-align: center; width: 60px;">Qtd</th>
              <th style="padding: 6px; text-align: right; width: 120px;">Preço Unit.</th>
              <th style="padding: 6px; text-align: right; width: 120px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${scaledItens.map(item => `
              <tr style="border-bottom: 1px solid #F1F5F9;">
                <td style="padding: 8px 6px;">${item.produtoNome}</td>
                <td style="padding: 8px 6px; text-align: center;">${item.quantidade}</td>
                <td style="padding: 8px 6px; text-align: right;">${this.formatCurrency(item.scaledPrecoUnitario)}</td>
                <td style="padding: 8px 6px; text-align: right; font-weight: 600;">${this.formatCurrency(item.scaledSubtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA SEGUNDA - VALOR E FORMA DE PAGAMENTO</h3>
        <p style="margin-top: 5px;">Pelo escopo contratado, o(a) CONTRATANTE pagará à CONTRATADA o valor total líquido de <strong>${this.formatCurrency(orc.valor_total)}</strong>, obedecendo às condições detalhadas abaixo:</p>
        <p style="background: #F8FAFC; padding: 10px; border-radius: 8px; font-weight: 600; color: #1E293B; margin-top: 5px;">${formaPagamento}</p>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA TERCEIRA - PRAZO DE EXECUÇÃO</h3>
        <p style="margin-top: 5px;">A CONTRATADA obriga-se a realizar a entrega e montagem integral do projeto até o prazo final de <strong>${this.formatDate(prazo)}</strong>.</p>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA QUARTA - MULTA POR ATRASO</h3>
        <p style="margin-top: 5px; text-align: justify;">${multaAtraso}</p>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA QUINTA - RESCISÃO E CANCELAMENTO</h3>
        <p style="margin-top: 5px; text-align: justify;">${clausulaRescisao}</p>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA SEXTA - DANOS E MONTAGEM</h3>
        <p style="margin-top: 5px; text-align: justify;">${danosInstalacao}</p>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA SÉTIMA - GARANTIA</h3>
        <p style="margin-top: 5px; text-align: justify;">${garantia}</p>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA OITAVA - RESERVA DE DOMÍNIO</h3>
        <p style="margin-top: 5px; text-align: justify;">${propriedadeMateriais}</p>

        <h3 style="color: #1E293B; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">CLÁUSULA NONA - FORO</h3>
        <p style="margin-top: 5px;">As partes elegem o foro da Comarca de <strong>${foro}</strong> para solucionar qualquer controvérsia judicial relativa a este contrato.</p>

        <div style="margin-top: 40px; text-align: center;">
          <p>E, por estarem em pleno acordo com o teor deste instrumento, assinam eletronicamente o presente contrato.</p>
        </div>

        <div style="margin-top: 50px; display: flex; justify-content: space-between; gap: 40px; font-size: 11.5px;">
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px solid #94A3B8; margin-bottom: 6px;"></div>
            <strong>CONTRATADA (Marcenaria)</strong>
            <p style="margin: 2px 0 0 0;">${responsavelNome}</p>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 1px solid #94A3B8; margin-bottom: 6px;"></div>
            <strong>CONTRATANTE (Cliente)</strong>
            <p style="margin: 2px 0 0 0;">${clienteNome}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(tempDiv);

    // Configurar html2pdf
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `Contrato-${orc.codigo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Gera o PDF e obtém em base64 (como DataURI)
      const pdfBase64 = await html2pdf().from(tempDiv.firstElementChild).set(opt).outputPdf('datauristring');
      tempDiv.remove();

      // Limpar o prefixo data:application/pdf;base64,
      const cleanBase64 = pdfBase64.split(',')[1];

      // Enviar dados para o backend gerar na ZapSign
      const payload = {
        orcamentoId: orc.id,
        orcamentoCodigo: orc.codigo,
        clienteNome,
        clienteId: orc.clienteId,
        clienteEmail,
        responsavelNome,
        responsavelEmail,
        projeto: orc.descricao,
        valor: orc.valor_total,
        prazo,
        dadosAdicionais: {
          formaPagamento,
          prazoEntrega: prazo,
          multaAtraso,
          garantia,
          clausulaRescisao,
          danosInstalacao,
          propriedadeMateriais,
          foro
        },
        base64Pdf: cleanBase64
      };

      const result = await API.post('/api/contratos', payload);
      
      Components.toast('Contrato gerado com sucesso!', 'success');
      Components.closeModal();
      
      // Abre modal mostrando links de assinatura
      this.showSignatureLinksModal(result);

      // Re-carregar listagem
      this.render();

    } catch (err) {
      console.error(err);
      tempDiv.remove();
      Components.toast('Erro ao gerar contrato: ' + err.message, 'error');
    }
  },

  openContratoDetailsModal(contratoId) {
    const c = this.contratos.find(item => item.id === contratoId);
    if (!c) return;

    this.activeContrato = c;
    const formattedDate = this.formatDate(c.criadoEm.split('T')[0]);
    const formattedPrazo = this.formatDate(c.prazo);

    const clientSigner = c.signers[0];
    const bakerSigner = c.signers[1];

    let statusClass = 'rascunho';
    if (c.status === 'Enviado para assinatura') statusClass = 'enviado_para_assinatura';
    else if (c.status === 'Assinado por uma parte') statusClass = 'assinado_por_uma_parte';
    else if (c.status === 'Assinado por ambas') statusClass = 'assinado_por_ambas';
    else if (c.status === 'Cancelado') statusClass = 'cancelado';

    const contentHtml = `
      <div style="display:flex; flex-direction:column; gap:16px; background:#FFFFFF; padding:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.06); padding-bottom:12px; margin-bottom:8px; font-family:var(--font-main);">
          <h2 style="margin:0; font-size:18px; font-weight:800; color:var(--primary);">Contrato ${c.codigo}</h2>
          <span class="orc-badge orc-badge-${statusClass}">${c.status}</span>
        </div>

        <div style="background:#FAF8F5; border-radius:var(--radius-md); padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:13.5px; border:1px solid #E3E0D2; font-family:var(--font-main); color:var(--text-main); line-height:1.5; margin-bottom:12px;">
          <div><strong style="color:var(--text-secondary);">Cliente (Contratante):</strong> ${c.clienteNome}</div>
          <div><strong style="color:var(--text-secondary);">E-mail:</strong> ${c.clienteEmail || '—'}</div>
          <div><strong style="color:var(--text-secondary);">Responsável (Contratada):</strong> ${c.responsavelNome}</div>
          <div><strong style="color:var(--text-secondary);">E-mail:</strong> ${c.responsavelEmail || '—'}</div>
          <div><strong style="color:var(--text-secondary);">Projeto/Descrição:</strong> ${c.projeto}</div>
          <div><strong style="color:var(--text-secondary);">Orçamento Origem:</strong> ${c.orcamentoCodigo}</div>
          <div><strong style="color:var(--text-secondary);">Valor Contrato:</strong> ${this.formatCurrency(c.valor)}</div>
          <div><strong style="color:var(--text-secondary);">Prazo Entrega:</strong> ${formattedPrazo}</div>
          <div style="grid-column: span 2;"><strong style="color:var(--text-secondary);">Data Geração:</strong> ${formattedDate}</div>
        </div>

        <div style="margin-top:8px;">
          <h3 style="margin:0 0 12px 0; font-size:12px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; font-family:var(--font-main);">Links de Assinatura Eletrônica (ZapSign)</h3>
          
          ${c.status === 'Cancelado' ? `
            <div style="background:rgba(239, 68, 68, 0.08); border:1px solid var(--error); color:var(--error); padding:16px; border-radius:var(--radius-md); font-size:13.5px; font-weight:600; text-align:center; font-family:var(--font-main);">
              Este contrato foi CANCELADO e os links de assinatura foram invalidados.
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:12px;">
              <!-- Cliente -->
              <div style="background:#FFFFFF; border:1px solid #E3E0D2; border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between; gap:16px; box-shadow:var(--shadow-sm); font-family:var(--font-main);">
                <div style="flex-grow:1; min-width: 0;">
                  <strong style="font-size:11px; color:var(--primary); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:4px;">Assinatura do Cliente</strong>
                  <div style="font-size:14px; font-weight:700; color:var(--text-main);">${c.clienteNome} <span style="font-weight:500; font-size:12.5px; color:var(--text-secondary);">(${clientSigner.email})</span></div>
                  <div style="font-size:11px; color:var(--text-muted); word-break:break-all; margin-top:4px; font-family:monospace; background:#FAF8F5; padding:4px 8px; border-radius:4px; border:1px solid rgba(0,0,0,0.03);">${clientSigner.sign_url}</div>
                </div>
                <div style="display:flex; gap:8px; flex-shrink:0; align-items:center;">
                  <button class="orc-modal-btn-cancel" style="padding:8px 14px; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;" onclick="Orcamentos.copyText('${clientSigner.sign_url}', 'Link do cliente copiado!')"><i data-lucide="copy" style="width:14px; height:14px;"></i> Copiar Link</button>
                  <a href="https://api.whatsapp.com/send?phone=${encodeURIComponent(c.clienteTelefone || '')}&text=${encodeURIComponent(`Olá ${c.clienteNome}, segue o link para assinatura digital do contrato da marcenaria referente ao projeto de ${c.projeto}: ${clientSigner.sign_url}`)}" target="_blank" class="orc-btn-primary" style="padding:8px 14px; font-size:12.5px; background:#25D366; border:none; border-radius:8px; font-weight:700; color:#FFFFFF; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:var(--transition);" onmouseover="this.style.filter='brightness(0.9)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.filter='none'; this.style.transform='none';"><i data-lucide="send" style="width:14px;height:14px;"></i> WhatsApp</a>
                </div>
              </div>

              <!-- Marcenaria -->
              <div style="background:#FFFFFF; border:1px solid #E3E0D2; border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between; gap:16px; box-shadow:var(--shadow-sm); font-family:var(--font-main);">
                <div style="flex-grow:1; min-width: 0;">
                  <strong style="font-size:11px; color:var(--primary); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:4px;">Assinatura da Marcenaria (Você)</strong>
                  <div style="font-size:14px; font-weight:700; color:var(--text-main);">${c.responsavelNome} <span style="font-weight:500; font-size:12.5px; color:var(--text-secondary);">(${bakerSigner.email})</span></div>
                  <div style="font-size:11px; color:var(--text-muted); word-break:break-all; margin-top:4px; font-family:monospace; background:#FAF8F5; padding:4px 8px; border-radius:4px; border:1px solid rgba(0,0,0,0.03);">${bakerSigner.sign_url}</div>
                </div>
                <div style="display:flex; gap:8px; flex-shrink:0; align-items:center;">
                  <button class="orc-modal-btn-cancel" style="padding:8px 14px; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;" onclick="Orcamentos.copyText('${bakerSigner.sign_url}', 'Link do marceneiro copiado!')"><i data-lucide="copy" style="width:14px; height:14px;"></i> Copiar Link</button>
                  <a href="${bakerSigner.sign_url}" target="_blank" class="orc-btn-primary" style="padding:8px 14px; font-size:12.5px; background:var(--primary); border:none; border-radius:8px; font-weight:700; color:#FFFFFF; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:var(--transition);" onmouseover="this.style.background='var(--primary-dark)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='var(--primary)'; this.style.transform='none';"><i data-lucide="pen-tool" style="width:14px;height:14px;"></i> Assinar Agora</a>
                </div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="orc-modal-btn-cancel" onclick="Components.closeModal()">Fechar</button>
      <a href="${c.pdfPath}" target="_blank" class="orc-modal-btn-outline" style="text-decoration:none; display:inline-flex; align-items:center;"><i data-lucide="download" style="width:14px;height:14px;margin-right:6px;"></i> Visualizar Documento</a>
      ${c.status !== 'Cancelado' && c.status !== 'Assinado por ambas' ? `
        <button class="orc-btn-primary" style="background:#EF4444; padding:10px 20px;" onclick="Orcamentos.cancelContrato('${c.id}')"><i data-lucide="x-circle" style="width:14px;height:14px;display:inline-block;margin-right:6px;vertical-align:middle;"></i> Cancelar Contrato</button>
      ` : ''}
    `;

    Components.showModal('Detalhes do Contrato', contentHtml, footerHtml, 'contrato-details-modal');

    const modalEl = document.querySelector('.modal-content.contrato-details-modal');
    if (modalEl) {
      modalEl.style.maxWidth = '750px';
      modalEl.style.width = '95%';
      modalEl.style.background = '#FFFFFF';
    }

    Components.renderIcons();
  },

  async cancelContrato(contratoId) {
    Components.confirm('Deseja realmente cancelar este contrato? Esta ação é irreversível.', async () => {
      try {
        await API.put(`/api/contratos/${contratoId}/cancel`);
        Components.toast('Contrato cancelado com sucesso.', 'success');
        Components.closeModal();
        this.render();
      } catch (err) {
        console.error(err);
        Components.toast('Erro ao cancelar contrato: ' + err.message, 'error');
      }
    });
  },

  showSignatureLinksModal(contrato) {
    const clientSigner = contrato.signers[0];
    const bakerSigner = contrato.signers[1];

    const contentHtml = `
      <div style="display:flex; flex-direction:column; gap:16px; background:#FFFFFF; padding:10px; text-align:center; font-family:var(--font-main);">
        <i data-lucide="check-circle" style="width:60px; height:60px; color:var(--success); margin:0 auto;"></i>
        <h2 style="margin:0; font-size:20px; font-weight:800; color:var(--text-main);">Contrato Gerado com Sucesso!</h2>
        <p style="margin:0; font-size:13.5px; color:var(--text-secondary);">
          O contrato <strong>${contrato.codigo}</strong> foi enviado para a ZapSign. Copie os links abaixo para enviar aos signatários:
        </p>

        <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px; text-align:left;">
          <!-- Cliente Link -->
          <div style="background:#FFFFFF; border:1px solid #E3E0D2; border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between; gap:16px; box-shadow:var(--shadow-sm);">
            <div style="flex-grow:1; min-width: 0;">
              <strong style="font-size:11px; color:var(--primary); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:4px;">1. Cliente (Contratante)</strong>
              <div style="font-size:14px; font-weight:700; color:var(--text-main);">${contrato.clienteNome}</div>
              <div style="font-size:11px; color:var(--text-muted); word-break:break-all; margin-top:4px; font-family:monospace; background:#FAF8F5; padding:4px 8px; border-radius:4px; border:1px solid rgba(0,0,0,0.03);">${clientSigner.sign_url}</div>
            </div>
            <div style="display:flex; gap:8px; flex-shrink:0; align-items:center;">
              <button class="orc-modal-btn-cancel" style="padding:8px 14px; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;" onclick="Orcamentos.copyText('${clientSigner.sign_url}', 'Link do cliente copiado!')"><i data-lucide="copy" style="width:14px; height:14px;"></i> Copiar Link</button>
              <a href="https://api.whatsapp.com/send?phone=${encodeURIComponent(contrato.clienteTelefone || '')}&text=${encodeURIComponent(`Olá ${contrato.clienteNome}, segue o link para assinatura digital do contrato da marcenaria referente ao projeto de ${contrato.projeto}: ${clientSigner.sign_url}`)}" target="_blank" class="orc-btn-primary" style="padding:8px 14px; font-size:12.5px; background:#25D366; border:none; border-radius:8px; font-weight:700; color:#FFFFFF; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:var(--transition);" onmouseover="this.style.filter='brightness(0.9)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.filter='none'; this.style.transform='none';"><i data-lucide="send" style="width:14px;height:14px;"></i> WhatsApp</a>
            </div>
          </div>

          <!-- Marcenaria Link -->
          <div style="background:#FFFFFF; border:1px solid #E3E0D2; border-radius:var(--radius-md); padding:16px; display:flex; align-items:center; justify-content:space-between; gap:16px; box-shadow:var(--shadow-sm);">
            <div style="flex-grow:1; min-width: 0;">
              <strong style="font-size:11px; color:var(--primary); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:4px;">2. Marcenaria (Você)</strong>
              <div style="font-size:14px; font-weight:700; color:var(--text-main);">${contrato.responsavelNome}</div>
              <div style="font-size:11px; color:var(--text-muted); word-break:break-all; margin-top:4px; font-family:monospace; background:#FAF8F5; padding:4px 8px; border-radius:4px; border:1px solid rgba(0,0,0,0.03);">${bakerSigner.sign_url}</div>
            </div>
            <div style="display:flex; gap:8px; flex-shrink:0; align-items:center;">
              <button class="orc-modal-btn-cancel" style="padding:8px 14px; font-size:12.5px; display:inline-flex; align-items:center; gap:6px;" onclick="Orcamentos.copyText('${bakerSigner.sign_url}', 'Link da marcenaria copiado!')"><i data-lucide="copy" style="width:14px; height:14px;"></i> Copiar Link</button>
              <a href="${bakerSigner.sign_url}" target="_blank" class="orc-btn-primary" style="padding:8px 14px; font-size:12.5px; background:var(--primary); border:none; border-radius:8px; font-weight:700; color:#FFFFFF; text-decoration:none; display:inline-flex; align-items:center; gap:6px; transition:var(--transition);" onmouseover="this.style.background='var(--primary-dark)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='var(--primary)'; this.style.transform='none';"><i data-lucide="pen-tool" style="width:14px;height:14px;"></i> Assinar Agora</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="orc-btn-primary" style="padding: 10px 20px; background:var(--success);" onclick="Components.closeModal()">Pronto, Fechar</button>
    `;

    Components.showModal('Contrato Emitido', contentHtml, footerHtml, 'contrato-links-modal');

    const modalEl = document.querySelector('.modal-content.contrato-links-modal');
    if (modalEl) {
      modalEl.style.maxWidth = '750px';
      modalEl.style.width = '95%';
      modalEl.style.background = '#FFFFFF';
    }
    Components.renderIcons();
  },

  copyText(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
      Components.toast(successMessage || 'Texto copiado para a área de transferência!', 'success');
    }).catch(err => {
      console.error(err);
      Components.toast('Erro ao copiar texto.', 'error');
    });
  },

  // Helpers de formatação
  formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
};