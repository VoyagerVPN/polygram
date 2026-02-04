import type { WebSocket } from 'ws';

export class WsService {
  private static clients: Set<WebSocket> = new Set();

  static registerClient(socket: WebSocket) {
    if (!socket) {
      console.error('[WS] Attempted to register undefined socket');
      return;
    }
    
    this.clients.add(socket);
    
    socket.on('close', () => {
      this.clients.delete(socket);
      console.log('[WS] Client disconnected');
    });
    
    socket.on('error', (err) => {
      console.error('[WS] Socket error:', err);
      this.clients.delete(socket);
    });
    
    // Send initial connection success message
    if (socket.readyState === 1) { // WebSocket.OPEN
      socket.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));
    }
  }

  static broadcastMarketUpdate(marketId: string, payload: { qYes: number; qNo: number }) {
    const data = JSON.stringify({
      type: 'MARKET_UPDATE',
      marketId,
      ...payload,
      timestamp: new Date().toISOString()
    });

    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data);
        sentCount++;
      }
    });
    
    console.log(`[WS] Broadcasted update to ${sentCount} clients`);
  }
}
