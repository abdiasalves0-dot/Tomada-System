/**
 * Cadastro Module - JavaScript logic
 * Handles form validation, show/hide password, and registration submissions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        'stroke-width': 1.75
      }
    });
  }

  // Handle form submission
  const form = document.getElementById('cadastro-form');
  if (form) {
    form.addEventListener('submit', handleRegister);
  }

  // Check if we should prompt for APK download
  checkApkDownloadModal();

  // Initialize Google Signup button
  initGoogleSignup();
});

// Toggle password text visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('cadastro-senha');
  const eyeIcon = document.querySelector('#eye-icon');
  
  if (!passwordInput || !eyeIcon) return;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    // Change to eye-off icon
    eyeIcon.setAttribute('data-lucide', 'eye-off');
  } else {
    passwordInput.type = 'password';
    // Change to eye icon
    eyeIcon.setAttribute('data-lucide', 'eye');
  }
  
  // Recreate Lucide icon for eye element
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        'stroke-width': 1.75
      }
    });
  }
}

// Handle account creation request
async function handleRegister(event) {
  event.preventDefault();

  const firstName = document.getElementById('cadastro-nome').value.trim();
  const lastName = document.getElementById('cadastro-sobrenome').value.trim();
  const email = document.getElementById('cadastro-email').value.trim();
  const password = document.getElementById('cadastro-senha').value;
  
  const errorEl = document.getElementById('cadastro-error');
  const submitBtn = document.getElementById('cadastro-submit-btn');

  // Reset error area
  if (errorEl) {
    errorEl.classList.remove('active');
    errorEl.textContent = '';
  }

  if (password.length < 6) {
    showError('A senha deve ter no mínimo 6 caracteres.');
    return;
  }

  // Visual feedback on button loading state
  submitBtn.disabled = true;
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `
    <span class="spinner" style="
      width: 16px; 
      height: 16px; 
      border: 2px solid rgba(255,255,255,0.3); 
      border-top-color: white; 
      border-radius: 50%; 
      display: inline-block; 
      animation: spin 1s linear infinite; 
      margin-right: 8px;
      vertical-align: middle;
    "></span> Criando conta...`;

  try {
    const res = await API.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    if (typeof Components !== 'undefined') {
      Components.toast('Conta criada com sucesso! Redirecionando...', 'success');
    }

    // Auto-login: salvar token e user no localStorage para redirecionar para seleção de perfil
    if (res.token && res.user) {
      localStorage.setItem('NexusGestor_token', res.token);
      localStorage.setItem('NexusGestor_user', JSON.stringify(res.user));
    }

    setTimeout(() => {
      window.location.href = '/';
    }, 1500);

  } catch (err) {
    const errorMsg = err.message || 'Erro ao registrar conta.';
    showError(errorMsg);
    
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Show error messages in container
function showError(message) {
  const errorEl = document.getElementById('cadastro-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('active');
  }
  if (typeof Components !== 'undefined') {
    Components.toast(message, 'error');
  }
}

// Inline CSS style for spinner animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

async function checkApkDownloadModal() {
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

function initGoogleSignup() {
  renderElectronGoogleSignupButton();
}

function renderElectronGoogleSignupButton() {
  const parent = document.getElementById('google-login-btn');
  if (parent) {
    parent.innerHTML = `
      <button type="button" class="pill-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #ffffff; color: #1C1A14; border: 1px solid #EBE5DF; height: 44px; font-size: 14px; font-weight: 600; border-radius: 12px; cursor: pointer; transition: all 0.2s;" onclick="handleElectronGoogleSignup()">
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Cadastrar com o Google
      </button>
    `;
  }
}

function handleElectronGoogleSignup() {
  const sessionId = 'sess_login_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  const host = window.location.host;
  const protocol = window.location.protocol;
  const redirectUri = `${protocol}//${host}/api/auth/google-login-callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=758580987321-p247rlue5k9b05n5v31iso873fgv08jt.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile%20openid&prompt=select_account&state=${sessionId}`;

  if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
    window.electronAPI.openExternal(authUrl);
  } else {
    window.open(authUrl, '_blank');
  }

  const btn = document.getElementById('google-login-btn');
  if (btn) {
    btn.innerHTML = `<p style="font-size: 13px; color: #E55A2B; font-weight: bold; text-align: center; margin: 10px 0; animation: pulse 1.5s infinite;">Aguardando cadastro no navegador...</p>`;
  }

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/api/auth/check-login-session?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success && data.token) {
        clearInterval(interval);
        API.setToken(data.token);
        API.setUser(data.user);
        if (typeof Components !== 'undefined') {
          Components.toast(`Bem-vindo, ${data.user.nome}!`, 'success');
        }
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (err) {
      console.error('Erro de polling do Google Signup:', err);
    }
  }, 1500);

  setTimeout(() => {
    clearInterval(interval);
    initGoogleSignup();
  }, 5 * 60 * 1000);
}

function renderCustomGoogleSignupButton() {
  const parent = document.getElementById('google-login-btn');
  if (parent) {
    parent.innerHTML = `
      <button class="pill-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #ffffff; color: #1C1A14; border: 1px solid var(--separator); height: 44px; font-size: 14px; font-weight: 600;" onclick="handleCapacitorGoogleSignup()">
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Cadastrar com o Google
      </button>
    `;
  }
}

function handleCapacitorGoogleSignup() {
  const webLoginUrl = `https://bancada-kohl.vercel.app/cadastro.html?platform=capacitor&return_to=${encodeURIComponent(window.location.origin)}`;
  window.location.href = webLoginUrl;
}

async function handleGoogleSignup(response) {
  try {
    if (typeof Components !== 'undefined') {
      Components.toast('Autenticando...', 'info');
    }
    const data = await API.post('/api/auth/google-login', { credential: response.credential });
    
    if (data.token && data.user) {
      API.setToken(data.token);
      API.setUser(data.user);
      if (typeof Components !== 'undefined') {
        Components.toast(`Bem-vindo, ${data.user.nome}!`, 'success');
      }
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      showError(data.error || 'Falha na autenticação com o Google.');
    }
  } catch (err) {
    console.error(err);
    showError(err.message || 'Erro ao conectar ao servidor.');
  }
}
