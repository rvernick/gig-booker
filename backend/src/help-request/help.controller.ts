import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HelpService } from './help.service';
import { HelpRequest } from './help-request';
import { TimeOfDay } from '../common/time-of-day.enum';
import { HelpRequestType } from './help-request-type';
import { devLog } from '../utils/utils';
import { HelpOffer } from './help-offer';

@Controller('help')
export class HelpController {
  constructor(private helpService: HelpService) {}

  @Post('create-request')
  create(
    @Body() body: { username: string; iosDate: string; timeOfDay: TimeOfDay; type: HelpRequestType | undefined },
  ): Promise<HelpRequest> {
    devLog('Creating help request', body);
    const onDate = new Date(body.iosDate + 'T00:00:00');
    const type = body.type ? body.type : HelpRequestType.PACKAGE;
    return this.helpService.createHelpRequest(body.username, onDate, body.timeOfDay, type);
  }

  @Get('requests-by')
  requestsBy(@Query('username') username: string): Promise<HelpRequest[]> {
    devLog('Returning help request', username);
    return this.helpService.getRequestsBy(username);
  }

  @Get('offers-by')
  offersBy(@Query('username') username: string): Promise<HelpOffer[]> {
    devLog('Returning help offers ', username);
    return this.helpService.getOffersBy(username);
  }
}
