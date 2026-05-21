import { GBEvent } from '../event/event.entity';
import { EventType } from '../event/event-type.enum';

export interface IEventHandler {
  /**
   * The name of the handler, used for tracking which handlers have processed events
   */
  readonly handlerName: string;

  /**
   * The event types this handler is interested in
   */
  readonly eventTypes: EventType[];

  /**
   * Handle the event
   * @param event The event to handle
   * @returns Promise that resolves when handling is complete
   */
  handle(event: GBEvent): Promise<IEventHandledResult>;
}

export interface IEventHandledResult {
  success: boolean;
  errorMessage?: string;
  message?: string;
}
