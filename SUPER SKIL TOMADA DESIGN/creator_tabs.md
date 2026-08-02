# Padrão de Design: Abas e Roteamento do Perfil Criador

Esta sub-skill define as abas existentes no painel do Criador, a estrutura do Switch de Abas (desktop e mobile) e como manter a fidelidade visual ao adicionar ou modificar seções.

---

## 1. Estrutura do Switch de Abas Premium

Para alternar entre sub-abas dentro do perfil do Criador (como Semanal, Mensal, Prospecção e Buscar Parcerias), utilizamos um controle deslizante segmentado de estilo premium baseado no iOS/Toss:

```html
<!-- Switcher de Período / Sub-abas (Desktop) -->
<div class="cs-period-selector-container">
  <div class="cs-period-selector-desktop">
    <!-- Slider deslizante que se move dinamicamente por transform: translateX() -->
    <div class="cs-period-slider" id="period-slider" style="width: calc(25% - 5px); transform: translateX(0px);"></div>
    
    <button class="cs-period-btn active" onclick="App.navigate('semanal')">Semanal</button>
    <button class="cs-period-btn" onclick="App.navigate('mensal')">Mensal</button>
    <button class="cs-period-btn" onclick="App.navigate('prospeccao')">Prospecção</button>
    <button class="cs-period-btn" onclick="App.navigate('buscar')">Buscar Parcerias</button>
  </div>
</div>
```

---

## 2. Movimentação do Slider (Lógica JS)

Sempre que a sub-aba for alterada, o indicador deslizante deve se mover correspondente à posição da aba ativa:

```javascript
function updatePeriodSlider(selectedTab) {
  const slider = document.getElementById('period-slider');
  if (!slider) return;

  // Mapeamento de posições de translateX para 4 abas (25% cada)
  const positions = {
    'semanal': '0%',
    'mensal': '100%',
    'prospeccao': '200%',
    'buscar': '300%'
  };

  slider.style.width = 'calc(25% - 5px)';
  slider.style.transform = `translateX(${positions[selectedTab] || '0%'})`;
}
```

---

## 3. Popover Seletor Mobile (HIG/iOS Style)

Para dispositivos móveis, o switcher horizontal é compactado em um único botão que abre um popover elegante:

```javascript
function openMobilePeriodPopover(event) {
  event.stopPropagation();
  const triggerBtn = event.currentTarget;
  
  // Remove popover anterior se houver
  const existing = document.getElementById('mobile-period-popover');
  if (existing) {
    existing.remove();
    return;
  }

  const popover = document.createElement('div');
  popover.id = 'mobile-period-popover';
  popover.className = 'mobile-popover-menu';
  popover.innerHTML = `
    <button onclick="App.navigate('semanal')">Semanal</button>
    <button onclick="App.navigate('mensal')">Mensal</button>
    <button onclick="App.navigate('prospeccao')">Prospecção</button>
    <button onclick="App.navigate('buscar')">Buscar Parcerias</button>
  `;

  document.body.appendChild(popover);
  
  // Posicionamento absoluto logo abaixo do botão acionador
  const rect = triggerBtn.getBoundingClientRect();
  popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
  popover.style.left = `${rect.left + window.scrollX}px`;
}
```
