import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { RedisModule } from 'src/redis/redis.module';
import { NoteModule } from 'src/note/note.module';

@Module({
  imports: [RedisModule, NoteModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
