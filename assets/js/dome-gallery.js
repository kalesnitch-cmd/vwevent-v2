/* ==========================================================================
   DOME GALLERY EFFECT (VANILLA JS PORT OF REACT BITS DOMEGALLERY)
   ========================================================================== */
import '../css/dome-gallery.css';

const DEFAULT_IMAGES = [
  { src: 'assets/images/portfolio/arki/-oOiQOjJn1wHHlK2Yhjqrc5yigLMxkXEO4eeJpvHdG33v-sD2Uf_bkHyQbPBCPyl5SCjI-o_tVlrYC50rVBt-VAj.webp', alt: 'Стильная фотозона с полуарками и подсветкой' },
  { src: 'assets/images/portfolio/arki/CoQGZ825-p3idCK36eh7KkLB3InGus7a119zBn9zJscsmKiv6Bfv2leo2TReUM6-tAvj2Rl7PMUKrBfraL1ZLQDq.webp', alt: 'Белая резная арка с нежной флористикой' },
  { src: 'assets/images/portfolio/arki/Ha5b8WlmieUBLJPuMDbJjGKsrRDn0nIbE0hjTRFlSPBdvc9vYuIIunZaZuxlLbGUePiYkCKl4tzIEEyI23n5X3X9.webp', alt: 'Тематическая зимняя фотозона' },
  { src: 'assets/images/portfolio/arki/Nr0ksV7f_iQAyxNiESiIQtcTVT48NVpLAeSxhjYptUZ69WBShPCHrN09OHp8Z_jTGI9eknFw6vmncglPSUWqKzdj.webp', alt: 'Минималистичный задник с золотым символом любви' },
  { src: 'assets/images/portfolio/arki/PmIHVugM-j_dwQyK4PAMAYNA0iRcVNgj2E8U4w6YUNt8JPcgHm7_v-fexaWXmaocJS1bXFwMIv8nBWBK6kNvGQLL.webp', alt: 'Тонкие дизайнерские светильники-свечи на президиуме' },
  { src: 'assets/images/portfolio/arki/QuPJuilvvheEhmI1AwwXxsrwo67LkDxtt5XaJmteVbhg0KTfuE82HKGEns9u70giO0_-G9okoem0PZui7OIlFusO.webp', alt: 'Круглая свадебная арка с вечерней подсветкой' },
  { src: 'assets/images/portfolio/arki/ZBT0pACh-R1mnaPi2F8gJSDnx9Jk044ANA6lxnQ0O9Laycbb3qTbpsV08V8PDDxhWTnBKPy_uhbJGkyV_q102K17.webp', alt: 'Насыщенная бархатная фотозона со световым акцентом' },
  { src: 'assets/images/portfolio/arki/decor_13.webp', alt: 'Многослойный белый задник с розовыми акцентами' },
  { src: 'assets/images/portfolio/arki/decor_17.webp', alt: 'Стильная черно-белая зона с объемной флористикой' },
  { src: 'assets/images/portfolio/arki/decor_18.webp', alt: 'Высокая полукруглая арка с белыми цветами' },
  { src: 'assets/images/portfolio/arki/decor_2.webp', alt: 'Текстильное оформление арки на природе' },
  { src: 'assets/images/portfolio/arki/decor_28.webp', alt: 'Свадебная арка в окружении парковой зелени' },
  { src: 'assets/images/portfolio/arki/decor_3.webp', alt: 'Контрастная фотозона с теплыми напольными свечами' },
  { src: 'assets/images/portfolio/arki/decor_30.webp', alt: 'Крупный план президиума с глянцевым золотом и неоном' },
  { src: 'assets/images/portfolio/arki/decor_31.webp', alt: 'Пышная цветочная арка в сиренево-фиолетовых тонах' },
  { src: 'assets/images/portfolio/arki/decor_34.webp', alt: 'Монохромная белоснежная арка с хрустальными нитями' }
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map(c => ({ ...c, src: '', alt: '' }));
  }

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, alt: '' };
    }
    return { src: image.src || '', alt: image.alt || '' };
  });

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

