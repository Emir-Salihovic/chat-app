import { Socket } from 'socket.io';
import { Observer } from './observer.service';

/**
 * @description Class that handles specific events by implementing the Observer interface.
 */
class EventManager implements Observer {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  // Called when an event occurs, triggering the appropriate handler.
  public update(event: string, data: any): void {
    console.log(`Event received: ${event}`);

    switch (event) {
      case 'disconnect':
        this.handleDisconnect(data);
        break;
      // Add more cases for different events
      default:
        console.warn(`No handler for event: ${event}`);
        break;
    }
  }

  // Handles the disconnect event.
  private handleDisconnect(data: any): void {
    const { socket } = data;
    console.log(`User disconnected: ${socket.id}`);
    // Disconnect logic here
  }
}

export default EventManager;
