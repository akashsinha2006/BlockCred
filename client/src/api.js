const BASE = (import.meta.env.VITE_API_URL || '') + '/api';
const TOKEN_KEY = 'bc-token';

export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the server. Is the API running on port 5000?', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('bc-unauthorized'));
    throw new ApiError(data.message || 'Request failed', res.status, data.fields);
  }
  return data;
}

export const qrUrl = (id) => `${BASE}/credentials/${encodeURIComponent(id)}/qr`;
