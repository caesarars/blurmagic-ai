import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json, readRawBody } from './_lib/http';
import { requireUid } from './_lib/auth';
import { getAdminDb } from './_lib/firebaseAdmin';
import { fetchRecentUsdtTransfersTo, usdtToBaseUnits } from './_lib/tron';

const PRICE_USDT = Number(process.env.PRO_PRICE_USDT || 10);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    const uid = await requireUid(req);
    const raw = await readRawBody(req);
    const body = raw.length ? JSON.parse(raw.toString('utf8')) : {};
    const txidHint = String(body.txid || '').trim();

    const db = getAdminDb() as any;
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const user = (snap.data() || {}) as any;

    const address = String(user.tronDepositAddress || '').trim();
    if (!address) return json(res, 400, { error: 'No deposit address. Call /api/tron-deposit first.' });

    const expected = usdtToBaseUnits(PRICE_USDT);
    const transfers = await fetchRecentUsdtTransfersTo(address, 50);

    const match = transfers.find((t) => {
      if (txidHint && t.transaction_id !== txidHint) return false;
      return String(t.to || '').toLowerCase() === address.toLowerCase() && String(t.value || '') === expected;
    });

    await userRef.set({ tronLastCheckedAt: new Date(), updatedAt: new Date() }, { merge: true });

    if (!match) return json(res, 200, { ok: true, paid: false });

    // Frontend should call admin sync via cron/server after this, or you can paste uid into admin sync.
    return json(res, 200, { ok: true, paid: true, txid: match.transaction_id });
  } catch (e: any) {
    return json(res, 401, { error: e?.message || 'Unauthorized' });
  }
}
