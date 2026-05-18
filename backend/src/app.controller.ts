import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { devLog } from './utils/utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    devLog('Hello World!');
    return this.appService.getHello();
  }
}
