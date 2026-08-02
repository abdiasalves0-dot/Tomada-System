const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getAdminId } = require('./context');

const MODEL_FIELDS = {
  admin: ['id', 'nome', 'email', 'senha', 'role', 'criadoEm'],
  padeiro: ['id', 'nome', 'cpf', 'telefone', 'senha', 'role', 'status', 'fotoPerfil', 'filial', 'foto', 'assinatura', 'ativo', 'deletado', 'dataContratacao', 'criadoEm', 'atualizadoEm', 'cor', 'cargo', 'codTec', 'rg', 'email', 'dataNascimento', 'passwordHash', 'firstAccessToken', 'adminId'],
  padeiroMeta: ['id', 'padeiroId', 'tipo', 'nome', 'metaKg', 'realizado', 'periodo', 'observacao', 'criadoPor', 'criadoEm', 'atualizadoEm', 'adminId'],
  atividade: ['id', 'padeiroId', 'padeiroNome', 'cronogramaId', 'clienteId', 'clienteNome', 'data', 'mes', 'semana', 'status', 'nota', 'prodPaoSal', 'prodPaoDoce', 'prodPaoForma', 'prodRosca', 'prodSalgado', 'prodPaoQueijo', 'prodIntegral', 'perdaPaoSal', 'perdaPaoDoce', 'perdaPaoForma', 'perdaRosca', 'perdaSalgado', 'perdaPaoQueijo', 'perdaIntegral', 'fotoComprovante', 'criadoEm', 'hora', 'inicioEm', 'terminadoEm', 'fimEm', 'tempoMinimoMinutos', 'fotos', 'assinatura', 'localizacao', 'latitude', 'longitude', 'observacao', 'observacaoCliente', 'notaCliente', 'notaPadeiroCliente', 'kgTotal', 'lTotal', 'kgItens', 'atualizadoEm', 'lastStep', 'timeline', 'adminId'],
  cronograma: ['id', 'padeiroId', 'padeiroNome', 'codTec', 'clienteId', 'clienteNome', 'data', 'horario', 'turno', 'tarefas', 'status', 'tempoMinimoMinutos', 'posicao', 'observacao', 'criadoPor', 'criadoEm', 'atualizadoEm', 'tags', 'progresso', 'checklist', 'kanbanListId', 'orcamento', 'adminId'],
  localizacao: ['id', 'padeiroId', 'lat', 'lng', 'precisao', 'timestamp', 'adminId'],
  pushSubscription: ['id', 'padeiroId', 'endpoint', 'keys_p256dh', 'keys_auth', 'adminId'],
  configuracao: ['id', 'chave', 'valor', 'adminId'],
  produto: ['id', 'descricao', 'codigo', 'fornecedor', 'categoria', 'preco', 'unidade', 'ativo', 'estoque', 'adminId'],
  cliente: ['id', 'codigo', 'nome', 'razaoSocial', 'nomeFantasia', 'cnpj', 'inscricaoEstadual', 'email', 'telefone', 'celular', 'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'ativo', 'receita', 'custoInsumos', 'adminId'],
  criterio: ['id', 'texto', 'tipo'],
  avaliacao: ['id', 'padeiroId', 'padeiroNome', 'clienteId', 'clienteNome', 'atividadeId', 'tipo', 'respostas', 'nota', 'observacao', 'avaliadoPor', 'avaliadoPorNome', 'criadoEm', 'adminId'],
  kanbanList: ['id', 'titulo', 'posicao', 'cor', 'criadoEm'],
  categoria: ['id', 'nome'],
  ferramenta: ['id', 'categoriaId', 'nome', 'marca', 'tier', 'precoMin', 'precoMedio', 'precoMax', 'unidade', 'observacao', 'criadoEm'],
  auditLog: ['id', 'evento', 'usuario', 'ip', 'detalhes', 'data', 'adminId'],
  criador: ['id', 'nome', 'email', 'senha', 'role', 'fotoPerfil', 'canalYoutube', 'criadoEm', 'atualizadoEm'],
  projeto: ['id', 'titulo', 'descricao', 'status', 'tipo', 'criadorId', 'profissionalId', 'arquivos', 'dataLimite', 'criadoEm', 'atualizadoEm']
};

function buildWhere(query) {
  if (!query || Object.keys(query).length === 0) return {};
  const where = { ...query };
  
  for (const key in where) {
    if (key === '_id') {
      where.id = String(where[key]);
      delete where._id;
      continue;
    }
    if (key === 'id' && typeof where[key] !== 'object') {
       where.id = String(where.id);
       continue;
    }
    
    // Handling string exact match for scalar list fields
    if (key === 'filial' && typeof where[key] === 'string') {
      where[key] = { has: where[key] };
      continue;
    }

    const val = where[key];

    // Handling RegExp objects (e.g., new RegExp('^email$', 'i'))
    if (val instanceof RegExp) {
      let rawPattern = val.source || '';
      if (rawPattern.startsWith('^')) rawPattern = rawPattern.slice(1);
      if (rawPattern.endsWith('$')) rawPattern = rawPattern.slice(0, -1);
      where[key] = { equals: rawPattern, mode: 'insensitive' };
      continue;
    }

    // Tratamento para operadores do tipo MongoDB / Sequelize
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const prismaOp = {};
      let hasOp = false;
      if (val.$like !== undefined) {
        let likeStr = val.$like;
        if (likeStr.endsWith('%') && !likeStr.startsWith('%')) {
          prismaOp.startsWith = likeStr.slice(0, -1);
        } else if (likeStr.startsWith('%') && likeStr.endsWith('%')) {
          prismaOp.contains = likeStr.slice(1, -1);
        } else {
          prismaOp.contains = likeStr.replace(/%/g, '');
        }
        prismaOp.mode = 'insensitive';
        hasOp = true;
      }
      if (val.$regex !== undefined) {
         let rawRegex = val.$regex.source || val.$regex;
         if (typeof rawRegex === 'string') {
           if (rawRegex.startsWith('^')) rawRegex = rawRegex.slice(1);
           if (rawRegex.endsWith('$')) rawRegex = rawRegex.slice(0, -1);
         }
         prismaOp.contains = rawRegex; 
         prismaOp.mode = 'insensitive';
         hasOp = true;
      }
      if (val.$ne !== undefined) {
        prismaOp.not = val.$ne;
        hasOp = true;
      }
      if (val.$in !== undefined) {
        if (key === 'filial') {
          prismaOp.hasSome = val.$in;
        } else {
          prismaOp.in = val.$in;
        }
        hasOp = true;
      }
      if (val.$gte !== undefined) {
        prismaOp.gte = val.$gte;
        hasOp = true;
      }
      if (val.$lte !== undefined) {
        prismaOp.lte = val.$lte;
        hasOp = true;
      }
      if (val.$gt !== undefined) {
        prismaOp.gt = val.$gt;
        hasOp = true;
      }
      if (val.$lt !== undefined) {
        prismaOp.lt = val.$lt;
        hasOp = true;
      }

      if (hasOp) {
        where[key] = prismaOp;
      }

      continue;
    }

    // Case-insensitive string matching for email, nome, cpf
    if (typeof val === 'string' && (key === 'email' || key === 'nome' || key === 'cpf')) {
      where[key] = { equals: val, mode: 'insensitive' };
    }
  }

  if (where.$or) {
    where.OR = where.$or.map(cond => buildWhere(cond));
    delete where.$or;
  }
  if (where.$and) {
    where.AND = where.$and.map(cond => buildWhere(cond));
    delete where.$and;
  }

  return where;
}

