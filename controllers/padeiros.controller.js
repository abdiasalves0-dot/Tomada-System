const bcrypt = require('bcryptjs');
const { Padeiro, Atividade, Meta, Avaliacao, Cronograma, Cliente, Tracking, Contrato, Criador } = require('../data/db-adapter');

exports.listPadeiros = async (req, res) => {
  try {
    const adminId = req.user?.adminId || req.user?.id;
    let query = { deletado: { $ne: true } };
    if (adminId && req.user?.role !== 'superadmin') {
      query.adminId = adminId;
    }
    if (req.user.role !== 'admin' && req.user.filial && req.user.filial !== 'null') {
      query.filial = Array.isArray(req.user.filial) ? { $in: req.user.filial } : req.user.filial;
    }
    const padeiros = await Padeiro.find(query).select('-passwordHash -firstAccessToken');
    
    // Buscar contratos para associar aos padeiros
    const contratos = await Contrato.find();
    
    const result = padeiros.map(p => {
      const pObj = p.toObject ? p.toObject() : p;
      const employeeContratos = contratos.filter(c => c.padeiroId === p.id);
      if (employeeContratos.length > 0) {
        employeeContratos.sort((a, b) => new Date(b.criadoEm || b.created_at) - new Date(a.criadoEm || a.created_at));
        pObj.contrato = employeeContratos[0];
      } else {
        pObj.contrato = null;
      }
      return pObj;
    });

    // Buscar criadores e adicionar na listagem geral do admin
    const criadores = await Criador.find();
    for (const c of criadores) {
      result.push({
        id: c.id,
        nome: c.nome,
        email: c.email,
        role: 'criador',
        cargo: 'CRIADOR',
        status: 'ativo',
        ativo: true,
        filial: ['Bancada Brasília'], // filial fictícia para consistência visual
        contrato: null
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Erro ao listar padeiros:', error);
    res.status(500).json({ error: 'Erro ao carregar lista de padeiros' });
  }
};

exports.getPadeiro = async (req, res) => {
  try {
    const p = await Padeiro.findById(req.params.id).select('-passwordHash -firstAccessToken');
    let pObj;
    if (!p) {
      const c = await Criador.findById(req.params.id);
      if (!c) return res.status(404).json({ error: 'Usuário não encontrado' });
      pObj = {
        id: c.id,
        nome: c.nome,
        email: c.email,
        role: 'criador',
        cargo: 'CRIADOR',
        status: 'ativo',
        ativo: true,
        filial: ['Bancada Brasília'],
        contrato: null
      };
      return res.json(pObj);
    }
    
    pObj = p.toObject ? p.toObject() : p;
    
    const contratos = await Contrato.find();
    const employeeContratos = contratos.filter(c => c.padeiroId === p.id);
    if (employeeContratos.length > 0) {
      employeeContratos.sort((a, b) => new Date(b.criadoEm || b.created_at) - new Date(a.criadoEm || a.created_at));
      pObj.contrato = employeeContratos[0];
    } else {
      pObj.contrato = null;
    }
    
    res.json(pObj);
  } catch (e) {
    res.status(400).json({ error: 'ID inválido' });
  }
};

exports.createPadeiro = async (req, res) => {
  try {
    const { senha, ...rest } = req.body;

    if (req.body.cargo === 'CRIADOR') {
      const emailLower = (req.body.email || '').toLowerCase().trim();
      if (!emailLower) {
        return res.status(400).json({ error: 'E-mail é obrigatório para Criadores' });
      }
      const existe = await Criador.findOne({ email: emailLower });
      if (existe) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
      }
      const senhaHash = senha ? await bcrypt.hash(senha, 10) : await bcrypt.hash('123', 10);
      const novoCriador = await Criador.create({
        nome: req.body.nome,
        email: emailLower,
        senha: senhaHash,
        role: 'criador'
      });
      return res.status(201).json({
        id: novoCriador.id,
        nome: novoCriador.nome,
        email: novoCriador.email,
        role: novoCriador.role,
        cargo: 'CRIADOR'
      });
    }
    let filialArray = rest.filial || [];
    if (typeof filialArray === 'string') {
      try {
        filialArray = JSON.parse(filialArray);
      } catch(e) {
        filialArray = [filialArray];
      }
    }
    if (!Array.isArray(filialArray)) filialArray = [filialArray];

    const novo = {
      ...rest,
      adminId: req.user?.adminId || req.user?.id,
      filial: filialArray,
      ativo: rest.ativo !== undefined ? (rest.ativo === 'true' || rest.ativo === 'on' || rest.ativo === true || rest.ativo === '1') : true,
      deletado: rest.deletado !== undefined ? (rest.deletado === 'true' || rest.deletado === 'on' || rest.deletado === true || rest.deletado === '1') : false,
      role: req.body.cargo === 'GESTOR' ? 'gestor' : 'padeiro',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    if (novo.dataContratacao) {
      try {
        novo.dataContratacao = new Date(novo.dataContratacao).toISOString();
      } catch (e) {
        delete novo.dataContratacao;
      }
    } else {
      delete novo.dataContratacao;
    }

    // Auto-generate codTec if not provided
    if (!novo.codTec) {
      let isUnique = false;
      let code;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const exists = await Padeiro.findOne({ codTec: code });
        if (!exists) isUnique = true;
        attempts++;
      }
      novo.codTec = code;
    }

    if (senha && senha.trim() !== '') {
      novo.passwordHash = await bcrypt.hash(senha, 10);
      novo.firstAccessToken = null; // Clear if set manually
    }

    // Sanitize to only allowed fields
    const allowedFields = ['nome', 'cpf', 'telefone', 'senha', 'role', 'status', 'fotoPerfil', 'filial', 'foto', 'assinatura', 'ativo', 'deletado', 'dataContratacao', 'criadoEm', 'atualizadoEm', 'cor', 'cargo', 'codTec', 'rg', 'email', 'dataNascimento', 'passwordHash', 'firstAccessToken'];
    const sanitizedNovo = {};
    for (const key of Object.keys(novo)) {
      if (allowedFields.includes(key)) {
        let val = novo[key];
        // Convert empty strings to null for unique fields and optional strings
        if (typeof val === 'string' && val.trim() === '' && ['cpf', 'codTec', 'rg', 'email', 'telefone', 'dataNascimento'].includes(key)) {
          val = null;
        }
        sanitizedNovo[key] = val;
      }
    }

    const padeiro = new Padeiro(sanitizedNovo);
    await padeiro.save();
    
    const pObj = padeiro.toObject();
    delete pObj.passwordHash;
    delete pObj.firstAccessToken;
    res.status(201).json(pObj);
  } catch (error) {
    console.error("Error creating padeiro:", error);
    res.status(500).json({ error: 'Erro ao criar padeiro: ' + error.message });
  }
};

exports.updatePadeiro = async (req, res) => {
  try {
    const { senha, ...rest } = req.body;
    let filialArray = rest.filial;
    if (filialArray !== undefined) {
      if (typeof filialArray === 'string') {
        try {
          filialArray = JSON.parse(filialArray);
        } catch(e) {
          filialArray = [filialArray];
        }
      }
      if (!Array.isArray(filialArray)) filialArray = [filialArray];
      rest.filial = filialArray;
    }

    const updateData = { ...rest, atualizadoEm: new Date().toISOString() };
    if (req.body.cargo) updateData.role = req.body.cargo === 'GESTOR' ? 'gestor' : 'padeiro';
    
    if (senha && senha.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(senha, 10);
      updateData.firstAccessToken = null;
    }

    // Protect firstAccessToken from general updates unless explicitly clearing it above
    if (!senha) delete updateData.firstAccessToken;

    const allowedFields = ['nome', 'cpf', 'telefone', 'senha', 'role', 'status', 'fotoPerfil', 'filial', 'foto', 'assinatura', 'ativo', 'deletado', 'dataContratacao', 'criadoEm', 'atualizadoEm', 'cor', 'cargo', 'codTec', 'rg', 'email', 'dataNascimento', 'passwordHash', 'firstAccessToken'];
    const sanitizedUpdate = {};
    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        let val = updateData[key];
        
        // Handle Booleans
        if (key === 'ativo' || key === 'deletado') {
          val = (val === 'true' || val === 'on' || val === true || val === '1');
        }
        
        // Handle Dates
        if (key === 'dataContratacao' || key === 'criadoEm' || key === 'atualizadoEm') {
          if (!val) continue;
          try {
            val = new Date(val).toISOString();
          } catch(e) {
            continue;
          }
        }
        
        // Convert empty strings to null for unique fields and optional strings
        if (typeof val === 'string' && val.trim() === '' && ['cpf', 'codTec', 'rg', 'email', 'telefone', 'dataNascimento'].includes(key)) {
          val = null;
        }
        
        sanitizedUpdate[key] = val;
      }
    }

    const p = await Padeiro.findByIdAndUpdate(req.params.id, sanitizedUpdate, { new: true });
    if (!p) return res.status(404).json({ error: 'Não encontrado' });
    res.json(p);
  } catch (e) {
    console.error("Error updating padeiro:", e);
    res.status(400).json({ error: 'ID inválido ou erro na atualização' });
  }
};

