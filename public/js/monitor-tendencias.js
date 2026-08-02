/**
 * 📡 MONITOR DE TENDÊNCIAS — YouTube Gaming
 *
 * Roda em intervalos (padrão 10h), busca as tendências reais via YouTube Data API v3
 * (usando o assistente-conhecimento.js), monta um relatório com "motivo de estar em alta"
 * + exemplos de inspiração da nossa própria base de conhecimento, gera um PDF com thumbnails,
 * e dispara uma notificação com mensagem variada (nunca repete a mesma frase 2x seguidas).
 *
 * Dependência: npm install pdfkit
 */

const fs = require('fs');
const path = require('path');
let PDFDocument = null;
try {
  PDFDocument = require('pdfkit');
} catch (e) {
  console.warn('⚠️ [MonitorTendencias] pdfkit não instalado. Geração de PDF será omitida.');
}
const AssistenteConhecimento = require('./assistente-conhecimento.js');

const PASTA_RELATORIOS = path.join(__dirname, 'relatorios-tendencias');
if (!fs.existsSync(PASTA_RELATORIOS)) fs.mkdirSync(PASTA_RELATORIOS, { recursive: true });

// ────────────────────────────────────────────────────────────
// 🎲 MENSAGENS DE NOTIFICAÇÃO VARIADAS (nunca repete a última usada)
// ────────────────────────────────────────────────────────────
const _templatesNotificacao = [
  ({ topTitulo, topViews, quantidade }) =>
    `🔥 "${topTitulo}" está bombando agora com ${topViews} views. Já mapeei mais ${quantidade - 1} tendências pra você.`,
  ({ topTitulo, quantidade }) =>
    `📈 Achei ${quantidade} vídeos em alta no seu nicho agora. O topo é "${topTitulo}" — vale dar uma olhada.`,
  ({ topTitulo, topViews }) =>
    `👀 Tendência fresquinha: "${topTitulo}" já passou de ${topViews} visualizações. Relatório novo te esperando.`,
  ({ quantidade }) =>
    `🆕 Varredura concluída: ${quantidade} vídeos em alta detectados no nicho gaming. Dá uma conferida no relatório.`,
  ({ topTitulo }) =>
    `💡 Inspiração fresca chegou: "${topTitulo}" está decolando agora. Já separei ideias parecidas pra você.`,
  ({ topCanal, topTitulo }) =>
    `📊 O canal ${topCanal} está surfando alto com "${topTitulo}". Relatório com os detalhes já está pronto.`,
  ({ quantidade }) =>
    `⚡ Nova rodada de tendências: ${quantidade} vídeos que estão crescendo rápido agora mesmo.`
];

let _ultimosIndicesUsados = [];

function gerarMensagemNotificacao(dadosResumo) {
  let indice;
  do {
    indice = Math.floor(Math.random() * _templatesNotificacao.length);
  } while (_ultimosIndicesUsados.includes(indice) && _templatesNotificacao.length > _ultimosIndicesUsados.length);

  _ultimosIndicesUsados.push(indice);
  if (_ultimosIndicesUsados.length > 2) _ultimosIndicesUsados.shift(); // guarda só as 2 últimas

  return _templatesNotificacao[indice](dadosResumo);
}

// ────────────────────────────────────────────────────────────
// 🧠 MOTIVO DE ESTAR EM ALTA (heurística baseada em velocidade + engajamento)
// ────────────────────────────────────────────────────────────
function calcularMotivoEmAlta(video) {
  const horasDesdePublicacao = Math.max(
    (Date.now() - new Date(video.publicadoEm).getTime()) / 1000 / 60 / 60,
    1
  );
  const viewsPorHora = video.visualizacoes / horasDesdePublicacao;
  const taxaEngajamento = video.visualizacoes > 0
    ? ((video.curtidas + video.comentarios) / video.visualizacoes) * 100
    : 0;

  const partes = [];

  if (horasDesdePublicacao <= 24) {
    partes.push(`publicado há menos de 24h e já com ${Math.round(viewsPorHora).toLocaleString('pt-BR')} views/hora`);
  } else if (viewsPorHora > 2000) {
    partes.push(`mantendo um ritmo forte de ${Math.round(viewsPorHora).toLocaleString('pt-BR')} views/hora mesmo alguns dias depois de publicado`);
  } else {
    partes.push(`acumulando visualizações de forma constante ao longo dos dias`);
  }

  if (taxaEngajamento > 3) {
    partes.push(`taxa de engajamento alta (${taxaEngajamento.toFixed(1)}%), sinal de que a audiência está reagindo forte ao conteúdo`);
  } else if (taxaEngajamento > 1) {
    partes.push(`engajamento saudável (${taxaEngajamento.toFixed(1)}%)`);
  }

  return `Está em alta porque está ${partes.join(' e ')}.`;
}

