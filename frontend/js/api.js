/**
 * Sri Naga Vaishnavi Interiors - REST API Client
 */

const API_BASE = '';

const API = {
  // Fetch all projects with optional filters
  async getProjects(category = 'all', search = '') {
    let url = `${API_BASE}/api/projects?category=${encodeURIComponent(category)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  },

  // Fetch single project details
  async getProject(id) {
    const res = await fetch(`${API_BASE}/api/projects/${id}`);
    if (!res.ok) throw new Error('Project not found');
    return await res.json();
  },

  // Fetch categories with counts
  async getCategories() {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  },

  // Submit customer inquiry
  async submitInquiry(data) {
    const res = await fetch(`${API_BASE}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to submit inquiry');
    }
    return await res.json();
  },

  // Verify Admin PIN
  async verifyAdminPin(pin) {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    if (!res.ok) throw new Error('Invalid PIN. Access denied.');
    return await res.json();
  },

  // Owner upload new work project (Multipart FormData with image)
  async uploadProject(formData, adminPin) {
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: {
        'X-Admin-PIN': adminPin
      },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to upload project');
    }
    return await res.json();
  },

  // Owner delete project
  async deleteProject(id, adminPin) {
    const res = await fetch(`${API_BASE}/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-PIN': adminPin
      }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to delete project');
    }
    return await res.json();
  },

  // Admin get inquiries
  async getInquiries(adminPin) {
    const res = await fetch(`${API_BASE}/api/inquiries`, {
      headers: {
        'X-Admin-PIN': adminPin
      }
    });
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return await res.json();
  },

  // Admin update inquiry status
  async updateInquiryStatus(id, status, adminPin) {
    const res = await fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-PIN': adminPin
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update inquiry status');
    return await res.json();
  },

  // Admin delete inquiry
  async deleteInquiry(id, adminPin) {
    const res = await fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-PIN': adminPin
      }
    });
    if (!res.ok) throw new Error('Failed to delete inquiry');
    return await res.json();
  },

  // Fetch workshop settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
  },

  // Update workshop settings
  async updateSettings(data, adminPin) {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-PIN': adminPin
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
  }
};

window.API = API;
