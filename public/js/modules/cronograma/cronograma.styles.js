/**
 * ARQUIVO: cronograma.styles.js
 * CATEGORIA: Cronograma › Estilos e accordion mobile
 * RESPONSABILIDADE: Injeta CSS mobile dinamicamente e controla accordion (Bypassado)
 * DEPENDE DE: cronograma.state.js, cronograma.render.js (chama renderSemanal)
 * EXPORTA: renderStyles(), toggleBaker()
 */

Object.assign(Cronograma, {
  renderStyles() {
    // Styles are loaded statically via link tags in index.html to separate desktop and mobile views.
  },

  toggleBaker(id) {
    if (this.expandedBakers.has(id)) this.expandedBakers.delete(id);
    else this.expandedBakers.add(id);
    this.renderSemanal();
  },
});