// ────────────────────────────────────────────────────────────
// 💡 EXEMPLOS DE INSPIRAÇÃO — cruza o título com nossa base de conhecimento
// ────────────────────────────────────────────────────────────
function buscarExemplosInspiracao(tituloVideo) {
  const conhecimento = AssistenteConhecimento.obterConhecimentoJogo(tituloVideo);

  if (conhecimento) {
    return {
      jogoDetectado: conhecimento.nome,
      exemplos: conhecimento.topVideosReferencia.slice(0, 3),
      ganchoSugerido: conhecimento.ganchosVirais[0]
    };
  }

  // Fallback: nenhum jogo específico reconhecido — sugere formatos universais
  const formatos = AssistenteConhecimento.formatosUniversaisDeVideo.slice(0, 3);
  return {
    jogoDetectado: null,
    exemplos: formatos.map(f => `${f.formato}: "${f.exemplo}"`),
    ganchoSugerido: null
  };
}

// ────────────────────────────────────────────────────────────
// 📋 GERAR RELATÓRIO COMPLETO
// ────────────────────────────────────────────────────────────
async function gerarRelatorio({ apiKey = null, regionCode = 'BR', maxResults = 10 } = {}) {
  const videos = await AssistenteConhecimento.buscarTendenciasGeralGaming(apiKey, regionCode, maxResults, true);

  const itensRelatorio = videos.map(video => ({
    ...video,
    motivo: calcularMotivoEmAlta(video),
    inspiracao: buscarExemplosInspiracao(video.titulo)
  }));

  return {
    geradoEm: new Date().toISOString(),
    quantidade: itensRelatorio.length,
    itens: itensRelatorio
  };
}

// ────────────────────────────────────────────────────────────
// 📄 GERAR PDF DO RELATÓRIO
// ────────────────────────────────────────────────────────────
async function baixarImagemComoBuffer(url) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) return null;
    const arrayBuffer = await resposta.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    return null;
  }
}

function sanitizarTextoPDF(str) {
  if (!str) return '';
  return String(str)
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .trim();
}

