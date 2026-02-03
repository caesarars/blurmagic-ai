import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

function parseServiceAccount(): admin.ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  const json = raw || (b64 ? Buffer.from(b64, 'base64').toString('utf8') : null);
  if (!json) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON (or _BASE64)');
  }
  const parsed = JSON.parse(json);
  return parsed as admin.ServiceAccount;
}

export function getAdminApp(): admin.app.App {
  if (app) return app;
  if (admin.apps.length) {
    app = admin.apps[0]!;
    return app;
  }
  const credential = admin.credential.cert(parseServiceAccount());
  app = admin.initializeApp({ credential });
  return app;
}

export function getAdminDb(): admin.firestore.Firestore {
  getAdminApp();
  return admin.firestore();
}
