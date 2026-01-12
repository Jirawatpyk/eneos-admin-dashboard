/**
 * API Client with session handling (AC4)
 * Handles 401 responses by redirecting to login with SessionExpired error
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  skipAuthCheck?: boolean;
}

/**
 * Fetch wrapper that handles authentication errors
 * Redirects to login on 401 responses
 */
export async function fetchWithAuth(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuthCheck = false, ...fetchOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  // Handle 401 Unauthorized - session expired or invalid
  if (!skipAuthCheck && response.status === 401) {
    // Redirect to login with session expired message
    if (typeof window !== 'undefined') {
      window.location.href = '/login?error=SessionExpired';
    }
    throw new SessionExpiredError('Session expired');
  }

  // Handle 403 Forbidden - user authenticated but not authorized
  // Note: 403 is different from 401 - user IS logged in but lacks permission
  // We don't redirect to login, but we do throw a specific error
  if (response.status === 403) {
    throw new ForbiddenError('You do not have permission to access this resource');
  }

  return response;
}

/**
 * Custom error for session expiration
 */
export class SessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

/**
 * Custom error for forbidden access (403)
 */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Helper for GET requests
 */
export async function apiGet<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'GET',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper for POST requests
 */
export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper for PUT requests
 */
export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithAuth(endpoint, {
    method: 'DELETE',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
