import * as admin from 'firebase-admin';
import { getAdminApp } from './firebaseAdmin';

export async function requireUid(req: any): Promise<string> {
  getAdminApp();
  const authHeader = (req.headers.authorization as string | undefined) || '';
  const match = authHeader.match(/^Bearer (.+)$/i);
  if (!match) throw new Error('Missing Authorization bearer token');
  const token = match[1]!;
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}
