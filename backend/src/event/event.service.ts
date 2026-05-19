import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GBEvent } from './event.entity';
import { EventType } from './event-type.enum';
import { User } from '../auth/user.entity';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(GBEvent)
    private eventRepository: Repository<GBEvent>,
  ) {}

  async emitUserCreatedEvent(user: User): Promise<GBEvent> {
    const event = this.eventRepository.create({
      type: EventType.USER_CREATED,
      user: user,
      processed: false,
    });
    return await this.eventRepository.save(event);
  }
}
