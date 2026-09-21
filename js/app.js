/**
 * Sri Naga Vaishnavi Interiors - Main Public Application Logic
 */

let currentCategory = 'all';
let allProjects = [];
let currentSettings = {
  whatsapp_number: '+918328664428',
  phone_primary: '+91 83286 64428',
  business_name: 'Sri Naga Vaishnavi Interiors'
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadCategories();
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
        filterAndRenderProjects();
      });
      pillsContainer.appendChild(btn);
    });
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

// Load Projects from Backend
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

// Filter and render projects according to active category and search
function filterAndRenderProjects() {
  const grid = document.getElementById('portfolioGrid');
  const searchInput = document.getElementById('gallerySearch');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  let filtered = allProjects;

  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  if (query) {
    filtered = filtered.filter(p => 
      (p.title || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.specifications || '').toLowerCase().includes(query)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-tools"></i>
        <h3>No workshop projects found</h3>
        <p>Try selecting another category or clear your search.</p>
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
        <h3 class="portfolio-title">${escapeHtml(p.title)}</h3>
        <p class="portfolio-desc">${escapeHtml(p.description || '')}</p>
        ${p.specifications ? `<div class="portfolio-specs"><i class="fas fa-check-double text-gold"></i> ${escapeHtml(p.specifications)}</div>` : ''}
        <div class="portfolio-footer">
          <span class="portfolio-price">${escapeHtml(p.price_range || 'Custom Quote')}</span>
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

// Search input listener
const searchInput = document.getElementById('gallerySearch');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    filterAndRenderProjects();
  });
}

// Format category string
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
  return text
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

// Close modal on escape or background click
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    if (window.closeAdminModal) window.closeAdminModal();
  }
});

