import { apiClient } from './apiClient.js';

const collectionContainer = document.getElementById('collectie-container');
const loadingElement = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const yearFilter = document.getElementById('year-filter');
const scaleFilter = document.getElementById('scale-filter');
const sortBy = document.getElementById('sort-by');
const totalItemsElement = document.getElementById('total-items');
const uniqueYearsElement = document.getElementById('unique-years');
const totalValueElement = document.getElementById('total-value');
const withImagesElement = document.getElementById('with-images');

const modal = document.getElementById('image-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalCounter = document.getElementById('modal-counter');
const modalImage = document.getElementById('modal-image');
const modalThumbnails = document.getElementById('modal-thumbnails');
const closeModal = document.getElementById('close-modal');
const navPrev = document.getElementById('nav-prev');
const navNext = document.getElementById('nav-next');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const zoomResetBtn = document.getElementById('zoom-reset');
const rotateToggleBtn = document.getElementById('rotate-toggle');

let allModels = [];
let filteredModels = [];
let currentImages = [];
let currentImageIndex = 0;
let watchlist = new Set();
let authGetter = null;
let currentZoom = 1;
let currentPan = { x: 0, y: 0 };
let isPanning = false;
let panStart = { x: 0, y: 0 };
let rotateInterval = null;

export function setAuthGetter(fn) {
  authGetter = fn;
}

export async function fetchModels() {
  try {
    const response = await apiClient.get('/diecast-models');
    allModels = response?.items ?? [];
    return allModels;
  } catch (error) {
    console.error('Error fetching models:', error);
    allModels = [];
    throw error;
  }
}

async function fetchWatchlist() {
  const auth = authGetter?.();
  if (!auth?.user) {
    watchlist = new Set();
    return;
  }

  try {
    const items = await apiClient.get('/watchlist');
    watchlist = new Set(items.map(item => item.model.id));
  } catch (err) {
    console.warn('Kon watchlist niet ophalen', err);
    watchlist = new Set();
  }
}

export async function renderModels() {
  if (!loadingElement || !collectionContainer) {
    console.error('Required DOM elements not found');
    return;
  }
  
  loadingElement.style.display = 'block';
  collectionContainer.innerHTML = '';
  
  try {
    await fetchModels();
    await fetchWatchlist();
    filteredModels = [...allModels];
    updateFilters();
    updateStatistics(filteredModels);
    drawCards(filteredModels);
  } catch (error) {
    console.error('Error rendering models:', error);
    collectionContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 64px 24px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--danger, #e74c3c); margin-bottom: 24px;"></i>
        <h3 style="font-size: 1.75rem; margin-bottom: 12px;">Er is iets misgegaan</h3>
        <p style="color: var(--text-secondary);">Kan geen verbinding maken met de API. Controleer of de backend draait op <code>http://localhost:3000</code></p>
        <p style="color: var(--text-secondary); margin-top: 12px;">Error: ${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 24px; padding: 12px 24px; background: var(--primary, #3498db); color: white; border: none; border-radius: 8px; cursor: pointer;">
          Probeer opnieuw
        </button>
      </div>
    `;
  } finally {
    loadingElement.style.display = 'none';
  }
}

function updateFilters() {
  const years = Array.from(new Set(allModels.map(m => m.year).filter(Boolean))).sort((a, b) => b - a);
  yearFilter.innerHTML = '<option value="">Alle jaren</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
}

function drawCards(models) {
  collectionContainer.innerHTML = '';
  
  if (models.length === 0) {
    collectionContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 64px 24px;">
        <i class="fas fa-search" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 24px;"></i>
        <h3 style="font-size: 1.75rem; margin-bottom: 12px;">Geen modellen gevonden</h3>
        <p style="color: var(--text-secondary);">Pas je zoekcriteria aan.</p>
      </div>
    `;
    return;
  }

  const auth = authGetter?.();

  for (const model of models) {
    const card = document.createElement('div');
    card.className = 'model-card';

    const images = Array.isArray(model.imageUrls) ? model.imageUrls : [];
    const imageCount = images.length;

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'card-image-wrapper';

    if (imageCount > 0) {
      const img = document.createElement('img');
      img.src = images[0];
      img.alt = model.what;
      img.className = 'card-image';
      img.loading = 'lazy';
      imageWrapper.appendChild(img);

      imageWrapper.addEventListener('click', (event) => {
        event.stopPropagation();
        openImageModal(images, model.what);
      });

      if (imageCount > 1) {
        const grid = document.createElement('div');
        grid.className = 'card-image-grid';
        const tiles = images.slice(0, 4);
        while (tiles.length && tiles.length < 4) {
          tiles.push(tiles[tiles.length - 1]);
        }
        tiles.forEach((src, index) => {
          if (!src) return;
          const tile = document.createElement('div');
          tile.className = 'card-grid-tile';
          tile.style.backgroundImage = `url(${src})`;
          tile.dataset.index = String(index);
          grid.appendChild(tile);
        });
        grid.addEventListener('click', (event) => {
          event.stopPropagation();
          openImageModal(images, model.what);
        });
        imageWrapper.appendChild(grid);
      }

      if (imageCount > 1) {
        const badge = document.createElement('div');
        badge.className = 'image-badge';
        badge.innerHTML = `<i class="fas fa-images"></i> ${imageCount}`;
        imageWrapper.appendChild(badge);
      }
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-image';
      placeholder.innerHTML = '<i class="fas fa-car-side"></i>';
      imageWrapper.appendChild(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'card-body';

    const year = document.createElement('span');
    year.className = 'card-year';
    year.textContent = model.year || 'Onbekend';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = model.what;

    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'card-details';
    if (model.scale) detailsContainer.innerHTML += detailRow('Schaal', model.scale);
    if (model.specs) detailsContainer.innerHTML += detailRow('Specs', model.specs);
    if (model.numbers) detailsContainer.innerHTML += detailRow('Nummer', model.numbers);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    if (model.price) {
      const price = document.createElement('div');
      price.className = 'card-price';
      price.textContent = `€${model.price}`;
      footer.appendChild(price);
    } else {
      footer.appendChild(document.createElement('div'));
    }

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    if (images.length) {
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-secondary view-images';
      viewBtn.innerHTML = '<i class="fas fa-images"></i> Foto\'s';
      viewBtn.addEventListener('click', () => openImageModal(images, model.what));
      actions.appendChild(viewBtn);
    }

    const contactLink = document.createElement('a');
    contactLink.href = `mailto:hermesvansteenbrugge1@gmail.com?subject=Vraag over ${model.what}`;
    contactLink.className = 'btn btn-primary';
    contactLink.innerHTML = '<i class="fas fa-envelope"></i> Contact';
    actions.appendChild(contactLink);

    if (auth?.user) {
      const watchBtn = createWatchlistButton(model.id);
      actions.appendChild(watchBtn);
    }

    footer.appendChild(actions);

    body.appendChild(year);
    body.appendChild(title);
    body.appendChild(detailsContainer);
    body.appendChild(footer);

    card.appendChild(imageWrapper);
    card.appendChild(body);

    if (auth?.user?.roles?.includes('admin')) {
      enableAdminDrop(card, model);
    }

    collectionContainer.appendChild(card);
  }
}

function createWatchlistButton(modelId) {
  const isInWatchlist = watchlist.has(modelId);
  const button = document.createElement('button');
  button.className = `watchlist-button ${isInWatchlist ? 'added' : ''}`;
  button.innerHTML = `<i class="fas fa-star"></i>${isInWatchlist ? 'In watchlist' : 'Watchlist'}`;

  button.addEventListener('click', async () => {
    try {
      if (watchlist.has(modelId)) {
        await apiClient.request(`/watchlist/${modelId}`, { method: 'DELETE' });
        watchlist.delete(modelId);
        button.classList.remove('added');
        button.innerHTML = '<i class="fas fa-star"></i>Watchlist';
      } else {
        await apiClient.request(`/watchlist/${modelId}`, { method: 'POST' });
        watchlist.add(modelId);
        button.classList.add('added');
        button.innerHTML = '<i class="fas fa-star"></i>In watchlist';
      }
    } catch (err) {
      console.error(err);
      alert('Actie mislukt. Probeer opnieuw.');
    }
  });

  return button;
}

function enableAdminDrop(card, model) {
  card.classList.add('admin-card');
  const dropHint = document.createElement('div');
  dropHint.className = 'card-drop-hint';
  const icon = document.createElement('i');
  icon.className = 'fas fa-cloud-upload-alt';
  const text = document.createElement('span');
  text.textContent = "Sleep foto's hierheen om te vervangen";
  dropHint.append(icon, text);
  card.appendChild(dropHint);

  let dragCounter = 0;

  const resetHint = () => {
    card.classList.remove('drop-active', 'drop-uploading', 'drop-success', 'drop-error');
    icon.className = 'fas fa-cloud-upload-alt';
    text.textContent = "Sleep foto's hierheen om te vervangen";
  };

  const hasFiles = (event) => {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  };

  card.addEventListener('dragenter', (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragCounter += 1;
    card.classList.add('drop-active');
  });

  card.addEventListener('dragover', (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });

  card.addEventListener('dragleave', (event) => {
    if (!hasFiles(event)) return;
    if (!card.contains(event.relatedTarget)) {
      dragCounter = Math.max(0, dragCounter - 1);
      if (dragCounter === 0) {
        card.classList.remove('drop-active');
      }
    }
  });

  card.addEventListener('drop', async (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragCounter = 0;
    card.classList.remove('drop-active');

    const files = Array.from(event.dataTransfer.files ?? []).filter(file => file.type.startsWith('image/'));
    if (!files.length) {
      icon.className = 'fas fa-times';
      text.textContent = 'Alleen afbeeldingsbestanden toegestaan';
      card.classList.add('drop-error');
      setTimeout(resetHint, 2000);
      return;
    }

    card.classList.add('drop-uploading');
    icon.className = 'fas fa-spinner fa-spin';
    text.textContent = 'Uploaden...';

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      await apiClient.postForm(`/admin/models/${model.id}`, formData, 'PATCH');
      card.classList.remove('drop-uploading');
      card.classList.add('drop-success');
      icon.className = 'fas fa-check';
      text.textContent = 'Foto\'s opgeslagen';
      setTimeout(() => {
        resetHint();
        renderModels();
      }, 400);
    } catch (err) {
      console.error(err);
      card.classList.remove('drop-uploading');
      card.classList.add('drop-error');
      icon.className = 'fas fa-times';
      text.textContent = 'Upload mislukt';
      setTimeout(resetHint, 2000);
    }
  });
}

function detailRow(label, value) {
  return `
    <div class="detail-row">
      <span class="detail-label">${label}</span>
      <span class="detail-value">${value}</span>
    </div>
  `;
}

function updateStatistics(models) {
  totalItemsElement.textContent = models.length;
  uniqueYearsElement.textContent = new Set(models.map(m => m.year).filter(Boolean)).size;
  const totalValue = models.reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0);
  totalValueElement.textContent = totalValue.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  withImagesElement.textContent = models.filter(m => (m.imageUrls ?? []).length > 0).length;
}

export function setupFilters(renderFn, auth, admin) {
  function filterModels() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedYear = yearFilter.value;
    const selectedScale = scaleFilter.value;
    const sort = sortBy.value;

    filteredModels = allModels.filter(model => {
      const matchesSearch = !searchTerm ||
        (model.what && model.what.toLowerCase().includes(searchTerm)) ||
        (model.specs && model.specs.toLowerCase().includes(searchTerm)) ||
        (model.numbers && model.numbers.toLowerCase().includes(searchTerm));

      const matchesYear = !selectedYear || model.year === selectedYear;
      const matchesScale = !selectedScale || (model.scale && model.scale.includes(selectedScale));
      return matchesSearch && matchesYear && matchesScale;
    });

    switch (sort) {
      case 'year-desc':
        filteredModels.sort((a, b) => (b.year || 0) - (a.year || 0)); break;
      case 'year-asc':
        filteredModels.sort((a, b) => (a.year || 0) - (b.year || 0)); break;
      case 'price-desc':
        filteredModels.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)); break;
      case 'price-asc':
        filteredModels.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)); break;
    }

    updateStatistics(filteredModels);
    drawCards(filteredModels);
  }

  searchInput.addEventListener('input', filterModels);
  yearFilter.addEventListener('change', filterModels);
  scaleFilter.addEventListener('change', filterModels);
  sortBy.addEventListener('change', filterModels);

  closeModal.addEventListener('click', closeImageModal);
  modalOverlay.addEventListener('click', closeImageModal);
  navPrev.addEventListener('click', () => {
    stopRotate();
    prevImage();
  });
  navNext.addEventListener('click', () => {
    stopRotate();
    nextImage();
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closeImageModal();
    if (event.key === 'ArrowLeft') {
      stopRotate();
      prevImage();
    }
    if (event.key === 'ArrowRight') {
      stopRotate();
      nextImage();
    }
  });
}

