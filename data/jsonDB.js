const fs = require('fs');
const path = require('path');
const { getAdminId } = require('./context');

const DATA_DIR = __dirname;

// Global Prisma Client caching to avoid connection leaks in serverless environments
let prisma;
function getPrisma() {
  if (!prisma) {
    try {
      const { PrismaClient } = require('@prisma/client');
      if (global.prismaInstance) {
        prisma = global.prismaInstance;
      } else {
        prisma = new PrismaClient();
        global.prismaInstance = prisma;
      }
    } catch (err) {
      console.error("[jsonDB] Falha ao instanciar PrismaClient:", err);
    }
  }
  return prisma;
}

// Utility to generate IDs similar to MongoDB
function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

class JsonCollection {
  constructor(name, filename) {
    this.name = name;
    if (process.env.VERCEL === '1') {
      this.filepath = path.join('/tmp', filename);
      // Copiar arquivo original do DATA_DIR para /tmp se não existir
      const srcPath = path.join(DATA_DIR, filename);
      if (!fs.existsSync(this.filepath) && fs.existsSync(srcPath)) {
        try {
          fs.copyFileSync(srcPath, this.filepath);
        } catch (err) {
          console.error(`Erro ao copiar ${filename} para /tmp:`, err);
        }
      }
    } else {
      this.filepath = path.join(DATA_DIR, filename);
    }
    this.data = [];
    this.load();
  }

