/**
 * Sri Naga Vaishnavi Interiors - Owner Admin Studio with Instant Price Changing
 */

let adminPin = sessionStorage.getItem('snvi_admin_pin') || '';

document.addEventListener('DOMContentLoaded', () => {
  initAdminModal();
  initUploadForm();
  initSettingsForm();
});

function initAdminModal() {
  const modal = document.getElementById('adminModal');
  const triggerLinks = document.querySelectorAll('.js-open-admin');
  const closeBtn = document.getElementById('closeAdminBtn');

  triggerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeAdminModal);
  }

  // Admin Login form
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pinInput = document.getElementById('adminPinInput');
      const pin = pinInput.value.trim();
      const errorMsg = document.getElementById('adminLoginError');

      try {
        await API.verifyAdminPin(pin);
        adminPin = pin;
        sessionStorage.setItem('snvi_admin_pin', pin);
        errorMsg.style.display = 'none';
        showAdminDashboard();
        showToast('Welcome, Workshop Owner! Admin Studio active.', 'fa-user-shield');
      } catch (err) {
        errorMsg.textContent = err.message || 'Incorrect PIN. Try again.';
        errorMsg.style.display = 'block';
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      adminPin = '';
      sessionStorage.removeItem('snvi_admin_pin');
      showAdminLogin();
      showToast('Logged out of Admin Studio', 'fa-sign-out-alt');
    });
  }

  // Tab switching
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');

      if (targetId === 'tabManageWorks') loadAdminWorks();
      if (targetId === 'tabInquiries') loadAdminInquiries();
      if (targetId === 'tabSettings') loadAdminSettingsForm();
    });
  });
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (adminPin) {
    showAdminDashboard();
  } else {
    showAdminLogin();
  }
}

window.closeAdminModal = function() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

function showAdminLogin() {
  document.getElementById('adminLoginView').style.display = 'block';
  document.getElementById('adminDashboardView').style.display = 'none';
  const pinInput = document.getElementById('adminPinInput');
  if (pinInput) {
    pinInput.value = '';
    pinInput.focus();
  }
}

async function showAdminDashboard() {
  document.getElementById('adminLoginView').style.display = 'none';
  document.getElementById('adminDashboardView').style.display = 'block';

  // Populate quick WhatsApp hotline field
  try {
    const s = await API.getSettings();
    const quickInput = document.getElementById('quickWhatsappInput');
    if (quickInput && s.whatsapp_number) {
      quickInput.value = s.whatsapp_number;
    }
  } catch (e) {
    console.warn('Could not prefill quick whatsapp input', e);
  }

  // Wire quick save button if not already wired
  const quickSaveBtn = document.getElementById('quickWhatsappSaveBtn');
  if (quickSaveBtn && !quickSaveBtn.dataset.bound) {
    quickSaveBtn.dataset.bound = 'true';
    quickSaveBtn.addEventListener('click', async () => {
      const quickInput = document.getElementById('quickWhatsappInput');
      const newNum = (quickInput ? quickInput.value : '').trim();
      if (!newNum) {
        showToast('Please enter a valid WhatsApp number', 'fa-exclamation-circle');
        return;
      }
      quickSaveBtn.disabled = true;
      const orig = quickSaveBtn.innerHTML;
      quickSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      try {
        await API.updateSettings({ whatsapp_number: newNum }, adminPin);
        showToast(`Live WhatsApp number updated to ${newNum}!`, 'fa-check-circle');
        if (window.loadSettings) await window.loadSettings();
      } catch (err) {
        showToast(err.message || 'Failed to update WhatsApp number', 'fa-exclamation-triangle');
      } finally {
        quickSaveBtn.innerHTML = orig;
        quickSaveBtn.disabled = false;
      }
    });
  }

  loadAdminWorks();
}

// Upload Work Photo form
function initUploadForm() {
  const form = document.getElementById('uploadWorkForm');
  const fileInput = document.getElementById('workPhotoFile');
  const dropzone = document.getElementById('uploadDropzone');
  const previewBox = document.getElementById('uploadPreviewBox');
  const previewImg = document.getElementById('uploadPreviewImg');

  if (!form || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      handleFilePreview(e.dataTransfer.files[0]);
    }
  });

  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      handleFilePreview(fileInput.files[0]);
    }
  });

  function handleFilePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewBox.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  // Handle Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Please select or capture a photo of your work.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Photo...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('title', document.getElementById('workTitle').value.trim());
    formData.append('category', document.getElementById('workCategory').value);
    formData.append('description', document.getElementById('workDescription').value.trim());
    formData.append('specifications', document.getElementById('workSpecs').value.trim());
    formData.append('price_range', document.getElementById('workPrice').value.trim());
    formData.append('featured', document.getElementById('workFeatured').checked ? 1 : 0);
    formData.append('file', fileInput.files[0]);

    try {
      await API.uploadProject(formData, adminPin);
      showToast('Work photo successfully uploaded to public site!', 'fa-cloud-upload-alt');
      form.reset();
      previewBox.style.display = 'none';

      if (window.loadProjects) window.loadProjects();
      if (window.loadCategories) window.loadCategories();

      document.querySelector('[data-tab="tabManageWorks"]').click();
    } catch (err) {
      showToast(err.message || 'Upload failed', 'fa-exclamation-triangle');
    } finally {
      submitBtn.innerHTML = origText;
      submitBtn.disabled = false;
    }
  });
}

