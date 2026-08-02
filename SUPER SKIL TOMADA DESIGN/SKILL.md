---
name: super-skill-tomada-design
description: Super Skill de Design Tomada - Padrão obrigatório de diagramação, componentes, grid 2-colunas, modais, cores HSL/Variables e distribuição de layout para a interface Tomada.
---

# Super Skill de Design: Sistema Tomada

Esta skill define as regras de **UI/UX**, **diagramação**, **grid system**, **paleta de cores**, **estilos de componentes** e **popups/modais** do sistema Tomada.

Ela deve ser consultada por qualquer agente IA antes de criar novas abas, páginas, dashboards ou componentes, garantindo que o nível estético seja mantido no padrão premium do sistema sem alucinações visuais.

---

## 📁 Arquivos da Skill

1. **[diagramacao_e_elementos.md](file:///c:/Users/sambalele/Music/Bancada/Bancada/SUPER%20SKIL%20TOMADA%20DESIGN/diagramacao_e_elementos.md)**: Regras de Grid (2fr | 1fr), hierarquia visual, Z-pattern, ritmos de padding, status badges e botões.
2. **[popups.md](file:///c:/Users/sambalele/Music/Bancada/Bancada/SUPER%20SKIL%20TOMADA%20DESIGN/popups.md)**: Padrão completo para pop-ups/modais com desfoque de fundo (`backdrop-filter: blur(4px)`) e o utilitário `Components.showModal`.
3. **[creator_tabs.md](file:///c:/Users/sambalele/Music/Bancada/Bancada/SUPER%20SKIL%20TOMADA%20DESIGN/creator_tabs.md)**: Estrutura dos switchers de abas segmentados (desktop e mobile).

---

## 🎨 Design Tokens & Paleta de Cores

| Variável CSS | Cor | Uso Principal |
| :--- | :--- | :--- |
| `var(--primary)` | `#E55A2B` | Tom Laranja Oficial de Ação (Buttons, Highlights, Links) |
| `var(--primary-dark)` | `#C8461B` | Hover de Botões Principais |
| `var(--primary-light)` | `rgba(229, 90, 43, 0.08)` | Fundos de Badges Ativos e Seções em Destaque |
| `var(--bg-main)` | `#FAF8F5` | Fundo Geral da Aplicação (Areia Claro Premium) |
| `var(--bg-card)` | `#FFFFFF` | Cards Bento, Modais e Painéis de Conteúdo |
| `var(--separator)` | `#EBE5DF` | Divisores e Bordas de Cards |
| `var(--text-main)` | `#1C1A14` | Títulos e Textos Principais |
| `var(--text-secondary)` | `#7A7567` | Subtítulos, Labels e Metadados |

---

## 📐 Regras Fundamentais de Diagramação para Novas Abas

Toda nova aba criada DEVE seguir rigorosamente esta estrutura de layout:

1. **Header da Página (`.header-dashboard`)**:
   - Título `<h1>` grande à esquerda (fonte `'Outfit', sans-serif`, 32px, bold).
   - Subtítulo informativo em `var(--text-secondary)`.
   - Badge de Perfil (`.creator-profile-badge`) alinhado à direita.

2. **Sub-abas / Switcher (`.cs-period-selector-desktop`)**:
   - Botões segmentados dentro de um contêiner cinza com fundo deslizante laranja/branco (`.cs-period-slider`).

3. **Grade Principal (`.grid-dashboard`)**:
   - **Coluna Esquerda (2fr / 66%)**: Listagens principais, tabelas bento ou formulários detalhados.
   - **Coluna Direita (1fr / 33%)**: Cards de resumo (KPIs), filtros e barra de ações rápidas.

4. **Componentes Padrão**:
   - **Cards**: `.card` com borda `1px solid var(--separator)` e border-radius `16px`.
   - **Botões**: `.btn-primary` para ação principal (`#E55A2B`), `.btn-secondary` para ações secundárias.
   - **Ícones**: Sempre utilizar a biblioteca `Lucide` chamando `lucide.createIcons()` após renderizações dinâmicas.
