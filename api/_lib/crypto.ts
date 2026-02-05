import crypto from 'node:crypto';

function requireSecret() {
  const secret = process.env.TRON_KEY_ENCRYPTION_SECRET;
  if (!secret) throw new Error('Missing TRON_KEY_ENCRYPTION_SECRET');
  return secret;
}

function keyFromSecret(secret: string) {
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

export function encryptText(plain: string): string {
  const secret = requireSecret();
  const key = keyFromSecret(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decryptText(payload: string): string {
  const secret = requireSecret();
  const key = keyFromSecret(secret);
  const parts = String(payload || '').split(':');
  if (parts.length !== 4 || parts[0] !== 'v1') throw new Error('Invalid encrypted payload');
  const iv = Buffer.from(parts[1]!, 'base64');
  const tag = Buffer.from(parts[2]!, 'base64');
  const data = Buffer.from(parts[3]!, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}
