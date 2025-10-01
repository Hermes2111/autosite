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

  let editingId = null;

  if (!panel || !form) return {};

  async function refreshModelList() {
    if (!editSection) return;
    editSection.hidden = false;

    try {
      const { items } = await api.get('/diecast-models');
      modelSelect.innerHTML = '<option value="">Selecteer een model om te bewerken</option>' +
        items.map(model => `<option value="${model.id}">${model.what} (${model.year})</option>`).join('');
    } catch (err) {
      console.error('Kan model-lijst niet laden', err);
      modelSelect.innerHTML = '<option value="">Fout bij laden</option>';
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
      feedback.textContent = 'Model geladen. Je kan nu wijzigingen opslaan.';
      feedback.className = 'form-feedback';
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
