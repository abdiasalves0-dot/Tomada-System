const { Contrato } = require('../data/db-adapter');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');
const { ZAPSIGN_TOKEN, ZAPSIGN_SANDBOX } = require('../config');
const googleDriveService = require('../data/googleDriveService');
const driveMappings = require('../data/driveMappings');
const contratoAutonomoTemplate = require('./contrato_autonomo.template');

const uploadsBaseDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');

// Helper para fazer requisições POST para a ZapSign sem dependências externas
function zapsignPost(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const urlObj = url.parse(endpoint);
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZAPSIGN_TOKEN}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.detail || parsed.message || parsed.error || `Erro HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Erro HTTP ${res.statusCode}: Resposta não é JSON`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.write(postData);
    req.end();
  });
}

// Helper para baixar arquivos com suporte a redirecionamento (Redirects)
function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    function get(requestUrl) {
      https.get(requestUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          // Segue o redirecionamento
          get(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Falha ao obter arquivo de '${requestUrl}' (Status Code: ${response.statusCode})`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(destPath);
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }
    
    get(fileUrl);
  });
}

exports.listContratos = async (req, res) => {
  try {
    const contratos = await Contrato.find();
    // Ordenar por data de criação decrescente
    const result = contratos
      .map(c => c.toObject ? c.toObject() : c)
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
      
    res.json(result);
  } catch (error) {
    console.error('Erro ao listar contratos:', error);
    res.status(500).json({ error: 'Erro interno ao listar contratos' });
  }
};

exports.createContrato = async (req, res) => {
  try {
    const {
      orcamentoId,
      orcamentoCodigo,
      clienteNome,
      clienteId,
      clienteEmail,
      responsavelNome,
      responsavelEmail,
      projeto,
      valor,
      prazo,
      dadosAdicionais,
      base64Pdf
    } = req.body;

    if (!base64Pdf) {
      return res.status(400).json({ error: 'PDF em base64 não fornecido.' });
    }

    // 1. Gerar código sequencial do contrato (CTR-YYYY-XXX)
    const year = new Date().getFullYear();
    const prefix = `CTR-${year}-`;
    const contratos = await Contrato.find();
    let maxNum = 0;
    contratos.forEach(c => {
      if (c.codigo && c.codigo.startsWith(prefix)) {
        const numPart = c.codigo.replace(prefix, '');
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNumStr = String(maxNum + 1).padStart(3, '0');
    const codigo = `${prefix}${nextNumStr}`;

    console.log(`[CONTRATOS] Iniciando envio para ZapSign do contrato ${codigo}`);

    // 2. Montar signatários
    const signers = [
      {
        name: clienteNome,
        email: clienteEmail || 'cliente@tomadamarcenaria.com',
        auth_mode: 'assinaturaTela'
      },
      {
        name: responsavelNome,
        email: responsavelEmail || 'marcenaria@bancadamarcenaria.com',
        auth_mode: 'assinaturaTela'
      }
    ];

    // 3. Payload para ZapSign
    const payload = {
      sandbox: ZAPSIGN_SANDBOX,
      name: `Contrato de Prestação de Serviços - ${codigo}`,
      base64_pdf: base64Pdf,
      signers,
      send_automatic_email: false
    };

    // 4. Enviar para a API do ZapSign
    let zapsignResponse;
    try {
      zapsignResponse = await zapsignPost('https://api.zapsign.com.br/api/v1/docs/', payload);
    } catch (apiError) {
      console.error('❌ Erro ao enviar contrato para ZapSign:', apiError.message);
      return res.status(502).json({ error: 'Erro de comunicação com a ZapSign', details: apiError.message });
    }

    // 5. Salvar o PDF unsigned localmente
    const dir = path.join(uploadsBaseDir, 'contratos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const fname = `${codigo}.pdf`;
    const localPath = path.join(dir, fname);
    fs.writeFileSync(localPath, base64Pdf, 'base64');

    // 6. Subir o PDF unsigned para o Google Drive em background
    if (googleDriveService.isEnabled()) {
      setTimeout(async () => {
        try {
          console.log(`[CONTRATO BG] Iniciando upload do contrato ${fname} para o Google Drive...`);
          const result = await googleDriveService.uploadLocalFile(localPath, fname, 'application/pdf', 'contratos');
          if (result && result.isDrive && result.fileId) {
            driveMappings.saveMapping(fname, result.fileId);
          }
        } catch (driveErr) {
          console.error(`❌ [CONTRATO BG] Erro ao subir contrato unsigned pro Google Drive:`, driveErr.message);
        }
      }, 100);
    }

    // 7. Criar registro do contrato no banco local
    const novoContrato = await Contrato.create({
      codigo,
      orcamentoId,
      orcamentoCodigo,
      clienteNome,
      clienteId,
      clienteEmail,
      responsavelNome,
      responsavelEmail,
      projeto,
      valor: parseFloat(valor) || 0,
      prazo,
      dadosAdicionais,
      zapsignDocUuid: zapsignResponse.uuid || zapsignResponse.token,
      signers: zapsignResponse.signers.map(s => ({
        uuid: s.uuid || s.token,
        name: s.name,
        email: s.email,
        sign_url: s.sign_url || s.signing_link,
        status: 'pending'
      })),
      status: 'Enviado para assinatura',
      pdfPath: `/storage/contratos/${fname}`,
      criadoEm: new Date().toISOString()
    });

    console.log(`✅ Contrato ${codigo} criado com sucesso e associado ao orçamento ${orcamentoCodigo}`);
    res.status(201).json(novoContrato);
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    res.status(500).json({ error: 'Erro interno ao criar contrato', details: error.message });
  }
};

exports.cancelContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const contrato = await Contrato.findById(id);
    if (!contrato) return res.status(404).json({ error: 'Contrato não encontrado' });

    contrato.status = 'Cancelado';
    const updated = await Contrato.findByIdAndUpdate(id, contrato);
    
    res.json(updated);
  } catch (error) {
    console.error('Erro ao cancelar contrato:', error);
    res.status(500).json({ error: 'Erro ao cancelar contrato' });
  }
};

exports.webhookContrato = async (req, res) => {
  try {
    const { event, document, signer } = req.body;
    console.log(`[ZAPSIGN WEBHOOK] Evento recebido: ${event || 'sem_evento'}. Doc UUID: ${document ? (document.uuid || document.token) : 'sem_uuid'}`);

    if (!document || (!document.uuid && !document.token)) {
      return res.status(400).json({ error: 'Payload de webhook inválido' });
    }

    // Buscar contrato pelo UUID/token do ZapSign
    const contrato = await Contrato.findOne({ zapsignDocUuid: document.uuid || document.token });
    if (!contrato) {
      console.warn(`[ZAPSIGN WEBHOOK] Contrato com UUID ${document.uuid} não encontrado no sistema.`);
      return res.status(404).json({ error: 'Contrato correspondente não encontrado' });
    }

    // 1. Atualizar o status do signatário que assinou
    if (signer && contrato.signers) {
      contrato.signers = contrato.signers.map(s => {
        const incomingSignerId = signer.uuid || signer.token;
        if (s.uuid === incomingSignerId) {
          s.status = 'signed';
        }
        return s;
      });
    }

    // 2. Atualizar o status geral do contrato
    if (document.status === 'signed') {
      contrato.status = 'Assinado por ambas';
      contrato.dataAssinatura = new Date().toISOString();
      console.log(`[ZAPSIGN WEBHOOK] Contrato ${contrato.codigo} assinado por ambas as partes!`);
    } else if (document.status === 'refused') {
      contrato.status = 'Cancelado'; // ou Recusado
      console.log(`[ZAPSIGN WEBHOOK] Contrato ${contrato.codigo} recusado.`);
    } else {
      contrato.status = 'Assinado por uma parte';
      console.log(`[ZAPSIGN WEBHOOK] Contrato ${contrato.codigo} assinado por uma parte.`);
    }

    // 3. Se houver o arquivo assinado disponível, fazer download e substituir localmente
    if (document.signed_file) {
      const dir = path.join(uploadsBaseDir, 'contratos');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const fname = `${contrato.codigo}-signed.pdf`;
      const localPath = path.join(dir, fname);

      console.log(`[ZAPSIGN WEBHOOK] Iniciando download do PDF assinado de ${document.signed_file}`);
      try {
        await downloadFile(document.signed_file, localPath);
        contrato.pdfPath = `/storage/contratos/${fname}`;
        console.log(`[ZAPSIGN WEBHOOK] PDF assinado salvo com sucesso: ${contrato.pdfPath}`);

        // Subir PDF assinado para o Google Drive em background
        if (googleDriveService.isEnabled()) {
          setTimeout(async () => {
            try {
              console.log(`[ZAPSIGN WEBHOOK BG] Enviando PDF assinado ${fname} para o Google Drive...`);
              const result = await googleDriveService.uploadLocalFile(localPath, fname, 'application/pdf', 'contratos');
              if (result && result.isDrive && result.fileId) {
                driveMappings.saveMapping(fname, result.fileId);
              }
            } catch (driveErr) {
              console.error(`❌ [ZAPSIGN WEBHOOK BG] Erro no upload do PDF assinado para o Drive:`, driveErr.message);
            }
          }, 100);
        }
      } catch (err) {
        console.error(`❌ [ZAPSIGN WEBHOOK] Falha ao baixar PDF assinado da ZapSign:`, err.message);
      }
    }

    // Salvar atualizações no banco local
    await Contrato.findByIdAndUpdate(contrato.id, contrato);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook da ZapSign:', error);
    res.status(500).json({ error: 'Erro interno ao processar webhook' });
  }
};

exports.colaboradorTemplate = async (req, res) => {
  try {
    res.send(contratoAutonomoTemplate);
  } catch (error) {
    console.error('Erro ao retornar template:', error);
    res.status(500).json({ error: 'Erro ao carregar o template de contrato' });
  }
};

exports.createColaboradorContrato = async (req, res) => {
  try {
    const {
      padeiroId,
      nome,
      cpf,
      email,
      telefone,
      tipoServico,
      formaPagamento,
      valor,
      dataInicio,
      vigencia,
      base64Pdf
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail do prestador é obrigatório para envio via ZapSign.' });
    }
    if (!base64Pdf) {
      return res.status(400).json({ error: 'PDF em base64 não fornecido.' });
    }

    // 1. Gerar código sequencial do contrato (CTR-COL-YYYY-XXX)
    const year = new Date().getFullYear();
    const prefix = `CTR-COL-${year}-`;
    const contratos = await Contrato.find();
    let maxNum = 0;
    contratos.forEach(c => {
      if (c.codigo && c.codigo.startsWith(prefix)) {
        const numPart = c.codigo.replace(prefix, '');
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNumStr = String(maxNum + 1).padStart(3, '0');
    const codigo = `${prefix}${nextNumStr}`;

    console.log(`[CONTRATOS COLABORADOR] Iniciando envio para ZapSign do contrato ${codigo}`);

    // 2. Montar signatários (Colaborador e Marceneiro Responsável/Gestor)
    const signer1 = {
      name: nome,
      email: email,
      auth_mode: 'assinaturaTela'
    };
    if (telefone) {
      signer1.phone_number = telefone;
    }

    const signer2 = {
      name: req.user.nome || 'Tomada Móveis Planejados',
      email: req.user.email || 'administrativo@tomadamarcenaria.com.br',
      auth_mode: 'assinaturaTela'
    };

    const signers = [signer1, signer2];

    // 3. Payload para ZapSign
    const payload = {
      sandbox: ZAPSIGN_SANDBOX,
      name: `Contrato de Prestação de Serviços Autônomos - ${nome} - ${codigo}`,
      base64_pdf: base64Pdf,
      signers,
      send_automatic_email: true // Envia convite por e-mail automaticamente
    };

    // 4. Enviar para a API do ZapSign
    let zapsignResponse;
    try {
      zapsignResponse = await zapsignPost('https://api.zapsign.com.br/api/v1/docs/', payload);
    } catch (apiError) {
      console.error('❌ Erro ao enviar contrato para ZapSign:', apiError.message);
      return res.status(502).json({ error: 'Erro de comunicação com a ZapSign', details: apiError.message });
    }

    // 5. Salvar o PDF unsigned localmente
    const dir = path.join(uploadsBaseDir, 'contratos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const fname = `${codigo}.pdf`;
    const localPath = path.join(dir, fname);
    fs.writeFileSync(localPath, base64Pdf, 'base64');

    // 6. Subir o PDF unsigned para o Google Drive em background
    if (googleDriveService.isEnabled()) {
      setTimeout(async () => {
        try {
          console.log(`[CONTRATO COL BG] Iniciando upload do contrato ${fname} para o Google Drive...`);
          const result = await googleDriveService.uploadLocalFile(localPath, fname, 'application/pdf', 'contratos');
          if (result && result.isDrive && result.fileId) {
            driveMappings.saveMapping(fname, result.fileId);
          }
        } catch (driveErr) {
          console.error(`❌ [CONTRATO COL BG] Erro no upload pro Google Drive:`, driveErr.message);
        }
      }, 100);
    }

    // 7. Criar registro do contrato no banco local
    const novoContrato = await Contrato.create({
      codigo,
      tipo: 'colaborador',
      padeiroId,
      padeiroNome: nome,
      padeiroCpf: cpf,
      padeiroEmail: email,
      padeiroTelefone: telefone,
      tipoServico,
      formaPagamento,
      valor: parseFloat(valor) || 0,
      dataInicio,
      vigencia,
      zapsignDocUuid: zapsignResponse.uuid || zapsignResponse.token,
      signers: zapsignResponse.signers.map(s => ({
        uuid: s.uuid || s.token,
        name: s.name,
        email: s.email,
        sign_url: s.sign_url || s.signing_link,
        status: 'pending'
      })),
      status: 'Enviado para assinatura',
      pdfPath: `/storage/contratos/${fname}`,
      criadoEm: new Date().toISOString()
    });

    console.log(`✅ Contrato de colaborador ${codigo} criado com sucesso e associado ao funcionário ${nome}`);
    res.status(201).json(novoContrato);
  } catch (error) {
    console.error('Erro ao criar contrato de colaborador:', error);
    res.status(500).json({ error: 'Erro interno ao criar contrato de colaborador', details: error.message });
  }
};

exports.resendReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const contrato = await Contrato.findById(id);
    if (!contrato) return res.status(404).json({ error: 'Contrato não encontrado' });
    if (!contrato.zapsignDocUuid) return res.status(400).json({ error: 'Contrato não possui UUID associado' });

    console.log(`[CONTRATOS] Reenviando lembrete de assinatura para documento ${contrato.zapsignDocUuid}`);
    
    const endpoint = `https://api.zapsign.com.br/api/v1/docs/${contrato.zapsignDocUuid}/reminder/`;
    await zapsignPost(endpoint, {});
    
    res.json({ success: true, message: 'Lembrete reenviado com sucesso.' });
  } catch (error) {
    console.error('Erro ao reenviar lembrete:', error);
    res.status(500).json({ error: 'Erro ao reenviar lembrete de assinatura', details: error.message });
  }
};
