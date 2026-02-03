import type { IncomingMessage } from 'http';

export function json(res: any, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export function getRequestOrigin(req: any): string {
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) || 'https';
  const host = (req.headers['x-forwarded-host'] as string | undefined) || (req.headers.host as string | undefined);
  if (!host) return 'https://localhost';
  return `${proto}://${host}`;
}

