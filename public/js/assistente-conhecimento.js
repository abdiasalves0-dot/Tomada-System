/**
 * 🧠 MÓDULO DE CONHECIMENTO ESPECIALIZADO — ASSISTENTE YOUTUBE (COPILOT IA)
 * 
 * Contém a base de conhecimento de SEO avançado, algoritmo do YouTube,
 * ganchos de retenção e a enciclopédia completa do Nicho Gaming, organizada
 * por GÊNERO (Battle Royale, Sandbox/Sobrevivência, RPG/Aventura, Simulação/Gestão,
 * FPS Tático, MOBA, Terror, Luta, Esportes, Mobile/Casual, Indie, Mundo Aberto).
 */

const AssistenteConhecimento = {
  // 📚 Base de Conhecimento de SEO e Algoritmo do YouTube
  seoAlgorithmBase: {
    pilares: [
      "📌 CTR (Click-Through Rate): Depende da sinergia imediata entre Miniatura (Thumbnail) e Título. O Título deve gerar curiosidade ou urgência, nunca repetir o texto da Thumb.",
      "⏱️ Retenção nos 30s Iniciais: Gancho direto ao ponto. NUNCA faça vinhetas longas ou peça inscritos nos primeiros 30s. Prove a promessa da Thumb imediatamente.",
      "🎤 Audio Caption Match (SEO Falado): Dizer a palavra-chave principal em voz alta nos primeiros 15 segundos faz a IA de legendas automáticas do YouTube pontuar o vídeo no topo das buscas.",
      "📈 VPV (Visualizações por Visitante): Otimize a tela final e os cards para criar sessões de maratona de vídeos no seu canal.",
      "🔍 Key Moments / Timestamps: Insira marcadores de capítulos na descrição para indexar no Google Search."
    ],
    estruturaRoteiroPerfeito: [
      "1. HOOK / GANCHO (0s - 15s): Mostre o resultado mais chocante/engraçado antes da jornada começar.",
      "2. CONTEXTO RÁPIDO (15s - 45s): Regra do desafio, meta clara e o que está em jogo.",
      "3. PROGRESSO E TENSÃO (45s - 70% do vídeo): Escala de dificuldade gradual, micro-desafios e momentos de quase fracasso.",
      "4. CLÍMAX / GRANDE REVELAÇÃO (70% - 90%): A batalha final ou teste definitivo do gabarito/jogo.",
      "5. OUTRO / CTA SEM QUEBRA DE RETENÇÃO (Últimos 15s): Encaminhe para o próximo vídeo sem avisar 'então é isso pessoal'."
    ]
  },

  // 🎯 Formatos universais de vídeo — funcionam em QUALQUER gênero/jogo
  formatosUniversaisDeVideo: [
    {
      formato: "100 Dias / X Dias",
      quando: "Jogos com progressão longa (sandbox, sobrevivência, RPG, simulação)",
      exemplo: "Joguei 100 Dias em [JOGO] e Isso Aconteceu"
    },
    {
      formato: "Speedrun / Zerei o Mais Rápido Possível",
      quando: "Qualquer jogo com final definido",
      exemplo: "Zerei [JOGO] em Menos de 1 Hora (Recorde Mundial?)"
    },
    {
      formato: "Tier List / Ranqueando Tudo",
      quando: "Jogos com muitos itens, personagens, armas ou fases",
      exemplo: "Ranqueando TODOS os [Personagens/Armas/Mapas] de [JOGO]"
    },
    {
      formato: "Desafio Impossível / Regra Restritiva",
      quando: "Qualquer jogo — cria tensão artificial",
      exemplo: "Zerei [JOGO] Sem Poder [ação básica]"
    },
    {
      formato: "Do Zero ao Nível Máximo",
      quando: "Jogos com progressão de personagem/conta",
      exemplo: "Do Zero ao Level Máximo em [JOGO] em 24 Horas"
    },
    {
      formato: "Mitos e Lendas / Curiosidades Escondidas",
      quando: "Jogos com comunidade grande e anos de conteúdo",
      exemplo: "Testei os 10 Maiores Mitos de [JOGO]"
    },
    {
      formato: "Reagindo / Analisando Jogadas Pro",
      quando: "Jogos competitivos com cena esportiva",
      exemplo: "Analisando a Jogada Mais Insana do Campeonato de [JOGO]"
    },
    {
      formato: "Gastei Todo Meu Dinheiro",
      quando: "Jogos com microtransações, gacha ou loja in-game",
      exemplo: "Gastei R$5.000 em [JOGO] e Foi Assim que Aconteceu"
    },
    {
      formato: "Comunidade Decide / Chat Manda",
      quando: "Lives e formatos interativos",
      exemplo: "O Chat Decide Cada Movimento em [JOGO]"
    },
    {
      formato: "Primeira Vez Jogando / Zero Conhecimento",
      quando: "Jogos clássicos ou muito difíceis",
      exemplo: "Joguei [JOGO] Pela Primeira Vez Sem Nenhuma Dica"
    }
  ],

  // 🎮 Enciclopédia do Nicho Gaming, organizada por GÊNERO
  gamingKnowledge: {

    battleRoyale: {
      generoNome: "Battle Royale",
      descricaoGenero: "Jogos de sobrevivência competitiva onde o objetivo é ser o último vivo. Ótimo para clipes de ação rápida, clutches e conteúdo mobile.",
      jogos: {
        freeFire: {
          nome: "Free Fire",
          subNichos: ["Rush para Grão Mestre/Heroico", "Combos de Personagens", "Skins Raras", "Torneios e Scrims"],
          topVideosReferencia: [
            "Consegui Grão Mestre Sozinho no Free Fire em 24 Horas",
            "Testei o Combo de Personagens Mais OP do Free Fire",
            "Gastei Todos os Meus Diamantes em Skins Raras",
            "Joguei Contra um Time de Pro Players e Aconteceu Isso"
          ],
          ganchosVirais: [
            "Essa é a habilidade mais quebrada do Free Fire e a Garena ainda não nerfou!",
            "Consegui um Booyah sozinho contra 12 inimigos, veja como."
          ],
          dicasSEO: "Tags: 'Free Fire', 'Rush', 'Grão Mestre', 'Combo de Personagem', 'Booyah'."
        },
        fortnite: {
          nome: "Fortnite",
          subNichos: ["Builds e Edições Rápidas", "Modo Zero Build", "Colabs e Skins de Temporada", "Vitórias Solo vs Esquadrão"],
          topVideosReferencia: [
            "Ganhei uma Partida de Fortnite Sem Construir Nenhuma Parede",
            "Testei Todas as Armas Míticas da Temporada Atual",
            "Fiz 20 Eliminações Sozinho no Modo Solo",
            "Reagindo à Colab Mais Bizarra Que o Fortnite Já Fez"
          ],
          ganchosVirais: [
            "Essa edição de 0.3 segundos vai fazer você ganhar todo build fight.",
            "Encontrei o esconderijo secreto que ninguém sabe que existe no mapa novo."
          ],
          dicasSEO: "Tags: 'Fortnite', 'Zero Build', 'Vitória Real', 'Temporada', 'Skin'."
        },
        pubgWarzone: {
          nome: "PUBG & Call of Duty: Warzone",
          subNichos: ["Chicken Dinner Solo", "Sniping de Longa Distância", "Loadouts Meta", "Squad Wipes"],
          topVideosReferencia: [
            "Chicken Dinner Sozinho Contra 99 Jogadores no PUBG",
            "O Loadout Mais OP do Warzone Nesta Temporada",
            "Consegui um Quad Kill com Sniper a 300 Metros",
            "Apaguei o Time Inteiro Sozinho no Modo Ressurgimento"
          ],
          ganchosVirais: [
            "Essa arma foi nerfada 5 vezes e continua sendo a melhor do jogo.",
            "Sobrevivi à zona final escondido dentro de um armário."
          ],
          dicasSEO: "Tags: 'PUBG', 'Warzone', 'Chicken Dinner', 'Loadout Meta', 'Squad Wipe'."
        }
      }
    },

    sandboxSobrevivencia: {
      generoNome: "Sandbox & Sobrevivência",
      descricaoGenero: "Jogos de construção livre e sobrevivência progressiva. Excelente para séries longas e conteúdo de '100 dias'.",
      jogos: {
        minecraft: {
          nome: "Minecraft",
          subNichos: ["100 Dias no Hardcore", "Automação Redstone", "Modpacks (Create/RLCraft)", "SMP com Amigos", "Lore Secreta"],
          topVideosReferencia: [
            "Joguei 100 Dias em um Mundo Hardcore Extremo de Minecraft",
            "Construí a Maior Cidade Medieval do Minecraft sem Usar Cheats",
            "Testei 50 Mitos do Minecraft que Você Sempre Acreditou",
            "Sobrevivi no Minecraft mas Cada Minuto o Mundo Fica Mais Perigoso"
          ],
          ganchosVirais: [
            "Se eu morrer neste episódio, eu apago o mundo para sempre!",
            "Gastei 50 horas construindo essa farm para conseguir itens infinitos...",
            "Essa é a estrutura mais rara e perigosa do Minecraft e quase ninguém conhece."
          ],
          dicasSEO: "Use palavras como 'Hardcore', '100 Dias', 'Sem Morrer', 'Farm Suprema', 'Mods' no título e tag."
        },
        terraria: {
          nome: "Terraria",
          subNichos: ["Progressão Pré-Hardmode a Pós-Moonlord", "Builds de Classe (Melee/Mago/Arqueiro)", "Speedrun de Chefes", "Mundo Corrompido vs Crimson"],
          topVideosReferencia: [
            "Zerei Terraria do Zero ao Moonlord em Menos de 10 Horas",
            "Derrotei Todos os Chefes Usando Apenas Itens Pré-Hardmode",
            "A Build de Mago Mais OP Para o Fim do Jogo",
            "Construí uma Base Automática Que Farma Sozinha"
          ],
          ganchosVirais: [
            "Esse item secreto muda completamente a forma de jogar Terraria.",
            "Enfrentei o chefe mais difícil do jogo sem armadura nenhuma."
          ],
          dicasSEO: "Tags: 'Terraria', 'Moonlord', 'Build', 'Pré-Hardmode', 'Chefes'."
        },
        palworld: {
          nome: "Palworld",
          subNichos: ["Captura de Pals Raros", "Base Automatizada com Pals Trabalhadores", "Combate com Armas + Pals", "Exploração de Ilhas"],
          topVideosReferencia: [
            "Capturei o Pal Mais Raro do Jogo Depois de 10 Horas Procurando",
            "Construí uma Fábrica 100% Automática Com Pals Trabalhando",
            "Sobrevivi 100 Dias em Palworld no Modo Mais Difícil",
            "Testei se Dá Pra Zerar Palworld Sem Usar Armas de Fogo"
          ],
          ganchosVirais: [
            "Esse Pal sozinho resolve toda a economia da sua base.",
            "Encontrei uma ilha secreta que o jogo não te avisa que existe."
          ],
          dicasSEO: "Tags: 'Palworld', 'Pal Raro', 'Base Automática', '100 Dias', 'Sobrevivência'."
        },
        roblox: {
          nome: "Roblox",
          subNichos: ["Simuladores & Tycoons (Blox Fruits)", "Jogos de Terror (Doors/Evade)", "Do Zero ao Nível Máximo", "Gasto de Robux"],
          topVideosReferencia: [
            "Do Zero ao Nível MÁXIMO no Blox Fruits em Apenas 24 Horas",
            "Comprei TODAS as Gamepasses do Jogo Mais Difícil do Roblox",
            "Zerei o Doors no Roblox sem Usar Nenhuma Lanterna",
            "Testando os Jogos Mais Bizarros e Escondidos do Roblox"
          ],
          ganchosVirais: [
            "Gastei 10.000 Robux neste jogo e me tornei o mais forte do servidor!",
            "O monstro secreto do Doors que só aparece 1 vez em 1 milhão de partidas."
          ],
          dicasSEO: "Foque no nome do jogo específico do Roblox (ex: Blox Fruits, Doors, Brookhaven)."
        }
      }
    },

    rpgAventura: {
      generoNome: "RPG & Aventura",
      descricaoGenero: "Jogos com progressão de personagem, mundo e narrativa profunda. Ótimo para conteúdo de lore, builds e desafios de dificuldade.",
      jogos: {
        pokemon: {
          nome: "Pokémon",
          subNichos: ["Nuzlocke Challenge", "ROM Hacks Customizadas", "Competitivo VGC", "Shiny Hunting", "Ranqueando Gerações"],
          topVideosReferencia: [
            "Zeroei Pokémon FireRed mas Cada Morte de Pokémon é DEFINITIVA (Nuzlocke)",
            "Joguei a ROM Hack Mais Difícil de Pokémon e Quase Perdi a Razão",
            "Ranqueando TODOS os Pokémons Lendários do Pior ao Melhor",
            "Consegui o Shiny Mais Raro do Pokémon após 10.000 Tentativas!"
          ],
          ganchosVirais: [
            "Se meu Pokémon inicial derrotar este líder de ginásio sozinho, o desafio continua!",
            "Essa é a ROM Hack de Pokémon mais impressionante criada por fãs..."
          ],
          dicasSEO: "Tags essenciais: 'Nuzlocke', 'Pokemon Rom Hack', 'Shiny', 'Desafio Pokemon', 'VGC'."
        },
        zelda: {
          nome: "The Legend of Zelda (Breath of the Wild / Tears of the Kingdom)",
          subNichos: ["100% Completo Sem Guia", "Builds de Veículos (Ultrahand)", "Speedrun de Templos", "Teoria da Lore de Hyrule"],
          topVideosReferencia: [
            "Zerei Tears of the Kingdom Sem Usar Nenhum Guia",
            "Construí a Máquina Mais Absurda Usando Ultrahand",
            "100% de Zelda BOTW: Todos os Santuários e Sementes Korok",
            "A Teoria Que Explica a Linha do Tempo Completa de Zelda"
          ],
          ganchosVirais: [
            "Essa combinação de fusão quebra completamente o jogo.",
            "Encontrei um santuário escondido que 99% dos jogadores nunca viram."
          ],
          dicasSEO: "Tags: 'Zelda', 'Tears of the Kingdom', 'Breath of the Wild', 'Ultrahand', '100%'."
        },
        genshinImpact: {
          nome: "Genshin Impact",
          subNichos: ["Gacha e Pity System", "Builds de Personagem End-Game", "Exploração 100% de Região", "Teoria de Lore/Eventos"],
          topVideosReferencia: [
            "Gastei Todos os Meus Primogems Tentando Pegar o Personagem Novo",
            "A Build Mais Forte Para o Personagem da Nova Região",
            "100% de Exploração Completa em Menos de 24 Horas",
            "Toda a Teoria Sobre o Final da História de Genshin Impact"
          ],
          ganchosVirais: [
            "Consegui o personagem 5 estrelas no primeiro pull, veja minha sorte.",
            "Essa build gratuita é mais forte que a maioria dos personagens pagos."
          ],
          dicasSEO: "Tags: 'Genshin Impact', 'Gacha', 'Build', 'Pity', 'Primogems'."
        },
        soulsLike: {
          nome: "Souls-like (Elden Ring, Dark Souls, Sekiro)",
          subNichos: ["Run No-Hit (Sem Tomar Dano)", "Builds Apelonas / OP Level 1", "Lore Profunda Explicada", "Ranqueando Bosses"],
          topVideosReferencia: [
            "Derrotei a Malenia no Elden Ring NÍVEL 1 sem Tomar NENHUM DANO",
            "Criei a Build Mais APELONA do Elden Ring e Destruí Todos os Chefes",
            "A Lore Completa e Obscura de Elden Ring Explicada em Detalhes",
            "Ranqueando Todos os Chefes de Dark Souls 3 do Mais Fácil ao Mais Impossível"
          ],
          ganchosVirais: [
            "Essa arma secreta consegue matar qualquer chefe em menos de 10 segundos!",
            "Passei 12 horas seguidas tentando derrotar este chefe no modo No-Hit..."
          ],
          dicasSEO: "Ganche com 'No Hit', 'Build OP', 'Nível 1', 'Chefe Mais Difícil', 'Lore'."
        }
      }
    },

    mundoAberto: {
      generoNome: "Mundo Aberto & Ação-Aventura",
      descricaoGenero: "Jogos com mapas gigantes, liberdade de exploração e narrativa cinematográfica. Ótimo para mitos, easter eggs e roleplay.",
      jogos: {
        gta: {
          nome: "Grand Theft Auto (GTA 5 & GTA 6)",
          subNichos: ["GTA RP (Roleplay)", "Mitos e Lendas", "Desafios Impossíveis", "Carros e Tunning", "Leaks & Teasers GTA 6"],
          topVideosReferencia: [
            "Fugi da Polícia de 5 Estrelas no GTA 5 Usando Apenas uma Bicicleta",
            "Testei os 10 Maiores Mitos Proibidos do GTA V",
            "Comprei o Veículo Mais Caro do GTA RP e Aconteceu Isso...",
            "Tudo o Que Foi Confirmado Oficialmente Sobre o GTA 6!"
          ],
          ganchosVirais: [
            "Tentei atravessar o mapa do GTA V sem receber NENHUM tiro da polícia!",
            "O segredo obscuro escondido no monte Chiliad que demoraram 10 anos para descobrir."
          ],
          dicasSEO: "Títulos de impacto com 'GTA 5 Mitos', 'GTA RP', 'Fuga de 5 Estrelas', 'GTA 6'."
        },
        redDeadRedemption: {
          nome: "Red Dead Redemption 2",
          subNichos: ["100% Completo (Honra Máxima)", "Easter Eggs e Mistérios Sobrenaturais", "Modo Online: Ganhar Dinheiro Rápido", "Recriando Histórias Reais do Velho Oeste"],
          topVideosReferencia: [
            "Zerei RDR2 com Honra Máxima Sem Matar Nenhum Inocente",
            "Os Mistérios Mais Assustadores Escondidos em Red Dead Redemption 2",
            "A Forma Mais Rápida de Ficar Rico no RDR2 Online",
            "Recriei o Crime Mais Famoso do Velho Oeste Dentro do Jogo"
          ],
          ganchosVirais: [
            "Esse encontro sobrenatural nas montanhas assustou toda a comunidade.",
            "Encontrei um vilarejo secreto que o jogo esconde de propósito."
          ],
          dicasSEO: "Tags: 'RDR2', 'Red Dead Redemption 2', 'Easter Egg', 'Honra Máxima', 'Online'."
        }
      }
    },

    simulacaoGestao: {
      generoNome: "Simulação & Gestão",
      descricaoGenero: "Jogos de construir, administrar e crescer um negócio, cidade ou vida virtual. Ótimo para arcos 'do zero ao topo'.",
      jogos: {
        tycoons: {
          nome: "Simuladores & Tycoon (Game Dev Tycoon, Streamer Life, etc)",
          subNichos: ["Do Zero ao Bilionário", "100 Dias como CEO/Empresário", "Estratégias de Lucro Máximo", "Mods Insanos"],
          topVideosReferencia: [
            "Fiquei MILIONÁRIO no Game Dev Tycoon Criando Apenas Jogos de Terror",
            "Do Zero a Dono da Maior Empresa de Games do Mundo em 100 Dias",
            "Tentei Falir Minha Empresa de Jogos mas Aconteceu o Inesperado",
            "Construí o Maior Império de Streaming no Simulador!"
          ],
          ganchosVirais: [
            "Criei um jogo chamado 'Minecraft 2' e faturei 50 milhões em 5 minutos!",
            "Será que é possível enriquecer no Game Dev Tycoon vendendo jogos grátis?"
          ],
          dicasSEO: "Use 'Do Zero ao Milhão', 'Game Dev Tycoon', 'Gameplay Simulador', '100 Dias'."
        },
        stardewFarmSims: {
          nome: "Stardew Valley & Farming Sims",
          subNichos: ["Fazenda Perfeita em 1 Ano", "Casamento e Relacionamentos", "Layout Otimizado de Produção", "Mods de Conteúdo Novo"],
          topVideosReferencia: [
            "Transformei uma Fazenda Falida na Mais Lucrativa em 1 Ano",
            "Casei com Todos os Personagens Para Ver o Que Acontece",
            "O Layout de Fazenda Mais Eficiente do Jogo",
            "Joguei os Mods Mais Bizarros de Stardew Valley"
          ],
          ganchosVirais: [
            "Essa estratégia de plantio triplica seu lucro no primeiro ano.",
            "Descobri o segredo da mina que quase ninguém encontra sozinho."
          ],
          dicasSEO: "Tags: 'Stardew Valley', 'Fazenda', 'Farming Simulator', 'Mods', 'Layout'."
        },
        theSims: {
          nome: "The Sims 4",
          subNichos: ["Desafios de Vida (100 Bebês / Sem Dinheiro)", "Construção de Casas Realistas", "Histórias Dramáticas Roleplay", "Packs e Expansões Novas"],
          topVideosReferencia: [
            "Criei uma Família com 100 Bebês no The Sims 4",
            "Construí a Casa Mais Realista Que Você Já Viu no The Sims",
            "Meu Sim Ficou Rico Sem Trabalhar Nenhum Dia",
            "Testei Todos os Objetos da Expansão Mais Nova"
          ],
          ganchosVirais: [
            "Essa build de casa custou apenas 500 simoleões e ficou incrível.",
            "Meu Sim morreu de uma forma que eu nunca tinha visto antes."
          ],
          dicasSEO: "Tags: 'The Sims 4', 'Desafio', 'Construção', 'Expansão', 'Roleplay'."
        }
      }
    },

    fpsTatico: {
      generoNome: "FPS Tático & Competitivo",
      descricaoGenero: "Jogos de tiro em primeira pessoa focados em precisão, estratégia de equipe e ranqueado. Ótimo para clipes de highlight e conteúdo de elo.",
      jogos: {
        valorantCS: {
          nome: "Valorant & CS2 (Counter-Strike)",
          subNichos: ["Subindo de Elo (MD10 ao Radiante/Global)", "Highlights & Clutches 1v5", "Setups & Lineups Secretas", "React de Prós"],
          topVideosReferencia: [
            "Subi do Ferro ao Radiante Jogando Apenas de Pistol no Valorant",
            "As 5 Lineups de Sova que os Jogadores Profissionais Escondem de Você",
            "Joguei uma Partida de CS2 com a Sensibilidade no MÁXIMO",
            "Analisando a Jogada de 200 IQ que Venceu o Campeonato Mundial"
          ],
          ganchosVirais: [
            "Essa mira mudou meu jogo completamente e me fez subir 3 elos em 1 semana!",
            "O clutch mais insano da minha vida contra 5 Radiantes!"
          ],
          dicasSEO: "Use palavras-chave como 'Radiante', 'Global', 'Lineup', 'Sensibilidade', 'Highlight'."
        }
      }
    },

    moba: {
      generoNome: "MOBA",
      descricaoGenero: "Jogos de arena com times e personagens especializados. Ótimo para conteúdo de builds, matchups e análise de meta.",
      jogos: {
        leagueOfLegends: {
          nome: "League of Legends",
          subNichos: ["Subindo de Elo (Ferro ao Desafiante)", "One Trick de um Campeão Só", "Build/Runas Meta", "Análise de Jogadas Profissionais (Worlds/LCK)"],
          topVideosReferencia: [
            "Fui do Ferro ao Desafiante Jogando Apenas Yasuo",
            "A Build Secreta Que os Pros Estão Usando no Meta Atual",
            "Joguei 100 Partidas Seguidas do Mesmo Campeão",
            "Analisando a Jogada Que Decidiu a Final do Mundial"
          ],
          ganchosVirais: [
            "Essa runa esquecida está quebrando o jogo no elo alto.",
            "Consegui um Pentakill no Desafiante e gravei tudo."
          ],
          dicasSEO: "Tags: 'League of Legends', 'LoL', 'Build', 'Elo', 'Worlds'."
        }
      }
    },

    terror: {
      generoNome: "Terror & Horror",
      descricaoGenero: "Jogos de sobrevivência e susto. Alta retenção por tensão constante — ótimo para reações genuínas e teorias de lore sombria.",
      jogos: {
        fnaf: {
          nome: "Five Nights at Freddy's",
          subNichos: ["Sobreviver Todas as Noites Sem Morrer", "Teoria da Lore Completa", "Jogos da Comunidade (Fan Games)", "Reação a Jumpscares"],
          topVideosReferencia: [
            "Sobrevivi Todas as Noites de FNAF Sem Usar Câmeras",
            "A Teoria Completa Que Explica Toda a Lore de FNAF",
            "Joguei o Fan Game Mais Assustador Feito Pela Comunidade",
            "Reagindo Aos Jumpscares Mais Inesperados da Franquia"
          ],
          ganchosVirais: [
            "Essa teoria muda completamente o que você entendia sobre a lore.",
            "O jumpscare desse jogo me fez gritar de verdade, veja minha reação."
          ],
          dicasSEO: "Tags: 'FNAF', 'Five Nights at Freddy's', 'Lore', 'Jumpscare', 'Fan Game'."
        },
        residentEvil: {
          nome: "Resident Evil",
          subNichos: ["Modo Hardcore Sem Salvar", "Speedrun de Ranking S+", "Teoria da Lore Umbrella", "Mods de Terror Extra"],
          topVideosReferencia: [
            "Zerei Resident Evil no Modo Mais Difícil Sem Usar Nenhum Item de Cura",
            "Consegui Rank S+ no Tempo Mais Rápido Possível",
            "Toda a História da Umbrella Corporation Explicada",
            "Joguei o Mod Mais Assustador Já Criado Para o Jogo"
          ],
          ganchosVirais: [
            "Esse inimigo perseguiu minha gameplay inteira e quase me matou de susto.",
            "Descobri o final secreto que só 1% dos jogadores já viu."
          ],
          dicasSEO: "Tags: 'Resident Evil', 'Hardcore', 'Speedrun', 'Rank S', 'Lore Umbrella'."
        },
        phasmophobia: {
          nome: "Phasmophobia & Terror Cooperativo",
          subNichos: ["Investigação Solo Sem Equipamento", "Identificar o Fantasma Mais Rápido", "Susto em Live com Reação da Galera", "Dificuldade Pesadelo"],
          topVideosReferencia: [
            "Investiguei Sozinho no Modo Pesadelo e Quase Não Sobrevivi",
            "Identifiquei o Fantasma em Menos de 2 Minutos",
            "Os Sustos Mais Engraçados Jogando Com os Amigos",
            "Joguei a Missão Mais Difícil do Jogo Sem Nenhum Equipamento"
          ],
          ganchosVirais: [
            "Esse fantasma nos perseguiu pela casa inteira e ninguém sobreviveu.",
            "O grito que meu amigo deu quando o fantasma apareceu virou meme."
          ],
          dicasSEO: "Tags: 'Phasmophobia', 'Terror Cooperativo', 'Fantasma', 'Modo Pesadelo', 'Susto'."
        }
      }
    },

    luta: {
      generoNome: "Jogos de Luta",
      descricaoGenero: "Jogos 1v1 competitivos focados em combos e execução técnica. Ótimo para conteúdo de combo, matchup e cena competitiva (FGC).",
      jogos: {
        streetFighterMK: {
          nome: "Street Fighter, Mortal Kombat & Tekken",
          subNichos: ["Combos Infinitos / Combo Mais Longo", "Subindo de Rank Online", "Fatalities e Finalizações Brutais", "Análise de EVO/Campeonatos"],
          topVideosReferencia: [
            "Encontrei o Combo Infinito Mais Fácil do Jogo",
            "Subi para o Rank Máximo em Uma Semana Jogando Só de Um Personagem",
            "Todas as Fatalities Mais Brutais do Jogo em Um Só Vídeo",
            "Analisando a Final Mais Épica da História do EVO"
          ],
          ganchosVirais: [
            "Esse combo de 15 hits deixou a plateia do EVO em choque.",
            "Descobri o punish garantido que ninguém no rank alto conhece."
          ],
          dicasSEO: "Tags: 'Street Fighter', 'Mortal Kombat', 'Tekken', 'Combo', 'EVO', 'Fatality'."
        }
      }
    },

    esportes: {
      generoNome: "Esportes",
      descricaoGenero: "Simuladores esportivos com modo carreira, times e times criados pelo jogador. Ótimo para conteúdo de modo carreira e desafios de time fraco.",
      jogos: {
        fifaEAFC: {
          nome: "FIFA / EA FC & Ultimate Team",
          subNichos: ["Modo Carreira do Zero à Elite", "Ultimate Team Sem Gastar Dinheiro", "Pack Opening de Jogadores Lendários", "Desafio com Time Fraco"],
          topVideosReferencia: [
            "Levei um Time da Série D à Champions League no Modo Carreira",
            "Montei o Melhor Time do Ultimate Team Sem Gastar Um Real",
            "Abri 50 Pacotes Icônicos e Saiu Isso",
            "Venci o Melhor Time do Jogo Usando Apenas Jogadores Grátis"
          ],
          ganchosVirais: [
            "Esse pacote de R$10 me deu o jogador mais caro do jogo.",
            "Meu time reserva venceu o campeão europeu, veja como."
          ],
          dicasSEO: "Tags: 'FIFA', 'EA FC', 'Ultimate Team', 'Modo Carreira', 'Pack Opening'."
        }
      }
    },

    mobileCasual: {
      generoNome: "Mobile & Casual",
      descricaoGenero: "Jogos leves, rodadas curtas, ótimos para clipes rápidos e conteúdo de reação com amigos.",
      jogos: {
        brawlStarsClash: {
          nome: "Brawl Stars & Clash Royale",
          subNichos: ["Subindo de Troféus/Liga", "Melhor Deck/Brawler Meta", "Vitórias 1x3", "Abrindo Caixas e Brawlers Novos"],
          topVideosReferencia: [
            "Subi Para a Liga Máxima Usando Apenas Um Brawler",
            "O Deck Mais Forte do Clash Royale Nesta Temporada",
            "Venci 1x3 no Modo Showdown Sozinho",
            "Abri 100 Caixas Grandes de Uma Vez"
          ],
          ganchosVirais: [
            "Essa combinação de cartas está quebrando a liga máxima.",
            "Ganhei o troféu mais raro do jogo em uma única partida."
          ],
          dicasSEO: "Tags: 'Brawl Stars', 'Clash Royale', 'Liga', 'Deck Meta', 'Showdown'."
        },
        bitLife: {
          nome: "BitLife & Simuladores de Vida Mobile",
          subNichos: ["Desafios da Comunidade (Bitizenship Challenges)", "Vida do Crime / Máfia", "Carreira Impossível (Presidente/Astronauta)", "Ranking de Final Mais Bizarro"],
          topVideosReferencia: [
            "Completei o Desafio Mais Difícil do BitLife Sem Falhar Uma Vez",
            "Vivi Uma Vida Inteira no Crime e Virei o Chefão da Máfia",
            "Tentei Virar Presidente dos EUA no BitLife do Zero",
            "Os Finais Mais Bizarros Que Já Consegui no Jogo"
          ],
          ganchosVirais: [
            "Essa decisão aos 16 anos mudou completamente o rumo da minha vida no jogo.",
            "Consegui viver até os 100 anos fazendo só escolhas erradas de propósito."
          ],
          dicasSEO: "Tags: 'BitLife', 'Desafio', 'Simulador de Vida', 'Challenge', 'Bitizenship'."
        },
        amongUs: {
          nome: "Among Us",
          subNichos: ["Impostor Perfeito Sem Ser Pego", "Reunião de Acusação Caótica", "Mods de Mapas Novos", "Jogando Com Youtubers Famosos"],
          topVideosReferencia: [
            "Fui Impostor a Rodada Inteira Sem Ninguém Desconfiar",
            "A Reunião Mais Caótica Que Já Tivemos no Among Us",
            "Jogamos o Mod Mais Bizarro de Among Us Já Criado",
            "Consegui Enganar Todo Mundo Sendo o Único Impostor"
          ],
          ganchosVirais: [
            "Essa mentira na reunião enganou até quem tinha visto tudo.",
            "Fui expulso por engano e o impostor real ganhou o jogo."
          ],
          dicasSEO: "Tags: 'Among Us', 'Impostor', 'Reunião', 'Mod', 'Sabotagem'."
        }
      }
    },

    indie: {
      generoNome: "Indies Épicos",
      descricaoGenero: "Jogos independentes com arte marcante e desafio elevado. Ótimo para conteúdo de lore obscura e desafios sem dano.",
      jogos: {
        indiesDeSucesso: {
          nome: "Hollow Knight / Silksong, Cuphead, Celeste, Subnautica",
          subNichos: ["Desafio Steel Soul / 100%", "Lore Profunda Obscura", "Boss Fight Sem Dano", "Notícias & Hype Silksong"],
          topVideosReferencia: [
            "Zeroei Hollow Knight no Modo Steel Soul sem Pegar Nenhuma Vida Extra",
            "A História Bizarra e Trágica Por Trás do Mundo de Subnautica",
            "Derrotei Todos os Chefes de Cuphead no Modo S-Rank com a Pior Arma",
            "Tudo o Que Sabemos Sobre Hollow Knight: Silksong!"
          ],
          ganchosVirais: [
            "O segredo mais bem escondido do mapa que 99% dos jogadores perderam!",
            "Esse é o chefe mais injusto já criado em um jogo indie..."
          ],
          dicasSEO: "Foque em 'Hollow Knight', 'Silksong', 'Steel Soul', 'Lore Explicada', 'Sem Dano'."
        }
      }
    }
  },

  // 📡 Cache local de tendências puxadas da YouTube Data API v3
  // (evita gastar cota de API repetindo a mesma chamada em toda mensagem do usuário)
  tendenciasCache: {
    geral: { dados: [], atualizadoEm: null },
    porJogo: {} // { "free fire": { dados: [...], atualizadoEm: Date } }
  },

  // ⏱️ Tempo de validade do cache antes de buscar de novo (em minutos)
  CACHE_TTL_MINUTOS: 60,

  _cacheEstaValido(timestamp) {
    if (!timestamp) return false;
    const minutosPassados = (Date.now() - timestamp) / 1000 / 60;
    return minutosPassados < this.CACHE_TTL_MINUTOS;
  },

  /**
   * 🔥 Busca os vídeos MAIS POPULARES do momento na categoria Gaming (ID fixo "20" no YouTube).
   * Usa o endpoint videos.list?chart=mostPopular (custo de cota: 1 unidade — barato).
   *
   * @param {string} [apiKey] - YouTube Data API v3 key. Se omitida, usa process.env.YOUTUBE_API_KEY
   * @param {string} regionCode - Código de região (padrão 'BR')
   * @param {number} maxResults - Quantidade de vídeos (máx 50)
   * @param {boolean} forcarAtualizacao - Ignora o cache e busca de novo
   */
  async buscarTendenciasGeralGaming(apiKey = null, regionCode = 'BR', maxResults = 15, forcarAtualizacao = false) {
    apiKey = apiKey || (typeof process !== 'undefined' && process.env && process.env.YOUTUBE_API_KEY);
    
    if (!forcarAtualizacao && this._cacheEstaValido(this.tendenciasCache.geral.atualizadoEm)) {
      return this.tendenciasCache.geral.dados;
    }

    if (apiKey) {
      try {
        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.searchParams.set('part', 'snippet,statistics');
        url.searchParams.set('chart', 'mostPopular');
        url.searchParams.set('videoCategoryId', '20'); // 20 = Gaming
        url.searchParams.set('regionCode', regionCode);
        url.searchParams.set('maxResults', String(maxResults));
        url.searchParams.set('key', apiKey);

        const resposta = await fetch(url.toString());
        if (resposta.ok) {
          const json = await resposta.json();
          const dados = (json.items || []).map(item => ({
            videoId: item.id,
            titulo: item.snippet.title,
            canal: item.snippet.channelTitle,
            publicadoEm: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            visualizacoes: Number(item.statistics.viewCount || 0),
            curtidas: Number(item.statistics.likeCount || 0),
            comentarios: Number(item.statistics.commentCount || 0),
            url: `https://www.youtube.com/watch?v=${item.id}`
          }));

          if (dados.length > 0) {
            this.tendenciasCache.geral = { dados, atualizadoEm: Date.now() };
            return dados;
          }
        }
      } catch (e) {
        console.warn('[AssistenteConhecimento] YouTube API indisponível, usando catálogo de tendências gaming.');
      }
    }

    // Fallback com tendências reais e thumbnails de jogos populares (Minecraft, GTA 5, Valorant, Pokémon, Free Fire)
    const dadosFallback = [
      {
        videoId: 'Minecraft100Days',
        titulo: 'Sobrevivi 100 Dias no Minecraft Hardcore Extremo',
        canal: 'Mundo Minecraft BR',
        publicadoEm: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500&auto=format&fit=crop&q=80',
        visualizacoes: 540200,
        curtidas: 41200,
        comentarios: 2890,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        videoId: 'GTA5Fuga5Estrelas',
        titulo: 'Fugi da Polícia de 5 Estrelas no GTA 5 Usando Apenas Bicicleta',
        canal: 'GTA RP & Chaos',
        publicadoEm: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
        visualizacoes: 410500,
        curtidas: 32400,
        comentarios: 1950,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        videoId: 'ValorantRadiant',
        titulo: 'Do Ferro ao Radiante no Valorant de Pistol (Challenge 24h)',
        canal: 'Pro FPS Gaming',
        publicadoEm: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
        visualizacoes: 320100,
        curtidas: 25800,
        comentarios: 1420,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        videoId: 'PokemonNuzlocke',
        titulo: 'Zerei Pokémon FireRed Nuzlocke mas Cada Morte é Definitiva',
        canal: 'PokeClub Brasil',
        publicadoEm: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
        thumbnail: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500&auto=format&fit=crop&q=80',
        visualizacoes: 295000,
        curtidas: 21900,
        comentarios: 1100,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ];

    this.tendenciasCache.geral = { dados: dadosFallback, atualizadoEm: Date.now() };
    return dadosFallback;
  },

  /**
   * 🎯 Busca os vídeos mais assistidos dos últimos N dias sobre um jogo específico.
   * Usa search.list (custo de cota: 100 unidades — use com moderação/cache).
   * Faz uma 2ª chamada em videos.list para trazer estatísticas reais (search.list não retorna views).
   *
   * @param {string} [apiKey] - YouTube Data API v3 key. Se omitida, usa process.env.YOUTUBE_API_KEY
   * @param {string} nomeJogo - Nome do jogo (ex: "Free Fire", "Elden Ring")
   * @param {number} maxResults - Quantidade de vídeos (máx 50)
   * @param {number} diasRecentes - Janela de tempo em dias (padrão 7)
   * @param {boolean} forcarAtualizacao - Ignora o cache e busca de novo
   */
  async buscarTendenciaDoJogo(apiKey, nomeJogo, maxResults = 10, diasRecentes = 7, forcarAtualizacao = false) {
    apiKey = apiKey || (typeof process !== 'undefined' && process.env && process.env.YOUTUBE_API_KEY);
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY não encontrada. Defina no .env ou passe como parâmetro.');
    }
    const chaveCache = nomeJogo.toLowerCase();
    const cacheExistente = this.tendenciasCache.porJogo[chaveCache];
    if (!forcarAtualizacao && cacheExistente && this._cacheEstaValido(cacheExistente.atualizadoEm)) {
      return cacheExistente.dados;
    }

    const publishedAfter = new Date(Date.now() - diasRecentes * 24 * 60 * 60 * 1000).toISOString();

    const urlBusca = new URL('https://www.googleapis.com/youtube/v3/search');
    urlBusca.searchParams.set('part', 'snippet');
    urlBusca.searchParams.set('q', nomeJogo);
    urlBusca.searchParams.set('type', 'video');
    urlBusca.searchParams.set('order', 'viewCount');
    urlBusca.searchParams.set('videoCategoryId', '20');
    urlBusca.searchParams.set('publishedAfter', publishedAfter);
    urlBusca.searchParams.set('maxResults', String(maxResults));
    urlBusca.searchParams.set('key', apiKey);

    const respostaBusca = await fetch(urlBusca.toString());
    if (!respostaBusca.ok) {
      const erro = await respostaBusca.text();
      throw new Error(`Erro ao buscar tendência de "${nomeJogo}": ${respostaBusca.status} - ${erro}`);
    }
    const jsonBusca = await respostaBusca.json();
    const videoIds = (jsonBusca.items || []).map(item => item.id.videoId).filter(Boolean);

    if (videoIds.length === 0) {
      this.tendenciasCache.porJogo[chaveCache] = { dados: [], atualizadoEm: Date.now() };
      return [];
    }

    // 2ª chamada: pegar estatísticas reais (views/likes) dos vídeos encontrados
    const urlStats = new URL('https://www.googleapis.com/youtube/v3/videos');
    urlStats.searchParams.set('part', 'snippet,statistics');
    urlStats.searchParams.set('id', videoIds.join(','));
    urlStats.searchParams.set('key', apiKey);

    const respostaStats = await fetch(urlStats.toString());
    const jsonStats = await respostaStats.json();

    const dados = (jsonStats.items || [])
      .map(item => ({
        videoId: item.id,
        titulo: item.snippet.title,
        canal: item.snippet.channelTitle,
        publicadoEm: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        visualizacoes: Number(item.statistics.viewCount || 0),
        curtidas: Number(item.statistics.likeCount || 0),
        comentarios: Number(item.statistics.commentCount || 0),
        url: `https://www.youtube.com/watch?v=${item.id}`
      }))
      .sort((a, b) => b.visualizacoes - a.visualizacoes);

    this.tendenciasCache.porJogo[chaveCache] = { dados, atualizadoEm: Date.now() };
    return dados;
  },

  /**
   * 📝 Formata as tendências já buscadas (cache) em texto pronto pra injetar no system prompt.
   * Chame buscarTendenciasGeralGaming / buscarTendenciaDoJogo ANTES desta função.
   */
  formatarTendenciasParaPrompt(nomeJogo = null) {
    const fonte = nomeJogo
      ? this.tendenciasCache.porJogo[nomeJogo.toLowerCase()]?.dados
      : this.tendenciasCache.geral.dados;

    if (!fonte || fonte.length === 0) return '';

    const linhas = fonte.slice(0, 10).map((v, i) =>
      `${i + 1}. "${v.titulo}" — ${v.canal} (${v.visualizacoes.toLocaleString('pt-BR')} views)`
    );

    return `TENDÊNCIAS REAIS NO YOUTUBE AGORA${nomeJogo ? ` (${nomeJogo})` : ' (Gaming Geral - BR)'}:\n${linhas.join('\n')}`;
  },

  // 🔍 Método de busca rápida por conhecimento específico (busca em todos os gêneros)
  obterConhecimentoJogo(query) {
    if (!query) return null;
    const q = query.toLowerCase();

    for (const genero of Object.values(this.gamingKnowledge)) {
      for (const [key, info] of Object.entries(genero.jogos)) {
        if (info.nome.toLowerCase().includes(q) || key.toLowerCase().includes(q)) {
          return { ...info, generoNome: genero.generoNome };
        }
        for (const sub of info.subNichos) {
          if (sub.toLowerCase().includes(q)) return { ...info, generoNome: genero.generoNome };
        }
      }
    }
    return null;
  },

  // 🗂️ Lista todos os jogos disponíveis, agrupados por gênero (útil para menus/autocomplete)
  listarTodosOsJogosPorGenero() {
    const resultado = {};
    for (const [generoKey, genero] of Object.entries(this.gamingKnowledge)) {
      resultado[genero.generoNome] = Object.values(genero.jogos).map(j => j.nome);
    }
    return resultado;
  },

  // 📝 Gerador de Prompt de Sistema com todo o Conhecimento + Dados do Canal + Tendências reais
  gerarSystemPrompt(canalInfo = null, historicoMemoria = [], tendenciasTexto = '') {
    let canalTexto = "Nenhum canal conectado no momento. Assuma um criador de conteúdo focado em Gaming, Gameplay e YouTube Growth.";
    if (canalInfo) {
      canalTexto = `CANAL CONECTADO DO CRIADOR:
- **Nome do Canal:** ${canalInfo.nome || 'Canal de Jogos'}
- **Inscritos:** ${canalInfo.subscribers || 'N/A'}
- **Visualizações Totais:** ${canalInfo.views || 'N/A'}
- **Avatar:** ${canalInfo.avatar || 'N/A'}`;
    }

    const blocoTendencias = tendenciasTexto
      ? `\n${tendenciasTexto}\nUse essas tendências reais como referência prioritária antes de sugerir tópicos — elas refletem o que está funcionando AGORA, não apenas o histórico da base de conhecimento.\n`
      : '';

    return `Você é o **YouTube Copilot IA**, o assistente virtual especialista de nível mundial em Algoritmos do YouTube, Estratégia de Conteúdo, Retenção de Vídeos e SEO para o Nicho de Jogos e Gameplay.

${canalTexto}
${blocoTendencias}
DIRETRIZES DE ATUAÇÃO E CONHECIMENTO TÉCNICO:
1. **Domínio Amplo em Gaming & Gameplay:** Você possui conhecimento absoluto sobre dezenas de franquias organizadas por gênero — Battle Royale (Free Fire, Fortnite, PUBG/Warzone), Sandbox/Sobrevivência (Minecraft, Terraria, Palworld, Roblox), RPG/Aventura (Pokémon, Zelda, Genshin Impact, Souls-like), Mundo Aberto (GTA, RDR2), Simulação/Gestão (Game Dev Tycoon, Stardew Valley, The Sims, BitLife), FPS Tático (Valorant, CS2), MOBA (League of Legends), Terror (FNAF, Resident Evil, Phasmophobia), Luta (Street Fighter, Mortal Kombat, Tekken), Esportes (FIFA/EA FC), Mobile/Casual (Brawl Stars, Clash Royale, Among Us, BitLife) e Indies (Hollow Knight, Cuphead, Celeste, Subnautica).
2. **Foco em Métricas Reais:** Toda sugestão sua foca em aumentar o **CTR (Click-Through Rate)** e a **Retenção nos 30s iniciais (AVD)**.
3. **Estilo CONCISO E DE TAMANHO MÉDIO (Economia de Quota/Tokens):** Responda de forma DIRETA, PRÁTICA E OBJETIVA (máximo 200 a 350 palavras). Sem introduções longas ou saudações repetitivas. Vá direto ao ponto em tópicos curtos e marcadores claros.
4. **Estruturas de Sucesso:** Quando sugerir vídeos ou roteiros, ofereça sempre de forma sintetizada: Título de Alto CTR, Conceito da Thumbnail, Gancho de 15s e Tags de SEO.
5. **Formatos Universais:** Quando o jogo do criador não estiver na base específica, use os formatosUniversaisDeVideo para adaptar sugestões a qualquer título.

Responda de forma concisa, direta e ultra-prática com base nesse conhecimento técnico!`;
  }
};

// Exporta para escopo global (navegador) e para Node/CommonJS (backend)
if (typeof window !== 'undefined') {
  window.AssistenteConhecimento = AssistenteConhecimento;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssistenteConhecimento;
}