import { apiClient } from './apiClient.js';
import { renderModels } from './gallery.js';

export function setupQuickSale(auth) {
  const searchInput = document.getElementById('quick-sale-search');
  const suggestionsBox = document.getElementById('model-suggestions');
  const selectedModelInfo = document.getElementById('selected-model-info');
  const quickSaleForm = document.getElementById('quick-sale-form');
  const feedback = document.getElementById('quick-sale-feedback');
  const clearButton = document.getElementById('clear-selection');
  const cancelButton = document.getElementById('quick-sale-cancel');
  
  let allModels = [];
  let selectedModel = null;

  // Setup Admin Tabs
  setupAdminTabs();

  // Load models
  loadModels();

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.model-search-wrapper')) {
        suggestionsBox.hidden = true;
      }
    });
  }

  // Clear selection
  if (clearButton) {
    clearButton.addEventListener('click', clearSelection);
  }

  // Cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', clearSelection);
  }

  // Quick sale form submission
  if (quickSaleForm) {
    // Set today's date by default
    const dateInput = quickSaleForm.querySelector('[name="soldDate"]');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    quickSaleForm.addEventListener('submit', handleQuickSale);
  }

  async function loadModels() {
    try {
      const { items } = await apiClient.get('/diecast-models');
      allModels = items.filter(item => !item.isSold); // Only show unsold items
      updateAdminStats(items);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  function updateAdminStats(items) {
    const totalItems = items.length;
    const soldItems = items.filter(item => item.isSold).length;
    const availableItems = totalItems - soldItems;

    const totalStat = document.getElementById('total-items-stat');
    const soldStat = document.getElementById('sold-items-stat');
    const availableStat = document.getElementById('available-items-stat');

    if (totalStat) totalStat.textContent = totalItems;
    if (soldStat) soldStat.textContent = soldItems;
    if (availableStat) availableStat.textContent = availableItems;
  }

  function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      suggestionsBox.hidden = true;
      return;
    }

    const matches = allModels.filter(model => {
      const matchesName = model.what && model.what.toLowerCase().includes(query);
      const matchesYear = model.year && model.year.toString().includes(query);
      const matchesSpecs = model.specs && model.specs.toLowerCase().includes(query);
      return matchesName || matchesYear || matchesSpecs;
    }).slice(0, 10); // Limit to 10 results

    displaySuggestions(matches);
  }

  function displaySuggestions(matches) {
    if (matches.length === 0) {
      suggestionsBox.innerHTML = '<div class="suggestion-item"><div class="suggestion-item-name">Geen resultaten gevonden</div></div>';
      suggestionsBox.hidden = false;
      return;
    }

    suggestionsBox.innerHTML = matches.map(model => `
      <div class="suggestion-item" data-model-id="${model.id}">
        <div class="suggestion-item-name">${model.what}</div>
        <div class="suggestion-item-details">
          <span><i class="fas fa-calendar"></i> ${model.year}</span>
          <span><i class="fas fa-tag"></i> €${model.price || '0'}</span>
          <span><i class="fas fa-ruler"></i> ${model.scale || 'N/A'}</span>
        </div>
      </div>
    `).join('');

    // Add click listeners
    suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const modelId = parseInt(item.getAttribute('data-model-id'));
        const model = allModels.find(m => m.id === modelId);
        if (model) {
          selectModel(model);
        }
      });
    });

    suggestionsBox.hidden = false;
  }

  function selectModel(model) {
    selectedModel = model;
    
    // Hide suggestions
    suggestionsBox.hidden = true;
    
    // Clear search input
    searchInput.value = '';
    
    // Show selected model info
    document.getElementById('selected-model-name').textContent = model.what;
    document.getElementById('selected-model-year').textContent = model.year;
    document.getElementById('selected-model-price').textContent = model.price || '0';
    document.getElementById('selected-model-scale').textContent = model.scale || 'N/A';
    selectedModelInfo.hidden = false;
    
    // Show form
    document.getElementById('quick-sale-model-id').value = model.id;
    quickSaleForm.hidden = false;
    
    // Pre-fill soldPrice with original price
    const soldPriceInput = quickSaleForm.querySelector('[name="soldPrice"]');
    if (soldPriceInput && model.price) {
      soldPriceInput.value = model.price;
    }
  }

  function clearSelection() {
    selectedModel = null;
    selectedModelInfo.hidden = true;
    quickSaleForm.hidden = true;
    quickSaleForm.reset();
    searchInput.value = '';
    feedback.textContent = '';
    
    // Reset today's date
    const dateInput = quickSaleForm.querySelector('[name="soldDate"]');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  async function handleQuickSale(e) {
    e.preventDefault();
    
    if (!selectedModel) {
      feedback.textContent = 'Geen model geselecteerd';
      feedback.className = 'form-feedback error';
      return;
    }

    feedback.textContent = '';
    
    try {
      const formData = new FormData(quickSaleForm);
      
      // Create update payload
      const updateData = {
        isSold: true,
        soldDate: formData.get('soldDate'),
        soldPrice: formData.get('soldPrice'),
        salesChannel: formData.get('salesChannel'),
        soldTo: formData.get('soldTo') || null,
        soldLocation: formData.get('soldLocation') || null,
        shippingCost: formData.get('shippingCost') || '0',
        fees: formData.get('fees') || '0',
        isPaid: formData.get('isPaid') === 'on'
      };

      // Use JSON instead of FormData for PATCH
      await apiClient.request(`/admin/models/${selectedModel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      feedback.textContent = `✓ ${selectedModel.what} succesvol geregistreerd als verkocht!`;
      feedback.className = 'form-feedback success';
      
      // Reload data
      await loadModels();
      await renderModels();
      
      // Clear form after short delay
      setTimeout(() => {
        clearSelection();
      }, 2000);
      
    } catch (error) {
      console.error('Quick sale error:', error);
      feedback.textContent = 'Fout bij registreren verkoop. Probeer opnieuw.';
      feedback.className = 'form-feedback error';
    }
  }

  function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }

        // Load data for manage items tab
        if (targetTab === 'manage-items') {
          loadManageItems();
        }
      });
    });
  }

  async function loadManageItems() {
    const manageSelect = document.getElementById('admin-model-select-manage');
    if (!manageSelect) return;

    try {
      const { items } = await apiClient.get('/diecast-models');
      manageSelect.innerHTML = '<option value="">Selecteer een model...</option>' +
        items.map(model => {
          const status = model.isSold ? '🔴 Verkocht' : '🟢 Beschikbaar';
          return `<option value="${model.id}">${status} - ${model.what} (${model.year})</option>`;
        }).join('');
    } catch (error) {
      manageSelect.innerHTML = '<option value="">Fout bij laden</option>';
    }
  }

  return {
    reload: loadModels
  };
}



