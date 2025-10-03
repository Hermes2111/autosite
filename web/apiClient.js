const detectApiBase = () => {
  const saved = localStorage.getItem('autosite.apiBase');
  if (saved) return saved;

  // Default to localhost:3000 for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  const { protocol, hostname } = window.location;
  const defaultPort = protocol === 'https:' ? 443 : 80;
  const backendPort = protocol === 'https:' ? defaultPort : 3000;
  const portSegment = backendPort === defaultPort ? '' : `:${backendPort}`;
  return `${protocol}//${hostname}${portSegment}/api`;
};

let API_BASE = detectApiBase();

export class ApiClient {
  constructor() {
    this.token = localStorage.getItem('autosite.token') ?? null;
  }

  get baseUrl() {
    return API_BASE;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('autosite.token', token);
    } else {
      localStorage.removeItem('autosite.token');
    }
  }

  setBaseUrl(url) {
    API_BASE = url;
    localStorage.setItem('autosite.apiBase', url);
  }

  get headers() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = isFormData
      ? (this.token ? { Authorization: `Bearer ${this.token}` } : {})
      : { ...this.headers, ...(options.headers ?? {}) };

    const url = `${API_BASE}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.setToken(null);
      }

      if (!response.ok) {
        const text = await response.text();
        const errorMsg = text || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    } catch (error) {
      // Re-throw error for caller to handle
      throw error;
    }
  }

  get(path) {
    return this.request(path);
  }

  post(path, body) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  postForm(path, formData, method = 'POST') {
    return this.request(path, {
      method,
      body: formData,
    });
  }

  patch(path, body) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
