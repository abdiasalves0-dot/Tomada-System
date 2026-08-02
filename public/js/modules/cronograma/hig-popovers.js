const HigPopovers = {
  init() {
    this.initFlatpickr();
    this.initCustomSelects();
  },

  initFlatpickr() {
    if (typeof flatpickr !== 'undefined') {
      const dateInputs = document.querySelectorAll("input[type='date'], #card-prazo, .p-input[type='date'], #tarefa-form input[type='date'], #form-exportar-cronograma input[type='date']");
      dateInputs.forEach(input => {
        if (input._flatpickr) return;
        flatpickr(input, {
          locale: "pt",
          altInput: true,
          altFormat: "d/m/Y",
          dateFormat: "Y-m-d",
          disableMobile: true,
          allowInput: true
        });
      });

      const timeInputs = document.querySelectorAll("input[type='time'], #tarefa-form input[type='time'], #form-exportar-cronograma input[type='time']");
      timeInputs.forEach(input => {
        if (input._flatpickr) return;
        flatpickr(input, {
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i",
          time_24hr: true,
          disableMobile: true,
          allowInput: true
        });
      });
    }
  },

  initCustomSelects() {
    const selectors = [
      '#tarefa-form select',
      '#form-exportar-cronograma select',
      '.trello-select',
      'select.cal-month-select',
      '.cal-month-select',
      '#card-caixa',
      'select.p-input'
    ].join(', ');

    const selects = document.querySelectorAll(selectors);

    selects.forEach(select => {
      // Don't initialize twice
      if (select.dataset.higInitialized) return;

      // Guard: skip selects with no options at all
      if (!select.options || select.options.length === 0) return;

      select.dataset.higInitialized = "true";

      // Hide original select
      select.style.display = 'none';

      // Create trigger wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'hig-select-wrapper';

      const trigger = document.createElement('div');
      trigger.className = `hig-select-trigger ${select.className}`;

      const textSpan = document.createElement('span');
      textSpan.className = 'hig-select-text';

      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', 'chevron-down');
      icon.className = 'hig-select-icon';

      trigger.appendChild(textSpan);
      trigger.appendChild(icon);
      wrapper.appendChild(trigger);

      select.parentNode.insertBefore(wrapper, select);

      // Function to update trigger text — defensiva contra selectedIndex = -1
      const updateText = () => {
        const idx = select.selectedIndex;
        const selectedOpt = (idx >= 0 && idx < select.options.length)
          ? select.options[idx]
          : null;
        textSpan.textContent = selectedOpt ? selectedOpt.text : 'Selecione...';
      };

      updateText();

      // Popover menu
      let menu = null;
      let isOpen = false;

      const closeMenu = () => {
        if (menu) {
          menu.style.opacity = '0';
          menu.style.transform = 'scale(0.95) translateY(-5px)';
          setTimeout(() => {
            if (menu && menu.parentNode) {
              menu.parentNode.removeChild(menu);
            }
            menu = null;
          }, 200);
        }
        isOpen = false;
        trigger.classList.remove('active');
        document.removeEventListener('click', clickOutsideHandler);
      };

      const clickOutsideHandler = (e) => {
        if (!wrapper.contains(e.target) && (!menu || !menu.contains(e.target))) {
          closeMenu();
        }
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();

        if (isOpen) {
          closeMenu();
          return;
        }

        // Close other open menus
        document.querySelectorAll('.hig-select-menu').forEach(m => {
          m.style.opacity = '0';
          setTimeout(() => m.remove(), 200);
        });

        trigger.classList.add('active');

        menu = document.createElement('div');
        menu.className = 'hig-select-menu';

        const rect = wrapper.getBoundingClientRect();

        // Collect valid options
        const validOptions = Array.from(select.options).filter(opt => !(opt.value === "" && opt.disabled));
        const hasSearch = validOptions.length > 5;

        // Add search input if many options
        if (hasSearch) {
          const searchWrap = document.createElement('div');
          searchWrap.className = 'hig-select-search-wrap';
          searchWrap.innerHTML = `<input type="text" class="hig-select-search" placeholder="Buscar..." autocomplete="off" />`;
          menu.appendChild(searchWrap);

          const searchInput = searchWrap.querySelector('input');

          searchWrap.addEventListener('click', (ev) => ev.stopPropagation());

          searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            const items = menu.querySelectorAll('.hig-select-item');
            items.forEach(item => {
              const text = item.querySelector('span').textContent.toLowerCase();
              item.style.display = text.includes(query) ? '' : 'none';
            });
          });

          setTimeout(() => searchInput.focus(), 100);
        }

        // Items container (scrollable area)
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'hig-select-items';

        // Render options
        validOptions.forEach((opt) => {
          const realIndex = Array.from(select.options).indexOf(opt);

          const item = document.createElement('div');
          item.className = 'hig-select-item';
          if (realIndex === select.selectedIndex) {
            item.classList.add('selected');
            item.innerHTML = `<span>${opt.text}</span><i data-lucide="check" class="hig-check"></i>`;
          } else {
            item.innerHTML = `<span>${opt.text}</span>`;
          }

          item.addEventListener('click', (ev) => {
            ev.stopPropagation();
            select.selectedIndex = realIndex;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            updateText();
            closeMenu();
          });

          itemsContainer.appendChild(item);
        });

        if (select.id === 'card-caixa') {
          const addBtn = document.createElement('div');
          addBtn.className = 'hig-select-add-new';
          addBtn.style.cssText = 'padding: 12px 14px; border-top: 1px solid var(--ref-border, #E8E4DD); color: #E55A2B; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; background: #FFF;';
          addBtn.innerHTML = `<i data-lucide="plus-circle" style="width: 15px; height: 15px;"></i> Nova Caixa`;
          
          addBtn.addEventListener('mouseenter', () => { addBtn.style.background = '#F8F6F1'; });
          addBtn.addEventListener('mouseleave', () => { addBtn.style.background = '#FFF'; });
          
          addBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const nomeCaixa = prompt('Digite o nome da nova caixa organizadora:');
            if (nomeCaixa && nomeCaixa.trim()) {
              if (window.Planejamento) {
                const novaCx = {
                  id: 'cx_' + Date.now(),
                  nome: nomeCaixa.trim(),
                  cor: '#E55A2B',
                  tema: 'theme-orange',
                  aberta: true
                };
                window.Planejamento.caixas.push(novaCx);
                window.Planejamento.salvarCaixas();
                
                const option = document.createElement('option');
                option.value = novaCx.id;
                option.text = novaCx.nome;
                option.selected = true;
                select.appendChild(option);
                
                select.dispatchEvent(new Event('change', { bubbles: true }));
                window.Planejamento.render();
                closeMenu();
                
                if (typeof Components !== 'undefined') {
                  Components.toast('Caixa adicionada!', 'success');
                }
              }
            }
          });
          menu.appendChild(addBtn);
        }

        menu.appendChild(itemsContainer);

        document.body.appendChild(menu);

        menu.style.position = 'fixed';
        menu.style.left = `${rect.left}px`;
        menu.style.width = `${rect.width}px`;
        menu.style.zIndex = '999999';

        const menuRect = menu.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top;
        const estimatedHeight = menuRect.height > 0 ? menuRect.height : 150;

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
          if (!menu) return;
          menu.style.opacity = '1';
          menu.style.transform = 'scale(1) translateY(0)';
        });

        isOpen = true;
        document.addEventListener('click', clickOutsideHandler);
      });

      // Update text if select value changes externally
      select.addEventListener('change', updateText);
    });
  }
};

window.HigPopovers = HigPopovers;