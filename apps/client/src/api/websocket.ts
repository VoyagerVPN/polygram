/**
 * WebSocket Client for real-time market updates
 */

import { WS_BASE_URL, WS_RECONNECT_DELAY, MAX_WS_RECONNECT_ATTEMPTS } from '@/constants';
import type { WSMessage } from '@/types';

type MessageHandler = (message: WSMessage) => void;
type ConnectionHandler = () => void;

interface WSClientOptions {
  onMessage?: MessageHandler;
  onConnect?: ConnectionHandler;
  onDisconnect?: ConnectionHandler;
  onError?: (error: Event) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionallyClosed = false;

  constructor(private options: WSClientOptions = {}) {}

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      this.ws = new WebSocket(WS_BASE_URL);

      this.ws.onopen = () => {
        console.log('[WS] Connected to Polygram Server');
        this.reconnectAttempts = 0;
        this.options.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage;
          this.options.onMessage?.(message);
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[WS] Disconnected from server');
        this.options.onDisconnect?.();
        
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        this.options.onError?.(error);
      };
    } catch (err) {
      console.error('[WS] Failed to create connection:', err);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_WS_RECONNECT_ATTEMPTS) {
      console.error('[WS] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WS] Reconnecting in ${WS_RECONNECT_DELAY}ms... (attempt ${this.reconnectAttempts}/${MAX_WS_RECONNECT_ATTEMPTS})`);

    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, WS_RECONNECT_DELAY);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
