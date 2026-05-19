/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { EventHandlingService } from './event-handling.service';
import { EventType } from '../event/event-type.enum';
import { GBEvent } from '../event/event.entity';
import { IEventHandler } from './event-handler.interface';

describe('EventHandlingService', () => {
  it('registers a handler and processes a matching event', async () => {
    const event: GBEvent = {
      id: 1,
      type: EventType.USER_CREATED,
      user: null,
      processed: false,
      createdOn: new Date(),
    };

    const eventRepository = {
      find: jest.fn().mockResolvedValue([event]),
      save: jest.fn().mockImplementation(async (savedEvent: GBEvent) => savedEvent),
    };

    const eventHandledRepository = {
      exists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockImplementation((payload) => payload),
      save: jest.fn().mockImplementation(async (handledEvent) => handledEvent),
    };

    const householdRepository = {};
    const userService = {};

    const service = new EventHandlingService(
      eventRepository as any,
      eventHandledRepository as any,
      householdRepository as any,
      userService as any,
    );

    const handler: IEventHandler = {
      handlerName: 'test-handler',
      eventTypes: [EventType.USER_CREATED],
      handle: jest.fn().mockResolvedValue({ success: true }),
    };

    service.registerHandler(handler);
    await service.runEventHandlers();

    expect(handler.handle).toHaveBeenCalledWith(event);
    expect(eventHandledRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        event,
        handlerName: 'test-handler',
        success: true,
      }),
    );
    expect(event.processed).toBe(true);
    expect(eventRepository.save).toHaveBeenCalledWith(event);
  });
});
