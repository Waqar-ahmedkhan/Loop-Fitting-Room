(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const products = window.LOOPS_PRODUCTS;
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (amount, currency = 'EUR') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
  const state = { selected: 0, category: 'store', size: 'M', cart: loadCart(), panel: null, playing: !prefersReducedMotion };
  let panelOpener = null,
    toastTimer = null,
    rotationTimer = null,
    isRailHovered = false,
    modelMode = false,
    modelModule = null;
  let lastStepAt = 0,
    wheelTotal = 0;

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem('loops-image-bag-v2') || '[]');

      return Array.isArray(saved)
        ? saved.filter(
            (item) =>
              products.some((product) => product.id === item.id) &&
              Number.isInteger(item.qty) &&
              item.qty > 0 &&
              ['S', 'M', 'L', 'XL'].includes(item.size)
          )
        : [];
    } catch {
      return [];
    }
  }

  function visibleIndices() {
    return products.reduce((indices, product, index) => {
      if (state.category === 'store' || product.category === state.category) indices.push(index);

      return indices;
    }, []);
  }

  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('is-visible'), 2500);
  }

  function restartRotation() {
    clearInterval(rotationTimer);
    if (!state.playing || modelMode) return;

    rotationTimer = setInterval(() => {
      if (!document.hidden && !state.panel && !isRailHovered && window.scrollY < innerHeight * 0.6) step(1, false);
    }, 8500);
  }

  function syncPlayback() {
    $('playBtn').setAttribute('aria-pressed', String(state.playing));
    $('playBtn').setAttribute('aria-label', state.playing ? 'Pause automatic browsing' : 'Start automatic browsing');
    $('playBtn').innerHTML = state.playing
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 9 6-9 6Z"/></svg>';
    $('itemLabel').setAttribute('aria-live', state.playing ? 'off' : 'polite');
    restartRotation();
  }

  function select(index, manual = true) {
    const allowed = visibleIndices();
    state.selected = allowed.includes(index) ? index : allowed[0];
    state.size = 'M';
    const product = products[state.selected];
    const position = allowed.indexOf(state.selected);
    $('itemName').textContent = product.name;
    $('itemPrice').textContent = money(product.price, product.currency);
    $('itemCurrent').textContent = String(position + 1).padStart(2, '0');
    $('itemTotal').textContent = String(allowed.length).padStart(2, '0');
    $('detailName').textContent = product.name;
    $('detailCode').textContent = `${product.code} / ${product.collection.toUpperCase()}`;
    $('detailPrice').textContent = money(product.price, product.currency);
    $('detailDescription').textContent = product.description;
    $('detailArt').src = `./assets/product-art/${product.image || product.id}.webp`;
    $('detailArt').alt = product.name;
    $('detailArt').parentElement.classList.toggle('studio-art', product.artStyle === 'studio');
    $('selectedColor').textContent = product.colors[0][0];
    document.querySelectorAll('[data-size]').forEach((button) => {
      const active = button.dataset.size === state.size;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    [...$('clothingRail').children].forEach((piece, pieceIndex) => {
      const piecePosition = allowed.indexOf(pieceIndex);
      const half = Math.floor(allowed.length / 2);
      const offset = ((piecePosition - position + allowed.length + half) % allowed.length) - half;
      piece.hidden = piecePosition < 0;
      piece.style.setProperty('--offset', offset);
      piece.style.setProperty('--side', Math.sign(offset));
      piece.style.zIndex = String(20 - Math.abs(offset));
      piece.classList.toggle('is-selected', offset === 0);
      piece.classList.toggle('is-distant', Math.abs(offset) > 2);
      piece.setAttribute('aria-pressed', String(pieceIndex === state.selected));
      piece.setAttribute('aria-label', `${pieceIndex === state.selected ? 'Explore' : 'Select'} ${products[pieceIndex].name}`);
      piece.tabIndex = pieceIndex === state.selected ? 0 : -1;
      piece.inert = piecePosition < 0 || Math.abs(offset) > 2;
    });
    if (modelMode) updateModel();
    if (manual) restartRotation();
  }

  function updateModel() {
    const product = products[state.selected];
    const path = `./assets/garments/${product.model || product.id}.glb`;
    $('garmentModel').setAttribute('src', path);
    $('garmentModel').setAttribute('alt', `Approximate 3D model of ${product.name}`);
    $('garmentModel').setAttribute('poster', `./assets/product-art/${product.image || product.id}.webp`);
    $('modelDownload').href = path;
    $('modelStatus').textContent = 'Loading 3D model…';
  }

  async function setModelMode(enabled) {
    modelMode = enabled;
    $('experience').classList.toggle('model-mode', enabled);
    $('modelStage').hidden = !enabled;
    $('modelDownload').hidden = !enabled;
    $('clothingRail').inert = enabled;
    $('railViewBtn').classList.toggle('active', !enabled);
    $('modelViewBtn').classList.toggle('active', enabled);
    $('railViewBtn').setAttribute('aria-pressed', String(!enabled));
    $('modelViewBtn').setAttribute('aria-pressed', String(enabled));
    $('playBtn').disabled = enabled;
    restartRotation();
    if (!enabled) return;
    updateModel();
    try {
      modelModule ||= import('./assets/vendor/model-viewer.min.js');
      await modelModule;
    } catch {
      modelModule = null;
      $('modelStatus').textContent = 'The 3D viewer could not load. You can still download the .glb model.';
    }
  }

  function step(direction, manual = true) {
    const indices = visibleIndices();
    const position = indices.indexOf(state.selected);
    select(indices[(position + direction + indices.length) % indices.length], manual);
  }

  function setCategory(category) {
    state.category = category;
    document.querySelectorAll('[data-category]').forEach((button) => {
      const active = button.dataset.category === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    select(state.selected);
    renderCatalog();
  }

  function renderCatalog() {
    const indices = visibleIndices();
    $('catalogCount').textContent = `${indices.length} pieces`;
    $('catalogGrid').innerHTML = indices
      .map((index) => {
        const product = products[index];

        return `<button class="product-tile" data-index="${index}" aria-label="Explore ${product.name}">
        <span class="tile-brand">${product.collection.toUpperCase()}</span>
        <span class="tile-art"><img loading="lazy" decoding="async" width="510" height="530"
          src="./assets/product-art/${product.image || product.id}.webp" alt=""></span>
        <span class="tile-meta"><span><span class="tile-name">${product.name}</span>
        <span class="tile-price">${money(product.price, product.currency)}</span></span>${icon}</span></button>`;
      })
      .join('');
  }

  function syncCart() {
    try {
      localStorage.setItem('loops-image-bag-v2', JSON.stringify(state.cart));
    } catch {
      /* Bag still works for this visit. */
    }
    const count = state.cart.reduce((total, item) => total + item.qty, 0);
    $('cartCount').textContent = count;
    $('panelCartCount').textContent = String(count).padStart(2, '0');
    const totals = {};
    state.cart.forEach((item) => {
      const product = products.find((piece) => piece.id === item.id);
      totals[product.currency] = (totals[product.currency] || 0) + product.price * item.qty;
    });
    $('subtotal').textContent =
      Object.entries(totals)
        .map(([currency, amount]) => money(amount, currency))
        .join(' + ') || money(0);
    $('cartItems').innerHTML = state.cart.length
      ? state.cart
          .map((item, index) => {
            const product = products.find((piece) => piece.id === item.id);

            return `<div class="cart-item"><img src="./assets/product-art/${product.image || product.id}.webp" alt="${product.name}">
        <div class="cart-item-body"><h3>${product.name}</h3><p>Size ${item.size} · ${money(product.price, product.currency)}</p>
        <div class="cart-item-bottom"><div class="qty"><button data-qty="${index}:-1" aria-label="Decrease ${product.name} quantity">−</button>
        <span>${item.qty}</span><button data-qty="${index}:1" aria-label="Increase ${product.name} quantity">+</button></div>
        <button class="remove" data-remove="${index}">Remove</button></div></div></div>`;
          })
          .join('')
      : '<p class="cart-empty">Your bag is empty.<br>Find a piece you love in the collection.</p>';
  }

  function closePanel(restoreFocus = true) {
    document.querySelectorAll('.side-panel').forEach((panel) => {
      panel.inert = true;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    });
    $('overlay').hidden = true;
    $('cartBtn').setAttribute('aria-expanded', 'false');
    document.querySelector('main').inert = false;
    document.body.style.overflow = '';
    state.panel = null;
    if (restoreFocus) panelOpener?.focus();
    panelOpener = null;
    restartRotation();
  }

  function openPanel(which) {
    const opener = state.panel ? panelOpener : document.activeElement;
    closePanel(false);
    panelOpener = opener;
    state.panel = which;
    const panel = $(which === 'details' ? 'detailsPanel' : 'cartPanel');
    $('overlay').hidden = false;
    panel.inert = false;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    $('cartBtn').setAttribute('aria-expanded', String(which === 'cart'));
    document.querySelector('main').inert = true;
    document.body.style.overflow = 'hidden';
    panel.querySelector('button').focus();
  }

  function travelTo(top) {
    closePanel();
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
  }

  function bind() {
    $('railViewBtn').addEventListener('click', () => setModelMode(false));
    $('modelViewBtn').addEventListener('click', () => setModelMode(true));
    $('garmentModel').addEventListener('load', () => {
      $('modelStatus').textContent = 'Drag to rotate · Approximate garment model';
    });
    $('garmentModel').addEventListener('error', () => {
      $('modelStatus').textContent = 'Model preview unavailable. Use the download link to open the .glb file.';
    });
    $('goTop').addEventListener('click', () => travelTo(0));
    $('footerTop').addEventListener('click', () => travelTo(0));
    $('browseBtn').addEventListener('click', () => travelTo($('catalog').offsetTop));
    $('prevBtn').addEventListener('click', () => step(-1));
    $('nextBtn').addEventListener('click', () => step(1));
    $('playBtn').addEventListener('click', () => {
      state.playing = !state.playing;
      syncPlayback();
    });
    $('detailsBtn').addEventListener('click', () => openPanel('details'));
    $('cartBtn').addEventListener('click', () => openPanel('cart'));
    $('overlay').addEventListener('click', () => closePanel());
    document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closePanel()));
    document.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => setCategory(button.dataset.category));
    });
    document.querySelectorAll('[data-size]').forEach((button) =>
      button.addEventListener('click', () => {
        state.size = button.dataset.size;
        document.querySelectorAll('[data-size]').forEach((option) => {
          option.classList.toggle('active', option === button);
          option.setAttribute('aria-pressed', String(option === button));
        });
      })
    );
    $('catalogGrid').addEventListener('click', (event) => {
      const tile = event.target.closest('[data-index]');
      if (!tile) return;
      select(Number(tile.dataset.index));
      openPanel('details');
    });
    $('addCart').addEventListener('click', () => {
      const product = products[state.selected];
      const existing = state.cart.find((item) => item.id === product.id && item.size === state.size);
      if (existing) existing.qty += 1;
      else state.cart.push({ id: product.id, size: state.size, qty: 1 });
      syncCart();
      openPanel('cart');
      toast('Added to your bag');
    });
    $('cartItems').addEventListener('click', (event) => {
      const quantity = event.target.closest('[data-qty]');
      const remove = event.target.closest('[data-remove]');
      if (quantity) {
        const [index, change] = quantity.dataset.qty.split(':').map(Number);
        state.cart[index].qty += change;
        if (state.cart[index].qty < 1) state.cart.splice(index, 1);
      } else if (remove) state.cart.splice(Number(remove.dataset.remove), 1);
      else return;
      syncCart();
    });
    const rail = $('clothingRail');
    rail.addEventListener(
      'wheel',
      (event) => {
        if (modelMode || state.panel || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
        event.preventDefault();
        const now = performance.now();
        if (now - lastStepAt < 1450) return;
        wheelTotal += event.deltaY;
        if (Math.abs(wheelTotal) < 28) return;
        step(wheelTotal > 0 ? 1 : -1);
        wheelTotal = 0;
        lastStepAt = now;
      },
      { passive: false }
    );
    rail.addEventListener('click', (event) => {
      const piece = event.target.closest('[data-rail-index]');
      if (!piece || rail.dataset.swiped === 'true') return;
      const index = Number(piece.dataset.railIndex);
      if (index === state.selected) openPanel('details');
      else select(index);
    });
    rail.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') isRailHovered = true;
    });
    rail.addEventListener('pointerleave', () => {
      isRailHovered = false;
      restartRotation();
    });
    rail.addEventListener('focusin', () => {
      isRailHovered = true;
    });
    rail.addEventListener('focusout', () => {
      isRailHovered = false;
      restartRotation();
    });
    let startX = 0,
      startY = 0;
    rail.addEventListener(
      'touchstart',
      (event) => {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        rail.dataset.swiped = 'false';
      },
      { passive: true }
    );
    rail.addEventListener(
      'touchend',
      (event) => {
        const dx = event.changedTouches[0].clientX - startX;
        const dy = event.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          rail.dataset.swiped = 'true';
          step(dx < 0 ? 1 : -1);
          setTimeout(() => {
            rail.dataset.swiped = 'false';
          }, 350);
        }
      },
      { passive: true }
    );
    document.addEventListener('visibilitychange', restartRotation);
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.panel) closePanel();
      if (event.key === 'Tab' && state.panel) {
        const panel = document.querySelector('.side-panel.is-open');
        const controls = [...panel.querySelectorAll('button:not(:disabled)')];
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (state.panel || window.scrollY > innerHeight * 0.6) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
    });
  }

  $('clothingRail').innerHTML = products
    .map(
      (product, index) => `
    <button class="rail-piece ${product.artStyle === 'studio' ? 'studio-art' : ''}" data-rail-index="${index}">
      <img src="./assets/product-art/${product.image || product.id}.webp" alt="" width="510" height="530" decoding="async" draggable="false">
    </button>`
    )
    .join('');
  bind();
  renderCatalog();
  select(0);
  syncCart();
  syncPlayback();
})();
