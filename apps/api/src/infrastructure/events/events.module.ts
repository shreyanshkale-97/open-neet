import { Global, Module } from '@nestjs/common';
import { EventEmitterModule as NestEventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    NestEventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),
  ],
  exports: [NestEventEmitterModule],
})
export class AppEventsModule {}