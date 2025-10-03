import { apiClient } from './web/apiClient.js';
import { renderModels, setupFilters, setAuthGetter } from './web/gallery.js';
import { setupAuth } from './web/auth.js';
import { setupAdminForm } from './web/admin.js';
import { setupDashboard } from './web/dashboard.js';
import { i18n } from './web/i18n.js';
import { themeManager } from './web/theme.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Setup theme switcher
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeManager.toggle();
    });
  }

  // Setup language switcher
  const languageToggle = document.getElementById('language-toggle');
  const languageDropdown = document.getElementById('language-dropdown');
  const currentLanguageSpan = document.getElementById('current-language');

  if (languageToggle && languageDropdown) {
    languageToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      languageDropdown.hidden = !languageDropdown.hidden;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      if (!languageDropdown.hidden) {
        languageDropdown.hidden = true;
      }
    });

    // Handle language selection
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        if (lang) {
          i18n.setLanguage(lang);
          if (currentLanguageSpan) {
            currentLanguageSpan.textContent = lang.toUpperCase();
          }
          languageDropdown.hidden = true;
        }
      });
    });
  }

  // Set initial language display
  if (currentLanguageSpan) {
    currentLanguageSpan.textContent = i18n.getCurrentLanguage().toUpperCase();
  }

  // Initialize i18n
  i18n.updatePage();

  // Setup auth and gallery
  const auth = setupAuth(apiClient);
  setAuthGetter(() => auth);
  const admin = setupAdminForm(apiClient, auth);
  const dashboard = setupDashboard(auth);
  setupFilters(renderModels, auth, admin);

  // Dashboard toggle button handler
  document.addEventListener('click', (e) => {
    if (e.target.closest('#dashboard-toggle')) {
      const dashboardElement = document.getElementById('sales-dashboard');
      const adminPanel = document.getElementById('admin-panel');
      const collectionContainer = document.getElementById('collectie-container');
      
      if (dashboardElement && adminPanel && collectionContainer) {
        const isShowingDashboard = !dashboardElement.hidden;
        
        dashboardElement.hidden = isShowingDashboard;
        adminPanel.hidden = !isShowingDashboard;
        collectionContainer.style.display = isShowingDashboard ? 'grid' : 'none';
        
        if (!isShowingDashboard) {
          dashboard.load();
        }
      }
    }
  });

  await auth.checkSession();
  await renderModels();
});
