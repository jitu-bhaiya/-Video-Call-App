// Vercel serverless function: GET /api/token?roomID=..&userID=..
// ServerSecret sirf yahan (server par) rehta hai, browser ko kabhi nahi jata.
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import process from 'node:process';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

// Token04 - wahi format jo Zego SDK ka generateKitTokenForTest banata hai
function generateToken04(appId, userId, secret, effectiveSeconds) {
  const ctime = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    app_id: appId,
    user_id: userId,
    nonce: crypto.randomInt(1, 2147483647),
    ctime,
    expire: ctime + effectiveSeconds,
  });

  const iv = Array.from(crypto.randomBytes(16), (b) => ALPHABET[b % ALPHABET.length]).join('');
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret, 'utf8'), Buffer.from(iv, 'utf8'));
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);

  const head = Buffer.alloc(8);
  head.writeBigInt64BE(BigInt(ctime + effectiveSeconds));
  const ivLen = Buffer.alloc(2);
  ivLen.writeUInt16BE(iv.length);
  const encLen = Buffer.alloc(2);
  encLen.writeUInt16BE(encrypted.length);

  return '04' + Buffer.concat([head, ivLen, Buffer.from(iv, 'utf8'), encLen, encrypted]).toString('base64');
}

export default function handler(req, res) {
  const appId = Number(process.env.VITE_ZEGO_APP_ID);
  const secret = process.env.ZEGO_SERVER_SECRET;

  if (!appId || !secret || secret.length !== 32) {
    return res.status(500).json({ error: 'Server env vars missing: VITE_ZEGO_APP_ID / ZEGO_SERVER_SECRET (32 chars)' });
  }

  const { roomID, userID } = req.query;
  if (!roomID || !userID || String(roomID).length > 128 || String(userID).length > 64) {
    return res.status(400).json({ error: 'roomID and userID are required' });
  }

  const token = generateToken04(appId, String(userID), secret, 60 * 60 * 2); // 2 ghante
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ token });
}
