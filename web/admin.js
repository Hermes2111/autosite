import { renderModels } from './gallery.js';

export function setupAdminForm(api, auth) {
  const panel = document.getElementById('admin-panel');
  const form = document.getElementById('admin-form');
  const cancel = document.getElementById('admin-cancel');
  const feedback = document.getElementById('admin-feedback');
  const imagesInput = document.getElementById('images');
  const editSection = document.getElementById('admin-edit-section');
  const modelSelect = document.getElementById('admin-model-select');
  const deleteButton = document.getElementById('admin-delete');
  const isSoldCheckbox = document.getElementById('is-sold-checkbox');
  const saleFields = document.getElementById('sale-fields');

  let editingId = null;

  if (!panel || !form) return {};

  // Toggle sale fields visibility based on isSold checkbox
  if (isSoldCheckbox && saleFields) {
    isSoldCheckbox.addEventListener('change', () => {
      saleFields.hidden = !isSoldCheckbox.checked;
      
      // Set soldDate to today if checked and empty
      if (isSoldCheckbox.checked && form.soldDate && !form.soldDate.value) {
        form.soldDate.value = new Date().toISOString().split('T')[0];
      }
    });
  }

  async function refreshModelList() {
    if (!editSection) return;
    editSection.hidden = false;

    try {
      const { items } = await api.get('/diecast-models');
      modelSelect.innerHTML = '<option value="">Selecteer een model om te bewerken</option>' +
        items.map(model => `<option value="${model.id}">${model.what} (${model.year})</option>`).join('');
    } catch (err) {
      modelSelect.innerHTML = '<option value="">Fout bij laden modellen</option>';
    }
  }

  function setEditingState(id) {
    editingId = id;
    if (deleteButton) {
      deleteButton.hidden = !editingId;
    }
  }

  modelSelect?.addEventListener('change', async (event) => {
    const id = Number(event.target.value);
    setEditingState(Number.isFinite(id) ? id : null);

    if (!editingId) {
      form.reset();
      imagesInput.value = '';
      return;
    }

    try {
      const model = await api.get(`/diecast-models/${editingId}`);
      form.year.value = model.year || '';
      form.what.value = model.what || '';
      form.scale.value = model.scale || '';
      form.specs.value = model.specs || '';
      form.numbers.value = model.numbers || '';
      form.price.value = model.price || '';
      if (form.teamId) form.teamId.value = model.teamId || '';
      if (form.isSold) {
        form.isSold.checked = model.isSold || false;
        // Toggle sale fields visibility
        if (saleFields) {
          saleFields.hidden = !model.isSold;
        }
      }
      
      // Load sale data if sold
      if (model.isSold) {
        if (form.soldDate) form.soldDate.value = model.soldDate ? new Date(model.soldDate).toISOString().split('T')[0] : '';
        if (form.soldPrice) form.soldPrice.value = model.soldPrice || '';
        if (form.soldTo) form.soldTo.value = model.soldTo || '';
        if (form.soldLocation) form.soldLocation.value = model.soldLocation || '';
        if (form.shippingCost) form.shippingCost.value = model.shippingCost || '';
        if (form.fees) form.fees.value = model.fees || '';
        if (form.isPaid) form.isPaid.checked = model.isPaid || false;
        if (form.saleNotes) form.saleNotes.value = model.saleNotes || '';
        if (form.salesChannel) form.salesChannel.value = model.salesChannel || '';
      }
      
      feedback.textContent = 'Model geladen. Je kan nu wijzigingen opslaan.';
      feedback.className = 'form-feedback';
    } catch (err) {
      feedback.textContent = 'Kan model niet laden.';
      feedback.className = 'form-feedback error';
    }
  });

  deleteButton?.addEventListener('click', async () => {
    if (!editingId) return;
    if (!confirm('Weet je zeker dat je dit model wilt verwijderen?')) return;

    try {
      await api.delete(`/admin/models/${editingId}`);
      feedback.textContent = 'Model verwijderd.';
      feedback.className = 'form-feedback success';
      form.reset();
      imagesInput.value = '';
      setEditingState(null);
      await renderModels();
      await refreshModelList();
    } catch (err) {
      feedback.textContent = 'Verwijderen mislukt.';
      feedback.className = 'form-feedback error';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    if (!auth.user || !auth.user.roles.includes('admin')) {
      feedback.textContent = 'Je hebt geen rechten om dit te doen.';
      feedback.classList.add('error');
      return;
    }

    try {
      const formData = new FormData(form);
      if (!imagesInput.files.length) {
        formData.delete('images');
      }
      
      // Add isSold as boolean
      formData.set('isSold', form.isSold.checked);
      
      // Add isPaid as boolean
      if (form.isSold.checked) {
        formData.set('isPaid', form.isPaid.checked);
      }
      
      // Clear sale data if not sold
      if (!form.isSold.checked) {
        formData.delete('soldDate');
        formData.delete('soldPrice');
        formData.delete('soldTo');
        formData.delete('soldLocation');
        formData.delete('shippingCost');
        formData.delete('fees');
        formData.delete('isPaid');
        formData.delete('saleNotes');
        formData.delete('salesChannel');
      }

      if (editingId) {
        await api.postForm(`/admin/models/${editingId}`, formData, 'PATCH');
        feedback.textContent = 'Model bijgewerkt!';
      } else {
        await api.postForm('/admin/models', formData);
        feedback.textContent = 'Model opgeslagen!';
      }
      feedback.classList.add('success');
      form.reset();
      imagesInput.value = '';
      setEditingState(null);
      await renderModels();
      await refreshModelList();
    } catch (err) {
      feedback.textContent = 'Opslaan mislukt. Controleer de invoer.';
      feedback.classList.add('error');
    }
  });

  cancel.addEventListener('click', () => {
    form.reset();
    imagesInput.value = '';
    feedback.textContent = '';
    feedback.className = 'form-feedback';
    setEditingState(null);
    if (modelSelect) modelSelect.value = '';
  });

  return {
    show() {
      panel.hidden = false;
      refreshModelList();
    },
      hide() {
      panel.hidden = true;
      setEditingState(null);
    },
  };
}

