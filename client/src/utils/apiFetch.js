// Global API fetch utility with refresh token support
export async function apiFetch(url, options = {}) {
  const opts = {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };
  const res = await fetch(url, opts);
  if (res.status === 401) {
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }
  return res;
}
