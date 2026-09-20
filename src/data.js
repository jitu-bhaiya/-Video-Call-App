// Values .env file se aati hain (dekho .env.example).
// NOTE: generateKitTokenForTest sirf testing ke liye hai - serverSecret browser me expose hota hai.
export const appId = Number(import.meta.env.VITE_ZEGO_APP_ID);
export const serverSecretCode = import.meta.env.VITE_ZEGO_SERVER_SECRET;
