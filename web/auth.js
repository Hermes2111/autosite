import { renderModels } from './gallery.js';

export function setupAuth(api) {
  const controls = document.getElementById('auth-controls');
  const loginButton = document.getElementById('login-button');
  const modal = document.getElementById('auth-modal');
  const overlay = document.getElementById('auth-overlay');
  const close = document.getElementById('auth-close');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginPanel = document.getElementById('login-panel');
  const registerPanel = document.getElementById('register-panel');
  const loginForm = document.getElementById('login-form');
  const loginFeedback = document.getElementById('login-feedback');
  const registerForm = document.getElementById('register-form');
  const registerFeedback = document.getElementById('register-feedback');
  const backendInput = document.getElementById('backend-url');
  const rememberBackend = document.getElementById('remember-backend');
  const googleButton = document.getElementById('google-login');
  const adminPanel = document.getElementById('admin-panel');

  let currentUser = null;
  let activeTab = 'login';

  if (modal) {
    modal.classList.remove('visible');
    modal.hidden = true;
  }

  const savedBase = localStorage.getItem('autosite.apiBase');
  if (backendInput && savedBase) {
    backendInput.value = savedBase.replace(/\/api$/, '');
    if (rememberBackend) rememberBackend.checked = true;
  }

  function setTab(tab) {
    activeTab = tab;
    
    // Clear feedback messages
    if (loginFeedback) loginFeedback.textContent = '';
    if (registerFeedback) registerFeedback.textContent = '';
    
    if (tab === 'login') {
      // Update tab buttons
      if (loginTab) {
        loginTab.classList.add('active');
        loginTab.setAttribute('aria-selected', 'true');
      }
      if (registerTab) {
        registerTab.classList.remove('active');
        registerTab.setAttribute('aria-selected', 'false');
      }
      
      // Show login panel, hide register panel
      if (loginPanel) {
        loginPanel.hidden = false;
        loginPanel.style.display = 'block';
      }
      if (registerPanel) {
        registerPanel.hidden = true;
        registerPanel.style.display = 'none';
      }
    } else {
      // Update tab buttons
      if (registerTab) {
        registerTab.classList.add('active');
        registerTab.setAttribute('aria-selected', 'true');
      }
      if (loginTab) {
        loginTab.classList.remove('active');
        loginTab.setAttribute('aria-selected', 'false');
      }
      
      // Show register panel, hide login panel
      if (registerPanel) {
        registerPanel.hidden = false;
        registerPanel.style.display = 'block';
      }
      if (loginPanel) {
        loginPanel.hidden = true;
        loginPanel.style.display = 'none';
      }
    }
  }

  function openModal(tab = 'login') {
    setTab(tab);
    if (modal) {
      modal.hidden = false;
      modal.classList.add('visible');
    }
    if (overlay) {
      overlay.classList.add('visible');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('visible');
      modal.hidden = true;
    }
    if (overlay) {
      overlay.classList.remove('visible');
    }
    if (loginFeedback) loginFeedback.textContent = '';
    if (registerFeedback) registerFeedback.textContent = '';
  }

  function renderControls() {
    if (!controls) return;
    
    if (!currentUser) {
      controls.innerHTML = '<button class="btn btn-secondary" id="login-button">Inloggen</button>';
      const loginBtn = document.getElementById('login-button');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal('login'));
      }
      if (adminPanel) adminPanel.hidden = true;
    } else {
      const isAdmin = currentUser.roles.includes('admin');
      
      controls.innerHTML = `
        <div class="user-info">
          <i class="fas fa-user-circle"></i>
          <span>${currentUser.name} (${currentUser.roles.join(', ')})</span>
        </div>
        ${isAdmin ? '<button class="icon-button" id="dashboard-toggle" title="Dashboard"><i class="fas fa-chart-line"></i></button>' : ''}
        <button class="logout-button" id="logout-button">Uitloggen</button>
      `;
      
      const logoutBtn = document.getElementById('logout-button');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await logout();
          await renderModels();
        });
      }
      
      if (adminPanel) {
        adminPanel.hidden = !isAdmin;
      }
      
      // Dashboard toggle will be handled by script.js
    }
  }

  async function login(email, password) {
    const { token, user } = await api.post('/auth/login', { email, password });
    api.setToken(token);
    currentUser = user;
    renderControls();
    // renderModels will be called by the caller after login
    return user;
  }

  async function register(data) {
    const { token, user } = await api.post('/auth/register', data);
    api.setToken(token);
    currentUser = user;
    renderControls();
    // renderModels will be called by the caller after register
    return user;
  }

  async function checkSession() {
    // Check if there's a token in the URL (from Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      api.setToken(tokenFromUrl);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!api.token) {
      currentUser = null;
      renderControls();
      return;
    }

    try {
      currentUser = await api.get('/auth/me');
    } catch (err) {
      api.setToken(null);
      currentUser = null;
    }
    renderControls();
  }

  async function logout() {
    api.setToken(null);
    currentUser = null;
    renderControls();
    // renderModels will be called by the caller after logout
  }

  loginButton?.addEventListener('click', () => openModal('login'));
  overlay?.addEventListener('click', closeModal);
  close?.addEventListener('click', closeModal);
  loginTab?.addEventListener('click', () => setTab('login'));
  registerTab?.addEventListener('click', () => setTab('register'));

  // Google OAuth login
  googleButton?.addEventListener('click', () => {
    const backendUrl = api.baseUrl.replace('/api', '');
    window.location.href = `${backendUrl}/api/auth/google`;
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    loginFeedback.textContent = '';

    try {
      if (backendInput && backendInput.value) {
        const base = `${backendInput.value.replace(/\/$/, '')}/api`;
        if (rememberBackend?.checked) {
          api.setBaseUrl(base);
        }
      }

      await login(formData.get('email'), formData.get('password'));
      closeModal();
      await renderModels();
    } catch (err) {
      loginFeedback.textContent = 'Inloggen mislukt. Controleer je gegevens.';
    }
  });

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    registerFeedback.textContent = '';

    try {
      await register({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      });
      closeModal();
      await renderModels();
    } catch (err) {
      registerFeedback.textContent = 'Registratie mislukt. Probeer opnieuw.';
    }
  });

  return {
    get user() {
      return currentUser;
    },
    checkSession,
  };
}

