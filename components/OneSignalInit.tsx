"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OneSignalInit() {
  const savePlayerId = useMutation(api.users.savePlayerId);

  useEffect(() => {
    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      allowLocalhostAsSecureOrigin: true,
    });

    // Runs when user allows notifications
    OneSignal.User.PushSubscription.addEventListener(
      "change",
      async () => {
        const playerId =
          OneSignal.User.PushSubscription.id;

        if (playerId) {
          await savePlayerId({ playerId });
          console.log("Saved playerId:", playerId);
        }
      }
    );
  }, []);

  return null;
}