import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

class SocketManager {
  private io: SocketIOServer;
  private eventListeners: Map<string, (...args: any[]) => void>;

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*'
      }
    });
    this.eventListeners = new Map();
  }

  public register(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Register default event handlers
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });

      // Additional event handlers can be registered here
    });
  }

  public on(
    event: string,
    handler: (socket: Socket, ...args: any[]) => void
  ): void {
    const listener = (socket: Socket, ...args: any[]) =>
      handler(socket, ...args);
    this.eventListeners.set(event, listener);
    this.io.on(event, listener);
  }

  public off(event: string): void {
    const listener = this.eventListeners.get(event);
    if (listener) {
      this.io.off(event, listener);
      this.eventListeners.delete(event);
    }
  }

  public close(): void {
    this.io.close();
  }
}

export default SocketManager;
