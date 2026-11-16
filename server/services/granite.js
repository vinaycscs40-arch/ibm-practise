const axios = require('axios');

// Model cascade (confirmed working on free-tier keys, 2026-11):
//   gemini-3.8-flash     — primary, best quality
//   gemini-3.5-flash     — demand-spike fallback (503), same free-tier bucket
//   gemini-3.5-flash-lite — quota fallback (429), lighter model, separate quota
//   gemini-flash-lite-latest — last-resort alias that tracks current lite model
const PRIMARY_MODEL  = 'gemini-3.8-flash';
const FALLBACK_503   = 'gemini-3.5-flash';
const FALLBACK_429   = 'gemini-3.5-flash-lite';
const LAST_RESORT    = 'gemini-flash-lite-latest';

function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

/**
 * Calls the Gemini REST API with up to 2 retries on transient errors (503 / 429).
 * Falls back to FALLBACK_MODEL after the first 503 from the primary model.
 *
 * @param {string} prompt
 * @param {number} maxTokens  – defaults to 2048 for complete answers
 * @returns {Promise<string>}
 */
async function generateText(prompt, maxTokens = 2048) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment.');
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  };

  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
  };

  // Attempt order:
  //   1. Primary (immediate)
  //   2. Primary again after 1 s  — catches brief 503 spikes
  //   3. FALLBACK_503             — avoids demand spikes
  //   4. FALLBACK_429             — lighter model, separate daily quota
  //   5. LAST_RESORT              — always-on alias
  const attempts = [
    { model: PRIMARY_MODEL, delay: 0 },
    { model: PRIMARY_MODEL, delay: 1000 },
    { model: FALLBACK_503,  delay: 0 },
    { model: FALLBACK_429,  delay: 0 },
    { model: LAST_RESORT,   delay: 0 },
  ];

  let lastErr;
  let quotaExhausted = false;

  for (const { model, delay } of attempts) {
    if (delay > 0) await sleep(delay);

    // Skip models that share the same quota as an already-exhausted model
    // (gemini-flash-latest resolves to gemini-3.8-flash on most keys)
    if (quotaExhausted && model === PRIMARY_MODEL) continue;

    try {
      const response = await axios.post(geminiUrl(model), payload, {
        headers,
        timeout: 60000, // 60 s hard timeout — prevents infinite hangs
      });

      const candidate = response.data.candidates && response.data.candidates[0];

      // Guard: Gemini may return a candidate with no content when it hits safety filters
      if (!candidate || !candidate.content || !candidate.content.parts) {
        const reason = candidate && candidate.finishReason;
        throw new Error(
          reason
            ? `Gemini did not return content (finishReason: ${reason}).`
            : 'Gemini returned an empty response.'
        );
      }

      return candidate.content.parts
        .map((part) => part.text || '')
        .join('')
        .trim();

    } catch (err) {
      const status = err.response && err.response.status;
      const isTransient = status === 503 || status === 429;

      const apiMsg =
        err.response &&
        err.response.data &&
        err.response.data.error &&
        err.response.data.error.message;

      console.error(
        `Gemini [${model}] error — status ${status || 'network'}: ${apiMsg || err.message}`
      );

      lastErr = err;

      // Track quota exhaustion so we skip models sharing the same quota bucket
      if (status === 429) quotaExhausted = true;

      // Only retry on transient errors; for 400/401/403/404 fail immediately
      if (!isTransient) throw enrichError(err);
    }
  }

  // All attempts exhausted — throw with a user-friendly message
  throw enrichError(lastErr);
}

/** Attaches a human-readable `.userMessage` to the error so routes can surface it. */
function enrichError(err) {
  const status = err.response && err.response.status;
  const apiMsg =
    err.response &&
    err.response.data &&
    err.response.data.error &&
    err.response.data.error.message;

  if (status === 429) {
    // Check if it is a daily quota exhaustion vs a per-minute rate limit
    const isQuotaExhausted = apiMsg && apiMsg.includes('per day limit exceeded');
    err.userMessage = isQuotaExhausted
      ? 'Daily AI request limit reached. The quota resets in 24 hours. Please try again tomorrow, or upgrade your Gemini plan.'
      : 'Too many requests. Please wait a moment and try again.';
  } else if (status === 503) {
    err.userMessage =
      'The AI service is temporarily overloaded. Please wait a moment and try again.';
  } else if (status === 401 || status === 403) {
    err.userMessage = 'Gemini API authentication failed. Check your GEMINI_API_KEY.';
  } else if (status === 404) {
    err.userMessage = apiMsg || 'Gemini model not found. Contact support.';
  } else if (apiMsg) {
    err.userMessage = `Gemini error: ${apiMsg}`;
  } else {
    err.userMessage = 'An unexpected error occurred while contacting the AI service.';
  }

  return err;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { generateText };
