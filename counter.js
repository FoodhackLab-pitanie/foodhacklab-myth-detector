const counterBase = 'https://abacus.jasoncameron.dev';
const counterNamespace = 'foodhacklab-myth-detector';
let writes = Promise.resolve();

async function counterRequest(action, key) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(counterBase + '/' + action + '/' + counterNamespace + '/' + key, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000)
    });
    if (action === 'get' && response.status === 404) return 0;
    if (response.status === 429 && attempt < 3) {
      const retry = Number(response.headers.get('Retry-After')) || 2 ** attempt;
      await new Promise(resolve => setTimeout(resolve, retry * 1000));
      continue;
    }
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const { value } = await response.json();
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('Некорректный ответ счётчика');
    return value;
  }
}

function countGameEvent(key) {
  writes = writes.then(() => counterRequest('hit', key)).catch(error => console.warn('FoodHackLab:', error));
  return writes;
}
