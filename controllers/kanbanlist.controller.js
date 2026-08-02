const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    let lists = await prisma.kanbanList.findMany({
      orderBy: { posicao: 'asc' }
    });

    if (lists.length === 0) {
      await prisma.kanbanList.createMany({
        data: [
          { titulo: 'Pendente', posicao: 0, cor: '#E5E7EB' },
          { titulo: 'Em Andamento', posicao: 1, cor: '#F59E0B' },
          { titulo: 'Concluída', posicao: 2, cor: '#10B981' }
        ]
      });
      lists = await prisma.kanbanList.findMany({
        orderBy: { posicao: 'asc' }
      });
    }

    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar listas do Kanban.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { titulo, cor } = req.body;
    
    // Pega a maior posicao
    const maxPos = await prisma.kanbanList.findFirst({
      orderBy: { posicao: 'desc' }
    });
    const posicao = maxPos ? maxPos.posicao + 1 : 0;

    const list = await prisma.kanbanList.create({
      data: { titulo, posicao, cor: cor || '#E5E7EB' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar lista do Kanban.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, cor, posicao } = req.body;
    const list = await prisma.kanbanList.update({
      where: { id },
      data: { titulo, cor, posicao }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar lista do Kanban.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.kanbanList.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar lista do Kanban.' });
  }
};
