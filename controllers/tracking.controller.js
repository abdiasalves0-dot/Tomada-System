const { HistoricoLocalizacao, Localizacao } = require('../data/db-adapter');
const { clearActiveLocations } = require('../sockets/location.socket');

exports.getTrail = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    if (!userId || !date) {
      return res.status(400).json({ error: 'Parâmetros userId e date são obrigatórios.' });
    }
    
    // Fetch all points for this user
    const allPoints = await HistoricoLocalizacao.find({ userId });
    
    // Filter by date (YYYY-MM-DD in local time)
    // The timestamp is saved as ISO string.
    const filteredPoints = allPoints.filter(p => {
      if (!p.timestamp) return false;
      // Extract YYYY-MM-DD from ISO string or convert to date
      const pDate = p.timestamp.split('T')[0];
      return pDate === date;
    });
    
    // Sort by timestamp
    filteredPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Group into sessions based on time gap (e.g. 15 minutes)
    const sessions = [];
    let currentSession = null;
    const GAP_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
    
    filteredPoints.forEach(p => {
      const ptTime = new Date(p.timestamp).getTime();
      if (!currentSession) {
        currentSession = { points: [p] };
        sessions.push(currentSession);
      } else {
        const lastPt = currentSession.points[currentSession.points.length - 1];
        const lastPtTime = new Date(lastPt.timestamp).getTime();
        if (ptTime - lastPtTime > GAP_LIMIT_MS) {
          currentSession = { points: [p] };
          sessions.push(currentSession);
        } else {
          currentSession.points.push(p);
        }
      }
    });
    
    res.json({ sessions });
  } catch (error) {
    console.error('Erro ao obter trajeto:', error);
    res.status(500).json({ error: 'Erro interno ao obter trajeto.' });
  }
};

exports.deleteTrail = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    if (!userId || !date) {
      return res.status(400).json({ error: 'Parâmetros userId e date são obrigatórios.' });
    }
    
    const allPoints = await HistoricoLocalizacao.find({ userId });
    const pointsToDelete = allPoints.filter(p => p.timestamp && p.timestamp.split('T')[0] === date);
    
    for (const p of pointsToDelete) {
      await HistoricoLocalizacao.findByIdAndDelete(p.id);
    }
    
    res.json({ success: true, message: `Histórico deletado para a data ${date}.` });
  } catch (error) {
    console.error('Erro ao deletar trajeto:', error);
    res.status(500).json({ error: 'Erro interno ao deletar trajeto.' });
  }
};

exports.resetAll = async (req, res) => {
  try {
    await Promise.all([
      HistoricoLocalizacao.deleteMany({}),
      Localizacao.deleteMany({})
    ]);
    clearActiveLocations();
    res.json({ success: true, message: 'Todo o histórico de rastreamento e localizações ativas foram reiniciados.' });
  } catch (error) {
    console.error('Erro ao resetar rastreamento:', error);
    res.status(500).json({ error: 'Erro interno ao resetar rastreamento.' });
  }
};
