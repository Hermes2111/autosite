// Internationalization (i18n) module
const translations = {
  nl: {
    // Navigation
    'nav.collection': 'Collectie',
    'nav.about': 'Over',
    'nav.contact': 'Contact',
    'nav.login': 'Inloggen',
    'nav.logout': 'Uitloggen',
    
    // Hero
    'hero.title': 'Formule 1 Modelauto Collectie',
    'hero.subtitle': 'Premium verzameling Formule 1 memorabilia & schaalmodellen',
    
    // Search & Filters
    'filter.search': 'Zoek in collectie...',
    'filter.allYears': 'Alle jaren',
    'filter.allScales': 'Alle schalen',
    'filter.sortNewest': 'Nieuwste eerst',
    'filter.sortOldest': 'Oudste eerst',
    'filter.sortPriceHigh': 'Prijs (hoog-laag)',
    'filter.sortPriceLow': 'Prijs (laag-hoog)',
    
    // Statistics
    'stats.totalItems': 'Totaal items',
    'stats.uniqueYears': 'Unieke jaren',
    'stats.totalValue': 'Totale waarde',
    'stats.withImages': 'Met foto\'s',
    
    // Cards
    'card.year': 'Jaar',
    'card.scale': 'Schaal',
    'card.specs': 'Specs',
    'card.number': 'Nummer',
    'card.photos': 'Foto\'s',
    'card.contact': 'Contact',
    'card.watchlist': 'Watchlist',
    'card.inWatchlist': 'In watchlist',
    'card.unknown': 'Onbekend',
    
    // Modal
    'modal.close': 'Sluiten',
    'modal.previous': 'Vorige',
    'modal.next': 'Volgende',
    'modal.zoomIn': 'Zoom in',
    'modal.zoomOut': 'Zoom uit',
    'modal.resetZoom': 'Reset zoom',
    'modal.rotate': 'Automatisch draaien',
    
    // Auth
    'auth.welcomeBack': 'Welkom terug',
    'auth.loginSubtitle': 'Log in met je account',
    'auth.createAccount': 'Account aanmaken',
    'auth.registerSubtitle': 'Maak een nieuw account aan',
    'auth.email': 'E-mailadres',
    'auth.password': 'Wachtwoord',
    'auth.name': 'Naam',
    'auth.loginButton': 'Inloggen',
    'auth.registerButton': 'Maak account',
    'auth.googleLogin': 'Inloggen met Google',
    'auth.or': 'of',
    'auth.loginFailed': 'Inloggen mislukt. Controleer je gegevens.',
    'auth.registerFailed': 'Registratie mislukt. Probeer opnieuw.',
    'auth.advanced': 'Geavanceerde instellingen',
    'auth.backendUrl': 'Backend URL',
    'auth.rememberUrl': 'Onthoud URL',
    
    // Admin
    'admin.title': 'Admin – Nieuw model toevoegen',
    'admin.subtitle': 'Upload nieuwe modellen direct in de collectie.',
    'admin.save': 'Opslaan',
    'admin.cancel': 'Annuleren',
    'admin.delete': 'Verwijder',
    'admin.editExisting': 'Bestaande modellen beheren',
    'admin.selectModel': 'Selecteer een model om te bewerken of verwijderen.',
    'admin.loading': 'Laden...',
    
    // Messages
    'message.noModels': 'Geen modellen gevonden',
    'message.adjustFilters': 'Pas je zoekcriteria aan.',
    'message.error': 'Er is iets misgegaan',
    'message.apiError': 'Kan geen verbinding maken met de API. Controleer of de backend draait op',
    'message.retry': 'Probeer opnieuw',
    'message.actionFailed': 'Actie mislukt. Probeer opnieuw.',
    
    // Footer
    'footer.about': 'Over de collectie',
    'footer.aboutText': 'Een exclusieve verzameling Formule 1 modelauto\'s en memorabilia, zorgvuldig samengesteld over meerdere decennia.',
    'footer.navigation': 'Navigatie',
    'footer.privacy': 'Privacybeleid',
    'footer.copyright': '© 2024 F1 Model Collection. Alle rechten voorbehouden.',
  },
  
  en: {
    // Navigation
    'nav.collection': 'Collection',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.title': 'Formula 1 Model Car Collection',
    'hero.subtitle': 'Premium collection of Formula 1 memorabilia & scale models',
    
    // Search & Filters
    'filter.search': 'Search in collection...',
    'filter.allYears': 'All years',
    'filter.allScales': 'All scales',
    'filter.sortNewest': 'Newest first',
    'filter.sortOldest': 'Oldest first',
    'filter.sortPriceHigh': 'Price (high-low)',
    'filter.sortPriceLow': 'Price (low-high)',
    
    // Statistics
    'stats.totalItems': 'Total items',
    'stats.uniqueYears': 'Unique years',
    'stats.totalValue': 'Total value',
    'stats.withImages': 'With photos',
    
    // Cards
    'card.year': 'Year',
    'card.scale': 'Scale',
    'card.specs': 'Specs',
    'card.number': 'Number',
    'card.photos': 'Photos',
    'card.contact': 'Contact',
    'card.watchlist': 'Watchlist',
    'card.inWatchlist': 'In watchlist',
    'card.unknown': 'Unknown',
    
    // Modal
    'modal.close': 'Close',
    'modal.previous': 'Previous',
    'modal.next': 'Next',
    'modal.zoomIn': 'Zoom in',
    'modal.zoomOut': 'Zoom out',
    'modal.resetZoom': 'Reset zoom',
    'modal.rotate': 'Auto rotate',
    
    // Auth
    'auth.welcomeBack': 'Welcome back',
    'auth.loginSubtitle': 'Log in with your account',
    'auth.createAccount': 'Create account',
    'auth.registerSubtitle': 'Create a new account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Create account',
    'auth.googleLogin': 'Sign in with Google',
    'auth.or': 'or',
    'auth.loginFailed': 'Login failed. Check your credentials.',
    'auth.registerFailed': 'Registration failed. Try again.',
    'auth.advanced': 'Advanced settings',
    'auth.backendUrl': 'Backend URL',
    'auth.rememberUrl': 'Remember URL',
    
    // Admin
    'admin.title': 'Admin – Add new model',
    'admin.subtitle': 'Upload new models directly to the collection.',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.delete': 'Delete',
    'admin.editExisting': 'Manage existing models',
    'admin.selectModel': 'Select a model to edit or delete.',
    'admin.loading': 'Loading...',
    
    // Messages
    'message.noModels': 'No models found',
    'message.adjustFilters': 'Adjust your search criteria.',
    'message.error': 'Something went wrong',
    'message.apiError': 'Cannot connect to the API. Check if the backend is running on',
    'message.retry': 'Try again',
    'message.actionFailed': 'Action failed. Try again.',
    
    // Footer
    'footer.about': 'About the collection',
    'footer.aboutText': 'An exclusive collection of Formula 1 model cars and memorabilia, carefully compiled over multiple decades.',
    'footer.navigation': 'Navigation',
    'footer.privacy': 'Privacy Policy',
    'footer.copyright': '© 2024 F1 Model Collection. All rights reserved.',
  },
  
  fr: {
    // Navigation
    'nav.collection': 'Collection',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    
    // Hero
    'hero.title': 'Collection de Modèles Réduits F1',
    'hero.subtitle': 'Collection premium de souvenirs et modèles réduits de Formule 1',
    
    // Search & Filters
    'filter.search': 'Rechercher dans la collection...',
    'filter.allYears': 'Toutes les années',
    'filter.allScales': 'Toutes les échelles',
    'filter.sortNewest': 'Plus récent',
    'filter.sortOldest': 'Plus ancien',
    'filter.sortPriceHigh': 'Prix (élevé-bas)',
    'filter.sortPriceLow': 'Prix (bas-élevé)',
    
    // Statistics
    'stats.totalItems': 'Total d\'articles',
    'stats.uniqueYears': 'Années uniques',
    'stats.totalValue': 'Valeur totale',
    'stats.withImages': 'Avec photos',
    
    // Cards
    'card.year': 'Année',
    'card.scale': 'Échelle',
    'card.specs': 'Specs',
    'card.number': 'Numéro',
    'card.photos': 'Photos',
    'card.contact': 'Contact',
    'card.watchlist': 'Liste de surveillance',
    'card.inWatchlist': 'Dans la liste',
    'card.unknown': 'Inconnu',
    
    // Modal
    'modal.close': 'Fermer',
    'modal.previous': 'Précédent',
    'modal.next': 'Suivant',
    'modal.zoomIn': 'Zoom avant',
    'modal.zoomOut': 'Zoom arrière',
    'modal.resetZoom': 'Réinitialiser zoom',
    'modal.rotate': 'Rotation automatique',
    
    // Auth
    'auth.welcomeBack': 'Bon retour',
    'auth.loginSubtitle': 'Connectez-vous avec votre compte',
    'auth.createAccount': 'Créer un compte',
    'auth.registerSubtitle': 'Créer un nouveau compte',
    'auth.email': 'Adresse e-mail',
    'auth.password': 'Mot de passe',
    'auth.name': 'Nom',
    'auth.loginButton': 'Connexion',
    'auth.registerButton': 'Créer un compte',
    'auth.googleLogin': 'Se connecter avec Google',
    'auth.or': 'ou',
    'auth.loginFailed': 'Échec de la connexion. Vérifiez vos identifiants.',
    'auth.registerFailed': 'Échec de l\'inscription. Réessayez.',
    'auth.advanced': 'Paramètres avancés',
    'auth.backendUrl': 'URL du backend',
    'auth.rememberUrl': 'Mémoriser l\'URL',
    
    // Admin
    'admin.title': 'Admin – Ajouter un nouveau modèle',
    'admin.subtitle': 'Télécharger de nouveaux modèles directement dans la collection.',
    'admin.save': 'Enregistrer',
    'admin.cancel': 'Annuler',
    'admin.delete': 'Supprimer',
    'admin.editExisting': 'Gérer les modèles existants',
    'admin.selectModel': 'Sélectionnez un modèle à modifier ou supprimer.',
    'admin.loading': 'Chargement...',
    
    // Messages
    'message.noModels': 'Aucun modèle trouvé',
    'message.adjustFilters': 'Ajustez vos critères de recherche.',
    'message.error': 'Une erreur s\'est produite',
    'message.apiError': 'Impossible de se connecter à l\'API. Vérifiez si le backend fonctionne sur',
    'message.retry': 'Réessayer',
    'message.actionFailed': 'Action échouée. Réessayez.',
    
    // Footer
    'footer.about': 'À propos de la collection',
    'footer.aboutText': 'Une collection exclusive de voitures miniatures et de souvenirs de Formule 1, soigneusement compilée au fil des décennies.',
    'footer.navigation': 'Navigation',
    'footer.privacy': 'Politique de confidentialité',
    'footer.copyright': '© 2024 F1 Model Collection. Tous droits réservés.',
  },
};

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('autosite.language') || 'nl';
    this.translations = translations;
  }

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('autosite.language', lang);
      document.documentElement.lang = lang;
      this.updatePage();
    }
  }

  t(key) {
    return this.translations[this.currentLanguage]?.[key] || key;
  }

  updatePage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Dispatch event for dynamic content updates
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: this.currentLanguage } }));
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
}

export const i18n = new I18n();

