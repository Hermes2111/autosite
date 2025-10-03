export function setupCustomerManagement(auth) {
  const customersTable = document.getElementById('customers-table-body');
  const customerModal = document.getElementById('customer-modal');
  const customerForm = document.getElementById('customer-form');
  const addCustomerBtn = document.getElementById('add-customer-btn');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  
  let editingCustomerId = null;
  let allCustomers = [];

  async function loadCustomers() {
    try {
      const token = auth.getToken();
      const response = await fetch('http://localhost:3000/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load customers');
      
      allCustomers = await response.json();
      renderCustomersTable();
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }

  function renderCustomersTable() {
    if (!customersTable) return;
    
    if (allCustomers.length === 0) {
      customersTable.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px;">
            Nog geen klanten toegevoegd
          </td>
        </tr>
      `;
      return;
    }

    customersTable.innerHTML = allCustomers.map(customer => {
      const purchaseCount = customer.purchases?.length || 0;
      const totalSpent = customer.purchases?.reduce((sum, p) => {
        return sum + (parseFloat(p.soldPrice) || 0);
      }, 0) || 0;
      
      return `
        <tr>
          <td>
            <strong>${customer.name}</strong>
            ${customer.isRepeatCustomer ? '<span class="repeat-badge">🔄 Repeat</span>' : ''}
          </td>
          <td>${customer.email || '-'}</td>
          <td>${customer.phone || '-'}</td>
          <td>${customer.city || '-'}, ${customer.country || '-'}</td>
          <td>${purchaseCount}</td>
          <td>€${totalSpent.toFixed(2)}</td>
          <td class="actions">
            <button class="btn-icon" onclick="window.viewCustomer(${customer.id})" title="Bekijk">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" onclick="window.editCustomer(${customer.id})" title="Bewerk">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon danger" onclick="window.deleteCustomer(${customer.id})" title="Verwijder">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function saveCustomer(e) {
    e.preventDefault();
    
    const formData = new FormData(customerForm);
    const customerData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      country: formData.get('country'),
      notes: formData.get('notes')
    };

    try {
      const token = auth.getToken();
      const url = editingCustomerId 
        ? `http://localhost:3000/api/customers/${editingCustomerId}`
        : 'http://localhost:3000/api/customers';
      
      const response = await fetch(url, {
        method: editingCustomerId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) throw new Error('Failed to save customer');

      closeCustomerModal();
      await loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Fout bij opslaan klant');
    }
  }

  function openCustomerModal(customer = null) {
    if (!customerModal) return;
    
    editingCustomerId = customer?.id || null;
    customerForm.reset();
    
    if (customer) {
      customerForm.name.value = customer.name || '';
      customerForm.email.value = customer.email || '';
      customerForm.phone.value = customer.phone || '';
      customerForm.address.value = customer.address || '';
      customerForm.city.value = customer.city || '';
      customerForm.country.value = customer.country || '';
      customerForm.notes.value = customer.notes || '';
      
      document.getElementById('modal-title').textContent = 'Klant Bewerken';
    } else {
      document.getElementById('modal-title').textContent = 'Nieuwe Klant';
    }
    
    customerModal.hidden = false;
  }

  function closeCustomerModal() {
    if (!customerModal) return;
    customerModal.hidden = true;
    editingCustomerId = null;
    customerForm.reset();
  }

  async function viewCustomer(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (!customer) return;
    
    const detailModal = document.getElementById('customer-detail-modal');
    if (!detailModal) return;
    
    const purchases = customer.purchases || [];
    const totalSpent = purchases.reduce((sum, p) => sum + (parseFloat(p.soldPrice) || 0), 0);
    
    document.getElementById('customer-detail-content').innerHTML = `
      <div class="customer-detail-header">
        <h3>${customer.name} ${customer.isRepeatCustomer ? '<span class="repeat-badge">🔄 Repeat Customer</span>' : ''}</h3>
        <div class="customer-contact">
          ${customer.email ? `<p>📧 ${customer.email}</p>` : ''}
          ${customer.phone ? `<p>📱 ${customer.phone}</p>` : ''}
          ${customer.address ? `<p>📍 ${customer.address}, ${customer.city || ''}, ${customer.country || ''}</p>` : ''}
        </div>
        ${customer.notes ? `<div class="customer-notes"><strong>Notities:</strong><p>${customer.notes}</p></div>` : ''}
      </div>
      
      <div class="customer-stats">
        <div class="stat-box">
          <div class="stat-value">${purchases.length}</div>
          <div class="stat-label">Aankopen</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">€${totalSpent.toFixed(2)}</div>
          <div class="stat-label">Totaal Besteed</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">€${purchases.length > 0 ? (totalSpent / purchases.length).toFixed(2) : '0.00'}</div>
          <div class="stat-label">Gem. per Aankoop</div>
        </div>
      </div>
      
      <h4>Aankoopgeschiedenis</h4>
      ${purchases.length > 0 ? `
        <table class="purchase-history-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Item</th>
              <th>Prijs</th>
              <th>Kanaal</th>
            </tr>
          </thead>
          <tbody>
            ${purchases.map(p => `
              <tr>
                <td>${p.soldDate ? new Date(p.soldDate).toLocaleDateString('nl-NL') : '-'}</td>
                <td>${p.what} (${p.year})</td>
                <td>€${parseFloat(p.soldPrice || 0).toFixed(2)}</td>
                <td>${p.salesChannel || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="text-align: center; color: #666;">Nog geen aankopen</p>'}
    `;
    
    detailModal.hidden = false;
  }

  async function deleteCustomer(id) {
    if (!confirm('Weet je zeker dat je deze klant wilt verwijderen?')) return;
    
    try {
      const token = auth.getToken();
      const response = await fetch(`http://localhost:3000/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Fout bij verwijderen klant');
    }
  }

  // Expose functions globally for inline onclick handlers
  window.viewCustomer = viewCustomer;
  window.editCustomer = (id) => {
    const customer = allCustomers.find(c => c.id === id);
    if (customer) openCustomerModal(customer);
  };
  window.deleteCustomer = deleteCustomer;

  // Event listeners
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener('click', () => openCustomerModal());
  }

  if (customerForm) {
    customerForm.addEventListener('submit', saveCustomer);
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (customerModal) customerModal.hidden = true;
      const detailModal = document.getElementById('customer-detail-modal');
      if (detailModal) detailModal.hidden = true;
    });
  });

  return {
    load: loadCustomers,
    getAll: () => allCustomers
  };
}