// Wrapper flexível para tornar o Prisma Client parecido com Mongoose,
// retornando objetos com método save() para compatibilidade e lidando com async chaining.
class PrismaCollectionProxy {
  constructor(modelName) {
    this.modelName = modelName;
    this.model = prisma[modelName];
  }

  filterFields(data) {
    if (!data || typeof data !== 'object') return data;
    const allowed = MODEL_FIELDS[this.modelName];
    if (!allowed) return data;
    
    const filtered = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        filtered[key] = data[key];
      }
    }
    
    // Normalização de filial (string -> array)
    if (this.modelName === 'padeiro' && typeof filtered.filial === 'string') {
      filtered.filial = [filtered.filial];
    }
    
    // Map passwordHash to senha for admin if needed
    if (this.modelName === 'admin') {
      if (filtered.senha === undefined && data.passwordHash !== undefined) {
        filtered.senha = data.passwordHash;
      }
    }

    // Auto-fill mes and semana for Atividade if missing
    if (this.modelName === 'atividade') {
      const dataVal = filtered.data || data.data || new Date().toISOString().split('T')[0];
      if (!filtered.data) filtered.data = dataVal;
      if (!filtered.mes) filtered.mes = dataVal.substring(0, 7);
      if (!filtered.semana) {
        try {
          const date = new Date(dataVal);
          if (!isNaN(date.getTime())) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            filtered.semana = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
          } else {
            filtered.semana = '2026-W01';
          }
        } catch (e) {
          filtered.semana = '2026-W01';
        }
      }
    }
    
    return filtered;
  }

  // Envolve um ou mais docs em um objeto que tenha os métodos toObject e save
  wrapDoc(doc) {
    if (!doc) return null;
    if (Array.isArray(doc)) return doc.map(d => this.wrapDoc(d));
    
    const self = this;
    const wrapped = {
      ...doc,
      _id: doc.id, // Retro-compatibilidade com código que usa doc._id
      toObject: function() { 
         const obj = { ...this };
         delete obj.save;
         delete obj.toObject;
         delete obj.toJSON;
         return obj;
      },
      toJSON: function() {
         return this.toObject();
      },
      save: async function() {
        const rawData = { ...this };
        delete rawData.save;
        delete rawData.toObject;
        delete rawData.toJSON;
        delete rawData.createdAt;
        delete rawData.updatedAt;
        
        const dataToSave = self.filterFields(rawData);
        delete dataToSave._id;
        delete dataToSave.id; // ID should not be in the update data payload

        if (dataToSave.padeiroId && self.modelName !== 'padeiro') {
          // Verify padeiro exists before connecting
          const padeiroExists = await prisma.padeiro.findUnique({ where: { id: dataToSave.padeiroId } });
          if (padeiroExists) {
            dataToSave.padeiro = { connect: { id: dataToSave.padeiroId } };
          }
          delete dataToSave.padeiroId;
        }

        const adminId = getAdminId();
        const hasAdminId = MODEL_FIELDS[self.modelName]?.includes('adminId');
        if (adminId && hasAdminId) {
          dataToSave.adminId = adminId;
        }

        let updated;
        if (this.id) {
          if (adminId && hasAdminId) {
            const existing = await self.model.findFirst({ where: { id: String(this.id), adminId } });
            if (!existing) throw new Error("Acesso negado ou registro não encontrado");
          }
          updated = await self.model.update({
            where: { id: String(this.id) },
            data: dataToSave
          });
        } else {
          updated = await self.model.create({
            data: dataToSave
          });
          this.id = updated.id;
          this._id = updated.id;
        }

        return self.wrapDoc(updated);
      }
    };
    return wrapped;
  }

  find(query = {}) {
    const self = this;
    const adminId = getAdminId();
    const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
    const finalQuery = { ...query };
    
    if (adminId && hasAdminId) {
      finalQuery.adminId = adminId;
    }
    
    const whereClause = buildWhere(finalQuery);
    
    const chain = {
      _options: {
        where: whereClause,
      },
      sort: function(options) {
        this._options.orderBy = Object.keys(options).map(key => ({
          [key]: options[key] === 1 ? 'asc' : 'desc'
        }));
        return this;
      },
      select: function(fields) {
        // Ignorado no wrapper simples
        return this;
      },
      limit: function(n) {
        this._options.take = n;
        return this;
      },
      then: function(resolve, reject) {
        self.model.findMany(this._options)
          .then(results => resolve(self.wrapDoc(results)))
          .catch(reject);
      },
      catch: function(reject) {
        self.model.findMany(this._options).catch(reject);
      }
    };

    return chain;
  }

  async findOne(query = {}) {
    const adminId = getAdminId();
    const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
    const finalQuery = { ...query };
    
    if (adminId && hasAdminId) {
      finalQuery.adminId = adminId;
    }
    
    const doc = await this.model.findFirst({ where: buildWhere(finalQuery) });
    return this.wrapDoc(doc);
  }

  async findById(id) {
    const adminId = getAdminId();
    const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
    
    if (adminId && hasAdminId) {
      const doc = await this.model.findFirst({ where: { id: String(id), adminId } });
      return this.wrapDoc(doc);
    } else {
      const doc = await this.model.findUnique({ where: { id: String(id) } });
      return this.wrapDoc(doc);
    }
  }

  async create(data) {
    const rawData = this.filterFields(data);
    const dataToSave = { ...rawData };
    delete dataToSave._id; // Limpa _id se houver

    if (dataToSave.padeiroId && this.modelName !== 'padeiro') {
      // Verify padeiro exists before connecting to avoid FK errors
      const padeiroExists = await prisma.padeiro.findUnique({ where: { id: dataToSave.padeiroId } });
      if (padeiroExists) {
        dataToSave.padeiro = { connect: { id: dataToSave.padeiroId } };
      }
      delete dataToSave.padeiroId;
    }

    const adminId = getAdminId();
    const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
    if (adminId && hasAdminId) {
      dataToSave.adminId = adminId;
    }

    const doc = await this.model.create({ data: dataToSave });
    return this.wrapDoc(doc);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    try {
      const adminId = getAdminId();
      const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
      
      if (adminId && hasAdminId) {
        const existing = await this.model.findFirst({ where: { id: String(id), adminId } });
        if (!existing) return null;
      }
      
      const rawData = this.filterFields(update);
      const dataToSave = { ...rawData };
      delete dataToSave._id;
      delete dataToSave.id;

      if (dataToSave.padeiroId && this.modelName !== 'padeiro') {
        // Verify padeiro exists before connecting to avoid FK errors
        const padeiroExists = await prisma.padeiro.findUnique({ where: { id: dataToSave.padeiroId } });
        if (padeiroExists) {
          dataToSave.padeiro = { connect: { id: dataToSave.padeiroId } };
        }
        delete dataToSave.padeiroId;
      }
      
      if (adminId && hasAdminId) {
        dataToSave.adminId = adminId;
      }

      const doc = await this.model.update({
        where: { id: String(id) },
        data: dataToSave
      });
      return this.wrapDoc(doc);
    } catch (e) {
      if (e.code === 'P2025') return null; // Record to update not found
      throw e;
    }
  }

  async findByIdAndDelete(id) {
    try {
      const adminId = getAdminId();
      const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
      
      if (adminId && hasAdminId) {
        const existing = await this.model.findFirst({ where: { id: String(id), adminId } });
        if (!existing) return null;
      }
      
      const doc = await this.model.delete({ where: { id: String(id) } });
      return this.wrapDoc(doc);
    } catch (e) {
      if (e.code === 'P2025') return null; // Record to delete not found
      throw e;
    }
  }

  async deleteMany(query = {}) {
    const adminId = getAdminId();
    const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
    const finalQuery = { ...query };
    
    if (adminId && hasAdminId) {
      finalQuery.adminId = adminId;
    }
    
    return await this.model.deleteMany({ where: buildWhere(finalQuery) });
  }

  async countDocuments(query = {}) {
    const adminId = getAdminId();
    const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
    const finalQuery = { ...query };
    
    if (adminId && hasAdminId) {
      finalQuery.adminId = adminId;
    }
    
    return await this.model.count({ where: buildWhere(finalQuery) });
  }

  async insertMany(docs) {
    const adminId = getAdminId();
    const hasAdminId = MODEL_FIELDS[this.modelName]?.includes('adminId');
    
    const data = docs.map(d => {
      const c = this.filterFields(d);
      delete c._id;
      if (adminId && hasAdminId) {
        c.adminId = adminId;
      }
      return c;
    });
    return await this.model.createMany({ data, skipDuplicates: true });
  }
}

