# Padrão de Design: Pop-ups, Modais e Alerts no Tomada

Esta sub-skill define o padrão visual e de marcação para a criação e acionamento de qualquer pop-up, modal ou notificação (toast) no sistema Tomada.

---

## 1. Estrutura HTML Padrão (Declarativa)

Sempre que definir um modal estático em arquivos HTML, use a seguinte estrutura de classes:

```html
<div class="modal" id="modal-exemplo">
  <div class="modal-content">
    <!-- Cabeçalho -->
    <div class="modal-header">
      <h3 class="modal-title">Título do Modal</h3>
      <button class="modal-close" onclick="fecharModal()">&times;</button>
    </div>
    
    <!-- Corpo -->
    <div class="modal-body">
      <form id="form-exemplo">
        <div class="form-group">
          <label for="campo-nome">Nome Completo</label>
          <input type="text" id="campo-nome" class="form-control" placeholder="Digite o nome..." required>
        </div>
      </form>
    </div>
    
    <!-- Ações / Rodapé -->
    <div class="modal-actions">
      <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
      <button type="submit" form="form-exemplo" class="btn-primary">Salvar</button>
    </div>
  </div>
</div>
```

---

## 2. API Helper JavaScript (`Components`)

Para abrir e fechar modais programaticamente via JavaScript sem duplicar código HTML, utilize o helper global `Components` definido em `components.js`:

### Abrir Modal Programático:
```javascript
Components.showModal(
  'Título do Modal',
  `
    <div class="form-group">
      <label>Campo de Texto</label>
      <input class="input-control" placeholder="Texto aqui...">
    </div>
  `,
  `
    <button class="btn-secondary" onclick="Components.closeModal()">Cancelar</button>
    <button class="btn-primary" onclick="salvarAcao()">Confirmar</button>
  `
);
```

### Exibir Toasts de Notificação:
```javascript
// Toasts padrão
Components.toast('Ação concluída com sucesso!', 'success');
Components.toast('Preencha os campos obrigatórios.', 'warning');
Components.toast('Ocorreu um erro no servidor.', 'danger');
```

---

## 3. Estilização CSS e Efeitos de Transição

Todos os modais devem ter o efeito de desfoque de fundo (backdrop filter blur) e fade-in suave:

```css
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.modal.active {
  display: flex;
  opacity: 1;
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 500px;
  transform: scale(0.95);
  transition: transform 0.25s ease;
  overflow: hidden;
}

.modal.active .modal-content {
  transform: scale(1);
}
```
