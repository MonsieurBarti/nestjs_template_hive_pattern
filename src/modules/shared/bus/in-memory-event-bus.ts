import { Any } from '@/util/stubs';
import { EventBus } from '@nestjs/cqrs';

/**
 * In-memory implementation of EventBus for testing purposes.
 * Allows for easy mocking and verification of event publication.
 */
export class InMemoryEventBus extends EventBus {
  private publishedEvents: Array<{ event: Any; result: Any }> = [];
  private mockHandlers = new Map<string, (event: Any) => Any>();
  private defaultResult: Any = undefined;
  private resultQueue: Any[] = [];

  constructor() {
    super(null as Any, null as Any, null as Any);
  }

  /**
   * Publishes an event and stores it for later verification.
   */
  async publish<T = Any>(event: T): Promise<void> {
    const eventName = (event as Any).constructor.name;
    let result: Any;

    // Record the event publication immediately to ensure tracking even if handler throws
    const publicationRecord = { event, result: undefined };
    this.publishedEvents.push(publicationRecord);

    // Check if we have queued results (for mockResolvedValueOnce pattern)
    if (this.resultQueue.length > 0) {
      result = this.resultQueue.shift();
    } else if (this.mockHandlers.has(eventName)) {
      // Check if we have a specific handler for this event type
      const handler = this.mockHandlers.get(eventName);
      if (!handler) {
        throw new Error(`No handler found for event type: ${eventName}`);
      }
      result = await handler(event);
    } else {
      // Return default result
      result = this.defaultResult;
    }

    // Update the publication record with the result
    publicationRecord.result = result;

    // If it's a rejected promise, throw the error
    if (result && typeof result.then === 'function') {
      await result;
      return;
    }
  }

  /**
   * Publishes multiple events.
   */
  async publishAll<T = Any>(events: T[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * Sets up a mock handler for a specific event type.
   */
  mockImplementation<T = Any>(
    eventType: new (...args: Any[]) => T,
    handler: (event: T) => Any,
  ): this {
    this.mockHandlers.set(eventType.name, handler as (event: Any) => Any);
    return this;
  }

  /**
   * Sets the default return value for all events.
   */
  mockReturnValue(value: Any): this {
    this.defaultResult = value;
    return this;
  }

  /**
   * Adds a value to be returned for the next event publication.
   * Similar to Jest's mockResolvedValueOnce.
   */
  mockResolvedValueOnce(value: Any): this {
    this.resultQueue.push(value);
    return this;
  }

  /**
   * Sets up the next event to throw an error.
   */
  mockRejectedValue(error: Any): this {
    this.resultQueue.push(Promise.reject(error));
    return this;
  }

  /**
   * Gets all published events.
   */
  getPublishedEvents(): Any[] {
    return this.publishedEvents.map((item) => item.event);
  }

  /**
   * Gets published events of a specific type.
   */
  getPublishedEventsOfType<T = Any>(eventType: new (...args: Any[]) => T): T[] {
    const eventName = eventType.name;
    return this.publishedEvents
      .map((item) => item.event)
      .filter((event) => (event as Any).constructor.name === eventName) as T[];
  }

  /**
   * Checks if a specific event type was published.
   */
  hasPublishedEvent<T = Any>(eventType: new (...args: Any[]) => T): boolean {
    const eventName = eventType.name;
    return this.publishedEvents.some(
      (item) => (item.event as Any).constructor.name === eventName,
    );
  }

  /**
   * Gets the number of times a specific event type was published.
   */
  getPublishCount<T = Any>(eventType: new (...args: Any[]) => T): number {
    const eventName = eventType.name;
    return this.publishedEvents.filter(
      (item) => (item.event as Any).constructor.name === eventName,
    ).length;
  }

  /**
   * Gets the last published event.
   */
  getLastPublishedEvent(): Any | undefined {
    const last = this.publishedEvents[this.publishedEvents.length - 1];
    return last?.event;
  }

  /**
   * Gets the last published event of a specific type.
   */
  getLastPublishedEventOfType<T = Any>(
    eventType: new (...args: Any[]) => T,
  ): T | undefined {
    const events = this.getPublishedEventsOfType(eventType);
    return events[events.length - 1];
  }

  /**
   * Gets event at specific index.
   */
  getEventAt(index: number): Any | undefined {
    return this.publishedEvents[index]?.event;
  }

  /**
   * Clears all published events and mock handlers.
   */
  clear(): void {
    this.publishedEvents = [];
    this.mockHandlers.clear();
    this.defaultResult = undefined;
    this.resultQueue = [];
  }

  /**
   * Gets the total number of published events.
   */
  get publishCount(): number {
    return this.publishedEvents.length;
  }
}