exports.deletePadeiro = async (req, res) => {
  try {
    const padeiroId = req.params.id;
    
    // Perform cascade deletion
    await Promise.all([
      Padeiro.findByIdAndDelete(padeiroId),
      Atividade.deleteMany({ padeiroId }),
      Meta.deleteMany({ padeiroId }),
      Avaliacao.deleteMany({ padeiroId }),
      Cronograma.deleteMany({ padeiroId })
    ]);

    res.json({ success: true, message: 'Padeiro e todos os seus registros associados foram excluídos com sucesso.' });
  } catch (e) {
    console.error("Erro na exclusão em cascata:", e);
    res.status(400).json({ error: 'Erro ao excluir padeiro e seus registros' });
  }
};

exports.deleteAllPadeiros = async (req, res) => {
  try {
    await Promise.all([
      Padeiro.deleteMany({}),
      Atividade.deleteMany({}),
      Meta.deleteMany({}),
      Avaliacao.deleteMany({}),
      Cronograma.deleteMany({})
    ]);
    res.json({ success: true, message: 'Todos os padeiros foram excluídos.' });
  } catch (e) {
    console.error("Erro na exclusão de todos os padeiros:", e);
    res.status(500).json({ error: 'Erro ao excluir padeiros' });
  }
};

exports.seedPadeiro = async (req, res) => {
  try {
    const { cargo, filial } = req.body;
    if (!cargo || !filial) return res.status(400).json({ error: 'Cargo e filial são obrigatórios' });
    
    const nomes = ["Carlos", "João", "José", "Marcos", "Paulo", "Antônio", "Luiz", "Fernando", "Rafael", "Pedro", "Felipe", "Lucas", "Gabriel", "Mateus", "Bruno", "Eduardo"];
    const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida"];
    
    const nomeReal = `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
    
    const randomId = Math.floor(Math.random() * 10000);
    const codTec = `TEC${Math.floor(1000 + Math.random() * 9000)}`;

    const novo = {
      nome: nomeReal,
      cargo,
      filial: [filial],
      codTec,
      role: cargo === 'GESTOR' ? 'gestor' : 'padeiro',
      status: 'ativo',
      ativo: true,
      cpf: `${Math.floor(100+Math.random()*899)}.${Math.floor(100+Math.random()*899)}.${Math.floor(100+Math.random()*899)}-${Math.floor(10+Math.random()*89)}`,
      email: `${nomeReal.split(' ')[0].toLowerCase()}${randomId}@Tomada.com`,
      telefone: `619${Math.floor(10000000+Math.random()*89999999)}`,
      dataContratacao: new Date().toISOString(),
      criadoEm: new Date().toISOString()
    };
    
    const padeiro = new Padeiro(novo);
    await padeiro.save();
    
    // Gerar Metas
    await Meta.create({
      padeiroId: padeiro.id,
      tipo: "faturamento",
      metaKg: 2000,
      realizado: 0,
      periodo: new Date().toISOString().substring(0, 7),
      observacao: "Meta inicial gerada automaticamente"
    });
    
    // Gerar atividades dos últimos 30 dias
    const atividades = [];
    const hoje = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const dataStr = d.toISOString().split('T')[0];
      const mesStr = dataStr.substring(0, 7);
      const year = d.getFullYear();
      
      const firstDayOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      const semanaStr = `${year}-W${weekNum.toString().padStart(2, '0')}`;
      
      const prodPaoSal = Math.floor(Math.random() * 300) + 800;
      const prodPaoDoce = Math.floor(Math.random() * 200) + 300;
      const prodPaoForma = Math.floor(Math.random() * 100) + 100;
      const prodRosca = Math.floor(Math.random() * 50) + 50;
      const prodSalgado = Math.floor(Math.random() * 100) + 200;
      const prodPaoQueijo = Math.floor(Math.random() * 150) + 200;
      const prodIntegral = Math.floor(Math.random() * 80) + 70;
      const kgTotal = prodPaoSal + prodPaoDoce + prodPaoForma + prodRosca + prodSalgado + prodPaoQueijo + prodIntegral;
      const lTotal = kgTotal * 0.1;

      atividades.push({
        padeiroId: padeiro.id,
        padeiroNome: padeiro.nome,
        data: dataStr,
        mes: mesStr,
        semana: semanaStr,
        status: 'finalizada',
        nota: Math.floor(Math.random() * 2) + 4, // 4 or 5
        prodPaoSal,
        prodPaoDoce,
        prodPaoForma,
        prodRosca,
        prodSalgado,
        prodPaoQueijo,
        prodIntegral,
        kgTotal,
        lTotal
      });
    }
    
    for (const a of atividades) {
      await Atividade.create(a);
    }
    
    res.json({ success: true, padeiro });
  } catch (e) {
    console.error("Erro no seed padeiro:", e);
    res.status(500).json({ error: 'Erro ao gerar padeiro fictício' });
  }
};

exports.seedAllData = async (req, res) => {
  try {
    const padeiros = await Padeiro.find({ deletado: { $ne: true } });
    const clientes = await Cliente.find();
    const produtos = await Produto.find({});
    
    // Clear existing Cronograma, Atividade, Meta, Localizacao, Orcamento
    await Cronograma.deleteMany({});
    await Atividade.deleteMany({});
    await Meta.deleteMany({});
    await Localizacao.deleteMany({});
    await Orcamento.deleteMany({});
    
    if (padeiros.length === 0) return res.status(400).json({ error: "Nenhum padeiro encontrado. Gere um padeiro primeiro." });

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split("T")[0];

    const weekDates = [];
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDates.push(d.toISOString().split("T")[0]);
    }

    const mockLat = -15.793889;
    const mockLng = -47.882778;

    const activitiesToCreate = [];
    const metasToCreate = [];
    const cronogramasToCreate = [];
    const trackingToCreate = [];
    const seededOrcamentos = [];

    // Helper to calculate ISO Week
    const getISOWeek = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    };

    // 1. Generate realistic budgets (Orçamentos) for each client
    const budgetTemplates = [
      { descricao: "Armários planejados de cozinha em MDF", valor: 8500, categoria: "Marcenaria" },
      { descricao: "Mesa de jantar rústica com 6 cadeiras", valor: 4200, categoria: "Marcenaria" },
      { descricao: "Guarda-roupa sob medida com portas de correr", valor: 12000, categoria: "Marcenaria" },
      { descricao: "Painel de TV ripado e rack para sala", valor: 3800, categoria: "Marcenaria" },
      { descricao: "Balcão de atendimento comercial", valor: 6500, categoria: "Comercial" }
    ];

    let budgetCounter = 1;
    const currentYear = new Date().getFullYear();

    for (const c of clientes) {
      // 2 budgets per client
      for (let j = 0; j < 2; j++) {
        const template = budgetTemplates[Math.floor(Math.random() * budgetTemplates.length)];
        const status = j === 0 ? "aprovado" : (Math.random() > 0.5 ? "em_analise" : "rejeitado");
        const codeNum = String(budgetCounter++).padStart(3, '0');
        
        // Find actual product IDs from the database if available to match them correctly
        const mdfProduct = produtos.find(p => p.descricao.toLowerCase().includes("mdf")) || { id: "mock-mdf-id" };
        const hardwareProduct = produtos.find(p => p.descricao.toLowerCase().includes("tabua") || p.descricao.toLowerCase().includes("cumaru")) || { id: "mock-hardware-id" };

        const orc = await Orcamento.create({
          codigo: `ORC-${currentYear}-${codeNum}`,
          clienteNome: c.nomeFantasia || c.nome || "Cliente Fictício",
          clienteId: c.id,
          descricao: template.descricao,
          data: new Date().toISOString().split("T")[0],
          validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          valor_total: template.valor,
          status: status,
          observacoes: "Orçamento gerado pelo seed automático do sistema.",
          prazoEntrega: "20 dias úteis",
          categoria: template.categoria,
          itens: [
            { produtoId: mdfProduct.id, quantidade: 2, subtotal: template.valor * 0.4, preco_unitario: template.valor * 0.2, descricao: mdfProduct.descricao || "Materia prima MDF" },
            { produtoId: hardwareProduct.id, quantidade: 1, subtotal: template.valor * 0.2, preco_unitario: template.valor * 0.2, descricao: hardwareProduct.descricao || "Ferragens e Acessórios" }
          ],
          maoDeObra: template.valor * 0.4
        });
        seededOrcamentos.push(orc);
      }
    }

    // 2. Generate metas, tracking, and activities for Padeiros
    for (const p of padeiros) {
      // Meta (PadeiroMeta model fields)
      metasToCreate.push({
        padeiroId: p.id,
        tipo: "faturamento",
        metaKg: 5000 + Math.floor(Math.random() * 5000),
        realizado: 2000 + Math.floor(Math.random() * 3000),
        periodo: new Date().toISOString().substring(0, 7), // "YYYY-MM"
        observacao: "Meta de faturamento mensal auto-gerada."
      });

      // Tracking (Localizacao model fields)
      trackingToCreate.push({
        padeiroId: p.id,
        lat: mockLat + (Math.random() * 0.01 - 0.005),
        lng: mockLng + (Math.random() * 0.01 - 0.005),
        precisao: 10 + Math.random() * 10,
        timestamp: new Date()
      });

      // Atividades (Last 30 days - Atividade model fields)
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (d.getDay() === 0) continue;

        const c = clientes.length > 0 ? clientes[Math.floor(Math.random() * clientes.length)] : { id: "mock-cliente", nomeFantasia: "Cliente Fictício" };
        
        const prodPaoSal = Math.floor(Math.random() * 1000);
        const prodPaoDoce = Math.floor(Math.random() * 500);
        const prodPaoForma = Math.floor(Math.random() * 200);
        const prodRosca = Math.floor(Math.random() * 100);
        const prodSalgado = Math.floor(Math.random() * 300);
        const prodPaoQueijo = Math.floor(Math.random() * 400);
        const prodIntegral = Math.floor(Math.random() * 150);
        const kgTotal = prodPaoSal + prodPaoDoce + prodPaoForma + prodRosca + prodSalgado + prodPaoQueijo + prodIntegral;
        const lTotal = kgTotal * 0.1;

        activitiesToCreate.push({
          padeiroId: p.id,
          padeiroNome: p.nome,
          clienteId: c.id,
          clienteNome: c.nomeFantasia || c.nome || "Cliente Fictício",
          data: d.toISOString().split("T")[0],
          mes: d.toISOString().substring(0, 7),
          semana: getISOWeek(d),
          status: "finalizada",
          nota: 5,
          prodPaoSal,
          prodPaoDoce,
          prodPaoForma,
          prodRosca,
          prodSalgado,
          prodPaoQueijo,
          prodIntegral,
          kgTotal,
          lTotal,
          observacao: "Gerado automaticamente pelo Seed"
        });
      }

      // 3. Cronograma (Weekly tasks) linked to approved budgets
      // Match approved budgets to distribute to padeiros
      const approvedBudgets = seededOrcamentos.filter(o => o.status === "aprovado");
      
      for (let k = 0; k < weekDates.length; k++) {
        const dStr = weekDates[k];
        if (new Date(dStr).getDay() === 0) continue;

        // Choose a random approved budget or client
        const budget = approvedBudgets.length > 0 ? approvedBudgets[Math.floor(Math.random() * approvedBudgets.length)] : null;
        const c = budget ? { id: budget.clienteId, nome: budget.clienteNome } : clientes[Math.floor(Math.random() * clientes.length)];
        const clientName = c.nomeFantasia || c.nome || c.razaoSocial || "Cliente Fictício";
        const hasBudgetLink = budget && Math.random() > 0.3;

        const taskData = {
          padeiroId: p.id,
          padeiroNome: p.nome,
          codTec: p.codTec,
          clienteId: c.id,
          clienteNome: clientName,
          data: dStr,
          horario: "08:00",
          turno: "Manhã",
          status: hasBudgetLink ? (Math.random() > 0.5 ? "em_andamento" : "pendente") : "pendente",
          observacao: hasBudgetLink ? "Tarefa vinculada ao orçamento aprovado." : "Tarefa de rotina operacional.",
          criadoPor: "sistema",
          checklist: [
            { text: 'Cliente aprovar orçamento', done: true },
            { text: 'comprar os materiais', done: hasBudgetLink && Math.random() > 0.5 },
            { text: 'organizar o projeto tipo fazaer tal parte', done: hasBudgetLink && Math.random() > 0.6 },
            { text: 'fabricação', done: false },
            { text: 'montagem:', done: false },
            { text: 'montagem entrega na casa do cliente', done: false }
          ],
          progresso: hasBudgetLink ? 17 : 0,
          tags: []
        };

        if (hasBudgetLink) {
          const itemsSum = budget.itens ? budget.itens.reduce((sum, item) => sum + (item.subtotal || 0), 0) : 0;
          taskData.orcamento = {
            orcamentoId: budget.id,
            codigo: budget.codigo,
            valor_total: budget.valor_total,
            ganhoLiquido: budget.valor_total - itemsSum,
            prazoDias: 20,
            itens: (budget.itens || []).map(item => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade
            }))
          };
        }

        cronogramasToCreate.push(taskData);
      }
    }

    if (metasToCreate.length > 0) {
      for (const m of metasToCreate) await Meta.create(m);
    }
    if (activitiesToCreate.length > 0) {
      for (const a of activitiesToCreate) await Atividade.create(a);
    }
    if (cronogramasToCreate.length > 0) {
      for (const c of cronogramasToCreate) await Cronograma.create(c);
    }
    if (trackingToCreate.length > 0) {
      for (const t of trackingToCreate) await Localizacao.create(t);
    }

    res.json({ success: true, message: "Orçamentos, tarefas (cronogramas), atividades e metas gerados com sucesso." });
  } catch (e) {
    console.error("Erro no seed-all:", e);
    res.status(500).json({ error: "Erro ao gerar dados fictícios." });
  }
};
