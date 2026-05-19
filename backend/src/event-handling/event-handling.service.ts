import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GBEvent } from '../event/event.entity';
import { EventType } from '../event/event-type.enum';
import { IEventHandler } from './event-handler.interface';
import { User } from '../auth/user.entity';
import { GBEventHandled } from './event-handled.entity';
import { devLog } from '../utils/utils';
import { UserService } from '../auth/user.service';
import { Cron } from '@nestjs/schedule';
import { Household } from '../auth/household.entity';

@Injectable()
export class EventHandlingService {
  private readonly logger = new Logger(EventHandlingService.name);
  private handlers: Map<EventType, IEventHandler[]> = new Map();

  constructor(
    @InjectRepository(GBEvent)
    private eventRepository: Repository<GBEvent>,
    @InjectRepository(GBEventHandled)
    private eventHandledRepository: Repository<GBEventHandled>,
    @InjectRepository(Household)
    private householdRepository: Repository<Household>,
    @Inject(UserService)
    private userService: UserService,
  ) {}

  onApplicationBootstrap() {
    // this.registerHandler(new UserCreatedHandler());
    void this.runEventHandlers();
  }

  @Cron('0 */15 * * * *')
  async runEventHandlers(): Promise<void> {
    this.logger.log('Checking for unprocessed events...');
    const events = await this.eventRepository.find({ where: { processed: false } });
    for (const event of events) {
      this.logger.log(`Processing event: ${event.type}`);
      await this.processHandlers(event);
    }
  }

  /**
   * Register an event handler
   */
  registerHandler(handler: IEventHandler): void {
    handler.eventTypes.forEach((eventType) => {
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, []);
      }
      this.handlers.get(eventType)!.push(handler);
    });
    this.logger.log(`Registered handler: ${handler.handlerName} for types: ${handler.eventTypes.join(', ')}`);
  }

  async emitUserCreatedEvent(user: User): Promise<GBEvent> {
    const event = this.eventRepository.create({
      type: EventType.USER_CREATED,
      user: user,
      processed: false,
    });
    return await this.eventRepository.save(event);
  }

  /**
   * Process all handlers for an event
   */
  private async processHandlers(event: GBEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    let allEventsProcessedSuccessfully = true;

    devLog(`Processing event ${event.id} of type ${event.type} with ${handlers.length} handlers `);
    devLog('Event: ', event);
    for (const handler of handlers) {
      const alreadyHandled = await this.eventHandledRepository.exists({
        where: {
          event: { id: event.id },
          handlerName: handler.handlerName,
          success: true,
        },
      });

      if (alreadyHandled) {
        this.logger.debug(`Event ${event.id} already handled by ${handler.handlerName}`);
        continue;
      }

      try {
        const result = await handler.handle(event);
        if (!result.success) {
          throw new Error(result.errorMessage || 'Handler reported failure without error message');
        }
        await this.markEventHandled(event, handler.handlerName, true);
        this.logger.log(`Event ${event.id} handled successfully by ${handler.handlerName}`);
      } catch (error) {
        allEventsProcessedSuccessfully = false;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await this.markEventHandled(event, handler.handlerName, false, errorMessage);
        this.logger.error(`Error handling event ${event.id} with ${handler.handlerName}: ${errorMessage}`);
      }
    }
    try {
      if (allEventsProcessedSuccessfully) {
        event.processed = true;
        await this.eventRepository.save(event);
      }
    } catch (error) {
      this.logger.error(
        `Error marking event ${event.id} as processed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Mark an event as handled by a specific handler
   */
  private async markEventHandled(
    event: GBEvent,
    handlerName: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<GBEventHandled> {
    const eventHandled = this.eventHandledRepository.create({
      event: event,
      handlerName,
      success,
      errorMessage,
    });
    return await this.eventHandledRepository.save(eventHandled);
  }

  /**
   * Get all unhandled events for a specific handler
   */
  async getUnhandledEvents(handlerName: string, eventType?: EventType): Promise<GBEvent[]> {
    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.handledBy', 'handled', 'handled.handlerName = :handlerName', { handlerName })
      .where('handled.id IS NULL');

    if (eventType) {
      query.andWhere('event.type = :eventType', { eventType });
    }

    return await query.getMany();
  }

  /**
   * Retry failed event handling
   */
  async retryFailedEvents(handlerName?: string): Promise<void> {
    const query = this.eventHandledRepository
      .createQueryBuilder('handled')
      .leftJoinAndSelect('handled.event', 'event')
      .where('handled.success = :success', { success: false });

    if (handlerName) {
      query.andWhere('handled.handlerName = :handlerName', { handlerName });
    }

    const failedHandlings = await query.getMany();

    for (const handling of failedHandlings) {
      // Delete the failed handling record so it can be retried
      await this.eventHandledRepository.remove(handling);
      await this.processHandlers(handling.event);
    }
  }
}