function openImageModal(images, title) {
  if (!images.length) return;
  currentImages = images;
  currentImageIndex = 0;
  modalTitle.textContent = title;
  stopRotate();
  resetZoom();
  updateModalDisplay();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function updateModalDisplay() {
  if (!currentImages.length) return;
  modalImage.src = currentImages[currentImageIndex];
  modalCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

  navPrev.disabled = currentImageIndex === 0;
  navNext.disabled = currentImageIndex === currentImages.length - 1;

  modalThumbnails.innerHTML = currentImages
    .map((src, index) => `
      <img src="${src}" class="thumbnail ${index === currentImageIndex ? 'active' : ''}" data-index="${index}">
    `)
    .join('');

  modalThumbnails.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.addEventListener('click', () => {
      currentImageIndex = Number(thumb.dataset.index);
      resetZoom();
      updateModalDisplay();
    });
  });
}

function applyZoom() {
  modalImage.style.transform = `translate(${currentPan.x}px, ${currentPan.y}px) scale(${currentZoom})`;
  if (currentZoom > 1) {
    modalImage.classList.add('zoomed');
    modalImage.style.cursor = 'grab';
  } else {
    modalImage.classList.remove('zoomed');
    modalImage.style.cursor = 'zoom-in';
    currentPan = { x: 0, y: 0 };
  }
}

