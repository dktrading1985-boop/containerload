export type AppConfig = { API_URL: string };

export async function loadRuntimeConfig(): Promise<AppConfig> {
  try {
    const res = await fetch('/config.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('config fetch failed');
    const cfg = await res.json();
    // attach to window for easy access
    (window as any).__APP_CONFIG__ = cfg;
    return cfg;
  } catch (err) {
    console.warn('Failed to load runtime config; falling back to defaults', err);
    const fallback = { API_URL: 'https://api.containerload.org' };
    (window as any).__APP_CONFIG__ = fallback;
    return fallback;
  }
}
