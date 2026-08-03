const WINDOW_MS = 60_000;
const REQUEST_LIMIT = 12;
const MAX_CLIENT_BUCKETS = 512;

type ClientBucket = {
  count: number;
  windowStartedAt: number;
  lastSeenAt: number;
};

const clientBuckets = new Map<string, ClientBucket>();

function pruneBuckets(now: number) {
  for (const [clientId, bucket] of clientBuckets) {
    if (now - bucket.lastSeenAt >= WINDOW_MS) {
      clientBuckets.delete(clientId);
    }
  }

  while (clientBuckets.size >= MAX_CLIENT_BUCKETS) {
    const oldestClientId = clientBuckets.keys().next().value as string | undefined;
    if (!oldestClientId) break;
    clientBuckets.delete(oldestClientId);
  }
}

export function getClientId(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return (forwardedFor || realIp || "anonymous").slice(0, 128);
}

export function isRateLimited(clientId: string, now = Date.now()) {
  pruneBuckets(now);

  const existing = clientBuckets.get(clientId);
  const bucket = !existing || now - existing.windowStartedAt >= WINDOW_MS
    ? { count: 1, windowStartedAt: now, lastSeenAt: now }
    : { ...existing, count: existing.count + 1, lastSeenAt: now };

  // Refresh insertion order so capacity eviction removes the least-recent client.
  clientBuckets.delete(clientId);
  clientBuckets.set(clientId, bucket);

  return bucket.count > REQUEST_LIMIT;
}

export const RATE_LIMIT_RETRY_SECONDS = Math.ceil(WINDOW_MS / 1_000);