function resetZoom() {
  currentZoom = 1;
  currentPan = { x: 0, y: 0 };
  modalImage.classList.remove('zoomed');
  modalImage.style.transform = 'translate(0px, 0px) scale(1)';
  modalImage.style.cursor = 'zoom-in';
}

function closeImageModal() {
  stopRotate();
  modal.hidden = true;
  document.body.style.overflow = 'auto';
}

function nextImage() {
  if (currentImageIndex < currentImages.length - 1) {
    currentImageIndex += 1;
    resetZoom();
    updateModalDisplay();
  }
}

function prevImage() {
  if (currentImageIndex > 0) {
    currentImageIndex -= 1;
    resetZoom();
    updateModalDisplay();
  }
}

zoomInBtn?.addEventListener('click', () => {
  currentZoom = Math.min(currentZoom + 0.25, 4);
  applyZoom();
  stopRotate();
});

zoomOutBtn?.addEventListener('click', () => {
  currentZoom = Math.max(currentZoom - 0.25, 1);
  applyZoom();
});

zoomResetBtn?.addEventListener('click', () => {
  resetZoom();
  applyZoom();
});

rotateToggleBtn?.addEventListener('click', () => {
  if (rotateInterval) {
    stopRotate();
  } else {
    startRotate();
  }
});

