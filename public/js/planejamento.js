/**
 * Tomada Sistema - Módulo de Planejamento de Conteúdo
 * v5 - Layout Edge-to-Edge sem margens/bordas externas (área segura total)
 * Cards compactados e reduzidos com barra de progresso do checklist premium (Imagem 3)
 * Modais de criação/edição no estilo premium Bento do sistema (Nova Tarefa do Cronograma)
 * 
 * CORREÇÃO v5.1: Padding do Canvas removido — edge-to-edge verdadeiro com flex layout
 */

const Planejamento = window.Planejamento = {
  subAbaAtiva: 'caixas', // 'caixas', 'canvas' ou 'recomendacao'
  activeCaixaId: null, // Caixa selecionada no momento para visualização expandida
  caixas: [],
  cards: [],
  searchQuery: '',
  clockTimer: null,
  draggedCardId: null,
  activeTabRight: 'cards',
  activeFilterRight: 'todos',
  mensagens: [],
  atividades: [],

  // Estados da Sub-aba Sugestões (paginação de ideias)
  paginaAtualSugestoes: 1,
  itensPorPaginaSugestoes: 30,

  // Estados da Sub-aba Recomendação (YouTube API + Gemini AI)
  nichoRecomendacao: 'Games & Gameplay',
  paginaAtualRecomendacao: 1,
  itensPorPaginaRecomendacao: 15,
  recomendacoesList: [
    {
      id: 'rec_sug_1',
      titulo: 'COMO CRIAR PROJETOS DE MARCENARIA 3D 10x MAIS RÁPIDO EM 2026',
      gancho: 'Mostrar o móvel 3D final nos primeiros 3 segundos antes de revelar o programa secreto usado.',
      roteiro: '1. Apresentação do desafio e tempo recorde\n2. Modelagem do projeto 3D passo a passo\n3. Lista de materiais e orçamento automático.',
      formato: 'Vídeo Longo',
      viralScore: 98,
      nichoTag: 'Marcenaria & Projetos 3D',
      thumb: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80',
      viewsEst: '45k views'
    },
    {
      id: 'rec_sug_2',
      titulo: 'OS 5 MAIORES ERROS AO CORTAR MDF QUE VOCÊ DEVE EVITAR',
      gancho: '"Se você faz isso na sua serra, está rasgando dinheiro e estragando MDF agora!"',
      roteiro: '1. Erro 1: Lâmina inadequada\n2. Erro 2: Velocidade incorreta\n3. A dica definitiva dos mestres.',
      formato: 'Shorts',
      viralScore: 95,
      nichoTag: 'Marcenaria',
      thumb: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      viewsEst: '82k views'
    },
    {
      id: 'rec_sug_3',
      titulo: 'TESTEI A FERRAMENTA MAIS BARATA DE MARCENARIA - VALE A PENA?',
      gancho: 'Unboxing imediato comparando com a tupia de R$ 3.000.',
      roteiro: '1. Comparativo de custo vs benefício\n2. Teste prático em madeira maciça\n3. Veredito final surpreendente.',
      formato: 'Tutorial',
      viralScore: 92,
      nichoTag: 'DIY & Ferramentas',
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      viewsEst: '30k views'
    },
    {
      id: 'rec_sug_4',
      titulo: 'TRANSFORMEI UMA IDEIA SIMPLES EM UM MÓVEL DE LUXO DE R$ 5.000',
      gancho: 'Mostrar o pedaço de madeira bruta e em seguida a mesa de resina finalizada.',
      roteiro: '1. Preparação da madeira e molde\n2. Aplicação de resina com pigmento\n3. Lixamento até o acabamento espelhado.',
      formato: 'Desafio',
      viralScore: 89,
      nichoTag: 'Projetos 3D',
      thumb: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
      viewsEst: '60k views'
    }
  ],
  carregandoRecomendacoes: false,

  // Estados do Canvas Infinito (Whiteboard)
  canvasPan: { x: 80, y: 70 },
  canvasZoom: 1.0,
  canvasNodes: [],
  canvasEdges: [],
  canvasSelectedNodeIds: [],
  canvasSelectedEdgeId: null,
  canvasConnectingFrom: null,

  tagColors: [
    { name: 'Laranja Tomada', hex: '#E55A2B' },
    { name: 'Roxo Criador', hex: '#8B5CF6' },
    { name: 'Azul Shorts', hex: '#3B82F6' },
    { name: 'Verde Podcast', hex: '#10B981' },
    { name: 'Rosa Reels', hex: '#EC4899' },
    { name: 'Amarelo Alerta', hex: '#F59E0B' },
    { name: 'Cinza Neutro', hex: '#64748B' }
  ],

  escurecerCor(hex, percent = 20) {
    let num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 + (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 + (B < 0 ? 0 : B > 255 ? 255 : B)).toString(16).slice(1);
  },

  handleThumbFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.processarThumbFile(file);
    }
  },

  processarThumbFile(file) {
    if (!file.type.startsWith('image/')) {
      if (typeof Components !== 'undefined') Components.toast('Selecione uma imagem válida.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target.result;
      const inputUrl = document.getElementById('card-thumb');
      if (inputUrl) {
        inputUrl.value = base64Url;
      }
      this.atualizarPreviewThumb(base64Url);
    };
    reader.readAsDataURL(file);
  },

  handleThumbDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const zone = document.getElementById('card-thumb-dropzone');
    if (zone) {
      zone.style.borderColor = 'var(--ref-primary)';
      zone.style.background = 'rgba(229, 90, 43, 0.05)';
    }
  },

  handleThumbDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const zone = document.getElementById('card-thumb-dropzone');
    if (zone) {
      zone.style.borderColor = 'var(--ref-border)';
      zone.style.background = '#F8F6F1';
    }
  },

  handleThumbDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const zone = document.getElementById('card-thumb-dropzone');
    if (zone) {
      zone.style.borderColor = 'var(--ref-border)';
      zone.style.background = '#F8F6F1';
    }
    const file = e.dataTransfer.files[0];
    if (file) {
      this.processarThumbFile(file);
    }
  },

  async init() {
    this.carregarDados();
    this.carregarDadosCanvas();
    await this.carregarStatusCanal();
    if (this.subAbaAtiva === 'sugestoes' && !this.sugestoesCache) {
      this.carregarSugestoesCanal();
    }
    this.render();
  },

  setSubAba(subAba) {
    this.subAbaAtiva = subAba;
    if (subAba === 'canvas' && (this.canvasPan.x === 0 || this.canvasPan.y === 0)) {
      this.canvasPan = { x: 80, y: 70 };
    }
    if (subAba === 'recomendacao' && (!this.recomendacoesList || this.recomendacoesList.length === 0)) {
      this.buscarRecomendacoesNicho(this.nichoRecomendacao || 'Marcenaria & Projetos 3D');
    }
    if (subAba === 'sugestoes' && !this.sugestoesCache) {
      this.carregarSugestoesCanal();
    }
    this.render();
  },

  carregarDadosCanvas() {
    try {
      const savedNodes = localStorage.getItem('tomada_planejamento_canvas_nodes');
      const savedEdges = localStorage.getItem('tomada_planejamento_canvas_edges');

      if (savedNodes) {
        this.canvasNodes = JSON.parse(savedNodes);
      } else {
        this.canvasNodes = [
          {
            id: 'node_1',
            type: 'text',
            x: 200,
            y: 150,
            width: 320,
            height: 200,
            title: '💡 Roteiro Principal: IA em 2026',
            text: 'Criar gancho de 5s mostrando geração automática de vídeos. Em seguida apresentar os 3 pilares do sistema.'
          },
          {
            id: 'node_2',
            type: 'file',
            x: 580,
            y: 150,
            width: 300,
            height: 220,
            title: '🖼️ Capa Demonstrativa',
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'node_3',
            type: 'link',
            x: 200,
            y: 390,
            width: 320,
            height: 140,
            title: '🔗 Referência de Inspiração',
            url: 'https://youtube.com/watch?v=demo'
          },
          {
            id: 'node_4',
            type: 'group',
            x: 160,
            y: 80,
            width: 760,
            height: 480,
            title: '📦 Quadro de Roteiro & Produção (Grupo)',
            color: 'rgba(229, 90, 43, 0.04)'
          }
        ];
        this.salvarDadosCanvas();
      }

      if (savedEdges) {
        this.canvasEdges = JSON.parse(savedEdges);
      } else {
        this.canvasEdges = [
          {
            id: 'edge_1',
            fromNode: 'node_1',
            fromAnchor: 'right',
            toNode: 'node_2',
            toAnchor: 'left',
            color: '#E55A2B',
            label: 'Usa Capa'
          },
          {
            id: 'edge_2',
            fromNode: 'node_1',
            fromAnchor: 'bottom',
            toNode: 'node_3',
            toAnchor: 'top',
            color: '#8B5CF6',
            label: 'Fonte'
          }
        ];
        this.salvarDadosCanvas();
      }
    } catch (e) {
      console.error('Erro ao carregar dados do Canvas:', e);
    }
  },

  salvarDadosCanvas() {
    localStorage.setItem('tomada_planejamento_canvas_nodes', JSON.stringify(this.canvasNodes));
    localStorage.setItem('tomada_planejamento_canvas_edges', JSON.stringify(this.canvasEdges));
  },

  addCanvasNode(type) {
    const id = 'node_' + Date.now();
    const centerX = (-this.canvasPan.x + 300) / this.canvasZoom;
    const centerY = (-this.canvasPan.y + 200) / this.canvasZoom;

    if (type === 'file') {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target.result;
          let novoNo = {
            id,
            type: 'file',
            x: Math.round(centerX),
            y: Math.round(centerY),
            width: 300,
            height: 240,
            title: '🖼️ ' + file.name.replace(/\.[^/.]+$/, ""),
            url: base64Url,
            color: '#FFFFFF'
          };
          this.canvasNodes.push(novoNo);
          this.canvasSelectedNodeIds = [id];
          this.salvarDadosCanvas();
          this.render();
          if (typeof Components !== 'undefined') Components.toast('Imagem enviada e adicionada ao Canvas!', 'success');
        };
        reader.readAsDataURL(file);
      };
      fileInput.click();
      return;
    }

    let novoNo = {
      id,
      type,
      x: Math.round(centerX),
      y: Math.round(centerY),
      width: type === 'group' ? 450 : 320,
      height: type === 'group' ? 300 : (type === 'link' ? 140 : 180),
      title: type === 'text' ? '📌 Novo Bloco de Texto' : (type === 'link' ? '🔗 Novo Link' : '📦 Novo Grupo (Frame)'),
      text: type === 'text' ? 'Digite suas anotações ou roteiro aqui...' : '',
      url: type === 'link' ? 'https://google.com' : '',
      color: type === 'group' ? 'rgba(229, 90, 43, 0.04)' : '#FFFFFF'
    };

    this.canvasNodes.push(novoNo);
    this.canvasSelectedNodeIds = [id];
    this.salvarDadosCanvas();
    this.render();
    if (typeof Components !== 'undefined') Components.toast('Nó adicionado ao Canvas!', 'success');
  },

  triggerCanvasNodeImageUpload(nodeId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        const node = this.canvasNodes.find(n => n.id === nodeId);
        if (node) {
          node.url = base64Url;
          this.salvarDadosCanvas();
          this.render();
          if (typeof Components !== 'undefined') Components.toast('Imagem do card atualizada!', 'success');
        }
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  },

  deleteSelectedCanvasElements() {
    if (this.canvasSelectedNodeIds.length > 0) {
      const selected = new Set(this.canvasSelectedNodeIds);
      this.canvasNodes = this.canvasNodes.filter(n => !selected.has(n.id));
      this.canvasEdges = this.canvasEdges.filter(e => !selected.has(e.fromNode) && !selected.has(e.toNode));
      this.canvasSelectedNodeIds = [];
      this.salvarDadosCanvas();
      this.render();
      if (typeof Components !== 'undefined') Components.toast('Nó(s) removido(s).', 'info');
    } else if (this.canvasSelectedEdgeId) {
      this.canvasEdges = this.canvasEdges.filter(e => e.id !== this.canvasSelectedEdgeId);
      this.canvasSelectedEdgeId = null;
      this.salvarDadosCanvas();
      this.render();
      if (typeof Components !== 'undefined') Components.toast('Conexão removida.', 'info');
    }
  },

  duplicateSelectedCanvasNodes() {
    if (this.canvasSelectedNodeIds.length === 0) return;
    const selected = new Set(this.canvasSelectedNodeIds);
    const novosNos = [];

    this.canvasNodes.forEach(node => {
      if (selected.has(node.id)) {
        const newId = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        novosNos.push({
          ...JSON.parse(JSON.stringify(node)),
          id: newId,
          x: node.x + 30,
          y: node.y + 30
        });
      }
    });

    this.canvasNodes.push(...novosNos);
    this.canvasSelectedNodeIds = novosNos.map(n => n.id);
    this.salvarDadosCanvas();
    this.render();
    if (typeof Components !== 'undefined') Components.toast('Nó(s) duplicado(s)!', 'success');
  },

  zoomCanvas(direction, factor = 0.15) {
    if (direction === 'in') {
      this.canvasZoom = Math.min(3.0, this.canvasZoom + factor);
    } else if (direction === 'out') {
      this.canvasZoom = Math.max(0.2, this.canvasZoom - factor);
    }
    const transformEl = document.getElementById('canvas-transform-layer');
    const zoomInd = document.getElementById('canvas-zoom-indicator');
    if (transformEl) {
      transformEl.style.transform = `translate(${this.canvasPan.x}px, ${this.canvasPan.y}px) scale(${this.canvasZoom})`;
    }
    if (zoomInd) {
      zoomInd.textContent = `${Math.round(this.canvasZoom * 100)}%`;
    }
  },

  zoomCanvasFit() {
    if (this.canvasNodes.length === 0) {
      this.canvasPan = { x: 0, y: 0 };
      this.canvasZoom = 1.0;
      this.render();
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.canvasNodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    });
    const width = Math.max(400, maxX - minX + 120);
    const height = Math.max(400, maxY - minY + 120);
    const viewportEl = document.querySelector('.canvas-container');
    const vw = viewportEl ? viewportEl.clientWidth : 1000;
    const vh = viewportEl ? viewportEl.clientHeight : 600;

    const zoomX = vw / width;
    const zoomY = vh / height;
    this.canvasZoom = Math.max(0.3, Math.min(1.4, Math.min(zoomX, zoomY)));
    this.canvasPan.x = (vw - (maxX + minX) * this.canvasZoom) / 2;
    this.canvasPan.y = (vh - (maxY + minY) * this.canvasZoom) / 2;
    this.render();
  },

  exportCanvasJSON() {
    const obsidianData = {
      nodes: this.canvasNodes.map(n => ({
        id: n.id,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        type: n.type === 'file' ? 'file' : (n.type === 'link' ? 'link' : (n.type === 'group' ? 'group' : 'text')),
        text: n.text || n.title || '',
        url: n.url || ''
      })),
      edges: this.canvasEdges.map(e => ({
        id: e.id,
        fromNode: e.fromNode,
        fromSide: e.fromAnchor,
        toNode: e.toNode,
        toSide: e.toAnchor,
        color: e.color,
        label: e.label
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obsidianData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tomada_planejamento_canvas_${Date.now()}.canvas`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (typeof Components !== 'undefined') Components.toast('Canvas exportado no formato Obsidian (.canvas)!', 'success');
  },

  exportCanvasPNG() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1600;
    canvas.height = 1000;

    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.canvasNodes.forEach(node => {
      ctx.fillStyle = node.type === 'group' ? 'rgba(248,246,241,0.8)' : '#FFFFFF';
      ctx.strokeStyle = '#EBE5DF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, node.width, node.height, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1C1A14';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(node.title || 'Nó', node.x + 16, node.y + 30);

      if (node.text) {
        ctx.fillStyle = '#7A7567';
        ctx.font = '12px sans-serif';
        ctx.fillText((node.text || '').slice(0, 40) + '...', node.x + 16, node.y + 55);
      }
    });

    const link = document.createElement('a');
    link.download = `tomada_canvas_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    if (typeof Components !== 'undefined') Components.toast('Imagem PNG gerada!', 'success');
  },

  changeRightTab(tab) {
    this.activeTabRight = tab;
    this.render();
  },

  changeRightFilter(filter) {
    this.activeFilterRight = filter;
    this.render();
  },

  enviarMensagem(texto) {
    if (!texto || !texto.trim()) return;
    const novaMsg = {
      autor: 'Você (Criador)',
      texto: texto.trim(),
      hora: 'agora mesmo'
    };
    this.mensagens.push(novaMsg);
    localStorage.setItem('tomada_planejamento_mensagens', JSON.stringify(this.mensagens));
    this.render();
  },

  registrarAtividade(texto) {
    const tempo = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novaAtividade = { texto, hora: `hoje às ${tempo}` };
    this.atividades = this.atividades || [];
    this.atividades.unshift(novaAtividade);
    if (this.atividades.length > 20) this.atividades.pop();
    localStorage.setItem('tomada_planejamento_atividades', JSON.stringify(this.atividades));
  },

  carregarDados() {
    try {
      const savedCaixas = localStorage.getItem('tomada_planejamento_caixas');
      const savedCards = localStorage.getItem('tomada_planejamento_cards');
      this.temasPersonalizados = JSON.parse(localStorage.getItem('tomada_planejamento_temas_personalizados')) || [];

      this.activeTabRight = 'cards';
      this.mensagens = JSON.parse(localStorage.getItem('tomada_planejamento_mensagens')) || [
        { autor: 'Editor Tomada', texto: 'O roteiro do card "Setup Produtivo 2026" ficou excelente! Já preparei os assets de edição.', hora: 'há 2 horas' },
        { autor: 'Diretor Tomada', texto: 'Não esqueça de colocar um gancho nos primeiros 5 segundos no vídeo de IA.', hora: 'há 5 horas' }
      ];
      this.atividades = JSON.parse(localStorage.getItem('tomada_planejamento_atividades')) || [
        { texto: 'Módulo de planejamento inicializado.', hora: 'há 1 dia' },
        { texto: 'Caixa Organizadora "💡 Ideias Brutas & Roteiros" criada.', hora: 'há 12 horas' }
      ];

      if (savedCaixas) {
        this.caixas = JSON.parse(savedCaixas);
      } else {
        this.caixas = [
          { id: 'cx_1', nome: '💡 Ideias Brutas & Roteiros', cor: '#E55A2B', tema: 'theme-orange', aberta: true },
          { id: 'cx_2', nome: '🎬 Em Gravação & Produção', cor: '#1C1A14', tema: 'theme-dark', aberta: true },
          { id: 'cx_3', nome: '✅ Prontos para Editar/Postar', cor: '#8B5CF6', tema: 'theme-purple', aberta: true }
        ];
        this.salvarCaixas();
      }

      if (!this.activeCaixaId && this.caixas.length > 0) {
        this.activeCaixaId = this.caixas[0].id;
      }

      if (savedCards) {
        this.cards = JSON.parse(savedCards);
      } else {
        this.cards = [
          {
            id: 'card_1',
            caixaId: 'cx_1',
            titulo: 'Setup Completo do Estúdio 2026',
            descricao: 'Revisão detalhada dos novos equipamentos de iluminação dinâmicos e microfones.',
            thumbnail: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80',
            tag: { nome: 'YouTube Longo', cor: '#E55A2B' },
            horario: 'Hoje 10:00 - 11:45',
            checklist: [
              { texto: 'Escrever Roteiro de Introdução', feito: true },
              { texto: 'Gravar B-Roll das luzes e suportes', feito: false },
              { texto: 'Gravar voz de sobreposição', feito: false }
            ],
            criadoEm: new Date().toISOString()
          },
          {
            id: 'card_2',
            caixaId: 'cx_2',
            titulo: '5 Erros Fatais ao Criar Conteúdo de IA',
            descricao: 'Vídeo rápido em 60 segundos com edição acelerada para retenção máxima.',
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            tag: { nome: 'Shorts / Reels', cor: '#EC4899' },
            horario: 'Hoje 14:00 - 15:30',
            checklist: [
              { texto: 'Gravar áudio no mic de lapela', feito: true },
              { texto: 'Inserir legendas dinâmicas coloridas', feito: true },
              { texto: 'Exportar em 4K 60fps', feito: false }
            ],
            criadoEm: new Date().toISOString()
          },
          {
            id: 'card_3',
            caixaId: 'cx_3',
            titulo: 'Review de Equipamentos da Semana',
            descricao: 'Edição final concluída e miniatura aprovada para postagem.',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
            tag: { nome: 'Tech Review', cor: '#8B5CF6' },
            horario: 'Hoje 18:00 - 19:00',
            checklist: [
              { texto: 'Exportar em 4K 60fps', feito: true },
              { texto: 'Agendar publicação no YouTube', feito: true }
            ],
            criadoEm: new Date().toISOString()
          }
        ];
        this.salvarCards();
      }
    } catch (e) {
      console.error('Erro ao carregar dados do Planejamento:', e);
    }
  },

  salvarCaixas() {
    localStorage.setItem('tomada_planejamento_caixas', JSON.stringify(this.caixas));
  },

  salvarCards() {
    localStorage.setItem('tomada_planejamento_cards', JSON.stringify(this.cards));
  },

  iniciarRelogio() {
    if (this.clockTimer) clearInterval(this.clockTimer);
    this.clockTimer = setInterval(() => {
      const timeEl = document.getElementById('ref-live-time');
      if (timeEl) {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('pt-BR');
      }
    }, 1000);
  },

  filtrar(query) {
    this.searchQuery = query.toLowerCase();
    this.render();
  },

  selecionarCaixa(caixaId) {
    this.activeCaixaId = caixaId;
    this.render();
  },

  toggleCheckItem(cardId, itemIndex) {
    const card = this.cards.find(c => c.id === cardId);
    if (card && card.checklist[itemIndex]) {
      card.checklist[itemIndex].feito = !card.checklist[itemIndex].feito;
      this.salvarCards();
      this.render();

      // Sincronizar com o Cronograma / Kanban (API e Banco de Dados)
      (async () => {
        try {
          const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
          const res = await fetch('/api/cronograma', {
            headers: {
              'Accept': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            }
          });
          if (res.ok) {
            const tarefas = await res.json();
            const matchingTasks = (tarefas || []).filter(t => t.nome === card.titulo || t.tarefas === card.titulo);
            for (const t of matchingTasks) {
              let chList = t.checklist;
              if (typeof chList === 'string') chList = JSON.parse(chList);
              if (chList && chList.length > 0) {
                const textVal = card.checklist[itemIndex].texto || card.checklist[itemIndex].text || '';
                const taskChecklistItem = chList.find(ci => (ci.text || ci.texto) === textVal) || chList[itemIndex];
                if (taskChecklistItem) {
                  taskChecklistItem.done = card.checklist[itemIndex].feito;
                  
                  const total = chList.length;
                  const doneCount = chList.filter(ci => ci.done || ci.feito).length;
                  const progress = Math.round((doneCount / total) * 100);
                  
                  await fetch(`/api/cronograma/${t.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                      checklist: chList,
                      progresso: progress
                    })
                  });
                }
              }
            }
            if (window.Cronograma && typeof window.Cronograma.carregarDados === 'function') {
              window.Cronograma.carregarDados();
            }
          }
        } catch (errSync) {
          console.warn('Erro ao sincronizar checklist com o Cronograma:', errSync);
        }
      })();
    }
  },

  deletarCard(cardId) {
    if (confirm('Deseja realmente remover este card?')) {
      const card = this.cards.find(c => c.id === cardId);
      const cardTitulo = card ? card.titulo : '';
      this.cards = this.cards.filter(c => c.id !== cardId);
      this.salvarCards();
      this.registrarAtividade(`Card "${cardTitulo}" excluído.`);
      Components.closeModal();
      this.render();
      if (typeof Components !== 'undefined') Components.toast('Card removido com sucesso!', 'success');
    }
  },

  deletarCaixa(caixaId) {
    const cardsNaCaixa = this.cards.filter(c => c.caixaId === caixaId);
    if (cardsNaCaixa.length > 0) {
      alert(`Esta caixa contém ${cardsNaCaixa.length} card(s). Mova ou exclua os cards antes de excluí-la.`);
      return;
    }
    if (confirm('Deseja excluir esta caixa?')) {
      this.salvarCaixas();
      this.registrarAtividade(`Caixa Organizadora "${cxNome}" excluída.`);
      Components.closeModal();
      this.render();
      if (typeof Components !== 'undefined') Components.toast('Caixa excluída!', 'success');
    }
  },

  async carregarStatusCanal() {
    try {
      const data = await API.get('/api/youtube/status');
      if (data && (data.connected === 'connected' || data.connected === 'simulated' || data.connected === 'real')) {
        this.canalInfo = {
          conectado: true,
          nome: data.channelName || 'Tomada',
          subscribers: data.connected === 'simulated' ? '1.29k inscritos' : 'Conectado',
          avatar: data.channelAvatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
        };
      } else {
        this.canalInfo = null;
      }
    } catch (e) {
      console.warn("Erro ao obter status do canal:", e);
      this.canalInfo = null;
    }
  },

  async desconectarCanal(event) {
    if (event) event.preventDefault();
    if (!confirm('Deseja realmente desconectar este canal?')) return;
    try {
      await API.post('/api/youtube/disconnect');
      this.canalInfo = null;
      this.render();
      if (typeof Components !== 'undefined') Components.toast('Canal desconectado com sucesso!', 'success');
    } catch (e) {
      if (typeof Components !== 'undefined') Components.toast('Erro ao desconectar o canal: ' + e.message, 'error');
    }
  },

  async setSubAba(subAba) {
    this.subAbaAtiva = subAba;
    if (subAba === 'recomendacao') {
      await this.carregarStatusCanal();
      this.buscarRecomendacoesNicho(this.nichoRecomendacao || 'Games & Tycoons');
    } else {
      this.render();
    }
  },

  mudarPaginaRecomendacao(novaPagina) {
    const totalItens = (this.recomendacoesList || []).length;
    const totalPaginas = Math.ceil(totalItens / (this.itensPorPaginaRecomendacao || 15)) || 1;
    if (novaPagina < 1 || novaPagina > totalPaginas) return;

    this.paginaAtualRecomendacao = novaPagina;
    this.render();

    const container = document.querySelector('.ref-rec-wrapper');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  // --- SUB-ABA RECOMENDAÇÃO (YOUTUBE API + GEMINI AI - COURSECONNECT DARK LAYOUT) ---
  async buscarRecomendacoesNicho(nichoQuery) {
    if (!nichoQuery) return;
    this.nichoRecomendacao = nichoQuery.trim();
    this.paginaAtualRecomendacao = 1;
    this.carregandoRecomendacoes = true;
    this.render();

    try {
      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const res = await fetch(`/api/youtube/recomendacoes?nicho=${encodeURIComponent(this.nichoRecomendacao)}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.recomendacoes && data.recomendacoes.length > 0) {
          this.recomendacoesList = data.recomendacoes.map((rec, index) => {
            const seed = (rec.titulo || '').length + index;
            return {
              id: rec.id || rec.videoId || ('rec_' + Date.now() + '_' + index),
              titulo: rec.titulo,
              canal: rec.canal,
              thumb: rec.thumbnail || rec.thumb || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
              videoId: rec.videoId,
              viralScore: rec.viralScore || Math.floor((seed % 15) + 84),
              viewsEst: rec.viewsEst || (Math.floor((seed % 400) + 50) + 'k views'),
              formato: rec.formato || ['Vídeo Longo', 'Shorts', 'Vlog', 'Tutorial'][seed % 4],
              nichoTag: rec.nichoTag || this.nichoRecomendacao || 'Nicho',
              gancho: rec.gancho || `Comece este vídeo com um gancho dinâmico sobre ${this.nichoRecomendacao || 'este nicho'} para prender o público nos primeiros 5 segundos.`,
              roteiro: rec.roteiro || '1. Introdução marcante\n2. Dicas práticas e demonstração\n3. Conclusão e chamada para ação.'
            };
          });
          this.metricasNicho = data.metricasNicho;
          this.canaisReferencia = data.canaisReferencia;
        }
      } else {
        const nLower = this.nichoRecomendacao.toLowerCase();
        const nichoHash = nLower.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        this.metricasNicho = {
          interessePublico: Math.floor((nichoHash % 15) + 80),
          competicao: ['Média', 'Baixa', 'Baixa / Média', 'Alta'][nichoHash % 4],
          potencialCliques: Math.floor((nichoHash % 12) + 84),
          melhorDiaIndex: nichoHash % 7,
          melhorDia: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][nichoHash % 7],
          melhorHorario: '18:00 - 21:00'
        };
        this.canaisReferencia = [
          { nome: 'Criador Pro ' + this.nichoRecomendacao, subs: '120k subs', foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
          { nome: 'Mestre da Bancada', subs: '85k subs', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
        ];
        let sugestoesPorNicho = [];

        if (nLower.includes('game') || nLower.includes('jogo') || nLower.includes('tycoon') || nLower.includes('roblox')) {
          sugestoesPorNicho = [
            {
              id: 'rec_sug_g1_' + Date.now(),
              titulo: 'Construí a Cidade Perfeita com 1 Milhão de Habitantes sem Trânsito!',
              gancho: 'Zoom out mostrando a metrópole gigante funcionando a 100% de eficiência.',
              roteiro: '1. Estruturação dos nós de transporte público e trens\n2. Zoneamento estratégico de indústrias e residências\n3. Resolução dos gargalos finais.',
              formato: 'Vídeo Longo',
              viralScore: 99,
              nichoTag: 'Games & Tycoons',
              thumb: 'https://i.ytimg.com/vi/kXXm1K1X0lM/maxresdefault.jpg',
              viewsEst: '350k views'
            },
            {
              id: 'rec_sug_g2_' + Date.now(),
              titulo: 'Sobrevivendo 100 Dias no Minecraft Hardcore Apenas com Automações',
              gancho: 'Mostrar a base gigante no dia 100 com farms de ferro e redstone ativas.',
              roteiro: '1. Dias 1 a 20: Primeiros recursos e abrigo seguro\n2. Dias 21 a 70: Construção de farms e automações pesadas\n3. Dias 71 a 100: Enfrentando os bosses finais.',
              formato: 'Vídeo Longo',
              viralScore: 96,
              nichoTag: 'Minecraft',
              thumb: 'https://i.ytimg.com/vi/0pThnRneDjw/maxresdefault.jpg',
              viewsEst: '280k views'
            },
            {
              id: 'rec_sug_g3_' + Date.now(),
              titulo: 'Do Zero ao Império Bilionário no Roblox Restaurant Tycoon',
              gancho: 'Timelapse de 15 segundos do restaurante minúsculo virando um arranha-céu de 5 estrelas.',
              roteiro: '1. Escolha dos primeiros pratos e contratação de garçons\n2. Expansão dos andares e área VIP\n3. Faturamento máximo e conquistas secretas.',
              formato: 'Shorts',
              viralScore: 93,
              nichoTag: 'Roblox',
              thumb: 'https://i.ytimg.com/vi/HtXSs8Hw8KY/maxresdefault.jpg',
              viewsEst: '190k views'
            },
            {
              id: 'rec_sug_g4_' + Date.now(),
              titulo: 'Os 7 Jogos de Simulação Mais Realistas que Chegam em 2026',
              gancho: 'Cena ultra realista e a pergunta: "Você acredita que isso é gráfico de jogo?"',
              roteiro: '1. Jogo 1 e 2: Gráficos e física em Unreal Engine 5\n2. Jogo 3 a 5: Mecânicas inovadoras de economia\n3. Datas de lançamento e plataformas suportadas.',
              formato: 'Tutorial',
              viralScore: 91,
              nichoTag: 'Lançamentos',
              thumb: 'https://i.ytimg.com/vi/kXXm1K1X0lM/hqdefault.jpg',
              viewsEst: '125k views'
            }
          ];
        } else if (nLower.includes('tec') || nLower.includes('ia') || nLower.includes('code') || nLower.includes('program')) {
          sugestoesPorNicho = [
            {
              id: 'rec_sug_t1_' + Date.now(),
              titulo: 'Criei um Agente de IA Autónoma que Trabalha pra Mim 24h por Dia',
              gancho: 'Mostrar a tela com o robô respondendo clientes, agendando tarefas e gerando relatórios sozinho.',
              roteiro: '1. Demonstração prática do robô em funcionamento\n2. Apresentação das ferramentas usadas (Python + Gemini API)\n3. Como você pode replicar este sistema em 15 minutos.',
              formato: 'Vídeo Longo',
              viralScore: 98,
              nichoTag: 'Tecnologia & IA',
              thumb: 'https://i.ytimg.com/vi/5qap5aO4i9A/maxresdefault.jpg',
              viewsEst: '210k views'
            },
            {
              id: 'rec_sug_t2_' + Date.now(),
              titulo: 'Testei os 3 Melhores Laptops para Programar em 2026 (Qual Comprar?)',
              gancho: 'Renderização pesada ao vivo em cada notebook monitorando tempo e temperatura.',
              roteiro: '1. Teste 1: Desempenho em compilação de código e Docker\n2. Teste 2: Bateria e qualidade do teclado/tela\n3. Comparativo final de preço e recomendação.',
              formato: 'Review',
              viralScore: 94,
              nichoTag: 'Hardware',
              thumb: 'https://i.ytimg.com/vi/L_LUpnjgPso/maxresdefault.jpg',
              viewsEst: '95k views'
            },
            {
              id: 'rec_sug_t3_' + Date.now(),
              titulo: 'Gemini 1.5 Pro vs GPT-4o: Qual Modelo de IA Escreve Código Melhor?',
              gancho: 'Submeter um bug complexo em Python pra ambas as IAs e ver quem resolve primeiro.',
              roteiro: '1. Desafio 1: Refatoração de código legado\n2. Desafio 2: Criação de testes unitários automatizados\n3. Tabela comparativa de precisão e custos.',
              formato: 'Comparativo',
              viralScore: 96,
              nichoTag: 'Inteligência Artificial',
              thumb: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
              viewsEst: '160k views'
            },
            {
              id: 'rec_sug_t4_' + Date.now(),
              titulo: 'Como Começar na Programação do Zero em 2026 (Roteiro de Estudos)',
              gancho: '"Esqueça os cursos de 5 anos. Este é o caminho exato que o mercado exige hoje."',
              roteiro: '1. Passo 1: Fundamentos essenciais e lógica\n2. Passo 2: Escolha da linguagem (JavaScript vs Python)\n3. Passo 3: Portfólio no GitHub e primeiro trabalho.',
              formato: 'Guia',
              viralScore: 92,
              nichoTag: 'Carreira Tech',
              thumb: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg',
              viewsEst: '310k views'
            }
          ];
        } else if (nLower.includes('finan') || nLower.includes('dinheiro') || nLower.includes('invest')) {
          sugestoesPorNicho = [
            {
              id: 'rec_sug_f1_' + Date.now(),
              titulo: 'Como Investir R$ 1.000 em 2026 e Gerar Renda Passiva Todo Mês',
              gancho: 'Mostrar o extrato real da conta recebendo proventos sem precisar trabalhar no dia.',
              roteiro: '1. Divisão estratégica da carteira (Tesouro Direto, FIIs e Ações)\n2. Simulação de rendimento acumulado em 1, 5 e 10 anos\n3. Passo a passo na corretora.',
              formato: 'Vídeo Longo',
              viralScore: 97,
              nichoTag: 'Finanças & Investimentos',
              thumb: 'https://i.ytimg.com/vi/P39Nq_S-92A/maxresdefault.jpg',
              viewsEst: '420k views'
            },
            {
              id: 'rec_sug_f2_' + Date.now(),
              titulo: '5 Erros Financeiros que Impedem 90% das Pessoas de Enriquecer',
              gancho: '"Se você comete o erro número 3, você nunca vai conseguir guardar dinheiro!"',
              roteiro: '1. Erro 1: Viver no limite do cartão de crédito\n2. Erro 2: Deixar dinheiro parado na poupança\n3. Como mudar a mentalidade e criar a reserva de emergência.',
              formato: 'Shorts',
              viralScore: 94,
              nichoTag: 'Educação Financeira',
              thumb: 'https://i.ytimg.com/vi/P39Nq_S-92A/hqdefault.jpg',
              viewsEst: '230k views'
            },
            {
              id: 'rec_sug_f3_' + Date.now(),
              titulo: 'A Estratégia de Dividendos Usada Pelos Maiores Investidores do Brasil',
              gancho: 'Gráfico comparativo de rendimento de dividendos vs inflação nos últimos 10 anos.',
              roteiro: '1. Seleção de empresas perenes (Bancos, Energia, Saneamento)\n2. Reinvestimento automático de proventos\n3. Como viver de renda.',
              formato: 'Tutorial',
              viralScore: 91,
              nichoTag: 'Bolsa de Valores',
              thumb: 'https://i.ytimg.com/vi/P39Nq_S-92A/mqdefault.jpg',
              viewsEst: '175k views'
            },
            {
              id: 'rec_sug_f4_' + Date.now(),
              titulo: 'Como Quitei Minhas Dívidas de R$ 50.000 em Apenas 12 Meses',
              gancho: 'Mostrar a carta de quitação do banco e o plano de ação impresso.',
              roteiro: '1. Renegociação com desconto de até 80%\n2. Criação de renda extra no tempo livre\n3. Reorganização do orçamento familiar.',
              formato: 'Vídeo Longo',
              viralScore: 93,
              nichoTag: 'Dívidas & Planejamento',
              thumb: 'https://i.ytimg.com/vi/P39Nq_S-92A/maxresdefault.jpg',
              viewsEst: '340k views'
            }
          ];
        } else {
          sugestoesPorNicho = [
            {
              id: 'rec_sug_m1_' + Date.now(),
              titulo: 'Como Criar um Armário de Cozinha Planejado no SketchUp em Menos de 2 Horas',
              gancho: 'Mostrar o móvel 3D final nos primeiros 3 segundos antes de revelar o truque no software.',
              roteiro: '1. Apresentação do projeto e medidas principais\n2. Modelagem das caixas, gavetas e puxadores\n3. Exportação do plano de corte para economia de MDF.',
              formato: 'Vídeo Longo',
              viralScore: 98,
              nichoTag: 'Marcenaria & 3D',
              thumb: 'https://i.ytimg.com/vi/yXWw0_UfSFg/maxresdefault.jpg',
              viewsEst: '142k views'
            },
            {
              id: 'rec_sug_m2_' + Date.now(),
              titulo: '5 Ferramentas de Marcenaria que Substituem Máquinas de R$ 10.000',
              gancho: '"Se você acha que precisa de uma marcenaria industrial pra fazer móveis finos, veja isso!"',
              roteiro: '1. Apresentação da ferramenta 1 (Tupia laminadora)\n2. Teste de gabarito caseiro para cortes precisos\n3. Veredito final e economia estimada.',
              formato: 'Shorts',
              viralScore: 95,
              nichoTag: 'Marcenaria',
              thumb: 'https://i.ytimg.com/vi/t8L0yVSpKAc/maxresdefault.jpg',
              viewsEst: '89k views'
            },
            {
              id: 'rec_sug_m3_' + Date.now(),
              titulo: 'Testei a Tupia Mais Barata da Shopee vs Tupia Makita Profissional',
              gancho: 'Corte ao vivo com as duas máquinas no mesmo pedaço de mdf cru.',
              roteiro: '1. Unboxing e especificações de potência\n2. Teste de acabamento em bordas e rasgos\n3. Análise de durabilidade e custo-benefício.',
              formato: 'Tutorial',
              viralScore: 92,
              nichoTag: 'Ferramentas',
              thumb: 'https://i.ytimg.com/vi/yXWw0_UfSFg/hqdefault.jpg',
              viewsEst: '67k views'
            },
            {
              id: 'rec_sug_m4_' + Date.now(),
              titulo: 'Como Fazer um Painel Ripado com Fita de Borda sem Gastar Quase Nada',
              gancho: 'Mostrar o ripado pronto na sala e revelar quanto custou o material.',
              roteiro: '1. Cálculo da quantidade de ripados e espaço\n2. Aplicação prática de cola de contato e nivelamento\n3. Resultado final e dicas de limpeza.',
              formato: 'Vídeo Longo',
              viralScore: 90,
              nichoTag: 'DIY & Decoração',
              thumb: 'https://i.ytimg.com/vi/t8L0yVSpKAc/hqdefault.jpg',
              viewsEst: '110k views'
            }
          ];
        }

        this.recomendacoesList = sugestoesPorNicho;
      }
    } catch (err) {
      console.error('Erro ao buscar recomendações do nicho:', err);
    } finally {
      this.carregandoRecomendacoes = false;
      this.render();
    }
  },

  importarRecomendacaoParaCaixa(recId) {
    const rec = this._findSugestao(recId);
    if (!rec) return;

    if (!this.caixas || this.caixas.length === 0) {
      if (typeof Components !== 'undefined') Components.toast('Crie primeiro uma caixa em "Caixa" antes de importar.', 'error');
      return;
    }

    const optionsCaixas = this.caixas.map(cx => `<option value="${cx.id}">${cx.nome}</option>`).join('');

    const modalHTML = `
      <div style="padding: 10px 0;">
        <h4 style="margin: 0 0 8px 0; font-family: 'Outfit'; font-size: 16px; color: var(--ref-text);">${rec.titulo}</h4>
        <p style="font-size: 13px; color: var(--ref-text-sub); margin-bottom: 16px;">Escolha em qual Caixa Organizadora você deseja salvar este card:</p>

        <form id="form-importar-rec" onsubmit="Planejamento.confirmarImportacaoRec(event, '${rec.id}')">
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--ref-text); margin-bottom: 6px;">Caixa de Destino</label>
            <select id="select-caixa-dest" class="form-control" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-family: 'Outfit';">
              ${optionsCaixas}
            </select>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" onclick="Components.closeModal()" class="btn-secondary" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Cancelar</button>
            <button type="submit" class="btn-premium-primary" style="padding: 8px 20px; border-radius: 10px; background: var(--ref-primary); color: #FFF; border: none; font-weight: 800; cursor: pointer;">Salvar Card</button>
          </div>
        </form>
      </div>
    `;

    if (typeof Components !== 'undefined' && Components.openModal) {
      Components.openModal('Importar Ideia para Caixa', modalHTML);
    }
  },

  confirmarImportacaoRec(e, recId) {
    e.preventDefault();
    const rec = (this.recomendacoesList || []).find(r => r.id === recId) || (this.sugestoesList || []).find(s => s.id === recId) || (this.sugestoesCache || []).find(s => s.id === recId);
    const selectCaixa = document.getElementById('select-caixa-dest');
    const caixaId = selectCaixa ? selectCaixa.value : this.caixas[0]?.id;

    if (rec && caixaId) {
      const novoCard = {
        id: 'card_' + Date.now(),
        caixaId,
        titulo: rec.titulo,
        descricao: `${rec.gancho}\n\n${rec.roteiro || ''}`,
        thumbnail: rec.thumb,
        tag: { nome: rec.nichoTag || 'Recomendado', cor: '#E55A2B' },
        checklist: [
          { texto: 'Gravar Gancho Inicial (5s)', feito: false },
          { texto: 'Desenvolver Roteiro', feito: false },
          { texto: 'Edição & Capa', feito: false }
        ]
      };

      this.cards.push(novoCard);
      this.salvarCards();
      this.registrarAtividade(`Ideia "${rec.titulo}" importada para a caixa.`);
      if (typeof Components !== 'undefined') {
        Components.closeModal();
        Components.toast('Ideia salva como Card com sucesso!', 'success');
      }
      this.render();
    }
  },

  enviarRecomendacaoParaCanva(recId) {
    const rec = (this.recomendacoesList || []).find(r => r.id === recId) || (this.sugestoesList || []).find(s => s.id === recId) || (this.sugestoesCache || []).find(s => s.id === recId);
    if (!rec) return;

    const newId = 'node_' + Date.now();
    const novoNo = {
      id: newId,
      type: 'text',
      x: 120 + (this.canvasNodes.length * 30),
      y: 120 + (this.canvasNodes.length * 20),
      width: 340,
      height: 220,
      title: '⚡ ' + rec.titulo,
      text: `<b>Gancho:</b> ${rec.gancho}<br><br><b>Estrutura:</b><br>${(rec.roteiro || '').replace(/\n/g, '<br>')}`
    };

    this.canvasNodes.push(novoNo);
    this.canvasSelectedNodeIds = [newId];
    this.salvarDadosCanvas();
    this.setSubAba('canvas');
    if (typeof Components !== 'undefined') Components.toast('Ideia adicionada ao Canva!', 'success');
  },

  async verRoteiroRecomendacao(recId) {
    const rec = (this.recomendacoesList || []).find(r => r.id === recId) || (this.sugestoesList || []).find(s => s.id === recId) || (this.sugestoesCache || []).find(s => s.id === recId);
    if (!rec) return;

    // Abrir o modal padrão do sistema com loading enquanto a IA gera o roteiro
    const loadingHTML = `
      <div style="padding: 20px 0; text-align: center;">
        <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 24px; text-align: left;">
          <span style="font-size: 11px; font-weight: 800; color: var(--ref-primary); display: block; margin-bottom: 4px;">🔥 TAXA ESTIMADA DE VIRALIDADE: ${rec.viralScore}%</span>
          <h3 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 17px; color: var(--ref-text);">${rec.titulo}</h3>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0;">
          <div class="spinner" style="width: 40px; height: 40px; border: 3px solid #EBE5DF; border-top-color: var(--ref-primary, #E55A2B); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <span style="font-size: 14px; font-weight: 700; color: var(--ref-text);">Gemini IA está gerando seu roteiro completo...</span>
          <span style="font-size: 12px; color: var(--ref-text-sub, #64748B);">Isso pode levar alguns segundos</span>
        </div>
      </div>`;

    const footerHTML = `
      <button type="button" class="btn btn-secondary" onclick="Components.closeModal()" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Fechar</button>`;

    Components.showModal('📜 Roteiro Estratégico com IA', loadingHTML, footerHTML, 'premium-task-modal');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const response = await fetch('/api/youtube/gerar-roteiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          titulo: rec.titulo,
          gancho: rec.gancho,
          nicho: rec.nichoTag || this.nichoRecomendacao || 'Geral',
          formato: rec.formato,
          viralScore: rec.viralScore
        })
      });

      const data = await response.json();

      if (!data.success || !data.roteiro) {
        throw new Error(data.error || 'Erro ao gerar roteiro');
      }

      // Formatar o roteiro: converter markdown-like para HTML legível
      const roteiroFormatado = data.roteiro
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^##\s+(.+)$/gm, '<h4 style="margin: 18px 0 8px; color: var(--ref-primary, #E55A2B); font-size: 15px; font-weight: 800; font-family: inherit;">$1</h4>')
        .replace(/^#\s+(.+)$/gm, '<h3 style="margin: 20px 0 10px; color: var(--ref-text); font-size: 17px; font-weight: 800; font-family: inherit;">$1</h3>')
        .replace(/^[-•]\s+(.+)$/gm, '<div style="display: flex; gap: 8px; margin: 4px 0; align-items: flex-start;"><span style="color: var(--ref-primary, #E55A2B); font-weight: 800; flex-shrink: 0;">•</span><span>$1</span></div>')
        .replace(/\n{2,}/g, '<div style="height: 12px;"></div>')
        .replace(/\n/g, '<br>');

      const resultHTML = `
        <div style="padding: 10px 0;">
          <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <span style="font-size: 11px; font-weight: 800; color: var(--ref-primary); display: block; margin-bottom: 4px;">🔥 TAXA ESTIMADA DE VIRALIDADE: ${rec.viralScore}%</span>
            <h3 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 17px; color: var(--ref-text);">${rec.titulo}</h3>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="font-size: 12px; font-weight: 800; color: var(--ref-primary); display: block; margin-bottom: 4px;">🪝 GANCHO DE IMPACTO (0 a 5 segundos):</label>
            <div style="background: #FAF8F5; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--ref-border); font-size: 13px; font-style: italic; color: var(--ref-text);">
              "${rec.gancho}"
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="font-size: 12px; font-weight: 800; color: var(--ref-text); display: block; margin-bottom: 6px;">📜 ROTEIRO COMPLETO GERADO COM GEMINI IA:</label>
            <div style="background: #FAF8F5; padding: 16px; border-radius: 12px; border: 1px solid var(--ref-border); font-size: 13px; line-height: 1.65; color: var(--ref-text); max-height: 420px; overflow-y: auto;">
              ${roteiroFormatado}
            </div>
          </div>
        </div>`;

      const resultFooterHTML = `
        <button type="button" onclick="Planejamento.exportarSugestaoParaCronograma('${rec.id}')" class="btn-premium-primary" style="padding: 8px 16px; border-radius: 10px; background: var(--ref-primary, #E55A2B); color: #FFF; border: none; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <i data-lucide="calendar-plus" style="width: 14px; height: 14px;"></i> Exportar para Cronograma
        </button>
        <button type="button" onclick="Planejamento.enviarRecomendacaoParaCanva('${rec.id}'); Components.closeModal();" class="btn-secondary" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Mandar pro Canva</button>
        <button type="button" onclick="Planejamento.importarRecomendacaoParaCaixa('${rec.id}')" class="btn-secondary" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Salvar na Caixa</button>
        <button type="button" onclick="Components.closeModal()" class="btn btn-secondary" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Fechar</button>`;

      Components.showModal('📜 Roteiro Estratégico com IA', resultHTML, resultFooterHTML, 'premium-task-modal');

    } catch (err) {
      console.error('[Roteiro IA] Erro:', err);
      const errorHTML = `
        <div style="padding: 20px 0; text-align: center;">
          <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 24px; text-align: left;">
            <h3 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 17px; color: var(--ref-text);">${rec.titulo}</h3>
          </div>
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 16px;">
            <span style="font-size: 13px; font-weight: 700; color: #EF4444;">❌ Não foi possível gerar o roteiro</span>
            <p style="margin: 6px 0 0; font-size: 12px; color: var(--ref-text-sub);">${err.message || 'Erro ao se comunicar com a IA Gemini. Tente novamente.'}</p>
          </div>
          <button type="button" onclick="Planejamento.verRoteiroRecomendacao('${rec.id}')" style="margin-top: 16px; background: var(--ref-primary); border: none; color: #FFF; border-radius: 10px; padding: 10px 24px; font-size: 13px; font-weight: 800; cursor: pointer;">🔄 Tentar Novamente</button>
        </div>`;

      Components.showModal('📜 Roteiro Estratégico com IA', errorHTML, footerHTML, 'premium-task-modal');
    }
  },

  renderRecomendacaoViewHTML() {
    const canal = this.canalInfo || { conectado: true, nome: 'Tomada', subscribers: '1.29k inscritos', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' };

    const totalItens = (this.recomendacoesList || []).length;
    const itensPorPagina = this.itensPorPaginaRecomendacao || 15;
    const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
    
    if (this.paginaAtualRecomendacao > totalPaginas) {
      this.paginaAtualRecomendacao = 1;
    }

    const inicio = (this.paginaAtualRecomendacao - 1) * itensPorPagina;
    const recomendacoesPagina = (this.recomendacoesList || []).slice(inicio, inicio + itensPorPagina);

    // Dados dinâmicos do painel lateral
    const metricas = this.metricasNicho || {
      interessePublico: 88,
      competicao: 'Baixa / Média',
      potencialCliques: 95,
      melhorDiaIndex: 2, // Terça-feira padrão
      melhorDia: 'Terça',
      melhorHorario: '18:00 - 21:00'
    };

    const canaisRef = this.canaisReferencia || [
      { nome: `Criador Pro ${this.nichoRecomendacao || 'Nicho'}`, subs: '120k inscritos', engajamento: '85% engajamento', foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { nome: 'Mestre da Bancada', subs: '85k inscritos', engajamento: '92% engajamento', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ];

    // Calcular dias da semana corrente a partir do dia atual
    const hoje = new Date();
    const diaSemanaHoje = hoje.getDay(); // 0 a 6
    const domingoCorrente = new Date(hoje);
    domingoCorrente.setDate(hoje.getDate() - diaSemanaHoje);

    const diasSemanaExibir = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(domingoCorrente);
      d.setDate(domingoCorrente.getDate() + i);
      return {
        diaMes: d.getDate(),
        indexSemana: i,
        isHoje: d.toDateString() === hoje.toDateString()
      };
    });

    const mesAnoFmt = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const mesAnoFmtCap = mesAnoFmt.charAt(0).toUpperCase() + mesAnoFmt.slice(1);


    return `
      <div class="ref-rec-wrapper" style="padding: 20px 24px 40px 24px; display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 100%; box-sizing: border-box; font-family: var(--font-main, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);">
        
        <!-- Banner de Conexão com o Canal do YouTube do Usuário -->
        <div style="background: #FFFFFF; border-radius: 16px; border: 1px solid var(--ref-border, #EBE5DF); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; overflow: hidden; background: #FAF8F5; border: 2px solid var(--ref-primary, #E55A2B); flex-shrink: 0;">
              <img src="${canal.avatar}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px; font-weight: 800; color: var(--ref-text, #1C1A14);">Canal: ${canal.nome}</span>
                <span style="background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800;">🟢 CONECTADO VIA YOUTUBE API</span>
              </div>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--ref-text-sub, #64748B);">
                ${canal.subscribers} • Recomendações calibradas para o público e últimos uploads do seu canal
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center;">
            <a href="#" onclick="event.preventDefault(); window.open('/api/youtube/auth?token=' + encodeURIComponent(localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || ''), '_blank');" style="background: #FAF8F5; border: 1px solid var(--ref-border, #EBE5DF); color: var(--ref-text, #1C1A14); border-radius: 10px; padding: 8px 14px; font-size: 12px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
              <i data-lucide="refresh-cw" style="width: 14px; height: 14px; color: var(--ref-primary, #E55A2B);"></i> Sincronizar Novo Canal
            </a>
          </div>
        </div>

        <!-- Layout Flex 2 Colunas (Principal + Sidebar) -->
        <div style="display: flex; gap: 28px; width: 100%; max-width: 100%; box-sizing: border-box;">
          
          <!-- Coluna Esquerda Principal (~68%) -->
          <main style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Topo: Título + Barra de Pesquisa Integrada (Inspirado no CourseConnect Header no Padrão Tomada) -->
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
              <div>
                <h2 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 800; color: var(--ref-text, #1C1A14); letter-spacing: -0.5px; font-family: inherit;">Recomendação & Tendências</h2>
                <p style="margin: 0; font-size: 13px; color: var(--ref-text-sub, #64748B); font-family: inherit;">Insira o seu nicho para a IA analisar o YouTube e indicar ideias com alto potencial viral.</p>
              </div>
              
              <div style="display: flex; align-items: center; gap: 10px; flex: 1; max-width: 440px;">
                <div style="position: relative; flex: 1;">
                  <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #94A3B8;"></i>
                  <input type="text" id="input-nicho-search" value="${this.nichoRecomendacao || ''}" placeholder="Buscar nicho (ex: Marcenaria, IA, Games...)" style="width: 100%; background: #FFFFFF; border: 1px solid var(--ref-border, #EBE5DF); border-radius: 12px; padding: 10px 14px 10px 40px; font-size: 13px; color: var(--ref-text, #1C1A14); outline: none; font-family: inherit; box-shadow: 0 2px 8px rgba(0,0,0,0.02);" onkeydown="if(event.key==='Enter') Planejamento.buscarRecomendacoesNicho(this.value)">
                </div>
                <button type="button" onclick="Planejamento.buscarRecomendacoesNicho(document.getElementById('input-nicho-search').value)" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 12px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.3); transition: all 0.2s ease; font-family: inherit;">
                  <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> Gerar Ideias
                </button>
              </div>
            </div>

            <!-- Abas Horizontais de Filtro (Fiel à linha de abas da foto com a barra ativa Laranja Tomada) -->
            <div style="display: flex; gap: 20px; border-bottom: 1px solid var(--ref-border, #EBE5DF); padding-bottom: 10px; overflow-x: auto;">
              ${['Marcenaria & Projetos 3D', 'Tecnologia & IA', 'Games & Tycoons', 'Finanças', 'Vlogs & Viagens', 'DIY & Ferramentas'].map(n => `
                <button type="button" onclick="Planejamento.buscarRecomendacoesNicho('${n}')" style="background: transparent; border: none; color: ${this.nichoRecomendacao === n ? 'var(--ref-primary, #E55A2B)' : 'var(--ref-text-sub, #64748B)'}; font-size: 13px; font-weight: ${this.nichoRecomendacao === n ? '800' : '600'}; padding: 4px 0; cursor: pointer; position: relative; white-space: nowrap; font-family: inherit;">
                  ${n}
                  ${this.nichoRecomendacao === n ? '<div style="position: absolute; bottom: -11px; left: 0; right: 0; height: 3px; background: var(--ref-primary, #E55A2B); border-radius: 3px 3px 0 0;"></div>' : ''}
                </button>
              `).join('')}
            </div>

            <!-- Lista de Cards (Layout CourseConnect Adaptado para as Cores Padrão do Tomada) -->
            <div style="display: flex; flex-direction: column; gap: 18px;">
              ${this.carregandoRecomendacoes ? `
                <div style="text-align: center; padding: 60px 0; background: #FFFFFF; border-radius: 20px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
                  <i data-lucide="loader-2" class="spin-icon" style="width: 36px; height: 36px; color: var(--ref-primary, #E55A2B); margin-bottom: 12px;"></i>
                  <h4 style="margin: 0; font-family: inherit; color: var(--ref-text, #1C1A14);">Analisando tendências do YouTube e sintetizando com IA...</h4>
                </div>
              ` : recomendacoesPagina.map(rec => `
                <div class="ref-rec-card" style="background: #FFFFFF; border-radius: 20px; border: 1px solid var(--ref-border, #EBE5DF); padding: 20px; display: flex; gap: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); align-items: stretch; position: relative; transition: all 0.25s ease;">
                  
                  <!-- Imagem Thumb Esquerda com Badges -->
                  <div style="width: 240px; height: 145px; border-radius: 14px; overflow: hidden; position: relative; background: #FAF8F5; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #F0ECE6;">
                    <img src="${rec.thumb}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                    <div style="position: absolute; top: 12px; left: 12px; background: rgba(229, 90, 43, 0.92); color: #FFFFFF; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-family: inherit;">
                      <i data-lucide="flame" style="width: 13px; height: 13px;"></i> ${rec.viralScore}% VIRAL
                    </div>
                    <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.78); color: #FFFFFF; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; font-family: inherit; display: flex; align-items: center; gap: 4px; backdrop-filter: blur(4px);">
                      <i data-lucide="eye" style="width: 12px; height: 12px;"></i> ${rec.viewsEst || '150k views'} ${rec.likesEst ? '• <i data-lucide="thumbs-up" style="width: 11px; height: 11px;"></i> ' + rec.likesEst : ''}
                    </div>
                  </div>

                  <!-- Conteúdo do Card Direita -->
                  <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px;">
                        <h3 style="margin: 0; font-family: inherit; font-size: 17px; font-weight: 800; color: var(--ref-text, #1C1A14); line-height: 1.35;">
                          ${rec.titulo}
                        </h3>
                        <span style="background: rgba(229, 90, 43, 0.08); color: var(--ref-primary, #E55A2B); border: 1px solid rgba(229, 90, 43, 0.2); padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; white-space: nowrap; font-family: inherit;">
                          ${rec.formato}
                        </span>
                      </div>

                      <!-- Gancho dos Primeiros 5 Segundos -->
                      <div style="background: #FAF8F5; border-radius: 12px; padding: 10px 14px; border: 1px solid var(--ref-border, #EBE5DF); margin: 8px 0;">
                        <span style="font-size: 10px; font-weight: 800; color: var(--ref-primary, #E55A2B); display: flex; align-items: center; gap: 4px; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; font-family: inherit;">
                          <i data-lucide="link-2" style="width: 12px; height: 12px;"></i> GANCHO DE 5 SEGUNDOS:
                        </span>
                        <span style="font-size: 12px; color: var(--ref-text, #1C1A14); font-style: italic; line-height: 1.45; font-family: inherit;">"${rec.gancho}"</span>
                      </div>
                    </div>

                    <!-- Rodapé do Card com Ações (Padrão Tomada) -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #F4F0EB;">
                      <div style="display: flex; gap: 8px;">
                        <span style="background: #FAF8F5; border: 1px solid var(--ref-border, #EBE5DF); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; color: var(--ref-text-sub, #64748B); font-family: inherit;">
                          # ${rec.nichoTag || 'Nicho'}
                        </span>
                      </div>

                      <div style="display: flex; gap: 8px; align-items: center;">
                        <button type="button" onclick="Planejamento.importarRecomendacaoParaCaixa('${rec.id}')" style="background: #FAF8F5; border: 1px solid var(--ref-border, #EBE5DF); color: var(--ref-text, #1C1A14); border-radius: 10px; padding: 7px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; font-family: inherit;">
                          <i data-lucide="archive" style="width: 14px; height: 14px; color: var(--ref-primary, #E55A2B);"></i> Salvar na Caixa
                        </button>
                        <button type="button" onclick="Planejamento.enviarRecomendacaoParaCanva('${rec.id}')" style="background: #FAF8F5; border: 1px solid var(--ref-border, #EBE5DF); color: var(--ref-text, #1C1A14); border-radius: 10px; padding: 7px 14px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; font-family: inherit;">
                          <i data-lucide="network" style="width: 14px; height: 14px; color: #3B82F6;"></i> No Canva
                        </button>
                        <button type="button" onclick="Planejamento.verRoteiroRecomendacao('${rec.id}')" style="background: var(--ref-primary, #E55A2B); border: none; color: #FFFFFF; border-radius: 10px; padding: 7px 16px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.3); transition: all 0.2s ease; font-family: inherit;">
                          <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Ver Roteiro
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Rodapé com Seletor Numérico de Páginas (Bolinhas com os Números) -->
            ${!this.carregandoRecomendacoes && totalPaginas > 1 ? `
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; padding: 18px 24px; background: #FFFFFF; border-radius: 20px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 4px 20px rgba(0,0,0,0.02); flex-wrap: wrap; gap: 14px;">
                
                <div style="font-size: 13px; font-weight: 700; color: var(--ref-text-sub, #64748B);">
                  Exibindo <span style="color: var(--ref-primary, #E55A2B); font-weight: 800;">${inicio + 1}–${Math.min(inicio + itensPorPagina, totalItens)}</span> de <span style="color: var(--ref-text, #1C1A14); font-weight: 800;">${totalItens}</span> ideias virais
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <!-- Botão Anterior -->
                  <button type="button" onclick="Planejamento.mudarPaginaRecomendacao(${this.paginaAtualRecomendacao - 1})" ${this.paginaAtualRecomendacao === 1 ? 'disabled style="opacity: 0.35; cursor: not-allowed; width: 36px; height: 36px; border-radius: 50%; background: #FAF8F5; border: 1px solid #EBE5DF; color: #64748B; display: flex; align-items: center; justify-content: center;"' : 'style="width: 36px; height: 36px; border-radius: 50%; background: #FFFFFF; border: 1px solid var(--ref-border, #EBE5DF); color: var(--ref-text, #1C1A14); font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.03);"'}>
                    <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
                  </button>

                  <!-- Círculos de Números de Páginas (Bolinhas) -->
                  <div style="display: flex; align-items: center; gap: 6px;">
                    ${Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => `
                      <button type="button" onclick="Planejamento.mudarPaginaRecomendacao(${p})" style="width: 36px; height: 36px; border-radius: 50%; background: ${p === this.paginaAtualRecomendacao ? 'var(--ref-primary, #E55A2B)' : '#FFFFFF'}; color: ${p === this.paginaAtualRecomendacao ? '#FFFFFF' : 'var(--ref-text, #1C1A14)'}; border: 1px solid ${p === this.paginaAtualRecomendacao ? 'var(--ref-primary, #E55A2B)' : 'var(--ref-border, #EBE5DF)'}; font-size: 13px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-shadow: ${p === this.paginaAtualRecomendacao ? '0 4px 14px rgba(229, 90, 43, 0.4)' : '0 2px 6px rgba(0,0,0,0.02)'}; transform: ${p === this.paginaAtualRecomendacao ? 'scale(1.08)' : 'scale(1)'}; transition: all 0.2s ease; font-family: inherit;">
                        ${p}
                      </button>
                    `).join('')}
                  </div>

                  <!-- Botão Próximo -->
                  <button type="button" onclick="Planejamento.mudarPaginaRecomendacao(${this.paginaAtualRecomendacao + 1})" ${this.paginaAtualRecomendacao === totalPaginas ? 'disabled style="opacity: 0.35; cursor: not-allowed; width: 36px; height: 36px; border-radius: 50%; background: #FAF8F5; border: 1px solid #EBE5DF; color: #64748B; display: flex; align-items: center; justify-content: center;"' : 'style="width: 36px; height: 36px; border-radius: 50%; background: #FFFFFF; border: 1px solid var(--ref-border, #EBE5DF); color: var(--ref-text, #1C1A14); font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.03);"'}>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
                  </button>
                </div>

              </div>
            ` : ''}

          </main>

          <!-- Painel Lateral Direito (~32% - Idêntico aos Widgets da Foto no Padrão Tomada) -->
          <aside style="width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Widget 1: Calendário Minimalista Dinâmico baseado no dia atual real -->
            <div style="background: #FFFFFF; border-radius: 20px; padding: 20px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0; font-family: inherit; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14);">${mesAnoFmtCap}</h4>
                <div style="display: flex; gap: 8px; color: var(--ref-text-sub, #64748B); font-size: 12px;">
                  <span style="cursor: pointer; opacity: 0.5;">&lt;</span>
                  <span style="cursor: pointer; opacity: 0.5;">&gt;</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 4px; font-size: 10px; font-weight: 700; color: var(--ref-text-sub, #64748B); margin-bottom: 10px; text-transform: uppercase;">
                <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 6px;">
                ${diasSemanaExibir.map(d => {
                  const isMelhorDia = d.indexSemana === metricas.melhorDiaIndex;
                  let bg = '#FAF8F5';
                  let color = 'var(--ref-text, #1C1A14)';
                  let border = '1px solid #EBE5DF';
                  let fw = '600';
                  
                  if (isMelhorDia) {
                    bg = 'var(--ref-primary, #E55A2B)';
                    color = '#FFFFFF';
                    border = 'none';
                    fw = '800';
                  } else if (d.isHoje) {
                    border = '2px solid var(--ref-primary, #E55A2B)';
                    fw = '800';
                  }
                  
                  return `
                    <div title="${isMelhorDia ? 'Melhor dia para postagem sugerido pela IA' : (d.isHoje ? 'Hoje' : '')}" style="padding: 8px 0; border-radius: 10px; background: ${bg}; color: ${color}; font-weight: ${fw}; font-size: 12px; border: ${border}; font-family: inherit; position: relative;">
                      ${d.diaMes}
                      ${isMelhorDia ? '<span style="position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: #FFF; border-radius: 50%;"></span>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: var(--ref-text-sub, #64748B); display: flex; align-items: center; gap: 4px;">
                <span style="width: 8px; height: 8px; background: var(--ref-primary, #E55A2B); border-radius: 50%; display: inline-block;"></span>
                Melhor dia sugerido: <strong>${metricas.melhorDia}s</strong>
              </div>
            </div>

            <!-- Widget 2: Canais Referência Reais do Nicho -->
            <div style="background: #FFFFFF; border-radius: 20px; padding: 20px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <h4 style="margin: 0; font-family: inherit; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14);">Canais Referência</h4>
                <span style="font-size: 11px; font-weight: 700; color: var(--ref-primary, #E55A2B); cursor: pointer;">Explorar &gt;</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${canaisRef.map((c, idx) => `
                  <div style="display: flex; align-items: center; gap: 12px; padding: 6px 0; ${idx < canaisRef.length - 1 ? 'border-bottom: 1px solid #F4F0EB;' : ''}">
                    <img src="${c.foto}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid #EBE5DF;">
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: 13px; font-weight: 700; color: var(--ref-text, #1C1A14); font-family: inherit; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${c.nome}">${c.nome}</div>
                      <div style="font-size: 11px; color: var(--ref-text-sub, #64748B); font-family: inherit;">${c.subs} • ${c.engajamento || 'Engajamento bom'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Widget 3: Saúde do Nicho com as Barras Dinâmicas -->
            <div style="background: #FFFFFF; border-radius: 20px; padding: 20px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0; font-family: inherit; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14);">Saúde do Nicho</h4>
                <span style="font-size: 11px; font-weight: 700; color: var(--ref-text-sub, #64748B); text-transform: capitalize;">Competição: ${metricas.competicao}</span>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: var(--ref-text, #1C1A14); font-family: inherit;">
                  <span>Interesse do Público</span>
                  <span style="color: #10B981;">${metricas.interessePublico}%</span>
                </div>
                <div style="height: 10px; background: #FAF8F5; border-radius: 9999px; overflow: hidden; padding: 2px; border: 1px solid #EBE5DF;">
                  <div style="width: ${metricas.interessePublico}%; height: 100%; background: linear-gradient(90deg, #059669, #10B981); border-radius: 9999px;"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: var(--ref-text, #1C1A14); font-family: inherit;">
                  <span>Potencial de Cliques (CTR)</span>
                  <span style="color: var(--ref-primary, #E55A2B);">${metricas.potencialCliques}%</span>
                </div>
                <div style="height: 10px; background: #FAF8F5; border-radius: 9999px; overflow: hidden; padding: 2px; border: 1px solid #EBE5DF;">
                  <div style="width: ${metricas.potencialCliques}%; height: 100%; background: linear-gradient(90deg, #F97316, #E55A2B); border-radius: 9999px;"></div>
                </div>
              </div>
              <div style="margin-top: 12px; font-size: 11px; color: var(--ref-text-sub, #64748B);">
                Horário Nobre: <strong>${metricas.melhorHorario}</strong>
              </div>
            </div>

          </aside>
        </div>
      </div>
    `;
  },
  async buscarRecomendacoesNicho(nichoQuery) {
    if (!nichoQuery) return;
    this.nichoRecomendacao = nichoQuery;
    this.carregandoRecomendacoes = true;
    this.render();

    try {
      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const res = await fetch(`/api/youtube/recomendacoes?nicho=${encodeURIComponent(nichoQuery)}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.recomendacoes && data.recomendacoes.length > 0) {
          this.recomendacoesList = data.recomendacoes.map((rec, index) => {
            const seed = (rec.titulo || '').length + index;
            return {
              id: rec.id || rec.videoId || ('rec_' + Date.now() + '_' + index),
              titulo: rec.titulo,
              canal: rec.canal,
              thumb: rec.thumbnail || rec.thumb || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
              videoId: rec.videoId,
              viralScore: rec.viralScore || Math.floor((seed % 15) + 84),
              viewsEst: rec.viewsEst || (Math.floor((seed % 400) + 50) + 'k views'),
              formato: rec.formato || ['Vídeo Longo', 'Shorts', 'Vlog', 'Tutorial'][seed % 4],
              nichoTag: rec.nichoTag || this.nichoRecomendacao || 'Nicho',
              gancho: rec.gancho || `Comece este vídeo com um gancho dinâmico sobre ${this.nichoRecomendacao || 'este nicho'} para prender o público nos primeiros 5 segundos.`,
              roteiro: rec.roteiro || '1. Introdução marcante\n2. Dicas práticas e demonstração\n3. Conclusão e chamada para ação.'
            };
          });
          this.metricasNicho = data.metricasNicho;
          this.canaisReferencia = data.canaisReferencia;
        }
      }
    } catch (err) {
      console.error('Erro ao buscar recomendações do nicho:', err);
      if (typeof Components !== 'undefined') Components.toast('Erro ao se conectar à API de Recomendações.', 'error');
    } finally {
      this.carregandoRecomendacoes = false;
      this.render();
    }
  },

  importarRecomendacaoParaCaixa(recId) {
    const rec = (this.recomendacoesList || []).find(r => r.id === recId);
    if (!rec) return;

    if (!this.caixas || this.caixas.length === 0) {
      if (typeof Components !== 'undefined') Components.toast('Crie primeiro uma caixa em "Caixa" antes de importar.', 'error');
      return;
    }

    const optionsCaixas = this.caixas.map(cx => `<option value="${cx.id}">${cx.nome}</option>`).join('');

    const modalHTML = `
      <div style="padding: 10px 0;">
        <h4 style="margin: 0 0 8px 0; font-family: 'Outfit'; font-size: 16px; color: var(--ref-text);">${rec.titulo}</h4>
        <p style="font-size: 13px; color: var(--ref-text-sub); margin-bottom: 16px;">Escolha em qual Caixa Organizadora você deseja salvar este card:</p>

        <form id="form-importar-rec" onsubmit="Planejamento.confirmarImportacaoRec(event, '${rec.id}')">
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: var(--ref-text); margin-bottom: 6px;">Caixa de Destino</label>
            <select id="select-caixa-dest" class="form-control" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-family: 'Outfit';">
              ${optionsCaixas}
            </select>
          </div>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" onclick="Components.closeModal()" class="btn-secondary" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Cancelar</button>
            <button type="submit" class="btn-premium-primary" style="padding: 8px 20px; border-radius: 10px; background: var(--ref-primary); color: #FFF; border: none; font-weight: 800; cursor: pointer;">Salvar Card</button>
          </div>
        </form>
      </div>
    `;

    if (typeof Components !== 'undefined' && Components.openModal) {
      Components.openModal('Importar Ideia para Caixa', modalHTML);
    }
  },

  confirmarImportacaoRec(e, recId) {
    e.preventDefault();
    const rec = (this.recomendacoesList || []).find(r => r.id === recId);
    const selectCaixa = document.getElementById('select-caixa-dest');
    const caixaId = selectCaixa ? selectCaixa.value : this.caixas[0]?.id;

    if (rec && caixaId) {
      const novoCard = {
        id: 'card_' + Date.now(),
        caixaId,
        titulo: rec.titulo,
        descricao: `${rec.gancho}\n\n${rec.roteiro || ''}`,
        thumbnail: rec.thumb,
        tag: { nome: rec.nichoTag || 'Recomendado', cor: '#E55A2B' },
        checklist: [
          { texto: 'Gravar Gancho Inicial (5s)', feito: false },
          { texto: 'Desenvolver Roteiro', feito: false },
          { texto: 'Edição & Capa', feito: false }
        ]
      };

      this.cards.push(novoCard);
      this.salvarCards();
      this.registrarAtividade(`Ideia "${rec.titulo}" importada para a caixa.`);
      if (typeof Components !== 'undefined') {
        Components.closeModal();
        Components.toast('Ideia salva como Card com sucesso!', 'success');
      }
      this.render();
    }
  },

  enviarRecomendacaoParaCanva(recId) {
    const rec = (this.recomendacoesList || []).find(r => r.id === recId);
    if (!rec) return;

    const newId = 'node_' + Date.now();
    const novoNo = {
      id: newId,
      type: 'text',
      x: 120 + (this.canvasNodes.length * 30),
      y: 120 + (this.canvasNodes.length * 20),
      width: 340,
      height: 220,
      title: '⚡ ' + rec.titulo,
      text: `<b>Gancho:</b> ${rec.gancho}<br><br><b>Estrutura:</b><br>${(rec.roteiro || '').replace(/\n/g, '<br>')}`
    };

    this.canvasNodes.push(novoNo);
    this.canvasSelectedNodeIds = [newId];
    this.salvarDadosCanvas();
    this.setSubAba('canvas');
    if (typeof Components !== 'undefined') Components.toast('Ideia adicionada ao Canva!', 'success');
  },




  renderRecomendacaoViewHTML() {
    // Dados dinâmicos do painel lateral
    const metricas = this.metricasNicho || {
      interessePublico: 88,
      competicao: 'Baixa / Média',
      potencialCliques: 95,
      melhorDiaIndex: 2, // Terça-feira padrão
      melhorDia: 'Terça',
      melhorHorario: '18:00 - 21:00'
    };

    const canaisRef = this.canaisReferencia || [
      { nome: `Criador Pro ${this.nichoRecomendacao || 'Nicho'}`, subs: '120k inscritos', engajamento: '85% engajamento', foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { nome: 'Mestre da Bancada', subs: '85k inscritos', engajamento: '92% engajamento', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ];

    // Calcular dias da semana corrente a partir do dia atual
    const hoje = new Date();
    const diaSemanaHoje = hoje.getDay(); // 0 a 6
    const domingoCorrente = new Date(hoje);
    domingoCorrente.setDate(hoje.getDate() - diaSemanaHoje);

    const diasSemanaExibir = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(domingoCorrente);
      d.setDate(domingoCorrente.getDate() + i);
      return {
        diaMes: d.getDate(),
        indexSemana: i,
        isHoje: d.toDateString() === hoje.toDateString()
      };
    });

    const mesAnoFmt = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const mesAnoFmtCap = mesAnoFmt.charAt(0).toUpperCase() + mesAnoFmt.slice(1);

    return `
      <div class="ref-rec-wrapper" style="padding: 20px 24px 40px 24px; display: flex; gap: 24px; width: 100%; max-width: 100%; box-sizing: border-box;">
        
        <!-- Coluna Esquerda Principal -->
        <main style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Barra Superior de Pesquisa de Nicho e Filtros Rápidos -->
          <div style="background: #FFFFFF; border-radius: 20px; padding: 20px; border: 1px solid var(--ref-border); box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 style="margin: 0 0 4px 0; font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: var(--ref-text);">⚡ Tendências em Alta & Ideias de Conteúdo</h3>
                <p style="margin: 0; font-size: 13px; color: var(--ref-text-sub);">Digite o seu nicho para a IA analisar o YouTube e recomendar os ganchos e roteiros mais virais.</p>
              </div>
              
              <div style="display: flex; gap: 8px; width: 100%; max-width: 440px;">
                <input type="text" id="input-nicho-search" value="${this.nichoRecomendacao || ''}" placeholder="Ex: Marcenaria, IA, Games, Finanças..." style="flex: 1; background: #FAF8F5; border: 1px solid var(--ref-border); border-radius: 12px; padding: 10px 14px; font-size: 13px; outline: none; font-family: 'Outfit';" onkeydown="if(event.key==='Enter') Planejamento.buscarRecomendacoesNicho(this.value)">
                <button class="btn-premium-primary" onclick="Planejamento.buscarRecomendacoesNicho(document.getElementById('input-nicho-search').value)" style="white-space: nowrap; display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 12px; background: var(--ref-primary); color: #fff; border: none; font-weight: 700; cursor: pointer;">
                  <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i> Gerar Ideias
                </button>
              </div>
            </div>

            <!-- Pílulas de Filtros de Nicho (Inspirado na referência da imagem) -->
            <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
              ${['Marcenaria & Projetos 3D', 'Tecnologia & IA', 'Games & Tycoons', 'Finanças', 'Vlogs & Viagens', 'DIY & Ferramentas'].map(n => `
                <button type="button" onclick="Planejamento.buscarRecomendacoesNicho('${n}')" style="background: ${this.nichoRecomendacao === n ? 'var(--ref-primary)' : '#FAF8F5'}; color: ${this.nichoRecomendacao === n ? '#FFF' : 'var(--ref-text)'}; border: 1px solid ${this.nichoRecomendacao === n ? 'var(--ref-primary)' : 'var(--ref-border)'}; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s ease;">
                  ${n}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Lista de Cards Recomendados (Layout Bento Inspirado no CourseConnect) -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${this.carregandoRecomendacoes ? `
              <div style="text-align: center; padding: 60px 0; background: #FFF; border-radius: 20px; border: 1px solid var(--ref-border);">
                <i data-lucide="loader-2" class="spin-icon" style="width: 36px; height: 36px; color: var(--ref-primary); margin-bottom: 12px;"></i>
                <h4 style="margin: 0; font-family: 'Outfit'; color: var(--ref-text);">Analisando o YouTube & sintetizando tendências com Gemini IA...</h4>
              </div>
            ` : (this.recomendacoesList || []).map(rec => `
              <div class="ref-rec-card" style="background: #FFFFFF; border-radius: 20px; border: 1px solid var(--ref-border); padding: 18px; display: flex; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); align-items: stretch; position: relative;">
                
                <!-- Thumb com Badge de Nível de Viralidade -->
                <div style="width: 220px; border-radius: 14px; overflow: hidden; position: relative; background: #FAF8F5; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <img src="${this.getThumbnailForSugestao(rec)}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                  <div style="position: absolute; top: 10px; left: 10px; background: rgba(229, 90, 43, 0.9); color: #FFF; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 4px;">
                    🔥 ${rec.viralScore}% VIRAL
                  </div>
                  <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: #FFF; padding: 3px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;">
                    ${rec.viewsEst || '45k views'}
                  </div>
                </div>

                <!-- Conteúdo da Ideia Recomendada -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                      <h4 style="margin: 0 0 6px 0; font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800; color: var(--ref-text); line-height: 1.3;">
                        ${rec.titulo}
                      </h4>
                      <span style="background: rgba(229, 90, 43, 0.1); color: var(--ref-primary); padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; white-space: nowrap;">
                        ${rec.formato}
                      </span>
                    </div>

                    <!-- Gancho dos Primeiros 5 Segundos -->
                    <div style="background: #FAF8F5; border-radius: 12px; padding: 10px 12px; border: 1px solid var(--ref-border); margin: 6px 0;">
                      <span style="font-size: 11px; font-weight: 800; color: var(--ref-primary); display: block; margin-bottom: 2px;">🪝 GANCHO DE 5 SEGUNDOS:</span>
                      <span style="font-size: 12px; color: var(--ref-text); font-style: italic; line-height: 1.4;">${rec.gancho}</span>
                    </div>
                  </div>

                  <!-- Botões de Ação em 1 Clique (Importar para Caixa, Enviar para Canva, Ver Roteiro) -->
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #F4F0EB;">
                    <div style="display: flex; gap: 6px;">
                      <span style="background: #FAF8F5; border: 1px solid var(--ref-border); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; color: var(--ref-text-sub);">
                        # ${rec.nichoTag || 'Nicho'}
                      </span>
                    </div>

                    <div style="display: flex; gap: 8px;">
                      <button type="button" onclick="Planejamento.importarRecomendacaoParaCaixa('${rec.id}')" style="background: #FAF8F5; border: 1px solid var(--ref-border); color: var(--ref-text); border-radius: 10px; padding: 7px 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="archive" style="width: 14px; height: 14px; color: var(--ref-primary);"></i> Salvar na Caixa
                      </button>
                      <button type="button" onclick="Planejamento.enviarRecomendacaoParaCanva('${rec.id}')" style="background: #FAF8F5; border: 1px solid var(--ref-border); color: var(--ref-text); border-radius: 10px; padding: 7px 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="network" style="width: 14px; height: 14px; color: #3B82F6;"></i> Adicionar ao Canva
                      </button>
                      <button type="button" onclick="Planejamento.verRoteiroRecomendacao('${rec.id}')" style="background: var(--ref-primary); border: none; color: #FFF; border-radius: 10px; padding: 7px 14px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> Ver Roteiro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </main>

        <!-- Painel Lateral Direito (Design Premium Elevado - Sem Emojis) -->
        <aside style="width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px;">
          
          <!-- Widget 1: Melhores Dias de Postagem (Calendário Premium) -->
          <div style="background: linear-gradient(180deg, #FFFFFF 0%, #FAF9F6 100%); border-radius: 24px; padding: 22px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 10px 30px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.01); transition: all 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="calendar" style="width: 18px; height: 18px; color: var(--ref-primary, #E55A2B);"></i>
                <h4 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14);">Dias de Postagem</h4>
              </div>
              <span style="background: rgba(229, 90, 43, 0.08); color: var(--ref-primary, #E55A2B); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; font-family: inherit;">
                ${mesAnoFmtCap}
              </span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 4px; font-size: 10px; font-weight: 800; color: var(--ref-text-sub, #94A3B8); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
              <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; gap: 6px;">
              ${diasSemanaExibir.map(d => {
                const isMelhorDia = d.indexSemana === metricas.melhorDiaIndex;
                let bg = '#FFFFFF';
                let color = 'var(--ref-text, #1C1A14)';
                let border = '1px solid var(--ref-border, #EBE5DF)';
                let fw = '600';
                let shadow = 'none';
                
                if (isMelhorDia) {
                  bg = 'linear-gradient(135deg, #FF7E40, #E55A2B)';
                  color = '#FFFFFF';
                  border = 'none';
                  fw = '800';
                  shadow = '0 4px 12px rgba(229, 90, 43, 0.3)';
                } else if (d.isHoje) {
                  border = '2px solid rgba(229, 90, 43, 0.4)';
                  fw = '800';
                  bg = '#FAF8F5';
                }
                
                return `
                  <div title="${isMelhorDia ? 'Melhor dia recomendado' : (d.isHoje ? 'Hoje' : '')}" style="padding: 9px 0; border-radius: 12px; background: ${bg}; color: ${color}; font-weight: ${fw}; font-size: 12px; border: ${border}; box-shadow: ${shadow}; position: relative; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ${d.diaMes}
                    ${isMelhorDia ? '<span style="position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; background: #FFFFFF; border-radius: 50%;"></span>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--ref-border, #EBE5DF); display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--ref-text-sub, #64748B);">
              <span>Melhor dia sugerido:</span>
              <span style="font-weight: 800; color: var(--ref-primary, #E55A2B); display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="flame" style="width: 14px; height: 14px; color: var(--ref-primary, #E55A2B);"></i> ${metricas.melhorDia}
              </span>
            </div>
          </div>
 
          <!-- Widget 2: Canais Referência do Nicho (Design Avançado de Perfis) -->
          <div style="background: linear-gradient(180deg, #FFFFFF 0%, #FAF9F6 100%); border-radius: 24px; padding: 22px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 10px 30px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.01);;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="trophy" style="width: 18px; height: 18px; color: #F59E0B;"></i>
                <h4 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14);">Canais Referência</h4>
              </div>
              <span style="font-size: 10px; font-weight: 700; color: var(--ref-primary, #E55A2B); background: rgba(229, 90, 43, 0.05); padding: 3px 8px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Ver todos &gt;</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${canaisRef.map((c, idx) => `
                <div style="display: flex; align-items: center; gap: 14px; padding: 6px 0; ${idx < canaisRef.length - 1 ? 'border-bottom: 1px solid #F4F0EB;' : ''}">
                  <div style="width: 42px; height: 42px; border-radius: 50%; padding: 2px; background: linear-gradient(135deg, rgba(229, 90, 43, 0.3), rgba(59, 130, 246, 0.3)); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.04);">
                    <img src="${c.foto}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 1px solid #FFFFFF;">
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="font-size: 13px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: 'Outfit', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="${c.nome}">${c.nome}</div>
                      <span style="background: rgba(16, 185, 129, 0.08); color: #059669; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 800; font-family: inherit; display: inline-flex; align-items: center; gap: 3px; white-space: nowrap;">
                        <i data-lucide="trending-up" style="width: 12px; height: 12px; color: #059669;"></i> ${c.engajamento || '90%'}
                      </span>
                    </div>
                    <div style="font-size: 11px; color: var(--ref-text-sub, #64748B); font-family: inherit; margin-top: 2px; display: flex; align-items: center; gap: 4px;">
                      <i data-lucide="users" style="width: 12px; height: 12px; color: var(--ref-text-sub);"></i> ${c.subs}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
 
          <!-- Widget 3: Saúde do Nicho (Design Premium com Barras Otimizadas) -->
          <div style="background: linear-gradient(180deg, #FFFFFF 0%, #FAF9F6 100%); border-radius: 24px; padding: 22px; border: 1px solid var(--ref-border, #EBE5DF); box-shadow: 0 10px 30px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.01);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="activity" style="width: 18px; height: 18px; color: var(--ref-primary, #E55A2B);"></i>
                <h4 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14);">Saúde do Nicho</h4>
              </div>
              <span style="background: rgba(16, 185, 129, 0.12); color: #059669; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase;">
                Comp: ${metricas.competicao}
              </span>
            </div>
            
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: var(--ref-text, #1C1A14); font-family: inherit;">
                <span>Interesse do Público</span>
                <span style="color: var(--ref-primary, #E55A2B); font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                  ${metricas.interessePublico}% <span style="background: rgba(229, 90, 43, 0.08); color: var(--ref-primary, #E55A2B); padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; font-family: inherit; display: inline-flex; align-items: center; gap: 2px;"><i data-lucide="flame" style="width: 10px; height: 10px; color: var(--ref-primary);"></i> ALTO</span>
                </span>
              </div>
              <div style="height: 10px; background: #F0ECE6; border-radius: 9999px; overflow: hidden; padding: 2px; border: 1px solid rgba(0,0,0,0.02);">
                <div style="width: ${metricas.interessePublico}%; height: 100%; background: linear-gradient(90deg, #FF8F59 0%, #E55A2B 100%); border-radius: 9999px; box-shadow: 0 1px 3px rgba(229, 90, 43, 0.2);"></div>
              </div>
            </div>
 
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: var(--ref-text, #1C1A14); font-family: inherit;">
                <span>Potencial de Cliques (CTR)</span>
                <span style="color: #059669; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                  ${metricas.potencialCliques}% <span style="background: rgba(16, 185, 129, 0.08); color: #059669; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; font-family: inherit; display: inline-flex; align-items: center; gap: 2px;"><i data-lucide="zap" style="width: 10px; height: 10px; color: #059669;"></i> EXCELENTE</span>
                </span>
              </div>
              <div style="height: 10px; background: #F0ECE6; border-radius: 9999px; overflow: hidden; padding: 2px; border: 1px solid rgba(0,0,0,0.02);">
                <div style="width: ${metricas.potencialCliques}%; height: 100%; background: linear-gradient(90deg, #34D399 0%, #059669 100%); border-radius: 9999px; box-shadow: 0 1px 3px rgba(5, 150, 105, 0.2);"></div>
              </div>
            </div>
            
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--ref-border, #EBE5DF); display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--ref-text-sub, #64748B);">
              <span>Melhor Horário:</span>
              <span style="font-weight: 800; color: var(--ref-text, #1C1A14); display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="clock" style="width: 13px; height: 13px; color: var(--ref-text-sub);"></i> ${metricas.melhorHorario}
              </span>
            </div>
          </div>
 
        </aside>
      </div>
    `;
  },

  // Drag and Drop
  // ──────────────────────────────────────────────────────────────
  // DRAG AND DROP COM ANIMAÇÃO DE 3 ATOS ULTRA FLUIDA (CAIXA)
  // ──────────────────────────────────────────────────────────────
  handleDragStart(event, cardId) {
    this.draggedCardId = cardId;
    event.dataTransfer.setData('text/plain', cardId);
    event.dataTransfer.effectAllowed = 'move';

    const cardEl = event.currentTarget;
    if (cardEl) {
      // ATO 1: Clicar e Segurar (Tactile Grab & Lift)
      cardEl.classList.add('card-dragging');

      try {
        const ghost = cardEl.cloneNode(true);
        ghost.id = 'drag-ghost-clone';
        ghost.style.position = 'absolute';
        ghost.style.top = '-9999px';
        ghost.style.left = '-9999px';
        ghost.style.width = cardEl.offsetWidth + 'px';
        ghost.style.transform = 'scale(1.05) rotate(3deg)';
        ghost.style.boxShadow = '0 25px 50px -12px rgba(229, 90, 43, 0.45), 0 12px 24px -6px rgba(0, 0, 0, 0.2)';
        ghost.style.border = '2px solid #E55A2B';
        ghost.style.borderRadius = '20px';
        ghost.style.pointerEvents = 'none';
        ghost.style.opacity = '0.92';
        document.body.appendChild(ghost);

        event.dataTransfer.setDragImage(ghost, event.offsetX || 80, event.offsetY || 40);
        setTimeout(() => ghost.remove(), 0);
      } catch (e) {
        console.warn('Erro ao configurar drag ghost:', e);
      }
    }

    // Ativa zonas de soltura (todas as Caixas Hero recebem pulso convidativo)
    document.querySelectorAll('.ref-hero-card').forEach(heroCard => {
      heroCard.classList.add('dropzone-active');
    });
  },

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  },

  handleDragEnter(event, caixaId) {
    event.preventDefault();
    // ATO 2: Arrastar (Hover Magnético sobre a caixa destino)
    const heroCard = event.currentTarget;
    if (heroCard && heroCard.classList.contains('ref-hero-card')) {
      heroCard.classList.add('drop-target-hover');
    }
  },

  handleDragLeave(event, caixaId) {
    const heroCard = event.currentTarget;
    if (heroCard && heroCard.classList.contains('ref-hero-card')) {
      const rect = heroCard.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
        heroCard.classList.remove('drop-target-hover');
      }
    }
  },

  handleDragEnd(event) {
    const cardEl = event.currentTarget;
    if (cardEl) {
      cardEl.classList.remove('card-dragging');
    }
    document.querySelectorAll('.ref-hero-card').forEach(heroCard => {
      heroCard.classList.remove('dropzone-active', 'drop-target-hover');
    });
  },

  handleDrop(event, novaCaixaId) {
    event.preventDefault();
    const heroCard = event.currentTarget;

    // ATO 3: Soltar (Snap, Bounce Elastic & Onda de Choque)
    if (heroCard) {
      heroCard.classList.remove('dropzone-active', 'drop-target-hover');
    }
    document.querySelectorAll('.ref-hero-card').forEach(h => h.classList.remove('dropzone-active', 'drop-target-hover'));

    const cardId = event.dataTransfer.getData('text/plain') || this.draggedCardId;
    if (cardId) {
      if (heroCard && heroCard.classList.contains('ref-hero-card')) {
        heroCard.classList.add('drop-success-snap');

        // Onda de choque (Ripple Wave)
        const ripple = document.createElement('div');
        ripple.className = 'drop-ripple-wave';
        heroCard.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);

        setTimeout(() => {
          heroCard.classList.remove('drop-success-snap');
        }, 600);
      }

      setTimeout(() => {
        this.moverCardDeCaixa(cardId, novaCaixaId);
      }, 120);
    }
  },

  moverCardDeCaixa(cardId, novaCaixaId) {
    const card = this.cards.find(c => c.id === cardId);
    if (card) {
      if (card.caixaId === novaCaixaId) {
        if (typeof Components !== 'undefined') Components.toast('Card já está nesta caixa!', 'info');
        return;
      }
      const cx = this.caixas.find(c => c.id === novaCaixaId);
      const cxNome = cx ? cx.nome : 'outra caixa';
      card.caixaId = novaCaixaId;
      this.activeCaixaId = novaCaixaId;
      this.salvarCards();
      this.registrarAtividade(`Card "${card.titulo}" movido para a caixa "${cxNome}".`);
      this.render();
      if (typeof Components !== 'undefined') Components.toast(`✨ Card "${card.titulo}" movido para "${cxNome}"!`, 'success');
    }
  },

  sugestoesList: [
    {
      id: 'sug_1',
      titulo: 'COMO MONTAR UM GABARITO DE CORTE PERFEITO SEM GASTAR QUASE NADA',
      gancho: 'Mostrar o gabarito pronto fazendo um corte 100% alinhado em 3 segundos antes de revelar o material barato usado.',
      roteiro: '1. Apresentação do desafio do alinhamento sem folga\n2. Lista de materiais e sobras de MDF\n3. Passo a passo da montagem com cola e parafusos\n4. Teste prático de corte perfeito ao vivo.',
      formato: 'Vídeo Longo (10-14 min)',
      viewsEst: '55k - 80k views',
      matchPercent: 98,
      motivoIA: 'Seu vídeo anterior de corte em MDF teve 94% de retenção nos 2 min iniciais.',
      nichoTag: 'Marcenaria & Projetos 3D',
      thumb: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'sug_2',
      titulo: '3 TRUQUES SECRETOS NA FITA DE BORDA QUE OS MARCENEIROS NÃO CONTAM',
      gancho: '"Se a sua fita de borda descola ou fica com dente no acabamento, você cometeu esse erro bobo!"',
      roteiro: '1. Erro 1: Cola em excesso ou fria\n2. Erro 2: Pressão incorreta no refilo\n3. O acabamento perfeito com estilete e lixa fina 320.',
      formato: 'Shorts (45s)',
      viewsEst: '120k+ views',
      matchPercent: 95,
      motivoIA: 'Formatos Shorts no seu nicho estão com taxa de compartilhamento 3x maior esta semana.',
      nichoTag: 'Shorts Dicas',
      thumb: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'sug_3',
      titulo: 'PROJETEI E FIZ A MESA DOS MEUS SONHOS EM 3D + MONTAGEM COMPLETA',
      gancho: 'Alternar rapidamente entre o projeto 3D realista e a mesa de madeira pronta na oficina.',
      roteiro: '1. Concepção 3D no software de modelagem\n2. Plano de corte inteligente e aproveitamento de chapa\n3. Montagem, lixamento e selador final.',
      formato: 'Tutorial Completo',
      viewsEst: '40k - 65k views',
      matchPercent: 92,
      motivoIA: 'Seus inscritos mais engajados salvam vídeos de projeto 3D combinado com montagem.',
      nichoTag: 'Projetos 3D',
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    }
  ],
  getThumbnailForSugestao(sug) {
    if (!sug) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
    if (sug.thumb && (sug.thumb.includes('ytimg.com') || sug.thumb.includes('ggpht.com') || sug.thumb.includes('steamstatic.com'))) {
      return sug.thumb;
    }
    if (sug.thumbnail && (sug.thumbnail.includes('ytimg.com') || sug.thumbnail.includes('ggpht.com') || sug.thumbnail.includes('steamstatic.com'))) {
      return sug.thumbnail;
    }

    const text = `${sug.titulo || ''} ${sug.nichoTag || ''} ${sug.formato || ''} ${sug.gancho || ''}`.toLowerCase();

    // Game Dev Tycoon
    if (text.includes('game dev tycoon') || text.includes('game dev') || text.includes('tycoon')) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/239820/header.jpg';
    }
    // GTA V / GTA RP / Rockstar / Red Dead
    if (text.includes('gta') || text.includes('grand theft auto') || text.includes('gta 5') || text.includes('gta rp') || text.includes('mafia') || text.includes('rockstar') || text.includes('red dead')) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg';
    }
    // BitLife / Simulators
    if (text.includes('bitlife') || text.includes('cr7') || text.includes('influencer')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
    }
    // Minecraft
    if (text.includes('minecraft') || text.includes('craft')) {
      return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80';
    }
    // Terraria
    if (text.includes('terraria')) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg';
    }
    // Roblox / Blox Fruits
    if (text.includes('roblox') || text.includes('blox fruits')) {
      return 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=600&q=80';
    }
    // Valorant / CS2 / Counter Strike / FPS / Call of Duty / Warzone
    if (text.includes('valorant') || text.includes('cs2') || text.includes('cs:go') || text.includes('counter strike') || text.includes('cod') || text.includes('warzone') || text.includes('shooter')) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg';
    }
    // Fortnite / Free Fire / PUBG / Battle Royale
    if (text.includes('fortnite') || text.includes('free fire') || text.includes('pubg') || text.includes('battle royale')) {
      return 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=600&q=80';
    }
    // FIFA / EA FC / Futebol / PES / Messi
    if (text.includes('fifa') || text.includes('ea fc') || text.includes('futebol') || text.includes('pes') || text.includes('messi') || text.includes('neymar')) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2195250/header.jpg';
    }
    // Elden Ring / Souls / RPG / God of War / Witcher
    if (text.includes('elden ring') || text.includes('dark souls') || text.includes('souls') || text.includes('god of war') || text.includes('witcher') || text.includes('rpg')) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg';
    }
    // League of Legends / LoL / Dota
    if (text.includes('league of legends') || text.includes('lol') || text.includes('dota') || text.includes('wild rift')) {
      return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
    }
    // Pokemon / Palworld
    if (text.includes('pokemon') || text.includes('palworld') || text.includes('pokémon')) {
      return 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80';
    }
    // Mario / Zelda / Nintendo
    if (text.includes('mario') || text.includes('zelda') || text.includes('nintendo')) {
      return 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80';
    }
    // Cyberpunk
    if (text.includes('cyberpunk') || text.includes('futurista') || text.includes('sci-fi')) {
      return 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg';
    }
    // Shorts & Dicas
    if (text.includes('shorts') || text.includes('dicas') || text.includes('truques') || text.includes('refilo')) {
      return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80';
    }
    // Marcenaria & 3D
    if (text.includes('3d') || text.includes('projeto') || text.includes('marcenaria') || text.includes('fita de borda')) {
      return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    }

    return sug.thumb || sug.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
  },

  // Helper centralizado para encontrar sugestão por ID em qualquer fonte
  _findSugestao(id) {
    return (this.sugestoesList || []).find(s => s.id === id) ||
           (this.recomendacoesList || []).find(r => r.id === id) ||
           (this.sugestoesCache && this.sugestoesCache.sugestoesList
             ? this.sugestoesCache.sugestoesList.find(s => s.id === id)
             : null);
  },

  async verRoteiroSugestao(sugId) {
    const sug = this._findSugestao(sugId);
    if (!sug) return;


    const loadingHTML = `
      <div style="padding: 20px 0; text-align: center;">
        <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 24px; text-align: left;">
          <span style="font-size: 11px; font-weight: 800; color: var(--ref-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <i data-lucide="zap" style="width: 14px; height: 14px;"></i> RELEVÂNCIA PARA SEU CANAL: ${sug.matchPercent}% MATCH
          </span>
          <h3 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 17px; color: var(--ref-text);">${sug.titulo}</h3>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0;">
          <div class="spinner" style="width: 40px; height: 40px; border: 3px solid #EBE5DF; border-top-color: var(--ref-primary, #E55A2B); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <span style="font-size: 14px; font-weight: 700; color: var(--ref-text);">Gemini IA está sintetizando o roteiro sob medida para seu canal...</span>
          <span style="font-size: 12px; color: var(--ref-text-sub, #64748B);">Analisando retenção e tom da sua audiência</span>
        </div>
      </div>`;

    const footerHTML = `
      <button type="button" class="btn btn-secondary" onclick="Components.closeModal()" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Fechar</button>`;

    Components.showModal('Roteiro Recomendado pela IA', loadingHTML, footerHTML, 'premium-task-modal');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const response = await fetch('/api/youtube/gerar-roteiro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          titulo: sug.titulo,
          gancho: sug.gancho,
          nicho: sug.nichoTag || 'Geral',
          formato: sug.formato,
          viralScore: sug.matchPercent
        })
      });

      const data = await response.json();

      if (!data.success || !data.roteiro) {
        throw new Error(data.error || 'Erro ao gerar roteiro');
      }

      const roteiroFormatado = data.roteiro
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^##\s+(.+)$/gm, '<h4 style="margin: 18px 0 8px; color: var(--ref-primary, #E55A2B); font-size: 15px; font-weight: 800; font-family: inherit;">$1</h4>')
        .replace(/^#\s+(.+)$/gm, '<h3 style="margin: 20px 0 10px; color: var(--ref-text); font-size: 17px; font-weight: 800; font-family: inherit;">$1</h3>')
        .replace(/^[-•]\s+(.+)$/gm, '<div style="display: flex; gap: 8px; margin: 4px 0; align-items: flex-start;"><span style="color: var(--ref-primary, #E55A2B); font-weight: 800; flex-shrink: 0;">•</span><span>$1</span></div>')
        .replace(/\n{2,}/g, '<div style="height: 12px;"></div>')
        .replace(/\n/g, '<br>');

      const resultHTML = `
        <div style="padding: 10px 0;">
          <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <span style="font-size: 11px; font-weight: 800; color: var(--ref-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <i data-lucide="target" style="width: 14px; height: 14px;"></i> RELEVÂNCIA PARA SEU CANAL: ${sug.matchPercent}% MATCH
            </span>
            <h3 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 17px; color: var(--ref-text);">${sug.titulo}</h3>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="font-size: 12px; font-weight: 800; color: var(--ref-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <i data-lucide="anchor" style="width: 14px; height: 14px;"></i> GANCHO INICIAL (0 a 5 segundos):
            </label>
            <div style="background: #FAF8F5; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--ref-border); font-size: 13px; font-style: italic; color: var(--ref-text);">
              "${sug.gancho}"
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="font-size: 12px; font-weight: 800; color: var(--ref-text); display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> ROTEIRO COMPLETO PARA O SEU CANAL:
            </label>
            <div style="background: #FAF8F5; padding: 16px; border-radius: 12px; border: 1px solid var(--ref-border); font-size: 13px; line-height: 1.65; color: var(--ref-text); max-height: 420px; overflow-y: auto;">
              ${roteiroFormatado}
            </div>
          </div>
        </div>`;

      const resultFooterHTML = `
        <button type="button" onclick="Planejamento.enviarSugestaoParaCanva('${sug.id}'); Components.closeModal();" class="btn-secondary" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <i data-lucide="network" style="width: 14px; height: 14px;"></i> Mandar pro Canva
        </button>
        <button type="button" onclick="Planejamento.importarSugestaoParaCaixa('${sug.id}')" class="btn-premium-primary" style="padding: 8px 20px; border-radius: 10px; background: var(--ref-primary); color: #FFF; border: none; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <i data-lucide="archive" style="width: 14px; height: 14px;"></i> Salvar na Caixa
        </button>
        <button type="button" onclick="Components.closeModal()" class="btn btn-secondary" style="padding: 8px 16px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">Fechar</button>`;

      Components.showModal('Roteiro Recomendado pela IA', resultHTML, resultFooterHTML, 'premium-task-modal');
      if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
      console.error('[Roteiro Sugestão] Erro:', err);
      if (typeof Components !== 'undefined') Components.toast('Erro ao se comunicar com a IA.', 'error');
    }
  },

  addChecklistInputRow() {
    const container = document.getElementById('card-checklist-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'chk-input-row';
    row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
    row.innerHTML = `
      <input type="text" class="card-chk-item p-input" placeholder="Ex: Escrever roteiro" style="flex: 1;">
      <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border, #EBE5DF); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
    `;
    container.appendChild(row);
  },

  importarSugestaoParaCaixa(sugId) {
    const sug = this._findSugestao(sugId);
    if (!sug) {
      if (typeof Components !== 'undefined') Components.toast('Sugestão não encontrada.', 'error');
      return;
    }

    const caixasOptions = (this.caixas || []).map(cx => 
      `<option value="${cx.id}" ${this.activeCaixaId === cx.id ? 'selected' : ''}>${cx.titulo || cx.nome || 'Caixa Sem Nome'}</option>`
    ).join('');

    const modalHTML = `
      <form id="form-salvar-sugestao-caixa" onsubmit="event.preventDefault(); Planejamento.confirmarSalvarSugestaoEmCaixa('${sug.id}');" class="premium-desktop-form">
        
        <!-- Header informativo com Badge de Relevância -->
        <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div>
            <span style="font-size: 11px; font-weight: 800; color: var(--ref-primary, #E55A2B); display: inline-flex; align-items: center; gap: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
              <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i> Sugestão Calibrada pela IA
            </span>
            <h4 style="margin: 4px 0 0 0; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: 'Outfit', sans-serif;">${sug.titulo}</h4>
          </div>
          <span style="background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; flex-shrink: 0;">
            ${sug.matchPercent}% Match
          </span>
        </div>

        <!-- Estrutura Bento Grid de 2 Colunas (Réplica Exata do Novo Card de Conteúdo) -->
        <div class="p-bento-container">
          
          <!-- Coluna 1: Destino, Título, Descrição e Tag -->
          <div class="p-bento-col">
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="text-quote"></i> Informações do Conteúdo</h4>
              
              <div class="p-form-group">
                <label>Título do Conteúdo *</label>
                <input type="text" id="modal-sugestao-titulo" class="p-input" value="${sug.titulo.replace(/"/g, '&quot;')}" required>
              </div>

              <div class="p-form-group">
                <label>Caixa Organizadora Destino *</label>
                <select id="modal-sugestao-caixa-id" class="p-input trello-select" required>
                  ${caixasOptions || '<option value="">Caixa de Entrada</option>'}
                </select>
              </div>

              <div class="p-form-group">
                <label>Descrição / Briefing</label>
                <textarea id="modal-sugestao-descricao" class="p-input" rows="3">${sug.gancho}\n\nMotivo IA: ${sug.motivoIA}</textarea>
              </div>

              <div class="p-form-group" style="margin-bottom:0;">
                <label>Tag / Categoria</label>
                <input type="text" id="modal-sugestao-tag" class="p-input" value="${sug.nichoTag || 'Sugestão IA'}">
              </div>
            </div>
          </div>

          <!-- Coluna 2: Checklist de Etapas e Template de Card -->
          <div class="p-bento-col">
            
            <!-- Bento Card 1: Checklist Dinâmico com Botão + Adicionar Etapa -->
            <div class="p-bento-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 class="p-bento-title" style="margin-bottom: 0;"><i data-lucide="list-todo"></i> Checklist de Etapas</h4>
                <button type="button" onclick="Planejamento.addChecklistInputRow()" style="background: none; border: none; color: var(--ref-primary, #E55A2B); font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i> Adicionar Etapa
                </button>
              </div>
              
              <div id="card-checklist-container">
                <div class="chk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                  <input type="text" class="card-chk-item p-input" value="Gravar Gancho Inicial (5s)" style="flex: 1;">
                  <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border, #EBE5DF); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
                </div>
                <div class="chk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                  <input type="text" class="card-chk-item p-input" value="Desenvolver Roteiro Recomendado" style="flex: 1;">
                  <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border, #EBE5DF); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
                </div>
                <div class="chk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                  <input type="text" class="card-chk-item p-input" value="Edição & Publicação" style="flex: 1;">
                  <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border, #EBE5DF); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
                </div>
              </div>
            </div>

            <!-- Bento Card 2: Template de Card -->
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="copy"></i> Template de Card</h4>
              <div class="p-form-group">
                <label>Modelos Salvos</label>
                <div style="display: flex; gap: 8px;">
                  <select id="card-template-selector" class="p-input trello-select" onchange="Planejamento.carregarTemplatePlanejamento(this.value)" style="flex: 1;">
                    <option value="">Selecione um template...</option>
                    ${this.getTemplatesOptionsHTML ? this.getTemplatesOptionsHTML() : ''}
                  </select>
                  <button type="button" class="btn-premium-danger" onclick="Planejamento.excluirTemplatePlanejamento()" title="Excluir Template" style="padding: 0 12px; height: 44px; display: flex; align-items: center; justify-content: center; width: 44px; border-radius: 12px;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                  </button>
                </div>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button type="button" class="btn-premium-secondary" onclick="Planejamento.salvarComoTemplatePlanejamento()" style="flex: 1; font-size: 12px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i data-lucide="save" style="width: 14px; height: 14px;"></i>
                  Salvar Atual
                </button>
                <button type="button" class="btn-premium-primary" onclick="Planejamento.abrirModalAplicarEmMassa()" style="flex: 1; font-size: 12px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i data-lucide="layers" style="width: 14px; height: 14px;"></i>
                  Aplicar em Massa
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>
    `;

    const actionsHTML = `
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="button" class="btn-premium-primary" onclick="Planejamento.confirmarSalvarSugestaoEmCaixa('${sug.id}')">
        <i data-lucide="check" style="width: 15px; height: 15px;"></i> Salvar Card na Caixa
      </button>
    `;

    Components.showModal('Salvar Sugestão em uma Caixa', modalHTML, actionsHTML, 'premium-task-modal');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (typeof HigPopovers !== 'undefined') {
      setTimeout(() => HigPopovers.init(), 50);
    }
  },

  confirmarSalvarSugestaoEmCaixa(sugId) {
    const sug = this._findSugestao(sugId);
    const caixaSelect = document.getElementById('modal-sugestao-caixa-id');
    const tituloInput = document.getElementById('modal-sugestao-titulo');
    const descInput = document.getElementById('modal-sugestao-descricao');
    const tagInput = document.getElementById('modal-sugestao-tag');

    const caixaId = caixaSelect ? caixaSelect.value : (this.caixas[0] ? this.caixas[0].id : 'caixa_default');
    const titulo = tituloInput ? tituloInput.value.trim() : (sug ? sug.titulo : 'Novo Card');
    const descricao = descInput ? descInput.value.trim() : '';
    const tagNome = tagInput ? tagInput.value.trim() : 'Sugestão IA';

    // Coletar itens do checklist interativo dinamicamente!
    const chkElements = document.querySelectorAll('#card-checklist-container .card-chk-item');
    const checklist = [];
    chkElements.forEach(input => {
      const val = input.value.trim();
      if (val) checklist.push({ texto: val, feito: false });
    });

    const novoCard = {
      id: 'card_' + Date.now(),
      caixaId,
      titulo,
      descricao,
      thumbnail: sug ? sug.thumb : '',
      tag: { nome: tagNome, cor: '#E55A2B' },
      checklist: checklist.length > 0 ? checklist : [
        { texto: 'Gravar Gancho Inicial (5s)', feito: false },
        { texto: 'Desenvolver Roteiro Recomendado', feito: false },
        { texto: 'Edição & Publicação', feito: false }
      ]
    };

    this.cards.push(novoCard);
    this.salvarCards();
    this.registrarAtividade(`Sugestão "${titulo}" salva na caixa.`);

    if (typeof Components !== 'undefined') {
      Components.closeModal();
      Components.toast('Card salvo com sucesso na caixa!', 'success');
    }

    // Ir para a visualização da caixa de destino
    this.setSubAba('caixas');
    this.setActiveCaixa(caixaId);
  },

  enviarSugestaoParaCanva(sugId) {
    const sug = this._findSugestao(sugId);
    if (!sug) return;
    const newId = 'node_' + Date.now();
    const novoNo = {
      id: newId,
      type: 'text',
      x: 120 + (this.canvasNodes.length * 30),
      y: 120 + (this.canvasNodes.length * 20),
      width: 340,
      height: 220,
      title: sug.titulo,
      text: `<b>Gancho:</b> ${sug.gancho}<br><br><b>Motivo IA:</b> ${sug.motivoIA}`
    };
    this.canvasNodes.push(novoNo);
    this.canvasSelectedNodeIds = [newId];
    this.salvarDadosCanvas();
    this.setSubAba('canvas');
    if (typeof Components !== 'undefined') Components.toast('Sugestão adicionada ao Canva!', 'success');
  },

  setAbaTemas(aba) {
    this.abaTemasAtiva = aba;
    this.render();
  },

  filtrarSugestoesPorTema(temaNome) {
    this.filtroTemaAtual = temaNome;
    const temaObj = (this.temasPersonalizados || []).find(tp => tp.titulo === temaNome);
    this.filtroTemaDescricao = temaObj?.descricao || null;

    this.sugestaoSeed = (this.sugestaoSeed || 0) + 1;
    this.sugestoesCache = null;
    this.paginaAtualSugestoes = 1;
    if (typeof Components !== 'undefined') Components.toast(`🤖 IA gerando 30 sugestões focadas no tema: "${temaNome}"...`, 'info');
    
    // Força chamada à API enviando o tema personalizado como foco
    this.carregarSugestoesCanal();
  },

  limparFiltroTema() {
    this.filtroTemaAtual = null;
    this.filtroTemaDescricao = null;
    this.sugestoesCache = null;
    this.paginaAtualSugestoes = 1;
    if (typeof Components !== 'undefined') Components.toast('Filtro de tema removido. Exibindo todas as sugestões do canal.', 'info');
    this.carregarSugestoesCanal();
  },

  openModalCriarTemaPersonalizado() {
    const modalHTML = `
      <form id="form-criar-tema-ia" onsubmit="Planejamento.salvarTemaPersonalizado(event)" class="premium-desktop-form">
        
        <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(229, 90, 43, 0.15); color: var(--ref-primary, #E55A2B); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
          </div>
          <div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: 'Outfit', sans-serif;">Criar Tema Personalizado para a IA</h4>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--ref-text-sub, #64748B);">A Inteligência Artificial irá calibrar 30 ideias exclusivas de vídeos com base na sua descrição.</p>
          </div>
        </div>

        <div class="p-bento-container" style="display: flex; flex-direction: column; gap: 16px;">
          
          <div class="p-bento-card">
            <h4 class="p-bento-title"><i data-lucide="type"></i> Nome do Tema</h4>
            <div class="p-form-group" style="margin-bottom: 0;">
              <label>Título do Tema *</label>
              <input type="text" id="modal-tema-titulo" class="p-input" placeholder="Ex: GTA RP - Vida no Crime ou Roblox Tycoon 100 Dias" required>
            </div>
          </div>

          <div class="p-bento-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 class="p-bento-title" style="margin: 0;"><i data-lucide="align-left"></i> Instruções & Descrição para a IA</h4>
              <button type="button" id="btn-gerar-desc-ia" onclick="Planejamento.gerarDescricaoTemaIA()" style="background: rgba(229, 90, 43, 0.1); border: 1px solid rgba(229, 90, 43, 0.3); color: var(--ref-primary, #E55A2B); border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s ease;">
                <i data-lucide="sparkles" style="width: 12px; height: 12px;"></i> Gerar Descrição com IA
              </button>
            </div>
            <div class="p-form-group" style="margin-bottom: 0;">
              <label>Descreva o foco do tema e o estilo das ideias que você deseja *</label>
              <textarea id="modal-tema-descricao" class="p-input" rows="4" placeholder="Ex: Quero ideias de séries de 100 dias no GTA RP focadas em construir um império da máfia do zero, com desafios de dinheiro, ganchos dramáticos nos 5s iniciais e reviravoltas." required></textarea>
            </div>
          </div>

        </div>
      </form>
    `;

    const actionsHTML = `
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="submit" form="form-criar-tema-ia" class="btn-premium-primary">
        <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> Criar Tema & Gerar 30 Ideias
      </button>
    `;

    Components.showModal('Criar Novo Tema de Conteúdo', modalHTML, actionsHTML, 'premium-task-modal');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  async gerarDescricaoTemaIA() {
    const tituloInput = document.getElementById('modal-tema-titulo');
    const descInput = document.getElementById('modal-tema-descricao');
    const btnBtn = document.getElementById('btn-gerar-desc-ia');

    if (!tituloInput || !descInput) return;
    const titulo = tituloInput.value.trim();

    if (!titulo) {
      if (typeof Components !== 'undefined') Components.toast('⚠️ Preencha o "Título do Tema" primeiro para a IA gerar a descrição!', 'warning');
      tituloInput.focus();
      return;
    }

    if (btnBtn) {
      btnBtn.disabled = true;
      btnBtn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 12px; height: 12px;"></i> Gerando...`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    try {
      const promptText = `Você é um diretor criativo do YouTube especializado em briefing de conteúdo.
Com base no título de tema: "${titulo}", crie uma instrução/descrição direta e objetiva de exatamente 3 linhas para a IA gerar ideias de vídeos altamente virais.
Foque em: estilo do vídeo, dinâmica de entretenimento e ganchos iniciais.
Responda APENAS com o texto da descrição (3 linhas), sem títulos, numerações ou explicações adicionais.`;

      const res = await API.post('/api/youtube/gerar-texto-ia', { prompt: promptText });
      
      if (res && res.success && res.texto) {
        descInput.value = res.texto.trim();
        if (typeof Components !== 'undefined') Components.toast('✨ Descrição gerada pela IA com sucesso!', 'success');
      } else {
        // Gerador nativo inteligente de 3 linhas como fallback
        descInput.value = `Série focada em ${titulo} com desafios épicos, evolução progressiva e metas claras a cada episódio.\nVídeos dinâmicos com ganchos dramáticos nos primeiros 5 segundos para maximizar a retenção e o tempo de exibição.\nAbordagem com alto potencial de CTR, reviravoltas no clímax e chamadas estratégicas para engajamento dos inscritos.`;
        if (typeof Components !== 'undefined') Components.toast('✨ Descrição inteligente de 3 linhas gerada!', 'success');
      }
    } catch (e) {
      console.warn('Erro ao gerar descrição com IA:', e);
      descInput.value = `Série focada em ${titulo} com desafios épicos, evolução progressiva e metas claras a cada episódio.\nVídeos dinâmicos com ganchos dramáticos nos primeiros 5 segundos para maximizar a retenção e o tempo de exibição.\nAbordagem com alto potencial de CTR, reviravoltas no clímax e chamadas estratégicas para engajamento dos inscritos.`;
      if (typeof Components !== 'undefined') Components.toast('✨ Descrição inteligente de 3 linhas gerada!', 'success');
    } finally {
      if (btnBtn) {
        btnBtn.disabled = false;
        btnBtn.innerHTML = `<i data-lucide="sparkles" style="width: 12px; height: 12px;"></i> Gerar Descrição com IA`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  },

  salvarTemaPersonalizado(event) {
    event.preventDefault();
    const tituloInput = document.getElementById('modal-tema-titulo');
    const descInput = document.getElementById('modal-tema-descricao');

    if (!tituloInput || !descInput) return;
    const titulo = tituloInput.value.trim();
    const descricao = descInput.value.trim();

    if (!titulo || !descricao) return;

    // Adicionar aos temas personalizados
    if (!this.temasPersonalizados) this.temasPersonalizados = [];
    this.temasPersonalizados.push({
      titulo,
      descricao,
      taxaSucesso: 99,
      viewsMedia: 'Novo Tema',
      engajamento: 'Calibrado por Você',
      cor: '#E55A2B',
      icone: 'sparkles'
    });

    localStorage.setItem('tomada_planejamento_temas_personalizados', JSON.stringify(this.temasPersonalizados));

    // Definir como filtro ativo
    this.filtroTemaAtual = titulo;
    this.filtroTemaDescricao = descricao;
    this.sugestoesCache = null;

    Components.closeModal();
    if (typeof Components !== 'undefined') Components.toast(`✨ Tema "${titulo}" criado! 30 sugestões personalizadas geradas a partir do seu tema.`, 'success');
    this.carregarSugestoesCanal();
  },

  mudarPaginaSugestoes(novaPagina) {
    const allSugs = this.sugestoesList || [];
    const perPage = this.itensPorPaginaSugestoes || 30;
    const totalPages = Math.ceil(allSugs.length / perPage) || 1;
    if (novaPagina < 1 || novaPagina > totalPages) return;
    this.paginaAtualSugestoes = novaPagina;
    this.render();
    // Scroll suave até o topo da seção de ideias
    setTimeout(() => {
      const section = document.querySelector('.cascade-item [data-lucide="video"]');
      if (section) section.closest('.cascade-item').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  },

  editarTituloSugestao(sugId) {
    const sug = this._findSugestao(sugId);
    if (!sug) return;

    const modalHTML = `
      <form id="form-editar-titulo-sug" onsubmit="event.preventDefault(); Planejamento.confirmarEditarTituloSugestao('${sug.id}');" class="premium-desktop-form">
        
        <div style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.2); border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(229, 90, 43, 0.15); color: var(--ref-primary, #E55A2B); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i data-lucide="pencil" style="width: 18px; height: 18px;"></i>
          </div>
          <div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: 'Outfit', sans-serif;">Editar Título da Ideia</h4>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--ref-text-sub, #64748B);">Personalize o título gerado pela IA para se adequar melhor ao seu estilo.</p>
          </div>
        </div>

        <div class="p-bento-container" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="p-bento-card">
            <h4 class="p-bento-title"><i data-lucide="type"></i> Novo Título</h4>
            <div class="p-form-group" style="margin-bottom: 0;">
              <label>Título do vídeo *</label>
              <input type="text" id="modal-editar-titulo-sug" class="p-input" value="${sug.titulo.replace(/"/g, '&quot;')}" required style="font-size: 15px; font-weight: 700;">
            </div>
          </div>
        </div>
      </form>
    `;

    const actionsHTML = `
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="submit" form="form-editar-titulo-sug" class="btn-premium-primary">
        <i data-lucide="check" style="width: 15px; height: 15px;"></i> Salvar Título
      </button>
    `;

    Components.showModal('Editar Título da Ideia', modalHTML, actionsHTML, 'premium-task-modal');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Focus no input
    setTimeout(() => {
      const input = document.getElementById('modal-editar-titulo-sug');
      if (input) { input.focus(); input.select(); }
    }, 200);
  },

  confirmarEditarTituloSugestao(sugId) {
    const input = document.getElementById('modal-editar-titulo-sug');
    if (!input) return;
    const novoTitulo = input.value.trim();
    if (!novoTitulo) return;

    const sug = this._findSugestao(sugId);
    if (sug) {
      sug.titulo = novoTitulo;
      // Atualizar no DOM diretamente para feedback instantâneo
      const titleEl = document.getElementById(`sug-title-${sugId}`);
      if (titleEl) titleEl.textContent = novoTitulo;
    }

    Components.closeModal();
    if (typeof Components !== 'undefined') Components.toast('✏️ Título atualizado com sucesso!', 'success');
  },

  async carregarSugestoesCanal() {
    this.loadingSugestoes = true;
    this.render();
    try {
      let url = '/api/youtube/canal-sugestoes';
      if (this.filtroTemaAtual) {
        url += `?customTheme=${encodeURIComponent(this.filtroTemaAtual)}`;
        if (this.filtroTemaDescricao) {
          url += `&customDesc=${encodeURIComponent(this.filtroTemaDescricao)}`;
        }
      }

      const data = await API.get(url, { bypassCache: true });
      if (data && data.success) {
        // Garantir que os temas personalizados do usuário fiquem sempre no topo
        const temasFormatados = (this.temasPersonalizados || []).map(tp => ({
          ...tp,
          taxaSucesso: tp.taxaSucesso || 99,
          viewsMedia: tp.viewsMedia || 'Novo Tema',
          engajamento: tp.engajamento || 'Calibrado por Você',
          cor: tp.cor || '#E55A2B',
          icone: tp.icone || 'sparkles'
        }));

        const temasUnificados = [...temasFormatados, ...(data.temas || [])];

        this.sugestoesCache = {
          _fromAPI: true,
          temasSucesso: temasUnificados,
          sugestoesList: data.sugestoes || [],
          musicasViraisNicho: [
            { titulo: 'Phonk Gaming & Speed Up Beats', artista: 'Phonk Creator Studio', tendencia: '+510% esta semana', ritmo: 'Energético / Gameplay', usoRecomendado: 'Shorts do seu canal', icone: 'disc' },
            { titulo: '8-Bit Retro Synthwave Gaming', artista: 'Pixel Soundtracks', tendencia: '+340% esta semana', ritmo: 'Nostálgico / Épico', usoRecomendado: 'Séries e Desafios Longos', icone: 'headphones' },
            { titulo: 'Lo-Fi Focus Beats', artista: 'Chill Creator Beats', tendencia: '+220% esta semana', ritmo: 'Foco / Fundo', usoRecomendado: 'Tutoriais e Análises', icone: 'radio' }
          ]
        };
        this.sugestoesCacheSeed = this.sugestaoSeed || 0;
        if (typeof Components !== 'undefined') Components.toast(`✨ ${data.sugestoes?.length || 0} sugestões geradas pela IA!`, 'success');
      } else {
        const msgErro = (data && data.error) ? data.error : 'Serviço de IA indisponível.';
        console.error('⚠️ [Sugestões IA Erro]:', msgErro);
        if (typeof Components !== 'undefined') {
          Components.toast(`❌ Falha da IA: ${msgErro}`, 'error');
        }
      }
    } catch (e) {
      console.error('Erro ao carregar sugestões do canal:', e);
      if (typeof Components !== 'undefined') {
        Components.toast(`❌ Erro ao conectar com a IA: ${e.message}`, 'error');
      }
    } finally {
      this.loadingSugestoes = false;
      this.render();
    }
  },

  atualizarSugestoesIA() {
    if (typeof Components !== 'undefined') Components.toast('🤖 IA analisando seu canal e gerando 30 novas sugestões personalizadas...', 'info');

    // Limpar cache e resetar paginação para forçar nova chamada à API
    this.sugestoesCache = null;
    this.sugestoesCacheSeed = -1;
    this.paginaAtualSugestoes = 1;

    // Chamar a API real para gerar novas sugestões
    this.carregarSugestoesCanal();
  },

  obterSugestoesDoNicho() {
    // Se o cache foi carregado pela API (carregarSugestoesCanal), retornar imediatamente sem sobreescrever
    if (this.sugestoesCache && this.sugestoesCache._fromAPI) {
      return this.sugestoesCache;
    }

    // Se já tivermos gerado para este ciclo (seed), reusar o cache do ciclo
    if (this.sugestoesCache && this.sugestoesCacheSeed === (this.sugestaoSeed || 0)) {
      return this.sugestoesCache;
    }

    const canal = this.canalInfo || {};

    // Pool amplo e variado de ideias de gameplay & desafios
    const poolGameplay = [
      {
        id: 'sug_game_valve',
        titulo: 'JOGUEI 1000 DIAS COMO A VALVE NO GAME DEV TYCOON E CRIEI O STEAM',
        gancho: 'Mostrar a receita de 100 Bilhões e o império da plataforma no dia 999 nos primeiros 3 segundos antes de voltar à garagem inicial no dia 1.',
        roteiro: '1. O começo humilde na garagem criando jogos casuais\n2. A transição para a era dos PC Games e motores próprios\n3. Lançamento do ecossistema de vendas e monopólio digital\n4. O resultado financeiro e o império no dia 1000.',
        formato: 'Vídeo Longo (15-20 min)',
        viewsEst: '500 - 1.2k views',
        matchPercent: 99,
        motivoIA: 'Seus vídeos de 1000 Dias em Game Dev Tycoon tiveram 51% de retenção média no seu canal.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_mods',
        titulo: 'EU JOGUEI 5000 DIAS NO GAME DEV TYCOON COM OS MODS MAIS PROIBIDOS',
        gancho: '"Se você ativar esse mod de estúdio infinito, o jogo quebra a economia em menos de 10 segundos!"',
        roteiro: '1. Instalação e explicação dos mods insanos da comunidade\n2. Criando o jogo com nota 11/10 perfeita\n3. A reação dos fãs e o colapso dos servidores no jogo.',
        formato: 'Gameplay / Mods',
        viewsEst: '450 - 900 views',
        matchPercent: 96,
        motivoIA: 'Seu vídeo de 5000 Dias com Mods foi o segundo vídeo mais assistido do seu canal Tomada.',
        nichoTag: 'Mods & Tycoon',
        thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_bitlife',
        titulo: 'JOGUEI 1000 DIAS TENTANDO ME TORNAR O MAIOR BILIONÁRIO NO BITLIFE',
        gancho: 'Mostrar o saldo bancário trilionário do personagem velhinho antes de mostrar o nascimento do bebê no dia 1.',
        roteiro: '1. A estratégia da herança e investimentos imobiliários\n2. Carreira de astro do cinema e influencer\n3. Evitando escândalos e acumulando a maior fortuna.',
        formato: 'Desafio BitLife',
        viewsEst: '300 - 700 views',
        matchPercent: 94,
        motivoIA: 'Seu vídeo de BitLife Influencer teve taxa de cliques (CTR) de 12.8% no público do canal.',
        nichoTag: 'BitLife Gameplay',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_mmorpg',
        titulo: 'CRIANDO O MAIOR MMORPG DA HISTÓRIA COM R$ 0 NO GAME DEV TYCOON',
        gancho: 'Mostrar o gráfico de vendas disparando com milhões de jogadores online ao vivo no dia de lançamento do servidor.',
        roteiro: '1. A aposta de risco abrindo mão de jogos menores\n2. Alugando servidores de alta capacidade e contratando devs\n3. O dia da estreia e o estouro de vendas do MMORPG.',
        formato: 'Vídeo Longo (12-16 min)',
        viewsEst: '600 - 1.4k views',
        matchPercent: 97,
        motivoIA: 'Ideias de simulação de grandes lançamentos possuem 48% mais engajamento em comentários.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_console',
        titulo: 'JOGUEI 1000 DIAS CRIANDO O MELHOR CONSOLE DE TODOS OS TEMPOS',
        gancho: 'Mostrar a guerra de consoles contra a Sony e Microsoft no Game Dev Tycoon com 80% do mercado dominado.',
        roteiro: '1. O departamento de pesquisa de hardware secreto\n2. Projetando o controle revolucionário e gráficos 4K\n3. Lançamento global e aniquilação dos concorrentes.',
        formato: 'Desafio / Tycoon',
        viewsEst: '550 - 1.1k views',
        matchPercent: 95,
        motivoIA: 'Desafios de Guerra de Consoles em Tycoon são os tópicos mais buscados no YouTube em 2026.',
        nichoTag: 'Desafios 1000 a 5000 Dias',
        thumb: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_crise',
        titulo: 'SOBREVIVI 1000 DIAS NA PIOR CRISE FINANCEIRA DO GAME DEV TYCOON',
        gancho: 'O estúdio com R$ -500.000 em dívidas no dia 300 e a virada histórica para R$ 10 Milhões no dia 999.',
        roteiro: '1. O colapso financeiro após um jogo fracassado\n2. Demitindo funcionários e pegando empréstimos desesperados\n3. O jogo indie milagroso que salvou a empresa da falência.',
        formato: 'Sobrevivência / Desafio',
        viewsEst: '480 - 950 views',
        matchPercent: 93,
        motivoIA: 'Vídeos com ganchos de recuperação financeira têm retenção de até 62% no meio do vídeo.',
        nichoTag: 'Desafios 1000 a 5000 Dias',
        thumb: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_politico',
        titulo: 'JOGUEI 1000 DIAS COMO POLÍTICO E PRESIDENTE NO BITLIFE',
        gancho: 'Gastar 1 Bilhão de dólares na campanha presidencial do BitLife e aprovar leis inacreditáveis.',
        roteiro: '1. Da faculdade de direito ao cargo de prefeito\n2. Campanhas milionárias e escândalos políticos\n3. Vitória na eleição presidencial e governando a nação.',
        formato: 'BitLife Desafio',
        viewsEst: '400 - 850 views',
        matchPercent: 91,
        motivoIA: 'Vídeos de carreiras inusitadas no BitLife possuem CTR de 11.5% no público jovem.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_falir_nintendo',
        titulo: 'TENTANDO FALIR A MAIOR EMPRESA NO GAME DEV TYCOON EM 100 DIAS',
        gancho: 'Mostrar o gráfico da gigante rival caindo para 0% de fatia de mercado enquanto lançamos jogos idênticos por metade do preço.',
        roteiro: '1. Mapeando os lançamentos da empresa rival\n2. Lançando clones melhorados na mesma semana\n3. A falência total da rival e nossa vitória de mercado.',
        formato: 'Desafio Rápido (10 min)',
        viewsEst: '520 - 1.3k views',
        matchPercent: 98,
        motivoIA: 'Vídeos com títulos provocativos de falência geram 3x mais compartilhamentos.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_mafia_bitlife',
        titulo: 'JOGUEI 1000 DIAS COMO CHEFE DA MÁFIA NO BITLIFE E DOMINEI A CIDADE',
        gancho: 'Acumular R$ 500 Milhões em extorsões e roubos perfeitos sem ser pego pela polícia nenhuma vez.',
        roteiro: '1. Entrando para a família criminosa na infância\n2. Subindo na hierarquia e eliminando rivais\n3. Tornando-se o Godfather supremo do BitLife.',
        formato: 'BitLife Máfia',
        viewsEst: '490 - 980 views',
        matchPercent: 95,
        motivoIA: 'Conteúdos da expansão de Máfia do BitLife têm engajamento acima da média no canal.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_100_mods',
        titulo: 'TESTEI OS 10 MODS MAIS BIZARROS E QUEBRADOS DO GAME DEV TYCOON',
        gancho: 'Ativar o mod de IA geradora de jogos ao vivo que cria 100 jogos por segundo travando a tela.',
        roteiro: '1. Apresentando os 5 mods visuais mais loucos\n2. Testando o mod que libera consoles futuristas\n3. O mod final que corrompe os gráficos do estúdio.',
        formato: 'Gameplay Curta (8-10 min)',
        viewsEst: '620 - 1.5k views',
        matchPercent: 96,
        motivoIA: 'Vídeos de compilação de mods têm retenção média de 58% no nicho de gameplay.',
        nichoTag: 'Mods Insanos',
        thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_5000_bitlife',
        titulo: 'JOGUEI 5000 DIAS ATRAVESSANDO 10 GERAÇÕES DA MESMA FAMÍLIA NO BITLIFE',
        gancho: 'Mostrar a árvore genealógica de 300 anos com um império de R$ 5 Bilhões passado de pai para filho.',
        roteiro: '1. A primeira geração humilde e o começo do fundo imobiliário\n2. Passando o bastão para a 5ª geração com mansões e jatos\n3. O legado final de 5000 dias e 10 gerações.',
        formato: 'Série Especial (25 min)',
        viewsEst: '700 - 1.8k views',
        matchPercent: 99,
        motivoIA: 'Desafios de gerações no BitLife têm alta taxa de maratona (watch time).',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_goty_zero',
        titulo: 'GANHEI O GAME OF THE YEAR CRIANDO SÓ JOGOS DE TERROR NO GAME DEV TYCOON',
        gancho: 'Mostrar o troféu GOTY brilhando no palco do jogo após lançar uma sequência assustadora nota 10.',
        roteiro: '1. O nicho exclusivo de terror psicológico\n2. Pesquisando a tecnologia de som 3D e gráficos escuros\n3. Vencendo o maior prêmio da indústria no Game Dev Tycoon.',
        formato: 'Desafio GOTY',
        viewsEst: '440 - 910 views',
        matchPercent: 92,
        motivoIA: 'Focar em gêneros específicos de jogos em Tycoon atrai público fiel de gameplay.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_speedrun',
        titulo: 'TENTEI ZERAR O GAME DEV TYCOON EM MENOS DE 30 MINUTOS (SPEEDRUN IMPOSSÍVEL)',
        gancho: '"Será que é possível criar o jogo perfeito e dominar a indústria inteira em menos de meia hora?"',
        roteiro: '1. As regras do speedrun e estratégia inicial\n2. Pular etapas e arriscar tudo em AAA\n3. O resultado final e comparação com speedrunners mundiais.',
        formato: 'Speedrun (12 min)',
        viewsEst: '800 - 2k views',
        matchPercent: 97,
        motivoIA: 'Speedruns em Tycoon estão com CTR 4.2x maior que a média do nicho esta semana. Formato altamente compartilhável.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_falencia',
        titulo: 'FIZ TUDO ERRADO DE PROPÓSITO NO GAME DEV TYCOON E OLHA O QUE ACONTECEU',
        gancho: 'Mostrar a tela de falência total com dívida absurda nos primeiros 2 segundos, gerando curiosidade imediata.',
        roteiro: '1. A estratégia reversa: fazer tudo errado\n2. Lançar jogos terríveis e ignorar tendências\n3. O resultado hilariantemente catastrófico.',
        formato: 'Gameplay Reverso',
        viewsEst: '1.2k - 3k views',
        matchPercent: 96,
        motivoIA: 'Vídeos de "fazer tudo errado" geram 78% mais comentários e debate que vídeos normais. Altíssimo engajamento.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_coop',
        titulo: 'JOGUEI GAME DEV TYCOON COM MEU AMIGO E CRIAMOS O MAIOR ESTÚDIO DO MUNDO',
        gancho: '"Dois cérebros, uma empresa: assistam como dominamos a indústria de jogos juntos!"',
        roteiro: '1. A estratégia de divisão de tarefas\n2. Cada um cuida de um departamento\n3. O lançamento do jogo definitivo e o resultado final.',
        formato: 'Gameplay Co-op',
        viewsEst: '650 - 1.5k views',
        matchPercent: 95,
        motivoIA: 'Collabs e co-ops têm alcance 2.3x maior no algoritmo do YouTube. Ideal para crescimento de audiência.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_rich',
        titulo: 'DE MENDIGO A BILIONÁRIO: 100 DIAS DE VIDA REAL NO BITLIFE',
        gancho: 'Mostrar a mansão, iate e o saldo de 10 bilhões antes de mostrar o personagem nascendo na pobreza.',
        roteiro: '1. Estratégia de carreira e investimentos desde o dia 1\n2. Casamento estratégico e herança familiar\n3. O caminho até o primeiro bilhão e o império final.',
        formato: 'Desafio 100 Dias',
        viewsEst: '900 - 2.5k views',
        matchPercent: 98,
        motivoIA: 'Narrativas rags-to-riches têm retenção 62% acima da média. O gancho de transformação prende o espectador até o final.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_serial',
        titulo: 'VIREI O MAIOR SERIAL KILLER DA HISTÓRIA NO BITLIFE (DEU MUITO ERRADO)',
        gancho: '"A polícia NUNCA me pegou... até o momento que cometi o erro mais estúpido possível!"',
        roteiro: '1. A vida dupla: cidadão exemplar de dia\n2. Os crimes perfeitos e a escalada\n3. A captura dramática e a sentença final.',
        formato: 'Shorts (60s)',
        viewsEst: '2k - 5k views',
        matchPercent: 97,
        motivoIA: 'Shorts de BitLife com narrativa de crime têm taxa de compartilhamento 5x acima da média. Viralidade extrema em Shorts.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_indie',
        titulo: 'CRIEI UM JOGO INDIE SOLO E ELE VENDEU 10 MILHÕES DE CÓPIAS NO GAME DEV TYCOON',
        gancho: 'O gráfico de vendas explodindo na tela nos primeiros 3 segundos antes de voltar ao início.',
        roteiro: '1. A decisão de ser desenvolvedor solo\n2. Escolhendo o gênero perfeito e investindo em marketing\n3. O lançamento viral e a surpresa das vendas.',
        formato: 'Vídeo Longo (18 min)',
        viewsEst: '500 - 1.2k views',
        matchPercent: 94,
        motivoIA: 'Histórias de sucesso indie são aspiracionais e geram 45% mais salvamentos. Conteúdo evergreen de alto valor.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_apocalipse',
        titulo: 'SOBREVIVI 1000 DIAS NO APOCALIPSE ZUMBI DO BITLIFE',
        gancho: '"No dia 999 eu tinha TUDO... e perdi tudo em 3 segundos por causa de UM erro!"',
        roteiro: '1. As primeiras decisões de sobrevivência\n2. Construindo um abrigo e encontrando aliados\n3. A horda final e o desfecho surpreendente.',
        formato: 'Série de Sobrevivência',
        viewsEst: '1.5k - 4k views',
        matchPercent: 96,
        motivoIA: 'Conteúdo de sobrevivência tem watch time 3x maior. O gancho de "perder tudo" gera cliques compulsivos.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_escola',
        titulo: 'FIZ UM JOGO NA ESCOLA E VENDI POR 1 BILHÃO NO GAME DEV TYCOON',
        gancho: 'Mostrar o cheque de 1 bilhão sendo aceito antes de mostrar o garoto na escola criando o primeiro jogo.',
        roteiro: '1. O primeiro jogo feito no intervalo das aulas\n2. A transição de hobby para empresa\n3. O marco do primeiro bilhão e o império.',
        formato: 'Storytelling (14 min)',
        viewsEst: '600 - 1.4k views',
        matchPercent: 93,
        motivoIA: 'Narrativas de "jovem prodígio" são altamente compartilháveis entre o público 13-24 anos (seu público-alvo).',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_ranking',
        titulo: 'RANKING: OS 10 JOGOS MAIS LUCRATIVOS QUE EU JÁ FIZ NO GAME DEV TYCOON',
        gancho: '"O jogo nº1 vendeu 500 MILHÕES de cópias... e eu quase não lancei ele!"',
        roteiro: '1. Contagem regressiva do 10 ao 1\n2. Análise de cada decisão de design e marketing\n3. O jogo campeão e por que ele viralizou.',
        formato: 'Listicle / Top 10',
        viewsEst: '800 - 2k views',
        matchPercent: 95,
        motivoIA: 'Rankings e Top 10 têm CTR 55% maior que outros formatos. O suspense do nº1 mantém o watch time alto.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_royal',
        titulo: 'VIREI REI DA INGLATERRA E DOMINEI O MUNDO INTEIRO NO BITLIFE',
        gancho: 'O mapa todo pintado de vermelho com o império britânico dominando nos primeiros 2 segundos.',
        roteiro: '1. Nascendo na família real britânica\n2. Assassinatos políticos e alianças\n3. A coroação e a conquista global.',
        formato: 'Gameplay Épico (20 min)',
        viewsEst: '1k - 2.5k views',
        matchPercent: 97,
        motivoIA: 'Conteúdo de poder e dominação mundial tem engajamento emocional 3.8x maior. Gera debates nos comentários.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_100jogos',
        titulo: 'CRIEI 100 JOGOS EM 100 DIAS NO GAME DEV TYCOON (DESAFIO IMPOSSÍVEL)',
        gancho: '"1 jogo por dia. 100 dias. Zero descanso. O resultado é INSANO."',
        roteiro: '1. O desafio: regras e limitações\n2. Os jogos mais loucos e criativos\n3. Quais vingaram e quais floparam. O resultado final.',
        formato: 'Desafio 100 Dias (22 min)',
        viewsEst: '700 - 1.8k views',
        matchPercent: 99,
        motivoIA: 'Desafios de "100 dias" são os formatos com maior retenção no nicho gaming (68% watch time). Formato comprovado viral.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_prison',
        titulo: 'FUI PRESO INJUSTAMENTE E FUGI DA PRISÃO NO BITLIFE (FUGA IMPOSSÍVEL)',
        gancho: '"Me prenderam por um crime que eu NÃO cometi... e eu cavei um túnel por 15 anos para fugir!"',
        roteiro: '1. O crime e a condenação injusta\n2. Os planos de fuga fracassados\n3. A fuga épica e a vida depois da prisão.',
        formato: 'Shorts (45s)',
        viewsEst: '3k - 8k views',
        matchPercent: 98,
        motivoIA: 'Histórias de fuga da prisão têm viralidade máxima em Shorts. Taxa de replay 4.5x acima da média do canal.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_ea',
        titulo: 'JOGUEI 1000 DIAS COMO A EA E DESTRUÍ A INDÚSTRIA COM MICROTRANSAÇÕES',
        gancho: 'Mostrar a avaliação de 1 estrela dos jogadores furiosos antes de revelar a receita recorde.',
        roteiro: '1. A estratégia de DLCs e loot boxes\n2. Jogadores revoltados mas gastando\n3. O ponto de ruptura: falência ou domínio?',
        formato: 'Gameplay Tycoon (16 min)',
        viewsEst: '900 - 2.2k views',
        matchPercent: 96,
        motivoIA: 'Conteúdo polêmico sobre EA e microtransações gera 6x mais comentários. Algoritmo favorece vídeos com debate.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_casal',
        titulo: 'JOGUEI BITLIFE COM MINHA NAMORADA E ELA ME TRAIU NO JOGO (caos)',
        gancho: '"Ela prometeu que seria fiel... mas no dia 47 eu descobri TUDO."',
        roteiro: '1. As regras: cada um controla um personagem casado\n2. As decisões secretas e traições\n3. O confronto final e o divórcio épico.',
        formato: 'Collab / Reação (13 min)',
        viewsEst: '1.5k - 4k views',
        matchPercent: 97,
        motivoIA: 'Vídeos de casal jogando juntos têm alcance orgânico 3x maior. Alta taxa de compartilhamento entre casais gamers.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_horror_tycoon',
        titulo: 'CRIEI A EMPRESA DE JOGOS MAIS ASSUSTADORA DO MUNDO NO GAME DEV TYCOON',
        gancho: 'O jumpscare no trailer do jogo fazendo todo mundo gritar antes de revelar a nota 10.',
        roteiro: '1. Foco exclusivo em jogos de terror\n2. Investindo em motor gráfico de medo\n3. O lançamento que assustou a indústria inteira.',
        formato: 'Gameplay Temático (15 min)',
        viewsEst: '550 - 1.3k views',
        matchPercent: 93,
        motivoIA: 'Terror + Tycoon é um nicho inexplorado com potencial de first-mover advantage. Baixa concorrência, alto interesse.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_only_mobile',
        titulo: 'JOGUEI 1000 DIAS SÓ FAZENDO JOGOS DE CELULAR NO GAME DEV TYCOON',
        gancho: '"Jogos de celular são lixo? Eu provei que NÃO com um bilhão em vendas!"',
        roteiro: '1. A estratégia mobile-first\n2. Casual games vs jogos premium\n3. O resultado: empresa mobile mais lucrativa.',
        formato: 'Vídeo Longo (17 min)',
        viewsEst: '450 - 1.1k views',
        matchPercent: 91,
        motivoIA: 'Nichos específicos dentro de Tycoon atraem público-alvo fiel que assiste 100% do vídeo. Watch time elevado.',
        nichoTag: 'Game Dev Tycoon',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'sug_game_ditador',
        titulo: 'ME TORNEI O DITADOR MAIS CRUEL DO MUNDO NO BITLIFE E NINGUÉM CONSEGUIU ME PARAR',
        gancho: '"Eu controlei um país inteiro por 60 anos... e a revolução NUNCA veio."',
        roteiro: '1. Nascendo em família política\n2. Golpe de estado e ascensão ao poder\n3. Décadas de tirania e o legado final.',
        formato: 'Gameplay Político (18 min)',
        viewsEst: '1.2k - 3.5k views',
        matchPercent: 96,
        motivoIA: 'Gameplay político tem taxa de comentários 4x acima da média. O algoritmo prioriza vídeos com alta interação.',
        nichoTag: 'BitLife & Desafios de Vida',
        thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80'
      }
    ];

    // Se houver um filtro de tema ativado pelo usuário
    let poolFiltrado = poolGameplay;
    if (this.filtroTemaAtual) {
      const termo = this.filtroTemaAtual.toLowerCase();
      const filtrados = poolGameplay.filter(s => 
        (s.nichoTag && s.nichoTag.toLowerCase().includes(termo)) || 
        (s.titulo && s.titulo.toLowerCase().includes(termo)) ||
        (this.filtroTemaDescricao && s.gancho && s.gancho.toLowerCase().includes(termo))
      );
      if (filtrados.length > 0) {
        poolFiltrado = filtrados;
      }
    }

    // Rotacionar para garantir 30 IDEIAS POR REQUISIÇÃO (alto potencial viral)
    const seed = this.sugestaoSeed || 0;
    const startIndex = (seed * 7) % poolFiltrado.length;
    
    let selecionados = [];
    for (let i = 0; i < 30; i++) {
      const idx = (startIndex + i) % poolFiltrado.length;
      selecionados.push({ ...poolFiltrado[idx] });
    }

    // Não há mais temas hardcoded: sempre busca da API (dados reais do canal)
    // Se ainda não temos cache da API, dispara a carga e retorna loading state
    if (!this._loadingFromObterSugestoes) {
      this._loadingFromObterSugestoes = true;
      this.carregarSugestoesCanal().finally(() => { this._loadingFromObterSugestoes = false; });
    }

    // Enquanto carrega, retorna temas personalizados (se existirem) + placeholder vazio
    const todosTemas = [...(this.temasPersonalizados || [])];

    const resultado = {
      temasSucesso: todosTemas,

      sugestoesList: selecionados,
      musicasViraisNicho: [
        { titulo: 'Phonk Gaming & Speed Up Beats', artista: 'Phonk Creator Studio', tendencia: '+510% esta semana', ritmo: 'Energético / Gameplay', usoRecomendado: 'Shorts de Game Dev & BitLife', icone: 'disc' },
        { titulo: '8-Bit Retro Synthwave Gaming', artista: 'Pixel Soundtracks', tendencia: '+340% esta semana', ritmo: 'Nostálgico / Tycoon', usoRecomendado: 'Séries de 1000 Dias & Estratégia', icone: 'headphones' },
        { titulo: 'Lo-Fi Gaming & Coding Focus', artista: 'Chill Gamer Beats', tendencia: '+220% esta semana', ritmo: 'Foco / Fundo', usoRecomendado: 'Tutoriais de Mods & Gameplays Longas', icone: 'radio' }
      ]
    };

    this.sugestoesCache = resultado;
    this.sugestoesCacheSeed = seed;

    return resultado;
  },

  renderSugestoesViewHTML() {
    const canal = this.canalInfo;

    const bannerHTML = canal ? `
        <!-- HERO BANNER BENTO ESCURO (Compacto) -->
        <div class="cascade-item" style="--index: 1; background: #181714; border-radius: 20px; border: 1px solid #2D2A24; padding: 20px 26px; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 10px 28px rgba(0,0,0,0.18); position: relative; overflow: hidden; flex-wrap: wrap;">
          
          <!-- Elemento Gráfico de Fundo Ondulado Minimalista (Onda SVG) -->
          <svg style="position: absolute; right: -20px; bottom: -30px; opacity: 0.12; width: 320px; height: 180px; pointer-events: none;" viewBox="0 0 400 200" fill="none">
            <path d="M0,100 C150,200 250,0 400,100" stroke="#FFFFFF" stroke-width="6" />
            <path d="M0,140 C150,240 250,40 400,140" stroke="#E55A2B" stroke-width="8" />
          </svg>

          <!-- Conteúdo Esquerda: Canal Conectado + Status IA -->
          <div style="display: flex; align-items: center; gap: 16px; z-index: 2; position: relative;">
            <div style="width: 54px; height: 54px; border-radius: 50%; overflow: hidden; background: #181714; border: 2.5px solid var(--ref-primary, #E55A2B); flex-shrink: 0; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.4);">
              <img src="${canal.avatar}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                <span style="background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; letter-spacing: 0.5px; text-transform: uppercase;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981; display: inline-block;"></span> YOUTUBE API CONECTADA
                </span>
                <span style="color: #94A3B8; font-size: 12px; font-weight: 600;">• ${canal.subscribers}</span>
              </div>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif; letter-spacing: -0.4px; line-height: 1.2;">
                Sugestões Estratégicas para <span style="color: var(--ref-primary, #E55A2B);">${canal.nome}</span>
              </h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #A1A1AA; font-weight: 500;">
                30 ideias por requisição calibradas com base na audiência real do seu canal
              </p>
            </div>
          </div>

          <!-- Conteúdo Direita: Ações Principais -->
          <div style="display: flex; gap: 10px; align-items: center; z-index: 2; position: relative;">
            <button type="button" onclick="Planejamento.atualizarSugestoesIA()" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 12px; padding: 10px 18px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.35); transition: all 0.2s ease;">
              <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> Recalibrar
            </button>
            <a href="#" onclick="event.preventDefault(); window.open('/api/youtube/auth?token=' + encodeURIComponent(localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || ''), '_blank');" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #FFFFFF; border-radius: 12px; padding: 10px 16px; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; backdrop-filter: blur(4px); transition: all 0.2s ease;">
              <i data-lucide="refresh-cw" style="width: 14px; height: 14px; color: var(--ref-primary, #E55A2B);"></i> Trocar Canal
            </a>
            <button onclick="Planejamento.desconectarCanal(event)" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #EF4444; border-radius: 12px; padding: 10px 16px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
              <i data-lucide="power" style="width: 14px; height: 14px;"></i> Desconectar
            </button>
          </div>
        </div>
    ` : `
        <!-- HERO BANNER DISCONNECTED -->
        <div class="cascade-item" style="--index: 1; background: #181714; border-radius: 20px; border: 1px solid #2D2A24; padding: 20px 26px; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 10px 28px rgba(0,0,0,0.18); position: relative; overflow: hidden; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 16px; z-index: 2; position: relative;">
            <div style="width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(229, 90, 43, 0.12); border: 1.5px dashed var(--ref-primary, #E55A2B); flex-shrink: 0;">
              <i data-lucide="youtube" style="width: 26px; height: 26px; color: var(--ref-primary, #E55A2B);"></i>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif; letter-spacing: -0.4px; line-height: 1.2;">
                Nenhum Canal Vinculado
              </h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #A1A1AA; font-weight: 500;">
                Vincule seu canal do YouTube para habilitar sugestões personalizadas e análises estratégicas calibradas.
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; z-index: 2; position: relative;">
            <a href="#" onclick="event.preventDefault(); window.open('/api/youtube/auth?token=' + encodeURIComponent(localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || ''), '_blank');" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 12px; padding: 10px 18px; font-size: 12px; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.35); transition: all 0.2s ease;">
              <i data-lucide="link" style="width: 15px; height: 15px;"></i> Conectar Canal
            </a>
          </div>
        </div>
    `;

    if (this.loadingSugestoes) {
      return `
        <div class="ref-rec-wrapper" style="padding: 16px 20px 40px 20px; display: flex; flex-direction: column; gap: 24px; width: 100%; max-width: 100%; box-sizing: border-box; font-family: var(--font-main, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);">
          ${bannerHTML}
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; background: #181714; border: 1px solid #2D2A24; border-radius: 24px; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <div style="width: 50px; height: 50px; border: 4px solid rgba(229, 90, 43, 0.1); border-top-color: var(--ref-primary, #E55A2B); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
            <h4 style="margin: 0; font-size: 16px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit';">Analisando canal e gerando sugestões sob medida...</h4>
            <p style="margin: 0; font-size: 12px; color: #A1A1AA; font-weight: 500; text-align: center; max-width: 380px;">
              A IA do Tomada está processando a identidade do canal "${canal ? canal.nome : 'Criador'}" e gerando temas de sucesso e ideias inéditas.
            </p>
          </div>
        </div>
      `;
    }

    const dadosNicho = this.obterSugestoesDoNicho();
    const temasSucesso = dadosNicho.temasSucesso;
    const sugestoesList = dadosNicho.sugestoesList;
    const musicasViraisNicho = dadosNicho.musicasViraisNicho;

    this.sugestoesList = sugestoesList;

    return `
      <div class="ref-rec-wrapper" style="padding: 16px 20px 40px 20px; display: flex; flex-direction: column; gap: 24px; width: 100%; max-width: 100%; box-sizing: border-box; font-family: var(--font-main, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);">
        
        ${bannerHTML}

        <!-- SEÇÃO 1: TEMAS DE MAIOR DESEMPENHO NO SEU CANAL -->
        <div class="cascade-item" style="--index: 2;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 30px; height: 30px; border-radius: 8px; background: rgba(229, 90, 43, 0.12); color: var(--ref-primary); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="target" style="width: 16px; height: 16px;"></i>
                </div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: 'Outfit', sans-serif;">Temas de Desempenho</h3>
              </div>

              <!-- Switcher de Abas no Padrão do Sistema (Recomendados vs Personalizados) -->
              <div style="display: inline-flex; background: #F1ECE8; border-radius: 9999px; padding: 3px; gap: 2px;">
                <button type="button" onclick="Planejamento.setAbaTemas('recomendados')" style="background: ${this.abaTemasAtiva !== 'personalizados' ? '#FFFFFF' : 'transparent'}; color: ${this.abaTemasAtiva !== 'personalizados' ? 'var(--ref-text, #1C1A14)' : '#64748B'}; border: none; border-radius: 9999px; padding: 4px 14px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; box-shadow: ${this.abaTemasAtiva !== 'personalizados' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'}; font-family: inherit;">
                  🎯 Recomendados do Canal
                </button>
                <button type="button" onclick="Planejamento.setAbaTemas('personalizados')" style="background: ${this.abaTemasAtiva === 'personalizados' ? 'var(--ref-primary, #E55A2B)' : 'transparent'}; color: ${this.abaTemasAtiva === 'personalizados' ? '#FFFFFF' : '#64748B'}; border: none; border-radius: 9999px; padding: 4px 14px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; box-shadow: ${this.abaTemasAtiva === 'personalizados' ? '0 2px 8px rgba(229,90,43,0.3)' : 'none'}; font-family: inherit;">
                  ✨ Meus Temas Personalizados (${(this.temasPersonalizados || []).length})
                </button>
              </div>
            </div>
            
            <button type="button" onclick="Planejamento.openModalCriarTemaPersonalizado()" style="background: rgba(229, 90, 43, 0.08); border: 1.5px solid rgba(229, 90, 43, 0.25); color: var(--ref-primary, #E55A2B); border-radius: 12px; padding: 7px 14px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
              <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i> + Criar Novo Tema para IA
            </button>
          </div>

          ${(() => {
            let temasExibidos = [];
            if (this.abaTemasAtiva === 'personalizados') {
              temasExibidos = (this.temasPersonalizados || []).map(tp => ({
                ...tp,
                taxaSucesso: tp.taxaSucesso || 99,
                viewsMedia: tp.viewsMedia || 'Novo Tema',
                engajamento: tp.engajamento || 'Calibrado por Você',
                cor: tp.cor || '#E55A2B',
                icone: tp.icone || 'sparkles'
              }));
            } else {
              temasExibidos = temasSucesso.filter(t => !this.temasPersonalizados?.some(tp => tp.titulo === t.titulo));
              if (temasExibidos.length === 0) temasExibidos = temasSucesso;
            }

            if (temasExibidos.length === 0) {
              return `
                <div style="background: #FFFFFF; border: 1.5px dashed #EBE5DF; border-radius: 20px; padding: 32px 20px; text-align: center;">
                  <i data-lucide="sparkles" style="width: 32px; height: 32px; color: var(--ref-primary); margin-bottom: 8px;"></i>
                  <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: #1C1A14;">Nenhum tema personalizado criado ainda</h4>
                  <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748B;">Clique no botão abaixo para criar um tema personalizado e calibrar 30 ideias com a IA.</p>
                  <button type="button" onclick="Planejamento.openModalCriarTemaPersonalizado()" style="background: var(--ref-primary); color: #FFFFFF; border: none; border-radius: 12px; padding: 8px 18px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                    <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i> + Criar Primeiro Tema
                  </button>
                </div>
              `;
            }

            return `
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
                ${temasExibidos.map((t, idx) => {
                  const bgStyles = [
                    'background: #FFFFFF; border: 1px solid #EBE5DF; color: #1C1A14;',
                    'background: linear-gradient(135deg, #FF5E36 0%, #E55A2B 100%); color: #FFFFFF; border: none;',
                    'background: #141414; border: 1px solid #282828; color: #FFFFFF;',
                    'background: #FBF9F6; border: 1px solid #EBE5DF; color: #1C1A14;'
                  ];
                  const cardBg = bgStyles[idx % 4];
                  const isDarkOrGrad = (idx % 4 === 1 || idx % 4 === 2);
                  const pillBg = isDarkOrGrad ? 'background: rgba(255, 255, 255, 0.22); color: #FFFFFF;' : 'background: #181714; color: #FFFFFF;';
                  const iconCircleBg = isDarkOrGrad ? 'background: #FFFFFF; color: #E55A2B;' : 'background: #FFFFFF; color: #181714;';

                  return `
                    <div class="cascade-item" style="--index: ${idx + 3}; ${cardBg} border-radius: 24px; padding: 20px 22px; min-height: 165px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.05); position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                      <div style="position: absolute; right: -10px; bottom: -10px; opacity: 0.15; pointer-events: none;">
                        <i data-lucide="${t.icone || 'sparkles'}" style="width: 100px; height: 100px;"></i>
                      </div>
                      <div style="z-index: 2;">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;">
                          <div style="width: 34px; height: 34px; border-radius: 12px; ${isDarkOrGrad ? 'background: rgba(255,255,255,0.2); color: #FFFFFF;' : 'background: rgba(229, 90, 43, 0.1); color: var(--ref-primary);'} display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="${t.icone || 'sparkles'}" style="width: 18px; height: 18px;"></i>
                          </div>
                          <span style="${isDarkOrGrad ? 'background: rgba(255,255,255,0.25); color: #FFFFFF;' : 'background: rgba(16, 185, 129, 0.12); color: #059669;'} padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800;">
                            ${t.taxaSucesso}% Eficiência
                          </span>
                        </div>
                        <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; font-family: 'Outfit', sans-serif; line-height: 1.25; color: ${isDarkOrGrad ? '#FFFFFF' : '#1C1A14'} !important;">${t.titulo}</h4>
                        <p style="margin: 0; font-size: 11px; opacity: 0.85; font-weight: 500;">
                          Média: <strong>${t.viewsMedia}</strong> • ${t.engajamento}
                        </p>
                      </div>

                      <div style="z-index: 2;">
                        <button type="button" onclick="Planejamento.filtrarSugestoesPorTema('${t.titulo.replace(/'/g, "\\'")}')" style="${pillBg} border-radius: 9999px; padding: 6px 14px 6px 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
                          <div style="width: 24px; height: 24px; border-radius: 50%; ${iconCircleBg} display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i data-lucide="arrow-up-right" style="width: 14px; height: 14px; stroke-width: 3;"></i>
                          </div>
                          SUGERIR MAIS DESTE TEMA
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          })()}
        </div>
        </div>

        <!-- SEÇÃO 2: IDEIAS DE VÍDEOS RECOMENDADAS (CARDS EXATOS DA IMAGEM DE REFERÊNCIA) -->
        <div class="cascade-item" style="--index: ${temasSucesso.length + 3};">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(229, 90, 43, 0.12); color: var(--ref-primary); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="video" style="width: 18px; height: 18px;"></i>
              </div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: 'Outfit', sans-serif;">
                Próximos Vídeos Recomendados (30 Ideias Calibradas por Categoria)
              </h3>
            </div>
            
            ${this.filtroTemaAtual ? `
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(229, 90, 43, 0.1); border: 1px solid rgba(229, 90, 43, 0.25); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; color: var(--ref-primary);">
                <span>Filtro Tema: "${this.filtroTemaAtual}"</span>
                <button type="button" onclick="Planejamento.limparFiltroTema()" style="background: none; border: none; color: var(--ref-primary); font-weight: 800; cursor: pointer; font-size: 12px; margin-left: 4px;">✕ Limpar</button>
              </div>
            ` : '<span style="font-size: 11px; color: var(--ref-text-sub, #64748B); font-weight: 700;">Exibindo 30 sugestões categorizadas por requisição</span>'}
          </div>

          ${(() => {
            const allSugs = this.sugestoesList || [];
            const perPage = this.itensPorPaginaSugestoes || 30;
            const totalPages = Math.ceil(allSugs.length / perPage) || 1;
            const curPage = Math.min(this.paginaAtualSugestoes || 1, totalPages);
            const startIdx = (curPage - 1) * perPage;
            const pageSugs = allSugs.slice(startIdx, startIdx + perPage);
            
            return `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 18px;">
            ${pageSugs.map((sug, idx) => {
              const globalIdx = startIdx + idx;
              const bgStyles = [
                'background: #FFFFFF; border: 1px solid #EBE5DF; color: #1C1A14;',
                'background: linear-gradient(135deg, #FF5E36 0%, #E55A2B 100%); color: #FFFFFF; border: none;',
                'background: #141414; border: 1px solid #282828; color: #FFFFFF;',
                'background: #FBF9F6; border: 1px solid #EBE5DF; color: #1C1A14;'
              ];
              const cardBg = bgStyles[globalIdx % 4];
              const isDarkOrGrad = (globalIdx % 4 === 1 || globalIdx % 4 === 2);
              const pillBg = isDarkOrGrad ? 'background: rgba(255, 255, 255, 0.22); color: #FFFFFF;' : 'background: #181714; color: #FFFFFF;';
              const iconCircleBg = isDarkOrGrad ? 'background: #FFFFFF; color: #E55A2B;' : 'background: #FFFFFF; color: #181714;';
              const subtextColor = isDarkOrGrad ? 'rgba(255, 255, 255, 0.85)' : '#64748B';
              const boxBorder = isDarkOrGrad ? 'rgba(255, 255, 255, 0.15)' : '#EBE5DF';

              return `
                <div class="cascade-item" onclick="Planejamento.abrirVisaoGeralSugestao('${sug.id}')" style="cursor: pointer; --index: ${temasSucesso.length + idx + 4}; ${sug.isCategoriaDestaque ? 'background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); border: 2px solid #818CF8; color: #FFFFFF;' : cardBg} border-radius: 24px; padding: 22px; min-height: 190px; display: flex; justify-content: space-between; gap: 16px; box-shadow: ${sug.isCategoriaDestaque ? '0 10px 30px rgba(99, 102, 241, 0.25)' : '0 8px 24px rgba(0,0,0,0.06)'}; position: relative; overflow: hidden; align-items: stretch; transition: transform 0.25s ease, box-shadow 0.25s ease;">
                  
                  <!-- Esquerda: Título, Gancho & Botão no estilo do card anexado -->
                  <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; z-index: 2; min-width: 0;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">
                        ${sug.isCategoriaDestaque ? `
                          <span style="background: linear-gradient(90deg, #F59E0B, #EF4444); color: #FFFFFF; padding: 2px 9px; border-radius: 9999px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);">
                            🔥 EM ALTA NA CATEGORIA
                          </span>
                        ` : ''}
                        <span style="${(sug.isCategoriaDestaque || isDarkOrGrad) ? 'background: rgba(255,255,255,0.2); color: #FFFFFF;' : 'background: rgba(229, 90, 43, 0.1); color: var(--ref-primary);'} padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase;">
                          ${sug.formato}
                        </span>
                        <span style="font-size: 10px; opacity: 0.8; font-weight: 700;">• ${sug.matchPercent}% Match</span>
                      </div>
                      <div style="display: flex; align-items: flex-start; gap: 6px;">
                        <h4 id="sug-title-${sug.id}" style="margin: 0 0 8px 0; font-size: 15px; font-weight: 800; font-family: 'Outfit', sans-serif; line-height: 1.25; color: ${isDarkOrGrad ? '#FFFFFF' : '#1C1A14'} !important; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;">
                          ${sug.titulo}
                        </h4>
                        <button type="button" onclick="event.stopPropagation(); Planejamento.editarTituloSugestao('${sug.id}')" title="Editar Título" style="${isDarkOrGrad ? 'background: rgba(255,255,255,0.15); color: #FFFFFF;' : 'background: rgba(229, 90, 43, 0.08); color: var(--ref-primary);'} width: 26px; height: 26px; min-width: 26px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; border: none; transition: all 0.2s ease; flex-shrink: 0; margin-top: 1px;">
                          <i data-lucide="pencil" style="width: 12px; height: 12px;"></i>
                        </button>
                      </div>
                      <p style="margin: 0; font-size: 11px; color: ${subtextColor}; font-style: italic; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">
                        "${sug.gancho}"
                      </p>
                    </div>

                    <!-- Botões de Ação no Padrão do Card (Pílula com Círculo Arrow) -->
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
                      <button type="button" onclick="event.stopPropagation(); Planejamento.verRoteiroSugestao('${sug.id}')" style="${pillBg} border-radius: 9999px; padding: 5px 14px 5px 5px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; ${iconCircleBg} display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                          <i data-lucide="arrow-up-right" style="width: 13px; height: 13px; stroke-width: 3;"></i>
                        </div>
                        VER ROTEIRO
                      </button>

                      <button type="button" onclick="event.stopPropagation(); Planejamento.importarSugestaoParaCaixa('${sug.id}')" title="Salvar na Caixa" style="${isDarkOrGrad ? 'background: rgba(255,255,255,0.18); color: #FFFFFF;' : 'background: #FAF8F5; color: #1C1A14; border: 1px solid #EBE5DF;'} width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                        <i data-lucide="archive" style="width: 14px; height: 14px;"></i>
                      </button>

                      <button type="button" onclick="event.stopPropagation(); Planejamento.enviarSugestaoParaCanva('${sug.id}')" title="No Canva" style="${isDarkOrGrad ? 'background: rgba(255,255,255,0.18); color: #FFFFFF;' : 'background: #FAF8F5; color: #1C1A14; border: 1px solid #EBE5DF;'} width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                        <i data-lucide="network" style="width: 14px; height: 14px;"></i>
                      </button>

                      <button type="button" onclick="event.stopPropagation(); Planejamento.exportarSugestaoParaCronograma('${sug.id}')" title="Exportar para Cronograma / Kanban" style="${isDarkOrGrad ? 'background: rgba(255,255,255,0.18); color: #FFFFFF;' : 'background: #FAF8F5; color: #1C1A14; border: 1px solid #EBE5DF;'} width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                        <i data-lucide="calendar-plus" style="width: 14px; height: 14px; color: var(--ref-primary, #E55A2B);"></i>
                      </button>

                      <button type="button" onclick="event.stopPropagation(); Planejamento.openMiniPopSugestao(event, '${sug.id}')" title="Mais Opções" style="${isDarkOrGrad ? 'background: rgba(255,255,255,0.18); color: #FFFFFF;' : 'background: #FAF8F5; color: #1C1A14; border: 1px solid #EBE5DF;'} width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                        <i data-lucide="more-vertical" style="width: 14px; height: 14px;"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Direita: Imagem Visual 3D / Thumbnail recortada com sombra -->
                  <div style="width: 125px; height: 125px; border-radius: 18px; overflow: hidden; position: relative; flex-shrink: 0; box-shadow: 0 8px 22px rgba(0,0,0,0.18); border: 2px solid ${boxBorder}; z-index: 2; align-self: center;">
                    <img src="${sug.thumb}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.78); color: #FFFFFF; padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 800; backdrop-filter: blur(4px);">
                      ${sug.viewsEst}
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- PAGINAÇÃO COM BOLINHAS (DOT SELECTORS) -->
          ${totalPages > 1 ? `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 24px; padding: 16px 0;">
            <div style="font-size: 12px; color: var(--ref-text-sub, #64748B); font-weight: 600;">
              Exibindo <span style="color: var(--ref-primary, #E55A2B); font-weight: 800;">${startIdx + 1}-${Math.min(startIdx + perPage, allSugs.length)}</span> de <span style="color: var(--ref-text, #1C1A14); font-weight: 800;">${allSugs.length}</span> ideias virais
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                <button type="button" onclick="Planejamento.mudarPaginaSugestoes(${p})"
                  style="width: ${p === curPage ? '14px' : '10px'}; height: ${p === curPage ? '14px' : '10px'}; border-radius: 50%; background: ${p === curPage ? 'var(--ref-primary, #E55A2B)' : '#D4CFC7'}; border: ${p === curPage ? '2px solid rgba(229, 90, 43, 0.4)' : '2px solid transparent'}; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: ${p === curPage ? '0 0 0 4px rgba(229, 90, 43, 0.15), 0 2px 8px rgba(229, 90, 43, 0.3)' : 'none'}; padding: 0;"
                  title="Página ${p}">
                </button>
              `).join('')}
            </div>
          </div>
          ` : ''}
            `;
          })()}
        </div>

        <!-- SEÇÃO 3: MÚSICAS E ÁUDIOS VIRAIS DO NICHO -->
        <div style="background: #181714; border-radius: 20px; border: 1px solid #2D2A24; padding: 20px 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 30px; height: 30px; border-radius: 8px; background: rgba(229, 90, 43, 0.2); color: var(--ref-primary); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="music" style="width: 16px; height: 16px;"></i>
              </div>
              <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif;">Músicas e Áudios Virais Recomendados no Nicho</h3>
            </div>
            <span style="font-size: 11px; color: #94A3B8; font-weight: 600;">Monitoramento semanal de áudios em alta no YouTube & Shorts</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
            ${musicasViraisNicho.map(m => `
              <div style="background: #23201B; border-radius: 20px; border: 1px solid #332F28; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.12);">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(229, 90, 43, 0.15); color: var(--ref-primary, #E55A2B); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(229, 90, 43, 0.25);">
                        <i data-lucide="${m.icone}" style="width: 18px; height: 18px;"></i>
                      </div>
                      <div>
                        <h4 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif;">${m.titulo}</h4>
                        <span style="font-size: 11px; color: #94A3B8; font-weight: 500;">${m.artista}</span>
                      </div>
                    </div>
                    <span style="background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; white-space: nowrap;">
                      ${m.tendencia}
                    </span>
                  </div>
                  
                  <div style="background: #181714; border-radius: 12px; padding: 10px 12px; border: 1px solid #2D2A24; margin-top: 4px; font-size: 11px; color: #D4D4D8; display: flex; justify-content: space-between; gap: 6px;">
                    <span>Ritmo: <strong style="color: #FFFFFF;">${m.ritmo}</strong></span>
                    <span style="color: var(--ref-primary, #E55A2B);">Uso: <strong>${m.usoRecomendado}</strong></span>
                  </div>
                </div>

                <button type="button" onclick="if(typeof Components !== 'undefined') Components.toast('Áudio salvo nas referências do seu roteiro!', 'success');" style="background: rgba(255, 255, 255, 0.08); color: #FFFFFF; border-radius: 9999px; padding: 5px 14px 5px 5px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid rgba(255, 255, 255, 0.15); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;">
                  <div style="width: 22px; height: 22px; border-radius: 50%; background: #FFFFFF; color: #141414; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i data-lucide="arrow-up-right" style="width: 12px; height: 12px; stroke-width: 3;"></i>
                  </div>
                  USAR ESTE ÁUDIO
                </button>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  },

  renderCanvasViewHTML() {
    return `
      <div class="canvas-container">
        <!-- Toolbar Flutuante de Ferramentas (Estilo Navbar / Dock Flutuante do Sistema) -->
        <div class="canvas-toolbar">
          <button type="button" class="canvas-toolbar-btn" onclick="Planejamento.addCanvasNode('text')">
            <i data-lucide="file-text" style="width: 16px; height: 16px;"></i> + Texto
          </button>
          <button type="button" class="canvas-toolbar-btn" onclick="Planejamento.addCanvasNode('file')">
            <i data-lucide="image" style="width: 16px; height: 16px;"></i> + Imagem
          </button>
          <button type="button" class="canvas-toolbar-btn" onclick="Planejamento.addCanvasNode('link')">
            <i data-lucide="link" style="width: 16px; height: 16px;"></i> + Link
          </button>
          <button type="button" class="canvas-toolbar-btn" onclick="Planejamento.addCanvasNode('group')">
            <i data-lucide="square" style="width: 16px; height: 16px;"></i> + Grupo (Frame)
          </button>
          <div class="canvas-toolbar-divider"></div>
          <button type="button" class="canvas-toolbar-btn" onclick="Planejamento.duplicateSelectedCanvasNodes()" title="Duplicar (Ctrl+D)">
            <i data-lucide="copy" style="width: 16px; height: 16px;"></i> Duplicar
          </button>
          <button type="button" class="canvas-toolbar-btn btn-danger" onclick="Planejamento.deleteSelectedCanvasElements()" title="Deletar (Delete)">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i> Deletar
          </button>
          <div class="canvas-toolbar-divider"></div>
          <button type="button" class="canvas-toolbar-btn" onclick="Planejamento.exportCanvasJSON()" title="Exportar Obsidian .canvas">
            <i data-lucide="download" style="width: 16px; height: 16px;"></i> .canvas
          </button>
          <button type="button" class="canvas-toolbar-btn" onclick="Planejamento.exportCanvasPNG()" title="Exportar Imagem PNG">
            <i data-lucide="camera" style="width: 16px; height: 16px;"></i> PNG
          </button>
        </div>

        <!-- Viewport Pan/Zoom -->
        <div class="canvas-viewport" id="canvas-viewport">
          <!-- Grid de Fundo com CSS Vars -->

          <!-- Camada de Grafo Transformada -->
          <div class="canvas-transform-layer" id="canvas-transform-layer" style="transform: translate(${this.canvasPan.x}px, ${this.canvasPan.y}px) scale(${this.canvasZoom});">
            <div id="canvas-selection-box" style="display: none; position: absolute; border: 1.5px dashed var(--ref-primary, #E55A2B); background: rgba(229, 90, 43, 0.08); pointer-events: none; border-radius: 8px; z-index: 999; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.18);"></div>
            ${this.renderCanvasEdgesSVG()}
            ${this.renderCanvasNodesHTML()}
          </div>
        </div>

        <!-- Controles de Zoom Flutuantes (Canto Inferior Esquerdo) -->
        <div class="canvas-controls-zoom">
          <button type="button" class="canvas-zoom-btn" onclick="Planejamento.zoomCanvas('in')" title="Aproximar Zoom">+</button>
          <div class="canvas-zoom-indicator" id="canvas-zoom-indicator">${Math.round(this.canvasZoom * 100)}%</div>
          <button type="button" class="canvas-zoom-btn" onclick="Planejamento.zoomCanvas('out')" title="Afastar Zoom">-</button>
          <button type="button" class="canvas-zoom-btn" onclick="Planejamento.zoomCanvasFit()" title="Ajustar à Tela (Fit)">🎯</button>
        </div>
      </div>
    `;
  },

  renderCanvasNodesHTML() {
    return this.canvasNodes.map(node => {
      const isSelected = this.canvasSelectedNodeIds.includes(node.id);
      const isGroup = node.type === 'group';

      if (isGroup) {
        return `
          <div class="canvas-node canvas-node-group ${isSelected ? 'selected' : ''}"
               id="canvas-node-${node.id}"
               data-id="${node.id}"
               style="left: ${node.x}px; top: ${node.y}px; width: ${node.width}px; height: ${node.height}px; background: ${node.color || 'rgba(248, 246, 241, 0.6)'};">
            <div class="canvas-node-header" data-drag-handle="true">
              <span style="font-size: 14px;">📦</span>
              <input type="text" class="canvas-node-title-input" value="${node.title}" onchange="Planejamento.updateNodeData('${node.id}', 'title', this.value)">
            </div>
            <div class="canvas-resize-handle" data-resize-handle="true"></div>
          </div>
        `;
      }

      let contentHTML = '';
      if (node.type === 'text') {
        contentHTML = `
          <div contenteditable="true" class="canvas-text-body" style="outline: none; font-size: 13px; color: var(--ref-text); line-height: 1.5; min-height: 60px; font-family: var(--font-main);" onblur="Planejamento.updateNodeData('${node.id}', 'text', this.innerHTML)">
            ${node.text || 'Digite suas anotações ou roteiro aqui...'}
          </div>
        `;
      } else if (node.type === 'file') {
        contentHTML = `
          <div style="width: 100%; height: 170px; border-radius: 12px; overflow: hidden; background: #F8F6F1; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; margin-bottom: 8px; flex-shrink: 0;" title="Clique para trocar imagem" onclick="Planejamento.triggerCanvasNodeImageUpload('${node.id}')">
            <img src="${node.url}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
            <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.65); color: #fff; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 4px;">
              <i data-lucide="upload" style="width: 12px; height: 12px;"></i> Trocar Foto
            </div>
          </div>
          <div contenteditable="true" class="canvas-text-body" style="outline: none; font-size: 12px; color: var(--ref-text); line-height: 1.45; min-height: 36px; font-family: var(--font-main); background: #FAF8F5; border-radius: 10px; padding: 8px 10px; border: 1px solid var(--ref-border);" placeholder="Clique para adicionar uma legenda / descrição..." onblur="Planejamento.updateNodeData('${node.id}', 'text', this.innerHTML)">
            ${node.text || 'Clique para adicionar uma legenda...'}
          </div>
        `;
      } else if (node.type === 'link') {
        contentHTML = `
          <div style="background: #F8F6F1; border-radius: 12px; padding: 10px; border: 1px solid var(--ref-border); display: flex; flex-direction: column; gap: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--ref-primary);">LINK DE REFERÊNCIA</span>
            <a href="${node.url}" target="_blank" style="font-size: 12px; color: #3B82F6; text-decoration: none; word-break: break-all; font-weight: 600;">${node.url}</a>
          </div>
        `;
      }

      return `
        <div class="canvas-node ${isSelected ? 'selected' : ''}"
             id="canvas-node-${node.id}"
             data-id="${node.id}"
             style="left: ${node.x}px; top: ${node.y}px; width: ${node.width}px; height: ${node.height}px;">
          <div class="canvas-node-header" data-drag-handle="true">
            <span style="font-size: 14px;">${node.type === 'text' ? '💡' : (node.type === 'file' ? '🖼️' : '🔗')}</span>
            <input type="text" class="canvas-node-title-input" value="${node.title}" onchange="Planejamento.updateNodeData('${node.id}', 'title', this.value)">
            <button onclick="Planejamento.exportarCanvasNodeParaCronograma('${node.id}')" title="Exportar para Cronograma" style="background: none; border: none; color: var(--ref-primary, #E55A2B); cursor: pointer; padding: 2px;">
              <i data-lucide="calendar-plus" style="width: 14px; height: 14px;"></i>
            </button>
            <button onclick="Planejamento.deleteCanvasNode('${node.id}')" style="background: none; border: none; color: var(--ref-text-sub); cursor: pointer; padding: 2px;">
              <i data-lucide="x" style="width: 14px; height: 14px;"></i>
            </button>
          </div>

          <!-- Divisória Sutil de Separação de Conteúdo -->
          <div class="canvas-node-divider"></div>

          <div class="canvas-node-body" style="flex: 1; display: flex; flex-direction: column;">
            ${contentHTML}
          </div>

          <!-- Ancoragens de Conexão (Norte, Leste, Sul, Oeste) -->
          <div class="canvas-anchor top" data-anchor="top" data-node="${node.id}"></div>
          <div class="canvas-anchor right" data-anchor="right" data-node="${node.id}"></div>
          <div class="canvas-anchor bottom" data-anchor="bottom" data-node="${node.id}"></div>
          <div class="canvas-anchor left" data-anchor="left" data-node="${node.id}"></div>

          <!-- Handle de Redimensionamento -->
          <div class="canvas-resize-handle" data-resize-handle="true"></div>
        </div>
      `;
    }).join('');
  },

  renderCanvasEdgesSVG() {
    const paths = this.canvasEdges.map(edge => {
      const fromNode = this.canvasNodes.find(n => n.id === edge.fromNode);
      const toNode = this.canvasNodes.find(n => n.id === edge.toNode);
      if (!fromNode || !toNode) return '';

      const p1 = this.getNodeAnchorPos(fromNode, edge.fromAnchor || 'right');
      const p2 = this.getNodeAnchorPos(toNode, edge.toAnchor || 'left');

      const dx = Math.abs(p2.x - p1.x) * 0.5;
      const pathData = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;
      const isSelected = this.canvasSelectedEdgeId === edge.id;

      return `
        <g onclick="Planejamento.selectEdge('${edge.id}')" data-edge-id="${edge.id}">
          <path id="canvas-edge-${edge.id}" d="${pathData}" stroke="${edge.color || '#E55A2B'}" class="${isSelected ? 'selected' : ''}" marker-end="url(#arrowhead)"/>
          ${edge.label ? `
            <text id="canvas-edge-text-${edge.id}" x="${(p1.x + p2.x) / 2}" y="${(p1.y + p2.y) / 2 - 8}" fill="#7A7567" font-size="11" font-weight="700" text-anchor="middle" font-family="Outfit">${edge.label}</text>
          ` : ''}
        </g>
      `;
    }).join('');

    return `
      <svg class="canvas-svg-layer" id="canvas-svg-layer">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#E55A2B"/>
          </marker>
        </defs>
        ${paths}
        <!-- Linha guia temporária durante o drag da ancoragem -->
        <path id="canvas-temp-edge" d="" stroke="#E55A2B" stroke-dasharray="6,6" stroke-width="2.5" marker-end="url(#arrowhead)" style="display: none; pointer-events: none;"></path>
      </svg>
    `;
  },

  getNodeAnchorPos(node, anchor) {
    if (anchor === 'top') return { x: node.x + node.width / 2, y: node.y };
    if (anchor === 'right') return { x: node.x + node.width, y: node.y + node.height / 2 };
    if (anchor === 'bottom') return { x: node.x + node.width / 2, y: node.y + node.height };
    return { x: node.x, y: node.y + node.height / 2 };
  },

  updateNodeEdgesPaths(nodeId) {
    this.canvasEdges.forEach(edge => {
      if (edge.fromNode === nodeId || edge.toNode === nodeId) {
        const fromNode = this.canvasNodes.find(n => n.id === edge.fromNode);
        const toNode = this.canvasNodes.find(n => n.id === edge.toNode);
        if (!fromNode || !toNode) return;

        const p1 = this.getNodeAnchorPos(fromNode, edge.fromAnchor || 'right');
        const p2 = this.getNodeAnchorPos(toNode, edge.toAnchor || 'left');
        const dx = Math.abs(p2.x - p1.x) * 0.5;
        const pathData = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

        const pathEl = document.getElementById(`canvas-edge-${edge.id}`);
        if (pathEl) {
          pathEl.setAttribute('d', pathData);
        }
        const textEl = document.getElementById(`canvas-edge-text-${edge.id}`);
        if (textEl) {
          textEl.setAttribute('x', (p1.x + p2.x) / 2);
          textEl.setAttribute('y', (p1.y + p2.y) / 2 - 8);
        }
      }
    });
  },

  updateNodeData(nodeId, key, value) {
    const node = this.canvasNodes.find(n => n.id === nodeId);
    if (node) {
      node[key] = value;
      this.salvarDadosCanvas();
    }
  },

  deleteCanvasNode(nodeId) {
    this.canvasNodes = this.canvasNodes.filter(n => n.id !== nodeId);
    this.canvasEdges = this.canvasEdges.filter(e => e.fromNode !== nodeId && e.toNode !== nodeId);
    this.salvarDadosCanvas();
    this.render();
  },

  selectEdge(edgeId) {
    this.canvasSelectedEdgeId = edgeId;
    this.canvasSelectedNodeIds = [];
    this.render();
  },

  attachCanvasEvents() {
    const viewport = document.getElementById('canvas-viewport');
    const container = document.getElementById('canvas-transform-layer');
    if (!viewport || !container) return;

    let isPanning = false;
    let isSelectingBox = false;
    let boxStartX = 0, boxStartY = 0;
    let startX = 0, startY = 0;
    let draggingNode = null;
    let resizingNode = null;
    let connectingAnchor = null;
    let dragOffsetX = 0, dragOffsetY = 0;
    let initialWidth = 0, initialHeight = 0;

    viewport.onmousedown = (e) => {
      if (e.target.dataset.anchor) {
        const nodeId = e.target.dataset.node;
        const anchor = e.target.dataset.anchor;
        const fromNode = this.canvasNodes.find(n => n.id === nodeId);
        if (fromNode) {
          const p1 = this.getNodeAnchorPos(fromNode, anchor);
          connectingAnchor = { nodeId, anchor, startX: p1.x, startY: p1.y };
          const tempPath = document.getElementById('canvas-temp-edge');
          if (tempPath) {
            tempPath.setAttribute('d', `M ${p1.x} ${p1.y} L ${p1.x} ${p1.y}`);
            tempPath.style.display = 'block';
          }
        }
        e.stopPropagation();
        return;
      }

      if (e.target.dataset.resizeHandle) {
        const nodeEl = e.target.closest('.canvas-node');
        if (nodeEl) {
          const id = nodeEl.dataset.id;
          resizingNode = this.canvasNodes.find(n => n.id === id);
          startX = e.clientX;
          startY = e.clientY;
          initialWidth = resizingNode.width;
          initialHeight = resizingNode.height;
          e.stopPropagation();
          return;
        }
      }

      const nodeEl = e.target.closest('.canvas-node');
      if (nodeEl) {
        const id = nodeEl.dataset.id;
        draggingNode = this.canvasNodes.find(n => n.id === id);

        const isMultiSelect = e.ctrlKey || e.metaKey;
        if (isMultiSelect) {
          if (this.canvasSelectedNodeIds.includes(id)) {
            this.canvasSelectedNodeIds = this.canvasSelectedNodeIds.filter(nId => nId !== id);
            nodeEl.classList.remove('selected');
          } else {
            this.canvasSelectedNodeIds.push(id);
            nodeEl.classList.add('selected');
          }
        } else {
          if (!this.canvasSelectedNodeIds.includes(id)) {
            this.canvasSelectedNodeIds = [id];
            document.querySelectorAll('.canvas-node').forEach(el => el.classList.remove('selected'));
            nodeEl.classList.add('selected');
          }
        }
        this.canvasSelectedEdgeId = null;

        // Salvar posições iniciais de todos os nós selecionados para arrasto simultâneo em grupo
        this.draggedNodesStartPos = this.canvasNodes
          .filter(n => this.canvasSelectedNodeIds.includes(n.id))
          .map(n => ({ id: n.id, startX: n.x, startY: n.y }));

        dragOffsetX = (e.clientX - this.canvasPan.x) / this.canvasZoom;
        dragOffsetY = (e.clientY - this.canvasPan.y) / this.canvasZoom;

        e.stopPropagation();
        return;
      }

      // Se clicar no fundo do Canvas:
      // Se segurar Alt ou botão do meio (e.button === 1), faz Pan da câmera.
      // Se apenas clicar com botão esquerdo no fundo, ativa a SELEÇÃO POR CAIXA (Marquee Box Selection).
      if (e.altKey || e.button === 1) {
        isPanning = true;
        startX = e.clientX - this.canvasPan.x;
        startY = e.clientY - this.canvasPan.y;
      } else {
        isSelectingBox = true;
        const rect = viewport.getBoundingClientRect();
        boxStartX = (e.clientX - rect.left - this.canvasPan.x) / this.canvasZoom;
        boxStartY = (e.clientY - rect.top - this.canvasPan.y) / this.canvasZoom;

        if (!e.ctrlKey && !e.metaKey) {
          this.canvasSelectedNodeIds = [];
          this.canvasSelectedEdgeId = null;
          document.querySelectorAll('.canvas-node').forEach(el => el.classList.remove('selected'));
        }

        const boxEl = document.getElementById('canvas-selection-box');
        if (boxEl) {
          boxEl.style.left = `${boxStartX}px`;
          boxEl.style.top = `${boxStartY}px`;
          boxEl.style.width = '0px';
          boxEl.style.height = '0px';
          boxEl.style.display = 'block';
        }
      }
    };

    window.onmousemove = (e) => {
      if (connectingAnchor) {
        const rect = viewport.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left - this.canvasPan.x) / this.canvasZoom;
        const canvasY = (e.clientY - rect.top - this.canvasPan.y) / this.canvasZoom;

        const tempPath = document.getElementById('canvas-temp-edge');
        if (tempPath) {
          const p1 = { x: connectingAnchor.startX, y: connectingAnchor.startY };
          const dx = Math.abs(canvasX - p1.x) * 0.5;
          tempPath.setAttribute('d', `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${canvasX - dx} ${canvasY}, ${canvasX} ${canvasY}`);
        }
        return;
      }

      if (isSelectingBox) {
        const rect = viewport.getBoundingClientRect();
        const currentCanvasX = (e.clientX - rect.left - this.canvasPan.x) / this.canvasZoom;
        const currentCanvasY = (e.clientY - rect.top - this.canvasPan.y) / this.canvasZoom;

        const selLeft = Math.min(boxStartX, currentCanvasX);
        const selTop = Math.min(boxStartY, currentCanvasY);
        const selWidth = Math.abs(currentCanvasX - boxStartX);
        const selHeight = Math.abs(currentCanvasY - boxStartY);

        const boxEl = document.getElementById('canvas-selection-box');
        if (boxEl) {
          boxEl.style.left = `${selLeft}px`;
          boxEl.style.top = `${selTop}px`;
          boxEl.style.width = `${selWidth}px`;
          boxEl.style.height = `${selHeight}px`;
          boxEl.style.display = 'block';
        }

        // Seleção dinâmica por colisão de retângulos (AABB)
        this.canvasNodes.forEach(node => {
          const nodeRight = node.x + node.width;
          const nodeBottom = node.y + node.height;
          const boxRight = selLeft + selWidth;
          const boxBottom = selTop + selHeight;

          const intersects = (
            node.x < boxRight &&
            nodeRight > selLeft &&
            node.y < boxBottom &&
            nodeBottom > selTop
          );

          const nodeEl = document.getElementById(`canvas-node-${node.id}`);
          if (intersects) {
            if (!this.canvasSelectedNodeIds.includes(node.id)) {
              this.canvasSelectedNodeIds.push(node.id);
            }
            if (nodeEl) nodeEl.classList.add('selected');
          } else if (!e.ctrlKey && !e.metaKey) {
            this.canvasSelectedNodeIds = this.canvasSelectedNodeIds.filter(id => id !== node.id);
            if (nodeEl) nodeEl.classList.remove('selected');
          }
        });
        return;
      }

      if (isPanning) {
        this.canvasPan.x = e.clientX - startX;
        this.canvasPan.y = e.clientY - startY;
        requestAnimationFrame(() => {
          container.style.transform = `translate(${this.canvasPan.x}px, ${this.canvasPan.y}px) scale(${this.canvasZoom})`;
        });
      } else if (draggingNode) {
        const currentMouseX = (e.clientX - this.canvasPan.x) / this.canvasZoom;
        const currentMouseY = (e.clientY - this.canvasPan.y) / this.canvasZoom;
        const deltaX = Math.round(currentMouseX - dragOffsetX);
        const deltaY = Math.round(currentMouseY - dragOffsetY);

        if (this.draggedNodesStartPos && this.draggedNodesStartPos.length > 0) {
          this.draggedNodesStartPos.forEach(item => {
            const node = this.canvasNodes.find(n => n.id === item.id);
            if (node) {
              node.x = item.startX + deltaX;
              node.y = item.startY + deltaY;
              const el = document.getElementById(`canvas-node-${node.id}`);
              if (el) {
                el.style.left = `${node.x}px`;
                el.style.top = `${node.y}px`;
              }
              this.updateNodeEdgesPaths(node.id);
            }
          });
        }
      } else if (resizingNode) {
        const deltaX = (e.clientX - startX) / this.canvasZoom;
        const deltaY = (e.clientY - startY) / this.canvasZoom;
        resizingNode.width = Math.max(180, Math.round(initialWidth + deltaX));
        resizingNode.height = Math.max(100, Math.round(initialHeight + deltaY));

        const nodeEl = document.getElementById(`canvas-node-${resizingNode.id}`);
        if (nodeEl) {
          nodeEl.style.width = `${resizingNode.width}px`;
          nodeEl.style.height = `${resizingNode.height}px`;
        }

        this.updateNodeEdgesPaths(resizingNode.id);
      }
    };

    window.onmouseup = (e) => {
      if (isSelectingBox) {
        isSelectingBox = false;
        const boxEl = document.getElementById('canvas-selection-box');
        if (boxEl) {
          boxEl.style.display = 'none';
        }
      }
      if (isPanning) {
        isPanning = false;
      }
      if (draggingNode) {
        draggingNode = null;
        this.draggedNodesStartPos = null;
        this.salvarDadosCanvas();
      }
      if (resizingNode) {
        resizingNode = null;
        this.salvarDadosCanvas();
      }
      if (connectingAnchor) {
        const tempPath = document.getElementById('canvas-temp-edge');
        if (tempPath) tempPath.style.display = 'none';

        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const targetAnchor = targetElement ? targetElement.closest('.canvas-anchor') : null;
        const targetNode = targetElement ? targetElement.closest('.canvas-node') : null;

        if (targetAnchor) {
          const toNode = targetAnchor.dataset.node;
          const toSide = targetAnchor.dataset.anchor;
          if (toNode && toNode !== connectingAnchor.nodeId) {
            this.canvasEdges.push({
              id: 'edge_' + Date.now(),
              fromNode: connectingAnchor.nodeId,
              fromAnchor: connectingAnchor.anchor,
              toNode,
              toAnchor: toSide,
              color: '#E55A2B'
            });
            this.salvarDadosCanvas();
            this.render();
          }
        } else if (targetNode) {
          const toNode = targetNode.dataset.id;
          if (toNode && toNode !== connectingAnchor.nodeId) {
            this.canvasEdges.push({
              id: 'edge_' + Date.now(),
              fromNode: connectingAnchor.nodeId,
              fromAnchor: connectingAnchor.anchor,
              toNode,
              toAnchor: 'left',
              color: '#E55A2B'
            });
            this.salvarDadosCanvas();
            this.render();
          }
        } else {
          // SOLTOU NO ESPAÇO VAZIO DO CANVAS -> CRIAR NOVO CARD E CONECTAR AUTOMATICAMENTE!
          const rect = viewport.getBoundingClientRect();
          const canvasX = (e.clientX - rect.left - this.canvasPan.x) / this.canvasZoom;
          const canvasY = (e.clientY - rect.top - this.canvasPan.y) / this.canvasZoom;

          const newId = 'node_' + Date.now();
          const novoNo = {
            id: newId,
            type: 'text',
            x: Math.round(canvasX - 160),
            y: Math.round(canvasY - 50),
            width: 320,
            height: 180,
            title: '📌 Novo Roteiro / Anotação',
            text: 'Digite aqui...'
          };

          this.canvasNodes.push(novoNo);
          this.canvasEdges.push({
            id: 'edge_' + Date.now(),
            fromNode: connectingAnchor.nodeId,
            fromAnchor: connectingAnchor.anchor,
            toNode: newId,
            toAnchor: 'left',
            color: '#E55A2B'
          });

          this.canvasSelectedNodeIds = [newId];
          this.salvarDadosCanvas();
          this.render();
          if (typeof Components !== 'undefined') Components.toast('Novo card criado e vinculado!', 'success');
        }
        connectingAnchor = null;
      }
    };

    viewport.onwheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.max(0.2, Math.min(3.0, this.canvasZoom * zoomFactor));

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.canvasPan.x = mouseX - (mouseX - this.canvasPan.x) * (newZoom / this.canvasZoom);
      this.canvasPan.y = mouseY - (mouseY - this.canvasPan.y) * (newZoom / this.canvasZoom);
      this.canvasZoom = newZoom;

      this.zoomCanvas('none', 0);
    };

    window.onkeydown = (e) => {
      if (this.subAbaAtiva !== 'canvas') return;
      if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteSelectedCanvasElements();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.duplicateSelectedCanvasNodes();
      }
    };
  },

  // RENDERIZADOR PRINCIPAL
  render() {
    const container = document.getElementById('page-container') || document.getElementById('planejamento-root');
    if (!container) return;

    const user = (window.API && API.getUser) ? API.getUser() : { nome: 'Criador Tomada', email: 'canal@youtube.com', role: 'criador' };
    const initials = (user.nome || 'Criador').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');
    const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });

    const switcherHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div class="planejamento-view-switcher">
          <button type="button" class="switcher-btn ${this.subAbaAtiva === 'caixas' ? 'active' : ''}" onclick="Planejamento.setSubAba('caixas')">
            <i data-lucide="layout-grid"></i> Caixa
          </button>
          <button type="button" class="switcher-btn ${this.subAbaAtiva === 'canvas' ? 'active' : ''}" onclick="Planejamento.setSubAba('canvas')">
            <i data-lucide="network"></i> Canva
          </button>
          <button type="button" class="switcher-btn ${this.subAbaAtiva === 'recomendacao' ? 'active' : ''}" onclick="Planejamento.setSubAba('recomendacao')">
            <i data-lucide="sparkles"></i> Recomendação
          </button>
          <button type="button" class="switcher-btn ${this.subAbaAtiva === 'sugestoes' ? 'active' : ''}" onclick="Planejamento.setSubAba('sugestoes')">
            <i data-lucide="lightbulb"></i> Sugestões
          </button>
        </div>
      </div>
    `;

    // Garantir que o container pai (#page-container) fique sem paddings/margens externas em todo o módulo de planejamento (Edge-to-Edge Total)
    container.style.setProperty('padding', '0', 'important');
    container.style.setProperty('margin', '0', 'important');
    container.style.setProperty('width', '100%', 'important');
    container.style.setProperty('max-width', '100%', 'important');

    if (this.subAbaAtiva === 'canvas') {
      container.style.setProperty('display', 'block', 'important');
      container.style.setProperty('position', 'relative', 'important');
      container.style.setProperty('height', '100vh', 'important');
      container.style.setProperty('width', '100vw', 'important');
      container.style.setProperty('max-width', '100vw', 'important');
      container.style.setProperty('overflow', 'hidden', 'important');

      container.innerHTML = `
        <div class="ref-dashboard-wrapper" style="margin: 0; width: 100%; max-width: 100%; height: 100%; padding: 0; position: relative; overflow: hidden;">
          <div class="planejamento-canvas-header-floating">
            ${switcherHTML}
          </div>
          ${this.renderCanvasViewHTML()}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      this.attachCanvasEvents();
      return;
    } else if (this.subAbaAtiva === 'sugestoes') {
      container.style.setProperty('display', 'block', 'important');
      container.style.removeProperty('background');
      container.style.removeProperty('height');
      container.style.removeProperty('max-height');
      container.style.removeProperty('overflow');

      container.innerHTML = `
        <div class="ref-dashboard-wrapper" style="margin: 0; width: 100%; max-width: 100%; padding: 0;">
          <div style="padding: 20px 24px 0 24px;">
            ${switcherHTML}
          </div>
          ${this.renderSugestoesViewHTML()}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    } else if (this.subAbaAtiva === 'recomendacao') {
      container.style.setProperty('display', 'block', 'important');
      container.style.removeProperty('background');
      container.style.removeProperty('height');
      container.style.removeProperty('max-height');
      container.style.removeProperty('overflow');

      const canal = this.canalInfo;

      const bannerCanalHTML = canal ? `
        <div style="margin: 16px 24px 0 24px; background: #FFFFFF; border-radius: 16px; border: 1.5px solid var(--ref-border, #E8E4DD); padding: 14px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); font-family: var(--font-main, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 46px; height: 46px; border-radius: 50%; overflow: hidden; background: #FAF8F5; border: 2.5px solid var(--ref-primary, #E55A2B); flex-shrink: 0; box-shadow: 0 2px 8px rgba(229, 90, 43, 0.2);">
              <img src="${canal.avatar}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: inherit;">Canal Vinculado: ${canal.nome}</span>
                <span style="background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; font-family: inherit;">🟢 CONECTADO VIA YOUTUBE API</span>
              </div>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: var(--ref-text-sub, #64748B); font-family: inherit;">
                <strong>${canal.subscribers}</strong> • As recomendações abaixo são calibradas com base na audiência e ganchos reais do seu canal
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center;">
            <a href="#" onclick="event.preventDefault(); window.open('/api/youtube/auth?token=' + encodeURIComponent(localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || ''), '_blank');" style="background: #FAF8F5; border: 1px solid var(--ref-border, #EBE5DF); color: var(--ref-text, #1C1A14); border-radius: 10px; padding: 9px 16px; font-size: 12px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.04); font-family: inherit;">
              <i data-lucide="refresh-cw" style="width: 15px; height: 15px; color: var(--ref-primary, #E55A2B);"></i> Sincronizar Novo Canal
            </a>
            <button onclick="Planejamento.desconectarCanal(event)" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #EF4444; border-radius: 10px; padding: 9px 16px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; font-family: inherit;">
              <i data-lucide="power" style="width: 15px; height: 15px;"></i> Desconectar
            </button>
          </div>
        </div>
      ` : `
        <div style="margin: 16px 24px 0 24px; background: #FFFFFF; border-radius: 16px; border: 1.5px solid var(--ref-border, #E8E4DD); padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); font-family: var(--font-main, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(229, 90, 43, 0.08); border: 1.5px dashed var(--ref-primary, #E55A2B); flex-shrink: 0;">
              <i data-lucide="youtube" style="width: 22px; height: 22px; color: var(--ref-primary, #E55A2B);"></i>
            </div>
            <div>
              <span style="font-size: 15px; font-weight: 800; color: var(--ref-text, #1C1A14); font-family: inherit;">Nenhum Canal Conectado</span>
              <p style="margin: 3px 0 0 0; font-size: 12px; color: var(--ref-text-sub, #64748B); font-family: inherit;">
                Conecte seu canal do YouTube para obter ideias de conteúdo personalizadas e recomendações calibradas com o seu nicho.
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center;">
            <a href="#" onclick="event.preventDefault(); window.open('/api/youtube/auth?token=' + encodeURIComponent(localStorage.getItem('NexusGestor_token') || localStorage.getItem('token') || ''), '_blank');" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 12px; padding: 10px 18px; font-size: 12px; font-weight: 800; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.3); font-family: inherit;">
              <i data-lucide="link" style="width: 15px; height: 15px;"></i> Conectar Canal
            </a>
          </div>
        </div>
      `;

      container.innerHTML = `
        <div class="ref-dashboard-wrapper" style="margin: 0; width: 100%; max-width: 100%; padding: 0;">
          <div style="padding: 20px 24px 0 24px;">
            ${switcherHTML}
          </div>
          ${bannerCanalHTML}
          ${this.renderRecomendacaoViewHTML()}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    } else {
      container.style.setProperty('display', 'block', 'important');
      container.style.removeProperty('height');
      container.style.removeProperty('max-height');
      container.style.removeProperty('overflow');
    }

    // Filtrar cards com base na busca
    const cardsFiltrados = this.cards.filter(c => {
      if (!this.searchQuery) return true;
      return c.titulo.toLowerCase().includes(this.searchQuery) || (c.descricao && c.descricao.toLowerCase().includes(this.searchQuery));
    });

    // 1. Renderizar Hero Cards de Caixas (Topo Bento)
    const heroCardsHTML = this.caixas.map((cx, idx) => {
      const cardsInCx = cardsFiltrados.filter(c => c.caixaId === cx.id);
      let totalChk = 0;
      let doneChk = 0;
      cardsInCx.forEach(c => {
        (c.checklist || []).forEach(i => {
          totalChk++;
          if (i.feito) doneChk++;
        });
      });
      const pct = totalChk > 0 ? Math.round((doneChk / totalChk) * 100) : 0;
      const isActive = this.activeCaixaId === cx.id;

      const temas = ['theme-orange', 'theme-dark', 'theme-purple', 'theme-green'];
      const temaClass = cx.tema || temas[idx % temas.length];

      return `
        <div class="ref-hero-card ${isActive ? 'active-open' : ''}" 
             style="background: linear-gradient(135deg, ${cx.cor} 0%, ${this.escurecerCor(cx.cor, 20)} 100%);"
             onclick="Planejamento.selecionarCaixa('${cx.id}')"
             ondragover="Planejamento.handleDragOver(event)"
             ondragenter="Planejamento.handleDragEnter(event, '${cx.id}')"
             ondragleave="Planejamento.handleDragLeave(event, '${cx.id}')"
             ondrop="Planejamento.handleDrop(event, '${cx.id}')">
          <div class="ref-hero-card-header">
            <h4 class="ref-hero-card-title">${cx.nome}</h4>
            <button class="ref-hero-card-dots" onclick="event.stopPropagation(); Planejamento.openModalEditarCaixa('${cx.id}')" title="Configurar Caixa">
              <i data-lucide="settings" style="width: 16px; height: 16px;"></i>
            </button>
          </div>

          <div class="ref-hero-card-progress">
            <div class="ref-hero-progress-info">
              <span>Progresso</span>
              <span>${pct}%</span>
            </div>
            <div class="ref-hero-progress-track">
              <div class="ref-hero-progress-fill" style="width: ${pct}%;"></div>
            </div>
          </div>

          <div class="ref-hero-card-footer">
            <div class="ref-card-count-badge" style="background: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.35); color: #FFFFFF !important; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; font-size: 12px; font-weight: 800; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-shadow: 0 4px 10px rgba(0,0,0,0.08);" title="${cardsInCx.length} cards cadastrados nesta caixa">
              ${cardsInCx.length}
            </div>
            <span class="ref-date-pill">
              <i data-lucide="${isActive ? 'folder-open' : 'folder'}" style="width: 12px; height: 12px;"></i> ${isActive ? 'Caixa Aberta' : `${cardsInCx.length} cards`}
            </span>
          </div>
        </div>
      `;
    }).join('');

    // 2. Renderizar os Cards da Caixa Selecionada (DESIGN DA IMAGEM 3 - ULTRA PREMIUM CARDS COMPACTADOS)
    const caixaAtiva = this.caixas.find(c => c.id === this.activeCaixaId) || this.caixas[0];
    const cardsDaCaixaAtiva = caixaAtiva ? cardsFiltrados.filter(c => c.caixaId === caixaAtiva.id) : [];

    const img3CardsHTML = cardsDaCaixaAtiva.map(card => {
      const totalChk = (card.checklist || []).length;
      const doneChk = (card.checklist || []).filter(i => i.feito).length;
      const pctCard = totalChk > 0 ? Math.round((doneChk / totalChk) * 100) : 0;
      const tagCor = card.tag?.cor || '#E55A2B';
      const thumbUrl = card.thumbnail || 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=80';

      const checklistHTML = (card.checklist || []).map((item, idx) => `
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: ${item.feito ? 'var(--ref-text-sub)' : 'var(--ref-text)'}; text-decoration: ${item.feito ? 'line-through' : 'none'}; cursor: pointer; padding: 3px 0;">
          <input type="checkbox" ${item.feito ? 'checked' : ''} onchange="Planejamento.toggleCheckItem('${card.id}', ${idx})" style="accent-color: var(--ref-primary); width: 15px; height: 15px; cursor: pointer;">
          <span>${item.texto}</span>
        </label>
      `).join('');

      return `
        <!-- CARD ESTILO IMAGEM 3 -->
        <div class="img3-card" draggable="true" ondragstart="Planejamento.handleDragStart(event, '${card.id}')" ondragend="Planejamento.handleDragEnd(event)">
          
          <!-- Top Cover Banner (Thumbnail) + Avatar Badge + Tag Glass Badge -->
          <div class="img3-banner">
            <img src="${thumbUrl}" alt="Thumb" class="img3-banner-img" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'">
            
            <div class="img3-avatar-badge">${initials}</div>
            
            <div class="img3-glass-badge" style="color: ${tagCor}; font-weight: 800;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${tagCor}; display: inline-block;"></span>
              ${card.tag?.nome || 'Geral'}
            </div>
          </div>

          <!-- Body do Card -->
          <div class="img3-body">
            <div class="img3-header-row">
              <h4 class="img3-title">${card.titulo}</h4>
              <button class="img3-bookmark-btn" onclick="Planejamento.openModalEditarCard('${card.id}')" title="Editar Card">
                <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
            
            <p class="img3-subtitle">${card.descricao || 'Sem descrição cadastrada.'}</p>

            <!-- Barra de Progresso do Checklist Premium (Solicitada pelo Usuário) -->
            <div class="img3-premium-progress-container">
              <div class="img3-premium-progress-header">
                <span>Progresso</span>
                <span style="color: ${tagCor}; font-weight: 800;">${pctCard}%</span>
              </div>
              <div class="img3-premium-progress-track">
                <div class="img3-premium-progress-fill" style="width: ${pctCard}%; --tag-color: ${tagCor};"></div>
              </div>
            </div>

            <!-- Três Ícones de Status / Métricas da Imagem 3 (Star, Flag, Clock) -->
            <div class="img3-stats-row">
              <div class="img3-stat-item">
                <div class="img3-stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;">★</div>
                <div>
                  <span class="img3-stat-val">${doneChk}/${totalChk}</span>
                  <span class="img3-stat-lbl">Checklist</span>
                </div>
              </div>

              <div class="img3-stat-item">
                <div class="img3-stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #3B82F6;">🚩</div>
                <div>
                  <span class="img3-stat-val">${pctCard}%</span>
                  <span class="img3-stat-lbl">Progresso</span>
                </div>
              </div>

              <div class="img3-stat-item">
                <div class="img3-stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #8B5CF6;">🕒</div>
                <div>
                  <span class="img3-stat-val">14h</span>
                  <span class="img3-stat-lbl">Horário</span>
                </div>
              </div>
            </div>

            <!-- Lista de Checklist Expansível -->
            ${totalChk > 0 ? `
              <div style="background: #F8F6F1; border-radius: 14px; padding: 10px; margin-bottom: 12px; border: 1px solid var(--ref-border);">
                <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--ref-text-sub); margin-bottom: 4px;">
                  <span>ETAPAS</span>
                  <span style="color: var(--ref-primary);">${pctCard}%</span>
                </div>
                ${checklistHTML}
              </div>
            ` : ''}

            <!-- Botões de Ação do Card de Conteúdo -->
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button class="img3-pill-btn" style="flex: 1;" onclick="Planejamento.openModalEditarCard('${card.id}')">
                <span>Editar & Gerenciar</span>
                <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
              </button>
              <button type="button" onclick="Planejamento.exportarCardCaixaParaCronograma('${card.id}')" title="Exportar para Cronograma / Kanban" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 9999px; padding: 0 14px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: all 0.2s ease;">
                <i data-lucide="calendar-plus" style="width: 14px; height: 14px;"></i> Exportar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 3. Renderizar Lista de Tasks do Painel Direito (Today's Task)
    const cntTodos = cardsFiltrados.length;
    const cntAbertos = cardsFiltrados.filter(card => {
      return !((card.checklist || []).length > 0 && (card.checklist || []).every(i => i.feito));
    }).length;
    const cntConcluidos = cardsFiltrados.filter(card => {
      return (card.checklist || []).length > 0 && (card.checklist || []).every(i => i.feito);
    }).length;

    const cardsPainelDireito = cardsFiltrados.filter(card => {
      const isConcluido = (card.checklist || []).length > 0 && (card.checklist || []).every(i => i.feito);
      if (this.activeFilterRight === 'abertos') return !isConcluido;
      if (this.activeFilterRight === 'concluidos') return isConcluido;
      return true;
    });

    const tasksRightHTML = cardsPainelDireito.map(card => {
      const isConcluido = (card.checklist || []).length > 0 && (card.checklist || []).every(i => i.feito);
      const tagCor = card.tag?.cor || '#E55A2B';

      return `
        <div class="ref-task-card">
          <div style="flex: 1;">
            <h5 style="margin: 0 0 4px 0; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;">${card.titulo}</h5>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: var(--ref-text-sub);">${card.descricao || 'Sem descrição'}</p>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="background: ${tagCor}1A; color: ${tagCor}; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">
                ${card.tag?.nome || 'Geral'}
              </span>
              <span style="font-size: 11px; color: var(--ref-text-sub);">${card.horario || 'Hoje 10:00 - 12:00'}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <div class="ref-task-check ${isConcluido ? 'checked' : ''}" onclick="Planejamento.toggleCardConcluido('${card.id}')" title="Marcar Concluído">
              ${isConcluido ? '<i data-lucide="check" style="width: 14px; height: 14px;"></i>' : ''}
            </div>
            <button onclick="Planejamento.deletarCard('${card.id}')" style="background: none; border: none; color: var(--ref-text-sub); cursor: pointer; padding: 2px;">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="ref-dashboard-wrapper" style="margin: 0; width: 100%; max-width: 100%; padding: 0;">
        <div style="padding: 16px 24px 0 24px;">
          ${switcherHTML}
        </div>
        
        <!-- Corpo Principal (Main Content + Right Panel) -->
        <div class="ref-body-layout-nosidebar">
          
          <!-- Coluna Principal (Conteúdo & Cards Re-enquadrados) -->
          <main class="ref-main-content-nosidebar">
            
            <!-- Projetos & Caixas Top Bento Grid -->
            <div class="ref-section-header">
              <div>
                <h3 class="ref-section-title">Caixas Organizadoras</h3>
                <div class="ref-section-sub">Clique em uma caixa para abrir e visualizar seus cards armazenados abaixo</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="ref-search-bar">
                  <i data-lucide="search" class="ref-search-icon"></i>
                  <input type="text" class="ref-search-input" placeholder="Buscar cards..." value="${this.searchQuery}" oninput="Planejamento.filtrar(this.value)">
                </div>
                <button class="btn-ref-add" onclick="Planejamento.openModalCriarCaixa()">
                  <i data-lucide="plus" style="width: 16px; height: 16px;"></i> Nova Caixa
                </button>
              </div>
            </div>

            <!-- Grid de Caixas Fechadas/Abertas -->
            <div class="ref-cards-grid">
              ${heroCardsHTML}
            </div>

            <!-- SEÇÃO INFERIOR RE-ENQUADRADA (ESTILO IMAGEM 3 - ULTRA PREMIUM CARDS) -->
            <div class="ref-bottom-re-enquadrado">
              <div class="ref-bottom-header-row">
                <h3 class="ref-bottom-caixa-title">
                  <span style="width: 12px; height: 12px; border-radius: 50%; background: ${caixaAtiva?.cor || 'var(--ref-primary)'};"></span>
                  ${caixaAtiva ? caixaAtiva.nome : 'Cards Guardados'}
                  <span style="font-size: 13px; font-weight: 600; color: var(--ref-text-sub); font-family: var(--font-main);">(${cardsDaCaixaAtiva.length} cards armazenados)</span>
                </h3>

                <button class="btn-ref-add" onclick="Planejamento.openModalCriarCardComCaixa('${caixaAtiva?.id}')">
                  <i data-lucide="plus" style="width: 16px; height: 16px;"></i> Novo Card Nesta Caixa
                </button>
              </div>

              <!-- Grid de Cards do Design da Imagem 3 -->
              <div class="img3-cards-grid">
                ${cardsDaCaixaAtiva.length > 0 ? img3CardsHTML : `
                  <div style="grid-column: 1 / -1; text-align: center; padding: 60px 24px; color: var(--ref-text-sub); border: 2px dashed var(--ref-border); border-radius: 24px;">
                    <i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 12px; color: var(--ref-primary);"></i>
                    <h4 style="margin: 0 0 6px 0; font-family: 'Outfit', sans-serif; font-size: 18px; color: var(--ref-text);">Esta caixa está vazia</h4>
                    <p style="margin: 0 0 16px 0; font-size: 13px;">Adicione o primeiro card de conteúdo para esta caixa organizadora.</p>
                    <button class="btn-ref-add" onclick="Planejamento.openModalCriarCardComCaixa('${caixaAtiva?.id}')">
                      <i data-lucide="plus" style="width: 16px; height: 16px;"></i> Adicionar Primeiro Card
                    </button>
                  </div>
                `}
              </div>
            </div>

          </main>

          <!-- Coluna Direita (Tarefas de Hoje / Right Task Panel) -->
          <aside class="ref-right-panel">
            <div class="ref-panel-tabs">
              <div class="ref-panel-tab ${this.activeTabRight === 'messages' ? 'active' : ''}" onclick="Planejamento.changeRightTab('messages')">Mensagens</div>
              <div class="ref-panel-tab ${this.activeTabRight === 'cards' ? 'active' : ''}" onclick="Planejamento.changeRightTab('cards')">Cards do Dia</div>
              <div class="ref-panel-tab ${this.activeTabRight === 'activities' ? 'active' : ''}" onclick="Planejamento.changeRightTab('activities')">Atividades</div>
            </div>

            ${this.activeTabRight === 'cards' ? `
              <div class="ref-panel-header">
                <h4 class="ref-panel-title">Tarefas de Hoje</h4>
                <button class="btn-ref-add" onclick="Planejamento.openModalCriarCard()" style="font-size: 12px; padding: 6px 12px;">
                  <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Card
                </button>
              </div>

              <div class="ref-filters-row">
                <span class="ref-filter-pill ${this.activeFilterRight === 'todos' ? 'active' : ''}" onclick="Planejamento.changeRightFilter('todos')">Todos ${cntTodos}</span>
                <span class="ref-filter-pill ${this.activeFilterRight === 'abertos' ? 'active' : ''}" onclick="Planejamento.changeRightFilter('abertos')">Abertos ${cntAbertos}</span>
                <span class="ref-filter-pill ${this.activeFilterRight === 'concluidos' ? 'active' : ''}" onclick="Planejamento.changeRightFilter('concluidos')">Concluídos ${cntConcluidos}</span>
              </div>

              <div class="ref-task-list">
                ${tasksRightHTML.length > 0 ? tasksRightHTML : `
                  <div style="text-align: center; padding: 40px 0; color: var(--ref-text-sub);">
                    <i data-lucide="check-circle-2" style="width: 36px; height: 36px; margin-bottom: 8px; color: var(--ref-primary);"></i>
                    <p style="margin: 0; font-size: 13px;">Nenhum card agendado para hoje.</p>
                  </div>
                `}
              </div>
            ` : this.activeTabRight === 'messages' ? `
              <div class="ref-panel-header">
                <h4 class="ref-panel-title">Chat de Feedbacks</h4>
              </div>
              <div class="ref-chat-messages-container" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; padding-bottom: 8px; min-height: 480px;">
                <div class="ref-chat-list" style="overflow-y: auto; flex: 1; padding: 10px 0; display: flex; flex-direction: column; gap: 12px; max-height: 440px;">
                  ${this.mensagens.map(msg => `
                    <div class="chat-msg-bubble" style="background: ${msg.autor.includes('Você') ? 'rgba(229, 90, 43, 0.08)' : '#F8F6F1'}; border: 1px solid ${msg.autor.includes('Você') ? 'rgba(229, 90, 43, 0.15)' : 'var(--ref-border)'}; padding: 10px 12px; border-radius: 16px; margin-right: ${msg.autor.includes('Você') ? '8px' : '32px'}; margin-left: ${msg.autor.includes('Você') ? '32px' : '8px'};">
                      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: ${msg.autor.includes('Você') ? 'var(--ref-primary)' : 'var(--ref-text)'}; margin-bottom: 4px;">
                        <span>${msg.autor}</span>
                        <span style="font-weight: 500; color: var(--ref-text-sub);">${msg.hora}</span>
                      </div>
                      <div style="font-size: 13px; line-height: 1.45; color: var(--ref-text);">${msg.texto}</div>
                    </div>
                  `).join('')}
                </div>
                
                <div style="display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid var(--ref-border); background: #FAF8F5; margin-top: auto;">
                  <input type="text" id="chat-input-text" placeholder="Escreva uma mensagem..." style="flex: 1; background: #FFF; border: 1px solid var(--ref-border); border-radius: 12px; padding: 8px 12px; font-size: 13px; color: var(--ref-text); outline: none;" onkeydown="if(event.key === 'Enter') { Planejamento.enviarMensagem(this.value); this.value=''; }">
                  <button type="button" onclick="const input = document.getElementById('chat-input-text'); Planejamento.enviarMensagem(input.value); input.value='';" style="background: var(--ref-primary); border: none; border-radius: 12px; padding: 8px 12px; color: #FFF; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i data-lucide="send" style="width: 15px; height: 15px;"></i>
                  </button>
                </div>
              </div>
            ` : `
              <div class="ref-panel-header">
                <h4 class="ref-panel-title">Atividades Recentes</h4>
              </div>
              <div class="ref-activities-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding-top: 10px; max-height: 480px;">
                ${this.atividades.map(act => `
                  <div style="display: flex; gap: 10px; align-items: flex-start; padding: 0 4px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--ref-primary); margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 0 3px rgba(229, 90, 43, 0.15);"></div>
                    <div style="flex: 1;">
                      <div style="font-size: 13px; font-weight: 500; color: var(--ref-text); line-height: 1.45;">${act.texto}</div>
                      <div style="font-size: 10px; color: var(--ref-text-sub); margin-top: 2px;">${act.hora}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </aside>

        </div>
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  zoomCanvas(direction, factor = 0.15) {
    if (direction === 'in') {
      this.canvasZoom = Math.min(3.0, this.canvasZoom + factor);
    } else if (direction === 'out') {
      this.canvasZoom = Math.max(0.2, this.canvasZoom - factor);
    }
    const transformEl = document.getElementById('canvas-transform-layer');
    const zoomInd = document.getElementById('canvas-zoom-indicator');
    const viewport = document.getElementById('canvas-viewport');
    if (transformEl) {
      transformEl.style.transform = `translate(${this.canvasPan.x}px, ${this.canvasPan.y}px) scale(${this.canvasZoom})`;
    }
    if (viewport) {
      viewport.style.setProperty('--grid-size', `${24 * this.canvasZoom}px`);
      viewport.style.setProperty('--grid-offset-x', `${this.canvasPan.x}px`);
      viewport.style.setProperty('--grid-offset-y', `${this.canvasPan.y}px`);
    }
    if (zoomInd) {
      zoomInd.textContent = `${Math.round(this.canvasZoom * 100)}%`;
    }
  },

  zoomCanvasFit() {
    if (this.canvasNodes.length === 0) {
      this.canvasPan = { x: 0, y: 0 };
      this.canvasZoom = 1.0;
      this.render();
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    this.canvasNodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    });
    const width = Math.max(400, maxX - minX + 120);
    const height = Math.max(400, maxY - minY + 120);
    const viewportEl = document.getElementById('canvas-viewport');
    const vw = viewportEl ? viewportEl.clientWidth : 1000;
    const vh = viewportEl ? viewportEl.clientHeight : 600;

    const zoomX = vw / width;
    const zoomY = vh / height;
    this.canvasZoom = Math.max(0.3, Math.min(1.4, Math.min(zoomX, zoomY)));
    this.canvasPan.x = (vw - (maxX + minX) * this.canvasZoom) / 2;
    this.canvasPan.y = (vh - (maxY + minY) * this.canvasZoom) / 2;

    const transformEl = document.getElementById('canvas-transform-layer');
    const zoomInd = document.getElementById('canvas-zoom-indicator');
    const viewport = document.getElementById('canvas-viewport');
    if (transformEl) {
      transformEl.style.transform = `translate(${this.canvasPan.x}px, ${this.canvasPan.y}px) scale(${this.canvasZoom})`;
    }
    if (viewport) {
      viewport.style.setProperty('--grid-size', `${24 * this.canvasZoom}px`);
      viewport.style.setProperty('--grid-offset-x', `${this.canvasPan.x}px`);
      viewport.style.setProperty('--grid-offset-y', `${this.canvasPan.y}px`);
    }
    if (zoomInd) {
      zoomInd.textContent = `${Math.round(this.canvasZoom * 100)}%`;
    }
  },

  exportCanvasJSON() {
    const obsidianData = {
      nodes: this.canvasNodes.map(n => ({
        id: n.id,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        type: n.type === 'file' ? 'file' : (n.type === 'link' ? 'link' : (n.type === 'group' ? 'group' : 'text')),
        text: n.text || n.title || '',
        url: n.url || ''
      })),
      edges: this.canvasEdges.map(e => ({
        id: e.id,
        fromNode: e.fromNode,
        fromSide: e.fromAnchor,
        toNode: e.toNode,
        toSide: e.toAnchor,
        color: e.color,
        label: e.label
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obsidianData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tomada_planejamento_canvas_${Date.now()}.canvas`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (typeof Components !== 'undefined') Components.toast('Canvas exportado no formato Obsidian (.canvas)!', 'success');
  },

  exportCanvasPNG() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1600;
    canvas.height = 1000;

    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.canvasNodes.forEach(node => {
      ctx.fillStyle = node.type === 'group' ? 'rgba(248,246,241,0.8)' : '#FFFFFF';
      ctx.strokeStyle = '#EBE5DF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, node.width, node.height, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1C1A14';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(node.title || 'Nó', node.x + 16, node.y + 30);

      if (node.text) {
        ctx.fillStyle = '#7A7567';
        ctx.font = '12px sans-serif';
        ctx.fillText((node.text || '').slice(0, 40) + '...', node.x + 16, node.y + 55);
      }
    });

    const link = document.createElement('a');
    link.download = `tomada_canvas_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    if (typeof Components !== 'undefined') Components.toast('Imagem PNG gerada!', 'success');
  },

  // MODAIS E FORMULÁRIOS NO PADRÃO DE DESIGN PREMIUM DO SISTEMA (premium-task-modal)
  openModalCriarCardComCaixa(caixaId) {
    this.openModalCardForm(null, caixaId);
  },

  openModalCriarCaixa() {
    this.openModalCriarEditarCaixaForm();
  },

  openModalEditarCaixa(caixaId) {
    const caixa = this.caixas.find(c => c.id === caixaId);
    if (caixa) {
      this.openModalCriarEditarCaixaForm(caixa);
    }
  },

  openModalCriarEditarCaixaForm(caixaExistente = null) {
    if (typeof Components === 'undefined') { console.error('[PLANEJAMENTO] Components não encontrado!'); return; }

    const isEdit = !!caixaExistente;

    const modalHTML = `
      <form id="form-caixa-planejamento" onsubmit="Planejamento.handleSalvarCaixa(event, '${caixaExistente ? caixaExistente.id : ''}')" class="premium-desktop-form">
        <div class="p-bento-container" style="grid-template-columns: 1fr; gap: 16px;">
          <div class="p-bento-card">
            <h4 class="p-bento-title"><i data-lucide="folder"></i> Detalhes da Caixa Organizadora</h4>
            
            <div class="p-form-group">
              <label>Nome da Caixa</label>
              <input type="text" id="cx-nome" class="p-input" value="${caixaExistente?.nome || ''}" placeholder="Ex: 🎬 Ideias de Reels, 📝 Roteiros Em Escrita" required>
            </div>

            <div class="p-form-group">
              <label>Cor Temática</label>
              <div style="display: flex; gap: 12px; align-items: center;">
                <input type="color" id="cx-cor" value="${caixaExistente?.cor || '#E55A2B'}" style="width: 60px; height: 44px; border-radius: 12px; border: 1px solid var(--ref-border); cursor: pointer; padding: 2px;">
                <span style="font-size: 13px; color: var(--ref-text-sub);">Cor utilizada nos destaques visuais do painel</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    `;

    const deleteBtn = isEdit ? `<button type="button" class="btn-premium-danger" onclick="Planejamento.deletarCaixa('${caixaExistente.id}')">Excluir Caixa</button>` : '';

    const actionsHTML = `
      ${deleteBtn}
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="submit" form="form-caixa-planejamento" class="btn-premium-primary">${isEdit ? 'Salvar Alterações' : 'Criar Caixa'}</button>
    `;

    Components.showModal(isEdit ? 'Editar Caixa Organizadora' : 'Criar Nova Caixa Organizadora', modalHTML, actionsHTML, 'premium-task-modal');
    if (window.lucide) lucide.createIcons();
  },

  handleSalvarCaixa(event, editId) {
    event.preventDefault();
    const nome = document.getElementById('cx-nome').value;
    const cor = document.getElementById('cx-cor').value;

    if (editId) {
      const caixa = this.caixas.find(c => c.id === editId);
      if (caixa) {
        caixa.nome = nome;
        caixa.cor = cor;
      }
    } else {
      const temas = ['theme-orange', 'theme-dark', 'theme-purple', 'theme-green'];
      const novaCaixa = {
        id: 'cx_' + Date.now(),
        nome,
        cor,
        tema: temas[Math.floor(Math.random() * temas.length)],
        aberta: true
      };
      this.caixas.push(novaCaixa);
      this.activeCaixaId = novaCaixa.id;
    }

    this.salvarCaixas();
    this.registrarAtividade(editId ? `Caixa Organizadora "${nome}" atualizada.` : `Caixa Organizadora "${nome}" criada.`);
    Components.closeModal();
    this.render();
    if (typeof Components !== 'undefined') Components.toast(editId ? 'Caixa atualizada com sucesso!' : 'Caixa criada com sucesso!', 'success');
  },

  openModalCriarCard() {
    this.openModalCardForm();
  },

  openModalEditarCard(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (card) {
      this.openModalCardForm(card);
    }
  },

  openModalCardForm(cardExistente = null, targetCaixaId = null) {
    if (typeof Components === 'undefined') { console.error('[PLANEJAMENTO] Components não encontrado!'); return; }

    this.tempCardId = cardExistente ? cardExistente.id : '';
    const isEdit = !!cardExistente;
    const defaultCaixaId = targetCaixaId || (cardExistente ? cardExistente.caixaId : (this.activeCaixaId || this.caixas[0]?.id || ''));
    this.tempCaixaId = defaultCaixaId;
    this.tempSEOData = cardExistente?.seoText ? { seoText: cardExistente.seoText, seoStats: cardExistente.seoStats } : null;

    const caixasOptions = this.caixas.map(cx => `
      <option value="${cx.id}" ${defaultCaixaId === cx.id ? 'selected' : ''}>${cx.nome}</option>
    `).join('');

    const tagColorsHTML = this.tagColors.map(tc => `
      <button type="button" onclick="Planejamento.selecionarCorTag('${tc.hex}')" style="width: 32px; height: 32px; border-radius: 50%; background: ${tc.hex}; border: 2px solid #FFFFFF; box-shadow: 0 0 0 1px #EBE5DF; cursor: pointer; transition: transform 0.15s;" title="${tc.name}" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"></button>
    `).join('');

    const currentTagCor = cardExistente?.tag?.cor || '#E55A2B';
    const currentTagName = cardExistente?.tag?.nome || '';

    const checklistItems = cardExistente?.checklist || [];
    const checklistInputsHTML = checklistItems.map((item) => `
      <div class="chk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
        <input type="text" class="card-chk-item p-input" value="${item.texto}" placeholder="Ex: Escrever roteiro" style="flex: 1;">
        <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
      </div>
    `).join('');

    const modalHTML = `
      <form id="form-card-planejamento" onsubmit="Planejamento.handleSalvarCard(event, '${cardExistente ? cardExistente.id : ''}')" class="premium-desktop-form">
        <div class="p-bento-container">
          
          <!-- Coluna Esquerda: Dados Principais e Checklist -->
          <div class="p-bento-col">
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="text-quote"></i> Informações do Conteúdo</h4>
              
              <div class="p-form-group">
                <label>Título do Conteúdo</label>
                <input type="text" id="card-titulo" class="p-input" value="${cardExistente?.titulo || ''}" placeholder="Ex: Como montar um estúdio gastando pouco" required>
              </div>

              <div class="p-form-group">
                <label>Caixa Organizadora Destino</label>
                <select id="card-caixa" class="p-input trello-select">
                  ${caixasOptions}
                </select>
              </div>

              <div class="p-form-group">
                <label style="display:flex; align-items:center; gap:6px;">
                  <i data-lucide="calendar" style="width:15px; height:15px; color:#E55A2B;"></i>
                  Data de Agendamento / Publicação
                </label>
                <input type="date" id="card-prazo" class="p-input" value="${cardExistente?.prazo || cardExistente?.data || new Date().toISOString().slice(0, 10)}" required style="background:#FFF;">
              </div>

              <div class="p-form-group">
                <label>Descrição / Briefing</label>
                <textarea id="card-descricao" class="p-input" rows="3" placeholder="Resumo da ideia, tópicos abordados, ganchos de roteiro...">${cardExistente?.descricao || ''}</textarea>
              </div>
            </div>

            <div class="p-bento-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 class="p-bento-title" style="margin-bottom: 0;"><i data-lucide="list-todo"></i> Checklist de Etapas</h4>
                <button type="button" onclick="Planejamento.addChecklistInputRow()" style="background: none; border: none; color: var(--ref-primary); font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i> Adicionar Etapa
                </button>
              </div>
              <div id="card-checklist-container">
                ${checklistInputsHTML.length > 0 ? checklistInputsHTML : `
                  <div class="chk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                    <input type="text" class="card-chk-item p-input" placeholder="Ex: Escrever roteiro" style="flex: 1;">
                    <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Coluna Direita: Thumbnail e Tags Personalizadas -->
          <div class="p-bento-col">
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="image"></i> Capa do Card (Thumbnail)</h4>
              <input type="hidden" id="card-thumb" value="${cardExistente?.thumbnail || ''}">
              <input type="file" id="card-thumb-file" accept="image/*" style="display: none;" onchange="Planejamento.handleThumbFileSelect(event)">
              <div id="card-thumb-dropzone" class="card-thumb-dropzone" 
                   onclick="document.getElementById('card-thumb-file').click()"
                   ondragover="Planejamento.handleThumbDragOver(event)"
                   ondragleave="Planejamento.handleThumbDragLeave(event)"
                   ondrop="Planejamento.handleThumbDrop(event)"
                   style="margin-top: 12px;">
                <img id="card-thumb-preview" src="${cardExistente?.thumbnail || ''}" style="width: 100%; height: 100%; object-fit: cover; display: ${cardExistente?.thumbnail ? 'block' : 'none'};">
                <div id="card-thumb-preview-placeholder" style="font-size: 11px; color: var(--ref-text-sub); display: ${cardExistente?.thumbnail ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-align: center; padding: 12px 8px; width: 100%; height: 100%; box-sizing: border-box;">
                  <span style="font-size: 24px; font-weight: 700; color: var(--ref-primary); line-height: 1; margin-bottom: 2px;">+</span>
                  <i data-lucide="upload-cloud" style="width: 22px; height: 22px; opacity: 0.7; color: var(--ref-primary);"></i>
                  <span style="font-weight: 600;">Clique ou arraste uma imagem aqui</span>
                </div>
              </div>
            </div>

            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="tag"></i> Tag Personalizada</h4>
              <div class="p-form-group">
                <label>Nome da Tag</label>
                <input type="text" id="card-tag-nome" class="p-input" value="${currentTagName}" placeholder="Ex: YouTube Longo, Shorts, Reels">
              </div>
              <div class="p-form-group">
                <label>Cor da Tag</label>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <input type="color" id="card-tag-cor" value="${currentTagCor}" style="width: 60px; height: 44px; border-radius: 12px; border: 1px solid var(--ref-border); cursor: pointer; padding: 2px;">
                  <span style="font-size: 13px; color: var(--ref-text-sub);">Escolha uma cor para a tag</span>
                </div>
              </div>
              <div style="margin-top: 16px;">
                <label style="display: block; font-size: 12px; font-weight: 700; color: var(--ref-text-sub); margin-bottom: 8px; text-transform: uppercase;">Cores Rápidas</label>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${tagColorsHTML}
                </div>
              </div>
            </div>

            <!-- Bento Card: Template de Card -->
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="copy"></i> Template de Card</h4>
              <div class="p-form-group">
                <label>Modelos Salvos</label>
                <div style="display: flex; gap: 8px;">
                  <select id="card-template-selector" class="p-input trello-select" onchange="Planejamento.carregarTemplatePlanejamento(this.value)" style="flex: 1;">
                    <option value="">Selecione um template...</option>
                    ${this.getTemplatesOptionsHTML()}
                  </select>
                  <button type="button" class="btn-premium-danger" onclick="Planejamento.excluirTemplatePlanejamento()" title="Excluir Template" style="padding: 0 12px; height: 44px; display: flex; align-items: center; justify-content: center; width: 44px; border-radius: 12px;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                  </button>
                </div>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button type="button" class="btn-premium-secondary" onclick="Planejamento.salvarComoTemplatePlanejamento()" style="flex: 1; font-size: 12px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i data-lucide="save" style="width: 14px; height: 14px;"></i>
                  Salvar Atual
                </button>
                <button type="button" class="btn-premium-primary" onclick="Planejamento.abrirModalAplicarEmMassa()" style="flex: 1; font-size: 12px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                  <i data-lucide="layers" style="width: 14px; height: 14px;"></i>
                  Aplicar em Massa
                </button>
              </div>
            </div>

          </div>

          <!-- SESSÃO ESPECIAL: OTIMIZAÇÃO & PACOTE SEO COM IA (Padrão Bento do Sistema) -->
          <div class="p-bento-card" style="grid-column: 1 / -1; background: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 20px; padding: 20px; color: #1C1A14;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(229, 90, 43, 0.12); color: var(--ref-primary, #E55A2B); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(229, 90, 43, 0.25);">
                  <i data-lucide="sparkles" style="width: 22px; height: 22px;"></i>
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #1C1A14; font-family: 'Outfit', sans-serif;">Pacote SEO de Alto Desempenho com IA</h4>
                  <span style="font-size: 11px; color: #64748B; font-weight: 500;">Gerar títulos virais, descrição otimizada, tags de alta busca e palavras-chave para o YouTube</span>
                </div>
              </div>

              <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <button type="button" id="btn-gerar-seo-card-modal" onclick="Planejamento.gerarSEOCardModal()" class="btn-premium-primary" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 10px; padding: 9px 18px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.3); transition: all 0.2s ease;">
                  <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> ✨ Gerar SEO com IA
                </button>

                <div style="position: relative; display: inline-block;">
                  <input type="file" id="audio-seo-card-modal-file" accept="audio/*,video/*" onchange="Planejamento.subirAudioParaSEOCardModal()" style="display: none;">
                  <label for="audio-seo-card-modal-file" id="btn-upload-audio-card-modal" class="btn-secondary" style="background: #FFFFFF; color: #1C1A14; border: 1px solid #EBE5DF; border-radius: 10px; padding: 9px 16px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: all 0.2s ease;">
                    <i data-lucide="mic" style="width: 15px; height: 15px; color: #10B981;"></i> 🎤 SEO Falado (Áudio)
                  </label>
                </div>
              </div>
            </div>

            <div id="seo-card-modal-result-root" style="${cardExistente?.seoText ? 'display: block;' : 'display: none;'} margin-top: 16px;">
              ${cardExistente?.seoText ? this.renderSEOResultCardHTML(cardExistente.seoText, cardExistente.seoStats) : ''}
            </div>
          </div>

        </div>
      </form>
    `;

    const deleteBtn = isEdit ? `<button type="button" class="btn-premium-danger" onclick="Planejamento.deletarCard('${cardExistente.id}')">Excluir Card</button>` : '';

    const actionsHTML = `
      ${deleteBtn}
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="submit" form="form-card-planejamento" class="btn-premium-primary">${isEdit ? 'Salvar Alterações' : 'Criar Card'}</button>
    `;

    Components.showModal(isEdit ? 'Editar Card de Conteúdo' : 'Novo Card de Conteúdo', modalHTML, actionsHTML, 'premium-task-modal');
    if (window.lucide) lucide.createIcons();

    // Inicializar mini pop-up customizado do select no padrão do sistema
    if (typeof HigPopovers !== 'undefined') {
      setTimeout(() => HigPopovers.init(), 50);
    }
  },

  selecionarCorTag(hex) {
    const inputCor = document.getElementById('card-tag-cor');
    if (inputCor) inputCor.value = hex;
  },

  atualizarPreviewThumb(url) {
    const img = document.getElementById('card-thumb-preview');
    const placeholder = document.getElementById('card-thumb-preview-placeholder');
    if (img && placeholder) {
      if (url && (url.startsWith('http') || url.startsWith('data:image/'))) {
        img.src = url;
        img.style.display = 'block';
        placeholder.style.setProperty('display', 'none', 'important');
      } else {
        img.style.display = 'none';
        placeholder.style.setProperty('display', 'flex', 'important');
      }
    }
  },

  getTemplatesOptionsHTML() {
    try {
      const templates = JSON.parse(localStorage.getItem('tomada_planejamento_templates') || '[]');
      return templates.map(t => `<option value="${t.nome}">${t.nome}</option>`).join('');
    } catch (e) {
      return '';
    }
  },

  salvarComoTemplatePlanejamento() {
    if (typeof Components === 'undefined') return;

    // Coletar checklist atual
    const chkElements = document.querySelectorAll('.card-chk-item');
    const checklist = [];
    chkElements.forEach(input => {
      const val = input.value.trim();
      if (val) checklist.push({ texto: val, feito: false });
    });

    this.tempTemplateSaveData = {
      titulo: document.getElementById('card-titulo').value,
      descricao: document.getElementById('card-descricao').value,
      thumbnail: document.getElementById('card-thumb').value,
      tag: {
        nome: document.getElementById('card-tag-nome').value,
        cor: document.getElementById('card-tag-cor').value
      },
      checklist
    };

    const modalHTML = `
      <div class="premium-desktop-form" style="padding: 4px;">
        <div class="p-form-group" style="margin-bottom: 0;">
          <label style="font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--ref-text); display: block; margin-bottom: 8px;">Nome do Template</label>
          <input type="text" id="temp-template-name" class="p-input" placeholder="Ex: Modelo de Roteiro Padrão" required style="width: 100%; border: 1px solid var(--ref-border); border-radius: 12px; padding: 12px; font-size: 14px; background: #FFF;">
        </div>
      </div>
    `;

    const actionsHTML = `
      <button type="button" class="btn-premium-secondary" onclick="Planejamento.cancelarSalvarTemplate()">Cancelar</button>
      <button type="button" class="btn-premium-primary" onclick="Planejamento.confirmarSalvarTemplatePlanejamento()">Salvar Template</button>
    `;

    Components.showModal('Salvar como Template', modalHTML, actionsHTML, 'premium-task-modal');
  },

  confirmarSalvarTemplatePlanejamento() {
    const inputNome = document.getElementById('temp-template-name');
    if (!inputNome || !inputNome.value.trim()) {
      alert('Por favor, digite um nome para o template.');
      return;
    }

    const nome = inputNome.value.trim();
    const data = this.tempTemplateSaveData;
    if (!data) return;

    const templates = JSON.parse(localStorage.getItem('tomada_planejamento_templates') || '[]');

    const novoTemplate = {
      nome,
      titulo: data.titulo,
      descricao: data.descricao,
      thumbnail: data.thumbnail,
      tag: data.tag,
      checklist: data.checklist
    };

    const idx = templates.findIndex(t => t.nome.toLowerCase() === nome.toLowerCase());
    if (idx >= 0) {
      templates[idx] = novoTemplate;
    } else {
      templates.push(novoTemplate);
    }

    localStorage.setItem('tomada_planejamento_templates', JSON.stringify(templates));

    Components.closeModal();

    // Reabrir o modal do card restaurando o estado
    const cardFake = {
      id: this.tempCardId || '',
      titulo: data.titulo,
      descricao: data.descricao,
      thumbnail: data.thumbnail,
      tag: data.tag,
      checklist: data.checklist
    };

    setTimeout(() => {
      this.openModalCardForm(cardFake.id ? cardFake : null, cardFake.id ? null : this.tempCaixaId);
      
      // Forçar atualização do selector de templates para mostrar o novo modelo
      setTimeout(() => {
        const selector = document.getElementById('card-template-selector');
        if (selector) {
          selector.innerHTML = '<option value="">Selecione um template...</option>' + this.getTemplatesOptionsHTML();
          selector.value = nome;
          selector.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 50);
    }, 100);

    if (typeof Components !== 'undefined') Components.toast('Template de card saved!', 'success');
  },

  cancelarSalvarTemplate() {
    Components.closeModal();
    const data = this.tempTemplateSaveData;
    if (!data) return;

    // Voltar para o modal do card
    const cardFake = {
      id: this.tempCardId || '',
      titulo: data.titulo,
      descricao: data.descricao,
      thumbnail: data.thumbnail,
      tag: data.tag,
      checklist: data.checklist
    };

    setTimeout(() => {
      this.openModalCardForm(cardFake.id ? cardFake : null, cardFake.id ? null : this.tempCaixaId);
    }, 100);
  },

  carregarTemplatePlanejamento(nome) {
    if (!nome) return;
    const templates = JSON.parse(localStorage.getItem('tomada_planejamento_templates') || '[]');
    const t = templates.find(x => x.nome === nome);
    if (!t) return;

    document.getElementById('card-titulo').value = t.titulo || '';
    document.getElementById('card-descricao').value = t.descricao || '';
    document.getElementById('card-thumb').value = t.thumbnail || '';
    this.atualizarPreviewThumb(t.thumbnail || '');
    document.getElementById('card-tag-nome').value = t.tag?.nome || '';
    document.getElementById('card-tag-cor').value = t.tag?.cor || '#E55A2B';

    // Reconstruir checklist
    const container = document.getElementById('card-checklist-container');
    if (container) {
      container.innerHTML = '';
      const items = t.checklist || [];
      if (items.length > 0) {
        items.forEach(item => {
          const div = document.createElement('div');
          div.className = 'chk-input-row';
          div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
          div.innerHTML = `
            <input type="text" class="card-chk-item p-input" value="${item.texto}" placeholder="Ex: Escrever roteiro" style="flex: 1;">
            <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
          `;
          container.appendChild(div);
        });
      } else {
        // Linha vazia padrão
        container.innerHTML = `
          <div class="chk-input-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
            <input type="text" class="card-chk-item p-input" placeholder="Ex: Escrever roteiro" style="flex: 1;">
            <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
          </div>
        `;
      }
    }
  },

  excluirTemplatePlanejamento() {
    const selector = document.getElementById('card-template-selector');
    if (!selector || !selector.value) {
      if (typeof Components !== 'undefined') Components.toast('Selecione um template para excluir.', 'warning');
      return;
    }

    const nome = selector.value;
    if (!confirm(`Deseja realmente excluir o template "${nome}"?`)) return;

    let templates = JSON.parse(localStorage.getItem('tomada_planejamento_templates') || '[]');
    templates = templates.filter(t => t.nome !== nome);
    localStorage.setItem('tomada_planejamento_templates', JSON.stringify(templates));

    selector.innerHTML = '<option value="">Selecione um template...</option>' + this.getTemplatesOptionsHTML();
    selector.value = '';
    
    // Forçar atualização do seletor estilizado
    selector.dispatchEvent(new Event('change', { bubbles: true }));

    if (typeof Components !== 'undefined') Components.toast('Template excluído!', 'success');
  },

  abrirModalAplicarEmMassa() {
    if (typeof Components === 'undefined') return;

    // Validar se tem dados para replicar
    const titulo = document.getElementById('card-titulo').value.trim();
    if (!titulo) {
      alert('Por favor, defina um Título para o card antes de aplicar em massa.');
      return;
    }

    // HTML para criar novos cards nas caixas
    const caixasCheckboxes = this.caixas.map(cx => `
      <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #F8F6F1; border: 1px solid var(--ref-border); border-radius: 12px; margin-bottom: 8px; cursor: pointer;">
        <input type="checkbox" name="caixa-replica" value="${cx.id}" style="width: 18px; height: 18px; accent-color: var(--ref-primary);">
        <span style="font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--ref-text);">${cx.nome}</span>
      </label>
    `).join('');

    // HTML para aplicar em cards existentes
    let cardsAgrupadosHTML = this.caixas.map(cx => {
      const cardsDaCx = this.cards.filter(c => c.caixaId === cx.id && c.id !== this.tempCardId);
      if (cardsDaCx.length === 0) return '';
      
      const cardsInputs = cardsDaCx.map(card => `
        <label style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #FFF; border: 1px solid var(--ref-border); border-radius: 10px; margin-bottom: 4px; cursor: pointer;">
          <input type="checkbox" name="card-replica-existente" value="${card.id}" style="width: 16px; height: 16px; accent-color: var(--ref-primary);">
          <span style="font-family: var(--font-main); font-size: 13px; color: var(--ref-text); font-weight: 600;">${card.titulo}</span>
        </label>
      `).join('');

      return `
        <div style="margin-bottom: 16px;">
          <div style="font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px; color: var(--ref-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cx.cor};"></span>
            ${cx.nome}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; margin-left: 14px;">
            ${cardsInputs}
          </div>
        </div>
      `;
    }).join('');

    if (!cardsAgrupadosHTML.trim()) {
      cardsAgrupadosHTML = `<div style="text-align: center; padding: 20px; color: var(--ref-text-sub); font-size: 13px;">Nenhum outro card existente encontrado para atualizar.</div>`;
    }

    const modalHTML = `
      <div class="premium-desktop-form" style="padding: 4px;">
        <div class="p-form-group" style="margin-bottom: 16px;">
          <label style="font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--ref-text); display: block; margin-bottom: 8px;">Tipo de Operação</label>
          <select id="replica-tipo-operacao" class="p-input" onchange="Planejamento.alternarPainelReplica(this.value)" style="width: 100%; border: 1px solid var(--ref-border); border-radius: 12px; padding: 12px; font-size: 14px; background: #FFF;">
            <option value="criar">Replicar Card (Criar novo em outras Caixas)</option>
            <option value="atualizar">Aplicar Atributos (Checklist/Tags em Cards Existentes)</option>
          </select>
        </div>

        <!-- Painel 1: Criar Novos Cards -->
        <div id="painel-replica-criar" style="display: block;">
          <p style="font-size: 13px; color: var(--ref-text-sub); margin-bottom: 12px;">
            Selecione as caixas onde deseja criar um novo card idêntico a este (sem capa).
          </p>
          <div style="max-height: 220px; overflow-y: auto;">
            ${caixasCheckboxes}
          </div>
        </div>

        <!-- Painel 2: Atualizar Cards Existentes -->
        <div id="painel-replica-atualizar" style="display: none;">
          <p style="font-size: 13px; color: var(--ref-text-sub); margin-bottom: 12px;">
            Selecione os cards existentes que devem receber a mesma <strong>tag</strong> e o mesmo <strong>checklist</strong> deste card.
          </p>
          <div style="max-height: 220px; overflow-y: auto; padding-right: 4px;">
            ${cardsAgrupadosHTML}
          </div>
        </div>
      </div>
    `;

    const actionsHTML = `
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="button" class="btn-premium-primary" onclick="Planejamento.executarAplicarEmMassa()">Confirmar Operação</button>
    `;

    // Salvar temporariamente os dados atuais para replicação
    const chkElements = document.querySelectorAll('.card-chk-item');
    const checklist = [];
    chkElements.forEach(input => {
      const val = input.value.trim();
      if (val) checklist.push({ texto: val, feito: false });
    });

    this.tempReplicaData = {
      titulo,
      descricao: document.getElementById('card-descricao').value,
      tag: {
        nome: document.getElementById('card-tag-nome').value,
        cor: document.getElementById('card-tag-cor').value
      },
      checklist
    };

    Components.showModal('Aplicar em Massa', modalHTML, actionsHTML, 'premium-task-modal');
  },

  alternarPainelReplica(tipo) {
    const painelCriar = document.getElementById('painel-replica-criar');
    const painelAtualizar = document.getElementById('painel-replica-atualizar');
    if (painelCriar && painelAtualizar) {
      if (tipo === 'criar') {
        painelCriar.style.display = 'block';
        painelAtualizar.style.display = 'none';
      } else {
        painelCriar.style.display = 'none';
        painelAtualizar.style.display = 'block';
      }
    }
  },

  executarAplicarEmMassa() {
    const tipo = document.getElementById('replica-tipo-operacao')?.value || 'criar';
    const data = this.tempReplicaData;
    if (!data) return;

    if (tipo === 'criar') {
      const checkboxes = document.querySelectorAll('input[name="caixa-replica"]:checked');
      if (checkboxes.length === 0) {
        alert('Por favor, selecione ao menos uma caixa.');
        return;
      }

      checkboxes.forEach(cb => {
        const caixaId = cb.value;
        const novoCard = {
          id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          caixaId,
          titulo: data.titulo,
          descricao: data.descricao,
          thumbnail: '', // Imagem EXCLUÍDA na replicação em massa conforme pedido
          tag: { nome: data.tag.nome, cor: data.tag.cor },
          horario: 'Hoje 14:00 - 15:30',
          checklist: data.checklist.map(item => ({ ...item })), // Clonar etapas
          criadoEm: new Date().toISOString()
        };
        this.cards.push(novoCard);
      });

      this.salvarCards();
      Components.closeModal();
      this.render();

      if (typeof Components !== 'undefined') {
        Components.toast(`Replicado em massa para ${checkboxes.length} caixas!`, 'success');
      }
    } else {
      const checkboxes = document.querySelectorAll('input[name="card-replica-existente"]:checked');
      if (checkboxes.length === 0) {
        alert('Por favor, selecione ao menos um card.');
        return;
      }

      checkboxes.forEach(cb => {
        const cardId = cb.value;
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
          card.tag = { nome: data.tag.nome, cor: data.tag.cor };
          card.checklist = data.checklist.map(item => ({ ...item }));
        }
      });

      this.salvarCards();
      Components.closeModal();
      this.render();

      if (typeof Components !== 'undefined') {
        Components.toast(`Atributos (Tag/Checklist) replicados em massa para ${checkboxes.length} cards!`, 'success');
      }
    }
  },

  addChecklistInputRow() {
    const container = document.getElementById('card-checklist-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'chk-input-row';
    div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';
    div.innerHTML = `
      <input type="text" class="card-chk-item p-input" placeholder="Nova etapa do checklist..." style="flex: 1;">
      <button type="button" onclick="this.parentElement.remove()" style="background: none; border: 1px solid var(--ref-border); color: #EF4444; border-radius: 12px; padding: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 44px; width: 44px;">✕</button>
    `;
    container.appendChild(div);
  },

  handleSalvarCard(event, editId) {
    event.preventDefault();

    const titulo = document.getElementById('card-titulo').value;
    const caixaId = document.getElementById('card-caixa').value;
    const descricao = document.getElementById('card-descricao').value;
    const thumbnail = document.getElementById('card-thumb').value;

    const tagNome = document.getElementById('card-tag-nome').value || 'Geral';
    const tagCor = document.getElementById('card-tag-cor').value || '#E55A2B';
    const prazo = document.getElementById('card-prazo')?.value || new Date().toISOString().slice(0, 10);

    const chkElements = document.querySelectorAll('.card-chk-item');
    const checklist = [];
    chkElements.forEach(input => {
      const val = input.value.trim();
      if (val) checklist.push({ texto: val, feito: false });
    });

    if (editId) {
      const card = this.cards.find(c => c.id === editId);
      if (card) {
        card.titulo = titulo;
        card.caixaId = caixaId;
        card.descricao = descricao;
        card.thumbnail = thumbnail;
        card.prazo = prazo;
        card.data = prazo;
        card.tag = { nome: tagNome, cor: tagCor };
        card.checklist = checklist;
        if (this.tempSEOData) {
          card.seoText = this.tempSEOData.seoText;
          card.seoStats = this.tempSEOData.seoStats;
        }
      }
    } else {
      const novoCard = {
        id: 'card_' + Date.now(),
        caixaId,
        titulo,
        descricao,
        thumbnail,
        prazo,
        data: prazo,
        tag: { nome: tagNome, cor: tagCor },
        horario: 'Hoje 14:00 - 15:30',
        checklist,
        criadoEm: new Date().toISOString(),
        seoText: this.tempSEOData ? this.tempSEOData.seoText : null,
        seoStats: this.tempSEOData ? this.tempSEOData.seoStats : null
      };
      this.cards.push(novoCard);
    }
    this.tempSEOData = null;

    this.activeCaixaId = caixaId;
    this.salvarCards();
    this.registrarAtividade(editId ? `Card "${titulo}" atualizado.` : `Card "${titulo}" criado.`);
    Components.closeModal();
    this.render();
    if (typeof Components !== 'undefined') Components.toast(editId ? 'Card atualizado!' : 'Novo card criado com sucesso!', 'success');
  },

  // ──────────────────────────────────────────────────────────────
  // EXPORTAÇÃO PARA O CRONOGRAMA / KANBAN COM DIAS DE REPETIÇÃO
  // ──────────────────────────────────────────────────────────────
  exportarCardCaixaParaCronograma(cardId) {
    const card = (this.cards || []).find(c => c.id === cardId);
    if (!card) return;
    this.exportarParaCronogramaModal({
      titulo: card.titulo,
      descricao: card.descricao,
      thumbnail: card.thumbnail,
      tags: card.tag ? [card.tag.nome] : [],
      checklist: card.checklist
    });
  },

  verRoteiroSugestao(sugId) {
    return this.verRoteiroRecomendacao(sugId);
  },

  enviarSugestaoParaCanva(sugId) {
    const sug = (this.sugestoesList || []).find(s => s.id === sugId) || 
                (this.recomendacoesList || []).find(r => r.id === sugId) ||
                (this.sugestoesCache && this.sugestoesCache.sugestoesList ? this.sugestoesCache.sugestoesList.find(s => s.id === sugId) : null);
    if (!sug) return;

    const tituloInput = document.getElementById(`modal-sugestao-titulo-${sugId}`);
    const ganchoInput = document.getElementById(`modal-sugestao-gancho-${sugId}`);
    const roteiroInput = document.getElementById(`modal-sugestao-roteiro-${sugId}`);

    const tituloVal = tituloInput ? tituloInput.value.trim() : sug.titulo;
    const ganchoVal = ganchoInput ? ganchoInput.value.trim() : sug.gancho;
    const roteiroVal = roteiroInput ? roteiroInput.value.trim() : (sug.roteiro || '');

    const newId = 'node_' + Date.now();
    const novoNo = {
      id: newId,
      type: 'text',
      x: 120 + ((this.canvasNodes || []).length * 30),
      y: 120 + ((this.canvasNodes || []).length * 20),
      width: 340,
      height: 220,
      title: '⚡ ' + tituloVal,
      text: `<b>Gancho:</b> ${ganchoVal}<br><br><b>Estrutura:</b><br>${roteiroVal.replace(/\n/g, '<br>')}`
    };

    if (!this.canvasNodes) this.canvasNodes = [];
    this.canvasNodes.push(novoNo);
    this.canvasSelectedNodeIds = [newId];
    this.salvarDadosCanvas();
    this.setSubAba('canvas');
    if (typeof Components !== 'undefined') {
      Components.toast(`✨ Ideia "${tituloVal}" enviada para o Canva!`, 'success');
      Components.closeModal();
    }
  },

  importarSugestaoParaCaixa(sugId) {
    const sug = (this.sugestoesList || []).find(s => s.id === sugId) || 
                (this.recomendacoesList || []).find(r => r.id === sugId) ||
                (this.sugestoesCache && this.sugestoesCache.sugestoesList ? this.sugestoesCache.sugestoesList.find(s => s.id === sugId) : null);
    if (!sug) return;

    const tituloInput = document.getElementById(`modal-sugestao-titulo-${sugId}`);
    const ganchoInput = document.getElementById(`modal-sugestao-gancho-${sugId}`);
    const roteiroInput = document.getElementById(`modal-sugestao-roteiro-${sugId}`);
    const nichoSelect = document.getElementById(`modal-sugestao-nicho-${sugId}`);
    const formatoSelect = document.getElementById(`modal-sugestao-formato-${sugId}`);

    const tituloVal = tituloInput ? tituloInput.value.trim() : sug.titulo;
    const ganchoVal = ganchoInput ? ganchoInput.value.trim() : sug.gancho;
    const roteiroVal = roteiroInput ? roteiroInput.value.trim() : (sug.roteiro || '');
    const nichoVal = nichoSelect ? nichoSelect.value : (sug.nichoTag || 'Geral');
    const formatoVal = formatoSelect ? formatoSelect.value : (sug.formato || 'Vídeo Longo');

    const caixaId = (this.caixas && this.caixas[0]) ? this.caixas[0].id : 'cx_ent';
    const novoCard = {
      id: 'card_' + Date.now(),
      caixaId,
      titulo: tituloVal,
      descricao: `🪝 GANCHO: ${ganchoVal}\n\n${roteiroVal}`,
      thumbnail: sug.thumb,
      tag: { nome: nichoVal || formatoVal || 'Sugestão IA', cor: '#E55A2B' },
      checklist: [
        { texto: 'Gravar Gancho Inicial (5s)', feito: false },
        { texto: 'Desenvolver Roteiro', feito: false },
        { texto: 'Edição & Capa', feito: false }
      ]
    };

    if (!this.cards) this.cards = [];
    this.cards.push(novoCard);
    this.salvarCards();
    if (typeof Components !== 'undefined') {
      Components.toast(`✨ Ideia "${tituloVal}" salva na Caixa de Entrada!`, 'success');
      Components.closeModal();
    }
    this.render();
  },

  async gerarSEOSugestao(sugId) {
    const sug = (this.sugestoesList || []).find(s => s.id === sugId) || 
                (this.recomendacoesList || []).find(r => r.id === sugId) ||
                (this.sugestoesCache && this.sugestoesCache.sugestoesList ? this.sugestoesCache.sugestoesList.find(s => s.id === sugId) : null);
    if (!sug) return;

    const tituloInput = document.getElementById(`modal-sugestao-titulo-${sugId}`);
    const ganchoInput = document.getElementById(`modal-sugestao-gancho-${sugId}`);
    const roteiroInput = document.getElementById(`modal-sugestao-roteiro-${sugId}`);
    const nichoSelect = document.getElementById(`modal-sugestao-nicho-${sugId}`);
    const formatoSelect = document.getElementById(`modal-sugestao-formato-${sugId}`);

    const tituloVal = tituloInput ? tituloInput.value.trim() : sug.titulo;
    const ganchoVal = ganchoInput ? ganchoInput.value.trim() : sug.gancho;
    const roteiroVal = roteiroInput ? roteiroInput.value.trim() : (sug.roteiro || '');
    const nichoVal = nichoSelect ? nichoSelect.value : (sug.nichoTag || this.nichoRecomendacao || 'Geral');
    const formatoVal = formatoSelect ? formatoSelect.value : (sug.formato || 'Vídeo Longo');

    const btn = document.getElementById(`btn-gerar-seo-${sug.id}`);
    const root = document.getElementById(`seo-result-root-${sug.id}`);

    if (!root) return;

    root.style.display = 'block';
    root.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px 0; background: #FFFFFF; border-radius: 14px; border: 1px solid #EBE5DF;">
        <div class="spinner" style="width: 32px; height: 32px; border: 3px solid #EBE5DF; border-top-color: var(--ref-primary, #E55A2B); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <span style="font-size: 13px; font-weight: 700; color: #1C1A14;">Gerando pacote de SEO completo com IA Gemini...</span>
        <span style="font-size: 11px; color: #64748B;">Analisando palavras-chave de busca e gatilhos de CTR do nicho</span>
      </div>`;

    if (btn) btn.disabled = true;

    try {
      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const res = await fetch('/api/youtube/gerar-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          titulo: tituloVal,
          gancho: ganchoVal,
          nicho: nichoVal,
          formato: formatoVal
        })
      });

      if (!res.ok) {
        let errText = 'Erro no servidor';
        try {
          const errJson = await res.json();
          errText = errJson.error || errText;
        } catch (_) {
          errText = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errText);
      }

      const data = await res.json();
      if (!data.success || !data.seo) {
        throw new Error(data.error || 'Erro ao gerar SEO');
      }

      const seoText = data.seo;
      const stats = data.ytDataStats || {};
      const seoFormatted = seoText
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0F172A; font-weight: 800;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color: #475569;">$1</em>')
        .replace(/\n/g, '<br>');

      const competitionBadge = stats.competitionLevel
        ? `<span style="display:inline-flex;align-items:center;gap:4px;background:${stats.avgViews > 500000 ? '#FEF2F2' : stats.avgViews > 100000 ? '#FFFBEB' : '#F0FDF4'};color:${stats.avgViews > 500000 ? '#DC2626' : stats.avgViews > 100000 ? '#D97706' : '#16A34A'};border-radius:6px;padding:3px 8px;font-size:10px;font-weight:800;">${stats.competitionLevel}</span>`
        : '';

      const dataSourceBadge = stats.topVideosCount > 0
        ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#EFF6FF;color:#1D4ED8;border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700;">
            <i data-lucide="database" style="width:11px;height:11px;"></i>
            ${stats.topVideosCount} vídeos analisados · ${stats.competitorTagsCount} tags · ${stats.trendingKeywordsCount} keywords
          </span>`
        : '';

      root.innerHTML = `
        <div style="background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 14px; padding: 18px; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px;">
            <span style="font-size: 12px; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px;">
              <i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i> PACOTE SEO GERADO COM SUCESSO
            </span>
            <button type="button" onclick="navigator.clipboard.writeText(\`${seoText.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); if(typeof Components !== 'undefined') Components.toast('Pacote SEO copiado para a área de transferência!', 'success');" style="background: #FAF8F5; border: 1px solid #EBE5DF; color: #1C1A14; border-radius: 8px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
              <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copiar SEO Completo
            </button>
          </div>

          ${(dataSourceBadge || competitionBadge) ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${dataSourceBadge}${competitionBadge}</div>` : ''}

          <div style="max-height: 340px; overflow-y: auto; font-size: 12px; color: #334155; line-height: 1.65; padding-right: 6px; font-family: var(--font-main, 'Inter', sans-serif);">
            ${seoFormatted}
          </div>
        </div>`;


      if (typeof lucide !== 'undefined') lucide.createIcons();
      if (typeof Components !== 'undefined') {
        Components.toast('🚀 Pacote SEO de Alto Desempenho gerado!', 'success');
      }

    } catch (err) {
      console.error('[SEO IA] Erro:', err);
      root.innerHTML = `
        <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 14px; margin-top: 10px; text-align: center;">
          <span style="font-size: 12px; font-weight: 700; color: #DC2626;">❌ ${err.message || 'Erro ao gerar SEO'}</span>
        </div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  async subirAudioParaSEO(sugId) {
    const input = document.getElementById(`audio-seo-file-${sugId}`);
    const root = document.getElementById(`audio-seo-result-root-${sugId}`);
    const labelBtn = document.getElementById(`btn-upload-audio-${sugId}`);

    if (!input || !input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (root) {
      root.style.display = 'block';
      root.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 0; background: #FAF8F5; border-radius: 14px; border: 1px solid #EBE5DF;">
          <div class="spinner" style="width: 28px; height: 28px; border: 3px solid #EBE5DF; border-top-color: #10B981; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <span style="font-size: 13px; font-weight: 700; color: #1C1A14;">Analisando áudio/vídeo "${file.name}" com Gemini IA Multimodal...</span>
          <span style="font-size: 11px; color: #64748B;">Identificando palavras-chave faladas e avaliando retenção nos primeiros 30s</span>
        </div>`;
    }

    if (labelBtn) labelBtn.style.opacity = '0.5';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const res = await fetch('/api/youtube/analisar-audio-seo', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) {
        let errText = 'Erro ao processar arquivo';
        try {
          const errJson = await res.json();
          errText = errJson.error || errText;
        } catch (_) {}
        throw new Error(errText);
      }

      const data = await res.json();
      if (!data.success || !data.audioSEO) {
        throw new Error(data.error || 'Erro na análise de áudio.');
      }

      const formattedAudioSEO = data.audioSEO
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0F172A; font-weight: 800;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color: #475569;">$1</em>')
        .replace(/\n/g, '<br>');

      root.innerHTML = `
        <div style="background: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 14px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #EBE5DF; padding-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px;">
              <i data-lucide="check-circle" style="width: 15px; height: 15px;"></i> ANÁLISE DE ÁUDIO CONCLUÍDA: ${file.name}
            </span>
            <button type="button" onclick="navigator.clipboard.writeText(\`${data.audioSEO.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); if(typeof Components !== 'undefined') Components.toast('Análise de Áudio copiada!', 'success');" style="background: #FFFFFF; border: 1px solid #EBE5DF; color: #1C1A14; border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copiar Análise
            </button>
          </div>
          <div style="max-height: 260px; overflow-y: auto; font-size: 12px; color: #334155; line-height: 1.6; font-family: var(--font-main, 'Inter', sans-serif);">
            ${formattedAudioSEO}
          </div>
        </div>`;

      if (typeof lucide !== 'undefined') lucide.createIcons();
      if (typeof Components !== 'undefined') Components.toast('🎙️ Análise do SEO Falado concluída!', 'success');

    } catch (err) {
      console.error('[Áudio SEO] Erro:', err);
      if (root) {
        root.innerHTML = `
          <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 12px; text-align: center;">
            <span style="font-size: 12px; font-weight: 700; color: #DC2626;">❌ ${err.message || 'Erro ao analisar áudio/vídeo'}</span>
          </div>`;
      }
    } finally {
      if (labelBtn) labelBtn.style.opacity = '1';
    }
  },

  // ──────────────────────────────────────────────────────────────
  // SESSÃO SEO NO MODAL DE CRIAR E EDITAR CARD DE CONTEÚDO (CAIXA)
  // ──────────────────────────────────────────────────────────────
  renderSEOResultCardHTML(seoText, stats = {}) {
    if (!seoText) return '';
    const seoFormatted = seoText
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0F172A; font-weight: 800;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: #475569;">$1</em>')
      .replace(/\n/g, '<br>');

    const competitionBadge = stats?.competitionLevel
      ? `<span style="display:inline-flex;align-items:center;gap:4px;background:${stats.avgViews > 500000 ? '#FEF2F2' : stats.avgViews > 100000 ? '#FFFBEB' : '#F0FDF4'};color:${stats.avgViews > 500000 ? '#DC2626' : stats.avgViews > 100000 ? '#D97706' : '#16A34A'};border-radius:6px;padding:3px 8px;font-size:10px;font-weight:800;">${stats.competitionLevel}</span>`
      : '';

    const dataSourceBadge = stats?.topVideosCount > 0
      ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#EFF6FF;color:#1D4ED8;border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700;">
          <i data-lucide="database" style="width:11px;height:11px;"></i>
          ${stats.topVideosCount} vídeos analisados · ${stats.competitorTagsCount} tags · ${stats.trendingKeywordsCount} keywords
        </span>`
      : '';

    return `
      <div style="background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 14px; padding: 18px; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px;">
          <span style="font-size: 12px; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px;">
            <i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i> PACOTE SEO GERADO COM SUCESSO
          </span>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" onclick="Planejamento.aplicarSEOnaDescricaoCard()" style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.3); color: var(--ref-primary, #E55A2B); border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
              <i data-lucide="file-text" style="width: 13px; height: 13px;"></i> Aplicar na Descrição
            </button>
            <button type="button" onclick="navigator.clipboard.writeText(\`${seoText.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); if(typeof Components !== 'undefined') Components.toast('Pacote SEO copiado para a área de transferência!', 'success');" style="background: #FAF8F5; border: 1px solid #EBE5DF; color: #1C1A14; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
              <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copiar SEO
            </button>
          </div>
        </div>

        ${(dataSourceBadge || competitionBadge) ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${dataSourceBadge}${competitionBadge}</div>` : ''}

        <div style="max-height: 280px; overflow-y: auto; font-size: 12px; color: #334155; line-height: 1.65; padding-right: 6px; font-family: var(--font-main, 'Inter', sans-serif);">
          ${seoFormatted}
        </div>
      </div>`;
  },

  async gerarSEOCardModal() {
    const tituloInput = document.getElementById('card-titulo');
    const descInput = document.getElementById('card-descricao');
    const tagInput = document.getElementById('card-tag-nome');

    const titulo = tituloInput ? tituloInput.value.trim() : '';
    const descricao = descInput ? descInput.value.trim() : '';
    const tagNome = tagInput ? tagInput.value.trim() : 'Geral';

    if (!titulo) {
      if (typeof Components !== 'undefined') Components.toast('Por favor, preencha o Título do Conteúdo antes de gerar o SEO.', 'warning');
      if (tituloInput) tituloInput.focus();
      return;
    }

    const btn = document.getElementById('btn-gerar-seo-card-modal');
    const root = document.getElementById('seo-card-modal-result-root');
    if (!root) return;

    root.style.display = 'block';
    root.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px 0; background: #FFFFFF; border-radius: 14px; border: 1px solid #EBE5DF;">
        <div class="spinner" style="width: 32px; height: 32px; border: 3px solid #EBE5DF; border-top-color: var(--ref-primary, #E55A2B); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <span style="font-size: 13px; font-weight: 700; color: #1C1A14;">Gerando pacote de SEO completo com IA Gemini...</span>
        <span style="font-size: 11px; color: #64748B;">Analisando palavras-chave de busca e gatilhos de CTR para "${titulo}"</span>
      </div>`;

    if (btn) btn.disabled = true;

    try {
      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const res = await fetch('/api/youtube/gerar-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          titulo,
          gancho: descricao,
          nicho: tagNome,
          formato: 'Vídeo Longo'
        })
      });

      if (!res.ok) {
        let errText = 'Erro no servidor';
        try {
          const errJson = await res.json();
          errText = errJson.error || errText;
        } catch (_) {
          errText = `HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(errText);
      }

      const data = await res.json();
      if (!data.success || !data.seo) {
        throw new Error(data.error || 'Erro ao gerar SEO');
      }

      this.tempSEOData = {
        seoText: data.seo,
        seoStats: data.ytDataStats || {}
      };

      root.innerHTML = this.renderSEOResultCardHTML(data.seo, data.ytDataStats || {});
      if (typeof lucide !== 'undefined') lucide.createIcons();
      if (typeof Components !== 'undefined') {
        Components.toast('🚀 Pacote SEO de Alto Desempenho gerado!', 'success');
      }

    } catch (err) {
      console.error('[SEO IA Card Modal] Erro:', err);
      root.innerHTML = `
        <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 14px; text-align: center;">
          <span style="font-size: 12px; font-weight: 700; color: #DC2626;">❌ ${err.message || 'Erro ao gerar SEO'}</span>
        </div>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  async subirAudioParaSEOCardModal() {
    const input = document.getElementById('audio-seo-card-modal-file');
    const root = document.getElementById('seo-card-modal-result-root');
    const labelBtn = document.getElementById('btn-upload-audio-card-modal');

    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (root) {
      root.style.display = 'block';
      root.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 0; background: #FFFFFF; border-radius: 14px; border: 1px solid #EBE5DF;">
          <div class="spinner" style="width: 28px; height: 28px; border: 3px solid #EBE5DF; border-top-color: #10B981; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <span style="font-size: 13px; font-weight: 700; color: #1C1A14;">Analisando áudio/vídeo "${file.name}" com Gemini IA Multimodal...</span>
          <span style="font-size: 11px; color: #64748B;">Identificando palavras-chave faladas e avaliando retenção nos primeiros 30s</span>
        </div>`;
    }

    if (labelBtn) labelBtn.style.opacity = '0.5';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('NexusGestor_token') || localStorage.getItem('token');
      const res = await fetch('/api/youtube/analisar-audio-seo', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) {
        let errText = 'Erro ao processar arquivo';
        try {
          const errJson = await res.json();
          errText = errJson.error || errText;
        } catch (_) {}
        throw new Error(errText);
      }

      const data = await res.json();
      if (!data.success || !data.audioSEO) {
        throw new Error(data.error || 'Erro na análise de áudio.');
      }

      this.tempSEOData = {
        seoText: data.audioSEO,
        seoStats: { audioFile: file.name }
      };

      const formattedAudioSEO = data.audioSEO
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0F172A; font-weight: 800;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color: #475569;">$1</em>')
        .replace(/\n/g, '<br>');

      root.innerHTML = `
        <div style="background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 14px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #EBE5DF; padding-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px;">
              <i data-lucide="check-circle" style="width: 15px; height: 15px;"></i> ANÁLISE DE ÁUDIO CONCLUÍDA: ${file.name}
            </span>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" onclick="Planejamento.aplicarSEOnaDescricaoCard()" style="background: rgba(229, 90, 43, 0.08); border: 1px solid rgba(229, 90, 43, 0.3); color: var(--ref-primary, #E55A2B); border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="file-text" style="width: 13px; height: 13px;"></i> Aplicar na Descrição
              </button>
              <button type="button" onclick="navigator.clipboard.writeText(\`${data.audioSEO.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); if(typeof Components !== 'undefined') Components.toast('Análise de Áudio copiada!', 'success');" style="background: #FAF8F5; border: 1px solid #EBE5DF; color: #1C1A14; border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="copy" style="width: 13px; height: 13px;"></i> Copiar Análise
              </button>
            </div>
          </div>
          <div style="max-height: 260px; overflow-y: auto; font-size: 12px; color: #334155; line-height: 1.6; font-family: var(--font-main, 'Inter', sans-serif);">
            ${formattedAudioSEO}
          </div>
        </div>`;

      if (typeof lucide !== 'undefined') lucide.createIcons();
      if (typeof Components !== 'undefined') Components.toast('🎙️ Análise do SEO Falado concluída!', 'success');

    } catch (err) {
      console.error('[Áudio SEO Card Modal] Erro:', err);
      if (root) {
        root.innerHTML = `
          <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 12px; padding: 12px; text-align: center;">
            <span style="font-size: 12px; font-weight: 700; color: #DC2626;">❌ ${err.message || 'Erro ao analisar áudio/vídeo'}</span>
          </div>`;
      }
    } finally {
      if (labelBtn) labelBtn.style.opacity = '1';
    }
  },

  aplicarSEOnaDescricaoCard() {
    if (!this.tempSEOData || !this.tempSEOData.seoText) return;
    const descInput = document.getElementById('card-descricao');
    if (descInput) {
      const currentDesc = descInput.value.trim();
      const newDesc = currentDesc 
        ? `${currentDesc}\n\n--- PACOTE SEO (IA) ---\n${this.tempSEOData.seoText}`
        : this.tempSEOData.seoText;
      descInput.value = newDesc;
      if (typeof Components !== 'undefined') Components.toast('✨ Pacote SEO aplicado à Descrição do Card!', 'success');
    }
  },

  openMiniPopSugestao(e, sugId) {
    e.stopPropagation();
    const trigger = e.currentTarget;

    document.querySelectorAll('.hig-select-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'hig-select-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = '999999';
    menu.style.opacity = '0';
    menu.style.transform = 'scale(0.95) translateY(-5px)';
    menu.style.transition = 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    menu.style.width = '210px';

    const options = [
      { id: 'ver', label: 'Ver Visão Geral / Roteiro', icon: 'eye' },
      { id: 'canva', label: 'Mandar pro Canva', icon: 'network' },
      { id: 'cronograma', label: 'Exportar para Cronograma', icon: 'calendar-plus' },
      { id: 'caixa', label: 'Salvar na Caixa', icon: 'archive' }
    ];

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'hig-select-items';

    options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'hig-select-item';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '8px';
      item.innerHTML = `<i data-lucide="${opt.icon}" style="width: 14px; height: 14px;"></i><span>${opt.label}</span>`;
      item.onclick = (ev) => {
        ev.stopPropagation();
        menu.remove();
        if (opt.id === 'ver') {
          Planejamento.abrirVisaoGeralSugestao(sugId);
        } else if (opt.id === 'canva') {
          Planejamento.enviarSugestaoParaCanva(sugId);
        } else if (opt.id === 'cronograma') {
          Planejamento.exportarSugestaoParaCronograma(sugId);
        } else if (opt.id === 'caixa') {
          Planejamento.importarSugestaoParaCaixa(sugId);
        }
      };
      itemsContainer.appendChild(item);
    });

    menu.appendChild(itemsContainer);
    document.body.appendChild(menu);

    const rect = trigger.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.right - 210;

    if (top + 160 > window.innerHeight) {
      top = rect.top - 160 - 6;
    }
    if (left < 10) left = 10;

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;

    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'scale(1) translateY(0)';
    });

    if (window.lucide) {
      window.lucide.createIcons({ root: menu });
    }

    const closeHandler = () => {
      menu.style.opacity = '0';
      menu.style.transform = 'scale(0.95) translateY(-5px)';
      setTimeout(() => menu.remove(), 200);
      document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
    }, 10);
  },

  abrirVisaoGeralSugestao(sugId) {
    const sug = (this.sugestoesList || []).find(s => s.id === sugId) || 
                (this.recomendacoesList || []).find(r => r.id === sugId) ||
                (this.sugestoesCache && this.sugestoesCache.sugestoesList ? this.sugestoesCache.sugestoesList.find(s => s.id === sugId) : null);
    if (!sug) {
      if (typeof Components !== 'undefined') Components.toast('Sugestão não encontrada.', 'error');
      return;
    }

    const modalHTML = `
      <div style="font-family: var(--font-main, 'Inter', sans-serif); color: #1C1A14;">
        
        <!-- Header Bento Dark Card com Foto & Métricas -->
        <div style="background: #181714; border-radius: 18px; padding: 18px 22px; border: 1px solid #2D2A24; display: flex; align-items: center; gap: 18px; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
          ${sug.thumb ? `
            <img src="${sug.thumb}" style="width: 64px; height: 64px; border-radius: 14px; object-fit: cover; border: 2px solid var(--ref-primary, #E55A2B); flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" onerror="this.style.display='none'">
          ` : `
            <div style="width: 64px; height: 64px; border-radius: 14px; background: rgba(229, 90, 43, 0.15); color: var(--ref-primary, #E55A2B); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(229, 90, 43, 0.3);">
              <i data-lucide="sparkles" style="width: 24px; height: 24px;"></i>
            </div>
          `}
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <span style="background: rgba(229, 90, 43, 0.2); color: var(--ref-primary, #E55A2B); border: 1px solid rgba(229, 90, 43, 0.3); padding: 2px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                Ideia Recomendada
              </span>
              <span style="background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800;">
                ⚡ ${sug.matchPercent || 98}% Match de Relevância
              </span>
              <span style="color: #94A3B8; font-size: 11px; font-weight: 700;">
                📊 Est. Views: ${sug.viewsEst || '15k - 45k'}
              </span>
            </div>
            <span style="font-size: 12px; color: #A19B8F; font-weight: 500;">
              Origem: IA Inteligência de Audiência • Analisado agora
            </span>
          </div>
        </div>

        <form id="sugestao-modal-form" class="premium-desktop-form" onsubmit="event.preventDefault();" style="display: block;">
          <!-- Bento Grid de Conteúdo (2 Colunas) -->
          <div class="p-bento-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            
            <!-- Coluna 1: Título, Gancho & Config -->
            <div class="p-bento-col" style="display: flex; flex-direction: column; gap: 16px;">
              
              <!-- Título Editável -->
              <div class="p-bento-card" style="padding: 16px; background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 16px;">
                <div class="p-form-group" style="margin-bottom: 0;">
                  <label style="font-size: 11px; font-weight: 800; color: var(--ref-primary, #E55A2B); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">
                    Título da Ideia (Editável)
                  </label>
                  <input type="text" id="modal-sugestao-titulo-${sug.id}" class="p-input" value="${sug.titulo.replace(/"/g, '&quot;')}" style="width: 100%; border: 1px solid #EBE5DF; border-radius: 10px; padding: 10px 12px; font-size: 14px; font-weight: 700; color: #1C1A14; font-family: 'Outfit', sans-serif;">
                </div>
              </div>

              <!-- Gancho Editável -->
              <div class="p-bento-card" style="padding: 16px; background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 16px;">
                <div class="p-form-group" style="margin-bottom: 0;">
                  <label style="font-size: 11px; font-weight: 800; color: #1C1A14; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">
                    ⚡ Gancho Inicial / Frase de Impacto
                  </label>
                  <textarea id="modal-sugestao-gancho-${sug.id}" class="p-input" rows="2" style="width: 100%; border: 1px solid #EBE5DF; border-radius: 10px; padding: 10px 12px; font-size: 13px; font-weight: 600; font-style: italic; color: #1C1A14; line-height: 1.4; resize: none;">${sug.gancho}</textarea>
                </div>
              </div>

              <!-- Configuração do Vídeo (Formato e Nicho com trello-select) -->
              <div class="p-bento-card" style="padding: 16px; background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 16px;">
                <h4 class="p-bento-title" style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1C1A14; display: flex; align-items: center; gap: 6px;"><i data-lucide="settings" style="width: 14px; height: 14px; color: var(--ref-primary, #E55A2B);"></i> Parâmetros do Vídeo</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div class="p-form-group" style="margin-bottom: 0;">
                    <label style="font-size: 10px; font-weight: 700; color: #64748B; margin-bottom: 4px; display: block;">Formato</label>
                    <select id="modal-sugestao-formato-${sug.id}" class="p-input trello-select" style="width: 100%;">
                      <option value="Vídeo Longo" ${sug.formato === 'Vídeo Longo' ? 'selected' : ''}>Vídeo Longo</option>
                      <option value="Shorts" ${sug.formato === 'Shorts' ? 'selected' : ''}>Shorts</option>
                      <option value="Reels / TikTok" ${sug.formato === 'Reels / TikTok' ? 'selected' : ''}>Reels / TikTok</option>
                    </select>
                  </div>
                  <div class="p-form-group" style="margin-bottom: 0;">
                    <label style="font-size: 10px; font-weight: 700; color: #64748B; margin-bottom: 4px; display: block;">Nicho de Busca</label>
                    <select id="modal-sugestao-nicho-${sug.id}" class="p-input trello-select" style="width: 100%;">
                      <option value="Geral" ${(!sug.nichoTag || sug.nichoTag === 'Geral') ? 'selected' : ''}>Geral</option>
                      <option value="Tecnologia" ${sug.nichoTag === 'Tecnologia' ? 'selected' : ''}>Tecnologia</option>
                      <option value="Culinária" ${sug.nichoTag === 'Culinária' ? 'selected' : ''}>Culinária</option>
                      <option value="Negócios" ${sug.nichoTag === 'Negócios' ? 'selected' : ''}>Negócios</option>
                      <option value="Finanças" ${sug.nichoTag === 'Finanças' ? 'selected' : ''}>Finanças</option>
                      <option value="Games" ${sug.nichoTag === 'Games' ? 'selected' : ''}>Games</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            <!-- Coluna 2: Roteiro Editável -->
            <div class="p-bento-col" style="display: flex; flex-direction: column;">
              <div class="p-bento-card" style="padding: 16px; background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 16px; height: 100%; display: flex; flex-direction: column;">
                <div class="p-form-group" style="margin-bottom: 0; flex: 1; display: flex; flex-direction: column;">
                  <label style="font-size: 11px; font-weight: 800; color: #1C1A14; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">
                    📝 Estrutura / Roteiro Resumido (Editável)
                  </label>
                  <textarea id="modal-sugestao-roteiro-${sug.id}" class="p-input" style="width: 100%; flex: 1; min-height: 240px; border: 1px solid #EBE5DF; border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #334155; line-height: 1.5; font-family: var(--font-main, 'Inter', sans-serif); resize: none;">${sug.roteiro || ''}</textarea>
                </div>
              </div>
            </div>

          </div>
        </form>

        <!-- SESSÃO ESPECIAL: GERAR SEO COMPLETO COM IA (Estilo Bento Padrão do Sistema) -->
        <div class="p-bento-card" style="margin-top: 16px; background: #FAF8F5; border: 1px solid #EBE5DF; border-radius: 16px; padding: 18px; color: #1C1A14;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 12px; background: rgba(229, 90, 43, 0.12); color: var(--ref-primary, #E55A2B); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(229, 90, 43, 0.25);">
                <i data-lucide="sparkles" style="width: 20px; height: 20px;"></i>
              </div>
              <div>
                <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #1C1A14; font-family: 'Outfit', sans-serif;">Pacote SEO de Alto Desempenho com IA</h4>
                <span style="font-size: 11px; color: #64748B; font-weight: 500;">Títulos virais, descrição otimizada, palavras-chave e hashtags para o algoritmo do YouTube</span>
              </div>
            </div>

            <button type="button" id="btn-gerar-seo-${sug.id}" onclick="Planejamento.gerarSEOSugestao('${sug.id}')" class="btn-premium-primary" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 10px; padding: 9px 18px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(229, 90, 43, 0.3); transition: all 0.2s ease;">
              <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i> ✨ Gerar SEO com IA
            </button>
          </div>

          <div id="seo-result-root-${sug.id}" style="display: none; margin-top: 16px;">
            <!-- O resultado gerado pela IA será injetado aqui -->
          </div>
        </div>

        <!-- SESSÃO ESPECIAL: UPLOAD DE ÁUDIO/VÍDEO PARA SEO FALADO MULTIMODAL -->
        <div class="p-bento-card" style="margin-top: 16px; background: #FFFFFF; border: 1px solid #EBE5DF; border-radius: 16px; padding: 18px; color: #1C1A14;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 12px; background: rgba(16, 185, 129, 0.12); color: #10B981; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(16, 185, 129, 0.25);">
                <i data-lucide="mic" style="width: 20px; height: 20px;"></i>
              </div>
              <div>
                <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #1C1A14; font-family: 'Outfit', sans-serif;">Análise de SEO Falado por Áudio/Vídeo (.MP3, .MP4)</h4>
                <span style="font-size: 11px; color: #64748B; font-weight: 500;">Envie a gravação inicial da fala do vídeo para a IA analisar o match com o algoritmo</span>
              </div>
            </div>

            <div style="position: relative; display: inline-block;">
              <input type="file" id="audio-seo-file-${sug.id}" accept="audio/*,video/*" onchange="Planejamento.subirAudioParaSEO('${sug.id}')" style="display: none;">
              <label for="audio-seo-file-${sug.id}" id="btn-upload-audio-${sug.id}" class="btn-secondary" style="background: #FAF8F5; color: #1C1A14; border: 1px solid #EBE5DF; border-radius: 10px; padding: 9px 18px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: all 0.2s ease;">
                <i data-lucide="upload-cloud" style="width: 15px; height: 15px; color: #10B981;"></i> 🎤 Selecionar Áudio / Vídeo
              </label>
            </div>
          </div>

          <div id="audio-seo-result-root-${sug.id}" style="display: none; margin-top: 16px;">
            <!-- O resultado da análise de áudio será exibido aqui -->
          </div>
        </div>

      </div>
    `;

    const actionsHTML = `
      <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end; flex-wrap: wrap; width: 100%;">
        <button type="button" class="btn-premium-primary" onclick="Planejamento.exportarSugestaoParaCronograma('${sug.id}')" style="background: var(--ref-primary, #E55A2B); color: #FFFFFF; border: none; border-radius: 10px; padding: 9px 16px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <i data-lucide="calendar-plus" style="width: 15px; height: 15px;"></i> Exportar para Cronograma
        </button>
        <button type="button" class="btn-secondary" onclick="Planejamento.enviarSugestaoParaCanva('${sug.id}'); Components.closeModal();" style="padding: 9px 14px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <i data-lucide="network" style="width: 15px; height: 15px;"></i> Mandar pro Canva
        </button>
        <button type="button" class="btn-secondary" onclick="Planejamento.importarSugestaoParaCaixa('${sug.id}')" style="padding: 9px 14px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <i data-lucide="archive" style="width: 15px; height: 15px;"></i> Salvar na Caixa
        </button>
        <button type="button" class="btn-secondary" onclick="Components.closeModal()" style="padding: 9px 14px; border-radius: 10px; border: 1px solid var(--ref-border); background: #FAF8F5; font-weight: 700; cursor: pointer;">
          Fechar
        </button>
      </div>
    `;

    Components.showModal('💡 Visão Geral da Ideia', modalHTML, actionsHTML, 'premium-task-modal');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof window.HigPopovers !== 'undefined') setTimeout(() => window.HigPopovers.init(), 50);
  },

  exportarSugestaoParaCronograma(sugId) {
    const sug = (this.sugestoesList || []).find(s => s.id === sugId) || 
                (this.recomendacoesList || []).find(r => r.id === sugId) ||
                (this.sugestoesCache && this.sugestoesCache.sugestoesList ? this.sugestoesCache.sugestoesList.find(s => s.id === sugId) : null);
    if (!sug) {
      if (typeof Components !== 'undefined') Components.toast('Sugestão não encontrada.', 'error');
      return;
    }

    const tituloInput = document.getElementById(`modal-sugestao-titulo-${sugId}`);
    const ganchoInput = document.getElementById(`modal-sugestao-gancho-${sugId}`);
    const roteiroInput = document.getElementById(`modal-sugestao-roteiro-${sugId}`);
    const nichoSelect = document.getElementById(`modal-sugestao-nicho-${sugId}`);
    const formatoSelect = document.getElementById(`modal-sugestao-formato-${sugId}`);

    const tituloVal = tituloInput ? tituloInput.value.trim() : sug.titulo;
    const ganchoVal = ganchoInput ? ganchoInput.value.trim() : sug.gancho;
    const roteiroVal = roteiroInput ? roteiroInput.value.trim() : (sug.roteiro || '');
    const nichoVal = nichoSelect ? nichoSelect.value : (sug.nichoTag || 'Geral');
    const formatoVal = formatoSelect ? formatoSelect.value : (sug.formato || 'Vídeo Longo');

    this.exportarParaCronogramaModal({
      titulo: tituloVal,
      descricao: `🪝 GANCHO: ${ganchoVal}\n\n${roteiroVal}`,
      thumbnail: sug.thumb,
      tags: [nichoVal || formatoVal || 'Sugestão IA']
    });
  },

  exportarCanvasNodeParaCronograma(nodeId) {
    const node = (this.canvasNodes || []).find(n => n.id === nodeId);
    if (!node) return;
    this.exportarParaCronogramaModal({
      titulo: node.title ? node.title.replace(/^[📌🖼️🔗⚡📦]\s*/, '') : 'Nó do Canva',
      descricao: node.text ? node.text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '') : (node.url || ''),
      thumbnail: node.type === 'file' ? node.url : '',
      tags: ['Canva Whiteboard']
    });
  },

  exportarParaCronogramaModal(itemData = {}) {
    const titulo = itemData.titulo || itemData.nome || itemData.text || itemData.title || 'Nova Tarefa do Planejamento';
    const descricao = itemData.descricao || itemData.gancho || itemData.text || '';
    const foto = itemData.thumbnail || itemData.thumb || itemData.foto || itemData.url || '';
    const tags = Array.isArray(itemData.tags) ? itemData.tags : [itemData.tag?.nome || itemData.nichoTag || 'Planejamento'];
    const checklist = itemData.checklist || [];

    this._tempExportData = { titulo, descricao, foto, tags, checklist };

    const padeiros = (window.Cronograma && window.Cronograma.padeiros) ? window.Cronograma.padeiros : [];
    const todayISO = new Date().toISOString().split('T')[0];

    const modalHTML = `
      <form id="form-exportar-cronograma" onsubmit="event.preventDefault(); Planejamento.confirmarExportarParaCronograma();" class="premium-desktop-form">
        
        <!-- Header informativo com Prévia do Card e Foto -->
        <div style="background: #181714; border-radius: 16px; padding: 16px 20px; border: 1px solid #2D2A24; display: flex; align-items: center; gap: 16px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
          ${foto ? `
            <img src="${foto}" style="width: 58px; height: 58px; border-radius: 14px; object-fit: cover; border: 2px solid var(--ref-primary, #E55A2B); flex-shrink: 0;" onerror="this.style.display='none'">
          ` : `
            <div style="width: 58px; height: 58px; border-radius: 14px; background: rgba(229, 90, 43, 0.15); color: var(--ref-primary, #E55A2B); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(229, 90, 43, 0.3);">
              <i data-lucide="calendar-plus" style="width: 26px; height: 26px;"></i>
            </div>
          `}
          <div style="flex: 1; min-width: 0;">
            <span style="background: rgba(229, 90, 43, 0.2); color: var(--ref-primary, #E55A2B); border: 1px solid rgba(229, 90, 43, 0.3); padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
              EXPORTAR PARA O KANBAN / CRONOGRAMA
            </span>
            <h4 style="margin: 4px 0 0 0; font-size: 16px; font-weight: 800; color: #FFFFFF; font-family: 'Outfit', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${titulo}
            </h4>
          </div>
        </div>

        <!-- Estrutura Bento Grid de 2 Colunas (Padrão do Sistema) -->
        <div class="p-bento-container">
          
          <!-- Coluna 1: Quantidade de Dias e Data de Início -->
          <div class="p-bento-col">
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="repeat"></i> Repetição & Programação</h4>
              
              <div class="p-form-group">
                <label style="font-weight: 800; color: var(--ref-primary, #E55A2B);">Essa tarefa é de quantos dias? *</label>
                <input type="number" id="export-dias-qty" class="p-input" min="1" max="365" value="1" required style="font-size: 16px; font-weight: 800;">
                <small style="font-size: 11px; color: var(--ref-text-sub, #64748B); margin-top: 4px; display: block; line-height: 1.3;">
                  💡 Exemplo: Se for <strong>7</strong>, o card se repetirá por 7 dias consecutivos no Cronograma.
                </small>
              </div>

              <div class="p-form-group" style="margin-bottom:0;">
                <label>Data de Início *</label>
                <input type="date" id="export-start-date" class="p-input" value="${todayISO}" required>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Funcionário, Status -->
          <div class="p-bento-col">
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="user-check"></i> Atribuição no Cronograma</h4>

              <div class="p-form-group">
                <label>Funcionário Responsável</label>
                <select id="export-padeiro-id" class="p-input trello-select">
                  <option value="">Selecione o funcionário (opcional)...</option>
                  ${padeiros.map(p => `<option value="${p.id}" data-nome="${p.nome}">${p.nome} — COD ${p.codTec}</option>`).join('')}
                </select>
              </div>

              <div class="p-form-group" style="margin-bottom:0;">
                <label>Status Inicial</label>
                <select id="export-status" class="p-input trello-select">
                  <option value="pendente" selected>Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </form>
    `;

    const actionsHTML = `
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button type="button" class="btn-premium-primary" onclick="Planejamento.confirmarExportarParaCronograma()">
        <i data-lucide="calendar-plus" style="width: 15px; height: 15px;"></i> Confirmar Exportação
      </button>
    `;

    Components.showModal('Exportar para Cronograma', modalHTML, actionsHTML, 'premium-task-modal');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof window.HigPopovers !== 'undefined') {
      setTimeout(() => window.HigPopovers.init(), 50);
    }
  },

  async confirmarExportarParaCronograma() {
    if (!this._tempExportData) return;
    const { titulo, descricao, foto, tags, checklist } = this._tempExportData;

    const sanitize = (str) => {
      if (typeof str !== 'string') return str;
      if (typeof str.toWellFormed === 'function') return str.toWellFormed();
      return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
    };

    const cleanTitulo = sanitize(titulo);
    const cleanDescricao = sanitize(descricao);
    const cleanFoto = sanitize(foto);
    const cleanTags = Array.isArray(tags) ? tags.map(sanitize) : ['Planejamento'];

    const diasInput = document.getElementById('export-dias-qty');
    const startDateInput = document.getElementById('export-start-date');
    const padeiroSelect = document.getElementById('export-padeiro-id');
    const statusSelect = document.getElementById('export-status');

    const dias = parseInt(diasInput?.value, 10) || 1;
    const startDateStr = startDateInput?.value || new Date().toISOString().split('T')[0];
    const padeiroId = padeiroSelect ? padeiroSelect.value : null;
    const padeiroNome = (padeiroSelect && padeiroSelect.selectedIndex > 0) ? padeiroSelect.options[padeiroSelect.selectedIndex].dataset.nome : null;
    const status = statusSelect ? statusSelect.value : 'pendente';

    try {
      let totalCriadas = 0;
      const baseDate = new Date(startDateStr + 'T12:00:00');

      for (let i = 0; i < dias; i++) {
        const curDate = new Date(baseDate);
        curDate.setDate(curDate.getDate() + i);
        const curDateStr = curDate.toISOString().split('T')[0];

        const payload = {
          nome: cleanTitulo,
          tarefas: cleanTitulo,
          data: curDateStr,
          padeiroId: padeiroId || null,
          padeiroNome: padeiroNome || null,
          status: status || 'pendente',
          observacao: cleanDescricao || '',
          tags: cleanTags,
          checklist: (checklist || []).map(c => ({
            text: c.texto || c.text || '',
            done: c.feito !== undefined ? c.feito : (c.done !== undefined ? c.done : false)
          })),
          foto: cleanFoto || ''
        };

        await API.post('/api/cronograma', payload);
        totalCriadas++;
      }

      Components.closeModal();
      this._tempExportData = null;

      if (typeof Components !== 'undefined') {
        Components.toast(`✨ Card "${titulo}" exportado para o Cronograma por ${totalCriadas} dia(s) com sucesso!`, 'success');
      }

      if (window.Cronograma && typeof window.Cronograma.carregarDados === 'function') {
        window.Cronograma.carregarDados();
      }
    } catch (err) {
      console.error('[Exportar Cronograma] Erro:', err);
      if (typeof Components !== 'undefined') {
        Components.toast('Erro ao exportar para o cronograma: ' + err.message, 'error');
      }
    }
  }
};

// Auto-inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('planejamento-root')) {
    Planejamento.init();
  }
});
