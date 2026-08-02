/**
 * Auth Module - Login, First Access, Password Setup
 * Bancada Sistema Padeiro
 */

const Auth = {
  renderLogin() {
    return `
    <div class="fhr-login-page">
      <div class="fhr-login-container">
        
        <!-- Screen 1: Landing / Social Auth (Superlist Style) -->
        <div id="login-landing-screen" class="login-screen active">
          <div class="login-header-section">
            <div class="bancada-app-icon cascade-item" style="--index: 1;">
              ${this.renderAppIconSvg()}
            </div>
            
            <h1 class="login-main-title cascade-item" style="--index: 2;">
              Boas-vindas<br>ao Tomada
            </h1>
          </div>
          
          <div class="login-middle-section">
            <div class="doodles-background cascade-item" style="--index: 3;">
              ${this.renderDoodlesSvg()}
            </div>
            
            <div class="slogan-container cascade-item" style="--index: 4;">
              <p class="slogan-text">Feito para equipes.</p>
              <p class="slogan-text">Projetado para pessoas.</p>
            </div>
          </div>
          
          <div class="login-actions-stack">
            <!-- Google Sign-in Button Container (Styled as Pill inside CSS) -->
            <div id="google-login-btn" class="google-btn-wrapper cascade-item" style="--index: 5;"></div>
            
            <!-- Apple Sign-in Button Mock -->
            <button class="pill-btn btn-dark cascade-item" style="--index: 6;" onclick="Components.toast('Login com a Apple indisponível neste dispositivo.', 'info')">
              <i data-lucide="apple" class="btn-icon"></i> Entrar com a Apple
            </button>
            
            <!-- Signup Option (replacing Continue with email) -->
            <button class="pill-btn btn-light-orange cascade-item" style="--index: 7;" onclick="window.location.href = '/cadastro.html'">
              <i data-lucide="user-plus" class="btn-icon"></i> Cadastrar
            </button>
            
            <div class="bottom-toggle-link cascade-item" style="--index: 8;">
              Já possui uma conta? <a href="#" onclick="Auth.switchToScreen('email-login'); return false;">Entrar</a>
            </div>
          </div>
        </div>

        <!-- Screen 2: Email Login Form -->
        <div id="login-email-login-screen" class="login-screen">
          <div class="login-header-section">
            <div class="bancada-app-icon small cascade-item" style="--index: 1;" onclick="Auth.switchToScreen('landing')">
              ${this.renderAppIconSvg()}
            </div>
            <h1 class="login-main-title cascade-item" style="--index: 2;">Entrar com E-mail</h1>
          </div>

          <div class="login-form-wrapper">
            <form onsubmit="event.preventDefault(); Auth.handleLogin(event)">
              
              <!-- Role Selection -->
              <div class="role-toggle-fhr cascade-item" style="--index: 3;">
                <button type="button" class="role-btn active" onclick="Auth.setRole(event, 'admin')">Administrador</button>
                <button type="button" class="role-btn" onclick="Auth.setRole(event, 'padeiro')">Técnico</button>
              </div>

              <div class="fhr-input-group cascade-item" style="--index: 4;">
                <label class="fhr-label">E-MAIL</label>
                <input class="fhr-input" type="text" id="login-email" placeholder="seu.email@exemplo.com" required autocomplete="username">
              </div>
              
              <div class="fhr-input-group cascade-item" style="--index: 5;">
                <label class="fhr-label">SENHA</label>
                <input class="fhr-input" type="password" id="login-senha" placeholder="••••••••••••" required autocomplete="current-password">
              </div>

              <div class="fhr-actions-row cascade-item" style="--index: 6;">
                <label class="fhr-checkbox">
                  <input type="checkbox" checked style="accent-color: var(--primary);">
                  Lembrar-me
                </label>
                
                <a href="#" class="fhr-forgot" onclick="Auth.switchToScreen('signup'); return false;">
                  Esqueceu a senha?
                </a>
              </div>

              <div id="login-error" class="error-message-comodato" style="margin-top:10px;"></div>

              <div style="margin-top: 28px; --index: 7;" class="cascade-item">
                <button type="submit" class="pill-btn btn-orange" id="login-btn">
                  <span>Acessar</span>
                </button>
              </div>

              <div class="back-navigation-link cascade-item" style="--index: 8;">
                <a href="#" onclick="Auth.switchToScreen('landing'); return false;">&larr; Voltar</a>
              </div>
            </form>
          </div>
        </div>

        <!-- Screen 3: Sign Up / First Access -->
        <div id="login-signup-screen" class="login-screen">
          <div class="login-header-section">
            <div class="bancada-app-icon small cascade-item" style="--index: 1;" onclick="Auth.switchToScreen('landing')">
              ${this.renderAppIconSvg()}
            </div>
            <h1 class="login-main-title cascade-item" style="--index: 2;">Primeiro Acesso</h1>
          </div>

          <div class="login-form-wrapper">
            <div id="first-access-content-area">
              <form onsubmit="Auth.handleFirstAccess(event)">
                <p class="form-instructions-text cascade-item" style="--index: 3;">
                  Se você é um novo colaborador ou esqueceu sua senha, digite seu e-mail cadastrado abaixo para definir suas credenciais.
                </p>

                <div class="fhr-input-group cascade-item" style="--index: 4;">
                  <label class="fhr-label">E-MAIL</label>
                  <input class="fhr-input" type="email" id="first-access-email" placeholder="seu.email@exemplo.com" required autocomplete="email">
                </div>

                <div id="first-access-error" class="error-message-comodato" style="margin-top:10px;"></div>
                <div id="first-access-msg"></div>

                <div style="margin-top: 28px; --index: 5;" class="cascade-item">
                  <button type="submit" class="pill-btn btn-orange" id="first-access-btn">
                    <span>Enviar Link de Acesso</span>
                  </button>
                </div>

                <div class="back-navigation-link cascade-item" style="--index: 6;">
                  <a href="#" onclick="Auth.switchToScreen('landing'); return false;">&larr; Voltar</a>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>`;
  },

  switchToScreen(screenId) {
    document.querySelectorAll('.login-screen').forEach(scr => scr.classList.remove('active'));
    const target = document.getElementById(`login-${screenId}-screen`);
    if (target) {
      target.classList.add('active');
    }
    // Re-render Google Sign-in if switching to landing screen
    if (screenId === 'landing') {
      setTimeout(() => this.initGoogleLogin(), 50);
    }
    Components.renderIcons();
  },

  setRole(event, role) {
    document.querySelectorAll('.role-toggle-fhr .role-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
  },

  renderAppIconSvg() {
    return `<img src="/assets/tomada_logo_completa.svg" alt="Tomada Logo" class="bancada-logo-img">`;
  },

  renderDoodlesSvg() {
    return `
    <svg width="280" height="180" viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.15;">
      <!-- Cross (X) -->
      <path d="M100 45 L120 65 M120 45 L100 65" stroke="#7A7567" stroke-width="3" stroke-linecap="round" />
      
      <!-- Circle -->
      <circle cx="50" cy="95" r="28" fill="none" stroke="#7A7567" stroke-width="3" />
      
      <!-- Wavy line / Scribble -->
      <path d="M130 90 Q145 70 150 95 T170 90" fill="none" stroke="#7A7567" stroke-width="3" stroke-linecap="round" />
      
      <!-- Star / Asterisk -->
      <path d="M200 80 L200 110 M185 95 L215 95 M190 85 L210 105 M190 105 L210 85" stroke="#7A7567" stroke-width="3" stroke-linecap="round" />
      
      <!-- Triangle -->
      <polygon points="120,105 135,120 115,125" fill="none" stroke="#7A7567" stroke-width="3" stroke-linejoin="round" />
      
      <!-- Large circle on the right -->
      <circle cx="240" cy="70" r="18" fill="none" stroke="#7A7567" stroke-width="3" />
      
      <!-- Angle / Corner bracket -->
      <path d="M260 110 L260 125 L245 125" fill="none" stroke="#7A7567" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Dash lines / sparks -->
      <path d="M80 20 L95 35 M90 10 L75 25" stroke="#7A7567" stroke-width="3" stroke-linecap="round" />
    </svg>`;
  },

  showFirstAccess() {
    Auth.switchToScreen('signup');
  },

  backToLogin() {
    Auth.switchToScreen('email-login');
  },

  async handleLogin(e) {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display:inline-block; animation: spin 1s linear infinite; margin-right:6px;"></span> Acessando...';
    errorEl.classList.remove('active');
    errorEl.textContent = '';

    try {
      const data = await API.post('/api/auth/login', { email, senha });

      if (data.requires2FA) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        Auth.promptWebAuthnLogin(data.challengeToken, data.user.nome);
        return;
      }

      if (data.requiresSetup2FA) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        Auth.promptWebAuthnSetup(data.setupToken, data.user.nome);
        return;
      }

      if (data.user?.role !== 'admin' && data.user?.role !== 'criador' && data.user?.role !== 'editor') {
        API.setToken(data.token);
        API.setUser(data.user);
        btn.disabled = false;
        btn.innerHTML = originalText;
        this.showRoleSelectionModal(data.user, data.token);
        return;
      }

      API.setToken(data.token);
      API.setUser(data.user);
      Components.toast(`Bem-vindo, ${data.user.nome}!`, 'success');
      
      if (data.user.role === 'padeiro' && typeof LocationService !== 'undefined') {
        await LocationService.init(data.user);
        await new Promise(r => setTimeout(r, 500));
        await LocationService.captureAction('Login no Aplicativo');
      }

      const isManagement = ['superadmin', 'admin', 'criador', 'editor'].includes(data.user.role);
      App.navigate(isManagement ? 'admin-dashboard' : 'padeiro-inicio');
    } catch (err) {
      errorEl.classList.add('active');
      errorEl.textContent = err.message || 'Falha na autenticação';
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  showWebAuthnModal(title, description, onCancel) {
    // Remove existing modal if any
    const existing = document.getElementById('webauthn-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'webauthn-overlay';
    overlay.id = 'webauthn-overlay';
    overlay.innerHTML = `
      <div class="webauthn-card">
        <div class="webauthn-icon-container">
          <div class="webauthn-fingerprint-glow"></div>
          <i class="webauthn-fingerprint-icon" data-lucide="fingerprint"></i>
        </div>
        <h3 class="webauthn-title">${title}</h3>
        <p class="webauthn-description">${description}</p>
        <div class="webauthn-status" id="webauthn-status">Iniciando leitor biométrico...</div>
        <div class="webauthn-actions">
          <button type="button" class="pill-btn btn-light-orange" id="webauthn-cancel-btn">Cancelar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: { 'stroke-width': 1.75 }
      });
    }

    // Trigger open animation
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    const cancelBtn = document.getElementById('webauthn-cancel-btn');
    cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
      if (onCancel) onCancel();
    });

    return {
      setStatus(text, type = '') {
        const statusEl = document.getElementById('webauthn-status');
        if (statusEl) {
          statusEl.textContent = text;
          statusEl.className = 'webauthn-status ' + type;
        }
      },
      close() {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
      }
    };
  },

  async promptWebAuthnSetup(setupToken, nome) {
    const modal = this.showWebAuthnModal(
      'Registrar Biometria',
      `Olá ${nome}, para blindar sua conta de Administrador, precisamos registrar a biometria do seu dispositivo (Digital ou Reconhecimento Facial).`
    );

    try {
      if (typeof SimpleWebAuthnBrowser === 'undefined' || !SimpleWebAuthnBrowser.startRegistration) {
        throw new Error('Biblioteca WebAuthn não carregada. Recarregue a página.');
      }

      modal.setStatus('Buscando configurações...');
      const options = await API.post('/api/auth/webauthn/register-options', { setupToken });

      modal.setStatus('Toque no sensor biométrico...');
      const attResp = await SimpleWebAuthnBrowser.startRegistration({ optionsJSON: options });

      modal.setStatus('Confirmando com o servidor...', 'success');
      const data = await API.post('/api/auth/webauthn/register-verify', {
        setupToken,
        response: attResp,
        deviceName: navigator.userAgent.includes('Mobi') ? 'Celular' : 'Computador'
      });

      if (data.verified && data.token) {
        modal.setStatus('Verificado!', 'success');
        Components.toast('Biometria registrada com sucesso!', 'success');
        
        setTimeout(() => {
          modal.close();
          API.setToken(data.token);
          API.setUser(data.user);
          App.navigate('admin-dashboard');
        }, 1500);
      } else {
        throw new Error('Verificação falhou.');
      }
    } catch (err) {
      console.error('[WebAuthn Setup]', err);
      modal.setStatus(err.message || 'Erro ao registrar biometria', 'error');
      Components.toast(err.message || 'Falha no registro da biometria', 'error');
    }
  },

  async promptWebAuthnLogin(challengeToken, nome) {
    const modal = this.showWebAuthnModal(
      'Confirmação Biométrica',
      `Identidade de Admin detectada para ${nome}. Por favor, confirme com sua digital ou reconhecimento facial.`
    );

    try {
      if (typeof SimpleWebAuthnBrowser === 'undefined' || !SimpleWebAuthnBrowser.startAuthentication) {
        throw new Error('Biblioteca WebAuthn não carregada. Recarregue a página.');
      }

      modal.setStatus('Buscando desafio de segurança...');
      const options = await API.post('/api/auth/webauthn/login-options', { challengeToken });

      modal.setStatus('Toque no sensor biométrico...');
      const asseResp = await SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: options });

      modal.setStatus('Verificando biometria...', 'success');
      const data = await API.post('/api/auth/webauthn/login-verify', {
        challengeToken,
        response: asseResp
      });

      if (data.verified && data.token) {
        modal.setStatus('Acesso autorizado!', 'success');
        Components.toast('Login realizado com sucesso!', 'success');
        
        setTimeout(() => {
          modal.close();
          API.setToken(data.token);
          API.setUser(data.user);
          App.navigate('admin-dashboard');
        }, 1500);
      } else {
        throw new Error('Verificação falhou.');
      }
    } catch (err) {
      console.error('[WebAuthn Login]', err);
      modal.setStatus(err.message || 'Erro ao autenticar biometria', 'error');
      Components.toast(err.message || 'Falha na autenticação biométrica', 'error');
    }
  },

  async handleFirstAccess(e) {
    e.preventDefault();
    const email = document.getElementById('first-access-email').value.trim();
    const btn = document.getElementById('first-access-btn');
    const errorEl = document.getElementById('first-access-error');
    const msgEl = document.getElementById('first-access-msg');

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display:inline-block; animation: spin 1s linear infinite; margin-right:6px;"></span> Enviando...';
    errorEl.classList.remove('active');
    errorEl.textContent = '';

    try {
      const data = await API.post('/api/auth/first-access', { email });
      if (data.mockMode && data.token) {
        msgEl.innerHTML = `
          <div class="alert alert-info" style="margin-top:16px; display: flex; align-items: center; gap: 12px; font-size: 13px; background: #F0F4FF; padding: 12px; border-radius: 8px;">
            <i data-lucide="info"></i>
            <span>Demonstração: Defina sua senha abaixo:</span>
          </div>`;
        btn.style.display = 'none';
        msgEl.innerHTML += Auth.setPasswordForm(data.token);
        Components.renderIcons();
      } else {
        msgEl.innerHTML = `<div style="background:rgba(16, 185, 129, 0.1); color:#10B981; padding:12px; border-radius:12px; font-size:13px; margin-top:16px; text-align:center;">✅ E-mail enviado! Verifique sua caixa de entrada.</div>`;
        btn.innerHTML = 'Reenviar';
        btn.disabled = false;
      }
    } catch (err) {
      errorEl.classList.add('active');
      errorEl.textContent = err.message;
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  setPasswordForm(token) {
    return `
    <form onsubmit="Auth.handleSetPassword(event, '${token}')" style="margin-top: 16px;">
      <div class="fhr-input-group">
        <label class="fhr-label">Nova Senha</label>
        <input class="fhr-input" type="password" id="new-password" placeholder="Mínimo 6 caracteres" minlength="6" required>
      </div>

      <div class="fhr-input-group">
        <label class="fhr-label">Confirmar Senha</label>
        <input class="fhr-input" type="password" id="confirm-password" placeholder="Repita a nova senha" required>
      </div>

      <div id="set-pass-error" class="error-message-comodato"></div>

      <button type="submit" class="pill-btn btn-orange" id="set-pass-btn">
        <span>Definir Senha</span>
      </button>
    </form>`;
  },

  async handleSetPassword(e, token) {
    e.preventDefault();
    const senha = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('set-pass-error');
    const btn = document.getElementById('set-pass-btn');

    if (senha !== confirm) { errorEl.textContent = 'As senhas não coincidem.'; errorEl.classList.add('active'); return; }
    if (senha.length < 6) { errorEl.textContent = 'Senha deve ter no mínimo 6 caracteres.'; errorEl.classList.add('active'); return; }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display:inline-block; animation: spin 1s linear infinite; margin-right:6px;"></span> Salvando...';
    errorEl.classList.remove('active');

    try {
      await API.post('/api/auth/set-password', { token, senha });
      Components.toast('Senha definida com sucesso! Faça login.', 'success');
      Auth.switchToScreen('email-login');
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add('active');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  renderSetPassword() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return Auth.renderLogin();
    return `
    <div class="fhr-login-page">
      <div class="fhr-login-container" style="padding: 40px 32px; justify-content: center;">
        <div class="login-header-section">
          <div class="bancada-app-icon">
            ${this.renderAppIconSvg()}
          </div>
          <h1 class="login-main-title">Definir Senha</h1>
          <p class="slogan-text" style="margin-top: 8px;">Crie sua nova senha de acesso</p>
        </div>
        ${this.setPasswordForm(token)}
        <div class="back-navigation-link">
          <button class="pill-btn btn-light-orange" style="margin-top: 16px;" onclick="App.navigate('login')">Voltar ao Login</button>
        </div>
      </div>
    </div>`;
  },

  logout() {
    API.setToken(null);
    API.setUser(null);
    App.navigate('login');
    Components.toast('Sessão encerrada.', 'info');
  },

  initGoogleLogin() {
    const isLocalCapacitor = window.location.origin.startsWith('capacitor://') || 
                             (window.location.origin.startsWith('http://localhost') && !window.location.port && !window.location.host.includes(':3000'));
    
    const isElectron = !!(window.electronAPI);

    if (isElectron) {
      this.renderElectronGoogleButton();
      return;
    }

    // Always render custom OAuth button so login never fails on origin mismatch
    this.renderCustomGoogleButton();
  },

  renderElectronGoogleButton() {
    this.renderCustomGoogleButton();
  },

  handleElectronGoogleLogin() {
    const sessionId = 'sess_login_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const host = window.location.host;
    const protocol = window.location.protocol;
    const redirectUri = `${protocol}//${host}/api/auth/google-login-callback`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=758580987321-p247rlue5k9b05n5v31iso873fgv08jt.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile%20openid&prompt=select_account&state=${sessionId}`;

    if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
      window.electronAPI.openExternal(authUrl);
    } else {
      window.open(authUrl, '_blank', 'width=500,height=600');
    }

    const btn = document.getElementById('google-login-btn');
    if (btn) {
      btn.innerHTML = `<p style="font-size: 13px; color: #E55A2B; font-weight: bold; text-align: center; margin: 10px 0; animation: pulse 1.5s infinite;">Aguardando login no navegador...</p>`;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/check-login-session?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.success && data.token) {
          clearInterval(interval);
          API.setToken(data.token);
          API.setUser(data.user);
          Components.toast(`Bem-vindo, ${data.user.nome}!`, 'success');

          if (['admin', 'superadmin', 'criador', 'editor'].includes(data.user?.role)) {
            App.navigate('admin-dashboard');
          } else {
            App.navigate('selecao-perfil');
          }
        }
      } catch (err) {
        console.error('Erro de polling do Google Login:', err);
      }
    }, 1500);

    setTimeout(() => {
      clearInterval(interval);
      this.initGoogleLogin();
    }, 5 * 60 * 1000);
  },

  renderCustomGoogleButton() {
    const parent = document.getElementById('google-login-btn');
    if (parent) {
      parent.innerHTML = `
        <button type="button" class="pill-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #ffffff; color: #1C1A14; border: 1px solid var(--separator); height: 44px; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 12px;" onclick="Auth.handleElectronGoogleLogin()">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com o Google
        </button>
      `;
    }
  },



  showRoleSelectionModal(user, token) {
    if (typeof App !== 'undefined' && App.navigate) {
      App.navigate('selecao-perfil');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'premium-role-modal';
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important;
      background: rgba(28, 26, 20, 0.5) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      z-index: 999999 !important;
      opacity: 1 !important;
      font-family: 'Outfit', sans-serif !important;
    `;

    modal.innerHTML = `
      <div style="
        background: #FAF8F5;
        border: 1px solid #EBE5DF;
        border-radius: 28px;
        padding: 40px;
        width: 100%; max-width: 480px;
        box-shadow: 0 20px 50px rgba(229, 90, 43, 0.15);
        text-align: center;
        transform: translateY(30px);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      " id="premium-role-card">
        
        <div style="
          width: 56px; height: 56px;
          background: rgba(229, 90, 43, 0.1);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px auto;
          color: #E55A2B;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>

        <h2 style="font-size: 26px; font-weight: 800; color: #1C1A14; margin: 0 0 8px 0; letter-spacing: -0.5px;">Escolha o seu Perfil</h2>
        <p style="font-size: 14px; color: #64748B; margin: 0 0 32px 0; line-height: 1.6; padding: 0 10px;">
          Olá, ${user.nome}! Para personalizar sua experiência no Tomada, escolha qual será o seu papel principal no sistema.
        </p>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <button onclick="Auth.selectRole('${user.email}', 'criador', '${token}')" style="
            display: flex; align-items: center; gap: 20px;
            background: #FFFFFF; border: 2px solid #EBE5DF;
            border-radius: 18px; padding: 20px; text-align: left;
            cursor: pointer; transition: all 0.25s ease; width: 100%;
            outline: none;
          " onmouseover="this.style.borderColor='#E55A2B'; this.style.boxShadow='0 8px 24px rgba(229, 90, 43, 0.08)';" onmouseout="this.style.borderColor='#EBE5DF'; this.style.boxShadow='none';">
            <div style="
              width: 44px; height: 44px; background: rgba(229, 90, 43, 0.08);
              border-radius: 12px; display: flex; align-items: center; justify-content: center;
              color: #E55A2B; flex-shrink: 0;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7a2 2 0 0 0-2.45-1.45L11 8.75 1.45 5.55A2 2 0 0 0 0 7.4v11.8a2 2 0 0 0 1.45 1.95L11 23.25l9.55-3.2A2 2 0 0 0 22 18.1V7.4z"/><path d="M11 8.75V23.25"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 16px; color: #1C1A14; margin-bottom: 2px;">Criador</div>
              <div style="font-size: 12px; color: #8E8E93; line-height: 1.4;">Tenho canais e gerencio a produção geral dos meus vídeos.</div>
            </div>
          </button>

          <button onclick="Auth.selectRole('${user.email}', 'editor', '${token}')" style="
            display: flex; align-items: center; gap: 20px;
            background: #FFFFFF; border: 2px solid #EBE5DF;
            border-radius: 18px; padding: 20px; text-align: left;
            cursor: pointer; transition: all 0.25s ease; width: 100%;
            outline: none;
          " onmouseover="this.style.borderColor='#E55A2B'; this.style.boxShadow='0 8px 24px rgba(229, 90, 43, 0.08)';" onmouseout="this.style.borderColor='#EBE5DF'; this.style.boxShadow='none';">
            <div style="
              width: 44px; height: 44px; background: rgba(229, 90, 43, 0.08);
              border-radius: 12px; display: flex; align-items: center; justify-content: center;
              color: #E55A2B; flex-shrink: 0;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 16px; color: #1C1A14; margin-bottom: 2px;">Editor / Thumbmaker</div>
              <div style="font-size: 12px; color: #8E8E93; line-height: 1.4;">Presto serviços de edição, artes e design de miniaturas.</div>
            </div>
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.opacity = '1';
      document.getElementById('premium-role-card').style.transform = 'translateY(0)';
    }, 50);
  },

  async selectRole(email, role, originalToken) {
    try {
      const authToken = (originalToken && originalToken !== 'undefined') ? originalToken : (API.token || localStorage.getItem('NexusGestor_token'));
      const userEmail = email || (API.getUser() ? API.getUser().email : '');

      const res = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ email: userEmail, role })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erro ao definir papel');

      const modal = document.getElementById('premium-role-modal');
      if (modal) {
        modal.style.opacity = '0';
        const card = document.getElementById('premium-role-card');
        if (card) card.style.transform = 'translateY(30px)';
        setTimeout(() => modal.remove(), 400);
      }

      API.setToken(data.token);
      API.setUser(data.user);
      Components.toast(`Perfil de ${role === 'criador' ? 'Criador' : 'Editor / Thumbmaker'} configurado com sucesso!`, 'success');
      App.navigate('admin-dashboard');
    } catch (err) {
      Components.toast(err.message, 'error');
    }
  },


  async checkApkDownloadModal() {
    if (sessionStorage.getItem('bancada_apk_prompt_shown')) return;

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isCapacitor = !!window.Capacitor || 
                        navigator.userAgent.includes('Capacitor') ||
                        window.location.origin.startsWith('capacitor://') || 
                        (window.location.origin.startsWith('http://localhost') && !window.location.port && !window.location.host.includes(':3000'));

    if (isMobileDevice && !isCapacitor) {
      let downloadUrl = '/app-debug.apk';
      try {
        const res = await fetch('/api/upload/apk/latest');
        const data = await res.json();
        if (data.success && data.downloadUrl) {
          downloadUrl = data.downloadUrl;
        }
      } catch (e) {
        console.warn("Erro ao buscar APK do Drive:", e);
      }
      
      const showApkAlert = () => {
        let overlay = document.getElementById('ios-apk-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'ios-apk-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.right = '0';
          overlay.style.bottom = '0';
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
          overlay.style.backdropFilter = 'blur(10px)';
          overlay.style.webkitBackdropFilter = 'blur(10px)';
          overlay.style.zIndex = '99999999';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
          document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
          <div style="background: var(--bg-card, #ffffff); width: 280px; border-radius: 14px; text-align: center; overflow: hidden; font-family: var(--font-main), -apple-system, BlinkMacSystemFont, sans-serif; box-shadow: var(--shadow-lg); transform: scale(0.9); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); border: 1px solid var(--separator, rgba(0,0,0,0.15));" id="ios-apk-box">
            <div style="padding: 24px 20px 20px;">
              <div style="display: flex; justify-content: center; align-items: center; width: 56px; height: 56px; background-color: var(--primary-light); border-radius: 14px; margin: 0 auto 16px; color: var(--primary);">
                <i data-lucide="smartphone" style="width: 28px; height: 28px;"></i>
              </div>
              <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: var(--text-main); line-height: 1.25;">Aplicativo Bancada</h3>
              <p style="margin: 0; font-size: 13px; font-weight: 400; color: var(--text-secondary); line-height: 1.4;">
                Deseja baixar o aplicativo nativo para uma experiência mais rápida e integrada no seu celular?
              </p>
              <div style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--bg-main); border-radius: 20px; border: 1px solid var(--separator);">
                <i data-lucide="check" style="color: var(--success); width: 14px; height: 14px;"></i>
                <span style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Compatível com Android</span>
              </div>
            </div>
            <div style="border-top: 1px solid var(--separator, rgba(0,0,0,0.15)); display: flex;">
              <button style="flex: 1; padding: 14px; background: none; border: none; font-size: 15px; font-weight: 500; color: var(--text-secondary); cursor: pointer; user-select: none; border-right: 1px solid var(--separator, rgba(0,0,0,0.15)); outline: none;" onclick="closeApkAlert()">Não, obrigado</button>
              <a href="${downloadUrl}" download style="flex: 1; padding: 14px; background: none; border: none; font-size: 15px; font-weight: 700; color: var(--primary); cursor: pointer; user-select: none; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; outline: none;" onclick="closeApkAlert()">
                <i data-lucide="download" style="width: 16px; height: 16px;"></i> Baixar
              </a>
            </div>
          </div>
        `;

        window.closeApkAlert = () => {
          sessionStorage.setItem('bancada_apk_prompt_shown', 'true');
          overlay.style.opacity = '0';
          const box = document.getElementById('ios-apk-box');
          if (box) box.style.transform = 'scale(0.9)';
          setTimeout(() => {
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            document.body.style.overflow = '';
          }, 250);
        };

        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
          overlay.style.opacity = '1';
          const box = document.getElementById('ios-apk-box');
          if (box) box.style.transform = 'scale(1)';
          if (window.lucide) {
            window.lucide.createIcons({
              attrs: {
                'stroke-width': 1.75
              }
            });
          }
        });
      };

      setTimeout(showApkAlert, 1500);
    }
  }
};