function startRotate() {
  if (rotateInterval || currentImages.length < 2) return;
  rotateToggleBtn.classList.add('active');
  rotateInterval = setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateModalDisplay();
  }, 1500);
}

function stopRotate() {
  if (!rotateInterval) return;
  clearInterval(rotateInterval);
  rotateInterval = null;
  rotateToggleBtn.classList.remove('active');
}

modalImage?.addEventListener('wheel', (event) => {
  event.preventDefault();
  const delta = Math.sign(event.deltaY) * -0.1;
  currentZoom = Math.min(Math.max(1, currentZoom + delta), 4);
  applyZoom();
  stopRotate();
});

modalImage?.addEventListener('mousedown', (event) => {
  if (currentZoom === 1) return;
  isPanning = true;
  modalImage.style.cursor = 'grabbing';
  panStart = { x: event.clientX, y: event.clientY };
  stopRotate();
});

window.addEventListener('mouseup', () => {
  if (!isPanning) return;
  isPanning = false;
  modalImage.style.cursor = 'grab';
});

window.addEventListener('mousemove', (event) => {
  if (!isPanning) return;
  const dx = (event.clientX - panStart.x) / currentZoom;
  const dy = (event.clientY - panStart.y) / currentZoom;
  panStart = { x: event.clientX, y: event.clientY };
  currentPan = { x: currentPan.x + dx, y: currentPan.y + dy };
  modalImage.style.transform = `translate(${currentPan.x}px, ${currentPan.y}px) scale(${currentZoom})`;
});

// ensure modal close resets image
modal.addEventListener('transitionend', () => {
  if (modal.hidden) {
    resetZoom();
  }
});
