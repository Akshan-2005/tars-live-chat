import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendPush = action({
  args: {
    playerId: v.string(),
    senderName: v.string(),
  },
  handler: async (_, args) => {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: [args.playerId],
        headings: { en: `New message from ${args.senderName}` },
        contents: { en: "Open app to view message" },
        url: "http://localhost:3000",
      }),
    });
  },
});