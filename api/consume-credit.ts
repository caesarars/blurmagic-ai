import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json, readRawBody } from './_lib/http';
import { requireUid } from './_lib/auth';
import { getAdminDb } from './_lib/firebaseAdmin';
import { consumeCredits } from './_lib/firestoreUser';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    const uid = await requireUid(req);
    const raw = await readRawBody(req);
    const body = raw.length ? JSON.parse(raw.toString('utf8')) : {};
    const count = Number(body.count ?? 1);
    const reason = String(body.reason || 'process_image');
    const db = getAdminDb();
    const entitlements = await consumeCredits(db as any, uid, count, reason);
    return json(res, 200, entitlements);
  } catch (e: any) {
    if (e?.code === 'insufficient_credits') return json(res, 402, { error: e.message || 'Insufficient credits' });
    return json(res, 400, { error: e?.message || 'Bad request' });
  }
}

