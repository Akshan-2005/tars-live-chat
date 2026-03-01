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

      // ✅ get subscription ID directly
      const playerId = OneSignal.User.PushSubscription.id;

      if (playerId) {
        await savePlayerId({ playerId });
        console.log("Saved playerId:", playerId);
      }

      // ✅ also listen for future changes
      OneSignal.User.PushSubscription.addEventListener(
        "change",
        async () => {
          const id = OneSignal.User.PushSubscription.id;
          if (id) {
            await savePlayerId({ playerId: id });
            console.log("Updated playerId:", id);
          }
        }
      );
    }

    init();
  }, []);

  return null;
}