// Wrapper para simular const model = new Model(data)
function createProxy(modelName) {
  const instance = new PrismaCollectionProxy(modelName);
  
  const proxy = function(data) {
    const doc = { ...data };
    if (!doc.id) {
      // Prisma usará uuid, ou podemos deixar Prisma gerar
    }
    return instance.wrapDoc(doc);
  };
  
  const methods = [
    'find', 'findOne', 'findById', 'create', 
    'findByIdAndUpdate', 'findByIdAndDelete', 
    'deleteMany', 'countDocuments', 'insertMany'
  ];
  
  methods.forEach(m => {
    proxy[m] = instance[m].bind(instance);
  });
  
  return proxy;
}

const jsonDB = require('./jsonDB');

module.exports = {
  Padeiro: createProxy('padeiro'),
  Produto: createProxy('produto'),
  Cliente: createProxy('cliente'),
  Colaborador: jsonDB.Colaborador,
  Admin: createProxy('admin'),
  Meta: createProxy('padeiroMeta'),
  Atividade: createProxy('atividade'),
  Avaliacao: createProxy('avaliacao'),
  Cronograma: createProxy('cronograma'),
  Criterio: createProxy('criterio'),
  Localizacao: createProxy('localizacao'),
  HistoricoLocalizacao: jsonDB.HistoricoLocalizacao,
  CronogramaTemplate: jsonDB.CronogramaTemplate,
  TimelineEvent: jsonDB.TimelineEvent,
  PushSubscription: createProxy('pushSubscription'),
  Configuracao: createProxy('configuracao'),
  Orcamento: jsonDB.Orcamento,
  Contrato: jsonDB.Contrato,
  FornecedorProduto: jsonDB.FornecedorProduto,
  Ferramenta: createProxy('ferramenta'),
  CategoriaFerramenta: createProxy('categoria'),
  AuditLog: createProxy('auditLog'),
  Criador: createProxy('criador'),
  Projeto: createProxy('projeto')
};
