import PusherServer from "pusher";
import PusherClient from "pusher-js";

declare global {
  // eslint-disable-next-line no-var
  var pusherServer: PusherServer | undefined;
  // eslint-disable-next-line no-var
  var pusherClient: PusherClient | undefined;
}

const createPusherServerInstance = () => {
  try {
    return new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: "us3",
      useTLS: true,
    });
  } catch (error) {
    console.error("Failed to create Pusher Server instance:", error);
    throw error;
  }
};

const createPusherClientInstance = () => {
  try {
    return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
      cluster: "us3",
    });
  } catch (error) {
    console.error("Failed to create Pusher Client instance:", error);
    throw error;
  }
};

const pusherServerInstance = globalThis.pusherServer || createPusherServerInstance();
const pusherClientInstance = globalThis.pusherClient || createPusherClientInstance();

if (process.env.NODE_ENV !== "production") {
  globalThis.pusherServer = pusherServerInstance;
  globalThis.pusherClient = pusherClientInstance;
}

export { pusherServerInstance as pusherServer, pusherClientInstance as pusherClient };

// Log instances to verify correct creation
console.log("Pusher Server Instance:", pusherServerInstance);
console.log("Pusher Client Instance:", pusherClientInstance);
