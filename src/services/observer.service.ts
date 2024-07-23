export interface Observer {
  update(event: string, data: any): void;
}

export interface Subject {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObservers(event: string, data: any): void;
}

/**
 * @description Class implementing the Subject interface,
 * managing a list of observers and notifying them of events.
 */
class Observable implements Subject {
  private observers: Observer[] = [];

  // Adds an observer to the list.
  public addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  // Removes an observer from the list.
  public removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  // Notifies all observers of an event.
  public notifyObservers(event: string, data: any): void {
    this.observers.forEach((observer) => observer.update(event, data));
  }
}

export default Observable;
