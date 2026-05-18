import { Inject, Injectable, Logger } from '@nestjs/common';
import { TimeOfDay } from '../common/time-of-day.enum';
import { HelpRequest } from './help-request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../auth/user.service';
import { HelpRequestType } from './help-request-type';
import { HelpOffer } from './help-offer';

@Injectable()
export class HelpService {
  constructor(
    @InjectRepository(HelpRequest)
    private helpRequestRepository: Repository<HelpRequest>,
    @InjectRepository(HelpOffer)
    private helpOfferRepository: Repository<HelpOffer>,
    @Inject(UserService)
    private userService: UserService,
  ) {}
  private readonly logger = new Logger(HelpService.name);

  async createHelpRequest(
    username: string,
    onDate: Date,
    timeOfDay: TimeOfDay,
    type: HelpRequestType,
  ): Promise<HelpRequest> {
    const user = await this.userService.findAuthorizedUser(username);
    const request = this.helpRequestRepository.create({
      user: user,
      timeOfDay: timeOfDay,
      type: type,
      startDate: onDate,
    });
    return this.helpRequestRepository.save(request);
  }

  async getRequestsBy(username: string): Promise<HelpRequest[]> {
    const user = await this.userService.findAuthorizedUser(username);
    return this.helpRequestRepository.find({
      where: { userId: user.id },
      order: { startDate: 'DESC' },
    });
  }

  async getOffersBy(username: string): Promise<HelpOffer[]> {
    const user = await this.userService.findAuthorizedUser(username);
    return this.helpOfferRepository.find({
      where: { userId: user.id },
      order: { startDate: 'DESC' },
    });
  }
}
