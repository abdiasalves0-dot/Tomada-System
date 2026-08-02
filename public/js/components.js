/**
 * Components - Reusable UI Components
 * Bancada Sistema Padeiro
 */

const Components = {
  // Toast notifications
  toast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    const icons = { success: 'check-circle', error: 'alert-circle', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${message}</span>`;
    container.appendChild(toast);
    this.renderIcons();
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
  },

  // Modal
  showModal(title, contentHtml, footerHtml = '', customClass = '') {
    let overlay = document.getElementById('global-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-modal';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="modal-content ${customClass}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="Components.closeModal()">&times;</button>
        </div>
        <div class="modal-body">${contentHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>`;
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', e => { if (e.target === overlay) Components.closeModal(); });
  },

  closeModal() {
    const overlay = document.getElementById('global-modal');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        // Only remove if it's still inactive (no new modal was opened in the meantime)
        if (overlay && !overlay.classList.contains('active')) {
          overlay.remove();
        }
      }, 300);
    }
  },

  // Apple HIG Style Alert
  showAlert(title, message, btnText = 'OK') {
    let overlay = document.getElementById('ios-alert-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ios-alert-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
      overlay.style.zIndex = '99999999'; // Extremely high z-index to appear over pf-modal-overlay (which has 9999999)
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease';
      document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
      <div style="background: #ffffff; width: 270px; border-radius: 14px; text-align: center; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="ios-alert-box">
        <div style="padding: 20px 16px 16px;">
          <h3 style="margin: 0 0 6px; font-size: 17px; font-weight: 600; color: #000; line-height: 1.2;">${title}</h3>
          <p style="margin: 0; font-size: 13px; font-weight: 400; color: #333; line-height: 1.35;">${message}</p>
        </div>
        <div style="border-top: 1px solid rgba(0,0,0,0.1); display: flex;">
          <button style="flex: 1; padding: 12px; background: none; border: none; font-size: 17px; font-weight: 600; color: #E55A2B; cursor: pointer; user-select: none;" onclick="Components.closeAlert()">${btnText}</button>
        </div>
      </div>
    `;
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      const box = document.getElementById('ios-alert-box');
      if (box) box.style.transform = 'scale(1)';
    });
  },

  closeAlert() {
    const overlay = document.getElementById('ios-alert-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      const box = document.getElementById('ios-alert-box');
      if (box) box.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        // Restore scrolling if no other modals are active
        if (!document.getElementById('global-modal') && !document.querySelector('.pf-modal-ios.active')) {
          document.body.style.overflow = '';
        }
      }, 200);
    }
  },

  showPrompt(title, placeholder, onConfirm) {
    let overlay = document.getElementById('ios-prompt-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ios-prompt-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
      overlay.style.zIndex = '99999999';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease';
      document.body.appendChild(overlay);
    }

    this._promptCallback = onConfirm;

    overlay.innerHTML = `
      <div style="background: #ffffff; width: 270px; border-radius: 14px; text-align: center; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="ios-prompt-box">
        <div style="padding: 20px 16px 16px;">
          <h3 style="margin: 0 0 10px; font-size: 17px; font-weight: 600; color: #000; line-height: 1.2;">${title}</h3>
          <input type="text" id="ios-prompt-input" placeholder="${placeholder}" style="width: 100%; padding: 8px 12px; border: 1px solid rgba(0,0,0,0.15); border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; background: var(--system-bg, #f5f5f7); color: #000;">
        </div>
        <div style="border-top: 1px solid rgba(0,0,0,0.1); display: flex;">
          <button style="flex: 1; padding: 12px; background: none; border: none; font-size: 16px; font-weight: 400; color: #666; cursor: pointer; user-select: none; border-right: 1px solid rgba(0,0,0,0.1);" onclick="Components.closePrompt()">Cancelar</button>
          <button style="flex: 1; padding: 12px; background: none; border: none; font-size: 16px; font-weight: 600; color: #E55A2B; cursor: pointer; user-select: none;" onclick="Components._triggerPrompt()">Confirmar</button>
        </div>
      </div>
    `;

    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      const box = document.getElementById('ios-prompt-box');
      if (box) box.style.transform = 'scale(1)';
      const input = document.getElementById('ios-prompt-input');
      if (input) input.focus();
    });
  },

  closePrompt() {
    const overlay = document.getElementById('ios-prompt-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      const box = document.getElementById('ios-prompt-box');
      if (box) box.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (!document.getElementById('global-modal') && !document.querySelector('.pf-modal-ios.active')) {
          document.body.style.overflow = '';
        }
      }, 200);
    }
  },

  _triggerPrompt() {
    const input = document.getElementById('ios-prompt-input');
    const val = input ? input.value.trim() : '';
    if (this._promptCallback) {
      this._promptCallback(val);
      this._promptCallback = null;
    }
    this.closePrompt();
  },

  // Confirm dialog
  confirm(message, onConfirm) {
    this._confirmCallback = onConfirm;
    this.showModal('Confirmação', `<p style="margin-bottom:8px">${message}</p>`,
      `<button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="Components.closeModal(); Components._triggerConfirm()">Confirmar</button>`
    );
  },

  _triggerConfirm() {
    if (this._confirmCallback) {
      this._confirmCallback();
      this._confirmCallback = null;
    }
  },

  // Loading
  loading() {
    return '<div class="loading-screen"><div class="loader"></div></div>';
  },

  // Empty state
  empty(icon, text) {
    return `<div class="empty-state" style="text-align:center;padding:48px;color:var(--text-tertiary);">
      <div class="empty-icon" style="font-size:48px;margin-bottom:16px;"><i data-lucide="${icon}" size="48"></i></div>
      <p>${text}</p>
    </div>`;
  },

  // Star rating (interactive)
  starRating(currentValue = 0, name = 'rating') {
    let html = `<div class="stars" data-name="${name}" data-value="${currentValue}" style="display: flex; gap: 4px; cursor: pointer;">`;
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= currentValue;
      html += `<i data-lucide="star" class="star ${isFilled ? 'filled' : ''}" data-value="${i}" onclick="Components.setStarRating(this)" style="fill: ${isFilled ? 'currentColor' : 'none'};"></i>`;
    }
    html += '</div>';
    return html;
  },

  setStarRating(starEl) {
    const val = parseInt(starEl.dataset.value);
    const container = starEl.parentElement;
    container.dataset.value = val;
    container.querySelectorAll('.star').forEach(s => {
      const v = parseInt(s.dataset.value);
      const isFilled = v <= val;
      s.classList.toggle('filled', isFilled);
      s.style.fill = isFilled ? 'currentColor' : 'none';
    });
  },

  // Star rating (display only)
  starsDisplay(value) {
    let html = '<div class="stars stars-display" style="display: flex; gap: 2px;">';
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= value;
      html += `<i data-lucide="star" size="14" style="fill: ${isFilled ? 'currentColor' : 'none'}; color: ${isFilled ? '#E55A2B' : 'var(--text-tertiary)'};"></i>`;
    }
    html += '</div>';
    return html;
  },

  // Progress bar
  progressBar(value, max, colorClass = '') {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return `<div class="progress-bar"><div class="progress-fill ${colorClass}" style="width:${pct}%"></div></div>`;
  },

  // Badge
  badge(text, type = 'amber') {
    return `<span class="badge badge-${type}">${text}</span>`;
  },

  // Avatar
  avatar(name, size = '') {
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `<div class="avatar-sm ${size}">${initials}</div>`;
  },

  // Search bar
  searchBar(placeholder, onInput) {
    const id = 'search-' + Math.random().toString(36).substr(2, 6);
    return `<div class="search-bar"><i data-lucide="search"></i><input id="${id}" type="text" placeholder="${placeholder}" oninput="(${onInput.toString()})(this.value)"></div>`;
  },

  // Pagination helper
  paginate(items, page, perPage) {
    const total = Math.ceil(items.length / perPage);
    const start = (page - 1) * perPage;
    return { data: items.slice(start, start + perPage), total, page, perPage, totalItems: items.length };
  },
  
  // Re-render Lucide icons (Otimizado: apenas na sub-árvore relevante para evitar travamentos de layout)
  renderIcons(targetNode) {
    if (window.lucide && window.lucide.createIcons) {
      const root = targetNode || document.body;
      window.lucide.createIcons({
        root: root,
        attrs: {
          'stroke-width': 1.75
        }
      });
    }
  },

  // Create ripple effect
  createRipple(event, element) {
    const rect = element.getBoundingClientRect();
    const circle = document.createElement("span");
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const ripple = element.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    element.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }
};

// --- Offline & Sync Manager (IndexedDB) ---
const OfflineManager = {
  dbName: 'BancadaPadeiroDB',
  dbVersion: 2, // Incremented version for new stores
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('pendingRequests')) {
          db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('dataCache')) {
          db.createObjectStore('dataCache', { keyPath: 'url' });
        }
        if (!db.objectStoreNames.contains('pendingUploads')) {
          db.createObjectStore('pendingUploads', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('[Offline] IndexedDB inicializado');
        this.startSyncCheck();
        resolve();
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },

  // Cache para requisições GET
  async cacheData(url, data) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['dataCache'], 'readwrite');
      const store = transaction.objectStore('dataCache');
      const request = store.put({ url, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  },

  async getCachedData(url) {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['dataCache'], 'readonly');
      const store = transaction.objectStore('dataCache');
      const request = store.get(url);
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = () => resolve(null);
    });
  },

  async saveRequest(url, method, body) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingRequests'], 'readwrite');
      const store = transaction.objectStore('pendingRequests');
      const request = store.add({ url, method, body, timestamp: Date.now() });
      request.onsuccess = () => {
        Components.toast('Modo Offline: Alteração salva localmente!', 'info');
        resolve();
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },

  // Suporte para Upload de Arquivos Offline
  async saveUpload(url, files, type) {
    if (!this.db) await this.init();
    // Convert files to Array of objects with Blobs
    const fileData = await Promise.all(Array.from(files).map(async f => ({
      name: f.name,
      type: f.type,
      blob: f
    })));

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
      const store = transaction.objectStore('pendingUploads');
      const request = store.add({ url, fileData, type, timestamp: Date.now() });
      request.onsuccess = () => {
        Components.toast('Modo Offline: Arquivos salvos para envio posterior!', 'info');
        resolve({ offline: true, files: fileData.map(f => ({ name: f.name, offline: true })) });
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },

  async getPendingRequests() {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['pendingRequests'], 'readonly');
      const store = transaction.objectStore('pendingRequests');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getPendingUploads() {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db.transaction(['pendingUploads'], 'readonly');
      const store = transaction.objectStore('pendingUploads');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  },

  async deleteRequest(id) {
    const transaction = this.db.transaction(['pendingRequests'], 'readwrite');
    const store = transaction.objectStore('pendingRequests');
    store.delete(id);
  },

  async deleteUpload(id) {
    const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
    const store = transaction.objectStore('pendingUploads');
    store.delete(id);
  },

  startSyncCheck() {
    window.addEventListener('online', () => {
      Components.toast('Conexão restabelecida! Sincronizando dados...', 'success');
      this.syncPending();
    });
    // Check periodically anyway (every 5 minutes)
    setInterval(() => {
      if (navigator.onLine) this.syncPending();
    }, 300000);
  },

  async syncPending() {
    // Passo 1: Sincronizar Uploads PRIMEIRO
    const uploads = await this.getPendingUploads();
    const uploadedPaths = {}; // Mapa para guardar filename -> real path
    
    for (const up of uploads) {
      try {
        const files = up.fileData.map(f => new File([f.blob], f.name, { type: f.type }));
        const result = await API.uploadFiles(files, up.type, true);
        if (result && result.files) {
          result.files.forEach(f => {
            // Usa o filename original ou ajustado para mapear
            uploadedPaths[f.filename] = f;
            uploadedPaths[f.filename.replace(/^compress_/, '')] = f; // caso tenha mudado
          });
        }
        await this.deleteUpload(up.id);
      } catch (err) {
        console.error(`[Offline] Falha ao sincronizar upload ${up.id}:`, err);
      }
    }

    // Passo 2: Sincronizar Requisições e Atualizar Placeholders
    const pending = await this.getPendingRequests();
    
    // Tratamento especial para assinaturas (base64) enviadas offline
    // Se houve envio de assinatura, ele foi salvo como pendingRequest também.
    // Vamos processá-los primeiro para pegar os paths.
    const signatureRequests = pending.filter(req => req.url.includes('/api/upload/base64/assinaturas'));
    let lastSignaturePath = null;
    
    for (const req of signatureRequests) {
      try {
        const res = await API.request(req.url, { 
          method: req.method, 
          body: JSON.stringify(req.body),
          isSyncing: true 
        });
        if (res && res.path) lastSignaturePath = res.path;
        await this.deleteRequest(req.id);
      } catch (err) {
        console.error(`[Offline] Falha ao sincronizar assinatura ${req.id}:`, err);
      }
    }

    // Agora processa as requisições normais (ex: atualização da atividade)
    const normalRequests = pending.filter(req => !req.url.includes('/api/upload/base64'));
    
    for (const req of normalRequests) {
      try {
        // Se for requisição com body JSON, injetar os caminhos reais
        if (req.body) {
          // Atualiza fotos
          if (Array.isArray(req.body.fotos)) {
            req.body.fotos = req.body.fotos.map(foto => {
              if (foto.offline || foto.path === 'offline_pending') {
                const realUpload = uploadedPaths[foto.filename] || uploadedPaths[foto.name];
                if (realUpload) {
                  return {
                    filename: realUpload.filename,
                    path: realUpload.path,
                    size: realUpload.size
                  };
                }
              }
              return foto;
            });
          }
          
          // Se a assinatura faltou por estar offline, injeta a última sincronizada
          if (lastSignaturePath && req.body.assinatura === undefined) {
            req.body.assinatura = lastSignaturePath;
          }
        }

        await API.request(req.url, { 
          method: req.method, 
          body: JSON.stringify(req.body),
          isSyncing: true 
        });
        await this.deleteRequest(req.id);
      } catch (err) {
        console.error(`[Offline] Falha ao sincronizar requisição ${req.id}:`, err);
      }
    }

    if (pending.length > 0 || uploads.length > 0) {
      Components.toast('Sincronização concluída!', 'success');
      // Atualiza a tela se não estiver no meio do formulário
      if (typeof App !== 'undefined' && App.currentRoute && App.currentRoute !== 'padeiro-atividade') {
        App.renderPage(App.currentRoute);
      }
    }
  }
};

// API Helper
const API = {
  token: localStorage.getItem('NexusGestor_token'),

  getBaseUrl() {
    const isCapacitor = !!window.Capacitor || 
                        navigator.userAgent.includes('Capacitor') ||
                        window.location.origin.startsWith('capacitor://') || 
                        (window.location.origin.startsWith('http://localhost') && !window.location.port && !window.location.host.includes(':3000'));
    return isCapacitor ? 'https://bancada-kohl.vercel.app' : '';
  },

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('NexusGestor_token', token);
    else localStorage.removeItem('NexusGestor_token');
  },

  getUser() {
    const data = localStorage.getItem('NexusGestor_user');
    return data ? JSON.parse(data) : null;
  },

  setUser(user) {
    if (user) localStorage.setItem('NexusGestor_user', JSON.stringify(user));
    else localStorage.removeItem('NexusGestor_user');
  },

  _memoryCache: new Map(),

  async request(url, options = {}) {
    const method = options.method || 'GET';
    const isGet = method === 'GET';

    // Memória Cache Ultra-Rápida (5s TTL para navegação instantânea entre abas)
    if (isGet && !options.bypassCache) {
      const cached = this._memoryCache.get(url);
      if (cached && (Date.now() - cached.timestamp < 5000)) {
        return cached.data;
      }
    } else if (!isGet) {
      // Limpar cache em mutações para manter os dados atualizados
      this._memoryCache.clear();
    }

    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const timeoutMs = options.timeout || 120000; // 120s timeout para buscas profundas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let fullUrl = url;
    if (url.startsWith('/')) {
      fullUrl = this.getBaseUrl() + url;
    }

    try {
      const res = await fetch(fullUrl, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);
      
      let data = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          console.warn('[API] Falha ao parsear JSON da resposta:', e);
        }
      }

      if (!data) {
        try {
          const text = await res.text();
          if (text.trim().startsWith('<')) {
            data = { error: `Erro no servidor (Status: ${res.status})` };
          } else {
            data = { error: text || `Erro HTTP ${res.status}` };
          }
        } catch (e) {
          data = { error: `Erro HTTP ${res.status}` };
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          console.warn('API returned 401! url: ' + url);
          this.setToken(null);
          this.setUser(null);
          Components.toast('Sessão expirada ou dados inválidos.', 'error');
          App.navigate('login');
        }
        throw new Error(data.error || data.message || data.details || 'Erro na requisição. Verifique seus dados.');
      }

      // Cache successful GET requests in memory & offline storage
      if (isGet) {
        this._memoryCache.set(url, { timestamp: Date.now(), data });
        OfflineManager.cacheData(url, data);
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      // HANDLE OFFLINE
      const isOffline = !navigator.onLine || err.name === 'AbortError' || err.message.includes('Failed to fetch') || err.message.includes('Network error');
      
      if (isOffline) {
        if (isGet) {
          const cached = await OfflineManager.getCachedData(url);
          if (cached) {
            console.warn('[Offline] Retornando dados do cache para:', url);
            return cached;
          }
        } else if (!options.isSyncing) {
          // POST/PUT/PATCH/DELETE
          await OfflineManager.saveRequest(url, method, options.body ? JSON.parse(options.body) : null);
          return { offline: true, message: 'Salvo localmente' };
        }
      }
      throw err;
    }
  },

  get(url, options = {}) { return this.request(url, options); },
  post(url, body) { return this.request(url, { method: 'POST', body: JSON.stringify(body) }); },
  put(url, body) { return this.request(url, { method: 'PUT', body: JSON.stringify(body) }); },
  patch(url, body) { return this.request(url, { method: 'PATCH', body: JSON.stringify(body) }); },
  delete(url) { return this.request(url, { method: 'DELETE' }); },

  async uploadFiles(files, type = 'producao', isSyncing = false) {
    let uploadUrl = `/api/upload/${type}`;
    if (!navigator.onLine && !isSyncing) {
      return OfflineManager.saveUpload(uploadUrl, files, type);
    }

    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for uploads

    const fullUploadUrl = this.getBaseUrl() + uploadUrl;

    try {
      const res = await fetch(fullUploadUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` },
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          this.setToken(null);
          this.setUser(null);
          Components.toast('Sua sessão expirou, faça login novamente.', 'error');
          if (typeof App !== 'undefined') App.navigate('login');
        }
        throw new Error(data.error || 'Erro no upload');
      }
      return data;
    } catch (err) {
      if (!navigator.onLine && !isSyncing) {
        return OfflineManager.saveUpload(uploadUrl, files, type);
      }
      console.error("Upload error:", err);
      throw err;
    }
  },

  async uploadBase64(data, type = 'assinaturas') {
    return this.post(`/api/upload/base64/${type}`, { data });
  }
};

