// Global API fetch utility with refresh token support
export async function apiFetch(url, options = {}, retry = true) {
  const opts = {
    ...options,
    credentials: 'include', // send cookies (for httpOnly tokens)
    headers: {
      ...(options.headers || {}),
    },
  };
  let res = await fetch(url, opts);
  if (res.status === 401 && retry) {
    // Try to refresh token
    const refreshRes = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`,
      { method: 'POST', credentials: 'include' }
    );
    if (refreshRes.ok) {
      // Retry original request
      res = await fetch(url, opts);
    } else {
      // Redirect to login
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }
  }
  return res;
}
