/**
 * Sri Naga Vaishnavi Interiors - Hybrid REST API & Offline Static Client
 * Works seamlessly both with FastAPI backend AND on static hosts like GitHub Pages!
 */

const API_BASE = '';
const IS_STATIC_HOST = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';

// Default built-in workshop portfolio for offline / GitHub Pages mode
const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Heavy-Duty Aluminium Mosquito Mesh Balcony Door",
    category: "mesh_doors",
    work_type: "Mosquito Mesh Doors",
    design_style: "Hinged Heavy-Duty Frame",
    cost_bracket: "5k_15k",
    description: "Custom fabricated powder-coated aluminium frame with high-grade SS304 invisible wire mesh. Provides 100% insect protection with unrestricted airflow and panoramic balcony visibility.",
    image_url: "assets/images/mesh_door.jpg",
    specifications: "Material: Grade 6063-T6 Aluminium + SS304 Wire Mesh | Lock: Multi-point latch | Finish: Matte Charcoal Powder Coating | Warranty: 5 Years Rust-Free",
    featured: 1,
    price_range: "₹3,500 - ₹7,500 (Custom sizes)"
  },
  {
    id: 2,
    title: "Pleated Sliding Mosquito Screen System",
    category: "mesh_doors",
    work_type: "Mosquito Mesh Doors",
    design_style: "Sliding Accordion Pleated",
    cost_bracket: "sqft",
    description: "Retractable concertina pleated mesh designed for expansive French windows, balcony sliding doors, and sit-outs. Foldable accordion design with zero floor obstruction.",
    image_url: "assets/images/hero.jpg",
    specifications: "Mesh: German Polyester Pleated Fabric | Guide Rail: Low-profile 3mm threshold | Operation: Smooth cord-guided sliding | Color: Customizable",
    featured: 1,
    price_range: "₹180 - ₹260 per sq. ft."
  },
  {
    id: 3,
    title: "Designer Waterproof WPC Bathroom Door with Frosted Glass Panel",
    category: "bathroom_doors",
    work_type: "Waterproof Bathroom Doors",
    design_style: "WPC Solid Core Frosted Glass",
    cost_bracket: "5k_15k",
    description: "100% waterproof, termite-proof, and borer-resistant solid Wood Polymer Composite (WPC) door featuring an elegant frosted vertical glass panel and brushed satin handle.",
    image_url: "assets/images/bathroom_door.jpg",
    specifications: "Core: High-density WPC solid core | Waterproof: 100% Submersion resistant | Hardware: Rust-proof SS Hinges & Cylinder Lock | Finish: Wood grain laminate",
    featured: 1,
    price_range: "₹5,200 - ₹8,800"
  },
  {
    id: 4,
    title: "Heavy Duty UPVC Moisture-Proof Restroom Door",
    category: "bathroom_doors",
    work_type: "Waterproof Bathroom Doors",
    design_style: "Virgin UPVC 3-Chamber",
    cost_bracket: "under_5k",
    description: "Seamless hollow-core multi-chambered UPVC door fitted with stainless steel hinges, acoustic rubber gaskets, and moisture-resistant locking mechanism.",
    image_url: "assets/images/bathroom_door.jpg",
    specifications: "Profile: Virgin UPVC 3-chamber profile | Thickness: 32mm | Lock: Privacy thumb-turn brass latch | Maintenance: Washable with soap & water",
    featured: 0,
    price_range: "₹4,200 - ₹6,500"
  },
  {
    id: 5,
    title: "Balcony Ceiling 6-Pipe Pulley Cloth Drying Hanger System",
    category: "cloth_hangers",
    work_type: "Ceiling Cloth Hangers",
    design_style: "6-Pipe Pulley System",
    cost_bracket: "under_5k",
    description: "Heavy-duty ceiling-mounted individual pipe pulley cloth drying hanger. Built with genuine Jindal SS304 stainless steel pipes and high-tensile braided nylon ropes for effortless lifting.",
    image_url: "assets/images/cloth_hanger.jpg",
    specifications: "Pipes: 6 Pipes (Available in 4ft, 5ft, 6ft, 7ft, 8ft) | Pipe Gauge: SS304 Rustproof (0.8mm wall) | Capacity: 35 kg load per rack | Pulley: Dual bearing nylon wheels",
    featured: 1,
    price_range: "₹1,800 - ₹3,200 (Includes Installation)"
  },
  {
    id: 6,
    title: "Wall-Mounted Retractable Folding Stainless Steel Cloth Dryer",
    category: "cloth_hangers",
    work_type: "Ceiling Cloth Hangers",
    design_style: "Retractable Accordion Wall Mount",
    cost_bracket: "under_5k",
    description: "Accordion style wall-mounted collapsible drying rack for utility areas, narrow balconies, and indoor laundry walls. Folds completely flat against the wall when not in use.",
    image_url: "assets/images/cloth_hanger.jpg",
    specifications: "Build: Complete SS202/SS304 | Extends: 2.5 ft out | Retracts: Folds flat to 2 inches | Capacity: 25 kg wet laundry",
    featured: 0,
    price_range: "₹1,400 - ₹2,400"
  },
  {
    id: 7,
    title: "Luxury Dual-Tone Zebra Blinds for Living & Bedrooms",
    category: "blinds",
    work_type: "Window Blinds & Shades",
    design_style: "Dual-Tone Zebra & Daylight",
    cost_bracket: "sqft",
    description: "Contemporary daylight-filtering and privacy-regulating zebra roller blinds. Seamlessly switch between transparent and blackout stripe alignment with a smooth chain pull.",
    image_url: "assets/images/blinds.jpg",
    specifications: "Fabric: 100% Anti-static Polyester | Headrail: Extruded aluminium cassette with bottom weight bar | Mechanism: Smooth bead chain clutch | UV Protection: 85%",
    featured: 1,
    price_range: "₹120 - ₹195 per sq. ft."
  },
  {
    id: 8,
    title: "Custom Blackout Roller & Venetian Window Blinds",
    category: "blinds",
    work_type: "Window Blinds & Shades",
    design_style: "Blackout Thermal Roller",
    cost_bracket: "sqft",
    description: "Total blackout thermal roller blinds designed for master bedrooms, home theatres, and sunny windows to keep rooms cool and completely private.",
    image_url: "assets/images/blinds.jpg",
    specifications: "Blackout Grade: 100% Light blockout | Coating: Silver thermal reflective backing | Operating Type: Manual or motorized option | Fire Retardant: Yes",
    featured: 0,
    price_range: "₹110 - ₹175 per sq. ft."
  },
  {
    id: 9,
    title: "Architectural Window Accessories, Pelmets & Heavy Sliding Tracks",
    category: "window_accessories",
    work_type: "Window Accessories",
    design_style: "Silent-Glide Ripple Track",
    cost_bracket: "under_5k",
    description: "Complete range of window upgrade accessories: silent-gliding ripple fold curtain tracks, designer valances, aluminium sliding mesh tracks, and secure window grills.",
    image_url: "assets/images/blinds.jpg",
    specifications: "Tracks: Anodized aluminium silent-glide | Carriers: Ball-bearing wheeled runners | Finish: Champagne Gold / Matt Black / Pure White",
    featured: 0,
    price_range: "₹650 - ₹1,800 per track / Custom Quote"
  },
  {
    id: 10,
    title: "Main Entrance Security Safety Door with Wood & Steel Finish",
    category: "designer_doors",
    work_type: "Safety & Designer Doors",
    design_style: "Teak & Steel Security Frame",
    cost_bracket: "15k_plus",
    description: "Heavy-gauge dual-panel safety door featuring high-tensile steel security framework clad with teak-finish weatherproof HPL laminate and multi-bolt security lock.",
    image_url: "assets/images/hero.jpg",
    specifications: "Structure: 16-gauge cold rolled steel framework | Core: Acoustic PUF infill | Locks: Godrej 6-lever deadbolt system | Weight: 45 kg sturdy build",
    featured: 1,
    price_range: "₹14,500 - ₹24,000"
  }
];

