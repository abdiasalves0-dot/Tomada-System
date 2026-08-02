// Tomada - Lógica do Dashboard do Criador

const API_BASE = '/api/criador';
let token = localStorage.getItem('tomada_creator_token');
let user = null;

try {
  const savedUser = localStorage.getItem('tomada_creator_user');
  if (savedUser) {
    user = JSON.parse(savedUser);
  }
} catch (e) {
  console.error('Erro ao ler dados do usuário:', e);
}

// Verificar se usuário está logado
if (!token || !user) {
  // Redireciona para login se não estiver logado
  window.location.href = '/';
} else {
  // Inicializa a interface
  if (document.getElementById('creator-name')) document.getElementById('creator-name').textContent = user.nome;
  if (document.getElementById('profile-name')) document.getElementById('profile-name').textContent = user.nome;
  if (document.getElementById('profile-email')) document.getElementById('profile-email').textContent = user.email || 'canal@youtube.com';
  if (document.getElementById('creator-avatar')) document.getElementById('creator-avatar').textContent = user.nome.charAt(0).toUpperCase();
  
  // Carrega os dados
  carregarProjetos();
  carregarProfissionais();
}

// Listar Projetos do Criador
async function carregarProjetos() {
  try {
    const res = await fetch(`${API_BASE}/projetos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar projetos');

    const projetos = await res.json();
    const container = document.getElementById('project-list-container');
    
    if (projetos.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
          <i data-lucide="folder-open" style="width: 48px; height: 48px; stroke-width: 1.5; margin-bottom: 8px;"></i>
          <p>Nenhum projeto cadastrado.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    container.innerHTML = projetos.map(p => {
      const dataLimite = p.dataLimite ? new Date(p.dataLimite).toLocaleDateString('pt-BR') : 'Sem prazo';
      return `
        <div class="project-item">
          <div class="project-info">
            <h4>${p.titulo}</h4>
            <p>${p.descricao || 'Sem briefing'}</p>
            <div style="display: flex; gap: 8px; margin-top: 8px; align-items: center; font-size: 12px; color: var(--text-secondary);">
              <span>Tipo: <strong>${p.tipo}</strong></span>
              <span>•</span>
              <span>Prazo: <strong>${dataLimite}</strong></span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <span class="badge badge-${p.status === 'em_producao' ? 'producao' : p.status}">${p.status.replace('_', ' ')}</span>
            <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="deletarProjeto('${p.id}')">Excluir</button>
          </div>
        </div>
      `;
    }).join('');
    
    lucide.createIcons();
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
  }
}

// Listar Editores e Thumbmakers
async function carregarProfissionais() {
  try {
    const res = await fetch(`${API_BASE}/profissionais`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar profissionais');

    const profissionais = await res.json();
    const container = document.getElementById('prof-list-container');
    
    if (profissionais.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Nenhum profissional disponível.</p>';
      return;
    }

    container.innerHTML = profissionais.map(p => `
      <div class="professional-item">
        <div class="avatar" style="width: 32px; height: 32px; font-size: 12px; background: #6366F1;">
          ${p.nome.charAt(0).toUpperCase()}
        </div>
        <div class="prof-info" style="flex: 1;">
          <h5>${p.nome}</h5>
          <p>${p.cargo}</p>
        </div>
        <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="convidarProfissional('${p.id}')">Convidar</button>
      </div>
    `).join('');
    
    lucide.createIcons();
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error);
  }
}

// Criar Projeto
async function handleCreateProject(event) {
  event.preventDefault();
  
  const titulo = document.getElementById('proj-titulo').value;
  const descricao = document.getElementById('proj-descricao').value;
  const tipo = document.getElementById('proj-tipo').value;
  const dataLimite = document.getElementById('proj-data').value;
  
  try {
    const res = await fetch(`${API_BASE}/projetos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ titulo, descricao, tipo, dataLimite })
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erro ao criar projeto');
    }
    
    closeModal();
    document.getElementById('project-form').reset();
    carregarProjetos();
  } catch (error) {
    alert(error.message);
  }
}

// Deletar Projeto
async function deletarProjeto(id) {
  if (!confirm('Deseja realmente deletar este projeto?')) return;
  
  try {
    const res = await fetch(`${API_BASE}/projetos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) throw new Error('Erro ao deletar projeto');
    carregarProjetos();
  } catch (error) {
    alert(error.message);
  }
}

// Convidar/Vincular Profissional
async function convidarProfissional(profissionalId) {
  // Lista projetos abertos do criador
  try {
    const resProjetos = await fetch(`${API_BASE}/projetos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const projetos = await resProjetos.json();
    const abertos = projetos.filter(p => p.status === 'aberto');
    
    if (abertos.length === 0) {
      alert('Você precisa ter pelo menos um projeto "Aberto" para convidar um profissional.');
      return;
    }
    
    // Seleciona o primeiro projeto aberto por padrão neste MVP/Demonstração
    const projeto = abertos[0];
    
    if (!confirm(`Deseja convidar este profissional para o projeto "${projeto.titulo}"?`)) return;
    
    const res = await fetch(`${API_BASE}/projetos/${projeto.id}/vincular`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ profissionalId })
    });
    
    if (!res.ok) throw new Error('Erro ao vincular profissional');
    
    alert('Convite enviado e profissional vinculado ao projeto!');
    carregarProjetos();
  } catch (error) {
    alert(error.message);
  }
}

// Modal Helpers
function openModal() {
  document.getElementById('project-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('project-modal').classList.remove('active');
}

// Logout
function logout() {
  localStorage.removeItem('tomada_creator_token');
  localStorage.removeItem('tomada_creator_user');
  window.location.href = '/';
}
