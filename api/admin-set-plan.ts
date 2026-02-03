import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json, readRawBody } from './_lib/http';
import { getAdminDb } from './_lib/firebaseAdmin';

function requireAdmin(req: VercelRequest) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) throw new Error('Missing ADMIN_API_SECRET');
  const provided = (req.headers['x-admin-secret'] as string | undefined) || '';
  if (!provided || provided !== secret) throw new Error('Unauthorized');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    requireAdmin(req);

    const raw = await readRawBody(req);
    const body = raw.length ? JSON.parse(raw.toString('utf8')) : {};

    const uid = String(body.uid || '');
    const plan = String(body.plan || '');
    if (!uid) return json(res, 400, { error: 'Missing uid' });
    if (!['free', 'pro', 'team'].includes(plan)) return json(res, 400, { error: 'Invalid plan' });

    const db = getAdminDb() as any;
    await db.collection('users').doc(uid).set(
      {
        plan,
        subscriptionStatus: 'manual',
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return json(res, 200, { ok: true });
  } catch (e: any) {
    return json(res, 401, { error: e?.message || 'Unauthorized' });
  }
}

