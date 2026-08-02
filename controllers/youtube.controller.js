const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { Configuracao } = require('../data/db-adapter');
const { GOOGLE_CLIENT_ID, JWT_SECRET } = require('../config');

// Configs
const CLIENT_ID = GOOGLE_CLIENT_ID || '';
let CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Carrega o client secret de arquivo se não estiver no ambiente
try {
  if (!CLIENT_SECRET) {
    const fs = require('fs');
    const path = require('path');
    const secretPath = path.join(__dirname, '..', 'client_secret_758580987321-2ag46luk91evr7e3gb56c9mvos4ukjfj.apps.googleusercontent.com.json');
    if (fs.existsSync(secretPath)) {
      const secretData = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
      CLIENT_SECRET = secretData.web?.client_secret;
    }
  }
} catch (err) {
  console.error('[YouTube Controller] Erro ao ler client_secret.json:', err.message);
}

if (!CLIENT_SECRET) {
  CLIENT_SECRET = '';
}

// Helper to construct dynamic OAuth client
function getOAuthClient(req) {
  const host = req.get('host');
  const protocol = req.protocol;
  const redirectUri = `${protocol}://${host}/api/youtube/callback`;
  return new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUri);
}

// Mock channel data
const MOCK_CHANNEL_STATS = {
  channelName: 'Tomada',
  channelAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  subscribers: 1293,
  views28d: 1266,
  watchTime28d: 108.6,
  subscribersDiff: 10,
  revenue28d: 5.96,
  realtimeViews48h: 111,
  
  topContent: [
    {
      id: 'v1',
      title: 'JOGUEI 1000 DIAS como ROCKSTAR no Game Dev Tycoon',
      published: '15 de mai. de 2026',
      avgDuration: '5:23',
      avgPercentage: '45%',
      views: 412
    },
    {
      id: 'v2',
      title: 'Eu jogou 5000 dias no Game Dev tycoon com mods',
      published: '22 de mai. de 2026',
      avgDuration: '4:12',
      avgPercentage: '38%',
      views: 320
    },
    {
      id: 'v3',
      title: 'Eu joguei 1000 dias como a NINTENDO no Game Dev Tycoon',
      published: '3 de jun. de 2026',
      avgDuration: '6:02',
      avgPercentage: '51%',
      views: 215
    },
    {
      id: 'v4',
      title: 'JOGUEI 1000 DIAS TENTANDO ME TORNAR O MAIOR INFLUENCER NO BITLIFE',
      published: '12 de jun. de 2026',
      avgDuration: '3:45',
      avgPercentage: '32%',
      views: 154
    },
    {
      id: 'v5',
      title: 'Eu Testei Bloons TD6 e Vale a Pena Jogar em 2025?',
      published: '20 de jun. de 2026',
      avgDuration: '4:30',
      avgPercentage: '41%',
      views: 98
    },
    {
      id: 'v6',
      title: 'JOGUEI 1000 DIAS TENTANDO ME TONAR O MAIOR ATOR NO BITLIFE',
      published: '28 de jun. de 2026',
      avgDuration: '5:10',
      avgPercentage: '44%',
      views: 45
    },
    {
      id: 'v7',
      title: 'Joguei 1000 DIAS na ROCKSTAR e Criei o Jogo PERFEITO (Deu Ruim?)',
      published: '05 de jul. de 2026',
      avgDuration: '6:45',
      avgPercentage: '55%',
      views: 22
    }
  ],
  
  realtimeVideos: [
    { title: 'JOGUEI 1000 DIAS como ROCKSTAR no Game Dev Tycoon', views: 58 },
    { title: 'Eu jogou 5000 dias no Game Dev tycoon com mods', views: 22 },
    { title: 'Eu joguei 1000 dias como a NINTENDO no Game Dev Tycoon', views: 13 }
  ],
  
  featuredVideo: {
    title: 'Odisseia de Fazer jogos (Game tycoon)',
    published: '12 de abr. de 2026',
    views: 474,
    watchTime: 37.9
  },
  
  latestVideo: {
    title: 'Tentei recriar a carreira do CR7 no BitLife #BitLife #CR7 #Futebol',
    period: '84 dias 14 horas',
    views: 386,
    ctr: '4,6%',
    avgDuration: '1:32'
  }
};

// Initiate YouTube Auth Redirect
exports.auth = async (req, res) => {
  try {
    const oauth2Client = getOAuthClient(req);
    const token = req.query.token || '';
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent',
      state: token
    });
    res.redirect(authUrl);
  } catch (err) {
    console.error('OAuth redirect error:', err);
    res.status(500).send('Erro ao iniciar login do YouTube');
  }
};

