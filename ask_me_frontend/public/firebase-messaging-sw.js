importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Firebase Configuration for Background Service Worker
const firebaseConfig = {
  apiKey: "AIzaSyAIZvMcrf_auWLQgYrBDbdTGuf-yXjlQRE",
  authDomain: "askme-1262d.firebaseapp.com",
  projectId: "askme-1262d",
  storageBucket: "askme-1262d.firebasestorage.app",
  messagingSenderId: "658372399396",
  appId: "1:658372399396:web:2823649b4a7876f3b023b1",
  measurementId: "G-01QSG2E0FJ"
};


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background Notification Handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background notification received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Creator Registration';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'A new creator has registered.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Notification Clicks - Redirect Admin to Creator Details / KYC Page
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const data = event.notification.data || {};
  const creatorId = data.creatorId || data.creator_id;
  const targetUrl = creatorId ? `/admin/creators/${creatorId}` : '/admin/creators';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If admin tab is already open, focus it and navigate to target route
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
