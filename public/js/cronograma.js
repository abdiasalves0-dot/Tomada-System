/**
 * ARQUIVO: cronograma.js (Módulo Principal)
 * CATEGORIA: Cronograma › Estado inicial
 * RESPONSABILIDADE: Define o estado e as constantes do módulo
 * DEPENDE DE: nada
 * USADO EM: todos os outros arquivos do cronograma
 */

const Cronograma = {
  currentView: 'semanal',
  currentMobileView: 'dia',
  selectedMobileDate: new Date(),
  navDirection: 0,
  weekOffset: 0,
  tarefas: [],
  padeiros: [],
  clientes: [],
  metas: [],
  atividades: [],
  draggedTaskId: null,
  selectedMdAction: 'mover',
  expandedBakers: new Set(),
  diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
  diasKeys: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
  getLocalISO: (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },
  isTaskOnDate: (task, dateStr) => {
    if (!task.data) return false;
    const startStr = task.data;
    let endStr = startStr;
    
    let orc = null;
    if (task.orcamento) {
      if (typeof task.orcamento === 'object') {
        orc = task.orcamento;
      } else if (typeof task.orcamento === 'string') {
        try {
          orc = JSON.parse(task.orcamento);
        } catch(e) {}
      }
    }
    
    if (orc && orc.prazoDias && orc.prazoDias > 1) {
      const parts = startStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        const startDate = new Date(year, month, day);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (orc.prazoDias - 1));
        
        const y = endDate.getFullYear();
        const m = String(endDate.getMonth() + 1).padStart(2, '0');
        const d = String(endDate.getDate()).padStart(2, '0');
        endStr = `${y}-${m}-${d}`;
      }
    }
    
    return dateStr >= startStr && dateStr <= endStr;
  }
};
