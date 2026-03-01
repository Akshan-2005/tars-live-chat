importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBdb_cqgsW7nOjgGunJ-66Yfy-CNTkq3Vc",
    authDomain: "tars-live-chat.firebaseapp.com",
    projectId: "tars-live-chat",
    messagingSenderId: "1042035656423",
    appId: "1:1042035656423:web:8af6352ffa0557e35d8442",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const title = payload.notification.title;

    self.ServiceWorkerRegistration.showNotification(title, {
        body: payload.notification.body,
        icon: "/icon.png",
        data: data?.url
    });
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data || "/")
    );
});