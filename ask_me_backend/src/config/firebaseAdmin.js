const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging: getAdminMessaging } = require('firebase-admin/messaging');

let firebaseApp = null;

const initFirebaseAdmin = () => {
  if (firebaseApp) return firebaseApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  try {
    // 1. Service Account JSON String in Env (FIREBASE_SERVICE_ACCOUNT_KEY)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('[FIREBASE ADMIN] Initialized via FIREBASE_SERVICE_ACCOUNT_KEY.');
      return firebaseApp;
    }

    // 2. Individual Environment Variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (typeof privateKey === 'string') {
        privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
      }

      firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log('[FIREBASE ADMIN] Initialized via FIREBASE_PROJECT_ID & credentials.');
      return firebaseApp;
    }

    // 3. Service Account File Path (FIREBASE_SERVICE_ACCOUNT_PATH)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const path = require('path');
      const fs = require('fs');
      const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(filePath)) {
        const serviceAccount = require(filePath);
        firebaseApp = initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('[FIREBASE ADMIN] Initialized via service account file.');
        return firebaseApp;
      }
    }

    console.warn('[FIREBASE ADMIN NOTICE] Firebase Admin credentials not set in .env. FCM Push Notifications will be skipped until env is configured.');
  } catch (err) {
    console.warn('[FIREBASE ADMIN WARNING] Failed to initialize Firebase Admin:', err.message);
  }

  return null;
};

const getMessaging = () => {
  const app = initFirebaseAdmin();
  if (app) {
    return getAdminMessaging(app);
  }
  return null;
};

module.exports = {
  initFirebaseAdmin,
  getMessaging,
};

