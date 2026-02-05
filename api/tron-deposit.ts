import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json } from './_lib/http';
import { requireUid } from './_lib/auth';
import { getAdminDb } from './_lib/firebaseAdmin';
import { encryptText } from './_lib/crypto';
import { createTronAccount } from './_lib/tron';

const PRICE_USDT = Number(process.env.PRO_PRICE_USDT || 10);
const MONTHLY_CREDITS = Number(process.env.PRO_MONTHLY_CREDITS || 1000);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
    const uid = await requireUid(req);

    const db = getAdminDb() as any;
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const data = (snap.data() || {}) as any;

    if (data.tronDepositAddress && data.tronDepositPrivEnc) {
      return json(res, 200, {
        ok: true,
        address: data.tronDepositAddress,
        chain: 'TRC20',
        token: 'USDT',
        priceUsdt: PRICE_USDT,
        credits: MONTHLY_CREDITS,
      });
    }

    const { address, privateKey } = await createTronAccount();
    const tronDepositPrivEnc = encryptText(privateKey);

    await userRef.set(
      {
        tronDepositAddress: address,
        tronDepositPrivEnc,
        tronDepositCreatedAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return json(res, 200, {
      ok: true,
      address,
      chain: 'TRC20',
      token: 'USDT',
      priceUsdt: PRICE_USDT,
      credits: MONTHLY_CREDITS,
    });
  } catch (e: any) {
    // Surface env/import issues during Vercel function init.
    return json(res, 500, { error: e?.message || 'Server error' });
  }
}
