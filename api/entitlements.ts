import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json } from './_lib/http';
import { requireUid } from './_lib/auth';
import { getAdminDb } from './_lib/firebaseAdmin';
import { getEntitlements } from './_lib/firestoreUser';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
    const uid = await requireUid(req);
    const db = getAdminDb();
    const entitlements = await getEntitlements(db as any, uid);
    return json(res, 200, entitlements);
  } catch (e: any) {
    return json(res, 401, { error: e?.message || 'Unauthorized' });
  }
}

