import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { RedisModule } from 'src/redis/redis.module';
import { CustomerModule } from 'src/customer/customer.module';
import { NoteModule } from 'src/note/note.module';

@Module({
  imports: [RedisModule, CustomerModule, NoteModule],
  controllers: [FriendshipController],
  providers: [FriendshipService],
  exports: [FriendshipService],
})
export class FriendshipModule {}

