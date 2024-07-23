import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket, ServerOptions } from 'socket.io';
import Observable from './observer.service';
import EventManager from './event.manager.service';

/**
 * @description Class that manages Socket.io connections and handles event registration.
 */
class SocketManager extends Observable {
  private io: SocketIOServer;

  constructor(httpServer: HttpServer, socketOptions?: Partial<ServerOptions>) {
    super();
    this.io = new SocketIOServer(httpServer, socketOptions);
  }

  // Registers event handlers for new Socket.io connections.
  public register(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Create and register a single EventManager for each socket
      const eventManager = new EventManager(socket);
      this.addObserver(eventManager);

      socket.onAny((event, ...args) => {
        this.notifyObservers(event, args);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Notify observers of the disconnection
        this.notifyObservers('disconnect', { socket });
      });
    });
  }

  // Closes the Socket.io server.
  public close(): void {
    this.io.close();
  }
}

export default SocketManager;