// Interactive Instant Quote Estimator
function initEstimator() {
  const serviceSelect = document.getElementById('calcService');
  const variantSelect = document.getElementById('calcVariant');
  const qtyInput = document.getElementById('calcQty');
  const widthInput = document.getElementById('calcWidth');
  const heightInput = document.getElementById('calcHeight');
  const dimensionRow = document.getElementById('calcDimensionRow');

  if (!serviceSelect) return;

  const serviceVariants = {
    mesh_door: [
      { id: 'single_mesh', name: 'Single Balcony Mesh Door (Standard 3x7 ft)', basePrice: 4200, unit: 'door' },
      { id: 'double_mesh', name: 'Double Balcony Mesh Door (5x7 ft)', basePrice: 7200, unit: 'pair' },
      { id: 'pleated_mesh', name: 'Pleated Accordion Sliding Screen (per sqft)', basePrice: 210, unit: 'sqft' }
    ],
    bathroom_door: [
      { id: 'wpc_solid', name: '100% Waterproof Solid WPC Designer Door', basePrice: 5800, unit: 'door' },
      { id: 'wpc_glass', name: 'WPC Door with Frosted Designer Glass Insert', basePrice: 7200, unit: 'door' },
      { id: 'upvc_standard', name: 'Heavy-Gauge UPVC Multi-Chamber Door', basePrice: 4600, unit: 'door' }
    ],
    cloth_hanger: [
      { id: 'hanger_5ft', name: '6-Pipe Jindal SS304 Ceiling Hanger (5 Ft)', basePrice: 1950, unit: 'set' },
      { id: 'hanger_6ft', name: '6-Pipe Jindal SS304 Ceiling Hanger (6 Ft)', basePrice: 2250, unit: 'set' },
      { id: 'hanger_7ft', name: '6-Pipe Jindal SS304 Ceiling Hanger (7 Ft)', basePrice: 2550, unit: 'set' },
      { id: 'hanger_8ft', name: '6-Pipe Jindal SS304 Ceiling Hanger (8 Ft)', basePrice: 2950, unit: 'set' },
      { id: 'hanger_wall', name: 'Stainless Steel Wall-Mounted Folding Rack', basePrice: 1800, unit: 'set' }
    ],
    blinds: [
      { id: 'zebra_blinds', name: 'Dual-Tone Light Filter Zebra Blinds (per sqft)', basePrice: 155, unit: 'sqft' },
      { id: 'blackout_roller', name: '100% Thermal Blackout Roller Blinds (per sqft)', basePrice: 140, unit: 'sqft' },
      { id: 'wooden_venetian', name: 'Luxury Wooden Venetian Blinds (per sqft)', basePrice: 230, unit: 'sqft' }
    ],
    designer_doors: [
      { id: 'safety_steel_door', name: 'Heavy Steel Main Safety Door with Teak Finish', basePrice: 16500, unit: 'door' },
      { id: 'sliding_partition', name: 'Aluminium Profile Sliding Partition Door', basePrice: 12500, unit: 'door' }
    ]
  };

  function updateVariants() {
    const selectedService = serviceSelect.value;
    const variants = serviceVariants[selectedService] || [];
    variantSelect.innerHTML = variants.map(v => `<option value="${v.id}" data-price="${v.basePrice}" data-unit="${v.unit}">${v.name}</option>`).join('');

    const activeVariant = variants[0];
    if (activeVariant && activeVariant.unit === 'sqft') {
      dimensionRow.style.display = 'grid';
    } else {
      dimensionRow.style.display = 'none';
    }
    recalculate();
  }

  function recalculate() {
    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
    if (!selectedOption) return;

    const basePrice = parseFloat(selectedOption.dataset.price) || 0;
    const unit = selectedOption.dataset.unit;
    const qty = parseInt(qtyInput.value) || 1;

    let subtotal = 0;
    let sizeDetails = '';

    if (unit === 'sqft') {
      const w = parseFloat(widthInput.value) || 4;
      const h = parseFloat(heightInput.value) || 5;
      const totalSqft = (w * h) * qty;
      subtotal = totalSqft * basePrice;
      sizeDetails = `${w}ft × ${h}ft (${w * h} sq.ft × ${qty} unit${qty > 1 ? 's' : ''})`;
    } else {
      subtotal = basePrice * qty;
      sizeDetails = `${qty} unit${qty > 1 ? 's' : ''} (Standard dimensions)`;
    }

    const installation = (unit === 'sqft' ? 0 : 0); // included in workshop direct price
    const total = subtotal + installation;

    document.getElementById('estProduct').textContent = selectedOption.textContent;
    document.getElementById('estSpecs').textContent = sizeDetails;
    document.getElementById('estSubtotal').textContent = `₹${Math.round(subtotal).toLocaleString('en-IN')}`;
    document.getElementById('estInstallation').textContent = 'FREE / Included';
    document.getElementById('estTotal').textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;

    // Update WhatsApp link for this estimate
    const cleanWa = (currentSettings.whatsapp_number || '918328664428').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(
      `Hello Sri Naga Vaishnavi Interiors,\nI used your online calculator for:\n- Item: ${selectedOption.textContent}\n- Details: ${sizeDetails}\n- Estimated Price: ₹${Math.round(total).toLocaleString('en-IN')}\n\nPlease let me know when you can visit for measurement.`
    );
    const waBtn = document.getElementById('calcWhatsAppBtn');
    if (waBtn) waBtn.href = `https://wa.me/${cleanWa}?text=${waText}`;
  }

  serviceSelect.addEventListener('change', updateVariants);
  variantSelect.addEventListener('change', () => {
    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.unit === 'sqft') {
      dimensionRow.style.display = 'grid';
    } else {
      dimensionRow.style.display = 'none';
    }
    recalculate();
  });

  qtyInput.addEventListener('input', recalculate);
  widthInput.addEventListener('input', recalculate);
  heightInput.addEventListener('input', recalculate);

  updateVariants();
}

// Inquiry Form Submission
function initInquiryForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const origBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    const data = {
      name: document.getElementById('inqName').value.trim(),
      phone: document.getElementById('inqPhone').value.trim(),
      service: document.getElementById('inqService').value,
      address: document.getElementById('inqAddress').value.trim(),
      message: document.getElementById('inqMessage').value.trim()
    };

    try {
      const res = await API.submitInquiry(data);
      showToast('Inquiry submitted! We will contact you shortly.', 'fa-check-circle');
      
      // WhatsApp direct prompt
      const cleanWa = (currentSettings.whatsapp_number || '918328664428').replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(
        `Hi Sri Naga Vaishnavi Interiors, I just submitted an enquiry:\nName: ${data.name}\nPhone: ${data.phone}\nService: ${data.service}\nLocation: ${data.address}\nNote: ${data.message}`
      );
      
      const promptWa = confirm('Inquiry recorded successfully! Would you also like to open WhatsApp to chat directly with the owner right now?');
      if (promptWa) {
        window.open(`https://wa.me/${cleanWa}?text=${waMsg}`, '_blank');
      }

      form.reset();
    } catch (err) {
      showToast(err.message || 'Error sending inquiry', 'fa-exclamation-triangle');
    } finally {
      submitBtn.innerHTML = origBtnText;
      submitBtn.disabled = false;
    }
  });
}

// Mobile Menu Toggle
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('navLinks');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    if (nav.style.display === 'flex') {
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '80px';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.background = 'rgba(10, 15, 29, 0.98)';
      nav.style.padding = '1.5rem';
      nav.style.borderBottom = '1px solid var(--border-glass)';
    }
  });
}
