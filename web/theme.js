// Theme management module
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('autosite.theme') || 'dark';
    this.init();
  }

  init() {
    // Set initial theme
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('autosite.theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('autosite.theme', theme);
    
    // Update theme toggle button if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

    // Dispatch event for any components that need to know
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

export const themeManager = new ThemeManager();



