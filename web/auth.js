import { renderModels } from './gallery.js';

export function setupAuth(api) {
  const controls = document.getElementById('auth-controls');
  const loginButton = document.getElementById('login-button');
  const modal = document.getElementById('auth-modal');
  const overlay = document.getElementById('auth-overlay');
  const close = document.getElementById('auth-close');
  const loginForm = document.getElementById('login-form');
  const loginFeedback = document.getElementById('login-feedback');
  const registerForm = document.getElementById('register-form');
  const registerFeedback = document.getElementById('register-feedback');
  const toggleRegister = document.getElementById('toggle-register');
  const adminPanel = document.getElementById('admin-panel');
  const backendInput = document.getElementById('backend-url');
  const rememberBackend = document.getElementById('remember-backend');

  let currentUser = null;

  const savedBase = localStorage.getItem('autosite.apiBase');
  if (backendInput && savedBase) {
    backendInput.value = savedBase.replace(/\/api$/, '');
    if (rememberBackend) rememberBackend.checked = true;
  }

  function openModal(showRegister = false) {
    modal.hidden = false;
    loginForm.hidden = showRegister;
    registerForm.hidden = !showRegister;
    loginFeedback.textContent = '';
    registerFeedback.textContent = '';
  }

  function closeModal() {
    modal.hidden = true;
  }

  function renderControls() {
    if (!currentUser) {
      controls.innerHTML = '<button class="btn btn-secondary" id="login-button">Inloggen</button>';
      document.getElementById('login-button').addEventListener('click', () => openModal(false));
      adminPanel.hidden = true;
    } else {
      controls.innerHTML = `
        <div class="user-info">
          <i class="fas fa-user-circle"></i>
          <span>${currentUser.name} (${currentUser.roles.join(', ')})</span>
        </div>
        <button class="logout-button" id="logout-button">Uitloggen</button>
      `;
      document.getElementById('logout-button').addEventListener('click', logout);
      adminPanel.hidden = !currentUser.roles.includes('admin');
    }
  }

  async function login(email, password) {
    const { token, user } = await api.post('/auth/login', { email, password });
    api.setToken(token);
    currentUser = user;
    renderControls();
    await renderModels();
  }

  async function register(data) {
    const { token, user } = await api.post('/auth/register', data);
    api.setToken(token);
    currentUser = user;
    renderControls();
    await renderModels();
  }

  async function checkSession() {
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
    await renderModels();
  }

  loginButton.addEventListener('click', () => openModal(false));
  overlay.addEventListener('click', closeModal);
  close.addEventListener('click', closeModal);

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
    } catch (err) {
      loginFeedback.textContent = 'Inloggen mislukt. Controleer je gegevens.';
    }
  });

  toggleRegister.addEventListener('click', () => {
    const showRegister = registerForm.hidden;
    loginForm.hidden = showRegister;
    registerForm.hidden = !showRegister;
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