class DomeGalleryInstance {
  constructor(rootEl, options = {}) {
    this.root = rootEl;
    this.images = options.images || DEFAULT_IMAGES;
    this.fit = options.fit ?? 0.55;
    this.fitBasis = options.fitBasis ?? 'auto';
    this.minRadius = options.minRadius ?? 600;
    this.maxRadius = options.maxRadius ?? Infinity;
    this.padFactor = options.padFactor ?? 0.25;
    this.overlayBlurColor = options.overlayBlurColor ?? '#151514';
    this.maxVerticalRotationDeg = options.maxVerticalRotationDeg ?? 5;
    this.dragSensitivity = options.dragSensitivity ?? 20;
    this.enlargeTransitionMs = options.enlargeTransitionMs ?? 300;
    this.segments = options.segments ?? 35;
    this.dragDampening = options.dragDampening ?? 2;
    this.openedImageWidth = options.openedImageWidth ?? '250px';
    this.openedImageHeight = options.openedImageHeight ?? '350px';
    this.imageBorderRadius = options.imageBorderRadius ?? '12px';
    this.openedImageBorderRadius = options.openedImageBorderRadius ?? '12px';
    this.grayscale = options.grayscale ?? false;

    this.rotation = { x: 0, y: 0 };
    this.startRot = { x: 0, y: 0 };
    this.startPos = null;
    this.dragging = false;
    this.moved = false;
    this.inertiaRAF = null;
    this.opening = false;
    this.openStartedAt = 0;
    this.lastDragEndAt = 0;
    this.pointerHistory = [];
    this.scrollLocked = false;

    this.focusedEl = null;
    this.originalTilePosition = null;
    this.lockedRadius = null;

    this.initStructure();
    this.bindEvents();
    this.initResizeObserver();
  }

  initStructure() {
    this.items = buildItems(this.images, this.segments);

    // Build the DOM structure
    this.root.className = 'sphere-root';
    this.root.style.setProperty('--segments-x', this.segments);
    this.root.style.setProperty('--segments-y', this.segments);
    this.root.style.setProperty('--overlay-blur-color', this.overlayBlurColor);
    this.root.style.setProperty('--tile-radius', this.imageBorderRadius);
    this.root.style.setProperty('--enlarge-radius', this.openedImageBorderRadius);
    this.root.style.setProperty('--image-filter', this.grayscale ? 'grayscale(1)' : 'none');

    const main = document.createElement('main');
    main.className = 'sphere-main';
    this.mainRef = main;

    const stage = document.createElement('div');
    stage.className = 'stage';

    const sphere = document.createElement('div');
    sphere.className = 'sphere';
    this.sphereRef = sphere;

    this.items.forEach((it, idx) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.setAttribute('data-src', it.src);
      item.setAttribute('data-offset-x', it.x);
      item.setAttribute('data-offset-y', it.y);
      item.setAttribute('data-size-x', it.sizeX);
      item.setAttribute('data-size-y', it.sizeY);

      item.style.setProperty('--offset-x', it.x);
      item.style.setProperty('--offset-y', it.y);
      item.style.setProperty('--item-size-x', it.sizeX);
      item.style.setProperty('--item-size-y', it.sizeY);

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'item__image';
      imgWrapper.setAttribute('role', 'button');
      imgWrapper.setAttribute('tabindex', '0');
      imgWrapper.setAttribute('aria-label', it.alt || 'Open image');

      const img = document.createElement('img');
      img.src = it.src;
      img.setAttribute('draggable', 'false');
      img.alt = it.alt || '';

      imgWrapper.appendChild(img);
      item.appendChild(imgWrapper);
      sphere.appendChild(item);

      // Bind Tile Click and Pointer handlers
      imgWrapper.addEventListener('click', (e) => this.onTileClick(e, imgWrapper));
      imgWrapper.addEventListener('pointerup', (e) => this.onTilePointerUp(e, imgWrapper));
    });

    stage.appendChild(sphere);
    main.appendChild(stage);

    // Add overlays
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const overlayBlur = document.createElement('div');
    overlayBlur.className = 'overlay overlay--blur';

    const edgeTop = document.createElement('div');
    edgeTop.className = 'edge-fade edge-fade--top';
    const edgeBottom = document.createElement('div');
    edgeBottom.className = 'edge-fade edge-fade--bottom';

    main.appendChild(overlay);
    main.appendChild(overlayBlur);
    main.appendChild(edgeTop);
    main.appendChild(edgeBottom);

    // Add viewer
    const viewer = document.createElement('div');
    viewer.className = 'viewer';
    this.viewerRef = viewer;

    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    this.scrimRef = scrim;

    const frame = document.createElement('div');
    frame.className = 'frame';
    this.frameRef = frame;

    viewer.appendChild(scrim);
    viewer.appendChild(frame);
    main.appendChild(viewer);

