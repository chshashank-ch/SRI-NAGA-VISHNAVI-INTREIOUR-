/**
 * Sri Naga Vaishnavi Interiors - Owner Admin Studio
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
  const loginView = document.getElementById('adminLoginView');
  const dashView = document.getElementById('adminDashboardView');

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
        const res = await API.verifyAdminPin(pin);
        adminPin = pin;
        sessionStorage.setItem('snvi_admin_pin', pin);
        errorMsg.style.display = 'none';
        showAdminDashboard();
        showToast('Welcome, Workshop Owner!', 'fa-user-shield');
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
    // Already authenticated in session
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

  // Load default tab
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

  // Drag and drop events
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

      // Refresh public website gallery
      if (window.loadProjects) window.loadProjects();
      if (window.loadCategories) window.loadCategories();

      // Switch to manage tab
      document.querySelector('[data-tab="tabManageWorks"]').click();
    } catch (err) {
      showToast(err.message || 'Upload failed', 'fa-exclamation-triangle');
    } finally {
      submitBtn.innerHTML = origText;
      submitBtn.disabled = false;
    }
  });
}

// Load Works in Admin Management Table
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
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(p.specifications || '')}</div>
        </td>
        <td><span class="portfolio-category-badge" style="position:static;">${formatCategoryName(p.category)}</span></td>
        <td>${escapeHtml(p.price_range || '-')}</td>
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

// Load Inquiries / Customer Leads in Admin Table
async function loadAdminInquiries() {
  const container = document.getElementById('adminInquiriesList');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading inquiries...</td></tr>';

  try {
    const inquiries = await API.getInquiries(adminPin);
    if (inquiries.length === 0) {
      container.innerHTML = '<tr><td colspan="6" style="text-align:center;">No customer inquiries received yet.</td></tr>';
      return;
    }

    container.innerHTML = inquiries.map(inq => {
      const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
      const waReplyText = encodeURIComponent(`Hello ${inq.name}, thank you for contacting Sri Naga Vaishnavi Interiors regarding ${inq.service || 'our works'}. I am the workshop owner. How can I assist you?`);

      return `
        <tr>
          <td>
            <strong>${escapeHtml(inq.name)}</strong>
            <div style="font-size:0.78rem; color:var(--text-muted);">${inq.created_at || ''}</div>
          </td>
          <td>
            <a href="tel:${cleanPhone}" style="color:var(--accent-gold); font-weight:600;"><i class="fas fa-phone-alt"></i> ${escapeHtml(inq.phone)}</a>
          </td>
          <td><strong>${escapeHtml(inq.service || '-')}</strong></td>
          <td>
            <div style="max-width:240px; font-size:0.85rem;">${escapeHtml(inq.message || '-')}</div>
            ${inq.address ? `<div style="font-size:0.75rem; color:var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(inq.address)}</div>` : ''}
          </td>
          <td>
            <select class="form-select" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onchange="handleStatusChange(${inq.id}, this.value)">
              <option value="New" ${inq.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${inq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Quoted" ${inq.status === 'Quoted' ? 'selected' : ''}>Quoted</option>
              <option value="Completed" ${inq.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <a href="https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${waReplyText}" target="_blank" class="btn-sm-whatsapp" title="WhatsApp Customer">
                <i class="fab fa-whatsapp"></i> Chat
              </a>
              <button class="admin-action-btn btn-delete" onclick="handleDeleteInquiry(${inq.id})" title="Delete lead">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Error: ${err.message}</td></tr>`;
  }
}

window.handleStatusChange = async function(id, status) {
  try {
    await API.updateInquiryStatus(id, status, adminPin);
    showToast(`Inquiry marked as ${status}`, 'fa-check');
  } catch (err) {
    showToast(err.message || 'Could not update status', 'fa-exclamation-triangle');
  }
};

window.handleDeleteInquiry = async function(id) {
  if (!confirm('Are you sure you want to delete this customer inquiry?')) return;
  try {
    await API.deleteInquiry(id, adminPin);
    showToast('Inquiry removed', 'fa-trash');
    loadAdminInquiries();
  } catch (err) {
    showToast(err.message || 'Could not delete inquiry', 'fa-exclamation-triangle');
  }
};

// Workshop Settings Tab
async function loadAdminSettingsForm() {
  try {
    const s = await API.getSettings();
    document.getElementById('setBusinessName').value = s.business_name || '';
    document.getElementById('setOwnerName').value = s.owner_name || '';
    document.getElementById('setPhonePrimary').value = s.phone_primary || '';
    document.getElementById('setPhoneSecondary').value = s.phone_secondary || '';
    document.getElementById('setWhatsapp').value = s.whatsapp_number || '';
    document.getElementById('setAddress').value = s.address || '';
    document.getElementById('setWorkingHours').value = s.working_hours || '';
  } catch (err) {
    console.error('Error loading settings for admin:', err);
  }
}

function initSettingsForm() {
  const form = document.getElementById('adminSettingsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    const data = {
      business_name: document.getElementById('setBusinessName').value.trim(),
      owner_name: document.getElementById('setOwnerName').value.trim(),
      phone_primary: document.getElementById('setPhonePrimary').value.trim(),
      phone_secondary: document.getElementById('setPhoneSecondary').value.trim(),
      whatsapp_number: document.getElementById('setWhatsapp').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      working_hours: document.getElementById('setWorkingHours').value.trim()
    };

    const newPin = document.getElementById('setNewPin').value.trim();
    if (newPin) {
      data.admin_pin = newPin;
    }

    try {
      await API.updateSettings(data, adminPin);
      if (newPin) {
        adminPin = newPin;
        sessionStorage.setItem('snvi_admin_pin', newPin);
        document.getElementById('setNewPin').value = '';
      }
      showToast('Workshop profile settings updated!', 'fa-check-double');
      if (window.loadSettings) window.loadSettings();
    } catch (err) {
      showToast(err.message || 'Error updating settings', 'fa-exclamation-triangle');
    } finally {
      submitBtn.innerHTML = origText;
      submitBtn.disabled = false;
    }
  });
}
