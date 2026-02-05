import TronWeb from 'tronweb';

export const USDT_TRC20_CONTRACT = process.env.USDT_TRC20_CONTRACT || 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

export function tronClient() {
  // No private key needed for read-only calls.
  const fullHost = process.env.TRON_FULL_HOST || 'https://api.trongrid.io';
  const headers: Record<string, string> = {};
  const apiKey = process.env.TRON_API_KEY || process.env.TRONGRID_API_KEY;
  if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey;

  return new TronWeb({
    fullHost,
    headers,
  } as any);
}

export async function createTronAccount() {
  // tronweb exposes createAccount() as static in most versions.
  // This returns { privateKey, publicKey, address: { base58, hex } }
  const acc = await (TronWeb as any).createAccount();
  const address = acc?.address?.base58 as string;
  const privateKey = acc?.privateKey as string;
  if (!address || !privateKey) throw new Error('Failed to create TRON account');
  return { address, privateKey };
}

export type Trc20Tx = {
  transaction_id: string;
  from: string;
  to: string;
  value: string;
  token_info?: { address?: string; symbol?: string; decimals?: number };
  block_timestamp?: number;
};

export async function fetchRecentUsdtTransfersTo(addressBase58: string, limit = 50): Promise<Trc20Tx[]> {
  const client = tronClient();
  const base = (client as any).fullHost || process.env.TRON_FULL_HOST || 'https://api.trongrid.io';
  const apiKey = process.env.TRON_API_KEY || process.env.TRONGRID_API_KEY;

  // TronGrid endpoint: /v1/accounts/{address}/transactions/trc20
  const url = `${base.replace(/\/$/, '')}/v1/accounts/${addressBase58}/transactions/trc20?limit=${limit}&contract_address=${USDT_TRC20_CONTRACT}`;

  const res = await fetch(url, {
    headers: {
      ...(apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {}),
    },
  } as any);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`TronGrid error ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as any;
  const data = (json?.data || []) as Trc20Tx[];
  return data;
}

export function usdtToBaseUnits(amountUsdt: number): string {
  // USDT TRC20 uses 6 decimals.
  const v = Math.round(amountUsdt * 1_000_000);
  return String(v);
}
