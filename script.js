const pieces = [
  { name: 'The Solene Gown', type: 'evening', label: 'Evening', price: '£1,850', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85' },
  { name: 'The Camille Suit', type: 'tailoring', label: 'Tailoring', price: '£1,260', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=85' },
  { name: 'The Noa Column', type: 'evening', label: 'Evening', price: '£1,490', image: 'https://images.unsplash.com/photo-1566971277440-5f0f8e9e61f3?auto=format&fit=crop&w=900&q=85' },
  { name: 'The Margot Blazer', type: 'tailoring', label: 'Tailoring', price: '£890', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85' }
];

const gallery = document.querySelector('#gallery');
const filterButtons = document.querySelectorAll('.filter-button');
const showMore = document.querySelector('#show-more');

const garmentSvg = (artwork) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">${artwork}</svg>`)}`;
const atelierPieces = [
  { name: 'The Livia Coat', type: 'Outerwear', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=500&q=85', overlay: garmentSvg('<path fill="#38342e" d="M126 74 177 42h46l51 32 44 173-66 22-8 263H156l-8-263-66-22z"/><path fill="#c8a978" d="m177 42 23 31 23-31-6 138-17 25-17-25z"/><path fill="none" stroke="#c8a978" stroke-width="8" d="M92 247q108 32 216 0"/>') },
  { name: 'The Solene Dress', type: 'Evening', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=500&q=85', overlay: garmentSvg('<path fill="#8b5361" d="M147 70h106l28 157 49 328H70l49-328z"/><path fill="#8b5361" d="m147 70 53 45 53-45 18 85H129z"/><path fill="#c8a978" d="M147 70h106l-12 29h-82z"/>') },
  { name: 'The Iris Top', type: 'Silk separates', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=500&q=85', overlay: garmentSvg('<path fill="#e7ded1" d="m116 96 84-42 84 42 72 167-69 29-21-104v207H134V188l-21 104-69-29z"/><path fill="none" stroke="#c8a978" stroke-width="7" d="M200 54v136M116 96l84 94 84-94"/>') }
];

const modelCanvas = document.querySelector('#model-canvas');
const modelImage = document.querySelector('#model-image');
const canvasEmpty = document.querySelector('#canvas-empty');
const canvasStatus = document.querySelector('#canvas-status');
const canvasItems = new Set();
let selectedCanvasItem = null;

function fileToUrl(file) {
  return URL.createObjectURL(file);
}

function renderWardrobeItem(item, grid, isPrivate = false) {
  const card = document.createElement('button');
  card.className = 'wardrobe-item';
  card.type = 'button';
  card.innerHTML = `<span class="wardrobe-thumb"><img src="${item.image}" alt="" /></span><span class="wardrobe-item-name">${item.name}</span><span class="wardrobe-item-type">${item.type}</span>`;
  card.addEventListener('click', () => addCanvasItem(item));
  if (isPrivate) card.dataset.private = 'true';
  grid.appendChild(card);
}

function addCanvasItem(item) {
  const overlay = document.createElement('div');
  overlay.className = 'canvas-item';
  overlay.style.left = '30%';
  overlay.style.top = '18%';
  overlay.style.width = '40%';
  overlay.innerHTML = `<img src="${item.overlay || item.image}" alt="${item.name} overlay" draggable="false" /><button class="resize-handle" type="button" aria-label="Resize ${item.name}"></button>`;
  modelCanvas.appendChild(overlay);
  canvasItems.add(overlay);
  selectCanvasItem(overlay);
  makeCanvasItemInteractive(overlay);
  canvasStatus.textContent = `${canvasItems.size} placed`;
}

function selectCanvasItem(item) {
  if (selectedCanvasItem) selectedCanvasItem.classList.remove('selected');
  selectedCanvasItem = item;
  selectedCanvasItem.classList.add('selected');
}

function makeCanvasItemInteractive(item) {
  let interaction = null;
  item.addEventListener('pointerdown', (event) => {
    if (event.target.classList.contains('resize-handle')) return;
    event.preventDefault();
    selectCanvasItem(item);
    const bounds = modelCanvas.getBoundingClientRect();
    interaction = { x: event.clientX, y: event.clientY, left: item.offsetLeft, top: item.offsetTop, width: item.offsetWidth, bounds };
    item.setPointerCapture(event.pointerId);
    item.classList.add('dragging');
  });
  item.addEventListener('pointermove', (event) => {
    if (!interaction) return;
    const left = Math.max(0, Math.min(interaction.bounds.width - item.offsetWidth, interaction.left + event.clientX - interaction.x));
    const top = Math.max(0, Math.min(interaction.bounds.height - item.offsetHeight, interaction.top + event.clientY - interaction.y));
    item.style.left = `${(left / interaction.bounds.width) * 100}%`;
    item.style.top = `${(top / interaction.bounds.height) * 100}%`;
  });
  item.addEventListener('pointerup', () => { interaction = null; item.classList.remove('dragging'); });
  item.querySelector('.resize-handle').addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectCanvasItem(item);
    const bounds = modelCanvas.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, width: item.offsetWidth, bounds };
    const resize = (moveEvent) => {
      const nextWidth = Math.max(70, Math.min(bounds.width * .85, start.width + moveEvent.clientX - start.x));
      item.style.width = `${(nextWidth / bounds.width) * 100}%`;
    };
    const stop = () => { window.removeEventListener('pointermove', resize); window.removeEventListener('pointerup', stop); };
    window.addEventListener('pointermove', resize);
    window.addEventListener('pointerup', stop);
  });
}

function handleModelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  modelImage.src = fileToUrl(file);
  modelImage.classList.remove('hidden');
  canvasEmpty.classList.add('hidden');
  canvasStatus.textContent = 'Model loaded';
}

function clearCanvas() {
  if (selectedCanvasItem) {
    canvasItems.delete(selectedCanvasItem);
    selectedCanvasItem.remove();
    selectedCanvasItem = null;
  } else {
    canvasItems.forEach((item) => item.remove());
    canvasItems.clear();
  }
  canvasStatus.textContent = canvasItems.size ? `${canvasItems.size} placed` : 'Ready';
}

atelierPieces.forEach((item) => renderWardrobeItem(item, document.querySelector('#atelier-grid')));
document.querySelector('#model-upload').addEventListener('change', handleModelUpload);
document.querySelector('#clear-canvas').addEventListener('click', clearCanvas);

document.querySelectorAll('.wardrobe-tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.wardrobe-tab').forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
  document.querySelectorAll('.wardrobe-content').forEach((panel) => panel.classList.add('hidden'));
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  document.querySelector(`#${tab.getAttribute('aria-controls')}`).classList.remove('hidden');
}));