    this.root.appendChild(main);

    this.applyTransform(this.rotation.x, this.rotation.y);
  }

  applyTransform(xDeg, yDeg) {
    if (this.sphereRef) {
      this.sphereRef.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  }

  bindEvents() {
    this.mainRef.addEventListener('pointerdown', (e) => this.onDragStart(e));
    this.mainRef.addEventListener('pointermove', (e) => this.onDrag(e));
    this.mainRef.addEventListener('pointerup', (e) => this.onDragEnd(e));
    this.mainRef.addEventListener('pointercancel', (e) => this.onDragEnd(e));

    // Scrim Close trigger
    this.scrimRef.addEventListener('click', () => this.closeFocusedItem());

    // Escape Key trigger
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeFocusedItem();
    });
  }

  initResizeObserver() {
    this.ro = new ResizeObserver(entries => {
      if (!entries[0]) return;
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;

      let basis;
      switch (this.fitBasis) {
        case 'min': basis = minDim; break;
        case 'max': basis = maxDim; break;
        case 'width': basis = w; break;
        case 'height': basis = h; break;
        default: basis = aspect >= 1.3 ? w : minDim;
      }

      let radius = basis * this.fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, this.minRadius, this.maxRadius);
      this.lockedRadius = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * this.padFactor));
      this.root.style.setProperty('--radius', `${this.lockedRadius}px`);
      this.root.style.setProperty('--viewer-pad', `${viewerPad}px`);

      this.applyTransform(this.rotation.x, this.rotation.y);
      this.recenterEnlargedImage();
    });
    this.ro.observe(this.root);
  }

  recenterEnlargedImage() {
    const enlargedOverlay = this.viewerRef.querySelector('.enlarge');
    if (enlargedOverlay && this.frameRef && this.mainRef) {
      const frameR = this.frameRef.getBoundingClientRect();
      const mainR = this.mainRef.getBoundingClientRect();

      const hasCustomSize = this.openedImageWidth && this.openedImageHeight;
      if (hasCustomSize) {
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `position: absolute; width: ${this.openedImageWidth}; height: ${this.openedImageHeight}; visibility: hidden;`;
        document.body.appendChild(tempDiv);
        const tempRect = tempDiv.getBoundingClientRect();
        document.body.removeChild(tempDiv);

        const centeredLeft = frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
        const centeredTop = frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

        enlargedOverlay.style.left = `${centeredLeft}px`;
        enlargedOverlay.style.top = `${centeredTop}px`;
      } else {
        enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
        enlargedOverlay.style.width = `${frameR.width}px`;
        enlargedOverlay.style.height = `${frameR.height}px`;
      }
    }
  }

  lockScroll() {
    if (this.scrollLocked) return;
    this.scrollLocked = true;
    document.body.classList.add('dg-scroll-lock');
  }

  unlockScroll() {
    if (!this.scrollLocked) return;
    if (this.root.getAttribute('data-enlarging') === 'true') return;
    this.scrollLocked = false;
    document.body.classList.remove('dg-scroll-lock');
  }

  onDragStart(e) {
    if (this.focusedEl) return;
    this.stopInertia();
    this.dragging = true;
    this.moved = false;
    this.startRot = { ...this.rotation };
    this.startPos = { x: e.clientX, y: e.clientY };
    this.pointerHistory = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    
    try {
      this.mainRef.setPointerCapture(e.pointerId);
    } catch (err) {}
  }

  onDrag(e) {
    if (this.focusedEl || !this.dragging || !this.startPos) return;
    const dxTotal = e.clientX - this.startPos.x;
    const dyTotal = e.clientY - this.startPos.y;

    if (!this.moved) {
      const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
      if (dist2 > 16) this.moved = true;
    }

    const nextX = clamp(
      this.startRot.x - dyTotal / this.dragSensitivity,
      -this.maxVerticalRotationDeg,
      this.maxVerticalRotationDeg
    );
    const nextY = wrapAngleSigned(this.startRot.y + dxTotal / this.dragSensitivity);

    if (this.rotation.x !== nextX || this.rotation.y !== nextY) {
      this.rotation = { x: nextX, y: nextY };
      this.applyTransform(nextX, nextY);
    }

    const now = performance.now();
    this.pointerHistory.push({ x: e.clientX, y: e.clientY, t: now });
    // Keep only last 100ms of points
    this.pointerHistory = this.pointerHistory.filter(p => now - p.t < 100);
  }

  onDragEnd(e) {
    if (!this.dragging) return;
    this.dragging = false;

    try {
      this.mainRef.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const now = performance.now();
    const recentPoints = this.pointerHistory.filter(p => now - p.t < 100);

    if (recentPoints.length >= 2) {
      const p0 = recentPoints[0];
      const p1 = recentPoints[recentPoints.length - 1];
      const dt = p1.t - p0.t;

      if (dt > 10) {
        const vx = (p1.x - p0.x) / dt; // pixels per ms
        const vy = (p1.y - p0.y) / dt;
        this.startInertia(vx, vy);
      }
    }

    if (this.moved) {
      this.lastDragEndAt = performance.now();
    }
    this.moved = false;
    this.pointerHistory = [];
  }

  stopInertia() {
    if (this.inertiaRAF) {
      cancelAnimationFrame(this.inertiaRAF);
      this.inertiaRAF = null;
    }
  }

  startInertia(vx, vy) {
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const d = clamp(this.dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames = Math.round(90 + 270 * d);

    const step = () => {
      vX *= frictionMul;
      vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
        this.inertiaRAF = null;
        return;
      }
      if (++frames > maxFrames) {
        this.inertiaRAF = null;
        return;
      }
      const nextX = clamp(this.rotation.x - vY / 200, -this.maxVerticalRotationDeg, this.maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(this.rotation.y + vX / 200);
      this.rotation = { x: nextX, y: nextY };
      this.applyTransform(nextX, nextY);
      this.inertiaRAF = requestAnimationFrame(step);
    };

    this.stopInertia();
    this.inertiaRAF = requestAnimationFrame(step);
  }

  onTileClick(e, imgWrapper) {
    if (this.dragging) return;
    if (this.moved) return;
    if (performance.now() - this.lastDragEndAt < 80) return;
    if (this.opening) return;
    this.openItemFromElement(imgWrapper);
  }

  onTilePointerUp(e, imgWrapper) {
    if (e.pointerType !== 'touch') return;
    if (this.dragging) return;
    if (this.moved) return;
    if (performance.now() - this.lastDragEndAt < 80) return;
    if (this.opening) return;
    this.openItemFromElement(imgWrapper);
  }

  openItemFromElement(el) {
    if (this.opening) return;
    this.opening = true;
    this.openStartedAt = performance.now();
    this.lockScroll();

    const parent = el.parentElement;
    this.focusedEl = el;
    el.setAttribute('data-focused', 'true');

    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);

    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, this.segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(this.rotation.y);

    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - this.rotation.x;

    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference';
    refDiv.style.opacity = '0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);

    // Force reflow
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = this.mainRef?.getBoundingClientRect();
    const frameR = this.frameRef?.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      this.opening = false;
      this.focusedEl = null;
      parent.removeChild(refDiv);
      this.unlockScroll();
      return;
    }

    this.originalTilePosition = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = 'hidden';
    el.style.zIndex = '0';

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.position = 'absolute';
    overlay.style.left = `${frameR.left - mainR.left}px`;
    overlay.style.top = `${frameR.top - mainR.top}px`;
    overlay.style.width = `${frameR.width}px`;
    overlay.style.height = `${frameR.height}px`;
    overlay.style.opacity = '0';
    overlay.style.zIndex = '30';
    overlay.style.willChange = 'transform, opacity';
    overlay.style.transformOrigin = 'top left';
    overlay.style.transition = `transform ${this.enlargeTransitionMs}ms ease, opacity ${this.enlargeTransitionMs}ms ease`;

    const rawSrc = parent.getAttribute('data-src') || el.querySelector('img')?.src || '';
    const img = document.createElement('img');
    img.src = rawSrc;
    img.setAttribute('draggable', 'false');
    overlay.appendChild(img);
    this.viewerRef.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;

    const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
    const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

    setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      this.root.setAttribute('data-enlarging', 'true');
    }, 16);

    const wantsResize = this.openedImageWidth || this.openedImageHeight;
    if (wantsResize) {
      const onFirstEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        overlay.removeEventListener('transitionend', onFirstEnd);

        const prevTransition = overlay.style.transition;
        overlay.style.transition = 'none';

        const tempWidth = this.openedImageWidth || `${frameR.width}px`;
        const tempHeight = this.openedImageHeight || `${frameR.height}px`;
        overlay.style.width = tempWidth;
        overlay.style.height = tempHeight;

        const newRect = overlay.getBoundingClientRect();
        overlay.style.width = `${frameR.width}px`;
        overlay.style.height = `${frameR.height}px`;
        void overlay.offsetWidth;

        overlay.style.transition = `left ${this.enlargeTransitionMs}ms ease, top ${this.enlargeTransitionMs}ms ease, width ${this.enlargeTransitionMs}ms ease, height ${this.enlargeTransitionMs}ms ease`;

        const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
        const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;

        requestAnimationFrame(() => {
          overlay.style.left = `${centeredLeft}px`;
          overlay.style.top = `${centeredTop}px`;
          overlay.style.width = tempWidth;
          overlay.style.height = tempHeight;
        });

        const cleanupSecond = () => {
          overlay.removeEventListener('transitionend', cleanupSecond);
          overlay.style.transition = prevTransition;
        };
        overlay.addEventListener('transitionend', cleanupSecond, { once: true });
      };
      overlay.addEventListener('transitionend', onFirstEnd);
    }
  }

  closeFocusedItem() {
    if (performance.now() - this.openStartedAt < 250) return;
    const el = this.focusedEl;
    if (!el) return;

    const parent = el.parentElement;
    const overlay = this.viewerRef.querySelector('.enlarge');
    if (!overlay) return;

    const refDiv = parent.querySelector('.item__image--reference');
    const originalPos = this.originalTilePosition;

    if (!originalPos) {
      overlay.remove();
      if (refDiv) refDiv.remove();
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');
      el.style.visibility = '';
      el.style.zIndex = '0';
      this.focusedEl = null;
      this.root.removeAttribute('data-enlarging');
      this.opening = false;
      this.unlockScroll();
      return;
    }

    const currentRect = overlay.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();

    const originalPosRelativeToRoot = {
      left: originalPos.left - rootRect.left,
      top: originalPos.top - rootRect.top,
      width: originalPos.width,
      height: originalPos.height
    };

    const overlayRelativeToRoot = {
      left: currentRect.left - rootRect.left,
      top: currentRect.top - rootRect.top,
      width: currentRect.width,
      height: currentRect.height
    };

    const animatingOverlay = document.createElement('div');
    animatingOverlay.className = 'enlarge-closing';
    animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius: var(--enlarge-radius, 12px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${this.enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform:none;`;

    const originalImg = overlay.querySelector('img');
    if (originalImg) {
      const img = originalImg.cloneNode();
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      animatingOverlay.appendChild(img);
    }

    overlay.remove();
    this.root.appendChild(animatingOverlay);

    // Force reflow
    void animatingOverlay.getBoundingClientRect();

    requestAnimationFrame(() => {
      animatingOverlay.style.left = `${originalPosRelativeToRoot.left}px`;
      animatingOverlay.style.top = `${originalPosRelativeToRoot.top}px`;
      animatingOverlay.style.width = `${originalPosRelativeToRoot.width}px`;
      animatingOverlay.style.height = `${originalPosRelativeToRoot.height}px`;
      animatingOverlay.style.opacity = '0';
    });

    const cleanup = () => {
      animatingOverlay.remove();
      this.originalTilePosition = null;
      if (refDiv) refDiv.remove();
      parent.style.transition = 'none';
      el.style.transition = 'none';
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');

      requestAnimationFrame(() => {
        el.style.visibility = '';
        el.style.opacity = '0';
        el.style.zIndex = '0';
        this.focusedEl = null;
        this.root.removeAttribute('data-enlarging');

        requestAnimationFrame(() => {
          parent.style.transition = '';
          el.style.transition = 'opacity 300ms ease-out';
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            setTimeout(() => {
              el.style.transition = '';
              el.style.opacity = '';
              this.opening = false;
              if (!this.dragging && this.root.getAttribute('data-enlarging') !== 'true') {
                document.body.classList.remove('dg-scroll-lock');
              }
            }, 300);
          });
        });
      });
    };

    animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
  }

  destroy() {
    if (this.ro) {
      this.ro.disconnect();
    }
    document.body.classList.remove('dg-scroll-lock');
  }
}

// Automatically instantiate on DOM ready if container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dome-gallery-root');
  if (container) {
    new DomeGalleryInstance(container, {
      fit: 0.55,
      grayscale: false,
      openedImageWidth: '400px',
      openedImageHeight: '400px',
      imageBorderRadius: '12px',
      openedImageBorderRadius: '12px'
    });
  }
});