  async syncFromPostgres() {
    if (process.env.VERCEL !== '1') return;
    try {
      const prismaClient = getPrisma();
      if (!prismaClient) return;
      const configKey = `jsondb_${this.name.toLowerCase()}`;
      const adminId = getAdminId() || null;
      const record = await prismaClient.configuracao.findFirst({
        where: { chave: configKey, adminId: adminId }
      });
      if (record && record.valor) {
        this.data = JSON.parse(record.valor);
        try {
          fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2));
        } catch (err) {
          // ignore cache write error
        }
      } else {
        this.data = [];
      }
    } catch (err) {
      console.error(`[jsonDB] Erro ao sincronizar ${this.name} do Postgres:`, err.message);
    }
  }

  async saveToPostgres() {
    if (process.env.VERCEL !== '1') return;
    try {
      const prismaClient = getPrisma();
      if (!prismaClient) return;
      const configKey = `jsondb_${this.name.toLowerCase()}`;
      const valorStr = JSON.stringify(this.data);
      const adminId = getAdminId() || null;
      
      const existing = await prismaClient.configuracao.findUnique({
        where: {
          chave_adminId: {
            chave: configKey,
            adminId: adminId
          }
        }
      });
      
      if (existing) {
        await prismaClient.configuracao.update({
          where: { id: existing.id },
          data: { valor: valorStr }
        });
      } else {
        await prismaClient.configuracao.create({
          data: {
            chave: configKey,
            valor: valorStr,
            adminId: adminId
          }
        });
      }
    } catch (err) {
      console.error(`[jsonDB] Erro ao salvar ${this.name} no Postgres:`, err.message);
    }
  }

  load() {
    // If .db doesn't exist, try to migrate from .json
    if (!fs.existsSync(this.filepath)) {
      const jsonPath = this.filepath.replace('.db', '.json');
      if (fs.existsSync(jsonPath)) {
        console.log(`📦 Migrando ${this.name} de .json para .db...`);
        try {
          const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
          if (jsonContent && jsonContent.trim()) {
            this.data = JSON.parse(jsonContent);
            this.save(); // Create the .db file
          } else {
            this.data = [];
          }
        } catch (e) {
          console.error(`Erro na migração de ${this.name}:`, e);
          this.data = [];
        }
      }
    }

    if (fs.existsSync(this.filepath)) {
      try {
        const content = fs.readFileSync(this.filepath, 'utf-8');
        if (!content || !content.trim()) {
          this.data = [];
        } else {
          this.data = JSON.parse(content);
        }
      } catch (e) {
        console.error(`Error loading ${this.name}:`, e);
        this.data = [];
      }
    }

    // Auto-seed default branches if database is empty
    if (this.name === 'Filial' && this.data.length === 0) {
      this.data = [
        { id: '1', _id: '1', nome: 'Bancada Brasília', cidade: 'Brasília', estado: 'DF', endereco: 'SCS Quadra 4, Bloco A, Centro', telefone: '(61) 98765-4321', responsavel: 'Carlos Silva', status: 'ativo', adminId: 'admin-001' },
        { id: '2', _id: '2', nome: 'Bancada Goiania', cidade: 'Goiânia', estado: 'GO', endereco: 'Av. T-9, 1200, Setor Bueno', telefone: '(62) 98765-4322', responsavel: 'João Santos', status: 'ativo', adminId: 'admin-001' },
        { id: '3', _id: '3', nome: 'Bancada Palmas', cidade: 'Palmas', estado: 'TO', endereco: 'Av. JK, 150, Centro', telefone: '(63) 98765-4323', responsavel: 'José Oliveira', status: 'ativo', adminId: 'admin-001' },
        { id: '4', _id: '4', nome: 'Bancada Campo Grande', cidade: 'Campo Grande', estado: 'MS', endereco: 'Rua 14 de Julho, 2500, Centro', telefone: '(67) 98765-4324', responsavel: 'Marcos Alves', status: 'ativo', adminId: 'admin-001' }
      ];
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.warn(`⚠️  [jsonDB] Não foi possível salvar ${this.name}:`, e.message);
    }
    if (process.env.VERCEL === '1') {
      this.saveToPostgres().catch(err => {
        console.error(`[jsonDB] Erro no background saveToPostgres para ${this.name}:`, err);
      });
    }
  }

  // Helper to make plain objects look like Mongoose documents
  wrapDoc(doc) {
    if (!doc) return null;
    if (Array.isArray(doc)) return doc.map(d => this.wrapDoc(d));
    
    return {
      ...doc,
      toJSON: function() { return this; },
      toObject: function() { return this; }
    };
  }

  find(query = {}) {
    const self = this;
    const chain = {
      _query: query,
      _sort: null,
      _limit: null,
      sort: (options) => {
        chain._sort = options;
        return chain;
      },
      select: () => chain,
      limit: (n) => {
        chain._limit = n;
        return chain;
      },
      then: async (resolve, reject) => {
        try {
          await self.syncFromPostgres();
          
          let results = [...self.data];
          const adminId = getAdminId();
          if (adminId) {
            // Se for a coleção de Filial e o tenant ainda não tiver filiais, cria as padrão para ele
            if (self.name === 'Filial' && !results.some(item => item.adminId === adminId)) {
              const tenantFiliais = [
                { id: 'f1_' + adminId, _id: 'f1_' + adminId, nome: 'Bancada Brasília', cidade: 'Brasília', estado: 'DF', endereco: 'SCS Quadra 4, Bloco A, Centro', telefone: '(61) 98765-4321', responsavel: 'Carlos Silva', status: 'ativo', adminId: adminId },
                { id: 'f2_' + adminId, _id: 'f2_' + adminId, nome: 'Bancada Goiania', cidade: 'Goiânia', estado: 'GO', endereco: 'Av. T-9, 1200, Setor Bueno', telefone: '(62) 98765-4322', responsavel: 'João Santos', status: 'ativo', adminId: adminId },
                { id: 'f3_' + adminId, _id: 'f3_' + adminId, nome: 'Bancada Palmas', cidade: 'Palmas', estado: 'TO', endereco: 'Av. JK, 150, Centro', telefone: '(63) 98765-4323', responsavel: 'José Oliveira', status: 'ativo', adminId: adminId },
                { id: 'f4_' + adminId, _id: 'f4_' + adminId, nome: 'Bancada Campo Grande', cidade: 'Campo Grande', estado: 'MS', endereco: 'Rua 14 de Julho, 2500, Centro', telefone: '(67) 98765-4324', responsavel: 'Marcos Alves', status: 'ativo', adminId: adminId }
              ];
              self.data.push(...tenantFiliais);
              self.save();
              results = [...self.data];
            }
            results = results.filter(item => item.adminId === adminId);
          }
          
          // Simple query support
          for (const key in chain._query) {
            const val = chain._query[key];
            if (val instanceof RegExp) {
              results = results.filter(item => val.test(item[key]));
            } else if (typeof val === 'object' && val !== null) {
              if (val.$gte) results = results.filter(item => item[key] >= val.$gte);
              if (val.$lte) results = results.filter(item => item[key] <= val.$lte);
              if (val.$in) results = results.filter(item => val.$in.includes(item[key]));
            } else {
              results = results.filter(item => {
                const itemVal = String(item[key] || '').trim().toLowerCase();
                const targetVal = String(val || '').trim().toLowerCase();
                return itemVal === targetVal;
              });
            }
          }
          
          if (chain._sort) {
            const key = Object.keys(chain._sort)[0];
            const dir = chain._sort[key];
            results.sort((a, b) => {
              if (a[key] < b[key]) return -dir;
              if (a[key] > b[key]) return dir;
              return 0;
            });
          }
          
          if (chain._limit !== null) {
            results = results.slice(0, chain._limit);
          }
          
          if (resolve) resolve(self.wrapDoc(results));
          return self.wrapDoc(results);
        } catch (err) {
          if (reject) reject(err);
          else throw err;
        }
      },
      catch: (reject) => {
        // Compatibility error catcher
      }
    };

    return chain;
  }

  async findOne(query = {}) {
    const res = await this.find(query);
    return res[0] || null;
  }

  async findById(id) {
    await this.syncFromPostgres();
    const adminId = getAdminId();
    const doc = this.data.find(item => {
      const isIdMatch = item.id === id || item._id === id;
      if (!isIdMatch) return false;
      if (adminId && item.adminId !== adminId) return false;
      return true;
    });
    return this.wrapDoc(doc);
  }

  async create(doc) {
    await this.syncFromPostgres();
    const newDoc = { ...doc };
    if (!newDoc.id && !newDoc._id) newDoc.id = generateId();
    if (!newDoc._id) newDoc._id = newDoc.id;
    
    const adminId = getAdminId();
    if (adminId) {
      newDoc.adminId = adminId;
    }
    
    this.data.push(newDoc);
    this.save();
    
    return this.wrapDoc(newDoc);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    await this.syncFromPostgres();
    const adminId = getAdminId();
    const index = this.data.findIndex(item => {
      const isIdMatch = item.id === id || item._id === id;
      if (!isIdMatch) return false;
      if (adminId && item.adminId !== adminId) return false;
      return true;
    });
    if (index === -1) return null;
    
    const updatedDoc = { ...this.data[index], ...update };
    if (adminId) {
      updatedDoc.adminId = adminId;
    }
    this.data[index] = updatedDoc;
    this.save();
    
    return this.wrapDoc(this.data[index]);
  }

  async findByIdAndDelete(id) {
    await this.syncFromPostgres();
    const adminId = getAdminId();
    const index = this.data.findIndex(item => {
      const isIdMatch = item.id === id || item._id === id;
      if (!isIdMatch) return false;
      if (adminId && item.adminId !== adminId) return false;
      return true;
    });
    if (index === -1) return null;
    
    const removed = this.data.splice(index, 1)[0];
    this.save();
    
    return this.wrapDoc(removed);
  }

  async deleteMany(query = {}) {
    await this.syncFromPostgres();
    const adminId = getAdminId();
    if (Object.keys(query).length === 0) {
      if (adminId) {
        this.data = this.data.filter(item => item.adminId !== adminId);
      } else {
        this.data = [];
      }
      this.save();
    } else {
      this.data = this.data.filter(item => {
        if (adminId && item.adminId !== adminId) return true;
        for (const key in query) {
          if (item[key] === query[key]) return false;
        }
        return true;
      });
      this.save();
    }
  }

  async countDocuments(query = {}) {
    const res = await this.find(query);
    return res.length;
  }

  async insertMany(docs) {
    await this.syncFromPostgres();
    const adminId = getAdminId();
    docs.forEach(doc => {
      if (!doc.id && !doc._id) doc.id = generateId();
      if (!doc._id) doc._id = doc.id;
      if (adminId) {
        doc.adminId = adminId;
      }
      this.data.push(doc);
    });
    this.save();
  }

  // To support 'new Model(data)' syntax
  modelProxy(docData) {
    const parent = this;
    const doc = { ...docData };
    if (!doc.id && !doc._id) doc.id = generateId();
    if (!doc._id) doc._id = doc.id;

    return {
      ...doc,
      save: async function() {
        await parent.syncFromPostgres();
        const adminId = getAdminId();
        if (adminId) {
          this.adminId = adminId;
        }
        const index = parent.data.findIndex(item => {
          const isIdMatch = item.id === doc.id || item._id === doc.id;
          if (!isIdMatch) return false;
          if (adminId && item.adminId !== adminId) return false;
          return true;
        });
        if (index === -1) {
          parent.data.push(this);
        } else {
          parent.data[index] = { ...this };
        }
        parent.save();
        return this;
      },
      toObject: function() {
        const obj = { ...this };
        delete obj.save;
        delete obj.toObject;
        return obj;
      }
    };
  }
}

