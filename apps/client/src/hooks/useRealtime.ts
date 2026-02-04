/**
 * Hook for WebSocket real-time updates (refactored)
 */

import { useEffect, useRef, useCallback } from 'react';
import { WebSocketClient } from '@/api/websocket';
import { usePolygramStore } from '@/store/usePolygramStore';
import type { WSMessage } from '@/types';

export function useRealtime(): void {
  const { updateMarket } = usePolygramStore();
  const wsClientRef = useRef<WebSocketClient | null>(null);

  const handleMessage = useCallback((message: WSMessage) => {
    if (message.type === 'MARKET_UPDATE') {
      updateMarket(message.marketId, {
        qYes: message.qYes,
        qNo: message.qNo,
      });
    }
  }, [updateMarket]);

  useEffect(() => {
    wsClientRef.current = new WebSocketClient({
      onMessage: handleMessage,
      onConnect: () => console.log('[Realtime] Connected'),
      onDisconnect: () => console.log('[Realtime] Disconnected'),
    });

    wsClientRef.current.connect();

    return () => {
      wsClientRef.current?.disconnect();
    };
  }, [handleMessage]);
}
