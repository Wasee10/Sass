/**
 * Keyword Research Service
 * Orchestrates multi-query suggestion collection with bounded concurrency,
 * deduplication, and intent-modifier variations up to 100 unique keywords.
 */

import { fetchGoogleSuggestions } from './keyword.provider';

// Alphabet variations
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Intent & Question modifier templates
const INTENT_SUFFIXES = [
  'for',
  'vs',
  'with',
  'without',
  'online',
  'near me',
  'review',
  'price',
  'guide',
  'tips',
  'ideas',
  'best',
];

const INTENT_PREFIXES = [
  'best',
  'how to',
  'what is',
  'why',
  'where to buy',
  'can',
  'top',
];

/**
 * Generate a controlled list of search query variations
 * @param {string} seedTopic - Clean base topic
 * @returns {string[]} Ordered list of search queries
 */
function generateQueryVariations(seedTopic) {
  const cleanSeed = seedTopic.trim();
  const variations = [];

  // 1. Base query first
  variations.push(cleanSeed);

  // 2. Alphabet letter suffixes (topic + a, topic + b...)
  for (const letter of ALPHABET) {
    variations.push(`${cleanSeed} ${letter}`);
  }

  // 3. Intent & Preposition modifiers (topic for, topic vs...)
  for (const suffix of INTENT_SUFFIXES) {
    variations.push(`${cleanSeed} ${suffix}`);
  }

  // 4. Question & Comparison prefixes (best topic, how to topic...)
  for (const prefix of INTENT_PREFIXES) {
    variations.push(`${prefix} ${cleanSeed}`);
  }

  return variations;
}

/**
 * Sleep helper for rate-limit spacing
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Collect up to maxLimit unique keywords for a given topic and platform
 * @param {Object} params
 * @param {string} params.topic - User entered seed topic
 * @param {string} [params.platform='google'] - 'google' | 'youtube' | 'facebook'
 * @param {string} [params.language='en'] - Language code (hl)
 * @param {string} [params.country='us'] - Country code (gl)
 * @param {number} [params.maxLimit=100] - Maximum unique keywords to collect
 * @returns {Promise<Object>} Results payload
 */
export async function collectKeywordSuggestions({
  topic,
  platform = 'google',
  language = 'en',
  country = 'us',
  maxLimit = 100,
}) {
  if (!topic || !topic.trim()) {
    throw new Error('Please enter a valid topic or seed keyword.');
  }

  const cleanTopic = topic.trim();
  const normalizedPlatform = (platform || 'google').toLowerCase();
  const hl = (language || 'en').toLowerCase();
  const gl = (country || 'us').toLowerCase();

  // Handle Google Search & YouTube Autocomplete
  const ds = normalizedPlatform === 'youtube' ? 'yt' : null;

  const queries = generateQueryVariations(cleanTopic);
  const seenNormalized = new Set();
  const uniqueKeywords = [];

  const addUniqueSuggestions = (list) => {
    if (!Array.isArray(list)) return false;
    for (const item of list) {
      if (typeof item !== 'string') continue;
      const cleanItem = item.trim();
      const normalized = cleanItem.toLowerCase().replace(/\s+/g, ' ');

      if (normalized && !seenNormalized.has(normalized)) {
        seenNormalized.add(normalized);
        uniqueKeywords.push(cleanItem);

        if (uniqueKeywords.length >= maxLimit) {
          return true; // Reached limit!
        }
      }
    }
    return false;
  };

  // Run in small bounded batches of 3-4 parallel requests
  const BATCH_SIZE = 3;
  const DELAY_BETWEEN_BATCHES_MS = 60;

  for (let i = 0; i < queries.length; i += BATCH_SIZE) {
    if (uniqueKeywords.length >= maxLimit) break;

    const currentBatch = queries.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      currentBatch.map((query) =>
        fetchGoogleSuggestions({
          query,
          hl,
          gl,
          ds,
          timeoutMs: 4500,
        })
      )
    );

    for (const suggestionList of batchResults) {
      const reachedLimit = addUniqueSuggestions(suggestionList);
      if (reachedLimit) break;
    }

    if (uniqueKeywords.length >= maxLimit) break;

    // Small courteous pause between batches
    if (i + BATCH_SIZE < queries.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return {
    success: true,
    platform: normalizedPlatform,
    topic: cleanTopic,
    language: hl,
    country: gl,
    total: uniqueKeywords.length,
    keywords: uniqueKeywords.slice(0, maxLimit),
  };
}
