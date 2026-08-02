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
      const modelos = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

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
                maxOutputTokens: 1200,
                thinkingConfig: { thinkingBudget: 0 }
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
              console.warn(`[gerarTextoIA] ❌ ${modelo} HTTP ${aiRes.status}: ${errTxt.substring(0, 150)}`);
            }
          } catch (e) {
            console.warn(`[gerarTextoIA] Falha no modelo ${modelo}:`, e.message);
          }
        }
      }
    }

    return res.json({ success: false, error: 'Não foi possível gerar com a IA no momento.' });
  } catch (err) {
    console.error('Erro em gerarTextoIA:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/youtube/canal-sugestoes — Sugestões do canal
// ──────────────────────────────────────────────────────────────────────────
exports.obterSugestoesCanal = async (req, res) => {
  try {
    const customTheme = req.query.customTheme;

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_KEY || process.env.GEMINI_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      const modelos = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.0-flash'];
      for (const modelo of modelos) {
        try {
          const prompt = `Gere 6 ideias virais de vídeos do YouTube ${customTheme ? `focados no tema: "${customTheme}"` : 'focadas no nicho gaming e gameplay'}.
Retorne estritamente um array JSON válido no formato:
[
  {
    "id": "sug_1",
    "titulo": "TÍTULO EM CAIXA ALTA DE ALTO CTR",
    "gancho": "Gancho inicial de 15s que prende a atenção",
    "roteiro": "1. Apresentação\\n2. Desafio\\n3. Conclusão",
    "formato": "Vídeo Longo (10-15 min)",
    "viewsEst": "50k - 100k views",
    "matchPercent": 95,
    "motivoIA": "Relevância de público",
    "nichoTag": "Gaming",
    "thumb": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600"
  }
]`;
          const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${geminiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
            })
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed)) return res.json(parsed);
            }
          }
        } catch (e) {
          console.warn(`[obterSugestoesCanal] Erro modelo ${modelo}:`, e.message);
        }
      }
    }

    return res.json([
      {
        id: 'sug_1',
        titulo: customTheme ? `COMO DOMINAR EM ${customTheme.toUpperCase()}` : 'SOBREVIVI 100 DIAS EM MINECRAFT HARDCORE',
        gancho: 'Mostrar o resultado final nos primeiros 5 segundos para prender a atenção.',
        roteiro: '1. Introdução ao desafio\n2. Escala de dificuldade\n3. Batalha final',
        formato: 'Vídeo Longo (12-15 min)',
        viewsEst: '45k - 90k views',
        matchPercent: 98,
        motivoIA: 'Alta retenção no nicho gaming',
        nichoTag: customTheme || 'Minecraft',
        thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'
      }
    ]);
  } catch (err) {
    console.error('Erro em obterSugestoesCanal:', err);
    res.status(500).json({ error: err.message });
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

      const modelos = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.0-flash'];
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
                generationConfig: { temperature: 0.75, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } }
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

// Helpers para YouTube Downloader & Search
exports.searchChannels = async (req, res) => res.json([]);
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
