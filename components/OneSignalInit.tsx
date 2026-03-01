"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OneSignalInit() {
  const savePlayerId = useMutation(api.users.savePlayerId);

  useEffect(() => {
    async function init() {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      });

      // SHOW PERMISSION PROMPT
      const permission = await OneSignal.Notifications.permission;

      if (!permission) {
        await OneSignal.Notifications.requestPermission();
      }

      // save player ID
      const playerId = OneSignal.User.PushSubscription.id;

      if (playerId) {
        await savePlayerId({ playerId });
        console.log("Saved playerId:", playerId);
      }
    }

    init();
  }, []);

  return null;
}