import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Injectable, Logger } from '@nestjs/common';
import { ensureString } from '../utils/utils';

@Injectable()
export class ElevenService {
  private readonly logger = new Logger(ElevenService.name);
  constructor() {}

  private apiKey = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY || '';
  private readonly agentPhoneNumberId = ensureString(process.env.ELEVEN_LABS_AGENT_PHONE_NUMBER_ID);

  async makeCalls(bandName: string, bandId: number, proposedDate: string, alternateDates: string[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const client = new ElevenLabsClient({ apiKey: this.apiKey });
    const recipient1 = {
      phoneNumber: '4158461411',
      conversationInitiationClientData: {
        dynamicVariables: {
          band_name: bandName,
          band_id: bandId,
          proposed_date: proposedDate,
          alternate_date1: alternateDates.length > 0 ? alternateDates[0] : '',
          alternate_date2: alternateDates.length > 1 ? alternateDates[1] : '',
          alternate_date3: alternateDates.length > 2 ? alternateDates[2] : '',
        },
      },
    };
    console.log('recipient: ', recipient1);
    // https://elevenlabs.io/docs/api-reference/batch-calling/create
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const result = await client.conversationalAi.batchCalls.create({
      callName: this.callName(),
      agentId: ensureString(process.env.ELEVEN_LABS_BOOKING_AGENT_ID),
      agentPhoneNumberId: this.agentPhoneNumberId,
      recipients: [recipient1],
    });
    console.log('made test calls: ', result);
  }

  callName(): string {
    const now = new Date();
    return 'call_' + now.getTime();
  }
}
