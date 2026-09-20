import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useParams } from 'react-router-dom';
import { appId, serverSecretCode } from '../data';

const RoomPage = () => {
  const { id } = useParams();
  const containerRef = useRef(null);

  useEffect(() => {
    let zp = null;
    let cancelled = false;

    const start = async () => {
      const userID = Date.now().toString();
      const userName = 'Jitendra';
      let kitToken;

      if (import.meta.env.DEV && serverSecretCode) {
        // Local development: seedha test token (secret sirf local .env me)
        kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appId, serverSecretCode, id, userID, userName);
      } else {
        // Production: token server (/api/token) se aata hai
        const res = await fetch(
          `/api/token?roomID=${encodeURIComponent(id)}&userID=${encodeURIComponent(userID)}`
        );
        if (!res.ok) throw new Error(`Token API failed (${res.status})`);
        const { token } = await res.json();
        kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(appId, token, id, userID, userName);
      }

      if (cancelled) return; // StrictMode / page change ho gaya to join mat karo

      zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [{ name: 'copy link', url: `${window.location.origin}/room/${id}` }],
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      });
    };

    start().catch((e) => console.error('Join failed:', e));

    return () => {
      cancelled = true;
      try {
        zp?.destroy();
      } catch (e) {
        console.log('destroy error', e);
      }
    };
  }, [id]);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default RoomPage;