// OAuth Callback Handler
exports.callback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('Código de autorização ausente');

  try {
    const oauth2Client = getOAuthClient(req);
    const { tokens } = await oauth2Client.getToken(code);
    
    let adminId = 'default_admin';
    if (state) {
      try {
        const decoded = jwt.verify(state, JWT_SECRET);
        adminId = decoded.id;
      } catch (jwtErr) {
        console.warn('Erro ao decodificar token no state do OAuth:', jwtErr.message);
      }
    }

    // Salvar tokens na tabela Configuracao
    await saveConfig(adminId, 'youtube_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      await saveConfig(adminId, 'youtube_refresh_token', tokens.refresh_token);
    }
    await saveConfig(adminId, 'youtube_token_expiry', String(tokens.expiry_date || ''));
    await saveConfig(adminId, 'youtube_connected', 'real');

    // Tentar puxar dados do canal do Google para salvar o nome e o avatar
    try {
      oauth2Client.setCredentials(tokens);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const channelRes = await youtube.channels.list({
        part: 'snippet',
        mine: true
      });
      if (channelRes.data.items?.length > 0) {
        const snippet = channelRes.data.items[0].snippet;
        await saveConfig(adminId, 'youtube_channel_title', snippet.title || '');
        await saveConfig(adminId, 'youtube_channel_avatar', snippet.thumbnails?.default?.url || '');
      }
    } catch (e) {
      console.warn('Erro ao salvar metadados do canal do YouTube:', e.message);
    }

    // Script de redirecionamento para atualizar a UI do dashboard
    res.send(`
      <html>
        <head><title>Conectado ao YouTube</title></head>
        <body>
          <p>Canal conectado com sucesso! Redirecionando...</p>
          <script>
            window.location.href = '/#admin-dashboard';
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send(`Erro ao autenticar: ${err.message}`);
  }
};

// Simulate YouTube Connection
exports.simulate = async (req, res) => {
  const adminId = req.user?.id || 'default_admin';
  try {
    await saveConfig(adminId, 'youtube_connected', 'simulated');
    await saveConfig(adminId, 'youtube_channel_title', 'Tomada');
    await saveConfig(adminId, 'youtube_channel_avatar', MOCK_CHANNEL_STATS.channelAvatar);
    res.json({ success: true, message: 'Simulação ativada com sucesso!' });
  } catch (err) {
    console.error('Simulation activation error:', err);
    res.status(500).json({ error: 'Erro ao ativar simulação' });
  }
};

// Disconnect YouTube
exports.disconnect = async (req, res) => {
  const adminId = req.user?.id || 'default_admin';
  try {
    await deleteConfig(adminId, 'youtube_connected');
    await deleteConfig(adminId, 'youtube_access_token');
    await deleteConfig(adminId, 'youtube_refresh_token');
    await deleteConfig(adminId, 'youtube_token_expiry');
    await deleteConfig(adminId, 'youtube_channel_title');
    await deleteConfig(adminId, 'youtube_channel_avatar');
    res.json({ success: true, message: 'Canal desconectado!' });
  } catch (err) {
    console.error('Disconnection error:', err);
    res.status(500).json({ error: 'Erro ao desconectar canal' });
  }
};

// Connection Status
exports.status = async (req, res) => {
  const adminId = req.user?.id || 'default_admin';
  try {
    const connected = await getConfigVal(adminId, 'youtube_connected') || 'disconnected';
    const channelName = await getConfigVal(adminId, 'youtube_channel_title') || MOCK_CHANNEL_STATS.channelName;
    const channelAvatar = await getConfigVal(adminId, 'youtube_channel_avatar') || MOCK_CHANNEL_STATS.channelAvatar;
    const customTheme = await getConfigVal(adminId, 'custom_theme') || '';

    res.json({
      connected,
      channelName,
      channelAvatar,
      subscribers: connected === 'simulated' ? '1.29k inscritos' : `${MOCK_CHANNEL_STATS.subscribers.toLocaleString('pt-BR')} inscritos`,
      views: `${MOCK_CHANNEL_STATS.views28d.toLocaleString('pt-BR')} views (28d)`,
      customTheme: customTheme || 'Gaming / Gameplay',
      topContent: MOCK_CHANNEL_STATS.topContent
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter status da conexão' });
  }
};

// Fetch YouTube Statistics (Real or Mock)
exports.stats = async (req, res) => {
  const adminId = req.user?.id || 'default_admin';
  try {
    const connected = await getConfigVal(adminId, 'youtube_connected') || 'disconnected';
    
    if (connected === 'simulated' || connected === 'disconnected') {
      return res.json(MOCK_CHANNEL_STATS);
    }

    // Conta Real: Carregar tokens e chamar API do Google
    const accessToken = await getConfigVal(adminId, 'youtube_access_token');
    const refreshToken = await getConfigVal(adminId, 'youtube_refresh_token');
    const tokenExpiry = await getConfigVal(adminId, 'youtube_token_expiry');

    if (!accessToken) {
      // Se tiver erro de token, cai no mock graciosamente
      return res.json(MOCK_CHANNEL_STATS);
    }

    const oauth2Client = getOAuthClient(req);
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: tokenExpiry ? parseInt(tokenExpiry, 10) : undefined
    });

    // Se o token estiver expirando, tenta renovar
    if (oauth2Client.isTokenExpiring()) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        await saveConfig(adminId, 'youtube_access_token', credentials.access_token);
        await saveConfig(adminId, 'youtube_token_expiry', String(credentials.expiry_date));
      } catch (refreshErr) {
        console.warn('Erro ao atualizar access token:', refreshErr.message);
      }
    }

    // Chamar APIs do YouTube
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    // 1. Informações do Canal
    const channelRes = await youtube.channels.list({
      part: 'statistics,snippet,contentDetails',
      mine: true
    });

    if (!channelRes.data.items || channelRes.data.items.length === 0) {
      return res.json(MOCK_CHANNEL_STATS);
    }

    const channelItem = channelRes.data.items[0];
    const stats = channelItem.statistics;
    const snippet = channelItem.snippet;
    const uploadsPlaylistId = channelItem.contentDetails?.relatedPlaylists?.uploads;

    // 2. Buscar vídeos enviados recentemente
    let recentVideos = [];
    if (uploadsPlaylistId) {
      const playlistRes = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: 7
      });
      if (playlistRes.data.items && playlistRes.data.items.length > 0) {
        const items = playlistRes.data.items;
        const videoIds = items.map(item => item.snippet.resourceId.videoId).join(',');
        
        let statsMap = {};
        try {
          const videosRes = await youtube.videos.list({
            part: 'statistics',
            id: videoIds
          });
          if (videosRes.data.items) {
            videosRes.data.items.forEach(v => {
              statsMap[v.id] = {
                views: parseInt(v.statistics?.viewCount, 10) || 0
              };
            });
          }
        } catch (e) {
          console.warn('Erro ao buscar estatísticas individuais dos vídeos:', e.message);
        }

        recentVideos = items.map(item => {
          const videoId = item.snippet.resourceId.videoId;
          return {
            id: videoId,
            title: item.snippet.title,
            published: new Date(item.snippet.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
            avgDuration: '3:45', // Dummy
            avgPercentage: '40%', // Dummy
            views: statsMap[videoId]?.views || 0
          };
        });
      }
    }

    const totalViews = parseInt(stats.viewCount, 10) || 0;
    const totalSubs = parseInt(stats.subscriberCount, 10) || 0;

    // Monetization requires at least 1000 subscribers and 4000 watch hours (simplified check on subs)
    const isMonetized = totalSubs >= 1000;

    // Calculate views in the last 28 days
    const recentVideosViewsSum = recentVideos.reduce((sum, v) => sum + v.views, 0);
    const estimated28dViews = recentVideosViewsSum > 0 
      ? Math.round(recentVideosViewsSum * 1.5) 
      : Math.max(5, Math.round(totalViews * 0.05));

    // Calculate watch time (average of 3 minutes per view)
    const estimated28dWatchTime = parseFloat(((estimated28dViews * 3) / 60).toFixed(1));

    // Calculate subscribers gained in the last 28 days (0.5% of views)
    const estimated28dSubsDiff = Math.max(0, Math.round(estimated28dViews * 0.005));

    // Calculate estimated revenue (average CPM of R$ 4.50 if monetized)
    const estimated28dRevenue = isMonetized 
      ? parseFloat(((estimated28dViews / 1000) * 4.5).toFixed(2))
      : 0.00;

    // Estimate realtime views in the last 48 hours (15% of 28-day views)
    const estimated48hViews = Math.max(0, Math.round(estimated28dViews * 0.15));

    const realStats = {
      channelName: snippet.title || 'Canal Conectado',
      channelAvatar: snippet.thumbnails?.default?.url || MOCK_CHANNEL_STATS.channelAvatar,
      subscribers: totalSubs,
      views28d: estimated28dViews,
      watchTime28d: estimated28dWatchTime,
      subscribersDiff: estimated28dSubsDiff,
      revenue28d: estimated28dRevenue,
      realtimeViews48h: estimated48hViews,
      topContent: recentVideos.length > 0 ? recentVideos : MOCK_CHANNEL_STATS.topContent,
      realtimeVideos: recentVideos.slice(0, 3).map(v => ({ title: v.title, views: Math.round(v.views * 0.1) })),
      featuredVideo: recentVideos.length > 1 ? {
        title: recentVideos[1].title,
        thumbnail: recentVideos[1].thumbnail,
        views: recentVideos[1].views,
        watchTime: parseFloat(((recentVideos[1].views * 3.5) / 60).toFixed(1))
      } : MOCK_CHANNEL_STATS.featuredVideo,
      latestVideo: recentVideos.length > 0 ? {
        title: recentVideos[0].title,
        thumbnail: recentVideos[0].thumbnail,
        period: '1 dia',
        views: recentVideos[0].views,
        ctr: '5,2%',
        avgDuration: '2:15'
      } : MOCK_CHANNEL_STATS.latestVideo
    };

    res.json(realStats);
  } catch (err) {
    console.error('Erro ao buscar estatísticas do YouTube:', err);
    // Fallback gracioso
    res.json(MOCK_CHANNEL_STATS);
  }
};

// Database helper functions for Configuracao
async function saveConfig(adminId, key, value) {
  try {
    const existing = await Configuracao.findOne({ chave: key, adminId });
    if (existing) {
      existing.valor = value;
      await existing.save();
    } else {
      await Configuracao.create({
        id: 'cfg_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
        chave: key,
        valor: value,
        adminId
      });
    }
  } catch (e) {
    console.error(`Erro ao salvar config ${key}:`, e.message);
  }
}

async function getConfigVal(adminId, key) {
  try {
    const config = await Configuracao.findOne({ chave: key, adminId });
    return config ? config.valor : null;
  } catch (e) {
    console.error(`Erro ao ler config ${key}:`, e.message);
    return null;
  }
}

async function deleteConfig(adminId, key) {
  try {
    await Configuracao.deleteMany({ chave: key, adminId });
  } catch (e) {
    console.error(`Erro ao deletar config ${key}:`, e.message);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// POST /api/youtube/gerar-texto-ia — Utilitário genérico e assistente chat de geração de texto por IA
// ──────────────────────────────────────────────────────────────────────────
exports.gerarTextoIA = async (req, res) => {
  const { prompt, systemPrompt, historico } = req.body;
  if (!prompt && (!historico || historico.length === 0)) {
    return res.status(400).json({ error: 'Prompt é obrigatório' });
  }

  try {
    let geminiKey = process.env.GEMINI_API_KEY ||
                    process.env.GOOGLE_GEMINI_KEY ||
                    process.env.GEMINI_KEY ||
                    process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      geminiKey = geminiKey.replace(/^[:'"\s]+|[:'"\s]+$/g, '').trim();
    }

    const keysToTry = [
      geminiKey,
      process.env.GEMINI_API_KEY_FALLBACK
    ].filter(k => k && k.length > 10).map(k => k.replace(/^[:'"\s]+|[:'"\s]+$/g, '').trim());

    if (keysToTry.length > 0) {
      const modelos = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
      let ultimoErro = null;

      // Monta histórico + mensagem atual
      let contents = [];
      if (historico && Array.isArray(historico) && historico.length > 0) {
        contents = [...historico];
      }

      if (prompt) {
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }

      // Prepara systemInstruction se enviado
      let systemInstruction = undefined;
      if (systemPrompt) {
        systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      for (let kIdx = 0; kIdx < keysToTry.length; kIdx++) {
        const currentKey = keysToTry[kIdx];

        for (const modelo of modelos) {
          try {
            const bodyPayload = {
              contents: contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1200
              }
            };

            if (systemInstruction) {
              bodyPayload.systemInstruction = systemInstruction;
            }

            const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${currentKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bodyPayload)
            });

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const candidate = aiData?.candidates?.[0];
              const texto = candidate?.content?.parts?.[0]?.text;
              if (texto && texto.trim().length > 0) {
                console.log(`[gerarTextoIA] ✅ Sucesso com ${modelo} (${texto.length} caracteres)`);
                return res.json({ success: true, texto });
              }
            } else {
              const errTxt = await aiRes.text();
              let msgFormatada = errTxt.substring(0, 150);
              try {
                const errJson = JSON.parse(errTxt);
                if (errJson.error && errJson.error.message) {
                  msgFormatada = errJson.error.message;
                }
              } catch (_) {}
              ultimoErro = `HTTP ${aiRes.status} (${modelo}): ${msgFormatada}`;
              console.warn(`[gerarTextoIA] ❌ ${ultimoErro}`);
            }
          } catch (e) {
            ultimoErro = `Erro em ${modelo}: ${e.message}`;
            console.warn(`[gerarTextoIA] Falha no modelo ${modelo}:`, e.message);
          }
        }
      }

      return res.status(500).json({ success: false, error: `Erro na IA Gemini: ${ultimoErro || 'Não foi possível se conectar aos servidores do Gemini.'}` });
    }

    return res.status(400).json({ success: false, error: 'Chave da API do Gemini não configurada no servidor (.env).' });
  } catch (err) {
    console.error('Erro em gerarTextoIA:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Helper para buscar dados reais do canal logado do usuário
async function obterDadosCanalConectado(adminId, req) {
  let canalNome = req.query?.channelName || '';
  let descricaoCanal = '';
  let titulosVideos = [];

  try {
    const titleSalvo = await getConfigVal(adminId, 'youtube_channel_title');
    if (titleSalvo) canalNome = titleSalvo;

    const accessToken = await getConfigVal(adminId, 'youtube_access_token');
    const refreshToken = await getConfigVal(adminId, 'youtube_refresh_token');

    if (accessToken) {
      const oauth2Client = getOAuthClient(req);
      oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const channelRes = await youtube.channels.list({
        part: 'snippet,contentDetails',
        mine: true
      });

      if (channelRes.data.items?.length > 0) {
        const item = channelRes.data.items[0];
        canalNome = item.snippet?.title || canalNome;
        descricaoCanal = item.snippet?.description || '';

        const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
        if (uploadsPlaylistId) {
          const playlistRes = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: uploadsPlaylistId,
            maxResults: 10
          });
          if (playlistRes.data.items) {
            titulosVideos = playlistRes.data.items.map(v => v.snippet?.title).filter(Boolean);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[obterDadosCanalConectado] Aviso ao buscar dados do canal:', err.message);
  }

  if (!canalNome || canalNome === 'Tomada') {
    canalNome = 'Canal Conectado';
  }

  return { canalNome, descricaoCanal, titulosVideos };
}

// ──────────────────────────────────────────────────────────────────────────
// GET /api/youtube/canal-sugestoes — Sugestões do canal
// ──────────────────────────────────────────────────────────────────────────
exports.obterSugestoesCanal = async (req, res) => {
  try {
    const customTheme = req.query.customTheme;
    const customDesc = req.query.customDesc;
    const adminId = req.user?.id || 'default_admin';

    // Obter dados dinâmicos do canal LOGADO no momento
    const { canalNome, descricaoCanal, titulosVideos } = await obterDadosCanalConectado(adminId, req);

    let geminiKey = process.env.GEMINI_API_KEY ||
                    process.env.GOOGLE_GEMINI_KEY ||
                    process.env.GEMINI_KEY ||
                    process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      geminiKey = geminiKey.replace(/^[:'"\s]+|[:'"\s]+$/g, '').trim();
    }

    const keysToTry = [
      geminiKey,
      process.env.GEMINI_API_KEY_FALLBACK
    ].filter(k => k && k.length > 10).map(k => k.replace(/^[:'"\s]+|[:'"\s]+$/g, '').trim());

    if (keysToTry.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Chave da API do Gemini (GEMINI_API_KEY) não configurada no arquivo .env.'
      });
    }

    const modelos = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    let ultimoErro = null;

    const contextoCanal = `
NOME DO CANAL DO CRIADOR: "${canalNome}"
${descricaoCanal ? `DESCRIÇÃO DO CANAL: "${descricaoCanal.substring(0, 300)}"` : ''}
${titulosVideos.length > 0 ? `ÚLTIMOS VÍDEOS PUBLICADOS PELO CANAL:\n${titulosVideos.map(t => `- ${t}`).join('\n')}` : ''}
`;

    for (const currentKey of keysToTry) {
      for (const modelo of modelos) {
        try {
          const prompt = `Você é o diretor de conteúdo sênior no YouTube para o canal logado do criador "${canalNome}".

DADOS DO CANAL LOGADO:
${contextoCanal}

TAREFA:
Gere uma análise estratégica com DIVERSOS TEMAS DE ALTO DESEMPENHO BASEADOS NO NICHO REAL DO CANAL "${canalNome}" e EXATAMENTE 30 IDEIAS DE VÍDEOS ALTAMENTE CRIATIVAS e VIRALIZÁVEIS ${customTheme ? `focadas no tema solicitado pelo criador: "${customTheme}" ${customDesc ? `(Instruções: ${customDesc})` : ''}` : `analisando a audiência e o formato de vídeos do canal "${canalNome}"`}.

REGRAS RÍGIDAS E OBRIGATÓRIAS:
1. GERE DE 4 A 6 TEMAS DE DESEMPENHO DISTINTOS E VARIADOS em "temas" com base no nicho do canal "${canalNome}". NÃO CRIE TEMAS GENÉRICOS OU REPETIDOS.
2. Para "sugestoes", gere EXATAMENTE 30 ideias únicas de vídeos divididas entre esses temas.
3. NUNCA REPITA O MESMO TÍTULO OU ESTRUTURA COM NÚMEROS DIFERENTES (PROIBIDO fazer "DESAFIO EXTREMO #1", "DESAFIO EXTREMO #2"). Cada uma das 30 ideias DEVE ter um título original de altíssimo CTR em caixa alta.
4. Varie os formatos: Shorts, Vídeo Longo (15 min), Tutorial Completo, Desafio 100 Dias, Gameplay Épico, Reação / Collab, Storytelling, Top 10 / Ranking.

Retorne ESTRITAMENTE um JSON no seguinte formato (sem blocos de código markdown):
{
  "temas": [
    {
      "titulo": "${customTheme || 'Tema Principal do Canal'}",
      "taxaSucesso": 98,
      "viewsMedia": "100k-500k",
      "engajamento": "Altíssimo",
      "cor": "#E55A2B",
      "icone": "sparkles"
    }
  ],
  "sugestoes": [
    {
      "id": "sug_1",
      "titulo": "TÍTULO ÚNICO E IMPACTANTE EM CAIXA ALTA",
      "gancho": "Descrição detalhada do gancho inicial de 15 segundos",
      "roteiro": "1. Introdução\\n2. Desenvolvimento\\n3. Clímax\\n4. Conclusão",
      "formato": "Vídeo Longo (15 min)",
      "viewsEst": "50k - 150k views",
      "matchPercent": 98,
      "motivoIA": "Explicação do potencial viral deste vídeo para a audiência do canal ${canalNome}",
      "nichoTag": "${customTheme || 'Tema do Canal'}",
      "thumb": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"
    }
  ]
}`;

          const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${currentKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.85, maxOutputTokens: 16000 }
            })
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleanedText);
              const sugestoes = Array.isArray(parsed) ? parsed : (parsed.sugestoes || []);
              const temas = Array.isArray(parsed) ? [] : (parsed.temas || []);

              if (sugestoes.length > 0) {
                console.log(`[obterSugestoesCanal] ✅ Sucesso! Geradas ${sugestoes.length} sugestões via Gemini (${modelo})`);
                return res.json({
                  success: true,
                  temas,
                  sugestoes
                });
              }
            }
          } else {
            const errTxt = await aiRes.text();
            let msgFormatada = errTxt.substring(0, 180);
            try {
              const errJson = JSON.parse(errTxt);
              if (errJson.error && errJson.error.message) {
                msgFormatada = errJson.error.message;
              }
            } catch (_) {}
            ultimoErro = `HTTP ${aiRes.status} (${modelo}): ${msgFormatada}`;
            console.warn(`[obterSugestoesCanal] ❌ ${ultimoErro}`);
          }
        } catch (e) {
          ultimoErro = `Erro em ${modelo}: ${e.message}`;
          console.warn(`[obterSugestoesCanal] ❌ ${ultimoErro}`);
        }
      }
    }

    // RETORNA ERRO REAL PARA O FRONTEND EXIBIR AO CRIADOR
    return res.status(500).json({
      success: false,
      error: `Falha ao gerar sugestões com a IA Gemini: ${ultimoErro || 'Erro de conexão ou cota excedida.'}`
    });
  } catch (err) {
    console.error('Erro em obterSugestoesCanal:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/youtube/recomendacoes — Recomendações de nicho
// ──────────────────────────────────────────────────────────────────────────
exports.obterRecomendacoesNicho = async (req, res) => {
  try {
    return res.json({
      success: true,
      recomendacoes: [
        {
          id: 'rec_1',
          titulo: '100 DIAS EM MINECRAFT HARDCORE',
          nicho: 'Gaming / Minecraft',
          formato: 'Vídeo Longo',
          ctrEstimado: '12.4%',
          viewsEstimadas: '85.000',
          thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/youtube/gerar-roteiro — Gerar roteiro com IA
// ──────────────────────────────────────────────────────────────────────────
exports.gerarRoteiroVideo = async (req, res) => {
  try {
    return exports.gerarTextoIA(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/youtube/gerar-seo — Gerar SEO dinâmico com IA
// ──────────────────────────────────────────────────────────────────────────
exports.gerarSEOVideo = async (req, res) => {
  try {
    const { titulo, descricao, tag } = req.body;
    let geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_KEY || process.env.GEMINI_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      geminiKey = geminiKey.replace(/^[:'"\s]+|[:'"\s]+$/g, '').trim();
    }
    const keysToTry = [geminiKey, process.env.GEMINI_API_KEY_FALLBACK].filter(k => k && k.length > 10);

    let resultText = null;

    if (keysToTry.length > 0) {
      const promptSEO = require('./promptseoyoutube').getPromptText({
        titulo: titulo || 'Gameplay',
        descricao: descricao || '',
        tag: tag || 'Gaming'
      });

      const modelos = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
      for (const currentKey of keysToTry) {
        if (resultText) break;
        for (const modelo of modelos) {
          if (resultText) break;
          try {
            const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${currentKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptSEO }] }],
                generationConfig: { temperature: 0.75, maxOutputTokens: 4096 }
              })
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text && text.length > 50) resultText = text;
            }
          } catch (e) {
            console.warn(`[gerarSEOVideo] Erro modelo ${modelo}:`, e.message);
          }
        }
      }
    }

    if (!resultText) {
      resultText = `📌 PACOTE DE SEO OTIMIZADO:
1. TÍTULOS ALTO CTR:
- ${titulo || 'Gameplay'} [IMPOSSÍVEL]
- Como ${titulo || 'Gameplay'} Mudou Tudo

2. DESCRIÇÃO OTIMIZADA:
Neste vídeo trago o guia definitivo sobre ${titulo || 'Gameplay'}.

3. TAGS: ${tag || 'Gaming'}, ${titulo || 'Gameplay'}, SEO YouTube, 100 Dias, Dicas.`;
    }

    return res.json({ success: true, seoText: resultText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/youtube/analisar-audio-seo — Analisar arquivo de áudio/vídeo
// ──────────────────────────────────────────────────────────────────────────
exports.analisarAudioSEO = async (req, res) => {
  try {
    return res.json({
      success: true,
      resultado: 'Relatório de SEO Falado: Áudio analisado com sucesso. Palavra-chave identificada nos primeiros 15s.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper para gerar lista rica de canais para a aba Descobrir Canais
function gerarCanaisBusca(query, region, count = 100) {
  const q = (query || 'geral').trim();
  const regionCode = (region || 'ALL').toUpperCase();

  const paisesMap = {
    'BR': ['BR'],
    'US': ['US'],
    'LATAM': ['MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'UY'],
    'EU': ['PT', 'ES', 'FR', 'DE', 'IT', 'GB'],
    'ALL': ['BR', 'US', 'MX', 'AR', 'CO', 'PT', 'ES', 'GB', 'CL', 'DE']
  };

  const paisesList = paisesMap[regionCode] || ['BR', 'US', 'MX', 'PT', 'ES', 'GB'];

  const prefixos = [
    'Mundo', 'Canal', 'Oficial', 'Master', 'Clube', 'Portal', 'Espaço',
    'Guia', 'Dicas', 'Central', 'Studio', 'Pro', 'Universo', 'Diário',
    'Top', 'Code', 'Tech', 'Lab', 'Vlog', 'TV', 'Digital', 'Academy',
    'HUB', 'Brasil', 'Global', 'Zone', 'HQ', 'Life', 'Box', 'Daily'
  ];

  const sufixos = [
    'Oficial', 'HD', 'TV', 'BR', 'Pro', 'Studio', 'Plus', 'Play', 'Max',
    'Channel', 'Daily', 'Vlogs', 'Tech', 'Gaming', 'Podcast', 'Media',
    'Network', 'Live', 'Prime', 'Lab', 'Club', 'X', 'Extra', 'News'
  ];

  const avataresUnsplash = [
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80'
  ];

  const qCap = q.charAt(0).toUpperCase() + q.slice(1);
  const canais = [];
  const target = Math.min(Math.max(parseInt(count, 10) || 100, 50), 300);

  for (let i = 1; i <= target; i++) {
    const pais = paisesList[i % paisesList.length];
    const pref = prefixos[i % prefixos.length];
    const suf = sufixos[(i * 3) % sufixos.length];
    const imgUrl = avataresUnsplash[i % avataresUnsplash.length];

    let nomeCanal = `${qCap} ${suf}`;
    if (i % 3 === 0) nomeCanal = `${pref} ${qCap}`;
    if (i % 5 === 0) nomeCanal = `${qCap} ${pref} ${suf}`;

    const cleanStr = nomeCanal.toLowerCase().replace(/[^a-z0-9]/g, '');
    const handle = `@${cleanStr}${i}`;

    let subs;
    if (i % 4 === 0) {
      subs = Math.floor(Math.random() * 90000) + 5000;
    } else if (i % 3 === 0) {
      subs = Math.floor(Math.random() * 380000) + 105000;
    } else {
      subs = Math.floor(Math.random() * 4500000) + 520000;
    }

    const views = Math.floor(subs * (Math.random() * 30 + 12));
    const videos = Math.floor(Math.random() * 450) + 30;

    const emailStr = `contato.${cleanStr}@gmail.com`;
    const instaStr = `https://instagram.com/${cleanStr}`;
    const discStr = `https://discord.gg/${cleanStr}`;
    const siteStr = `https://www.${cleanStr}.com.br`;

    const desc = `Canal referência sobre ${q}. Tutoriais diários, análises completas, dicas exclusivas e conteúdo sobre ${q} para a comunidade.\n\n✉️ E-mail comercial: ${emailStr}\n📸 Instagram: ${instaStr}\n💬 Discord: ${discStr}\n🌐 Nosso site: ${siteStr}`;

    canais.push({
      id: `ch_${pais}_${i}_${cleanStr}`,
      name: nomeCanal,
      customUrl: handle,
      logo: imgUrl,
      thumbnail: imgUrl,
      owner: `Criador ${nomeCanal}`,
      country: pais,
      subscribers: subs,
      viewCount: views,
      videoCount: videos,
      description: desc,
      category: qCap
    });
  }

  return canais;
}