document.querySelector('#wardrobe-upload').addEventListener('change', (event) => {
  [...event.target.files].forEach((file) => renderWardrobeItem({ name: file.name.replace(/\.[^/.]+$/, ''), type: 'Your piece', image: fileToUrl(file) }, document.querySelector('#private-grid'), true));
  document.querySelector('#item-count').textContent = `${event.target.files.length} added`;
});

function renderGallery(filter = 'all') {
  const visiblePieces = filter === 'all' ? pieces : pieces.filter((piece) => piece.type === filter);
  gallery.innerHTML = visiblePieces.map((piece) => `
    <article class="gallery-card">
      <div class="gallery-image" style="background-image: url('${piece.image}')" role="img" aria-label="${piece.name}">
        <span class="product-arrow" aria-hidden="true">↗</span>
      </div>
      <div class="product-meta flex items-start justify-between gap-3">
        <div><h3 class="product-name">${piece.name}</h3><p class="product-type">${piece.label}</p></div>
        <p class="text-xs text-smoke">${piece.price}</p>
      </div>
    </article>`).join('');
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    renderGallery(button.dataset.filter);
  });
});

showMore.addEventListener('click', () => {
  showMore.textContent = showMore.textContent === 'View all pieces' ? 'You are all caught up' : 'View all pieces';
});

const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu.classList.toggle('hidden', isOpen);
});

document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.add('hidden');
}));

const dateInput = document.querySelector('#date');
dateInput.min = new Date().toISOString().split('T')[0];
document.querySelector('#booking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#form-message').classList.remove('hidden');
  event.target.reset();
  dateInput.min = new Date().toISOString().split('T')[0];
});

renderGallery();
