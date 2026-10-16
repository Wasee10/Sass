/**
 * Client Keyword Research Service
 * Communicates with /api/keyword-research endpoint
 */

export async function fetchKeywordResearch({
  topic,
  platform = 'google',
  language = 'en',
  country = 'us',
  maxLimit = 100,
}) {
  const response = await fetch('/api/keyword-research', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      platform,
      language,
      country,
      maxLimit,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok && !data.error) {
    throw new Error(`Failed to fetch keywords (status ${response.status})`);
  }

  return data;
}