const DEFAULT_SETTINGS = {
  admin_pin: "admin123",
  business_name: "Sri Naga Vaishnavi Interiors",
  owner_name: "Master Craftsman & Workshop Owner",
  phone_primary: "+91 83286 64428",
  phone_secondary: "+91 83286 64428",
  whatsapp_number: "+918328664428",
  email: "contact@srinagavaishnavi.com",
  address: "Opp. Main Bus Depot, Workshop Road, Industrial Area, Hyderabad / Vijayawada",
  working_hours: "Mon - Sat: 9:00 AM - 8:30 PM | Sun: 10:00 AM - 4:00 PM",
  experience_years: "14+",
  completed_projects: "1,850+",
  happy_customers: "1,500+"
};

function getLocalProjects() {
  try {
    const raw = localStorage.getItem('snvi_local_projects');
    if (!raw) {
      localStorage.setItem('snvi_local_projects', JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PROJECTS;
  }
}

function saveLocalProjects(projects) {
  try {
    localStorage.setItem('snvi_local_projects', JSON.stringify(projects));
  } catch (e) {
    console.error('Could not save projects to localStorage:', e);
  }
}

function getLocalSettings() {
  try {
    const raw = localStorage.getItem('snvi_local_settings');
    if (!raw) {
      localStorage.setItem('snvi_local_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function saveLocalSettings(settings) {
  try {
    localStorage.setItem('snvi_local_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Could not save settings to localStorage:', e);
  }
}

function parseMinPriceNum(priceStr) {
  if (!priceStr) return 0;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, ' ');
  const nums = cleaned.split(/\s+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  return nums.length > 0 ? nums[0] : 0;
}

const API = {
  // Fetch projects with full multi-filtering support
  async getProjects(filters = {}) {
    const { category, cost_range, design, search, sort_by } = filters;

    if (!IS_STATIC_HOST) {
      try {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (cost_range && cost_range !== 'all') params.append('cost_range', cost_range);
        if (design && design !== 'all') params.append('design', design);
        if (search) params.append('search', search);
        if (sort_by) params.append('sort_by', sort_by);

        const url = `${API_BASE}/api/projects${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (e) {
        console.warn('Backend unavailable, using rich static storage.', e);
      }
    }

    // Static fallback: local filtering & sorting
    let items = getLocalProjects();

    // 1. Work type / category filter
    if (category && category !== 'all') {
      items = items.filter(p => p.category === category);
    }

    // 2. Cost / Budget filter
    if (cost_range && cost_range !== 'all') {
      items = items.filter(p => {
        const pStr = (p.price_range || '').toLowerCase();
        const pVal = parseMinPriceNum(pStr);
        const isSqft = pStr.includes('sq') || pStr.includes('sq. ft') || pStr.includes('sqft');

        if (cost_range === 'sqft') return isSqft;
        if (cost_range === 'under_5k') return !isSqft && pVal > 0 && pVal < 5000;
        if (cost_range === '5k_15k') return !isSqft && pVal >= 5000 && pVal <= 15000;
        if (cost_range === '15k_plus') return !isSqft && pVal > 15000;
        return true;
      });
    }

    // 3. Design style filter
    if (design && design !== 'all') {
      const d = design.toLowerCase();
      items = items.filter(p =>
        (p.design_style || '').toLowerCase().includes(d) ||
        (p.title || '').toLowerCase().includes(d) ||
        (p.description || '').toLowerCase().includes(d) ||
        (p.specifications || '').toLowerCase().includes(d)
      );
    }

    // 4. Keyword search
    if (search) {
      const q = search.toLowerCase().trim();
      items = items.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.specifications || '').toLowerCase().includes(q) ||
        (p.work_type || '').toLowerCase().includes(q) ||
        (p.design_style || '').toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    if (sort_by === 'price_asc') {
      items.sort((a, b) => parseMinPriceNum(a.price_range) - parseMinPriceNum(b.price_range));
    } else if (sort_by === 'price_desc') {
      items.sort((a, b) => parseMinPriceNum(b.price_range) - parseMinPriceNum(a.price_range));
    } else if (sort_by === 'newest') {
      items.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      // Featured first
      items.sort((a, b) => (b.featured || 0) - (a.featured || 0) || (b.id || 0) - (a.id || 0));
    }

    return items;
  },

  // Owner update product price anytime
  async updateProjectPrice(id, newPrice, adminPin) {
    const cleanPrice = String(newPrice).trim();
    if (!cleanPrice) throw new Error("Price cannot be empty");

    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/projects/${id}/price`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-PIN': adminPin
          },
          body: JSON.stringify({ price_range: cleanPrice })
        });
        if (res.ok) {
          const data = await res.json();
          const projects = getLocalProjects();
          const target = projects.find(p => p.id === id);
          if (target) {
            target.price_range = cleanPrice;
            saveLocalProjects(projects);
          }
          return data;
        }
      } catch (e) {
        console.warn('Backend price update failed, applying to local store:', e);
      }
    }

    // Update localStorage
    const projects = getLocalProjects();
    const target = projects.find(p => p.id === id);
    if (!target) throw new Error("Product not found");

    target.price_range = cleanPrice;
    saveLocalProjects(projects);

    return {
      message: "Price updated successfully",
      project_id: id,
      price_range: cleanPrice
    };
  },

  // Fetch categories with counts
  async getCategories() {
    const categories_meta = [
      { id: "all", label: "All Work", icon: "fa-th-large" },
      { id: "mesh_doors", label: "Mosquito Mesh Doors", icon: "fa-shield-alt" },
      { id: "bathroom_doors", label: "Waterproof Bathroom Doors", icon: "fa-door-closed" },
      { id: "cloth_hangers", label: "Ceiling Cloth Hangers", icon: "fa-tshirt" },
      { id: "blinds", label: "Window Blinds & Shades", icon: "fa-sliders-h" },
      { id: "designer_doors", label: "Safety & Designer Doors", icon: "fa-door-open" },
      { id: "window_accessories", label: "Window Accessories & Tracks", icon: "fa-window-maximize" }
    ];

    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const projects = getLocalProjects();
    const counts = {};
    projects.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    categories_meta.forEach(c => {
      if (c.id === 'all') c.count = projects.length;
      else c.count = counts[c.id] || 0;
    });

    return categories_meta;
  },

  // Submit customer inquiry
  async submitInquiry(data) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/inquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const raw = localStorage.getItem('snvi_local_inquiries') || '[]';
    const inqs = JSON.parse(raw);
    const newInq = { ...data, id: Date.now(), status: 'New', created_at: new Date().toLocaleString() };
    inqs.unshift(newInq);
    localStorage.setItem('snvi_local_inquiries', JSON.stringify(inqs));

    return { message: "Inquiry recorded successfully!", inquiry_id: newInq.id };
  },

  // Verify Admin PIN
  async verifyAdminPin(pin) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const s = getLocalSettings();
    const correctPin = s.admin_pin || 'admin123';
    if (pin === correctPin) {
      return { authenticated: true, token: correctPin, message: "Login successful" };
    }
    throw new Error("Invalid PIN. Access denied.");
  },

  // Owner upload new work project
  async uploadProject(formData, adminPin) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/projects`, {
          method: 'POST',
          headers: { 'X-Admin-PIN': adminPin },
          body: formData
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const title = formData.get('title');
    const category = formData.get('category');
    const description = formData.get('description') || '';
    const specifications = formData.get('specifications') || '';
    const price_range = formData.get('price_range') || '';
    const featured = formData.get('featured') ? 1 : 0;
    const file = formData.get('file');

    return new Promise((resolve) => {
      const finish = (imageUrl) => {
        const projects = getLocalProjects();
        const newProj = {
          id: Date.now(),
          title,
          category,
          description,
          specifications,
          price_range,
          featured,
          image_url: imageUrl || 'assets/images/mesh_door.jpg',
          created_at: new Date().toISOString()
        };
        projects.unshift(newProj);
        saveLocalProjects(projects);
        resolve({ message: "Work photo uploaded successfully", id: newProj.id, image_url: newProj.image_url });
      };

      if (file && file.size > 0) {
        const reader = new FileReader();
        reader.onload = (e) => finish(e.target.result);
        reader.onerror = () => finish('assets/images/mesh_door.jpg');
        reader.readAsDataURL(file);
      } else {
        finish('assets/images/mesh_door.jpg');
      }
    });
  },

  // Owner delete project
  async deleteProject(id, adminPin) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/projects/${id}`, {
          method: 'DELETE',
          headers: { 'X-Admin-PIN': adminPin }
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    let projects = getLocalProjects();
    projects = projects.filter(p => p.id !== id);
    saveLocalProjects(projects);
    return { message: "Project deleted successfully" };
  },

  // Admin get inquiries
  async getInquiries(adminPin) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/inquiries`, {
          headers: { 'X-Admin-PIN': adminPin }
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    try {
      const raw = localStorage.getItem('snvi_local_inquiries') || '[]';
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  },

  // Admin update inquiry status
  async updateInquiryStatus(id, status, adminPin) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/inquiries/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Admin-PIN': adminPin },
          body: JSON.stringify({ status })
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    try {
      const raw = localStorage.getItem('snvi_local_inquiries') || '[]';
      const inqs = JSON.parse(raw);
      const target = inqs.find(i => i.id === id);
      if (target) target.status = status;
      localStorage.setItem('snvi_local_inquiries', JSON.stringify(inqs));
    } catch (e) {}
    return { message: "Inquiry status updated" };
  },

  // Admin delete inquiry
  async deleteInquiry(id, adminPin) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/inquiries/${id}`, {
          method: 'DELETE',
          headers: { 'X-Admin-PIN': adminPin }
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    try {
      let inqs = JSON.parse(localStorage.getItem('snvi_local_inquiries') || '[]');
      inqs = inqs.filter(i => i.id !== id);
      localStorage.setItem('snvi_local_inquiries', JSON.stringify(inqs));
    } catch (e) {}
    return { message: "Inquiry deleted" };
  },

  // Fetch workshop settings
  async getSettings() {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/settings`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return getLocalSettings();
  },

  // Update workshop settings
  async updateSettings(data, adminPin) {
    if (!IS_STATIC_HOST) {
      try {
        const res = await fetch(`${API_BASE}/api/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Admin-PIN': adminPin },
          body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const current = getLocalSettings();
    const updated = { ...current, ...data };
    saveLocalSettings(updated);
    return { message: "Settings updated successfully" };
  }
};

window.API = API;
