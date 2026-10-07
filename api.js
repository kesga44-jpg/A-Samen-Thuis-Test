export async function fetchWithRetry(url, {
  attempts = 2,
  timeout = 7000,
  fetcher = globalThis.fetch,
  ...options
} = {}) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller && setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetcher(url, { ...options, signal: controller?.signal });
      if (!response.ok) {
        const error = new Error(`Verzoek mislukt (${response.status})`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      return response;
    } catch (error) {
      lastError = error;
      const retryable = error.retryable !== false && !(error.name === 'AbortError' && attempt + 1 === attempts);
      if (!retryable || attempt + 1 === attempts) throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw lastError;
}

export async function fetchQuoteFeed(url, options = {}) {
  const response = await fetchWithRetry(url, { cache: 'no-store', ...options });
  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Ongeldige quote-feed');
  const item = xml.querySelector('item');
  if (!item) throw new Error('Geen quote in feed');
  const title = (item.querySelector('title')?.textContent || '').trim();
  const desc = new DOMParser().parseFromString(item.querySelector('description')?.textContent || '', 'text/html').body.textContent.trim();
  const generic = /^(today'?s )?quote/i.test(title);
  const text = generic ? desc : title;
  return text ? { text, author: generic || desc === title ? '' : desc } : null;
}

export async function fetchWeatherForecast(url, options = {}) {
  const response = await fetchWithRetry(url, { timeout: 8000, ...options });
  const data = await response.json();
  if (!data?.current || !Array.isArray(data.daily?.time)
    || !Array.isArray(data.hourly?.time) || !Array.isArray(data.hourly?.temperature_2m)) {
    throw new Error('Onverwacht weerbericht');
  }
  return data;
}
