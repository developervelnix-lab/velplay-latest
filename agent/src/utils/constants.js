/**
 * MAIN BACKEND API & DOMAIN CONFIGURATION (LOCAL / LIVE API)
 */
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('agent_api_url');
  } catch (e) {}
}

const IS_LOCAL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '');

const DEFAULT_URL = IS_LOCAL ? "https://api.velplay365.com/" : "https://api.velplay365.com/";
const DEFAULT_API_URL = IS_LOCAL ? "https://api.velplay365.com/router/" : "https://api.velplay365.com/router/";

export const URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || DEFAULT_URL;
export const API_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || DEFAULT_API_URL;
export const API_BASE_URL = API_URL.replace(/\/router\/$/, '').replace(/\/$/, '');

export const getAuthToken = () => {
  return localStorage.getItem('agent_token') || localStorage.getItem('token') || '';
};

export const apiUrl = (endpoint = '') => {
  if (!endpoint) return API_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const [routePath, query] = cleanEndpoint.split('?');
  const normalizedRoute = routePath.replace(/\/index\.php$/, '').replace(/\.php$/, '');
  let url = API_URL + '?Route=' + encodeURIComponent(normalizedRoute);

  const token = getAuthToken();
  if (token && (!query || !query.includes('token='))) {
    url += '&token=' + encodeURIComponent(token);
  }

  if (query) {
    url += '&' + query;
  }
  return url;
};

export const getAuthHeaders = (extraHeaders = {}, endpoint = '') => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
    headers['AuthToken'] = token;
  }
  if (endpoint) {
    const clean = (endpoint.startsWith('/') ? endpoint : '/' + endpoint).split('?')[0].replace(/\/index\.php$/, '').replace(/\.php$/, '');
    headers['Route'] = clean;
  }
  return headers;
};
