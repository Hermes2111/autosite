import { apiClient } from './web/apiClient.js';
import { renderModels, setupFilters, setAuthGetter } from './web/gallery.js';
import { setupAuth } from './web/auth.js';
import { setupAdminForm } from './web/admin.js';
import { setupDashboard } from './web/dashboard.js';
import { setupQuickSale } from './web/quickSale.js';
import { setupCustomerManagement } from './web/customers.js';
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
  const quickSale = setupQuickSale(auth);
  const customers = setupCustomerManagement(auth);
  setupFilters(renderModels, auth, admin);

  // Admin tabs functionality
  const adminTabs = document.querySelectorAll('.admin-tab');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');
  
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Remove active class from all tabs and contents
      adminTabs.forEach(t => t.classList.remove('active'));
      adminTabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add('active');
        
        // Load data when tabs are clicked
        if (targetTab === 'dashboard') {
          dashboard.load();
        } else if (targetTab === 'customers') {
          customers.load();
        }
      }
    });
  });

  await auth.checkSession();
  await renderModels();
  
  // Load dashboard if admin panel is visible
  if (!document.getElementById('admin-panel').hidden) {
    dashboard.load();
  }
});
