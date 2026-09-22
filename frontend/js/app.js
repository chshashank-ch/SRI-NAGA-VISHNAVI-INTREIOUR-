/**
 * Sri Naga Vaishnavi Interiors - Main Public Application Logic
 * Supports Multi-Filtering by Cost, Type of Work, Designs & Keywords
 */

let allProjects = [];
let currentCategory = 'all';
let currentCostFilter = 'all';
let currentDesignFilter = 'all';
let currentSortOrder = 'featured';

let currentSettings = {
  whatsapp_number: '+918328664428',
  phone_primary: '+91 83286 64428',
  business_name: 'Sri Naga Vaishnavi Interiors'
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadCategories();
  initFilterControls();
  await loadProjects();
  initEstimator();
  initInquiryForm();
  initMobileMenu();
});

// Toast notification helper
function showToast(message, icon = 'fa-check-circle') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toastContainer';
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

// Load Workshop Settings & Populate Dynamic Contact Elements
async function loadSettings() {
  try {
    const s = await API.getSettings();
    currentSettings = { ...currentSettings, ...s };

    // Update phone numbers
    document.querySelectorAll('.js-phone-primary').forEach(el => {
      el.textContent = currentSettings.phone_primary || '+91 83286 64428';
      if (el.tagName === 'A') {
        el.href = `tel:${(currentSettings.phone_primary || '').replace(/\s+/g, '')}`;
      }
    });

    // Update WhatsApp links
    const cleanWa = (currentSettings.whatsapp_number || '918328664428').replace(/[^0-9]/g, '');
    document.querySelectorAll('.js-whatsapp-link').forEach(el => {
      const msg = encodeURIComponent(`Hello Sri Naga Vaishnavi Interiors, I am interested in interior works (Mesh doors / Bathroom doors / Blinds / Cloth hangers). Please share details.`);
      el.href = `https://wa.me/${cleanWa}?text=${msg}`;
    });

    // Update address
    document.querySelectorAll('.js-address').forEach(el => {
      if (currentSettings.address) el.textContent = currentSettings.address;
    });

    // Update working hours
    document.querySelectorAll('.js-working-hours').forEach(el => {
      if (currentSettings.working_hours) el.textContent = currentSettings.working_hours;
    });
  } catch (err) {
    console.warn('Could not load dynamic settings, using defaults.', err);
  }
}

// Load Category Filter Pills
async function loadCategories() {
  try {
    const cats = await API.getCategories();
    const pillsContainer = document.getElementById('categoryPills');
    if (!pillsContainer) return;

    pillsContainer.innerHTML = '';
    cats.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `category-pill ${c.id === currentCategory ? 'active' : ''}`;
      btn.dataset.category = c.id;
      btn.innerHTML = `
        <i class="fas ${c.icon}"></i>
        <span>${c.label}</span>
        <span class="pill-count">${c.count}</span>
      `;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = c.id;
        const workTypeSelect = document.getElementById('filterWorkType');
        if (workTypeSelect) workTypeSelect.value = c.id;
        filterAndRenderProjects();
      });
      pillsContainer.appendChild(btn);
    });
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

// Initialize Multi-Filter Controls
function initFilterControls() {
  const searchInput = document.getElementById('gallerySearch');
  const workTypeSelect = document.getElementById('filterWorkType');
  const costSelect = document.getElementById('filterCost');
  const designSelect = document.getElementById('filterDesign');
  const sortSelect = document.getElementById('sortProjects');
  const resetBtn = document.getElementById('resetFiltersBtn');

  if (searchInput) {
    searchInput.addEventListener('input', () => filterAndRenderProjects());
  }

  if (workTypeSelect) {
    workTypeSelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      document.querySelectorAll('.category-pill').forEach(p => {
        if (p.dataset.category === currentCategory) p.classList.add('active');
        else p.classList.remove('active');
      });
      filterAndRenderProjects();
    });
  }

  if (costSelect) {
    costSelect.addEventListener('change', (e) => {
      currentCostFilter = e.target.value;
      filterAndRenderProjects();
    });
  }

  if (designSelect) {
    designSelect.addEventListener('change', (e) => {
      currentDesignFilter = e.target.value;
      filterAndRenderProjects();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSortOrder = e.target.value;
      filterAndRenderProjects();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentCategory = 'all';
      currentCostFilter = 'all';
      currentDesignFilter = 'all';
      currentSortOrder = 'featured';

      if (searchInput) searchInput.value = '';
      if (workTypeSelect) workTypeSelect.value = 'all';
      if (costSelect) costSelect.value = 'all';
      if (designSelect) designSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'featured';

      document.querySelectorAll('.category-pill').forEach(p => {
        if (p.dataset.category === 'all') p.classList.add('active');
        else p.classList.remove('active');
      });

      filterAndRenderProjects();
      showToast('Filters reset to show all workshop products', 'fa-undo');
    });
  }
}