async function gerarPDF(relatorio) {
  if (!PDFDocument) return null;
  const nomeArquivo = `tendencias-${new Date(relatorio.geradoEm).toISOString().replace(/[:.]/g, '-')}.pdf`;
  const caminhoArquivo = path.join(PASTA_RELATORIOS, nomeArquivo);

  // A4: 595.28 x 841.89 pt. margin:0 para controle total das coordenadas.
  const PAGE_W = 595.28;
  const PAGE_H = 841.89;
  const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true, autoFirstPage: true });
  const stream = fs.createWriteStream(caminhoArquivo);
  doc.pipe(stream);

  // Cores do Design System Tomada
  const COR = {
    primary: '#E55A2B', dark: '#111827', cardBg: '#F8FAFC',
    cardBorder: '#E2E8F0', text: '#1E293B', muted: '#64748B',
    link: '#2563EB', white: '#FFFFFF', footerText: '#94A3B8'
  };

  // Layout Constants
  const HEADER_FIRST = 92;
  const HEADER_OTHER = 44;
  const FOOTER_H = 24;
  const FOOTER_TOP = PAGE_H - FOOTER_H;
  const MX = 36;
  const CARD_W = PAGE_W - 2 * MX;
  const CARD_GAP = 14;
  const CARDS_PER_PAGE = 2;
  const CARD_H_FIRST = Math.floor((FOOTER_TOP - HEADER_FIRST - CARD_GAP - (CARDS_PER_PAGE - 1) * CARD_GAP) / CARDS_PER_PAGE);
  const CARD_H_OTHER = Math.floor((FOOTER_TOP - HEADER_OTHER - CARD_GAP - (CARDS_PER_PAGE - 1) * CARD_GAP) / CARDS_PER_PAGE);

  // Desenha Header
  const desenharHeader = (isFirst) => {
    if (isFirst) {
      doc.rect(0, 0, PAGE_W, 85).fill(COR.dark);
      doc.rect(0, 81, PAGE_W, 4).fill(COR.primary);
      doc.fillColor(COR.white).fontSize(18).font('Helvetica-Bold')
        .text('TOMADA PLANNER', MX, 22, { lineBreak: false });
      doc.fillColor(COR.primary).fontSize(10).font('Helvetica-Bold')
        .text('COPILOT YOUTUBE - RELATORIO DE TENDENCIAS', MX, 44, { lineBreak: false });
      const dataFmt = new Date(relatorio.geradoEm).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      doc.fillColor(COR.footerText).fontSize(9).font('Helvetica')
        .text(`Gerado em: ${dataFmt} - ${relatorio.quantidade} Tendencias Mapeadas`, MX, 60, { width: CARD_W, align: 'right', lineBreak: false });
    } else {
      doc.rect(0, 0, PAGE_W, 35).fill(COR.dark);
      doc.rect(0, 32, PAGE_W, 3).fill(COR.primary);
      doc.fillColor(COR.white).fontSize(10).font('Helvetica-Bold')
        .text('TOMADA PLANNER - COPILOT YOUTUBE', MX, 10, { lineBreak: false });
    }
  };

  // Desenha 1 Card Completo
  const desenharCard = async (item, idx, x, y, w, h) => {
    doc.roundedRect(x, y, w, h, 6).fillAndStroke(COR.cardBg, COR.cardBorder);
    const pad = 10;
    let cy = y + pad;

    // Thumbnail
    let hasThumb = false;
    if (item.thumbnail) {
      const buf = await baixarImagemComoBuffer(item.thumbnail);
      if (buf) {
        try { doc.image(buf, x + pad, cy, { fit: [150, 84] }); hasThumb = true; } catch (_) {}
      }
    }
    const tx = hasThumb ? x + pad + 160 : x + pad;
    const tw = hasThumb ? w - pad * 2 - 160 : w - pad * 2;

    // Badge + Titulo
    doc.fillColor(COR.primary).fontSize(9).font('Helvetica-Bold')
      .text(`#${idx + 1} EM ALTA`, tx, cy, { lineBreak: false });
    doc.fillColor(COR.text).fontSize(11).font('Helvetica-Bold')
      .text(sanitizarTextoPDF(item.titulo), tx, cy + 13, { width: tw, height: 30, ellipsis: true });

    // Stats
    const stats = `Canal: ${sanitizarTextoPDF(item.canal)}   -   ${item.visualizacoes.toLocaleString('pt-BR')} views   -   ${item.curtidas.toLocaleString('pt-BR')} likes`;
    doc.fillColor(COR.muted).fontSize(8).font('Helvetica-Bold')
      .text(stats, tx, cy + 48, { width: tw, lineBreak: false });

    // Divider
    const divY = y + pad + 98;
    doc.moveTo(x + pad, divY).lineTo(x + w - pad, divY).strokeColor(COR.cardBorder).lineWidth(0.6).stroke();

    let dy = divY + 10;

    // Motivo
    doc.fillColor(COR.primary).fontSize(9).font('Helvetica-Bold')
      .text('POR QUE ESTA EM ALTA:', x + pad, dy, { lineBreak: false });
    dy += 13;
    doc.fillColor(COR.text).fontSize(8.5).font('Helvetica')
      .text(sanitizarTextoPDF(item.motivo), x + pad, dy, { width: w - pad * 2, height: 48, ellipsis: true });
    dy += 52;

    // Exemplos
    const jogoLabel = item.inspiracao.jogoDetectado
      ? `EXEMPLOS PARA SE INSPIRAR (${sanitizarTextoPDF(item.inspiracao.jogoDetectado).toUpperCase()}):`
      : 'FORMATOS UNIVERSAIS PARA SE INSPIRAR:';
    doc.fillColor(COR.dark).fontSize(9).font('Helvetica-Bold')
      .text(jogoLabel, x + pad, dy, { width: w - pad * 2, lineBreak: false });
    dy += 13;
    (item.inspiracao.exemplos || []).slice(0, 3).forEach(ex => {
      doc.fillColor(COR.muted).fontSize(8.5).font('Helvetica')
        .text(`- ${sanitizarTextoPDF(ex)}`, x + pad + 6, dy, { width: w - pad * 2 - 6, height: 13, ellipsis: true });
      dy += 14;
    });

    // Gancho
    if (item.inspiracao.ganchoSugerido) {
      dy += 3;
      doc.fillColor(COR.primary).fontSize(8.5).font('Helvetica-Oblique')
        .text(`Gancho (15s): "${sanitizarTextoPDF(item.inspiracao.ganchoSugerido)}"`, x + pad, dy, { width: w - pad * 2, height: 13, ellipsis: true });
    }

    // Link (fundo do card)
    const linkY = y + h - 18;
    doc.fillColor(COR.link).fontSize(8).font('Helvetica')
      .text(`Assistir no YouTube: ${item.url}`, x + pad, linkY, { width: w - pad * 2, height: 12, underline: true, ellipsis: true });
    doc.link(x + pad, linkY, w - pad * 2, 12, item.url);
  };

  // Monta todas as paginas
  desenharHeader(true);
  const total = relatorio.itens.length;

  for (let i = 0; i < total; i++) {
    const slot = i % CARDS_PER_PAGE;
    const isFirst = i < CARDS_PER_PAGE;

    if (i > 0 && slot === 0) {
      doc.addPage();
      desenharHeader(false);
    }

    const hdrH = isFirst ? HEADER_FIRST : HEADER_OTHER;
    const cardH = isFirst ? CARD_H_FIRST : CARD_H_OTHER;
    const cardY = hdrH + slot * (cardH + CARD_GAP);

    await desenharCard(relatorio.itens[i], i, MX, cardY, CARD_W, cardH);
  }

  // Rodape
  const range = doc.bufferedPageRange();
  for (let p = range.start; p < range.start + range.count; p++) {
    doc.switchToPage(p);
    doc.rect(0, FOOTER_TOP, PAGE_W, FOOTER_H).fill(COR.dark);
    doc.fillColor(COR.footerText).fontSize(8).font('Helvetica')
      .text('Tomada Planner 2026 - Inteligencia de Conteudo YouTube Gaming', MX, FOOTER_TOP + 7, { lineBreak: false });
    doc.fillColor(COR.white).fontSize(8).font('Helvetica-Bold')
      .text(`Pagina ${p + 1} de ${range.count}`, MX, FOOTER_TOP + 7, { width: CARD_W, align: 'right', lineBreak: false });
  }

  doc.end();
  await new Promise(resolve => stream.on('finish', resolve));
  return caminhoArquivo;
}

