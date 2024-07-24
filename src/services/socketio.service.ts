import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer, Socket, ServerOptions } from 'socket.io';
import Observable from './observer.service';
import EventManager from './event.manager.service';
import { COMMON_EVENTS } from '../events';

/**
 * @description Class that manages Socket.io connections and handles event registration.
 */
class SocketManager extends Observable {
  private static instance: SocketManager;
  private io: SocketIOServer;

  private constructor(
    httpServer: HttpServer,
    socketOptions?: Partial<ServerOptions>
  ) {
    super();
    this.io = new SocketIOServer(httpServer, socketOptions);
  }

  // Returns the single instance of SocketManager, creating it if necessary.
  public static getInstance(
    httpServer: HttpServer,
    socketOptions?: Partial<ServerOptions>
  ): SocketManager {
    if (!SocketManager.instance) {
      console.log('There is no socket manager instance, I will create it...');
      SocketManager.instance = new SocketManager(httpServer, socketOptions);
    }
    return SocketManager.instance;
  }

  // Registers event handlers for new Socket.io connections.
  public register(): void {
    this.io.on(COMMON_EVENTS.CONNECT, (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Create and register a single EventManager for each socket
      const eventManager = new EventManager(socket);
      this.addObserver(eventManager);

      socket.onAny((event, ...args) => {
        this.notifyObservers(event, args);
      });

      socket.on(COMMON_EVENTS.DISCONNECT, () => {
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
