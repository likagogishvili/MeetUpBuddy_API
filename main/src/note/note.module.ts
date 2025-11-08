import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { redisHostPort } from 'src/redis/constants/redis-host-port';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CALENDAR_EVENT_SERVICE',
        transport: Transport.REDIS,
        options: redisHostPort,
      },
    ]),
  ],
  controllers: [NoteController],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
