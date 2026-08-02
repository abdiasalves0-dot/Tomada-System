/**
 * 💾 MÓDULO DE MEMÓRIA PERSISTENTE — ASSISTENTE YOUTUBE (COPILOT IA)
 * 
 * Responsável por armazenar o histórico de conversas, preferências do criador,
 * jogos favoritos e contexto acumulado no localStorage para que a IA NUNCA
 * comece do zero em novas sessões ou recarregamentos de página.
 */

const AssistenteMemoria = {
  STORAGE_KEY: 'tomada_assistente_youtube_memoria_v1',

  // 1. Estrutura Padrão de Memória
  obterMemoriaPadrao() {
    return {
      criadoEm: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString(),
      historico: [
        {
          role: 'model',
          texto: ' Fala, Criador! Sou o seu **YouTube Copilot IA**. Estou munido com todo o conhecimento de SEO, retenção de vídeos e tendências do nicho Gaming (Minecraft, Pokémon, GTA, Roblox, Elden Ring, Valorant e mais).\n\nComo posso alavancar o seu canal hoje?',
          data: new Date().toISOString()
        }
      ],
      contextoCriador: {
        jogosFavoritos: ['Minecraft', 'Game Dev Tycoon', 'Pokémon'],
        estiloPreferido: 'Gameplay com Desafios / 100 Dias',
        canalConectado: null
      }
    };
  },

  // 2. Carregar Memória do LocalStorage
  obterMemoria() {
    try {
      const dataStr = localStorage.getItem(this.STORAGE_KEY);
      if (!dataStr) {
        const memoriaInicial = this.obterMemoriaPadrao();
        this.salvarMemoria(memoriaInicial);
        return memoriaInicial;
      }
      const data = JSON.parse(dataStr);
      if (!data.historico || !Array.isArray(data.historico)) {
        data.historico = this.obterMemoriaPadrao().historico;
      }
      return data;
    } catch (e) {
      console.warn('[AssistenteMemoria] Erro ao carregar memória:', e);
      return this.obterMemoriaPadrao();
    }
  },

  // 3. Salvar Objeto Completo de Memória
  salvarMemoria(memoriaObj) {
    try {
      memoriaObj.ultimaAtualizacao = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memoriaObj));
    } catch (e) {
      console.error('[AssistenteMemoria] Erro ao salvar memória:', e);
    }
  },

  // 4. Adicionar Mensagem ao Histórico
  salvarMensagem(role, texto) {
    const memoria = this.obterMemoria();
    memoria.historico.push({
      role: role === 'user' ? 'user' : 'model',
      texto: texto,
      data: new Date().toISOString()
    });

    // Limitar histórico aos últimos 40 registros para manter token budget leve e rápido
    if (memoria.historico.length > 40) {
      memoria.historico = memoria.historico.slice(-40);
    }

    this.salvarMemoria(memoria);
  },

  // 5. Obter Histórico Formatado para Enviar à API Gemini
  obterHistoricoParaPrompt(maxMsgs = 12) {
    const memoria = this.obterMemoria();
    const msgs = memoria.historico.slice(-maxMsgs);

    return msgs.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.texto }]
    }));
  },

  // 6. Atualizar Informações do Canal/Criador
  atualizarContextoCriador(dadosCanal) {
    if (!dadosCanal) return;
    const memoria = this.obterMemoria();
    memoria.contextoCriador.canalConectado = {
      nome: dadosCanal.nome,
      subscribers: dadosCanal.subscribers,
      views: dadosCanal.views,
      avatar: dadosCanal.avatar
    };
    this.salvarMemoria(memoria);
  },

  // 7. Limpar Histórico de Mensagens (Mantendo Preferências)
  limparHistorico() {
    const memoria = this.obterMemoria();
    memoria.historico = [
      {
        role: 'model',
        texto: '🧹 Histórico de conversa limpo! Como posso te ajudar com o seu próximo vídeo?',
        data: new Date().toISOString()
      }
    ];
    this.salvarMemoria(memoria);
  }
};

// Exporta para escopo global
if (typeof window !== 'undefined') {
  window.AssistenteMemoria = AssistenteMemoria;
}
