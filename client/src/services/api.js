const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('token');
  }

  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.getToken() && { 'Authorization': `Bearer ${this.getToken()}` }),
        ...options.headers
      },
      ...options
    };

    // Add body if it's an object
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async register(email, password, full_name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, full_name }
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: profileData
    });
  }

  async logout() {
    this.setToken(null);
  }

  // Product methods
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/products?${query}` : '/products';
    return await this.request(endpoint);
  }

  async getProductBySlug(slug) {
    return await this.request(`/products/${slug}`);
  }

  async getFeaturedProducts() {
    return await this.request('/products/featured');
  }

  // Admin product methods
  async getAdminProducts() {
    return await this.request('/products/admin/all');
  }

  async createProduct(productData) {
    return await this.request('/products/admin', {
      method: 'POST',
      body: productData
    });
  }

  async updateProduct(id, productData) {
    return await this.request(`/products/admin/${id}`, {
      method: 'PUT',
      body: productData
    });
  }

  async deleteProduct(id) {
    return await this.request(`/products/admin/${id}`, {
      method: 'DELETE'
    });
  }

  // Category methods
  async getCategories() {
    return await this.request('/categories');
  }

  async getCategoryBySlug(slug) {
    return await this.request(`/categories/${slug}`);
  }

  // Admin category methods
  async getAdminCategories() {
    return await this.request('/categories/admin/all');
  }

  async createCategory(categoryData) {
    return await this.request('/categories/admin', {
      method: 'POST',
      body: categoryData
    });
  }

  async updateCategory(id, categoryData) {
    return await this.request(`/categories/admin/${id}`, {
      method: 'PUT',
      body: categoryData
    });
  }

  async deleteCategory(id) {
    return await this.request(`/categories/admin/${id}`, {
      method: 'DELETE'
    });
  }

  // Order methods
  async createOrder(orderData) {
    return await this.request('/orders', {
      method: 'POST',
      body: orderData
    });
  }

  async getUserOrders() {
    return await this.request('/orders/my-orders');
  }

  // Admin order methods
  async getAdminOrders() {
    return await this.request('/orders/admin/all');
  }

  async updateOrderStatus(id, statusData) {
    return await this.request(`/orders/admin/${id}/status`, {
      method: 'PUT',
      body: statusData
    });
  }

  async deleteOrder(id) {
    return await this.request(`/orders/admin/${id}`, {
      method: 'DELETE'
    });
  }

  // Profile methods
  async getMyProfile() {
    return await this.request('/profiles/me');
  }

  // Admin profile methods
  async getAdminProfiles() {
    return await this.request('/profiles/admin/all');
  }

  async updateAdminProfile(id, profileData) {
    return await this.request(`/profiles/admin/${id}`, {
      method: 'PUT',
      body: profileData
    });
  }

  async deleteAdminProfile(id) {
    return await this.request(`/profiles/admin/${id}`, {
      method: 'DELETE'
    });
  }
}

// Create and export singleton instance
const apiClient = new APIClient();
export default apiClient;