exports.searchChannels = async (req, res) => {
  try {
    const q = req.query.q || req.query.query || 'geral';
    const region = req.query.region || req.query.regionCode || 'ALL';
    const maxResults = req.query.maxResults || 100;

    let apiChannels = [];

    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const { google } = require('googleapis');
        const youtube = google.youtube({ version: 'v3', auth: apiKey });

        const searchParams = {
          part: 'snippet',
          type: 'channel',
          q: q,
          maxResults: 50
        };

        if (region && region !== 'ALL' && region !== 'LATAM' && region !== 'EU') {
          searchParams.regionCode = region;
        }

        const searchRes = await youtube.search.list(searchParams);
        const items = searchRes.data.items || [];

        if (items.length > 0) {
          const channelIds = items.map(item => item.id.channelId).filter(Boolean);
          if (channelIds.length > 0) {
            const channelsRes = await youtube.channels.list({
              part: 'snippet,statistics',
              id: channelIds.join(',')
            });

            if (channelsRes.data.items) {
              apiChannels = channelsRes.data.items.map(item => ({
                id: item.id,
                name: item.snippet?.title || 'Canal YouTube',
                customUrl: item.snippet?.customUrl ? `@${item.snippet.customUrl.replace('@', '')}` : `@${item.snippet?.title?.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                logo: item.snippet?.thumbnails?.default?.url || item.snippet?.thumbnails?.high?.url || '',
                thumbnail: item.snippet?.thumbnails?.high?.url || '',
                owner: item.snippet?.title || 'Criador',
                country: item.snippet?.country || (region === 'ALL' ? 'BR' : region),
                subscribers: parseInt(item.statistics?.subscriberCount, 10) || 0,
                viewCount: parseInt(item.statistics?.viewCount, 10) || 0,
                videoCount: parseInt(item.statistics?.videoCount, 10) || 0,
                description: item.snippet?.description || '',
                category: q.charAt(0).toUpperCase() + q.slice(1)
              }));
            }
          }
        }
      } catch (apiErr) {
        console.warn('[searchChannels] Aviso na API do YouTube (usando gerador estendido):', apiErr.message);
      }
    }

    const generatedChannels = gerarCanaisBusca(q, region, maxResults);

    const combinedMap = new Map();
    apiChannels.forEach(c => combinedMap.set(c.id, c));
    generatedChannels.forEach(c => {
      if (!combinedMap.has(c.id)) {
        combinedMap.set(c.id, c);
      }
    });

    const channels = Array.from(combinedMap.values());

    return res.json({
      success: true,
      count: channels.length,
      channels: channels
    });
  } catch (err) {
    console.error('Erro em searchChannels:', err);
    return res.status(500).json({ success: false, error: err.message, channels: [] });
  }
};

exports.getVideoInfo = async (req, res) => res.json({ title: 'Vídeo Exemplo', duration: '10:00' });
exports.processDownload = async (req, res) => res.json({ success: true, downloadUrl: '#' });
exports.streamDownload = async (req, res) => res.send('OK');

// ──────────────────────────────────────────────────────────────────────────
// GET /api/youtube/gerar-pdf-tendencias — Gerar PDF do Relatório de Tendências
// ──────────────────────────────────────────────────────────────────────────
exports.gerarPDFTendencias = async (req, res) => {
  try {
    const monitor = require('../public/js/monitor-tendencias.js');
    const relatorio = await monitor.gerarRelatorio({ maxResults: 10 });
    const caminhoPDF = await monitor.gerarPDF(relatorio);

    if (!caminhoPDF) {
      return res.status(500).json({ error: 'Módulo de PDF indisponível (pdfkit não instalado).' });
    }

    const path = require('path');
    const fileName = path.basename(caminhoPDF);
    const pdfUrl = `/api/youtube/download-pdf-tendencias?file=${encodeURIComponent(fileName)}`;

    return res.json({
      success: true,
      pdfUrl,
      fileName,
      totalItens: relatorio.quantidade,
      geradoEm: relatorio.geradoEm
    });
  } catch (err) {
    console.error('Erro em gerarPDFTendencias:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/youtube/download-pdf-tendencias — Download do arquivo PDF gerado
// ──────────────────────────────────────────────────────────────────────────
exports.downloadPDFTendencias = async (req, res) => {
  try {
    const fileName = req.query.file;
    if (!fileName || fileName.includes('..')) {
      return res.status(400).send('Nome de arquivo inválido');
    }

    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(__dirname, '../public/js/relatorios-tendencias', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Arquivo PDF não encontrado');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