// Load Works in Admin Management Table with Live Price Editing
async function loadAdminWorks() {
  const container = document.getElementById('adminWorksList');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="5" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading works...</td></tr>';

  try {
    const projects = await API.getProjects();
    if (projects.length === 0) {
      container.innerHTML = '<tr><td colspan="5" style="text-align:center;">No work photos uploaded yet. Use the "Upload New Work Photo" tab.</td></tr>';
      return;
    }

    container.innerHTML = projects.map(p => `
      <tr>
        <td>
          <img src="${p.image_url}" class="admin-thumb" alt="${escapeHtml(p.title)}" onerror="this.src='assets/images/hero.jpg'">
        </td>
        <td>
          <strong>${escapeHtml(p.title)}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${escapeHtml(p.specifications || '')}</div>
        </td>
        <td>
          <span class="portfolio-category-badge" style="position:static; display:inline-block;">${formatCategoryName(p.category)}</span>
        </td>
        <td class="admin-price-cell">
          <div id="priceDisplay_${p.id}" class="price-display-wrap">
            <span class="price-badge-live" id="priceBadge_${p.id}">${escapeHtml(p.price_range || 'Custom Quote')}</span>
            <button class="btn-change-price" onclick="togglePriceEditor(${p.id})" title="Change Product Price">
              <i class="fas fa-pencil-alt"></i> Edit Price
            </button>
          </div>
          <div id="priceEditor_${p.id}" class="price-editor-wrap" style="display:none;">
            <input type="text" id="priceInput_${p.id}" class="price-edit-input" value="${escapeHtml(p.price_range || '')}" placeholder="e.g. ₹4,500 - ₹6,000">
            <div class="price-editor-actions">
              <button class="btn-save-price" onclick="saveProjectPrice(${p.id})" title="Save Price">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn-cancel-price" onclick="togglePriceEditor(${p.id})" title="Cancel">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </td>
        <td>
          <button class="admin-action-btn btn-delete" onclick="handleDeleteProject(${p.id})">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Error: ${err.message}</td></tr>`;
  }
}

// Toggle Price Editor Inline Box
window.togglePriceEditor = function(id) {
  const displayWrap = document.getElementById(`priceDisplay_${id}`);
  const editorWrap = document.getElementById(`priceEditor_${id}`);
  const input = document.getElementById(`priceInput_${id}`);

  if (editorWrap.style.display === 'none') {
    displayWrap.style.display = 'none';
    editorWrap.style.display = 'flex';
    input.focus();
    input.select();
  } else {
    displayWrap.style.display = 'flex';
    editorWrap.style.display = 'none';
  }
};

// Save Changed Price to Backend & LocalStorage
window.saveProjectPrice = async function(id) {
  const input = document.getElementById(`priceInput_${id}`);
  const newPrice = input.value.trim();

  if (!newPrice) {
    showToast('Please enter a valid price / rate.', 'fa-exclamation-circle');
    return;
  }

  const saveBtn = document.querySelector(`#priceEditor_${id} .btn-save-price`);
  const origHtml = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  saveBtn.disabled = true;

  try {
    const res = await API.updateProjectPrice(id, newPrice, adminPin);
    showToast(`Price updated to "${newPrice}" successfully!`, 'fa-check-circle');

    document.getElementById(`priceBadge_${id}`).textContent = newPrice;
    togglePriceEditor(id);

    if (window.loadProjects) await window.loadProjects();
  } catch (err) {
    showToast(err.message || 'Failed to update price', 'fa-exclamation-triangle');
  } finally {
    saveBtn.innerHTML = origHtml;
    saveBtn.disabled = false;
  }
};

window.handleDeleteProject = async function(id) {
  if (!confirm('Are you sure you want to delete this work photo from your public portfolio?')) return;

  try {
    await API.deleteProject(id, adminPin);
    showToast('Work photo deleted', 'fa-trash');
    loadAdminWorks();
    if (window.loadProjects) window.loadProjects();
    if (window.loadCategories) window.loadCategories();
  } catch (err) {
    showToast(err.message || 'Failed to delete', 'fa-exclamation-triangle');
  }
};

// Load Inquiries
async function loadAdminInquiries() {
  const container = document.getElementById('adminInquiriesList');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading customer inquiries...</td></tr>';

  try {
    const inqs = await API.getInquiries(adminPin);
    if (inqs.length === 0) {
      container.innerHTML = '<tr><td colspan="6" style="text-align:center;">No inquiries received yet.</td></tr>';
      return;
    }

    container.innerHTML = inqs.map(i => {
      const cleanPhone = (i.phone || '').replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Hello ' + i.name + ', Sri Naga Vaishnavi Interiors workshop is following up on your inquiry.')}`;
      return `
        <tr>
          <td><span class="inquiry-status-badge status-${(i.status || 'new').toLowerCase()}">${escapeHtml(i.status || 'New')}</span></td>
          <td><strong>${escapeHtml(i.name)}</strong><br><small style="color:var(--text-muted);">${escapeHtml(i.address || '-')}</small></td>
          <td>
            <a href="tel:${escapeHtml(i.phone)}" style="color:var(--primary); font-weight:600;"><i class="fas fa-phone-alt"></i> ${escapeHtml(i.phone)}</a>
            <br>
            <a href="${waLink}" target="_blank" style="color:#25D366; font-size:0.8rem;"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>
          </td>
          <td><span class="service-pill">${escapeHtml(i.service || 'General')}</span></td>
          <td>${escapeHtml(i.message || '-')}</td>
          <td>
            <select class="admin-status-select" onchange="handleInquiryStatus(${i.id}, this.value)">
              <option value="New" ${i.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${i.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Measurement Scheduled" ${i.status === 'Measurement Scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="Completed" ${i.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Closed" ${i.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
            <button class="admin-icon-btn btn-delete-inq" onclick="handleDeleteInquiry(${i.id})" title="Delete lead">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Error: ${err.message}</td></tr>`;
  }
}

window.handleInquiryStatus = async function(id, status) {
  try {
    await API.updateInquiryStatus(id, status, adminPin);
    showToast(`Lead status updated to ${status}`, 'fa-check');
  } catch (err) {
    showToast(err.message || 'Status update failed', 'fa-exclamation-triangle');
  }
};

window.handleDeleteInquiry = async function(id) {
  if (!confirm('Are you sure you want to delete this lead record?')) return;
  try {
    await API.deleteInquiry(id, adminPin);
    showToast('Lead deleted', 'fa-trash');
    loadAdminInquiries();
  } catch (err) {
    showToast(err.message || 'Delete failed', 'fa-exclamation-triangle');
  }
};

// Workshop Settings Form
function initSettingsForm() {
  const form = document.getElementById('workshopSettingsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const orig = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Settings...';
    submitBtn.disabled = true;

    const data = {
      business_name: document.getElementById('settingBusinessName').value.trim(),
      owner_name: document.getElementById('settingOwnerName').value.trim(),
      phone_primary: document.getElementById('settingPhonePrimary').value.trim(),
      phone_secondary: document.getElementById('settingPhoneSecondary').value.trim(),
      whatsapp_number: document.getElementById('settingWhatsapp').value.trim(),
      email: document.getElementById('settingEmail').value.trim(),
      address: document.getElementById('settingAddress').value.trim(),
      working_hours: document.getElementById('settingWorkingHours').value.trim()
    };

    const newPin = document.getElementById('settingNewPin').value.trim();
    if (newPin) data.admin_pin = newPin;

    try {
      await API.updateSettings(data, adminPin);
      if (newPin) {
        adminPin = newPin;
        sessionStorage.setItem('snvi_admin_pin', newPin);
      }
      showToast('Workshop settings updated successfully!', 'fa-check-double');
      if (window.loadSettings) await window.loadSettings();
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'fa-exclamation-triangle');
    } finally {
      submitBtn.innerHTML = orig;
      submitBtn.disabled = false;
    }
  });
}

async function loadAdminSettingsForm() {
  try {
    const s = await API.getSettings();
    document.getElementById('settingBusinessName').value = s.business_name || '';
    document.getElementById('settingOwnerName').value = s.owner_name || '';
    document.getElementById('settingPhonePrimary').value = s.phone_primary || '';
    document.getElementById('settingPhoneSecondary').value = s.phone_secondary || '';
    document.getElementById('settingWhatsapp').value = s.whatsapp_number || '';
    document.getElementById('settingEmail').value = s.email || '';
    document.getElementById('settingAddress').value = s.address || '';
    document.getElementById('settingWorkingHours').value = s.working_hours || '';
    document.getElementById('settingNewPin').value = '';
  } catch (err) {
    console.warn('Could not populate settings form', err);
  }
}
