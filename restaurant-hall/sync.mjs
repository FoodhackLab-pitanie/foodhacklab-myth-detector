const cachePrefix = 'hall-training:pending:';
const packetLimit = 100;
export const randomHex = bytes => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), byte => byte.toString(16).padStart(2, '0')).join('');

export function enqueue(attempt, move) {
  let packet = attempt.packets.at(-1);
  if (!packet || packet.sealed || packet.moves.length >= packetLimit) {
    packet = { receipt: randomHex(16), revision: attempt.revision, moves: [] };
    attempt.packets.push(packet);
  }
  if (move) packet.moves.push(structuredClone(move));
}

export function packetData(attempt, { receipt, revision, moves }) {
  const { id, key, participant } = attempt;
  return { id, key, participant, receipt, revision, moves };
}

export function storePending(attempt) {
  try {
    const cacheKey = cachePrefix + attempt.id;
    if (attempt.packets.length) localStorage.setItem(cacheKey, JSON.stringify(attempt));
    else localStorage.removeItem(cacheKey);
    return true;
  } catch { return false; }
}

export function loadPending() {
  const saved = new Map();
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const storageKey = localStorage.key(index);
      if (!storageKey?.startsWith(cachePrefix)) continue;
      const attempt = JSON.parse(localStorage.getItem(storageKey));
      if (attempt?.id && attempt.key && attempt.participant && attempt.run && attempt.packets?.length) {
        attempt.storedLocally = true;
        saved.set(attempt.id, attempt);
      }
    }
  } catch { /* Unreadable storage cannot block a new attempt. */ }
  return saved;
}

export async function sendPacket(endpoints, packet) {
  for (const base of endpoints) {
    try {
      const response = await fetch(base + '/api/attempts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(packet),
        signal: AbortSignal.timeout(5500),
      });
      const result = await response.json();
      if (response.ok && result.ackRevision === packet.revision + packet.moves.length) return { sent: true };
      if ([400, 404, 409, 413].includes(response.status) && typeof result.error === 'string') return { rejected: true };
    } catch { /* Try the other ingress of the same results service. */ }
  }
  return {};
}