// Wrap classes to support constructor
function createProxy(dbInstance) {
  const proxy = function(data) { return dbInstance.modelProxy(data); };
  
  // Attach methods
  const methods = [
    'find', 'findOne', 'findById', 'create', 
    'findByIdAndUpdate', 'findByIdAndDelete', 
    'deleteMany', 'countDocuments', 'insertMany'
  ];
  
  methods.forEach(m => {
    proxy[m] = dbInstance[m].bind(dbInstance);
  });
  
  return proxy;
}

module.exports = {
  Padeiro: createProxy(new JsonCollection('Padeiro', 'padeiros.db')),
  Produto: createProxy(new JsonCollection('Produto', 'produtos.db')),
  Cliente: createProxy(new JsonCollection('Cliente', 'clientes.db')),
  Colaborador: createProxy(new JsonCollection('Colaborador', 'colaboradores.db')),
  Admin: createProxy(new JsonCollection('Admin', 'admin.db')),
  Meta: createProxy(new JsonCollection('Meta', 'metas.db')),
  Atividade: createProxy(new JsonCollection('Atividade', 'atividades.db')),
  Avaliacao: createProxy(new JsonCollection('Avaliacao', 'avaliacoes.db')),
  Cronograma: createProxy(new JsonCollection('Cronograma', 'cronograma.db')),
  Criterio: createProxy(new JsonCollection('Criterio', 'criterios.db')),
  Localizacao: createProxy(new JsonCollection('Localizacao', 'localizacoes.db')),
  HistoricoLocalizacao: createProxy(new JsonCollection('HistoricoLocalizacao', 'historico_localizacoes.db')),
  CronogramaTemplate: createProxy(new JsonCollection('CronogramaTemplate', 'cronograma_templates.db')),
  TimelineEvent: createProxy(new JsonCollection('TimelineEvent', 'timeline_events.db')),
  PushSubscription: createProxy(new JsonCollection('PushSubscription', 'push_subscriptions.db')),
  Orcamento: createProxy(new JsonCollection('Orcamento', 'orcamentos.db')),
  Contrato: createProxy(new JsonCollection('Contrato', 'contratos.db')),
  FornecedorProduto: createProxy(new JsonCollection('FornecedorProduto', 'fornecedores_produtos.db'))
};
