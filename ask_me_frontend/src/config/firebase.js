import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { API_ENDPOINTS } from '@/config/api';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };

/**
 * Register Service Worker & Request FCM Token for Admin
 * @param {string} adminToken JWT authorization token for Admin
 */
export const requestAdminFcmToken = async (adminToken) => {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Worker or window environment not supported.');
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging is not supported in this browser.');
      return null;
    }

    // 1. Request Browser Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission was not granted by admin.');
      return null;
    }

    // 2. Register Firebase Messaging Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const messaging = getMessaging(app);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    // 3. Obtain FCM Token
    const fcmToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      ...(vapidKey ? { vapidKey } : {}),
    });

    if (fcmToken && adminToken) {
      console.log('✅ Admin FCM Token Generated:', fcmToken);

      // 4. Send token to backend endpoint: POST /api/admin/notification-token
      const apiUrl = API_ENDPOINTS.ADMIN.NOTIFICATION_TOKEN;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          token: fcmToken,
          deviceInfo: `${navigator.userAgent || 'Web Browser'} (${window.innerWidth}x${window.innerHeight})`,
        }),
      });

      return fcmToken;
    }
  } catch (err) {
    console.warn('FCM Token Generation Notice:', err.message);
  }
  return null;
};

/**
 * Register Service Worker & Request FCM Token for Viewer (User)
 * @param {string} viewerToken JWT authorization token for Viewer
 * @param {string|number} userId Viewer User ID
 */
export const requestViewerFcmToken = async (viewerToken, userId) => {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    // 1. Request Browser Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    // 2. Register Firebase Messaging Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    // 3. Obtain FCM Token
    const fcmToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      ...(vapidKey ? { vapidKey } : {}),
    });

    if (fcmToken) {
      console.log('✅ Viewer FCM Token Generated:', fcmToken);

      // 4. Send token to backend endpoint: POST /api/viewers/notification-token
      const apiUrl = API_ENDPOINTS.VIEWERS.NOTIFICATION_TOKEN;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(viewerToken ? { Authorization: `Bearer ${viewerToken}` } : {}),
        },
        body: JSON.stringify({
          token: fcmToken,
          userId,
          deviceInfo: `${navigator.userAgent || 'Web Browser'} (${window.innerWidth}x${window.innerHeight})`,
        }),
      });

      return fcmToken;
    }
  } catch (err) {
    console.warn('Viewer FCM Token Generation Notice:', err.message);
  }
  return null;
};


/**
 * Foreground message listener
 */
export const onForegroundMessage = async (callback) => {
  try {
    const supported = await isSupported();
    if (supported) {
      const messaging = getMessaging(app);
      return onMessage(messaging, (payload) => {
        console.log('Foreground FCM Message received:', payload);
        if (callback) callback(payload);
      });
    }
  } catch (err) {
    console.warn('Foreground message listener error:', err.message);
  }
  return () => {};
};
