import { apiClient } from './web/apiClient.js';
import { renderModels, setupFilters, setAuthGetter } from './web/gallery.js';
import { setupAuth } from './web/auth.js';
import { setupAdminForm } from './web/admin.js';
import { i18n } from './web/i18n.js';
import { themeManager } from './web/theme.js';

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

document.addEventListener('DOMContentLoaded', async () => {
  const auth = setupAuth(apiClient);
  setAuthGetter(() => auth);
  const admin = setupAdminForm(apiClient, auth);
  setupFilters(renderModels, auth, admin);

  await auth.checkSession();
  await renderModels();
});