// Listener para atualização do Electron (Obsidian-Style)
if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.onUpdateReady === 'function') {
  window.electronAPI.onUpdateReady((info) => {
    // Evitar criar múltiplos banners de atualização
    if (document.getElementById('electron-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'electron-update-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '24px';
    banner.style.right = '24px';
    banner.style.backgroundColor = '#1C1A14';
    banner.style.color = '#FFFFFF';
    banner.style.padding = '18px 24px';
    banner.style.borderRadius = '16px';
    banner.style.boxShadow = '0 10px 35px rgba(0,0,0,0.35)';
    banner.style.zIndex = '9999999';
    banner.style.display = 'flex';
    banner.style.alignItems = 'center';
    banner.style.gap = '20px';
    banner.style.border = '1px solid #E55A2B';
    banner.style.fontFamily = "'Outfit', 'Plus Jakarta Sans', sans-serif";
    banner.style.fontSize = '14px';
    banner.style.cursor = 'pointer';
    banner.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🚀</span>
        <div style="text-align: left;">
          <strong style="display: block; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px;">Tomada Planner atualizado!</strong>
          <span style="opacity: 0.8; font-size: 12px; color: #EBE5DF;">Clique para reiniciar e aplicar a versão ${info.version || ''}.</span>
        </div>
      </div>
      <button style="background: #E55A2B; color: #FFFFFF; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(229, 90, 43, 0.2);">Instalar</button>
    `;

    banner.addEventListener('click', () => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(() => {
        window.electronAPI.restartAndInstall();
      }, 300);
    });

    document.body.appendChild(banner);
  });
}

