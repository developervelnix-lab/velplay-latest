/*
  Centralized API fetch helper.
  Ensures Route and AuthToken are ALWAYS sent via:
    1. Query parameters (reliable — never stripped by proxies)
    2. Headers (standard approach, works when CORS allows it)
  This eliminates the "token glitch" where live servers strip custom headers.
*/
import { API_URL } from './constants';

/**
 * Make an API request with guaranteed token delivery.
 * 
 * @param {string} route - The backend route name (e.g. "route-account-info")
 * @param {object} options - Fetch options (method, body, etc.)
 * @param {object} extraParams - Additional query parameters (e.g. { USER_ID: "123" })
 * @returns {Promise<Response>}
 */
export async function apiFetch(route, options = {}, extraParams = {}) {
  const authSecretKey = localStorage.getItem("auth_secret_key") || "guest";
  const userId = localStorage.getItem("account_id") || "guest";

  // Build query string with Route + AuthToken + USER_ID + cache-buster
  const params = new URLSearchParams({
    Route: route,
    AuthToken: authSecretKey,
    USER_ID: userId,
    _t: Date.now().toString(),
    ...extraParams,
  });

  const url = `${API_URL}?${params.toString()}`;
  console.log("🚀 [apiFetch] Calling URL:", url);

  // Merge headers — always include Route + AuthToken in headers too (redundancy)
  const headers = {
    "Content-Type": "application/json",
    Route: route,
    AuthToken: authSecretKey,
    ...(options.headers || {}),
  };

  // For POST requests, ensure USER_ID is in the body if not already present
  if (options.method === "POST") {
    try {
      let bodyObj = options.body ? JSON.parse(options.body) : {};
      if (!bodyObj.USER_ID) {
        bodyObj.USER_ID = userId;
        options.body = JSON.stringify(bodyObj);
      }
    } catch (e) {
      // If body is not JSON, leave it as is
    }
  }

  const fetchOptions = {
    method: options.method || "GET",
    mode: "cors",
    cache: "no-store",
    ...options,
    headers,
  };

  return fetch(url, fetchOptions);
}

/**
 * Shorthand for GET requests.
 */
export async function apiGet(route, extraParams = {}) {
  return apiFetch(route, { method: "GET" }, extraParams);
}

/**
 * Shorthand for POST requests with JSON body.
 */
export async function apiPost(route, body = {}, extraParams = {}) {
  return apiFetch(route, {
    method: "POST",
    body: JSON.stringify(body),
  }, extraParams);
}
