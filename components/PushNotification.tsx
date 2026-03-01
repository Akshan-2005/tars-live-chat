"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PushNotification() {
    const saveToken = useMutation(api.users.savePushToken);

    useEffect(() => {
        const init = async () => {
            const permission = await Notification.requestPermission();

            if (permission !== "granted") return;

            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            if (token) {
                await saveToken({ token });
            }
        };

        init();

        onMessage(messaging, (payload) => {
            console.log("Foreground message:", payload);
        });
    }, []);

    return null;
}