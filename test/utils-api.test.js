import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithRetry } from '../api.js';
import { escapeHtml, todayKey } from '../utils.js';

test('date and HTML helpers handle expected values', () => {
  assert.equal(todayKey(new Date(2024, 0, 2)), '2024-01-02');
  assert.equal(escapeHtml(`<a title='"'>&`), '&lt;a title=&#039;&quot;&#039;&gt;&amp;');
});

test('external request retries a temporary server failure', async () => {
  let requests = 0;
  const response = await fetchWithRetry('https://example.invalid', {
    fetcher: async () => {
      requests += 1;
      return requests === 1 ? { ok: false, status: 503 } : { ok: true, status: 200 };
    }
  });
  assert.equal(response.status, 200);
  assert.equal(requests, 2);
});

test('external request does not retry permanent client failures', async () => {
  let requests = 0;
  await assert.rejects(fetchWithRetry('https://example.invalid', {
    fetcher: async () => {
      requests += 1;
      return { ok: false, status: 404 };
    }
  }), /404/);
  assert.equal(requests, 1);
});
