import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json, readRawBody } from './_lib/http';
import { requireUid } from './_lib/auth';
import { getAdminDb } from './_lib/firebaseAdmin';
import { fetchRecentUsdtTransfersTo, usdtToBaseUnits } from './_lib/tron';
import { grantCredits } from './_lib/firestoreUser';

const PRICE_USDT = Number(process.env.PRO_PRICE_USDT || 10);
const MONTHLY_CREDITS = Number(process.env.PRO_MONTHLY_CREDITS || 1000);
const PERIOD_DAYS = Number(process.env.PRO_PERIOD_DAYS || 30);

function addDaysMs(ms: number, days: number) {
  return ms + days * 24 * 60 * 60 * 1000;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
    const uid = await requireUid(req);

    const raw = await readRawBody(req);
    const body = raw.length ? JSON.parse(raw.toString('utf8')) : {};
    const txidHint = String(body.txid || '').trim();

    const db = getAdminDb() as any;
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const user = (userSnap.data() || {}) as any;

    const address = String(user.tronDepositAddress || '').trim();
    if (!address) return json(res, 400, { error: 'No deposit address. Call /api/tron-deposit first.' });

    const expected = usdtToBaseUnits(PRICE_USDT);
    const transfers = await fetchRecentUsdtTransfersTo(address, 50);

    const match = transfers.find((t) => {
      if (txidHint && t.transaction_id !== txidHint) return false;
      return String(t.to || '').toLowerCase() === address.toLowerCase() && String(t.value || '') === expected;
    });

    if (!match) {
      await userRef.set({ tronLastCheckedAt: new Date(), updatedAt: new Date() }, { merge: true });
      return json(res, 200, { ok: true, paid: false });
    }

    const txid = match.transaction_id;
    const paymentId = `trc20_${txid}`;
    const payRef = db.collection('payments').doc(paymentId);

    let didProcess = false;

    await db.runTransaction(async (tx: any) => {
      const paySnap = await tx.get(payRef);
      if (paySnap.exists) return;

      didProcess = true;
      const now = Date.now();
      const newPeriodEnd = addDaysMs(now, PERIOD_DAYS);

      tx.set(
        payRef,
        {
          uid,
          chain: 'TRC20',
          token: 'USDT',
          amountUsdt: PRICE_USDT,
          amountBaseUnits: expected,
          toAddress: address,
          fromAddress: match.from,
          txid,
          status: 'confirmed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      tx.set(
        userRef,
        {
          plan: 'pro',
          subscriptionStatus: 'active',
          monthlyCreditsAllowance: MONTHLY_CREDITS,
          currentPeriodEnd: new Date(newPeriodEnd),
          lastGrantedPeriodEnd: new Date(newPeriodEnd),
          tronLastCheckedAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
    });

    // Only grant credits once per tx.
    if (didProcess) {
      await grantCredits(db, uid, MONTHLY_CREDITS, `usdt_trc20_monthly_${PRICE_USDT}`);
    }

    return json(res, 200, { ok: true, paid: true, processed: didProcess, txid });
  } catch (e: any) {
    return json(res, 401, { error: e?.message || 'Unauthorized' });
  }
}