window.setGalleryFilter = function(category) {
  currentCategory = category;
  const workTypeSelect = document.getElementById('filterWorkType');
  if (workTypeSelect) workTypeSelect.value = category;

  document.querySelectorAll('.category-pill').forEach(p => {
    if (p.dataset.category === category) p.classList.add('active');
    else p.classList.remove('active');
  });

  filterAndRenderProjects();
};

async function loadProjects() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="no-results"><i class="fas fa-spinner fa-spin"></i><p>Loading workshop portfolio...</p></div>';

  try {
    allProjects = await API.getProjects();
    filterAndRenderProjects();
  } catch (err) {
    grid.innerHTML = '<div class="no-results"><i class="fas fa-exclamation-circle"></i><p>Could not load gallery items. Please try refreshing.</p></div>';
  }
}

function parseMinPriceNum(priceStr) {
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, ' ');
  const nums = cleaned.split(/\s+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  return nums.length > 0 ? nums[0] : 0;
}

function filterAndRenderProjects() {
  const grid = document.getElementById('portfolioGrid');
  const searchInput = document.getElementById('gallerySearch');
  const countEl = document.getElementById('filterCount');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  let filtered = [...allProjects];

  // 1. Type of Work Filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // 2. Cost / Price Filter
  if (currentCostFilter !== 'all') {
    filtered = filtered.filter(p => {
      const pStr = (p.price_range || '').toLowerCase();
      const pVal = parseMinPriceNum(pStr);
      const isSqft = pStr.includes('sq') || pStr.includes('sq. ft') || pStr.includes('sqft');

      if (currentCostFilter === 'sqft') return isSqft;
      if (currentCostFilter === 'under_5k') return !isSqft && pVal > 0 && pVal < 5000;
      if (currentCostFilter === '5k_15k') return !isSqft && pVal >= 5000 && pVal <= 15000;
      if (currentCostFilter === '15k_plus') return !isSqft && pVal > 15000;
      return true;
    });
  }

  // 3. Design / Style Filter
  if (currentDesignFilter !== 'all') {
    const d = currentDesignFilter.toLowerCase();
    filtered = filtered.filter(p =>
      (p.design_style || '').toLowerCase().includes(d) ||
      (p.title || '').toLowerCase().includes(d) ||
      (p.description || '').toLowerCase().includes(d) ||
      (p.specifications || '').toLowerCase().includes(d)
    );
  }

  // 4. Keyword Search
  if (query) {
    filtered = filtered.filter(p => 
      (p.title || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.specifications || '').toLowerCase().includes(query) ||
      (p.work_type || '').toLowerCase().includes(query) ||
      (p.design_style || '').toLowerCase().includes(query)
    );
  }

  // 5. Sorting
  if (currentSortOrder === 'price_asc') {
    filtered.sort((a, b) => parseMinPriceNum(a.price_range) - parseMinPriceNum(b.price_range));
  } else if (currentSortOrder === 'price_desc') {
    filtered.sort((a, b) => parseMinPriceNum(b.price_range) - parseMinPriceNum(a.price_range));
  } else if (currentSortOrder === 'newest') {
    filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
  } else {
    filtered.sort((a, b) => (b.featured || 0) - (a.featured || 0) || (b.id || 0) - (a.id || 0));
  }

  if (countEl) {
    countEl.innerHTML = `Showing <strong>${filtered.length}</strong> of ${allProjects.length} workshop fabrications`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1; padding: 3rem 1rem; text-align: center;">
        <i class="fas fa-filter" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">No products match your selected filters</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try clearing your cost, design, or search criteria to explore all products.</p>
        <button class="btn btn-primary" onclick="document.getElementById('resetFiltersBtn').click()">
          <i class="fas fa-undo"></i> Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="portfolio-card">
      <div class="portfolio-img-wrap" onclick="openLightbox(${p.id})">
        <span class="portfolio-category-badge">${formatCategoryName(p.category)}</span>
        <img src="${p.image_url}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.src='assets/images/hero.jpg'">
        <div class="portfolio-overlay">
          <button class="portfolio-zoom-btn" title="View Fullscreen"><i class="fas fa-search-plus"></i></button>
        </div>
      </div>
      <div class="portfolio-content">
        <div class="portfolio-meta-tags">
          <span class="meta-tag"><i class="fas fa-hammer"></i> ${escapeHtml(p.work_type || formatCategoryName(p.category))}</span>
          ${p.design_style ? `<span class="meta-tag meta-tag-design"><i class="fas fa-paint-brush"></i> ${escapeHtml(p.design_style)}</span>` : ''}
        </div>
        <h3 class="portfolio-title">${escapeHtml(p.title)}</h3>
        <p class="portfolio-desc">${escapeHtml(p.description || '')}</p>
        ${p.specifications ? `<div class="portfolio-specs"><i class="fas fa-check-double text-gold"></i> ${escapeHtml(p.specifications)}</div>` : ''}
        <div class="portfolio-footer">
          <div class="portfolio-price-block">
            <span class="price-label">Workshop Price</span>
            <span class="portfolio-price">${escapeHtml(p.price_range || 'Custom Quote')}</span>
          </div>
          <div class="portfolio-actions">
            <a href="${getWhatsAppEnquiryUrl(p.title)}" target="_blank" class="btn-sm-whatsapp" title="Enquire on WhatsApp">
              <i class="fab fa-whatsapp"></i> Enquire
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function formatCategoryName(cat) {
  const map = {
    'mesh_doors': 'Mesh Door',
    'bathroom_doors': 'Bathroom Door',
    'cloth_hangers': 'Cloth Hanger',
    'blinds': 'Window Blinds',
    'designer_doors': 'Designer Door',
    'window_accessories': 'Window Accessory'
  };
  return map[cat] || cat.replace(/_/g, ' ');
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getWhatsAppEnquiryUrl(projectTitle) {
  const cleanWa = (currentSettings.whatsapp_number || '918328664428').replace(/[^0-9]/g, '');
  const msg = encodeURIComponent(`Hello Sri Naga Vaishnavi Interiors, I saw "${projectTitle}" on your website. Please share estimate and measurement details.`);
  return `https://wa.me/${cleanWa}?text=${msg}`;
}

// Lightbox Modal
window.openLightbox = function(id) {
  const p = allProjects.find(item => item.id === id);
  if (!p) return;

  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const category = document.getElementById('lightboxCategory');
  const title = document.getElementById('lightboxTitle');
  const desc = document.getElementById('lightboxDesc');
  const specs = document.getElementById('lightboxSpecs');
  const price = document.getElementById('lightboxPrice');
  const waBtn = document.getElementById('lightboxWhatsAppBtn');

  img.src = p.image_url;
  category.textContent = formatCategoryName(p.category);
  title.textContent = p.title;
  desc.textContent = p.description || 'Custom crafted at Sri Naga Vaishnavi Interiors workshop with premier precision and durability.';
  specs.textContent = p.specifications || 'Standard workshop guarantee and rust-proof SS304 / waterproof materials.';
  price.textContent = p.price_range || 'Custom Workshop Quotation';
  waBtn.href = getWhatsAppEnquiryUrl(p.title);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

// Instant Cost Estimator Logic
function initEstimator() {
  const serviceSelect = document.getElementById('calcService');
  const typeSelect = document.getElementById('calcType');
  const widthInput = document.getElementById('calcWidth');
  const heightInput = document.getElementById('calcHeight');
  const qtyInput = document.getElementById('calcQty');
  const estTotal = document.getElementById('estTotal');
  const estSqft = document.getElementById('estSqft');
  const estNote = document.getElementById('estNote');
  const waEstBtn = document.getElementById('estWhatsAppBtn');

  if (!serviceSelect) return;

  const typeOptions = {
    mesh_door: [
      { id: 'ss304_hinged', name: 'SS304 Mesh Hinged Aluminium Door (₹4,800/door)', basePrice: 4800, isFixed: true },
      { id: 'pleated_mesh', name: 'Pleated Sliding Accordion Mesh (₹220/sq.ft)', basePrice: 220, isFixed: false },
      { id: 'magnetic_net', name: 'Magnetic Window Insect Net (₹85/sq.ft)', basePrice: 85, isFixed: false }
    ],
    bathroom_door: [
      { id: 'wpc_frosted', name: 'Designer Waterproof WPC Solid Door (₹6,800/door)', basePrice: 6800, isFixed: true },
      { id: 'upvc_door', name: 'Heavy Duty UPVC Restroom Door (₹4,800/door)', basePrice: 4800, isFixed: true }
    ],
    cloth_hanger: [
      { id: 'ceiling_pulley', name: 'Balcony 6-Pipe SS304 Ceiling Pulley Hanger (₹2,600 installed)', basePrice: 2600, isFixed: true },
      { id: 'wall_accordion', name: 'Wall Mounted Folding SS Dryer Rack (₹1,900/piece)', basePrice: 1900, isFixed: true }
    ],
    blinds: [
      { id: 'zebra_blinds', name: 'Dual-Tone Daylight Zebra Blinds (₹150/sq.ft)', basePrice: 150, isFixed: false },
      { id: 'blackout_roller', name: 'Thermal Blackout Roller Blinds (₹135/sq.ft)', basePrice: 135, isFixed: false }
    ]
  };

  function updateTypeOptions() {
    const s = serviceSelect.value;
    const opts = typeOptions[s] || [];
    typeSelect.innerHTML = opts.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    calculate();
  }

  function calculate() {
    const s = serviceSelect.value;
    const tId = typeSelect.value;
    const w = parseFloat(widthInput.value) || 3;
    const h = parseFloat(heightInput.value) || 7;
    const qty = parseInt(qtyInput.value) || 1;

    const opts = typeOptions[s] || [];
    const chosen = opts.find(o => o.id === tId) || opts[0];

    if (!chosen) return;

    const sqft = (w * h) * qty;
    let total = 0;

    if (chosen.isFixed) {
      total = chosen.basePrice * qty;
      if (estSqft) estSqft.textContent = `${qty} unit(s)`;
    } else {
      total = chosen.basePrice * sqft;
      if (estSqft) estSqft.textContent = `${sqft.toFixed(1)} sq. ft total`;
    }

    if (estTotal) estTotal.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
    if (estNote) estNote.textContent = '*Estimated workshop quotation. Final rate verified after free doorstep measurement.';

    if (waEstBtn) {
      const cleanWa = (currentSettings.whatsapp_number || '918328664428').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(`Hello Sri Naga Vaishnavi Interiors, I calculated an estimate of ₹${Math.round(total).toLocaleString('en-IN')} for ${qty}x ${chosen.name} (${w}ft x ${h}ft). Please confirm and schedule free measurement.`);
      waEstBtn.href = `https://wa.me/${cleanWa}?text=${msg}`;
    }
  }

  serviceSelect.addEventListener('change', updateTypeOptions);
  typeSelect.addEventListener('change', calculate);
  widthInput.addEventListener('input', calculate);
  heightInput.addEventListener('input', calculate);
  qtyInput.addEventListener('input', calculate);

  updateTypeOptions();
}

// Inquiry Form Logic
function initInquiryForm() {
  const form = document.getElementById('inquiryForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Request...';
    btn.disabled = true;

    const data = {
      name: document.getElementById('inqName').value.trim(),
      phone: document.getElementById('inqPhone').value.trim(),
      service: document.getElementById('inqService').value,
      address: document.getElementById('inqAddress').value.trim(),
      message: document.getElementById('inqMessage').value.trim()
    };

    try {
      await API.submitInquiry(data);
      showToast('Thank you! Owner will call you shortly for free measurement.', 'fa-phone-volume');
      form.reset();
    } catch (err) {
      showToast('Could not submit. Please call or WhatsApp us directly.', 'fa-exclamation-triangle');
    } finally {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  });
}

// Mobile Hamburger Menu
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    links.classList.toggle('active');
  });

  links.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => {
      links.classList.remove('active');
    });
  });
}
