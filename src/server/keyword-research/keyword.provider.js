/**
 * Keyword Research Provider
 * Integrates with Google Autocomplete / Suggest API using full specification:
 * https://suggestqueries.google.com/complete/search
 * 
 * Supports:
 * - Google Search (client=chrome, hl, gl, q)
 * - YouTube Search (client=chrome, ds=yt, hl, gl, q)
 * - Facebook (verified provider check / unavailable state)
 */

const GOOGLE_SUGGEST_URL = 'https://suggestqueries.google.com/complete/search';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Fetch genuine suggestions from Google Autocomplete endpoint
 * @param {Object} options
 * @param {string} options.query - Query string
 * @param {string} [options.hl='en'] - Language code
 * @param {string} [options.gl='us'] - Country ISO 3166-1 alpha-2 code
 * @param {string|null} [options.ds=null] - Data source (e.g. 'yt' for YouTube)
 * @param {number} [options.timeoutMs=5000] - Request timeout in ms
 * @returns {Promise<string[]>} Array of suggestion strings
 */
export async function fetchGoogleSuggestions({
  query,
  hl = 'en',
  gl = 'us',
  ds = null,
  timeoutMs = 5000,
}) {
  if (!query || !query.trim()) return [];

  const params = new URLSearchParams({
    client: 'chrome',
    hl: hl.toLowerCase(),
    gl: gl.toLowerCase(),
    q: query.trim(),
  });

  if (ds) {
    params.set('ds', ds);
  }

  const url = `${GOOGLE_SUGGEST_URL}?${params.toString()}`;

  // Use AbortController for strict timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'application/json, text/javascript, */*; q=0.01',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`[KeywordProvider] Rate limited (429) on query: "${query}"`);
      }
      return [];
    }

    const json = await response.json();

    // In client=chrome format, response structure is:
    // [query, [suggestionsArray], [descriptions], [metadata], ...]
    if (Array.isArray(json) && Array.isArray(json[1])) {
      return json[1]
        .filter((item) => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
    }

    return [];
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[KeywordProvider] Timeout fetching query: "${query}"`);
    } else {
      console.warn(`[KeywordProvider] Error fetching query "${query}":`, err.message);
    }
    return [];
  }
}

