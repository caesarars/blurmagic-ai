import type { FirebaseFirestore } from 'firebase-admin';

export type Plan = 'free' | 'pro' | 'team';

export type UserEntitlements = {
  plan: Plan;
  canUse: boolean;
  remaining: number;
  limit: number;
  creditsBalance: number;
  dailyCreditsUsed: number;
  dailyLimit: number;
  subscriptionStatus: string | null;
  currentPeriodEnd: number | null;
};

const FREE_DAILY_LIMIT = 5;

function utcDateKey(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function ensureUserDoc(db: FirebaseFirestore.Firestore, uid: string) {
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (snap.exists) return;
  await ref.set(
    {
      plan: 'free',
      creditsBalance: 0,
      monthlyCreditsAllowance: 0,
      subscriptionStatus: null,
      stripeCustomerId: null,
      currentPeriodEnd: null,
      lastGrantedPeriodEnd: null,
      dailyCreditsUsed: 0,
      lastDailyResetDate: utcDateKey(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

export async function getEntitlements(db: FirebaseFirestore.Firestore, uid: string): Promise<UserEntitlements> {
  await ensureUserDoc(db, uid);
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  const data = snap.data() || {};

  const plan = (data.plan as Plan) || 'free';
  const creditsBalance = Number(data.creditsBalance || 0);
  const subscriptionStatus = (data.subscriptionStatus as string | null) ?? null;
  const currentPeriodEnd =
    data.currentPeriodEnd && typeof data.currentPeriodEnd.toMillis === 'function'
      ? data.currentPeriodEnd.toMillis()
      : typeof data.currentPeriodEnd === 'number'
        ? data.currentPeriodEnd
        : null;

  const dailyLimit = FREE_DAILY_LIMIT;
  const today = utcDateKey();
  const lastDailyResetDate = String(data.lastDailyResetDate || '');
  const dailyCreditsUsedRaw = Number(data.dailyCreditsUsed || 0);
  const dailyCreditsUsed = lastDailyResetDate === today ? dailyCreditsUsedRaw : 0;

  if (plan === 'free') {
    const remaining = Math.max(0, dailyLimit - dailyCreditsUsed);
    return {
      plan,
      canUse: remaining > 0,
      remaining,
      limit: dailyLimit,
      creditsBalance,
      dailyCreditsUsed,
      dailyLimit,
      subscriptionStatus,
      currentPeriodEnd,
    };
  }

  const remaining = Math.max(0, creditsBalance);
  return {
    plan,
    canUse: remaining > 0,
    remaining,
    limit: remaining,
    creditsBalance,
    dailyCreditsUsed,
    dailyLimit,
    subscriptionStatus,
    currentPeriodEnd,
  };
}

export async function consumeCredits(
  db: FirebaseFirestore.Firestore,
  uid: string,
  count: number,
  reason: string
): Promise<UserEntitlements> {
  if (!Number.isFinite(count) || count <= 0) throw new Error('Invalid count');

  const userRef = db.collection('users').doc(uid);
  const ledgerRef = userRef.collection('credit_ledger').doc();

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists) {
      tx.set(
        userRef,
        {
          plan: 'free',
          creditsBalance: 0,
          monthlyCreditsAllowance: 0,
          subscriptionStatus: null,
          stripeCustomerId: null,
          currentPeriodEnd: null,
          lastGrantedPeriodEnd: null,
          dailyCreditsUsed: 0,
          lastDailyResetDate: utcDateKey(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    const data = (snap.data() || {}) as any;
    const plan = (data.plan as Plan) || 'free';

    if (plan === 'free') {
      const today = utcDateKey();
      const lastDailyResetDate = String(data.lastDailyResetDate || '');
      const dailyCreditsUsed = Number(data.dailyCreditsUsed || 0);
      const effectiveDailyUsed = lastDailyResetDate === today ? dailyCreditsUsed : 0;
      const remaining = FREE_DAILY_LIMIT - effectiveDailyUsed;
      if (remaining < count) {
        const err: any = new Error('Insufficient daily credits');
        err.code = 'insufficient_credits';
        throw err;
      }
      tx.set(
        userRef,
        {
          dailyCreditsUsed: effectiveDailyUsed + count,
          lastDailyResetDate: today,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      tx.set(ledgerRef, {
        type: 'spend',
        amount: count,
        reason,
        createdAt: new Date(),
      });
      return;
    }

    const creditsBalance = Number(data.creditsBalance || 0);
    if (creditsBalance < count) {
      const err: any = new Error('Insufficient credits');
      err.code = 'insufficient_credits';
      throw err;
    }

    tx.set(
      userRef,
      {
        creditsBalance: creditsBalance - count,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    tx.set(ledgerRef, {
      type: 'spend',
      amount: count,
      reason,
      createdAt: new Date(),
    });
  });

  void result;
  return getEntitlements(db, uid);
}

export async function grantCredits(
  db: FirebaseFirestore.Firestore,
  uid: string,
  amount: number,
  reason: string
) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  const userRef = db.collection('users').doc(uid);
  const ledgerRef = userRef.collection('credit_ledger').doc();

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = (snap.data() || {}) as any;
    const current = Number(data.creditsBalance || 0);
    tx.set(
      userRef,
      {
        creditsBalance: current + amount,
        updatedAt: new Date(),
      },
      { merge: true }
    );
    tx.set(ledgerRef, {
      type: 'grant',
      amount,
      reason,
      createdAt: new Date(),
    });
  });
}
