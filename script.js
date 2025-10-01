import { apiClient } from './web/apiClient.js';
import { renderModels, setupFilters, setAuthGetter } from './web/gallery.js';
import { setupAuth } from './web/auth.js';
import { setupAdminForm } from './web/admin.js';

document.addEventListener('DOMContentLoaded', async () => {
  const auth = setupAuth(apiClient);
  setAuthGetter(() => auth);
  const admin = setupAdminForm(apiClient, auth);
  setupFilters(renderModels, auth, admin);

  await auth.checkSession();
  await renderModels();
});