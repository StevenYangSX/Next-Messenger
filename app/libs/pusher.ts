import PusherServer from "pusher";
import PusherClient from "pusher-js";

declare global {
  // eslint-disable-next-line no-var
  var pusherServer: PusherServer | undefined;
  // eslint-disable-next-line no-var
  var pusherClient: PusherClient | undefined;
}

const pusherServerInstance =
  globalThis.pusherServer ||
  new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: "us3",
    useTLS: true,
  });

const pusherClientInstance =
  globalThis.pusherClient ||
  new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    channelAuthorization: {
      endpoint: "/api/pusher/auth",
      transport: "ajax",
    },
    cluster: "us3",
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.pusherServer = pusherServerInstance;
  globalThis.pusherClient = pusherClientInstance;
}

export { pusherServerInstance as pusherServer, pusherClientInstance as pusherClient };