// ────────────────────────────────────────────────────────────
// ⏰ AGENDADOR — roda a cada X horas
// ────────────────────────────────────────────────────────────
let _intervalId = null;

async function executarCicloCompleto({ apiKey, regionCode, maxResults, onNotificacao, onPDFGerado, onErro }) {
  try {
    const relatorio = await gerarRelatorio({ apiKey, regionCode, maxResults });
    if (relatorio.quantidade === 0) return;

    const caminhoPDF = await gerarPDF(relatorio);

    const top = relatorio.itens[0];
    const mensagem = gerarMensagemNotificacao({
      topTitulo: top.titulo,
      topViews: top.visualizacoes.toLocaleString('pt-BR'),
      topCanal: top.canal,
      quantidade: relatorio.quantidade
    });

    if (onPDFGerado) onPDFGerado(caminhoPDF, relatorio);
    if (onNotificacao) onNotificacao(mensagem, { relatorio, caminhoPDF });
  } catch (erro) {
    if (onErro) onErro(erro);
    else console.error('[monitor-tendencias] Erro no ciclo:', erro);
  }
}

/**
 * Inicia o monitoramento periódico.
 *
 * @param {object} opcoes
 * @param {number} opcoes.intervaloHoras - Intervalo entre buscas (padrão 10)
 * @param {string} [opcoes.apiKey] - YouTube API key (senão usa process.env.YOUTUBE_API_KEY)
 * @param {string} [opcoes.regionCode] - Região (padrão 'BR')
 * @param {number} [opcoes.maxResults] - Quantos vídeos por relatório (padrão 10)
 * @param {boolean} [opcoes.rodarImediatamente] - Roda um ciclo assim que iniciar (padrão true)
 * @param {(mensagem: string, dados: object) => void} opcoes.onNotificacao - Chamado com a mensagem pro popup
 * @param {(caminhoPDF: string, relatorio: object) => void} [opcoes.onPDFGerado] - Chamado quando o PDF fica pronto
 * @param {(erro: Error) => void} [opcoes.onErro] - Chamado se algo falhar no ciclo
 */
function iniciarMonitoramento(opcoes = {}) {
  const {
    intervaloHoras = 10,
    apiKey = null,
    regionCode = 'BR',
    maxResults = 10,
    rodarImediatamente = true,
    onNotificacao,
    onPDFGerado,
    onErro
  } = opcoes;

  if (!onNotificacao) {
    throw new Error('Você precisa passar onNotificacao(mensagem, dados) pra receber os alertas.');
  }

  const ciclo = () => executarCicloCompleto({ apiKey, regionCode, maxResults, onNotificacao, onPDFGerado, onErro });

  if (rodarImediatamente) ciclo();

  _intervalId = setInterval(ciclo, intervaloHoras * 60 * 60 * 1000);
  return _intervalId;
}

function pararMonitoramento() {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
}

module.exports = {
  iniciarMonitoramento,
  pararMonitoramento,
  gerarRelatorio,
  gerarPDF,
  gerarMensagemNotificacao,
  calcularMotivoEmAlta,
  buscarExemplosInspiracao
};
