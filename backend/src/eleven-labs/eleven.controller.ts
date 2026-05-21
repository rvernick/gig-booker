import { ElevenService } from './eleven.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('eleven')
export class ElevenController {
  constructor(private elevenService: ElevenService) {}

  // @Public()
  @Post('test-call')
  async testCall(
    @Body('band_name') bandName: string,
    @Body('band_id') bandId: number,
    @Body('proposed_date') proposedDate: string,
    @Body('alternate_dates') alternateDates: string[],
  ) {
    await this.elevenService.makeCalls(bandName, bandId, proposedDate, alternateDates || []);
    return { status: 'success' };
  }
}
